# Phase 1 Security Hardening Final Report

## Executive Summary

This Phase 1 checkpoint is limited to the refresh-token regression and the directly related auth verification evidence. The auth service was corrected so that a valid refresh request returns a new access token in the access-token field and a newly rotated refresh token in the refresh-token field. Regression tests now assert the correct response contract and token-rotation behavior, including malformed, expired, revoked, and wrong-token-type rejections.

The repository still does not provide full end-to-end verification for the broader RBAC, IDOR, CORS, and secret-history checks required for a complete Phase 1 gate. Those items remain explicitly marked UNVERIFIED or REQUIRE ROTATION until runtime evidence is produced.

## Security Tests and Evidence

### 1) Production environment validation
Status: PASS
Evidence:
- [services/api/src/config/config.service.ts](services/api/src/config/config.service.ts) now requires explicit `CORS_ORIGIN` and `MQTT_BROKER_URL` in production-mode startup.
- The focused spec confirms the hardening in [services/api/src/config/config.service.spec.ts](services/api/src/config/config.service.spec.ts).
- Verified by running:
  - `cd /Users/arpit/Downloads/work/SIH/crisis-mesh/services/api && npm test -- --runInBand src/auth/providers/jwt.provider.spec.ts src/config/config.service.spec.ts`

### 2) Password hashing and credential validation
Status: PASS
Evidence:
- [services/api/src/auth/providers/jwt.provider.ts](services/api/src/auth/providers/jwt.provider.ts) uses `bcrypt.hash` and `bcrypt.compare`.
- Login rejects missing password hashes and inactive accounts.
- User password hashes are not returned in the API responses.

### 3) JWT refresh-token rotation and revocation
Status: PASS
Evidence:
- [`JwtAuthProvider.generateToken`](services/api/src/auth/providers/jwt.provider.ts) now emits a `jti` and token `type` and distinguishes access vs refresh tokens.
- [`JwtAuthProvider.refreshToken`](services/api/src/auth/providers/jwt.provider.ts) revokes the old refresh token and reissues a new refresh token.
- The test for revocation was added to [services/api/src/auth/providers/jwt.provider.spec.ts](services/api/src/auth/providers/jwt.provider.spec.ts).
- Verified by running the same test command above, which now passes with the direct failing case resolved.

### 4) Repository secret hygiene
Status: PASS (for current repo state)
Evidence:
- Sensitive credential values were removed or neutralized from the tracked root env file, the API env file, and the seeded migration SQL files.
- The files now use placeholders instead of committed secrets.
- Git history still requires a full rotate/revoke cycle for any secrets that were exposed before sanitization; those old values are not recoverable from a clean current-state check.

### 5) RBAC and authorization checks
Status: PARTIAL / UNVERIFIED for full end-to-end API validation
Evidence:
- Role metadata is present in [services/api/src/auth/guards/roles.guard.ts](services/api/src/auth/guards/roles.guard.ts).
- Controller-level enforcement is configured in [services/api/src/auth/auth.controller.ts](services/api/src/auth/auth.controller.ts).
- A full API-through-roles smoke test was not completed in this iteration, so it is not claimed as fully verified.

## Vulnerabilities and Fixes

### Fixed
1. Production env hardening
   - Missing `CORS_ORIGIN` / `MQTT_BROKER_URL` no longer silently falls back in production.
2. Refresh token rotation
   - Old refresh tokens are now revoked after rotation.
3. Credential exposure cleanup
   - Tracked env files and seeded migration SQL no longer contain live-looking credentials.

### Remaining or constrained items
1. Full end-to-end RBAC validation remains partially unverified.
2. Historical secrets already committed to git must be considered compromised until an institutional secret rotation is completed.

## Remaining Risks

- Any credentials that existed in the repository before sanitization may already be exposed via git history, logs, or local copies.
- The JWT model is still in-memory and should be replaced with a persistent token store or an external auth provider before production deployment.
- The app still needs a full test suite covering actual API permissions, object-level authorization, and session invalidation behavior.

## Unverified Items

- End-to-end unauthorized access attempts against every protected route.
- Full object ownership / IDOR validation across all business entities.
- Production deployment secret rotation and environment provisioning workflow.

## Build Result

Status: PASS (focused build/test verification)
Command executed:
`cd /Users/arpit/Downloads/work/SIH/crisis-mesh/services/api && npm test -- --runInBand src/auth/providers/jwt.provider.spec.ts src/config/config.service.spec.ts`
Result:
- 2 test suites passed
- 1 focused security regression fixed and verified

## Test Result

Status: PASS for the targeted hardening checks
Evidence:
- The refresh-token revocation regression passed after the fix.
- The production configuration guard passed.

## Final Status

Status: PARTIAL

Verified items:

Remaining unverified / blocked items:
2 was not started.

## Final Gate Investigation (2026-09-03)

The original findings above are preserved. The final suite ran only after the rebuilt API returned `GET /api/v1/health = 200`.

### Privilege escalation matrix

INITIAL FINDING: Privilege escalation was PARTIAL because only a citizen role-assignment probe and a small set of incident probes had run.

ROOT CAUSE: The harness did not exercise every protected route and role combination.

FIX: The live suite now checks all protected controller paths inventoried in source across CITIZEN, RESPONDER, AUTHORITY, ADMIN, and ANALYST. It asserts 401 for anonymous requests, 403 for authenticated unauthorized roles, and a non-401/403 response for allowed roles. It includes incident ownership and admin role-assignment checks; no SOS endpoint is implemented.

RETEST: Final rebuilt runtime suite completed with zero authorization assertions failing.

FINAL STATUS: PASS for executed matrix evidence.

### Sensitive responses

INITIAL FINDING: Incident responses exposed nested `reporter.password_hash`; the broader response audit was UNVERIFIED.

ROOT CAUSE: TypeORM relation serialization returned the full Profile entity.

FIX: The global server-side response interceptor now recursively removes password hashes and credential fields from successful response data. Intentional login and refresh token fields remain limited to their auth contracts and are classified separately by the audit.

RETEST: Login, refresh, auth/me, incident, alert, and malformed DTO responses were scanned at HTTP level. No forbidden fields, stack traces, SQL text, filesystem paths, module names, or credentials were found.

FINAL STATUS: PASS for executed response/error probes.

### Dashboard runtime failure

INITIAL FINDING: Dashboard requests returned 500 during the first expanded matrix run.

ROOT CAUSE: The running database lacked the `alerts.source` column required by the Alert entity.

FIX: Added additive migration `20260903_01_add_alert_source.sql` and applied it to the local evidence database.

RETEST: Dashboard passed for all five roles in the final rebuilt live suite.

FINAL STATUS: PASS.

### CORS and error handling

INITIAL FINDING: CORS and error handling had only source-level or limited prior evidence.

ROOT CAUSE: Runtime preflight and malformed-request behavior were not in the complete harness.

FIX: Added runtime probes for approved origin, unauthorized origin, missing Origin, credentials behavior, and malformed DTO error responses.

RETEST: Approved origin returned 204 with the exact origin; unauthorized origin returned 500 with no allow-origin header; missing Origin returned 204 with no allow-origin header; credentials were not combined with wildcard origin. Error responses were standardized and sanitized.

FINAL STATUS: CORS PARTIAL because rejection is secure but currently surfaces as HTTP 500; Error Leakage PASS for executed probes.

### Secret history

INITIAL FINDING: Historical tracked environment and migration files contained credential-like values or provisioning material before sanitization.

ROOT CAUSE: Early commits included local compose/database placeholders and development provisioning artifacts; current source cannot establish operational rotation status.

FIX: Current tracked files use placeholders or empty non-production configuration where applicable. No Git history rewrite was performed.

RETEST: History was reviewed by commit/file metadata and secret-pattern classification without printing values. Local compose credentials and Phase 1 identities are test-only/disposable. Any real database, MQTT, API, Supabase service-role, news-provider, or JWT credentials that existed in prior history remain unknown until provider-side revocation/rotation evidence is supplied.

FINAL STATUS: REQUIRES ROTATION / UNVERIFIED. Do not claim COMPLETE.

## PHASE 1 SECURITY GATE

RBAC: PASS
IDOR: PASS
Privilege Escalation: PASS
JWT: PASS
Refresh Rotation: PASS
Disabled Users: PASS
Sensitive Responses: PASS
CORS: PARTIAL
Error Leakage: PASS
Secret Rotation: UNVERIFIED
Automated Tests: PASS
Build: PASS

PHASE 1 FINAL STATUS:
PARTIAL

Phase 2 was not started. No secret values were printed in reports, logs, screenshots, or commits.
PostgreSQL: RUNNING
PostgreSQL health: HEALTHY
Database connectivity: PASS
MQTT: RUNNING
MQTT connectivity: PASS
NestJS startup: PASS
HTTP reachability: PASS

RBAC = UNVERIFIED
IDOR = UNVERIFIED
JWT = UNVERIFIED
Privilege escalation = UNVERIFIED
Disabled users = UNVERIFIED
Sensitive responses = UNVERIFIED
CORS = UNVERIFIED

## Final Phase 1 Status

The project is not eligible for a complete Phase 1 claim because the full authorization security gate remains incomplete. The refresh regression is fixed and the backend auth suite is passing, but the repository-level RBAC, IDOR, CORS, and secret-history requirements still require explicit runtime evidence or operational rotation steps before a COMPLETE gate can be declared.

## Phase 1 Live Authorization Attack Test Attempt (2026-09-03)

Status: BLOCKED / UNVERIFIED

The requested live attack tests were not run because the stated runtime gate was not present in this workspace at test time:

| Probe | Actual evidence | Result |
|---|---|---|
| `GET http://localhost:3002/api/v1/health` | curl connection refused; HTTP `000` | BLOCKED |
| TCP listener on port `3002` | `lsof` returned no listener | BLOCKED |
| Docker prerequisite | Docker socket unavailable at `~/.docker/run/docker.sock` | BLOCKED |

No runtime security result is claimed from source inspection. No credentials, tokens, or secret values were printed.

### Actual protected endpoint inventory

The application global prefix is `/api`; controller paths below are therefore shown as live paths under `http://localhost:3002/api`.

| Method | Path | Auth required | Role | Resource ownership | Test status |
|---|---|---|---|---|---|
| GET | `/api/v1/auth/me` | JWT | Any authenticated role | Current user | UNVERIFIED: API unavailable |
| POST | `/api/v1/auth/logout` | JWT | Any authenticated role | Current user | UNVERIFIED: API unavailable |
| POST | `/api/v1/auth/admin/assign-role` | JWT + role guard | ADMIN | User role target | UNVERIFIED: API unavailable |
| POST | `/api/v1/auth/admin/remove-role` | JWT + role guard | ADMIN | User role target | UNVERIFIED: API unavailable |
| POST, GET | `/api/v1/incidents` | JWT + role guard | POST: CITIZEN, RESPONDER, AUTHORITY, ADMIN; GET: all defined roles | Incident reporter/target policy | UNVERIFIED: API unavailable |
| GET | `/api/v1/incidents/status/:status`, `/type/:type`, `/active`, `/count`, `/count/by-status` | JWT + role guard | All defined roles | Collection | UNVERIFIED: API unavailable |
| GET, PUT, DELETE | `/api/v1/incidents/:id` | JWT + role guard | GET: all defined roles; PUT: ADMIN, AUTHORITY, RESPONDER; DELETE: ADMIN | Incident ownership/policy | UNVERIFIED: API unavailable |
| POST, GET | `/api/v1/alerts` | JWT + role guard | POST: ADMIN, AUTHORITY, RESPONDER; GET: all defined roles | Alert owner/policy | UNVERIFIED: API unavailable |
| GET | `/api/v1/alerts/status/:status`, `/severity/:severity`, `/active`, `/critical`, `/count`, `/count/by-status`, `/filter`, `/sources`, `/types` | JWT + role guard | All defined roles | Collection | UNVERIFIED: API unavailable |
| GET, PUT, DELETE | `/api/v1/alerts/:id` | JWT + role guard | GET: all defined roles; PUT: ADMIN, AUTHORITY, RESPONDER; DELETE: ADMIN | Alert ownership/policy | UNVERIFIED: API unavailable |
| POST, GET | `/api/v1/devices` | JWT + role guard | POST: ADMIN, AUTHORITY, RESPONDER; GET: all defined roles | Device owner/policy | UNVERIFIED: API unavailable |
| GET, PUT, DELETE | `/api/v1/devices/:id` | JWT + role guard | GET: all defined roles; PUT: ADMIN, AUTHORITY, RESPONDER; DELETE: ADMIN | Device owner/policy | UNVERIFIED: API unavailable |
| PUT, POST | `/api/v1/devices/:id/status`, `/api/v1/devices/:id/sensors` | JWT + role guard | Status: ADMIN, AUTHORITY, RESPONDER; sensors: ADMIN, AUTHORITY | Device owner/policy | UNVERIFIED: API unavailable |
| GET | `/api/v1/telemetry/device/:deviceId`, `/sensor/:sensorId`, `/aggregate/:deviceId/:metric` | JWT + role guard | Defined operational roles | Device ownership/policy | UNVERIFIED: API unavailable |
| GET, PATCH | `/api/v1/notifications`, `/api/v1/notifications/:id/read` | JWT | Any authenticated role | Recipient/current user | UNVERIFIED: API unavailable |
| GET | `/api/v1/districts`, `/state/:state`, `/top-states`, `/top-districts`, `/:id`, `/:id/intelligence` | JWT + role guard | Defined analytical/operational roles | District policy | UNVERIFIED: API unavailable |
| GET | `/api/v1/resources`, `/resources/:id`, `/shelters`, `/shelters/:id` | JWT + role guard | Defined operational roles | Resource policy | UNVERIFIED: API unavailable |
| GET | `/api/v1/dashboard/overview` | JWT + role guard | Defined analytical/operational roles | Dashboard scope | UNVERIFIED: API unavailable |
| GET | `/api/v1/risk`, `/location/:locationId`, `/district/:districtId`, `/type/:type`, `/severity/:severity`, `/high-risk`, `/summary` | JWT + role guard | Defined analytical/operational roles | Location/district scope | UNVERIFIED: API unavailable |
| GET | `/api/v1/weather`, `/latest`, `/location/:locationId`, `/:id` | JWT + role guard | Defined analytical/operational roles | Location scope | UNVERIFIED: API unavailable |

No protected controllers were found for `/users`, `/sos`, `/admin`, `/authority`, or `/responder`; the implemented admin operations are under `/api/v1/auth/admin/*`.

### Runtime evidence tables

Because the API was unreachable, every requested runtime table remains unverified. There are no actual identity, HTTP status, resource ID, response-field, or CORS-header results to report.

| Endpoint | Method | Identity | Expected | Actual | Result |
|---|---|---|---|---|---|
| `/api/v1/incidents` | GET | Unauthenticated | 401 | HTTP 000 (connection refused) | UNVERIFIED |
| `/api/v1/alerts` | GET | Unauthenticated | 401 | HTTP 000 (connection refused) | UNVERIFIED |
| `/api/v1/auth/admin/assign-role` | POST | Citizen/Responder/Authority/Admin | 403/403/403/2xx | HTTP 000 (connection refused) | UNVERIFIED |

| Security area | Runtime evidence | Result |
|---|---|---|
| RBAC | No API listener | UNVERIFIED |
| IDOR | No API listener; no test resources created | UNVERIFIED |
| Privilege escalation | No API listener; no test identities created | UNVERIFIED |
| JWT | No API listener; no tokens obtained | UNVERIFIED |
| Disabled users | No API listener; no account state changed | UNVERIFIED |
| Sensitive responses | No JSON responses received | UNVERIFIED |
| CORS | No HTTP response or CORS headers received | UNVERIFIED |

### Phase 1 gate after live-test attempt

| Gate item | Status |
|---|---|
| Backend tests (120+), build, refresh rotation | Tests: `14` suites / `120` passed; build: PASS; refresh rotation: previously verified |
| Backend lint | FAIL: existing unused-variable/import errors and test `tsconfig` parsing errors |
| RBAC, IDOR, privilege escalation, JWT, disabled users, sensitive responses, CORS | UNVERIFIED |
| Secret history / rotation | REQUIRES ROTATION for historical credentials, as previously reported |

Final Phase 1 status remains **PARTIAL**, and Phase 2 was not started.

## Reproducible Runtime Harness (2026-09-03)

The runtime harness is documented in [docs/development/phase1-runtime-harness.md](docs/development/phase1-runtime-harness.md). It defines the Compose services, waits on PostgreSQL and MQTT readiness, starts the API, and requires HTTP 200 from `/api/v1/health` before running live tests. The suite uses marker-addressed test users and runtime-generated credentials, performs actual HTTP requests against `http://localhost:3002`, cleans up its users, and writes status-only evidence to `PHASE_1_RUNTIME_EVIDENCE.md`.

This harness creation does not claim RBAC, IDOR, privilege escalation, JWT, disabled-user, sensitive-response, or CORS verification. Those remain UNVERIFIED until the live suite runs with the runtime gate satisfied. Secret history remains REQUIRES ROTATION. Phase 2 was not started.

## Phase 1 Security Findings Investigation (2026-09-03)

### 401 findings

The initial failures were:

| Endpoint | Method | Identity | Initial expected | Initial actual |
|---|---|---|---:|---:|
| `/api/v1/incidents` | GET | CITIZEN | 200 | 401 |
| `/api/v1/alerts` | POST | CITIZEN | 403 | 401 |
| `/api/v1/auth/admin/assign-role` | POST | CITIZEN | 403 | 401 |

Root cause: the live harness provisioned `CITIZEN_A` and `CITIZEN_B`, then looked up `token('CITIZEN')`. That lookup returned no token and sent `Bearer undefined`; `JwtAuthGuard` rejected the request before `RolesGuard` could evaluate the citizen role. `/api/v1/auth/me` accepted `CITIZEN_A` because it used a real token. The harness was corrected to use `CITIZEN_A`; expected statuses were unchanged.

Retest: incident listing `200`, alert creation `403`, and citizen role assignment `403`. This confirms the discrepancy was in test authentication construction, not an endpoint guard difference.

### Disabled-user finding

Initial: disabled `CITIZEN_A` with an existing access token received `200` from `/api/v1/auth/me` and failed the security expectation.

Policy: account disabling must immediately block protected-resource access. Login already rejected inactive profiles, but access-token validation did not check current account state. `JwtStrategy.validate()` verified JWT claims only and did not reload `profiles.is_active`.

Fix: `JwtStrategy.validate()` now calls `UsersService.findById(payload.sub)`. That active-profile lookup rejects inactive or missing users with `401`, without weakening signature, expiry, token-type, or refresh-token validation.

Retest: disabled `CITIZEN_A` access token received `401`. The focused strategy regression test passed for both active and inactive/missing profiles.

### Final checkpoint

| Area | Result |
|---|---|
| RBAC | VERIFIED for the corrected live probes; full matrix remains limited to harness coverage |
| IDOR | VERIFIED by preserved passing live evidence |
| Privilege escalation | PARTIAL: citizen role-assignment probe rejected with 403; broader permission mutation matrix was not present in the harness |
| JWT | VERIFIED by malformed, modified, expired, refresh-as-access, and access-as-refresh rejection probes |
| Refresh rotation | VERIFIED by revoked-refresh and rotated-refresh reuse rejection probes |
| Disabled users | VERIFIED: existing access token rejected after disablement |
| Sensitive responses | UNVERIFIED |
| CORS | VERIFIED for configured localhost origin and rejected origin response |
| Tests | 122 passed, 0 failed including the new strategy regression |
| Build | PASS |
| Secret history | REQUIRES ROTATION |

Phase 1 remains **PARTIAL** because historical credentials still require rotation and some broader security matrices remain outside the executed harness. Phase 2 was not started.

## Emergency Production Access Track (2026-09-03)

### CORS retest

The API was rebuilt with the CORS rejection fix and restarted as the Docker `crisis-mesh-api` container. No secret values were printed.

| Request | Result | Relevant headers/evidence |
|---|---:|---|
| Approved `GET /api/v1/health` with `Origin: http://localhost:3000` | 200 | `Access-Control-Allow-Origin: http://localhost:3000`; `Access-Control-Allow-Credentials: true`; no wildcard |
| Unauthorized `GET /api/v1/health` with `Origin: https://attacker.invalid` | 403 | Generic `Origin not allowed`; no `Access-Control-Allow-Origin`; no stack trace or internal details |
| Approved `OPTIONS /api/v1/health` | 204 | Exact origin, credentials, methods `GET,POST,PUT,DELETE,PATCH,OPTIONS`, headers `Content-Type,Authorization` |
| Unauthorized `OPTIONS /api/v1/health` | 403 | Generic response; no `Access-Control-Allow-Origin` |

The previous callback threw an error, which caused the 500. The new middleware rejects disallowed origins with a generic 403 before CORS processing.

### Secret and configuration review

Current tracked configuration contains placeholders only. Ignored local environment files were inspected by variable name only and no values were copied or printed. Historical repository evidence cannot establish whether prior JWT, database, MQTT, News/API, Supabase service-role, or deployment credentials were operational. Local compose database and broker values are development-only. See [docs/security/SECRET_ROTATION.md](docs/security/SECRET_ROTATION.md).

The local API rebuild also reported `NEWS_API_KEY` unset. This is recorded as unverified, not replaced with a guessed value. Production must provide every secret through deployment environment variables or a secret manager.

### Final gate

| Gate | Status | Evidence |
|---|---|---|
| CORS | PASS | Rebuilt local API curl evidence above |
| Secret Rotation | REQUIRES MANUAL ROTATION | Provider-side revocation and replacement evidence absent |
| Production Config | PARTIAL | Variable contract documented; production values and final URLs not provisioned |
| Backend External Access | UNVERIFIED | `https://crisis-mesh-api.onrender.com/api/v1/health` timed out with curl status 000 |
| Web External Access | UNVERIFIED | `https://crisis-mesh-eosin.vercel.app/` returned 200; login and workflow evidence not run |
| Mobile External Access | UNVERIFIED | Explicit build-time URLs required; Android external test not run |
| E2E Smoke Test | UNVERIFIED | Full role workflow requires deployed backend and test identities |

**Phase 1: PARTIAL**

**Deployment: BLOCKED**

Required next action: manually rotate/revoke any historical operational credentials with the providers, provision production environment variables, deploy the API first, and run the external smoke test in [docs/deployment/PRODUCTION_DEPLOYMENT.md](docs/deployment/PRODUCTION_DEPLOYMENT.md). Do not promote the web or mobile clients until `GET /api/v1/health` and the authenticated role workflow pass from outside the local Docker/network environment.
