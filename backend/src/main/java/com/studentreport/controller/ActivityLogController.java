package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.entity.ActivityLog;
import com.studentreport.service.ActivityLogService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    private final ActivityLogService logService;

    public ActivityLogController(ActivityLogService logService) {
        this.logService = logService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getRecentLogs() {
        return ResponseEntity.ok(ApiResponse.ok(logService.getRecent()));
    }

    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<ActivityLog>>> getPaginatedLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(logService.getPaginated(page, size)));
    }
}
