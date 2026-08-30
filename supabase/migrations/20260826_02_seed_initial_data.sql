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

-- NOTE: Password hash should be generated uniquely for the deployment.
-- This user is for initial system setup only.
INSERT INTO profiles (email, name, phone, password_hash) VALUES
('admin@crisismesh.gov.in', 'System Administrator', '+910000000000', '$2b$10$aXA.xr7Gt9icDZ37XRlvQOiFOJZxOfd7GXZJCif1AKOF47LuxqvZ2');

INSERT INTO user_roles (profile_id, role_id, assigned_by)
SELECT 
    p.id, 
    r.id, 
    p.id
FROM profiles p
CROSS JOIN roles r
WHERE p.email = 'admin@crisismesh.gov.in' 
AND r.name = 'ADMIN';
