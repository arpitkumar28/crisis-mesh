/**
 * Shared types and contracts for CrisisMesh
 * Used across: Web (Next.js), Mobile (Flutter), API (NestJS), AI Service
 */

// ============================================================================
// USER ROLES
// ============================================================================

export enum UserRole {
  CITIZEN = 'CITIZEN',
  RESPONDER = 'RESPONDER',
  AUTHORITY = 'AUTHORITY',
  ADMIN = 'ADMIN',
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export enum AlertType {
  WEATHER = 'WEATHER',
  FLOOD = 'FLOOD',
  EARTHQUAKE = 'EARTHQUAKE',
  WILDFIRE = 'WILDFIRE',
  LANDSLIDE = 'LANDSLIDE',
  TSUNAMI = 'TSUNAMI',
  CYCLONE = 'CYCLONE',
  MANUAL = 'MANUAL',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// INCIDENT TYPES
// ============================================================================

export enum IncidentType {
  DISASTER = 'DISASTER',
  EMERGENCY = 'EMERGENCY',
  ACCIDENT = 'ACCIDENT',
  HAZARD = 'HAZARD',
  OTHER = 'OTHER',
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

// ============================================================================
// DEVICE TYPES
// ============================================================================

export enum DeviceType {
  SENSOR = 'SENSOR',
  RELAY = 'RELAY',
  GATEWAY = 'GATEWAY',
  SIMULATOR = 'SIMULATOR',
}

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  UNREACHABLE = 'UNREACHABLE',
  ERROR = 'ERROR',
}

// ============================================================================
// TELEMETRY
// ============================================================================

export enum SensorMetric {
  TEMPERATURE = 'TEMPERATURE',
  HUMIDITY = 'HUMIDITY',
  PRESSURE = 'PRESSURE',
  RAINFALL = 'RAINFALL',
  WIND_SPEED = 'WIND_SPEED',
  WATER_LEVEL = 'WATER_LEVEL',
  SEISMIC = 'SEISMIC',
  AIR_QUALITY = 'AIR_QUALITY',
}

// ============================================================================
// RISK LEVELS
// ============================================================================

export enum RiskLevel {
  MINIMAL = 'MINIMAL',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ============================================================================
// MQTT TOPICS
// ============================================================================

export const MQTT_TOPICS = {
  SENSOR_TELEMETRY: 'sensor/+/telemetry',
  DEVICE_STATUS: 'device/+/status',
  ALERT_ISSUED: 'alert/+/issued',
  INCIDENT_UPDATE: 'incident/+/update',
  WEATHER_ALERT: 'weather/alert',
} as const;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  error: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ============================================================================
// MODEL TYPES (Phase 2+)
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  issued_by: string;
  issued_at: string;
  expires_at: string;
  affected_regions?: string[];
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  severity: AlertSeverity;
  reported_by: string;
  assigned_to?: string;
  reported_at: string;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  type: DeviceType;
  status: DeviceStatus;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  last_seen: string;
  battery_level?: number;
  signal_strength?: number;
  created_at: string;
  updated_at: string;
}

export interface Telemetry {
  id: string;
  device_id: string;
  metric: SensorMetric;
  value: number;
  unit: string;
  timestamp: string;
  quality_flag?: number;
}

export interface RiskPrediction {
  id: string;
  location: {
    latitude: number;
    longitude: number;
  };
  risk_level: RiskLevel;
  probability: number;
  factors: string[];
  predicted_at: string;
  valid_until: string;
}

export type { ApiResponse, ApiError };
