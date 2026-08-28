import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { AuditModule } from '../audit/audit.module';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { PublicAlertsController } from './public-alerts.controller';
import { Alert } from '../entities/alert.entity';
import { GeographicLocation } from '../entities/geographic-location.entity';
import { Incident } from '../entities/incident.entity';
import { Profile } from '../entities/profile.entity';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    WebSocketModule,
    AuditModule,
    TypeOrmModule.forFeature([Alert, GeographicLocation, Incident, Profile]),
  ],
  controllers: [AlertsController, PublicAlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
