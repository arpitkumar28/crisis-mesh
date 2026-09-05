import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { Alert, AlertType, AlertSeverity, AlertStatus } from '../entities/alert.entity';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { IncidentsService } from '../incidents/incidents.service';
import { IncidentType, IncidentSeverity } from '../entities/incident.entity';

describe('AlertsService — acknowledge / escalateToIncident', () => {
  let service: AlertsService;

  const mockAlertRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockWebSocketService = {
    broadcastAlertCreated: jest.fn(),
    broadcastAlertUpdated: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  const mockIncidentsService = {
    create: jest.fn(),
  };

  const authorityUser = { id: 'authority-1', roles: ['AUTHORITY'] };

  const baseAlert = (overrides: Partial<Alert> = {}) =>
    ({
      id: 'alert-1',
      type: AlertType.FLOOD,
      severity: AlertSeverity.HIGH,
      status: AlertStatus.ACTIVE,
      title: 'Rising water levels',
      description: 'Water level exceeds threshold',
      location_id: 'loc-1',
      issued_by: 'authority-1',
      acknowledged_at: null,
      acknowledged_by: null,
      incident_id: null,
      updated_at: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    }) as unknown as Alert;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: getRepositoryToken(Alert), useValue: mockAlertRepository },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: IncidentsService, useValue: mockIncidentsService },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    jest.clearAllMocks();
  });

  describe('acknowledge', () => {
    it('acknowledges an unacknowledged alert via a direct column update', async () => {
      mockAlertRepository.findOne
        .mockResolvedValueOnce(baseAlert())
        .mockResolvedValueOnce(baseAlert({ acknowledged_at: new Date(), acknowledged_by: 'authority-1' }));

      const result = await service.acknowledge('alert-1', authorityUser);

      expect(mockAlertRepository.update).toHaveBeenCalledWith(
        { id: 'alert-1' },
        expect.objectContaining({ acknowledged_by: 'authority-1' }),
      );
      expect(mockWebSocketService.broadcastAlertUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ alert_id: 'alert-1' }),
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ACKNOWLEDGE', entity_type: 'ALERT', entity_id: 'alert-1' }),
      );
      expect(result.acknowledged_by).toBe('authority-1');
    });

    it('is idempotent — acknowledging an already-acknowledged alert is a no-op', async () => {
      mockAlertRepository.findOne.mockResolvedValueOnce(
        baseAlert({ acknowledged_at: new Date(), acknowledged_by: 'someone-else' }),
      );

      await service.acknowledge('alert-1', authorityUser);

      expect(mockAlertRepository.update).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
      expect(mockWebSocketService.broadcastAlertUpdated).not.toHaveBeenCalled();
    });
  });

  describe('escalateToIncident', () => {
    it('creates a real incident via IncidentsService and links it back to the alert', async () => {
      mockAlertRepository.findOne
        .mockResolvedValueOnce(baseAlert())
        .mockResolvedValueOnce(baseAlert({ incident_id: 'incident-1' }));
      mockIncidentsService.create.mockResolvedValue({ id: 'incident-1', title: 'Escalated from alert: Rising water levels' });

      const result = await service.escalateToIncident('alert-1', authorityUser);

      expect(mockIncidentsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: IncidentType.DISASTER, // FLOOD is a natural-hazard alert type
          severity: IncidentSeverity.HIGH,
          location_id: 'loc-1',
        }),
        'authority-1',
      );
      expect(mockAlertRepository.update).toHaveBeenCalledWith(
        { id: 'alert-1' },
        { incident_id: 'incident-1' },
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ESCALATE',
          old_values: { incident_id: null },
          new_values: { incident_id: 'incident-1' },
        }),
      );
      expect(result.incident.id).toBe('incident-1');
      expect(result.alert.incident_id).toBe('incident-1');
    });

    it('maps a MANUAL alert to IncidentType.OTHER, not DISASTER', async () => {
      mockAlertRepository.findOne
        .mockResolvedValueOnce(baseAlert({ type: AlertType.MANUAL }))
        .mockResolvedValueOnce(baseAlert({ type: AlertType.MANUAL, incident_id: 'incident-2' }));
      mockIncidentsService.create.mockResolvedValue({ id: 'incident-2' });

      await service.escalateToIncident('alert-1', authorityUser);

      expect(mockIncidentsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ type: IncidentType.OTHER }),
        'authority-1',
      );
    });

    it('rejects escalating an alert that is already linked to an incident (duplicate prevention)', async () => {
      mockAlertRepository.findOne.mockResolvedValueOnce(baseAlert({ incident_id: 'existing-incident' }));

      await expect(service.escalateToIncident('alert-1', authorityUser)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockIncidentsService.create).not.toHaveBeenCalled();
      expect(mockAlertRepository.update).not.toHaveBeenCalled();
      expect(mockAuditService.log).not.toHaveBeenCalled();
    });
  });
});
