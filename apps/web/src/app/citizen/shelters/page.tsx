'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Home, Search, CheckCircle2, Phone, Loader2, LogIn,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth-store';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Safe Zones Map...</div>
});

interface Shelter {
  id: string;
  name: string;
  type?: string;
  capacity: number;
  current_occupancy: number;
  is_operational: boolean;
  facilities?: string[];
  contact_phone?: string;
  location?: { name?: string; address?: string };
}

export default function CitizenSheltersPage() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/shelters')
      .then((res) => setShelters(res.data?.data || []))
      .catch((err) => {
        if (err.response?.status === 401) {
          setError('auth');
        } else {
          console.error('Failed to fetch shelters:', err);
          setError('Live shelter data is unavailable. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      setLoading(false);
      setError('auth');
      return;
    }
    load();
  }, [hasHydrated, isAuthenticated, load]);

  const filtered = useMemo(
    () => shelters.filter((s) => !search.trim() || s.name.toLowerCase().includes(search.trim().toLowerCase())),
    [shelters, search],
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/20">
             <Home size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Find Shelters &amp; Safe Zones</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Shelter Registry</p>
          </div>
        </div>
        <Link href="/citizen" className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
           Back to Dashboard
        </Link>
      </header>

      {error === 'auth' ? (
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          <LogIn size={40} className="text-gray-300 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-2">Sign in to view live shelter availability</p>
          <p className="text-xs font-bold text-gray-400 mb-6 max-w-sm">Shelter data requires an account so we can show accurate, up-to-date capacity information.</p>
          <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest">
            Sign In
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {/* Left: Shelter List */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
             <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                <div className="p-8 border-b border-gray-100 space-y-6">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold focus:outline-none"
                      />
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                   {loading ? (
                     <div className="h-full flex items-center justify-center text-gray-400">
                       <Loader2 size={28} className="animate-spin" />
                     </div>
                   ) : error ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                       <p className="text-xs font-bold mb-4">{error}</p>
                       <button onClick={load} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Retry</button>
                     </div>
                   ) : filtered.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-gray-400">
                       <Home size={28} className="mb-3 text-gray-300" />
                       <p className="text-xs font-bold">No shelters found.</p>
                     </div>
                   ) : (
                     filtered.map((s) => {
                       const fillPct = s.capacity > 0 ? Math.min((s.current_occupancy / s.capacity) * 100, 100) : 0;
                       const status = !s.is_operational ? 'Offline' : fillPct >= 100 ? 'Full' : fillPct >= 85 ? 'Near Full' : 'Available Now';
                       const statusClass = status === 'Available Now' ? 'bg-green-100 text-green-600' : status === 'Near Full' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600';
                       const barClass = status === 'Available Now' ? 'bg-green-500' : status === 'Near Full' ? 'bg-orange-500' : 'bg-red-500';
                       return (
                         <div key={s.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">{s.name}</h4>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                    {s.type || 'Shelter'} • {s.location?.name || s.location?.address || 'Location unavailable'}
                                  </p>
                               </div>
                               <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${statusClass}`}>{status}</span>
                            </div>

                            <div className="space-y-3">
                               <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                  <span className="text-gray-400">Occupancy</span>
                                  <span className="text-[#0f172a]">{s.current_occupancy} / {s.capacity}</span>
                               </div>
                               <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${barClass}`} style={{ width: `${fillPct}%` }}></div>
                               </div>
                            </div>

                            {s.facilities && s.facilities.length > 0 && (
                              <div className="mt-3 flex items-center gap-1 text-[9px] font-bold text-gray-400">
                                <CheckCircle2 size={12} /> {s.facilities.join(' • ')}
                              </div>
                            )}

                            {s.contact_phone && (
                              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                 <a href={`tel:${s.contact_phone}`} className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                    <Phone size={12} /> {s.contact_phone}
                                 </a>
                              </div>
                            )}
                         </div>
                       );
                     })
                   )}
                </div>
             </div>
          </div>

          {/* Right: Map View */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
             <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                   <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Safe Zones Map</h3>
                </div>
                <div className="flex-1 relative">
                   <LiveMap entities={[]} />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
