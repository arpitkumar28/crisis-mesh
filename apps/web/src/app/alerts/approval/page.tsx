'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// The backend's AlertStatus enum (services/api/src/entities/alert.entity.ts)
// only has ACTIVE/RESOLVED/EXPIRED/CANCELLED — there is no PENDING status
// and no approval endpoint anywhere in alerts.controller.ts. This page
// previously showed a fully fabricated approval queue, stats, and
// approve/reject buttons with no onClick handlers. Real alert review now
// happens via acknowledge/escalate on the Alerts Center (/alerts).
export default function AlertApprovalWorkflow() {
  return (
    <OperationsShell eyebrow="Review and approve alerts before publishing" title="Alert Approval Workflow">
      <NotAvailable
        icon={ShieldCheck}
        title="Alert approval is not available"
        description="CrisisMesh does not have a pending-approval status or approval workflow on the backend. Alerts go active immediately when created; use the Alerts Center to acknowledge and, when appropriate, escalate an alert into an incident."
      />
    </OperationsShell>
  );
}
