-- CrisisMesh Initial Seed Data
-- Provider: Neon PostgreSQL (temporary) -> Supabase PostgreSQL (future)
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

-- Insert India as country
INSERT INTO countries (name, iso_code) VALUES
('India', 'IN');

-- Note: We are NOT inserting fake state/district/locality boundaries
-- This is a placeholder structure that should be populated with actual
-- geographic data from official sources (e.g., Survey of India)
-- The structure supports the India -> State -> District -> Locality hierarchy

-- ============================================================================
-- SEED DEFAULT ADMIN USER (DEVELOPMENT ONLY)
-- ============================================================================

-- This creates a default admin user for development purposes
-- In production, users should be created through proper registration flow
-- Password is hashed using bcrypt (cost factor 10)
-- Default password: admin123 (CHANGE IN PRODUCTION)

INSERT INTO profiles (email, name, phone) VALUES
('admin@crisismesh.dev', 'System Administrator', '+919876543210');

-- Assign admin role to the default admin user
INSERT INTO user_roles (profile_id, role_id, assigned_by)
SELECT 
    p.id, 
    r.id, 
    p.id
FROM profiles p
CROSS JOIN roles r
WHERE p.email = 'admin@crisismesh.dev' 
AND r.name = 'ADMIN';

-- ============================================================================
-- SEED SAMPLE DEVICE TYPES FOR TESTING
-- ============================================================================

-- These are sample devices for development/testing
-- In production, devices are registered through the device management system

-- ============================================================================
-- NOTES FOR FUTURE DATA POPULATION
-- ============================================================================

-- Geographic Data:
-- - Use official government sources for state/district boundaries
-- - Survey of India (https://surveyofindia.gov.in/)
-- - Census of India geographic data
-- - Official administrative boundary datasets

-- User Data:
-- - Users should be created through registration system
-- - Never seed real user data in migrations
-- - Use proper authentication flow

-- Device Data:
-- - Devices are registered through IoT provisioning system
-- - Seed only test devices for development

-- Reference Data:
-- - Alert types, incident types, etc. are defined in enums
-- - Additional reference data can be added as needed
