import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AlertsModule } from './alerts/alerts.module';
import { IncidentsModule } from './incidents/incidents.module';
import { RiskModule } from './risk/risk.module';
import { SimulationModule } from './simulation/simulation.module';
import { MqttModule } from './mqtt/mqtt.module';
import { WebSocketModule } from './websocket/websocket.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ResponseModule } from './response/response.module';
import { InformationModule } from './information/information.module';
import { DistrictsModule } from './districts/districts.module';
import { WeatherModule } from './weather/weather.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { TestModule } from './test/test.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    AuditModule,
    DevicesModule,
    TelemetryModule,
    AlertsModule,
    IncidentsModule,
    RiskModule,
    SimulationModule,
    MqttModule,
    WebSocketModule,
    DashboardModule,
    ResponseModule,
    InformationModule,
    DistrictsModule,
    WeatherModule,
    IntelligenceModule,
    TestModule,
    BootstrapModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
