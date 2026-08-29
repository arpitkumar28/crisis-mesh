'use client';

import React from 'react';
import {
  Cloud, CloudRain, Droplets, Wind, Gauge,
  Sun, CloudLightning, Activity,
  ChevronRight, MapPin, RefreshCw,
  Bell, Info, AlertTriangle, Thermometer
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

const rainfallData = [
  { time: '12 AM', value: 2 },
  { time: '2 AM', value: 5 },
  { time: '4 AM', value: 8 },
  { time: '6 AM', value: 15 },
  { time: '8 AM', value: 25 },
  { time: '10 AM', value: 45 },
  { time: '12 PM', value: 65 },
  { time: '2 PM', value: 85 },
  { time: '4 PM', value: 70 },
  { time: '6 PM', value: 55 },
  { time: '8 PM', value: 30 },
  { time: '10 PM', value: 15 },
];

const sevenDayForecast = [
  { day: 'Tue, 25 Aug', high: 28, low: 22, condition: 'Rainy', icon: <CloudRain size={20} /> },
  { day: 'Wed, 26 Aug', high: 30, low: 24, condition: 'Cloudy', icon: <Cloud size={20} /> },
  { day: 'Thu, 27 Aug', high: 32, low: 25, condition: 'Sunny', icon: <Sun size={20} /> },
  { day: 'Fri, 28 Aug', high: 31, low: 23, condition: 'Cloudy', icon: <Cloud size={20} /> },
  { day: 'Sat, 29 Aug', high: 29, low: 22, condition: 'Storm', icon: <CloudLightning size={20} /> },
  { day: 'Sun, 30 Aug', high: 28, low: 21, condition: 'Rainy', icon: <CloudRain size={20} /> },
  { day: 'Mon, 31 Aug', high: 30, low: 23, condition: 'Cloudy', icon: <Cloud size={20} /> },
];

export default function WeatherForecastPage() {
  return (
    <OperationsShell eyebrow="Real-time meteorological intelligence and forecasting" title="Weather & Forecast">
      {/* Top Section: Current Weather & 7-Day Forecast */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* Current Weather Card */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-[#061a37] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Current Weather</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jaipur, Rajasthan</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/5">
                      <CloudRain size={28} />
                   </div>
                </div>

                <div className="flex items-end gap-4 mb-8">
                   <h2 className="text-7xl font-black tracking-tighter">28°C</h2>
                   <div className="mb-3">
                      <p className="text-xl font-black">Light Rain</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feels like 31°C</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                   <WeatherStat label="Humidity" value="72%" />
                   <WeatherStat label="Wind Speed" value="18 km/h" />
                   <WeatherStat label="Pressure" value="1013 hPa" />
                   <WeatherStat label="Visibility" value="2.4 km" />
                </div>
              </div>
           </div>
        </div>

        {/* 7-Day Forecast Horizontal */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">7-Day Forecast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 flex-1">
                 {sevenDayForecast.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-500 transition-all cursor-pointer group">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight text-center leading-tight">{item.day}</p>
                       <div className="text-blue-600 my-4 group-hover:scale-110 transition-transform">
                          {item.icon}
                       </div>
                       <div className="text-center">
                          <p className="text-sm font-black text-[#0f172a]">{item.high}°</p>
                          <p className="text-[10px] font-bold text-gray-400">{item.low}°</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section: Rainfall Forecast & Alerts */}
      <div className="grid grid-cols-12 gap-8">
        {/* Rainfall Forecast Chart */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Rainfall Forecast <span className="text-gray-400 font-bold ml-2">(Next 12 Hours)</span></h3>
                 <div className="flex gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Rainfall (mm)</div>
                 </div>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rainfallData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                    <Tooltip
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                       {rainfallData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 50 ? '#3b82f6' : '#93c5fd'} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* Weather Alerts Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm flex-1">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Weather Alerts</h3>
              <div className="space-y-4">
                 <WeatherAlert
                   icon={<AlertTriangle size={18} className="text-red-500" />}
                   title="Heavy Rainfall Warning"
                   time="25 Aug, 02:00 PM"
                   severity="Red Alert"
                   color="bg-red-50 text-red-600"
                 />
                 <WeatherAlert
                   icon={<CloudLightning size={18} className="text-orange-500" />}
                   title="Flash Flood Watch"
                   time="25 Aug, 01:30 PM"
                   severity="Orange Alert"
                   color="bg-orange-50 text-orange-600"
                 />
                 <WeatherAlert
                   icon={<Wind size={18} className="text-blue-500" />}
                   title="Thunderstorm Alert"
                   time="25 Aug, 12:00 PM"
                   severity="Yellow Alert"
                   color="bg-yellow-50 text-yellow-600"
                 />
              </div>
              <button className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-colors">
                 View Detailed Weather Report
              </button>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Info size={16} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Meteorological Insight</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Continuous precipitation in Jaipur South is likely to saturate soil by 06:00 PM. High risk of localized flooding in low-lying residential areas.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:underline">
                 Read Full Analysis Report <ChevronRight size={14} />
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function WeatherStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}

function WeatherAlert({ icon, title, time, severity, color }: { icon: React.ReactNode; title: string; time: string; severity: string; color: string }) {
  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
       <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
          {icon}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
             <h5 className="text-[11px] font-black text-[#0f172a] uppercase truncate tracking-tight">{title}</h5>
             <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${color}`}>{severity}</span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{time}</p>
       </div>
    </div>
  );
}
