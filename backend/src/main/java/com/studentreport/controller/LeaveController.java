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
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.LeaveRequestDTO>>> getAllLeaves() {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getAll()));
    }

    @GetMapping("/my-leaves")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.LeaveRequestDTO>>> getMyLeaves(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(leaveService.getMyLeaves(auth.getName())));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveRequestDTO>> applyLeave(
            @RequestBody EnterpriseDTO.ApplyLeaveRequest request, Authentication auth) {
        String role = auth.getAuthorities().stream().findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("STUDENT");
        return ResponseEntity.ok(ApiResponse.ok("Leave request filed", leaveService.apply(request, auth.getName(), role)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LeaveRequestDTO>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        LeaveRequest.LeaveStatus status = LeaveRequest.LeaveStatus.valueOf(body.get("status"));
        String remarks = body.get("remarks");
        return ResponseEntity.ok(ApiResponse.ok("Leave status updated", leaveService.updateStatus(id, status, remarks, auth.getName())));
    }
}
