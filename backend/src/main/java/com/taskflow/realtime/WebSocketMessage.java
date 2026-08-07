package com.taskflow.realtime;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class WebSocketMessage {
    private String type;
    private Long projectId;
    private Object payload;
    private String actor;
}

