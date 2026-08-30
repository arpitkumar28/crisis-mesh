'use client';

import React from 'react';
import {
  FileText, ChevronDown, Plus, Download,
  Trash2,
  Info, Flame, LifeBuoy
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie
} from 'recharts';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-bold text-blue-900/20 text-4xl">Loading Map...</div>
});

const damageStats = [
  { label: 'Residential Buildings', value: 85, color: '#3b82f6' },
  { label: 'Roads & Bridges', value: 42, color: '#10b981' },
  { label: 'Agriculture', value: 65, color: '#f59e0b' },
  { label: 'Public Utilities', value: 28, color: '#ef4444' },
  { label: 'Others', value: 12, color: '#94a3b8' },
];

const impactSummary = [
  { label: 'People Affected', value: '12,450', sub: '+12% vs last report' },
  { label: 'Houses Damaged', value: '3,214', sub: 'Verified by Field Teams' },
  { label: 'Roads Blocked (km)', value: '88.4', sub: 'Restoration in Progress' },
  { label: 'Bridges Damaged', value: '1,245', sub: 'Critical Infrastructure' },
  { label: 'Total Estimated Loss', value: '₹ 48.7 Cr', sub: 'Initial Assessment' },
];

const recentAssessments = [
  { id: 'AS-902', location: 'Malviya Nagar', type: 'Flood', team: 'Team Alpha', status: 'In Progress', lastUpdate: '25 Aug, 10:15 AM' },
  { id: 'AS-845', location: 'Jhalana', type: 'Flood', team: 'Team Beta', status: 'Completed', lastUpdate: '25 Aug, 09:30 AM' },
  { id: 'AS-712', location: 'Sanganer', type: 'Flood', team: 'Team Gamma', status: 'In Progress', lastUpdate: '25 Aug, 08:45 AM' },
];

export default function DisasterImpactAssessment() {
  return (
    <OperationsShell eyebrow="Assess damage and impact after disaster" title="Disaster Impact Assessment">
      {/* Top Filter & Search */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Incident</p>
              <button className="flex items-center gap-2 text-xs font-black text-[#0f172a]">Flood - Aug 2025 <ChevronDown size={12} /></button>
           </div>
           <div className="h-8 w-px bg-gray-200"></div>
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Affected District</p>
              <button className="flex items-center gap-2 text-xs font-black text-[#0f172a]">Jaipur <ChevronDown size={12} /></button>
           </div>
           <div className="h-8 w-px bg-gray-200"></div>
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Assessment Date</p>
              <button className="flex items-center gap-2 text-xs font-black text-[#0f172a]">25 Aug 2025 <ChevronDown size={12} /></button>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assessment Team</p>
              <p className="text-xs font-black text-[#0f172a]">Team Alpha</p>
           </div>
           <div className="text-right ml-6">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</p>
              <span className="text-xs font-black text-blue-600">In Progress</span>
           </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Impact Summary & Damage */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Impact Summary</h3>
            <div className="grid grid-cols-5 gap-4 mb-10">
               {impactSummary.map((stat, i) => (
                 <div key={i}>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h4 className="text-2xl font-black text-[#0f172a] leading-none mb-1">{stat.value}</h4>
                    <p className="text-[8px] font-bold text-gray-400">{stat.sub}</p>
                 </div>
               ))}
            </div>

            <div>
               <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-6">Damage by Category</h4>
               <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-7 space-y-4">
                     {damageStats.map((item, i) => (
                        <div key={i} className="space-y-1">
                           <div className="flex justify-between text-[10px] font-bold text-gray-600">
                              <span>{item.label}</span>
                              <span>{item.value}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="col-span-5 flex items-center justify-center">
                     <div className="h-40 w-40">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={damageStats}
                                 innerRadius={50}
                                 outerRadius={70}
                                 paddingAngle={5}
                                 dataKey="value"
                              >
                                 {damageStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                 ))}
                              </Pie>
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Recent Assessments</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase">View All Assessments</button>
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Location</th>
                      <th className="px-8 py-4">Type</th>
                      <th className="px-8 py-4">Team</th>
                      <th className="px-8 py-4">Progress</th>
                      <th className="px-8 py-4 text-right">Last Update</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {recentAssessments.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                         <td className="px-8 py-4 text-[10px] font-black text-[#0f172a] uppercase">{item.location}</td>
                         <td className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase">{item.type}</td>
                         <td className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase">{item.team}</td>
                         <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${item.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: item.status === 'Completed' ? '100%' : '65%' }}></div>
                               </div>
                               <span className="text-[8px] font-black uppercase text-gray-400">{item.status}</span>
                            </div>
                         </td>
                         <td className="px-8 py-4 text-right text-[9px] font-bold text-gray-400">{item.lastUpdate}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Right Column: Impact Map & Quick Actions */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="px-6 py-4 border-b border-gray-100">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Impact Map</h3>
              </div>
              <div className="flex-1 relative bg-blue-50">
                 <LiveMap entities={[]} />
                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg border border-gray-100">
                       <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Impact Intensity</p>
                       <div className="space-y-1.5">
                          <LegendItem color="bg-red-500" label="High Impact" />
                          <LegendItem color="bg-orange-500" label="Medium Impact" />
                          <LegendItem color="bg-yellow-500" label="Low Impact" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px] mb-8">Quick Actions</h3>
              <div className="grid grid-cols-1 gap-4">
                 <ActionButton icon={<Plus size={16} />} label="Start New Assessment" />
                 <ActionButton icon={<FileText size={16} />} label="Generate Impact Report" />
                 <ActionButton icon={<Download size={16} />} label="Export Data" />
                 <ActionButton icon={<Trash2 size={16} />} label="Discard / Reset Report" />
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
       <div className={`w-2 h-2 rounded-full ${color}`}></div>
       <span className="text-[8px] font-black uppercase text-gray-500">{label}</span>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  const isDanger = label.includes('Discard');
  return (
    <button className={`flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-all group w-full text-left`}>
       <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center ${isDanger ? 'text-red-500' : 'text-blue-600'} shadow-sm group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <span className={`text-[10px] font-black uppercase tracking-widest ${isDanger ? 'text-red-600' : 'text-[#0f172a]'}`}>{label}</span>
    </button>
  );
}
