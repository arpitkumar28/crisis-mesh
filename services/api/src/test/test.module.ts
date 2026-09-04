import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MqttModule } from '../mqtt/mqtt.module';
import { DevicesModule } from '../devices/devices.module';
import { TelemetryModule } from '../telemetry/telemetry.module';

@Module({
  imports: [MqttModule, DevicesModule, TelemetryModule],
  controllers: [TestController],
  providers: [],
  exports: [],
})
export class TestModule {}