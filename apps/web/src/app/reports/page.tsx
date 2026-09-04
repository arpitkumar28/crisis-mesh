'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No damage/impact-assessment domain exists in services/api. Previously
// showed fabricated damage statistics and assessment records.
export default function DamageAssessmentPage() {
  return (
    <OperationsShell eyebrow="Assess damage and impact after disaster" title="Disaster Impact Assessment">
      <NotAvailable
        icon={ClipboardList}
        title="Damage assessment reports are not available"
        description="CrisisMesh does not yet have a damage/impact-assessment backend. No real assessment records exist to show here."
      />
    </OperationsShell>
  );
}
