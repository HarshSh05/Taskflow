package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoveTaskRequest {
    @NotNull
    private Long columnId;
    private Integer position;
    @NotNull
    private Long version;
}

