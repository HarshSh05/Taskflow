package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.*;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import java.security.Principal;
import java.util.Map;

@Configuration @EnableWebSocketMessageBroker @RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final StompAuthChannelInterceptor stompAuthChannelInterceptor;
    @Override public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); config.setApplicationDestinationPrefixes("/app");
    }
    @Override public void configureClientInboundChannel(ChannelRegistration registration) { registration.interceptors(stompAuthChannelInterceptor); }
    @Override public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").addInterceptors(jwtHandshakeInterceptor).setHandshakeHandler(new DefaultHandshakeHandler() {
            @Override protected Principal determineUser(org.springframework.http.server.ServerHttpRequest request,
                    org.springframework.web.socket.WebSocketHandler handler, Map<String, Object> attributes) {
                String name = (String) attributes.get("principalName"); return () -> name;
            }
        }).setAllowedOriginPatterns("*").withSockJS();
    }
}

