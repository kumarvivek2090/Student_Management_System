package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.service.DevDataSeederService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dev")
public class DevController {

    private final DevDataSeederService seederService;

    public DevController(DevDataSeederService seederService) {
        this.seederService = seederService;
    }

    @PostMapping("/seed")
    public ResponseEntity<ApiResponse<String>> triggerSeed() {
        seederService.seedDemoData();
        return ResponseEntity.ok(ApiResponse.ok("Controlled academic demonstration data successfully initialized", "SEED_COMPLETE"));
    }
}
