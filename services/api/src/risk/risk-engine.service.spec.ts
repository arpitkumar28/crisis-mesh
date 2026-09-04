import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskEngineService } from './risk-engine.service';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { AlertsService } from '../alerts/alerts.service';
import { HazardType } from './risk-rules';

describe('RiskEngineService (rule-based, no ML)', () => {
  let service: RiskEngineService;
  let riskAssessmentRepository: Repository<RiskAssessment>;

  const mockRiskAssessmentRepository = {
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => ({ id: 'assessment-1', ...data })),
  };

  const mockAlertsService = {
    create: jest.fn(async (dto, userId) => ({ id: 'alert-1', ...dto, issued_by: userId })),
  };

  const device = { id: 'device-1', location_id: null } as any;
  const sensor = { id: 'sensor-1', device_id: 'device-1' } as any;

  function reading(metric: string, value: number, unit = '') {
    return { device, sensor, metric, value, unit, timestamp: new Date('2024-01-01T00:00:00.000Z') } as any;
  }

  beforeEach(async () => {
    const originalEnv = process.env.RISK_ENGINE_SYSTEM_USER_ID;
    process.env.RISK_ENGINE_SYSTEM_USER_ID = 'system-actor-uuid';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskEngineService,
        { provide: getRepositoryToken(RiskAssessment), useValue: mockRiskAssessmentRepository },
        { provide: AlertsService, useValue: mockAlertsService },
      ],
    }).compile();

    service = module.get<RiskEngineService>(RiskEngineService);
    riskAssessmentRepository = module.get(getRepositoryToken(RiskAssessment));
    jest.clearAllMocks();

    // restore env after each test via afterEach below
    (service as any).__originalEnv = originalEnv;
  });

  afterEach(() => {
    delete process.env.RISK_ENGINE_SYSTEM_USER_ID;
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('NORMAL telemetry never creates risk or alerts', () => {
    it('NORMAL-range TEMPERATURE produces no RiskAssessment and no Alert', async () => {
      const result = await service.evaluate(reading('TEMPERATURE', 25, '°C'));
      expect(result).toBeNull();
      expect(mockRiskAssessmentRepository.save).not.toHaveBeenCalled();
      expect(mockAlertsService.create).not.toHaveBeenCalled();
    });

    it('a metric with no defined rule (HUMIDITY) never triggers anything', async () => {
      const result = await service.evaluate(reading('HUMIDITY', 50, '%'));
      expect(result).toBeNull();
      expect(mockRiskAssessmentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('one dangerous reading per supported hazard produces a RiskAssessment', () => {
    it('FLOODING: dangerous WATER_LEVEL -> FLOOD risk assessment', async () => {
      const result = await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      expect(result).not.toBeNull();
      expect(mockRiskAssessmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ risk_type: HazardType.FLOOD, severity: 'CRITICAL', source: 'RULE_BASED_ENGINE' }),
      );
    });

    it('FIRE: dangerous AIR_QUALITY -> FIRE risk assessment', async () => {
      await service.evaluate(reading('AIR_QUALITY', 200, 'AQI'));
      expect(mockRiskAssessmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ risk_type: HazardType.FIRE, severity: 'HIGH', source: 'RULE_BASED_ENGINE' }),
      );
    });

    it('EARTHQUAKE: dangerous SEISMIC -> EARTHQUAKE risk assessment', async () => {
      await service.evaluate(reading('SEISMIC', 7.5, 'Richter'));
      expect(mockRiskAssessmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ risk_type: HazardType.EARTHQUAKE, severity: 'CRITICAL', source: 'RULE_BASED_ENGINE' }),
      );
    });

    it('HEATWAVE: dangerous TEMPERATURE -> HEAT risk assessment', async () => {
      await service.evaluate(reading('TEMPERATURE', 47, '°C'));
      expect(mockRiskAssessmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ risk_type: HazardType.HEAT, severity: 'CRITICAL', source: 'RULE_BASED_ENGINE' }),
      );
    });

    it('never claims AI/ML — confidence is null, source is RULE_BASED_ENGINE, not AI_MODEL', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      const saved = mockRiskAssessmentRepository.save.mock.calls[0][0];
      expect(saved.confidence).toBeNull();
      expect(saved.source).toBe('RULE_BASED_ENGINE');
      expect(saved.source).not.toBe('AI_MODEL');
    });
  });

  describe('invalid/malformed telemetry is handled safely', () => {
    it('ignores a non-numeric value without throwing', async () => {
      const result = await service.evaluate({ ...reading('WATER_LEVEL', NaN as any, 'm') });
      expect(result).toBeNull();
    });

    it('ignores a null reading without throwing', async () => {
      const result = await service.evaluate(null as any);
      expect(result).toBeNull();
    });

    it('survives a repository failure without throwing', async () => {
      mockRiskAssessmentRepository.save.mockRejectedValueOnce(new Error('db down'));
      await expect(service.evaluate(reading('WATER_LEVEL', 6.5, 'm'))).resolves.toBeNull();
    });
  });

  describe('actionable vs non-actionable severity', () => {
    it('MEDIUM severity persists a RiskAssessment but creates no Alert', async () => {
      await service.evaluate(reading('WATER_LEVEL', 2.7, 'm')); // MEDIUM band
      expect(mockRiskAssessmentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'MEDIUM' }),
      );
      expect(mockAlertsService.create).not.toHaveBeenCalled();
    });

    it('HIGH severity creates an Alert', async () => {
      await service.evaluate(reading('WATER_LEVEL', 4.5, 'm')); // HIGH band
      expect(mockAlertsService.create).toHaveBeenCalledTimes(1);
    });

    it('CRITICAL severity creates an Alert', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm')); // CRITICAL band
      expect(mockAlertsService.create).toHaveBeenCalledTimes(1);
    });

    it('Alert uses existing enums: FLOOD type, correct severity, real device-derived title', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      const [dto, actorId] = mockAlertsService.create.mock.calls[0];
      expect(dto.type).toBe('FLOOD');
      expect(dto.severity).toBe('CRITICAL');
      expect(dto.title).toContain('device-1');
      expect(actorId).toBe('system-actor-uuid');
    });
  });

  describe('cooldown / deduplication (key: deviceId::hazard)', () => {
    it('a second dangerous reading for the same device+hazard within the cooldown window does not create a second Alert', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      await service.evaluate(reading('WATER_LEVEL', 6.6, 'm'));
      expect(mockAlertsService.create).toHaveBeenCalledTimes(1);
    });

    it('still persists a RiskAssessment for the cooldown-suppressed reading (observability unaffected)', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      mockRiskAssessmentRepository.save.mockClear();
      await service.evaluate(reading('WATER_LEVEL', 6.6, 'm'));
      expect(mockRiskAssessmentRepository.save).toHaveBeenCalledTimes(1);
    });

    it('a different device is not affected by another device\'s cooldown', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      const otherDevice = { id: 'device-2', location_id: null } as any;
      await service.evaluate({ device: otherDevice, sensor: { id: 'sensor-2', device_id: 'device-2' } as any, metric: 'WATER_LEVEL', value: 6.5, unit: 'm', timestamp: new Date() });
      expect(mockAlertsService.create).toHaveBeenCalledTimes(2);
    });

    it('a different hazard on the same device is not suppressed by another hazard\'s cooldown', async () => {
      await service.evaluate(reading('WATER_LEVEL', 6.5, 'm')); // FLOOD
      await service.evaluate(reading('SEISMIC', 7.5, 'Richter')); // EARTHQUAKE, same device
      expect(mockAlertsService.create).toHaveBeenCalledTimes(2);
    });

    it('repeated identical dangerous telemetry does not create an alert storm', async () => {
      for (let i = 0; i < 10; i++) {
        await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      }
      expect(mockAlertsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('system-actor configuration (issued_by is a required FK — see risk-engine.service.ts)', () => {
    it('fails safe (no Alert, no crash) when RISK_ENGINE_SYSTEM_USER_ID is not configured', async () => {
      delete process.env.RISK_ENGINE_SYSTEM_USER_ID;
      const result = await service.evaluate(reading('WATER_LEVEL', 6.5, 'm'));
      expect(result).not.toBeNull(); // RiskAssessment still persisted
      expect(mockAlertsService.create).not.toHaveBeenCalled();
    });
  });
});
