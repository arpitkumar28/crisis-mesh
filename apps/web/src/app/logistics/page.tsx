'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Only a generic read-only Resource exists (GET /v1/resources) — no
// shipments, suppliers, or procurement domain exists. Previously showed
// fabricated inventory, shipment, and supplier data.
export default function LogisticsPage() {
  return (
    <OperationsShell eyebrow="Manage inventory, procurement and distribution" title="Supply Chain & Logistics">
      <NotAvailable
        icon={ShoppingCart}
        title="Supply chain tracking is not available"
        description="CrisisMesh does not yet have a shipments/procurement backend. For real inventory data see the Resources page; no live shipment or supplier data exists here."
      />
    </OperationsShell>
  );
}
