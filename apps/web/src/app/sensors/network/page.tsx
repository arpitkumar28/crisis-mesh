'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  ChevronDown, Radio, Cpu, Router, TestTube2,
  Maximize2, Minimize2, Loader2,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';
import { parseGeoPoint } from '@/lib/geo';
import type { MapEntity } from '@/components/live-map';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20">Loading Network Map...</div>
});

const DEVICE_TYPES = ['SENSOR', 'RELAY', 'GATEWAY', 'SIMULATOR'] as const;
const DEVICE_TYPE_META: Record<(typeof DEVICE_TYPES)[number], { icon: React.ReactNode }> = {
  SENSOR: { icon: <Radio size={14} /> },
  RELAY: { icon: <Router size={14} /> },
  GATEWAY: { icon: <Cpu size={14} /> },
  SIMULATOR: { icon: <TestTube2 size={14} /> },
};

interface DeviceRecord {
  id: string;
  name: string;
  type: (typeof DEVICE_TYPES)[number];
  status: 'ONLINE' | 'OFFLINE' | 'UNREACHABLE' | 'ERROR';
  location?: { name?: string; address?: string; location?: string };
}

interface StatusCounts {
  total: number;
  online: number;
  offline: number;
  other: number;
}

export default function SensorNetworkPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [devicesByType, setDevicesByType] = useState<Record<string, DeviceRecord[]>>({});
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const mapPanelRef = useRef<HTMLDivElement>(null);

  const toggleMapFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      mapPanelRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsMapFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const [countRes, byStatusRes, ...typeResults] = await Promise.all([
          apiClient.get('/devices/count'),
          apiClient.get('/devices/count/by-status'),
          ...DEVICE_TYPES.map((t) => apiClient.get(`/devices/type/${t}`)),
        ]);

        if (cancelled) return;

        const total: number = countRes.data?.data?.count ?? 0;
        const byStatus: Record<string, number> = byStatusRes.data?.data || {};
        const online = byStatus['ONLINE'] ?? 0;
        const offline = byStatus['OFFLINE'] ?? 0;
        const other = Object.entries(byStatus)
          .filter(([key]) => key !== 'ONLINE' && key !== 'OFFLINE')
          .reduce((sum, [, count]) => sum + (count as number), 0);

        setStatusCounts({ total, online, offline, other });

        const byType: Record<string, DeviceRecord[]> = {};
        DEVICE_TYPES.forEach((t, i) => {
          byType[t] = typeResults[i].data?.data || [];
        });
        setDevicesByType(byType);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load sensor network data:', err);
        setError(true);
        Toast.error('Failed to load sensor network data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const mapEntities: MapEntity[] = useMemo(() => {
    const entities: MapEntity[] = [];
    Object.values(devicesByType).forEach((devices) => {
      devices.forEach((d) => {
        const coords = d.location?.location ? parseGeoPoint(d.location.location) : null;
        if (!coords) return;
        entities.push({
          id: d.id,
          kind: 'device',
          title: d.name,
          detail: d.location?.name || d.location?.address || d.type,
          status: d.status,
          latitude: coords.lat,
          longitude: coords.lng,
        });
      });
    });
    return entities;
  }, [devicesByType]);

  if (loading) {
    return (
      <OperationsShell eyebrow="Manage and monitor the complete sensor network" title="Sensor Network">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error || !statusCounts) {
    return (
      <OperationsShell eyebrow="Manage and monitor the complete sensor network" title="Sensor Network">
        <div className="h-[60vh] flex items-center justify-center text-gray-400 text-sm font-bold">
          Couldn&apos;t load network data. Please refresh the page.
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Manage and monitor the complete sensor network" title="Sensor Network">
      {/* Stats Mini Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Devices</p>
            <h4 className="text-xl font-black text-[#0f172a]">{statusCounts.total}</h4>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Online</p>
            <h4 className="text-xl font-black text-green-600">{statusCounts.online}</h4>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Offline</p>
            <h4 className="text-xl font-black text-red-600">{statusCounts.offline}</h4>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Unreachable / Error</p>
            <h4 className="text-xl font-black text-orange-500">{statusCounts.other}</h4>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[600px]">
        {/* Left: Map */}
        <div ref={mapPanelRef} className="col-span-12 lg:col-span-8 bg-blue-50 rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm">
           <LiveMap entities={mapEntities} />

           <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={toggleMapFullscreen}
                className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-[#0f172a]"
              >
                {isMapFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
           </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto pr-2 no-scrollbar">
           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Devices by Type</h3>
              <div className="space-y-4">
                 {DEVICE_TYPES.map((type) => {
                   const devices = devicesByType[type] || [];
                   const online = devices.filter((d) => d.status === 'ONLINE').length;
                   const healthPct = devices.length > 0 ? Math.round((online / devices.length) * 100) : 0;
                   return (
                     <TypeRow
                       key={type}
                       icon={DEVICE_TYPE_META[type].icon}
                       label={type}
                       count={devices.length}
                       online={online}
                       health={healthPct}
                     />
                   );
                 })}
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Device Status Breakdown</h3>
              </div>
              <div className="space-y-4">
                 <HealthBar label="Online" value={statusCounts.online} total={statusCounts.total || 1} color="bg-green-500" />
                 <HealthBar label="Offline" value={statusCounts.offline} total={statusCounts.total || 1} color="bg-red-500" />
                 <HealthBar label="Unreachable / Error" value={statusCounts.other} total={statusCounts.total || 1} color="bg-orange-500" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function TypeRow({ icon, label, count, online, health }: { icon: React.ReactNode; label: string; count: number; online: number; health: number }) {
  return (
    <div className="flex items-center gap-3">
       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
          {icon}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
             <span className="text-[10px] font-black text-[#0f172a] uppercase truncate">{label}</span>
             <span className="text-[9px] font-bold text-gray-400 uppercase">{online}/{count} <span className="mx-1">&bull;</span> {health}%</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-green-500" style={{ width: `${health}%` }}></div>
          </div>
       </div>
    </div>
  );
}

function HealthBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = Math.round((value / total) * 100);
  return (
    <div>
       <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          <span>{label}</span>
          <span className="text-[#0f172a]">{value} ({percent}%)</span>
       </div>
       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
       </div>
    </div>
  );
}
