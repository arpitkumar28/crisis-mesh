'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell, AlertTriangle, Radio, Loader2, Clock, Info,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20 text-4xl">Loading Overview Map...</div>,
});

interface OverviewData {
  active_alerts: number;
  critical_alerts: number;
  open_incidents: number;
  total_devices: number;
  online_devices: number;
}

interface AuditLogRecord {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  timestamp: string;
}

/**
 * Previously showed fabricated "Responders (Field): 256", fake
 * "Uptime (30d): 99.92%", a fake recent-activity feed, a "System Health"
 * grid claiming 6 subsystems (AI & Analytics, Edge Engines, Cloud
 * Infrastructure, etc.) are all "Operational" with no backend basis at
 * all, and a fake "Network Load: 142ms" panel. None of those metrics
 * exist anywhere in services/api. This page now shows only real counts
 * from GET /v1/dashboard/overview and real recent events from
 * GET /v1/audit-logs (best-effort — requires ADMIN).
 */
export default function SystemOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [activity, setActivity] = useState<AuditLogRecord[]>([]);
  const [activityError, setActivityError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [overviewRes, activityRes] = await Promise.all([
          apiClient.get('/dashboard/overview'),
          apiClient.get('/audit-logs', { params: { limit: 4, offset: 0 } }).catch(() => null),
        ]);
        if (cancelled) return;
        setOverview(overviewRes.data?.data || null);
        if (activityRes) {
          setActivity(activityRes.data?.data || []);
        } else {
          setActivityError(true);
        }
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
      <OperationsShell eyebrow="Complete platform system status" title="System Overview">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Complete platform system status" title="System Overview">
      {/* Top Header Section — only real, traceable counts */}
      <div className="flex items-center justify-end gap-8 mb-8">
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Alerts</p>
          <h4 className="text-xl font-black text-orange-500 uppercase">{overview?.active_alerts ?? 0}</h4>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Open Incidents</p>
          <h4 className="text-xl font-black text-red-500 uppercase">{overview?.open_incidents ?? 0}</h4>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Devices Online</p>
          <h4 className="text-xl font-black text-[#0f172a] uppercase">{overview?.online_devices ?? 0} / {overview?.total_devices ?? 0}</h4>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Live Map Overview</h3>
            </div>
            <div className="flex-1 relative bg-blue-50">
              <LiveMap entities={[]} />
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Recent Activity</h3>
            {activityError ? (
              <p className="text-xs font-bold text-gray-400">Recent activity requires an ADMIN account. See the Activity Log page.</p>
            ) : activity.length === 0 ? (
              <p className="text-xs font-bold text-gray-400">No recent activity recorded.</p>
            ) : (
              <div className="space-y-6">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                      {a.entity_type === 'ALERT' ? <Bell size={12} className="text-orange-500" /> : <AlertTriangle size={12} className="text-red-500" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0f172a] uppercase">{a.action} {a.entity_type || ''}{a.entity_id ? ` #${a.entity_id.slice(0, 8)}` : ''}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(a.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/activity" className="block w-full mt-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[9px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all text-center">View All Activity &rarr;</Link>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Radio size={16} className="text-gray-400" />
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Live Signal</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed">
              {overview?.online_devices ?? 0} of {overview?.total_devices ?? 0} registered devices are currently reporting ONLINE status.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-3">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-blue-700">
              CrisisMesh does not yet collect infrastructure-level health metrics (CPU/RAM, per-service
              uptime, network latency) or field responder headcount. Only a basic liveness check exists
              (<code className="font-mono">GET /v1/health</code>).
            </p>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}
