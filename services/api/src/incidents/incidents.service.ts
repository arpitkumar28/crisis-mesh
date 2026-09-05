import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Incident,
  IncidentStatus,
  IncidentType,
} from '../entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { WebSocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/audit.service';
import { IncidentUpdatedEvent } from '../websocket/dto/websocket-event.dto';
import { UserRoleEnum } from '../entities/profile.entity';
import { UsersService } from '../users/users.service';

export interface EligibleResponder {
  id: string;
  name: string;
  role: UserRoleEnum.RESPONDER;
}

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    private readonly webSocketService: WebSocketService,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createIncidentDto: CreateIncidentDto,
    userId: string,
  ): Promise<Incident> {
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

  /**
   * CITIZEN accounts may only see incidents they reported themselves.
   * Every other role sees the full list. Enforced here (server-side)
   * rather than left to the frontend, since a client-side filter would
   * still leak every citizen's incidents over the wire.
   */
  private scopeToOwnerIfCitizen(
    where: Record<string, unknown>,
    currentUser?: any,
  ): Record<string, unknown> {
    const roles = currentUser?.roles || [];
    const isPrivileged =
      roles.includes(UserRoleEnum.ADMIN) ||
      roles.includes(UserRoleEnum.AUTHORITY) ||
      roles.includes(UserRoleEnum.RESPONDER) ||
      roles.includes(UserRoleEnum.ANALYST);

    if (currentUser && !isPrivileged) {
      return { ...where, reported_by: currentUser.id };
    }
    return where;
  }

  async findAll(currentUser?: any): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: this.scopeToOwnerIfCitizen({}, currentUser),
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findByStatus(
    status: IncidentStatus,
    currentUser?: any,
  ): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: this.scopeToOwnerIfCitizen({ status }, currentUser),
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findByType(type: IncidentType, currentUser?: any): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: this.scopeToOwnerIfCitizen({ type }, currentUser),
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findActive(currentUser?: any): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: this.scopeToOwnerIfCitizen(
        {
          status: In([
            IncidentStatus.REPORTED,
            IncidentStatus.ACKNOWLEDGED,
            IncidentStatus.IN_PROGRESS,
          ]),
        },
        currentUser,
      ),
      relations: {
        location: true,
        reporter: true,
        assignee: true,
      },
      order: { reported_at: 'DESC' },
    });
  }

  async findOne(id: string, currentUser?: any): Promise<Incident> {
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

    const roles = currentUser?.roles || [];
    const isPrivileged =
      roles.includes(UserRoleEnum.ADMIN) ||
      roles.includes(UserRoleEnum.AUTHORITY) ||
      roles.includes(UserRoleEnum.RESPONDER) ||
      roles.includes(UserRoleEnum.ANALYST);

    if (
      currentUser &&
      !isPrivileged &&
      incident.reported_by !== currentUser.id
    ) {
      throw new ForbiddenException(
        'You are not authorized to access this incident',
      );
    }

    return incident;
  }

  /**
   * The minimum information needed to pick an assignee: RESPONDER accounts
   * only, no email/contact/profile data that assignment doesn't need.
   */
  async getEligibleResponders(): Promise<EligibleResponder[]> {
    const responders = await this.usersService.findByRole(
      UserRoleEnum.RESPONDER,
    );
    return responders.map((profile) => ({
      id: profile.id,
      name: profile.name,
      role: UserRoleEnum.RESPONDER as const,
    }));
  }

  /**
   * Assign, reassign, or unassign (assignedTo === null) an incident.
   * Every non-null target is verified to actually hold RESPONDER before
   * the write happens — this is the only path allowed to change
   * assigned_to, and it rejects a nonexistent user or one without the
   * RESPONDER role identically (both simply fail the same role check),
   * so no arbitrary or wrongly-privileged account can ever be assigned.
   */
  async assignResponder(
    id: string,
    assignedTo: string | null,
    currentUser: any,
  ): Promise<Incident> {
    const incident = await this.findOne(id, currentUser);

    if (assignedTo !== null) {
      const isEligible = await this.usersService.hasRole(
        assignedTo,
        UserRoleEnum.RESPONDER,
      );
      if (!isEligible) {
        throw new BadRequestException(
          'assigned_to must be the ID of an active user with the RESPONDER role',
        );
      }
    }

    const previousAssignee = incident.assigned_to ?? null;
    if (previousAssignee === assignedTo) {
      return incident;
    }

    // A plain repository.save() on an entity that also carries the loaded
    // `assignee` relation is unreliable here: TypeORM resolves the
    // assigned_to column from that relation object on persist, so a
    // change to the raw scalar alone can be silently dropped after the
    // relation has been populated once. An explicit update() against the
    // column removes that ambiguity entirely.
    await this.incidentRepository.update(
      { id },
      { assigned_to: assignedTo as unknown as string },
    );
    const updatedIncident = await this.findOne(id, currentUser);

    this.webSocketService.broadcastIncidentUpdated({
      incident_id: updatedIncident.id,
      severity: updatedIncident.severity,
      type: updatedIncident.type,
      location: updatedIncident.location_id,
      status: updatedIncident.status,
      timestamp: updatedIncident.updated_at.toISOString(),
    });

    await this.auditService.log({
      user_id: currentUser.id,
      action: assignedTo === null ? 'UNASSIGN' : 'ASSIGN',
      entity_type: 'INCIDENT',
      entity_id: id,
      old_values: { assigned_to: previousAssignee },
      new_values: { assigned_to: assignedTo },
    });

    this.logger.log(
      `Incident ${id} assignment changed: ${previousAssignee ?? 'none'} -> ${assignedTo ?? 'none'} by user: ${currentUser.id}`,
    );

    return updatedIncident;
  }

  async update(
    id: string,
    updateIncidentDto: UpdateIncidentDto,
    currentUser: any,
  ): Promise<Incident> {
    const incident = await this.findOne(id, currentUser);
    const oldValues = { ...incident };

    const roles = currentUser?.roles || [];
    const isPrivileged =
      roles.includes(UserRoleEnum.ADMIN) ||
      roles.includes(UserRoleEnum.AUTHORITY) ||
      roles.includes(UserRoleEnum.RESPONDER);

    if (!isPrivileged && incident.reported_by !== currentUser.id) {
      throw new ForbiddenException(
        'You are not authorized to update this incident',
      );
    }

    Object.assign(incident, updateIncidentDto);

    // Set resolved_at if status is being changed to RESOLVED
    if (
      updateIncidentDto.status === IncidentStatus.RESOLVED &&
      !incident.resolved_at
    ) {
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
    if (
      updateIncidentDto.status &&
      updateIncidentDto.status !== oldValues.status
    ) {
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
      user_id: currentUser.id,
      action: 'UPDATE',
      entity_type: 'INCIDENT',
      entity_id: id,
      old_values: oldValues,
      new_values: updatedIncident,
    });

    this.logger.log(`Incident updated: ${id} by user: ${currentUser.id}`);
    return updatedIncident;
  }

  async remove(id: string, userId: string): Promise<void> {
    const incident = await this.findOne(id, {
      id: userId,
      roles: [UserRoleEnum.ADMIN],
    });
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

    return result.reduce(
      (acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: {
        status: In([
          IncidentStatus.REPORTED,
          IncidentStatus.ACKNOWLEDGED,
          IncidentStatus.IN_PROGRESS,
        ]),
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
