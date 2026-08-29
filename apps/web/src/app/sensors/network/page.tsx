'use client';

import React, { useState } from 'react';
import { 
  Radio, Map as MapIcon, List, Search, Filter, Plus, 
  ChevronRight, ArrowUpRight, Droplets, Cloud, 
  Wind, Thermometer, Activity, Zap, CheckCircle2,
  AlertTriangle, Clock, Settings, Maximize2, MoreHorizontal
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20">Loading Network Map...</div> 
});

export default function SensorNetworkPage() {
  return (
    <OperationsShell eyebrow="Manage and monitor the complete sensor network" title="Sensor Network">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Districts</option>
              <option>Jaipur</option>
              <option>Jodhpur</option>
            </select>
            <ChevronDownIcon />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Types</option>
              <option>Water Level</option>
              <option>Rainfall</option>
            </select>
            <ChevronDownIcon />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Status: All</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <ChevronDownIcon />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Add Sensor
          </button>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-white text-blue-600 shadow-sm">Map View</button>
           <button className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest text-gray-400">Grid View</button>
        </div>
      </div>

      {/* Stats Mini Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sensors</p>
            <h4 className="text-xl font-black text-[#0f172a]">74</h4>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Online</p>
            <h4 className="text-xl font-black text-green-600">67</h4>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Offline</p>
            <h4 className="text-xl font-black text-red-600">4</h4>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Maintenance</p>
            <h4 className="text-xl font-black text-orange-500">3</h4>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[600px]">
        {/* Left: Map */}
        <div className="col-span-12 lg:col-span-8 bg-blue-50 rounded-2xl border border-gray-200 overflow-hidden relative shadow-sm">
           <LiveMap entities={[]} />
           
           <div className="absolute top-4 left-4 z-10">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-1 flex flex-col gap-1">
                 <button className="p-2 hover:bg-gray-100 rounded-lg text-[#0f172a]"><Plus size={16} /></button>
                 <button className="p-2 hover:bg-gray-100 rounded-lg text-[#0f172a]"><div className="w-4 h-0.5 bg-current"></div></button>
              </div>
           </div>

           <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
              <button className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-[#0f172a]"><Maximize2 size={20} /></button>
              <button className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"><MapIcon size={20} /></button>
           </div>
        </div>

        {/* Right: Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto pr-2 no-scrollbar">
           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Sensors by Type</h3>
              <div className="space-y-4">
                 <TypeRow icon={<Droplets size={14} />} label="Water Level" count={22} online={20} health={91} />
                 <TypeRow icon={<Cloud size={14} />} label="Rainfall" count={18} online={16} health={89} />
                 <TypeRow icon={<Wind size={14} />} label="Air Quality" count={12} online={11} health={92} />
                 <TypeRow icon={<Thermometer size={14} />} label="Temperature" count={10} online={9} health={90} />
                 <TypeRow icon={<Activity size={14} />} label="Soil Moisture" count={6} online={5} health={83} color="bg-orange-500" />
                 <TypeRow icon={<Zap size={14} />} label="Wind Speed" count={6} online={6} health={100} />
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Network Health</h3>
                 <span className="text-[10px] font-black text-green-600 uppercase">98% Healthy</span>
              </div>
              <div className="space-y-4">
                 <HealthBar label="Network Health" value={98} color="bg-green-500" />
                 <HealthBar label="Data Delivery" value={99} color="bg-blue-500" />
                 <HealthBar label="Avg Response" value={12} total={60} sub="sec" color="bg-green-500" />
                 <HealthBar label="Packet Loss" value={0.2} total={10} sub="%" color="bg-green-500" />
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-100 transition-all uppercase tracking-widest">
                       <Activity size={14} className="text-blue-600" /> Test Sync
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-100 transition-all uppercase tracking-widest">
                       <Clock size={14} className="text-blue-600" /> Latency
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function TypeRow({ icon, label, count, online, health, color = "bg-green-500" }: { icon: React.ReactNode; label: string; count: number; online: number; health: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600 border border-gray-100">
          {icon}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
             <span className="text-[10px] font-black text-[#0f172a] uppercase truncate">{label}</span>
             <span className="text-[9px] font-bold text-gray-400 uppercase">{online}/{count} <span className="mx-1">•</span> {health}%</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className={`h-full ${color}`} style={{ width: `${health}%` }}></div>
          </div>
       </div>
    </div>
  );
}

function HealthBar({ label, value, total = 100, sub = "%", color }: { label: string; value: number; total?: number; sub?: string; color: string }) {
  const percent = (value / total) * 100;
  return (
    <div>
       <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          <span>{label}</span>
          <span className="text-[#0f172a]">{value}{sub}</span>
       </div>
       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
       </div>
    </div>
  );
}

function ChevronDownIcon() {
  return <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={14} />;
}
