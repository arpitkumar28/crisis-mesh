import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MqttController {
  private readonly logger = new Logger(MqttController.name);

  @EventPattern('sensor/+/telemetry')
  async handleTelemetry(@Payload() data: any) {
    this.logger.debug(`Received telemetry: ${JSON.stringify(data)}`);
    // This will be handled by the telemetry service
    // For now, just log the data
  }

  @EventPattern('device/+/status')
  async handleDeviceStatus(@Payload() data: any) {
    this.logger.debug(`Received device status: ${JSON.stringify(data)}`);
    // This will be handled by the device service
    // For now, just log the data
  }
}
