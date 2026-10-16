package com.assessmentportal.repository;

import com.assessmentportal.model.VerificationRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRequestRepository extends MongoRepository<VerificationRequest, String> {

    List<VerificationRequest> findByStatus(String status);

    List<VerificationRequest> findByRequesterId(String requesterId);

    List<VerificationRequest> findByRequestType(String requestType);

    Optional<VerificationRequest> findByCertificateId(String certificateId);

    long countByStatus(String status);
}
