import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Incident, IncidentStatus, IncidentType } from '../entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { IncidentUpdatedEvent } from '../websocket/dto/websocket-event.dto';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    private readonly webSocketService: WebSocketService,
    private readonly auditService: AuditService,
  ) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string): Promise<Incident> {
    const incident = this.incidentRepository.create({
      ...createIncidentDto,
      reported_by: userId,
      status: IncidentStatus.REPORTED,
    });

    const savedIncident = await this.incidentRepository.save(incident);

    // Broadcast WebSocket event
    this.webSocketService.broadcastIncidentCreated({
      incident_id: savedIncident.id,
      severity: savedIncident.severity,
      type: savedIncident.type,
      location: savedIncident.location_id,
      status: savedIncident.status,
      timestamp: savedIncident.reported_at.toISOString(),
    });

    // Log audit event
    await this.auditService.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'INCIDENT',
      entity_id: savedIncident.id,
      new_values: savedIncident,
    });

    this.logger.log(`Incident created: ${savedIncident.id} by user: ${userId}`);
    return savedIncident;
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentRepository.find({
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findByStatus(status: IncidentStatus): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { status },
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findByType(type: IncidentType): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { type },
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findActive(): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { 
        status: In([IncidentStatus.REPORTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS]),
      },
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
    });

    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    return incident;
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto, userId: string): Promise<Incident> {
    const incident = await this.findOne(id);
    const oldValues = { ...incident };

    Object.assign(incident, updateIncidentDto);
    
    // Set resolved_at if status is being changed to RESOLVED
    if (updateIncidentDto.status === IncidentStatus.RESOLVED && !incident.resolved_at) {
      incident.resolved_at = new Date();
    }

    const updatedIncident = await this.incidentRepository.save(incident);

    // Broadcast WebSocket event for updates
    this.webSocketService.broadcastIncidentUpdated({
      incident_id: updatedIncident.id,
      severity: updatedIncident.severity,
      type: updatedIncident.type,
      location: updatedIncident.location_id,
      status: updatedIncident.status,
      timestamp: updatedIncident.updated_at.toISOString(),
    });

    // Broadcast WebSocket event for status changes
    if (updateIncidentDto.status && updateIncidentDto.status !== oldValues.status) {
      this.webSocketService.broadcast({
        type: 'incident.status_changed' as any,
        data: {
          incident_id: updatedIncident.id,
          status: updatedIncident.status,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Log audit event
    await this.auditService.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'INCIDENT',
      entity_id: id,
      old_values: oldValues,
      new_values: updatedIncident,
    });

    this.logger.log(`Incident updated: ${id} by user: ${userId}`);
    return updatedIncident;
  }

  async remove(id: string, userId: string): Promise<void> {
    const incident = await this.findOne(id);
    await this.incidentRepository.remove(incident);

    // Log audit event
    await this.auditService.log({
      user_id: userId,
      action: 'DELETE',
      entity_type: 'INCIDENT',
      entity_id: id,
      old_values: incident,
    });

    this.logger.log(`Incident deleted: ${id} by user: ${userId}`);
  }

  async getIncidentCount(): Promise<number> {
    return this.incidentRepository.count();
  }

  async getIncidentCountByStatus(): Promise<Record<string, number>> {
    const result = await this.incidentRepository
      .createQueryBuilder('incident')
      .select('incident.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.status')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { 
        status: In([IncidentStatus.REPORTED, IncidentStatus.ACKNOWLEDGED, IncidentStatus.IN_PROGRESS]),
      },
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }
}
