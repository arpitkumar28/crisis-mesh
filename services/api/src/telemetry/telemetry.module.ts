import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { AuthModule } from '../auth/auth.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { RiskModule } from '../risk/risk.module';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { SensorReading } from '../entities/sensor-reading.entity';
import { Sensor } from '../entities/sensor.entity';
import { Device } from '../entities/device.entity';

@Module({
  imports: [
    ConfigModule,
    MqttModule,
    AuthModule,
    WebSocketModule,
    RiskModule,
    TypeOrmModule.forFeature([SensorReading, Sensor, Device]),
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
