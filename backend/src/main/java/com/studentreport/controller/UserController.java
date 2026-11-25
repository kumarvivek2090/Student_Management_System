package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.UserSummaryDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EnterpriseDTO.UserSummaryDTO>> createUser(
            @RequestBody EnterpriseDTO.CreateUserRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("User created successfully", userService.createUser(request, auth.getName())));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<EnterpriseDTO.UserSummaryDTO>> toggleStatus(
            @PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", userService.toggleStatus(id, auth.getName())));
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        String newPassword = body.get("newPassword");
        userService.resetPassword(id, newPassword, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully", null));
    }
}
