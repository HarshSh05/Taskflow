package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final BoardColumnRepository columnRepository;
    private final UserRepository userRepository;
    private final ActivityLogService logService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsForUser(Long userId) {
        return projectRepository.findAllByUserId(userId).stream().map(ProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long projectId, Long userId) {
        Project project = findProjectOrThrow(projectId);
        assertProjectRole(project, userId, User.Role.VIEWER);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, Long ownerId) {
        User owner = findUser(ownerId);
        if (owner.getRole() == User.Role.VIEWER) throw new ForbiddenException("Viewer accounts cannot create projects");

        Project project = projectRepository.save(Project.builder().name(request.getName())
                .description(request.getDescription()).owner(owner).build());
     
        memberRepository.save(ProjectMember.builder().project(project).user(owner).role(User.Role.MANAGER).build());

        List<BoardColumn> columns = List.of("To Do", "In Progress", "Review", "Done").stream()
                .map(name -> BoardColumn.builder().project(project).name(name)
                        .position(List.of("To Do", "In Progress", "Review", "Done").indexOf(name) + 1).build()).toList();

        columnRepository.saveAll(columns);

        project.getColumns().addAll(columns);
        logService.log(project, owner, "PROJECT_CREATED", "Project", project.getId(), null,
                Map.of("name", project.getName(), "archived", false));
       
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request, Long userId) {
        Project project = findProjectOrThrow(projectId);
        assertProjectRole(project, userId, User.Role.MANAGER);
        Map<String, Object> oldValue = Map.of("name", project.getName(), "description", String.valueOf(project.getDescription()));
        project.setName(request.getName()); project.setDescription(request.getDescription());
        logService.log(project, findUser(userId), "PROJECT_UPDATED", "Project", projectId, oldValue,
                Map.of("name", project.getName(), "description", String.valueOf(project.getDescription())));
        return ProjectResponse.from(project);
    }

    @Transactional
    public void archiveProject(Long projectId, boolean archived, Long userId) {
        Project project = findProjectOrThrow(projectId);
        User user = findUser(userId);
        if (user.getRole() != User.Role.ADMIN && !project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the project owner can archive the project");
        }
        project.setArchived(archived);
        logService.log(project, findUser(userId), archived ? "PROJECT_ARCHIVED" : "PROJECT_RESTORED", "Project", projectId,
                Map.of("archived", !archived), Map.of("archived", archived));
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = findProjectOrThrow(projectId);
        User user = findUser(userId);
        if (user.getRole() != User.Role.ADMIN && !project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Only the project owner can delete the project");
        }
        project.getColumns().forEach(column -> column.getTasks().clear());
        project.getColumns().clear();
        project.getTasks().clear();
        // Do NOT call activityLogRepository.deleteByProject() here: the database's
        // append-only trigger rejects direct deletes against activity_logs. The
        // projects -> activity_logs foreign key (ON DELETE CASCADE) removes the
        // audit rows automatically once the project row itself is deleted below.
        projectRepository.delete(project);
    }

    @Transactional
    public MemberResponse addMember(Long projectId, AddMemberRequest request, Long requesterId) {
        Project project = findProjectOrThrow(projectId);
        assertProjectRole(project, requesterId, User.Role.MANAGER);
        if (request.getRole() == User.Role.ADMIN) throw new BadRequestException("ADMIN is a system role, not a project role");
        User newMember = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getEmail()));
        if (memberRepository.existsByProjectIdAndUserId(projectId, newMember.getId())) throw new ConflictException("User is already a member");
        ProjectMember member = memberRepository.save(ProjectMember.builder().project(project).user(newMember)
                .role(request.getRole()).build());
        notificationService.createNotification(newMember, "You have been added to project: " + project.getName(),
                Notification.Type.MEMBER_ADDED, project.getId());
        logService.log(project, findUser(requesterId), "MEMBER_ADDED", "ProjectMember", member.getId(), null,
                Map.of("userId", newMember.getId(), "role", member.getRole().name()));
        return MemberResponse.from(member);
    }

    @Transactional
    public void removeMember(Long projectId, Long targetUserId, Long requesterId) {
        Project project = findProjectOrThrow(projectId);
        assertProjectRole(project, requesterId, User.Role.MANAGER);
        if (project.getOwner().getId().equals(targetUserId)) throw new BadRequestException("Cannot remove the project owner");
        memberRepository.deleteByProjectIdAndUserId(projectId, targetUserId);
        logService.log(project, findUser(requesterId), "MEMBER_REMOVED", "ProjectMember", targetUserId,
                Map.of("userId", targetUserId), null);
    }

    @Transactional
    public BoardColumnResponse createColumn(Long projectId, BoardColumnRequest request, Long userId) {
        Project project = findProjectOrThrow(projectId); assertProjectRole(project, userId, User.Role.MANAGER);
        BoardColumn column = columnRepository.save(BoardColumn.builder().project(project).name(request.getName())
                .position(request.getPosition()).build());
        logService.log(project, findUser(userId), "COLUMN_CREATED", "BoardColumn", column.getId(), null,
                Map.of("name", column.getName(), "position", column.getPosition()));
        return BoardColumnResponse.from(column);
    }

    @Transactional
    public BoardColumnResponse updateColumn(Long projectId, Long columnId, BoardColumnRequest request, Long userId) {
        Project project = findProjectOrThrow(projectId); assertProjectRole(project, userId, User.Role.MANAGER);
        BoardColumn column = findColumn(projectId, columnId);
        Map<String, Object> oldValue = Map.of("name", column.getName(), "position", column.getPosition());
        column.setName(request.getName()); column.setPosition(request.getPosition());
        logService.log(project, findUser(userId), "COLUMN_UPDATED", "BoardColumn", columnId, oldValue,
                Map.of("name", column.getName(), "position", column.getPosition()));
        return BoardColumnResponse.from(column);
    }

    @Transactional
    public void deleteColumn(Long projectId, Long columnId, Long userId) {
        Project project = findProjectOrThrow(projectId); assertProjectRole(project, userId, User.Role.MANAGER);
        BoardColumn column = findColumn(projectId, columnId);
        if (columnRepository.findByProjectIdOrderByPositionAsc(projectId).size() <= 1)
            throw new BadRequestException("A board must retain at least one column");
        if (!column.getTasks().isEmpty())
            throw new BadRequestException("Move or delete all tasks out of this column first");
        columnRepository.delete(column);
        logService.log(project, findUser(userId), "COLUMN_DELETED", "BoardColumn", columnId,
                Map.of("name", column.getName(), "position", column.getPosition()), null);
    }

    public void assertProjectRole(Project project, Long userId, User.Role minimumRole) {
        User user = findUser(userId);
        if (user.getRole() == User.Role.ADMIN) return;
        User.Role effective = project.getOwner().getId().equals(userId) ? User.Role.MANAGER : memberRepository
                .findByProjectIdAndUserId(project.getId(), userId).map(ProjectMember::getRole)
                .orElseThrow(() -> new ForbiddenException("Access denied to this project"));
        if (rank(effective) < rank(minimumRole)) throw new ForbiddenException(minimumRole + " access required");
    }

    public Project findProjectOrThrow(Long id) { return projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found")); }
    private User findUser(Long id) { return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private BoardColumn findColumn(Long projectId, Long columnId) { return columnRepository.findByIdAndProjectId(columnId, projectId).orElseThrow(() -> new ResourceNotFoundException("Board column not found")); }
    private int rank(User.Role role) { return switch (role) { case ADMIN -> 4; case MANAGER -> 3; case MEMBER -> 2; case VIEWER -> 1; }; }
}

