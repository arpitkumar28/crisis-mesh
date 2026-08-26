import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryService } from './telemetry.service';
import { SensorReading } from '../entities/sensor-reading.entity';
import { Sensor } from '../entities/sensor.entity';
import { Device } from '../entities/device.entity';
import { MqttService } from '../mqtt/mqtt.service';

describe('TelemetryService', () => {
  let service: TelemetryService;
  let sensorReadingRepository: Repository<SensorReading>;
  let sensorRepository: Repository<Sensor>;
  let deviceRepository: Repository<Device>;
  let mqttService: MqttService;

  const mockSensorReadingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSensorRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDeviceRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockMqttService = {
    subscribe: jest.fn(),
    publish: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        {
          provide: getRepositoryToken(SensorReading),
          useValue: mockSensorReadingRepository,
        },
        {
          provide: getRepositoryToken(Sensor),
          useValue: mockSensorRepository,
        },
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepository,
        },
        {
          provide: MqttService,
          useValue: mockMqttService,
        },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
    sensorReadingRepository = module.get<Repository<SensorReading>>(getRepositoryToken(SensorReading));
    sensorRepository = module.get<Repository<Sensor>>(getRepositoryToken(Sensor));
    deviceRepository = module.get<Repository<Device>>(getRepositoryToken(Device));
    mqttService = module.get<MqttService>(MqttService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTelemetryPayload', () => {
    it('should validate correct payload', () => {
      const validPayload = {
        device_id: 'test-device',
        metric: 'TEMPERATURE',
        value: 25.5,
        unit: '°C',
        timestamp: '2024-01-01T00:00:00Z',
        quality_flag: 100,
      };

      const result = (service as any).validateTelemetryPayload(validPayload);
      expect(result).toBeNull();
    });

    it('should reject payload with missing device_id', () => {
      const invalidPayload = {
        metric: 'TEMPERATURE',
        value: 25.5,
        unit: '°C',
        timestamp: '2024-01-01T00:00:00Z',
        quality_flag: 100,
      };

      const result = (service as any).validateTelemetryPayload(invalidPayload);
      expect(result).toBe('Invalid or missing device_id');
    });

    it('should reject payload with invalid value', () => {
      const invalidPayload = {
        device_id: 'test-device',
        metric: 'TEMPERATURE',
        value: 'not a number',
        unit: '°C',
        timestamp: '2024-01-01T00:00:00Z',
        quality_flag: 100,
      };

      const result = (service as any).validateTelemetryPayload(invalidPayload);
      expect(result).toBe('Invalid or missing value');
    });
  });

  describe('validateDeviceStatusPayload', () => {
    it('should validate correct device status payload', () => {
      const validPayload = {
        device_id: 'test-device',
        status: 'ONLINE',
        timestamp: '2024-01-01T00:00:00Z',
      };

      const result = (service as any).validateDeviceStatusPayload(validPayload);
      expect(result).toBeNull();
    });

    it('should reject payload with missing status', () => {
      const invalidPayload = {
        device_id: 'test-device',
        timestamp: '2024-01-01T00:00:00Z',
      };

      const result = (service as any).validateDeviceStatusPayload(invalidPayload);
      expect(result).toBe('Invalid or missing status');
    });
  });

  describe('getTelemetryByDevice', () => {
    it('should return telemetry for a device', async () => {
      const mockReadings = [
        { id: '1', value: 25.5, unit: '°C', timestamp: new Date() },
        { id: '2', value: 26.0, unit: '°C', timestamp: new Date() },
      ];

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockReadings),
      };

      mockSensorReadingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTelemetryByDevice('test-device', 100);

      expect(result).toEqual(mockReadings);
      expect(mockSensorReadingRepository.createQueryBuilder).toHaveBeenCalledWith('reading');
    });
  });

  describe('getTelemetryBySensor', () => {
    it('should return telemetry for a sensor', async () => {
      const mockReadings = [
        { id: '1', value: 25.5, unit: '°C', timestamp: new Date() },
      ];

      mockSensorReadingRepository.find.mockResolvedValue(mockReadings);

      const result = await service.getTelemetryBySensor('sensor-1', 100);

      expect(result).toEqual(mockReadings);
      expect(mockSensorReadingRepository.find).toHaveBeenCalledWith({
        where: { sensor_id: 'sensor-1' },
        order: { timestamp: 'DESC' },
        take: 100,
      });
    });
  });

  describe('getAggregatedTelemetry', () => {
    it('should return aggregated telemetry data', async () => {
      const mockAggregatedData = {
        avg_value: '25.5',
        min_value: '20.0',
        max_value: '30.0',
        count: '100',
      };

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockAggregatedData),
      };

      mockSensorReadingRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const startTime = new Date('2024-01-01');
      const endTime = new Date('2024-01-02');

      const result = await service.getAggregatedTelemetry('device-1', 'TEMPERATURE', startTime, endTime);

      expect(result).toEqual(mockAggregatedData);
      expect(mockSensorReadingRepository.createQueryBuilder).toHaveBeenCalledWith('reading');
    });
  });
});
