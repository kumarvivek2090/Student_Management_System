package com.studentreport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.studentreport.entity.AttendanceRecord;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class AttendanceDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkAttendanceRequest {
        @NotNull(message = "Class ID is required")
        private UUID classId;
        @NotNull(message = "Section ID is required")
        private UUID sectionId;
        private UUID subjectId; // null if daily attendance
        @NotNull(message = "Attendance date is required")
        private LocalDate attendanceDate;
        @NotNull(message = "Attendance list cannot be null")
        private List<AttendanceEntry> attendanceList;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceEntry {
        @NotNull(message = "Student ID is required")
        private UUID studentId;
        @NotNull(message = "Attendance status is required")
        private AttendanceRecord.AttendanceStatus status;
        private String remarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceResponseDTO {
        private UUID id;
        private UUID studentId;
        private String studentFullName;
        private String studentRollNumber;
        private LocalDate attendanceDate;
        private AttendanceRecord.AttendanceStatus status;
        private String remarks;
        private String recordedByName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummaryDTO {
        private UUID studentId;
        private String studentFullName;
        private long totalSessions;
        private long presentCount;
        private long absentCount;
        private long lateCount;
        private long excusedCount;
        private BigDecimal attendancePercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceLockStatusDTO {
        @JsonProperty("isSubmitted")
        private boolean isSubmitted;
        @JsonProperty("isLocked")
        private boolean isLocked;
        private String submittedByName;
        private String submittedByEmail;
        private java.time.ZonedDateTime submittedAt;
        private int totalRecords;
        private int presentCount;
        private int absentCount;
        private int lateCount;
        private int excusedCount;
        private boolean canEdit;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceCorrectionRequest {
        @NotNull(message = "Class ID is required")
        private UUID classId;
        @NotNull(message = "Section ID is required")
        private UUID sectionId;
        private UUID subjectId;
        @NotNull(message = "Attendance date is required")
        private LocalDate attendanceDate;
        @jakarta.validation.constraints.NotBlank(message = "Mandatory justification reason required for administrative correction")
        private String reason;
        @NotNull(message = "Corrections list cannot be null")
        private List<AttendanceEntry> corrections;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassAttendanceOverviewDTO {
        private UUID classId;
        private String className;
        private UUID sectionId;
        private String sectionName;
        private LocalDate date;
        @JsonProperty("isSubmitted")
        private boolean isSubmitted;
        private String submittedByName;
        private java.time.ZonedDateTime submittedAt;
        private int studentCount;
        private int presentCount;
        private int absentCount;
    }
}
