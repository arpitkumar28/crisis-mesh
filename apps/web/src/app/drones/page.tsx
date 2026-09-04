'use client';

import React from 'react';
import { Video } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

/**
 * There is no drone/UAV backend anywhere in services/api — no controller,
 * service, or entity for drone telemetry, video feeds, or fleet status.
 * The previous version of this page rendered a static stock photo labeled
 * "LIVE" with entirely fabricated HUD telemetry (battery/altitude/speed)
 * and three invented drone records. Per the real-data policy, an
 * unimplemented feature must say so rather than simulate live operational
 * data.
 */
export default function DroneSurveillancePage() {
  return (
    <OperationsShell eyebrow="Drone-based aerial surveillance" title="Drone Surveillance">
      <div className="bg-white rounded-[40px] border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-center text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-6">
          <Video size={28} />
        </div>
        <p className="text-sm font-black text-[#0f172a] mb-2 uppercase tracking-tight">Drone surveillance is not available</p>
        <p className="text-xs font-bold text-gray-400 max-w-md">
          CrisisMesh does not yet have a drone/UAV integration. No live feed, telemetry, or fleet
          data exists to show here.
        </p>
      </div>
    </OperationsShell>
  );
}
