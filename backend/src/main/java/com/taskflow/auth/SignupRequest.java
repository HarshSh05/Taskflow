package com.taskflow.auth;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank @Size(min = 3, max = 50)
    private String username;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
}

