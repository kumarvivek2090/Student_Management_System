package com.studentreport.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

public class TeacherDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        private String phone;
        private String password; // optional

        @NotBlank(message = "Teacher ID is required")
        private String teacherId;

        private String qualification;
        private String specialization;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherResponse {
        private UUID id;
        private UUID userId;
        private String teacherId;
        private String fullName;
        private String email;
        private String phone;
        private String qualification;
        private String specialization;
        private String status;
        private List<TeacherAssignmentDTO> assignments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherAssignmentDTO {
        private UUID id;
        private UUID classId;
        private String className;
        private UUID sectionId;
        private String sectionName;
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private UUID academicYearId;
        private String academicYearName;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignClassSubjectRequest {
        private UUID teacherId;
        private UUID classId;
        private UUID sectionId;
        private UUID subjectId;
        private UUID academicYearId;
        private UUID semesterId;
    }
}
