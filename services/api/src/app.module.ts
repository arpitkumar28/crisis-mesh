import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AlertsModule } from './alerts/alerts.module';
import { IncidentsModule } from './incidents/incidents.module';
import { RiskModule } from './risk/risk.module';
import { SimulationModule } from './simulation/simulation.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DevicesModule,
    TelemetryModule,
    AlertsModule,
    IncidentsModule,
    RiskModule,
    SimulationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
