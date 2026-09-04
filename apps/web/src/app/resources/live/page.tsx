'use client';

import React, { useEffect, useState } from 'react';
import {
  Truck, Loader2, AlertTriangle, Info,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';

interface ResourceRecord {
  id: string;
  name: string;
  type: string;
  quantity: number;
  unit?: string | null;
  status: string;
  assigned_to?: string | null;
}

function statusClass(status: string): string {
  switch (status) {
    case 'IN_USE': return 'bg-blue-100 text-blue-600';
    case 'MAINTENANCE': return 'bg-orange-100 text-orange-600';
    case 'UNAVAILABLE': return 'bg-gray-100 text-gray-500';
    default: return 'bg-green-100 text-green-600';
  }
}

/**
 * Previously showed fabricated per-vehicle GPS speed/heading, fake fleet
 * stats (132 active vehicles, 12 drones, 56 generators), fake maintenance
 * alerts, and a fake "Fleet Operations" recommendation. Resource has no
 * location/telemetry columns (see entities/resource.entity.ts) — there is
 * no live position or speed data anywhere in the backend. This page now
 * shows the real resource registry (GET /v1/resources: name, type,
 * quantity, status, assignment) and says plainly that live tracking
 * doesn't exist yet.
 */
export default function ResourceTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/resources');
        if (cancelled) return;
        setResources(res.data?.data || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load resources:', err);
        setError('Unable to load resources from the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <OperationsShell eyebrow="Real-time tracking of vehicles, equipment and field teams" title="Resource Tracking">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error) {
    return (
      <OperationsShell eyebrow="Real-time tracking of vehicles, equipment and field teams" title="Resource Tracking">
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Registered relief resources and equipment" title="Resource Tracking">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-blue-700">
          Live GPS position, speed, and maintenance telemetry are not tracked for resources yet — only
          registry status is available below.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">No resources registered.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Resource</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Quantity</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100"><Truck size={16} /></div>
                      <span className="text-xs font-black text-[#0f172a] uppercase">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{r.type}</td>
                  <td className="px-8 py-5 text-xs font-black text-[#0f172a]">{r.quantity}{r.unit ? ` ${r.unit}` : ''}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OperationsShell>
  );
}
