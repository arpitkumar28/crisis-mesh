'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Creating an alert exists for real (POST /v1/alerts), but per-channel
// delivery tracking (SMS/push/email sent/delivered/failed) does not.
export default function CommunicationCenterPage() {
  return (
    <OperationsShell eyebrow="Coordinate communications during incidents" title="Incident Communication Center">
      <NotAvailable
        icon={MessageSquare}
        title="Delivery-channel tracking is not available"
        description="Creating alerts is real (see the Alerts page), but per-channel delivery statistics (SMS/push/email sent, delivered, failed) are not tracked anywhere yet."
      />
    </OperationsShell>
  );
}
