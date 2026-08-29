'use client';

import React from 'react';
import {
  FileText, Image as ImageIcon, Video, Download,
  Search, Filter, Plus, ChevronRight, Share2,
  Newspaper, Globe, User, Clock, CheckCircle2,
  ExternalLink, Mail
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const mediaStats = [
  { label: 'Press Releases', value: '24', sub: '+4 this month', icon: <Newspaper size={20} /> },
  { label: 'Media Mentions', value: '156', sub: '+18 this month', icon: <Globe size={20} className="text-blue-500" /> },
  { label: 'Press Kits', value: '12', sub: 'Updated today', icon: <FileText size={20} className="text-orange-500" /> },
  { label: 'Downloads', value: '89', sub: '+7 this month', icon: <Download size={20} className="text-purple-500" /> },
];

const pressReleases = [
  { id: 1, title: 'Flood Alert for Jaipur District', date: '25 Aug 2026, 10:24 AM', status: 'Published' },
  { id: 2, title: 'Rescue Ops Operation at Malviya Nagar', date: '24 Aug 2026, 04:30 PM', status: 'Published' },
  { id: 3, title: 'NDRF Unit 7 Deployment Started', date: '24 Aug 2026, 01:15 PM', status: 'Published' },
  { id: 4, title: 'Road Blockage Update - Jaipur South', date: '23 Aug 2026, 09:00 AM', status: 'Published' },
];

export default function MediaPressCenter() {
  return (
    <OperationsShell eyebrow="Official updates, press releases and media resources" title="Media & Press Center">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {mediaStats.map((stat, i) => (
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
        {/* Latest Press Releases */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Latest Press Releases</h3>
                 <button className="flex items-center gap-2 bg-[#061a37] text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
                    <Plus size={16} /> New Release
                 </button>
              </div>
              <div className="divide-y divide-gray-50">
                 {pressReleases.map((pr) => (
                    <div key={pr.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-all text-blue-600">
                             <FileText size={18} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-[#0f172a] uppercase truncate max-w-md group-hover:text-blue-600 transition-colors">{pr.title}</h4>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{pr.date}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                             pr.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>{pr.status}</span>
                          <button className="text-gray-300 group-hover:text-blue-600 transition-colors">
                             <Share2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                 <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Releases</button>
              </div>
           </div>

           {/* Media Contacts */}
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Official Media Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <MediaContact name="Rahul Sharma" role="PRO, Disaster Dept" initial="RS" />
                 <MediaContact name="Anita Verma" role="Media Coordinator" initial="AV" />
                 <MediaContact name="Vikram Singh" role="Spokesperson" initial="VS" />
              </div>
           </div>
        </div>

        {/* Media Resources Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Media Resources</h3>
              <div className="grid grid-cols-2 gap-4">
                 <ResourceCard icon={<ImageIcon size={24} />} label="Images (HD)" count="124" />
                 <ResourceCard icon={<Video size={24} />} label="Videos (4K)" count="18" />
                 <ResourceCard icon={<FileText size={24} />} label="Press Kits" count="12" />
                 <ResourceCard icon={<Globe size={24} />} label="Infographics" count="45" />
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Mail size={20} />
                 </div>
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Media Inquiries</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8 uppercase tracking-widest">
                 For urgent press inquiries and interview requests, please contact our media office.
              </p>
              <div className="text-xl font-black text-white mb-8 tracking-tight">press@crisismesh.gov.in</div>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                 Request Interview
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function MediaContact({ name, role, initial }: { name: string; role: string; initial: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
       <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
          {initial}
       </div>
       <div>
          <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{name}</h4>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{role}</p>
       </div>
    </div>
  );
}

function ResourceCard({ icon, label, count }: { icon: React.ReactNode; label: string; count: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-500 transition-all cursor-pointer group flex flex-col items-center text-center">
       <div className="text-gray-400 group-hover:text-blue-600 mb-3 group-hover:scale-110 transition-transform">{icon}</div>
       <p className="text-[9px] font-black text-[#0f172a] uppercase tracking-tight mb-1">{label}</p>
       <p className="text-[8px] font-bold text-gray-400 uppercase">{count} Files</p>
    </div>
  );
}
