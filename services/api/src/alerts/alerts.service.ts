import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Alert, AlertStatus, AlertSeverity, AlertType } from '../entities/alert.entity';
import { Incident, IncidentType, IncidentSeverity } from '../entities/incident.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { AlertUpdatedEvent } from '../websocket/dto/websocket-event.dto';
import { UserRoleEnum } from '../entities/profile.entity';
import { IncidentsService } from '../incidents/incidents.service';

// Alert types that represent a natural-hazard event map onto the
// DISASTER incident type; MANUAL (an authority-issued advisory with no
// fixed hazard category) maps onto OTHER.
const NATURAL_HAZARD_ALERT_TYPES = new Set<AlertType>([
  AlertType.WEATHER,
  AlertType.FLOOD,
  AlertType.EARTHQUAKE,
  AlertType.WILDFIRE,
  AlertType.LANDSLIDE,
  AlertType.TSUNAMI,
  AlertType.CYCLONE,
]);

// AlertSeverity and IncidentSeverity are separate enums with identical
// string values (LOW/MEDIUM/HIGH/CRITICAL) — map explicitly rather than
// casting, so a future divergence between the two fails loudly.
const ALERT_TO_INCIDENT_SEVERITY: Record<AlertSeverity, IncidentSeverity> = {
  [AlertSeverity.LOW]: IncidentSeverity.LOW,
  [AlertSeverity.MEDIUM]: IncidentSeverity.MEDIUM,
  [AlertSeverity.HIGH]: IncidentSeverity.HIGH,
  [AlertSeverity.CRITICAL]: IncidentSeverity.CRITICAL,
};

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly webSocketService: WebSocketService,
    private readonly auditService: AuditService,
    private readonly incidentsService: IncidentsService,
  ) {}

  async create(createAlertDto: CreateAlertDto, userId: string): Promise<Alert> {
    const alert = this.alertRepository.create({
      ...createAlertDto,
      issued_by: userId,
      status: AlertStatus.ACTIVE,
    });

    const savedAlert = await this.alertRepository.save(alert);

    // Broadcast WebSocket event
    this.webSocketService.broadcastAlertCreated({
      alert_id: savedAlert.id,
      severity: savedAlert.severity,
      type: savedAlert.type,
      location: savedAlert.location_id,
      message: savedAlert.title,
      timestamp: savedAlert.issued_at.toISOString(),
    });

    // Log audit event
    await this.auditService.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'ALERT',
      entity_id: savedAlert.id,
      new_values: savedAlert,
    });

    this.logger.log(`Alert created: ${savedAlert.id} by user: ${userId}`);
    return savedAlert;
  }

  async findAll(): Promise<Alert[]> {
    return this.alertRepository.find({
      relations: {
        location: true,
        issuer: true,
        incident: true,
      },
      order: { issued_at: 'DESC' },
    });
  }

  async findByStatus(status: AlertStatus): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { status },
      relations: {
        location: true,
        issuer: true,
        incident: true,
      },
      order: { issued_at: 'DESC' },
    });
  }

  async findBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { severity },
      relations: {
        location: true,
        issuer: true,
        incident: true,
      },
      order: { issued_at: 'DESC' },
    });
  }

  async findActive(): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { status: AlertStatus.ACTIVE },
      relations: {
        location: true,
        issuer: true,
        incident: true,
      },
      order: { issued_at: 'DESC' },
    });
  }

  async findOne(id: string, currentUser?: any): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id },
      relations: {
        location: true,
        issuer: true,
        incident: true,
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    const roles = currentUser?.roles || [];
    const isPrivileged =
      roles.includes(UserRoleEnum.ADMIN) ||
      roles.includes(UserRoleEnum.AUTHORITY) ||
      roles.includes(UserRoleEnum.RESPONDER) ||
      roles.includes(UserRoleEnum.ANALYST);

    if (currentUser && !isPrivileged && alert.issued_by !== currentUser.id) {
      throw new ForbiddenException(
        'You are not authorized to access this alert',
      );
    }

    return alert;
  }

  /**
   * Marks an alert as reviewed by an authority. Idempotent — acknowledging
   * an already-acknowledged alert is a no-op rather than an error, since a
   * second click racing the first should not fail or double-log.
   */
  async acknowledge(id: string, currentUser: any): Promise<Alert> {
    const alert = await this.findOne(id, currentUser);

    if (alert.acknowledged_at) {
      return alert;
    }

    // A direct update() against the columns, not save() on the loaded
    // entity — save() can silently drop a column change once a relation
    // sharing that foreign key has been loaded (see the equivalent fix in
    // IncidentsService.assignResponder).
    await this.alertRepository.update(
      { id },
      { acknowledged_at: new Date(), acknowledged_by: currentUser.id },
    );
    const updatedAlert = await this.findOne(id, currentUser);

    this.webSocketService.broadcastAlertUpdated({
      alert_id: updatedAlert.id,
      severity: updatedAlert.severity,
      type: updatedAlert.type,
      status: updatedAlert.status,
      location: updatedAlert.location_id,
      message: updatedAlert.title,
      timestamp: updatedAlert.updated_at.toISOString(),
    });

    await this.auditService.log({
      user_id: currentUser.id,
      action: 'ACKNOWLEDGE',
      entity_type: 'ALERT',
      entity_id: id,
      old_values: { acknowledged_at: null },
      new_values: {
        acknowledged_at: updatedAlert.acknowledged_at,
        acknowledged_by: currentUser.id,
      },
    });

    this.logger.log(`Alert acknowledged: ${id} by user: ${currentUser.id}`);
    return updatedAlert;
  }

  /**
   * Escalates an alert into a real incident — an explicit authority
   * decision, never automatic. Rejects escalating an alert that is
   * already linked to an incident (duplicate prevention: one alert can
   * only ever produce one incident).
   */
  async escalateToIncident(
    id: string,
    currentUser: any,
  ): Promise<{ alert: Alert; incident: Incident }> {
    const alert = await this.findOne(id, currentUser);

    if (alert.incident_id) {
      throw new BadRequestException(
        'This alert has already been escalated to an incident',
      );
    }

    const incidentType = NATURAL_HAZARD_ALERT_TYPES.has(alert.type)
      ? IncidentType.DISASTER
      : IncidentType.OTHER;

    const incident = await this.incidentsService.create(
      {
        type: incidentType,
        title: `Escalated from alert: ${alert.title}`.slice(0, 500),
        description: alert.description || undefined,
        location_id: alert.location_id || undefined,
        severity: ALERT_TO_INCIDENT_SEVERITY[alert.severity],
      },
      currentUser.id,
    );

    await this.alertRepository.update({ id }, { incident_id: incident.id });
    const updatedAlert = await this.findOne(id, currentUser);

    this.webSocketService.broadcastAlertUpdated({
      alert_id: updatedAlert.id,
      severity: updatedAlert.severity,
      type: updatedAlert.type,
      status: updatedAlert.status,
      location: updatedAlert.location_id,
      message: updatedAlert.title,
      timestamp: updatedAlert.updated_at.toISOString(),
    });

    await this.auditService.log({
      user_id: currentUser.id,
      action: 'ESCALATE',
      entity_type: 'ALERT',
      entity_id: id,
      old_values: { incident_id: null },
      new_values: { incident_id: incident.id },
    });

    this.logger.log(
      `Alert escalated to incident: alert=${id} incident=${incident.id} by user: ${currentUser.id}`,
    );

    return { alert: updatedAlert, incident };
  }

  async update(
    id: string,
    updateAlertDto: UpdateAlertDto,
    userId: string,
    currentUser?: any,
  ): Promise<Alert> {
    const alert = await this.findOne(id, currentUser);
    const oldValues = { ...alert };

    const roles = currentUser?.roles || [];
    const isPrivileged =
      roles.includes(UserRoleEnum.ADMIN) ||
      roles.includes(UserRoleEnum.AUTHORITY) ||
      roles.includes(UserRoleEnum.RESPONDER);

    if (!isPrivileged && alert.issued_by !== currentUser?.id) {
      throw new ForbiddenException(
        'You are not authorized to update this alert',
      );
    }

    Object.assign(alert, updateAlertDto);
    const updatedAlert = await this.alertRepository.save(alert);

    // Broadcast WebSocket event for status changes
    if (updateAlertDto.status && updateAlertDto.status !== oldValues.status) {
      this.webSocketService.broadcastAlertUpdated({
        alert_id: updatedAlert.id,
        severity: updatedAlert.severity,
        type: updatedAlert.type,
        status: updatedAlert.status,
        location: updatedAlert.location_id,
        message: updatedAlert.title,
        timestamp: updatedAlert.updated_at.toISOString(),
      });
    }

    // Log audit event
    await this.auditService.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'ALERT',
      entity_id: id,
      old_values: oldValues,
      new_values: updatedAlert,
    });

    this.logger.log(`Alert updated: ${id} by user: ${userId}`);
    return updatedAlert;
  }

  async remove(id: string, userId: string): Promise<void> {
    const alert = await this.findOne(id);
    await this.alertRepository.remove(alert);

    // Log audit event
    await this.auditService.log({
      user_id: userId,
      action: 'DELETE',
      entity_type: 'ALERT',
      entity_id: id,
      old_values: alert,
    });

    this.logger.log(`Alert deleted: ${id} by user: ${userId}`);
  }

  async getAlertCount(): Promise<number> {
    return this.alertRepository.count();
  }

  async getAlertCountByStatus(): Promise<Record<string, number>> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .select('alert.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('alert.status')
      .getRawMany();

    return result.reduce(
      (acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async getCriticalAlerts(): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { severity: AlertSeverity.CRITICAL, status: AlertStatus.ACTIVE },
      relations: {
        location: true,
        issuer: true,
        incident: true,
      },
      order: { issued_at: 'DESC' },
    });
  }

  async findByFilters(filters: {
    location_id?: string;
    district_id?: string;
    hazard_type?: string;
    severity?: AlertSeverity[];
    source?: string;
    start_date?: Date;
    end_date?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ alerts: Alert[]; total: number }> {
    const queryBuilder = this.alertRepository
      .createQueryBuilder('alert')
      .leftJoinAndSelect('alert.location', 'location')
      .leftJoinAndSelect('alert.issuer', 'issuer')
      .leftJoinAndSelect('alert.incident', 'incident');

    if (filters.location_id) {
      queryBuilder.andWhere('alert.location_id = :locationId', {
        locationId: filters.location_id,
      });
    }

    if (filters.district_id) {
      queryBuilder.andWhere('location.district_id = :districtId', {
        districtId: filters.district_id,
      });
    }

    if (filters.hazard_type) {
      queryBuilder.andWhere('alert.type = :type', {
        type: filters.hazard_type,
      });
    }

    if (filters.severity && filters.severity.length > 0) {
      queryBuilder.andWhere('alert.severity IN (:...severities)', {
        severities: filters.severity,
      });
    }

    if (filters.source) {
      queryBuilder.andWhere('alert.source = :source', {
        source: filters.source,
      });
    }

    if (filters.start_date && filters.end_date) {
      queryBuilder.andWhere('alert.issued_at BETWEEN :startDate AND :endDate', {
        startDate: filters.start_date,
        endDate: filters.end_date,
      });
    }

    const total = await queryBuilder.getCount();

    if (filters.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters.offset) {
      queryBuilder.offset(filters.offset);
    }

    queryBuilder.orderBy('alert.issued_at', 'DESC');

    const alerts = await queryBuilder.getMany();

    return { alerts, total };
  }

  /**
   * Find recent Alerts whose title contains the given text.
   *
   * Alert has no device_id column (see entities/alert.entity.ts), so for
   * an automated risk-engine Alert, the device UUID lives in the title
   * text the engine composes (see risk-engine.service.ts maybeCreateAlert).
   * This is used by the production E2E test endpoint to prove a specific
   * test telemetry event produced a specific Alert, rather than an
   * unrelated pre-existing row.
   */
  async findRecentContainingText(text: string, limit = 20): Promise<Alert[]> {
    return this.alertRepository
      .createQueryBuilder('alert')
      .where('alert.title LIKE :pattern', { pattern: `%${text}%` })
      .orderBy('alert.issued_at', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getAlertSources(): Promise<string[]> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .select('DISTINCT alert.source', 'source')
      .where('alert.source IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.source);
  }

  async getAlertTypes(): Promise<string[]> {
    const result = await this.alertRepository
      .createQueryBuilder('alert')
      .select('DISTINCT alert.type', 'type')
      .where('alert.type IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.type);
  }
}
