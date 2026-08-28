import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Alert, AlertSeverity, AlertStatus } from '../entities/alert.entity';
import { Device, DeviceStatus } from '../entities/device.entity';
import { Incident, IncidentStatus } from '../entities/incident.entity';
import { SensorReading } from '../entities/sensor-reading.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Alert) private readonly alerts: Repository<Alert>,
    @InjectRepository(Device) private readonly devices: Repository<Device>,
    @InjectRepository(Incident) private readonly incidents: Repository<Incident>,
    @InjectRepository(SensorReading) private readonly readings: Repository<SensorReading>,
  ) {}

  async getOverview() {
    const [totalDevices, onlineDevices, activeAlerts, criticalAlerts, openIncidents, latestAlerts, latestIncidents, latestReadings] = await Promise.all([
      this.devices.count(),
      this.devices.count({ where: { status: DeviceStatus.ONLINE } }),
      this.alerts.count({ where: { status: AlertStatus.ACTIVE } }),
      this.alerts.count({ where: { status: AlertStatus.ACTIVE, severity: AlertSeverity.CRITICAL } }),
      this.incidents.count({ where: { status: In([IncidentStatus.REPORTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS]) } }),
      this.alerts.find({ where: { status: AlertStatus.ACTIVE }, relations: { location: true }, order: { issued_at: 'DESC' }, take: 5 }),
      this.incidents.find({ where: { status: In([IncidentStatus.REPORTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS]) }, relations: { location: true }, order: { reported_at: 'DESC' }, take: 5 }),
      this.readings.find({ relations: { sensor: { device: true } }, order: { timestamp: 'DESC' }, take: 10 }),
    ]);

    return {
      metrics: {
        total_devices: totalDevices,
        online_devices: onlineDevices,
        active_alerts: activeAlerts,
        critical_alerts: criticalAlerts,
        open_incidents: openIncidents,
      },
      alerts: latestAlerts,
      incidents: latestIncidents,
      telemetry: latestReadings.map((reading) => ({
        id: reading.id,
        device_id: reading.sensor.device_id,
        device_name: reading.sensor.device?.name ?? null,
        sensor_id: reading.sensor_id,
        metric: reading.sensor.metric,
        value: Number(reading.value),
        unit: reading.unit,
        quality_flag: reading.quality_flag,
        timestamp: reading.timestamp,
      })),
      generated_at: new Date().toISOString(),
    };
  }

  async getPublicMap() {
    const [alerts, incidents, devices] = await Promise.all([
      this.alerts.find({ where: { status: AlertStatus.ACTIVE }, relations: { location: true }, order: { issued_at: 'DESC' }, take: 100 }),
      this.incidents.find({ where: { status: In([IncidentStatus.REPORTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS]) }, relations: { location: true }, order: { reported_at: 'DESC' }, take: 100 }),
      this.devices.find({ where: { status: DeviceStatus.ONLINE }, relations: { location: true }, order: { last_seen: 'DESC' }, take: 200 }),
    ]);
    return { alerts, incidents, devices, generated_at: new Date().toISOString() };
  }
}
