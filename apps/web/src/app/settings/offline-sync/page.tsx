'use client';

import React from 'react';
import { 
  Database, RefreshCw, HardDrive, Wifi, WifiOff,
  CheckCircle2, AlertCircle, Clock, Save,
  History, Download, Upload, Shield, ChevronDown
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const syncStats = [
  { label: 'Pending Records', value: '1,248', sub: '+18 new', icon: <Database size={20} /> },
  { label: 'Last Sync', value: '10:24 AM', sub: 'Today', icon: <RefreshCw size={20} className="text-blue-500" /> },
  { label: 'Data Queued', value: '3.42 MB', sub: 'Size', icon: <HardDrive size={20} className="text-purple-500" /> },
  { label: 'Sync Status', value: 'Good', sub: 'All systems normal', icon: <CheckCircle2 size={20} className="text-green-500" /> },
];

const syncQueue = [
  { type: 'Sensor Readings', count: 842, size: '1.24 MB', priority: 'High', status: 'Queued' },
  { type: 'Incident Reports', count: 12, size: '0.45 MB', priority: 'High', status: 'Queued' },
  { type: 'Resource Updates', count: 45, size: '0.22 MB', priority: 'Medium', status: 'Queued' },
  { type: 'Media Files', count: 156, size: '1.45 MB', priority: 'Low', status: 'Queued' },
  { type: 'User Actions', count: 93, size: '0.06 MB', priority: 'Low', status: 'Queued' },
];

const recentSyncs = [
  { id: 'SYNC-902', time: '25 Aug 2026, 10:15 AM', count: 1240, size: '3.1 MB', status: 'Success' },
  { id: 'SYNC-901', time: '25 Aug 2026, 08:30 AM', count: 452, size: '1.2 MB', status: 'Success' },
  { id: 'SYNC-900', time: '24 Aug 2026, 11:45 PM', count: 1120, size: '2.8 MB', status: 'Success' },
];

export default function OfflineSyncPage() {
  return (
    <OperationsShell eyebrow="Manage offline data collection and synchronization" title="Offline Data Sync">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {syncStats.map((stat, i) => (
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
        {/* Sync Queue */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Sync Queue</h3>
                 <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auto Sync</span>
                       <button className="w-8 h-4 rounded-full bg-blue-600 relative">
                          <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white"></div>
                       </button>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                       <RefreshCw size={14} /> Sync Now
                    </button>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Type</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Records</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Size</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {syncQueue.map((q, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase">{q.type}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase">{q.count}</td>
                          <td className="px-8 py-5 text-[10px] font-black text-[#0f172a]">{q.size}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                q.priority === 'High' ? 'bg-red-50 text-red-600' : 
                                q.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                                'bg-blue-50 text-blue-600'
                             }`}>{q.priority}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-2 text-blue-600">
                                <Clock size={12} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{q.status}</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Recent Sync Logs */}
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Sync Activity</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">View History</button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Sync ID</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Records</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Size</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentSyncs.map((s, i) => (
                       <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-[10px] font-black text-blue-600 uppercase">#{s.id}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase">{s.time}</td>
                          <td className="px-8 py-5 text-[10px] font-black text-[#0f172a] uppercase">{s.count}</td>
                          <td className="px-8 py-5 text-[10px] font-black text-[#0f172a] uppercase">{s.size}</td>
                          <td className="px-8 py-5 text-right">
                             <span className="text-[8px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase">{s.status}</span>
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
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-8">Device Storage</h3>
              <div className="flex items-center justify-center mb-10">
                 <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                       <circle cx="80" cy="80" r="74" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                       <circle cx="80" cy="80" r="74" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray="465" strokeDashoffset="125" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-[#0f172a]">73%</span>
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Used Space</span>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Used</span>
                    </div>
                    <span className="text-[10px] font-black text-[#0f172a]">18.4 GB</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-gray-100"></div>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Free</span>
                       </div>
                    <span className="text-[10px] font-black text-[#0f172a]">6.6 GB</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                 <WifiOff size={20} className="text-blue-400" />
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Connectivity Check</h3>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Data is automatically synced when a stable internet connection is detected. Manual override available.
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-8">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase">Network Status</span>
                    <span className="text-[9px] font-black text-orange-500 uppercase">Weak Connection</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Wifi size={16} className="text-orange-500" />
                    <span className="text-xs font-bold uppercase">-84 dBm Signal</span>
                 </div>
              </div>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                 Optimize Sync Data
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}
