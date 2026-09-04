import {
  RISK_RULES,
  HazardType,
  resolveRiskLevel,
  isActionable,
  scoreForLevel,
  alertSeverityForLevel,
  alertTypeForHazard,
  alertCooldownKey,
  ALERT_COOLDOWN_MS,
} from './risk-rules';

describe('risk-rules (rule-based, no ML)', () => {
  describe('resolveRiskLevel', () => {
    it('returns null for a metric with no defined rule', () => {
      expect(resolveRiskLevel('HUMIDITY', 999)).toBeNull();
      expect(resolveRiskLevel('PRESSURE', 9999)).toBeNull();
    });

    it('returns null for a value below every threshold ("normal")', () => {
      expect(resolveRiskLevel('WATER_LEVEL', 1.0)).toBeNull();
      expect(resolveRiskLevel('TEMPERATURE', 25)).toBeNull();
      expect(resolveRiskLevel('SEISMIC', 1.5)).toBeNull();
    });

    describe('FLOOD — WATER_LEVEL', () => {
      it('MEDIUM at 2.5m', () => expect(resolveRiskLevel('WATER_LEVEL', 2.5)).toBe('MEDIUM'));
      it('HIGH at 4.0m', () => expect(resolveRiskLevel('WATER_LEVEL', 4.0)).toBe('HIGH'));
      it('CRITICAL at 6.0m', () => expect(resolveRiskLevel('WATER_LEVEL', 6.0)).toBe('CRITICAL'));
      it('no risk just below MEDIUM (2.4m)', () => expect(resolveRiskLevel('WATER_LEVEL', 2.4)).toBeNull());
    });

    describe('FLOOD — RAINFALL', () => {
      it('MEDIUM at 50mm', () => expect(resolveRiskLevel('RAINFALL', 50)).toBe('MEDIUM'));
      it('HIGH at 100mm', () => expect(resolveRiskLevel('RAINFALL', 100)).toBe('HIGH'));
      it('CRITICAL at 150mm', () => expect(resolveRiskLevel('RAINFALL', 150)).toBe('CRITICAL'));
    });

    describe('FIRE — AIR_QUALITY', () => {
      it('MEDIUM at 100 AQI', () => expect(resolveRiskLevel('AIR_QUALITY', 100)).toBe('MEDIUM'));
      it('HIGH at 150 AQI (typical simulated fire reading)', () => expect(resolveRiskLevel('AIR_QUALITY', 175)).toBe('HIGH'));
      it('CRITICAL at 250 AQI', () => expect(resolveRiskLevel('AIR_QUALITY', 250)).toBe('CRITICAL'));
    });

    describe('HEAT — TEMPERATURE', () => {
      it('no risk at NORMAL-scenario temperatures (23-27°C)', () => {
        expect(resolveRiskLevel('TEMPERATURE', 25)).toBeNull();
        expect(resolveRiskLevel('TEMPERATURE', 27)).toBeNull();
      });
      it('MEDIUM at 38°C', () => expect(resolveRiskLevel('TEMPERATURE', 38)).toBe('MEDIUM'));
      it('HIGH at 42°C', () => expect(resolveRiskLevel('TEMPERATURE', 42)).toBe('HIGH'));
      it('CRITICAL at 46°C', () => expect(resolveRiskLevel('TEMPERATURE', 46)).toBe('CRITICAL'));
    });

    describe('EARTHQUAKE — SEISMIC', () => {
      it('MEDIUM at magnitude 4.0', () => expect(resolveRiskLevel('SEISMIC', 4.0)).toBe('MEDIUM'));
      it('HIGH at magnitude 5.5', () => expect(resolveRiskLevel('SEISMIC', 5.5)).toBe('HIGH'));
      it('CRITICAL at magnitude 7.0', () => expect(resolveRiskLevel('SEISMIC', 7.0)).toBe('CRITICAL'));
    });
  });

  describe('isActionable', () => {
    it('MEDIUM is not actionable (no Alert)', () => expect(isActionable('MEDIUM')).toBe(false));
    it('HIGH is actionable', () => expect(isActionable('HIGH')).toBe(true));
    it('CRITICAL is actionable', () => expect(isActionable('CRITICAL')).toBe(true));
  });

  describe('scoreForLevel (fixed stepped score, not a statistical model)', () => {
    it('MEDIUM=50, HIGH=75, CRITICAL=95', () => {
      expect(scoreForLevel('MEDIUM')).toBe(50);
      expect(scoreForLevel('HIGH')).toBe(75);
      expect(scoreForLevel('CRITICAL')).toBe(95);
    });
  });

  describe('alertSeverityForLevel', () => {
    it('maps 1:1 to the existing AlertSeverity enum values', () => {
      expect(alertSeverityForLevel('HIGH')).toBe('HIGH');
      expect(alertSeverityForLevel('CRITICAL')).toBe('CRITICAL');
    });
  });

  describe('alertTypeForHazard (maps to existing AlertType enum only)', () => {
    it('FLOOD -> FLOOD', () => expect(alertTypeForHazard(HazardType.FLOOD)).toBe('FLOOD'));
    it('EARTHQUAKE -> EARTHQUAKE', () => expect(alertTypeForHazard(HazardType.EARTHQUAKE)).toBe('EARTHQUAKE'));
    it('FIRE -> WILDFIRE (no plain FIRE value exists on AlertType)', () => expect(alertTypeForHazard(HazardType.FIRE)).toBe('WILDFIRE'));
    it('HEAT -> WEATHER (no plain HEAT value exists on AlertType)', () => expect(alertTypeForHazard(HazardType.HEAT)).toBe('WEATHER'));
  });

  describe('alert cooldown key', () => {
    it('is keyed by device id and hazard type', () => {
      expect(alertCooldownKey('device-1', HazardType.FLOOD)).toBe('device-1::FLOOD');
      expect(alertCooldownKey('device-1', HazardType.FIRE)).toBe('device-1::FIRE');
      expect(alertCooldownKey('device-2', HazardType.FLOOD)).toBe('device-2::FLOOD');
    });

    it('cooldown window is 15 minutes', () => {
      expect(ALERT_COOLDOWN_MS).toBe(15 * 60 * 1000);
    });
  });

  describe('RISK_RULES table shape', () => {
    it('every rule references only metrics with real backend support', () => {
      const backendMetrics = new Set([
        'TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'RAINFALL',
        'WIND_SPEED', 'WATER_LEVEL', 'SEISMIC', 'AIR_QUALITY',
      ]);
      for (const metric of Object.keys(RISK_RULES)) {
        expect(backendMetrics.has(metric)).toBe(true);
      }
    });

    it('every rule\'s bands are ordered highest-threshold-first', () => {
      for (const rule of Object.values(RISK_RULES)) {
        const mins = rule!.bands.map((b) => b.min);
        const sorted = [...mins].sort((a, b) => b - a);
        expect(mins).toEqual(sorted);
      }
    });

    it('covers all 4 mapped hazards required by the supported simulator scenarios', () => {
      const hazards = new Set(Object.values(RISK_RULES).map((r) => r!.hazard));
      expect(hazards).toEqual(new Set([HazardType.FLOOD, HazardType.FIRE, HazardType.HEAT, HazardType.EARTHQUAKE]));
    });
  });
});
