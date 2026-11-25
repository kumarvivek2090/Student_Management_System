package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.ReportDTO;
import com.studentreport.service.ReportCardService;
import com.studentreport.service.SecurityAuthorizationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportCardController {

    private final ReportCardService reportCardService;
    private final SecurityAuthorizationService securityAuthorizationService;

    public ReportCardController(ReportCardService reportCardService,
                                SecurityAuthorizationService securityAuthorizationService) {
        this.reportCardService = reportCardService;
        this.securityAuthorizationService = securityAuthorizationService;
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ReportDTO.ReportCardResponseDTO>> generateReport(
            @Valid @RequestBody ReportDTO.GenerateReportRequest request, Authentication auth) {
        securityAuthorizationService.validateStudentAcademicAccess(auth, request.getStudentId());
        ReportDTO.ReportCardResponseDTO report = reportCardService.generateOrGetReportCard(
                request.getStudentId(), request.getAcademicYearId(), request.getSemesterId());
        return ResponseEntity.ok(ApiResponse.ok("Report card generated successfully", report));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<ReportDTO.ReportCardResponseDTO>> getStudentReport(
            @PathVariable UUID studentId,
            @RequestParam UUID academicYearId,
            @RequestParam UUID semesterId,
            Authentication auth) {
        securityAuthorizationService.validateStudentAcademicAccess(auth, studentId);
        ReportDTO.ReportCardResponseDTO report = reportCardService.generateOrGetReportCard(
                studentId, academicYearId, semesterId);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping(value = "/student/{studentId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPdfReport(
            @PathVariable UUID studentId,
            @RequestParam UUID academicYearId,
            @RequestParam UUID semesterId,
            Authentication auth) {
        securityAuthorizationService.validateStudentAcademicAccess(auth, studentId);
        byte[] pdfBytes = reportCardService.generatePdfReport(studentId, academicYearId, semesterId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "student_report_" + studentId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
