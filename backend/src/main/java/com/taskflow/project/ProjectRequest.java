package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank @Size(max = 100)
    private String name;
    private String description;
}

