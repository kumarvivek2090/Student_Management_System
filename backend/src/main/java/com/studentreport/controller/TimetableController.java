package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.TimetableService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/timetables")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    @GetMapping("/class/{classId}/section/{sectionId}")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.TimetableSlotDTO>>> getByClassAndSection(
            @PathVariable UUID classId, @PathVariable UUID sectionId) {
        return ResponseEntity.ok(ApiResponse.ok(timetableService.getByClassAndSection(classId, sectionId)));
    }

    @GetMapping("/my-schedule")
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.TimetableSlotDTO>>> getMySchedule(Authentication auth) {
        String role = auth.getAuthorities().stream().findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("");
        if ("TEACHER".equals(role)) {
            return ResponseEntity.ok(ApiResponse.ok(timetableService.getByTeacherEmail(auth.getName())));
        } else if ("STUDENT".equals(role)) {
            return ResponseEntity.ok(ApiResponse.ok(timetableService.getForStudent(auth.getName())));
        }
        return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.TimetableSlotDTO>> createSlot(
            @RequestBody EnterpriseDTO.TimetableCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Timetable slot created", timetableService.createSlot(request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable UUID id) {
        timetableService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.ok("Slot removed", null));
    }
}
