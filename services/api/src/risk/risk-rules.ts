/**
 * Rule-based environmental risk engine — thresholds and scoring.
 *
 * This is NOT machine learning. Every threshold below is a fixed,
 * human-authored constant, inspectable in this one file. There is no
 * trained model, no statistical inference, and no accuracy claim beyond
 * "this value crossed this line". `RiskAssessment.source` is set to
 * 'RULE_BASED_ENGINE' (never 'AI_MODEL') for every assessment this engine
 * creates, and `confidence` is deliberately left null — that field is
 * documented on the entity as an AI-model attribute, which does not apply
 * to a fixed rule.
 *
 * Design: each rule is keyed by exactly one SensorMetric and evaluates a
 * single incoming reading against three thresholds (MEDIUM/HIGH/CRITICAL).
 * A reading below MEDIUM is treated as no risk at all — nothing is
 * persisted, matching "NORMAL readings must not continuously generate
 * alerts". Only HIGH/CRITICAL readings are "actionable" (create an Alert);
 * MEDIUM readings are persisted as a RiskAssessment for observability but
 * do not raise an Alert.
 *
 * Rules are evaluated per-reading, independent of any notion of "which
 * simulator scenario produced this value" — a real sensor has no such
 * label, so the engine can't either. This means, for example, a HEATWAVE
 * scenario's elevated AIR_QUALITY reading can legitimately also cross the
 * FIRE rule's threshold — that overlap is intentional and realistic
 * (elevated AQI during a heatwave is itself worth flagging), not a bug.
 */

export enum HazardType {
  FLOOD = 'FLOOD',
  FIRE = 'FIRE',
  HEAT = 'HEAT',
  EARTHQUAKE = 'EARTHQUAKE',
}

export type RiskLevel = 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ThresholdBand {
  level: RiskLevel;
  min: number;
}

export interface MetricRiskRule {
  hazard: HazardType;
  /** Human-readable metric description, used in generated explanations. */
  label: string;
  unit: string;
  /** Bands MUST be listed highest-threshold-first; the first matching band wins. */
  bands: ThresholdBand[];
}

/**
 * The complete set of rules. Keyed by the exact SensorMetric enum value
 * from services/api/src/entities/sensor.entity.ts — a metric with no entry
 * here produces no risk assessment at all (e.g. HUMIDITY, PRESSURE alone
 * are not risk-triggering signals in this version of the engine).
 */
export const RISK_RULES: Partial<Record<string, MetricRiskRule>> = {
  WATER_LEVEL: {
    hazard: HazardType.FLOOD,
    label: 'water level',
    unit: 'm',
    bands: [
      { level: 'CRITICAL', min: 6.0 },
      { level: 'HIGH', min: 4.0 },
      { level: 'MEDIUM', min: 2.5 },
    ],
  },
  RAINFALL: {
    hazard: HazardType.FLOOD,
    label: 'rainfall',
    unit: 'mm',
    bands: [
      { level: 'CRITICAL', min: 150 },
      { level: 'HIGH', min: 100 },
      { level: 'MEDIUM', min: 50 },
    ],
  },
  AIR_QUALITY: {
    hazard: HazardType.FIRE,
    label: 'air quality index',
    unit: 'AQI',
    bands: [
      { level: 'CRITICAL', min: 250 },
      { level: 'HIGH', min: 150 },
      { level: 'MEDIUM', min: 100 },
    ],
  },
  TEMPERATURE: {
    hazard: HazardType.HEAT,
    label: 'temperature',
    unit: '°C',
    bands: [
      { level: 'CRITICAL', min: 46 },
      { level: 'HIGH', min: 42 },
      { level: 'MEDIUM', min: 38 },
    ],
  },
  SEISMIC: {
    hazard: HazardType.EARTHQUAKE,
    label: 'seismic magnitude',
    unit: 'Richter',
    bands: [
      { level: 'CRITICAL', min: 7.0 },
      { level: 'HIGH', min: 5.5 },
      { level: 'MEDIUM', min: 4.0 },
    ],
  },
};

/** Only HIGH/CRITICAL risk levels are "actionable" — i.e. create an Alert. */
export function isActionable(level: RiskLevel): boolean {
  return level === 'HIGH' || level === 'CRITICAL';
}

/** Resolve a metric+value to a risk band, or null if below every threshold (no risk). */
export function resolveRiskLevel(
  metric: string,
  value: number,
): RiskLevel | null {
  const rule = RISK_RULES[metric];
  if (!rule) return null;
  for (const band of rule.bands) {
    if (value >= band.min) return band.level;
  }
  return null;
}

/**
 * Fixed, stepped 0-100 score per level. This is intentionally simple
 * (not a continuous/statistical model) — a rule-based engine reports
 * which band was crossed, not a probability.
 */
export function scoreForLevel(level: RiskLevel): number {
  switch (level) {
    case 'MEDIUM':
      return 50;
    case 'HIGH':
      return 75;
    case 'CRITICAL':
      return 95;
  }
}

/** Maps our internal RiskLevel to the existing AlertSeverity enum values. */
export function alertSeverityForLevel(
  level: 'HIGH' | 'CRITICAL',
): 'HIGH' | 'CRITICAL' {
  return level;
}

/**
 * Maps a HazardType to the closest existing AlertType enum value.
 * AlertType has no plain "FIRE" or "HEAT" member, so FIRE maps to
 * WILDFIRE and HEAT maps to the generic WEATHER value.
 */
export function alertTypeForHazard(
  hazard: HazardType,
): 'FLOOD' | 'EARTHQUAKE' | 'WILDFIRE' | 'WEATHER' {
  switch (hazard) {
    case HazardType.FLOOD:
      return 'FLOOD';
    case HazardType.EARTHQUAKE:
      return 'EARTHQUAKE';
    case HazardType.FIRE:
      return 'WILDFIRE';
    case HazardType.HEAT:
      return 'WEATHER';
  }
}

/**
 * Alert cooldown / deduplication.
 *
 * Key: `${device_id}::${hazard}` — one cooldown timer per device per
 * hazard type. A repeated actionable reading for the same device+hazard
 * within this window does not create a new Alert (it still creates/updates
 * a RiskAssessment record, so observability is unaffected — only Alert
 * creation, the thing a human gets paged for, is suppressed).
 *
 * This is an in-memory, single-process cooldown (a Map, not a DB table or
 * distributed cache) — the simplest correct implementation for a single
 * API instance. It resets on process restart and does not coordinate
 * across multiple API replicas; a future multi-instance deployment would
 * need a shared store (e.g. Redis) instead. Documented here rather than
 * silently assumed.
 */
export const ALERT_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

export function alertCooldownKey(deviceId: string, hazard: HazardType): string {
  return `${deviceId}::${hazard}`;
}
