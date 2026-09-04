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
import { RiskService } from '../risk/risk.service';
import { AlertsService } from '../alerts/alerts.service';

interface TestTelemetryRequest {
  device_id?: string;
  metric?: string;
  value?: number;
  unit?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls `fn` until it returns a non-null/non-undefined value, or the
 * attempt budget is exhausted. Used because MQTT -> telemetry -> risk ->
 * alert is an asynchronous chain triggered by a fire-and-forget MQTT
 * publish; a single fixed sleep is not a reliable way to wait for it.
 */
async function pollUntil<T>(
  fn: () => Promise<T | null>,
  attempts: number,
  delayMs: number,
): Promise<T | null> {
  for (let i = 0; i < attempts; i++) {
    const result = await fn();
    if (result) {
      return result;
    }
    if (i < attempts - 1) {
      await sleep(delayMs);
    }
  }
  return null;
}

@Controller('v1/test')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestController {
  private readonly logger = new Logger(TestController.name);

  constructor(
    private readonly mqttService: MqttService,
    private readonly devicesService: DevicesService,
    private readonly telemetryService: TelemetryService,
    private readonly riskService: RiskService,
    private readonly alertsService: AlertsService,
  ) {}

  /**
   * ADMIN-only production E2E verification of the full automated pipeline:
   *
   *   MQTT publish -> TelemetryService -> SensorReading persistence
   *     -> RiskEngineService -> RiskAssessment persistence
   *     -> AlertsService -> Alert persistence -> alert.created broadcast
   *
   * A unique device/test marker is generated on every call (never taken
   * from the request body) so a pass can never be produced by a stale row
   * left over from a previous run. Default metric/value are chosen to be
   * unambiguously actionable (FLOOD/CRITICAL) so the risk+alert stages are
   * exercised by default; a caller may override them to test other bands,
   * but the device identity used for verification is always fresh.
   *
   * If RISK_ENGINE_SYSTEM_USER_ID is not configured on this deployment,
   * the risk/alert stage of the pipeline cannot run (see
   * risk/risk-engine.service.ts) — this endpoint reports that as an
   * explicit precondition failure rather than reporting success for a
   * pipeline that only partially ran. Incident creation is intentionally
   * out of scope: automatic Incident escalation is not implemented.
   */
  @Post('mqtt-telemetry')
  @Roles(UserRoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async testMqttTelemetry(@Body() request: TestTelemetryRequest) {
    const timestamp = new Date().toISOString();
    const testMarker = `e2e-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Always unique — never derived from client input — so this run can
    // never be satisfied by a device/reading left over from a prior call.
    const deviceId = `e2e-test-device-${testMarker}`;
    const metric = request.metric || 'WATER_LEVEL';
    const value = request.value !== undefined ? request.value : 6.8; // CRITICAL FLOOD band
    const unit = request.unit || 'm';

    this.logger.log(
      `[${testMarker}] Starting production E2E MQTT telemetry+risk+alert test`,
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

      // Step 3: Poll for device creation (async, driven by the MQTT subscriber)
      const device = await pollUntil(
        async () => {
          try {
            return await this.devicesService.getDeviceBySerialNumber(deviceId);
          } catch {
            return null;
          }
        },
        5,
        1000,
      );

      results.device_found = !!device;
      if (!device) {
        throw new Error(
          'Device was not created from the published telemetry within the poll window',
        );
      }
      results.device_id = device.id;
      this.logger.log(`[${testMarker}] Device found: ${device.id}`);

      // Step 4: Poll for telemetry persistence for this exact device
      const telemetry = await pollUntil(
        async () => {
          const readings = await this.telemetryService.getTelemetryByDevice(
            device.id,
            1,
          );
          return readings.length > 0 ? readings : null;
        },
        5,
        1000,
      );

      results.telemetry_persisted = !!telemetry;
      if (telemetry) {
        results.latest_telemetry = {
          metric: telemetry[0].sensor?.metric,
          value: telemetry[0].value,
          unit: telemetry[0].unit,
          timestamp: telemetry[0].timestamp,
        };
        this.logger.log(
          `[${testMarker}] Telemetry persisted: ${telemetry[0].value}`,
        );
      } else {
        throw new Error(
          'Telemetry was not persisted for this device within the poll window',
        );
      }

      // Step 5: Risk + alert pipeline verification. This requires
      // RISK_ENGINE_SYSTEM_USER_ID to be configured (see
      // risk/risk-engine.service.ts) — without it, Alert.issued_by has no
      // value to attribute the automated alert to, and Alert creation is
      // safely skipped. Report that as an explicit precondition failure
      // rather than silently treating "risk detected but no alert" as OK.
      //
      // Never log or return the configured system-user id itself.
      results.risk_engine_configured = !!process.env.RISK_ENGINE_SYSTEM_USER_ID;

      if (!results.risk_engine_configured) {
        results.overall_success = false;
        results.error =
          'RISK_ENGINE_SYSTEM_USER_ID is not configured on this deployment. ' +
          'RiskAssessment creation can still be verified independently, but the ' +
          'automated Alert stage cannot run, so the full pipeline cannot be ' +
          'verified as passing. Configure RISK_ENGINE_SYSTEM_USER_ID to an ' +
          'existing ADMIN/AUTHORITY profile id to enable this stage.';

        // Still report whether the RiskAssessment stage (which does not
        // require a system actor) ran, since that much is verifiable.
        const assessment = await pollUntil(
          () =>
            this.riskService
              .findRecentForDevice(device.id, 20)
              .then((rows) => (rows.length > 0 ? rows[0] : null)),
          3,
          1000,
        );
        results.risk_assessment_created = !!assessment;
        if (assessment) {
          results.risk_assessment = {
            id: assessment.id,
            risk_type: assessment.risk_type,
            severity: assessment.severity,
            source: assessment.source,
          };
        }
        results.alert_created = false;

        this.logger.error(
          `[${testMarker}] E2E test failed precondition: RISK_ENGINE_SYSTEM_USER_ID not configured`,
        );

        return {
          success: false,
          message: 'E2E MQTT telemetry+risk+alert test failed precondition',
          data: results,
        };
      }

      // Step 6: Poll for the RiskAssessment this exact telemetry event
      // should have produced (device_id is matched via the factors JSON
      // the risk engine writes — see risk/risk.service.ts).
      const assessment = await pollUntil(
        () =>
          this.riskService
            .findRecentForDevice(device.id, 20)
            .then((rows) => (rows.length > 0 ? rows[0] : null)),
        5,
        1000,
      );

      results.risk_assessment_created = !!assessment;
      if (!assessment) {
        throw new Error(
          'No RiskAssessment was created for this device within the poll window',
        );
      }
      results.risk_assessment = {
        id: assessment.id,
        risk_type: assessment.risk_type,
        severity: assessment.severity,
        source: assessment.source,
      };
      this.logger.log(
        `[${testMarker}] Risk assessment verified: ${assessment.risk_type} ${assessment.severity}`,
      );

      // Step 7: Poll for the Alert this exact RiskAssessment should have
      // produced (device.id is matched via the title text the risk engine
      // composes — see risk/risk-engine.service.ts maybeCreateAlert).
      const alert = await pollUntil(
        () =>
          this.alertsService
            .findRecentContainingText(device.id, 20)
            .then((rows) => (rows.length > 0 ? rows[0] : null)),
        5,
        1000,
      );

      results.alert_created = !!alert;
      if (!alert) {
        throw new Error(
          'No Alert was created for this device within the poll window, despite ' +
            'an actionable RiskAssessment and RISK_ENGINE_SYSTEM_USER_ID being configured',
        );
      }
      results.alert = {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        status: alert.status,
      };
      this.logger.log(`[${testMarker}] Alert verified: ${alert.id}`);

      // AlertsService.create() calls WebSocketService.broadcastAlertCreated()
      // unconditionally immediately after persisting the Alert (see
      // alerts/alerts.service.ts) — there is no branch between the two.
      // Subscribing an HTTP test client to the live WebSocket channel
      // within this same request/response cycle is not practical, so
      // verified Alert persistence is used as the proxy for the broadcast
      // having fired, per the same code path exercised in
      // risk/simulator-flood-flow.integration.spec.ts.
      results.websocket_broadcast_note =
        'Not directly observed by this HTTP endpoint; AlertsService.create() ' +
        'unconditionally calls broadcastAlertCreated() immediately after the ' +
        'Alert save that was just verified above, with no conditional path ' +
        'between them.';

      // Step 8: Overall result
      results.overall_success =
        results.mqtt_connected &&
        results.mqtt_published &&
        results.device_found &&
        results.telemetry_persisted &&
        results.risk_engine_configured &&
        results.risk_assessment_created &&
        results.alert_created;

      this.logger.log(
        `[${testMarker}] E2E test completed: ${results.overall_success ? 'PASS' : 'FAIL'}`,
      );

      return {
        success: true,
        message: 'E2E MQTT telemetry+risk+alert test completed',
        data: results,
      };
    } catch (error) {
      results.overall_success = false;
      results.error = error instanceof Error ? error.message : String(error);
      this.logger.error(`[${testMarker}] E2E test failed: ${error}`);

      return {
        success: false,
        message: 'E2E MQTT telemetry+risk+alert test failed',
        data: results,
      };
    }
  }
}
