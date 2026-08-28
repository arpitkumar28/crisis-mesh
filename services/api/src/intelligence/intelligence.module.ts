import { Module } from '@nestjs/common';
import { InformationModule } from '../information/information.module';
import { WeatherModule } from '../weather/weather.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { DisasterFeedService } from './disaster-feed.service';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';
@Module({ imports: [InformationModule, WeatherModule, WebSocketModule], controllers: [IntelligenceController], providers: [DisasterFeedService, IntelligenceService], exports: [DisasterFeedService, IntelligenceService] })
export class IntelligenceModule {}