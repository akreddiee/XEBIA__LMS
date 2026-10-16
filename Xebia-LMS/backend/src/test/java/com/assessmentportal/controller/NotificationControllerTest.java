package com.assessmentportal.controller;

import com.assessmentportal.model.Notification;
import com.assessmentportal.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    @Test
    void getNotificationsReturnsBadRequestWhenUserIdMissing() {
        ResponseEntity<?> response = notificationController.getNotifications(
                null, "learner", "all", "ALL", "ALL", 0, 10
        );
        assertEquals(400, response.getStatusCodeValue());
        assertTrue(response.getBody() instanceof Map);
    }

    @Test
    void getNotificationsReturnsListWhenUserIdProvided() {
        Map<String, Object> mockResult = new HashMap<>();
        mockResult.put("items", Collections.emptyList());
        mockResult.put("total", 0);
        mockResult.put("unreadCount", 0L);
        mockResult.put("page", 0);
        mockResult.put("totalPages", 1);

        when(notificationService.getNotifications(eq("user-1"), eq("learner"), eq("all"), eq("ALL"), eq("ALL"), eq(0), eq(10)))
                .thenReturn(mockResult);

        ResponseEntity<?> response = notificationController.getNotifications(
                "user-1", "learner", "all", "ALL", "ALL", 0, 10
        );

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockResult, response.getBody());
    }

    @Test
    void getUnreadCountReturnsCount() {
        when(notificationService.getUnreadCount("user-1", "learner")).thenReturn(4L);

        ResponseEntity<?> response = notificationController.getUnreadCount("user-1", "learner");

        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals(4L, body.get("count"));
    }

    @Test
    void markAsReadReturnsUpdatedNotificationWhenFound() {
        Notification notification = Notification.builder()
                .id("notif-1")
                .recipientId("user-1")
                .title("Assessment Ready")
                .message("You can now start")
                .read(true)
                .build();

        when(notificationService.markAsRead("notif-1", "user-1"))
                .thenReturn(Optional.of(notification));

        ResponseEntity<?> response = notificationController.markAsRead("notif-1", "user-1");

        assertEquals(200, response.getStatusCodeValue());
        assertSame(notification, response.getBody());
    }

    @Test
    void markAsReadReturnsNotFoundWhenMissing() {
        when(notificationService.markAsRead("notif-999", "user-1"))
                .thenReturn(Optional.empty());

        ResponseEntity<?> response = notificationController.markAsRead("notif-999", "user-1");

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void markAllAsReadReturnsUpdatedCount() {
        when(notificationService.markAllAsRead("user-1", "learner")).thenReturn(5);

        ResponseEntity<?> response = notificationController.markAllAsRead("user-1", "learner");

        assertEquals(200, response.getStatusCodeValue());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));
        assertEquals(5, body.get("count"));
    }

    @Test
    void createNotificationReturnsCreated() {
        Notification input = Notification.builder()
                .title("New Assignment")
                .message("Details here")
                .build();

        Notification saved = Notification.builder()
                .id("notif-new")
                .title("New Assignment")
                .message("Details here")
                .category("GENERAL")
                .priority("INFO")
                .build();

        when(notificationService.createNotification(any(Notification.class)))
                .thenReturn(saved);

        ResponseEntity<?> response = notificationController.createNotification(input);

        assertEquals(201, response.getStatusCodeValue());
        assertSame(saved, response.getBody());
    }
}
