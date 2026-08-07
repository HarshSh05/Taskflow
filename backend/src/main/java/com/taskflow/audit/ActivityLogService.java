package com.taskflow.audit;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ActivityLogService {
    private final ActivityLogRepository activityLogRepository;

    /** Audit records are append-only: this service exposes no update or delete operation. */
    @Transactional
    public void log(Project project, User actor, String action, String entityType, Long entityId,
                    Map<String, Object> oldValue, Map<String, Object> newValue) {
        activityLogRepository.save(ActivityLog.builder().project(project).user(actor).action(action)
                .entityType(entityType).entityId(entityId).oldValue(oldValue).newValue(newValue).build());
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getActivityForProject(Long projectId, int page, int size) {
        return activityLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId, PageRequest.of(page, size))
                .stream().map(ActivityLogResponse::from).toList();
    }
}

