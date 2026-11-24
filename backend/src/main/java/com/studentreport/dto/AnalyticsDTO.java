package com.studentreport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class AnalyticsDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardOverviewDTO {
        private long totalStudents;
        private long totalTeachers;
        private long totalClasses;
        private long totalSubjects;
        private BigDecimal averageAcademicPerformance;
        private BigDecimal averageAttendancePercentage;
        private List<GradeCountDTO> gradeDistribution;
        private List<TopStudentDTO> topPerformingStudents;
        private List<TopStudentDTO> studentsNeedingImprovement;
        private List<ClassPerformanceDTO> classWisePerformance;
        private List<SubjectAverageDTO> subjectWiseAverages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeCountDTO {
        private String grade;
        private long count;
        private BigDecimal percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopStudentDTO {
        private String studentId;
        private String fullName;
        private String className;
        private String sectionName;
        private BigDecimal percentage;
        private String grade;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassPerformanceDTO {
        private String className;
        private BigDecimal averagePercentage;
        private BigDecimal attendancePercentage;
        private int studentCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectAverageDTO {
        private String subjectName;
        private String subjectCode;
        private BigDecimal averageMarks;
        private BigDecimal passRate;
    }
}
