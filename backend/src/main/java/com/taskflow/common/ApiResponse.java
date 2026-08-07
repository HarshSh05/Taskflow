package com.taskflow.common;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data);
    }
    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }
    public static ApiResponse<?> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}

