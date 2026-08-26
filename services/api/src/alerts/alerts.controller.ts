import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AlertStatus, AlertSeverity } from '../entities/alert.entity';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER)
  async create(@Body() createAlertDto: CreateAlertDto, @CurrentUser() user: any) {
    const alert = await this.alertsService.create(createAlertDto, user.id);
    return {
      success: true,
      message: 'Alert created successfully',
      data: alert,
      request_id: crypto.randomUUID(),
    };
  }

  @Get()
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findAll() {
    const alerts = await this.alertsService.findAll();
    return {
      success: true,
      message: 'Alerts retrieved successfully',
      data: alerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('status/:status')
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findByStatus(@Param('status') status: AlertStatus) {
    const alerts = await this.alertsService.findByStatus(status);
    return {
      success: true,
      message: 'Alerts retrieved successfully',
      data: alerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('severity/:severity')
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findBySeverity(@Param('severity') severity: AlertSeverity) {
    const alerts = await this.alertsService.findBySeverity(severity);
    return {
      success: true,
      message: 'Alerts retrieved successfully',
      data: alerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('active')
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findActive() {
    const alerts = await this.alertsService.findActive();
    return {
      success: true,
      message: 'Active alerts retrieved successfully',
      data: alerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('critical')
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async getCriticalAlerts() {
    const alerts = await this.alertsService.getCriticalAlerts();
    return {
      success: true,
      message: 'Critical alerts retrieved successfully',
      data: alerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('count')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST)
  async getCount() {
    const count = await this.alertsService.getAlertCount();
    return {
      success: true,
      message: 'Alert count retrieved successfully',
      data: { count },
      request_id: crypto.randomUUID(),
    };
  }

  @Get('count/by-status')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER, UserRoleEnum.ANALYST)
  async getCountByStatus() {
    const counts = await this.alertsService.getAlertCountByStatus();
    return {
      success: true,
      message: 'Alert count by status retrieved successfully',
      data: counts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id')
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findOne(@Param('id') id: string) {
    const alert = await this.alertsService.findOne(id);
    return {
      success: true,
      message: 'Alert retrieved successfully',
      data: alert,
      request_id: crypto.randomUUID(),
    };
  }

  @Put(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.AUTHORITY, UserRoleEnum.RESPONDER)
  async update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto, @CurrentUser() user: any) {
    const alert = await this.alertsService.update(id, updateAlertDto, user.id);
    return {
      success: true,
      message: 'Alert updated successfully',
      data: alert,
      request_id: crypto.randomUUID(),
    };
  }

  @Delete(':id')
  @Roles(UserRoleEnum.ADMIN)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.alertsService.remove(id, user.id);
    return {
      success: true,
      message: 'Alert deleted successfully',
      data: null,
      request_id: crypto.randomUUID(),
    };
  }
}
