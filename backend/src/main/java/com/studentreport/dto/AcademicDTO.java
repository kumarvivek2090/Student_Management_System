package com.studentreport.dto;

import com.studentreport.entity.Examination;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class AcademicDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassResponse {
        private UUID id;
        private String name;
        private Integer gradeLevel;
        private String description;
        private List<SectionResponse> sections;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassRequest {
        @NotBlank(message = "Class name is required")
        private String name;
        @NotNull(message = "Grade level is required")
        private Integer gradeLevel;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionResponse {
        private UUID id;
        private UUID classId;
        private String className;
        private String name;
        private Integer capacity;
        private String roomNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionRequest {
        @NotNull(message = "Class ID is required")
        private UUID classId;
        @NotBlank(message = "Section name is required")
        private String name;
        private Integer capacity;
        private String roomNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectResponse {
        private UUID id;
        private String name;
        private String code;
        private String description;
        private Integer credits;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectRequest {
        @NotBlank(message = "Subject name is required")
        private String name;
        @NotBlank(message = "Subject code is required")
        private String code;
        private String description;
        private Integer credits;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcademicYearResponse {
        private UUID id;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isCurrent;
        private List<SemesterResponse> semesters;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcademicYearRequest {
        @NotBlank(message = "Year name is required")
        private String name;
        @NotNull(message = "Start date is required")
        private LocalDate startDate;
        @NotNull(message = "End date is required")
        private LocalDate endDate;
        private Boolean isCurrent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemesterResponse {
        private UUID id;
        private UUID academicYearId;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isCurrent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SemesterRequest {
        @NotNull(message = "Academic year is required")
        private UUID academicYearId;
        @NotBlank(message = "Semester name is required")
        private String name;
        @NotNull(message = "Start date is required")
        private LocalDate startDate;
        @NotNull(message = "End date is required")
        private LocalDate endDate;
        private Boolean isCurrent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExaminationResponse {
        private UUID id;
        private String name;
        private Examination.ExamType examType;
        private UUID academicYearId;
        private String academicYearName;
        private UUID semesterId;
        private String semesterName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Examination.ExamStatus status;
        private String description;
        private List<AssessmentResponse> assessments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExaminationRequest {
        @NotBlank(message = "Examination name is required")
        private String name;
        @NotNull(message = "Exam type is required")
        private Examination.ExamType examType;
        @NotNull(message = "Academic year is required")
        private UUID academicYearId;
        @NotNull(message = "Semester is required")
        private UUID semesterId;
        private LocalDate startDate;
        private LocalDate endDate;
        private Examination.ExamStatus status;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentResponse {
        private UUID id;
        private UUID examinationId;
        private String examinationName;
        private UUID classId;
        private String className;
        private UUID sectionId;
        private String sectionName;
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private String name;
        private BigDecimal maxMarks;
        private BigDecimal passingMarks;
        private LocalDate assessmentDate;
        private BigDecimal weightage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentRequest {
        @NotNull(message = "Examination is required")
        private UUID examinationId;
        @NotNull(message = "Class is required")
        private UUID classId;
        @NotNull(message = "Section is required")
        private UUID sectionId;
        @NotNull(message = "Subject is required")
        private UUID subjectId;
        @NotBlank(message = "Assessment name is required")
        private String name;
        @NotNull(message = "Max marks is required")
        private BigDecimal maxMarks;
        @NotNull(message = "Passing marks is required")
        private BigDecimal passingMarks;
        private LocalDate assessmentDate;
        private BigDecimal weightage;
    }
}
