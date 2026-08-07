package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TaskRequest {
    @NotBlank @Size(max = 200)
    private String title;
    private String description;
    private com.taskflow.task.Task.Priority priority = com.taskflow.task.Task.Priority.MEDIUM;
    private LocalDate deadline;
    private Long assigneeId;
    @NotNull(message = "A board column is required")
    private Long columnId;
    private Integer position;
    private Long version;
}

