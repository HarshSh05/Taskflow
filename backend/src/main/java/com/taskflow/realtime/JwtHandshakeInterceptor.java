package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import java.net.URI;
import java.util.Map;

/** Rejects unauthenticated SockJS/WebSocket handshakes before a STOMP session is created. */
@Component @RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler, Map<String, Object> attributes) {
        String token = extractToken(request);
        if (!StringUtils.hasText(token) || !jwtUtil.validateToken(token)) return false;
        UserDetails user = userDetailsService.loadUserByUsername(jwtUtil.extractEmail(token));
        attributes.put("principalName", user.getUsername());
        return true;
    }
    @Override public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler handler, Exception exception) { }
    private String extractToken(ServerHttpRequest request) {
        String header = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) return header.substring(7);
        URI uri = request.getURI(); String query = uri.getQuery();
        if (query == null) return null;
        for (String pair : query.split("&")) if (pair.startsWith("token=")) return pair.substring(6);
        return null;
    }
}

