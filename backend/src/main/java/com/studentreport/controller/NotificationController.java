package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.entity.Notification;
import com.studentreport.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications(auth.getName())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
        long count = notificationService.getUnreadCount(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("All marked as read", null));
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> broadcast(
            @RequestBody Map<String, String> body) {
        String title = body.get("title");
        String message = body.get("message");
        String target = body.get("targetRole");
        Notification.NotificationType type = Notification.NotificationType.INFO;
        if (body.get("type") != null) {
            try {
                type = Notification.NotificationType.valueOf(body.get("type"));
            } catch (Exception ignored) {}
        }

        int count = notificationService.broadcast(title, message, target, type);
        return ResponseEntity.ok(ApiResponse.ok("Broadcast dispatched", Map.of("recipients", count)));
    }
}
