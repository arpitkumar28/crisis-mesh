'use client';

import React from 'react';
import { 
  Video, Radio, Battery, Wifi, Maximize2, 
  Navigation, Camera, Play, Square, RefreshCw,
  Plus, MoreHorizontal, MapPin, Activity, Shield
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Drone Workspace...</div> 
});

const droneStatus = [
  { label: 'Total Drones', value: '12', sub: 'In Network', icon: <Video size={20} /> },
  { label: 'In Flight', value: '3', sub: 'Active Missions', icon: <Navigation size={20} className="text-blue-500" /> },
  { label: 'Standby', value: '8', sub: 'Ready for Dispatch', icon: <RefreshCw size={20} className="text-green-500" /> },
  { label: 'Maintenance', value: '1', sub: 'Technical Service', icon: <Shield size={20} className="text-orange-500" /> },
];

const drones = [
  { id: 'DRN-001', name: 'Alpha-1 (Search)', status: 'In Flight', battery: '78%', alt: '120m', speed: '18 km/h' },
  { id: 'DRN-002', name: 'Beta-4 (Relief)', status: 'Standby', battery: '95%', alt: '0m', speed: '0 km/h' },
  { id: 'DRN-003', name: 'Gamma-2 (Mapping)', status: 'In Flight', battery: '45%', alt: '150m', speed: '22 km/h' },
];

export default function DroneSurveillancePage() {
  return (
    <OperationsShell eyebrow="Monitor real-time aerial footage from drones" title="Drone Surveillance & Live Feed">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {droneStatus.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{stat.icon}</div>
            </div>
            <h4 className="text-3xl font-black text-[#0f172a]">{stat.value}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Live Feed Area */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Live Drone Feed</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-xl text-[9px] font-black text-red-600 uppercase">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div> LIVE: DRN-001
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Maximize2 size={16} /></button>
                 </div>
              </div>

              <div className="aspect-video bg-[#0f172a] relative overflow-hidden group">
                 <img 
                   src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1200" 
                   className="w-full h-full object-cover opacity-80" 
                   alt="Drone Feed"
                 />
                 
                 {/* HUD Overlay */}
                 <div className="absolute inset-0 pointer-events-none p-8">
                    <div className="flex justify-between items-start">
                       <div className="space-y-4">
                          <HudStat label="ALT" value="120 m" />
                          <HudStat label="SPD" value="18 km/h" />
                          <HudStat label="SAT" value="14" />
                       </div>
                       <div className="text-right space-y-4">
                          <HudStat label="BAT" value="78%" color={78 < 20 ? 'text-red-500' : 'text-green-500'} />
                          <HudStat label="SIG" value="Strong" color="text-green-500" />
                       </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-full flex items-center justify-center">
                       <div className="w-4 h-4 border-2 border-blue-500/50 rounded-full"></div>
                       <div className="absolute inset-0 border-t-2 border-blue-500/50 w-full h-0 top-1/2"></div>
                       <div className="absolute inset-0 border-l-2 border-blue-500/50 h-full w-0 left-1/2"></div>
                    </div>
                 </div>

                 {/* Drone Controls */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ControlIcon icon={<Play size={16} />} />
                    <ControlIcon icon={<Square size={16} />} />
                    <ControlIcon icon={<Camera size={16} />} />
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <ControlIcon icon={<Navigation size={16} />} />
                 </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#0f172a]">
                       <Camera size={14} className="text-blue-500" /> Take Snapshot
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#0f172a]">
                       <Video size={14} className="text-red-500" /> Start Recording
                    </button>
                 </div>
                 <button className="px-6 py-2 bg-[#0f172a] text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Return to Base</button>
              </div>
           </div>
        </div>

        {/* Drone Status Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Active Drones</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">Manage All</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {drones.map(d => (
                    <div key={d.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-black text-blue-600 uppercase">#{d.id}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             d.status === 'In Flight' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>{d.status}</span>
                       </div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight mb-3">{d.name}</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                             <Battery size={12} className="text-gray-400" />
                             <span className="text-[9px] font-black text-gray-500 uppercase">{d.battery}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <Activity size={12} className="text-gray-400" />
                             <span className="text-[9px] font-black text-gray-500 uppercase">{d.alt}</span>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[280px]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Mission Map</h3>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function HudStat({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div>
       <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">{label}</p>
       <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

function ControlIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-3 text-white hover:text-blue-400 transition-colors">
       {icon}
    </button>
  );
}
