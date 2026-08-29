'use client';

import React from 'react';
import { 
  AlertTriangle, MapPin, Home, Phone, 
  Search, ChevronRight, Bell, Info, 
  ShieldCheck, Activity, Navigation, 
  CloudRain, Zap, Heart, Share2, 
  BookOpen, HelpCircle, PhoneCall
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black">Loading Citizen Map...</div> 
});

const updates = [
  { time: '02:50 PM', text: 'Heavy rainfall reported in Mansarovar area.', type: 'Weather' },
  { time: '02:30 PM', text: 'Evacuation started from Ajmeri Gate area.', type: 'Alert' },
  { time: '01:50 PM', text: 'Relief camp opened at SMS Stadium.', type: 'Resource' },
  { time: '01:30 PM', text: 'Road blocked at Vaishali Nagar intersection.', type: 'Traffic' },
];

export default function CitizenDashboard() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
             <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Public Dashboard</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Citizen View • Live Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
              <Share2 size={16} /> Share Portal
           </button>
           <Link href="/login" className="px-6 py-2.5 bg-[#061a37] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10">
              Authority Login
           </Link>
        </div>
      </header>

      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
         <CitizenStat label="Active Alerts" value="6" detail="View Alerts" color="text-red-600" icon={<AlertTriangle />} />
         <CitizenStat label="Affected Areas" value="24" detail="View Map" color="text-orange-500" icon={<MapPin />} />
         <CitizenStat label="Shelters Open" value="32" detail="Find Shelters" color="text-green-600" icon={<Home />} />
         <CitizenStat label="Emergency Helpline" value="1070" detail="Call Now" color="text-blue-600" icon={<Phone />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Live Situation Map */}
        <div className="col-span-12 xl:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Live Situation Map</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <LegendItem color="bg-red-500" label="Hazards" />
                    <LegendItem color="bg-orange-500" label="Alerts" />
                    <LegendItem color="bg-green-500" label="Safe Shelters" />
                 </div>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
              </div>
           </div>
        </div>

        {/* Right Info Column */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           {/* Latest Updates */}
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Latest Updates</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="space-y-6">
                 {updates.map((update, idx) => (
                    <div key={idx} className="flex gap-4 group cursor-pointer">
                       <div className="text-[10px] font-black text-gray-300 w-16 uppercase pt-1">{update.time}</div>
                       <div className="flex-1">
                          <p className="text-xs font-bold text-[#0f172a] leading-tight group-hover:text-blue-600 transition-colors">{update.text}</p>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1 inline-block">{update.type}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Safety Helpline */}
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                       <PhoneCall size={20} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Safety Helpline</h4>
                 </div>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Need Help?</p>
                 <h2 className="text-4xl font-black mb-10">1070</h2>
                 <div className="grid grid-cols-2 gap-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Police</span> <span className="text-white">100</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Ambulance</span> <span className="text-white">102</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Fire</span> <span className="text-white">101</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Disaster</span> <span className="text-white">1077</span></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Safety Tips Strip */}
      <div className="mt-8 bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Safety Tips</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase">Explore All Guides</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SafetyTip 
              icon={<Zap size={20} className="text-yellow-500" />} 
              title="Avoid Flooded Roads" 
              desc="Never drive through flooded areas. Turn around, don't drown."
            />
            <SafetyTip 
              icon={<Activity size={20} className="text-blue-500" />} 
              title="Do Not Drink Tap Water" 
              desc="Use bottled water or boil tap water before consumption."
            />
            <SafetyTip 
              icon={<Navigation size={20} className="text-green-500" />} 
              title="Stay Informed" 
              desc="Follow official social media for verified updates."
            />
            <SafetyTip 
              icon={<ShieldCheck size={20} className="text-purple-500" />} 
              title="Keep Emergency Kit Ready" 
              desc="Flashlight, batteries, first aid, and medicines."
            />
         </div>
      </div>
    </div>
  );
}

function CitizenStat({ label, value, detail, color, icon }: { label: string; value: string; detail: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm group cursor-pointer hover:shadow-md transition-all">
       <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all border border-gray-100">{icon}</div>
       </div>
       <h4 className={`text-4xl font-black ${color} mb-2`}>{value}</h4>
       <div className="flex items-center gap-1 text-blue-600">
          <span className="text-[9px] font-black uppercase tracking-widest">{detail}</span>
          <ChevronRight size={12} />
       </div>
    </div>
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

function SafetyTip({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
       <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
          {icon}
       </div>
       <div>
          <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{desc}</p>
       </div>
    </div>
  );
}
