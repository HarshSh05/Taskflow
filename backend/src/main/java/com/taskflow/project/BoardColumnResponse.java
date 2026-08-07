package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BoardColumnResponse {
    private Long id;
    private String name;
    private Integer position;

    public static BoardColumnResponse from(BoardColumn column) {
        return BoardColumnResponse.builder().id(column.getId()).name(column.getName())
                .position(column.getPosition()).build();
    }
}

