import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findAll() {
    const weather = await this.weatherService.findAll();
    return {
      success: true,
      message: 'Weather observations retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findLatest() {
    const weather = await this.weatherService.findLatest();
    return {
      success: true,
      message: 'Latest weather observations retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('location/:locationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findByLocation(@Param('locationId') locationId: string) {
    const weather = await this.weatherService.findByLocation(locationId);
    return {
      success: true,
      message: 'Weather observations for location retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findOne(@Param('id') id: string) {
    const weather = await this.weatherService.findOne(id);
    return {
      success: true,
      message: 'Weather observation retrieved successfully',
      data: weather,
      request_id: crypto.randomUUID(),
    };
  }
}