'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin, Search, ChevronRight,
  AlertTriangle, ChevronDown, Map as MapIcon, Globe, Loader2, Shield,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';
import Link from 'next/link';

interface DistrictRecord {
  id: string;
  name: string;
  state: string;
  code?: string;
  population?: string;
  area_sq_km?: string;
  overall_risk_percent: string;
}

interface TopState {
  state: string;
  avg_risk: string;
}

const HIGH_RISK_THRESHOLD = 70;
const LOW_RISK_THRESHOLD = 40;

function riskLabel(riskPercent: number): { label: string; className: string } {
  if (riskPercent >= HIGH_RISK_THRESHOLD) return { label: 'High Risk', className: 'bg-red-100 text-red-600' };
  if (riskPercent >= LOW_RISK_THRESHOLD) return { label: 'Moderate', className: 'bg-orange-100 text-orange-600' };
  return { label: 'Low Risk', className: 'bg-green-100 text-green-600' };
}

function formatPopulation(value?: string): string {
  if (!value) return 'Unavailable';
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 'Unavailable';
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} Lakh`;
  return n.toLocaleString();
}

export default function DistrictsDirectory() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [districts, setDistricts] = useState<DistrictRecord[]>([]);
  const [topStates, setTopStates] = useState<TopState[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [districtsRes, topStatesRes] = await Promise.all([
          apiClient.get('/districts'),
          apiClient.get('/districts/top-states', { params: { limit: 5 } }),
        ]);
        if (cancelled) return;
        setDistricts(districtsRes.data?.data || []);
        setTopStates(topStatesRes.data?.data || []);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch districts:', error);
        Toast.error('Failed to load districts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const states = useMemo(
    () => Array.from(new Set(districts.map((d) => d.state))).sort(),
    [districts],
  );

  const filtered = useMemo(() => {
    return districts.filter((d) => {
      const matchesState = stateFilter === 'All States' || d.state === stateFilter;
      const matchesSearch = !search.trim() || `${d.name} ${d.code || ''} ${d.state}`.toLowerCase().includes(search.trim().toLowerCase());
      return matchesState && matchesSearch;
    });
  }, [districts, stateFilter, search]);

  const highRiskCount = districts.filter((d) => parseFloat(d.overall_risk_percent) >= HIGH_RISK_THRESHOLD).length;
  const lowRiskCount = districts.filter((d) => parseFloat(d.overall_risk_percent) < LOW_RISK_THRESHOLD).length;
  const totalStates = states.length;

  if (loading) {
    return (
      <OperationsShell eyebrow="Regional disaster readiness and surveillance" title="Districts Directory">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Regional disaster readiness and surveillance" title="Districts Directory">
      {/* Search & Filter Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by district name, code or state..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-3 pr-12 text-sm font-bold text-gray-700 focus:outline-none shadow-sm"
            >
              <option>All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button onClick={() => setView('grid')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Grid</button>
           <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>List</button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Globe size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total States</p>
               <h4 className="text-2xl font-black text-[#0f172a]">{totalStates}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
               <MapIcon size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Districts</p>
               <h4 className="text-2xl font-black text-[#0f172a]">{districts.length}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
               <AlertTriangle size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Risk (&ge;{HIGH_RISK_THRESHOLD}%)</p>
               <h4 className="text-2xl font-black text-red-600">{highRiskCount}</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
               <Shield size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Risk (&lt;{LOW_RISK_THRESHOLD}%)</p>
               <h4 className="text-2xl font-black text-green-600">{lowRiskCount}</h4>
            </div>
         </div>
      </div>

      {topStates.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-10">
          <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-widest mb-4">Top Affected States (by avg. risk)</h3>
          <div className="flex flex-wrap gap-4">
            {topStates.map((s) => (
              <div key={s.state} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-black text-[#0f172a]">{s.state}</span>
                <span className="text-xs font-bold text-red-500">{parseFloat(s.avg_risk).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">No districts found</p>
          <p className="text-xs font-bold text-gray-400">Try adjusting your search or state filter.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((district) => {
            const risk = parseFloat(district.overall_risk_percent) || 0;
            return (
              <Link
                key={district.id}
                href={`/districts/${district.id}`}
                className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{district.name}</h3>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{district.state}, India</p>
                   </div>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                      risk >= HIGH_RISK_THRESHOLD ? 'bg-red-50 border-red-100 text-red-600' :
                      risk >= LOW_RISK_THRESHOLD ? 'bg-orange-50 border-orange-100 text-orange-600' :
                      'bg-green-50 border-green-100 text-green-600'
                   }`}>
                      <MapPin size={24} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Overall Risk</p>
                      <p className={`text-lg font-black ${risk >= HIGH_RISK_THRESHOLD ? 'text-red-600' : 'text-[#0f172a]'}`}>{risk.toFixed(0)}%</p>
                   </div>
                   <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Population</p>
                      <p className="text-lg font-black text-[#0f172a]">{formatPopulation(district.population)}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{district.code || '—'}</span>
                   <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span className="text-[10px] font-black uppercase tracking-widest">Full Analysis</span>
                      <ChevronRight size={16} />
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">District</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">State</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Risk</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Population</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {filtered.map((d) => {
                   const risk = parseFloat(d.overall_risk_percent) || 0;
                   const status = riskLabel(risk);
                   return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors group">
                         <td className="px-8 py-5">
                            <span className="text-sm font-black text-[#0f172a] uppercase">{d.name}</span>
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-gray-500 uppercase">{d.state}</td>
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${risk >= HIGH_RISK_THRESHOLD ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${risk}%` }}></div>
                               </div>
                               <span className="text-xs font-black text-[#0f172a]">{risk.toFixed(0)}%</span>
                            </div>
                         </td>
                         <td className="px-8 py-5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${status.className}`}>{status.label}</span>
                         </td>
                         <td className="px-8 py-5 text-center font-black text-sm text-[#0f172a]">{formatPopulation(d.population)}</td>
                         <td className="px-8 py-5 text-right">
                            <Link href={`/districts/${d.id}`} className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest">View Profile &rarr;</Link>
                         </td>
                      </tr>
                   );
                 })}
              </tbody>
           </table>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
         <p>Showing {filtered.length} of {districts.length} districts</p>
      </div>
    </OperationsShell>
  );
}
