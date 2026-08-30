'use client';

import React from 'react';
import { 
  Truck, MapPin, Navigation, Radio, Activity,
  Users, Search, LifeBuoy
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Live Resource Map...</div> 
});

const resourceStats = [
  { label: 'Active Vehicles', value: '132', sub: '85% in motion', icon: <Truck size={20} className="text-blue-600" /> },
  { label: 'Deployed Teams', value: '28', sub: '12 active missions', icon: <Users size={20} className="text-purple-600" /> },
  { label: 'Drones', value: '12', sub: '3 in flight', icon: <Radio size={20} className="text-cyan-600" /> },
  { label: 'Medical Units', value: '320', sub: 'Available: 256', icon: <LifeBuoy size={20} className="text-red-600" /> },
  { label: 'Generators', value: '56', sub: 'Active: 42', icon: <Zap size={20} className="text-orange-600" /> },
];

const activeResources = [
  { id: 'TRK-042', name: 'Rescue Truck #42', loc: 'Malviya Nagar', status: 'In Motion', spd: '45 km/h', heading: 'North' },
  { id: 'AMB-108', name: 'Ambulance Unit 108', loc: 'Mansarovar', status: 'On Site', spd: '0 km/h', heading: '-' },
  { id: 'DRN-001', name: 'Search Drone Alpha', loc: 'Jaipur South', status: 'In Flight', spd: '18 km/h', heading: 'West' },
  { id: 'TUM-007', name: 'Medical Team 7', loc: 'Sanganer', status: 'Relief Op', spd: '-', heading: '-' },
];

export default function LiveResourceTrackingPage() {
  return (
    <OperationsShell eyebrow="Real-time tracking of vehicles, equipment and field teams" title="Resource Tracking (Live)">
      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {resourceStats.map((stat, i) => (
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
        {/* Live Resource Map */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Live Resource Map</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <LegendItem color="bg-blue-500" label="Vehicles" />
                    <LegendItem color="bg-purple-500" label="Teams" />
                    <LegendItem color="bg-cyan-500" label="Drones" />
                    <LegendItem color="bg-green-500" label="Supply Hubs" />
                 </div>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
                 <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl max-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                       <Activity size={14} className="text-blue-600" />
                       <span className="text-[10px] font-black text-[#0f172a] uppercase">Fleet Status</span>
                    </div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">Most units concentrated in Jaipur South flood zone.</p>
                 </div>
              </div>
           </div>

           {/* Resource Health / Maintenance */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Critical Maintenance</h3>
                 <div className="space-y-4">
                    <MaintenanceItem label="Water Pump #5" status="Engine Overheat" priority="High" />
                    <MaintenanceItem label="Drone DRN-004" status="Battery Degraded" priority="Medium" />
                    <MaintenanceItem label="Medical Van #3" status="Tire Pressure Low" priority="Low" />
                 </div>
              </div>
              <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between">
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-blue-400">Fleet Operations</h3>
                    <p className="text-xs font-bold text-gray-400 leading-relaxed">12 vehicles currently idling for more than 30 mins. Suggest redeployment to Sanganer sector.</p>
                 </div>
                 <button className="w-full mt-6 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Optimize Fleet Usage</button>
              </div>
           </div>
        </div>

        {/* Resource List Sidebar */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[820px]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Active Resource List</h3>
                 <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Search size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                 {activeResources.map(res => (
                    <div key={res.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-4">
                          <div>
                             <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{res.id}</p>
                             <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{res.name}</h4>
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             res.status === 'In Motion' ? 'bg-blue-100 text-blue-600' : 
                             res.status === 'On Site' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>{res.status}</span>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                             <MapPin size={12} className="text-gray-300" /> {res.loc}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                             <div className="flex gap-4">
                                <span className="text-[8px] font-black text-gray-400 uppercase">SPD: {res.spd}</span>
                                <span className="text-[8px] font-black text-gray-400 uppercase">HDG: {res.heading}</span>
                             </div>
                             <Navigation size={12} className="text-blue-600" />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <button className="w-full py-4 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">View All Fleet Data</button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`w-2 h-2 rounded-full ${color}`}></div>
       <span>{label}</span>
    </div>
  );
}

function MaintenanceItem({ label, status, priority }: { label: string; status: string; priority: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
       <div>
          <p className="text-[10px] font-black text-[#0f172a] uppercase tracking-tight">{label}</p>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{status}</p>
       </div>
       <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
          priority === 'High' ? 'bg-red-50 text-red-600' : 
          priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
       }`}>{priority}</span>
    </div>
  );
}

function Zap({ size, className }: { size?: number; className?: string }) {
  return <Activity size={size} className={className} />;
}
