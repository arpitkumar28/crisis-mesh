'use client';

import React from 'react';
import { 
  Users, MapPin, Navigation, 
  CheckCircle2, Clock, AlertTriangle, Shield,
  Plus, Camera, Send, Radio,
  ChevronRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Mission Map...</div> 
});

const assignments = [
  { id: 'ASN-01', title: 'Food Rescue - Mansarovar', status: 'In Progress', priority: 'High', location: 'Sector 4, Mansarovar' },
  { id: 'ASN-02', title: 'Health Camp Setup', status: 'Assigned', priority: 'Medium', location: 'Jaipur North' },
  { id: 'ASN-03', title: 'Relief Material Delivery', status: 'Assigned', priority: 'Medium', location: 'Malviya Nagar' },
  { id: 'ASN-04', title: 'Water Quality Check', status: 'Pending', priority: 'Low', location: 'Sanganer' },
  { id: 'ASN-05', title: 'Evacuation Support', status: 'Assigned', priority: 'High', location: 'Amer Road' },
];

export default function ResponderDashboard() {
  return (
    <OperationsShell eyebrow="Field operations and team management console" title="Responder Dashboard">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-xl shadow-blue-500/20">
                TA
             </div>
             <div>
                <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">Welcome, Team Alpha</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active On-Field • ONLINE</span>
                </div>
             </div>
          </div>
          
          <div className="flex gap-3">
             <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Clock size={16} /> Check-In Today
             </button>
             <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-900/20">
                <AlertTriangle size={16} /> Emergency SOS
             </button>
          </div>
       </div>

       {/* Team Stats */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <TeamStat label="Active Assignments" value="5" sub="3 High Priority" icon={<Shield className="text-blue-600" />} />
          <TeamStat label="Incidents Nearby" value="3" sub="Within 5.0 km" icon={<MapPin className="text-orange-600" />} />
          <TeamStat label="Check-ins Today" value="8" sub="Entire District" icon={<CheckCircle2 className="text-green-600" />} />
          <TeamStat label="Team Members" value="12" sub="8 Online Now" icon={<Users className="text-purple-600" />} />
       </div>

       <div className="grid grid-cols-12 gap-8">
          {/* Left: My Assignments */}
          <div className="col-span-12 lg:col-span-4">
             <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                   <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">My Assignments</h3>
                   <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                   {assignments.map(asn => (
                      <div key={asn.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                         <div className="flex items-center justify-between mb-3">
                            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">#{asn.id}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                               asn.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                               asn.status === 'Assigned' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>{asn.status}</span>
                         </div>
                         <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{asn.title}</h4>
                         <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-gray-400">
                               <MapPin size={12} />
                               <span className="text-[9px] font-bold uppercase tracking-widest">{asn.location}</span>
                            </div>
                            <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600" />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Center: Live Location & Navigation */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
             <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                   <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Live Location & Route</h3>
                   <div className="flex items-center gap-4">
                      <div className="text-right">
                         <p className="text-[8px] font-black text-gray-400 uppercase">Target ETA</p>
                         <p className="text-xs font-black text-[#0f172a]">12 MINS</p>
                      </div>
                      <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">Open in Maps</button>
                   </div>
                </div>
                <div className="flex-1 relative">
                   <LiveMap entities={[]} />
                   <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl max-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                         <Navigation size={14} className="text-blue-600" />
                         <span className="text-[10px] font-black text-[#0f172a] uppercase">On Route</span>
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-relaxed">Head North on Amer Rd towards Sector 2 relief point.</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Team Communication */}
                <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm flex flex-col h-[220px]">
                   <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-[10px]">Team Comm</h3>
                      <Radio size={14} className="text-green-500" />
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                      <div className="bg-blue-50 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                         <p className="text-[9px] font-black text-blue-600 uppercase mb-1">HQ Command</p>
                         <p className="text-[10px] font-bold text-gray-700">Team Alpha, redirect to Malviya Nagar Sector 4 immediately. High water ingress reported.</p>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-2xl rounded-tr-none ml-auto max-w-[80%]">
                         <p className="text-[9px] font-black text-gray-400 uppercase mb-1 text-right">Team Lead (You)</p>
                         <p className="text-[10px] font-bold text-gray-700 text-right">Copy that, HQ. Diverting current unit now. ETA 15 mins.</p>
                      </div>
                   </div>
                   <div className="p-3 border-t border-gray-50 flex items-center gap-2">
                      <input type="text" placeholder="Type message..." className="flex-1 bg-gray-50 border-none text-[10px] font-bold focus:ring-0 rounded-xl px-4 py-2" />
                      <button className="p-2 bg-blue-600 text-white rounded-xl"><Send size={14} /></button>
                   </div>
                </div>

                {/* Quick Reports & Media */}
                <div className="bg-[#0f172a] rounded-[32px] p-6 text-white shadow-xl flex flex-col justify-between">
                   <div>
                      <h3 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-blue-400">Quick Field Report</h3>
                      <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">Upload site photos or voice notes for rapid situational assessment.</p>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                         <Camera size={14} className="text-blue-500" /> Snap Site
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                         <Plus size={14} className="text-orange-500" /> New Log
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </OperationsShell>
  );
}

function TeamStat({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
         <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a]">{value}</h4>
      <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{sub}</p>
    </div>
  );
}
