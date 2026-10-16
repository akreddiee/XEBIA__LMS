package com.assessmentportal.controller;

import com.assessmentportal.dto.CertificateVerificationResponse;
import com.assessmentportal.model.Certificate;
import com.assessmentportal.model.VerificationRequest;
import com.assessmentportal.service.VerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/verification")
public class VerificationController {

    private final VerificationService verificationService;

    public VerificationController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    /**
     * B. Public or learner-facing verification of issued certificates.
     * Publicly accessible, privacy-preserving.
     */
    @GetMapping("/certificate/{certificateId}")
    public ResponseEntity<CertificateVerificationResponse> verifyCertificate(
            @PathVariable String certificateId) {

        CertificateVerificationResponse response = verificationService.verifyCertificate(certificateId);
        if ("NOT_FOUND".equals(response.getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * A. Admin Verification Requests List.
     */
    @GetMapping("/requests")
    public ResponseEntity<?> getVerificationRequests(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String requestType,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "admin") String role) {

        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Access Denied: Admin privileges required."));
        }

        Map<String, Object> requests = verificationService.getVerificationRequests(
                status, requestType, search, page, size
        );
        return ResponseEntity.ok(requests);
    }

    /**
     * Summary Cards: Total Requests, Pending, Approved, Rejected.
     */
    @GetMapping("/requests/stats")
    public ResponseEntity<?> getRequestStats(
            @RequestParam(required = false, defaultValue = "admin") String role) {

        if (!"admin".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Access Denied: Admin privileges required."));
        }

        return ResponseEntity.ok(verificationService.getRequestStats());
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable String id) {
        Optional<VerificationRequest> opt = verificationService.getRequestById(id);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Collections.singletonMap("error", "Verification request not found."));
    }

    /**
     * Submit new verification request.
     */
    @PostMapping("/requests")
    public ResponseEntity<?> submitRequest(@RequestBody VerificationRequest request) {
        if (request.getRequesterName() == null || request.getRequesterName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Requester name is required."));
        }
        if (request.getRequestType() == null || request.getRequestType().trim().isEmpty()) {
            request.setRequestType("CERTIFICATE_VERIFICATION");
        }
        VerificationRequest created = verificationService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Admin Approve Request.
     */
    @PatchMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String role) {

        String reviewerRole = role;
        String reviewerId = "u-admin";
        String reviewerName = "Enterprise Administrator";
        String remarks = "Approved by Administrator";

        if (body != null) {
            if (body.get("role") != null) reviewerRole = body.get("role");
            if (body.get("reviewerId") != null) reviewerId = body.get("reviewerId");
            if (body.get("reviewerName") != null) reviewerName = body.get("reviewerName");
            if (body.get("remarks") != null) remarks = body.get("remarks");
        }

        if (reviewerRole == null || !"admin".equalsIgnoreCase(reviewerRole.trim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Access Denied: Enterprise Admin role required."));
        }

        try {
            VerificationRequest approved = verificationService.approveRequest(
                    id, reviewerId, reviewerName, reviewerRole, remarks
            );
            return ResponseEntity.ok(approved);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", se.getMessage()));
        } catch (NoSuchElementException nse) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", nse.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Admin Reject Request (Requires rejectionReason).
     */
    @PatchMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) String role) {

        String reviewerRole = role;
        String reviewerId = "u-admin";
        String reviewerName = "Enterprise Administrator";
        String rejectionReason = body != null ? body.get("rejectionReason") : null;

        if (body != null) {
            if (body.get("role") != null) reviewerRole = body.get("role");
            if (body.get("reviewerId") != null) reviewerId = body.get("reviewerId");
            if (body.get("reviewerName") != null) reviewerName = body.get("reviewerName");
        }

        if (reviewerRole == null || !"admin".equalsIgnoreCase(reviewerRole.trim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Access Denied: Enterprise Admin role required."));
        }

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Rejection reason is required."));
        }

        try {
            VerificationRequest rejected = verificationService.rejectRequest(
                    id, reviewerId, reviewerName, reviewerRole, rejectionReason
            );
            return ResponseEntity.ok(rejected);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", se.getMessage()));
        } catch (NoSuchElementException nse) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", nse.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Admin Revoke Certificate.
     */
    @PatchMapping("/certificates/{certificateId}/revoke")
    public ResponseEntity<?> revokeCertificate(
            @PathVariable String certificateId,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String role) {

        String adminRole = role;
        String adminId = "u-admin";
        String adminName = "Enterprise Administrator";
        String reason = "Revoked by Administrator";

        if (body != null) {
            if (body.get("role") != null) adminRole = body.get("role");
            if (body.get("adminId") != null) adminId = body.get("adminId");
            if (body.get("adminName") != null) adminName = body.get("adminName");
            if (body.get("reason") != null) reason = body.get("reason");
        }

        if (adminRole == null || !"admin".equalsIgnoreCase(adminRole.trim())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Access Denied: Enterprise Admin role required."));
        }

        try {
            Certificate revoked = verificationService.revokeCertificate(
                    certificateId, adminId, adminName, adminRole, reason
            );
            return ResponseEntity.ok(revoked);
        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.singletonMap("error", se.getMessage()));
        } catch (NoSuchElementException nse) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", nse.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}

