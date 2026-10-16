package com.assessmentportal.controller;

import com.assessmentportal.dto.CertificateVerificationResponse;
import com.assessmentportal.model.VerificationRequest;
import com.assessmentportal.service.VerificationService;
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
class VerificationControllerTest {

    @Mock
    private VerificationService verificationService;

    @InjectMocks
    private VerificationController verificationController;

    @Test
    void verifyCertificateReturnsValidResponse() {
        CertificateVerificationResponse mockResponse = CertificateVerificationResponse.builder()
                .certificateId("cert-123")
                .status("VALID")
                .recipientName("Alex Rivera")
                .subject("UI/UX Design")
                .assessmentTitle("UI/UX Principles")
                .issueDate("2026-03-15")
                .valid(true)
                .message("Valid certificate")
                .build();

        when(verificationService.verifyCertificate("cert-123")).thenReturn(mockResponse);

        ResponseEntity<CertificateVerificationResponse> response = verificationController.verifyCertificate("cert-123");

        assertEquals(200, response.getStatusCodeValue());
        assertSame(mockResponse, response.getBody());
    }

    @Test
    void verifyCertificateReturnsNotFoundWhenMissing() {
        CertificateVerificationResponse mockResponse = CertificateVerificationResponse.builder()
                .certificateId("invalid-id")
                .status("NOT_FOUND")
                .valid(false)
                .message("No matching official credential record found")
                .build();

        when(verificationService.verifyCertificate("invalid-id")).thenReturn(mockResponse);

        ResponseEntity<CertificateVerificationResponse> response = verificationController.verifyCertificate("invalid-id");

        assertEquals(404, response.getStatusCodeValue());
        assertSame(mockResponse, response.getBody());
    }

    @Test
    void getRequestsDeniesNonAdmin() {
        ResponseEntity<?> response = verificationController.getVerificationRequests(
                "ALL", "ALL", "", 0, 10, "learner"
        );

        assertEquals(403, response.getStatusCodeValue());
        verify(verificationService, never()).getVerificationRequests(any(), any(), any(), anyInt(), anyInt());
    }

    @Test
    void getRequestsAllowsAdmin() {
        Map<String, Object> mockResult = new HashMap<>();
        mockResult.put("items", Collections.emptyList());
        mockResult.put("total", 0L);

        when(verificationService.getVerificationRequests(eq("PENDING"), eq("ALL"), eq(""), eq(0), eq(10)))
                .thenReturn(mockResult);

        ResponseEntity<?> response = verificationController.getVerificationRequests(
                "PENDING", "ALL", "", 0, 10, "admin"
        );

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockResult, response.getBody());
    }

    @Test
    void getRequestStatsDeniesNonAdmin() {
        ResponseEntity<?> response = verificationController.getRequestStats("teacher");

        assertEquals(403, response.getStatusCodeValue());
        verify(verificationService, never()).getRequestStats();
    }

    @Test
    void getRequestStatsAllowsAdmin() {
        Map<String, Long> mockStats = new HashMap<>();
        mockStats.put("total", 10L);
        mockStats.put("pending", 3L);
        mockStats.put("approved", 5L);
        mockStats.put("rejected", 2L);

        when(verificationService.getRequestStats()).thenReturn(mockStats);

        ResponseEntity<?> response = verificationController.getRequestStats("admin");

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockStats, response.getBody());
    }

    @Test
    void approveRequestDeniesNonAdmin() {
        Map<String, String> body = new HashMap<>();
        body.put("role", "learner");

        ResponseEntity<?> response = verificationController.approveRequest("req-1", body, "learner");

        assertEquals(403, response.getStatusCodeValue());
        verify(verificationService, never()).approveRequest(anyString(), any(), any(), any(), any());
    }

    @Test
    void approveRequestAllowsAdmin() {
        Map<String, String> body = new HashMap<>();
        body.put("role", "admin");
        body.put("reviewerId", "u-admin-1");
        body.put("reviewerName", "Administrator");
        body.put("remarks", "All prerequisites satisfied.");

        VerificationRequest approvedReq = new VerificationRequest();
        approvedReq.setId("req-1");
        approvedReq.setStatus("APPROVED");

        when(verificationService.approveRequest(eq("req-1"), eq("u-admin-1"), eq("Administrator"), eq("admin"), eq("All prerequisites satisfied.")))
                .thenReturn(approvedReq);

        ResponseEntity<?> response = verificationController.approveRequest("req-1", body, "admin");

        assertEquals(200, response.getStatusCodeValue());
        assertSame(approvedReq, response.getBody());
    }

    @Test
    void rejectRequestRequiresReason() {
        Map<String, String> body = new HashMap<>();
        body.put("role", "admin");
        body.put("rejectionReason", "   "); // Empty or whitespace

        ResponseEntity<?> response = verificationController.rejectRequest("req-1", body, "admin");

        assertEquals(400, response.getStatusCodeValue());
        verify(verificationService, never()).rejectRequest(anyString(), any(), any(), any(), any());
    }

    @Test
    void rejectRequestAllowsAdminWithReason() {
        Map<String, String> body = new HashMap<>();
        body.put("role", "admin");
        body.put("rejectionReason", "Invalid credential document attached.");
        body.put("reviewerId", "u-admin-1");
        body.put("reviewerName", "Admin Reviewer");

        VerificationRequest rejectedReq = new VerificationRequest();
        rejectedReq.setId("req-1");
        rejectedReq.setStatus("REJECTED");
        rejectedReq.setRejectionReason("Invalid credential document attached.");

        when(verificationService.rejectRequest(eq("req-1"), eq("u-admin-1"), eq("Admin Reviewer"), eq("admin"), eq("Invalid credential document attached.")))
                .thenReturn(rejectedReq);

        ResponseEntity<?> response = verificationController.rejectRequest("req-1", body, "admin");

        assertEquals(200, response.getStatusCodeValue());
        assertSame(rejectedReq, response.getBody());
    }
}
