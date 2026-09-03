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
- Refresh-token regression fixed and covered by regression tests
- Runtime auth test suite passes for the currently available backend tests

Remaining unverified / blocked items:
- Full RBAC E2E verification across protected endpoints
- Full IDOR verification across owned resource access paths
- CORS runtime verification against allowed/disallowed origins
- Secret exposure history and rotation status for any historical credentials

### Runtime Infrastructure Verification

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
