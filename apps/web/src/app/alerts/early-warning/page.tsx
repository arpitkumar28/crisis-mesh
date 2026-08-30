'use client';

import React from 'react';
import { 
  AlertTriangle, Bell, Activity, Clock, 
  Map as MapIcon, ChevronRight, Share2, MessageSquare,
  Smartphone, Mail, Plus, BarChart3
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Warning Map...</div> 
});

const warningStats = [
  { label: 'Active Warnings', value: '7', sub: '4 High Priority', icon: <AlertTriangle size={20} className="text-red-500" /> },
  { label: 'Upcoming Risks', value: '12', sub: 'Next 48 Hours', icon: <Clock size={20} className="text-orange-500" /> },
  { label: 'People at Risk', value: '1.28 Lakh', sub: 'Est. Impact', icon: <Activity size={20} className="text-blue-500" /> },
  { label: 'Impacted Areas', value: '24', sub: 'Districts', icon: <MapIcon size={20} className="text-purple-500" /> },
];

const activeWarnings = [
  { id: 'WRN-01', hazard: 'Heavy Rainfall Warning', loc: 'Jaipur, Sikar, Tonk', time: '10:00 AM', status: 'Published' },
  { id: 'WRN-02', hazard: 'Flash Flood Watch', loc: 'Mansarovar, Sanganer', time: '10:15 AM', status: 'Published' },
  { id: 'WRN-03', hazard: 'Thunderstorm Alert', loc: 'Alwar, Bharatpur', time: '10:30 AM', status: 'Draft' },
  { id: 'WRN-04', hazard: 'Heat Wave Anomaly', loc: 'Jodhpur, Bikaner', time: '09:00 AM', status: 'Published' },
];

const hazardForecast = [
  { hazard: 'Heavy Rainfall', prob: '92%', time: 'Next 4h' },
  { hazard: 'Thunderstorm', prob: '65%', time: 'Next 12h' },
  { hazard: 'Flash Flood', prob: '48%', time: 'Next 6h' },
  { hazard: 'Heat Wave', prob: '15%', time: 'Next 24h' },
];

export default function EarlyWarningSystemPage() {
  return (
    <OperationsShell eyebrow="Multichannel early warning and predictive alerts" title="Early Warning System">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {warningStats.map((stat, i) => (
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
        {/* Warning Map Area */}
        <div className="col-span-12 lg:col-span-7">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Warning Map</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <LegendItem color="bg-red-500" label="Extreme" />
                    <LegendItem color="bg-orange-500" label="High Danger" />
                    <LegendItem color="bg-yellow-500" label="Moderate" />
                    <LegendItem color="bg-green-500" label="Low Risk" />
                 </div>
              </div>
              <div className="flex-1 relative bg-blue-50">
                 <LiveMap entities={[]} />
                 <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 max-w-[200px]">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Region Focus</p>
                    <p className="text-xs font-black text-[#0f172a] uppercase">Jaipur, Rajasthan</p>
                    <p className="text-[9px] font-bold text-red-600 uppercase mt-1 italic tracking-widest">78% Predicted Inundation</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Forecast & Channels */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Hazard Forecast <span className="text-gray-400 font-bold ml-2">(AI Projected)</span></h3>
                 <BarChart3 size={16} className="text-blue-500" />
              </div>
              <div className="space-y-6">
                 {hazardForecast.map(f => (
                    <div key={f.hazard}>
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-gray-500">{f.hazard}</span>
                          <div className="flex gap-4">
                             <span className="text-gray-400">{f.time}</span>
                             <span className="text-[#0f172a]">{f.prob}</span>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${parseInt(f.prob) > 80 ? 'bg-red-500' : parseInt(f.prob) > 50 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: f.prob }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">Alert Channels</h3>
              <div className="grid grid-cols-2 gap-4">
                 <ChannelStatus icon={<Smartphone size={18} />} label="SMS Gateway" status="Active" count="156k" />
                 <ChannelStatus icon={<MessageSquare size={18} />} label="WhatsApp" status="Active" count="89k" />
                 <ChannelStatus icon={<Bell size={18} />} label="Push Notify" status="Active" count="1.2M" />
                 <ChannelStatus icon={<Mail size={18} />} label="Email Feed" status="Active" count="45k" />
              </div>
              <button className="w-full mt-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                 Configure Broadcast Rules
              </button>
           </div>
        </div>

        {/* Active Warnings Table */}
        <div className="col-span-12">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Active Published Warnings</h3>
                 <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    <Plus size={16} /> New Warning
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Warning ID</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Hazard Type</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Impacted Locations</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Published At</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {activeWarnings.map((w, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-[11px] font-black text-blue-600 uppercase">#{w.id}</td>
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase">{w.hazard}</td>
                          <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">{w.loc}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{w.time}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                w.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                             }`}>{w.status}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-3 text-gray-300 group-hover:text-blue-600">
                                <Share2 size={16} />
                                <ChevronRight size={16} />
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
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

function ChannelStatus({ icon, label, status, count }: { icon: React.ReactNode; label: string; status: string; count: string }) {
  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
       <div className="flex items-center gap-3 mb-3">
          <div className="text-blue-400">{icon}</div>
          <p className="text-[10px] font-black text-white uppercase tracking-tight">{label}</p>
       </div>
       <div className="flex items-center justify-between">
          <span className="text-[8px] font-black text-green-500 uppercase">{status}</span>
          <span className="text-[10px] font-black text-white">{count}</span>
       </div>
    </div>
  );
}
