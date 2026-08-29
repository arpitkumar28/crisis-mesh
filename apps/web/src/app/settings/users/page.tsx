'use client';

import React from 'react';
import { 
  Users, UserPlus, Search, Filter, ChevronDown, 
  MoreHorizontal, Mail, Shield, Building,
  CheckCircle2, AlertCircle, Clock, Trash2, Edit2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const users = [
  { id: 'USR-001', name: 'Arpit Kumar', email: 'arpit.kumar@crisismesh.gov.in', role: 'Super Admin', dept: 'Operations', status: 'Active', lastActive: '2 min ago' },
  { id: 'USR-002', name: 'Priya Sharma', email: 'priya.sharma@crisismesh.gov.in', role: 'District Admin', dept: 'Jaipur District', status: 'Active', lastActive: '15 min ago' },
  { id: 'USR-003', name: 'Rajesh Singh', email: 'rajesh.singh@crisismesh.gov.in', role: 'Operator', dept: 'Field Unit', status: 'Active', lastActive: '32 min ago' },
  { id: 'USR-004', name: 'Megha Pathak', email: 'megha.pathak@crisismesh.gov.in', role: 'Field Officer', dept: 'Planning', status: 'Active', lastActive: '1h ago' },
  { id: 'USR-005', name: 'Amit Yadav', email: 'amit.yadav@crisismesh.gov.in', role: 'Viewer', dept: 'Data Team', status: 'Inactive', lastActive: '2 days ago' },
  { id: 'USR-006', name: 'Sanjay Mishra', email: 'sanjay.mishra@crisismesh.gov.in', role: 'Super Admin', dept: 'IT Infrastructure', status: 'Active', lastActive: '4h ago' },
];

const stats = [
  { label: 'Total Users', value: '248', detail: '+12% vs last month', icon: <Users size={20} /> },
  { label: 'Active Users', value: '196', detail: '79.0% efficacy', icon: <CheckCircle2 size={20} className="text-green-500" /> },
  { label: 'Administrators', value: '18', detail: '+2 this month', icon: <Shield size={20} className="text-blue-500" /> },
  { label: 'Departments', value: '14', detail: 'Across 6 regions', icon: <Building size={20} className="text-purple-500" /> },
  { label: 'Pending Invitations', value: '7', detail: 'Avg. response 2h', icon: <Clock size={20} className="text-orange-500" /> },
];

export default function UserManagementPage() {
  return (
    <OperationsShell eyebrow="Manage platform users, roles and permissions" title="User Management">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{stat.icon}</div>
            </div>
            <h4 className="text-3xl font-black text-[#0f172a]">{stat.value}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
             {['All Users', 'Admin', 'Active', 'Inactive', 'Suspended'].map(tab => (
               <button 
                key={tab}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  tab === 'All Users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'
                }`}
               >
                 {tab}
               </button>
             ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1-2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search user, email or role..." 
              className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
            <UserPlus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">User Name</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Active</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u, i) => (
              <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black uppercase">
                         {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs font-black text-[#0f172a] uppercase">{u.name}</span>
                   </div>
                </td>
                <td className="px-8 py-5 text-[11px] font-bold text-gray-500">{u.email}</td>
                <td className="px-8 py-5">
                   <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">{u.role}</span>
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.dept}</td>
                <td className="px-8 py-5">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                    u.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>{u.status}</span>
                </td>
                <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.lastActive}</td>
                <td className="px-8 py-5 text-right">
                   <div className="flex items-center justify-end gap-3 text-gray-300 group-hover:text-[#0f172a]">
                      <button className="hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                      <button className="hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                      <button className="hover:text-[#0f172a] transition-colors"><MoreHorizontal size={14} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing 6 to 61 of 248 users</p>
           <div className="flex gap-1">
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">1</button>
              <button className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">3</button>
              <span className="px-2 text-gray-300">...</span>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">12</button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}
