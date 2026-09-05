-- Adds alert acknowledgement tracking, supporting the authority
-- alert-review workflow (an authority acknowledges an alert before
-- optionally escalating it into an incident). Purely additive: two new
-- nullable columns, no changes to existing data or constraints.

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES profiles(id);
