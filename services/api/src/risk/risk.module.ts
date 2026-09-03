import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { RiskAssessment } from '../entities/risk-assessment.entity';

import { District } from '../entities/district.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([RiskAssessment, District])],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
