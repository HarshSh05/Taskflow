package com.taskflow.audit;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service @RequiredArgsConstructor
public class AnalyticsService {
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository memberRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getProjectAnalytics(Long projectId) {
        List<Object[]> counts = taskRepository.countByColumnForProject(projectId);
        Map<String, Long> byColumn = new HashMap<>();
        for (Object[] row : counts) byColumn.put((String) row[0], (Long) row[1]);
        long todo = byColumn.getOrDefault("To Do", 0L);
        long inProgress = byColumn.getOrDefault("In Progress", 0L);
        long review = byColumn.getOrDefault("Review", 0L);
        long done = byColumn.getOrDefault("Done", 0L);
        long total = byColumn.values().stream().mapToLong(Long::longValue).sum();
        long overdue = taskRepository.findByDeadlineLessThanEqualAndColumnNameNotIgnoreCase(LocalDate.now().minusDays(1), "Done").stream().count();
        double rate = total == 0 ? 0 : Math.round((done * 1000.0 / total)) / 10.0;
        return AnalyticsResponse.builder().totalTasks(total).todoTasks(todo).inProgressTasks(inProgress).reviewTasks(review)
                .doneTasks(done).overdueTasks(overdue).totalMembers(memberRepository.findByProjectId(projectId).size())
                .completionRate(rate).byColumn(byColumn).build();
    }
}

