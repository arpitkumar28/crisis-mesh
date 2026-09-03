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

## Retest Run: 2026-09-03T16:43:03.631Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:43:02.429Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:43:02.998Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:43:03.089Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:43:03.185Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:43:03.262Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:43:03.340Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:43:03.417Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:43:03.422Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:43:03.425Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:43:03.427Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:43:03.429Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:43:03.429Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:43:03.430Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:43:03.486Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:43:03.491Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:43:03.495Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:43:03.504Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:43:03.513Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:43:03.524Z | /api/v1/incidents/4f90da35-0d4e-4b20-b94b-4718f24ff5b1 | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:43:03.531Z | /api/v1/incidents/4f90da35-0d4e-4b20-b94b-4718f24ff5b1 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:43:03.537Z | /api/v1/incidents/4f90da35-0d4e-4b20-b94b-4718f24ff5b1 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:43:03.540Z | /api/v1/incidents/4f90da35-0d4e-4b20-b94b-4718f24ff5b1 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:43:03.543Z | /api/v1/incidents/4f90da35-0d4e-4b20-b94b-4718f24ff5b1 | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:43:03.546Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:43:03.547Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:43:03.548Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:43:03.549Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:43:03.553Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:43:03.555Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:43:03.559Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:43:03.562Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:43:03.576Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:43:03.579Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:43:03.582Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:43:03.586Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

## Retest Run: 2026-09-03T16:44:42.357Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:44:40.164Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:44:40.533Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:44:40.612Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:44:40.686Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:44:40.757Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:44:40.833Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:44:40.903Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:44:40.906Z | GET /api/v1/incidents | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:40.938Z | GET /api/v1/incidents | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:40.944Z | GET /api/v1/incidents | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:40.950Z | GET /api/v1/incidents | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:40.957Z | GET /api/v1/incidents | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:40.959Z | GET /api/v1/incidents | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:40.961Z | GET /api/v1/incidents/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:40.984Z | GET /api/v1/incidents/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.032Z | GET /api/v1/incidents/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.043Z | GET /api/v1/incidents/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.067Z | GET /api/v1/incidents/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.070Z | GET /api/v1/incidents/status/ACTIVE | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.079Z | GET /api/v1/incidents/type/OTHER | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.087Z | GET /api/v1/incidents/type/OTHER | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.091Z | GET /api/v1/incidents/type/OTHER | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.096Z | GET /api/v1/incidents/type/OTHER | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.102Z | GET /api/v1/incidents/type/OTHER | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.103Z | GET /api/v1/incidents/type/OTHER | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.105Z | GET /api/v1/incidents/active | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.113Z | GET /api/v1/incidents/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.118Z | GET /api/v1/incidents/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.123Z | GET /api/v1/incidents/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.129Z | GET /api/v1/incidents/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.130Z | GET /api/v1/incidents/active | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.131Z | GET /api/v1/incidents/count | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.142Z | GET /api/v1/incidents/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.146Z | GET /api/v1/incidents/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.150Z | GET /api/v1/incidents/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.152Z | GET /api/v1/incidents/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.154Z | GET /api/v1/incidents/count | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.154Z | GET /api/v1/incidents/count/by-status | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.160Z | GET /api/v1/incidents/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.164Z | GET /api/v1/incidents/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.168Z | GET /api/v1/incidents/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.171Z | GET /api/v1/incidents/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.172Z | GET /api/v1/incidents/count/by-status | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.173Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.181Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.187Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.194Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.199Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.200Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.201Z | GET /api/v1/alerts | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.210Z | GET /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.215Z | GET /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.219Z | GET /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.224Z | GET /api/v1/alerts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.225Z | GET /api/v1/alerts | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.227Z | GET /api/v1/alerts/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.233Z | GET /api/v1/alerts/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.238Z | GET /api/v1/alerts/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.242Z | GET /api/v1/alerts/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.247Z | GET /api/v1/alerts/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.248Z | GET /api/v1/alerts/status/ACTIVE | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.249Z | GET /api/v1/alerts/severity/HIGH | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.254Z | GET /api/v1/alerts/severity/HIGH | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.259Z | GET /api/v1/alerts/severity/HIGH | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.264Z | GET /api/v1/alerts/severity/HIGH | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.268Z | GET /api/v1/alerts/severity/HIGH | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.269Z | GET /api/v1/alerts/severity/HIGH | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.270Z | GET /api/v1/alerts/active | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.277Z | GET /api/v1/alerts/active | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.282Z | GET /api/v1/alerts/active | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.286Z | GET /api/v1/alerts/active | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.290Z | GET /api/v1/alerts/active | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.291Z | GET /api/v1/alerts/active | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.293Z | GET /api/v1/alerts/critical | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.299Z | GET /api/v1/alerts/critical | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.303Z | GET /api/v1/alerts/critical | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.309Z | GET /api/v1/alerts/critical | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.314Z | GET /api/v1/alerts/critical | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.315Z | GET /api/v1/alerts/critical | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.316Z | GET /api/v1/alerts/count | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.319Z | GET /api/v1/alerts/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.323Z | GET /api/v1/alerts/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.327Z | GET /api/v1/alerts/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.330Z | GET /api/v1/alerts/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.332Z | GET /api/v1/alerts/count | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.333Z | GET /api/v1/alerts/count/by-status | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.336Z | GET /api/v1/alerts/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.339Z | GET /api/v1/alerts/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.343Z | GET /api/v1/alerts/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.347Z | GET /api/v1/alerts/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.349Z | GET /api/v1/alerts/count/by-status | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.350Z | GET /api/v1/alerts/filter | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.354Z | GET /api/v1/alerts/filter | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.359Z | GET /api/v1/alerts/filter | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.364Z | GET /api/v1/alerts/filter | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.371Z | GET /api/v1/alerts/filter | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.372Z | GET /api/v1/alerts/filter | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.375Z | GET /api/v1/alerts/sources | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.384Z | GET /api/v1/alerts/sources | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.388Z | GET /api/v1/alerts/sources | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.393Z | GET /api/v1/alerts/sources | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.398Z | GET /api/v1/alerts/sources | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.399Z | GET /api/v1/alerts/sources | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.400Z | GET /api/v1/alerts/types | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.404Z | GET /api/v1/alerts/types | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.411Z | GET /api/v1/alerts/types | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.415Z | GET /api/v1/alerts/types | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.420Z | GET /api/v1/alerts/types | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.421Z | GET /api/v1/alerts/types | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.422Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.427Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.432Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.436Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.439Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.440Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.441Z | GET /api/v1/devices | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.451Z | GET /api/v1/devices | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.456Z | GET /api/v1/devices | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.461Z | GET /api/v1/devices | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.466Z | GET /api/v1/devices | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.468Z | GET /api/v1/devices | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.469Z | GET /api/v1/devices/count | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.478Z | GET /api/v1/devices/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.481Z | GET /api/v1/devices/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.484Z | GET /api/v1/devices/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.487Z | GET /api/v1/devices/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.488Z | GET /api/v1/devices/count | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.489Z | GET /api/v1/devices/count/by-status | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.492Z | GET /api/v1/devices/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.497Z | GET /api/v1/devices/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.500Z | GET /api/v1/devices/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.503Z | GET /api/v1/devices/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.504Z | GET /api/v1/devices/count/by-status | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.505Z | GET /api/v1/devices/online | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.511Z | GET /api/v1/devices/online | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.515Z | GET /api/v1/devices/online | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.524Z | GET /api/v1/devices/online | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.531Z | GET /api/v1/devices/online | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.532Z | GET /api/v1/devices/online | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.533Z | GET /api/v1/devices/offline | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.537Z | GET /api/v1/devices/offline | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.540Z | GET /api/v1/devices/offline | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.546Z | GET /api/v1/devices/offline | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.550Z | GET /api/v1/devices/offline | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.550Z | GET /api/v1/devices/offline | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.551Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.560Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.564Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.569Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.573Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:41.574Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.575Z | GET /api/v1/districts | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.580Z | GET /api/v1/districts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.584Z | GET /api/v1/districts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.587Z | GET /api/v1/districts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.589Z | GET /api/v1/districts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.590Z | GET /api/v1/districts | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.591Z | GET /api/v1/risk | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.599Z | GET /api/v1/risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.602Z | GET /api/v1/risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.605Z | GET /api/v1/risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.609Z | GET /api/v1/risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.610Z | GET /api/v1/risk | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.612Z | GET /api/v1/risk/high-risk | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.615Z | GET /api/v1/risk/high-risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.619Z | GET /api/v1/risk/high-risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.623Z | GET /api/v1/risk/high-risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.627Z | GET /api/v1/risk/high-risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.628Z | GET /api/v1/risk/high-risk | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.629Z | GET /api/v1/risk/summary | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.636Z | GET /api/v1/risk/summary | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.663Z | GET /api/v1/risk/summary | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.684Z | GET /api/v1/risk/summary | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.701Z | GET /api/v1/risk/summary | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.703Z | GET /api/v1/risk/summary | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.705Z | GET /api/v1/weather | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.733Z | GET /api/v1/weather | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.750Z | GET /api/v1/weather | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.801Z | GET /api/v1/weather | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.804Z | GET /api/v1/weather | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.805Z | GET /api/v1/weather | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.806Z | GET /api/v1/weather/latest | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.811Z | GET /api/v1/weather/latest | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.815Z | GET /api/v1/weather/latest | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.818Z | GET /api/v1/weather/latest | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.821Z | GET /api/v1/weather/latest | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.822Z | GET /api/v1/weather/latest | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.823Z | GET /api/v1/resources | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.860Z | GET /api/v1/resources | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.864Z | GET /api/v1/resources | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.868Z | GET /api/v1/resources | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.871Z | GET /api/v1/resources | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.872Z | GET /api/v1/resources | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.873Z | GET /api/v1/shelters | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:41.881Z | GET /api/v1/shelters | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.885Z | GET /api/v1/shelters | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.888Z | GET /api/v1/shelters | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.890Z | GET /api/v1/shelters | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:41.891Z | GET /api/v1/shelters | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.893Z | GET /api/v1/dashboard/overview | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:41.906Z | GET /api/v1/dashboard/overview | RESPONDER | 403 | 500 | FAIL |
| 2026-09-03T16:44:41.955Z | GET /api/v1/dashboard/overview | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.970Z | GET /api/v1/dashboard/overview | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:41.998Z | GET /api/v1/dashboard/overview | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:42.010Z | GET /api/v1/dashboard/overview | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.036Z | GET /api/v1/notifications | CITIZEN | ALLOW (not 401/403) | 401 | FAIL |
| 2026-09-03T16:44:42.047Z | GET /api/v1/notifications | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:42.055Z | GET /api/v1/notifications | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:42.061Z | GET /api/v1/notifications | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:42.064Z | GET /api/v1/notifications | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:42.066Z | GET /api/v1/notifications | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.067Z | POST /api/v1/alerts | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.071Z | POST /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.074Z | POST /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.078Z | POST /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.081Z | POST /api/v1/alerts | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.082Z | POST /api/v1/alerts | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.084Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.086Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.089Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.092Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.095Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.097Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.098Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.100Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:44:42.103Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:44:42.109Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:44:42.112Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.113Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.115Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.118Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.122Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.125Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:44:42.130Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.132Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.133Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.136Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:44:42.139Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:44:42.145Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:44:42.149Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.150Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.151Z | POST /api/v1/auth/admin/assign-role | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.153Z | POST /api/v1/auth/admin/assign-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:44:42.156Z | POST /api/v1/auth/admin/assign-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:44:42.180Z | POST /api/v1/auth/admin/assign-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:42.182Z | POST /api/v1/auth/admin/assign-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.183Z | POST /api/v1/auth/admin/assign-role | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.184Z | POST /api/v1/auth/admin/remove-role | CITIZEN | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.186Z | POST /api/v1/auth/admin/remove-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:44:42.188Z | POST /api/v1/auth/admin/remove-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:44:42.197Z | POST /api/v1/auth/admin/remove-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:44:42.200Z | POST /api/v1/auth/admin/remove-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:44:42.201Z | POST /api/v1/auth/admin/remove-role | anonymous | 403 | 401 | FAIL |
| 2026-09-03T16:44:42.223Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:44:42.224Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:44:42.225Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:44:42.227Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:44:42.228Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:44:42.229Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:44:42.234Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:44:42.236Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:44:42.238Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:44:42.247Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:44:42.253Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:44:42.260Z | /api/v1/incidents/582d3f93-05e8-40f8-af58-2ee71635ff96 | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:44:42.266Z | /api/v1/incidents/582d3f93-05e8-40f8-af58-2ee71635ff96 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:44:42.269Z | /api/v1/incidents/582d3f93-05e8-40f8-af58-2ee71635ff96 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:44:42.271Z | /api/v1/incidents/582d3f93-05e8-40f8-af58-2ee71635ff96 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:44:42.274Z | /api/v1/incidents/582d3f93-05e8-40f8-af58-2ee71635ff96 | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:44:42.280Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:44:42.282Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:44:42.283Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:44:42.284Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:44:42.286Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:44:42.288Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:44:42.293Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:44:42.295Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:44:42.311Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:44:42.314Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:44:42.318Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:44:42.321Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

### Response, CORS, and error audit

| Probe | HTTP status | Result | Sensitive fields |
|---|---:|---|---|
| GET /api/v1/auth/me | 200 | PASS | none |
| GET /api/v1/incidents | 200 | FAIL | $.data.0.reporter.password_hash, $.data.1.reporter.password_hash |
| GET /api/v1/alerts | 500 | PASS | none |
| POST /api/v1/incidents malformed DTO | 400 | PASS | none |
| OPTIONS /api/v1/health Origin=http://localhost:3000 | 204 | PASS | none |
| OPTIONS /api/v1/health Origin=http://evil.example | 500 | PASS | none |

## Retest Run: 2026-09-03T16:46:18.648Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:46:16.555Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:46:16.883Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:16.960Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:46:17.035Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:46:17.107Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:46:17.183Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:46:17.259Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:46:17.303Z | GET /api/v1/incidents | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.314Z | GET /api/v1/incidents | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.319Z | GET /api/v1/incidents | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.326Z | GET /api/v1/incidents | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.331Z | GET /api/v1/incidents | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.334Z | GET /api/v1/incidents | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.342Z | GET /api/v1/incidents/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.347Z | GET /api/v1/incidents/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.353Z | GET /api/v1/incidents/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.358Z | GET /api/v1/incidents/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.363Z | GET /api/v1/incidents/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.365Z | GET /api/v1/incidents/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.371Z | GET /api/v1/incidents/type/OTHER | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.377Z | GET /api/v1/incidents/type/OTHER | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.382Z | GET /api/v1/incidents/type/OTHER | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.386Z | GET /api/v1/incidents/type/OTHER | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.391Z | GET /api/v1/incidents/type/OTHER | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.393Z | GET /api/v1/incidents/type/OTHER | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.401Z | GET /api/v1/incidents/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.407Z | GET /api/v1/incidents/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.413Z | GET /api/v1/incidents/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.421Z | GET /api/v1/incidents/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.427Z | GET /api/v1/incidents/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.430Z | GET /api/v1/incidents/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.439Z | GET /api/v1/incidents/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.444Z | GET /api/v1/incidents/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.447Z | GET /api/v1/incidents/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.450Z | GET /api/v1/incidents/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.453Z | GET /api/v1/incidents/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.455Z | GET /api/v1/incidents/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.463Z | GET /api/v1/incidents/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.468Z | GET /api/v1/incidents/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.472Z | GET /api/v1/incidents/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.477Z | GET /api/v1/incidents/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.480Z | GET /api/v1/incidents/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.482Z | GET /api/v1/incidents/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.488Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.494Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.505Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.512Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.517Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.519Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.526Z | GET /api/v1/alerts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.530Z | GET /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.535Z | GET /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.539Z | GET /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.543Z | GET /api/v1/alerts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.545Z | GET /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.549Z | GET /api/v1/alerts/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.554Z | GET /api/v1/alerts/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.558Z | GET /api/v1/alerts/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.563Z | GET /api/v1/alerts/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.567Z | GET /api/v1/alerts/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.569Z | GET /api/v1/alerts/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.573Z | GET /api/v1/alerts/severity/HIGH | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.577Z | GET /api/v1/alerts/severity/HIGH | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.581Z | GET /api/v1/alerts/severity/HIGH | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.586Z | GET /api/v1/alerts/severity/HIGH | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.590Z | GET /api/v1/alerts/severity/HIGH | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.591Z | GET /api/v1/alerts/severity/HIGH | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.597Z | GET /api/v1/alerts/active | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.601Z | GET /api/v1/alerts/active | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.605Z | GET /api/v1/alerts/active | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.609Z | GET /api/v1/alerts/active | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.613Z | GET /api/v1/alerts/active | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.615Z | GET /api/v1/alerts/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.619Z | GET /api/v1/alerts/critical | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.623Z | GET /api/v1/alerts/critical | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.628Z | GET /api/v1/alerts/critical | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.632Z | GET /api/v1/alerts/critical | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.637Z | GET /api/v1/alerts/critical | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.639Z | GET /api/v1/alerts/critical | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.643Z | GET /api/v1/alerts/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.646Z | GET /api/v1/alerts/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.649Z | GET /api/v1/alerts/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.652Z | GET /api/v1/alerts/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.655Z | GET /api/v1/alerts/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.657Z | GET /api/v1/alerts/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.662Z | GET /api/v1/alerts/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.665Z | GET /api/v1/alerts/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.670Z | GET /api/v1/alerts/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.673Z | GET /api/v1/alerts/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.677Z | GET /api/v1/alerts/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.678Z | GET /api/v1/alerts/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.685Z | GET /api/v1/alerts/filter | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.693Z | GET /api/v1/alerts/filter | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.703Z | GET /api/v1/alerts/filter | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.708Z | GET /api/v1/alerts/filter | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.713Z | GET /api/v1/alerts/filter | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.714Z | GET /api/v1/alerts/filter | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.720Z | GET /api/v1/alerts/sources | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.724Z | GET /api/v1/alerts/sources | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.729Z | GET /api/v1/alerts/sources | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.733Z | GET /api/v1/alerts/sources | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.738Z | GET /api/v1/alerts/sources | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.739Z | GET /api/v1/alerts/sources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.744Z | GET /api/v1/alerts/types | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.748Z | GET /api/v1/alerts/types | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.752Z | GET /api/v1/alerts/types | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.756Z | GET /api/v1/alerts/types | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.761Z | GET /api/v1/alerts/types | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.762Z | GET /api/v1/alerts/types | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.765Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.769Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.774Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.779Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.783Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.785Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.791Z | GET /api/v1/devices | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.796Z | GET /api/v1/devices | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.801Z | GET /api/v1/devices | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.806Z | GET /api/v1/devices | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.811Z | GET /api/v1/devices | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.812Z | GET /api/v1/devices | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.817Z | GET /api/v1/devices/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.821Z | GET /api/v1/devices/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.825Z | GET /api/v1/devices/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.828Z | GET /api/v1/devices/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.831Z | GET /api/v1/devices/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.831Z | GET /api/v1/devices/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.835Z | GET /api/v1/devices/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.838Z | GET /api/v1/devices/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.840Z | GET /api/v1/devices/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.844Z | GET /api/v1/devices/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.848Z | GET /api/v1/devices/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.849Z | GET /api/v1/devices/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.854Z | GET /api/v1/devices/online | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.859Z | GET /api/v1/devices/online | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.864Z | GET /api/v1/devices/online | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.868Z | GET /api/v1/devices/online | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.873Z | GET /api/v1/devices/online | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.874Z | GET /api/v1/devices/online | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.879Z | GET /api/v1/devices/offline | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.882Z | GET /api/v1/devices/offline | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.886Z | GET /api/v1/devices/offline | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.889Z | GET /api/v1/devices/offline | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.893Z | GET /api/v1/devices/offline | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:17.894Z | GET /api/v1/devices/offline | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.900Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.905Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.909Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.914Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.919Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:17.920Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.928Z | GET /api/v1/districts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.933Z | GET /api/v1/districts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.937Z | GET /api/v1/districts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.945Z | GET /api/v1/districts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.949Z | GET /api/v1/districts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.954Z | GET /api/v1/districts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.960Z | GET /api/v1/risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.963Z | GET /api/v1/risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.968Z | GET /api/v1/risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.972Z | GET /api/v1/risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.976Z | GET /api/v1/risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.977Z | GET /api/v1/risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:17.980Z | GET /api/v1/risk/high-risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.983Z | GET /api/v1/risk/high-risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.987Z | GET /api/v1/risk/high-risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.990Z | GET /api/v1/risk/high-risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.994Z | GET /api/v1/risk/high-risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:17.995Z | GET /api/v1/risk/high-risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.000Z | GET /api/v1/risk/summary | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.011Z | GET /api/v1/risk/summary | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.028Z | GET /api/v1/risk/summary | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.039Z | GET /api/v1/risk/summary | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.051Z | GET /api/v1/risk/summary | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.054Z | GET /api/v1/risk/summary | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.069Z | GET /api/v1/weather | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.078Z | GET /api/v1/weather | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.107Z | GET /api/v1/weather | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.112Z | GET /api/v1/weather | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.114Z | GET /api/v1/weather | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.115Z | GET /api/v1/weather | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.119Z | GET /api/v1/weather/latest | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.122Z | GET /api/v1/weather/latest | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.126Z | GET /api/v1/weather/latest | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.130Z | GET /api/v1/weather/latest | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.132Z | GET /api/v1/weather/latest | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.133Z | GET /api/v1/weather/latest | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.166Z | GET /api/v1/resources | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.170Z | GET /api/v1/resources | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.175Z | GET /api/v1/resources | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.181Z | GET /api/v1/resources | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.185Z | GET /api/v1/resources | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.186Z | GET /api/v1/resources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.193Z | GET /api/v1/shelters | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.196Z | GET /api/v1/shelters | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.199Z | GET /api/v1/shelters | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.202Z | GET /api/v1/shelters | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.206Z | GET /api/v1/shelters | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.207Z | GET /api/v1/shelters | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.219Z | GET /api/v1/dashboard/overview | CITIZEN | 401 | 500 | FAIL |
| 2026-09-03T16:46:18.231Z | GET /api/v1/dashboard/overview | RESPONDER | 401 | 500 | FAIL |
| 2026-09-03T16:46:18.255Z | GET /api/v1/dashboard/overview | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.297Z | GET /api/v1/dashboard/overview | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.312Z | GET /api/v1/dashboard/overview | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.314Z | GET /api/v1/dashboard/overview | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.322Z | GET /api/v1/notifications | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.326Z | GET /api/v1/notifications | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.329Z | GET /api/v1/notifications | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.332Z | GET /api/v1/notifications | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.335Z | GET /api/v1/notifications | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.336Z | GET /api/v1/notifications | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.341Z | POST /api/v1/alerts | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.345Z | POST /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.349Z | POST /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.353Z | POST /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.356Z | POST /api/v1/alerts | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.357Z | POST /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.360Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.364Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.367Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.370Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.373Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.374Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.377Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.380Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.383Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.390Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:18.394Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.396Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.398Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.402Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.406Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.410Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:18.414Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.415Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.418Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.421Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.423Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.429Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:18.431Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.433Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.436Z | POST /api/v1/auth/admin/assign-role | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.439Z | POST /api/v1/auth/admin/assign-role | RESPONDER | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.443Z | POST /api/v1/auth/admin/assign-role | AUTHORITY | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.467Z | POST /api/v1/auth/admin/assign-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.470Z | POST /api/v1/auth/admin/assign-role | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.471Z | POST /api/v1/auth/admin/assign-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.474Z | POST /api/v1/auth/admin/remove-role | CITIZEN | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.478Z | POST /api/v1/auth/admin/remove-role | RESPONDER | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.480Z | POST /api/v1/auth/admin/remove-role | AUTHORITY | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.487Z | POST /api/v1/auth/admin/remove-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:18.489Z | POST /api/v1/auth/admin/remove-role | ANALYST | 401 | 403 | FAIL |
| 2026-09-03T16:46:18.491Z | POST /api/v1/auth/admin/remove-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:18.527Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:18.528Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:46:18.529Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:46:18.530Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:46:18.531Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:46:18.532Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:46:18.536Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:18.539Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:46:18.542Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:46:18.551Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:46:18.559Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:46:18.564Z | /api/v1/incidents/2bd724f1-fafa-482e-a388-71fbd1d200c2 | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:18.569Z | /api/v1/incidents/2bd724f1-fafa-482e-a388-71fbd1d200c2 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:46:18.571Z | /api/v1/incidents/2bd724f1-fafa-482e-a388-71fbd1d200c2 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:46:18.573Z | /api/v1/incidents/2bd724f1-fafa-482e-a388-71fbd1d200c2 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:46:18.576Z | /api/v1/incidents/2bd724f1-fafa-482e-a388-71fbd1d200c2 | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:46:18.579Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:18.580Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:46:18.580Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:46:18.582Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:46:18.583Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:46:18.585Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:46:18.588Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:18.589Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:46:18.602Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:18.604Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:18.611Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:18.613Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

### Response, CORS, and error audit

| Probe | HTTP status | Result | Sensitive fields |
|---|---:|---|---|
| GET /api/v1/auth/me | 200 | PASS | none |
| GET /api/v1/incidents | 200 | PASS | none |
| GET /api/v1/alerts | 500 | PASS | none |
| POST /api/v1/incidents malformed DTO | 400 | PASS | none |
| OPTIONS /api/v1/health Origin=http://localhost:3000 | 204 | PASS | none |
| OPTIONS /api/v1/health Origin=http://evil.example | 500 | PASS | none |

## Retest Run: 2026-09-03T16:46:34.530Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:46:32.477Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:46:32.850Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:32.922Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:46:33.007Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:46:33.080Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:46:33.159Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:46:33.235Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:46:33.268Z | GET /api/v1/incidents | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.277Z | GET /api/v1/incidents | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.282Z | GET /api/v1/incidents | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.287Z | GET /api/v1/incidents | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.291Z | GET /api/v1/incidents | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.293Z | GET /api/v1/incidents | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.300Z | GET /api/v1/incidents/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.304Z | GET /api/v1/incidents/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.308Z | GET /api/v1/incidents/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.314Z | GET /api/v1/incidents/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.318Z | GET /api/v1/incidents/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.319Z | GET /api/v1/incidents/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.325Z | GET /api/v1/incidents/type/OTHER | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.330Z | GET /api/v1/incidents/type/OTHER | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.335Z | GET /api/v1/incidents/type/OTHER | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.339Z | GET /api/v1/incidents/type/OTHER | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.344Z | GET /api/v1/incidents/type/OTHER | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.345Z | GET /api/v1/incidents/type/OTHER | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.352Z | GET /api/v1/incidents/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.356Z | GET /api/v1/incidents/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.361Z | GET /api/v1/incidents/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.365Z | GET /api/v1/incidents/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.369Z | GET /api/v1/incidents/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.371Z | GET /api/v1/incidents/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.377Z | GET /api/v1/incidents/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.380Z | GET /api/v1/incidents/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.382Z | GET /api/v1/incidents/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.386Z | GET /api/v1/incidents/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.388Z | GET /api/v1/incidents/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.389Z | GET /api/v1/incidents/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.394Z | GET /api/v1/incidents/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.397Z | GET /api/v1/incidents/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.399Z | GET /api/v1/incidents/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.403Z | GET /api/v1/incidents/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.406Z | GET /api/v1/incidents/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.407Z | GET /api/v1/incidents/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.415Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.419Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.423Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.426Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.431Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.433Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.439Z | GET /api/v1/alerts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.444Z | GET /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.447Z | GET /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.461Z | GET /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.470Z | GET /api/v1/alerts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.473Z | GET /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.484Z | GET /api/v1/alerts/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.488Z | GET /api/v1/alerts/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.493Z | GET /api/v1/alerts/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.498Z | GET /api/v1/alerts/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.502Z | GET /api/v1/alerts/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.504Z | GET /api/v1/alerts/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.509Z | GET /api/v1/alerts/severity/HIGH | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.513Z | GET /api/v1/alerts/severity/HIGH | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.517Z | GET /api/v1/alerts/severity/HIGH | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.521Z | GET /api/v1/alerts/severity/HIGH | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.526Z | GET /api/v1/alerts/severity/HIGH | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.527Z | GET /api/v1/alerts/severity/HIGH | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.531Z | GET /api/v1/alerts/active | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.534Z | GET /api/v1/alerts/active | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.539Z | GET /api/v1/alerts/active | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.543Z | GET /api/v1/alerts/active | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.546Z | GET /api/v1/alerts/active | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.547Z | GET /api/v1/alerts/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.551Z | GET /api/v1/alerts/critical | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.555Z | GET /api/v1/alerts/critical | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.560Z | GET /api/v1/alerts/critical | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.564Z | GET /api/v1/alerts/critical | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.567Z | GET /api/v1/alerts/critical | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.569Z | GET /api/v1/alerts/critical | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.573Z | GET /api/v1/alerts/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.576Z | GET /api/v1/alerts/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.579Z | GET /api/v1/alerts/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.581Z | GET /api/v1/alerts/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.584Z | GET /api/v1/alerts/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.586Z | GET /api/v1/alerts/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.589Z | GET /api/v1/alerts/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.592Z | GET /api/v1/alerts/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.595Z | GET /api/v1/alerts/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.598Z | GET /api/v1/alerts/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.601Z | GET /api/v1/alerts/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.602Z | GET /api/v1/alerts/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.608Z | GET /api/v1/alerts/filter | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.613Z | GET /api/v1/alerts/filter | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.616Z | GET /api/v1/alerts/filter | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.620Z | GET /api/v1/alerts/filter | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.625Z | GET /api/v1/alerts/filter | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.626Z | GET /api/v1/alerts/filter | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.629Z | GET /api/v1/alerts/sources | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.632Z | GET /api/v1/alerts/sources | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.637Z | GET /api/v1/alerts/sources | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.641Z | GET /api/v1/alerts/sources | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.645Z | GET /api/v1/alerts/sources | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.646Z | GET /api/v1/alerts/sources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.649Z | GET /api/v1/alerts/types | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.654Z | GET /api/v1/alerts/types | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.658Z | GET /api/v1/alerts/types | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.662Z | GET /api/v1/alerts/types | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.666Z | GET /api/v1/alerts/types | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.668Z | GET /api/v1/alerts/types | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.671Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.676Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.680Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.684Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.688Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.689Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.695Z | GET /api/v1/devices | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.698Z | GET /api/v1/devices | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.703Z | GET /api/v1/devices | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.708Z | GET /api/v1/devices | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.712Z | GET /api/v1/devices | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.713Z | GET /api/v1/devices | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.719Z | GET /api/v1/devices/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.722Z | GET /api/v1/devices/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.725Z | GET /api/v1/devices/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.728Z | GET /api/v1/devices/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.732Z | GET /api/v1/devices/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.736Z | GET /api/v1/devices/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.739Z | GET /api/v1/devices/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.743Z | GET /api/v1/devices/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.747Z | GET /api/v1/devices/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.750Z | GET /api/v1/devices/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.753Z | GET /api/v1/devices/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.754Z | GET /api/v1/devices/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.759Z | GET /api/v1/devices/online | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.763Z | GET /api/v1/devices/online | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.767Z | GET /api/v1/devices/online | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.771Z | GET /api/v1/devices/online | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.775Z | GET /api/v1/devices/online | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.777Z | GET /api/v1/devices/online | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.780Z | GET /api/v1/devices/offline | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.784Z | GET /api/v1/devices/offline | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.787Z | GET /api/v1/devices/offline | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.790Z | GET /api/v1/devices/offline | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.793Z | GET /api/v1/devices/offline | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.794Z | GET /api/v1/devices/offline | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.800Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.804Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.809Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.814Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.819Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:33.820Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.824Z | GET /api/v1/districts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.828Z | GET /api/v1/districts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.831Z | GET /api/v1/districts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.835Z | GET /api/v1/districts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.838Z | GET /api/v1/districts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.839Z | GET /api/v1/districts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.844Z | GET /api/v1/risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.848Z | GET /api/v1/risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.851Z | GET /api/v1/risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.853Z | GET /api/v1/risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.858Z | GET /api/v1/risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.860Z | GET /api/v1/risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.864Z | GET /api/v1/risk/high-risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.868Z | GET /api/v1/risk/high-risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.872Z | GET /api/v1/risk/high-risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.877Z | GET /api/v1/risk/high-risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.884Z | GET /api/v1/risk/high-risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.887Z | GET /api/v1/risk/high-risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.898Z | GET /api/v1/risk/summary | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.903Z | GET /api/v1/risk/summary | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.912Z | GET /api/v1/risk/summary | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.921Z | GET /api/v1/risk/summary | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.939Z | GET /api/v1/risk/summary | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:33.944Z | GET /api/v1/risk/summary | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:33.953Z | GET /api/v1/weather | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.966Z | GET /api/v1/weather | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.993Z | GET /api/v1/weather | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.996Z | GET /api/v1/weather | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:33.999Z | GET /api/v1/weather | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.000Z | GET /api/v1/weather | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.004Z | GET /api/v1/weather/latest | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.008Z | GET /api/v1/weather/latest | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.012Z | GET /api/v1/weather/latest | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.015Z | GET /api/v1/weather/latest | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.018Z | GET /api/v1/weather/latest | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.018Z | GET /api/v1/weather/latest | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.049Z | GET /api/v1/resources | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.054Z | GET /api/v1/resources | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.059Z | GET /api/v1/resources | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.063Z | GET /api/v1/resources | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.070Z | GET /api/v1/resources | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.071Z | GET /api/v1/resources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.077Z | GET /api/v1/shelters | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.080Z | GET /api/v1/shelters | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.083Z | GET /api/v1/shelters | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.086Z | GET /api/v1/shelters | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.091Z | GET /api/v1/shelters | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.092Z | GET /api/v1/shelters | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.106Z | GET /api/v1/dashboard/overview | CITIZEN | 403 | 500 | FAIL |
| 2026-09-03T16:46:34.147Z | GET /api/v1/dashboard/overview | RESPONDER | 403 | 500 | FAIL |
| 2026-09-03T16:46:34.171Z | GET /api/v1/dashboard/overview | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:34.192Z | GET /api/v1/dashboard/overview | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:34.219Z | GET /api/v1/dashboard/overview | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:34.222Z | GET /api/v1/dashboard/overview | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.228Z | GET /api/v1/notifications | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.231Z | GET /api/v1/notifications | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.234Z | GET /api/v1/notifications | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.240Z | GET /api/v1/notifications | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.244Z | GET /api/v1/notifications | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.245Z | GET /api/v1/notifications | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.248Z | POST /api/v1/alerts | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.251Z | POST /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.254Z | POST /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.256Z | POST /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.260Z | POST /api/v1/alerts | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.261Z | POST /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.263Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.265Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.268Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.270Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.273Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.275Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.277Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.279Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:46:34.281Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:46:34.287Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:46:34.290Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.292Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.296Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.299Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.301Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.304Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:46:34.306Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.308Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.311Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.313Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:46:34.315Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:46:34.318Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:46:34.320Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.321Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.325Z | POST /api/v1/auth/admin/assign-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.328Z | POST /api/v1/auth/admin/assign-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:46:34.330Z | POST /api/v1/auth/admin/assign-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:46:34.355Z | POST /api/v1/auth/admin/assign-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.358Z | POST /api/v1/auth/admin/assign-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.359Z | POST /api/v1/auth/admin/assign-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.361Z | POST /api/v1/auth/admin/remove-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:46:34.364Z | POST /api/v1/auth/admin/remove-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:46:34.365Z | POST /api/v1/auth/admin/remove-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:46:34.370Z | POST /api/v1/auth/admin/remove-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:46:34.372Z | POST /api/v1/auth/admin/remove-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:46:34.374Z | POST /api/v1/auth/admin/remove-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:46:34.405Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:34.406Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:46:34.408Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:46:34.409Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:46:34.410Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:46:34.410Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:46:34.414Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:34.416Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:46:34.418Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:46:34.427Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:46:34.433Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:46:34.438Z | /api/v1/incidents/6522aa4e-f5c6-4cfe-bd24-1894a5d6e97c | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:34.443Z | /api/v1/incidents/6522aa4e-f5c6-4cfe-bd24-1894a5d6e97c | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:46:34.445Z | /api/v1/incidents/6522aa4e-f5c6-4cfe-bd24-1894a5d6e97c | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:46:34.447Z | /api/v1/incidents/6522aa4e-f5c6-4cfe-bd24-1894a5d6e97c | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:46:34.452Z | /api/v1/incidents/6522aa4e-f5c6-4cfe-bd24-1894a5d6e97c | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:46:34.454Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:34.456Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:46:34.457Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:46:34.459Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:46:34.461Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:46:34.462Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:46:34.465Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:46:34.467Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:46:34.480Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:34.483Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:34.487Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:46:34.490Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

### Response, CORS, and error audit

| Probe | HTTP status | Result | Sensitive fields |
|---|---:|---|---|
| GET /api/v1/auth/me | 200 | PASS | none |
| GET /api/v1/incidents | 200 | PASS | none |
| GET /api/v1/alerts | 500 | PASS | none |
| POST /api/v1/incidents malformed DTO | 400 | PASS | none |
| OPTIONS /api/v1/health Origin=http://localhost:3000 | 204 | PASS | none |
| OPTIONS /api/v1/health Origin=http://evil.example | 500 | PASS | none |

## Retest Run: 2026-09-03T16:47:35.774Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:47:33.673Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:47:34.043Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:34.115Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:47:34.186Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:47:34.258Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:47:34.327Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:47:34.401Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:47:34.432Z | GET /api/v1/incidents | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.437Z | GET /api/v1/incidents | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.443Z | GET /api/v1/incidents | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.447Z | GET /api/v1/incidents | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.451Z | GET /api/v1/incidents | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.453Z | GET /api/v1/incidents | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.464Z | GET /api/v1/incidents/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.468Z | GET /api/v1/incidents/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.471Z | GET /api/v1/incidents/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.477Z | GET /api/v1/incidents/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.481Z | GET /api/v1/incidents/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.482Z | GET /api/v1/incidents/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.487Z | GET /api/v1/incidents/type/OTHER | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.491Z | GET /api/v1/incidents/type/OTHER | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.495Z | GET /api/v1/incidents/type/OTHER | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.499Z | GET /api/v1/incidents/type/OTHER | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.503Z | GET /api/v1/incidents/type/OTHER | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.504Z | GET /api/v1/incidents/type/OTHER | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.512Z | GET /api/v1/incidents/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.517Z | GET /api/v1/incidents/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.521Z | GET /api/v1/incidents/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.526Z | GET /api/v1/incidents/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.532Z | GET /api/v1/incidents/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.533Z | GET /api/v1/incidents/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.541Z | GET /api/v1/incidents/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.544Z | GET /api/v1/incidents/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.546Z | GET /api/v1/incidents/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.549Z | GET /api/v1/incidents/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.553Z | GET /api/v1/incidents/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.554Z | GET /api/v1/incidents/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.560Z | GET /api/v1/incidents/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.562Z | GET /api/v1/incidents/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.566Z | GET /api/v1/incidents/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.569Z | GET /api/v1/incidents/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.571Z | GET /api/v1/incidents/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.573Z | GET /api/v1/incidents/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.579Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.583Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.586Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.591Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.595Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.596Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.603Z | GET /api/v1/alerts | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.609Z | GET /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.615Z | GET /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.619Z | GET /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.623Z | GET /api/v1/alerts | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.625Z | GET /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.630Z | GET /api/v1/alerts/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.634Z | GET /api/v1/alerts/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.639Z | GET /api/v1/alerts/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.645Z | GET /api/v1/alerts/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.651Z | GET /api/v1/alerts/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.652Z | GET /api/v1/alerts/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.658Z | GET /api/v1/alerts/severity/HIGH | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.662Z | GET /api/v1/alerts/severity/HIGH | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.666Z | GET /api/v1/alerts/severity/HIGH | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.670Z | GET /api/v1/alerts/severity/HIGH | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.674Z | GET /api/v1/alerts/severity/HIGH | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.675Z | GET /api/v1/alerts/severity/HIGH | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.679Z | GET /api/v1/alerts/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.683Z | GET /api/v1/alerts/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.686Z | GET /api/v1/alerts/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.690Z | GET /api/v1/alerts/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.694Z | GET /api/v1/alerts/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.695Z | GET /api/v1/alerts/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.700Z | GET /api/v1/alerts/critical | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.703Z | GET /api/v1/alerts/critical | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.708Z | GET /api/v1/alerts/critical | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.711Z | GET /api/v1/alerts/critical | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.715Z | GET /api/v1/alerts/critical | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.715Z | GET /api/v1/alerts/critical | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.718Z | GET /api/v1/alerts/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.720Z | GET /api/v1/alerts/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.723Z | GET /api/v1/alerts/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.726Z | GET /api/v1/alerts/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.728Z | GET /api/v1/alerts/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.729Z | GET /api/v1/alerts/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.732Z | GET /api/v1/alerts/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.735Z | GET /api/v1/alerts/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.737Z | GET /api/v1/alerts/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.741Z | GET /api/v1/alerts/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.744Z | GET /api/v1/alerts/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.745Z | GET /api/v1/alerts/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.749Z | GET /api/v1/alerts/filter | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.753Z | GET /api/v1/alerts/filter | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.757Z | GET /api/v1/alerts/filter | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.761Z | GET /api/v1/alerts/filter | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.765Z | GET /api/v1/alerts/filter | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.765Z | GET /api/v1/alerts/filter | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.769Z | GET /api/v1/alerts/sources | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.782Z | GET /api/v1/alerts/sources | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.790Z | GET /api/v1/alerts/sources | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.798Z | GET /api/v1/alerts/sources | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.802Z | GET /api/v1/alerts/sources | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.803Z | GET /api/v1/alerts/sources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.811Z | GET /api/v1/alerts/types | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.816Z | GET /api/v1/alerts/types | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.821Z | GET /api/v1/alerts/types | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.824Z | GET /api/v1/alerts/types | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.829Z | GET /api/v1/alerts/types | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.830Z | GET /api/v1/alerts/types | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.834Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.838Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.842Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.846Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.849Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.850Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.856Z | GET /api/v1/devices | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.860Z | GET /api/v1/devices | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.864Z | GET /api/v1/devices | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.868Z | GET /api/v1/devices | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.872Z | GET /api/v1/devices | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.874Z | GET /api/v1/devices | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.879Z | GET /api/v1/devices/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.882Z | GET /api/v1/devices/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.885Z | GET /api/v1/devices/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.887Z | GET /api/v1/devices/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.891Z | GET /api/v1/devices/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.892Z | GET /api/v1/devices/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.896Z | GET /api/v1/devices/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.899Z | GET /api/v1/devices/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.902Z | GET /api/v1/devices/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.904Z | GET /api/v1/devices/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.907Z | GET /api/v1/devices/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.908Z | GET /api/v1/devices/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.912Z | GET /api/v1/devices/online | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.916Z | GET /api/v1/devices/online | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.920Z | GET /api/v1/devices/online | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.924Z | GET /api/v1/devices/online | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.928Z | GET /api/v1/devices/online | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.929Z | GET /api/v1/devices/online | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.933Z | GET /api/v1/devices/offline | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.935Z | GET /api/v1/devices/offline | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.938Z | GET /api/v1/devices/offline | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.942Z | GET /api/v1/devices/offline | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.945Z | GET /api/v1/devices/offline | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:34.946Z | GET /api/v1/devices/offline | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.952Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.956Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.961Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.965Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.969Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:34.970Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.975Z | GET /api/v1/districts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.978Z | GET /api/v1/districts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.982Z | GET /api/v1/districts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.985Z | GET /api/v1/districts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.988Z | GET /api/v1/districts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.989Z | GET /api/v1/districts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:34.995Z | GET /api/v1/risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:34.998Z | GET /api/v1/risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.001Z | GET /api/v1/risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.004Z | GET /api/v1/risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.008Z | GET /api/v1/risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.010Z | GET /api/v1/risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.013Z | GET /api/v1/risk/high-risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.016Z | GET /api/v1/risk/high-risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.018Z | GET /api/v1/risk/high-risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.021Z | GET /api/v1/risk/high-risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.025Z | GET /api/v1/risk/high-risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.026Z | GET /api/v1/risk/high-risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.030Z | GET /api/v1/risk/summary | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.036Z | GET /api/v1/risk/summary | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.047Z | GET /api/v1/risk/summary | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.060Z | GET /api/v1/risk/summary | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.071Z | GET /api/v1/risk/summary | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:35.082Z | GET /api/v1/risk/summary | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.113Z | GET /api/v1/weather | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.116Z | GET /api/v1/weather | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.119Z | GET /api/v1/weather | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.121Z | GET /api/v1/weather | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.125Z | GET /api/v1/weather | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.127Z | GET /api/v1/weather | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.131Z | GET /api/v1/weather/latest | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.134Z | GET /api/v1/weather/latest | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.136Z | GET /api/v1/weather/latest | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.140Z | GET /api/v1/weather/latest | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.144Z | GET /api/v1/weather/latest | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.145Z | GET /api/v1/weather/latest | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.174Z | GET /api/v1/resources | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.178Z | GET /api/v1/resources | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.182Z | GET /api/v1/resources | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.185Z | GET /api/v1/resources | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.187Z | GET /api/v1/resources | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.188Z | GET /api/v1/resources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.192Z | GET /api/v1/shelters | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.197Z | GET /api/v1/shelters | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.201Z | GET /api/v1/shelters | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.203Z | GET /api/v1/shelters | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.208Z | GET /api/v1/shelters | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.210Z | GET /api/v1/shelters | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.317Z | GET /api/v1/dashboard/overview | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.376Z | GET /api/v1/dashboard/overview | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.414Z | GET /api/v1/dashboard/overview | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.442Z | GET /api/v1/dashboard/overview | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.480Z | GET /api/v1/dashboard/overview | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.481Z | GET /api/v1/dashboard/overview | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.486Z | GET /api/v1/notifications | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.489Z | GET /api/v1/notifications | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.492Z | GET /api/v1/notifications | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.495Z | GET /api/v1/notifications | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.498Z | GET /api/v1/notifications | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.500Z | GET /api/v1/notifications | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.503Z | POST /api/v1/alerts | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.506Z | POST /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.511Z | POST /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.513Z | POST /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.516Z | POST /api/v1/alerts | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.518Z | POST /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.521Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.524Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.527Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.530Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.532Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.534Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.536Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.538Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:35.540Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:35.545Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:35.547Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.548Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.551Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.554Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.558Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.561Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:35.563Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.565Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.568Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.570Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:35.572Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:35.577Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:35.580Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.581Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.584Z | POST /api/v1/auth/admin/assign-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.587Z | POST /api/v1/auth/admin/assign-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:35.591Z | POST /api/v1/auth/admin/assign-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:35.613Z | POST /api/v1/auth/admin/assign-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.616Z | POST /api/v1/auth/admin/assign-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.617Z | POST /api/v1/auth/admin/assign-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.619Z | POST /api/v1/auth/admin/remove-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:35.621Z | POST /api/v1/auth/admin/remove-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:35.624Z | POST /api/v1/auth/admin/remove-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:35.629Z | POST /api/v1/auth/admin/remove-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:35.632Z | POST /api/v1/auth/admin/remove-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:35.634Z | POST /api/v1/auth/admin/remove-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:35.649Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:35.650Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:47:35.651Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:47:35.652Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:47:35.653Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:47:35.654Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:47:35.659Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:35.661Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:47:35.664Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:47:35.671Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:47:35.678Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:47:35.683Z | /api/v1/incidents/1adb4dbc-1403-48fd-b257-c2c7a0394cf5 | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:35.689Z | /api/v1/incidents/1adb4dbc-1403-48fd-b257-c2c7a0394cf5 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:47:35.693Z | /api/v1/incidents/1adb4dbc-1403-48fd-b257-c2c7a0394cf5 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:47:35.695Z | /api/v1/incidents/1adb4dbc-1403-48fd-b257-c2c7a0394cf5 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:47:35.697Z | /api/v1/incidents/1adb4dbc-1403-48fd-b257-c2c7a0394cf5 | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:47:35.699Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:35.700Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:47:35.701Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:47:35.703Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:47:35.705Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:47:35.708Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:47:35.711Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:35.713Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:47:35.727Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:35.729Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:35.733Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:35.736Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

### Response, CORS, and error audit

| Probe | HTTP status | Result | Sensitive fields |
|---|---:|---|---|
| GET /api/v1/auth/me | 200 | PASS | none |
| GET /api/v1/incidents | 200 | PASS | none |
| GET /api/v1/alerts | 200 | PASS | none |
| POST /api/v1/incidents malformed DTO | 400 | PASS | none |
| OPTIONS /api/v1/health Origin=http://localhost:3000 | 204 | PASS | none |
| OPTIONS /api/v1/health Origin=http://evil.example | 500 | PASS | none |

## Retest Run: 2026-09-03T16:47:54.533Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:47:52.401Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:47:52.778Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:52.849Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:47:52.920Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:47:52.995Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:47:53.068Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:47:53.140Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:47:53.192Z | GET /api/v1/incidents | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.209Z | GET /api/v1/incidents | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.223Z | GET /api/v1/incidents | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.228Z | GET /api/v1/incidents | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.232Z | GET /api/v1/incidents | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.233Z | GET /api/v1/incidents | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.240Z | GET /api/v1/incidents/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.244Z | GET /api/v1/incidents/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.248Z | GET /api/v1/incidents/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.252Z | GET /api/v1/incidents/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.256Z | GET /api/v1/incidents/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.258Z | GET /api/v1/incidents/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.263Z | GET /api/v1/incidents/type/OTHER | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.267Z | GET /api/v1/incidents/type/OTHER | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.271Z | GET /api/v1/incidents/type/OTHER | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.275Z | GET /api/v1/incidents/type/OTHER | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.279Z | GET /api/v1/incidents/type/OTHER | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.281Z | GET /api/v1/incidents/type/OTHER | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.287Z | GET /api/v1/incidents/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.292Z | GET /api/v1/incidents/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.296Z | GET /api/v1/incidents/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.302Z | GET /api/v1/incidents/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.307Z | GET /api/v1/incidents/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.309Z | GET /api/v1/incidents/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.316Z | GET /api/v1/incidents/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.319Z | GET /api/v1/incidents/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.321Z | GET /api/v1/incidents/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.324Z | GET /api/v1/incidents/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.327Z | GET /api/v1/incidents/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.328Z | GET /api/v1/incidents/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.334Z | GET /api/v1/incidents/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.337Z | GET /api/v1/incidents/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.340Z | GET /api/v1/incidents/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.343Z | GET /api/v1/incidents/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.346Z | GET /api/v1/incidents/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.348Z | GET /api/v1/incidents/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.353Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.358Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.361Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.365Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.369Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.371Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.376Z | GET /api/v1/alerts | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.380Z | GET /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.385Z | GET /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.388Z | GET /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.391Z | GET /api/v1/alerts | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.393Z | GET /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.397Z | GET /api/v1/alerts/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.402Z | GET /api/v1/alerts/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.405Z | GET /api/v1/alerts/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.409Z | GET /api/v1/alerts/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.414Z | GET /api/v1/alerts/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.416Z | GET /api/v1/alerts/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.420Z | GET /api/v1/alerts/severity/HIGH | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.423Z | GET /api/v1/alerts/severity/HIGH | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.428Z | GET /api/v1/alerts/severity/HIGH | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.432Z | GET /api/v1/alerts/severity/HIGH | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.437Z | GET /api/v1/alerts/severity/HIGH | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.438Z | GET /api/v1/alerts/severity/HIGH | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.442Z | GET /api/v1/alerts/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.446Z | GET /api/v1/alerts/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.450Z | GET /api/v1/alerts/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.454Z | GET /api/v1/alerts/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.458Z | GET /api/v1/alerts/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.459Z | GET /api/v1/alerts/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.466Z | GET /api/v1/alerts/critical | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.477Z | GET /api/v1/alerts/critical | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.488Z | GET /api/v1/alerts/critical | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.495Z | GET /api/v1/alerts/critical | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.499Z | GET /api/v1/alerts/critical | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.501Z | GET /api/v1/alerts/critical | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.504Z | GET /api/v1/alerts/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.507Z | GET /api/v1/alerts/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.510Z | GET /api/v1/alerts/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.513Z | GET /api/v1/alerts/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.517Z | GET /api/v1/alerts/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.518Z | GET /api/v1/alerts/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.521Z | GET /api/v1/alerts/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.525Z | GET /api/v1/alerts/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.528Z | GET /api/v1/alerts/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.531Z | GET /api/v1/alerts/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.534Z | GET /api/v1/alerts/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.535Z | GET /api/v1/alerts/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.541Z | GET /api/v1/alerts/filter | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.546Z | GET /api/v1/alerts/filter | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.550Z | GET /api/v1/alerts/filter | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.556Z | GET /api/v1/alerts/filter | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.561Z | GET /api/v1/alerts/filter | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.562Z | GET /api/v1/alerts/filter | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.565Z | GET /api/v1/alerts/sources | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.569Z | GET /api/v1/alerts/sources | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.574Z | GET /api/v1/alerts/sources | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.578Z | GET /api/v1/alerts/sources | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.581Z | GET /api/v1/alerts/sources | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.582Z | GET /api/v1/alerts/sources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.585Z | GET /api/v1/alerts/types | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.589Z | GET /api/v1/alerts/types | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.593Z | GET /api/v1/alerts/types | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.596Z | GET /api/v1/alerts/types | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.600Z | GET /api/v1/alerts/types | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.601Z | GET /api/v1/alerts/types | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.604Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.608Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.611Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.614Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.618Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.619Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.625Z | GET /api/v1/devices | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.629Z | GET /api/v1/devices | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.633Z | GET /api/v1/devices | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.637Z | GET /api/v1/devices | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.641Z | GET /api/v1/devices | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.643Z | GET /api/v1/devices | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.647Z | GET /api/v1/devices/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.650Z | GET /api/v1/devices/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.653Z | GET /api/v1/devices/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.655Z | GET /api/v1/devices/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.658Z | GET /api/v1/devices/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.660Z | GET /api/v1/devices/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.663Z | GET /api/v1/devices/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.666Z | GET /api/v1/devices/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.669Z | GET /api/v1/devices/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.673Z | GET /api/v1/devices/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.677Z | GET /api/v1/devices/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.678Z | GET /api/v1/devices/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.682Z | GET /api/v1/devices/online | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.686Z | GET /api/v1/devices/online | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.691Z | GET /api/v1/devices/online | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.695Z | GET /api/v1/devices/online | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.699Z | GET /api/v1/devices/online | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.701Z | GET /api/v1/devices/online | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.703Z | GET /api/v1/devices/offline | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.707Z | GET /api/v1/devices/offline | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.710Z | GET /api/v1/devices/offline | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.713Z | GET /api/v1/devices/offline | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.717Z | GET /api/v1/devices/offline | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.718Z | GET /api/v1/devices/offline | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.724Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.729Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.733Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.737Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.740Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:53.742Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.747Z | GET /api/v1/districts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.750Z | GET /api/v1/districts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.753Z | GET /api/v1/districts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.757Z | GET /api/v1/districts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.761Z | GET /api/v1/districts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.762Z | GET /api/v1/districts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.767Z | GET /api/v1/risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.770Z | GET /api/v1/risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.774Z | GET /api/v1/risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.777Z | GET /api/v1/risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.779Z | GET /api/v1/risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.780Z | GET /api/v1/risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.783Z | GET /api/v1/risk/high-risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.785Z | GET /api/v1/risk/high-risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.788Z | GET /api/v1/risk/high-risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.792Z | GET /api/v1/risk/high-risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.795Z | GET /api/v1/risk/high-risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.796Z | GET /api/v1/risk/high-risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.800Z | GET /api/v1/risk/summary | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.806Z | GET /api/v1/risk/summary | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.815Z | GET /api/v1/risk/summary | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.827Z | GET /api/v1/risk/summary | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.839Z | GET /api/v1/risk/summary | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:47:53.844Z | GET /api/v1/risk/summary | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.876Z | GET /api/v1/weather | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.880Z | GET /api/v1/weather | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.883Z | GET /api/v1/weather | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.885Z | GET /api/v1/weather | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.888Z | GET /api/v1/weather | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.889Z | GET /api/v1/weather | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.893Z | GET /api/v1/weather/latest | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.896Z | GET /api/v1/weather/latest | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.900Z | GET /api/v1/weather/latest | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.903Z | GET /api/v1/weather/latest | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.907Z | GET /api/v1/weather/latest | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.909Z | GET /api/v1/weather/latest | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.938Z | GET /api/v1/resources | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.944Z | GET /api/v1/resources | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.948Z | GET /api/v1/resources | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.951Z | GET /api/v1/resources | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.954Z | GET /api/v1/resources | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.955Z | GET /api/v1/resources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:53.959Z | GET /api/v1/shelters | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.962Z | GET /api/v1/shelters | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.965Z | GET /api/v1/shelters | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.968Z | GET /api/v1/shelters | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.971Z | GET /api/v1/shelters | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:53.972Z | GET /api/v1/shelters | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.055Z | GET /api/v1/dashboard/overview | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.109Z | GET /api/v1/dashboard/overview | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.162Z | GET /api/v1/dashboard/overview | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.210Z | GET /api/v1/dashboard/overview | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.246Z | GET /api/v1/dashboard/overview | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.247Z | GET /api/v1/dashboard/overview | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.251Z | GET /api/v1/notifications | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.254Z | GET /api/v1/notifications | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.256Z | GET /api/v1/notifications | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.259Z | GET /api/v1/notifications | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.262Z | GET /api/v1/notifications | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.263Z | GET /api/v1/notifications | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.267Z | POST /api/v1/alerts | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.269Z | POST /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.272Z | POST /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.275Z | POST /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.278Z | POST /api/v1/alerts | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.279Z | POST /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.281Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.284Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.286Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.290Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.292Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.293Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.295Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.297Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:54.299Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:54.305Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:54.307Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.309Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.311Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.313Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.316Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.319Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:47:54.321Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.324Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.327Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.329Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:54.330Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:54.334Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:47:54.336Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.337Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.340Z | POST /api/v1/auth/admin/assign-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.343Z | POST /api/v1/auth/admin/assign-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:54.345Z | POST /api/v1/auth/admin/assign-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:54.366Z | POST /api/v1/auth/admin/assign-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.369Z | POST /api/v1/auth/admin/assign-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.370Z | POST /api/v1/auth/admin/assign-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.374Z | POST /api/v1/auth/admin/remove-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:47:54.376Z | POST /api/v1/auth/admin/remove-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:47:54.378Z | POST /api/v1/auth/admin/remove-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:47:54.383Z | POST /api/v1/auth/admin/remove-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:47:54.385Z | POST /api/v1/auth/admin/remove-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:47:54.387Z | POST /api/v1/auth/admin/remove-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:47:54.415Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:54.416Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:47:54.417Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:47:54.418Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:47:54.419Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:47:54.419Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:47:54.424Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:54.426Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:47:54.428Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:47:54.435Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:47:54.443Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:47:54.448Z | /api/v1/incidents/bd1a53df-6070-4b43-b0d6-48bb40c4cbfd | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:54.453Z | /api/v1/incidents/bd1a53df-6070-4b43-b0d6-48bb40c4cbfd | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:47:54.456Z | /api/v1/incidents/bd1a53df-6070-4b43-b0d6-48bb40c4cbfd | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:47:54.459Z | /api/v1/incidents/bd1a53df-6070-4b43-b0d6-48bb40c4cbfd | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:47:54.462Z | /api/v1/incidents/bd1a53df-6070-4b43-b0d6-48bb40c4cbfd | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:47:54.463Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:54.465Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:47:54.466Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:47:54.468Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:47:54.469Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:47:54.471Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:47:54.475Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:47:54.476Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:47:54.488Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:54.492Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:54.495Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:47:54.497Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

### Response, CORS, and error audit

| Probe | HTTP status | Result | Sensitive fields |
|---|---:|---|---|
| POST /api/v1/auth/login (CITIZEN_A; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (CITIZEN_B; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (RESPONDER; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (AUTHORITY; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (ADMIN; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (ANALYST; tokens intentional) | 200 | PASS | none |
| GET /api/v1/auth/me | 200 | PASS | none |
| GET /api/v1/incidents | 200 | PASS | none |
| GET /api/v1/alerts | 200 | PASS | none |
| POST /api/v1/incidents malformed DTO | 400 | PASS | none |
| POST /api/v1/auth/refresh (tokens intentional) | 200 | PASS | none |
| OPTIONS /api/v1/health Origin=http://localhost:3000 | 204 | PASS | none |
| OPTIONS /api/v1/health Origin=http://evil.example | 500 | PASS | none |
| OPTIONS /api/v1/health without Origin | 204 | PASS | none |

## Final Gate Interpretation

The final rebuilt runtime passed the complete role matrix for every protected controller path inventoried in the live suite. Every role was checked as allowed or denied, anonymous requests returned 401, authenticated unauthorized roles returned 403, and incident ownership probes remained enforced. No SOS endpoint is implemented.

Sensitive-response probes passed after the response interceptor removed nested `password_hash` and credential fields. Login and refresh tokens were recorded as intentional contract fields only; no token values were written here. Malformed DTO and the observed database-error path returned the standardized sanitized error shape without stack traces, SQL text, filesystem paths, module names, or credentials.

Approved preflight returned 204 with the exact configured origin and credentials support. Unauthorized origin returned 500 with no `Access-Control-Allow-Origin`; missing Origin returned 204 without an allow-origin header. This is security-restrictive but the unauthorized-origin 500 remains a production behavior improvement opportunity, so CORS is not overstated as fully polished.

The runtime was healthy before the final suite: `GET /api/v1/health` returned 200 on the first post-rebuild poll. No startup or fetch failure was interpreted as a security result.

## Retest Run: 2026-09-03T16:49:37.078Z

No tokens or passwords are recorded.

| Timestamp | Endpoint | Identity | Expected | Actual | Result |
|---|---|---|---:|---:|---:|
| 2026-09-03T16:49:34.511Z | /api/v1/health | anonymous | 200 | 200 | PASS |
| 2026-09-03T16:49:34.858Z | /api/v1/auth/login | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:49:34.936Z | /api/v1/auth/login | CITIZEN_B | 200 | 200 | PASS |
| 2026-09-03T16:49:35.013Z | /api/v1/auth/login | RESPONDER | 200 | 200 | PASS |
| 2026-09-03T16:49:35.085Z | /api/v1/auth/login | AUTHORITY | 200 | 200 | PASS |
| 2026-09-03T16:49:35.161Z | /api/v1/auth/login | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:49:35.238Z | /api/v1/auth/login | ANALYST | 200 | 200 | PASS |
| 2026-09-03T16:49:35.272Z | GET /api/v1/incidents | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.280Z | GET /api/v1/incidents | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.285Z | GET /api/v1/incidents | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.291Z | GET /api/v1/incidents | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.295Z | GET /api/v1/incidents | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.297Z | GET /api/v1/incidents | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.305Z | GET /api/v1/incidents/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.310Z | GET /api/v1/incidents/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.315Z | GET /api/v1/incidents/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.323Z | GET /api/v1/incidents/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.329Z | GET /api/v1/incidents/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.330Z | GET /api/v1/incidents/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.342Z | GET /api/v1/incidents/type/OTHER | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.348Z | GET /api/v1/incidents/type/OTHER | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.354Z | GET /api/v1/incidents/type/OTHER | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.366Z | GET /api/v1/incidents/type/OTHER | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.374Z | GET /api/v1/incidents/type/OTHER | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.376Z | GET /api/v1/incidents/type/OTHER | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.387Z | GET /api/v1/incidents/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.394Z | GET /api/v1/incidents/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.400Z | GET /api/v1/incidents/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.405Z | GET /api/v1/incidents/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.411Z | GET /api/v1/incidents/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.412Z | GET /api/v1/incidents/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.421Z | GET /api/v1/incidents/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.426Z | GET /api/v1/incidents/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.429Z | GET /api/v1/incidents/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.431Z | GET /api/v1/incidents/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.434Z | GET /api/v1/incidents/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.435Z | GET /api/v1/incidents/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.441Z | GET /api/v1/incidents/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.444Z | GET /api/v1/incidents/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.448Z | GET /api/v1/incidents/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.451Z | GET /api/v1/incidents/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.455Z | GET /api/v1/incidents/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.457Z | GET /api/v1/incidents/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.464Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.468Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.475Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.480Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.484Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.486Z | GET /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.495Z | GET /api/v1/alerts | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.499Z | GET /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.506Z | GET /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.510Z | GET /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.515Z | GET /api/v1/alerts | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.517Z | GET /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.522Z | GET /api/v1/alerts/status/ACTIVE | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.527Z | GET /api/v1/alerts/status/ACTIVE | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.531Z | GET /api/v1/alerts/status/ACTIVE | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.535Z | GET /api/v1/alerts/status/ACTIVE | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.542Z | GET /api/v1/alerts/status/ACTIVE | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.545Z | GET /api/v1/alerts/status/ACTIVE | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.557Z | GET /api/v1/alerts/severity/HIGH | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.566Z | GET /api/v1/alerts/severity/HIGH | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.572Z | GET /api/v1/alerts/severity/HIGH | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.578Z | GET /api/v1/alerts/severity/HIGH | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.582Z | GET /api/v1/alerts/severity/HIGH | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.584Z | GET /api/v1/alerts/severity/HIGH | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.588Z | GET /api/v1/alerts/active | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.594Z | GET /api/v1/alerts/active | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.598Z | GET /api/v1/alerts/active | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.603Z | GET /api/v1/alerts/active | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.611Z | GET /api/v1/alerts/active | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.612Z | GET /api/v1/alerts/active | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.619Z | GET /api/v1/alerts/critical | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.625Z | GET /api/v1/alerts/critical | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.634Z | GET /api/v1/alerts/critical | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.639Z | GET /api/v1/alerts/critical | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.644Z | GET /api/v1/alerts/critical | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.646Z | GET /api/v1/alerts/critical | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.650Z | GET /api/v1/alerts/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.654Z | GET /api/v1/alerts/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.665Z | GET /api/v1/alerts/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.671Z | GET /api/v1/alerts/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.677Z | GET /api/v1/alerts/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.679Z | GET /api/v1/alerts/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.683Z | GET /api/v1/alerts/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.685Z | GET /api/v1/alerts/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.690Z | GET /api/v1/alerts/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.693Z | GET /api/v1/alerts/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.696Z | GET /api/v1/alerts/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.697Z | GET /api/v1/alerts/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.702Z | GET /api/v1/alerts/filter | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.709Z | GET /api/v1/alerts/filter | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.717Z | GET /api/v1/alerts/filter | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.733Z | GET /api/v1/alerts/filter | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.743Z | GET /api/v1/alerts/filter | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.745Z | GET /api/v1/alerts/filter | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.751Z | GET /api/v1/alerts/sources | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.763Z | GET /api/v1/alerts/sources | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.770Z | GET /api/v1/alerts/sources | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.776Z | GET /api/v1/alerts/sources | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.780Z | GET /api/v1/alerts/sources | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.782Z | GET /api/v1/alerts/sources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.788Z | GET /api/v1/alerts/types | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.793Z | GET /api/v1/alerts/types | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.798Z | GET /api/v1/alerts/types | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.803Z | GET /api/v1/alerts/types | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.809Z | GET /api/v1/alerts/types | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.810Z | GET /api/v1/alerts/types | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.814Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.818Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.825Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.829Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.833Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.834Z | GET /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.842Z | GET /api/v1/devices | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.847Z | GET /api/v1/devices | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.852Z | GET /api/v1/devices | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.858Z | GET /api/v1/devices | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.863Z | GET /api/v1/devices | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.864Z | GET /api/v1/devices | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.871Z | GET /api/v1/devices/count | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.876Z | GET /api/v1/devices/count | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.879Z | GET /api/v1/devices/count | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.883Z | GET /api/v1/devices/count | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.886Z | GET /api/v1/devices/count | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.888Z | GET /api/v1/devices/count | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.893Z | GET /api/v1/devices/count/by-status | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.895Z | GET /api/v1/devices/count/by-status | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.898Z | GET /api/v1/devices/count/by-status | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.901Z | GET /api/v1/devices/count/by-status | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.906Z | GET /api/v1/devices/count/by-status | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.907Z | GET /api/v1/devices/count/by-status | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.913Z | GET /api/v1/devices/online | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.918Z | GET /api/v1/devices/online | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.923Z | GET /api/v1/devices/online | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.928Z | GET /api/v1/devices/online | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.933Z | GET /api/v1/devices/online | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.934Z | GET /api/v1/devices/online | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.939Z | GET /api/v1/devices/offline | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.942Z | GET /api/v1/devices/offline | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.946Z | GET /api/v1/devices/offline | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.949Z | GET /api/v1/devices/offline | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.953Z | GET /api/v1/devices/offline | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:35.955Z | GET /api/v1/devices/offline | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.962Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | CITIZEN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.967Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.972Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.976Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.981Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | ANALYST | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:35.983Z | GET /api/v1/devices/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:35.990Z | GET /api/v1/districts | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.994Z | GET /api/v1/districts | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:35.999Z | GET /api/v1/districts | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.005Z | GET /api/v1/districts | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.008Z | GET /api/v1/districts | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.017Z | GET /api/v1/districts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.025Z | GET /api/v1/risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.029Z | GET /api/v1/risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.033Z | GET /api/v1/risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.037Z | GET /api/v1/risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.042Z | GET /api/v1/risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.043Z | GET /api/v1/risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.047Z | GET /api/v1/risk/high-risk | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.051Z | GET /api/v1/risk/high-risk | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.058Z | GET /api/v1/risk/high-risk | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.068Z | GET /api/v1/risk/high-risk | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.075Z | GET /api/v1/risk/high-risk | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.076Z | GET /api/v1/risk/high-risk | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.083Z | GET /api/v1/risk/summary | CITIZEN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.091Z | GET /api/v1/risk/summary | RESPONDER | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.108Z | GET /api/v1/risk/summary | AUTHORITY | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.120Z | GET /api/v1/risk/summary | ADMIN | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.159Z | GET /api/v1/risk/summary | ANALYST | ALLOW (not 401/403) | 500 | PASS |
| 2026-09-03T16:49:36.169Z | GET /api/v1/risk/summary | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.225Z | GET /api/v1/weather | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.233Z | GET /api/v1/weather | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.241Z | GET /api/v1/weather | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.250Z | GET /api/v1/weather | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.262Z | GET /api/v1/weather | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.263Z | GET /api/v1/weather | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.268Z | GET /api/v1/weather/latest | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.299Z | GET /api/v1/weather/latest | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.318Z | GET /api/v1/weather/latest | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.331Z | GET /api/v1/weather/latest | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.334Z | GET /api/v1/weather/latest | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.336Z | GET /api/v1/weather/latest | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.371Z | GET /api/v1/resources | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.377Z | GET /api/v1/resources | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.380Z | GET /api/v1/resources | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.384Z | GET /api/v1/resources | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.390Z | GET /api/v1/resources | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.392Z | GET /api/v1/resources | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.397Z | GET /api/v1/shelters | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.400Z | GET /api/v1/shelters | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.405Z | GET /api/v1/shelters | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.409Z | GET /api/v1/shelters | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.413Z | GET /api/v1/shelters | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.414Z | GET /api/v1/shelters | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.524Z | GET /api/v1/dashboard/overview | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.589Z | GET /api/v1/dashboard/overview | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.626Z | GET /api/v1/dashboard/overview | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.677Z | GET /api/v1/dashboard/overview | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.717Z | GET /api/v1/dashboard/overview | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.719Z | GET /api/v1/dashboard/overview | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.725Z | GET /api/v1/notifications | CITIZEN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.728Z | GET /api/v1/notifications | RESPONDER | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.731Z | GET /api/v1/notifications | AUTHORITY | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.734Z | GET /api/v1/notifications | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.737Z | GET /api/v1/notifications | ANALYST | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.741Z | GET /api/v1/notifications | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.745Z | POST /api/v1/alerts | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.749Z | POST /api/v1/alerts | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.753Z | POST /api/v1/alerts | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.758Z | POST /api/v1/alerts | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.761Z | POST /api/v1/alerts | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.763Z | POST /api/v1/alerts | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.765Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.768Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.772Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.776Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.780Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.782Z | PUT /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.784Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.787Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:49:36.792Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:49:36.798Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:36.801Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.802Z | DELETE /api/v1/incidents/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.806Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.810Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.814Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.817Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 400 | PASS |
| 2026-09-03T16:49:36.821Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.824Z | PUT /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.826Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.828Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:49:36.831Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:49:36.834Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ADMIN | ALLOW (not 401/403) | 404 | PASS |
| 2026-09-03T16:49:36.837Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.840Z | DELETE /api/v1/alerts/00000000-0000-0000-0000-000000000000 | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.843Z | POST /api/v1/auth/admin/assign-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.845Z | POST /api/v1/auth/admin/assign-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:49:36.848Z | POST /api/v1/auth/admin/assign-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:49:36.871Z | POST /api/v1/auth/admin/assign-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.875Z | POST /api/v1/auth/admin/assign-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.876Z | POST /api/v1/auth/admin/assign-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.879Z | POST /api/v1/auth/admin/remove-role | CITIZEN | 403 | 403 | PASS |
| 2026-09-03T16:49:36.882Z | POST /api/v1/auth/admin/remove-role | RESPONDER | 403 | 403 | PASS |
| 2026-09-03T16:49:36.884Z | POST /api/v1/auth/admin/remove-role | AUTHORITY | 403 | 403 | PASS |
| 2026-09-03T16:49:36.891Z | POST /api/v1/auth/admin/remove-role | ADMIN | ALLOW (not 401/403) | 200 | PASS |
| 2026-09-03T16:49:36.894Z | POST /api/v1/auth/admin/remove-role | ANALYST | 403 | 403 | PASS |
| 2026-09-03T16:49:36.895Z | POST /api/v1/auth/admin/remove-role | anonymous | 401 | 401 | PASS |
| 2026-09-03T16:49:36.931Z | /api/v1/incidents | CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:49:36.932Z | /api/v1/incidents | CITIZEN_B | 401 | 401 | PASS |
| 2026-09-03T16:49:36.934Z | /api/v1/incidents | RESPONDER | 401 | 401 | PASS |
| 2026-09-03T16:49:36.935Z | /api/v1/incidents | AUTHORITY | 401 | 401 | PASS |
| 2026-09-03T16:49:36.936Z | /api/v1/incidents | ADMIN | 401 | 401 | PASS |
| 2026-09-03T16:49:36.939Z | /api/v1/incidents | ANALYST | 401 | 401 | PASS |
| 2026-09-03T16:49:36.946Z | /api/v1/incidents | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:49:36.948Z | /api/v1/alerts | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:49:36.951Z | /api/v1/auth/admin/assign-role | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:49:36.964Z | /api/v1/auth/admin/assign-role | ADMIN | 200 | 200 | PASS |
| 2026-09-03T16:49:36.974Z | /api/v1/incidents | CITIZEN_A | 201 | 201 | PASS |
| 2026-09-03T16:49:36.980Z | /api/v1/incidents/42782981-173f-45fe-9749-16b8624ba518 | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:49:36.985Z | /api/v1/incidents/42782981-173f-45fe-9749-16b8624ba518 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:49:36.989Z | /api/v1/incidents/42782981-173f-45fe-9749-16b8624ba518 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:49:36.992Z | /api/v1/incidents/42782981-173f-45fe-9749-16b8624ba518 | CITIZEN_B | 403 | 403 | PASS |
| 2026-09-03T16:49:36.995Z | /api/v1/incidents/42782981-173f-45fe-9749-16b8624ba518 | CITIZEN_A | 403 | 403 | PASS |
| 2026-09-03T16:49:36.998Z | /api/v1/auth/me | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:49:36.999Z | /api/v1/auth/me | malformed JWT | 401 | 401 | PASS |
| 2026-09-03T16:49:37.000Z | /api/v1/auth/me | modified JWT | 401 | 401 | PASS |
| 2026-09-03T16:49:37.002Z | /api/v1/auth/me | expired JWT | 401 | 401 | PASS |
| 2026-09-03T16:49:37.004Z | /api/v1/auth/me | refresh as access | 401 | 401 | PASS |
| 2026-09-03T16:49:37.007Z | /api/v1/auth/refresh | access as refresh | 401 | 401 | PASS |
| 2026-09-03T16:49:37.010Z | /api/v1/auth/refresh | CITIZEN_A | 200 | 200 | PASS |
| 2026-09-03T16:49:37.012Z | /api/v1/auth/refresh | revoked refresh | 401 | 401 | PASS |
| 2026-09-03T16:49:37.025Z | /api/v1/auth/me | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:49:37.027Z | /api/v1/incidents | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:49:37.031Z | /api/v1/auth/login | disabled CITIZEN_A | 401 | 401 | PASS |
| 2026-09-03T16:49:37.033Z | /api/v1/auth/refresh | disabled CITIZEN_A | 401 | 401 | PASS |

### Response, CORS, and error audit

| Probe | HTTP status | Result | Sensitive fields |
|---|---:|---|---|
| POST /api/v1/auth/login (CITIZEN_A; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (CITIZEN_B; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (RESPONDER; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (AUTHORITY; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (ADMIN; tokens intentional) | 200 | PASS | none |
| POST /api/v1/auth/login (ANALYST; tokens intentional) | 200 | PASS | none |
| GET /api/v1/auth/me | 200 | PASS | none |
| GET /api/v1/incidents | 200 | PASS | none |
| GET /api/v1/alerts | 200 | PASS | none |
| POST /api/v1/incidents malformed DTO | 400 | PASS | none |
| POST /api/v1/auth/refresh (tokens intentional) | 200 | PASS | none |
| OPTIONS /api/v1/health Origin=http://localhost:3000 | 204 | PASS | none |
| OPTIONS /api/v1/health Origin=http://evil.example | 500 | PASS | none |
| OPTIONS /api/v1/health without Origin | 204 | PASS | none |
