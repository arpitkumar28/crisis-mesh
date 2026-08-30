'use client';

import React from 'react';
import { 
  Database, RefreshCw, Download, Upload, 
  CheckCircle2, AlertCircle, Clock, Save,
  HardDrive, History, Plus, FileText, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const backupStats = [
  { label: 'Total Backups', value: '156', sub: 'System-wide', icon: <Database size={20} /> },
  { label: 'Successful', value: '149', sub: '95.5% Success', icon: <CheckCircle2 size={20} className="text-green-500" /> },
  { label: 'Failed', value: '2', sub: '1.3% Fail Rate', icon: <AlertCircle size={20} className="text-red-500" /> },
  { label: 'In Progress', value: '1', sub: 'System Core', icon: <Clock size={20} className="text-blue-500" /> },
  { label: 'Total Size', value: '2.48 TB', sub: 'Cloud Storage', icon: <HardDrive size={20} className="text-purple-500" /> },
];

const backupHistory = [
  { id: 'BK-1024', name: 'Full Backup - 25 Aug 2026', type: 'Full', size: '24.6 GB', status: 'Succeeded', date: '25 Aug 2026, 02:00 AM' },
  { id: 'BK-1023', name: 'Incremental - 24 Aug 2026', type: 'Incremental', size: '2.8 GB', status: 'Succeeded', date: '24 Aug 2026, 02:00 AM' },
  { id: 'BK-1022', name: 'Incremental - 23 Aug 2026', type: 'Incremental', size: '3.1 GB', status: 'Succeeded', date: '23 Aug 2026, 02:00 AM' },
  { id: 'BK-1021', name: 'Incremental - 22 Aug 2026', type: 'Incremental', size: '15.2 GB', status: 'Failed', date: '22 Aug 2026, 02:00 AM' },
  { id: 'BK-1020', name: 'Full Backup - 18 Aug 2026', type: 'Full', size: '23.8 GB', status: 'Succeeded', date: '18 Aug 2026, 02:00 AM' },
];

export default function BackupRestorePage() {
  return (
    <OperationsShell eyebrow="Manage system backups and data recovery" title="Backup & Restore">
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
         {['Backups', 'Restore', 'Backup Settings'].map(tab => (
            <button key={tab} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
               tab === 'Backups' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
               {tab}
               {tab === 'Backups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
         ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
        {backupStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
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
        {/* Backup History Table */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Backup History</h3>
                 <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                    <Plus size={16} /> Create Backup
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Backup Name</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Size</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Created On</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {backupHistory.map((bk, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase">{bk.name}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase">{bk.type}</td>
                          <td className="px-8 py-5 text-[10px] font-black text-[#0f172a]">{bk.size}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                bk.status === 'Succeeded' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                             }`}>{bk.status}</span>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{bk.date}</td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-3 text-gray-300 group-hover:text-blue-600">
                                <Download size={14} />
                                <Upload size={14} />
                                <MoreHorizontal size={14} />
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Settings */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Storage Usage</h3>
              <div className="space-y-6">
                 <div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                       <span className="text-gray-400">Cloud Storage</span>
                       <span className="text-[#0f172a]">2.48 TB / 5 TB</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 w-[49%]"></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-400 uppercase">Retention Policy</span>
                    <span className="text-[10px] font-black text-blue-600 uppercase">30 Days</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8">Backup Schedule</h3>
              <div className="space-y-6">
                 <ScheduleItem label="Full Backup" value="Every Sunday @ 02:00 AM" />
                 <ScheduleItem label="Incremental" value="Every 12 Hours" />
                 <ScheduleItem label="System Config" value="Daily @ 01:00 AM" />
              </div>
              <button className="w-full mt-8 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                 Edit Schedule
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ScheduleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
       <div>
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-xs font-bold text-white uppercase">{value}</p>
       </div>
       <CheckCircle2 size={16} className="text-green-500" />
    </div>
  );
}
