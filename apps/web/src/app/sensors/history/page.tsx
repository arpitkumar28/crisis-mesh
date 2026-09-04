'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, RefreshCcw, Loader2, Download } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';
import { useSensorReadings } from '@/lib/hooks/useSensorReadings';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Sensor {
  id: string;
  device_id: string;
  name: string;
  metric: string;
  unit: string;
}

interface Device {
  id: string;
  name: string;
  sensors?: Sensor[];
}

interface Aggregate {
  avg_value: string | number | null;
  min_value: string | number | null;
  max_value: string | number | null;
  count: string | number | null;
}

export default function DataHistoryPage() {
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');

  const { readings, loading: readingsLoading, error: readingsError, refetch: fetchReadings } = useSensorReadings(selectedSensorId || null, 200);

  const [aggregate, setAggregate] = useState<Aggregate | null>(null);
  const [aggregateUnavailable, setAggregateUnavailable] = useState(false);

  useEffect(() => {
    apiClient
      .get('/devices')
      .then((res) => {
        const devicesWithSensors: Device[] = (res.data?.data || []).filter(
          (d: Device) => (d.sensors?.length ?? 0) > 0,
        );
        setDevices(devicesWithSensors);
        if (devicesWithSensors.length > 0) {
          setSelectedDeviceId(devicesWithSensors[0].id);
          setSelectedSensorId(devicesWithSensors[0].sensors![0].id);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch devices:', error);
        Toast.error('Failed to load devices');
      })
      .finally(() => setDevicesLoading(false));
  }, []);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedDeviceId) || null,
    [devices, selectedDeviceId],
  );
  const selectedSensor = useMemo(
    () => selectedDevice?.sensors?.find((s) => s.id === selectedSensorId) || null,
    [selectedDevice, selectedSensorId],
  );

  useEffect(() => {
    if (!selectedDeviceId || !selectedSensor) {
      setAggregate(null);
      return;
    }
    setAggregateUnavailable(false);
    apiClient
      .get(`/telemetry/aggregate/${selectedDeviceId}/${selectedSensor.metric}`)
      .then((res) => setAggregate(res.data?.data || null))
      .catch((error) => {
        if (error.response?.status === 403) {
          setAggregateUnavailable(true);
        } else {
          console.error('Failed to fetch aggregate telemetry:', error);
        }
        setAggregate(null);
      });
  }, [selectedDeviceId, selectedSensor]);

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    value: r.value,
  }));

  const avgQuality = readings.length > 0
    ? readings.reduce((sum, r) => sum + (r.quality_flag ?? 0), 0) / readings.length
    : null;

  const handleExportCsv = () => {
    if (readings.length === 0) return;
    const header = 'timestamp,sensor,device,value,unit,quality_flag\n';
    const rows = readings
      .map((r) => `${r.timestamp},${selectedSensor?.name || ''},${selectedDevice?.name || ''},${r.value},${r.unit},${r.quality_flag}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-readings-${selectedSensor?.name || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <OperationsShell eyebrow="Historical data analysis and trends" title="Data History & Trends">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SelectField
            label="Device"
            value={selectedDeviceId}
            onChange={(v) => {
              setSelectedDeviceId(v);
              const device = devices.find((d) => d.id === v);
              setSelectedSensorId(device?.sensors?.[0]?.id || '');
            }}
            options={devices.map((d) => ({ value: d.id, label: d.name }))}
            disabled={devicesLoading || devices.length === 0}
          />
          <SelectField
            label="Sensor"
            value={selectedSensorId}
            onChange={setSelectedSensorId}
            options={(selectedDevice?.sensors || []).map((s) => ({ value: s.id, label: `${s.name} (${s.metric})` }))}
            disabled={!selectedDevice}
          />
        </div>
        <button
          onClick={fetchReadings}
          className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {devicesLoading ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">No sensors available</p>
          <p className="text-xs font-bold text-gray-400">No devices with registered sensors were found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Chart Section */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">
                    {selectedSensor ? `${selectedSensor.name} Trend` : 'Trend'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {selectedSensor ? `${selectedSensor.unit} vs Time` : ''}
                  </p>
                </div>
                <button
                  onClick={handleExportCsv}
                  disabled={readings.length === 0}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase disabled:opacity-40"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>

              <div className="h-[350px]">
                {readingsLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <Loader2 size={28} className="animate-spin" />
                  </div>
                ) : readingsError ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold">{readingsError}</div>
                ) : chartData.length < 2 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                    Not enough readings yet to plot a trend.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Recent Readings Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Recent Readings</h3>
              </div>
              {readings.length === 0 ? (
                <div className="px-6 py-10 text-center text-xs font-bold text-gray-400">
                  {readingsLoading ? 'Loading...' : 'No readings recorded yet for this sensor.'}
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                      <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Sensor</th>
                      <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                      <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[...readings].reverse().slice(0, 20).map((reading) => (
                      <tr key={reading.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-[11px] font-bold text-gray-500">{new Date(reading.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 text-[11px] font-black text-[#0f172a]">{selectedSensor?.name}</td>
                        <td className="px-6 py-4 text-[11px] font-black text-blue-600">{reading.value} {reading.unit}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{reading.quality_flag}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="col-span-12 xl:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Summary (Last 24h)</h3>
              {aggregateUnavailable ? (
                <p className="text-xs font-bold text-gray-400">Not available for your role.</p>
              ) : aggregate ? (
                <div className="space-y-6">
                  <SummaryItem label="Average" value={formatNumber(aggregate.avg_value)} />
                  <SummaryItem label="Maximum" value={formatNumber(aggregate.max_value)} />
                  <SummaryItem label="Minimum" value={formatNumber(aggregate.min_value)} />
                  <SummaryItem label="Total Readings" value={aggregate.count != null ? String(aggregate.count) : '—'} />
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400">No aggregate data available for this period.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs mb-6">Average Data Quality</h3>
              {avgQuality != null ? (
                <div className="flex flex-col items-center py-4">
                  <span className="text-3xl font-black text-[#0f172a]">{avgQuality.toFixed(1)}</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                    Avg. quality_flag across {readings.length} loaded readings
                  </p>
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-400 text-center py-4">No readings to compute quality from.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </OperationsShell>
  );
}

function formatNumber(value: string | number | null | undefined): string {
  if (value == null) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(n) ? n.toFixed(2) : '—';
}

function SelectField({
  label, value, onChange, options, disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:opacity-50"
      >
        {options.length === 0 && <option value="">{label}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-[#0f172a]">{value}</span>
    </div>
  );
}
