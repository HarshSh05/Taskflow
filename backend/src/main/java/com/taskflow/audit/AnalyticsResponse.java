package com.taskflow.audit;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AnalyticsResponse {
    private long totalTasks;
    private long todoTasks;
    private long inProgressTasks;
    private long reviewTasks;
    private long doneTasks;
    private long overdueTasks;
    private int totalMembers;
    private double completionRate;
    private Map<String, Long> byColumn;
}

