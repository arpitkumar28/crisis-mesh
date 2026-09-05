'use client';

import React from 'react';
import {
  Map as MapIcon, Bell, Activity, Shield, Zap, CheckCircle2, Apple, Play
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const features = [
  { icon: <MapIcon className="text-blue-500" />, title: 'Live Map', desc: 'Real-time hazards, shelters & resources' },
  { icon: <Bell className="text-red-500" />, title: 'Alerts', desc: 'Instant official and platform alerts' },
  { icon: <Shield className="text-green-500" />, title: 'First Aid/SOS', desc: 'Nearby shelters and safe places' },
  { icon: <Activity className="text-orange-500" />, title: 'Emergency SOS', desc: 'One-tap help with location' },
  { icon: <Zap className="text-yellow-500" />, title: 'Weather', desc: 'Live weather and local forecasts' },
  { icon: <CheckCircle2 className="text-purple-500" />, title: 'Safety Tips', desc: 'Guidelines and safety information' },
];

// This is a purely illustrative phone-shell mockup of the mobile app's
// UI layout — it does not fetch or display any real data. It previously
// showed hardcoded "Active Alerts: 6" / "Nearby Shelters: 12" counts,
// which looked like live statistics but were fabricated; the stat cards
// below no longer claim any specific number. The "Download" buttons are
// disabled rather than linking to app store listings that do not exist,
// since the mobile app is not currently published.
export default function MobileAppPreview() {
  return (
    <OperationsShell eyebrow="CrisisMesh mobile ecosystem for citizens and responders" title="Mobile App Preview">
      <div className="grid grid-cols-12 gap-12 items-center min-h-[700px]">
        {/* Phone Mockup Column */}
        <div className="col-span-12 lg:col-span-5 flex justify-center">
           <div className="relative w-[320px] h-[640px] bg-[#0f172a] rounded-[50px] border-[8px] border-[#1e293b] shadow-[0_0_100px_rgba(30,41,59,0.3)] overflow-hidden">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-2xl z-50"></div>
              
              {/* App Content Preview */}
              <div className="h-full bg-white flex flex-col pt-10 px-4">
                 <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">CM</div>
                    <Bell size={18} className="text-gray-400" />
                 </div>
                 
                 <h4 className="text-xl font-black text-[#0f172a] mb-4 uppercase tracking-tighter leading-none">Live Map</h4>
                 
                 <div className="flex-1 bg-blue-50 rounded-2xl border border-gray-100 mb-6 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-blue-900/10 uppercase tracking-[0.2em] -rotate-12">Interactive Map</div>
                    
                    {/* Illustrative map pins — layout only, not real locations */}
                    <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                    <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                       <p className="text-[8px] font-black text-red-600 uppercase mb-1">Active Alerts</p>
                       <p className="text-[9px] font-bold text-red-600/70">Live in-app</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                       <p className="text-[8px] font-black text-green-600 uppercase mb-1">Nearby Shelters</p>
                       <p className="text-[9px] font-bold text-green-600/70">Live in-app</p>
                    </div>
                 </div>

                 {/* Bottom nav — illustrative layout only */}
                 <div className="mt-auto py-4 border-t border-gray-100 flex justify-between items-center text-gray-300">
                    <MapIcon size={20} className="text-blue-600" />
                    <Bell size={20} />
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-white"><Activity size={20} /></div>
                    <Activity size={20} />
                    <Shield size={20} />
                 </div>
              </div>
           </div>
        </div>

        {/* Info Column */}
        <div className="col-span-12 lg:col-span-7 space-y-10">
           <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black text-[#0f172a] leading-tight uppercase tracking-tighter">Safety in your <br /><span className="text-blue-600">Pocket.</span></h2>
              <p className="text-lg font-bold text-gray-500 max-w-lg leading-relaxed uppercase tracking-widest text-[10px]">
                 The CrisisMesh mobile app empowers citizens with real-time intelligence and gives responders a direct line of communication during emergencies.
              </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((f, i) => (
                <div key={i} className="flex gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                      {f.icon}
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-1">{f.title}</h4>
                      <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{f.desc}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="pt-10 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-8">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Coming Soon</p>
                    <div className="flex gap-4">
                       <button disabled className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-2xl cursor-not-allowed" title="Not yet published">
                          <Play size={20} />
                          <div className="text-left">
                             <p className="text-[8px] font-bold opacity-70 leading-none">NOT YET ON</p>
                             <p className="text-xs font-black">Google Play</p>
                          </div>
                       </button>
                       <button disabled className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-2xl cursor-not-allowed" title="Not yet published">
                          <Apple size={20} />
                          <div className="text-left">
                             <p className="text-[8px] font-bold opacity-70 leading-none">NOT YET ON THE</p>
                             <p className="text-xs font-black">App Store</p>
                          </div>
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}
