'use client';

import React from 'react';
import { Database } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No storage/retention-policy domain exists in services/api.
export default function DataManagementPage() {
  return (
    <OperationsShell eyebrow="Manage platform data and retention policies" title="Data Management">
      <NotAvailable
        icon={Database}
        title="Data management is not available"
        description="CrisisMesh does not yet have storage or retention-policy management. No live storage usage or retention data exists to show here."
      />
    </OperationsShell>
  );
}
