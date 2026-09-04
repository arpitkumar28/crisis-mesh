'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, AlertTriangle, MapPin, Home, Activity, CloudRain,
  Phone, Heart, ChevronRight, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface PublicStats {
  activeAlerts: number;
  openIncidents: number;
  onlineDevices: number;
}

interface NewsArticleRecord {
  id: string;
  title: string;
  published_at?: string;
  created_at?: string;
}

/**
 * Previously showed a fabricated "Relief Camps: 32 (100% Operational)"
 * and "Total Responders: 1,070" — no such data exists anywhere. Also
 * claimed "99.8% Verified" data-integrity and a hardcoded fake news feed.
 * This page now shows only counts from genuinely public, unauthenticated
 * backend endpoints (GET /v1/public/alerts/stats, GET /v1/public/map,
 * GET /v1/news) and states plainly what has no live source.
 */
export default function TransparencyPortalPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [news, setNews] = useState<NewsArticleRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [alertStatsRes, mapRes, newsRes] = await Promise.all([
          apiClient.get('/public/alerts/stats'),
          apiClient.get('/public/map'),
          apiClient.get('/news').catch(() => null),
        ]);
        if (cancelled) return;
        const mapData = mapRes.data?.data || {};
        setStats({
          activeAlerts: alertStatsRes.data?.data?.active ?? 0,
          openIncidents: Array.isArray(mapData.incidents) ? mapData.incidents.length : 0,
          onlineDevices: Array.isArray(mapData.devices) ? mapData.devices.filter((d: any) => d.status === 'ONLINE').length : 0,
        });
        setNews((newsRes?.data?.data || []).slice(0, 3));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10 font-sans">
      <header className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
           <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Public Transparency Portal</h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Public access to key information and dashboards</p>
        </div>
      </header>

      {/* Real, public, unauthenticated counts only */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-8 text-gray-300"><Loader2 size={32} className="animate-spin" /></div>
        ) : (
          <>
            <TransparencyStat label="Active Alerts" value={String(stats?.activeAlerts ?? 0)} color="text-red-600" />
            <TransparencyStat label="Open Incidents" value={String(stats?.openIncidents ?? 0)} color="text-orange-500" />
            <TransparencyStat label="Devices Online" value={String(stats?.onlineDevices ?? 0)} color="text-blue-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm p-10">
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight mb-10 border-b border-gray-50 pb-6">Public Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                 <InfoCard icon={<MapPin className="text-blue-600" />} title="Live Situation Map" desc="Real-time public map showing active alerts and incidents." link="/citizen" />
                 <InfoCard icon={<Home className="text-green-600" />} title="Shelters" desc="Directory of registered shelters." link="/citizen/shelters" />
                 <InfoCard icon={<Activity className="text-orange-500" />} title="Resources" desc="Registered relief resources and inventory status." link="/resources" />
                 <InfoCard icon={<CloudRain className="text-cyan-500" />} title="Weather Updates" desc="Live weather observations." link="/weather" />
                 <InfoCard icon={<ShieldCheck className="text-purple-600" />} title="SOS & Safety" desc="Emergency protocols and the SOS reporting button." link="/citizen/sos" />
                 <InfoCard icon={<Phone className="text-red-500" />} title="Emergency Contacts" desc="Real national emergency helpline numbers." link="/help" />
                 <InfoCard icon={<AlertTriangle className="text-yellow-600" />} title="Report Incident" desc="Community reporting tool to inform responders about local hazards." link="/citizen/report" />
                 <InfoCard icon={<Heart className="text-pink-500" />} title="Volunteer" desc="Volunteer coordination is not yet available." link="/volunteers" />
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Latest News</h3>
                 <Link href="/news" className="text-[10px] font-black text-blue-600 uppercase">View All</Link>
              </div>
              {news.length === 0 ? (
                <p className="text-xs font-bold text-gray-400">No news articles available.</p>
              ) : (
                <div className="space-y-6">
                  {news.map((n) => (
                    <NewsItem key={n.id} title={n.title} time={new Date(n.published_at || n.created_at || Date.now()).toLocaleDateString()} />
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
         <div className="flex flex-wrap items-center justify-between gap-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Important Helplines</h4>
            <div className="flex flex-wrap items-center gap-12">
               <Helpline label="Police" val="100" />
               <Helpline label="Ambulance" val="102" />
               <Helpline label="Fire" val="101" />
               <Helpline label="Disaster" val="1070" />
               <Helpline label="Child" val="1098" />
            </div>
         </div>
      </div>
    </div>
  );
}

function TransparencyStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm">
       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{label}</p>
       <h4 className={`text-5xl font-black ${color} mb-3`}>{value}</h4>
    </div>
  );
}

function InfoCard({ icon, title, desc, link }: { icon: React.ReactNode; title: string; desc: string; link: string }) {
  return (
    <Link href={link} className="flex gap-6 group cursor-pointer">
       <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shrink-0">
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
       </div>
       <div>
          <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-2">{title}</h4>
          <p className="text-[11px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{desc}</p>
       </div>
    </Link>
  );
}

function NewsItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
       <div>
          <h5 className="text-[11px] font-black text-[#0f172a] leading-tight uppercase">{title}</h5>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{time}</p>
       </div>
    </div>
  );
}

function Helpline({ label, val }: { label: string; val: string }) {
  return (
    <a href={`tel:${val}`} className="flex items-center gap-2">
       <span className="text-[10px] font-black text-[#0f172a] uppercase">{label}</span>
       <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black text-blue-600">{val}</span>
    </a>
  );
}
