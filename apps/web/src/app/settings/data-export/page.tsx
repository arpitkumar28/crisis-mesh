'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No data-export domain exists in services/api.
export default function DataExportPage() {
  return (
    <OperationsShell eyebrow="Export data and share with authorized entities" title="Data Export & Sharing">
      <NotAvailable
        icon={Download}
        title="Data export is not available"
        description="CrisisMesh does not yet have a data-export backend. No export history or scheduled export data exists to show here."
      />
    </OperationsShell>
  );
}
