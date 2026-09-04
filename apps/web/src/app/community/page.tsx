'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No community-engagement domain exists in services/api.
export default function CommunityEngagementPage() {
  return (
    <OperationsShell eyebrow="Engage and connect with local communities" title="Community Engagement">
      <NotAvailable
        icon={Users}
        title="Community engagement is not available"
        description="CrisisMesh does not yet have a community engagement backend. No live community activity or membership data exists to show here."
      />
    </OperationsShell>
  );
}
