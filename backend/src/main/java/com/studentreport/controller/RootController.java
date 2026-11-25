package com.studentreport.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootController {

    @RequestMapping(value = {"/", "/health", "/favicon.ico"}, method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Map<String, Object>> rootHealth() {
        Map<String, Object> body = new HashMap<>();
        body.put("status", "UP");
        body.put("service", "Student Management System API");
        body.put("platform", "Oakridge Academy");
        body.put("version", "1.0.0");
        body.put("database", "Neon Cloud PostgreSQL");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }
}
