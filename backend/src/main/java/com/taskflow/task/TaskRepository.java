package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDate;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdOrderByColumnPositionAscPositionAsc(Long projectId);
    List<Task> findByDeadlineLessThanEqualAndColumnNameNotIgnoreCase(LocalDate deadline, String columnName);

    @Query("SELECT t.column.name, COUNT(t) FROM Task t WHERE t.project.id = :projectId GROUP BY t.column.name")
    List<Object[]> countByColumnForProject(@Param("projectId") Long projectId);
}

