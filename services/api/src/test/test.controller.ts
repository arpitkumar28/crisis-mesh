import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRoleEnum } from '../entities/profile.entity';
import { MqttService } from '../mqtt/mqtt.service';
import { DevicesService } from '../devices/devices.service';
import { TelemetryService } from '../telemetry/telemetry.service';

interface TestTelemetryRequest {
  device_id?: string;
  metric?: string;
  value?: number;
  unit?: string;
}

@Controller('v1/test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly devicesService: DevicesService,
    private readonly telemetryService: TelemetryService,
  ) {}

  @Post('mqtt-telemetry')
  @Roles(UserRoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async testMqttTelemetry(@Body() request: TestTelemetryRequest) {
    const deviceId = request.device_id || 'e2e-test-device-001';
    const metric = request.metric || 'TEMPERATURE';
    const value = request.value !== undefined ? request.value : 25.0;
    const unit = request.unit || '°C';

    const timestamp = new Date().toISOString();
    const testMarker = `e2e-test-${Date.now()}`;

    this.logger.log(
      `[${testMarker}] Starting production E2E MQTT telemetry test`,
    );

    const results: any = {
      test_marker: testMarker,
      timestamp,
      request: { device_id: deviceId, metric, value, unit },
    };

    try {
      // Step 1: Verify MQTT connection
      results.mqtt_connected = this.mqttService.isConnected();
      if (!results.mqtt_connected) {
        throw new Error('MQTT service not connected');
      }
      this.logger.log(`[${testMarker}] MQTT connection verified`);

      // Step 2: Publish test telemetry message
      const payload = {
        device_id: deviceId,
        metric,
        value,
        unit,
        timestamp,
        quality_flag: 1,
        _test_marker: testMarker,
      };

      const topic = `sensor/${deviceId}/telemetry`;
      await this.mqttService.publish(topic, payload, { qos: 1 });
      results.mqtt_published = true;
      results.mqtt_topic = topic;
      this.logger.log(`[${testMarker}] Published to ${topic}`);

      // Step 3: Wait for telemetry processing (allow time for async processing)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 4: Verify device was created/found
      try {
        const device = await this.devicesService.getDeviceBySerialNumber(
          deviceId,
        );
        results.device_found = true;
        results.device_id = device.id;
        this.logger.log(`[${testMarker}] Device found: ${device.id}`);
      } catch (error) {
        results.device_found = false;
        results.device_error = error instanceof Error ? error.message : String(error);
        this.logger.warn(`[${testMarker}] Device lookup failed: ${error}`);
      }

      // Step 5: Verify telemetry was persisted
      if (results.device_found) {
        try {
          const telemetry =
            await this.telemetryService.getTelemetryByDevice(
              results.device_id,
              1,
            );
          results.telemetry_persisted = telemetry.length > 0;
          if (results.telemetry_persisted) {
            results.latest_telemetry = {
              metric: telemetry[0].sensor?.metric,
              value: telemetry[0].value,
              unit: telemetry[0].unit,
              timestamp: telemetry[0].timestamp,
            };
            this.logger.log(
              `[${testMarker}] Telemetry persisted: ${telemetry[0].value}`,
            );
          }
        } catch (error) {
          results.telemetry_persisted = false;
          results.telemetry_error =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `[${testMarker}] Telemetry verification failed: ${error}`,
          );
        }
      }

      // Step 6: Overall result
      results.overall_success =
        results.mqtt_connected &&
        results.mqtt_published &&
        results.device_found &&
        results.telemetry_persisted;

      this.logger.log(
        `[${testMarker}] E2E test completed: ${results.overall_success ? 'PASS' : 'FAIL'}`,
      );

      return {
        success: true,
        message: 'E2E MQTT telemetry test completed',
        data: results,
      };
    } catch (error) {
      results.overall_success = false;
      results.error = error instanceof Error ? error.message : String(error);
      this.logger.error(`[${testMarker}] E2E test failed: ${error}`);

      return {
        success: false,
        message: 'E2E MQTT telemetry test failed',
        data: results,
      };
    }
  }
}