package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private boolean archived;
    private UserResponse owner;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MemberResponse> members;
    private List<BoardColumnResponse> columns;
    private int taskCount;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .archived(project.isArchived())
                .owner(UserResponse.from(project.getOwner()))
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .members(project.getMembers().stream().map(MemberResponse::from).collect(Collectors.toList()))
                .columns(project.getColumns().stream().map(BoardColumnResponse::from).collect(Collectors.toList()))
                .taskCount(project.getTasks().size())
                .build();
    }
}

