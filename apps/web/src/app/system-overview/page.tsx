'use client';

import React from 'react';
import { 
  Activity, Shield, Bell, CheckCircle2, AlertTriangle, 
  Search, ChevronDown, Map as MapIcon, Globe,
  Cpu, Database, Wifi, Server, Zap, Navigation,
  Plus, Radio, Layout, ArrowUpRight, Clock
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { 
  ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20 text-4xl">Loading Overview Map...</div> 
});

const recentActivity = [
  { time: '10:45 AM', event: 'Flood alert in Jaipur South updated', type: 'Alert', icon: <Bell size={12} className="text-orange-500" /> },
  { time: '10:30 AM', event: 'New incident reported in Mahapura', type: 'Incident', icon: <AlertTriangle size={12} className="text-red-500" /> },
  { time: '10:15 AM', event: 'Evacuation route 4 successfully cleared', type: 'Evacuation', icon: <Navigation size={12} className="text-green-500" /> },
  { time: '09:45 AM', event: 'New volunteer registered', type: 'User', icon: <Plus size={12} className="text-blue-500" /> },
];

export default function FinalSystemOverview() {
  return (
    <OperationsShell eyebrow="Complete platform system status" title="Final System Overview">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
           <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-black text-green-600 uppercase tracking-widest">System Healthy</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Alerts</p>
              <h4 className="text-xl font-black text-orange-500 uppercase">12</h4>
           </div>
           <div className="text-right ml-6">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Incidents</p>
              <h4 className="text-xl font-black text-red-500 uppercase">3</h4>
           </div>
           <div className="text-right ml-6">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Responders (Field)</p>
              <h4 className="text-xl font-black text-blue-600 uppercase">256</h4>
           </div>
           <div className="text-right ml-6">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Uptime (30d)</p>
              <h4 className="text-xl font-black text-[#0f172a] uppercase">99.92%</h4>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main: Live Map Overview */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-widest text-[10px]">Live Map Overview</h3>
                 <div className="flex items-center gap-6 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> Incident</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Responders</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Safe Zone</div>
                 </div>
              </div>
              <div className="flex-1 relative bg-blue-50">
                 <LiveMap entities={[]} />
                 <div className="absolute top-6 left-6">
                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-[#0f172a]"><Navigation size={20} /></button>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Recent Activity</h3>
              <div className="space-y-6">
                 {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-all">
                             {activity.icon}
                          </div>
                          <div>
                             <p className="text-xs font-black text-[#0f172a] uppercase">{activity.event}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{activity.type} • {activity.time}</p>
                          </div>
                       </div>
                       <button className="text-[9px] font-black text-blue-600 uppercase hover:underline">Details</button>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-10 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[9px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all">View All Activity &rarr;</button>
           </div>
        </div>

        {/* Sidebar: System Health & Quick Actions */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">System Health</h3>
              <div className="space-y-6">
                 <HealthItem label="Sensor Network" status="Operational" icon={<Radio size={16} />} />
                 <HealthItem label="AI & Analytics" status="Operational" icon={<Zap size={16} />} />
                 <HealthItem label="Communication" status="Operational" icon={<Wifi size={16} />} />
                 <HealthItem label="Data Storage" status="Operational" icon={<Database size={16} />} />
                 <HealthItem label="Edge Engines" status="Operational" icon={<Cpu size={16} />} />
                 <HealthItem label="Cloud Infrastructure" status="Operational" icon={<Server size={16} />} />
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest mb-8">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                 <QuickAction icon={<Bell size={16} />} label="Create Alert" />
                 <QuickAction icon={<AlertTriangle size={16} />} label="Report Incident" />
                 <QuickAction icon={<Layout size={16} />} label="View Dashboard" />
                 <QuickAction icon={<Radio size={16} />} label="Emergency Broadcast" />
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Activity size={20} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Network Load</h4>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Peak Response Time</span>
                    <span className="text-white">142ms</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[65%]"></div>
                 </div>
                 <div className="pt-4 flex items-center justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Last Checked: 1 min ago</span>
                    <div className="flex items-center gap-2 text-green-500">
                       <CheckCircle2 size={10} /> Optimal
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function HealthItem({ label, status, icon }: { label: string; status: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
       <div className="flex items-center gap-3">
          <div className="text-gray-400">{icon}</div>
          <span className="text-[10px] font-bold text-gray-500 uppercase">{label}</span>
       </div>
       <span className="text-[8px] font-black text-green-500 uppercase">{status}</span>
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl transition-all group">
       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <span className="text-[9px] font-black text-[#0f172a] uppercase tracking-widest">{label}</span>
    </button>
  );
}
