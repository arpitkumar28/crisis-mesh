import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentsService } from './incidents.service';
import { Incident } from '../entities/incident.entity';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { UserRoleEnum } from '../entities/profile.entity';

describe('IncidentsService — CITIZEN scoping', () => {
  let service: IncidentsService;
  let incidentRepository: Repository<Incident>;

  const mockIncidentRepository = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockWebSocketService = {
    broadcastIncidentCreated: jest.fn(),
    broadcastIncidentUpdated: jest.fn(),
    broadcast: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: getRepositoryToken(Incident), useValue: mockIncidentRepository },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
    incidentRepository = module.get(getRepositoryToken(Incident));
    jest.clearAllMocks();
  });

  it('findAll: scopes to reported_by for a CITIZEN user', async () => {
    const citizen = { id: 'citizen-1', roles: [UserRoleEnum.CITIZEN] };
    await service.findAll(citizen);

    expect(incidentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { reported_by: 'citizen-1' } }),
    );
  });

  it('findAll: does NOT scope for ADMIN/AUTHORITY/RESPONDER/ANALYST', async () => {
    for (const role of [
      UserRoleEnum.ADMIN,
      UserRoleEnum.AUTHORITY,
      UserRoleEnum.RESPONDER,
      UserRoleEnum.ANALYST,
    ]) {
      jest.clearAllMocks();
      await service.findAll({ id: 'staff-1', roles: [role] });
      expect(incidentRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    }
  });

  it('findAll: does not scope when no currentUser is provided (internal/public callers)', async () => {
    await service.findAll();
    expect(incidentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('findByStatus: merges reported_by scoping with the status filter for CITIZEN', async () => {
    const citizen = { id: 'citizen-2', roles: [UserRoleEnum.CITIZEN] };
    await service.findByStatus('REPORTED' as any, citizen);

    expect(incidentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'REPORTED', reported_by: 'citizen-2' },
      }),
    );
  });

  it('findByType: merges reported_by scoping with the type filter for CITIZEN', async () => {
    const citizen = { id: 'citizen-3', roles: [UserRoleEnum.CITIZEN] };
    await service.findByType('HAZARD' as any, citizen);

    expect(incidentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { type: 'HAZARD', reported_by: 'citizen-3' },
      }),
    );
  });

  it('findActive: scopes the active-status filter to reported_by for CITIZEN', async () => {
    const citizen = { id: 'citizen-4', roles: [UserRoleEnum.CITIZEN] };
    await service.findActive(citizen);

    const callArg = mockIncidentRepository.find.mock.calls[0][0];
    expect(callArg.where.reported_by).toBe('citizen-4');
    expect(callArg.where.status).toBeDefined();
  });

  it('a user with no roles array is treated as unprivileged and scoped', async () => {
    await service.findAll({ id: 'weird-user', roles: undefined });
    expect(incidentRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { reported_by: 'weird-user' } }),
    );
  });
});
