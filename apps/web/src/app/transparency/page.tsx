'use client';

import React from 'react';
import { 
  ShieldCheck, Search, Share2, AlertTriangle, 
  MapPin, Home, Users, Info, Activity,
  Heart, CloudRain, Phone, BookOpen, MessageSquare,
  ChevronRight, Globe, Globe2, BarChart3, Database,
  TrendingUp, Download
} from 'lucide-react';
import Link from 'next/link';

export default function TransparencyPortalPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] p-6 lg:p-10 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/30">
             <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Public Transparency Portal</h1>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Public access to key information and dashboards</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search public data..." 
                className="pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
              />
           </div>
           <button className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50">
              <Share2 size={16} /> Share Data
           </button>
        </div>
      </header>

      {/* Hero Transparency Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
         <TransparencyStat label="Active Alerts" value="6" detail="View Details" color="text-red-600" />
         <TransparencyStat label="Affected Areas" value="24" detail="Across Rajasthan" color="text-orange-500" />
         <TransparencyStat label="Relief Camps" value="32" detail="100% Operational" color="text-green-600" />
         <TransparencyStat label="Total Responders" value="1,070" detail="Active On-Field" color="text-blue-600" />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Public Information Sections */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm p-10">
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight mb-10 border-b border-gray-50 pb-6">Public Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                 <InfoCard 
                   icon={<MapPin className="text-blue-600" />} 
                   title="Live Situation Map" 
                   desc="Real-time map showing flood zones, road blocks and safe areas." 
                   link="/citizen"
                 />
                 <InfoCard 
                   icon={<Home className="text-green-600" />} 
                   title="Relief Camps" 
                   desc="Directory of active shelters with bed availability and facilities." 
                   link="/citizen/shelters"
                 />
                 <InfoCard 
                   icon={<Activity className="text-orange-500" />} 
                   title="Food Status" 
                   desc="Track relief material distribution and stock levels at hubs." 
                   link="/resources"
                 />
                 <InfoCard 
                   icon={<CloudRain className="text-cyan-500" />} 
                   title="Weather Updates" 
                   desc="Official IMD updates and regional precipitation forecasts." 
                   link="/weather"
                 />
                 <InfoCard 
                   icon={<ShieldCheck className="text-purple-600" />} 
                   title="SOS & Safety" 
                   desc="Emergency protocols, SOS button and survival guidelines." 
                   link="/citizen/sos"
                 />
                 <InfoCard 
                   icon={<Phone className="text-red-500" />} 
                   title="Emergency Contacts" 
                   desc="State and district level helpline numbers for all services." 
                   link="/help"
                 />
                 <InfoCard 
                   icon={<AlertTriangle className="text-yellow-600" />} 
                   title="Report Incident" 
                   desc="Community reporting tool to inform responders about local hazards." 
                   link="/citizen/report"
                 />
                 <InfoCard 
                   icon={<Heart className="text-pink-500" />} 
                   title="Volunteer" 
                   desc="Join relief operations and help your community in crisis." 
                   link="/volunteers"
                 />
              </div>
           </div>
        </div>

        {/* Right Sidebar: Data Integrity */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           {/* Data Verification */}
           <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Database size={20} />
                 </div>
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Data Integrity</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-10">
                 All data published on this portal is verified by the State Disaster Management Authority and syncs directly from the IoT mesh network.
              </p>
              <div className="space-y-4 mb-10">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Verification Rate</span>
                    <span className="text-[10px] font-black text-green-500 uppercase">99.8% Verified</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[99%]"></div>
                 </div>
              </div>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                 Download Audit Report
              </button>
           </div>

           {/* Latest Intelligence */}
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Latest News</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="space-y-6">
                 <NewsItem title="Flood water levels receding in Jaipur North" time="12m ago" />
                 <NewsItem title="New relief camp opened in Malviya Nagar" time="45m ago" />
                 <NewsItem title="Electricity restoration work in progress" time="2h ago" />
              </div>
           </div>
        </div>
      </div>

      {/* Important Helplines Footer Strip */}
      <div className="mt-12 bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
         <div className="flex flex-wrap items-center justify-between gap-8">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Important Helplines</h4>
            <div className="flex flex-wrap items-center gap-12">
               <Helpline label="Police" val="100" />
               <Helpline label="Ambulance" val="102" />
               <Helpline label="Fire" val="101" />
               <Helpline label="Disaster" val="1070" />
               <Helpline label="Child" val="1098" />
            </div>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
               Direct Assistance
            </button>
         </div>
      </div>
    </div>
  );
}

function TransparencyStat({ label, value, detail, color }: { label: string; value: string; detail: string; color: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">{label}</p>
       <h4 className={`text-5xl font-black ${color} mb-3`}>{value}</h4>
       <div className="flex items-center gap-1 text-blue-600">
          <span className="text-[10px] font-black uppercase tracking-widest">{detail}</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
       </div>
    </div>
  );
}

function InfoCard({ icon, title, desc, link }: { icon: React.ReactNode; title: string; desc: string; link: string }) {
  return (
    <Link href={link} className="flex gap-6 group cursor-pointer">
       <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shrink-0">
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
       </div>
       <div>
          <h4 className="text-sm font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-2">{title}</h4>
          <p className="text-[11px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">{desc}</p>
       </div>
    </Link>
  );
}

function NewsItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-start gap-3 group cursor-pointer">
       <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
       <div>
          <h5 className="text-[11px] font-black text-[#0f172a] leading-tight group-hover:text-blue-600 transition-colors uppercase">{title}</h5>
          <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{time}</p>
       </div>
    </div>
  );
}

function Helpline({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center gap-2">
       <span className="text-[10px] font-black text-[#0f172a] uppercase">{label}</span>
       <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-black text-blue-600">{val}</span>
    </div>
  );
}
