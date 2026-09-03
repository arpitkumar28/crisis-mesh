import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { IncidentStatus, IncidentType } from '../entities/incident.entity';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.CITIZEN,
  )
  async create(
    @Body() createIncidentDto: CreateIncidentDto,
    @CurrentUser() user: any,
  ) {
    const incident = await this.incidentsService.create(
      createIncidentDto,
      user.id,
    );
    return {
      success: true,
      message: 'Incident created successfully',
      data: incident,
      request_id: crypto.randomUUID(),
    };
  }

  @Get()
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findAll() {
    const incidents = await this.incidentsService.findAll();
    return {
      success: true,
      message: 'Incidents retrieved successfully',
      data: incidents,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('status/:status')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findByStatus(@Param('status') status: IncidentStatus) {
    const incidents = await this.incidentsService.findByStatus(status);
    return {
      success: true,
      message: 'Incidents retrieved successfully',
      data: incidents,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('type/:type')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findByType(@Param('type') type: IncidentType) {
    const incidents = await this.incidentsService.findByType(type);
    return {
      success: true,
      message: 'Incidents retrieved successfully',
      data: incidents,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('active')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findActive() {
    const incidents = await this.incidentsService.findActive();
    return {
      success: true,
      message: 'Active incidents retrieved successfully',
      data: incidents,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('count')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async getCount() {
    const count = await this.incidentsService.getIncidentCount();
    return {
      success: true,
      message: 'Incident count retrieved successfully',
      data: { count },
      request_id: crypto.randomUUID(),
    };
  }

  @Get('count/by-status')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async getCountByStatus() {
    const counts = await this.incidentsService.getIncidentCountByStatus();
    return {
      success: true,
      message: 'Incident count by status retrieved successfully',
      data: counts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id')
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const incident = await this.incidentsService.findOne(id, user);
    return {
      success: true,
      message: 'Incident retrieved successfully',
      data: incident,
      request_id: crypto.randomUUID(),
    };
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER)
  async update(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
    @CurrentUser() user: any,
  ) {
    const incident = await this.incidentsService.update(
      id,
      updateIncidentDto,
      user,
    );
    return {
      success: true,
      message: 'Incident updated successfully',
      data: incident,
      request_id: crypto.randomUUID(),
    };
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.incidentsService.remove(id, user.id);
    return {
      success: true,
      message: 'Incident deleted successfully',
      data: null,
      request_id: crypto.randomUUID(),
    };
  }
}
