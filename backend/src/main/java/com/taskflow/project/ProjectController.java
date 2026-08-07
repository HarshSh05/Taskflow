package com.taskflow.project;

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
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final AnalyticsService analyticsService;
    private final ActivityLogService activityLogService;
    private final UserResolverService userResolverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectsForUser(userResolverService.getUserId(ud))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @Valid @RequestBody ProjectRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created", projectService.createProject(request, userResolverService.getUserId(ud))));
    }

    @GetMapping({"/{id}", "/{id}/board"})
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectById(id, userResolverService.getUserId(ud))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long id, @Valid @RequestBody ProjectRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.updateProject(id, request, userResolverService.getUserId(ud))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteProject(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        projectService.deleteProject(id, userResolverService.getUserId(ud));
        return ResponseEntity.ok(ApiResponse.ok("Project deleted", null));
    }

    @PatchMapping("/{id}/archived")
    public ResponseEntity<ApiResponse<?>> archiveProject(@PathVariable Long id, @RequestParam boolean archived,
            @AuthenticationPrincipal UserDetails ud) {
        projectService.archiveProject(id, archived, userResolverService.getUserId(ud));
        return ResponseEntity.ok(ApiResponse.ok(archived ? "Project archived" : "Project restored", null));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<MemberResponse>> addMember(
            @PathVariable Long id, @Valid @RequestBody AddMemberRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(projectService.addMember(id, request, userResolverService.getUserId(ud))));
    }

    @DeleteMapping("/{id}/members/{memberId}")
    public ResponseEntity<ApiResponse<?>> removeMember(
            @PathVariable Long id, @PathVariable Long memberId, @AuthenticationPrincipal UserDetails ud) {
        projectService.removeMember(id, memberId, userResolverService.getUserId(ud));
        return ResponseEntity.ok(ApiResponse.ok("Member removed", null));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        projectService.assertProjectRole(projectService.findProjectOrThrow(id), userResolverService.getUserId(ud), com.taskflow.auth.User.Role.MANAGER);
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getProjectAnalytics(id)));
    }

    @GetMapping({"/{id}/activity", "/{id}/audit"})
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivity(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size, @AuthenticationPrincipal UserDetails ud) {
        projectService.assertProjectRole(projectService.findProjectOrThrow(id), userResolverService.getUserId(ud), com.taskflow.auth.User.Role.MANAGER);
        return ResponseEntity.ok(ApiResponse.ok(activityLogService.getActivityForProject(id, page, size)));
    }

    @PostMapping("/{id}/columns")
    public ResponseEntity<ApiResponse<BoardColumnResponse>> createColumn(@PathVariable Long id, @Valid @RequestBody BoardColumnRequest request,
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(projectService.createColumn(id, request, userResolverService.getUserId(ud))));
    }

    @PatchMapping("/{id}/columns/{columnId}")
    public ResponseEntity<ApiResponse<BoardColumnResponse>> updateColumn(@PathVariable Long id, @PathVariable Long columnId,
            @Valid @RequestBody BoardColumnRequest request, @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(projectService.updateColumn(id, columnId, request, userResolverService.getUserId(ud))));
    }

    @DeleteMapping("/{id}/columns/{columnId}")
    public ResponseEntity<ApiResponse<?>> deleteColumn(@PathVariable Long id, @PathVariable Long columnId, @AuthenticationPrincipal UserDetails ud) {
        projectService.deleteColumn(id, columnId, userResolverService.getUserId(ud)); return ResponseEntity.ok(ApiResponse.ok("Column deleted", null));
    }
}

