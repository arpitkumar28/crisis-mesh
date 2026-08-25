-- CrisisMesh Initial Database Schema
-- Provider: Neon PostgreSQL (temporary) -> Supabase PostgreSQL (future)
-- Compatible with both Neon and Supabase PostgreSQL
-- Supports PostGIS extension for geospatial data

-- Enable PostGIS extension for geospatial support
-- This works on both Neon and Supabase
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User Roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('CITIZEN', 'RESPONDER', 'AUTHORITY', 'ADMIN', 'ANALYST');
  END IF;
END $$;

-- Alert Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
    CREATE TYPE alert_type AS ENUM ('WEATHER', 'FLOOD', 'EARTHQUAKE', 'WILDFIRE', 'LANDSLIDE', 'TSUNAMI', 'CYCLONE', 'MANUAL');
  END IF;
END $$;

-- Alert Severity
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
    CREATE TYPE alert_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
  END IF;
END $$;

-- Alert Status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_status') THEN
    CREATE TYPE alert_status AS ENUM ('ACTIVE', 'RESOLVED', 'EXPIRED', 'CANCELLED');
  END IF;
END $$;

-- Incident Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_type') THEN
    CREATE TYPE incident_type AS ENUM ('DISASTER', 'EMERGENCY', 'ACCIDENT', 'HAZARD', 'OTHER');
  END IF;
END $$;

-- Incident Status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
    CREATE TYPE incident_status AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
  END IF;
END $$;

-- Device Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_type') THEN
    CREATE TYPE device_type AS ENUM ('SENSOR', 'RELAY', 'GATEWAY', 'SIMULATOR');
  END IF;
END $$;

-- Device Status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'device_status') THEN
    CREATE TYPE device_status AS ENUM ('ONLINE', 'OFFLINE', 'UNREACHABLE', 'ERROR');
  END IF;
END $$;

-- Sensor Metrics
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sensor_metric') THEN
    CREATE TYPE sensor_metric AS ENUM ('TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'RAINFALL', 'WIND_SPEED', 'WATER_LEVEL', 'SEISMIC', 'AIR_QUALITY');
  END IF;
END $$;

-- Risk Levels
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
    CREATE TYPE risk_level AS ENUM ('MINIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL');
  END IF;
END $$;

-- ============================================================================
-- GEOGRAPHY DOMAIN
-- ============================================================================

-- Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    iso_code CHAR(2) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- States (within countries)
CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_id, code)
);

-- Districts (within states)
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state_id, code)
);

-- Localities (within districts)
CREATE TABLE localities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geographic locations (points of interest)
CREATE TABLE geographic_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality_id UUID REFERENCES localities(id) ON DELETE SET NULL,
    name VARCHAR(200),
    description TEXT,
    location GEOGRAPHY(POINT, 4326), -- PostGIS geography type for lat/long
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index on geographic_locations
CREATE INDEX idx_geographic_locations_location ON geographic_locations USING GIST (location);

-- ============================================================================
-- USERS DOMAIN
-- ============================================================================

-- User profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(200) NOT NULL,
    profile_picture_url TEXT,
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Role assignments
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    UNIQUE(profile_id, role_id)
);

-- ============================================================================
-- DEVICES DOMAIN
-- ============================================================================

-- Devices
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type device_type NOT NULL,
    status device_status DEFAULT 'OFFLINE',
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    serial_number VARCHAR(100) UNIQUE,
    firmware_version VARCHAR(50),
    battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
    signal_strength INTEGER CHECK (signal_strength BETWEEN 0 AND 100),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensors (device components)
CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    metric sensor_metric NOT NULL,
    unit VARCHAR(20) NOT NULL,
    min_value DECIMAL(20, 6),
    max_value DECIMAL(20, 6),
    calibration_offset DECIMAL(20, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gateways
CREATE TABLE gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    mesh_id VARCHAR(100),
    parent_gateway_id UUID REFERENCES gateways(id) ON DELETE SET NULL,
    range_meters INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mesh links (device-to-device connections)
CREATE TABLE mesh_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    target_device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    link_quality INTEGER CHECK (link_quality BETWEEN 0 AND 100),
    latency_ms INTEGER,
    last_ping TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (source_device_id != target_device_id)
);

-- ============================================================================
-- TELEMETRY DOMAIN
-- ============================================================================

-- Sensor readings
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    value DECIMAL(20, 6) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quality_flag INTEGER DEFAULT 100 CHECK (quality_flag BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device status history
CREATE TABLE device_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    status device_status NOT NULL,
    message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CRISIS DOMAIN
-- ============================================================================

-- Incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type incident_type NOT NULL,
    status incident_status DEFAULT 'REPORTED',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    severity alert_severity DEFAULT 'MEDIUM',
    reported_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type alert_type NOT NULL,
    severity alert_severity NOT NULL,
    status alert_status DEFAULT 'ACTIVE',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    issued_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    affected_regions TEXT[], -- Array of region identifiers
    incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk assessments
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    risk_level risk_level NOT NULL,
    probability DECIMAL(5, 2) CHECK (probability BETWEEN 0 AND 100),
    factors TEXT[], -- Array of risk factors
    assessment_details JSONB,
    assessed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- RESPONSE DOMAIN
-- ============================================================================

-- Responders
CREATE TABLE responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization VARCHAR(200),
    specialization VARCHAR(100),
    certification_level VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    current_location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit VARCHAR(50),
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    assigned_to UUID REFERENCES responders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shelters
CREATE TABLE shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    location_id UUID NOT NULL REFERENCES geographic_locations(id) ON DELETE RESTRICT,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    type VARCHAR(100),
    facilities TEXT[],
    contact_phone VARCHAR(20),
    is_operational BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (current_occupancy <= capacity)
);

-- Evacuation routes
CREATE TABLE evacuation_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    route_path GEOGRAPHY(LINESTRING, 4326), -- PostGIS for route geometry
    source_location_id UUID NOT NULL REFERENCES geographic_locations(id) ON DELETE RESTRICT,
    destination_location_id UUID NOT NULL REFERENCES geographic_locations(id) ON DELETE RESTRICT,
    capacity INTEGER,
    estimated_duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index on evacuation routes
CREATE INDEX idx_evacuation_routes_path ON evacuation_routes USING GIST (route_path);

-- ============================================================================
-- ENVIRONMENT DOMAIN
-- ============================================================================

-- Weather observations
CREATE TABLE weather_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    temperature_celsius DECIMAL(5, 2),
    humidity_percent DECIMAL(5, 2),
    pressure_hpa DECIMAL(7, 2),
    wind_speed_kmh DECIMAL(5, 2),
    wind_direction_degrees INTEGER,
    precipitation_mm DECIMAL(5, 2),
    visibility_km DECIMAL(5, 2),
    observation_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INFORMATION DOMAIN
-- ============================================================================

-- News articles
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    source VARCHAR(200),
    author VARCHAR(200),
    published_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    relevance_score DECIMAL(3, 2),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Official notices
CREATE TABLE official_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    issuing_authority VARCHAR(200) NOT NULL,
    notice_type VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'NORMAL',
    location_id UUID REFERENCES geographic_locations(id) ON DELETE SET NULL,
    effective_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMMUNICATION DOMAIN
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) DEFAULT 'INFO',
    priority VARCHAR(50) DEFAULT 'NORMAL',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    related_alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
    related_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUDIT DOMAIN
-- ============================================================================

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit log queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- SIMULATION DOMAIN
-- ============================================================================

-- Simulation runs
CREATE TABLE simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    scenario_type VARCHAR(100),
    parameters JSONB,
    started_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'RUNNING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simulation events
CREATE TABLE simulation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_run_id UUID NOT NULL REFERENCES simulation_runs(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Geography indexes
CREATE INDEX idx_states_country_id ON states(country_id);
CREATE INDEX idx_districts_state_id ON districts(state_id);
CREATE INDEX idx_localities_district_id ON localities(district_id);
CREATE INDEX idx_geographic_locations_locality_id ON geographic_locations(locality_id);

-- User indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_location_id ON profiles(location_id);
CREATE INDEX idx_user_roles_profile_id ON user_roles(profile_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Device indexes
CREATE INDEX idx_devices_type ON devices(type);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_location_id ON devices(location_id);
CREATE INDEX idx_sensors_device_id ON sensors(device_id);
CREATE INDEX idx_gateways_device_id ON gateways(device_id);
CREATE INDEX idx_mesh_links_source ON mesh_links(source_device_id);
CREATE INDEX idx_mesh_links_target ON mesh_links(target_device_id);

-- Telemetry indexes
CREATE INDEX idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX idx_device_status_history_device_id ON device_status_history(device_id);
CREATE INDEX idx_device_status_history_timestamp ON device_status_history(timestamp);

-- Crisis indexes
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_location_id ON incidents(location_id);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_location_id ON alerts(location_id);
CREATE INDEX idx_risk_assessments_location_id ON risk_assessments(location_id);
CREATE INDEX idx_risk_assessments_risk_level ON risk_assessments(risk_level);

-- Response indexes
CREATE INDEX idx_responders_profile_id ON responders(profile_id);
CREATE INDEX idx_responders_is_available ON responders(is_available);
CREATE INDEX idx_resources_location_id ON resources(location_id);
CREATE INDEX idx_resources_status ON resources(status);
CREATE INDEX idx_shelters_location_id ON shelters(location_id);
CREATE INDEX idx_shelters_is_operational ON shelters(is_operational);
CREATE INDEX idx_evacuation_routes_source ON evacuation_routes(source_location_id);
CREATE INDEX idx_evacuation_routes_destination ON evacuation_routes(destination_location_id);

-- Environment indexes
CREATE INDEX idx_weather_observations_location_id ON weather_observations(location_id);
CREATE INDEX idx_weather_observations_time ON weather_observations(observation_time);

-- Information indexes
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX idx_official_notices_location_id ON official_notices(location_id);
CREATE INDEX idx_official_notices_effective_date ON official_notices(effective_date);

-- Communication indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_related_alert_id ON notifications(related_alert_id);
CREATE INDEX idx_notifications_related_incident_id ON notifications(related_incident_id);

-- Simulation indexes
CREATE INDEX idx_simulation_events_simulation_run_id ON simulation_events(simulation_run_id);
CREATE INDEX idx_simulation_events_timestamp ON simulation_events(timestamp);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_states_updated_at BEFORE UPDATE ON states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_localities_updated_at BEFORE UPDATE ON localities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geographic_locations_updated_at BEFORE UPDATE ON geographic_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gateways_updated_at BEFORE UPDATE ON gateways
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesh_links_updated_at BEFORE UPDATE ON mesh_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responders_updated_at BEFORE UPDATE ON responders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shelters_updated_at BEFORE UPDATE ON shelters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evacuation_routes_updated_at BEFORE UPDATE ON evacuation_routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_official_notices_updated_at BEFORE UPDATE ON official_notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulation_runs_updated_at BEFORE UPDATE ON simulation_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) PREPARATION
-- ============================================================================

-- Note: RLS will be fully implemented in Supabase environment
-- For Neon (temporary), we implement authorization at NestJS level
-- These comments document the intended RLS policies for Supabase migration

-- Profiles RLS (Supabase):
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Users can only see their own profile unless they have admin/responder role
-- CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING ( EXISTS (SELECT 1 FROM user_roles WHERE profile_id = auth.uid() AND role_id IN (SELECT id FROM roles WHERE name IN ('ADMIN', 'AUTHORITY'))));

-- Similar RLS policies will be applied to other sensitive tables in Supabase
