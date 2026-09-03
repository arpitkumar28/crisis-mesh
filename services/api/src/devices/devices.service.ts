import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceType, DeviceStatus } from '../entities/device.entity';
import { Sensor } from '../entities/sensor.entity';
import { DeviceStatusHistory } from '../entities/device-status-history.entity';
import { MqttService } from '../mqtt/mqtt.service';
import { WebSocketService } from '../websocket/websocket.service';

export interface CreateDeviceDto {
  name: string;
  type: DeviceType;
  serial_number?: string;
  location_id?: string;
  firmware_version?: string;
}

export interface UpdateDeviceDto {
  name?: string;
  type?: DeviceType;
  status?: DeviceStatus;
  location_id?: string;
  serial_number?: string;
  firmware_version?: string;
  battery_level?: number;
  signal_strength?: number;
}

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Sensor)
    private readonly sensorRepository: Repository<Sensor>,
    @InjectRepository(DeviceStatusHistory)
    private readonly statusHistoryRepository: Repository<DeviceStatusHistory>,
    private readonly mqttService: MqttService,
    private readonly webSocketService: WebSocketService,
  ) {}

  async createDevice(createDto: CreateDeviceDto): Promise<Device> {
    try {
      const device = this.deviceRepository.create({
        ...createDto,
        status: DeviceStatus.OFFLINE,
      });

      const savedDevice = await this.deviceRepository.save(device);

      // Log initial status
      await this.recordStatusHistory(
        savedDevice.id,
        DeviceStatus.OFFLINE,
        'Device created',
      );

      this.logger.log(
        `Created device: ${savedDevice.id} (${savedDevice.name})`,
      );

      // Publish device creation event
      await this.mqttService.publish(
        'device/created',
        {
          device_id: savedDevice.id,
          name: savedDevice.name,
          type: savedDevice.type,
          timestamp: new Date().toISOString(),
        },
        { qos: 1 },
      );

      return savedDevice;
    } catch (error: unknown) {
      this.logger.error(
        `Error creating device: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getAllDevices(): Promise<Device[]> {
    try {
      return await this.deviceRepository.find({
        relations: {
          sensors: true,
          location: true,
        },
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching devices: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDeviceById(id: string): Promise<Device> {
    try {
      const device = await this.deviceRepository.findOne({
        where: { id },
        relations: {
          sensors: true,
          location: true,
          gateways: true,
          source_links: true,
          target_links: true,
        },
      });

      if (!device) {
        throw new NotFoundException(`Device with ID ${id} not found`);
      }

      return device;
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching device ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDeviceBySerialNumber(serialNumber: string): Promise<Device | null> {
    try {
      return await this.deviceRepository.findOne({
        where: { serial_number: serialNumber },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching device by serial number: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async updateDevice(id: string, updateDto: UpdateDeviceDto): Promise<Device> {
    try {
      const device = await this.getDeviceById(id);

      // If status is changing, record history
      if (updateDto.status && updateDto.status !== device.status) {
        await this.recordStatusHistory(
          id,
          updateDto.status,
          'Status updated via API',
        );
      }

      Object.assign(device, updateDto);
      const updatedDevice = await this.deviceRepository.save(device);

      this.logger.log(`Updated device: ${id}`);

      // Publish device update event
      await this.mqttService.publish(
        `device/${id}/updated`,
        {
          device_id: id,
          updates: updateDto,
          timestamp: new Date().toISOString(),
        },
        { qos: 1 },
      );

      return updatedDevice;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating device ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async deleteDevice(id: string): Promise<void> {
    try {
      const device = await this.getDeviceById(id);
      await this.deviceRepository.remove(device);

      this.logger.log(`Deleted device: ${id}`);

      // Publish device deletion event
      await this.mqttService.publish(
        'device/deleted',
        {
          device_id: id,
          timestamp: new Date().toISOString(),
        },
        { qos: 1 },
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error deleting device ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async updateDeviceStatus(
    id: string,
    status: DeviceStatus,
    metadata?: { battery_level?: number; signal_strength?: number },
  ): Promise<Device> {
    try {
      const device = await this.getDeviceById(id);

      const previousStatus = device.status;
      device.status = status;
      device.last_seen = new Date();

      if (metadata?.battery_level !== undefined) {
        device.battery_level = metadata.battery_level;
      }
      if (metadata?.signal_strength !== undefined) {
        device.signal_strength = metadata.signal_strength;
      }

      await this.deviceRepository.save(device);

      // Record status change
      await this.recordStatusHistory(
        id,
        status,
        `Status changed from ${previousStatus} to ${status}`,
        `Device status updated`,
      );

      this.logger.log(
        `Device ${id} status changed: ${previousStatus} -> ${status}`,
      );

      // Publish status change event
      await this.mqttService.publish(
        `device/${id}/status`,
        {
          device_id: id,
          status: status,
          previous_status: previousStatus,
          battery_level: device.battery_level,
          signal_strength: device.signal_strength,
          timestamp: new Date().toISOString(),
        },
        { qos: 1 },
      );

      // Broadcast WebSocket event for real-time updates
      this.webSocketService.broadcastDeviceStatusChanged({
        device_id: id,
        status: status,
        battery_level: device.battery_level,
        signal_strength: device.signal_strength,
        timestamp: new Date().toISOString(),
      });

      return device;
    } catch (error: unknown) {
      this.logger.error(
        `Error updating device status ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDevicesByStatus(status: DeviceStatus): Promise<Device[]> {
    try {
      return await this.deviceRepository.find({
        where: { status },
        relations: {
          sensors: true,
        },
        order: {
          last_seen: 'DESC',
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching devices by status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDevicesByType(type: DeviceType): Promise<Device[]> {
    try {
      return await this.deviceRepository.find({
        where: { type },
        relations: {
          sensors: true,
        },
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching devices by type: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDeviceStatusHistory(
    deviceId: string,
    limit: number = 50,
  ): Promise<DeviceStatusHistory[]> {
    try {
      return await this.statusHistoryRepository.find({
        where: { device_id: deviceId },
        order: {
          timestamp: 'DESC',
        },
        take: limit,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching device status history: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getOnlineDevices(): Promise<Device[]> {
    return this.getDevicesByStatus(DeviceStatus.ONLINE);
  }

  async getOfflineDevices(): Promise<Device[]> {
    return this.getDevicesByStatus(DeviceStatus.OFFLINE);
  }

  async getDeviceCount(): Promise<number> {
    try {
      return await this.deviceRepository.count();
    } catch (error: unknown) {
      this.logger.error(
        `Error counting devices: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDeviceCountByStatus(): Promise<Record<DeviceStatus, number>> {
    try {
      const counts = await this.deviceRepository
        .createQueryBuilder('device')
        .select('device.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('device.status')
        .getRawMany();

      const result: Record<DeviceStatus, number> = {
        ONLINE: 0,
        OFFLINE: 0,
        UNREACHABLE: 0,
        ERROR: 0,
      };

      for (const row of counts) {
        result[row.status as DeviceStatus] = parseInt(row.count);
      }

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Error counting devices by status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async recordStatusHistory(
    deviceId: string,
    status: DeviceStatus,
    reason: string,
    message?: string,
  ): Promise<void> {
    try {
      const history = this.statusHistoryRepository.create({
        device_id: deviceId,
        status,
        message: message || reason,
      });

      await this.statusHistoryRepository.save(history);
    } catch (error: unknown) {
      this.logger.error(
        `Error recording status history: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async addSensorToDevice(
    deviceId: string,
    sensorData: {
      name: string;
      metric: string;
      unit: string;
      min_value?: number;
      max_value?: number;
    },
  ): Promise<Sensor> {
    try {
      const device = await this.getDeviceById(deviceId);

      const sensor = this.sensorRepository.create({
        device_id: deviceId,
        name: sensorData.name,
        metric: sensorData.metric as any,
        unit: sensorData.unit,
        min_value: sensorData.min_value,
        max_value: sensorData.max_value,
      });

      const savedSensor = await this.sensorRepository.save(sensor);

      this.logger.log(`Added sensor to device ${deviceId}`);

      return savedSensor;
    } catch (error: unknown) {
      this.logger.error(
        `Error adding sensor to device: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getDeviceSensors(deviceId: string): Promise<Sensor[]> {
    try {
      return await this.sensorRepository.find({
        where: { device_id: deviceId },
        order: {
          created_at: 'ASC',
        },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Error fetching device sensors: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
