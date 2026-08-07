# Running TaskFlow with Docker

This spins up the whole stack — PostgreSQL, Redis, the Spring Boot backend,
and the React frontend (served via nginx) — with a single command. No local
Java, Node, Maven, or PostgreSQL installs required.

## 1. Configure environment (optional)

```bash
cp .env.example .env
```

Edit `.env` if you want non-default DB credentials or a custom JWT secret.
The defaults work fine for local use.

## 2. Build and start everything

```bash
docker compose up --build
```

First run builds the backend jar and frontend bundle inside Docker (a few
minutes). Subsequent runs are fast thanks to layer caching.

## 3. Use the app

- Frontend: http://localhost:3000
- Backend API directly: http://localhost:8080/api/v1/...
- Postgres: localhost:5432 (user/db from `.env`, default `taskflow`/`taskflow_db`)
- Redis: localhost:6379

The frontend container's nginx proxies `/api/*` and `/ws/*` requests to the
backend container, so the browser only ever talks to port 3000 — CORS and
mixed-origin issues are avoided.

Sign up for a new account on the login page (no seeded admin user ships in
`database/schema.sql`).

## 4. Stop / reset

```bash
docker compose down          # stop containers, keep DB data
docker compose down -v       # stop containers AND wipe the postgres volume
```

## What each piece does

| Service    | Image / Build             | Purpose                                   |
|------------|----------------------------|--------------------------------------------|
| `postgres` | `postgres:15-alpine`       | Database; auto-runs `database/schema.sql` on first start |
| `redis`    | `redis:7-alpine`           | Optional pub/sub for multi-node WebSocket broadcasting |
| `backend`  | `backend/Dockerfile`       | Spring Boot API, multi-stage Maven build → JRE runtime |
| `frontend` | `frontend/Dockerfile`      | React build → served by nginx, reverse-proxies API/WS calls |

## Notes

- The backend connects to Postgres/Redis using the Docker service names
  (`postgres`, `redis`), configured via env vars in `docker-compose.yml` —
  no code changes were needed since `application.properties` already reads
  these from environment variables.
- `docker-compose.yml` waits for Postgres/Redis health checks before
  starting the backend.
- To run backend/frontend independently of Compose, each has its own
  `Dockerfile` you can `docker build` directly.
