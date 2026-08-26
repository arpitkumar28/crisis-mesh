import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorReading } from '../entities/sensor-reading.entity';
import { Sensor } from '../entities/sensor.entity';
import { Device } from '../entities/device.entity';
import { MqttService } from '../mqtt/mqtt.service';
import { SensorMetric } from '../entities/sensor.entity';

interface TelemetryPayload {
  device_id: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: string;
  quality_flag: number;
}

interface DeviceStatusPayload {
  device_id: string;
  status: string;
  battery_level?: number;
  signal_strength?: number;
  timestamp: string;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private deviceSensorCache: Map<string, Map<string, Sensor>> = new Map();

  constructor(
    @InjectRepository(SensorReading)
    private readonly sensorReadingRepository: Repository<SensorReading>,
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly mqttService: MqttService,
  ) {}

  async onModuleInit() {
    await this.setupMqttSubscriptions();
    await this.warmupSensorCache();
  }

  private async setupMqttSubscriptions() {
    try {
      // Subscribe to sensor telemetry topics
      await this.mqttService.subscribe('sensor/+/telemetry', async (message) => {
        await this.handleTelemetryMessage(message);
      });

      // Subscribe to device status topics
      await this.mqttService.subscribe('device/+/status', async (message) => {
        await this.handleDeviceStatusMessage(message);
      });

      this.logger.log('MQTT subscriptions configured successfully');
    } catch (error: unknown) {
      this.logger.error(`Failed to setup MQTT subscriptions: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  private async warmupSensorCache() {
    try {
      const sensors = await this.sensorRepository.find({
        relations: {
          device: true,
        },
      });

      this.deviceSensorCache.clear();
      for (const sensor of sensors) {
        const deviceId = sensor.device_id;
        if (!this.deviceSensorCache.has(deviceId)) {
          this.deviceSensorCache.set(deviceId, new Map());
        }
        this.deviceSensorCache.get(deviceId)!.set(sensor.metric, sensor);
      }

      this.logger.log(`Warmed up sensor cache with ${sensors.length} sensors`);
    } catch (error: unknown) {
      this.logger.error(`Failed to warmup sensor cache: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleTelemetryMessage(message: any) {
    try {
      const payload: TelemetryPayload = JSON.parse(message.payload.toString());
      this.logger.debug(`Received telemetry from device ${payload.device_id}: ${payload.metric}=${payload.value}${payload.unit}`);

      // Validate payload
      const validationError = this.validateTelemetryPayload(payload);
      if (validationError) {
        this.logger.warn(`Invalid telemetry payload: ${validationError}`);
        return;
      }

      // Find or create sensor (this also handles device lookup by serial_number)
      const sensor = await this.findOrCreateSensor(payload.device_id, payload.metric, payload.unit);
      if (!sensor) {
        this.logger.error(`Failed to find or create sensor for device ${payload.device_id}, metric ${payload.metric}`);
        return;
      }

      // Check for duplicate reading (same sensor and timestamp)
      const timestamp = new Date(payload.timestamp);
      const existingReading = await this.sensorReadingRepository.findOne({
        where: {
          sensor_id: sensor.id,
          timestamp: timestamp,
        },
      });

      if (existingReading) {
        this.logger.debug(`Duplicate reading detected for sensor ${sensor.id} at ${timestamp}, skipping`);
        return;
      }

      // Create sensor reading
      const reading = this.sensorReadingRepository.create({
        sensor_id: sensor.id,
        value: payload.value,
        unit: payload.unit,
        timestamp: timestamp,
        quality_flag: payload.quality_flag,
      });

      await this.sensorReadingRepository.save(reading);

      // Update device last_seen using actual device UUID
      await this.deviceRepository.update(sensor.device_id, {
        last_seen: new Date(),
      });

      this.logger.debug(`Saved sensor reading: sensor_id=${sensor.id}, value=${payload.value}`);

      // Publish to alert topic if value exceeds thresholds
      await this.checkThresholdsAndAlert(sensor, payload.value);

    } catch (error: unknown) {
      this.logger.error(`Error processing telemetry message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleDeviceStatusMessage(message: any) {
    try {
      const payload: DeviceStatusPayload = JSON.parse(message.payload.toString());
      this.logger.debug(`Received device status from ${payload.device_id}: ${payload.status}`);

      // Validate payload
      const validationError = this.validateDeviceStatusPayload(payload);
      if (validationError) {
        this.logger.warn(`Invalid device status payload: ${validationError}`);
        return;
      }

      // Find device by serial_number (simulator sends serial numbers)
      let device = await this.deviceRepository.findOne({
        where: { serial_number: payload.device_id },
      });

      // If not found by serial_number, try by id (for UUID-based device_id)
      if (!device) {
        try {
          device = await this.deviceRepository.findOne({
            where: { id: payload.device_id },
          });
        } catch (error) {
          // device_id is not a valid UUID, ignore
        }
      }

      if (!device) {
        this.logger.warn(`Device not found for status update: ${payload.device_id}`);
        return;
      }

      // Update device status using actual device UUID
      await this.deviceRepository.update(device.id, {
        status: payload.status as any,
        battery_level: payload.battery_level,
        signal_strength: payload.signal_strength,
        last_seen: new Date(payload.timestamp),
      });

      this.logger.debug(`Updated device status: ${device.serial_number || device.id} -> ${payload.status}`);

    } catch (error: unknown) {
      this.logger.error(`Error processing device status message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateTelemetryPayload(payload: any): string | null {
    if (!payload.device_id || typeof payload.device_id !== 'string') {
      return 'Invalid or missing device_id';
    }
    if (!payload.metric || typeof payload.metric !== 'string') {
      return 'Invalid or missing metric';
    }
    if (payload.value === undefined || typeof payload.value !== 'number') {
      return 'Invalid or missing value';
    }
    if (!payload.unit || typeof payload.unit !== 'string') {
      return 'Invalid or missing unit';
    }
    if (!payload.timestamp || typeof payload.timestamp !== 'string') {
      return 'Invalid or missing timestamp';
    }
    if (payload.quality_flag === undefined || typeof payload.quality_flag !== 'number') {
      return 'Invalid or missing quality_flag';
    }
    return null;
  }

  private validateDeviceStatusPayload(payload: any): string | null {
    if (!payload.device_id || typeof payload.device_id !== 'string') {
      return 'Invalid or missing device_id';
    }
    if (!payload.status || typeof payload.status !== 'string') {
      return 'Invalid or missing status';
    }
    if (!payload.timestamp || typeof payload.timestamp !== 'string') {
      return 'Invalid or missing timestamp';
    }
    return null;
  }

  private async findOrCreateSensor(deviceId: string, metric: string, unit: string): Promise<Sensor | null> {
    try {
      // First, try to find device by serial_number (simulator sends serial numbers)
      let device = await this.deviceRepository.findOne({
        where: { serial_number: deviceId },
      });

      // If not found by serial_number, try by id (for UUID-based device_id)
      if (!device) {
        try {
          device = await this.deviceRepository.findOne({
            where: { id: deviceId },
          });
        } catch (error) {
          // deviceId is not a valid UUID, ignore and proceed to create
        }
      }

      // Create device if not exists
      if (!device) {
        this.logger.log(`Auto-creating device with serial_number ${deviceId}`);
        device = this.deviceRepository.create({
          name: `Device ${deviceId}`,
          type: 'SIMULATOR' as any,
          status: 'ONLINE' as any,
          serial_number: deviceId,
        });
        await this.deviceRepository.save(device);
      }

      const actualDeviceId = device.id;

      // Check cache first using actual device UUID
      if (this.deviceSensorCache.has(actualDeviceId)) {
        const cachedSensor = this.deviceSensorCache.get(actualDeviceId)!.get(metric);
        if (cachedSensor) {
          return cachedSensor;
        }
      }

      // Query database using actual device UUID
      let sensor = await this.sensorRepository.findOne({
        where: {
          device_id: actualDeviceId,
          metric: metric as SensorMetric,
        },
      });

      // Create sensor if not exists
      if (!sensor) {
        sensor = this.sensorRepository.create({
          device_id: actualDeviceId,
          name: `${metric} Sensor`,
          metric: metric as SensorMetric,
          unit: unit,
        });
        await this.sensorRepository.save(sensor);

        // Update cache using actual device UUID
        if (!this.deviceSensorCache.has(actualDeviceId)) {
          this.deviceSensorCache.set(actualDeviceId, new Map());
        }
        this.deviceSensorCache.get(actualDeviceId)!.set(metric, sensor);

        this.logger.log(`Created new sensor: device_id=${actualDeviceId}, metric=${metric}`);
      }

      return sensor;
    } catch (error: unknown) {
      this.logger.error(`Error finding or creating sensor: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  private async checkThresholdsAndAlert(sensor: Sensor, value: number) {
    try {
      // Check if value exceeds max threshold
      if (sensor.max_value !== null && value > sensor.max_value) {
        const alertPayload = {
          sensor_id: sensor.id,
          device_id: sensor.device_id,
          metric: sensor.metric,
          value: value,
          threshold: sensor.max_value,
          severity: 'HIGH',
          message: `${sensor.metric} value ${value} exceeds maximum threshold ${sensor.max_value}`,
          timestamp: new Date().toISOString(),
        };

        await this.mqttService.publish('alert/threshold/exceeded', alertPayload, { qos: 1 });
        this.logger.warn(`Threshold exceeded: ${alertPayload.message}`);
      }

      // Check if value is below min threshold
      if (sensor.min_value !== null && value < sensor.min_value) {
        const alertPayload = {
          sensor_id: sensor.id,
          device_id: sensor.device_id,
          metric: sensor.metric,
          value: value,
          threshold: sensor.min_value,
          severity: 'HIGH',
          message: `${sensor.metric} value ${value} below minimum threshold ${sensor.min_value}`,
          timestamp: new Date().toISOString(),
        };

        await this.mqttService.publish('alert/threshold/exceeded', alertPayload, { qos: 1 });
        this.logger.warn(`Threshold exceeded: ${alertPayload.message}`);
      }
    } catch (error: unknown) {
      this.logger.error(`Error checking thresholds: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTelemetryByDevice(deviceId: string, limit: number = 100): Promise<SensorReading[]> {
    try {
      const readings = await this.sensorReadingRepository
        .createQueryBuilder('reading')
        .innerJoin('reading.sensor', 'sensor')
        .where('sensor.device_id = :deviceId', { deviceId })
        .orderBy('reading.timestamp', 'DESC')
        .limit(limit)
        .getMany();

      return readings;
    } catch (error: unknown) {
      this.logger.error(`Error fetching telemetry for device ${deviceId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getTelemetryBySensor(sensorId: string, limit: number = 100): Promise<SensorReading[]> {
    try {
      const readings = await this.sensorReadingRepository.find({
        where: { sensor_id: sensorId },
        order: { timestamp: 'DESC' },
        take: limit,
      });

      return readings;
    } catch (error: unknown) {
      this.logger.error(`Error fetching telemetry for sensor ${sensorId}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async getAggregatedTelemetry(deviceId: string, metric: string, startTime: Date, endTime: Date) {
    try {
      const result = await this.sensorReadingRepository
        .createQueryBuilder('reading')
        .innerJoin('reading.sensor', 'sensor')
        .select([
          'AVG(reading.value) as avg_value',
          'MIN(reading.value) as min_value',
          'MAX(reading.value) as max_value',
          'COUNT(reading.id) as count',
        ])
        .where('sensor.device_id = :deviceId', { deviceId })
        .andWhere('sensor.metric = :metric', { metric })
        .andWhere('reading.timestamp >= :startTime', { startTime })
        .andWhere('reading.timestamp <= :endTime', { endTime })
        .getRawOne();

      return result;
    } catch (error: unknown) {
      this.logger.error(`Error fetching aggregated telemetry: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
