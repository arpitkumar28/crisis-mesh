'use client';

import React from 'react';
import { Database } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No backup/restore domain exists in services/api.
export default function BackupRestorePage() {
  return (
    <OperationsShell eyebrow="Manage system backups and data recovery" title="Backup & Restore">
      <NotAvailable
        icon={Database}
        title="Backup & restore is not available"
        description="CrisisMesh does not yet have an application-level backup/restore feature. No backup history or schedule data exists to show here."
      />
    </OperationsShell>
  );
}
