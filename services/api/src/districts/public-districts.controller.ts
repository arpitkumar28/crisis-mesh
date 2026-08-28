import { Controller, Get, Param, Query } from '@nestjs/common';
import { DistrictsService } from './districts.service';

@Controller('v1/public/districts')
export class PublicDistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
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