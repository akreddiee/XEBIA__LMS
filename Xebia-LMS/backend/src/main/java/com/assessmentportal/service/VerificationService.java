package com.assessmentportal.service;

import com.assessmentportal.dto.CertificateVerificationResponse;
import com.assessmentportal.model.Certificate;
import com.assessmentportal.model.Notification;
import com.assessmentportal.model.VerificationRequest;
import com.assessmentportal.model.VerificationStatusHistory;
import com.assessmentportal.repository.CertificateRepository;
import com.assessmentportal.repository.VerificationRequestRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VerificationService {

    private final CertificateRepository certificateRepository;
    private final VerificationRequestRepository verificationRequestRepository;
    private final NotificationService notificationService;

    public VerificationService(
            CertificateRepository certificateRepository,
            VerificationRequestRepository verificationRequestRepository,
            NotificationService notificationService) {
        this.certificateRepository = certificateRepository;
        this.verificationRequestRepository = verificationRequestRepository;
        this.notificationService = notificationService;
    }

    /**
     * Privacy-preserving public certificate verification.
     * Does NOT expose emails, student IDs, personal scores, or internal database metadata.
     */
    public CertificateVerificationResponse verifyCertificate(String certificateId) {
        if (certificateId == null || certificateId.trim().isEmpty()) {
            return CertificateVerificationResponse.builder()
                    .valid(false)
                    .status("NOT_FOUND")
                    .certificateId("")
                    .message("Certificate identifier is required for validation.")
                    .build();
        }

        String searchId = certificateId.trim();
        Optional<Certificate> opt = certificateRepository.findById(searchId);

        if (!opt.isPresent()) {
            return CertificateVerificationResponse.builder()
                    .valid(false)
                    .status("NOT_FOUND")
                    .certificateId(searchId)
                    .message("No matching official credential record found in Xebia Enterprise LMS Registry.")
                    .build();
        }

        Certificate cert = opt.get();
        String currentStatus = cert.getStatus() != null ? cert.getStatus().trim() : "Active";

        if ("REVOKED".equalsIgnoreCase(currentStatus)) {
            return CertificateVerificationResponse.builder()
                    .valid(false)
                    .status("REVOKED")
                    .certificateId(cert.getId())
                    .recipientName(cert.getStudentName())
                    .assessmentTitle(cert.getAssessmentTitle())
                    .subject(cert.getSubject())
                    .issueDate(cert.getIssueDate())
                    .verificationTimestamp(Instant.now().toString())
                    .message("This certificate was previously issued but has been officially REVOKED by an administrator.")
                    .build();
        }

        return CertificateVerificationResponse.builder()
                .valid(true)
                .status("VALID")
                .certificateId(cert.getId())
                .recipientName(cert.getStudentName())
                .assessmentTitle(cert.getAssessmentTitle())
                .subject(cert.getSubject())
                .issueDate(cert.getIssueDate())
                .verificationTimestamp(Instant.now().toString())
                .message("Official authenticated credential. Record is valid and confirmed active in Xebia Enterprise Registry.")
                .build();
    }

    /**
     * Retrieves verification requests for administrator review with filters, search, and pagination.
     */
    public Map<String, Object> getVerificationRequests(
            String status,
            String requestType,
            String search,
            int page,
            int size) {

        List<VerificationRequest> all = verificationRequestRepository.findAll();

        // Sort descending by creation time
        all.sort((a, b) -> {
            String ca = a.getCreatedAt() != null ? a.getCreatedAt() : "";
            String cb = b.getCreatedAt() != null ? b.getCreatedAt() : "";
            return cb.compareTo(ca);
        });

        // Filter by status
        if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            all = all.stream()
                    .filter(r -> r.getStatus() != null && r.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // Filter by requestType
        if (requestType != null && !requestType.isEmpty() && !"ALL".equalsIgnoreCase(requestType)) {
            all = all.stream()
                    .filter(r -> r.getRequestType() != null && r.getRequestType().equalsIgnoreCase(requestType))
                    .collect(Collectors.toList());
        }

        // Search by keyword
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            all = all.stream().filter(r ->
                    (r.getId() != null && r.getId().toLowerCase().contains(q)) ||
                    (r.getRequesterName() != null && r.getRequesterName().toLowerCase().contains(q)) ||
                    (r.getRequesterEmail() != null && r.getRequesterEmail().toLowerCase().contains(q)) ||
                    (r.getCertificateId() != null && r.getCertificateId().toLowerCase().contains(q)) ||
                    (r.getTargetCourseOrSubject() != null && r.getTargetCourseOrSubject().toLowerCase().contains(q)) ||
                    (r.getNotes() != null && r.getNotes().toLowerCase().contains(q))
            ).collect(Collectors.toList());
        }

        long pendingCount = verificationRequestRepository.countByStatus("PENDING");
        long approvedCount = verificationRequestRepository.countByStatus("APPROVED");
        long rejectedCount = verificationRequestRepository.countByStatus("REJECTED");
        int total = all.size();

        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<VerificationRequest> paged = all.subList(fromIndex, toIndex);

        Map<String, Object> result = new HashMap<>();
        result.put("items", paged);
        result.put("total", total);
        result.put("pendingCount", pendingCount);
        result.put("approvedCount", approvedCount);
        result.put("rejectedCount", rejectedCount);
        result.put("page", page);
        result.put("totalPages", (int) Math.ceil((double) total / size));

        return result;
    }

    public Map<String, Long> getRequestStats() {
        Map<String, Long> stats = new HashMap<>();
        long total = verificationRequestRepository.count();
        long pending = verificationRequestRepository.countByStatus("PENDING");
        long approved = verificationRequestRepository.countByStatus("APPROVED");
        long rejected = verificationRequestRepository.countByStatus("REJECTED");

        stats.put("total", total);
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        return stats;
    }

    public Optional<VerificationRequest> getRequestById(String id) {
        return verificationRequestRepository.findById(id);
    }

    public VerificationRequest createRequest(VerificationRequest request) {
        if (request.getId() == null || request.getId().trim().isEmpty()) {
            request.setId("VR-" + (1000 + new Random().nextInt(9000)));
        }
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            request.setStatus("PENDING");
        }
        String now = Instant.now().toString();
        request.setCreatedAt(now);
        request.setUpdatedAt(now);

        if (request.getAuditTrail() == null) {
            request.setAuditTrail(new ArrayList<>());
        }
        request.getAuditTrail().add(VerificationStatusHistory.builder()
                .timestamp(now)
                .changedBy(request.getRequesterName() != null ? request.getRequesterName() : "Requester")
                .fromStatus("NONE")
                .toStatus("PENDING")
                .remarks("Verification request submitted for administrative review.")
                .build());

        VerificationRequest saved = verificationRequestRepository.save(request);

        // Notify admins of new pending verification request
        try {
            notificationService.createNotification(Notification.builder()
                    .recipientRole("admin")
                    .title("New Verification Request Awaiting Review")
                    .message("Requester " + (request.getRequesterName() != null ? request.getRequesterName() : "User") +
                            " submitted request " + saved.getId() + " (" + saved.getRequestType() + ").")
                    .category("VERIFICATION")
                    .priority("WARNING")
                    .actionUrl("/admin/verification")
                    .read(false)
                    .createdAt(now)
                    .build());
        } catch (Exception e) {
            System.err.println("Failed to dispatch admin notification: " + e.getMessage());
        }

        return saved;
    }

    /**
     * Approves a verification request. Strictly enforces admin role.
     */
    public VerificationRequest approveRequest(
            String id,
            String reviewerId,
            String reviewerName,
            String reviewerRole,
            String remarks) {

        if (reviewerRole == null || !"admin".equalsIgnoreCase(reviewerRole.trim())) {
            throw new SecurityException("Access Denied: Only Enterprise Administrators may approve verification requests.");
        }

        Optional<VerificationRequest> opt = verificationRequestRepository.findById(id);
        if (!opt.isPresent()) {
            throw new NoSuchElementException("Verification request not found with ID: " + id);
        }

        VerificationRequest req = opt.get();
        String fromStatus = req.getStatus();
        String now = Instant.now().toString();

        req.setStatus("APPROVED");
        req.setReviewerId(reviewerId);
        req.setReviewerName(reviewerName != null ? reviewerName : "Enterprise Administrator");
        req.setReviewedAt(now);
        req.setUpdatedAt(now);

        if (req.getAuditTrail() == null) {
            req.setAuditTrail(new ArrayList<>());
        }
        req.getAuditTrail().add(VerificationStatusHistory.builder()
                .timestamp(now)
                .changedBy(req.getReviewerName())
                .fromStatus(fromStatus)
                .toStatus("APPROVED")
                .remarks(remarks != null && !remarks.trim().isEmpty() ? remarks : "Request verified and approved.")
                .build());

        VerificationRequest updated = verificationRequestRepository.save(req);

        // Notify the requester
        if (req.getRequesterId() != null) {
            try {
                notificationService.createNotification(Notification.builder()
                        .recipientId(req.getRequesterId())
                        .recipientRole("learner")
                        .title("Verification Request Approved (" + req.getId() + ")")
                        .message("Your verification request for " + req.getRequestType().replace("_", " ") +
                                " was approved by " + req.getReviewerName() + ".")
                        .category("VERIFICATION")
                        .priority("SUCCESS")
                        .actionUrl("/notifications")
                        .read(false)
                        .createdAt(now)
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to dispatch requester notification: " + e.getMessage());
            }
        }

        return updated;
    }

    /**
     * Rejects a verification request with a mandatory rejection reason. Strictly enforces admin role.
     */
    public VerificationRequest rejectRequest(
            String id,
            String reviewerId,
            String reviewerName,
            String reviewerRole,
            String rejectionReason) {

        if (reviewerRole == null || !"admin".equalsIgnoreCase(reviewerRole.trim())) {
            throw new SecurityException("Access Denied: Only Enterprise Administrators may reject verification requests.");
        }

        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new IllegalArgumentException("A valid rejection reason must be provided.");
        }

        Optional<VerificationRequest> opt = verificationRequestRepository.findById(id);
        if (!opt.isPresent()) {
            throw new NoSuchElementException("Verification request not found with ID: " + id);
        }

        VerificationRequest req = opt.get();
        String fromStatus = req.getStatus();
        String now = Instant.now().toString();

        req.setStatus("REJECTED");
        req.setReviewerId(reviewerId);
        req.setReviewerName(reviewerName != null ? reviewerName : "Enterprise Administrator");
        req.setReviewedAt(now);
        req.setRejectionReason(rejectionReason.trim());
        req.setUpdatedAt(now);

        if (req.getAuditTrail() == null) {
            req.setAuditTrail(new ArrayList<>());
        }
        req.getAuditTrail().add(VerificationStatusHistory.builder()
                .timestamp(now)
                .changedBy(req.getReviewerName())
                .fromStatus(fromStatus)
                .toStatus("REJECTED")
                .remarks("Rejected: " + rejectionReason.trim())
                .build());

        VerificationRequest updated = verificationRequestRepository.save(req);

        // Notify the requester
        if (req.getRequesterId() != null) {
            try {
                notificationService.createNotification(Notification.builder()
                        .recipientId(req.getRequesterId())
                        .recipientRole("learner")
                        .title("Verification Request Update (" + req.getId() + ")")
                        .message("Your verification request was rejected. Reason: " + rejectionReason.trim())
                        .category("VERIFICATION")
                        .priority("WARNING")
                        .actionUrl("/notifications")
                        .read(false)
                        .createdAt(now)
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to dispatch requester rejection notification: " + e.getMessage());
            }
        }

        return updated;
    }

    /**
     * Revokes an issued certificate. Strictly enforces admin role.
     */
    public Certificate revokeCertificate(String certificateId, String adminId, String adminName, String role, String reason) {
        if (role == null || !"admin".equalsIgnoreCase(role.trim())) {
            throw new SecurityException("Access Denied: Only Enterprise Administrators may revoke certificates.");
        }

        Optional<Certificate> opt = certificateRepository.findById(certificateId);
        if (!opt.isPresent()) {
            throw new NoSuchElementException("Certificate not found with ID: " + certificateId);
        }

        Certificate cert = opt.get();
        cert.setStatus("REVOKED");
        Certificate saved = certificateRepository.save(cert);

        if (cert.getStudentId() != null) {
            try {
                notificationService.createNotification(Notification.builder()
                        .recipientId(cert.getStudentId())
                        .recipientRole("learner")
                        .title("Notice: Certificate Revocation")
                        .message("Certificate " + cert.getId() + " for '" + cert.getAssessmentTitle() +
                                "' has been revoked. Reason: " + (reason != null ? reason : "Administrative review."))
                        .category("VERIFICATION")
                        .priority("URGENT")
                        .actionUrl("/certificates")
                        .read(false)
                        .createdAt(Instant.now().toString())
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to dispatch revocation notification: " + e.getMessage());
            }
        }

        return saved;
    }
}
