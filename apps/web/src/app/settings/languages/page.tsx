'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No localization/translation domain exists in services/api.
export default function LanguagesPage() {
  return (
    <OperationsShell eyebrow="Manage multi-language support and public announcements" title="Multi-Language Support">
      <NotAvailable
        icon={Languages}
        title="Localization management is not available"
        description="CrisisMesh does not yet have a translation/localization backend. No language coverage or announcement-translation data exists to show here."
      />
    </OperationsShell>
  );
}
