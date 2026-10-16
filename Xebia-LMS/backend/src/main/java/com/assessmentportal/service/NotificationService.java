package com.assessmentportal.service;

import com.assessmentportal.model.Notification;
import com.assessmentportal.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Map<String, Object> getNotifications(
            String userId,
            String role,
            String status,
            String category,
            String priority,
            int page,
            int size) {

        String safeRole = (role != null) ? role.toLowerCase() : "learner";
        List<Notification> all = notificationRepository.findForRecipient(userId, safeRole);

        // Sort descending by createdAt
        all.sort((a, b) -> {
            String ca = a.getCreatedAt() != null ? a.getCreatedAt() : "";
            String cb = b.getCreatedAt() != null ? b.getCreatedAt() : "";
            return cb.compareTo(ca);
        });

        // Filter by read/unread status
        if ("unread".equalsIgnoreCase(status)) {
            all = all.stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        } else if ("read".equalsIgnoreCase(status)) {
            all = all.stream().filter(Notification::isRead).collect(Collectors.toList());
        }

        // Filter by category
        if (category != null && !category.isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            all = all.stream()
                    .filter(n -> n.getCategory() != null && n.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        // Filter by priority
        if (priority != null && !priority.isEmpty() && !"ALL".equalsIgnoreCase(priority)) {
            all = all.stream()
                    .filter(n -> n.getPriority() != null && n.getPriority().equalsIgnoreCase(priority))
                    .collect(Collectors.toList());
        }

        int total = all.size();
        long unreadCount = notificationRepository.countUnreadForRecipient(userId, safeRole);

        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<Notification> paged = all.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("items", paged);
        response.put("total", total);
        response.put("unreadCount", unreadCount);
        response.put("page", page);
        response.put("totalPages", (int) Math.ceil((double) total / size));

        return response;
    }

    public long getUnreadCount(String userId, String role) {
        String safeRole = (role != null) ? role.toLowerCase() : "learner";
        return notificationRepository.countUnreadForRecipient(userId, safeRole);
    }

    public Optional<Notification> markAsRead(String id, String userId) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            // Validate recipient: must match userId or be role/all broadcast
            if (n.getRecipientId() == null || n.getRecipientId().equals(userId) || "all".equalsIgnoreCase(n.getRecipientRole())) {
                n.setRead(true);
                return Optional.of(notificationRepository.save(n));
            }
        }
        return Optional.empty();
    }

    public int markAllAsRead(String userId, String role) {
        String safeRole = (role != null) ? role.toLowerCase() : "learner";
        List<Notification> list = notificationRepository.findForRecipient(userId, safeRole);
        int count = 0;
        for (Notification n : list) {
            if (!n.isRead()) {
                n.setRead(true);
                count++;
            }
        }
        if (count > 0) {
            notificationRepository.saveAll(list);
        }
        return count;
    }

    public boolean deleteNotification(String id, String userId) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (opt.isPresent()) {
            Notification n = opt.get();
            if (n.getRecipientId() == null || n.getRecipientId().equals(userId)) {
                notificationRepository.deleteById(id);
                return true;
            }
        }
        return false;
    }

    public Notification createNotification(Notification notification) {
        if (notification.getId() == null || notification.getId().isEmpty()) {
            notification.setId("notif-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (notification.getCreatedAt() == null || notification.getCreatedAt().isEmpty()) {
            notification.setCreatedAt(Instant.now().toString());
        }
        return notificationRepository.save(notification);
    }
}
