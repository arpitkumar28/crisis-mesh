'use client';

import React from 'react';
import { 
  Bell, CheckCircle2, XCircle, Clock, 
  Search, Filter, ChevronRight, MoreVertical,
  AlertTriangle, Shield, Info, User,
  Check, X, Send, Smartphone, MessageSquare, Mail, Globe,
  Download, RefreshCw, BarChart3
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  ResponsiveContainer, 
  PieChart, Pie, Cell, 
} from 'recharts';

const deliveryData = [
  { name: 'Delivered', value: 118942, color: '#22c55e' },
  { name: 'Failed', value: 3126, color: '#ef4444' },
  { name: 'Pending', value: 3616, color: '#94a3b8' },
];

const channelStats = [
  { channel: 'SMS', icon: <Smartphone size={16} />, sent: '62,450', delivered: '58,820', rate: '94.2%', color: 'text-blue-600' },
  { channel: 'WhatsApp', icon: <MessageSquare size={16} />, sent: '38,212', delivered: '36,812', rate: '96.3%', color: 'text-green-600' },
  { channel: 'Email', icon: <Mail size={16} />, sent: '15,024', delivered: '13,210', rate: '87.9%', color: 'text-orange-500' },
  { channel: 'App / Push', icon: <Bell size={16} />, sent: '10,000', delivered: '9,500', rate: '95.0%', color: 'text-purple-600' },
];

export default function EmergencyBroadcastConfirmation() {
  return (
    <OperationsShell eyebrow="Send alert and confirm delivery" title="Emergency Broadcast Confirmation">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">AK</div>
          <span className="text-[10px] font-black uppercase text-gray-400">Admin Authority</span>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
             <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Recipients" value="125,684" color="text-[#0f172a]" />
        <StatCard label="Delivered" value="118,942" color="text-green-600" />
        <StatCard label="Failed" value="3,126" color="text-red-500" />
        <StatCard label="Pending" value="3,616" color="text-gray-400" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Message Preview & Delivery Status */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Message Preview</h3>
            <div className="p-8 bg-red-50 border border-red-100 rounded-[24px]">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                     <AlertTriangle size={18} />
                  </div>
                  <h4 className="text-sm font-black text-red-600 uppercase tracking-tight">Heavy Rainfall Alert</h4>
               </div>
               <p className="text-xs font-bold text-gray-700 leading-relaxed mb-6">
                  Heavy rainfall expected in Jaipur district from 10 Aug, 10:00 AM to 11 Aug, 10:00 AM. 
                  Avoid waterlogged areas. Stay safe.
                  <br /><br />
                  - CrisisMesh Authority
               </p>
               <div className="flex items-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Sent: 10 Aug 2025, 10:15 AM</span>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <span>Area: Jaipur District</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Delivery Status by Channel</h3>
              <button className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-2"><RefreshCw size={12} /> Refresh Status</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Channel</th>
                  <th className="px-8 py-4">Sent</th>
                  <th className="px-8 py-4">Delivered</th>
                  <th className="px-8 py-4 text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[10px] font-bold uppercase">
                {channelStats.map((stat, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${stat.color} border border-gray-100`}>
                             {stat.icon}
                          </div>
                          <span className="text-[#0f172a] font-black">{stat.channel}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-[#0f172a]">{stat.sent}</td>
                    <td className="px-8 py-5 text-[#0f172a]">{stat.delivered}</td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-3">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full ${stat.color.replace('text-', 'bg-')}`} style={{ width: stat.rate }}></div>
                          </div>
                          <span className={stat.color}>{stat.rate}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Visualization & Details */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col items-center">
            <h3 className="w-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Delivery Performance</h3>
            <div className="h-64 w-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deliveryData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {deliveryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-[#0f172a]">94.6%</p>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Success Rate</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 w-full gap-4 mt-10">
               {deliveryData.map((item, i) => (
                 <div key={i} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                       <span className="text-[9px] font-black text-gray-400 uppercase">{item.name}</span>
                    </div>
                    <p className="text-sm font-black text-[#0f172a]">{item.value.toLocaleString()}</p>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px]"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Broadcast Insights</h4>
            </div>
            <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">
               Delivery rate is slightly lower for Email due to high bounce rates in rural sectors. SMS and WhatsApp reached 98% of target population in Jaipur South.
            </p>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-500">Reach Efficiency</span>
                  <span className="text-green-500">Optimal</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[92%]"></div>
               </div>
            </div>
            <button className="w-full mt-10 py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
               View Detailed Audience Log
            </button>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-sm">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <h4 className={`text-3xl font-black ${color}`}>{value}</h4>
    </div>
  );
}
