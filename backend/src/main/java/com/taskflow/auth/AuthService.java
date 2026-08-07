package com.taskflow.auth;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new ConflictException("Email already registered");
        if (userRepository.existsByUsername(request.getUsername()))
            throw new ConflictException("Username already taken");

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.MEMBER)
                .build();
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(jwtUtil.generateToken(user.getEmail()))
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid email or password");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.builder()
                .accessToken(jwtUtil.generateToken(user.getEmail()))
                .user(UserResponse.from(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken))
            throw new UnauthorizedException("Invalid or expired refresh token");
        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.builder()
                .accessToken(jwtUtil.generateToken(email))
                .user(UserResponse.from(user))
                .build();
    }

    public String refreshTokenFor(String email) { return jwtUtil.generateRefreshToken(email); }
}

