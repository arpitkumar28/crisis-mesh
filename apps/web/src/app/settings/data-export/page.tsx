'use client';

import React from 'react';
import { 
  Download, Database, Share2, 
  Plus, Search, Filter, ChevronDown, 
  Clock, CheckCircle2, AlertCircle, RefreshCw,
  Calendar, Mail, Globe, HardDrive, History,
  Table, BarChart3, FileJson
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const exportStats = [
  { label: 'Total Exports', value: '256', sub: 'System Wide', icon: <Download size={20} /> },
  { label: 'Scheduled', value: '18', sub: 'Active Jobs', icon: <Clock size={20} className="text-blue-500" /> },
  { label: 'External Shares', value: '9', sub: 'Active Links', icon: <Share2 size={20} className="text-purple-500" /> },
  { label: 'Data Shared', value: '12,845', sub: 'Records this month', icon: <Database size={20} className="text-green-500" /> },
];

const exportHistory = [
  { id: 'EXP-1024', name: 'Sensor Data - Jaipur', format: 'CSV', target: 'Email (admin@...)', by: 'Arpit Kumar', date: '25 Aug 2026, 02:00 PM', status: 'Completed' },
  { id: 'EXP-1023', name: 'Incident Reports Q3', format: 'PDF', target: 'Internal Storage', by: 'Priya Verma', date: '24 Aug 2026, 04:30 PM', status: 'Completed' },
  { id: 'EXP-1022', name: 'Alert History - RJ', format: 'JSON', target: 'SFTP / External', by: 'System', date: '24 Aug 2026, 11:45 PM', status: 'Failed' },
  { id: 'EXP-1021', name: 'Resource Allocation', format: 'XLSX', target: 'Download', by: 'Megha Pathak', date: '23 Aug 2026, 09:00 AM', status: 'Completed' },
  { id: 'EXP-1020', name: 'Monthly Analytics', format: 'PDF', target: 'Email (dept@...)', by: 'Admin', date: '20 Aug 2026, 02:00 PM', status: 'In Progress' },
];

export default function DataExportSharingPage() {
  return (
    <OperationsShell eyebrow="Export data and share with authorized entities" title="Data Export & Sharing">
      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {exportStats.map((stat, i) => (
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
        {/* Export Form & History */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Export History</h3>
                 <div className="flex gap-4">
                    <button className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest">Manage Schedule</button>
                    <button className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                       <Plus size={16} /> New Export
                    </button>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Export ID</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Data Name</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Format</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {exportHistory.map((exp, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-[10px] font-black text-blue-600 uppercase">#{exp.id}</td>
                          <td className="px-8 py-5">
                             <p className="text-xs font-black text-[#0f172a] uppercase">{exp.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">{exp.target}</p>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{exp.format}</span>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                exp.status === 'Completed' ? 'bg-green-100 text-green-600' : 
                                exp.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                                'bg-red-100 text-red-600'
                             }`}>{exp.status}</span>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{exp.date}</td>
                          <td className="px-8 py-5 text-right">
                             <Download size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Export Tools */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Download size={20} />
                 </div>
                 <h3 className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Quick Export</h3>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Data Type</label>
                    <select className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none">
                       <option>All Sensor Data</option>
                       <option>Incident History</option>
                       <option>Resource Logs</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Date Range</label>
                    <button className="w-full flex items-center justify-between px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest">
                       <span>Last 30 Days</span>
                       <Calendar size={14} className="text-gray-500" />
                    </button>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">File Format</label>
                    <div className="grid grid-cols-3 gap-3">
                       <FormatBtn label="CSV" active />
                       <FormatBtn label="JSON" />
                       <FormatBtn label="PDF" />
                    </div>
                 </div>
                 <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all mt-4">
                    Download Data Package
                 </button>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Data Sharing API</h3>
              <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-6">
                 Authorized agencies can consume real-time platform data via our secure API endpoints.
              </p>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                 <Globe size={18} className="text-blue-600" />
                 <div>
                    <p className="text-[10px] font-black text-[#0f172a] uppercase">API Status: Healthy</p>
                    <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">api.crisismesh.gov.in/v1</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FormatBtn({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
       active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-gray-400'
    }`}>
       {label}
    </button>
  );
}
