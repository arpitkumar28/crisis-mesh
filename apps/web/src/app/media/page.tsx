'use client';

import React from 'react';
import { Newspaper } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No press/media-center domain exists in services/api.
export default function MediaCenterPage() {
  return (
    <OperationsShell eyebrow="Official updates, press releases and media resources" title="Media & Press Center">
      <NotAvailable
        icon={Newspaper}
        title="Media center is not available"
        description="CrisisMesh does not yet have a press/media backend. For real public updates see the News page; no press-release or media-contact data exists here."
      />
    </OperationsShell>
  );
}
