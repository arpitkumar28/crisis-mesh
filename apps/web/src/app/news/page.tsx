'use client';

import React, { useState } from 'react';
import {
  Newspaper, Search, Filter, Bell, ChevronRight,
  Clock, Share2, Bookmark, ExternalLink, Hash,
  AlertTriangle, CheckCircle2, Info, ArrowUpRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const newsItems = [
  {
    id: 1,
    title: 'Heavy rainfall warning for Jaipur district',
    excerpt: 'IMD has issued a heavy rainfall warning for Jaipur and surrounding areas for next 24 hours. Citizens are advised to stay indoors...',
    source: 'IMD Official',
    time: '12 min ago',
    category: 'Weather',
    severity: 'OFFICIAL',
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'Waterlogging reported in several low-lying areas',
    excerpt: 'Following heavy rains, waterlogging has been reported in Malviya Nagar, Mansarovar, and old city areas. Traffic diversions in place...',
    source: 'Local News',
    time: '45 min ago',
    category: 'Incident',
    severity: 'LOCAL NEWS',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'NDRF team deployed for flood relief',
    excerpt: 'Rajasthan Government has requested NDRF deployment for flood relief operations in eastern Rajasthan. Team Alpha on standby...',
    source: 'Govt. Release',
    time: '2 hours ago',
    category: 'Relief',
    severity: 'OFFICIAL',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 4,
    title: 'Traffic advisory issued for NH-48 Road',
    excerpt: 'Due to waterlogging near Ajmer Road, traffic has been diverted from NH-48 towards alternate routes. Expect delays...',
    source: 'Traffic Police',
    time: '3 hours ago',
    category: 'Traffic',
    severity: 'OFFICIAL',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=600'
  }
];

export default function NewsPage() {
  const [activeTab, setActiveTab] = useState('All News');

  return (
    <OperationsShell eyebrow="Stay informed with the latest news and official updates" title="News & Updates">
      <div className="grid grid-cols-12 gap-8">
        {/* Main News Feed (Screen 6 Style) */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-8 overflow-x-auto no-scrollbar">
                {['All News', 'Official Updates', 'Weather Updates', 'Local News', 'Media Reports'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap pb-2 transition-all relative ${
                      activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search news..."
                  className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-48 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                />
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {newsItems.map((item) => (
                <div key={item.id} className="p-8 flex gap-8 hover:bg-gray-50/50 transition-all group cursor-pointer">
                  <div className="w-56 h-36 rounded-[24px] overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                        item.severity === 'OFFICIAL' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.severity}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.time}</span>
                    </div>

                    <h3 className="text-xl font-black text-[#0f172a] mb-3 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                    <p className="text-xs font-medium text-gray-500 mb-6 line-clamp-2 leading-relaxed">{item.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        <span className="text-[#0f172a]">{item.source}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Share2 size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Bookmark size={16} /></button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><ExternalLink size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
               <button className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">Load Previous Updates</button>
            </div>
          </div>
        </div>

        {/* News Sidebar (Screen 6 Style) */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          {/* Popular Topics */}
          <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.2em] mb-8">Popular Topics</h3>
            <div className="flex flex-wrap gap-2">
              {['#Flood', '#JaipurRain', '#Alerts', '#Traffic', '#Weather', '#Relief', '#NDMA', '#IMD'].map(tag => (
                <button key={tag} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[9px] font-black text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center gap-1.5 uppercase tracking-widest">
                  <Hash size={12} className="opacity-50" /> {tag.substring(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Newsletter / Subscription */}
          <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20">
              <Bell size={28} />
            </div>
            <h3 className="text-xl font-black mb-3 tracking-tight">Subscribe to Updates</h3>
            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">
              Get critical disaster alerts and news updates directly to your inbox or mobile device.
            </p>
            <div className="space-y-4 relative z-10">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
              />
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20">
                Subscribe Now
              </button>
            </div>
          </div>

          {/* Official Resources */}
          <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.2em] mb-8">Official Sources</h3>
            <div className="space-y-6">
              <OfficialSource name="IMD Rajasthan" handle="@IMD_Rajasthan" initial="I" />
              <OfficialSource name="NDMA India" handle="@ndmaindia" initial="N" />
              <OfficialSource name="Rajasthan Police" handle="@PoliceRajasthan" initial="P" />
              <OfficialSource name="Jaipur District" handle="@DMPJaipur" initial="D" />
            </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function OfficialSource({ name, handle, initial }: { name: string; handle: string; initial: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-blue-600 text-xs font-black border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
          {initial}
        </div>
        <div>
          <h5 className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{name}</h5>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{handle}</p>
        </div>
      </div>
      <ArrowUpRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-all group-hover:scale-110" />
    </div>
  );
}
