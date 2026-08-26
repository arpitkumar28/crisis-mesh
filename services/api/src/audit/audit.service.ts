import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface AuditLogData {
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        ...data,
        timestamp: new Date(),
      });

      await this.auditLogRepository.save(auditLog);
      this.logger.debug(`Audit log created: ${data.action} by user ${data.user_id || 'anonymous'}`);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`);
      // Don't throw error to avoid breaking main flow
    }
  }

  async logAuthentication(userId: string, email: string, action: 'LOGIN' | 'LOGOUT' | 'REGISTER', ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: `AUTH_${action}`,
      entity_type: 'Profile',
      entity_id: userId,
      new_values: { email, action },
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }

  async logAuthorization(userId: string, action: string, resource: string, ipAddress?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: `AUTHZ_${action}`,
      entity_type: resource,
      new_values: { action },
      ip_address: ipAddress,
    });
  }

  async logDataChange(userId: string, entityType: string, entityId: string, oldValues: any, newValues: any, ipAddress?: string): Promise<void> {
    await this.log({
      user_id: userId,
      action: 'DATA_UPDATE',
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: ipAddress,
    });
  }

  async getUserAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { user_id: userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getEntityAuditLogs(entityType: string, entityId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
