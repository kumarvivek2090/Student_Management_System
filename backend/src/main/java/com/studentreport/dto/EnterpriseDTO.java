package com.studentreport.dto;

import com.studentreport.entity.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class EnterpriseDTO {

    // --- TIMETABLE DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimetableSlotDTO {
        private UUID id;
        private UUID classId;
        private String className;
        private UUID sectionId;
        private String sectionName;
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private UUID teacherId;
        private String teacherName;
        private Timetable.DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private String roomNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimetableCreateRequest {
        private UUID classId;
        private UUID sectionId;
        private UUID subjectId;
        private UUID teacherId;
        private Timetable.DayOfWeek dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
        private String roomNumber;
    }

    // --- ACADEMIC EVENT DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AcademicEventDTO {
        private UUID id;
        private String title;
        private String description;
        private AcademicEvent.EventType eventType;
        private LocalDate startDate;
        private LocalDate endDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String location;
        private Boolean isPublished;
    }

    // --- FEE DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeeOverviewDTO {
        private BigDecimal totalBilled;
        private BigDecimal totalCollected;
        private BigDecimal pendingDues;
        private long totalInvoices;
        private long paidInvoices;
        private long pendingInvoices;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentFeeDTO {
        private UUID id;
        private UUID studentId;
        private String studentFullName;
        private String studentCode;
        private String rollNumber;
        private String className;
        private String sectionName;
        private String invoiceNumber;
        private String feeTitle;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balanceAmount;
        private LocalDate dueDate;
        private StudentFee.FeeStatus status;
        private String remarks;
        private List<FeePaymentDTO> payments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeePaymentDTO {
        private UUID id;
        private String receiptNumber;
        private BigDecimal amountPaid;
        private LocalDate paymentDate;
        private FeePayment.PaymentMethod paymentMethod;
        private String transactionReference;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordPaymentRequest {
        private UUID studentFeeId;
        private BigDecimal amount;
        private FeePayment.PaymentMethod paymentMethod;
        private String transactionReference;
    }

    // --- ASSIGNMENT DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentDTO {
        private UUID id;
        private UUID classId;
        private String className;
        private UUID sectionId;
        private String sectionName;
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private UUID teacherId;
        private String teacherName;
        private String title;
        private String description;
        private ZonedDateTime dueDate;
        private BigDecimal maxMarks;
        private Assignment.AssignmentStatus status;
        private int totalSubmissions;
        private Boolean isSubmittedByMe;
        private BigDecimal myScore;
        private String myFeedback;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentCreateRequest {
        private UUID classId;
        private UUID sectionId;
        private UUID subjectId;
        private String title;
        private String description;
        private ZonedDateTime dueDate;
        private BigDecimal maxMarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAssignmentRequest {
        private UUID assignmentId;
        private String submissionText;
        private String attachmentUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionDTO {
        private UUID id;
        private UUID assignmentId;
        private String assignmentTitle;
        private UUID studentId;
        private String studentName;
        private String studentRoll;
        private String submissionText;
        private String attachmentUrl;
        private ZonedDateTime submittedAt;
        private AssignmentSubmission.SubmissionStatus status;
        private BigDecimal obtainedMarks;
        private String feedback;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeSubmissionRequest {
        private BigDecimal obtainedMarks;
        private String feedback;
    }

    // --- LEAVE DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveRequestDTO {
        private UUID id;
        private UUID userId;
        private String userFullName;
        private String userEmail;
        private String role;
        private LeaveRequest.LeaveType leaveType;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
        private LeaveRequest.LeaveStatus status;
        private String documentUrl;
        private String facultyRecommendation;
        private UUID recommendedById;
        private String recommendedByName;
        private UUID reviewerId;
        private String reviewerName;
        private String reviewerRemarks;
        private ZonedDateTime createdAt;
        private ZonedDateTime decisionAt;

        // Context details
        private String studentRollNumber;
        private String studentCode;
        private String className;
        private String sectionName;
        private String department;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyLeaveRequest {
        private LeaveRequest.LeaveType leaveType;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
        private String documentUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewLeaveRequest {
        private LeaveRequest.LeaveStatus status;
        private String remarks;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendLeaveRequest {
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveStatsDTO {
        private long total;
        private long pending;
        private long approved;
        private long rejected;
        private long cancelled;
        private long teacherTotal;
        private long teacherPending;
        private long teacherApproved;
        private long teacherRejected;
        private long studentTotal;
        private long studentPending;
        private long studentApproved;
        private long studentRejected;
    }

    // --- MATERIAL DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningMaterialDTO {
        private UUID id;
        private UUID classId;
        private String className;
        private UUID subjectId;
        private String subjectName;
        private String teacherName;
        private String title;
        private String description;
        private String fileUrl;
        private LearningMaterial.MaterialType fileType;
        private ZonedDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateMaterialRequest {
        private UUID classId;
        private UUID subjectId;
        private String title;
        private String description;
        private String fileUrl;
        private LearningMaterial.MaterialType fileType;
    }

    // --- USER MANAGEMENT DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDTO {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private String role;
        private String status;
        private ZonedDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        private String fullName;
        private String email;
        private String password;
        private String phone;
        private String role;
    }

    // --- SYSTEM DTOs ---
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatabaseHealthDTO {
        private String databaseEngine;
        private String status;
        private long totalUsers;
        private long totalStudents;
        private long totalTeachers;
        private long totalMarksRecords;
        private long totalAttendanceRecords;
        private String storageEngine;
        private String region;
        private double connectionPoolLoad;
        private String uptime;
    }
}
