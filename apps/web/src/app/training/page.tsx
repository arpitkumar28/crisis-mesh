'use client';

import React from 'react';
import { 
  BookOpen, Users, Clock, CheckCircle2, 
  Plus, Search, Filter, ChevronRight, 
  MoreHorizontal, GraduationCap, Video,
  Calendar, Award, Target, Activity
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const trainingStats = [
  { label: 'Active Programs', value: '32', sub: 'Across 6 Regions', icon: <BookOpen size={20} /> },
  { label: 'In Progress', value: '14', sub: 'Current Sessions', icon: <Activity size={20} className="text-blue-500" /> },
  { label: 'Scheduled', value: '10', sub: 'Next 30 Days', icon: <Calendar size={20} className="text-orange-500" /> },
  { label: 'Total Participants', value: '2,485', sub: 'Certified Responders', icon: <Users size={20} className="text-purple-500" /> },
];

const programs = [
  { id: 'TR-102', title: 'Disaster Response Basics', category: 'General', participants: 450, status: 'In Progress', date: '25 Aug 2026' },
  { id: 'TR-105', title: 'First Aid & CPR Certification', category: 'Medical', participants: 120, status: 'Scheduled', date: '28 Aug 2026' },
  { id: 'TR-108', title: 'Flood Rescue Operations', category: 'Rescue', participants: 85, status: 'In Progress', date: '26 Aug 2026' },
  { id: 'TR-110', title: 'Community Awareness Pro', category: 'Outreach', participants: 1200, status: 'Completed', date: '20 Aug 2026' },
  { id: 'TR-112', title: 'Incident Command Training', category: 'Leadership', participants: 32, status: 'Scheduled', date: '02 Sep 2026' },
];

export default function TrainingCapacityPage() {
  return (
    <OperationsShell eyebrow="Training programs and capacity building for responders" title="Training & Capacity Building">
      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {trainingStats.map((stat, i) => (
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
        {/* Programs List */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
                 <div className="flex gap-4">
                    {['All Programs', 'Active', 'Scheduled', 'Completed'].map(tab => (
                       <button key={tab} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'All Programs' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                          {tab}
                       </button>
                    ))}
                 </div>
                 <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
                    <Plus size={16} /> New Program
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Program Title</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Participants</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {programs.map((p, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-sm font-black text-[#0f172a] uppercase">{p.title}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</td>
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a]">{p.participants}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                p.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                                p.status === 'Scheduled' ? 'bg-orange-100 text-orange-600' : 
                                'bg-green-100 text-green-600'
                             }`}>{p.status}</span>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{p.date}</td>
                          <td className="px-8 py-5 text-right">
                             <button className="text-gray-300 group-hover:text-blue-600 transition-colors"><MoreHorizontal size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Award size={20} />
                 </div>
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Certification Hub</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">
                 Verified responders can download their digital certificates directly from the responder portal once training is validated.
              </p>
              <div className="space-y-4">
                 <CertificationStat label="Certified Operators" value="842" total={1000} />
                 <CertificationStat label="First Responders" value="1,245" total={1500} />
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8 text-center">Upcoming Sessions</h3>
              <div className="space-y-6">
                 <SessionMini title="Emergency Dispatch V2" date="26 Aug" time="10:00 AM" />
                 <SessionMini title="GIS for Commanders" date="27 Aug" time="02:00 PM" />
                 <SessionMini title="LoRa Mesh Networking" date="28 Aug" time="09:00 AM" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function CertificationStat({ label, value, total }: { label: string; value: string; total: number }) {
  const percent = (parseInt(value.replace(',', '')) / total) * 100;
  return (
    <div className="space-y-2">
       <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
          <span className="text-gray-400">{label}</span>
          <span className="text-white">{value} / {total}</span>
       </div>
       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500" style={{ width: `${percent}%` }}></div>
       </div>
    </div>
  );
}

function SessionMini({ title, date, time }: { title: string; date: string; time: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
       <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
             <Video size={18} />
          </div>
          <div>
             <h5 className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{title}</h5>
             <p className="text-[9px] font-bold text-gray-400 uppercase">{date} • {time}</p>
          </div>
       </div>
       <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-all" />
    </div>
  );
}
