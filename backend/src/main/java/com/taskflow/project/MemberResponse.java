package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class MemberResponse {
    private Long userId;
    private String username;
    private String email;
    private User.Role role;
    private LocalDateTime joinedAt;

    public static MemberResponse from(ProjectMember pm) {
        return MemberResponse.builder()
                .userId(pm.getUser().getId())
                .username(pm.getUser().getUsername())
                .email(pm.getUser().getEmail())
                .role(pm.getRole())
                .joinedAt(pm.getJoinedAt())
                .build();
    }
}

