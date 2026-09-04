import { Test, TestingModule } from '@nestjs/testing';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('AuditController', () => {
  let controller: AuditController;

  const mockAuditService = {
    findAll: jest.fn(),
    getUserAuditLogs: jest.fn(),
    getEntityAuditLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [{ provide: AuditService, useValue: mockAuditService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuditController>(AuditController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('defaults to limit 100, offset 0', async () => {
      mockAuditService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockAuditService.findAll).toHaveBeenCalledWith(100, 0);
    });

    it('parses provided limit/offset query params', async () => {
      mockAuditService.findAll.mockResolvedValue([]);
      await controller.findAll('25', '50');
      expect(mockAuditService.findAll).toHaveBeenCalledWith(25, 50);
    });
  });

  describe('findByUser', () => {
    it('delegates to getUserAuditLogs', async () => {
      mockAuditService.getUserAuditLogs.mockResolvedValue([{ id: 'log-1' }]);
      const result = await controller.findByUser('user-1');
      expect(mockAuditService.getUserAuditLogs).toHaveBeenCalledWith('user-1', 100);
      expect(result.data).toEqual([{ id: 'log-1' }]);
    });
  });

  describe('findByEntity', () => {
    it('delegates to getEntityAuditLogs', async () => {
      mockAuditService.getEntityAuditLogs.mockResolvedValue([]);
      await controller.findByEntity('Incident', 'incident-1');
      expect(mockAuditService.getEntityAuditLogs).toHaveBeenCalledWith('Incident', 'incident-1', 100);
    });
  });
});
