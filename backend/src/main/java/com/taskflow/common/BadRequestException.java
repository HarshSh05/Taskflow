package com.taskflow.common;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;

public class BadRequestException extends RuntimeException {
    public BadRequestException(String msg) { super(msg); }
}

