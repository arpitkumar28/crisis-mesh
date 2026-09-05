'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity, Droplets, Wind,
  Thermometer,
  Gauge, Loader2
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

type Tab = 'Air Quality' | 'Rainfall' | 'River Levels' | 'Weather';

const TAB_METRICS: Record<Tab, string[]> = {
  'Air Quality': ['AIR_QUALITY'],
  Rainfall: ['RAINFALL'],
  'River Levels': ['WATER_LEVEL'],
  Weather: ['TEMPERATURE', 'HUMIDITY', 'WIND_SPEED', 'PRESSURE'],
};

export default function EnvironmentalMonitoring() {
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [activeTab, setActiveTab] = useState<Tab>('Air Quality');
  const [lastSyncOk, setLastSyncOk] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/dashboard/overview');
      const data = response.data.data;
      setTelemetry(data.telemetry || []);

      // Extract latest values for key metrics
      const latest: any = {};
      data.telemetry.forEach((t: any) => {
        if (!latest[t.metric]) {
          latest[t.metric] = t;
        }
      });
      setMetrics(latest);
      setLastSyncOk(true);
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
      Toast.error('Sensor synchronization failed');
      setLastSyncOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, []);

  const activeMetrics = TAB_METRICS[activeTab];
  const chartData = telemetry
    .filter((t) => activeMetrics.includes(t.metric))
    .map((t) => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: t.value,
    }))
    .reverse();

  const downloadTelemetryLog = () => {
    const header = 'device_id,device_name,metric,value,unit,quality_flag,timestamp\n';
    const rows = telemetry
      .map((t) =>
        [t.device_id, t.device_name ?? '', t.metric, t.value, t.unit, t.quality_flag, t.timestamp]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <OperationsShell eyebrow="Environmental Intelligence" title="Sensors & Telemetry">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">Polling Mesh Network...</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Air quality, rainfall, river & weather sensors" title="Environmental Monitoring">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          {(Object.keys(TAB_METRICS) as Tab[]).map((tab) => (
            <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
          ))}
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Mesh Status</p>
              <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${lastSyncOk ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-1 h-1 rounded-full ${lastSyncOk ? 'bg-green-600' : 'bg-red-600'}`}></div> {lastSyncOk ? 'Synced' : 'Sync Failed'}
              </span>
           </div>
           <div className="h-8 w-px bg-gray-200 mx-2"></div>
           <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Last Updated</p>
              <p className="text-xs font-black text-[#0f172a]">{lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : '--'}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Live Sensor Matrix</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
               <AQIMetric
                  label="AQI"
                  value={metrics.AIR_QUALITY?.value != null ? String(metrics.AIR_QUALITY.value) : '--'}
                  status={metrics.AIR_QUALITY?.value != null ? getAQIStatus(metrics.AIR_QUALITY.value) : 'No Data'}
                  color="text-green-600"
                  bg="bg-green-50"
                  sub={`Unit: ${metrics.AIR_QUALITY?.unit || 'AQI'}`}
               />
               <EnvMetric label="Temperature" value={metrics.TEMPERATURE?.value != null ? String(metrics.TEMPERATURE.value) : '--'} unit="°C" status={metrics.TEMPERATURE ? 'Reporting' : 'No Data'} color="text-blue-600" />
               <EnvMetric label="Humidity" value={metrics.HUMIDITY?.value != null ? String(metrics.HUMIDITY.value) : '--'} unit="%" status={metrics.HUMIDITY ? 'Reporting' : 'No Data'} color="text-cyan-600" />
               <EnvMetric label="Rainfall" value={metrics.RAINFALL?.value != null ? String(metrics.RAINFALL.value) : '--'} unit="mm" status={metrics.RAINFALL ? 'Reporting' : 'No Data'} color="text-blue-500" />
            </div>

            <div>
               <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">Real-time Data Stream — {activeTab}</h4>
                  <div className="flex items-center gap-4 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Sensor Reading</div>
                  </div>
               </div>
               <div className="h-[280px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#aqiGrad)" />
                       </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p className="text-[10px] font-black uppercase tracking-widest">No recent {activeTab.toLowerCase()} readings in the current feed</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Field Condition Snapshot</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <WeatherDetail icon={<Thermometer size={20} />} label="Surface Temp" value={metrics.TEMPERATURE?.value != null ? `${metrics.TEMPERATURE.value}°C` : '--'} sub="Ambient" />
                <WeatherDetail icon={<Droplets size={20} />} label="Atm. Humidity" value={metrics.HUMIDITY?.value != null ? `${metrics.HUMIDITY.value}%` : '--'} sub="Saturation" />
                <WeatherDetail icon={<Wind size={20} />} label="Wind Velocity" value={metrics.WIND_SPEED?.value != null ? `${metrics.WIND_SPEED.value} km/h` : '--'} sub="Speed only" />
                <WeatherDetail icon={<Gauge size={20} />} label="Baro Pressure" value={metrics.PRESSURE?.value != null ? `${metrics.PRESSURE.value} hPa` : '--'} sub="Sensor reading" />
             </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Station Feed</h3>
                 <button
                  onClick={fetchData}
                  className="text-[9px] font-black text-blue-600 uppercase hover:underline"
                >
                  Refresh Feed
                </button>
              </div>
              <div className="space-y-6">
                 {telemetry.slice(0, 5).map((t, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4">
                       <div>
                          <p className="text-xs font-black text-[#0f172a] uppercase">{t.device_name || `Node-${t.device_id.substring(0,4)}`}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">{t.metric}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-blue-600">{t.value} {t.unit}</p>
                          <span className={`text-[8px] font-black uppercase ${t.quality_flag === 'GOOD' ? 'text-green-500' : 'text-yellow-600'}`}>{t.quality_flag}</span>
                       </div>
                    </div>
                 ))}
                 {telemetry.length === 0 && <p className="text-[10px] text-gray-400 font-bold uppercase py-4 text-center">Waiting for sensor data...</p>}
              </div>
           </div>

           <div className="bg-[#0f172a] rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-[40px]"></div>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Activity size={20} />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Mesh Feed</h4>
              </div>
              <p className="text-xs font-bold text-gray-400 leading-relaxed mb-6">
                 Currently tracking {telemetry.length} recent readings across the mesh network.
              </p>
              <button
                onClick={downloadTelemetryLog}
                disabled={telemetry.length === 0}
                className="w-full py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                 Download Telemetry Log (CSV)
              </button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function getAQIStatus(value: number) {
  if (value <= 50) return 'Good';
  if (value <= 100) return 'Moderate';
  if (value <= 150) return 'Unhealthy (SG)';
  return 'Hazardous';
}

function TabButton({ label, active = false, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${
        active ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

function AQIMetric({ label, value, status, color, bg, sub }: { label: string; value: string; status: string; color: string; bg: string; sub: string }) {
  return (
    <div className={`${bg} p-4 rounded-2xl border border-gray-100`}>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <h4 className={`text-3xl font-black ${color}`}>{value}</h4>
       <p className={`text-[9px] font-black uppercase mt-1 ${color}`}>{status}</p>
       <p className="text-[8px] font-bold text-gray-400 mt-2">{sub}</p>
    </div>
  );
}

function EnvMetric({ label, value, unit, status, color }: { label: string; value: string; unit: string; status: string; color: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-baseline gap-1">
          <h4 className="text-xl font-black text-[#0f172a]">{value}</h4>
          <span className="text-[8px] font-bold text-gray-400">{unit}</span>
       </div>
       <p className={`text-[8px] font-black uppercase mt-2 ${color}`}>{status}</p>
    </div>
  );
}

function WeatherDetail({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="flex items-start gap-4">
       <div className="text-blue-500">{icon}</div>
       <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-lg font-black text-[#0f172a]">{value}</p>
          <p className="text-[8px] font-bold text-gray-400 uppercase">{sub}</p>
       </div>
    </div>
  );
}
