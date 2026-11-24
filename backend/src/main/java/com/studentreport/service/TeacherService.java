package com.studentreport.service;

import com.studentreport.dto.TeacherDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final TeacherAssignmentRepository assignmentRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicYearRepository academicYearRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherService(TeacherRepository teacherRepository,
                          UserRepository userRepository,
                          TeacherAssignmentRepository assignmentRepository,
                          SchoolClassRepository classRepository,
                          SectionRepository sectionRepository,
                          SubjectRepository subjectRepository,
                          AcademicYearRepository academicYearRepository,
                          PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.academicYearRepository = academicYearRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO.TeacherResponse> getAllTeachers() {
        return teacherRepository.findAllWithUser().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherDTO.TeacherResponse getTeacherById(UUID id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + id));
        return mapToResponse(teacher);
    }

    @Transactional(readOnly = true)
    public TeacherDTO.TeacherResponse getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with email: " + email));
        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherDTO.TeacherResponse createTeacher(TeacherDTO.TeacherRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }
        if (teacherRepository.findByTeacherId(request.getTeacherId()).isPresent()) {
            throw new BadRequestException("Teacher ID already exists: " + request.getTeacherId());
        }

        String plainPassword = (request.getPassword() != null && !request.getPassword().isBlank()) 
                ? request.getPassword() : "Password@123";

        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(plainPassword))
                .role(User.Role.TEACHER)
                .status(User.UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        Teacher teacher = Teacher.builder()
                .user(user)
                .teacherId(request.getTeacherId().trim())
                .qualification(request.getQualification())
                .specialization(request.getSpecialization())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        teacher = teacherRepository.save(teacher);

        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherDTO.TeacherResponse updateTeacher(UUID id, TeacherDTO.TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + id));

        User user = teacher.getUser();
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

        teacher.setTeacherId(request.getTeacherId().trim());
        teacher.setQualification(request.getQualification());
        teacher.setSpecialization(request.getSpecialization());
        if (request.getStatus() != null) {
            teacher.setStatus(request.getStatus());
        }
        teacher = teacherRepository.save(teacher);

        return mapToResponse(teacher);
    }

    @Transactional
    public void deleteTeacher(UUID id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with ID: " + id));
        User user = teacher.getUser();
        teacherRepository.delete(teacher);
        userRepository.delete(user);
    }

    @Transactional
    public TeacherDTO.TeacherAssignmentDTO assignClassAndSubject(TeacherDTO.AssignClassSubjectRequest request) {
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        AcademicYear academicYear = academicYearRepository.findById(request.getAcademicYearId())
                .orElseThrow(() -> new ResourceNotFoundException("Academic year not found"));

        TeacherAssignment assignment = TeacherAssignment.builder()
                .teacher(teacher)
                .schoolClass(schoolClass)
                .section(section)
                .subject(subject)
                .academicYear(academicYear)
                .build();
        assignment = assignmentRepository.save(assignment);

        return mapAssignmentToDTO(assignment);
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO.TeacherAssignmentDTO> getTeacherAssignments(String email) {
        return assignmentRepository.findByTeacherEmail(email).stream()
                .map(this::mapAssignmentToDTO)
                .collect(Collectors.toList());
    }

    private TeacherDTO.TeacherAssignmentDTO mapAssignmentToDTO(TeacherAssignment a) {
        return TeacherDTO.TeacherAssignmentDTO.builder()
                .id(a.getId())
                .classId(a.getSchoolClass().getId())
                .className(a.getSchoolClass().getName())
                .sectionId(a.getSection().getId())
                .sectionName(a.getSection().getName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .subjectCode(a.getSubject().getCode())
                .academicYearId(a.getAcademicYear().getId())
                .academicYearName(a.getAcademicYear().getName())
                .build();
    }

    private TeacherDTO.TeacherResponse mapToResponse(Teacher teacher) {
        List<TeacherAssignment> assignments = assignmentRepository.findByTeacherId(teacher.getId());
        List<TeacherDTO.TeacherAssignmentDTO> assignmentDTOs = assignments.stream()
                .map(this::mapAssignmentToDTO)
                .collect(Collectors.toList());

        return TeacherDTO.TeacherResponse.builder()
                .id(teacher.getId())
                .userId(teacher.getUser().getId())
                .teacherId(teacher.getTeacherId())
                .fullName(teacher.getUser().getFullName())
                .email(teacher.getUser().getEmail())
                .phone(teacher.getUser().getPhone())
                .qualification(teacher.getQualification())
                .specialization(teacher.getSpecialization())
                .status(teacher.getStatus())
                .assignments(assignmentDTOs)
                .build();
    }
}
