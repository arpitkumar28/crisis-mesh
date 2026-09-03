import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RiskService } from './risk.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/risk')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findAll() {
    const risks = await this.riskService.findAll();
    return {
      success: true,
      message: 'Risk assessments retrieved successfully',
      data: risks,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('location/:locationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findByLocation(@Param('locationId') locationId: string) {
    const risks = await this.riskService.findByLocation(locationId);
    return {
      success: true,
      message: 'Risk assessments for location retrieved successfully',
      data: risks,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('district/:districtId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findByDistrict(@Param('districtId') districtId: string) {
    const risks = await this.riskService.findByDistrict(districtId);
    return {
      success: true,
      message: 'Risk assessments for district retrieved successfully',
      data: risks,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('type/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findByType(@Param('type') type: string) {
    const risks = await this.riskService.findByType(type);
    return {
      success: true,
      message: `Risk assessments for type ${type} retrieved successfully`,
      data: risks,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('severity/:severity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async findBySeverity(@Param('severity') severity: string) {
    const risks = await this.riskService.findBySeverity(severity);
    return {
      success: true,
      message: `Risk assessments with severity ${severity} retrieved successfully`,
      data: risks,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('high-risk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async getHighRiskAreas() {
    const risks = await this.riskService.getHighRiskAreas();
    return {
      success: true,
      message: 'High risk areas retrieved successfully',
      data: risks,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.CITIZEN,
    UserRoleEnum.RESPONDER,
    UserRoleEnum.AUTHORITY,
    UserRoleEnum.ADMIN,
    UserRoleEnum.ANALYST,
  )
  async getRiskSummary() {
    const summary = await this.riskService.getRiskSummary();
    return {
      success: true,
      message: 'Risk summary retrieved successfully',
      data: summary,
      request_id: crypto.randomUUID(),
    };
  }
}
