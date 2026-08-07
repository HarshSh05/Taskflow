package com.taskflow.audit;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping({"/api/v1/notifications", "/api/v1/users/me/notifications"})
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserResolverService userResolverService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUserNotifications(userResolverService.getUserId(ud))));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<?>> markRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        notificationService.markAsRead(id, userResolverService.getUserId(ud));
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", null));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.countUnread(userResolverService.getUserId(ud))));
    }
}

