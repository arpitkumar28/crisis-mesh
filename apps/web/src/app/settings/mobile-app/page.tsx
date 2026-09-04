'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No mobile app management/analytics domain exists in services/api.
export default function MobileAppManagementPage() {
  return (
    <OperationsShell eyebrow="Manage app versions, releases and analytics" title="Mobile App Management">
      <NotAvailable
        icon={Smartphone}
        title="Mobile app management is not available"
        description="CrisisMesh does not yet track mobile app versions, releases, or usage analytics on the backend. No live app-management data exists to show here."
      />
    </OperationsShell>
  );
}
