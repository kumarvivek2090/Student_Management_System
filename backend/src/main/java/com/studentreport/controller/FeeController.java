package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.FeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.FeeOverviewDTO>> getOverview() {
        return ResponseEntity.ok(ApiResponse.ok(feeService.getOverview()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.StudentFeeDTO>>> getAllFees() {
        return ResponseEntity.ok(ApiResponse.ok(feeService.getAllStudentFees()));
    }

    @GetMapping("/my-fees")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.StudentFeeDTO>>> getMyFees(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(feeService.getFeesByStudentEmail(auth.getName())));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.StudentFeeDTO>>> getStudentFees(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(feeService.getFeesByStudentId(studentId)));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<EnterpriseDTO.StudentFeeDTO>> recordPayment(
            @RequestBody EnterpriseDTO.RecordPaymentRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", feeService.recordPayment(request, auth.getName())));
    }
}
