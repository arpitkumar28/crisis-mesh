export enum WebSocketEventType {
  TELEMETRY_UPDATED = 'telemetry.updated',
  DEVICE_STATUS_CHANGED = 'device.status_changed',
  ALERT_CREATED = 'alert.created',
  ALERT_UPDATED = 'alert.updated',
  INCIDENT_CREATED = 'incident.created',
  INCIDENT_UPDATED = 'incident.updated',
  INCIDENT_STATUS_CHANGED = 'incident.status_changed',
  RISK_UPDATED = 'risk.updated',
  NOTIFICATION_CREATED = 'notification.created',
  CONNECTION_ESTABLISHED = 'connection.established',
  HEARTBEAT = 'heartbeat',
}

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  request_id?: string;
}

export interface TelemetryUpdatedEvent {
  device_id: string;
  sensor_id: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface DeviceStatusChangedEvent {
  device_id: string;
  status: string;
  battery_level?: number;
  signal_strength?: number;
  timestamp: string;
}

export interface AlertCreatedEvent {
  alert_id: string;
  severity: string;
  type: string;
  location?: string;
  message: string;
  timestamp: string;
}

export interface IncidentCreatedEvent {
  incident_id: string;
  severity: string;
  type: string;
  location?: string;
  status: string;
  timestamp: string;
}

export interface AlertUpdatedEvent {
  alert_id: string;
  severity: string;
  type: string;
  status: string;
  location?: string;
  message: string;
  timestamp: string;
}

export interface IncidentUpdatedEvent {
  incident_id: string;
  severity: string;
  type: string;
  location?: string;
  status: string;
  timestamp: string;
}