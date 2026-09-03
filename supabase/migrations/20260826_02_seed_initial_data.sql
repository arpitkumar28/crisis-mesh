-- CrisisMesh Initial Seed Data
-- This migration seeds essential reference data

-- ============================================================================
-- SEED ROLES
-- ============================================================================

INSERT INTO roles (name, description) VALUES
('CITIZEN', 'Regular citizen user with basic access'),
('RESPONDER', 'Emergency responder with operational access'),
('AUTHORITY', 'Government authority with administrative access'),
('ADMIN', 'System administrator with full access'),
('ANALYST', 'Data analyst with read-only access');

-- ============================================================================
-- SEED INDIA GEOGRAPHY STRUCTURE
-- ============================================================================

INSERT INTO countries (name, iso_code) VALUES ('India', 'IN');

-- ============================================================================
-- SEED DEFAULT ADMIN USER (PROVISIONING ONLY)
-- ============================================================================

-- NOTE: do not store deployment credentials in source control.
-- Create the initial admin user without a committed password hash.
INSERT INTO profiles (email, name, phone, password_hash) VALUES
('admin@crisismesh.gov.in', 'System Administrator', '+910000000000', NULL);

INSERT INTO user_roles (profile_id, role_id, assigned_by)
SELECT 
    p.id, 
    r.id, 
    p.id
FROM profiles p
CROSS JOIN roles r
WHERE p.email = 'admin@crisismesh.gov.in' 
AND r.name = 'ADMIN';
