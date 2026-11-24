package com.studentreport.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> liveness() {
        Map<String, Object> body = new HashMap<>();
        body.put("status", "UP");
        body.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/ready")
    public ResponseEntity<Map<String, Object>> readiness() {
        Map<String, Object> body = new HashMap<>();
        long start = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            int tableCount = 0;
            try (ResultSet rs = stmt.executeQuery(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")) {
                if (rs.next()) {
                    tableCount = rs.getInt(1);
                }
            }

            long latency = System.currentTimeMillis() - start;
            body.put("status", "UP");
            body.put("database", "CONNECTED");
            body.put("provider", "Neon Cloud PostgreSQL");
            body.put("engineVersion", "PostgreSQL 18.7");
            body.put("region", "AWS US-East-2 (Ohio)");
            body.put("pooler", "Neon PgBouncer Transaction Pooling");
            body.put("ssl", "TLS 1.3 / SCRAM Channel Binding");
            body.put("backend", "Spring Boot 3.3.5 / Java 21");
            body.put("tableCount", tableCount);
            body.put("latencyMs", latency);
            body.put("timestamp", Instant.now().toString());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("status", "DOWN");
            body.put("database", "DISCONNECTED");
            body.put("error", e.getMessage());
            body.put("timestamp", Instant.now().toString());
            return ResponseEntity.status(503).body(body);
        }
    }
}
