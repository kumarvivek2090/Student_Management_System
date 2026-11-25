package com.studentreport.dto;

import com.studentreport.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class AuthDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Valid email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private UserSummaryDTO user;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDTO {
        private UUID id;
        private String email;
        private String fullName;
        private String phone;
        private User.Role role;
        private String avatarUrl;
        private UUID roleEntityId; // studentId or teacherId or parentId if applicable
        private String status;
        private String identifier;
        private String designation;
        private String department;
        private String classSection;
        private String rollNumber;
        private String childrenSummary;
        private String lastLoginAt;
        private String academicYear;
        private String institutionName;
    }
}
