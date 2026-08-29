'use client';

import React from 'react';
import { 
  MessageSquare, Mail, Smartphone, Bell, 
  ChevronRight, Plus, Search, Filter,
  CheckCircle2, Clock, MoreHorizontal,
  Copy, Edit2, Trash2, Eye, Layout
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const templates = [
  { id: 'TMP-001', name: 'Heavy Rain Alert', channel: 'SMS', lang: 'English', status: 'Active', updated: '25 Aug 2026' },
  { id: 'TMP-002', name: 'Flood Warning', channel: 'Email', lang: 'Hindi', status: 'Active', updated: '24 Aug 2026' },
  { id: 'TMP-003', name: 'Evacuation Advisory', channel: 'WhatsApp', lang: 'English', status: 'Active', updated: '22 Aug 2026' },
  { id: 'TMP-004', name: 'Shelter Information', channel: 'Push', lang: 'Rajasthani', status: 'Active', updated: '20 Aug 2026' },
  { id: 'TMP-005', name: 'Road Closure Alert', channel: 'SMS', lang: 'English', status: 'Active', updated: '18 Aug 2026' },
  { id: 'TMP-006', name: 'Emergency Update', channel: 'IVR', lang: 'Hindi', status: 'Draft', updated: '15 Aug 2026' },
];

export default function NotificationTemplatesPage() {
  return (
    <OperationsShell eyebrow="Manage notification and alert templates" title="Notification Templates">
      <div className="grid grid-cols-12 gap-8">
        {/* Templates List */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
                 <div className="flex gap-4">
                    {['All Templates', 'SMS', 'Push', 'Email', 'WhatsApp'].map(tab => (
                       <button key={tab} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'All Templates' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                          {tab}
                       </button>
                    ))}
                 </div>
                 <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
                    <Plus size={16} /> New Template
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Template Name</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Channel</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Language</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Updated</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {templates.map((t, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-sm font-black text-[#0f172a] uppercase">{t.name}</td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                {t.channel === 'SMS' ? <Smartphone size={14} className="text-blue-500" /> : <Bell size={14} className="text-orange-500" />}
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{t.channel}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{t.lang}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                t.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                             }`}>{t.status}</span>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{t.updated}</td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-3 text-gray-300 group-hover:text-blue-600">
                                <Copy size={14} />
                                <Edit2 size={14} />
                                <MoreHorizontal size={14} />
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Template Preview Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Template Preview</h3>
              <div className="flex-1 bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                 <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                       <Smartphone size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-[#0f172a] uppercase">SMS Notification</p>
                       <p className="text-[8px] font-bold text-gray-400 uppercase">English • v1.2</p>
                    </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 leading-relaxed">
                    CRISIS-MESH ALERT: Heavy rainfall expected in [DISTRICT] for next [HOURS]h. Stay indoors and move to [SHELTER] if required.
                 </div>
                 <div className="mt-8 space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Variables</p>
                    <div className="flex flex-wrap gap-2">
                       {['[DISTRICT]', '[HOURS]', '[SHELTER]', '[INTENSITY]'].map(v => (
                          <span key={v} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black">{v}</span>
                       ))}
                    </div>
                 </div>
              </div>
              <button className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                 Send Test Notification
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}
