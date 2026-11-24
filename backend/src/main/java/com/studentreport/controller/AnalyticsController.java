package com.studentreport.controller;

import com.studentreport.dto.AnalyticsDTO;
import com.studentreport.dto.ApiResponse;
import com.studentreport.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsDTO.DashboardOverviewDTO>> getOverview() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDashboardOverview()));
    }
}
