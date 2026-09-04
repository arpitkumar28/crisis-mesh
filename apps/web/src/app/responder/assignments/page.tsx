'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Shield, MapPin, Clock, ChevronRight, Loader2, AlertTriangle,
} from 'lucide-react';
import { ResponderShell } from '@/components/responder-shell';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface IncidentRecord {
  id: string;
  type: string;
  status: string;
  title: string;
  severity: string;
  reported_at: string;
  assigned_to?: string | null;
}

const TABS = ['All', 'REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'] as const;

/**
 * Previously showed 5 entirely fabricated assignments (fake IDs,
 * deadlines, priorities). There is no dedicated "assignment" entity —
 * the real analog is Incident.assigned_to (see
 * services/api/src/entities/incident.entity.ts). This page now fetches
 * real incidents and filters to those assigned to the signed-in user.
 * No fake deadline/priority fields are shown since Incident has no such
 * columns — only real status/severity/reported_at.
 */
export default function ResponderAssignmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('All');

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
        setUserId(meRes.data?.data?.id || null);
        setIncidents(incidentsRes.data?.data || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load assignments:', err);
        setError('Unable to load assignments from the server.');
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
    () => incidents.filter((i) => userId && i.assigned_to === userId),
    [incidents, userId],
  );

  const filtered = useMemo(
    () => (tab === 'All' ? myAssignments : myAssignments.filter((i) => i.status === tab)),
    [myAssignments, tab],
  );

  if (loading) {
    return (
      <ResponderShell eyebrow="Manage and track your active mission assignments" title="My Assignments">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </ResponderShell>
    );
  }

  if (error) {
    return (
      <ResponderShell eyebrow="Manage and track your active mission assignments" title="My Assignments">
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </ResponderShell>
    );
  }

  return (
    <ResponderShell eyebrow="Manage and track your active mission assignments" title="My Assignments">
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 shadow-sm flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">
            {myAssignments.length === 0 ? 'No incidents are assigned to you.' : 'No assignments match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((inc) => (
            <Link
              key={inc.id}
              href={`/incidents/${inc.id}`}
              className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                  inc.status === 'RESOLVED' ? 'bg-green-50 border-green-100 text-green-600' :
                  inc.severity === 'CRITICAL' || inc.severity === 'HIGH' ? 'bg-red-50 border-red-100 text-red-600' :
                  'bg-blue-50 border-blue-100 text-blue-600'
                }`}>
                  <Shield size={24} />
                </div>
                <span className="text-[8px] font-black px-2 py-0.5 rounded uppercase bg-gray-100 text-gray-600">{inc.status}</span>
              </div>

              <div className="mb-8">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{inc.type} · {inc.severity}</p>
                <h4 className="text-xl font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{inc.title}</h4>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-gray-500">
                  <Clock size={16} className="text-gray-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Reported {new Date(inc.reported_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-all">
                  View Mission Details <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ResponderShell>
  );
}
