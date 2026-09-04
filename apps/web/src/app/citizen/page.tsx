'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, MapPin, Home, Phone,
  ChevronRight,
  ShieldCheck, Activity, Navigation,
  Zap, Share2,
  PhoneCall, Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';
import { parseGeoPoint } from '@/lib/geo';
import { useAuthStore } from '@/lib/store/auth-store';
import type { MapEntity } from '@/components/live-map';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black">Loading Citizen Map...</div>
});

interface PublicAlert {
  id: string;
  title: string;
  type: string;
  issued_at: string;
  location?: { location?: string; name?: string; address?: string };
}

interface PublicIncident {
  id: string;
  title: string;
  location?: { location?: string; name?: string; address?: string };
}

export default function CitizenDashboard() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<PublicAlert[]>([]);
  const [incidents, setIncidents] = useState<PublicIncident[]>([]);
  const [sheltersOpenCount, setSheltersOpenCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiClient.get('/public/alerts/active'),
      apiClient.get('/public/map'),
    ])
      .then(([activeAlertsRes, mapRes]) => {
        if (cancelled) return;
        setAlerts(activeAlertsRes.data?.data || []);
        setIncidents(mapRes.data?.incidents || []);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to load public dashboard data:', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated) return;
    let cancelled = false;
    apiClient
      .get('/shelters')
      .then((res) => {
        if (cancelled) return;
        const shelters: Array<{ is_operational: boolean }> = res.data?.data || [];
        setSheltersOpenCount(shelters.filter((s) => s.is_operational).length);
      })
      .catch(() => {
        /* Shelter count stays unavailable for this view */
      });
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, isAuthenticated]);

  const affectedAreas = useMemo(() => {
    const names = new Set<string>();
    [...alerts, ...incidents].forEach((item) => {
      const name = item.location?.name || item.location?.address;
      if (name) names.add(name);
    });
    return names.size;
  }, [alerts, incidents]);

  const mapEntities: MapEntity[] = useMemo(() => {
    const entities: MapEntity[] = [];
    alerts.forEach((a) => {
      const coords = a.location?.location ? parseGeoPoint(a.location.location) : null;
      if (!coords) return;
      entities.push({ id: a.id, kind: 'alert', title: a.title, detail: a.type, latitude: coords.lat, longitude: coords.lng });
    });
    incidents.forEach((i) => {
      const coords = i.location?.location ? parseGeoPoint(i.location.location) : null;
      if (!coords) return;
      entities.push({ id: i.id, kind: 'incident', title: i.title, detail: '', latitude: coords.lat, longitude: coords.lng });
    });
    return entities;
  }, [alerts, incidents]);

  const latestUpdates = [...alerts]
    .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
             <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Public Dashboard</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Citizen View • Live Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
              <Share2 size={16} /> Share Portal
           </button>
           <Link href="/login" className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10">
              Authority Login
           </Link>
        </div>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
         <CitizenStat href="/alerts" label="Active Alerts" value={loading ? '—' : String(alerts.length)} detail="View Alerts" color="text-red-600" icon={<AlertTriangle />} />
         <CitizenStat href="/map" label="Affected Areas" value={loading ? '—' : String(affectedAreas)} detail="View Map" color="text-orange-500" icon={<MapPin />} />
         <CitizenStat href="/citizen/shelters" label="Shelters Open" value={sheltersOpenCount != null ? String(sheltersOpenCount) : 'Sign in'} detail="Find Shelters" color="text-green-600" icon={<Home />} />
         <CitizenStat href="tel:1070" label="Emergency Helpline" value="1070" detail="Call Now" color="text-blue-600" icon={<Phone />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Live Situation Map */}
        <div className="col-span-12 xl:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Live Situation Map</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <LegendItem color="bg-orange-500" label="Alerts" />
                    <LegendItem color="bg-red-500" label="Incidents" />
                 </div>
              </div>
              <div className="flex-1 relative">
                 {loading ? (
                   <div className="h-full flex items-center justify-center text-gray-400"><Loader2 size={28} className="animate-spin" /></div>
                 ) : (
                   <LiveMap entities={mapEntities} />
                 )}
              </div>
           </div>
        </div>

        {/* Right Info Column */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           {/* Latest Updates */}
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Latest Updates</h3>
                 <Link href="/alerts" className="text-[10px] font-black text-blue-600 uppercase">View All</Link>
              </div>
              {loading ? (
                <div className="py-10 flex items-center justify-center text-gray-400"><Loader2 size={24} className="animate-spin" /></div>
              ) : latestUpdates.length === 0 ? (
                <p className="text-xs font-bold text-gray-400">No active alerts right now.</p>
              ) : (
                <div className="space-y-6">
                   {latestUpdates.map((update) => (
                      <div key={update.id} className="flex gap-4 group">
                         <div className="text-[10px] font-black text-gray-300 w-16 uppercase pt-1">
                           {new Date(update.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <div className="flex-1">
                            <p className="text-xs font-bold text-[#0f172a] leading-tight">{update.title}</p>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 inline-block">{update.type}</span>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>

           {/* Safety Helpline */}
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                       <PhoneCall size={20} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Safety Helpline</h4>
                 </div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Need Help?</p>
                 <h2 className="text-4xl font-black mb-10">1070</h2>
                 <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Police</span> <span className="text-white">100</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Ambulance</span> <span className="text-white">102</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Fire</span> <span className="text-white">101</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Disaster</span> <span className="text-white">1077</span></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Safety Tips Strip */}
      <div className="mt-8 bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Safety Tips</h3>
            <Link href="/citizen/safety" className="text-[10px] font-black text-blue-600 uppercase">Explore All Guides</Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SafetyTip
              icon={<Zap size={20} className="text-yellow-500" />}
              title="Avoid Flooded Roads"
              desc="Never drive through flooded areas. Turn around, don't drown."
            />
            <SafetyTip
              icon={<Activity size={20} className="text-blue-500" />}
              title="Do Not Drink Tap Water"
              desc="Use bottled water or boil tap water before consumption."
            />
            <SafetyTip
              icon={<Navigation size={20} className="text-green-500" />}
              title="Stay Informed"
              desc="Follow official social media for verified updates."
            />
            <SafetyTip
              icon={<ShieldCheck size={20} className="text-purple-500" />}
              title="Keep Emergency Kit Ready"
              desc="Flashlight, batteries, first aid, and medicines."
            />
         </div>
      </div>
    </div>
  );
}

function CitizenStat({ href, label, value, detail, color, icon }: { href: string; label: string; value: string; detail: string; color: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm group cursor-pointer hover:shadow-md transition-all block">
       <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-gray-100">{icon}</div>
       </div>
       <h4 className={`text-4xl font-black ${color} mb-2`}>{value}</h4>
       <div className="flex items-center gap-1 text-blue-600">
          <span className="text-[9px] font-black uppercase tracking-widest">{detail}</span>
          <ChevronRight size={12} />
       </div>
    </Link>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`w-2 h-2 rounded-full ${color}`}></div>
       <span>{label}</span>
    </div>
  );
}

function SafetyTip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
          {icon}
       </div>
       <div>
          <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{desc}</p>
       </div>
    </div>
  );
}
