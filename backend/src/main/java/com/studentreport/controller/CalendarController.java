package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.AcademicCalendarService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/calendar/events")
public class CalendarController {

    private final AcademicCalendarService calendarService;

    public CalendarController(AcademicCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.AcademicEventDTO>>> getEvents() {
        return ResponseEntity.ok(ApiResponse.ok(calendarService.getAllEvents()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.AcademicEventDTO>> createEvent(
            @RequestBody EnterpriseDTO.AcademicEventDTO request) {
        return ResponseEntity.ok(ApiResponse.ok("Event scheduled", calendarService.createEvent(request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable UUID id) {
        calendarService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted", null));
    }
}
