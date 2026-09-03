import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Alert, AlertStatus, AlertSeverity } from '../entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { AlertUpdatedEvent } from '../websocket/dto/websocket-event.dto';
import { UserRoleEnum } from '../entities/profile.entity';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly webSocketService: WebSocketService,
    private readonly auditService: AuditService,
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
