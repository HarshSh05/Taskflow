package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class RealtimeEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectProvider<RedisRealtimePublisher> redisPublisher;

    public void broadcast(Long projectId, String type, Object payload, String actor) {
        WebSocketMessage event = WebSocketMessage.builder().type(type).projectId(projectId).payload(payload).actor(actor).build();
        RedisRealtimePublisher redis = redisPublisher.getIfAvailable();
        if (redis != null) redis.publish(event); else broadcastLocal(event);
    }
    public void broadcastLocal(WebSocketMessage event) { messagingTemplate.convertAndSend("/topic/project/" + event.getProjectId(), event); }
}

