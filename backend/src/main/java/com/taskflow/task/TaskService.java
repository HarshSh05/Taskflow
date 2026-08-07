package com.taskflow.task;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final BoardColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ActivityLogService logService;
    private final NotificationService notificationService;
    private final RealtimeEventPublisher realtimePublisher;

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksForProject(Long projectId, Long userId) {
        Project project = findProject(projectId); assertRole(project, userId, User.Role.VIEWER);
        return taskRepository.findByProjectIdOrderByColumnPositionAscPositionAsc(projectId).stream().map(TaskResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long taskId, Long userId) {
        Task task = findTask(taskId); assertRole(task.getProject(), userId, User.Role.VIEWER); return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request, Long userId) {
        Project project = findProject(projectId); assertWritable(project, userId); assertActive(project);
        User creator = findUser(userId); BoardColumn column = findColumn(projectId, request.getColumnId());
        Task task = Task.builder().title(request.getTitle()).description(request.getDescription()).priority(request.getPriority())
                .deadline(request.getDeadline()).column(column).position(request.getPosition() == null ? 0 : request.getPosition())
                .project(project).createdBy(creator).build();
        assignIfValid(task, request.getAssigneeId(), project, false);
        task = taskRepository.saveAndFlush(task);
        TaskResponse response = TaskResponse.from(task);
        logService.log(project, creator, "TASK_CREATED", "Task", task.getId(), null, taskSnapshot(task));
        realtimePublisher.broadcast(projectId, "TASK_CREATED", response, creator.getUsername());
        if (task.getAssignee() != null) notificationService.createNotification(task.getAssignee(),
                "You have been assigned task: " + task.getTitle(), Notification.Type.TASK_ASSIGNED, task.getId());
        return response;
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, Long userId) {
        Task task = findTask(taskId); assertWritable(task.getProject(), userId); assertActive(task.getProject());
        assertTaskEditor(task, userId); assertVersion(task, request.getVersion());
        Map<String, Object> oldValue = taskSnapshot(task);
        task.setTitle(request.getTitle()); task.setDescription(request.getDescription()); task.setPriority(request.getPriority()); task.setDeadline(request.getDeadline());
        task.setColumn(findColumn(task.getProject().getId(), request.getColumnId()));
        if (request.getPosition() != null) task.setPosition(request.getPosition());
        assignIfValid(task, request.getAssigneeId(), task.getProject(), true);
        task = saveWithConflictHandling(task);
        User actor = findUser(userId); TaskResponse response = TaskResponse.from(task);
        logService.log(task.getProject(), actor, "TASK_UPDATED", "Task", taskId, oldValue, taskSnapshot(task));
        realtimePublisher.broadcast(task.getProject().getId(), "TASK_UPDATED", response, actor.getUsername());
        return response;
    }

    @Transactional
    public TaskResponse moveTask(Long taskId, MoveTaskRequest request, Long userId) {
        Task task = findTask(taskId); assertWritable(task.getProject(), userId); assertActive(task.getProject());
        assertVersion(task, request.getVersion());
        Map<String, Object> oldValue = taskSnapshot(task);
        task.setColumn(findColumn(task.getProject().getId(), request.getColumnId()));
        if (request.getPosition() != null) task.setPosition(request.getPosition());
        task = saveWithConflictHandling(task);
        User actor = findUser(userId); TaskResponse response = TaskResponse.from(task);
        logService.log(task.getProject(), actor, "TASK_MOVED", "Task", taskId, oldValue, taskSnapshot(task));
        realtimePublisher.broadcast(task.getProject().getId(), "TASK_MOVED", response, actor.getUsername());
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(userId)) notificationService.createNotification(task.getAssignee(),
                "Task \"" + task.getTitle() + "\" moved to " + task.getColumn().getName(), Notification.Type.STATUS_CHANGED, task.getId());
        return response;
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = findTask(taskId); assertRole(task.getProject(), userId, User.Role.MANAGER); assertActive(task.getProject());
        Long projectId = task.getProject().getId(); User actor = findUser(userId); Map<String, Object> oldValue = taskSnapshot(task);
        taskRepository.delete(task); taskRepository.flush();
        logService.log(task.getProject(), actor, "TASK_DELETED", "Task", taskId, oldValue, null);
        realtimePublisher.broadcast(projectId, "TASK_DELETED", Map.of("taskId", taskId, "projectId", projectId), actor.getUsername());
    }

    private Task saveWithConflictHandling(Task task) {
        try { return taskRepository.saveAndFlush(task); }
        catch (ObjectOptimisticLockingFailureException ex) {
            Long currentVersion = taskRepository.findById(task.getId()).map(Task::getVersion).orElse(null);
            throw new ConflictException("This task was updated by another user. Reload the latest version and try again.", currentVersion);
        }
    }
    private void assertVersion(Task task, Long version) {
        if (version == null || !version.equals(task.getVersion()))
            throw new ConflictException("This task was updated by another user. Reload the latest version and try again.", task.getVersion());
    }
    private void assertTaskEditor(Task task, Long userId) {
        User user = findUser(userId);
        boolean isManager = user.getRole() == User.Role.ADMIN || task.getProject().getOwner().getId().equals(userId) || memberRepository
                .findByProjectIdAndUserId(task.getProject().getId(), userId).map(pm -> pm.getRole() == User.Role.MANAGER).orElse(false);
        boolean isCreatorOrAssignee = task.getCreatedBy().getId().equals(userId) || (task.getAssignee() != null && task.getAssignee().getId().equals(userId));
        if (!isManager && !isCreatorOrAssignee) throw new ForbiddenException("Only the creator, assignee, Manager, or Admin may edit this task");
    }
    private void assignIfValid(Task task, Long assigneeId, Project project, boolean notify) {
        if (assigneeId == null) { task.setAssignee(null); return; }
        if (!memberRepository.existsByProjectIdAndUserId(project.getId(), assigneeId) && !project.getOwner().getId().equals(assigneeId))
            throw new BadRequestException("Assignee must be a project member");
        User assignee = findUser(assigneeId); boolean changed = task.getAssignee() == null || !task.getAssignee().getId().equals(assigneeId);
        task.setAssignee(assignee);
        if (notify && changed) notificationService.createNotification(assignee, "You have been assigned task: " + task.getTitle(), Notification.Type.TASK_ASSIGNED, task.getId());
    }
    private Map<String, Object> taskSnapshot(Task task) {
        return Map.of("title", task.getTitle(), "description", task.getDescription() == null ? "" : task.getDescription(),
                "columnId", task.getColumn().getId(), "columnName", task.getColumn().getName(), "position", task.getPosition(),
                "priority", task.getPriority().name(), "assigneeId", task.getAssignee() == null ? 0L : task.getAssignee().getId(), "version", task.getVersion() == null ? 0L : task.getVersion());
    }
    private void assertActive(Project project) { if (project.isArchived()) throw new ForbiddenException("Archived projects are read-only"); }
    private void assertWritable(Project project, Long userId) { assertRole(project, userId, User.Role.MEMBER); }
    private void assertRole(Project project, Long userId, User.Role required) {
        User user = findUser(userId); if (user.getRole() == User.Role.ADMIN) return;
        User.Role role = project.getOwner().getId().equals(userId) ? User.Role.MANAGER : memberRepository.findByProjectIdAndUserId(project.getId(), userId)
                .map(ProjectMember::getRole).orElseThrow(() -> new ForbiddenException("Access denied to this project"));
        int rank = switch (role) { case ADMIN -> 4; case MANAGER -> 3; case MEMBER -> 2; case VIEWER -> 1; };
        int requiredRank = switch (required) { case ADMIN -> 4; case MANAGER -> 3; case MEMBER -> 2; case VIEWER -> 1; };
        if (rank < requiredRank) throw new ForbiddenException(required + " access required");
    }
    private Project findProject(Long id) { return projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found")); }
    private Task findTask(Long id) { return taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found")); }
    private User findUser(Long id) { return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private BoardColumn findColumn(Long projectId, Long id) { return columnRepository.findByIdAndProjectId(id, projectId).orElseThrow(() -> new ResourceNotFoundException("Board column not found")); }
}

