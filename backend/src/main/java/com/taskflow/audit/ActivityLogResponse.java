package com.taskflow.audit;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private Map<String, Object> oldValue;
    private Map<String, Object> newValue;
    private LocalDateTime createdAt;
    private String username;

    public static ActivityLogResponse from(ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .createdAt(log.getCreatedAt())
                .username(log.getUser().getUsername())
                .build();
    }
}

