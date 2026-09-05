'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Previously showed entirely fabricated per-channel delivery tracking for
// a specific broadcast — "Total Recipients 125,684", per-channel success
// rates, a "94.6% Success Rate" pie chart, and a fake "98% of target
// population reached" claim. AlertsService/alerts.controller has no
// delivery- or read-receipt tracking per channel (SMS/WhatsApp/Email/
// Push) anywhere in the backend — an alert is a single database row with
// no per-recipient delivery state.
export default function EmergencyBroadcastConfirmation() {
  return (
    <OperationsShell eyebrow="Send alert and confirm delivery" title="Emergency Broadcast Confirmation">
      <NotAvailable
        icon={Radio}
        title="Broadcast delivery tracking is not available"
        description="CrisisMesh does not track per-recipient or per-channel delivery (SMS, WhatsApp, email, push) for alerts on the backend. An alert is broadcast in-app and over WebSocket only — there is no delivery-confirmation data to show here."
      />
    </OperationsShell>
  );
}
