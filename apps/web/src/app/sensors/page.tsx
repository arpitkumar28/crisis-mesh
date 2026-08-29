'use client';

import React from 'react';
import {
  Radio, Bell, Clock, Database, Battery, Map as MapIcon,
  AlertTriangle, Activity, Zap, Droplets, Wind,
  Thermometer, MoreHorizontal, ArrowUpRight,
  Filter, Download, ChevronDown, Plus, Search,
  Cloud, Waves, Gauge
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LineChart, Line
} from 'recharts';

const aqData = [
  { time: '08 Aug', aqi: 45 },
  { time: '12 Aug', aqi: 52 },
  { time: '16 Aug', aqi: 48 },
  { time: '20 Aug', aqi: 85 },
  { time: '24 Aug', aqi: 65 },
];

const stationPerformance = [
  { name: 'Malviya Nagar', pm25: 78, status: 'Moderate' },
  { name: 'Vaishali Nagar', pm25: 42, status: 'Good' },
  { name: 'Bani Park', pm25: 62, status: 'Moderate' },
  { name: 'Sanganer', pm25: 35, status: 'Good' },
  { name: 'Dausa Road', pm25: 48, status: 'Good' },
];

export default function EnvironmentalMonitoring() {
  return (
    <OperationsShell eyebrow="Air quality, rainfall, river & weather sensors" title="Environmental Monitoring">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <TabButton label="Air Quality" active />
          <TabButton label="Rainfall" />
          <TabButton label="River Levels" />
          <TabButton label="Weather" />
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</p>
              <button className="flex items-center gap-2 text-xs font-black text-[#0f172a]">Jaipur <ChevronDown size={12} /></button>
           </div>
           <div className="h-8 w-px bg-gray-200 mx-2"></div>
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Updated</p>
              <p className="text-xs font-black text-[#0f172a]">10:45 AM</p>
           </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Metrics & Chart */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Air Quality Index (AQI)</h3>

            <div className="grid grid-cols-5 gap-4 mb-10">
               <AQIMetric label="AQI" value="68" status="Moderate" color="text-yellow-600" bg="bg-yellow-50" sub="PM2.5: 24 µg/m³" />
               <EnvMetric label="PM2.5" value="28" unit="µg/m³" status="Moderate" color="text-yellow-600" />
               <EnvMetric label="PM10" value="52" unit="µg/m³" status="Good" color="text-green-600" />
               <EnvMetric label="NO2" value="16" unit="ppb" status="Good" color="text-green-600" />
               <EnvMetric label="SO2" value="8" unit="ppb" status="Good" color="text-green-600" />
               <EnvMetric label="CO" value="0.6" unit="mg/m³" status="Good" color="text-green-600" />
            </div>

            <div>
               <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">AQI Trend (Last 7 Days)</h4>
                  <div className="flex items-center gap-4 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Overall AQI</div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-200"></div> Avg (Weekly)</div>
                  </div>
               </div>
               <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={aqData}>
                        <defs>
                           <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                        <Tooltip />
                        <Area type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#aqiGrad)" />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Weather Snapshot</h3>
             <div className="grid grid-cols-4 gap-8">
                <WeatherDetail icon={<Thermometer size={20} />} label="Temperature" value="28°C" sub="Feels like 31°C" />
                <WeatherDetail icon={<Droplets size={20} />} label="Humidity" value="74%" sub="Stable" />
                <WeatherDetail icon={<Wind size={20} />} label="Wind Speed" value="12 km/h" sub="North-East" />
                <WeatherDetail icon={<Gauge size={20} />} label="Air Pressure" value="1013 hPa" sub="Normal" />
             </div>
          </div>
        </div>

        {/* Right Column: Station Monitoring */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Monitoring Stations</h3>
                 <button className="text-[9px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="space-y-6">
                 {stationPerformance.map((station, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase">{station.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Primary Station</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-[#0f172a]">{station.pm25}</p>
                          <span className={`text-[8px] font-black uppercase ${station.status === 'Good' ? 'text-green-500' : 'text-yellow-600'}`}>{station.status}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[40px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <AlertTriangle size={20} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Environmental Alert</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Pollutant levels in Malviya Nagar are approaching high threshold. Sensitive groups are advised to limit outdoor activity.
              </p>
              <button className="w-full py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                 Generate Station Report
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function TabButton({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${
      active ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'
    }`}>
      {label}
    </button>
  );
}

function AQIMetric({ label, value, status, color, bg, sub }: { label: string; value: string; status: string; color: string; bg: string; sub: string }) {
  return (
    <div className={`${bg} p-4 rounded-2xl border border-gray-100`}>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <h4 className={`text-3xl font-black ${color}`}>{value}</h4>
       <p className={`text-[9px] font-black uppercase mt-1 ${color}`}>{status}</p>
       <p className="text-[8px] font-bold text-gray-400 mt-2">{sub}</p>
    </div>
  );
}

function EnvMetric({ label, value, unit, status, color }: { label: string; value: string; unit: string; status: string; color: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-baseline gap-1">
          <h4 className="text-xl font-black text-[#0f172a]">{value}</h4>
          <span className="text-[8px] font-bold text-gray-400">{unit}</span>
       </div>
       <p className={`text-[8px] font-black uppercase mt-2 ${color}`}>{status}</p>
    </div>
  );
}

function WeatherDetail({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
       <div className="text-blue-500">{icon}</div>
       <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-lg font-black text-[#0f172a]">{value}</p>
          <p className="text-[8px] font-bold text-gray-400 uppercase">{sub}</p>
       </div>
    </div>
  );
}
