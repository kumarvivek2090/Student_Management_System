package com.studentreport.dto;

import com.studentreport.entity.ReportCard;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ReportDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GenerateReportRequest {
        @NotNull(message = "Student ID is required")
        private UUID studentId;
        @NotNull(message = "Academic year ID is required")
        private UUID academicYearId;
        @NotNull(message = "Semester ID is required")
        private UUID semesterId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportCardResponseDTO {
        private UUID id;
        private UUID studentId;
        private String studentFullName;
        private String studentCode;
        private String rollNumber;
        private String className;
        private String sectionName;
        private String academicYearName;
        private String semesterName;
        private LocalDate issuedDate;
        private ReportCard.ReportStatus status;

        private BigDecimal totalMaxMarks;
        private BigDecimal totalObtainedMarks;
        private BigDecimal percentage;
        private String overallGrade;
        private BigDecimal attendancePercentage;

        private String institutionName;
        private String institutionAddress;

        private List<SubjectResultDTO> subjects;
        private List<RemarkDTO.RemarkResponseDTO> teacherRemarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectResultDTO {
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private Integer credits;
        private BigDecimal maxMarks;
        private BigDecimal obtainedMarks;
        private BigDecimal percentage;
        private String grade;
        private String remarks;
    }
}
