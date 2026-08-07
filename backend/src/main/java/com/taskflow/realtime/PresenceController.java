package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

/** Announces authenticated board viewers so clients can show a lightweight presence indicator. */
@RequiredArgsConstructor
@org.springframework.stereotype.Component
public class PresenceController {
    private final SimpMessagingTemplate messagingTemplate;
    @EventListener
    public void onSubscribe(SessionSubscribeEvent event) {
        String destination = (String) event.getMessage().getHeaders().get("simpDestination");
        if (destination == null || !destination.startsWith("/topic/project/")) return;
        try {
            Long projectId = Long.valueOf(destination.substring(destination.lastIndexOf('/') + 1));
            String actor = event.getUser() == null ? "A collaborator" : event.getUser().getName();
            messagingTemplate.convertAndSend(destination, WebSocketMessage.builder().type("USER_JOINED")
                    .projectId(projectId).actor(actor).build());
        } catch (NumberFormatException ignored) { }
    }
}

