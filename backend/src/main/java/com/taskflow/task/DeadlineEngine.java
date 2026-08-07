package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

/** Checks overdue and next-24-hour tasks every 15 minutes and sends one in-app alert per task. */
@Service @RequiredArgsConstructor @Slf4j
public class DeadlineEngine {
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 900000, initialDelay = 60000)
    @Transactional
    public void notifyUpcomingAndOverdueTasks() {
        for (Task task : taskRepository.findByDeadlineLessThanEqualAndColumnNameNotIgnoreCase(LocalDate.now().plusDays(1), "Done")) {
            if (task.getAssignee() == null || notificationRepository.existsByUserIdAndTypeAndReferenceId(
                    task.getAssignee().getId(), Notification.Type.DEADLINE_ALERT, task.getId())) continue;
            String status = task.getDeadline().isBefore(LocalDate.now()) ? "is overdue" : "is due within 24 hours";
            notificationService.createNotification(task.getAssignee(), "Task \"" + task.getTitle() + "\" " + status,
                    Notification.Type.DEADLINE_ALERT, task.getId());
        }
    }
}

