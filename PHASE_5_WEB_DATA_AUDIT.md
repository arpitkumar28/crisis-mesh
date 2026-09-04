# PHASE 5 — Web Data Architecture Audit

Scope: `apps/web/src` (81 pages + 8 shared components) cross-referenced against the real NestJS API at `services/api/src` (18 controllers). Audit only — no frontend or backend code was modified for this document.

## 1. How to read this

- **Status** legend:
  - `REAL` — already wired to a real backend endpoint via `apiClient`.
  - `WIRABLE` — hardcoded today, but a matching real endpoint already exists; just needs frontend wiring.
  - `PARTIAL` — a real endpoint exists for part of the page's data, but some fields/actions on the page have no backend support.
  - `BLOCKED-NO-BACKEND` — no backend endpoint, module, service, or entity exists for this data at all; backend work is required before the frontend can be fixed.
- Global backend facts: no global auth guard exists — every controller sets its own `JwtAuthGuard`/`RolesGuard`+`@Roles(...)`. Global API prefix is `/api`, so full paths are `/api/v1/...` (shown below without the `/api` prefix for brevity, matching how `apiClient` is configured). Roles enum: `CITIZEN, RESPONDER, AUTHORITY, ADMIN, ANALYST`.

---

## 2. Already REAL (no action needed)

| File | Page | Real endpoint(s) used |
|---|---|---|
| `apps/web/src/app/dashboard/page.tsx` | Operator dashboard | `GET /v1/dashboard/overview` |
| `apps/web/src/app/incidents/page.tsx` | Incidents list | `GET /v1/incidents` |
| `apps/web/src/app/incidents/[id]/page.tsx` | Incident detail | `GET /v1/incidents/:id` |
| `apps/web/src/app/alerts/page.tsx` | Alerts Center | `GET /v1/alerts` + WebSocket `alert.created`/`alert.updated` |
| `apps/web/src/app/devices/page.tsx` | Device registry | `GET /v1/devices`, `/v1/devices/status/:status` + WebSocket |
| `apps/web/src/app/sensors/page.tsx` | Environmental monitoring | `GET /v1/dashboard/overview` (telemetry slice) — **PARTIAL**: hardcoded fallback values (`'42'`, `'12'`, `'1013'`) render when live fields are missing, and the trend chart falls back to a fixed 2-point array |
| `apps/web/src/app/map/page.tsx`, `app/live-map/page.tsx` (re-export) | Command map | `GET /v1/incidents`, `GET /v1/alerts/active` |
| `apps/web/src/app/weather/page.tsx` | Weather | `GET /v1/public/weather/:lat/:lon` (fixed to Jaipur coords — not deceptive, just unconfigurable) |
| `apps/web/src/app/news/page.tsx` | News feed | `GET /v1/news` |
| `apps/web/src/app/page.tsx` | Public homepage | Weather + news real; marketing counters (`766` districts, `12k+` sensors, `2.4M` residents, `98.2%` mesh health, `5,400` shelters, `850` rescue units) are hardcoded editorial copy, not data claims — leave as-is or replace with `/v1/public/map` aggregate counts |
| `apps/web/src/app/login/page.tsx`, `register/page.tsx` | Auth | `POST /v1/auth/login`, `/register` |
| `apps/web/src/app/profile/page.tsx` | Operator profile | `GET/PUT /v1/auth/me` |
| `apps/web/src/components/information-feed.tsx` | Shared news/notifications feed | `GET /v1/news`, `/v1/notifications`, `PATCH /v1/notifications/:id/read` |
| `apps/web/src/components/response-directory.tsx` | Shared resources/shelters directory | `GET /v1/resources`, `/v1/shelters` — **built correctly, but not imported by any page** (orphaned; `app/resources/page.tsx` and `app/shelters/page.tsx` duplicate this concept with fake data instead of using it) |
| `apps/web/src/app/dashboard/page.tsx.backup` | Dead code | Real API calls present but file isn't routed — delete or ignore |

---

## 3. WIRABLE — real endpoint exists, frontend just needs to call it

| File | Hardcoded data found | Required real API | Endpoint | Method | Auth | RBAC | Response shape (key fields) |
|---|---|---|---|---|---|---|---|
| `app/incidents/create/page.tsx` | Static form, fixed `defaultValue`s, no submit handler | Create incident | `/v1/incidents` | POST | JWT | ADMIN, AUTHORITY, RESPONDER, CITIZEN | Body: `CreateIncidentDto{type, title, description?, location_id?, severity?, assigned_to?}` → `Incident` |
| `app/alerts/create/page.tsx` | Static form, fixed `defaultValue`, fake char counter | Create alert | `/v1/alerts` | POST | JWT | ADMIN, AUTHORITY, RESPONDER | Body: `CreateAlertDto{type, severity, title, description?, location_id?, expires_at?, affected_regions?, incident_id?}` → `Alert` |
| `app/sensors/[id]/page.tsx` | Entire page static; ignores `[id]` route param | Device + sensor detail | `/v1/devices/:id`, `/v1/devices/:id/sensors`, `/v1/telemetry/sensor/:sensorId` | GET | JWT | all incl. CITIZEN | `Device`, `Sensor[]`, `SensorReading[]` |
| `app/sensors/history/page.tsx` | `trendData`, `readings` arrays, fake quality % | Historical readings + aggregation | `/v1/telemetry/device/:deviceId` (or `/sensor/:sensorId`, `limit` query), `/v1/telemetry/aggregate/:deviceId/:metric` | GET | JWT | all incl. CITIZEN (aggregate: ADMIN/AUTHORITY/RESPONDER/ANALYST) | `SensorReading[]`, aggregate stats object |
| `app/sensors/network/page.tsx` | Fixed counts (`74`/`67`/`4`/`3`), fake per-type health bars | Device counts by type/status | `/v1/devices/count`, `/v1/devices/count/by-status`, `/v1/devices/type/:type` | GET | JWT | all incl. CITIZEN | counts, `Device[]` |
| `app/districts/page.tsx` | `districts` array (6 fake entries), fake national totals | District list + national rollups | `/v1/districts`, `/v1/districts/top-states`, `/v1/districts/top-districts` | GET | JWT | all 5 roles | `District[]{id,name,state,code,lat,lng,risk scores×5,description}` |
| `app/districts/[id]/page.tsx` | Always shows "Jaipur" regardless of `[id]`; fake risk/weather/resource numbers | District detail + intelligence | `/v1/districts/:id`, `/v1/districts/:id/intelligence`, weather via `/v1/weather/location/:locationId` | GET | JWT | all 5 roles | `District`, intelligence blob, `WeatherObservation` |
| `app/citizen/shelters/page.tsx` | `shelters` array (5 fake entries), fixed 80% occupancy bar | Shelter list | `/v1/shelters` | GET | JWT | all 5 roles | `Shelter{id,name,location_id,capacity,current_occupancy,type,facilities[],contact_phone,is_operational}` |
| `app/shelters/page.tsx` (operator) | `shelterList` (8 fake entries), fake totals | Shelter list (read-only) | `/v1/shelters` | GET | JWT | all 5 roles | same `Shelter[]` — **PARTIAL**: page implies capacity/occupancy editing, but no write endpoint exists (see §4) |
| `app/resources/page.tsx` | `assetStats`, `currentAssets`, `maintenanceAlerts` all fake | Resource list (read-only) | `/v1/resources` | GET | JWT | all 5 roles | `Resource{id,name,type,quantity,unit,location_id,status,assigned_to}` — **PARTIAL**: no create/update/maintenance-tracking endpoint exists |
| `app/citizen/page.tsx` | `updates` feed array, fixed stat tiles | Public alerts/map | `/v1/public/alerts/active`, `/v1/public/map` | GET | none (public) | — | `Alert[]`, `{alerts,incidents,devices}` |
| `app/citizen/profile/page.tsx` | Fully fake name/email/phone/address | Own profile | `/v1/auth/me` | GET/PUT | JWT | — | `{id,email,name,roles}` — **PARTIAL**: no `phone`/`address` fields confirmed on the User entity beyond `RegisterDto.phone?`; verify entity before wiring |
| `app/responder/profile/page.tsx` | Fully fake name/ID/unit | Own profile | `/v1/auth/me` | GET/PUT | JWT | — | `{id,email,name,roles}` — **PARTIAL**: "missions completed", "avg ETA" have no backend field (see §4) |
| `app/settings/gis/page.tsx` | Layer toggle states hardcoded | Underlying layer data already real | `/v1/public/map`, `/v1/devices`, `/v1/districts` | GET | mixed | — | Toggle UI itself is a frontend-only concern; only the *data per layer* is wirable |

---

## 4. BLOCKED — no backend endpoint exists (frontend cannot be fixed without backend work first)

Grouped by root cause.

### 4a. Entire domain missing (no controller, module, service, or entity)

| File(s) | Hardcoded data | Domain with no backend |
|---|---|---|
| `app/donations/page.tsx` | `donationData`, `topCampaigns`, `recentDonations` (fake donor names/amounts) | **Donations** — nothing exists anywhere in `services/api/src` |
| `app/volunteers/page.tsx` | `volunteers` array w/ fabricated phone numbers | **Volunteers** — nothing exists |
| `app/drones/page.tsx` | `droneStatus`, `drones[]`, static stock photo labeled "LIVE:" with fake HUD telemetry | **Drones** — nothing exists |
| `app/crowd/page.tsx` | `highDensityLocations`, fixed-position hotspot markers | **Crowd density** — nothing exists, not even a keyword in source |
| `app/evacuation/page.tsx`, `app/evacuation/route-planner/page.tsx` | `routeDetails`, evacuee counts (internally inconsistent numbers), fake transport counts | **Evacuation routing** — nothing exists; "evacuation" only appears as a news-classification keyword string |
| `app/logistics/page.tsx` | `inventoryItems`, `recentShipments`, `topSuppliers` | **Logistics/supply-chain** — only the generic read-only `Resource` exists (no shipments, no suppliers) |
| `app/connectivity/page.tsx` | `powerGridData`, `outageData`, uptime % | **Power/connectivity monitoring** — nothing exists |
| `app/reports/page.tsx` | `damageStats`, `impactSummary`, `recentAssessments` | **Damage/impact assessment & reports** — nothing exists |
| `app/community/page.tsx` | `communityStats`, `topCommunities` | **Community engagement** — nothing exists |
| `app/communication/page.tsx` | `channels`, `recentBroadcasts`, send stats | **Messaging/broadcast delivery tracking** — creating an alert exists (`POST /v1/alerts`), but channel-level delivery stats do not |
| `app/media/page.tsx` | `mediaStats`, `pressReleases`, fake contacts | **Press/media center** — nothing exists |
| `app/training/page.tsx` | `trainingStats`, `programs` | **Training/capacity building** — nothing exists |
| `app/feedback/page.tsx` | `surveyStats`, `feedbackSummary`, `topIssues` | **Citizen feedback/sentiment** — nothing exists |
| `app/settings/templates/page.tsx` | `templates[]` | **Notification templates** — nothing exists |
| `app/settings/tickets/page.tsx` | `tickets[]` | **Support tickets** — nothing exists |
| `app/settings/backup/page.tsx` | `backupStats`, `backupHistory` | **Backup/restore** — nothing exists |
| `app/settings/data-export/page.tsx` | `exportHistory` | **Data export** — nothing exists |
| `app/settings/data-management/page.tsx` | `storageData`, `retentionPolicies` | **Storage/retention management** — nothing exists |
| `app/settings/geofencing/page.tsx` | `geofences[]`, `rules[]` | **Geofencing** — nothing exists; districts only have point lat/lng, no polygons |
| `app/settings/integrations/page.tsx` | `integrations[]`, `webhooks[]` | **Integrations/webhook management** — no admin-facing config controller (NewsAPI/weather are hardcoded internal service calls, not manageable integrations) |
| `app/settings/languages/page.tsx` | `languageStats`, `announcements` | **Localization/translation** — nothing exists |
| `app/settings/mobile-app/page.tsx` | `appStats`, `versionHistory`, `platformData` | **Mobile app management** — nothing exists |
| `app/settings/offline-sync/page.tsx` | `syncStats`, `syncQueue` | **Offline sync tracking** — nothing exists |
| `app/settings/security/page.tsx` | `threatData`, `recentEvents` | **Security/threat monitoring** — nothing exists beyond basic JWT auth itself |
| `app/settings/system-health/page.tsx` | `performanceData` (CPU/RAM), `services[]` uptime table | **Infra metrics** — only `GET /v1/health` exists (basic liveness; DB/MQTT sub-fields are stubbed, never populated) |
| `app/settings/page.tsx` | Storage %, API latency, version | Same — no metrics endpoint beyond basic `/v1/health` |
| `app/settings/simulator/page.tsx` | `sensorNodes[]`, fake "Streaming Active" | **No dedicated simulator controller found.** A `SimulationModule` is registered in `app.module.ts` but exposes no REST controller (same pattern as `UsersModule`/`AuditModule`). The closest live capability is `POST /v1/test/mqtt-telemetry` (ADMIN-only diagnostic in `test.controller.ts`), which is not equivalent |

### 4b. Backend data/service exists internally, but no controller exposes it (cheapest fixes — need a small controller, not new domain modeling)

| File(s) | Hardcoded data | What already exists internally | Missing piece |
|---|---|---|---|
| `app/settings/audit-logs/page.tsx`, `app/activity/page.tsx` | `auditData`/`activityData` arrays (fake login/action events) | `AuditModule`, `AuditService`, `AuditLog` entity — presumably written internally on auth events | **No controller** — `AuditModule` registers `controllers: []`. Needs `GET /v1/audit-logs` (or similar) added |
| `app/settings/users/page.tsx` | `users[]` w/ fabricated `@crisismesh.gov.in` emails | `UsersModule`, `UsersService` — used internally by `AuthService` | **No controller** — `UsersModule` registers `controllers: []`. Needs `GET /v1/users`, `GET /v1/users/:id` added |
| `app/settings/roles/page.tsx` | `roles[]`, hardcoded permission checkboxes | `Role` enum exists in code (`CITIZEN, RESPONDER, AUTHORITY, ADMIN, ANALYST`), used by `@Roles()` decorators everywhere | No endpoint lists roles/permissions, and there is no per-permission (as opposed to per-role) model at all — this needs both a small controller and a data-model decision |

### 4c. Partially real, workflow gap

| File | Hardcoded data | What's real | What's missing |
|---|---|---|---|
| `app/alerts/approval/page.tsx` | `stats`, `pendingAlerts[]`, `alertHistory[]` | `GET /v1/alerts` (status filter), `PUT /v1/alerts/:id` | **No approval workflow.** `Alert.status` enum is `ACTIVE/RESOLVED/EXPIRED/CANCELLED` — there is no `PENDING`/`DRAFT` state, and `AlertsService.create()` broadcasts over WebSocket immediately with no second-role sign-off step. Implementing this page for real requires a backend/schema change (new status value + gated broadcast), not just frontend wiring |
| `app/alerts/broadcast-confirmation/page.tsx` | `deliveryData`, `channelStats` (SMS/push/email counts) | Alert creation itself is real | No delivery-channel tracking (sent/delivered/failed per channel) exists anywhere |
| `app/alerts/early-warning/page.tsx` | `warningStats`, `activeWarnings[]`, `hazardForecast[]`, channel reach counts | `GET /v1/alerts/active`, `GET /v1/risk/high-risk` cover "active warnings" | Hazard *forecast probabilities* (e.g. "92%") and subscriber/channel-reach counts (`156k`, `1.2M`) have no backend source |
| `app/citizen/report/page.tsx` | `previousReports[]` | `POST /v1/incidents` (CITIZEN allowed), `GET /v1/incidents` | No "my reports" scoping — `GET /v1/incidents` returns all incidents to every role including CITIZEN; there's no `reported_by=me` filter, so a citizen-scoped view must be built client-side today (a data-exposure smell worth a backend decision, not just a frontend fix) |
| `app/citizen/sos/page.tsx` | `nearestResponders[]` | `POST /v1/incidents` (type could represent an emergency) exists as the nearest analog | No SOS-specific endpoint, no responder-location/presence tracking, so "nearest responders" and ETA cannot be real without new backend work |
| `app/responder/page.tsx`, `app/responder/assignments/page.tsx` | `assignments[]`, team stats, canned chat | `GET /v1/incidents` has `assigned_to`, so "my assignments" is technically derivable | No dedicated `/v1/incidents?assigned_to=me` filter (must filter client-side from the full list); **team chat has no backend at all** (no messaging entity/endpoint) |
| `app/resources/live/page.tsx` | `resourceStats`, `activeResources[]` w/ live speed/position | `GET /v1/resources` (status/assigned_to only) | No live location/telemetry for vehicles/teams — `Resource` has no lat/lng or last-seen fields |
| `app/risk/page.tsx` | `rainfallForecast`, `highRiskAreas[]`, fixed "Model Accuracy 94.6%" | `GET /v1/risk`, `/v1/risk/high-risk`, `/v1/risk/summary` are real and return actual `RiskAssessment` records (risk_score, confidence, model_source) | The page's "Run Prediction" button and forecast-probability chart imply on-demand ML inference, which isn't exposed — only pre-computed/stored assessments are available via GET |
| `app/system-overview/page.tsx` | `recentActivity[]`, `Responders (Field) → 256`, uptime `99.92%` | `GET /v1/dashboard/overview` covers device/alert/incident counts | No responder headcount/presence tracking exists anywhere (consistent with no Users controller); "recent activity" needs the audit-log controller from §4b |
| `app/transparency/page.tsx` | Stat tiles, `NewsItem[]` | `GET /v1/public/alerts/stats`, `GET /v1/public/map` cover most counts | "Total Responders" has no backend source (same gap as above) |
| `app/states/page.tsx` | `states[]` (6 fake states) | `GET /v1/districts/top-states` returns district-level rollups | No state-level aggregate entity; would need client-side aggregation of district data grouped by `state`, or a new backend rollup endpoint |
| `app/notifications/page.tsx` (settings/preferences) | Toggle states, no persistence | `GET /v1/notifications`, `PATCH /v1/notifications/:id/read` exist for *reading* notifications | No endpoint to save channel/preference *settings* (this page is about preferences, not the notification list itself — different data than what exists) |

---

## 5. Static / no operational data (skip — no work needed)

`app/about`, `app/help`, `app/knowledge-base`, `app/safety`, `app/simple`, `app/mobile`, `app/developer` (its "endpoints" list is documentation text, not live data), `components/operations-shell.tsx`, `components/citizen-shell.tsx`, `components/responder-shell.tsx`, `components/public-information-page.tsx`, `components/auth-initializer.tsx`.

---

## 6. Notable integrity issues found (beyond plain hardcoding)

1. **`alerts.controller.ts` route-ordering bug**: `@Get(':id')` is declared before `@Get('filter')`/`@Get('sources')`/`@Get('types')`, so those three routes are currently unreachable (Nest matches `:id` first, treating `"filter"` etc. as an id). This silently breaks any frontend wiring to `GET /v1/alerts/filter|sources|types` until the backend route order is fixed — flagging since it blocks part of §3/§4c wiring even where a route "exists" on paper.
2. **`app/drones/page.tsx`** presents a static stock photo as a "LIVE" feed with fabricated HUD telemetry — the most misleading instance found, independent of the missing-backend issue.
3. **`components/response-directory.tsx`** is a correctly-real, already-built component for resources/shelters that no page currently imports — `app/resources/page.tsx` and `app/shelters/page.tsx` reinvent the same UI with fake data instead of reusing it.
4. **`app/dashboard/page.tsx.backup`** is real-API dead code sitting unrouted in the tree — candidate for deletion, not migration.
5. No file was found using `Math.random()` or `setInterval`-driven fake-value cycling to simulate live telemetry; the one genuine `setInterval` (`app/sensors/page.tsx`, 30s poll) re-fetches the real endpoint. No hardcoded `fetch()` calls or bypass URLs were found — all real traffic goes through the shared `apiClient`.

---

## 7. Recommended implementation order

1. **Fix `alerts.controller.ts` route ordering** (trivial, unblocks `/filter`, `/sources`, `/types` for the Alerts domain) — prerequisite for step 3.
2. **Wire the WIRABLE pages (§3)** — real endpoints already exist; this is the highest ROI phase, no backend work required. Suggested inner order: incident/alert creation forms → sensor/device detail & history pages → districts list/detail → shelters/resources (citizen + operator, converging both onto `components/response-directory.tsx` instead of duplicating it).
3. **Add the two missing controllers in §4b** (`UsersModule`, `AuditModule`) — small, low-risk backend additions (service/entity layers already exist) that unblock Users, Roles, Audit Logs, and Activity pages at once.
4. **Resolve the workflow gaps in §4c** one at a time, each requires a product decision plus a schema/endpoint change: alert approval state machine, "my incidents"/"my assignments" scoping (also a security question — CITIZEN currently sees all incidents), responder headcount/presence, state-level rollups.
5. **New-domain backend work (§4a)** — largest effort, lowest urgency for a Phase 5 "stop mocking existing screens" goal; recommend deferring to a dedicated Phase 6+ unless a specific domain (e.g., Volunteers or Donations) is a stated product priority.

## 8. Dependencies / blockers

- Steps 3–5 above require backend engineering (new controllers/entities/migrations) and are out of scope for a frontend-only Phase 5 — Phase 5 should be scoped to §3 (WIRABLE) plus the route-ordering fix, with §4 tracked as backend backlog.
- The CITIZEN-scoped incident/report visibility gap (§4c, `citizen/report`) is a data-exposure question that should get an explicit decision before any "my reports" UI ships, even client-side-filtered.
- `app/citizen/profile/page.tsx` and `app/responder/profile/page.tsx` wiring depends on confirming the actual `User` entity fields (phone/address/unit/badge-ID) beyond what `RegisterDto` shows — needs entity inspection before implementation.
