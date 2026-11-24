package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.AuthDTO;
import com.studentreport.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTO.LoginResponse>> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        AuthService.LoginResult result = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, result.cookie().toString())
                .body(ApiResponse.ok("Login successful", result.response()));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie cleanCookie = authService.logout();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body(ApiResponse.ok("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDTO.UserSummaryDTO>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthenticated"));
        }
        AuthDTO.UserSummaryDTO user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
