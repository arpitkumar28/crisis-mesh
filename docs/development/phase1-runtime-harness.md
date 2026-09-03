# Phase 1 Runtime Harness

## Required services

| Service | Compose service | Container | Host | Port | Readiness |
|---|---|---|---|---:|---|
| PostgreSQL/PostGIS | `postgres` | `crisis-mesh-postgres` | `localhost` | 5432 | Compose healthcheck: `pg_isready -U crisis_mesh` |
| MQTT | `mqtt` | `crisis-mesh-mqtt` | `localhost` | 1883 | Compose healthcheck plus TCP connection |
| NestJS API | `api` | `crisis-mesh-api` | `localhost` | 3002 | `GET /api/v1/health` returns HTTP 200 |

The API container uses PostgreSQL at `postgres:5432` and MQTT at `mqtt:1883` internally. Port `9001` is also published for MQTT WebSocket clients; Phase 1 readiness uses the MQTT TCP listener on `1883`.

## Startup

From the repository root, provide a non-committed JWT secret and test password:

```bash
export JWT_SECRET="$(openssl rand -hex 32)"
export PHASE1_TEST_PASSWORD="$(openssl rand -base64 24)"
./scripts/phase1-runtime-start.sh
```

The launcher verifies Docker, waits for both container healthchecks, checks MQTT reachability, runs the tracked migration CLI against the local database, starts/rebuilds the API, and polls the health endpoint. It exits with `RUNTIME = BLOCKED` if any gate fails. `JWT_SECRET` is required in the environment because the API configuration requires it; it is never written to source.

Run the live HTTP suite only after the launcher succeeds:

```bash
cd services/api
npm run phase1:live
```

The suite creates only `phase1-test.*@localhost.invalid` identities, assigns the existing roles `CITIZEN`, `RESPONDER`, `AUTHORITY`, `ADMIN`, and `ANALYST`, performs real requests against `http://localhost:3002`, and removes its marker users in a `finally` block. Credentials and tokens are never written to evidence. Do not use a production database URL.

The suite refuses to run past the health gate. If health is unavailable, security outcomes remain `UNVERIFIED` rather than being reported as passes.