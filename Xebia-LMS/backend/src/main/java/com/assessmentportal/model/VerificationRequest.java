package com.assessmentportal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "verification_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationRequest {

    @Id
    private String id;

    private String requesterId;

    private String requesterName;

    private String requesterEmail;

    private String requesterRole;

    private String requestType; // CERTIFICATE_VERIFICATION, LEARNER_CREDENTIAL, COURSE_EXEMPTION, IDENTITY_VERIFICATION

    private String certificateId;

    private String targetCourseOrSubject;

    private String documentUrl;

    private String notes;

    private String status; // PENDING, APPROVED, REJECTED

    private String reviewerId;

    private String reviewerName;

    private String reviewedAt;

    private String rejectionReason;

    private String createdAt;

    private String updatedAt;

    @Builder.Default
    private List<VerificationStatusHistory> auditTrail = new ArrayList<>();
}
