'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, MapPin, CheckCircle2, Clock, AlertTriangle, Shield,
  ChevronRight, Loader2,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Mission Map...</div>,
});

interface IncidentRecord {
  id: string;
  type: string;
  status: string;
  title: string;
  severity: string;
  assigned_to?: string | null;
}

interface CurrentUser {
  id: string;
  name: string;
}

/**
 * Previously showed a fabricated "Team Alpha" identity, fake team stats
 * (12 team members, 8 check-ins), a fake live-location ETA, a fake
 * "Team Comm" chat (no messaging backend exists), and fake quick-report
 * buttons with no handlers. This page now shows the signed-in
 * responder's real name and their real assigned incidents
 * (Incident.assigned_to), with no fabricated team/communication data.
 */
export default function ResponderDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [meRes, incidentsRes] = await Promise.all([
          apiClient.get('/auth/me'),
          apiClient.get('/incidents'),
        ]);
        if (cancelled) return;
        setUser(meRes.data?.data || null);
        setIncidents(incidentsRes.data?.data || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load responder dashboard:', err);
        setError('Unable to load your assignments from the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const myAssignments = useMemo(
    () => incidents.filter((i) => user && i.assigned_to === user.id),
    [incidents, user],
  );
  const activeCount = myAssignments.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const highPriorityCount = myAssignments.filter((i) => i.severity === 'HIGH' || i.severity === 'CRITICAL').length;

  if (loading) {
    return (
      <OperationsShell eyebrow="Field operations console" title="Responder Dashboard">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Field operations console" title="Responder Dashboard">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-blue-500/20">
            {(user?.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">Welcome, {user?.name || 'Responder'}</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex items-center gap-3 text-orange-500 mb-8">
          <AlertTriangle size={20} />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Real counts only — team headcount/check-ins had no backend source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <TeamStat label="My Active Assignments" value={String(activeCount)} icon={<Shield className="text-blue-600" />} />
        <TeamStat label="High/Critical Priority" value={String(highPriorityCount)} icon={<AlertTriangle className="text-red-600" />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">My Assignments</h3>
              <Link href="/responder/assignments" className="text-[10px] font-black text-blue-600 uppercase">View All</Link>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {myAssignments.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 p-4">No incidents are assigned to you.</p>
              ) : (
                myAssignments.slice(0, 6).map((inc) => (
                  <Link key={inc.id} href={`/incidents/${inc.id}`} className="block p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{inc.type}</span>
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase bg-gray-100 text-gray-500">{inc.status}</span>
                    </div>
                    <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{inc.title}</h4>
                    <div className="mt-4 flex items-center justify-end">
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="px-8 py-5 border-b border-gray-100">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Assignment Map</h3>
            </div>
            <div className="flex-1 relative">
              <LiveMap entities={[]} />
            </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function TeamStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a]">{value}</h4>
    </div>
  );
}
