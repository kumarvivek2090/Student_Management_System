package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.StudentDTO;
import com.studentreport.entity.ParentStudent;
import com.studentreport.entity.Student;
import com.studentreport.entity.TeacherAssignment;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.ParentStudentRepository;
import com.studentreport.repository.StudentRepository;
import com.studentreport.repository.TeacherAssignmentRepository;
import com.studentreport.service.SecurityAuthorizationService;
import com.studentreport.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;
    private final SecurityAuthorizationService securityAuthorizationService;
    private final StudentRepository studentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public StudentController(StudentService studentService,
                             SecurityAuthorizationService securityAuthorizationService,
                             StudentRepository studentRepository,
                             ParentStudentRepository parentStudentRepository,
                             TeacherAssignmentRepository teacherAssignmentRepository) {
        this.studentService = studentService;
        this.securityAuthorizationService = securityAuthorizationService;
        this.studentRepository = studentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getStudents(
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean paged,
            Authentication auth) {

        if (auth == null) {
            throw new AccessDeniedException("Authentication required to access student directory");
        }

        String role = securityAuthorizationService.getRole(auth);
        String email = auth.getName();

        // 1. STUDENT: strictly restricted to their own record only
        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByUserEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email));
            StudentDTO.StudentResponse self = studentService.getStudentById(student.getId());
            if (paged) {
                return ResponseEntity.ok(ApiResponse.ok(StudentDTO.StudentPageResponse.builder()
                        .content(List.of(self))
                        .pageNumber(0)
                        .pageSize(size)
                        .totalElements(1)
                        .totalPages(1)
                        .isFirst(true)
                        .isLast(true)
                        .build()));
            } else {
                return ResponseEntity.ok(ApiResponse.ok(List.of(self)));
            }
        }

        // 2. PARENT: strictly restricted to linked children only
        if ("PARENT".equals(role)) {
            List<ParentStudent> links = parentStudentRepository.findByParentUserEmail(email);
            List<StudentDTO.StudentResponse> children = links.stream()
                    .map(ps -> studentService.getStudentById(ps.getStudent().getId()))
                    .collect(Collectors.toList());
            if (paged) {
                return ResponseEntity.ok(ApiResponse.ok(StudentDTO.StudentPageResponse.builder()
                        .content(children)
                        .pageNumber(0)
                        .pageSize(size)
                        .totalElements(children.size())
                        .totalPages(1)
                        .isFirst(true)
                        .isLast(true)
                        .build()));
            } else {
                return ResponseEntity.ok(ApiResponse.ok(children));
            }
        }

        // 3. TEACHER: restricted to assigned classes & sections
        if ("TEACHER".equals(role)) {
            List<TeacherAssignment> assignments = teacherAssignmentRepository.findByTeacherEmail(email);
            if (assignments.isEmpty()) {
                if (paged) {
                    return ResponseEntity.ok(ApiResponse.ok(StudentDTO.StudentPageResponse.builder()
                            .content(Collections.emptyList())
                            .pageNumber(0)
                            .pageSize(size)
                            .totalElements(0)
                            .totalPages(0)
                            .isFirst(true)
                            .isLast(true)
                            .build()));
                }
                return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList()));
            }

            // If teacher specified both class and section, validate instruction permission
            if (classId != null && sectionId != null) {
                securityAuthorizationService.validateTeacherClassInstruction(auth, classId, sectionId);
                if (paged) {
                    return ResponseEntity.ok(ApiResponse.ok(studentService.searchStudentsPaged(classId, sectionId, academicYearId, query, page, size)));
                } else {
                    return ResponseEntity.ok(ApiResponse.ok(studentService.searchStudents(classId, sectionId, academicYearId, query)));
                }
            }

            // Filter students by assigned classes/sections
            Set<UUID> allowedClassIds = assignments.stream()
                    .filter(a -> a.getSchoolClass() != null)
                    .map(a -> a.getSchoolClass().getId())
                    .collect(Collectors.toSet());
            Set<UUID> allowedSectionIds = assignments.stream()
                    .filter(a -> a.getSection() != null)
                    .map(a -> a.getSection().getId())
                    .collect(Collectors.toSet());

            List<StudentDTO.StudentResponse> assignedStudents = studentService.searchStudents(null, null, academicYearId, query).stream()
                    .filter(s -> s.getClassId() != null && allowedClassIds.contains(s.getClassId())
                              && s.getSectionId() != null && allowedSectionIds.contains(s.getSectionId()))
                    .collect(Collectors.toList());

            if (paged) {
                int fromIndex = Math.min(page * size, assignedStudents.size());
                int toIndex = Math.min(fromIndex + size, assignedStudents.size());
                List<StudentDTO.StudentResponse> pagedList = assignedStudents.subList(fromIndex, toIndex);
                int totalPages = assignedStudents.isEmpty() ? 0 : (int) Math.ceil((double) assignedStudents.size() / size);
                return ResponseEntity.ok(ApiResponse.ok(StudentDTO.StudentPageResponse.builder()
                        .content(pagedList)
                        .pageNumber(page)
                        .pageSize(size)
                        .totalElements(assignedStudents.size())
                        .totalPages(totalPages)
                        .isFirst(page == 0)
                        .isLast(totalPages == 0 || page >= totalPages - 1)
                        .build()));
            } else {
                return ResponseEntity.ok(ApiResponse.ok(assignedStudents));
            }
        }

        // 4. ADMIN: full institutional search
        if (paged) {
            StudentDTO.StudentPageResponse pageRes = studentService.searchStudentsPaged(classId, sectionId, academicYearId, query, page, size);
            return ResponseEntity.ok(ApiResponse.ok(pageRes));
        } else {
            List<StudentDTO.StudentResponse> list = studentService.searchStudents(classId, sectionId, academicYearId, query);
            return ResponseEntity.ok(ApiResponse.ok(list));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDTO.StudentResponse>> getMyStudentProfile(Authentication auth) {
        String email = auth.getName();
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email));
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentById(student.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO.StudentResponse>> getStudentById(
            @PathVariable UUID id, Authentication auth) {
        securityAuthorizationService.validateStudentAcademicAccess(auth, id);
        return ResponseEntity.ok(ApiResponse.ok(studentService.getStudentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO.StudentResponse>> createStudent(@Valid @RequestBody StudentDTO.StudentRequest request) {
        StudentDTO.StudentResponse created = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Student created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDTO.StudentResponse>> updateStudent(
            @PathVariable UUID id, @Valid @RequestBody StudentDTO.StudentRequest request) {
        StudentDTO.StudentResponse updated = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Student updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.ok("Student deleted successfully", null));
    }
}
