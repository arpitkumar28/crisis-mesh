'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Globe, Search, ChevronRight, AlertTriangle, Loader2,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface DistrictRecord {
  id: string;
  name: string;
  state: string;
  overall_risk_percent: string;
}

interface StateAggregate {
  state: string;
  districtCount: number;
  avgRisk: number;
}

/**
 * There is no state-level entity or endpoint — only districts, each with
 * a `state` field. This page previously showed 6 entirely fabricated
 * states with invented population, sensor-count, and alert-count numbers.
 * It now derives real state rollups by grouping the real district list
 * (GET /v1/districts) client-side, the same technique already used by
 * the Districts Directory page's state filter. Per-state sensor and
 * alert counts are not shown because no such aggregate exists on the
 * backend — showing them would mean inventing numbers.
 */
export default function StatesDirectory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<DistrictRecord[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/districts');
        if (cancelled) return;
        setDistricts(res.data?.data || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load districts for state rollup:', err);
        setError('Unable to load state data from the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const states: StateAggregate[] = useMemo(() => {
    const byState = new Map<string, { risks: number[]; count: number }>();
    for (const d of districts) {
      const entry = byState.get(d.state) || { risks: [], count: 0 };
      entry.count += 1;
      const risk = parseFloat(d.overall_risk_percent);
      if (Number.isFinite(risk)) entry.risks.push(risk);
      byState.set(d.state, entry);
    }
    return Array.from(byState.entries())
      .map(([state, { risks, count }]) => ({
        state,
        districtCount: count,
        avgRisk: risks.length ? risks.reduce((a, b) => a + b, 0) / risks.length : 0,
      }))
      .sort((a, b) => b.avgRisk - a.avgRisk);
  }, [districts]);

  const filtered = useMemo(
    () => states.filter((s) => !search.trim() || s.state.toLowerCase().includes(search.trim().toLowerCase())),
    [states, search],
  );

  if (loading) {
    return (
      <OperationsShell eyebrow="National disaster intelligence and state-level readiness" title="States Directory">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error) {
    return (
      <OperationsShell eyebrow="National disaster intelligence and state-level readiness" title="States Directory">
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="National disaster intelligence and state-level readiness" title="States Directory">
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by state name..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">
            {states.length === 0 ? 'No districts registered yet.' : 'No states match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <Link
              key={s.state}
              href={`/districts`}
              className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{s.state}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{s.districtCount} district{s.districtCount === 1 ? '' : 's'} registered</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                  s.avgRisk >= 70 ? 'bg-red-50 border-red-100 text-red-600' :
                  s.avgRisk >= 40 ? 'bg-orange-50 border-orange-100 text-orange-600' :
                  'bg-green-50 border-green-100 text-green-600'
                }`}>
                  <Globe size={24} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Avg. District Risk</span>
                  <span className="text-[#0f172a]">{s.avgRisk.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${s.avgRisk >= 70 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${s.avgRisk}%` }}></div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-6 mt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-[10px] font-black uppercase tracking-widest">View Districts</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </OperationsShell>
  );
}
