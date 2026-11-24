package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.AttendanceDTO;
import com.studentreport.service.AttendanceService;
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

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> saveBulkAttendance(
            @Valid @RequestBody AttendanceDTO.BulkAttendanceRequest request, Authentication auth) {
        List<AttendanceDTO.AttendanceResponseDTO> saved = attendanceService.saveBulkAttendance(request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Attendance recorded successfully", saved));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> getAttendanceByStudent(
            @PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceByStudent(studentId)));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<ApiResponse<AttendanceDTO.AttendanceSummaryDTO>> getStudentAttendanceSummary(
            @PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getStudentAttendanceSummary(studentId)));
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    public ResponseEntity<ApiResponse<List<AttendanceDTO.AttendanceResponseDTO>>> getAttendanceByClassAndDate(
            @PathVariable UUID classId,
            @PathVariable UUID sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.getAttendanceByClassSectionAndDate(classId, sectionId, date)));
    }
}
