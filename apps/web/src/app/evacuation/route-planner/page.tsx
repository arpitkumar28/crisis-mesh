'use client';

import React from 'react';
import { 
  Navigation, MapPin, Truck, Users, Clock, 
  ChevronRight, ArrowRight, Search, Filter, 
  Plus, Download, CheckCircle2, AlertTriangle, 
  Shield, Activity, Share2, Info, Maximize2,
  Navigation2, Map as MapIcon, Route
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Routing Workspace...</div> 
});

const routeDetails = [
  { step: 'Head East on Ajmeri Gate Road', dist: '1.2 km' },
  { step: 'Turn Left on Station Road', dist: '0.8 km' },
  { step: 'Stay on Amer Road towards relief point', dist: '2.5 km' },
  { step: 'Arrive at Sector 4 Shelter', dist: '0.1 km' },
];

export default function EvacuationRoutePlanner() {
  return (
    <OperationsShell eyebrow="Plan and optimize emergency evacuation routes" title="Evacuation Route Planner">
      <div className="grid grid-cols-12 gap-8">
        {/* Route Controls Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 space-y-8">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Plan New Route</h3>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">From (Starting Point)</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={16} />
                       <input type="text" defaultValue="Malviya Nagar, Jaipur" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none" />
                    </div>
                 </div>
                 
                 <div className="flex justify-center -my-4 relative z-10">
                    <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-4 border-white">
                       <Route size={18} />
                    </button>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">To (Safe Shelter)</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                       <input type="text" defaultValue="SMS Stadium, Jaipur" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none" />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Transport Mode</label>
                    <select className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none">
                       <option>Emergency Vehicles</option>
                       <option>Public Transport</option>
                       <option>Private Vehicle</option>
                       <option>On Foot</option>
                    </select>
                 </div>

                 <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    Generate Optimized Route
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Best Route Summary</h3>
              <div className="space-y-4">
                 <SummaryRow label="Distance" value="8.4 km" />
                 <SummaryRow label="Estimated Time" value="18 mins" />
                 <SummaryRow label="Hazard Encounters" value="3 Low Risk" color="text-orange-500" />
                 <SummaryRow label="Traffic Status" value="Normal" color="text-green-500" />
                 <SummaryRow label="People to Evacuate" value="3,245" />
              </div>
           </div>
        </div>

        {/* Route Map & Details */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Route Visualization</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div> Primary Route</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Hazard Zone</div>
                 </div>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Step-by-Step Directions</h3>
                 <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
                    <Share2 size={14} /> Share with Teams
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                 {routeDetails.map((step, i) => (
                    <div key={i} className="flex gap-4 group">
                       <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <span className="text-[10px] font-black">{i + 1}</span>
                       </div>
                       <div>
                          <p className="text-xs font-bold text-[#0f172a] uppercase tracking-tight leading-tight">{step.step}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{step.dist}</p>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-gray-400">
                    <Info size={16} />
                    <p className="text-[9px] font-bold uppercase tracking-widest">Calculated based on real-time flood data and road blocks.</p>
                 </div>
                 <button className="px-10 py-3 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Dispatch Units
                 </button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SummaryRow({ label, value, color = "text-[#0f172a]" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
       <span className={`text-xs font-black uppercase ${color}`}>{value}</span>
    </div>
  );
}
