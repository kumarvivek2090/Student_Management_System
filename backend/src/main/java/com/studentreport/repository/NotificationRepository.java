package com.studentreport.repository;

import com.studentreport.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);
    long countByUserEmailAndIsReadFalse(String email);
}
