# CrisisMesh Secret Rotation

## Status

**SECRET ROTATION: REQUIRES MANUAL ROTATION**

No secret values are included in this document. No Git history rewrite was performed.

## Inventory and classification

| Credential type | Current tracked state | Historical classification | Action |
|---|---|---|---|
| JWT signing secret | Placeholder only in `.env.example`; local ignored config exists | Unknown whether any historical value was operational | REQUIRES ROTATION before production |
| Database credential | Placeholder only in tracked example; local Docker credential is development-only | Development-only compose credential plus unknown historical database material | Replace local/provisioned production credential; rotate any historical operational credential |
| MQTT credential | Placeholder/empty in tracked example; local broker is development-only | Development-only local broker settings plus unknown historical values | Rotate broker username/password and require TLS in production |
| News/API key | Empty in tracked example; local compose reported it unset | Unknown historical provider-key exposure | Revoke/rotate provider key and provision through deployment secrets |
| Supabase anon key | Placeholder only in tracked example | Public client identifier if exposed, but verify project policy | Rotate/restrict if project policy requires; never use it for privileged access |
| Supabase service-role key | Placeholder only in tracked example; local ignored config exists | Unknown historical privileged credential | REQUIRES IMMEDIATE provider-side rotation |
| Cloud/deployment credentials | No confirmed tracked cloud credential found | Unverified; repository inspection cannot prove provider history is clean | Review Vercel/Render/GitHub/provider audit logs and rotate any exposed token |
| Refresh-token signing/storage material | Runtime JWT configuration; no provider credential | Application secret exposure follows JWT classification | Rotate signing material and invalidate active sessions after deployment |

The local ignored `.env`, `apps/web/.env.local`, and `services/api/.env` were inspected by variable name only. Their values were not printed, committed, or copied into reports. They must be treated as operationally sensitive and replaced through deployment secret configuration where applicable.

## Required manual actions

1. Rotate the JWT signing secret in the deployment platform and restart all API instances. Invalidate all existing access and refresh tokens.
2. Rotate the production database password and update the managed connection secret. Confirm SSL/TLS and least-privilege access.
3. Rotate MQTT broker credentials, enforce TLS, update `MQTT_BROKER_URL`, and restart API/device workers.
4. Revoke and recreate the News/API provider key if it existed in repository history or logs.
5. Rotate the Supabase service-role key in Supabase, update deployment secrets, and verify no browser/mobile bundle contains it.
6. Review cloud/deployment provider audit logs for tokens and rotate any token with repository, CI, or deployment scope.
7. Remove access for former operators, document rotation timestamps, and retain provider audit evidence without recording secret values.

## Validation rules

- Production secrets must be supplied only through deployment environment variables or a secret manager.
- Replacement credentials must never be committed or placed in `.env.example`.
- Search output and reports must show credential types and statuses only, never values.
- Re-run authentication, refresh rotation, logout, database, MQTT, and external smoke tests after rotation.

Until provider-side revocation and replacement evidence exists, the secret gate remains **REQUIRES MANUAL ROTATION** and Phase 1 cannot be marked complete.
