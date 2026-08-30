'use client';

import React from 'react';
import { 
  Search, Check, X
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const stats = [
  { label: 'Pending Approval', value: '8', color: 'text-blue-600' },
  { label: 'Approved Today', value: '12', color: 'text-green-600' },
  { label: 'Rejected Today', value: '2', color: 'text-red-500' },
  { label: 'Avg. Approval Time', value: '18 min', color: 'text-[#0f172a]' },
];

const pendingAlerts = [
  { id: 'AL-902', title: 'Heavy Rainfall Alert', type: 'Weather', severity: 'High', source: 'IMD System', submittedBy: 'IMD System', submittedAt: '25 Aug 2025, 10:15 AM' },
  { id: 'AL-901', title: 'River Water Level Rising', type: 'Flood', severity: 'Medium', source: 'CrisisMesh', submittedBy: 'System Bot', submittedAt: '25 Aug 2025, 09:45 AM' },
  { id: 'AL-900', title: 'Strong Wind Alert', type: 'Weather', severity: 'Low', source: 'IMD System', submittedBy: 'IMD System', submittedAt: '25 Aug 2025, 09:30 AM' },
  { id: 'AL-899', title: 'Heat Wave Alert', type: 'Weather', severity: 'Medium', source: 'IMD System', submittedBy: 'IMD System', submittedAt: '25 Aug 2025, 08:30 AM' },
];

const alertHistory = [
  { title: 'Landslide Warning', type: 'Landslide', severity: 'High', source: 'Geology Dept.', submittedBy: 'Dr. Verma', submittedAt: '24 Aug 2025, 02:30 PM', action: 'Approved' },
  { title: 'Thunderstorm Warning', type: 'Weather', severity: 'Medium', source: 'IMD System', submittedBy: 'IMD System', submittedAt: '24 Aug 2025, 01:15 PM', action: 'Approved' },
];

export default function AlertApprovalWorkflow() {
  return (
    <OperationsShell eyebrow="Review and approve alerts before publishing" title="Alert Approval Workflow">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-bold focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">AK</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <h4 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Pending Alerts Table */}
        <div className="col-span-12 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Pending Alerts</h3>
              <button className="text-[9px] font-black text-blue-600 uppercase">View All Pending</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Alert Title</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">Severity</th>
                  <th className="px-8 py-4">Source</th>
                  <th className="px-8 py-4">Submitted By</th>
                  <th className="px-8 py-4">Submitted At</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
                {pendingAlerts.map((alert, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 font-black text-[#0f172a] uppercase">{alert.title}</td>
                    <td className="px-8 py-4 text-gray-500 uppercase">{alert.type}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full uppercase text-[8px] font-black ${
                        alert.severity === 'High' ? 'bg-red-100 text-red-600' : 
                        alert.severity === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>{alert.severity}</span>
                    </td>
                    <td className="px-8 py-4 text-gray-400 uppercase">{alert.source}</td>
                    <td className="px-8 py-4 text-[#0f172a] uppercase">{alert.submittedBy}</td>
                    <td className="px-8 py-4 text-gray-400 uppercase">{alert.submittedAt}</td>
                    <td className="px-8 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button className="w-7 h-7 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition-all border border-green-100">
                             <Check size={14} />
                          </button>
                          <button className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all border border-red-100">
                             <X size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Alert History</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Alert Title</th>
                  <th className="px-8 py-4">Type</th>
                  <th className="px-8 py-4">Severity</th>
                  <th className="px-8 py-4">Source</th>
                  <th className="px-8 py-4">Submitted By</th>
                  <th className="px-8 py-4">Submitted At</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
                {alertHistory.map((alert, i) => (
                  <tr key={i} className="text-gray-400">
                    <td className="px-8 py-4 uppercase">{alert.title}</td>
                    <td className="px-8 py-4 uppercase">{alert.type}</td>
                    <td className="px-8 py-4 uppercase">{alert.severity}</td>
                    <td className="px-8 py-4 uppercase">{alert.source}</td>
                    <td className="px-8 py-4 uppercase">{alert.submittedBy}</td>
                    <td className="px-8 py-4 uppercase">{alert.submittedAt}</td>
                    <td className="px-8 py-4 text-right">
                       <span className="text-green-500 uppercase font-black text-[8px]">{alert.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-8 py-4 bg-gray-50 text-center">
               <button className="text-[9px] font-black text-blue-600 uppercase">View Full History &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}
