import { Controller, Get, Param } from '@nestjs/common';
import { DisasterFeedService } from './disaster-feed.service';
import { IntelligenceService } from './intelligence.service';
@Controller('v1')
export class IntelligenceController {
  constructor(private readonly disasters: DisasterFeedService, private readonly intelligence: IntelligenceService) {}
  @Get('disasters') disastersList() { return this.disasters.find(); }
  @Get('disasters/active') activeDisasters() { return this.disasters.find(true); }
  @Get('disasters/:id') disaster(@Param('id') id: string) { return this.disasters.findOne(id); }
  @Get('intelligence') latest() { return this.intelligence.getLatest(); }
}