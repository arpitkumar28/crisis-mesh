'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Previously invented a "AI Projected" hazard-forecast table with made-up
// probabilities, a "78% Predicted Inundation" map overlay, fabricated
// warning-severity/impact stats, per-channel subscriber counts, and a
// fully fake warning table with dead New Warning / Configure Broadcast
// Rules buttons. The risk engine (services/api/src/risk/risk-rules.ts) is
// an honestly-labeled rule-based threshold engine with no forecasting,
// probability estimation, or trained model — see /risk for what it
// actually produces. There is no early-warning/forecast/channel-
// subscriber backend module to source any of this from.
export default function EarlyWarningSystemPage() {
  return (
    <OperationsShell eyebrow="Multichannel early warning and predictive alerts" title="Early Warning System">
      <NotAvailable
        icon={Radio}
        title="Early warning forecasting is not available"
        description="CrisisMesh does not have a hazard-forecasting or predictive-warning backend. The risk engine (see /risk) evaluates real telemetry against fixed rule thresholds — it does not project probabilities or forecast future events. There is no live warning or channel-subscriber data to show here."
      />
    </OperationsShell>
  );
}
