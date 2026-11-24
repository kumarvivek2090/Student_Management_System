package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.DashboardDTO;
import com.studentreport.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardDTO.AdminSummaryResponse>> getAdminSummary() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getAdminSummary()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardDTO.StudentDashboardResponse>> getStudentDashboard(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStudentDashboard(email)));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardDTO.TeacherDashboardResponse>> getTeacherDashboard(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getTeacherDashboard(email)));
    }

    @GetMapping("/parent")
    @PreAuthorize("hasAnyRole('PARENT', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardDTO.ParentDashboardResponse>> getParentDashboard(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getParentDashboard(email)));
    }
}
