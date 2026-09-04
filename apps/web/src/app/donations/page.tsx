'use client';

import React from 'react';
import { Wallet } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No donations/funding domain exists in services/api — no controller,
// service, or entity. Previously showed fabricated donor names/amounts.
export default function DonationsPage() {
  return (
    <OperationsShell eyebrow="Manage donations, funding and transparency" title="Donations & Funding">
      <NotAvailable
        icon={Wallet}
        title="Donations tracking is not available"
        description="CrisisMesh does not yet have a donations or funding backend. No live donation, campaign, or transparency data exists to show here."
      />
    </OperationsShell>
  );
}
