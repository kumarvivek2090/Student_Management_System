package com.studentreport.service;

import com.studentreport.dto.StudentDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ParentRepository parentRepository;
    private final ParentStudentRepository parentStudentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(StudentRepository studentRepository,
                          UserRepository userRepository,
                          SchoolClassRepository classRepository,
                          SectionRepository sectionRepository,
                          AcademicYearRepository academicYearRepository,
                          ParentRepository parentRepository,
                          ParentStudentRepository parentStudentRepository,
                          PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.academicYearRepository = academicYearRepository;
        this.parentRepository = parentRepository;
        this.parentStudentRepository = parentStudentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public StudentDTO.StudentPageResponse searchStudentsPaged(UUID classId, UUID sectionId, UUID academicYearId, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rollNumber").ascending());
        Page<Student> studentPage = studentRepository.findByFiltersPaged(classId, sectionId, academicYearId, (query != null && !query.isBlank()) ? query.trim() : null, pageable);
        List<StudentDTO.StudentResponse> list = studentPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return StudentDTO.StudentPageResponse.builder()
                .content(list)
                .pageNumber(studentPage.getNumber())
                .pageSize(studentPage.getSize())
                .totalElements(studentPage.getTotalElements())
                .totalPages(studentPage.getTotalPages())
                .isFirst(studentPage.isFirst())
                .isLast(studentPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public List<StudentDTO.StudentResponse> searchStudents(UUID classId, UUID sectionId, UUID academicYearId, String query) {
        List<Student> list = studentRepository.findByFilters(classId, sectionId, academicYearId);
        if (query != null && !query.isBlank()) {
            String q = query.trim().toLowerCase();
            return list.stream()
                    .filter(s -> (s.getUser() != null && s.getUser().getFullName() != null && s.getUser().getFullName().toLowerCase().contains(q))
                            || (s.getStudentId() != null && s.getStudentId().toLowerCase().contains(q))
                            || (s.getRollNumber() != null && s.getRollNumber().toLowerCase().contains(q))
                            || (s.getUser() != null && s.getUser().getEmail() != null && s.getUser().getEmail().toLowerCase().contains(q)))
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentDTO.StudentResponse getStudentById(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToResponse(student);
    }

    @Transactional(readOnly = true)
    public StudentDTO.StudentResponse getStudentByEmail(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
        return mapToResponse(student);
    }

    @Transactional
    public StudentDTO.StudentResponse createStudent(StudentDTO.StudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (studentRepository.findByStudentId(request.getStudentId()).isPresent()) {
            throw new BadRequestException("Student ID already exists: " + request.getStudentId());
        }

        // 1. Create User account
        String plainPassword = (request.getPassword() != null && !request.getPassword().isBlank()) 
                ? request.getPassword() : "Password@123";

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(plainPassword))
                .role(User.Role.STUDENT)
                .status(User.UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        // 2. Fetch class, section, academic year
        SchoolClass schoolClass = request.getClassId() != null 
                ? classRepository.findById(request.getClassId()).orElse(null) : null;
        Section section = request.getSectionId() != null 
                ? sectionRepository.findById(request.getSectionId()).orElse(null) : null;
        AcademicYear academicYear = request.getAcademicYearId() != null 
                ? academicYearRepository.findById(request.getAcademicYearId()).orElse(null) : null;

        // 3. Create Student
        Student student = Student.builder()
                .user(user)
                .studentId(request.getStudentId().trim())
                .rollNumber(request.getRollNumber().trim())
                .schoolClass(schoolClass)
                .section(section)
                .academicYear(academicYear)
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .admissionDate(request.getAdmissionDate() != null ? request.getAdmissionDate() : java.time.LocalDate.now())
                .status(request.getStatus() != null ? request.getStatus() : Student.StudentStatus.ACTIVE)
                .build();
        student = studentRepository.save(student);

        // 4. Optionally create or link parent
        if (request.getParentEmail() != null && !request.getParentEmail().isBlank()) {
            linkParent(student, request.getParentName(), request.getParentEmail(), request.getParentPhone(), request.getRelationshipType());
        }

        return mapToResponse(student);
    }

    @Transactional
    public StudentDTO.StudentResponse updateStudent(UUID id, StudentDTO.StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        User user = student.getUser();
        if (!user.getEmail().equalsIgnoreCase(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken: " + request.getEmail());
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        userRepository.save(user);

        student.setStudentId(request.getStudentId().trim());
        student.setRollNumber(request.getRollNumber().trim());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setGender(request.getGender());
        student.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            student.setStatus(request.getStatus());
        }

        if (request.getClassId() != null) {
            student.setSchoolClass(classRepository.findById(request.getClassId()).orElse(null));
        }
        if (request.getSectionId() != null) {
            student.setSection(sectionRepository.findById(request.getSectionId()).orElse(null));
        }
        if (request.getAcademicYearId() != null) {
            student.setAcademicYear(academicYearRepository.findById(request.getAcademicYearId()).orElse(null));
        }

        student = studentRepository.save(student);
        return mapToResponse(student);
    }

    @Transactional
    public void deleteStudent(UUID id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        User user = student.getUser();
        studentRepository.delete(student);
        userRepository.delete(user);
    }

    private void linkParent(Student student, String parentName, String parentEmail, String parentPhone, String relationship) {
        String pEmail = parentEmail.trim().toLowerCase();
        User parentUser = userRepository.findByEmail(pEmail).orElseGet(() -> {
            User nu = User.builder()
                    .email(pEmail)
                    .fullName(parentName != null ? parentName : "Parent of " + student.getUser().getFullName())
                    .phone(parentPhone)
                    .passwordHash(passwordEncoder.encode("Password@123"))
                    .role(User.Role.PARENT)
                    .status(User.UserStatus.ACTIVE)
                    .build();
            return userRepository.save(nu);
        });

        Parent parent = parentRepository.findByUserId(parentUser.getId()).orElseGet(() -> {
            Parent np = Parent.builder()
                    .user(parentUser)
                    .address(student.getAddress())
                    .build();
            return parentRepository.save(np);
        });

        ParentStudent ps = ParentStudent.builder()
                .parent(parent)
                .student(student)
                .relationshipType(relationship != null ? relationship : "GUARDIAN")
                .isPrimaryContact(true)
                .build();
        parentStudentRepository.save(ps);
    }

    public StudentDTO.StudentResponse mapToResponse(Student student) {
        String parentName = null;
        String parentEmail = null;
        String parentPhone = null;

        List<ParentStudent> pList = parentStudentRepository.findByStudentId(student.getId());
        if (!pList.isEmpty()) {
            Parent parent = pList.get(0).getParent();
            if (parent != null && parent.getUser() != null) {
                parentName = parent.getUser().getFullName();
                parentEmail = parent.getUser().getEmail();
                parentPhone = parent.getUser().getPhone();
            }
        }

        return StudentDTO.StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .studentId(student.getStudentId())
                .rollNumber(student.getRollNumber())
                .fullName(student.getUser().getFullName())
                .email(student.getUser().getEmail())
                .phone(student.getUser().getPhone())
                .avatarUrl(student.getUser().getAvatarUrl())
                .classId(student.getSchoolClass() != null ? student.getSchoolClass().getId() : null)
                .className(student.getSchoolClass() != null ? student.getSchoolClass().getName() : null)
                .gradeLevel(student.getSchoolClass() != null ? student.getSchoolClass().getGradeLevel() : null)
                .sectionId(student.getSection() != null ? student.getSection().getId() : null)
                .sectionName(student.getSection() != null ? student.getSection().getName() : null)
                .academicYearId(student.getAcademicYear() != null ? student.getAcademicYear().getId() : null)
                .academicYearName(student.getAcademicYear() != null ? student.getAcademicYear().getName() : null)
                .dateOfBirth(student.getDateOfBirth())
                .gender(student.getGender())
                .address(student.getAddress())
                .admissionDate(student.getAdmissionDate())
                .status(student.getStatus())
                .parentName(parentName)
                .parentEmail(parentEmail)
                .parentPhone(parentPhone)
                .build();
    }
}
