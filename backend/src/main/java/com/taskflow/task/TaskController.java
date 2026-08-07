package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserResolverService userResolverService;

    @GetMapping("/api/v1/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksForProject(
            @PathVariable Long projectId, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTasksForProject(projectId, userResolverService.getUserId(ud))));
    }

    @PostMapping("/api/v1/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long projectId, @Valid @RequestBody TaskRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created", taskService.createTask(projectId, request, userResolverService.getUserId(ud))));
    }

    @GetMapping("/api/v1/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTask(id, userResolverService.getUserId(ud))));
    }

    @PatchMapping("/api/v1/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id, @Valid @RequestBody TaskRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.updateTask(id, request, userResolverService.getUserId(ud))));
    }

    @PatchMapping("/api/v1/tasks/{id}/move")
    public ResponseEntity<ApiResponse<TaskResponse>> moveTask(
            @PathVariable Long id, @Valid @RequestBody MoveTaskRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.moveTask(id, request, userResolverService.getUserId(ud))));
    }

    @DeleteMapping("/api/v1/tasks/{id}")
    public ResponseEntity<ApiResponse<?>> deleteTask(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        taskService.deleteTask(id, userResolverService.getUserId(ud));
        return ResponseEntity.ok(ApiResponse.ok("Task deleted", null));
    }
}

