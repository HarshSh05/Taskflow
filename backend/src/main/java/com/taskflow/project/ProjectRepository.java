package com.taskflow.project;

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

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members pm WHERE p.owner.id = :userId OR pm.user.id = :userId ORDER BY p.updatedAt DESC")
    List<Project> findAllByUserId(@Param("userId") Long userId);
}

