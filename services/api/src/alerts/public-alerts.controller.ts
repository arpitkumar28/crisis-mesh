import { Controller, Get, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertSeverity, AlertStatus } from '../entities/alert.entity';

@Controller('v1/public/alerts')
export class PublicAlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const { alerts, total } = await this.alertsService.findByFilters({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return {
      success: true,
      message: 'Alerts retrieved successfully',
      data: alerts,
      meta: {
        total,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      },
      request_id: crypto.randomUUID(),
    };
  }

  @Get('active')
  async findActive(
    @Query('limit') limit?: string,
  ) {
    const alerts = await this.alertsService.findActive();
    const limitedAlerts = limit ? alerts.slice(0, parseInt(limit)) : alerts;

    return {
      success: true,
      message: 'Active alerts retrieved successfully',
      data: limitedAlerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('critical')
  async getCriticalAlerts(
    @Query('limit') limit?: string,
  ) {
    const alerts = await this.alertsService.getCriticalAlerts();
    const limitedAlerts = limit ? alerts.slice(0, parseInt(limit)) : alerts;

    return {
      success: true,
      message: 'Critical alerts retrieved successfully',
      data: limitedAlerts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('filter')
  async findByFilters(
    @Query('location_id') locationId?: string,
    @Query('district_id') districtId?: string,
    @Query('hazard_type') hazardType?: string,
    @Query('severity') severity?: string,
    @Query('source') source?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const severities = severity ? severity.split(',').map(s => s.trim().toUpperCase() as AlertSeverity) : undefined;
    const { alerts, total } = await this.alertsService.findByFilters({
      location_id: locationId,
      district_id: districtId,
      hazard_type: hazardType,
      severity: severities,
      source: source,
      start_date: startDate ? new Date(startDate) : undefined,
      end_date: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return {
      success: true,
      message: 'Filtered alerts retrieved successfully',
      data: alerts,
      meta: {
        total,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      },
      request_id: crypto.randomUUID(),
    };
  }

  @Get('sources')
  async getSources() {
    const sources = await this.alertsService.getAlertSources();
    return {
      success: true,
      message: 'Alert sources retrieved successfully',
      data: sources,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('types')
  async getTypes() {
    const types = await this.alertsService.getAlertTypes();
    return {
      success: true,
      message: 'Alert types retrieved successfully',
      data: types,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('stats')
  async getStats() {
    const [total, active, critical, bySeverity] = await Promise.all([
      this.alertsService.getAlertCount(),
      this.alertsService.findActive().then(alerts => alerts.length),
      this.alertsService.getCriticalAlerts().then(alerts => alerts.length),
      this.alertsService.getAlertCountByStatus(),
    ]);

    return {
      success: true,
      message: 'Alert statistics retrieved successfully',
      data: {
        total,
        active,
        critical,
        by_severity: bySeverity,
      },
      request_id: crypto.randomUUID(),
    };
  }
}