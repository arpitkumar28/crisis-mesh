'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Weather/News are real, but internal, hardcoded service integrations —
// there is no admin-facing integration/webhook management controller.
// Previously showed fabricated webhook URLs.
export default function IntegrationsPage() {
  return (
    <OperationsShell eyebrow="Manage third-party integrations and webhooks" title="Integrations & Webhooks">
      <NotAvailable
        icon={Share2}
        title="Integration management is not available"
        description="Weather and news integrations exist internally but are not admin-configurable. No webhook management or external integration registry exists yet."
      />
    </OperationsShell>
  );
}
