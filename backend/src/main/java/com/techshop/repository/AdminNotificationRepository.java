package com.techshop.repository;

import com.techshop.entity.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {
    List<AdminNotification> findTop50ByOrderByCreatedAtDesc();

    long countByIsReadFalse();

    @Modifying
    @Query("UPDATE AdminNotification n SET n.isRead = true WHERE n.isRead = false")
    int markAllAsRead();
}
