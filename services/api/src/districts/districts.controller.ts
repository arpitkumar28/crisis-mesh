import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';

@Controller('v1/districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findAll() {
    const districts = await this.districtsService.findAll();
    return {
      success: true,
      message: 'Districts retrieved successfully',
      data: districts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('state/:state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findByState(@Param('state') state: string) {
    const districts = await this.districtsService.findByState(state);
    return {
      success: true,
      message: `Districts in ${state} retrieved successfully`,
      data: districts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('top-states')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async getTopAffectedStates(@Query('limit') limit?: string) {
    const states = await this.districtsService.getTopAffectedStates(
      limit ? parseInt(limit) : 5,
    );
    return {
      success: true,
      message: 'Top affected states retrieved successfully',
      data: states,
      request_id: crypto.randomUUID(),
    };
  }

  @Get('top-districts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async getTopAffectedDistricts(@Query('limit') limit?: string) {
    const districts = await this.districtsService.getTopAffectedDistricts(
      limit ? parseInt(limit) : 10,
    );
    return {
      success: true,
      message: 'Top affected districts retrieved successfully',
      data: districts,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async findOne(@Param('id') id: string) {
    const district = await this.districtsService.findOne(id);
    return {
      success: true,
      message: 'District retrieved successfully',
      data: district,
      request_id: crypto.randomUUID(),
    };
  }

  @Get(':id/intelligence')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.CITIZEN, UserRoleEnum.RESPONDER, UserRoleEnum.AUTHORITY, UserRoleEnum.ADMIN, UserRoleEnum.ANALYST)
  async getDistrictIntelligence(@Param('id') id: string) {
    const intelligence = await this.districtsService.getDistrictIntelligence(id);
    return {
      success: true,
      message: 'District intelligence retrieved successfully',
      data: intelligence,
      request_id: crypto.randomUUID(),
    };
  }
}