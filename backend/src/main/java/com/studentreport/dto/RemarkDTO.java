package com.studentreport.dto;

import com.studentreport.entity.TeacherRemark;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

public class RemarkDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RemarkRequest {
        @NotNull(message = "Student ID is required")
        private UUID studentId;
        private UUID subjectId;
        private UUID semesterId;
        @NotNull(message = "Category is required")
        private TeacherRemark.RemarkCategory category;
        @NotBlank(message = "Description is required")
        private String description;
        private Boolean isPublished;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RemarkResponseDTO {
        private UUID id;
        private UUID studentId;
        private String studentFullName;
        private String studentRollNumber;
        private UUID teacherId;
        private String teacherFullName;
        private UUID subjectId;
        private String subjectName;
        private UUID semesterId;
        private String semesterName;
        private TeacherRemark.RemarkCategory category;
        private String description;
        private Boolean isPublished;
        private ZonedDateTime createdAt;
    }
}
