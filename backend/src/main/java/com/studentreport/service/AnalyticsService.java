package com.studentreport.service;

import com.studentreport.dto.AnalyticsDTO;
import com.studentreport.dto.DashboardDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

    private final DashboardService dashboardService;

    public AnalyticsService(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Transactional(readOnly = true)
    public AnalyticsDTO.DashboardOverviewDTO getDashboardOverview() {
        DashboardDTO.AdminSummaryResponse summary = dashboardService.getAdminSummary();

        return AnalyticsDTO.DashboardOverviewDTO.builder()
                .totalStudents(summary.getTotalStudents())
                .totalTeachers(summary.getTotalTeachers())
                .totalClasses(summary.getTotalClasses())
                .totalSubjects(summary.getTotalSubjects())
                .averageAcademicPerformance(summary.getAveragePerformance())
                .averageAttendancePercentage(summary.getAverageAttendance())
                .gradeDistribution(summary.getGradeDistribution())
                .topPerformingStudents(summary.getTopPerformingStudents())
                .studentsNeedingImprovement(summary.getStudentsNeedingAttention())
                .classWisePerformance(summary.getClassWisePerformance())
                .subjectWiseAverages(summary.getSubjectWiseAverages())
                .build();
    }
}
