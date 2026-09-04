import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAssessment } from '../entities/risk-assessment.entity';
import { Sensor } from '../entities/sensor.entity';
import { Device } from '../entities/device.entity';
import { AlertsService } from '../alerts/alerts.service';
import { AlertType, AlertSeverity } from '../entities/alert.entity';
import {
  RISK_RULES,
  HazardType,
  RiskLevel,
  resolveRiskLevel,
  isActionable,
  scoreForLevel,
  alertSeverityForLevel,
  alertTypeForHazard,
  alertCooldownKey,
  ALERT_COOLDOWN_MS,
} from './risk-rules';

export interface TelemetryReadingContext {
  device: Device;
  sensor: Sensor;
  metric: string;
  value: number;
  unit: string;
  timestamp: Date;
}

/**
 * RULE-BASED environmental risk engine.
 *
 * This is explicitly NOT machine learning — see risk-rules.ts for the full
 * set of fixed thresholds this engine evaluates against. Given a single
 * telemetry reading, it:
 *
 *   1. Resolves a risk band (MEDIUM/HIGH/CRITICAL) via the rule table, or
 *      does nothing if the reading is below every threshold ("no risk").
 *   2. Persists a RiskAssessment row for every resolved band (MEDIUM and
 *      up) so risk is fully observable even when no Alert is raised.
 *   3. For actionable bands (HIGH/CRITICAL) only, creates a real Alert via
 *      the existing AlertsService — subject to a per-device-per-hazard
 *      cooldown so repeated dangerous readings don't create an alert storm.
 *
 * Telemetry-level duplicate detection (the same sensor+timestamp reading
 * arriving twice) already happens upstream in TelemetryService before a
 * reading is persisted — this engine is only ever invoked for a reading
 * that was just newly saved, so "do not create duplicate risk assessments
 * for the same telemetry event" is satisfied by construction: a duplicate
 * telemetry message never reaches evaluate() at all.
 */
@Injectable()
export class RiskEngineService {
  private readonly logger = new Logger(RiskEngineService.name);

  /** In-memory alert cooldown tracker — see risk-rules.ts ALERT_COOLDOWN_MS docs. */
  private readonly lastAlertAt = new Map<string, number>();

  private warnedMissingSystemActor = false;

  constructor(
    @InjectRepository(RiskAssessment)
    private readonly riskAssessmentRepository: Repository<RiskAssessment>,
    private readonly alertsService: AlertsService,
  ) {}

  /**
   * Evaluate a single telemetry reading. Safe to call for any metric —
   * metrics with no rule defined (see RISK_RULES) are silently ignored,
   * as are readings below the lowest threshold for their metric.
   */
  async evaluate(
    reading: TelemetryReadingContext,
  ): Promise<RiskAssessment | null> {
    try {
      if (
        !reading ||
        typeof reading.value !== 'number' ||
        !Number.isFinite(reading.value)
      ) {
        return null;
      }

      const rule = RISK_RULES[reading.metric];
      if (!rule) {
        return null; // no rule for this metric — not a risk-triggering signal
      }

      const level = resolveRiskLevel(reading.metric, reading.value);
      if (!level) {
        return null; // below every threshold — genuinely normal, do nothing
      }

      const assessment = await this.persistAssessment(
        rule.hazard,
        level,
        reading,
        rule.label,
        rule.unit,
      );

      if (isActionable(level)) {
        await this.maybeCreateAlert(
          rule.hazard,
          level as 'HIGH' | 'CRITICAL',
          reading,
          assessment,
        );
      }

      return assessment;
    } catch (error: unknown) {
      this.logger.error(
        `Risk evaluation failed for device=${reading?.device?.id} metric=${reading?.metric}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private async persistAssessment(
    hazard: HazardType,
    level: RiskLevel,
    reading: TelemetryReadingContext,
    metricLabel: string,
    unit: string,
  ): Promise<RiskAssessment> {
    const now = new Date();
    const validUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour validity window

    const explanation = `${metricLabel} reading of ${reading.value}${unit} from device ${reading.device.id} (sensor ${reading.sensor.id}) crossed the ${level} threshold for ${hazard}.`;

    const assessment = this.riskAssessmentRepository.create({
      location_id: reading.device.location_id || null,
      district_id: null,
      risk_type: hazard,
      risk_level: String(scoreForLevel(level)),
      severity: level,
      confidence: null, // deliberately not set — see risk-rules.ts header comment
      factors: JSON.stringify({
        metric: reading.metric,
        value: reading.value,
        unit,
        device_id: reading.device.id,
        sensor_id: reading.sensor.id,
        timestamp: reading.timestamp.toISOString(),
      }),
      prediction: explanation, // rule-based explanation, not an AI prediction — see header comment
      valid_from: now,
      valid_until: validUntil,
      source: 'RULE_BASED_ENGINE',
      is_active: true,
    });

    const saved = await this.riskAssessmentRepository.save(assessment);
    this.logger.log(
      `Risk assessment created: ${hazard} ${level} (score=${scoreForLevel(level)}) for device ${reading.device.id}`,
    );
    return saved;
  }

  private async maybeCreateAlert(
    hazard: HazardType,
    level: 'HIGH' | 'CRITICAL',
    reading: TelemetryReadingContext,
    assessment: RiskAssessment,
  ): Promise<void> {
    const key = alertCooldownKey(reading.device.id, hazard);
    const last = this.lastAlertAt.get(key);
    const now = Date.now();

    if (last !== undefined && now - last < ALERT_COOLDOWN_MS) {
      this.logger.debug(
        `Alert suppressed by cooldown for ${key} (${Math.round((ALERT_COOLDOWN_MS - (now - last)) / 1000)}s remaining)`,
      );
      return;
    }

    const systemActorId = process.env.RISK_ENGINE_SYSTEM_USER_ID;
    if (!systemActorId) {
      if (!this.warnedMissingSystemActor) {
        this.logger.warn(
          'RISK_ENGINE_SYSTEM_USER_ID is not configured — actionable risk was detected ' +
            `(${hazard} ${level} on device ${reading.device.id}) but no Alert was created, ` +
            'because Alert.issued_by is a required foreign key to an existing Profile and this ' +
            'engine has no user context to attribute the alert to. Configure this env var to an ' +
            'existing ADMIN/AUTHORITY account id to enable automatic alerting.',
        );
        this.warnedMissingSystemActor = true;
      }
      return;
    }

    const title = `${hazard} risk: ${reading.metric} ${reading.value} from device ${reading.device.id}`;
    const description = String(assessment.prediction || '');

    try {
      await this.alertsService.create(
        {
          type: alertTypeForHazard(hazard) as AlertType,
          severity: alertSeverityForLevel(level) as AlertSeverity,
          title: title.slice(0, 500),
          description,
          location_id: reading.device.location_id || undefined,
        },
        systemActorId,
      );
      this.lastAlertAt.set(key, now);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create alert for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
