package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.messaging.*;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/** Also validates STOMP CONNECT headers, protecting clients that do not use the query-token handshake. */
@Component @RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand()) && accessor.getUser() == null) {
            String header = accessor.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ") || !jwtUtil.validateToken(header.substring(7)))
                throw new IllegalArgumentException("A valid JWT is required for WebSocket connections");
            UserDetails user = userDetailsService.loadUserByUsername(jwtUtil.extractEmail(header.substring(7)));
            accessor.setUser(new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        }
        return message;
    }
}

