'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No crowd-density domain exists in services/api — not even a keyword in
// source. Previously showed fabricated density trends and hotspot markers.
export default function CrowdMonitoringPage() {
  return (
    <OperationsShell eyebrow="Crowd density monitoring" title="Crowd Monitoring & Density">
      <NotAvailable
        icon={Users}
        title="Crowd monitoring is not available"
        description="CrisisMesh does not yet have a crowd-density data source (no sensor feed or estimation service). No live density or hotspot data exists to show here."
      />
    </OperationsShell>
  );
}
