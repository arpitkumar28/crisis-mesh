'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No notification-template domain exists in services/api.
export default function NotificationTemplatesPage() {
  return (
    <OperationsShell eyebrow="Manage notification and alert templates" title="Notification Templates">
      <NotAvailable
        icon={Bell}
        title="Notification templates are not available"
        description="CrisisMesh does not yet have a template-management backend. Alerts are composed directly when created; no reusable template store exists yet."
      />
    </OperationsShell>
  );
}
