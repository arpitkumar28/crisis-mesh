'use client';

import React, { useEffect, useState } from 'react';
import {
  Map as MapIcon, ChevronDown, Zap, Search, Maximize2, ArrowUpRight, Loader2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { apiClient } from '@/lib/api-client';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-bold text-blue-900/20 text-4xl">Loading Map...</div>
});

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.get('/dashboard/overview');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = data?.metrics || {
    total_devices: 0,
    online_devices: 0,
    active_alerts: 0,
    critical_alerts: 0,
    open_incidents: 0
  };

  const riskSummaryData = [
    { name: 'High Risk', value: metrics.critical_alerts, color: '#ef4444' },
    { name: 'Medium Risk', value: Math.max(0, metrics.active_alerts - metrics.critical_alerts), color: '#f97316' },
    { name: 'Low Risk', value: metrics.online_devices, color: '#22c55e' },
  ];

  // Using real trend data from backend
  const historicalTrendData = data?.trends || [];

  if (loading) {
    return (
      <OperationsShell eyebrow="Visualization intensity and vulnerability" title="Heatmap & Risk Analysis">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">Synchronizing Intelligence...</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Visualization intensity and vulnerability" title="Heatmap & Risk Analysis">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <FilterSelect label="Risk Type" value="Flood Risk" />
          <FilterSelect label="Time Range" value="Last 7 Days" />
          <FilterSelect label="District" value="Jaipur" />
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
        >
          <Zap size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content: Heatmap */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                <MapIcon size={16} className="text-blue-600" />
                Regional Risk Heatmap
              </h3>
              <div className="flex items-center gap-4">
                 <button className="p-2 hover:bg-gray-50 rounded-lg"><Search size={14} className="text-gray-400" /></button>
                 <button className="p-2 hover:bg-gray-50 rounded-lg"><Maximize2 size={14} className="text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 relative bg-blue-50">
              <LiveMap entities={[
                ...(data?.incidents || []).map((i: any) => ({ ...i, entityType: 'incident' })),
                ...(data?.alerts || []).map((a: any) => ({ ...a, entityType: 'alert' }))
              ]} />

              {/* Floating Map Legend */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200/50">
                <p className="text-[9px] font-black text-gray-500 uppercase mb-2 tracking-widest">Risk Intensity</p>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                  <span className="text-[8px] font-bold text-gray-400">LOW &rarr; HIGH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Analysis Chart */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-[#0f172a] text-sm mb-6 uppercase tracking-wider">7-Day Alert Trend</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalTrendData}>
                  <defs>
                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    labelStyle={{fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px'}}
                  />
                  <Area type="monotone" dataKey="high" stroke="#ef4444" fillOpacity={1} fill="url(#colorHigh)" strokeWidth={3} />
                  <Area type="monotone" dataKey="med" stroke="#f97316" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="low" stroke="#22c55e" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Analysis & Trends */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Risk Summary Output */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-[#0f172a] text-sm mb-6">Risk Summary Output</h3>

            <div className="flex items-center justify-center mb-6 relative">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Alerts</p>
                <p className={`text-3xl font-black ${metrics.critical_alerts > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                  {metrics.active_alerts}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
               {riskSummaryData.map((item) => (
                 <div key={item.name} className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-[8px] font-bold text-gray-500 uppercase">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-[#0f172a]">{item.value}</span>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Open Incidents</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f172a]">{metrics.open_incidents}</span>
                  </div>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                    metrics.open_incidents > 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {metrics.open_incidents > 5 ? 'High Load' : 'Stable'}
                  </span>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Network Health</p>
                  <div className="flex items-center justify-end gap-1 text-green-500">
                    <ArrowUpRight size={16} />
                    <span className="text-2xl font-black">{metrics.total_devices > 0 ? Math.round((metrics.online_devices / metrics.total_devices) * 100) : 0}%</span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Availability</span>
               </div>
            </div>
          </div>

          {/* Recent Alerts Feed */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6 overflow-hidden">
             <h3 className="font-bold text-[#0f172a] text-sm mb-6">Live Alerts</h3>
             <div className="space-y-4">
               {(data?.alerts || []).length > 0 ? (
                 data.alerts.map((alert: any) => (
                   <div key={alert.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                     <div className={`w-1 h-full rounded-full ${
                       alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'
                     }`}></div>
                     <div>
                       <p className="text-[10px] font-black text-[#0f172a] uppercase">{alert.title}</p>
                       <p className="text-[8px] text-gray-500 mt-1">{alert.description}</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <p className="text-[10px] text-gray-400 font-bold uppercase py-4 text-center">No active alerts</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FilterSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</span>
      <button className="flex items-center gap-6 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-[#0f172a] hover:bg-gray-100 transition-colors">
        {value}
        <ChevronDown size={12} className="text-gray-400" />
      </button>
    </div>
  );
}
