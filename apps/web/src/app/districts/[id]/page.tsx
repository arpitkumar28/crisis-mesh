'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, MapPin, Activity, Bell,
  Cloud, Droplets, Wind, Gauge, Info, ChevronRight,
  TrendingUp, TrendingDown, Shield, Loader2, XCircle, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black">Loading District Map...</div>
});

interface District {
  id: string;
  name: string;
  state: string;
  code?: string;
  population?: string;
  area_sq_km?: string;
  overall_risk_percent: string;
  ai_risk_insight?: string;
}

interface DistrictIntelligence {
  overall_risk: { percentage: string; severity: string; trend: string; change: number };
  active_alerts: { total: number; critical: number; high: number; recent: Array<{ id: string; title: string; severity: string; location: string; issued_at: string }> };
  incidents: { total: number; recent: Array<{ id: string; title: string; severity: string; status: string; location: string; reported_at: string }> };
  sensors: { online: number; total: number; offline: number; operational_percentage: number };
  weather: {
    temperature_celsius?: number;
    humidity_percent?: number;
    wind_speed_kmh?: number;
    precipitation_mm?: number;
    condition?: string;
    source?: string;
    observation_time?: string;
  } | null;
  risk_breakdown: { flood: string; heat: string; fire: string; lightning: string; pollution: string };
}

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

function formatPopulation(value?: string): string {
  if (!value) return 'Unavailable';
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 'Unavailable';
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} Lakh`;
  return n.toLocaleString();
}

export default function DistrictDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const districtId = params?.id;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [district, setDistrict] = useState<District | null>(null);
  const [intelligence, setIntelligence] = useState<DistrictIntelligence | null>(null);

  const fetchData = useCallback(async () => {
    if (!districtId) return;
    setLoadState('loading');
    try {
      const [districtRes, intelligenceRes] = await Promise.all([
        apiClient.get(`/districts/${districtId}`),
        apiClient.get(`/districts/${districtId}/intelligence`),
      ]);
      setDistrict(districtRes.data?.data || null);
      setIntelligence(intelligenceRes.data?.data || null);
      setLoadState('ready');
    } catch (error: any) {
      console.error('Failed to fetch district:', error);
      if (error.response?.status === 404) {
        setLoadState('not-found');
      } else {
        setLoadState('error');
      }
    }
  }, [districtId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loadState === 'loading') {
    return (
      <OperationsShell eyebrow="Comprehensive overview of district status and resources" title="District Detail">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (loadState === 'not-found') {
    return (
      <OperationsShell eyebrow="Comprehensive overview of district status and resources" title="District Detail">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <XCircle size={40} className="mb-4 text-gray-300" />
          <p className="text-sm font-black text-[#0f172a] mb-1">District not found</p>
          <p className="text-xs font-bold text-gray-400 mb-6">No district exists with ID &quot;{districtId}&quot;.</p>
          <button onClick={() => router.push('/districts')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Back to All Districts
          </button>
        </div>
      </OperationsShell>
    );
  }

  if (loadState === 'error' || !district || !intelligence) {
    return (
      <OperationsShell eyebrow="Comprehensive overview of district status and resources" title="District Detail">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={40} className="mb-4 text-orange-300" />
          <p className="text-sm font-black text-[#0f172a] mb-1">Couldn&apos;t load this district</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </OperationsShell>
    );
  }

  const risk = parseFloat(intelligence.overall_risk.percentage) || 0;
  const isRising = intelligence.overall_risk.trend === 'rising' || intelligence.overall_risk.trend === 'increasing';

  return (
    <OperationsShell eyebrow="Comprehensive overview of district status and resources" title={`${district.name} District, ${district.state}`}>
      <div className="mb-6">
         <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline" onClick={() => router.push('/districts')}>
          <ArrowLeft size={14} /> Back to All Districts
        </button>
      </div>

      {/* District Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Area" value={district.area_sq_km ? `${parseFloat(district.area_sq_km).toLocaleString()} km²` : 'Unavailable'} sub={district.code || district.state} icon={<MapPin className="text-blue-500" />} />
        <StatCard label="Population" value={formatPopulation(district.population)} sub="Recorded population" icon={<Activity className="text-gray-500" />} />
        <StatCard label="Active Alerts" value={String(intelligence.active_alerts.total)} sub={`${intelligence.active_alerts.critical} Critical • ${intelligence.active_alerts.high} High`} icon={<Bell className="text-orange-500" />} />
        <StatCard label="Sensors Online" value={`${intelligence.sensors.online} / ${intelligence.sensors.total}`} sub={`${intelligence.sensors.operational_percentage}% Operational`} icon={<Shield className="text-green-500" />} />
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">District Risk</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${risk >= 70 ? 'bg-red-100 text-red-600' : risk >= 40 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              {intelligence.overall_risk.severity}
            </span>
          </div>
          <div className="flex items-end gap-2 mt-4">
             <h4 className={`text-3xl font-black ${risk >= 70 ? 'text-red-600' : 'text-[#0f172a]'}`}>{risk.toFixed(0)}%</h4>
             {intelligence.overall_risk.change !== null && intelligence.overall_risk.change !== 0 && (
               <div className={`flex items-center gap-1 text-[10px] font-bold mb-1 ${isRising ? 'text-red-500' : 'text-green-600'}`}>
                  {isRising ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(intelligence.overall_risk.change)}%
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Map & Risk Analysis */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">District Overview Map</h3>
            </div>
            <div className="h-[400px] bg-blue-50 relative">
               <LiveMap entities={[]} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Risk Breakdown</h3>
                <div className="space-y-5">
                   <RiskIndicator label="Flood" value={parseFloat(intelligence.risk_breakdown.flood) || 0} color="bg-red-600" />
                   <RiskIndicator label="Heat" value={parseFloat(intelligence.risk_breakdown.heat) || 0} color="bg-orange-500" />
                   <RiskIndicator label="Fire" value={parseFloat(intelligence.risk_breakdown.fire) || 0} color="bg-yellow-500" />
                   <RiskIndicator label="Lightning" value={parseFloat(intelligence.risk_breakdown.lightning) || 0} color="bg-purple-500" />
                   <RiskIndicator label="Pollution" value={parseFloat(intelligence.risk_breakdown.pollution) || 0} color="bg-gray-500" />
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Recent Active Alerts</h3>
                {intelligence.active_alerts.recent.length === 0 ? (
                  <p className="text-xs font-bold text-gray-400">No active alerts.</p>
                ) : (
                  <div className="space-y-4">
                     {intelligence.active_alerts.recent.map((alert) => (
                       <MiniAlert key={alert.id} title={alert.title} loc={alert.location} time={new Date(alert.issued_at).toLocaleString()} type={alert.severity} />
                     ))}
                  </div>
                )}
                <button onClick={() => router.push('/alerts')} className="w-full mt-6 py-2 text-[10px] font-black text-blue-600 uppercase border border-blue-50 rounded-lg hover:bg-blue-50">View All Alerts</button>
             </div>
          </div>
        </div>

        {/* Right: Weather & Insight */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Latest Weather Observation</h3>
            </div>

            {!intelligence.weather ? (
              <p className="text-xs font-bold text-gray-400">No weather observations available yet.</p>
            ) : (
              <>
                <div className="flex items-center gap-6 mb-8">
                   <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                      <Cloud size={32} />
                   </div>
                   <div>
                      <h4 className="text-4xl font-black text-[#0f172a]">
                        {intelligence.weather.temperature_celsius != null ? `${intelligence.weather.temperature_celsius}°C` : '—'}
                      </h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {intelligence.weather.condition || 'Unknown'} • Humidity: {intelligence.weather.humidity_percent ?? '—'}%
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <WeatherMetric label="Precipitation" value={intelligence.weather.precipitation_mm != null ? `${intelligence.weather.precipitation_mm} mm` : 'Unavailable'} icon={<Droplets size={14} />} />
                   <WeatherMetric label="Wind Speed" value={intelligence.weather.wind_speed_kmh != null ? `${intelligence.weather.wind_speed_kmh} km/h` : 'Unavailable'} icon={<Wind size={14} />} />
                   <WeatherMetric label="Source" value={intelligence.weather.source || 'Unavailable'} icon={<Gauge size={14} />} />
                   <WeatherMetric label="Observed" value={intelligence.weather.observation_time ? new Date(intelligence.weather.observation_time).toLocaleTimeString() : 'Unavailable'} icon={<Activity size={14} />} />
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Recent Incidents</h3>
            {intelligence.incidents.recent.length === 0 ? (
              <p className="text-xs font-bold text-gray-400">No open incidents.</p>
            ) : (
              <div className="space-y-4">
                {intelligence.incidents.recent.map((incident) => (
                  <MiniAlert key={incident.id} title={incident.title} loc={incident.location} time={new Date(incident.reported_at).toLocaleString()} type={incident.severity} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Info size={18} />
              </div>
              <h3 className="font-black text-xs uppercase tracking-wider">AI System Insight</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed">
              {district.ai_risk_insight || 'No AI-generated insight is available for this district yet.'}
            </p>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
          {icon}
        </div>
      </div>
      <h4 className="text-xl font-black text-[#0f172a] mb-1">{value}</h4>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function RiskIndicator({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
        <span className="text-gray-500">{label}</span>
        <span className="text-[#0f172a]">{value.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function MiniAlert({ title, loc, time, type }: { title: string; loc: string; time: string; type: string }) {
  const color = type === 'CRITICAL' ? 'bg-red-600' : type === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500';
  return (
    <div className="flex items-center gap-3 group">
      <div className={`w-1 h-8 rounded-full ${color} shrink-0`}></div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-black text-[#0f172a] truncate">{title}</h5>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{loc} • {time}</p>
      </div>
      <ChevronRight size={14} className="text-gray-300" />
    </div>
  );
}

function WeatherMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-1 text-blue-600">
        {icon}
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-black text-[#0f172a]">{value}</p>
    </div>
  );
}
