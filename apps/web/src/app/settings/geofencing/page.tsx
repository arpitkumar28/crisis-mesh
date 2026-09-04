'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// No geofencing domain exists in services/api — districts only have a
// point lat/lng, no polygon boundaries or rule engine.
export default function GeofencingPage() {
  return (
    <OperationsShell eyebrow="Manage geofences and automated alert rules" title="Geofencing & Alert Rules">
      <NotAvailable
        icon={MapPin}
        title="Geofencing is not available"
        description="CrisisMesh does not yet support geofence boundaries or automated location-based alert rules. No live geofence data exists to show here."
      />
    </OperationsShell>
  );
}
