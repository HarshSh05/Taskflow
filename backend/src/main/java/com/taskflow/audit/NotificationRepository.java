package com.taskflow.audit;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadFalse(Long userId);
    boolean existsByUserIdAndTypeAndReferenceId(Long userId, Notification.Type type, Long referenceId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId")
    void markAllReadForUser(@Param("userId") Long userId);
}

