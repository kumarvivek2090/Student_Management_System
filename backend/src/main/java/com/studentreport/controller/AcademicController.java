package com.studentreport.controller;

import com.studentreport.dto.AcademicDTO;
import com.studentreport.dto.ApiResponse;
import com.studentreport.entity.AppSetting;
import com.studentreport.entity.GradingScale;
import com.studentreport.service.AcademicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AcademicController {

    private final AcademicService academicService;

    public AcademicController(AcademicService academicService) {
        this.academicService = academicService;
    }

    // Classes
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<AcademicDTO.ClassResponse>>> getClasses() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllClasses()));
    }

    @PostMapping("/classes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.ClassResponse>> createClass(@Valid @RequestBody AcademicDTO.ClassRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createClass(req)));
    }

    @PutMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.ClassResponse>> updateClass(@PathVariable UUID id, @Valid @RequestBody AcademicDTO.ClassRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.updateClass(id, req)));
    }

    @DeleteMapping("/classes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteClass(@PathVariable UUID id) {
        academicService.deleteClass(id);
        return ResponseEntity.ok(ApiResponse.ok("Class deleted", null));
    }

    // Sections
    @GetMapping("/classes/{id}/sections")
    public ResponseEntity<ApiResponse<List<AcademicDTO.SectionResponse>>> getSections(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getSectionsByClass(id)));
    }

    @PostMapping("/classes/{id}/sections")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.SectionResponse>> createSection(@PathVariable UUID id, @Valid @RequestBody AcademicDTO.SectionRequest req) {
        req.setClassId(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createSection(req)));
    }

    @DeleteMapping("/sections/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSection(@PathVariable UUID id) {
        academicService.deleteSection(id);
        return ResponseEntity.ok(ApiResponse.ok("Section deleted", null));
    }

    // Subjects
    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<AcademicDTO.SubjectResponse>>> getSubjects() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllSubjects()));
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.SubjectResponse>> createSubject(@Valid @RequestBody AcademicDTO.SubjectRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createSubject(req)));
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.SubjectResponse>> updateSubject(@PathVariable UUID id, @Valid @RequestBody AcademicDTO.SubjectRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.updateSubject(id, req)));
    }

    @DeleteMapping("/subjects/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable UUID id) {
        academicService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.ok("Subject deleted", null));
    }

    // Academic Years & Semesters
    @GetMapping("/academic-years")
    public ResponseEntity<ApiResponse<List<AcademicDTO.AcademicYearResponse>>> getAcademicYears() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllAcademicYears()));
    }

    @PostMapping("/academic-years")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.AcademicYearResponse>> createAcademicYear(@Valid @RequestBody AcademicDTO.AcademicYearRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createAcademicYear(req)));
    }

    @GetMapping("/academic-years/{id}/semesters")
    public ResponseEntity<ApiResponse<List<AcademicDTO.SemesterResponse>>> getSemesters(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getSemestersByYear(id)));
    }

    @PostMapping("/academic-years/{id}/semesters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AcademicDTO.SemesterResponse>> createSemester(@PathVariable UUID id, @Valid @RequestBody AcademicDTO.SemesterRequest req) {
        req.setAcademicYearId(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createSemester(req)));
    }

    // Examinations & Assessments
    @GetMapping("/examinations")
    public ResponseEntity<ApiResponse<List<AcademicDTO.ExaminationResponse>>> getExaminations() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllExaminations()));
    }

    @PostMapping("/examinations")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AcademicDTO.ExaminationResponse>> createExamination(@Valid @RequestBody AcademicDTO.ExaminationRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createExamination(req)));
    }

    @GetMapping("/examinations/{id}/assessments")
    public ResponseEntity<ApiResponse<List<AcademicDTO.AssessmentResponse>>> getAssessmentsByExam(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAssessmentsByExam(id)));
    }

    @GetMapping("/assessments/class/{classId}/section/{sectionId}")
    public ResponseEntity<ApiResponse<List<AcademicDTO.AssessmentResponse>>> getAssessmentsByClassAndSection(
            @PathVariable UUID classId, @PathVariable UUID sectionId) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAssessmentsByClassAndSection(classId, sectionId)));
    }

    @PostMapping("/assessments")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AcademicDTO.AssessmentResponse>> createAssessment(@Valid @RequestBody AcademicDTO.AssessmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(academicService.createAssessment(req)));
    }

    // Grading Scales
    @GetMapping("/grading-scales")
    public ResponseEntity<ApiResponse<List<GradingScale>>> getGradingScales() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllGradingScales()));
    }

    @PostMapping("/grading-scales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GradingScale>> saveGradingScale(@RequestBody GradingScale scale) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.saveGradingScale(scale)));
    }

    @DeleteMapping("/grading-scales/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteGradingScale(@PathVariable UUID id) {
        academicService.deleteGradingScale(id);
        return ResponseEntity.ok(ApiResponse.ok("Grading scale deleted", null));
    }

    // Settings
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<List<AppSetting>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllSettings()));
    }

    @PutMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AppSetting>> updateSetting(@RequestBody Map<String, String> body) {
        String key = body.get("key");
        String value = body.get("value");
        return ResponseEntity.ok(ApiResponse.ok(academicService.updateSetting(key, value)));
    }
}
