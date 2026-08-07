package com.taskflow.auth;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Minimal admin API for the documented role-management feature. */
@RestController @RequestMapping("/api/v1/admin") @RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    @PatchMapping("/users/{id}/role") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setRole(request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("Role updated", UserResponse.from(userRepository.save(user))));
    }
}

