# TaskFlow — Distributed Task Management System

Full-stack Kanban app with real-time WebSocket collaboration.
Spring Boot + React + PostgreSQL + STOMP WebSocket + optional Redis Pub/Sub.

================================================================
QUICK START — STEP BY STEP
================================================================

REQUIREMENTS (install these first):
  - Java 17+          → https://adoptium.net  (download LTS)
  - Node.js 18+       → https://nodejs.org    (download LTS)
  - PostgreSQL 15+    → https://www.postgresql.org/download/
  - Redis 7+ (optional; needed only for multi-node WebSocket broadcasting)

You do NOT need to install Maven separately.
The project includes mvnw.cmd (Windows) which downloads Maven automatically.

================================================================
STEP 1 — PostgreSQL Setup
================================================================

Open Command Prompt and run:

    psql -U postgres

Then paste this (press Enter after each line):

    CREATE USER taskflow WITH PASSWORD 'taskflow';
    CREATE DATABASE taskflow_db OWNER taskflow;
    \q

Then load the sample data (run from the taskflow-complete folder):

    psql -U taskflow -d taskflow_db -f database/schema.sql

Password: taskflow
No output = success.

================================================================
STEP 2 — Start Backend (Terminal 1)
================================================================

    cd taskflow-complete\backend

Windows:
    mvnw.cmd spring-boot:run

Mac/Linux:
    chmod +x mvnw
    ./mvnw spring-boot:run

FIRST RUN: This downloads Maven and all dependencies (~100MB).
Takes 3-5 minutes. Subsequent runs take 10 seconds.

Wait for:  "Started TaskFlowApplication in X seconds"
Backend runs at: http://localhost:8080

================================================================
STEP 3 — Start Frontend (Terminal 2 — keep Terminal 1 open)
================================================================

    cd taskflow-complete\frontend

    copy .env.example .env        (Windows)
    cp .env.example .env          (Mac/Linux)

    npm install
    npm start

Browser opens automatically at: http://localhost:3000

================================================================
STEP 4 — Login
================================================================

    Email:    admin@taskflow.com
    Password: admin123

================================================================
TROUBLESHOOTING
================================================================

Problem: "mvnw.cmd is not recognized"
Fix: You must be inside the backend\ folder when running it.
     cd taskflow-complete\backend
     then run: mvnw.cmd spring-boot:run

Problem: "psql is not recognized"
Fix: Add PostgreSQL's bin folder to PATH, then restart the terminal.

Problem: Port 8080 already in use
Fix: netstat -ano | findstr :8080
     taskkill /PID <number> /F

Problem: npm install ERESOLVE error
Fix: npm install --legacy-peer-deps

Problem: Blank React page
Fix: Check that .env file exists in frontend\ folder.
     Stop npm start, check .env, then npm start again.

Problem: "Could not connect to WebSocket"
Fix: Make sure backend is running first (Terminal 1).
     The frontend needs the backend on port 8080.

================================================================
PROJECT STRUCTURE
================================================================

taskflow-complete/
  backend/
    mvnw.cmd                     <- Run this on Windows (no Maven needed)
    mvnw                         <- Run this on Mac/Linux
    pom.xml
    src/main/java/com/taskflow/
      TaskFlowApplication.java
      config/     SecurityConfig, WebSocketConfig, CorsConfig
      controller/ AuthController, ProjectController, TaskController...
      service/    AuthService, ProjectService, TaskService...
      repository/ JPA repositories (one per entity)
      entity/     User, Project, BoardColumn, Task, ProjectMember, ActivityLog, Notification
      dto/        Request + Response DTOs
      security/   JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
      exception/  GlobalExceptionHandler + custom exceptions
    src/main/resources/
      application.properties

  frontend/
    src/
      App.jsx               <- Router setup
      index.js              <- Entry point
      pages/
        LoginPage.jsx
        SignupPage.jsx
        DashboardPage.jsx   <- Project grid
        ProjectPage.jsx     <- Kanban board with drag-and-drop
        AnalyticsPage.jsx   <- Stats + activity log
      components/
        Navbar.jsx          <- Navigation + notifications
        TaskModal.jsx       <- Create / edit / delete task
        MembersPanel.jsx    <- Team management slide-over
        ProtectedRoute.jsx  <- Auth guard
      services/
        api.js              <- Axios with JWT interceptors
        authService.js
        projectService.js
        taskService.js
        notificationService.js
      context/
        AuthContext.jsx     <- JWT state management
      websocket/
        useWebSocket.js     <- STOMP client hook

  database/
    schema.sql              <- PostgreSQL 15 tables, JSONB audit fields, indexes

================================================================
API ENDPOINTS (all need Authorization: Bearer TOKEN except /auth/*)
================================================================

POST  /api/v1/auth/register
POST  /api/v1/auth/login
POST  /api/v1/auth/refresh       <- HTTP-only refresh cookie

GET   /api/v1/projects
POST  /api/v1/projects
GET   /api/v1/projects/{id}/board
PATCH /api/v1/projects/{id}/archived
POST  /api/v1/projects/{id}/columns
PATCH /api/v1/projects/{id}/columns/{columnId}
GET   /api/v1/projects/{id}/audit

GET   /api/v1/projects/{id}/tasks
POST  /api/v1/projects/{id}/tasks
PATCH /api/v1/tasks/{id}         <- requires the task version
PATCH /api/v1/tasks/{id}/move    <- requires the task version; returns 409 on a conflict
DELETE /api/v1/tasks/{id}        <- Manager/Admin only

GET   /api/v1/users/me/notifications
PATCH /api/v1/admin/users/{id}/role  <- Admin only

================================================================
WEBSOCKET
================================================================

Connect: http://localhost:8080/ws?token=<JWT>  (authenticated SockJS)
Subscribe: /topic/project/{id}    (board events)
Personal:  /user/queue/notifications

Events: TASK_CREATED, TASK_UPDATED, TASK_MOVED, TASK_DELETED

================================================================
FEATURE NOTES
================================================================

- Projects seed configurable To Do, In Progress, Review, and Done columns.
- Task updates and moves use JPA @Version optimistic locking. A stale version returns HTTP 409 with currentVersion.
- Audit rows are immutable JSONB old/new value records. The deadline engine runs every 15 minutes.
- Set REDIS_ENABLED=true when Redis is running to enable cross-node WebSocket event broadcasting.
