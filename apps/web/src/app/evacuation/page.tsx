'use client';

import React from 'react';
import { Navigation } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No evacuation-routing domain exists in services/api. Previously showed
// fabricated evacuee counts and internally-inconsistent transport numbers.
export default function EvacuationExecutionPage() {
  return (
    <OperationsShell eyebrow="Manage evacuation operations" title="Evacuation Execution">
      <NotAvailable
        icon={Navigation}
        title="Evacuation execution tracking is not available"
        description="CrisisMesh does not yet have an evacuation operations backend. No live evacuee counts, zone status, or transport data exists to show here."
      />
    </OperationsShell>
  );
}
