package com.studentreport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class DashboardDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminSummaryResponse {
        private long totalStudents;
        private long totalTeachers;
        private long totalClasses;
        private long totalSubjects;
        private BigDecimal averagePerformance;
        private BigDecimal averageAttendance;
        private BigDecimal pendingFeeCollections;
        private long upcomingExaminationsCount;
        private List<AnalyticsDTO.GradeCountDTO> gradeDistribution;
        private List<AnalyticsDTO.TopStudentDTO> topPerformingStudents;
        private List<AnalyticsDTO.TopStudentDTO> studentsNeedingAttention;
        private List<AnalyticsDTO.ClassPerformanceDTO> classWisePerformance;
        private List<AnalyticsDTO.SubjectAverageDTO> subjectWiseAverages;
        private List<AnalyticsDTO.TrendDTO> monthlyAttendanceTrends;
        private List<AnalyticsDTO.TrendDTO> studentEnrollmentTrends;
        private List<RecentActivityDTO> recentActivities;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDTO {
        private String id;
        private String type; // EXAM_MARKS, ATTENDANCE, REMARK, ENROLLMENT
        private String title;
        private String description;
        private ZonedDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDashboardResponse {
        private UUID studentId;
        private String studentCode;
        private String fullName;
        private String email;
        private String rollNumber;
        private String className;
        private String sectionName;
        private String academicYearName;
        private String semesterName;
        private UUID academicYearId;
        private UUID semesterId;
        private BigDecimal overallPercentage;
        private String currentGrade;
        private BigDecimal attendancePercentage;
        private int totalSubjects;
        private List<StudentSubjectPerformanceDTO> subjects;
        private List<StudentRecentRemarkDTO> remarks;
        private List<StudentAttendanceSummaryDTO> recentAttendance;
        private boolean hasRecords;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSubjectPerformanceDTO {
        private UUID subjectId;
        private String subjectName;
        private String subjectCode;
        private BigDecimal obtainedMarks;
        private BigDecimal maxMarks;
        private BigDecimal percentage;
        private String grade;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentRecentRemarkDTO {
        private UUID id;
        private String category;
        private String description;
        private String teacherName;
        private String subjectName;
        private ZonedDateTime date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceSummaryDTO {
        private LocalDate date;
        private String status;
        private String remarks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherDashboardResponse {
        private UUID teacherId;
        private String teacherCode;
        private String fullName;
        private String specialization;
        private int totalAssignedClasses;
        private int totalAssignedSubjects;
        private int totalStudents;
        private int totalRemarksGiven;
        private List<TeacherClassSummaryDTO> assignedClasses;
        private List<TeacherRecentAssessmentDTO> recentAssessments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherClassSummaryDTO {
        private UUID classId;
        private String className;
        private UUID sectionId;
        private String sectionName;
        private int studentCount;
        private List<String> subjectsTaught;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherRecentAssessmentDTO {
        private UUID assessmentId;
        private String examName;
        private String subjectName;
        private String className;
        private LocalDate date;
        private BigDecimal maxMarks;
        private int markedCount;
        private int totalCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParentDashboardResponse {
        private UUID parentId;
        private String parentFullName;
        private String email;
        private List<ChildSummaryDTO> children;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildSummaryDTO {
        private UUID studentId;
        private String studentCode;
        private String fullName;
        private String className;
        private String sectionName;
        private String rollNumber;
        private BigDecimal overallPercentage;
        private String currentGrade;
        private BigDecimal attendancePercentage;
        private int remarksCount;
        private UUID academicYearId;
        private UUID semesterId;
    }
}
