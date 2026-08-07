package com.taskflow.auth;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping({"/register", "/signup"})
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.signup(request);
        setRefreshCookie(response, authService.refreshTokenFor(request.getEmail()));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Account created", auth));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        setRefreshCookie(response, authService.refreshTokenFor(request.getEmail()));
        return ResponseEntity.ok(ApiResponse.ok(auth));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(HttpServletRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refresh(readRefreshCookie(request))));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", ""); cookie.setHttpOnly(true); cookie.setSecure(false); cookie.setPath("/api/v1/auth"); cookie.setMaxAge(0);
        response.addCookie(cookie); return ResponseEntity.ok(ApiResponse.ok("Logged out", null));
    }

    private String readRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) if ("refreshToken".equals(cookie.getName())) return cookie.getValue();
        return null;
    }
    private void setRefreshCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token).httpOnly(true).secure(false)
                .sameSite("Strict").path("/api/v1/auth").maxAge(7 * 24 * 60 * 60).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

