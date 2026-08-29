'use client';

import React from 'react';
import { 
  Ticket, Search, Filter, Plus, ChevronDown, 
  MoreHorizontal, Clock, CheckCircle2, AlertCircle,
  MessageSquare, User, Wrench, Shield, ArrowUpRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const ticketStats = [
  { label: 'Total Tickets', value: '256', sub: '+12 this week', icon: <Ticket size={20} /> },
  { label: 'Open', value: '56', sub: 'Action Required', icon: <AlertCircle size={20} className="text-red-500" /> },
  { label: 'In Progress', value: '34', sub: 'Currently Active', icon: <Clock size={20} className="text-blue-500" /> },
  { label: 'Resolved', value: '142', sub: '92% Satisfaction', icon: <CheckCircle2 size={20} className="text-green-500" /> },
  { label: 'Critical', value: '24', sub: 'SLA Violations', icon: <Wrench size={20} className="text-orange-500" /> },
];

const tickets = [
  { id: 'TKT-284', subject: 'Sensor not sending data', category: 'Hardware', priority: 'High', status: 'Open', assignedTo: 'Arpit Kumar', lastUpdate: '2h ago' },
  { id: 'TKT-281', subject: 'Map layers not loading', category: 'Web App', priority: 'Medium', status: 'In Progress', assignedTo: 'Sneha Verma', lastUpdate: '4h ago' },
  { id: 'TKT-278', subject: 'User permission error', category: 'Access', priority: 'High', status: 'Open', assignedTo: 'Amit Singh', lastUpdate: '6h ago' },
  { id: 'TKT-275', subject: 'Login issue on Mobile App', category: 'Mobile App', priority: 'Medium', status: 'Resolved', assignedTo: 'Priya Verma', lastUpdate: 'Yesterday' },
  { id: 'TKT-272', subject: 'Data export timeout', category: 'Reports', priority: 'Low', status: 'Resolved', assignedTo: 'Rahul Kumar', lastUpdate: '2 days ago' },
];

export default function SupportTicketsPage() {
  return (
    <OperationsShell eyebrow="Track and manage system maintenance and support requests" title="Maintenance & Support Tickets">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {ticketStats.map((stat, i) => (
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
        {/* Tickets Table */}
        <div className="col-span-12 lg:col-span-9">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
                 <div className="flex gap-4">
                    {['All Tickets', 'Open', 'In Progress', 'Resolved', 'Closed'].map(tab => (
                       <button key={tab} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'All Tickets' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                          {tab}
                       </button>
                    ))}
                 </div>
                 <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
                    <Plus size={16} /> New Ticket
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Ticket ID</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Priority</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Assigned To</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {tickets.map((t, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-[11px] font-black text-blue-600 uppercase">#{t.id}</td>
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase truncate max-w-[200px]">{t.subject}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.category}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                t.priority === 'High' ? 'bg-red-50 text-red-600' : 
                                t.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                                'bg-blue-50 text-blue-600'
                             }`}>{t.priority}</span>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                t.status === 'Open' ? 'bg-red-100 text-red-600' : 
                                t.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                                'bg-green-100 text-green-600'
                             }`}>{t.status}</span>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase">{t.assignedTo}</td>
                          <td className="px-8 py-5 text-right">
                             <button className="text-gray-300 group-hover:text-blue-600 transition-colors"><MoreHorizontal size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Sidebar Summary */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">SLA Compliance</h3>
              <div className="space-y-6">
                 <ComplianceItem label="Avg Response Time" value="2h 18m" target="< 4h" />
                 <ComplianceItem label="Avg Resolution" value="6h 42m" target="< 12h" />
                 <ComplianceItem label="SLA Violations" value="92%" status="Good" />
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">Support Resources</h3>
              <div className="space-y-4">
                 <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                    System Manual <ArrowUpRight size={14} />
                 </button>
                 <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                    API Docs <ArrowUpRight size={14} />
                 </button>
                 <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">
                    Hardware Guide <ArrowUpRight size={14} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ComplianceItem({ label, value, target, status }: { label: string; value: string; target?: string; status?: string }) {
  return (
    <div className="flex items-center justify-between">
       <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-[#0f172a]">{value}</p>
       </div>
       <div className="text-right">
          {target && <p className="text-[8px] font-bold text-gray-300 uppercase">Target: {target}</p>}
          {status && <span className="text-[8px] font-black text-green-500 uppercase">{status}</span>}
       </div>
    </div>
  );
}
