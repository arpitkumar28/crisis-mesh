'use client';

import React, { useState } from 'react';
import { 
  History, Search, Filter, Download, ChevronDown,
  User, Shield, Radio, Bell, AlertTriangle, 
  Clock, CheckCircle2, Info, ArrowUpRight,
  UserPlus, Settings, Database
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const activityData = [
  { id: 1, time: '25 Aug 2026, 02:50 PM', user: 'Admin', action: 'Login', module: 'Authentication', details: 'User logged in successfully', ip: '192.168.1.10' },
  { id: 2, time: '25 Aug 2026, 02:45 PM', user: 'Admin', action: 'Deploy Team', module: 'Incidents', details: 'NDRF team deployed to Mansarovar', ip: '192.168.1.10' },
  { id: 3, time: '25 Aug 2026, 02:30 PM', user: 'Arpit Kumar', action: 'Update Sensor', module: 'Sensors', details: 'Updated calibration for WL-023', ip: '192.168.1.15' },
  { id: 4, time: '25 Aug 2026, 02:15 PM', user: 'System', action: 'Data Backup', module: 'System', details: 'Automatic backup completed', ip: '127.0.0.1' },
  { id: 5, time: '25 Aug 2026, 02:00 PM', user: 'Admin', action: 'Create Incident', module: 'Incidents', details: 'Created new incident INC-042', ip: '192.168.1.10' },
  { id: 6, time: '25 Aug 2026, 01:50 PM', user: 'Priya Sharma', action: 'Update Resource', module: 'Resources', details: 'Updated inventory for Relief Camp A', ip: '192.168.1.22' },
  { id: 7, time: '25 Aug 2026, 01:30 PM', user: 'System', action: 'Alert Triggered', module: 'Alerts', details: 'Water level critical alert triggered', ip: '127.0.0.1' },
  { id: 8, time: '25 Aug 2026, 01:00 PM', user: 'Admin', action: 'Config Change', module: 'Settings', details: 'Updated alert thresholds', ip: '192.168.1.10' },
];

export default function ActivityLogPage() {
  const [filter, setFilter] = useState('All Users');

  return (
    <OperationsShell eyebrow="Track all system activities and user actions" title="Activity Log">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Users</option>
              <option>Admin</option>
              <option>Operators</option>
              <option>System</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
          <div className="relative">
            <select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>All Actions</option>
              <option>Updates</option>
              <option>Deletions</option>
              <option>Access</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          </div>
          <div className="relative">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50">
              10 Aug 2026 - 25 Aug 2026 <ChevronDown size={14} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Module</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activityData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
                    <Clock size={14} className="text-gray-300" />
                    {item.time}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black">
                      {item.user.slice(0, 1)}
                    </div>
                    <span className="text-xs font-black text-[#0f172a]">{item.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black text-gray-600 uppercase bg-gray-100 px-2 py-0.5 rounded">
                    {item.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                    {item.module}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-medium text-gray-500 line-clamp-1">{item.details}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold text-gray-400 font-mono">{item.ip}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs font-bold text-gray-500">
          <p>Showing 8 of 2,450 activities</p>
          <div className="flex items-center gap-2">
             <button className="w-8 h-8 rounded border bg-[#3b82f6] text-white border-[#3b82f6]">1</button>
             <button className="w-8 h-8 rounded border bg-white border-gray-200 text-gray-700">2</button>
             <button className="w-8 h-8 rounded border bg-white border-gray-200 text-gray-700">3</button>
             <span>...</span>
             <button className="w-8 h-8 rounded border bg-white border-gray-200 text-gray-700">85</button>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}
