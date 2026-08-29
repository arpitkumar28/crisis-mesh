'use client';

import React from 'react';
import { 
  Activity, Cpu, HardDrive, Globe, Zap, 
  CheckCircle2, AlertTriangle, Clock, RefreshCw,
  TrendingUp, BarChart3, Server, Shield
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const performanceData = [
  { time: '02:00', cpu: 32, ram: 58 },
  { time: '02:10', cpu: 45, ram: 60 },
  { time: '02:20', cpu: 38, ram: 62 },
  { time: '02:30', cpu: 65, ram: 65 },
  { time: '02:40', cpu: 42, ram: 64 },
  { time: '02:50', cpu: 34, ram: 62 },
];

const services = [
  { name: 'API Gateway', status: 'Operational', uptime: '99.99%', latency: '24ms' },
  { name: 'MQTT Broker', status: 'Operational', uptime: '100%', latency: '12ms' },
  { name: 'Database (PostgreSQL)', status: 'Operational', uptime: '99.98%', latency: '8ms' },
  { name: 'AI Inference Engine', status: 'Operational', uptime: '99.95%', latency: '145ms' },
  { name: 'Storage Service', status: 'Operational', uptime: '100%', latency: '42ms' },
  { name: 'Push Notification Service', status: 'Degraded', uptime: '98.50%', latency: '850ms' },
];

export default function SystemHealthPage() {
  return (
    <OperationsShell eyebrow="Monitor platform performance and infrastructure status" title="System Health">
      {/* Top Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <HealthMetricCard label="Overall Health" value="98.6%" status="Healthy" icon={<Activity size={20} className="text-green-500" />} />
        <HealthMetricCard label="Uptime (30d)" value="99.92%" status="Excellent" icon={<Clock size={20} className="text-blue-500" />} />
        <HealthMetricCard label="Avg Response" value="142 ms" status="Normal" icon={<Zap size={20} className="text-yellow-500" />} />
        <HealthMetricCard label="Active Users" value="1,245" status="+12% today" icon={<Server size={20} className="text-purple-500" />} />
        <HealthMetricCard label="Error Rate" value="0.04%" status="Low" icon={<AlertTriangle size={20} className="text-green-500" />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Performance Charts */}
        <div className="col-span-12 lg:col-span-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Infrastructure Performance</h3>
                 <div className="flex gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> CPU Load</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> RAM Usage</div>
                 </div>
              </div>
              
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                       <defs>
                          <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                       <Tooltip />
                       <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" />
                       <Area type="monotone" dataKey="ram" stroke="#a855f7" strokeWidth={3} fill="none" strokeDasharray="5 5" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-gray-50">
                 <ResourceUsage label="CPU Usage" value={34} color="bg-blue-500" />
                 <ResourceUsage label="Memory" value={62} color="bg-purple-500" />
                 <ResourceUsage label="Disk IO" value={28} color="bg-green-500" />
              </div>
           </div>
        </div>

        {/* Service Status Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Service Status</h3>
              <div className="space-y-6">
                 {services.map(service => (
                    <div key={service.name} className="flex items-center justify-between group">
                       <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase tracking-tight">{service.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{service.latency} latency • {service.uptime}</p>
                       </div>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                          service.status === 'Operational' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                       }`}>{service.status}</span>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-4 bg-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                 <RefreshCw size={14} /> Run Deep Diagnostics
              </button>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[60px]"></div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Shield size={16} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Security Health</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Firewall is active. All traffic is being routed through SSL/TLS. No unauthorized access attempts detected in last 24h.
              </p>
              <div className="flex items-center gap-2 text-green-500">
                 <CheckCircle2 size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">WAF Shield Active</span>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function HealthMetricCard({ label, value, status, icon }: { label: string; value: string; status: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
         <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{icon}</div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a]">{value}</h4>
      <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{status}</p>
    </div>
  );
}

function ResourceUsage({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
          <span className="text-gray-400">{label}</span>
          <span className="text-[#0f172a]">{value}%</span>
       </div>
       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
       </div>
    </div>
  );
}
