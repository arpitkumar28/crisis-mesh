import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { IntelligenceService } from '../intelligence/intelligence.service';

@Controller('v1/public')
export class PublicMapController {
  constructor(private readonly dashboard: DashboardService, private readonly intelligence: IntelligenceService) {}
  @Get('map') async map() { return { ...(await this.dashboard.getPublicMap()), intelligence: await this.intelligence.getLatest() }; }
}
