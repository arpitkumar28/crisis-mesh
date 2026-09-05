-- Corrective migration: risk_assessments as created by
-- 20260826_01_initial_schema.sql never matched the RiskAssessment
-- TypeORM entity (services/api/src/entities/risk-assessment.entity.ts)
-- that RiskEngineService, RiskService, and DistrictsService have always
-- used. Concretely: the table has no district_id/risk_type/severity/
-- confidence/prediction/valid_from/source/is_active columns, and
-- risk_level was created as the `risk_level` ENUM rather than the
-- decimal(5,2) score (0-100) every consumer actually reads/writes.
--
-- This was invisible to the test suite because every test mocks the
-- RiskAssessment repository — no test had ever run RiskEngineService
-- against a real, migrated database until now. In practice this means
-- RiskEngineService.evaluate() cannot currently persist a real risk
-- assessment, and DistrictsService.getDistrictIntelligence() cannot
-- query one, against any database built from the existing migrations.
--
-- Fixed additively/in-place here rather than editing the original
-- CREATE TABLE, per the project's migration-safety rule. No existing
-- rows are assumed meaningful: every insert attempt against the old
-- shape would have failed with a missing-column error, so the table is
-- expected to be empty in any real deployment.

ALTER TABLE risk_assessments
  ADD COLUMN IF NOT EXISTS district_id UUID,
  ADD COLUMN IF NOT EXISTS risk_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS severity VARCHAR(20),
  ADD COLUMN IF NOT EXISTS confidence DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS prediction TEXT,
  ADD COLUMN IF NOT EXISTS valid_from TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'AI_MODEL',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- risk_level was created as the `risk_level` ENUM (MINIMAL/LOW/MODERATE/
-- HIGH/CRITICAL); every consumer (RiskEngineService, RiskService,
-- DistrictsService) reads/writes it as a 0-100 decimal score instead.
-- No application code has ever successfully written a row here (see
-- above), so there is no real enum data at risk from any code path this
-- repository controls — but rather than assume that covers every way a
-- row could exist (e.g. a manually seeded or externally restored row),
-- the conversion maps each enum value to a representative score instead
-- of discarding it with USING NULL.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'risk_assessments'
      AND column_name = 'risk_level'
      AND udt_name = 'risk_level'
  ) THEN
    ALTER TABLE risk_assessments
      ALTER COLUMN risk_level DROP DEFAULT,
      ALTER COLUMN risk_level TYPE DECIMAL(5, 2) USING (
        CASE risk_level::text
          WHEN 'MINIMAL' THEN 10.00
          WHEN 'LOW' THEN 25.00
          WHEN 'MODERATE' THEN 50.00
          WHEN 'HIGH' THEN 75.00
          WHEN 'CRITICAL' THEN 90.00
          ELSE NULL
        END
      ),
      ALTER COLUMN risk_level DROP NOT NULL;
  END IF;
END $$;

-- factors was created as text[]; RiskAssessment.factors is a single
-- text column (a JSON string of contributing factors), so convert it
-- the same way and for the same reason.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'risk_assessments'
      AND column_name = 'factors'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE risk_assessments
      ALTER COLUMN factors TYPE TEXT USING NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_risk_assessments_district_id ON risk_assessments(district_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_is_active ON risk_assessments(is_active);
