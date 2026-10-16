package com.assessmentportal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    private String recipientId;

    private String recipientRole; // "learner", "teacher", "admin", "all"

    private String title;

    private String message;

    private String category; // GENERAL, ASSESSMENTS, COURSES, EVENTS, GRADES, CERTIFICATES, VERIFICATION

    private String priority; // URGENT, WARNING, INFO, SUCCESS

    private boolean read;

    private String actionUrl;

    private String createdAt;
}
