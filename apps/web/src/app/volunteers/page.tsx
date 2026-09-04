'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No volunteer management domain exists in services/api. Previously
// showed a fabricated volunteer roster with invented phone numbers.
export default function VolunteersPage() {
  return (
    <OperationsShell eyebrow="Manage volunteers and field support teams" title="Volunteer Management">
      <NotAvailable
        icon={Users}
        title="Volunteer management is not available"
        description="CrisisMesh does not yet have a volunteer registry backend. No live volunteer roster or deployment data exists to show here."
      />
    </OperationsShell>
  );
}
