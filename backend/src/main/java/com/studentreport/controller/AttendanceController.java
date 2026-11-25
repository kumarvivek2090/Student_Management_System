package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.AttendanceDTO;
import com.studentreport.service.AttendanceService;
import com.studentreport.service.SecurityAuthorizationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final SecurityAuthorizationService securityAuthorizationService;

    public AttendanceController(AttendanceService attendanceService,
                                SecurityAuthorizationService securityAuthorizationService) {
        this.attendanceService = attendanceService;
        this.securityAuthorizationService = securityAuthorizationService;
    }

    @GetMapping("/lock-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AttendanceDTO.AttendanceLockStatusDTO>> getLockStatus(
            @RequestParam UUID classId,
            @RequestParam UUID sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        String role = securityAuthorizationService.getRole(auth);
        return ResponseEntity.ok(ApiResponse.ok(
                attendanceService.getLockStatus(classId, sectionId, date, auth.getName(), role)));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> saveBulkAttendance(
            @Valid @RequestBody AttendanceDTO.BulkAttendanceRequest request, Authentication auth) {
        String role = securityAuthorizationService.getRole(auth);
        securityAuthorizationService.validateTeacherClassInstruction(auth, request.getClassId(), request.getSectionId());
        List<AttendanceDTO.AttendanceResponseDTO> saved = attendanceService.saveBulkAttendance(request, auth.getName(), role);
        return ResponseEntity.ok(ApiResponse.ok("Attendance Submitted Successfully", saved));
    }

    @PostMapping("/correct")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> correctAttendance(
            @Valid @RequestBody AttendanceDTO.AttendanceCorrectionRequest request, Authentication auth) {
        List<AttendanceDTO.AttendanceResponseDTO> updated = attendanceService.correctAttendance(request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Attendance corrected and audited successfully", updated));
    }

    @GetMapping("/admin/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.ClassAttendanceOverviewDTO>>> getAdminOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAdminOverview(targetDate)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> getAttendanceByStudent(
            @PathVariable UUID studentId, Authentication auth) {
        securityAuthorizationService.validateStudentAcademicAccess(auth, studentId);
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceByStudent(studentId)));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<ApiResponse<AttendanceDTO.AttendanceSummaryDTO>> getStudentAttendanceSummary(
            @PathVariable UUID studentId, Authentication auth) {
        securityAuthorizationService.validateStudentAcademicAccess(auth, studentId);
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getStudentAttendanceSummary(studentId)));
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> getAttendanceByClassAndDate(
            @PathVariable UUID classId,
            @PathVariable UUID sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        securityAuthorizationService.validateTeacherClassInstruction(auth, classId, sectionId);
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceByClassSectionAndDate(classId, sectionId, date)));
    }
}
