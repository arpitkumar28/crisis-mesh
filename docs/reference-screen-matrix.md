# CrisisMesh reference-screen implementation matrix

This matrix is derived from the supplied CrisisMesh reference images. The
reference images define the user experience; the existing NestJS, JWT, RBAC,
MQTT, Neon/PostGIS, Socket.IO, Next.js, and Flutter architecture remains the
implementation authority.

## Shared application contract

All protected screens require a JWT. The NestJS API, rather than either client,
is authoritative for authorization. Operational views subscribe to the existing
`telemetry.updated`, `device.status_changed`, `alert.created`, `alert.updated`,
`incident.created`, and `incident.updated` Socket.IO events.

| Domain | Existing data model | Required API surface | Roles |
| --- | --- | --- | --- |
| Identity | profiles, roles, user_roles | auth, profile, password reset/MFA/session APIs | all; admin manages roles |
| Geography/map | countries, states, districts, localities, geographic_locations | hierarchy, map features, district/location details | public read; operational write |
| Devices/sensors | devices, sensors, gateways, mesh_links, device_status_history | list, detail, sensor/history/network/health APIs | citizen read; responder/authority/admin according to operation |
| Telemetry/risk | sensor_readings, weather_observations, risk_assessments | latest values, history, aggregates, risk/weather APIs | public scoped read; operational write |
| Crisis response | alerts, incidents, responders, resources, shelters, evacuation_routes | CRUD/detail, assignment, workflow, routes, shelter/resource APIs | citizen report/read; responder and authority workflows |
| Communication | notifications, official_notices, news_articles, audit_logs | notification, notices/news, audit/broadcast APIs | scoped per recipient; authority/admin manage |

## A. Public and authentication

| Reference screen | Web route | Mobile screen | API/domain | RBAC |
| --- | --- | --- | --- | --- |
| Landing / public disaster overview | `/` | public home | public dashboard, alerts, weather, map | public |
| Live national map | `/map` | live map | locations, alerts, incidents, devices | public/citizen |
| District overview | `/districts/[id]` | district intelligence | districts, risk, weather, shelters | public/citizen |
| Login | `/login` | login | auth login/session | public |
| Registration | `/register` | register | auth registration | public → CITIZEN |
| Password recovery/reset | `/forgot-password`, `/reset-password` | forgot/new password | password-reset tokens and audit records | public |
| MFA and session security | `/security/mfa`, `/security/sessions` | MFA/session management | MFA factors, sessions (migration required) | authenticated |
| Authority login | `/authority/login` | authority login | auth + role validation | AUTHORITY/ADMIN |

## B. Citizen screens

| Reference screen | Web route | Mobile screen | API/domain | RBAC |
| --- | --- | --- | --- | --- |
| Citizen dashboard | `/citizen/dashboard` | citizen home | scoped alerts, incidents, shelters, notifications | CITIZEN |
| Alerts list/detail | `/citizen/alerts`, `/alerts/[id]` | alerts/alert detail | alerts | CITIZEN |
| Citizen live map and nearby safety | `/citizen/map` | map | locations, alerts, shelters, routes | CITIZEN |
| Incident reporting and report detail | `/report-incident`, `/incidents/[id]` | report/incident detail | incidents, geographic locations, attachments (migration required) | CITIZEN |
| SOS and tracking | `/sos` | SOS/SOS tracking | emergency requests (migration required), responders, notifications | CITIZEN |
| Shelters and safe zones | `/shelters` | nearby shelters | shelters, locations | CITIZEN |
| Safety tips, checklists, preparedness | `/safety` | safety tips/checklists | official notices, knowledge records (migration required) | public/CITIZEN |
| Weather, AQI, news, emergency contacts | `/weather`, `/air-quality`, `/news`, `/contacts` | matching mobile screens | weather_observations, news_articles, notices | public/CITIZEN |
| Citizen profile/settings/notifications/help | `/profile`, `/settings`, `/notifications`, `/support` | profile/settings/notifications/help | profiles, notifications, tickets (migration required) | CITIZEN |

## C. Responder screens

| Reference screen | Web route | Mobile screen | API/domain | RBAC |
| --- | --- | --- | --- | --- |
| Responder dashboard / field situation | `/responder/dashboard` | responder dashboard | assigned incidents, responder status, resources | RESPONDER |
| Assigned incident/detail/accept-reject | `/responder/incidents`, `/responder/incidents/[id]` | assigned/details/accept-reject | incidents, incident assignments/history (migration required) | RESPONDER |
| Response map, navigation, safe route | `/responder/map`, `/responder/navigation` | live response map/navigation | locations, evacuation_routes, responders | RESPONDER |
| Timeline/team/resource request/tracking | `/responder/timeline`, `/responder/team`, `/responder/resources` | matching mobile screens | incident history, responders, resources | RESPONDER |
| Shelter and evacuation operations | `/responder/shelters`, `/responder/evacuation` | shelter/evacuation screens | shelters, evacuation operations (migration required) | RESPONDER |
| Field report/evidence/offline sync | `/responder/report`, `/responder/sync` | field report/evidence/offline sync | incidents, media attachments, sync queue (migration required) | RESPONDER |
| Availability, notifications and emergency SOS | `/responder/availability`, `/responder/notifications`, `/responder/sos` | matching screens | responders, notifications, SOS | RESPONDER |
| Responder profile/security | `/responder/profile` | responder profile | responders, profiles, certification | RESPONDER |

## D. Authority and administrator screens

| Reference screen group | Web route family | Required API/domain | RBAC |
| --- | --- | --- | --- |
| Command center and final operational overview | `/dashboard`, `/command-center` | aggregate command-center API, live alerts/incidents/devices | AUTHORITY/ADMIN/ANALYST |
| Live map, district intelligence, risk/heatmap/GIS | `/map`, `/districts/[id]`, `/risk`, `/gis` | locations, risk assessments, districts, map layers | AUTHORITY/ADMIN/ANALYST |
| Device registry, detail, sensor dashboard/network/history | `/devices`, `/devices/[id]`, `/sensors`, `/sensor-network`, `/data-history` | devices, sensors, telemetry, gateways/links | AUTHORITY/ADMIN/ANALYST |
| Alerts center, creation and approval workflow | `/alerts`, `/alerts/[id]`, `/alerts/new`, `/alerts/approvals` | alerts, approval workflow/history (migration required) | AUTHORITY/ADMIN; RESPONDER create scoped |
| Incidents center, detail, response timeline and creation | `/incidents`, `/incidents/[id]`, `/incidents/new`, `/incidents/[id]/timeline` | incidents, assignments, timeline/history (migration required) | AUTHORITY/ADMIN/RESPONDER |
| Resource, shelter, evacuation, volunteers and supply chain | `/resources`, `/shelters`, `/evacuation`, `/volunteers`, `/supply-chain` | existing resources/shelters/routes plus deployments/volunteers/suppliers (migrations required) | AUTHORITY/ADMIN/RESPONDER |
| Weather, early warning, environment, crowd, power | `/weather`, `/early-warning`, `/environment`, `/crowd`, `/power` | weather/risk plus observation feeds (some migrations required) | AUTHORITY/ADMIN/ANALYST |
| Reports, analytics, impact, AI, simulator, drones | `/reports`, `/analytics`, `/impact`, `/ai-insights`, `/simulator`, `/drones` | reports/exports, simulation, risk/impact, drone feed metadata (migrations required) | AUTHORITY/ADMIN/ANALYST |
| Users, roles, settings, audit, security, health, backup, integrations | `/users`, `/roles`, `/settings`, `/audit-logs`, `/security`, `/system-health`, `/backups`, `/integrations` | profiles/roles/audit plus admin configuration tables (migrations required) | ADMIN; limited AUTHORITY scopes |
| Communication, multilingual, media, feedback, support, knowledge, transparency | `/communications`, `/languages`, `/media`, `/feedback`, `/support`, `/knowledge`, `/transparency` | notices/news/notifications plus content/support/feedback tables (migrations required) | authority/admin manage; public read where applicable |

## E. Shared cross-platform states

Every route above must provide loading, empty, error, network-failure, and
unauthorized states. Lists require pagination/filtering; detail views require
not-found states. Map pages must use actual PostGIS-backed locations and show
the reference empty state when none exists. No operational value may be
hardcoded.

## F. Mobile reference inventory

The references include authentication/onboarding, citizen home/map/alerts/
weather/AQI/shelters/contacts/news/location/language/reporting/SOS/safety/
preparedness/checklists/training/profile/notifications/support; responder
dashboard/incidents/map/navigation/timeline/team/resources/evacuation/shelter/
field-report/evidence/offline/SOS/availability/notifications; authority
dashboard/situation/district intelligence/alerts/alert creation and approval/
incident command/sensor intelligence/resource deployment/broadcast/responder
tracking/notifications/history; and shared security/session/MFA/privacy/sync
conflict/account-security screens.

## Implementation gate

Phase 5 runtime verification is complete: a real Mosquitto telemetry publish
was persisted through NestJS into Neon and received by an authenticated
Socket.IO client. Phase 6 implementation uses these production data paths.
