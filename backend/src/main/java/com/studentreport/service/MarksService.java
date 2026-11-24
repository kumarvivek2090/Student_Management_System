package com.studentreport.service;

import com.studentreport.dto.MarksDTO;
import com.studentreport.entity.*;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MarksService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentMarkRepository markRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final GradingScaleRepository gradingScaleRepository;

    public MarksService(AssessmentRepository assessmentRepository,
                        AssessmentMarkRepository markRepository,
                        StudentRepository studentRepository,
                        UserRepository userRepository,
                        GradingScaleRepository gradingScaleRepository) {
        this.assessmentRepository = assessmentRepository;
        this.markRepository = markRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.gradingScaleRepository = gradingScaleRepository;
    }

    @Transactional
    public List<MarksDTO.MarkResponseDTO> saveBulkMarks(MarksDTO.BulkMarksEntryRequest request, String userEmail) {
        Assessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with ID: " + request.getAssessmentId()));

        User user = userRepository.findByEmail(userEmail).orElse(null);
        List<MarksDTO.MarkResponseDTO> results = new ArrayList<>();

        for (MarksDTO.StudentMarkEntry entry : request.getMarks()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + entry.getStudentId()));

            boolean isAbsent = Boolean.TRUE.equals(entry.getIsAbsent());
            BigDecimal obtained = entry.getObtainedMarks();

            if (!isAbsent) {
                if (obtained == null) {
                    throw new BadRequestException("Obtained marks must be provided when student is present");
                }
                if (obtained.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BadRequestException("Marks cannot be negative: " + obtained);
                }
                if (obtained.compareTo(assessment.getMaxMarks()) > 0) {
                    throw new BadRequestException("Obtained marks (" + obtained + ") cannot exceed maximum marks (" + assessment.getMaxMarks() + ")");
                }
            } else {
                obtained = BigDecimal.ZERO;
            }

            AssessmentMark mark = markRepository.findByAssessmentIdAndStudentId(assessment.getId(), student.getId())
                    .orElseGet(() -> AssessmentMark.builder()
                            .assessment(assessment)
                            .student(student)
                            .build());

            mark.setObtainedMarks(obtained);
            mark.setIsAbsent(isAbsent);
            mark.setRemarks(entry.getRemarks());
            mark.setEnteredBy(user);

            mark = markRepository.save(mark);
            results.add(mapToDTO(mark));
        }

        return results;
    }

    @Transactional(readOnly = true)
    public List<MarksDTO.MarkResponseDTO> getMarksByStudent(UUID studentId) {
        return markRepository.findDetailedMarksByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MarksDTO.MarkResponseDTO> getMarksByAssessment(UUID assessmentId) {
        return markRepository.findByAssessmentIdWithStudent(assessmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public String calculateGrade(BigDecimal percentage) {
        if (percentage == null) return "N/A";
        return gradingScaleRepository.findGradeForPercentage(percentage)
                .map(GradingScale::getGrade)
                .orElse("F");
    }

    public MarksDTO.MarkResponseDTO mapToDTO(AssessmentMark mark) {
        BigDecimal maxMarks = mark.getAssessment().getMaxMarks();
        BigDecimal obtained = mark.getObtainedMarks() != null ? mark.getObtainedMarks() : BigDecimal.ZERO;
        BigDecimal percentage = BigDecimal.ZERO;
        String grade = "F";

        if (maxMarks != null && maxMarks.compareTo(BigDecimal.ZERO) > 0) {
            percentage = obtained.divide(maxMarks, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            if (Boolean.TRUE.equals(mark.getIsAbsent())) {
                grade = "AB";
            } else {
                grade = calculateGrade(percentage);
            }
        }

        return MarksDTO.MarkResponseDTO.builder()
                .id(mark.getId())
                .assessmentId(mark.getAssessment().getId())
                .assessmentName(mark.getAssessment().getName())
                .examinationId(mark.getAssessment().getExamination().getId())
                .examinationName(mark.getAssessment().getExamination().getName())
                .examType(mark.getAssessment().getExamination().getExamType().name())
                .subjectId(mark.getAssessment().getSubject().getId())
                .subjectName(mark.getAssessment().getSubject().getName())
                .subjectCode(mark.getAssessment().getSubject().getCode())
                .studentId(mark.getStudent().getId())
                .studentFullName(mark.getStudent().getUser().getFullName())
                .studentRollNumber(mark.getStudent().getRollNumber())
                .obtainedMarks(obtained)
                .maxMarks(maxMarks)
                .percentage(percentage)
                .grade(grade)
                .isAbsent(mark.getIsAbsent())
                .remarks(mark.getRemarks())
                .build();
    }
}
