import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/telemetry')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('device/:deviceId')
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.ANALYST,
    UserRoleEnum.CITIZEN,
  )
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
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.ANALYST,
    UserRoleEnum.CITIZEN,
  )
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
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.ANALYST,
  )
  async getAggregatedTelemetry(
    @Param('deviceId') deviceId: string,
    @Param('metric') metric: string,
    @Query('start_time') startTime?: string,
    @Query('end_time') endTime?: string,
  ) {
    const start = startTime
      ? new Date(startTime)
      : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: 24 hours ago
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
