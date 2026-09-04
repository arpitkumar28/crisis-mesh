'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  MapPin, Battery, Signal, CheckCircle2, XCircle, AlertTriangle,
  Clock, RefreshCw, Loader2, Radio, ArrowLeft,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';
import { parseGeoPoint } from '@/lib/geo';
import { useSensorReadings } from '@/lib/hooks/useSensorReadings';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface GeographicLocation {
  id: string;
  name?: string;
  address?: string;
  location?: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'ONLINE' | 'OFFLINE' | 'UNREACHABLE' | 'ERROR';
  location_id?: string;
  location?: GeographicLocation;
  serial_number?: string;
  firmware_version?: string;
  battery_level?: number;
  signal_strength?: number;
  last_seen?: string;
}

interface Sensor {
  id: string;
  device_id: string;
  name: string;
  metric: string;
  unit: string;
  min_value?: number;
  max_value?: number;
}

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

export default function SensorDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const deviceId = params?.id;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [device, setDevice] = useState<Device | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const { readings, loading: readingsLoading, error: readingsError } = useSensorReadings(selectedSensorId, 50);

  const fetchDeviceAndSensors = useCallback(async () => {
    if (!deviceId) return;
    setLoadState('loading');
    try {
      const [deviceRes, sensorsRes] = await Promise.all([
        apiClient.get(`/devices/${deviceId}`),
        apiClient.get(`/devices/${deviceId}/sensors`),
      ]);
      const deviceData: Device = deviceRes.data?.data;
      const sensorsData: Sensor[] = sensorsRes.data?.data || [];

      if (!deviceData) {
        setLoadState('not-found');
        return;
      }

      setDevice(deviceData);
      setSensors(sensorsData);
      setSelectedSensorId(sensorsData[0]?.id ?? null);
      setLoadState('ready');
    } catch (error: any) {
      console.error('Failed to fetch device:', error);
      if (error.response?.status === 404) {
        setLoadState('not-found');
      } else {
        setLoadState('error');
        Toast.error('Failed to load sensor details');
      }
    }
  }, [deviceId]);

  useEffect(() => {
    fetchDeviceAndSensors();
  }, [fetchDeviceAndSensors]);

  useEffect(() => {
    if (readingsError) Toast.error('Failed to load sensor readings');
  }, [readingsError]);

  const selectedSensor = useMemo(
    () => sensors.find((s) => s.id === selectedSensorId) || null,
    [sensors, selectedSensorId],
  );

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const coords = device?.location?.location ? parseGeoPoint(device.location.location) : null;

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: r.value,
  }));

  if (loadState === 'loading') {
    return (
      <OperationsShell eyebrow="Sensor detail" title="Sensor Details">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">Loading Sensor...</p>
        </div>
      </OperationsShell>
    );
  }

  if (loadState === 'not-found') {
    return (
      <OperationsShell eyebrow="Sensor detail" title="Sensor Details">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <XCircle size={40} className="mb-4 text-gray-300" />
          <p className="text-sm font-black text-[#0f172a] mb-1">Device not found</p>
          <p className="text-xs font-bold text-gray-400 mb-6">No device exists with ID &quot;{deviceId}&quot;.</p>
          <button
            onClick={() => router.push('/sensors')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft size={14} /> Back to Sensors
          </button>
        </div>
      </OperationsShell>
    );
  }

  if (loadState === 'error' || !device) {
    return (
      <OperationsShell eyebrow="Sensor detail" title="Sensor Details">
        <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={40} className="mb-4 text-orange-300" />
          <p className="text-sm font-black text-[#0f172a] mb-1">Couldn&apos;t load this device</p>
          <p className="text-xs font-bold text-gray-400 mb-6">Something went wrong reaching the server.</p>
          <button
            onClick={fetchDeviceAndSensors}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </OperationsShell>
    );
  }

  const isOnline = device.status === 'ONLINE';

  return (
    <OperationsShell eyebrow={`${device.type} • ${device.name}`} title="Sensor Details">
      {/* Header Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <Radio className="text-blue-600" size={32} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl font-black text-[#0f172a]">{device.name}</h2>
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase tracking-widest">{device.type}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 ${
                isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-600' : 'bg-gray-400'}`}></div> {device.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {device.location?.name || device.location?.address || 'Location unavailable'}
                  </span>
                </div>
                {coords && (
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-5">
                    Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Battery Level</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0f172a]">
                      {device.battery_level != null ? `${device.battery_level}%` : 'Unavailable'}
                    </span>
                    <Battery size={16} className="text-gray-400" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Signal Strength</p>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-sm font-black">
                      {device.signal_strength != null ? `${device.signal_strength} dBm` : 'Unavailable'}
                    </span>
                    <Signal size={16} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Seen</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#0f172a]">
                    {device.last_seen ? new Date(device.last_seen).toLocaleString() : 'Never'}
                  </span>
                  <Clock size={16} className="text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Sensors on this device */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider mb-6">Sensors ({sensors.length})</h3>
            {sensors.length === 0 ? (
              <p className="text-xs font-bold text-gray-400">No sensors registered on this device.</p>
            ) : (
              <div className="space-y-2">
                {sensors.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSensorId(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      selectedSensorId === s.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-500 border border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{s.name}</span>
                      <span className="text-[9px] font-black uppercase text-gray-400">{s.metric}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-6">Device Information</h3>
            <div className="space-y-4">
              <InfoRow label="Serial Number" value={device.serial_number || 'Unavailable'} />
              <InfoRow label="Firmware Version" value={device.firmware_version || 'Unavailable'} />
              <InfoRow label="Device Type" value={device.type} />
            </div>
          </div>
        </div>

        {/* Right Column - Selected sensor readings */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">Current Reading</h3>
              {selectedSensor && (
                <span className="text-[9px] font-black text-gray-400 uppercase">{selectedSensor.name} &middot; {selectedSensor.metric}</span>
              )}
            </div>

            {!selectedSensor ? (
              <EmptyState message="Select a sensor to view its readings." />
            ) : readingsLoading ? (
              <div className="h-24 flex items-center justify-center text-gray-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : latestReading ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-[#0f172a]">{latestReading.value}</span>
                <span className="text-sm font-bold text-gray-400 uppercase">{latestReading.unit}</span>
                <span className="ml-auto text-[10px] font-bold text-gray-400">
                  as of {new Date(latestReading.timestamp).toLocaleString()}
                </span>
              </div>
            ) : (
              <EmptyState message="No readings have been recorded for this sensor yet." />
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-wider">
                Reading Trend {selectedSensor ? `(Last ${readings.length} readings)` : ''}
              </h3>
            </div>

            {!selectedSensor || readingsLoading ? (
              <div className="h-[220px] flex items-center justify-center text-gray-400">
                {readingsLoading ? <Loader2 size={24} className="animate-spin" /> : <EmptyState message="Select a sensor to view its trend." />}
              </div>
            ) : chartData.length < 2 ? (
              <div className="h-[220px] flex items-center justify-center">
                <EmptyState message="Not enough readings yet to plot a trend." />
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-black text-[#0f172a]">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
      <CheckCircle2 size={24} className="mb-2 text-gray-300" />
      <p className="text-xs font-bold text-center">{message}</p>
    </div>
  );
}
