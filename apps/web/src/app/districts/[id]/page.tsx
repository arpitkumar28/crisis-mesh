'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, MapPin, Activity, AlertTriangle, Bell,
  Cloud, Droplets, Wind, Gauge, Info, ChevronRight,
  TrendingUp, TrendingDown, Shield, Home, Phone,
  Building, CheckCircle2, Factory, Thermometer
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black">Loading District Map...</div>
});

export default function DistrictDetailPage() {
  const params = useParams();
  const router = useRouter();
  const districtName = "Jaipur District, Rajasthan";
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <OperationsShell eyebrow="Comprehensive overview of district status and resources" title={districtName}>
      <div className="mb-6">
         <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Back to All Districts
        </button>
      </div>

      {/* District Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Area" value="11,117 km²" sub="Jaipur Division" icon={<MapPin className="text-blue-500" />} />
        <StatCard label="Population" value="6.98 Lakh" sub="Active Residents" icon={<Activity className="text-gray-500" />} />
        <StatCard label="Active Alerts" value="7" sub="2 Critical • 5 High" icon={<Bell className="text-orange-500" />} />
        <StatCard label="Sensors Online" value="67 / 74" sub="90% Operational" icon={<Shield className="text-green-500" />} />
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">District Risk</span>
            <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded">High Risk</span>
          </div>
          <div className="flex items-end gap-2 mt-4">
             <h4 className="text-3xl font-black text-red-600">87%</h4>
             <div className="flex items-center gap-1 text-red-500 text-[10px] font-bold mb-1">
                <TrendingUp size={12} /> 12% in 24h
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Map & Risk Analysis */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">District Risk Heatmap</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase">Risk View</button>
                <button className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-[10px] font-black uppercase">Sensor View</button>
              </div>
            </div>
            <div className="h-[400px] bg-blue-50 relative">
               <LiveMap entities={[]} />
               <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-xl max-w-[180px]">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Risk Legend</p>
                 <div className="space-y-2">
                    <LegendItem color="bg-red-600" label="Extreme Risk" />
                    <LegendItem color="bg-orange-500" label="High Risk" />
                    <LegendItem color="bg-yellow-400" label="Moderate Risk" />
                    <LegendItem color="bg-green-500" label="Low / Safe" />
                 </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Key Risk Indicators</h3>
                <div className="space-y-5">
                   <RiskIndicator label="Flood Probability" value={92} color="bg-red-600" />
                   <RiskIndicator label="Power Failure" value={65} color="bg-orange-500" />
                   <RiskIndicator label="Road Access" value={45} color="bg-yellow-500" />
                   <RiskIndicator label="Communications" value={15} color="bg-green-500" />
                </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Recent Alerts</h3>
                <div className="space-y-4">
                   <MiniAlert title="Water Level Critical" loc="Malviya Nagar" time="2 min ago" type="CRITICAL" />
                   <MiniAlert title="Heavy Rainfall warning" loc="City Center" time="15 min ago" type="HIGH" />
                   <MiniAlert title="Power Outage" loc="Vaishali Nagar" time="32 min ago" type="MEDIUM" />
                   <MiniAlert title="Road Closure" loc="Sanganer" time="1h ago" type="MEDIUM" />
                </div>
                <button className="w-full mt-6 py-2 text-[10px] font-black text-blue-600 uppercase border border-blue-50 rounded-lg hover:bg-blue-50">View District Alerts</button>
             </div>
          </div>
        </div>

        {/* Right: Weather & Resources */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Current Weather</h3>
              <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500"></div> LIVE
              </span>
            </div>

            <div className="flex items-center gap-6 mb-8">
               <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <Cloud size={32} />
               </div>
               <div>
                  <h4 className="text-4xl font-black text-[#0f172a]">28.6°C</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Light Rain • Humidity: 72%</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <WeatherMetric label="Precipitation" value="12.4 mm" icon={<Droplets size={14} />} />
               <WeatherMetric label="Wind Speed" value="18 km/h" icon={<Wind size={14} />} />
               <WeatherMetric label="Air Quality" value="45 AQI" icon={<Activity size={14} />} />
               <WeatherMetric label="Pressure" value="1013 hPa" icon={<Gauge size={14} />} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Emergency Resources</h3>
            <div className="grid grid-cols-2 gap-4">
               <ResourceMini label="Hospitals" value={14} icon={<Building size={16} />} />
               <ResourceMini label="Shelters" value={56} icon={<Home size={16} />} />
               <ResourceMini label="Police" value={22} icon={<Shield size={16} />} />
               <ResourceMini label="Fire" value={8} icon={<Activity size={16} />} />
            </div>
            <div className="mt-6 p-4 bg-blue-600 rounded-2xl text-white text-center">
               <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">24/7 Helpline</p>
               <h5 className="text-xl font-black">0141-2456000</h5>
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Info size={18} />
              </div>
              <h3 className="font-black text-xs uppercase tracking-wider">AI System Insight</h3>
            </div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-4">
              Flood probability in Jaipur South has increased by 15% due to continuous precipitation.
              Recommend pre-positioning NDRF units in Sanganer and Malviya Nagar sectors.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
              Read Analysis Report
            </button>
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

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-[10px] font-bold text-gray-600">{label}</span>
    </div>
  );
}

function RiskIndicator({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
        <span className="text-gray-500">{label}</span>
        <span className="text-[#0f172a]">{value}%</span>
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
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className={`w-1 h-8 rounded-full ${color} shrink-0`}></div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-black text-[#0f172a] group-hover:text-blue-600 transition-colors truncate">{title}</h5>
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

function ResourceMini({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
        {icon}
      </div>
      <div>
        <h5 className="text-sm font-black text-[#0f172a]">{value}</h5>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
