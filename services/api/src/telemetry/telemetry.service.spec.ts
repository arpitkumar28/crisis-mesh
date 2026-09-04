import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelemetryService } from './telemetry.service';
import { SensorReading } from '../entities/sensor-reading.entity';
import { Sensor } from '../entities/sensor.entity';
import { Device } from '../entities/device.entity';
import { MqttService } from '../mqtt/mqtt.service';
import { WebSocketService } from '../websocket/websocket.service';
import { RiskEngineService } from '../risk/risk-engine.service';

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
    findOne: jest.fn(),
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

  const mockWebSocketService = {
    broadcastTelemetryUpdated: jest.fn(),
    broadcastDeviceStatusChanged: jest.fn(),
    broadcastAlertCreated: jest.fn(),
    broadcastAlertUpdated: jest.fn(),
    broadcastIncidentCreated: jest.fn(),
    broadcastIncidentUpdated: jest.fn(),
    broadcastIncidentStatusChanged: jest.fn(),
    broadcastNotificationCreated: jest.fn(),
  };

  const mockRiskEngineService = {
    evaluate: jest.fn().mockResolvedValue(null),
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
        {
          provide: WebSocketService,
          useValue: mockWebSocketService,
        },
        {
          provide: RiskEngineService,
          useValue: mockRiskEngineService,
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

  describe('handleTelemetryMessage (private, exercised via MQTT-shaped message)', () => {
    function makeMessage(payload: any) {
      return { payload: Buffer.from(JSON.stringify(payload)) };
    }

    const validPayload = {
      device_id: 'sim-node-001',
      metric: 'TEMPERATURE',
      value: 25.5,
      unit: '°C',
      timestamp: '2024-01-01T00:00:00.000Z',
      quality_flag: 1,
    };

    it('auto-creates the device and sensor on first telemetry for an unknown device', async () => {
      // No existing device found by serial_number or id
      mockDeviceRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      const createdDevice = { id: 'device-uuid-1', serial_number: 'sim-node-001' };
      mockDeviceRepository.create.mockReturnValue(createdDevice);
      mockDeviceRepository.save.mockResolvedValue(createdDevice);

      // No existing sensor for this device+metric
      mockSensorRepository.findOne.mockResolvedValue(null);
      const createdSensor = { id: 'sensor-uuid-1', device_id: 'device-uuid-1', metric: 'TEMPERATURE' };
      mockSensorRepository.create.mockReturnValue(createdSensor);
      mockSensorRepository.save.mockResolvedValue(createdSensor);

      // No duplicate reading exists
      mockSensorReadingRepository.findOne.mockResolvedValue(null);
      const createdReading = { id: 'reading-1', sensor_id: 'sensor-uuid-1', value: 25.5 };
      mockSensorReadingRepository.create.mockReturnValue(createdReading);
      mockSensorReadingRepository.save.mockResolvedValue(createdReading);

      await (service as any).handleTelemetryMessage(makeMessage(validPayload));

      expect(mockDeviceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ serial_number: 'sim-node-001', type: 'SIMULATOR' }),
      );
      expect(mockSensorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ device_id: 'device-uuid-1', metric: 'TEMPERATURE', unit: '°C' }),
      );
      expect(mockSensorReadingRepository.save).toHaveBeenCalledWith(createdReading);
      expect(mockDeviceRepository.update).toHaveBeenCalledWith('device-uuid-1', expect.objectContaining({ last_seen: expect.any(Date) }));
      expect(mockWebSocketService.broadcastTelemetryUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ device_id: 'device-uuid-1', sensor_id: 'sensor-uuid-1', metric: 'TEMPERATURE', value: 25.5 }),
      );
    });

    it('reuses an existing device and sensor instead of recreating them', async () => {
      const existingDevice = { id: 'device-uuid-2', serial_number: 'sim-node-002' };
      mockDeviceRepository.findOne.mockResolvedValueOnce(existingDevice);
      const existingSensor = { id: 'sensor-uuid-2', device_id: 'device-uuid-2', metric: 'TEMPERATURE' };
      mockSensorRepository.findOne.mockResolvedValueOnce(existingSensor);
      mockSensorReadingRepository.findOne.mockResolvedValue(null);
      mockSensorReadingRepository.create.mockReturnValue({ id: 'reading-2' });
      mockSensorReadingRepository.save.mockResolvedValue({ id: 'reading-2' });

      await (service as any).handleTelemetryMessage(
        makeMessage({ ...validPayload, device_id: 'sim-node-002' }),
      );

      expect(mockDeviceRepository.create).not.toHaveBeenCalled();
      expect(mockSensorRepository.create).not.toHaveBeenCalled();
      expect(mockSensorReadingRepository.save).toHaveBeenCalled();
    });

    it('skips persistence for a duplicate reading (same sensor + timestamp)', async () => {
      const existingDevice = { id: 'device-uuid-3', serial_number: 'sim-node-003' };
      mockDeviceRepository.findOne.mockResolvedValueOnce(existingDevice);
      const existingSensor = { id: 'sensor-uuid-3', device_id: 'device-uuid-3', metric: 'TEMPERATURE' };
      mockSensorRepository.findOne.mockResolvedValueOnce(existingSensor);
      // Duplicate: a reading already exists for this sensor+timestamp
      mockSensorReadingRepository.findOne.mockResolvedValue({ id: 'existing-reading' });

      await (service as any).handleTelemetryMessage(
        makeMessage({ ...validPayload, device_id: 'sim-node-003' }),
      );

      expect(mockSensorReadingRepository.save).not.toHaveBeenCalled();
      expect(mockWebSocketService.broadcastTelemetryUpdated).not.toHaveBeenCalled();
    });

    it('drops the message without persisting when required fields are missing', async () => {
      await (service as any).handleTelemetryMessage(
        makeMessage({ device_id: 'sim-node-004' /* missing metric/value/unit/timestamp/quality_flag */ }),
      );

      expect(mockDeviceRepository.findOne).not.toHaveBeenCalled();
      expect(mockSensorReadingRepository.save).not.toHaveBeenCalled();
    });

    it('drops the message without crashing when value is not a number', async () => {
      await (service as any).handleTelemetryMessage(
        makeMessage({ ...validPayload, value: 'not-a-number' }),
      );

      expect(mockSensorReadingRepository.save).not.toHaveBeenCalled();
    });

    it('does not crash the process on malformed (non-JSON) payloads', async () => {
      const malformedMessage = { payload: Buffer.from('{not valid json') };

      await expect(
        (service as any).handleTelemetryMessage(malformedMessage),
      ).resolves.toBeUndefined();

      expect(mockSensorReadingRepository.save).not.toHaveBeenCalled();
    });

    it('hands the persisted reading to the risk engine with device+sensor context', async () => {
      const device = { id: 'device-uuid-6', serial_number: 'sim-node-006', location_id: null };
      // findOrCreateSensor's serial_number lookup, then the post-save risk-engine device lookup
      mockDeviceRepository.findOne
        .mockResolvedValueOnce(device)
        .mockResolvedValueOnce(device);
      const sensor = { id: 'sensor-uuid-6', device_id: 'device-uuid-6', metric: 'WATER_LEVEL' };
      mockSensorRepository.findOne.mockResolvedValueOnce(sensor);
      mockSensorReadingRepository.findOne.mockResolvedValue(null);
      mockSensorReadingRepository.create.mockReturnValue({ id: 'reading-6' });
      mockSensorReadingRepository.save.mockResolvedValue({ id: 'reading-6' });

      await (service as any).handleTelemetryMessage(
        makeMessage({ ...validPayload, device_id: 'sim-node-006', metric: 'WATER_LEVEL', value: 6.5, unit: 'm' }),
      );

      expect(mockRiskEngineService.evaluate).toHaveBeenCalledWith(
        expect.objectContaining({
          device,
          sensor,
          metric: 'WATER_LEVEL',
          value: 6.5,
          unit: 'm',
        }),
      );
    });

    it('does not call the risk engine when the device cannot be re-resolved after save', async () => {
      const newDevice = { id: 'device-uuid-7', serial_number: 'sim-node-007' };
      // findOrCreateSensor: serial_number lookup (null), id lookup (null) -> creates a device.
      // Then the post-save risk-engine lookup (3rd call) simulates the device being gone.
      mockDeviceRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(undefined);
      mockDeviceRepository.create.mockReturnValue(newDevice);
      mockDeviceRepository.save.mockResolvedValue(newDevice);
      const sensor = { id: 'sensor-uuid-7', device_id: 'device-uuid-7', metric: 'TEMPERATURE' };
      mockSensorRepository.findOne.mockResolvedValueOnce(null);
      mockSensorRepository.create.mockReturnValue(sensor);
      mockSensorRepository.save.mockResolvedValue(sensor);
      mockSensorReadingRepository.findOne.mockResolvedValue(null);
      mockSensorReadingRepository.create.mockReturnValue({ id: 'reading-7' });
      mockSensorReadingRepository.save.mockResolvedValue({ id: 'reading-7' });

      await (service as any).handleTelemetryMessage(
        makeMessage({ ...validPayload, device_id: 'sim-node-007' }),
      );

      expect(mockSensorReadingRepository.save).toHaveBeenCalled();
      expect(mockRiskEngineService.evaluate).not.toHaveBeenCalled();
    });
  });

  describe('handleDeviceStatusMessage (private, exercised via MQTT-shaped message)', () => {
    function makeMessage(payload: any) {
      return { payload: Buffer.from(JSON.stringify(payload)) };
    }

    it('updates status for a known device and broadcasts the change', async () => {
      const device = { id: 'device-uuid-5', serial_number: 'sim-node-005' };
      mockDeviceRepository.findOne.mockResolvedValueOnce(device);

      await (service as any).handleDeviceStatusMessage(
        makeMessage({
          device_id: 'sim-node-005',
          status: 'OFFLINE',
          battery_level: 42,
          signal_strength: 60,
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      );

      expect(mockDeviceRepository.update).toHaveBeenCalledWith(
        'device-uuid-5',
        expect.objectContaining({ status: 'OFFLINE', battery_level: 42, signal_strength: 60 }),
      );
      expect(mockWebSocketService.broadcastDeviceStatusChanged).toHaveBeenCalledWith(
        expect.objectContaining({ device_id: 'device-uuid-5', status: 'OFFLINE' }),
      );
    });

    it('drops the status update when the device does not exist', async () => {
      mockDeviceRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      await (service as any).handleDeviceStatusMessage(
        makeMessage({
          device_id: 'unknown-device',
          status: 'ONLINE',
          timestamp: '2024-01-01T00:00:00.000Z',
        }),
      );

      expect(mockDeviceRepository.update).not.toHaveBeenCalled();
    });

    it('does not crash on malformed (non-JSON) status payloads', async () => {
      const malformedMessage = { payload: Buffer.from('not json at all') };

      await expect(
        (service as any).handleDeviceStatusMessage(malformedMessage),
      ).resolves.toBeUndefined();

      expect(mockDeviceRepository.update).not.toHaveBeenCalled();
    });
  });
});
