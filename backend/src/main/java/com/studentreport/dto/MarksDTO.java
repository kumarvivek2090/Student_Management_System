package com.studentreport.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class MarksDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkMarksEntryRequest {
        @NotNull(message = "Assessment ID is required")
        private UUID assessmentId;
        @NotNull(message = "Student marks list cannot be null")
        private List<StudentMarkEntry> marks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentMarkEntry {
        @NotNull(message = "Student ID is required")
        private UUID studentId;
        private BigDecimal obtainedMarks;
        private Boolean isAbsent;
        private String remarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkResponseDTO {
        private UUID id;
        private UUID assessmentId;
        private String assessmentName;
        private UUID examinationId;
        private String examinationName;
        private String examType;
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private UUID studentId;
        private String studentFullName;
        private String studentRollNumber;
        private BigDecimal obtainedMarks;
        private BigDecimal maxMarks;
        private BigDecimal percentage;
        private String grade;
        private Boolean isAbsent;
        private String remarks;
    }
}
