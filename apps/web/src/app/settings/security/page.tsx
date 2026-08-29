'use client';

import React from 'react';
import { 
  Shield, Lock, Eye, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, Key, Globe, Activity,
  Users, Terminal, RefreshCw, ChevronRight,
  MoreHorizontal, Fingerprint, Bug, Network
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const threatData = [
  { day: '19 Aug', level: 12 },
  { day: '20 Aug', level: 18 },
  { day: '21 Aug', level: 15 },
  { day: '22 Aug', level: 32 },
  { day: '23 Aug', level: 24 },
  { day: '24 Aug', level: 28 },
  { day: '25 Aug', level: 14 },
];

const securityStats = [
  { label: 'Security Score', value: '96/100', status: 'Very High', icon: <Shield size={20} className="text-green-500" /> },
  { label: 'Threats Blocked', value: '1,256', status: 'Last 7 Days', icon: <ShieldAlert size={20} className="text-blue-500" /> },
  { label: 'Failed Logins', value: '87', status: 'Last 24 Hours', icon: <Lock size={20} className="text-orange-500" /> },
  { label: 'Security Patches', value: '3', status: 'Pending Review', icon: <Bug size={20} className="text-red-500" /> },
  { label: 'WAF Compliance', value: '100%', status: 'Operational', icon: <Globe size={20} className="text-purple-500" /> },
];

const recentEvents = [
  { id: 1, event: 'Brute-force login attempt blocked', time: '10:15 AM', source: 'IP 182.16.2.45', severity: 'High' },
  { id: 2, event: 'Suspicious API activity detected', time: '09:30 AM', source: 'Auth Service', severity: 'Medium' },
  { id: 3, event: 'Unusual data access pattern', time: '08:45 AM', source: 'Telemetry Hub', severity: 'Medium' },
  { id: 4, event: 'Database backup encrypted', time: '02:00 AM', source: 'System', severity: 'Success' },
  { id: 5, event: 'SSL Certificate renewed', time: '24 Aug, 10:00 PM', source: 'Network', severity: 'Success' },
];

export default function SecurityCenterPage() {
  return (
    <OperationsShell eyebrow="Global security health and threat monitoring" title="System Security Center">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {securityStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{stat.icon}</div>
            </div>
            <h4 className="text-3xl font-black text-[#0f172a]">{stat.value}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.status}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Threat Analysis Chart */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Threat Activity Level <span className="text-gray-400 font-bold ml-2">(Last 7 Days)</span></h3>
                 <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase">
                    <Activity size={12} /> Real-time Protection Active
                 </div>
              </div>
              
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={threatData}>
                       <defs>
                          <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                       <Tooltip />
                       <Area type="monotone" dataKey="level" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorThreat)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-50">
                 <SecurityMetric label="Firewall" status="Active" icon={<Shield size={16} className="text-green-500" />} />
                 <SecurityMetric label="DDoS Protection" status="Active" icon={<Network size={16} className="text-green-500" />} />
                 <SecurityMetric label="IDS / IPS" status="Enabled" icon={<Eye size={16} className="text-blue-500" />} />
                 <SecurityMetric label="Data Encryption" status="AES-256" icon={<Lock size={16} className="text-blue-500" />} />
              </div>
           </div>
        </div>

        {/* Recent Security Events Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[520px]">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Security Events</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                 {recentEvents.map(ev => (
                    <div key={ev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex items-center justify-between mb-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             ev.severity === 'High' ? 'bg-red-100 text-red-600' : 
                             ev.severity === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                             'bg-green-100 text-green-600'
                          }`}>{ev.severity}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{ev.time}</span>
                       </div>
                       <h4 className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{ev.event}</h4>
                       <p className="text-[9px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{ev.source}</p>
                    </div>
                 ))}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 text-center shrink-0">
                 <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Run Security Audit</button>
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                    <Fingerprint size={20} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Access Control</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-8">
                 42 privileged accounts are currently active. Zero-trust policy is enforced for all cross-region data transfers.
              </p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">MFA Adoption</span>
                    <span className="text-green-500">100%</span>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-full"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SecurityMetric({ label, status, icon }: { label: string; status: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
       <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3 border border-gray-100">
          {icon}
       </div>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-[10px] font-black text-[#0f172a] uppercase">{status}</p>
    </div>
  );
}
