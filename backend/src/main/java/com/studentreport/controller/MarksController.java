package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.MarksDTO;
import com.studentreport.service.MarksService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    private final MarksService marksService;

    public MarksController(MarksService marksService) {
        this.marksService = marksService;
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<MarksDTO.MarkResponseDTO>>> saveBulkMarks(
            @Valid @RequestBody MarksDTO.BulkMarksEntryRequest request, Authentication auth) {
        List<MarksDTO.MarkResponseDTO> saved = marksService.saveBulkMarks(request, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Marks successfully recorded", saved));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<MarksDTO.MarkResponseDTO>>> getMarksByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(ApiResponse.ok(marksService.getMarksByStudent(studentId)));
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<ApiResponse<List<MarksDTO.MarkResponseDTO>>> getMarksByAssessment(@PathVariable UUID assessmentId) {
        return ResponseEntity.ok(ApiResponse.ok(marksService.getMarksByAssessment(assessmentId)));
    }
}
