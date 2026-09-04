'use client';

import React from 'react';
import { Navigation } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No routing/optimization backend exists in services/api.
export default function EvacuationRoutePlannerPage() {
  return (
    <OperationsShell eyebrow="Plan and optimize emergency evacuation routes" title="Evacuation Route Planner">
      <NotAvailable
        icon={Navigation}
        title="Route planning is not available"
        description="CrisisMesh does not yet have a route-planning or optimization backend. No live route or capacity data exists to show here."
      />
    </OperationsShell>
  );
}
