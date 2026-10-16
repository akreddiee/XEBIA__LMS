package com.assessmentportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateVerificationResponse {
    private boolean valid;
    private String status; // VALID, REVOKED, NOT_FOUND, ERROR
    private String certificateId;
    private String recipientName;
    private String assessmentTitle;
    private String subject;
    private String issueDate;
    private String verificationTimestamp;
    private String message;
}
