'use client';

import React, { useState } from 'react';
import {
  Users, MapPin, Truck, Home, Clock,
  ChevronRight, Search, CheckCircle2,
  AlertTriangle, Shield, Activity,
  Navigation, LifeBuoy, Zap, Play,
  Pause, Check, ExternalLink
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black">Loading Evacuation Map...</div>
});

export default function EvacuationExecution() {
  const [step, setStep] = useState(4); // Screen 83 shows step 4: Execution

  return (
    <OperationsShell eyebrow="Manage evacuation operations" title="Evacuation Execution">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
           <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 shrink-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Execution ID</span>
              <p className="text-xs font-black text-[#0f172a]">EVS-2025-08-042</p>
           </div>
           <div>
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">Jaipur South - Sector 4</h2>
                 <span className="text-[10px] font-black bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-green-600 animate-pulse"></div> In Progress
                 </span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">People Evacuated</p>
              <h4 className="text-xl font-black text-[#0f172a]">1,245</h4>
           </div>
           <div className="text-right ml-6">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pending</p>
              <h4 className="text-xl font-black text-red-500">3</h4>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Step Indicator */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-4">
              <StepItem number={1} label="Evacuation Plan" completed />
              <StepItem number={2} label="Transport" completed />
              <StepItem number={3} label="Shelters" completed />
              <StepItem number={4} label="Execution" active />
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-6">Execution Overview</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                       <span className="text-gray-400">Total Priority to Evacuate</span>
                       <span className="text-[#0f172a]">82%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-600 w-[82%]"></div>
                    </div>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">People Evacuated</span>
                    <span className="text-green-600">1,245</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-red-500">126</span>
                 </div>
                 <div className="pt-4 mt-4 border-t border-gray-50">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                       <span className="text-gray-400">Start Time</span>
                       <span className="text-[#0f172a]">25 Aug 2025, 09:30 AM</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-gray-400">Estimated Completion</span>
                       <span className="text-[#0f172a]">25 Aug 2025, 06:00 PM</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Map & Transport Status */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 overflow-hidden shadow-sm flex flex-col h-[500px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Live Evacuation Tracking</h3>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-blue-600"></div> Transport
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-green-500"></div> Safe Shelter
                    </div>
                 </div>
              </div>
              <div className="flex-1 relative bg-blue-50">
                 <LiveMap entities={[]} />
                 {/* Mock UI Overlays from screen 83 */}
                 <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-[#0f172a]"><Navigation size={20} /></button>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Transport Deployed</h3>
              <div className="grid grid-cols-4 gap-6">
                 <TransportItem icon={<Truck size={20} />} label="Rescue Trucks" count={12} status="8 Active" color="text-blue-600" />
                 <TransportItem icon={<LifeBuoy size={20} />} label="Rescue Boats" count={5} status="3 Active" color="text-cyan-600" />
                 <TransportItem icon={<Users size={20} />} label="Buses" count={8} status="5 Active" color="text-orange-500" />
                 <TransportItem icon={<Activity size={20} />} label="Ambulances" count={4} status="4 Active" color="text-red-500" />
              </div>
           </div>

           <div className="flex items-center justify-end gap-4 mt-8">
              <button className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
                 <Pause size={18} /> Pause Evacuation
              </button>
              <button className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all">
                 <Check size={18} /> Mark as Complete
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function StepItem({ number, label, active = false, completed = false }: { number: number; label: string; active?: boolean; completed?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
         completed ? 'bg-blue-600 border-blue-600 text-white' :
         active ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-300'
       }`}>
          {completed ? <Check size={12} /> : number}
       </div>
       <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

function TransportItem({ icon, label, count, status, color }: { icon: React.ReactNode; label: string; count: number; status: string; color: string }) {
  return (
    <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col items-center text-center">
       <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm ${color}`}>
          {icon}
       </div>
       <h4 className="text-xl font-black text-[#0f172a]">{count}</h4>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
       <p className={`text-[8px] font-black uppercase mt-3 px-2 py-0.5 rounded ${color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-10`}>{status}</p>
    </div>
  );
}
