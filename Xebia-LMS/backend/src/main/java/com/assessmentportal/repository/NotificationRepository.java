package com.assessmentportal.repository;

import com.assessmentportal.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    @Query("{ '$or': [ { 'recipientId': ?0 }, { 'recipientRole': ?1 }, { 'recipientRole': 'all' } ] }")
    List<Notification> findForRecipient(String recipientId, String recipientRole);

    @Query(value = "{ '$and': [ { '$or': [ { 'recipientId': ?0 }, { 'recipientRole': ?1 }, { 'recipientRole': 'all' } ] }, { 'read': false } ] }", count = true)
    long countUnreadForRecipient(String recipientId, String recipientRole);

    List<Notification> findByRecipientId(String recipientId);

    List<Notification> findByRecipientRole(String recipientRole);
}
