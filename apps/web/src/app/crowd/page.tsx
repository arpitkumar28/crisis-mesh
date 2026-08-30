'use client';

import React from 'react';
import { 
  Search, Maximize2, 
  Navigation, 
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { 
  ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from 'recharts';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-bold text-blue-900/20 text-4xl">Loading Map...</div> 
});

const crowdTrendData = [
  { time: '10 AM', density: 30 },
  { time: '12 PM', density: 45 },
  { time: '02 PM', density: 65 },
  { time: '04 PM', density: 80 },
  { time: '06 PM', density: 75 },
  { time: '08 PM', density: 60 },
];

const highDensityLocations = [
  { location: 'Tripolia Bazar', density: 84, level: 'Very High', trend: 'up' },
  { location: 'Albert Hall', density: 72, level: 'High', trend: 'up' },
  { location: 'MI Road', density: 68, level: 'High', trend: 'down' },
  { location: 'Hawa Mahal', density: 58, level: 'Medium', trend: 'stable' },
  { location: 'Badi Chaupar', density: 54, level: 'Medium', trend: 'down' },
];

export default function CrowdMonitoring() {
  return (
    <OperationsShell eyebrow="AI-powered crowd density monitoring" title="Crowd Monitoring & Density">
      {/* Top Search Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search location..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main: Live Crowd Density Map */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Live Crowd Density Map</h3>
              <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-widest text-gray-400">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Very High</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> High</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Medium</div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Low</div>
              </div>
            </div>
            <div className="flex-1 relative bg-blue-50">
              <LiveMap entities={[]} />
              
              {/* Map Floating Overlays */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center text-[#0f172a] hover:bg-white transition-all"><Maximize2 size={18} /></button>
                 <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center text-[#0f172a] hover:bg-white transition-all"><Navigation size={18} /></button>
              </div>

              {/* Mock Hotspots */}
              <CrowdHotspot x="40%" y="45%" density="45%" color="bg-yellow-500" />
              <CrowdHotspot x="55%" y="30%" density="78%" color="bg-red-500" />
              <CrowdHotspot x="25%" y="60%" density="32%" color="bg-green-500" />
              <CrowdHotspot x="65%" y="55%" density="62%" color="bg-orange-500" />
            </div>
          </div>

          {/* High Density Locations List */}
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">High Density Locations</h3>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Density</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4">Trend</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {highDensityLocations.map((loc, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-black text-[#0f172a] uppercase">{loc.location}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${loc.density > 80 ? 'bg-red-500' : loc.density > 60 ? 'bg-orange-500' : 'bg-yellow-500'}`} style={{ width: `${loc.density}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-[#0f172a]">{loc.density}%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[8px] font-black uppercase ${loc.level === 'Very High' ? 'text-red-500' : loc.level === 'High' ? 'text-orange-500' : 'text-yellow-600'}`}>{loc.level}</span>
                    </td>
                    <td className="px-6 py-4">
                       {loc.trend === 'up' ? <ArrowUpRight size={14} className="text-red-500" /> : loc.trend === 'down' ? <ArrowDownRight size={14} className="text-green-500" /> : <div className="h-0.5 w-3 bg-gray-300"></div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Monitor</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Overall Status & Trend */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Overall Status</h3>
              
              <div className="flex items-center justify-center mb-10 relative">
                 <div className="h-56 w-56 flex items-center justify-center">
                    {/* Simplified Guage visualization */}
                    <div className="relative w-48 h-24 overflow-hidden">
                       <div className="absolute top-0 left-0 w-48 h-48 border-[12px] border-gray-100 rounded-full"></div>
                       <div className="absolute top-0 left-0 w-48 h-48 border-[12px] border-red-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(45deg)' }}></div>
                    </div>
                 </div>
                 <div className="absolute bottom-10 flex flex-col items-center">
                    <p className="text-4xl font-black text-red-500 uppercase">High</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Crowd Level</p>
                 </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Average Density</p>
                    <div className="flex items-center gap-1 text-red-500">
                       <ArrowUpRight size={14} />
                       <span className="text-[10px] font-black">12%</span>
                    </div>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <h4 className="text-4xl font-black text-[#0f172a]">61%</h4>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">vs last hour</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Crowd Density Trend</h3>
                 <button className="text-[9px] font-black text-gray-400 uppercase">Today</button>
              </div>
              <div className="h-[240px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={crowdTrendData}>
                       <defs>
                          <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                       <YAxis hide />
                       <Tooltip />
                       <Area type="monotone" dataKey="density" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#densityGrad)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-6">Crowd Control AI</h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 High density detected in Tripolia Bazar. AI recommends deploying additional marshals and activating alternate pedestrian routes.
              </p>
              <button className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                 Activate Protocol
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function CrowdHotspot({ x, y, density, color }: { x: string; y: string; density: string; color: string }) {
  return (
    <div className="absolute" style={{ top: y, left: x }}>
       <div className={`w-16 h-16 rounded-full ${color} opacity-30 animate-pulse`}></div>
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center shadow-lg`}>
          <span className="text-[8px] font-black text-white">{density}</span>
       </div>
    </div>
  );
}
