package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.StudentDTO;
import com.studentreport.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getStudents(
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) UUID sectionId,
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "false") boolean paged) {
        if (paged) {
            StudentDTO.StudentPageResponse pageRes = studentService.searchStudentsPaged(classId, sectionId, academicYearId, query, page, size);
            return ResponseEntity.ok(ApiResponse.ok(pageRes));
        } else {
            List<StudentDTO.StudentResponse> list = studentService.searchStudents(classId, sectionId, academicYearId, query);
            return ResponseEntity.ok(ApiResponse.ok(list));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO.StudentResponse>> getStudentById(@PathVariable UUID id) {
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
