package com.assessmentportal.controller;

import com.assessmentportal.model.Notification;
import com.assessmentportal.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false, defaultValue = "learner") String role,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false, defaultValue = "ALL") String category,
            @RequestParam(required = false, defaultValue = "ALL") String priority,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {

        if (userId == null || userId.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "userId parameter is required for recipient-authorized notification query");
            return ResponseEntity.badRequest().body(err);
        }

        Map<String, Object> result = notificationService.getNotifications(
                userId.trim(),
                role,
                status,
                category,
                priority,
                page,
                size
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false, defaultValue = "learner") String role) {

        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.ok(Collections.singletonMap("count", 0L));
        }

        long count = notificationService.getUnreadCount(userId.trim(), role);
        return ResponseEntity.ok(Collections.singletonMap("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable String id,
            @RequestParam(required = false) String userId) {

        if (userId == null || userId.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "userId parameter is required to verify recipient authorization");
            return ResponseEntity.badRequest().body(err);
        }

        Optional<Notification> opt = notificationService.markAsRead(id, userId.trim());
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Notification not found or access denied"));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false, defaultValue = "learner") String role) {

        if (userId == null || userId.trim().isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "userId parameter is required to verify recipient authorization");
            return ResponseEntity.badRequest().body(err);
        }

        int count = notificationService.markAllAsRead(userId.trim(), role);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable String id,
            @RequestParam(required = false) String userId) {

        if (userId == null || userId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "userId is required"));
        }

        boolean deleted = notificationService.deleteNotification(id, userId.trim());
        if (deleted) {
            return ResponseEntity.ok(Collections.singletonMap("success", true));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Notification not found or access denied"));
    }

    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody Notification notification) {
        if (notification.getTitle() == null || notification.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Title is required"));
        }
        if (notification.getMessage() == null || notification.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Message is required"));
        }
        if (notification.getCategory() == null || notification.getCategory().trim().isEmpty()) {
            notification.setCategory("GENERAL");
        }
        if (notification.getPriority() == null || notification.getPriority().trim().isEmpty()) {
            notification.setPriority("INFO");
        }
        Notification saved = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
