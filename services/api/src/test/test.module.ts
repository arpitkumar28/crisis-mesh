import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MqttModule } from '../mqtt/mqtt.module';
import { DevicesModule } from '../devices/devices.module';
import { TelemetryModule } from '../telemetry/telemetry.module';
import { RiskModule } from '../risk/risk.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MqttModule,
    DevicesModule,
    TelemetryModule,
    RiskModule,
    AlertsModule,
  ],
  controllers: [TestController],
  providers: [],
  exports: [],
})
export class TestModule {}
