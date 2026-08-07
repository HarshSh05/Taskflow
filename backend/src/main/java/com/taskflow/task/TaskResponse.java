package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Task.Priority priority;
    private LocalDate deadline;
    private Long projectId;
    private Long columnId;
    private String columnName;
    private Integer position;
    private Long version;
    private UserResponse assignee;
    private UserResponse createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse from(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .deadline(task.getDeadline())
                .projectId(task.getProject().getId())
                .columnId(task.getColumn().getId())
                .columnName(task.getColumn().getName())
                .position(task.getPosition())
                .version(task.getVersion())
                .assignee(task.getAssignee() != null ? UserResponse.from(task.getAssignee()) : null)
                .createdBy(UserResponse.from(task.getCreatedBy()))
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

