package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.*;

@Configuration
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
public class RedisRealtimeConfig {
    @Bean
    RedisMessageListenerContainer taskflowRedisListener(RedisConnectionFactory connectionFactory, ObjectMapper mapper,
                                                        RealtimeEventPublisher publisher) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener((message, pattern) -> {
            try { publisher.broadcastLocal(mapper.readValue(message.getBody(), WebSocketMessage.class)); }
            catch (Exception ignored) { }
        }, new PatternTopic("taskflow:board-events"));
        return container;
    }
}

