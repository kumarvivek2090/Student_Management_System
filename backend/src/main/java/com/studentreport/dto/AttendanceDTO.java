package com.studentreport.dto;

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
}
