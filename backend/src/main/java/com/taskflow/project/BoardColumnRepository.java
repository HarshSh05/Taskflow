package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BoardColumnRepository extends JpaRepository<BoardColumn, Long> {
    List<BoardColumn> findByProjectIdOrderByPositionAsc(Long projectId);
    Optional<BoardColumn> findByIdAndProjectId(Long id, Long projectId);
}

