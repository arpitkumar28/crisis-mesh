# Database Migrations

This directory contains database schema migrations for CrisisMesh.

## PHASE 1 Status

No migrations created yet. Database schema design happens in PHASE 2.

## PHASE 2 Plans

The following tables will be created in PHASE 2:

- users (with RLS policies)
- roles
- permissions
- devices
- device_sensors
- telemetry
- alerts
- alert_subscriptions
- incidents
- incident_responders
- locations (PostGIS)
- risk_predictions
- audit_logs

## Running Migrations

```bash
# This will be configured in Phase 2
supabase migration up
```

## Migration Naming Convention

Use the format:
```
YYYYMMDD_HH_description.sql
```

Example:
```
20260825_01_create_users_table.sql
20260825_02_create_devices_table.sql
20260825_03_add_geospatial_indexes.sql
```
