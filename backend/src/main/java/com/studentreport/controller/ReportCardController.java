package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.ReportDTO;
import com.studentreport.entity.AcademicYear;
import com.studentreport.entity.Semester;
import com.studentreport.entity.Student;
import com.studentreport.exception.BadRequestException;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.AcademicYearRepository;
import com.studentreport.repository.SemesterRepository;
import com.studentreport.repository.StudentRepository;
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
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;

    public ReportCardController(ReportCardService reportCardService,
                                SecurityAuthorizationService securityAuthorizationService,
                                StudentRepository studentRepository,
                                AcademicYearRepository academicYearRepository,
                                SemesterRepository semesterRepository) {
        this.reportCardService = reportCardService;
        this.securityAuthorizationService = securityAuthorizationService;
        this.studentRepository = studentRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
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

    @GetMapping("/my-report")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ReportDTO.ReportCardResponseDTO>> getMyReport(
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) UUID semesterId,
            Authentication auth) {
        String email = auth.getName();
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email));

        UUID resolvedYearId = academicYearId;
        if (resolvedYearId == null) {
            resolvedYearId = academicYearRepository.findByIsCurrentTrue()
                    .map(AcademicYear::getId)
                    .orElseGet(() -> academicYearRepository.findAll().stream().findFirst().map(AcademicYear::getId).orElse(null));
        }
        final UUID finalYearId = resolvedYearId;
        UUID resolvedSemId = semesterId;
        if (resolvedSemId == null && finalYearId != null) {
            resolvedSemId = semesterRepository.findByAcademicYearIdAndIsCurrentTrue(finalYearId)
                    .map(Semester::getId)
                    .orElseGet(() -> semesterRepository.findByAcademicYearId(finalYearId).stream().findFirst().map(Semester::getId).orElse(null));
        }

        if (finalYearId == null || resolvedSemId == null) {
            throw new BadRequestException("No academic year or semester configured");
        }

        ReportDTO.ReportCardResponseDTO report = reportCardService.generateOrGetReportCard(
                student.getId(), finalYearId, resolvedSemId);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping(value = "/my-report/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<byte[]> downloadMyPdfReport(
            @RequestParam(required = false) UUID academicYearId,
            @RequestParam(required = false) UUID semesterId,
            Authentication auth) {
        String email = auth.getName();
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + email));

        UUID resolvedYearId = academicYearId;
        if (resolvedYearId == null) {
            resolvedYearId = academicYearRepository.findByIsCurrentTrue()
                    .map(AcademicYear::getId)
                    .orElseGet(() -> academicYearRepository.findAll().stream().findFirst().map(AcademicYear::getId).orElse(null));
        }
        final UUID finalYearId = resolvedYearId;
        UUID resolvedSemId = semesterId;
        if (resolvedSemId == null && finalYearId != null) {
            resolvedSemId = semesterRepository.findByAcademicYearIdAndIsCurrentTrue(finalYearId)
                    .map(Semester::getId)
                    .orElseGet(() -> semesterRepository.findByAcademicYearId(finalYearId).stream().findFirst().map(Semester::getId).orElse(null));
        }

        if (finalYearId == null || resolvedSemId == null) {
            throw new BadRequestException("No academic year or semester configured");
        }

        byte[] pdfBytes = reportCardService.generatePdfReport(student.getId(), finalYearId, resolvedSemId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Official_Academic_Report_" + student.getStudentId() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
