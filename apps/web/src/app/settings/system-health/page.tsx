'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Only GET /v1/health exists (basic liveness check) — no CPU/RAM/service
// uptime metrics backend exists. Previously showed fabricated performance
// data and a fake service uptime table.
export default function SystemHealthPage() {
  return (
    <OperationsShell eyebrow="Monitor platform performance and infrastructure status" title="System Health">
      <NotAvailable
        icon={BarChart3}
        title="Infrastructure metrics are not available"
        description="Only a basic liveness check exists on the backend (GET /v1/health). No CPU, memory, or per-service uptime metrics are collected yet."
      />
    </OperationsShell>
  );
}
