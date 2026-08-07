package com.taskflow.common;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;

public class ConflictException extends RuntimeException {
    private final Long currentVersion;
    public ConflictException(String msg) { super(msg); this.currentVersion = null; }
    public ConflictException(String msg, Long currentVersion) { super(msg); this.currentVersion = currentVersion; }
    public Long getCurrentVersion() { return currentVersion; }
}

