import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Alert } from '../entities/alert.entity';
import { Device } from '../entities/device.entity';
import { Incident } from '../entities/incident.entity';
import { SensorReading } from '../entities/sensor-reading.entity';
import { DashboardController } from './dashboard.controller';
import { PublicMapController } from './public-map.controller';
import { DashboardService } from './dashboard.service';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [
    AuthModule,
    IntelligenceModule,
    TypeOrmModule.forFeature([Alert, Device, Incident, SensorReading]),
  ],
  controllers: [DashboardController, PublicMapController],
  providers: [DashboardService],
})
export class DashboardModule {}
