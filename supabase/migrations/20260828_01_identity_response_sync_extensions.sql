-- CrisisMesh identity, emergency response, uploads, and offline-sync extensions.
-- Apply through the project's migration runner using a direct (non-pooler)
-- Lakebase Postgres connection. This migration is deliberately idempotent.

CREATE TABLE IF NOT EXISTS mfa_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    factor_type VARCHAR(30) NOT NULL CHECK (factor_type IN ('TOTP', 'WEBAUTHN')),
    secret_ciphertext TEXT,
    credential_id TEXT,
    label VARCHAR(120),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, factor_type, credential_id)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED', 'CANCELLED')),
    priority VARCHAR(30) NOT NULL DEFAULT 'CRITICAL' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT,
    assigned_responder_id UUID REFERENCES responders(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE,
    content_type VARCHAR(200) NOT NULL,
    byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
    checksum_sha256 VARCHAR(64) NOT NULL,
    scan_status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (scan_status IN ('PENDING', 'CLEAN', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CHECK (incident_id IS NOT NULL OR emergency_request_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS offline_sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_record_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE')),
    payload JSONB NOT NULL,
    client_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    conflict_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, client_record_id)
);

CREATE INDEX IF NOT EXISTS idx_mfa_factors_profile_id ON mfa_factors(profile_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_profile_id ON password_reset_tokens(profile_id);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_status ON emergency_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_requests_requester ON emergency_requests(requester_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_uploads_incident ON media_uploads(incident_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_records_profile ON offline_sync_records(profile_id, processed_at);
