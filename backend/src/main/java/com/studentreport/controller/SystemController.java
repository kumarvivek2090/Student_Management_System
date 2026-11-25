package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.SystemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@PreAuthorize("hasRole('ADMIN')")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/database-health")
    public ResponseEntity<ApiResponse<EnterpriseDTO.DatabaseHealthDTO>> getDatabaseHealth() {
        return ResponseEntity.ok(ApiResponse.ok(systemService.getDatabaseHealth()));
    }

    @PostMapping("/backup")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerBackup(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Backup snapshot completed", systemService.triggerBackup(auth.getName())));
    }

    @GetMapping("/backups")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBackups() {
        return ResponseEntity.ok(ApiResponse.ok(systemService.getBackups()));
    }

    @PostMapping("/restore/{backupId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> restoreBackup(
            @PathVariable String backupId, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Restore procedure completed", systemService.restoreBackup(backupId, auth.getName())));
    }

    @GetMapping("/security")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSecuritySettings() {
        return ResponseEntity.ok(ApiResponse.ok(systemService.getSecuritySettings()));
    }
}
