package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.LeaveRequest;
import com.studentreport.service.LeaveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.LeaveRequestDTO>>> getAllLeaves(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) LeaveRequest.LeaveStatus status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAll(role, status, search)));
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.LeaveRequestDTO>>> getMyLeaves(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getMyLeaves(auth.getName())));
    }

    @GetMapping("/student-leaves-for-teacher")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.LeaveRequestDTO>>> getStudentLeavesForTeacher(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getStudentLeavesForTeacher(auth.getName())));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveStatsDTO>> getLeaveStats() {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getStats()));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveRequestDTO>> applyLeave(
            @RequestBody EnterpriseDTO.ApplyLeaveRequest request, Authentication auth) {
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("STUDENT");
        return ResponseEntity.ok(ApiResponse.ok("Leave request submitted successfully", leaveService.apply(request, auth.getName(), role)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveRequestDTO>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        String statusStr = body.get("status");
        if (statusStr == null || statusStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Decision status is required.");
        }
        LeaveRequest.LeaveStatus status = LeaveRequest.LeaveStatus.valueOf(statusStr.toUpperCase());
        String remarks = body.get("remarks");
        return ResponseEntity.ok(ApiResponse.ok("Leave status updated successfully", leaveService.updateStatus(id, status, remarks, auth.getName())));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveRequestDTO>> cancelLeave(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Leave request cancelled", leaveService.cancel(id, auth.getName())));
    }

    @PatchMapping("/{id}/recommend")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveRequestDTO>> recommendLeave(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        String recommendation = body.get("recommendation");
        if (recommendation == null || recommendation.trim().isEmpty()) {
            throw new IllegalArgumentException("Recommendation text is required.");
        }
        return ResponseEntity.ok(ApiResponse.ok("Faculty recommendation added", leaveService.addRecommendation(id, recommendation, auth.getName())));
    }
}
