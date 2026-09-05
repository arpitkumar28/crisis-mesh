import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { Incident } from '../entities/incident.entity';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { UserRoleEnum } from '../entities/profile.entity';

describe('IncidentsService — CITIZEN scoping', () => {
  let service: IncidentsService;
  let incidentRepository: Repository<Incident>;

  const mockIncidentRepository = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockWebSocketService = {
    broadcastIncidentCreated: jest.fn(),
    broadcastIncidentUpdated: jest.fn(),
    broadcast: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockUsersService = {
    findByRole: jest.fn(),
    hasRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: getRepositoryToken(Incident), useValue: mockIncidentRepository },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: UsersService, useValue: mockUsersService },
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

describe('IncidentsService — responder assignment', () => {
  let service: IncidentsService;

  const mockIncidentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockWebSocketService = {
    broadcastIncidentCreated: jest.fn(),
    broadcastIncidentUpdated: jest.fn(),
    broadcast: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockUsersService = {
    findByRole: jest.fn(),
    hasRole: jest.fn(),
  };

  const staffUser = { id: 'authority-1', roles: [UserRoleEnum.AUTHORITY] };

  const baseIncident = () => ({
    id: 'incident-1',
    status: 'REPORTED',
    severity: 'HIGH',
    type: 'HAZARD',
    location_id: 'loc-1',
    reported_by: 'citizen-1',
    assigned_to: null,
    updated_at: new Date('2026-01-01T00:00:00Z'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: getRepositoryToken(Incident), useValue: mockIncidentRepository },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
    jest.clearAllMocks();
  });

  describe('getEligibleResponders', () => {
    it('returns only id/name/role for RESPONDER accounts, nothing else', async () => {
      mockUsersService.findByRole.mockResolvedValue([
        {
          id: 'r1',
          name: 'Responder One',
          email: 'r1@example.com',
          password_hash: 'should-never-appear',
        },
        {
          id: 'r2',
          name: 'Responder Two',
          email: 'r2@example.com',
          password_hash: 'should-never-appear',
        },
      ]);

      const result = await service.getEligibleResponders();

      expect(mockUsersService.findByRole).toHaveBeenCalledWith(
        UserRoleEnum.RESPONDER,
      );
      expect(result).toEqual([
        { id: 'r1', name: 'Responder One', role: UserRoleEnum.RESPONDER },
        { id: 'r2', name: 'Responder Two', role: UserRoleEnum.RESPONDER },
      ]);
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('password_hash');
      expect(serialized).not.toContain('email');
    });
  });

  describe('assignResponder', () => {
    it('throws NotFoundException when the incident does not exist', async () => {
      mockIncidentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignResponder('missing', 'responder-1', staffUser),
      ).rejects.toThrow(NotFoundException);
      expect(mockUsersService.hasRole).not.toHaveBeenCalled();
    });

    it('rejects assignment to a user without the RESPONDER role (covers CITIZEN, ADMIN, and nonexistent IDs alike)', async () => {
      mockIncidentRepository.findOne.mockResolvedValue(baseIncident());
      mockUsersService.hasRole.mockResolvedValue(false);

      await expect(
        service.assignResponder('incident-1', 'not-a-responder', staffUser),
      ).rejects.toThrow(BadRequestException);

      expect(mockUsersService.hasRole).toHaveBeenCalledWith(
        'not-a-responder',
        UserRoleEnum.RESPONDER,
      );
      expect(mockIncidentRepository.update).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
      expect(mockWebSocketService.broadcastIncidentUpdated).not.toHaveBeenCalled();
    });

    it('assigns a real responder via a direct column update, broadcasts, and audits the change', async () => {
      const incident = baseIncident();
      mockIncidentRepository.findOne
        .mockResolvedValueOnce(incident) // initial findOne inside assignResponder
        .mockResolvedValueOnce({ ...incident, assigned_to: 'responder-1' }); // re-fetch after the update
      mockUsersService.hasRole.mockResolvedValue(true);
      mockIncidentRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.assignResponder(
        'incident-1',
        'responder-1',
        staffUser,
      );

      expect(mockUsersService.hasRole).toHaveBeenCalledWith(
        'responder-1',
        UserRoleEnum.RESPONDER,
      );
      // A direct update() against the column — not save() on the loaded
      // entity — because save() silently drops this column once the
      // `assignee` relation is also loaded (see the comment in
      // incidents.service.ts on assignResponder).
      expect(mockIncidentRepository.update).toHaveBeenCalledWith(
        { id: 'incident-1' },
        { assigned_to: 'responder-1' },
      );
      expect(mockWebSocketService.broadcastIncidentUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ incident_id: 'incident-1' }),
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'authority-1',
          action: 'ASSIGN',
          entity_type: 'INCIDENT',
          entity_id: 'incident-1',
          old_values: { assigned_to: null },
          new_values: { assigned_to: 'responder-1' },
        }),
      );
      expect(result.assigned_to).toBe('responder-1');
    });

    it('reassigns from one responder to another and records both in the audit log', async () => {
      const incident = { ...baseIncident(), assigned_to: 'responder-1' };
      mockIncidentRepository.findOne
        .mockResolvedValueOnce(incident)
        .mockResolvedValueOnce({ ...incident, assigned_to: 'responder-2' });
      mockUsersService.hasRole.mockResolvedValue(true);
      mockIncidentRepository.update.mockResolvedValue({ affected: 1 });

      await service.assignResponder('incident-1', 'responder-2', staffUser);

      expect(mockIncidentRepository.update).toHaveBeenCalledWith(
        { id: 'incident-1' },
        { assigned_to: 'responder-2' },
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ASSIGN',
          old_values: { assigned_to: 'responder-1' },
          new_values: { assigned_to: 'responder-2' },
        }),
      );
    });

    it('unassigns when assignedTo is explicitly null, without checking hasRole', async () => {
      const incident = { ...baseIncident(), assigned_to: 'responder-1' };
      mockIncidentRepository.findOne
        .mockResolvedValueOnce(incident)
        .mockResolvedValueOnce({ ...incident, assigned_to: null });
      mockIncidentRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.assignResponder(
        'incident-1',
        null,
        staffUser,
      );

      expect(mockUsersService.hasRole).not.toHaveBeenCalled();
      expect(mockIncidentRepository.update).toHaveBeenCalledWith(
        { id: 'incident-1' },
        { assigned_to: null },
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UNASSIGN',
          old_values: { assigned_to: 'responder-1' },
          new_values: { assigned_to: null },
        }),
      );
      expect(result.assigned_to).toBeNull();
    });

    it('is a no-op (no update/audit/broadcast) when the requested assignee already matches', async () => {
      const incident = { ...baseIncident(), assigned_to: 'responder-1' };
      mockIncidentRepository.findOne.mockResolvedValueOnce(incident);
      mockUsersService.hasRole.mockResolvedValue(true);

      await service.assignResponder('incident-1', 'responder-1', staffUser);

      expect(mockIncidentRepository.update).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
      expect(mockWebSocketService.broadcastIncidentUpdated).not.toHaveBeenCalled();
    });
  });
});
