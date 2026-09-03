# CrisisMesh Production Deployment

## Gate status

As of 2026-09-03, Phase 1 is **PARTIAL** and deployment is **BLOCKED**. The local rebuilt API has verified CORS behavior and public health access. External deployment, provider-side secret rotation, and full role smoke tests remain unverified.

## Architecture

- PostgreSQL/Supabase stores application data.
- MQTT provides broker connectivity for device telemetry.
- NestJS serves the REST API under `/api`, including `/api/v1/health`.
- Socket.IO provides authenticated realtime access at `/ws`.
- Next.js is the web client.
- Flutter is the mobile client.

## Required environment variables

### API

Required in production:

- `NODE_ENV=production`
- `API_HOST=0.0.0.0`
- `API_PORT`
- `CORS_ORIGIN` (comma-separated, exact HTTPS web origins)
- `DATABASE_URL`
- `MQTT_BROKER_URL`
- `JWT_SECRET`
- `NEWS_API_KEY` when news integration is enabled
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` when Supabase integration is enabled
- `MQTT_USERNAME` and `MQTT_PASSWORD` when the broker requires authentication

### Web

- `NEXT_PUBLIC_API_URL` must be the deployed API origin or API base URL.
- `NEXT_PUBLIC_WS_URL` must be the deployed API origin used by Socket.IO.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only if the web client uses Supabase directly.

### Mobile

Provide both at build time:

- `CRISISMESH_API_URL`
- `CRISISMESH_WS_URL`

The Flutter app has no localhost fallback. A release build without these values fails at runtime rather than silently targeting a developer machine.

All secret values must come from the deployment platform's secret manager or environment configuration. Never commit `.env` files, replacement credentials, or private keys.

## Deployment order

1. Provision and migrate the production PostgreSQL/Supabase database.
2. Provision the authenticated MQTT broker and verify TLS/network access.
3. Deploy the NestJS API with production environment variables.
4. Verify API health and Socket.IO/realtime connectivity.
5. Deploy the web client configured with the real API and WebSocket URLs.
6. Build and distribute mobile binaries with explicit production defines.

## Health checks

`GET /api/v1/health` is unauthenticated and must return HTTP 200 with `status: ok` and `services.api: healthy`.

The container health check uses the same route. A deployment must also test the route from outside the container and local Docker network.

## CORS policy

Only exact origins in `CORS_ORIGIN` are allowed. Credentials are enabled only with an explicit origin; wildcard origins are prohibited. The local rebuilt runtime evidence is:

- Approved GET: HTTP 200, `Access-Control-Allow-Origin` equals the approved origin, `Access-Control-Allow-Credentials: true`.
- Unauthorized GET: HTTP 403, generic `Origin not allowed` response, no allow-origin header.
- Approved preflight: HTTP 204 with the configured methods and `Content-Type,Authorization` headers.
- Unauthorized preflight: HTTP 403, no allow-origin header.

## Smoke tests

Run these against the deployed API from an external network:

1. `GET /api/v1/health` without authentication.
2. Citizen login, create an incident, and retrieve that citizen's incident.
3. Authority login, view authorized incidents and alerts.
4. Responder login and access responder functionality.
5. Admin login and access admin-only functionality.
6. Confirm anonymous protected requests return 401.
7. Confirm authenticated users without the required role return 403.
8. Verify logout, refresh-token rotation, WebSocket authentication, API errors, loading states, and empty states.

The web and mobile workflow checks are **UNVERIFIED** until a deployed target and test identities are available. Production clients must display endpoint errors; they must not fall back to mock arrays or mock authentication.

## Rollback procedure

1. Stop promotion of the current release.
2. Route traffic to the last known-good API deployment.
3. Keep the database migration backward-compatible; restore from a verified backup only after assessing data impact.
4. Revert the web deployment to the last build that targets the last known-good API.
5. Revoke affected tokens if authentication behavior was involved.
6. Record the failed health/smoke evidence and investigate before retrying.

## Known blockers

- Provider-side rotation status for historical credentials is not evidenced.
- External API, web, and mobile smoke tests are not verified from a deployed environment.
- The local compose startup reported `NEWS_API_KEY` unset; news integration is therefore unverified.
- Production database, MQTT, deployment credentials, and final public URLs are not provisioned in this workspace.
- Local Docker health status has been unreliable despite the API health route returning 200; investigate before production rollout.
