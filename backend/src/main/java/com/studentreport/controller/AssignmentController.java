package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.AssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.AssignmentDTO>>> getAssignments(Authentication auth) {
        String role = auth.getAuthorities().stream().findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("");
        if ("TEACHER".equals(role)) {
            return ResponseEntity.ok(ApiResponse.ok(assignmentService.getByTeacherEmail(auth.getName())));
        } else if ("STUDENT".equals(role)) {
            return ResponseEntity.ok(ApiResponse.ok(assignmentService.getForStudent(auth.getName())));
        }
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getAll()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.AssignmentDTO>> createAssignment(
            @RequestBody EnterpriseDTO.AssignmentCreateRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Assignment published", assignmentService.createAssignment(request, auth.getName())));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.SubmissionDTO>> submitAssignment(
            @RequestBody EnterpriseDTO.SubmitAssignmentRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Work submitted successfully", assignmentService.submitAssignment(request, auth.getName())));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.SubmissionDTO>>> getSubmissions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(assignmentService.getSubmissions(id)));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.SubmissionDTO>> gradeSubmission(
            @PathVariable UUID submissionId, @RequestBody EnterpriseDTO.GradeSubmissionRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Grade recorded", assignmentService.gradeSubmission(submissionId, request, auth.getName())));
    }
}
