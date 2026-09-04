'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No feedback/survey domain exists in services/api.
export default function FeedbackPage() {
  return (
    <OperationsShell eyebrow="Collect and analyze feedback from citizens and responders" title="Feedback & Surveys">
      <NotAvailable
        icon={MessageSquare}
        title="Feedback and surveys are not available"
        description="CrisisMesh does not yet have a feedback/survey backend. No live survey responses or sentiment data exists to show here."
      />
    </OperationsShell>
  );
}
