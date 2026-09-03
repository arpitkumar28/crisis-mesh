# Phase 1 Runtime Evidence

Generated: 2026-09-03T16:36:46.927Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---|
| 2026-09-03T16:36:46.009Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:36:46.346Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:36:46.424Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:36:46.529Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:36:46.602Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:36:46.679Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:36:46.753Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:36:46.757Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:36:46.763Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:36:46.764Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:36:46.766Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:36:46.768Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:36:46.770Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:36:46.800Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:36:46.804Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:36:46.807Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:36:46.821Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:36:46.832Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:36:46.842Z | /api/v1/incidents/27d0d57f-36a8-4165-b2c0-d4053e72b75b | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:36:46.850Z | /api/v1/incidents/27d0d57f-36a8-4165-b2c0-d4053e72b75b | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:36:46.853Z | /api/v1/incidents/27d0d57f-36a8-4165-b2c0-d4053e72b75b | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:36:46.857Z | /api/v1/incidents/27d0d57f-36a8-4165-b2c0-d4053e72b75b | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:36:46.860Z | /api/v1/incidents/27d0d57f-36a8-4165-b2c0-d4053e72b75b | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:36:46.863Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:36:46.864Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:36:46.866Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:36:46.868Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:36:46.869Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:36:46.871Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:36:46.873Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:36:46.875Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:36:46.890Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |

## Initial Findings (Preserved)

The original run at 2026-09-03T16:31:54.943Z recorded four failures. No credentials or tokens are included.

| Endpoint | Method | Identity | Expected | Actual | Request authentication state | Relevant guard | Relevant role | Relevant service |
|---|---|---|---:|---:|---|---|---|---|
| /api/v1/incidents | GET | CITIZEN | 200 | 401 | `Bearer undefined`; token lookup used an identity that was never created | JwtAuthGuard, then RolesGuard was not reached | CITIZEN | IncidentsController / IncidentsService |
| /api/v1/alerts | POST | CITIZEN | 403 | 401 | `Bearer undefined`; token lookup used an identity that was never created | JwtAuthGuard, then RolesGuard was not reached | CITIZEN, but required role is ADMIN/AUTHORITY/RESPONDER | AlertsController / AlertsService |
| /api/v1/auth/admin/assign-role | POST | CITIZEN | 403 | 401 | `Bearer undefined`; token lookup used an identity that was never created | JwtAuthGuard, then RolesGuard was not reached | CITIZEN, required role ADMIN | AuthController / AuthService |
| /api/v1/auth/me | GET | disabled CITIZEN_A | 401 | 200 | Valid access token; signature, expiry, and access type accepted | JwtAuthGuard / JwtStrategy did not check current profile status | CITIZEN claims in token | AuthController / UsersService profile lookup |

## Investigation and Retest

### Citizen authorization requests

- Initial finding: three expected authorization responses returned 401.
- Root cause: the harness created `CITIZEN_A` and `CITIZEN_B`, but requested `token('CITIZEN')`. The resulting `Bearer undefined` header failed JWT extraction/validation before `RolesGuard`.
- Fix: the harness now uses `CITIZEN_A` for the generic citizen probes. Authentication was not weakened.
- Retest: incident listing returned 200; citizen alert creation returned 403; citizen role assignment returned 403.

### Disabled user

- Initial finding: a disabled user retained access to `/api/v1/auth/me` with an existing access token.
- Policy: disabling an account must prevent access to protected resources immediately; login already rejected inactive profiles, but access-token validation did not enforce the same policy.
- Root cause: `JwtStrategy.validate()` trusted valid JWT claims without checking the current `profiles.is_active` state.
- Fix: JWT strategy now loads the current profile through `UsersService.findById()`, whose active-profile query rejects inactive or missing users.
- Retest: disabled `CITIZEN_A` access to `/api/v1/auth/me` returned 401.

### Retest scope

The retest also passed the existing IDOR and JWT probes, refresh rotation, and CORS checks. Secret history remains `REQUIRES ROTATION`; Phase 2 was not started.

## Retest Run: 2026-09-03T16:37:56.794Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:37:55.872Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:37:56.261Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:37:56.338Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:37:56.412Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:37:56.485Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:37:56.559Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:37:56.631Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:37:56.634Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:37:56.636Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:37:56.637Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:37:56.638Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:37:56.639Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:37:56.641Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:37:56.671Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:37:56.675Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:37:56.679Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:37:56.687Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:37:56.695Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:37:56.704Z | /api/v1/incidents/3ff0f6a4-261a-4670-8ac1-817c5cbbf0d6 | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:37:56.710Z | /api/v1/incidents/3ff0f6a4-261a-4670-8ac1-817c5cbbf0d6 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:37:56.713Z | /api/v1/incidents/3ff0f6a4-261a-4670-8ac1-817c5cbbf0d6 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:37:56.715Z | /api/v1/incidents/3ff0f6a4-261a-4670-8ac1-817c5cbbf0d6 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:37:56.718Z | /api/v1/incidents/3ff0f6a4-261a-4670-8ac1-817c5cbbf0d6 | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:37:56.722Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:37:56.723Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:37:56.725Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:37:56.727Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:37:56.728Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:37:56.729Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:37:56.731Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:37:56.732Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:37:56.745Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:37:56.747Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:37:56.749Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:37:56.751Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 200 | FAIL |

## Retest Run: 2026-09-03T16:39:00.701Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:38:59.757Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:39:00.147Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:39:00.225Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:39:00.299Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:39:00.370Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:39:00.445Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:39:00.516Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:39:00.520Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:39:00.526Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:39:00.528Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:39:00.530Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:39:00.532Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:39:00.533Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:39:00.568Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:39:00.572Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:39:00.577Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:39:00.585Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:39:00.593Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:39:00.603Z | /api/v1/incidents/d736a857-1963-4f3a-ba28-525cc8fe26ca | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:39:00.610Z | /api/v1/incidents/d736a857-1963-4f3a-ba28-525cc8fe26ca | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:39:00.613Z | /api/v1/incidents/d736a857-1963-4f3a-ba28-525cc8fe26ca | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:39:00.616Z | /api/v1/incidents/d736a857-1963-4f3a-ba28-525cc8fe26ca | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:39:00.619Z | /api/v1/incidents/d736a857-1963-4f3a-ba28-525cc8fe26ca | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:39:00.623Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:39:00.624Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:39:00.626Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:39:00.627Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:39:00.628Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:39:00.630Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:39:00.635Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:39:00.637Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:39:00.650Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:39:00.652Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:39:00.654Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:39:00.657Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |
