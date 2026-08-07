package com.taskflow.common;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String msg) { super(msg); }
}

