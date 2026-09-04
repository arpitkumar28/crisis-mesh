import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { MqttService } from './mqtt.service';

/**
 * The only authoritative MQTT consumer is MqttService.subscribe(), used
 * directly by TelemetryService (services/api/src/telemetry/telemetry.service.ts)
 * to subscribe to 'sensor/+/telemetry' and 'device/+/status'.
 *
 * A previous MqttController using @EventPattern() decorators existed here
 * but was dead code: @EventPattern only fires when the app is bootstrapped
 * as a Nest hybrid microservice with an MQTT transport
 * (app.connectMicroservice with Transport.MQTT), which this app never does.
 * It was removed to avoid a second, misleading, unreachable "MQTT handler".
 */
@Module({
  imports: [ConfigModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
