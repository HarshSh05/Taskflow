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
public class BoardColumnRequest {
    @NotBlank @Size(max = 80)
    private String name;
    @NotNull @Min(1)
    private Integer position;
}

