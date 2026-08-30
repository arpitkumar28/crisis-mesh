'use client';

import React from 'react';
import {
  Calendar, ChevronDown, RefreshCcw
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const trendData = [
  { time: '08:00', level: 2.1 },
  { time: '09:00', level: 2.3 },
  { time: '10:00', level: 2.5 },
  { time: '11:00', level: 2.4 },
  { time: '12:00', level: 2.8 },
  { time: '13:00', level: 3.1 },
  { time: '14:00', level: 3.4 },
  { time: '15:00', level: 3.2 },
  { time: '16:00', level: 2.9 },
  { time: '17:00', level: 2.7 },
  { time: '18:00', level: 2.5 },
  { time: '19:00', level: 2.2 },
];

const readings = [
  { id: 'RD-025', sensor: 'WL-023', location: 'Malviya Nagar', value: '3.42 m', status: 'Normal', time: '25 Aug 2026, 02:00 PM' },
  { id: 'RD-024', sensor: 'WL-023', location: 'Malviya Nagar', value: '3.21 m', status: 'Normal', time: '25 Aug 2026, 01:00 PM' },
  { id: 'RD-023', sensor: 'WL-023', location: 'Malviya Nagar', value: '2.95 m', status: 'Normal', time: '25 Aug 2026, 12:00 PM' },
  { id: 'RD-022', sensor: 'WL-023', location: 'Malviya Nagar', value: '2.72 m', status: 'Normal', time: '25 Aug 2026, 11:00 AM' },
];

export default function DataHistoryPage() {
  return (
    <OperationsShell eyebrow="Historical data analysis and trends" title="Data History & Trends">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="Node Level" />
          <FilterSelect label="All Sensors" />
          <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-[#0f172a]">
            <Calendar size={14} className="text-gray-400" /> 19 Aug 2026 - 25 Aug 2026 <ChevronDown size={14} className="text-gray-400" />
          </button>
          <FilterSelect label="1 Hour" />
        </div>
        <button className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">
          <RefreshCcw size={14} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Chart Section */}
        <div className="col-span-12 xl:col-span-9 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Water Level Trend</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Meter (m) vs Time</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">Export Data</button>
              </div>
            </div>

            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="level" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Readings Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Readings</h3>
              <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Download CSV</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Sensor ID</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {readings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-[11px] font-bold text-gray-500">{reading.time}</td>
                    <td className="px-6 py-4 text-[11px] font-black text-[#0f172a]">{reading.sensor}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-gray-500">{reading.location}</td>
                    <td className="px-6 py-4 text-[11px] font-black text-blue-600">{reading.value}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[9px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase">{reading.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Summary</h3>
            <div className="space-y-6">
              <SummaryItem label="Average" value="2.62 m" />
              <SummaryItem label="Maximum" value="3.42 m" />
              <SummaryItem label="Minimum" value="2.10 m" />
              <SummaryItem label="Total Readings" value="168" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Data Quality</h3>
            <div className="flex flex-col items-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="5.1" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#0f172a]">98.6%</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Valid</span>
                    <span className="text-green-500">98.6%</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Missing</span>
                    <span className="text-orange-500">1.2%</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Outlier</span>
                    <span className="text-red-500">0.2%</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
        <option>{label}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-[#0f172a]">{value}</span>
    </div>
  );
}
