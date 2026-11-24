package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.TeacherDTO;
import com.studentreport.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TeacherDTO.TeacherResponse>>> getAllTeachers() {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.getAllTeachers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TeacherDTO.TeacherResponse>> getTeacherById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.getTeacherById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDTO.TeacherResponse>> createTeacher(@Valid @RequestBody TeacherDTO.TeacherRequest request) {
        TeacherDTO.TeacherResponse created = teacherService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Teacher created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDTO.TeacherResponse>> updateTeacher(
            @PathVariable UUID id, @Valid @RequestBody TeacherDTO.TeacherRequest request) {
        TeacherDTO.TeacherResponse updated = teacherService.updateTeacher(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Teacher updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable UUID id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok(ApiResponse.ok("Teacher deleted successfully", null));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDTO.TeacherAssignmentDTO>> assignClassAndSubject(
            @RequestBody TeacherDTO.AssignClassSubjectRequest request) {
        TeacherDTO.TeacherAssignmentDTO assignment = teacherService.assignClassAndSubject(request);
        return ResponseEntity.ok(ApiResponse.ok("Assignment successfully mapped", assignment));
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<TeacherDTO.TeacherAssignmentDTO>>> getMyAssignments(Authentication auth) {
        List<TeacherDTO.TeacherAssignmentDTO> assignments = teacherService.getTeacherAssignments(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(assignments));
    }
}
