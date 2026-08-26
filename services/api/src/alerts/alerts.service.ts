import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert, AlertStatus, AlertSeverity } from '../entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';

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

  async findOne(id: string): Promise<Alert> {
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

    return alert;
  }

  async update(id: string, updateAlertDto: UpdateAlertDto, userId: string): Promise<Alert> {
    const alert = await this.findOne(id);
    const oldValues = { ...alert };

    Object.assign(alert, updateAlertDto);
    const updatedAlert = await this.alertRepository.save(alert);

    // Broadcast WebSocket event for status changes
    if (updateAlertDto.status && updateAlertDto.status !== oldValues.status) {
      this.webSocketService.broadcast({
        type: 'alert.updated' as any,
        data: {
          alert_id: updatedAlert.id,
          status: updatedAlert.status,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
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

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);
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
}
