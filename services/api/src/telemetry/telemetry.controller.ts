import { Controller, Get, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

@Controller('api/v1/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('device/:deviceId')
  async getTelemetryByDevice(
    @Param('deviceId') deviceId: string,
    @Query('limit') limit?: string,
  ) {
    const readings = await this.telemetryService.getTelemetryByDevice(
      deviceId,
      limit ? parseInt(limit) : 100,
    );
    return {
      success: true,
      message: 'Telemetry retrieved successfully',
      data: readings,
    };
  }

  @Get('sensor/:sensorId')
  async getTelemetryBySensor(
    @Param('sensorId') sensorId: string,
    @Query('limit') limit?: string,
  ) {
    const readings = await this.telemetryService.getTelemetryBySensor(
      sensorId,
      limit ? parseInt(limit) : 100,
    );
    return {
      success: true,
      message: 'Telemetry retrieved successfully',
      data: readings,
    };
  }

  @Get('aggregate/:deviceId/:metric')
  async getAggregatedTelemetry(
    @Param('deviceId') deviceId: string,
    @Param('metric') metric: string,
    @Query('start_time') startTime?: string,
    @Query('end_time') endTime?: string,
  ) {
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 24 hours ago
    const end = endTime ? new Date(endTime) : new Date();

    const aggregated = await this.telemetryService.getAggregatedTelemetry(
      deviceId,
      metric,
      start,
      end,
    );
    return {
      success: true,
      message: 'Aggregated telemetry retrieved successfully',
      data: aggregated,
    };
  }
}
