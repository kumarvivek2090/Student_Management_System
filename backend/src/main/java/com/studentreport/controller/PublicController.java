package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.DashboardDTO;
import com.studentreport.repository.ReportCardRepository;
import com.studentreport.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final DashboardService dashboardService;
    private final ReportCardRepository reportCardRepository;

    public PublicController(DashboardService dashboardService, ReportCardRepository reportCardRepository) {
        this.dashboardService = dashboardService;
        this.reportCardRepository = reportCardRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicSummary() {
        DashboardDTO.AdminSummaryResponse adminSummary = dashboardService.getAdminSummary();
        long publishedReports = reportCardRepository.count();

        Map<String, Object> data = new HashMap<>();
        data.put("totalStudents", adminSummary.getTotalStudents());
        data.put("totalTeachers", adminSummary.getTotalTeachers());
        data.put("totalClasses", adminSummary.getTotalClasses());
        data.put("totalSubjects", adminSummary.getTotalSubjects());
        data.put("averagePerformance", adminSummary.getAveragePerformance());
        data.put("averageAttendance", adminSummary.getAverageAttendance());
        data.put("publishedReports", publishedReports);
        data.put("topPerformingStudents", adminSummary.getTopPerformingStudents());
        data.put("gradeDistribution", adminSummary.getGradeDistribution());
        data.put("classWisePerformance", adminSummary.getClassWisePerformance());

        return ResponseEntity.ok(ApiResponse.ok("Live institutional metrics fetched successfully from Neon PostgreSQL", data));
    }
}
