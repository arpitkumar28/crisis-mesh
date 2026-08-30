'use client';

import React from 'react';
import { 
  Zap, Wifi, Signal, Activity, Search, 
  AlertTriangle, Radio, RefreshCw
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';

const powerGridData = [
  { status: 'Operational', count: 42, color: '#10b981' },
  { status: 'Maintenance', count: 8, color: '#f59e0b' },
  { status: 'Critical', count: 2, color: '#ef4444' },
];

const outageData = [
  { location: 'Chaksu', affected: 2, time: '25 Aug, 08:30 AM', eta: '25 Aug, 12:00 PM' },
  { location: 'Kotputli', affected: 1, time: '25 Aug, 09:15 AM', eta: '25 Aug, 01:00 PM' },
];

const networkStability = [
  { time: '10 AM', value: 98 },
  { time: '11 AM', value: 99 },
  { time: '12 PM', value: 97 },
  { time: '01 PM', value: 94 },
  { time: '02 PM', value: 96 },
  { time: '03 PM', value: 98 },
];

export default function PowerConnectivityStatus() {
  return (
    <OperationsShell eyebrow="Monitor power supply and communication networks" title="Power & Connectivity Status">
      {/* Top Search Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search location, asset..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        <StatusCard label="Power Supply" value="Normal" detail="99.2% Uptime" icon={<Zap className="text-green-500" />} />
        <StatusCard label="Grid Load" value="Good" detail="58.4% Capacity" icon={<Activity className="text-blue-500" />} />
        <StatusCard label="Internet Connectivity" value="Good" detail="94.6% Availability" icon={<Wifi className="text-green-500" />} />
        <StatusCard label="Radio Network" value="Operational" detail="100% Availability" icon={<Radio className="text-green-500" />} />
        <StatusCard label="Satcom Link" value="Good" detail="100% Availability" icon={<Signal className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Power Grid & Outages */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Power Grid Status</h3>
              
              <div className="flex items-center justify-center mb-8 relative">
                 <div className="h-48 w-48">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={powerGridData}
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="count"
                          >
                             {powerGridData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-black text-[#0f172a]">99.2%</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase">Grid Health</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <GridStatusItem label="Operational" count={42} color="text-green-500" dot="bg-green-500" />
                 <GridStatusItem label="Maintenance" count={8} color="text-orange-500" dot="bg-orange-500" />
                 <GridStatusItem label="Critical" count={2} color="text-red-500" dot="bg-red-500" />
                 <div className="pt-4 mt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase">
                    <span>Total Units: 52</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Active Power Outages</h3>
                 <button className="text-[9px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="space-y-6">
                 {outageData.map((outage, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase mb-1">{outage.location}</p>
                          <p className="text-[9px] font-bold text-gray-400">{outage.affected} Affected Sites</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Since</p>
                          <p className="text-[10px] font-black text-[#0f172a]">{outage.time}</p>
                       </div>
                    </div>
                 ))}
                 <div className="pt-4 flex justify-center">
                    <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">View AI Outage Prediction &rarr;</button>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column: Network Status & Analysis */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Network Status (Live)</h3>
              <div className="grid grid-cols-4 gap-6 mb-10">
                 <NetworkItem label="4G / LTE" status="Good" color="text-green-500" />
                 <NetworkItem label="Mesh (LoRa)" status="Good" color="text-green-500" />
                 <NetworkItem label="Fiber" status="Operational" color="text-green-500" />
                 <NetworkItem label="VHF Radio" status="Operational" color="text-green-500" />
              </div>
              
              <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-6">Network Stability Trend</h4>
              <div className="h-[280px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={networkStability}>
                       <defs>
                          <linearGradient id="stabilityGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                       <YAxis hide />
                       <Tooltip />
                       <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#stabilityGrad)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-6">Recent Connectivity Alerts</h3>
                 <div className="space-y-4">
                    <ConnectivityAlert type="Critical" msg="BSNL Network down in Dausa area." time="25 Aug, 09:30 AM" />
                    <ConnectivityAlert type="Warning" msg="Intermittent connectivity in Sanganer." time="25 Aug, 09:15 AM" />
                    <ConnectivityAlert type="Info" msg="Power fluctuation reported in Jhalana Dungri." time="25 Aug, 08:45 AM" />
                 </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Quick Actions</h3>
                 <div className="grid grid-cols-1 gap-3">
                    <ActionButton icon={<RefreshCw size={16} />} label="Force Re-Scan All Sites" />
                    <ActionButton icon={<Activity size={16} />} label="Run Diagnostics" />
                    <ActionButton icon={<AlertTriangle size={16} />} label="Report Outage" />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function StatusCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <h4 className="text-xl font-black text-[#0f172a] uppercase leading-tight mb-1">{value}</h4>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{detail}</p>
      <div className="mt-4 flex justify-end">
         <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
      </div>
    </div>
  );
}

function GridStatusItem({ label, count, color, dot }: { label: string; count: number; color: string; dot: string }) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${dot}`}></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
       </div>
       <span className={`text-[10px] font-black ${color}`}>{count}</span>
    </div>
  );
}

function NetworkItem({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <div>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`}></div>
          <span className={`text-xs font-black uppercase ${color}`}>{status}</span>
       </div>
    </div>
  );
}

function ConnectivityAlert({ type, msg, time }: { type: 'Critical' | 'Warning' | 'Info'; msg: string; time: string }) {
  const color = type === 'Critical' ? 'text-red-500 bg-red-50' : type === 'Warning' ? 'text-orange-500 bg-orange-50' : 'text-blue-500 bg-blue-50';
  return (
    <div className="flex gap-4">
       <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${color.replace('text-', 'bg-').split(' ')[0]}`}></div>
       <div>
          <p className="text-[10px] font-bold text-[#0f172a]">{msg}</p>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[8px] font-black uppercase text-gray-400">{time}</span>
             <span className={`text-[7px] font-black uppercase px-1 rounded ${color}`}>{type}</span>
          </div>
       </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-all group w-full">
       <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-[9px] font-black text-[#0f172a] uppercase tracking-widest">{label}</span>
    </button>
  );
}
