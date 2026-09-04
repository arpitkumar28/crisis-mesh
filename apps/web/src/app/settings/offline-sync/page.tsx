'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No offline-sync tracking domain exists in services/api.
export default function OfflineSyncPage() {
  return (
    <OperationsShell eyebrow="Manage offline data collection and synchronization" title="Offline Data Sync">
      <NotAvailable
        icon={RefreshCw}
        title="Offline sync tracking is not available"
        description="CrisisMesh does not yet track offline data collection or sync queues on the backend. No live sync status exists to show here."
      />
    </OperationsShell>
  );
}
