package com.studentreport.dto;

import com.studentreport.entity.Student;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

public class StudentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        private String phone;
        private String password; // optional, default Password@123

        @NotBlank(message = "Student ID is required")
        private String studentId;

        @NotBlank(message = "Roll number is required")
        private String rollNumber;

        private UUID classId;
        private UUID sectionId;
        private UUID academicYearId;
        private LocalDate dateOfBirth;
        private Student.Gender gender;
        private String address;
        private LocalDate admissionDate;
        private Student.StudentStatus status;

        // Parent info optional on creation
        private String parentName;
        private String parentEmail;
        private String parentPhone;
        private String relationshipType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentResponse {
        private UUID id;
        private UUID userId;
        private String studentId;
        private String rollNumber;
        private String fullName;
        private String email;
        private String phone;
        private String avatarUrl;
        private UUID classId;
        private String className;
        private Integer gradeLevel;
        private UUID sectionId;
        private String sectionName;
        private UUID academicYearId;
        private String academicYearName;
        private LocalDate dateOfBirth;
        private Student.Gender gender;
        private String address;
        private LocalDate admissionDate;
        private Student.StudentStatus status;
        private String parentName;
        private String parentEmail;
        private String parentPhone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentPageResponse {
        private java.util.List<StudentResponse> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean isFirst;
        private boolean isLast;
    }
}
