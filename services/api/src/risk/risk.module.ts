import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { AlertsModule } from '../alerts/alerts.module';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { RiskEngineService } from './risk-engine.service';
import { RiskAssessment } from '../entities/risk-assessment.entity';

import { District } from '../entities/district.entity';

@Module({
  imports: [
    ConfigModule,
    AlertsModule,
    TypeOrmModule.forFeature([RiskAssessment, District]),
  ],
  controllers: [RiskController],
  providers: [RiskService, RiskEngineService],
  exports: [RiskService, RiskEngineService],
})
export class RiskModule {}
