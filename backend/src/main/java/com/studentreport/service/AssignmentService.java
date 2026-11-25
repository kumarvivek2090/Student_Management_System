package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SchoolClassRepository classRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             AssignmentSubmissionRepository submissionRepository,
                             SchoolClassRepository classRepository,
                             SectionRepository sectionRepository,
                             SubjectRepository subjectRepository,
                             TeacherRepository teacherRepository,
                             StudentRepository studentRepository,
                             UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.classRepository = classRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.AssignmentDTO> getAll() {
        return assignmentRepository.findAllWithDetails().stream()
                .map(a -> mapToDTO(a, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.AssignmentDTO> getByTeacherEmail(String teacherEmail) {
        return assignmentRepository.findByTeacherEmailWithDetails(teacherEmail).stream()
                .map(a -> mapToDTO(a, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.AssignmentDTO> getForStudent(String studentEmail) {
        Student student = studentRepository.findByUserEmailWithDetails(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (student.getSchoolClass() == null || student.getSection() == null) {
            return List.of();
        }
        List<Assignment> assignments = assignmentRepository.findByClassIdAndSectionIdWithDetails(
                student.getSchoolClass().getId(), student.getSection().getId());

        return assignments.stream()
                .map(a -> mapToDTO(a, student.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.AssignmentDTO createAssignment(EnterpriseDTO.AssignmentCreateRequest request, String teacherEmail) {
        SchoolClass sc = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Section sec = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found"));
        Subject sub = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher t = teacherRepository.findByUserEmail(teacherEmail)
                .orElseGet(() -> teacherRepository.findAll().stream().findFirst().orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found")));

        Assignment assignment = Assignment.builder()
                .schoolClass(sc)
                .section(sec)
                .subject(sub)
                .teacher(t)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .maxMarks(request.getMaxMarks() != null ? request.getMaxMarks() : BigDecimal.valueOf(100.00))
                .status(Assignment.AssignmentStatus.ACTIVE)
                .build();

        return mapToDTO(assignmentRepository.save(assignment), null);
    }

    @Transactional
    public EnterpriseDTO.SubmissionDTO submitAssignment(EnterpriseDTO.SubmitAssignmentRequest request, String studentEmail) {
        Student student = studentRepository.findByUserEmailWithDetails(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        AssignmentSubmission sub = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                .orElseGet(() -> AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        sub.setSubmissionText(request.getSubmissionText());
        sub.setAttachmentUrl(request.getAttachmentUrl());
        sub.setStatus(AssignmentSubmission.SubmissionStatus.SUBMITTED);

        sub = submissionRepository.save(sub);
        return mapSubmissionToDTO(sub);
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.SubmissionDTO> getSubmissions(UUID assignmentId) {
        return submissionRepository.findByAssignmentIdWithDetails(assignmentId).stream()
                .map(this::mapSubmissionToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.SubmissionDTO gradeSubmission(UUID submissionId, EnterpriseDTO.GradeSubmissionRequest request, String graderEmail) {
        AssignmentSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        User grader = userRepository.findByEmail(graderEmail).orElse(null);
        sub.setObtainedMarks(request.getObtainedMarks());
        sub.setFeedback(request.getFeedback());
        sub.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
        sub.setGradedBy(grader);

        return mapSubmissionToDTO(submissionRepository.save(sub));
    }

    private EnterpriseDTO.AssignmentDTO mapToDTO(Assignment a, UUID studentId) {
        Boolean submitted = false;
        BigDecimal myScore = null;
        String myFeedback = null;

        if (studentId != null) {
            Optional<AssignmentSubmission> subOpt = submissionRepository.findByAssignmentIdAndStudentId(a.getId(), studentId);
            if (subOpt.isPresent()) {
                submitted = true;
                myScore = subOpt.get().getObtainedMarks();
                myFeedback = subOpt.get().getFeedback();
            }
        }

        return EnterpriseDTO.AssignmentDTO.builder()
                .id(a.getId())
                .classId(a.getSchoolClass().getId())
                .className(a.getSchoolClass().getName())
                .sectionId(a.getSection().getId())
                .sectionName(a.getSection().getName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getName())
                .subjectCode(a.getSubject().getCode())
                .teacherId(a.getTeacher().getId())
                .teacherName(a.getTeacher().getUser() != null ? a.getTeacher().getUser().getFullName() : "Faculty Member")
                .title(a.getTitle())
                .description(a.getDescription())
                .dueDate(a.getDueDate())
                .maxMarks(a.getMaxMarks())
                .status(a.getStatus())
                .isSubmittedByMe(submitted)
                .myScore(myScore)
                .myFeedback(myFeedback)
                .build();
    }

    private EnterpriseDTO.SubmissionDTO mapSubmissionToDTO(AssignmentSubmission s) {
        return EnterpriseDTO.SubmissionDTO.builder()
                .id(s.getId())
                .assignmentId(s.getAssignment().getId())
                .assignmentTitle(s.getAssignment().getTitle())
                .studentId(s.getStudent().getId())
                .studentName(s.getStudent().getUser() != null ? s.getStudent().getUser().getFullName() : "Student")
                .studentRoll(s.getStudent().getRollNumber())
                .submissionText(s.getSubmissionText())
                .attachmentUrl(s.getAttachmentUrl())
                .submittedAt(s.getSubmittedAt())
                .status(s.getStatus())
                .obtainedMarks(s.getObtainedMarks())
                .feedback(s.getFeedback())
                .build();
    }
}
