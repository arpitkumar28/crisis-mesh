'use client';

import { useCallback, useEffect, useState } from 'react';
import { Battery, Radio, RefreshCw, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import apiClient from '@/lib/api-client';
import { OperationsShell } from '@/components/operations-shell';
import { wsClient } from '@/lib/websocket-client';

type Device = { id: string; name?: string; type?: string; status?: string; serial_number?: string; last_seen?: string; battery_level?: number };
export default function DevicesPage() {
  const router = useRouter(); const { token, isAuthenticated: authenticated, hasHydrated } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [filter, setFilter] = useState('ALL');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const path = filter === 'ALL' ? '/devices' : `/devices/status/${filter}`; const response = await apiClient.get(path); setDevices(response.data.data || []); } catch { setError('Device data is unavailable. Check the API and retry.'); } finally { setLoading(false); } }, [filter]);
  useEffect(() => { if (!hasHydrated) return; if (!authenticated || !token) { router.push('/login'); return; } wsClient.connect(token); load(); const refresh = () => load(); wsClient.on('device.status_changed', refresh); wsClient.on('telemetry.updated', refresh); return () => { wsClient.off('device.status_changed', refresh); wsClient.off('telemetry.updated', refresh); }; }, [authenticated, hasHydrated, load, router, token]);
  if (!hasHydrated || !authenticated) return null;
  const online = devices.filter((device) => device.status === 'ONLINE').length;
  return <OperationsShell eyebrow="Sensor network" title="Devices"><section className="page-summary"><div><span>Total devices</span><strong>{loading ? '—' : devices.length}</strong></div><div><span>Online</span><strong className="safe-text">{loading ? '—' : online}</strong></div><div><span>Offline / unreachable</span><strong className="danger-text">{loading ? '—' : devices.length - online}</strong></div><button onClick={load}><RefreshCw size={15} />Refresh</button></section><section className="data-panel"><div className="data-toolbar"><div><h2>Field device registry</h2><p>Live operational status from the CrisisMesh sensor network.</p></div><div className="filter-tabs">{['ALL', 'ONLINE', 'OFFLINE'].map((value) => <button key={value} onClick={() => setFilter(value)} className={filter === value ? 'selected' : ''}>{value[0] + value.slice(1).toLowerCase()}</button>)}</div></div>{error ? <div className="data-error">{error}<button onClick={load}>Retry</button></div> : loading ? <div className="data-loading">Loading sensor network…</div> : devices.length === 0 ? <div className="data-empty"><WifiOff size={25} />No devices match this view.</div> : <div className="device-grid">{devices.map((device) => { const isOnline = device.status === 'ONLINE'; return <article className="device-card" key={device.id}><div className={`device-icon ${isOnline ? 'online' : ''}`}><Radio size={19} /></div><div className="device-card-main"><h3>{device.name || device.serial_number || 'Unnamed device'}</h3><p>{device.type || 'Field sensor'} · {device.serial_number || device.id}</p><span className={`state-badge ${isOnline ? 'online' : 'offline'}`}><i />{device.status || 'UNKNOWN'}</span></div><div className="device-meta"><span><Battery size={14} />{device.battery_level == null ? '—' : `${device.battery_level}%`}</span><small>{device.last_seen ? `Seen ${new Date(device.last_seen).toLocaleString()}` : 'No last-seen signal'}</small></div></article>; })}</div>}</section></OperationsShell>;
}
