'use client';

import React, { useState } from 'react';
import {
  ChevronDown, MapPin,
  Droplets, Thermometer, Cloud, Battery, Signal,
  CheckCircle2, AlertTriangle, Info, Clock, ExternalLink,
  Radio
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const trendData = [
  { time: '02:00 PM', value: 1.5 },
  { time: '04:00 PM', value: 1.8 },
  { time: '06:00 PM', value: 1.4 },
  { time: '08:00 PM', value: 2.1 },
  { time: '10:00 PM', value: 2.5 },
  { time: '12:00 AM', value: 2.0 },
  { time: '02:00 AM', value: 2.2 },
  { time: '04:00 AM', value: 2.8 },
  { time: '06:00 AM', value: 2.4 },
  { time: '08:00 AM', value: 1.9 },
  { time: '10:00 AM', value: 2.3 },
  { time: '12:00 PM', value: 2.48 },
];

const ingestionData = [
  { time: '02 PM', value: 800 },
  { time: '04 PM', value: 950 },
  { time: '06 PM', value: 1100 },
  { time: '08 PM', value: 850 },
  { time: '10 PM', value: 1200 },
  { time: '12 AM', value: 1050 },
  { time: '02 AM', value: 900 },
  { time: '04 AM', value: 1150 },
  { time: '06 AM', value: 1248 },
  { time: '08 AM', value: 1100 },
  { time: '10 AM', value: 950 },
  { time: '12 PM', value: 1000 },
];

export default function SensorDetailsPage() {
  const [activeTab, setActiveTab] = useState('Live Readings');

  return (
    <OperationsShell eyebrow="Water Level Sensor • WL-023" title="Sensor Details">
      {/* Header Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <Droplets className="text-blue-600" size={32} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-[#0f172a]">WL-023</h2>
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase tracking-widest">Water Level Sensor</span>
              <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">Malviya Nagar, Jaipur, Rajasthan</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-5">
                  Gateway: GW-07 • Node ID: N-045
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sensor Status</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-green-600">Online</span>
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Since 02:15 PM</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Battery Level</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0f172a]">78%</span>
                    <Battery size={16} className="text-green-500" />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Charging</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signal Strength</p>
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="text-sm font-black">-56 dBm</span>
                    <Signal size={16} />
                  </div>
                  <p className="text-[9px] text-green-600 font-bold uppercase mt-0.5 tracking-widest">Excellent</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Uptime</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0f172a]">99.2%</span>
                    <Clock size={16} className="text-blue-500" />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Last 7 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-6 border-b border-gray-200">
        {['Live Readings', 'Historical Data', 'Alerts', 'Location', 'Configuration', 'Maintenance', 'Logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Current Readings */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">Current Readings</h3>
              <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-green-500"></div> Live Data
              </span>
            </div>

            <div className="space-y-4">
              <ReadingRow icon={<Droplets size={16} />} label="Water Level" value="2.48 m" />
              <ReadingRow icon={<Thermometer size={16} />} label="Temperature" value="28.6 °C" />
              <ReadingRow icon={<Cloud size={16} />} label="Humidity" value="72 %" />
              <ReadingRow icon={<Battery size={16} />} label="Battery" value="78 %" />
              <ReadingRow icon={<Signal size={16} />} label="Signal Strength" value="-56 dBm" />
              <ReadingRow icon={<CheckCircle2 size={16} />} label="Status" value="Operational" valueColor="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">Recent Alerts (2)</h3>
              <a href="#" className="text-[10px] font-black text-blue-600 uppercase">View All →</a>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-600" />
                  <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Critical</span>
                </div>
                <p className="text-[11px] font-bold text-[#0f172a]">Water level critical threshold exceeded</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] text-gray-500">25 Aug 2026, 02:15 PM</span>
                  <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Active</span>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-orange-600" />
                  <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">High</span>
                </div>
                <p className="text-[11px] font-bold text-[#0f172a]">Water level rising quickly</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] text-gray-500">25 Aug 2026, 12:05 PM</span>
                  <span className="bg-orange-500/20 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Resolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Trends & Analytics */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">Water Level Trend <span className="text-xs text-gray-400 font-medium lowercase">(Last 24 Hours)</span></h3>
              <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700">
                24 Hours <ChevronDown size={14} />
              </button>
            </div>

            <div className="h-[250px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <TrendStat label="Minimum" value="0.82 m" time="02:15 AM" />
              <TrendStat label="Average" value="1.96 m" time="Last 24 Hours" />
              <TrendStat label="Maximum" value="2.78 m" time="01:45 PM" />
              <TrendStat label="Trend" value="Rising" time="+0.65 m" valueColor="text-green-600" icon={<TrendingUpIcon />} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">Data Ingestion</h3>
              <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700">
                Last 24 Hours <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex gap-8">
              <div className="w-1/3 space-y-6">
                <div>
                  <h4 className="text-2xl font-black text-[#0f172a]">1,248</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Data Points Received</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-green-600">99.1%</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Success Rate</p>
                </div>
              </div>

              <div className="flex-1 h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingestionData}>
                    <Bar dataKey="value" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Map & Info */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Sensor Location</h3>
              <a href="#" className="text-[10px] font-black text-blue-600 uppercase">View on Map →</a>
            </div>
            <div className="h-[200px] bg-blue-50 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-600/30 animate-ping"></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-xs font-black text-[#0f172a]">Malviya Nagar, Jaipur, Rajasthan</h4>
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Lat: 26.8654° N, Long: 75.7940° E</p>
              <p className="text-[10px] text-gray-500 font-medium">Elevation: 432 m</p>
              <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#0f172a] flex items-center justify-center gap-2 hover:bg-gray-50">
                <ExternalLink size={12} /> Get Directions
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Sensor Information</h3>
            <div className="space-y-4">
              <InfoRow label="Sensor Type" value="Water Level Sensor" />
              <InfoRow label="Manufacturer" value="CrisisMesh IoT" />
              <InfoRow label="Model" value="CM-WL-200" />
              <InfoRow label="Firmware Version" value="v2.1.4" />
              <InfoRow label="Installed On" value="10 Aug 2026" />
              <InfoRow label="Last Maintenance" value="22 Aug 2026" />
              <InfoRow label="Next Maintenance" value="22 Sep 2026" />
            </div>

            <div className="mt-6 p-4 border border-gray-100 rounded-xl flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-[120px]">
                <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Radio size={48} className="text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-[10px] font-bold text-blue-800">
        <Info size={14} className="shrink-0" />
        <p>This sensor is part of CrisisMesh distributed mesh network. Data is encrypted and transmitted securely.</p>
        <div className="ml-auto text-blue-400 flex items-center gap-4">
          <span>Sensor ID: WL-023-045</span>
          <span>Added on: 10 Aug 2026, 11:35 AM</span>
        </div>
      </div>
    </OperationsShell>
  );
}

function ReadingRow({ icon, label, value, valueColor = "text-[#0f172a]" }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-500 border border-gray-100">
        {icon}
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-500">{label}</span>
        <span className={`text-xs font-black ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
}

function TrendStat({ label, value, time, valueColor = "text-[#0f172a]", icon }: { label: string; value: string; time: string; valueColor?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-black ${valueColor}`}>{value}</span>
        {icon}
      </div>
      <p className="text-[9px] font-bold text-gray-400 mt-0.5">{time}</p>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-black text-[#0f172a]">{value}</span>
    </div>
  );
}
