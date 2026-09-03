# CrisisMesh production readiness report

Assessment date: 2026-09-03  
Scope: Phase 1 production recovery only. Phase 2 was not started.

## Deployment configuration matrix

| Variable / configuration | Source | Required? | Currently present? | Used by | Production value configured? | Safe? |
| --- | --- | ---: | --- | --- | --- | --- |
| `DATABASE_URL` | provider environment; `.env.example` documents shape | Yes | Repository contract: yes; provider: unverified | TypeORM | UNVERIFIED | Yes, if secret-managed and TLS-enabled |
| `MQTT_BROKER_URL` | provider environment; `.env.example` | Yes | Repository contract: yes; provider: unverified | MQTT service | UNVERIFIED | Only with authenticated TLS broker |
| MQTT username/password | provider environment | Conditional | `.env.example` names both; API client currently does not pass them to `mqtt.connect` | MQTT service | UNVERIFIED | No: implementation/configuration gap requires provider-backed remediation |
| `JWT_SECRET` | provider secret manager | Yes | Repository contract: yes; provider: unverified | JWT auth/refresh | UNVERIFIED | Only after rotation |
| JWT refresh configuration | application auth configuration | Yes | Code present; deployed behavior unverified | Auth service | UNVERIFIED | Only after secret rotation/session invalidation |
| `CORS_ORIGIN` | Render environment | Yes | Required by production code; deployed effective value fails external check | HTTP and Socket.IO CORS | FAIL | No |
| API base URL | public Render endpoint | Yes | Yes | web/mobile runtime | Yes: health only | Yes, pending functional smoke tests |
| WebSocket URL | public API origin + `/ws` | Yes | Source contract: yes; deployed handshake unverified | web/mobile Socket.IO | UNVERIFIED | Yes, pending authenticated test |
| `NEXT_PUBLIC_API_URL` | Vercel environment | Yes | Source requires it; Vercel setting uninspectable | web API client | UNVERIFIED | Yes, if public API origin only |
| `NEXT_PUBLIC_WS_URL` | Vercel environment | Yes | Source requires it; Vercel setting uninspectable | web Socket.IO client | UNVERIFIED | Yes, if public API origin only |
| Flutter `CRISISMESH_API_URL` | release build define | Yes | Source requires it; release build unavailable | mobile API client | UNVERIFIED | Yes, origin only |
| Flutter `CRISISMESH_WS_URL` | release build define | Yes | Source requires it; release build unavailable | mobile Socket.IO client | UNVERIFIED | Yes, origin only |
| Supabase URL / keys | provider environment if integration enabled | Conditional | Placeholders only in tracked example; provider uninspectable | optional integration | UNVERIFIED | Service-role key must remain server-only |
| `NEWS_API_KEY` | provider secret manager if news enabled | Conditional | Placeholder/empty in tracked example; provider uninspectable | news service | UNVERIFIED | Yes, server-only |
| weather endpoint | `OPEN_METEO_BASE_URL` or documented default | Conditional | Code/default documented | weather service | UNVERIFIED | Yes, non-secret configuration |
| Render `PORT` | provider runtime injection | Yes | API source honors `PORT`; provider value uninspectable | NestJS listener | UNVERIFIED | Yes |

## Evidence

- External API health: `https://crisis-mesh-api.onrender.com/api/v1/health` returned HTTP 200 with a valid JSON health response on 2026-09-03 17:12 IST. The response reported only API health and contained no secrets.
- External web root: `https://crisis-mesh-eosin.vercel.app/` returned HTTP 200 on 2026-09-03 17:12 IST.
- CORS: the configured production web origin and an unauthorized origin both received HTTP 200 without `Access-Control-Allow-Origin`; approved and unauthorized preflights both received HTTP 204. This is a production failure, not a pass.
- API deployment code binds to `process.env.PORT` before `API_PORT` and defaults host binding to `0.0.0.0`. The repository Docker health check remains pinned to port 3002, so it is not valid evidence of a provider-assigned-port container health check.
- No provider console, deployment logs, database, MQTT broker, production test identities, or mobile release artifact were accessible from this workspace.

## Final gate

| Category | Status |
| --- | --- |
| SECURITY | PARTIAL |
| DATABASE | UNVERIFIED |
| MQTT | UNVERIFIED |
| API | PARTIAL |
| WEBSOCKET | UNVERIFIED |
| CORS | FAIL |
| WEB | BLOCKED |
| MOBILE | UNVERIFIED |
| AUTHENTICATION | UNVERIFIED |
| RBAC | UNVERIFIED |
| IDOR | UNVERIFIED |
| NOTIFICATIONS | UNVERIFIED |
| MAPS | UNVERIFIED |
| AI/RISK | UNVERIFIED |
| OBSERVABILITY | BLOCKED |
| BACKUPS | UNVERIFIED |
| DEPLOYMENT | BLOCKED |
| E2E | UNVERIFIED |

**FINAL STATUS: BLOCKED**

See `PRODUCTION_DEPLOYMENT_BLOCKERS.md` for required provider actions and evidence.

## 2026-09-03 CORS-only retest

This retest preserves the earlier evidence and adds the current live result. Target: `https://crisis-mesh-api.onrender.com/api/v1/health`.

| Test | Origin | Actual result | Status |
| --- | --- | --- | --- |
| CORS GET approved | `https://crisis-mesh-eosin.vercel.app` | HTTP 200; `Access-Control-Allow-Credentials: true`; missing `Access-Control-Allow-Origin` | FAIL |
| CORS GET unauthorized | `https://attacker.invalid` | HTTP 200; no permissive allow-origin header | PARTIAL |
| CORS OPTIONS approved | `https://crisis-mesh-eosin.vercel.app` | HTTP 204; allowed methods `GET,POST,PUT,DELETE,PATCH,OPTIONS`; allowed headers `Content-Type,Authorization`; missing `Access-Control-Allow-Origin` | FAIL |
| CORS OPTIONS unauthorized | `https://attacker.invalid` | HTTP 204; method/header/credentials response headers present, no allow-origin header | PARTIAL |
| Browser API call from deployed web | `https://crisis-mesh-eosin.vercel.app` | BLOCKED: the browser requires the matching `Access-Control-Allow-Origin` response header | BLOCKED |
| WebSocket origin | deployed Socket.IO `/ws` | Source configuration uses the same exact allowlist, but no authenticated production handshake or Render configuration is available | UNVERIFIED |

Local verification after this inspection: API tests **122/122 PASS**, API build **PASS**, web build **PASS**. These local results do not change the live CORS status. Render access is required to inspect/correct the production `CORS_ORIGIN` value or deploy the applicable API release. No production deployment was performed; **FINAL STATUS remains BLOCKED**.
