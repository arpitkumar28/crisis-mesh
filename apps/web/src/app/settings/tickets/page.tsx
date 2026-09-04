'use client';

import React from 'react';
import { Ticket } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No support-ticket domain exists in services/api.
export default function SupportTicketsPage() {
  return (
    <OperationsShell eyebrow="Track and manage system maintenance and support requests" title="Maintenance & Support Tickets">
      <NotAvailable
        icon={Ticket}
        title="Support tickets are not available"
        description="CrisisMesh does not yet have a support-ticket backend. No live tickets or maintenance requests exist to show here."
      />
    </OperationsShell>
  );
}
