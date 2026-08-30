-- CrisisMesh Initial Database Schema (Simplified - No PostGIS required)
-- Works with standard PostgreSQL on Neon, local, or Supabase

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User Roles
CREATE TYPE user_role AS ENUM ('CITIZEN', 'RESPONDER', 'AUTHORITY', 'ADMIN', 'ANALYST');

-- Alert Types
CREATE TYPE alert_type AS ENUM ('WEATHER', 'FLOOD', 'EARTHQUAKE', 'WILDFIRE', 'LANDSLIDE', 'TSUNAMI', 'CYCLONE', 'MANUAL');

-- Alert Severity
CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Alert Status
CREATE TYPE alert_status AS ENUM ('ACTIVE', 'RESOLVED', 'EXPIRED', 'CANCELLED');

-- Incident Types
CREATE TYPE incident_type AS ENUM ('DISASTER', 'EMERGENCY', 'ACCIDENT', 'HAZARD', 'OTHER');

-- Incident Status
CREATE TYPE incident_status AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- Device Types
CREATE TYPE device_type AS ENUM ('SENSOR', 'RELAY', 'GATEWAY', 'SIMULATOR');

-- Device Status
CREATE TYPE device_status AS ENUM ('ONLINE', 'OFFLINE', 'UNREACHABLE', 'ERROR');

-- Sensor Metrics
CREATE TYPE sensor_metric AS ENUM ('TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'RAINFALL', 'WIND_SPEED', 'WATER_LEVEL', 'SEISMIC', 'AIR_QUALITY');

-- Risk Levels
CREATE TYPE risk_level AS ENUM ('MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- ============================================================================
-- GEOGRAPHY DOMAIN (Simplified - no PostGIS)
-- ============================================================================

CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    iso_code CHAR(2) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_id, code)
);

CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_id, code)
);

CREATE TABLE localities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE geographic_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality_id UUID REFERENCES localities(id) ON DELETE SET NULL,
    name VARCHAR(200),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_geographic_locations_coords ON geographic_locations(latitude, longitude);

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    location_id UUID REFERENCES geographic_locations(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_location_id ON profiles(location_id);

CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, role)
);

CREATE INDEX idx_user_roles_profile_id ON user_roles(profile_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Devices table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    device_type device_type NOT NULL,
    status device_status DEFAULT 'OFFLINE',
    location_id UUID REFERENCES geographic_locations(id),
    owner_id UUID REFERENCES profiles(id),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    firmware_version VARCHAR(50),
    mac_address VARCHAR(17),
    ip_address VARCHAR(45),
    last_seen TIMESTAMP WITH TIME ZONE,
    battery_level DECIMAL(5, 2),
    signal_strength DECIMAL(5, 2),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_device_type ON devices(device_type);
CREATE INDEX idx_devices_owner_id ON devices(owner_id);

-- Device Status History
CREATE TABLE device_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    previous_status device_status,
    new_status device_status NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_device_status_history_device_id ON device_status_history(device_id);
CREATE INDEX idx_device_status_history_changed_at ON device_status_history(changed_at);

-- Sensors
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    sensor_id VARCHAR(255) UNIQUE NOT NULL,
    metric sensor_metric NOT NULL,
    name VARCHAR(255),
    description TEXT,
    unit VARCHAR(50),
    min_value DECIMAL(10, 2),
    max_value DECIMAL(10, 2),
    calibration_date TIMESTAMP WITH TIME ZONE,
    last_calibrated_by UUID REFERENCES profiles(id),
    status device_status DEFAULT 'ONLINE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sensors_device_id ON sensors(device_id);
CREATE INDEX idx_sensors_sensor_id ON sensors(sensor_id);
CREATE INDEX idx_sensors_metric ON sensors(metric);

-- Telemetry/Readings
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    reading_value DECIMAL(10, 4),
    unit VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quality_score DECIMAL(3, 2),
    raw_value TEXT,
    metadata JSONB,
    UNIQUE(sensor_id, timestamp)
);

CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX idx_sensor_readings_created_date ON sensor_readings(timestamp DESC);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    status alert_status DEFAULT 'ACTIVE',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(255),
    location_id UUID REFERENCES geographic_locations(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius_km DECIMAL(10, 2),
    trigger_device_id UUID REFERENCES devices(id),
    trigger_sensor_id UUID REFERENCES sensors(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_alerts_alert_type ON alerts(alert_type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_location_id ON alerts(location_id);

-- Incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id VARCHAR(255) UNIQUE NOT NULL,
    incident_type incident_type NOT NULL,
    status incident_status DEFAULT 'REPORTED',
    severity alert_severity NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES geographic_locations(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    reporter_id UUID NOT NULL REFERENCES profiles(id),
    assigned_responder_id UUID REFERENCES profiles(id),
    evidence_urls TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_incidents_incident_id ON incidents(incident_id);
CREATE INDEX idx_incidents_incident_type ON incidents(incident_type);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_reporter_id ON incidents(reporter_id);
CREATE INDEX idx_incidents_assigned_responder_id ON incidents(assigned_responder_id);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_location_id ON incidents(location_id);

-- Incident Status History
CREATE TABLE incident_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    previous_status incident_status,
    new_status incident_status NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES profiles(id),
    notes TEXT
);

CREATE INDEX idx_incident_status_history_incident_id ON incident_status_history(incident_id);

-- SOS Events
CREATE TABLE sos_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sos_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id),
    status incident_status DEFAULT 'REPORTED',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_id UUID REFERENCES geographic_locations(id),
    emergency_type VARCHAR(100),
    description TEXT,
    responder_assigned_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sos_events_sos_id ON sos_events(sos_id);
CREATE INDEX idx_sos_events_user_id ON sos_events(user_id);
CREATE INDEX idx_sos_events_status ON sos_events(status);
CREATE INDEX idx_sos_events_created_at ON sos_events(created_at DESC);

-- Evacuation Routes
CREATE TABLE evacuation_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_location_id UUID REFERENCES geographic_locations(id),
    end_location_id UUID REFERENCES geographic_locations(id),
    distance_km DECIMAL(10, 2),
    estimated_time_minutes INT,
    difficulty_level VARCHAR(50),
    capacity INT,
    available_capacity INT,
    status VARCHAR(50) DEFAULT 'OPEN',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shelters
CREATE TABLE shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES geographic_locations(id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INT,
    current_occupancy INT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    amenities TEXT[],
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shelters_location_id ON shelters(location_id);

-- Emergency Contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    relationship VARCHAR(100),
    priority INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_profile_id ON emergency_contacts(profile_id);

-- News Articles
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    source VARCHAR(255),
    category VARCHAR(100),
    location_id UUID REFERENCES geographic_locations(id),
    image_url TEXT,
    article_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_articles_location_id ON news_articles(location_id);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255),
    entity_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Simulation Runs
CREATE TABLE simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'RUNNING',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INT,
    num_devices INT,
    metadata JSONB
);

CREATE INDEX idx_simulation_runs_started_at ON simulation_runs(started_at DESC);

-- Dashboard Widget Preferences
CREATE TABLE dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    widget_name VARCHAR(255),
    widget_config JSONB,
    position INT,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dashboard_preferences_profile_id ON dashboard_preferences(profile_id);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    notification_type VARCHAR(100),
    data JSONB,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Checklists
CREATE TABLE checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    items JSONB,
    progress_percentage INT DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_checklists_profile_id ON checklists(profile_id);

-- Training Videos
CREATE TABLE training_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INT,
    language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Grants and Permissions (for auth)
-- ============================================================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO crisis_mesh;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO crisis_mesh;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default country (India)
INSERT INTO countries (name, iso_code) VALUES ('India', 'IN') ON CONFLICT DO NOTHING;

-- Get the India country ID for state creation
DO $$
DECLARE
  india_id UUID;
BEGIN
  SELECT id INTO india_id FROM countries WHERE iso_code = 'IN';
  
  -- Insert sample states
  INSERT INTO states (country_id, name, code) VALUES 
    (india_id, 'Maharashtra', 'MH'),
    (india_id, 'Karnataka', 'KA'),
    (india_id, 'Tamil Nadu', 'TN')
  ON CONFLICT DO NOTHING;
END $$;

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mark this migration as executed
INSERT INTO schema_migrations (filename) VALUES ('00_setup_initial_schema.sql') ON CONFLICT DO NOTHING;
