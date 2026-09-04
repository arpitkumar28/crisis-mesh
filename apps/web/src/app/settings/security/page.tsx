'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No threat-monitoring/security-event domain exists beyond basic JWT
// auth itself. Previously showed fabricated threat data and security
// events.
export default function SecurityCenterPage() {
  return (
    <OperationsShell eyebrow="Global security health and threat monitoring" title="System Security Center">
      <NotAvailable
        icon={Shield}
        title="Security monitoring is not available"
        description="CrisisMesh authenticates with JWT and role-based access control, but has no dedicated threat-monitoring or security-event backend yet. No live threat data exists to show here."
      />
    </OperationsShell>
  );
}
