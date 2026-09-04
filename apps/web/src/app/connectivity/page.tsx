'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No power-grid or network-connectivity monitoring domain exists in
// services/api. Previously showed fabricated outage/uptime data.
export default function ConnectivityPage() {
  return (
    <OperationsShell eyebrow="Monitor power supply and communication networks" title="Power & Connectivity Status">
      <NotAvailable
        icon={Zap}
        title="Infrastructure monitoring is not available"
        description="CrisisMesh does not yet have a power-grid or network-connectivity data source. No live outage or uptime data exists to show here."
      />
    </OperationsShell>
  );
}
