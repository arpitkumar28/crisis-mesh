import { Test, TestingModule } from '@nestjs/testing';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRoleEnum } from '../entities/profile.entity';

describe('TelemetryController', () => {
  let controller: TelemetryController;
  let telemetryService: TelemetryService;

  const mockTelemetryService = {
    getTelemetryByDevice: jest.fn(),
    getTelemetryBySensor: jest.fn(),
    getAggregatedTelemetry: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelemetryController],
      providers: [
        {
          provide: TelemetryService,
          useValue: mockTelemetryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<TelemetryController>(TelemetryController);
    telemetryService = module.get<TelemetryService>(TelemetryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTelemetryByDevice', () => {
    it('should get telemetry by device successfully', async () => {
      const mockReadings = [
        { id: 'reading-1', value: 25.5, timestamp: new Date() },
        { id: 'reading-2', value: 26.0, timestamp: new Date() },
      ];

      mockTelemetryService.getTelemetryByDevice.mockResolvedValue(mockReadings);

      const result = await controller.getTelemetryByDevice('device-id', '100');

      expect(result).toEqual({
        success: true,
        message: 'Telemetry retrieved successfully',
        data: mockReadings,
      });
      expect(mockTelemetryService.getTelemetryByDevice).toHaveBeenCalledWith('device-id', 100);
    });

    it('should use default limit when not provided', async () => {
      const mockReadings = [
        { id: 'reading-1', value: 25.5, timestamp: new Date() },
      ];

      mockTelemetryService.getTelemetryByDevice.mockResolvedValue(mockReadings);

      await controller.getTelemetryByDevice('device-id', undefined);

      expect(mockTelemetryService.getTelemetryByDevice).toHaveBeenCalledWith('device-id', 100);
    });
  });

  describe('getTelemetryBySensor', () => {
    it('should get telemetry by sensor successfully', async () => {
      const mockReadings = [
        { id: 'reading-1', value: 25.5, timestamp: new Date() },
        { id: 'reading-2', value: 26.0, timestamp: new Date() },
      ];

      mockTelemetryService.getTelemetryBySensor.mockResolvedValue(mockReadings);

      const result = await controller.getTelemetryBySensor('sensor-id', '50');

      expect(result).toEqual({
        success: true,
        message: 'Telemetry retrieved successfully',
        data: mockReadings,
      });
      expect(mockTelemetryService.getTelemetryBySensor).toHaveBeenCalledWith('sensor-id', 50);
    });
  });

  describe('getAggregatedTelemetry', () => {
    it('should get aggregated telemetry successfully', async () => {
      const mockAggregated = {
        avg: 25.5,
        min: 20.0,
        max: 30.0,
        count: 100,
      };

      mockTelemetryService.getAggregatedTelemetry.mockResolvedValue(mockAggregated);

      const result = await controller.getAggregatedTelemetry(
        'device-id',
        'TEMPERATURE',
        '2024-01-01T00:00:00Z',
        '2024-01-02T00:00:00Z',
      );

      expect(result).toEqual({
        success: true,
        message: 'Aggregated telemetry retrieved successfully',
        data: mockAggregated,
      });
      expect(mockTelemetryService.getAggregatedTelemetry).toHaveBeenCalledWith(
        'device-id',
        'TEMPERATURE',
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-01-02T00:00:00Z'),
      );
    });

    it('should use default time range when not provided', async () => {
      const mockAggregated = {
        avg: 25.5,
        min: 20.0,
        max: 30.0,
        count: 100,
      };

      mockTelemetryService.getAggregatedTelemetry.mockResolvedValue(mockAggregated);

      await controller.getAggregatedTelemetry('device-id', 'TEMPERATURE', undefined, undefined);

      expect(mockTelemetryService.getAggregatedTelemetry).toHaveBeenCalledWith(
        'device-id',
        'TEMPERATURE',
        expect.any(Date),
        expect.any(Date),
      );
    });
  });
});
