'use client';

import React from 'react';
import { 
  Users, MessageSquare, Megaphone, Calendar, 
  MapPin, ChevronRight, Plus, Search, 
  Filter, Heart, Share2, Info, Globe,
  CheckCircle2, Star, MousePointer2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Engagement Map...</div> 
});

const communityStats = [
  { label: 'Communities', value: '248', sub: 'Verified Groups', icon: <Users size={20} /> },
  { label: 'Active Groups', value: '166', sub: 'Engaged Now', icon: <MessageSquare size={20} className="text-blue-500" /> },
  { label: 'Volunteers', value: '1,245', sub: 'Field Support', icon: <Heart size={20} className="text-red-500" /> },
  { label: 'Awareness Events', value: '35', sub: 'Last 30 Days', icon: <Calendar size={20} className="text-purple-500" /> },
];

const recentActivities = [
  { id: 1, title: 'Flood Preparedness Campaign', date: '25 Aug 2026', loc: 'Malviya Nagar', type: 'Awareness' },
  { id: 2, title: 'Local Volunteer Meetup', date: '24 Aug 2026', loc: 'Mansarovar', type: 'Meeting' },
  { id: 3, title: 'Clean Water Initiative', date: '23 Aug 2026', loc: 'Jaipur North', type: 'Relief' },
  { id: 4, title: 'Tree Plantation Drive', date: '20 Aug 2026', loc: 'Ajmeri Gate', type: 'Community' },
];

const topCommunities = [
  { name: 'Vaishali Nagar', members: 1240, score: 'High' },
  { name: 'Mansarovar', members: 980, score: 'High' },
  { name: 'Malviya Nagar', members: 850, score: 'Medium' },
  { name: 'Jagatpura', members: 620, score: 'Medium' },
  { name: 'Sanganer', members: 450, score: 'Low' },
];

export default function CommunityEngagementPage() {
  return (
    <OperationsShell eyebrow="Engage and connect with local communities" title="Community Engagement">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {communityStats.map((stat, i) => (
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
        {/* Recent Activities */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Activities</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {recentActivities.map(act => (
                    <div key={act.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-3">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{act.type}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase">{act.date}</span>
                       </div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{act.title}</h4>
                       <div className="mt-4 flex items-center gap-1.5 text-gray-400">
                          <MapPin size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">{act.loc}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Engagement Map */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[350px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Engagement Map</h3>
                 <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Activities</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active Groups</div>
                 </div>
              </div>
              <div className="flex-1 relative">
                 <LiveMap entities={[]} />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Top Communities */}
              <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Top Communities</h3>
                 <div className="space-y-4">
                    {topCommunities.map(c => (
                       <div key={c.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                             <p className="text-xs font-black text-[#0f172a] uppercase">{c.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{c.members} Members</p>
                          </div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             c.score === 'High' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>{c.score} Engagement</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl flex flex-col justify-between">
                 <div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-blue-400">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                       <ActionButton icon={<Plus size={16} />} label="Create Event" />
                       <ActionButton icon={<Megaphone size={16} />} label="Send Alert" />
                       <ActionButton icon={<Search size={16} />} label="Find Group" />
                       <ActionButton icon={<Share2 size={16} />} label="Share Update" />
                    </div>
                 </div>
                 <button className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    Generate Engagement Report
                 </button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
       <div className="text-blue-400 group-hover:scale-110 transition-transform">{icon}</div>
       <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{label}</span>
    </button>
  );
}
