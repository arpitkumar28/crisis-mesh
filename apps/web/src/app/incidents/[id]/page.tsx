'use client';

import React from 'react';
import {
  ArrowLeft, Edit3, Share2, MoreHorizontal, MapPin,
  Clock, User, Shield, AlertTriangle, Activity,
  CheckCircle2, Info, Send, Users, Layers,
  Phone, Mail, Calendar, ExternalLink, ChevronDown,
  Navigation, Maximize2, Radio, Zap
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20 text-4xl">Loading Map...</div>
});

const timelineEvents = [
  { time: '10:15 AM', date: '25 Aug 2025', title: 'Incident reported', desc: 'Alert triggered by Sensor Node WL-023.', status: 'Completed' },
  { time: '10:20 AM', date: '25 Aug 2025', title: 'Incident verified', desc: 'Verified by Authority, District Office.', status: 'Completed' },
  { time: '10:35 AM', date: '25 Aug 2025', title: 'Resources dispatched', desc: '2 Teams, 1 Rescue Van, 1 Ambulance dispatched.', status: 'In Progress' },
  { time: '10:45 AM', date: '25 Aug 2025', title: 'Evacuation started', desc: 'Evacuation protocol activated for low-lying areas.', status: 'Pending' },
  { time: '11:00 AM', date: '25 Aug 2025', title: 'Shelter announced', desc: 'Relief camp set up at Jaipur City Stadium.', status: 'Pending' },
  { time: '11:15 AM', date: '25 Aug 2025', title: 'Situation under control', desc: 'Water levels stabilized, no further inflow.', status: 'Pending' },
];

export default function IncidentResponseTimeline() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string || 'INC-902';

  return (
    <OperationsShell eyebrow="Track all actions and updates in timeline" title="Incident Response Timeline">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
           <div className="bg-red-50 p-3 rounded-2xl border border-red-100 shrink-0">
              <AlertTriangle className="text-red-600" size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-[#0f172a] uppercase tracking-tighter">Flash Flood in Mahapura</h2>
              <div className="flex items-center gap-4 mt-1">
                 <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">High</span>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">25 Aug 2025, 09:45 AM</span>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">AK</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      {/* Tabs Strip */}
      <div className="flex gap-10 mb-8 border-b border-gray-100 px-4">
        {['Timeline', 'Resources', 'Updates', 'Media', 'Impact'].map(tab => (
          <button
            key={tab}
            className={`pb-4 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              tab === 'Timeline' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {tab === 'Timeline' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Timeline Feed */}
        <div className="col-span-12 lg:col-span-6">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-10 h-[700px] overflow-y-auto no-scrollbar">
              <div className="space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                 {timelineEvents.map((event, i) => (
                    <div key={i} className="flex gap-8 relative z-10 group">
                       <div className={`w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shrink-0 shadow-sm transition-all ${
                         event.status === 'Completed' ? 'bg-green-500' :
                         event.status === 'In Progress' ? 'bg-blue-600 animate-pulse' : 'bg-gray-200'
                       }`}>
                          {event.status === 'Completed' ? <CheckCircle2 size={10} className="text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.time}</span>
                             <h4 className={`text-sm font-black uppercase tracking-tight ${event.status === 'Completed' ? 'text-[#0f172a]' : 'text-gray-400'}`}>{event.title}</h4>
                          </div>
                          <p className="text-[11px] font-bold text-gray-500 leading-relaxed max-w-md">{event.desc}</p>
                          {event.status === 'In Progress' && (
                             <div className="mt-3 flex items-center gap-2">
                                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Action Required</span>
                                <ChevronRight size={12} className="text-blue-600" />
                             </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Incident Location & Summary */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Incident Location</h3>
                 <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Navigation size={12} /> View on Map</button>
              </div>
              <div className="flex-1 relative bg-blue-50">
                 <LiveMap entities={[]} />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/40 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-xl"></div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Incident Summary</h3>
              <div className="grid grid-cols-3 gap-6">
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact Level</p>
                    <p className="text-xl font-black text-red-500 uppercase">Critical</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Affected Area</p>
                    <p className="text-xl font-black text-[#0f172a]">2.4 KM²</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Teams Active</p>
                    <p className="text-xl font-black text-blue-600">03</p>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between">
                 <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase hover:underline"><Info size={14} /> View Detailed Log</button>
                 <button className="flex items-center gap-2 px-6 py-2.5 bg-[#061a37] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Update Status</button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}
