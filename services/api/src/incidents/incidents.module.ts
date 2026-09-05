import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { Incident } from '../entities/incident.entity';
import { GeographicLocation } from '../entities/geographic-location.entity';
import { Profile } from '../entities/profile.entity';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    WebSocketModule,
    AuditModule,
    UsersModule,
    TypeOrmModule.forFeature([Incident, GeographicLocation, Profile]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
