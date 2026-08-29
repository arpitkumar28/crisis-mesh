'use client';

import React from 'react';
import { 
  History, Search, Filter, Download, ChevronDown,
  User, Shield, Radio, Bell, AlertTriangle, 
  Clock, CheckCircle2, Info, ArrowUpRight,
  Database, Lock, Eye, FileText
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const auditData = [
  { id: 1, time: '25 Aug 2026, 02:50 PM', user: 'Arpit Kumar', action: 'Login', module: 'Authentication', details: 'User logged in successfully', ip: '192.168.1.10', status: 'Success' },
  { id: 2, time: '25 Aug 2026, 02:45 PM', user: 'Admin', action: 'Update Role', module: 'User Management', details: 'Updated role for USR-042', ip: '192.168.1.10', status: 'Success' },
  { id: 3, time: '25 Aug 2026, 02:30 PM', user: 'Rajesh Singh', action: 'Delete Device', module: 'Sensors', details: 'Removed device SN-902', ip: '192.168.1.15', status: 'Warning' },
  { id: 4, time: '25 Aug 2026, 02:15 PM', user: 'System', action: 'Backup', module: 'System', details: 'Automatic DB backup completed', ip: '127.0.0.1', status: 'Success' },
  { id: 5, time: '25 Aug 2026, 02:00 PM', user: 'Priya Sharma', action: 'Create Incident', module: 'Incidents', details: 'Created INC-042', ip: '192.168.1.22', status: 'Success' },
  { id: 6, time: '25 Aug 2026, 01:50 PM', user: 'Admin', action: 'Config Change', module: 'Settings', details: 'Changed threshold to 85%', ip: '192.168.1.10', status: 'Success' },
  { id: 7, time: '25 Aug 2026, 01:30 PM', user: 'Megha Pathak', action: 'Export Data', module: 'Reports', details: 'Downloaded monthly analytics', ip: '192.168.1.45', status: 'Success' },
  { id: 8, time: '25 Aug 2026, 01:00 PM', user: 'System', action: 'API Failure', module: 'Integrations', details: 'IMD Weather API timeout', ip: '172.16.0.4', status: 'Failure' },
];

const auditStats = [
  { label: 'Total Activities', value: '12,847', sub: '+18% in last 7 days', icon: <History size={20} /> },
  { label: 'Critical Actions', value: '245', sub: '12 require review', icon: <AlertTriangle size={20} className="text-red-500" /> },
  { label: 'Failed Attempts', value: '87', sub: '1.2% fail rate', icon: <Lock size={20} className="text-orange-500" /> },
  { label: 'Active Users', value: '196', sub: 'Online Now', icon: <User size={20} className="text-blue-500" /> },
  { label: 'Data Exported', value: '1,245', sub: 'Files this 7 days', icon: <FileText size={20} className="text-purple-500" /> },
];

export default function AuditLogsPage() {
  return (
    <OperationsShell eyebrow="Track system activities and audit trails" title="Audit Logs">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {auditStats.map((stat, i) => (
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

      {/* Toolbar */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <FilterSelect label="All Users" />
          <FilterSelect label="All Actions" />
          <FilterSelect label="All Modules" />
          <FilterSelect label="All Status" />
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0f172a] shadow-sm">
            <Clock size={16} className="text-gray-400" /> 19 Aug 2026 - 25 Aug 2026 <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search audit trail..." 
              className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
            <Download size={16} /> Export Logs
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Module</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">IP Address</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {auditData.map((item, i) => (
              <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
                      <Clock size={12} className="text-gray-300" />
                      {item.time}
                   </div>
                </td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[9px] font-black uppercase">
                         {item.user.slice(0, 1)}
                      </div>
                      <span className="text-xs font-black text-[#0f172a] uppercase">{item.user}</span>
                   </div>
                </td>
                <td className="px-8 py-5">
                   <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">{item.action}</span>
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.module}</td>
                <td className="px-8 py-5 text-[10px] font-bold text-gray-400 font-mono">{item.ip}</td>
                <td className="px-8 py-5">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                    item.status === 'Success' ? 'bg-green-100 text-green-600' : 
                    item.status === 'Warning' ? 'bg-orange-100 text-orange-600' : 
                    'bg-red-100 text-red-600'
                  }`}>{item.status}</span>
                </td>
                <td className="px-8 py-5 text-right">
                   <button className="text-gray-300 group-hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing 1 to 8 of 12,847 logs</p>
           <div className="flex gap-1">
              <button className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-blue-500/20">1</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">2</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">3</button>
              <span className="px-2 text-gray-300">...</span>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">1605</button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-2.5 pr-10 text-[10px] font-black text-[#0f172a] uppercase tracking-widest focus:outline-none hover:bg-gray-50 transition-all shadow-sm cursor-pointer">
        <option>{label}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    </div>
  );
}
