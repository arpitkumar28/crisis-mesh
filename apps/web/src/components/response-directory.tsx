'use client';

import { Building2, Package, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth-store';
import { OperationsShell } from '@/components/operations-shell';

type Location = { name?: string; address?: string };
type Resource = { id: string; name: string; type: string; quantity: number; unit?: string; status?: string; location?: Location };
type Shelter = { id: string; name: string; type?: string; capacity: number; current_occupancy: number; is_operational: boolean; facilities?: string[]; location?: Location };

export function ResponseDirectory({ kind }: { kind: 'resources' | 'shelters' }) {
  const router = useRouter();
  const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const [items, setItems] = useState<Array<Resource | Shelter>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const shelters = kind === 'shelters';
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await apiClient.get(`/${kind}`); setItems(result.data.data || []); }
    catch { setError(`Live ${kind} data is unavailable. Check the API connection and retry.`); }
    finally { setLoading(false); }
  }, [kind]);
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !token) { router.push('/login'); return; }
    load();
  }, [hasHydrated, isAuthenticated, token, router, load]);
  if (!hasHydrated || !isAuthenticated) return null;
  const available = shelters ? (items as Shelter[]).filter((item) => item.is_operational).length : (items as Resource[]).filter((item) => item.status === 'AVAILABLE').length;
  return <OperationsShell eyebrow="Response coordination" title={shelters ? 'Shelter network' : 'Resource coordination'}>
    <section className="page-summary"><div><span>{shelters ? 'Operational shelters' : 'Available resources'}</span><strong className="safe-text">{loading ? '—' : available}</strong></div><div><span>Total in network</span><strong>{loading ? '—' : items.length}</strong></div><div><span>Data source</span><strong className="safe-text">LIVE</strong></div><button onClick={load}><RefreshCw size={15} />Refresh</button></section>
    <section className="data-panel"><div className="data-toolbar"><div><h2>{shelters ? 'Safe accommodation' : 'Field inventory'}</h2><p>Availability and capacity are read directly from the operational database.</p></div></div>
      {error ? <div className="data-error">{error}<button onClick={load}>Retry</button></div> : loading ? <div className="data-loading">Loading live {kind}…</div> : items.length === 0 ? <div className="data-empty">{shelters ? <Building2 size={26} /> : <Package size={26} />}No {kind} have been registered yet.</div> : <div className="directory-grid">
        {shelters ? (items as Shelter[]).map((item) => { const beds = Math.max(item.capacity - item.current_occupancy, 0); const fill = item.capacity ? Math.min((item.current_occupancy / item.capacity) * 100, 100) : 0; return <article className="directory-card" key={item.id}><Building2 /><div className="directory-main"><div className="directory-title"><h3>{item.name}</h3><span className={item.is_operational ? 'state-good' : 'state-muted'}>{item.is_operational ? 'OPEN' : 'OFFLINE'}</span></div><p>{item.type || 'Emergency shelter'} · {item.location?.name || item.location?.address || 'Location pending'}</p>{item.facilities?.length ? <small>{item.facilities.join(' · ')}</small> : null}<div className="capacity"><span><b>{beds}</b> beds available</span><span>{item.current_occupancy} / {item.capacity}</span></div><i><em style={{ width: `${fill}%` }} /></i></div></article>; }) : (items as Resource[]).map((item) => <article className="directory-card" key={item.id}><Package /><div className="directory-main"><div className="directory-title"><h3>{item.name}</h3><span className={item.status === 'AVAILABLE' ? 'state-good' : 'state-muted'}>{item.status || 'UNKNOWN'}</span></div><p>{item.type} · {item.location?.name || item.location?.address || 'Location pending'}</p><div className="resource-count"><b>{item.quantity}</b> {item.unit || 'units'} available</div></div></article>)}
      </div>}</section>
  </OperationsShell>;
}
