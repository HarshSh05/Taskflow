package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
public class RedisRealtimePublisher {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    public void publish(WebSocketMessage event) {
        try { redisTemplate.convertAndSend("taskflow:board-events", objectMapper.writeValueAsString(event)); }
        catch (Exception e) { throw new IllegalStateException("Could not publish the real-time event to Redis", e); }
    }
}

