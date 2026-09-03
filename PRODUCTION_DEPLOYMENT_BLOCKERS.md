# Production deployment blockers

Evidence collected on 2026-09-03. Secret values, credentials, tokens, and provider configuration values were not read or recorded.

| Blocker | Exact action required | Provider | Owner | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| Production CORS policy does not permit the configured web origin | In Render, verify the deployed release and set `CORS_ORIGIN` to the exact production Vercel origin(s). Redeploy, then prove an approved cross-origin GET and preflight include `Access-Control-Allow-Origin`, while an unapproved origin is rejected without it. | Render | Deployment owner | At 2026-09-03 17:12 IST, `GET /api/v1/health` with both `Origin: https://crisis-mesh-eosin.vercel.app` and an unauthorized origin returned HTTP 200 with no `Access-Control-Allow-Origin`. Both preflights returned HTTP 204. | BLOCKED |
| Provider-side production configuration cannot be inspected from this workspace | Grant read-only Render access (service environment, deploy logs, restart history) or provide an operator-run redacted export. Confirm provider `PORT`, `DATABASE_URL`, `MQTT_BROKER_URL`, `JWT_SECRET`, and `CORS_ORIGIN` are present without disclosing values. | Render | Deployment owner | The external health endpoint is reachable, but this workspace has no Render configuration or log access. Repository only contains local Docker configuration. | BLOCKED |
| Historical credentials have no provider rotation evidence | Rotate/revoke the credentials listed in `docs/security/SECRET_ROTATION.md`, update secret stores, invalidate JWT sessions, and retain provider audit evidence outside Git. | Render, database provider, MQTT provider, Supabase, news provider, source-control/CI provider | Credential owners | Git history contains changes referring to the credential classes (without examining or exposing values); existing rotation documentation marks manual action required. | MANUAL ACTION REQUIRED |
| Production database is not externally verifiable | Have the database owner verify connection, applied migrations, schema constraints/indexes, SSL, pool limits, backups, and no production seed credentials. Provide redacted migration/health evidence. Do not reset the database. | Database provider | Database owner | Public health reports only `services.api: healthy`; it does not establish database migration or persistence status. No database provider access is available. | UNVERIFIED |
| MQTT end-to-end path is not externally verifiable | Have the MQTT owner verify authenticated TLS connectivity and authorize a controlled test message through simulator → MQTT → API → database → WebSocket. Preserve only redacted logs/test IDs. | MQTT provider | MQTT owner | Repository code supports MQTT, but no production broker endpoint, credentials, or provider logs are available. | UNVERIFIED |
| Web production workflow is not verified | After CORS is fixed, use real non-privileged test accounts to verify login, refresh, `/me`, logout, role screens, incidents, alerts, SOS, maps, and realtime. | Vercel, Render | Web owner | `https://crisis-mesh-eosin.vercel.app/` returned HTTP 200 on 2026-09-03 17:12 IST. Browser API workflow cannot succeed under the observed CORS behavior. | BLOCKED |
| Mobile release is not verified | Build a release APK with explicit `CRISISMESH_API_URL` and `CRISISMESH_WS_URL`, then test against the repaired production API with real test accounts. | Mobile build/distribution owner | Mobile owner | The source correctly requires explicit runtime origins, but no signed release APK or external device evidence is available. | UNVERIFIED |
| Full disaster E2E has no evidence | Run controlled FLOOD and FIRE tests against production and record redacted request IDs, expected/actual behavior, persistence, alert, and authenticated WebSocket delivery. | All providers | Incident-response test owner | No authorized production test identities or broker/database/provider access are available in this workspace. | UNVERIFIED |

No destructive database operation, credential rotation, deployment, history rewrite, or Phase 2 work was performed.

## 2026-09-03 CORS-only retest

The requested live CORS retest was performed against `https://crisis-mesh-api.onrender.com/api/v1/health` using the exact Vercel origin `https://crisis-mesh-eosin.vercel.app` and `https://attacker.invalid`.

| Check | Result | Status |
| --- | --- | --- |
| Approved GET | HTTP 200 and `Access-Control-Allow-Credentials: true`, but **no** `Access-Control-Allow-Origin` | FAIL |
| Unauthorized GET | HTTP 200 with no permissive allow-origin header | PARTIAL |
| Approved OPTIONS | HTTP 204 with methods/headers and credentials, but **no** `Access-Control-Allow-Origin` | FAIL |
| Unauthorized OPTIONS | HTTP 204 with methods/headers and credentials, but no allow-origin header | PARTIAL |
| Deployed web → API browser call | Cannot succeed as a credentialed cross-origin browser request without the required allow-origin response header | BLOCKED |
| Socket.IO origin | Repository configuration uses the same origin allowlist; the deployed Socket.IO configuration cannot be verified without a valid test token and provider access | UNVERIFIED |

The repository's current API source is already designed to require `CORS_ORIGIN` in production and to use the exact configured origin list for HTTP and Socket.IO. It contains no Render service manifest or provider configuration. Therefore the correction must be made or verified in the Render production service and deployed there; this workspace cannot safely perform that provider-side change without access. No commit was made for this retest because no production CORS fix was deployed and externally verified.
