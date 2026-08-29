'use client';

import React from 'react';
import { 
  Smartphone, Download, Activity, Globe, 
  Smartphone as PhoneIcon, Apple, Play, 
  CheckCircle2, Clock, AlertTriangle, RefreshCw,
  Plus, MoreHorizontal, BarChart3, PieChart,
  User, Shield
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const appStats = [
  { label: 'Current Version', value: 'v2.4.1', sub: 'Android & iOS', icon: <Smartphone size={20} /> },
  { label: 'Total Downloads', value: '48,256', sub: '+2,215 this week', icon: <Download size={20} className="text-blue-500" /> },
  { label: 'Active Users', value: '12,845', sub: 'Last 24 Hours', icon: <User size={20} className="text-green-500" /> },
  { label: 'Crash Rate', value: '0.42%', sub: '-0.12% vs week', icon: <Activity size={20} className="text-orange-500" /> },
  { label: 'User Rating', value: '4.5/5', sub: '1,245 reviews', icon: <Star size={20} className="text-purple-500" /> },
];

const versionHistory = [
  { version: 'v2.4.1', date: '25 Aug 2026', status: 'Active', size: '24.2 MB', downloads: '45.6k' },
  { version: 'v2.4.0', date: '18 Aug 2026', status: 'Deprecated', size: '23.8 MB', downloads: '112k' },
  { version: 'v2.3.5', date: '10 Aug 2026', status: 'Deprecated', size: '23.5 MB', downloads: '85k' },
];

const platformData = [
  { name: 'Android', value: 65, color: '#3b82f6' },
  { name: 'iOS', value: 35, color: '#10b981' },
];

const featureUsage = [
  { name: 'Live Map', value: 92, color: '#3b82f6' },
  { name: 'Alerts', value: 85, color: '#ef4444' },
  { name: 'SOS', value: 45, color: '#f59e0b' },
  { name: 'Incident Report', value: 32, color: '#06b6d4' },
];

export default function MobileAppManagementPage() {
  return (
    <OperationsShell eyebrow="Manage app versions, releases and analytics" title="Mobile App Management">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {appStats.map((stat, i) => (
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
        {/* App Version History */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">App Release History</h3>
                 <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                    <Plus size={16} /> New Release
                 </button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Version</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Release Date</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Downloads</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Size</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-4 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {versionHistory.map((v, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 text-sm font-black text-blue-600 uppercase">{v.version}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase">{v.date}</td>
                          <td className="px-8 py-5 text-[10px] font-black text-[#0f172a]">{v.downloads}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{v.size}</td>
                          <td className="px-8 py-5">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                v.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                             }`}>{v.status}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="text-gray-300 group-hover:text-blue-600 transition-colors"><MoreHorizontal size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Feature Usage Chart */}
           <div className="bg-white rounded-[40px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Top Features Used <span className="text-gray-400 font-bold ml-2">(Public App)</span></h3>
                 <BarChart3 size={16} className="text-blue-500" />
              </div>
              <div className="space-y-6">
                 {featureUsage.map(f => (
                    <div key={f.name}>
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-gray-500">{f.name}</span>
                          <span className="text-[#0f172a]">{f.value}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${f.color}`} style={{ width: `${f.value}%` }}></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Platform Distribution sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Platform Distribution</h3>
              <div className="flex-1 min-h-[250px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                       <Pie data={platformData} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                          {platformData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                       </Pie>
                       <Tooltip />
                    </RePieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-[#0f172a]">12.8k</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Active Users</span>
                 </div>
              </div>
              <div className="mt-8 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <Play size={16} />
                       </div>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Android Users</span>
                    </div>
                    <span className="text-xs font-black text-[#0f172a]">65%</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                          <Apple size={16} />
                       </div>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">iOS Users</span>
                    </div>
                    <span className="text-xs font-black text-[#0f172a]">35%</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-blue-400">Push Hub</h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8 uppercase tracking-widest">
                 Send direct push notifications to all mobile users or specific geographic segments.
              </p>
              <button className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                 Compose Push Alert
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function Star({ size, className }: { size?: number; className?: string }) {
  return <Activity size={size} className={className} />;
}
