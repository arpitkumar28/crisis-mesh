import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MqttService } from '../mqtt/mqtt.service';

describe('HealthController', () => {
  let controller: HealthController;

  const mockDataSource = {
    isInitialized: true,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  };

  const mockMqttService = {
    isConnected: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockDataSource.isInitialized = true;
    mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);
    mockMqttService.isConnected.mockReturnValue(true);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: MqttService, useValue: mockMqttService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('reports ok with real connected database and mqtt', async () => {
    const health = await controller.health();
    expect(health.status).toBe('ok');
    expect(health.services.api).toBe('healthy');
    expect(health.services.database).toBe('connected');
    expect(health.services.mqtt).toBe('connected');
  });

  it('reports database disconnected (and overall error) when the query fails', async () => {
    mockDataSource.query.mockRejectedValueOnce(new Error('connection refused'));
    const health = await controller.health();
    expect(health.services.database).toBe('disconnected');
    expect(health.status).toBe('error');
  });

  it('reports database disconnected when the DataSource is not initialized, without querying', async () => {
    mockDataSource.isInitialized = false;
    const health = await controller.health();
    expect(health.services.database).toBe('disconnected');
    expect(mockDataSource.query).not.toHaveBeenCalled();
  });

  it('reports mqtt disconnected from the real MqttService state', async () => {
    mockMqttService.isConnected.mockReturnValue(false);
    const health = await controller.health();
    expect(health.services.mqtt).toBe('disconnected');
    // Overall status tracks database only, matching the documented
    // liveness-vs-dependency distinction — mqtt being down doesn't flip
    // the top-level status to 'error'.
    expect(health.status).toBe('ok');
  });
});
