import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * Regression test for a route-ordering bug: `@Get(':id')` was declared before
 * `@Get('filter')`, `@Get('sources')`, and `@Get('types')`, so Nest matched
 * those three static paths as `:id` requests instead of reaching their own
 * handlers. These tests boot a real HTTP server (not just calling the
 * controller methods directly) so route resolution order is actually
 * exercised, the way unit tests that call `controller.findOne()` etc. cannot.
 */
describe('AlertsController (route ordering, HTTP)', () => {
  let app: INestApplication;

  const mockAlertsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findBySeverity: jest.fn(),
    findActive: jest.fn(),
    getCriticalAlerts: jest.fn(),
    getAlertCount: jest.fn(),
    getAlertCountByStatus: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByFilters: jest.fn(),
    getAlertSources: jest.fn(),
    getAlertTypes: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [{ provide: AlertsService, useValue: mockAlertsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /v1/alerts/sources resolves to getSources, not findOne', async () => {
    mockAlertsService.getAlertSources.mockResolvedValue(['MANUAL', 'IMD']);

    const res = await request(app.getHttpServer()).get('/v1/alerts/sources');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(['MANUAL', 'IMD']);
    expect(mockAlertsService.getAlertSources).toHaveBeenCalledTimes(1);
    expect(mockAlertsService.findOne).not.toHaveBeenCalled();
  });

  it('GET /v1/alerts/types resolves to getTypes, not findOne', async () => {
    mockAlertsService.getAlertTypes.mockResolvedValue(['FLOOD', 'WILDFIRE']);

    const res = await request(app.getHttpServer()).get('/v1/alerts/types');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(['FLOOD', 'WILDFIRE']);
    expect(mockAlertsService.getAlertTypes).toHaveBeenCalledTimes(1);
    expect(mockAlertsService.findOne).not.toHaveBeenCalled();
  });

  it('GET /v1/alerts/filter resolves to findByFilters, not findOne', async () => {
    mockAlertsService.findByFilters.mockResolvedValue({ alerts: [], total: 0 });

    const res = await request(app.getHttpServer())
      .get('/v1/alerts/filter')
      .query({ severity: 'HIGH' });

    expect(res.status).toBe(200);
    expect(mockAlertsService.findByFilters).toHaveBeenCalledTimes(1);
    expect(mockAlertsService.findOne).not.toHaveBeenCalled();
  });

  it('GET /v1/alerts/:id still resolves to findOne for an actual id', async () => {
    mockAlertsService.findOne.mockResolvedValue({ id: 'alert-123', title: 'Test Alert' });

    const res = await request(app.getHttpServer()).get('/v1/alerts/alert-123');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: 'alert-123', title: 'Test Alert' });
    expect(mockAlertsService.findOne.mock.calls[0][0]).toBe('alert-123');
  });
});
