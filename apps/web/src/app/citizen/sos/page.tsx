'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, MapPin, Phone, Shield, 
  Navigation, Users, MessageSquare, Share2,
  ChevronRight, Info, Activity, Heart,
  PhoneCall, Zap, Map as MapIcon, Globe
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-red-50 flex items-center justify-center text-red-900/20 font-black uppercase tracking-widest text-xs">Initializing Emergency Map...</div> 
});

const nearestResponders = [
  { name: 'Control Room Jaipur', distance: '2.1 km', time: '8 mins', type: 'HQ' },
  { name: 'NDRF Unit 12', distance: '4.5 km', time: '15 mins', type: 'Rescue' },
  { name: 'SMS Hospital', distance: '3.2 km', time: '12 mins', type: 'Medical' },
  { name: 'Police Station - Malviya Nagar', distance: '1.8 km', time: '5 mins', type: 'Security' },
];

export default function SOSAssistancePage() {
  const [sosActive, setSosActive] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
             <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Emergency SOS</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">One-Tap Assistance • 24/7 Monitoring</p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
           Back to Dashboard
        </button>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* SOS Action Center */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 -skew-x-12 translate-x-16 -translate-y-16 pointer-events-none"></div>
              
              <div className="mb-8">
                 <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-4">Urgent Assistance</p>
                 <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Need Immediate Help?</h3>
                 <p className="text-xs font-bold text-gray-400 mt-2">Your location will be sent to authorities</p>
              </div>

              <button 
                onClick={() => setSosActive(!sosActive)}
                className={`w-64 h-64 rounded-full border-[12px] flex items-center justify-center transition-all duration-500 group relative ${
                  sosActive ? 'bg-red-600 border-red-100 shadow-[0_0_80px_rgba(239,68,68,0.4)]' : 'bg-white border-red-50 shadow-xl'
                }`}
              >
                 {sosActive && <div className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping"></div>}
                 <div className="text-center">
                    <span className={`text-6xl font-black block leading-none ${sosActive ? 'text-white' : 'text-red-600'}`}>SOS</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest mt-2 block ${sosActive ? 'text-red-100' : 'text-gray-400'}`}>
                       {sosActive ? 'SIGNAL SENT' : 'HOLD 3 SEC'}
                    </span>
                 </div>
              </button>

              <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full">
                 <div className="flex items-center gap-3 mb-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-wider">Current Location</span>
                 </div>
                 <p className="text-[10px] font-bold text-gray-500 text-left uppercase">Malviya Nagar, Sector 4, Jaipur, RJ</p>
                 <p className="text-[9px] font-black text-gray-300 text-left uppercase mt-1">Accuracy: 8.5 m</p>
              </div>
           </div>

           {/* Quick Helplines */}
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[80px]"></div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-red-400">Direct Helplines</h3>
              <div className="grid grid-cols-2 gap-4">
                 <HelplineBtn label="Police" number="100" />
                 <HelplineBtn label="Ambulance" number="102" />
                 <HelplineBtn label="Fire" number="101" />
                 <HelplineBtn label="Disaster" number="1070" />
              </div>
           </div>
        </div>

        {/* Live Tracking & Responders */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Responders Around You</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Units</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Safe Shelters</div>
                 </div>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-red-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute w-96 h-96 border-2 border-red-500/10 rounded-full"></div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Nearest Units</h3>
                 <div className="space-y-4">
                    {nearestResponders.map((r, i) => (
                       <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600">
                                {r.type === 'Medical' ? <Heart size={20} /> : <Shield size={20} />}
                             </div>
                             <div>
                                <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{r.name}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">{r.distance} • {r.time} away</p>
                             </div>
                          </div>
                          <Navigation size={16} className="text-blue-600" />
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
                 <div>
                    <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">What happens next?</h3>
                    <div className="space-y-4">
                       <Step text="Alert sent to 12 nearby responders." />
                       <Step text="Control room tracking your location." />
                       <Step text="Live audio/video channel opened." />
                    </div>
                 </div>
                 <div className="pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-4">Share Your Status</p>
                    <div className="flex gap-4">
                       <button className="flex-1 py-3 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <MessageSquare size={14} /> WhatsApp
                       </button>
                       <button className="flex-1 py-3 bg-gray-50 border border-gray-200 text-[#0f172a] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <Share2 size={14} /> SMS Status
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function HelplineBtn({ label, number }: { label: string; number: string }) {
  return (
    <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-white/10 transition-all group">
       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-red-400 transition-colors">{label}</p>
       <p className="text-xl font-black text-white">{number}</p>
    </button>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
       <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{text}</p>
    </div>
  );
}
