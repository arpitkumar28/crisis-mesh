'use client';

import React from 'react';
import { 
  Users, UserPlus, Heart, Shield, Activity, 
  Search, Filter, Plus, Download, ChevronDown,
  CheckCircle2, AlertTriangle, Clock, Phone,
  MapPin, MoreHorizontal, PieChart as PieChartIcon
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';

const volunteerStats = [
  { label: 'Total Volunteers', value: '1,248', sub: '+12% vs last month', icon: <Users size={20} /> },
  { label: 'Active Volunteers', value: '892', sub: '71.5% Activity Rate', icon: <CheckCircle2 size={20} className="text-green-500" /> },
  { label: 'On Duty', value: '312', sub: 'Deployed Now', icon: <Activity size={20} className="text-blue-500" /> },
  { label: 'Active Teams', value: '86', sub: 'Across 14 Regions', icon: <Shield size={20} className="text-purple-500" /> },
  { label: 'Available Now', value: '156', sub: 'Standby Status', icon: <Clock size={20} className="text-orange-500" /> },
];

const volunteers = [
  { id: 'VOL-001', name: 'Rahul Sharma', contact: '+91 98765 43210', skills: 'First Aid, Rescue', team: 'Team Alpha', status: 'On-Duty', lastActive: '2 min ago' },
  { id: 'VOL-002', name: 'Priya Verma', contact: '+91 98765 43211', skills: 'Medical, Relief', team: 'Team Beta', status: 'Available', lastActive: '15 min ago' },
  { id: 'VOL-003', name: 'Arjun Singh', contact: '+91 98765 43212', skills: 'Rescue, Logistics', team: 'Team Gamma', status: 'On-Duty', lastActive: '32 min ago' },
  { id: 'VOL-004', name: 'Sneha Joshi', contact: '+91 98765 43213', skills: 'Communication', team: 'Team Delta', status: 'Inactive', lastActive: '2 days ago' },
  { id: 'VOL-005', name: 'Akash Mehra', contact: '+91 98765 43214', skills: 'Driver, Transport', team: 'Team Epsilon', status: 'On-Duty', lastActive: '1h ago' },
  { id: 'VOL-006', name: 'Neha Rani', contact: '+91 98765 43215', skills: 'Counseling', team: 'Team North', status: 'Available', lastActive: '4h ago' },
];

const distributionData = [
  { name: 'Rescue', value: 34, color: '#ef4444' },
  { name: 'Medical', value: 26, color: '#3b82f6' },
  { name: 'Logistics', value: 18, color: '#f59e0b' },
  { name: 'Comm', value: 12, color: '#10b981' },
  { name: 'Other', value: 10, color: '#94a3b8' },
];

export default function VolunteerManagementPage() {
  return (
    <OperationsShell eyebrow="Manage volunteers and field support teams" title="Volunteer Management">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {volunteerStats.map((stat, i) => (
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
        {/* Volunteers Table */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
                 <div className="flex gap-4">
                    {['All Volunteers', 'On Duty', 'Available', 'Teams'].map(tab => (
                       <button key={tab} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'All Volunteers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                          {tab}
                       </button>
                    ))}
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input type="text" placeholder="Search volunteer..." className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-48 focus:outline-none" />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400"><Filter size={18} /></button>
                 </div>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Volunteer Name</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Skills</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Team</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {volunteers.map((v, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black">
                                   {v.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-xs font-black text-[#0f172a] uppercase">{v.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500">{v.contact}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v.skills}</td>
                          <td className="px-8 py-5 text-[10px] font-black text-blue-600 uppercase">{v.team}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                v.status === 'On-Duty' ? 'bg-blue-100 text-blue-600' : 
                                v.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                             }`}>{v.status}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="text-gray-300 group-hover:text-blue-600 transition-colors"><MoreHorizontal size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                 <p className="text-[10px] font-black text-gray-400 uppercase">Showing 6 of 1,248 volunteers</p>
                 <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">View All Volunteers →</button>
              </div>
           </div>
        </div>

        {/* Volunteer Distribution */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Volunteer Distribution</h3>
              <div className="flex-1 min-h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={distributionData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                          {distributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-[#0f172a]">1,248</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total Active</span>
                 </div>
              </div>
              <div className="mt-8 space-y-3">
                 {distributionData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.name}</span>
                       </div>
                       <span className="text-xs font-black text-[#0f172a]">{item.value}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}
