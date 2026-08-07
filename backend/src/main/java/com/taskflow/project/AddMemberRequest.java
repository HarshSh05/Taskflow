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
public class AddMemberRequest {
    @NotBlank @Email
    private String email;
    private User.Role role = User.Role.MEMBER;
}

