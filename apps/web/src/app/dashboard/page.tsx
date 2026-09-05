'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Map as MapIcon, Zap, Maximize2, Minimize2, ArrowUpRight, Loader2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { apiClient } from '@/lib/api-client';
import { wsClient } from '@/lib/websocket-client';
import { useAuthStore } from '@/lib/store/auth-store';
import { Toast } from '@/lib/toast';
import { parseGeoPoint } from '@/lib/geo';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-bold text-blue-900/20 text-4xl">Loading Map...</div>
});

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isHeatmapFullscreen, setIsHeatmapFullscreen] = useState(false);
  const heatmapPanelRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((state) => state.token);

  const toggleHeatmapFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      heatmapPanelRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsHeatmapFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

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

  useEffect(() => {
    if (!token) return;
    wsClient.connect(token);

    // Every one of these events changes a number or list this dashboard
    // renders (device/alert/incident counts, the map, the trend chart).
    // Re-fetching the real overview on each event keeps every metric
    // traceable to GET /v1/dashboard/overview rather than patching in
    // partial broadcast payloads that don't match this page's shape.
    const refresh = () => fetchDashboardData();
    const onAlertCreated = (alert: any) => {
      Toast.info(`New Alert: ${alert.message || alert.title || 'Alert created'}`);
      refresh();
    };

    wsClient.on('telemetry.updated', refresh);
    wsClient.on('device.status_changed', refresh);
    wsClient.on('alert.created', onAlertCreated);
    wsClient.on('alert.updated', refresh);
    wsClient.on('incident.created', refresh);
    wsClient.on('incident.updated', refresh);
    wsClient.on('incident.status_changed', refresh);

    let isFirstConnectionEvent = true;
    const stopConnection = wsClient.onConnectionChange((state) => {
      if (isFirstConnectionEvent) {
        isFirstConnectionEvent = false;
        return;
      }
      if (state === 'disconnected') {
        Toast.warning('Live dashboard feed disconnected — reconnecting…');
      } else if (state === 'reconnected') {
        Toast.success('Live dashboard feed reconnected');
        refresh();
      } else if (state === 'auth_error') {
        Toast.error('Your session has expired. Please log in again.');
      }
    });

    return () => {
      wsClient.off('telemetry.updated', refresh);
      wsClient.off('device.status_changed', refresh);
      wsClient.off('alert.created', onAlertCreated);
      wsClient.off('alert.updated', refresh);
      wsClient.off('incident.created', refresh);
      wsClient.off('incident.updated', refresh);
      wsClient.off('incident.status_changed', refresh);
      stopConnection();
    };
  }, [token]);

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
      {/* Top Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <span className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
          Last 7 Days — All Active Alerts &amp; Incidents
        </span>
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
          <div ref={heatmapPanelRef} className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-2">
                <MapIcon size={16} className="text-blue-600" />
                Regional Risk Heatmap
              </h3>
              <div className="flex items-center gap-4">
                 <button onClick={toggleHeatmapFullscreen} className="p-2 hover:bg-gray-50 rounded-lg">
                   {isHeatmapFullscreen ? <Minimize2 size={14} className="text-gray-400" /> : <Maximize2 size={14} className="text-gray-400" />}
                 </button>
              </div>
            </div>
            <div className="flex-1 relative bg-blue-50">
              <LiveMap entities={[
                ...(data?.incidents || [])
                  .map((i: any) => {
                    const coords = i.location?.location ? parseGeoPoint(i.location.location) : null;
                    return coords ? { id: i.id, kind: 'incident', title: i.title, detail: i.description || i.type, severity: i.severity, status: i.status, latitude: coords.lat, longitude: coords.lng } : null;
                  })
                  .filter(Boolean),
                ...(data?.alerts || [])
                  .map((a: any) => {
                    const coords = a.location?.location ? parseGeoPoint(a.location.location) : null;
                    return coords ? { id: a.id, kind: 'alert', title: a.title, detail: a.description || a.type, severity: a.severity, status: a.status, latitude: coords.lat, longitude: coords.lng } : null;
                  })
                  .filter(Boolean),
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
