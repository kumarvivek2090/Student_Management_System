package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.RemarkDTO;
import com.studentreport.service.TeacherRemarkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/remarks")
public class TeacherRemarkController {

    private final TeacherRemarkService remarkService;

    public TeacherRemarkController(TeacherRemarkService remarkService) {
        this.remarkService = remarkService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<RemarkDTO.RemarkResponseDTO>> createRemark(
            @Valid @RequestBody RemarkDTO.RemarkRequest request, Authentication auth) {
        RemarkDTO.RemarkResponseDTO created = remarkService.createRemark(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Remark added successfully", created));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<RemarkDTO.RemarkResponseDTO>>> getRemarksByStudent(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "true") boolean onlyPublished) {
        return ResponseEntity.ok(ApiResponse.ok(remarkService.getRemarksByStudent(studentId, onlyPublished)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<RemarkDTO.RemarkResponseDTO>> updateRemark(
            @PathVariable UUID id, @Valid @RequestBody RemarkDTO.RemarkRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(remarkService.updateRemark(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteRemark(@PathVariable UUID id) {
        remarkService.deleteRemark(id);
        return ResponseEntity.ok(ApiResponse.ok("Remark deleted", null));
    }
}
