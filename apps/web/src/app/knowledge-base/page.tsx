'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Previously showed a fully fabricated content library: category article
// counts, "2.4k views" style popularity stats on invented articles, a
// "Recently Added" list with made-up near-current dates, and dead
// search/download/category/support buttons. There is no CMS, document
// storage, or knowledge-base module anywhere in services/api/src — no
// backend exists to source any of this from.
export default function KnowledgeBasePage() {
  return (
    <OperationsShell eyebrow="Guidelines, SOPs and documentation" title="Knowledge Base">
      <NotAvailable
        icon={BookOpen}
        title="Knowledge base is not available"
        description="CrisisMesh does not have a document/content management backend. There are no SOPs, guides, or articles stored on the platform to browse or search here."
      />
    </OperationsShell>
  );
}
