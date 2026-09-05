'use client';

import React from 'react';
import { Cpu } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { NotAvailable } from '@/components/not-available';

// Previously showed a fully fabricated fleet of 120 virtual sensor nodes
// with fake battery levels, uptime percentages, a fake live-data chart,
// and dead control buttons (Restart All Nodes, Calibrate Sensors, Update
// Firmware, Add Virtual Node, scenario-injection buttons). Confirmed via
// services/api/src/simulation/README.md: the simulation control module is
// an "Architectural Placeholder Only" — no controllers, services, or
// business logic exist to manage simulator scenarios or virtual devices.
// Real device/sensor data (from the actual apps/simulator MQTT publisher)
// already has its own correctly-wired pages under /sensors.
export default function SimulatorMonitorPage() {
  return (
    <OperationsShell eyebrow="Virtual IoT hardware and mesh network simulation" title="Simulator / Virtual Hardware Monitor">
      <NotAvailable
        icon={Cpu}
        title="Simulator control is not available"
        description="CrisisMesh's simulation-control module is an unimplemented placeholder — there is no backend to manage virtual nodes, inject test scenarios, or report simulator-specific status. For real device and sensor data (including telemetry from the actual simulator), see the Sensors pages."
      />
    </OperationsShell>
  );
}
