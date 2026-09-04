'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No training/capacity-building domain exists in services/api.
export default function TrainingPage() {
  return (
    <OperationsShell eyebrow="Training programs and capacity building for responders" title="Training & Capacity Building">
      <NotAvailable
        icon={GraduationCap}
        title="Training programs are not available"
        description="CrisisMesh does not yet have a training/capacity-building backend. No live program or completion data exists to show here."
      />
    </OperationsShell>
  );
}
