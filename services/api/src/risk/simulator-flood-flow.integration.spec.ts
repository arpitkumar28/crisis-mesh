import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TelemetryService } from '../telemetry/telemetry.service';
import { RiskEngineService } from './risk-engine.service';
import { AlertsService } from '../alerts/alerts.service';
import { WebSocketService } from '../websocket/websocket.service';
import { MqttService } from '../mqtt/mqtt.service';
import { AuditService } from '../audit/audit.service';
import { IncidentsService } from '../incidents/incidents.service';
import { SensorReading } from '../entities/sensor-reading.entity';
import { Sensor } from '../entities/sensor.entity';
import { Device } from '../entities/device.entity';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { Alert } from '../entities/alert.entity';

/**
 * Deterministic, local, mocked-database integration test for the full
 * chain this project's simulator is meant to drive:
 *
 *   simulator MQTT message (FLOODING scenario, WATER_LEVEL)
 *     -> TelemetryService.handleTelemetryMessage   (real)
 *     -> RiskEngineService.evaluate                (real, rule-based)
 *     -> RiskAssessment persisted                  (mocked repository)
 *     -> AlertsService.create                      (real)
 *     -> Alert persisted                           (mocked repository)
 *     -> WebSocketService.broadcastAlertCreated    (mocked — asserted called)
 *
 * TelemetryService, RiskEngineService, and AlertsService are the REAL
 * classes wired together via Nest's DI, exercising their actual
 * integration rather than each being mocked out from the others. Only the
 * true leaves (TypeORM repositories, MqttService, WebSocketService,
 * AuditService) are mocked, since no database or MQTT broker is available
 * in this environment.
 *
 * This is NOT a production E2E test — it does not touch EMQX, Render, or
 * a real Postgres instance. It proves the code path is wired correctly;
 * see PHASE/GATE reports for what remains genuinely unverified against
 * the live deployment.
 */
describe('Simulator FLOODING scenario -> risk -> alert -> websocket (integration, mocked DB/MQTT)', () => {
  let telemetryService: TelemetryService;

  const mockSensorReadingRepository = {
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => ({ id: 'reading-flood-1', ...data })),
    find: jest.fn(),
    findOne: jest.fn().mockResolvedValue(null), // no duplicate
    createQueryBuilder: jest.fn(),
  };

  const device = {
    id: 'device-flood-1',
    serial_number: 'sim-node-001',
    location_id: null,
  };

  const sensor = {
    id: 'sensor-flood-1',
    device_id: 'device-flood-1',
    metric: 'WATER_LEVEL',
    min_value: null,
    max_value: null,
  };

  const mockSensorRepository = {
    findOne: jest.fn().mockResolvedValue(sensor),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockDeviceRepository = {
    findOne: jest.fn().mockResolvedValue(device),
    update: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRiskAssessmentRepository = {
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => ({ id: 'risk-flood-1', ...data })),
  };

  const mockAlertRepository = {
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => ({ id: 'alert-flood-1', ...data, issued_at: new Date() })),
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
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue(undefined),
  };

  // Not exercised by this scenario (Alert creation never escalates to an
  // incident on its own — that's an explicit authority action) — present
  // only to satisfy AlertsService's constructor dependency.
  const mockIncidentsService = {
    create: jest.fn(),
  };

  beforeAll(() => {
    process.env.RISK_ENGINE_SYSTEM_USER_ID = 'system-actor-uuid-flood-test';
  });

  afterAll(() => {
    delete process.env.RISK_ENGINE_SYSTEM_USER_ID;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSensorReadingRepository.findOne.mockResolvedValue(null);
    mockSensorRepository.findOne.mockResolvedValue(sensor);
    mockDeviceRepository.findOne.mockResolvedValue(device);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        RiskEngineService,
        AlertsService,
        { provide: getRepositoryToken(SensorReading), useValue: mockSensorReadingRepository },
        { provide: getRepositoryToken(Sensor), useValue: mockSensorRepository },
        { provide: getRepositoryToken(Device), useValue: mockDeviceRepository },
        { provide: getRepositoryToken(RiskAssessment), useValue: mockRiskAssessmentRepository },
        { provide: getRepositoryToken(Alert), useValue: mockAlertRepository },
        { provide: MqttService, useValue: mockMqttService },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: IncidentsService, useValue: mockIncidentsService },
      ],
    }).compile();

    telemetryService = module.get<TelemetryService>(TelemetryService);
  });

  it('a dangerous FLOODING WATER_LEVEL reading (matching the simulator\'s payload shape) produces telemetry + risk + a real Alert + websocket broadcasts', async () => {
    // Shaped exactly like apps/simulator/main.py's publish_telemetry() payload
    // for the FLOODING scenario at a late iteration (water_level well past
    // the CRITICAL threshold of 6.0m defined in risk-rules.ts).
    const simulatorMessage = {
      payload: Buffer.from(
        JSON.stringify({
          device_id: 'sim-node-001',
          metric: 'WATER_LEVEL',
          value: 6.8,
          unit: 'm',
          timestamp: '2024-06-01T12:00:00.000Z',
          quality_flag: 1,
        }),
      ),
    };

    await (telemetryService as any).handleTelemetryMessage(simulatorMessage);

    // 1. Telemetry persisted
    expect(mockSensorReadingRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ sensor_id: 'sensor-flood-1', value: 6.8 }),
    );

    // 2. Telemetry real-time event
    expect(mockWebSocketService.broadcastTelemetryUpdated).toHaveBeenCalledWith(
      expect.objectContaining({ device_id: 'device-flood-1', metric: 'WATER_LEVEL', value: 6.8 }),
    );

    // 3. Risk assessment persisted, labeled rule-based, not AI
    expect(mockRiskAssessmentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        risk_type: 'FLOOD',
        severity: 'CRITICAL',
        source: 'RULE_BASED_ENGINE',
        confidence: null,
      }),
    );

    // 4. A real Alert was created via the real AlertsService (not bypassed)
    expect(mockAlertRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'FLOOD', severity: 'CRITICAL', issued_by: 'system-actor-uuid-flood-test' }),
    );

    // 5. alert.created broadcast over WebSocket after persistence
    expect(mockWebSocketService.broadcastAlertCreated).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'FLOOD', severity: 'CRITICAL' }),
    );

    // 6. The alert creation was itself audited (existing AlertsService behavior, untouched)
    expect(mockAuditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entity_type: 'ALERT' }),
    );
  });

  it('a NORMAL-range reading on the same pipeline produces telemetry but no risk assessment and no alert', async () => {
    const normalMessage = {
      payload: Buffer.from(
        JSON.stringify({
          device_id: 'sim-node-001',
          metric: 'TEMPERATURE',
          value: 25.2,
          unit: '°C',
          timestamp: '2024-06-01T12:00:01.000Z',
          quality_flag: 1,
        }),
      ),
    };
    mockSensorRepository.findOne.mockResolvedValue({ ...sensor, metric: 'TEMPERATURE' });

    await (telemetryService as any).handleTelemetryMessage(normalMessage);

    expect(mockSensorReadingRepository.save).toHaveBeenCalled();
    expect(mockRiskAssessmentRepository.save).not.toHaveBeenCalled();
    expect(mockAlertRepository.save).not.toHaveBeenCalled();
    expect(mockWebSocketService.broadcastAlertCreated).not.toHaveBeenCalled();
  });
});
