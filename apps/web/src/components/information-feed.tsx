'use client';
import { Bell, CloudSun, Newspaper, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { OperationsShell } from '@/components/operations-shell';
import { useAuthStore } from '@/lib/store/auth-store';
import Image from 'next/image';

type Feed = 'weather' | 'news' | 'notifications';
type Item = { id: string; title?: string; description?: string; url?: string; imageUrl?: string | null; source?: string; publishedAt?: string; severity?: string; category?: string; temperature?: number; humidity?: number; windSpeed?: number; precipitation?: number; observedAt?: string; is_read?: boolean; priority?: string };
export function InformationFeed({ feed }: { feed: Feed }) {
  const router = useRouter(); const { token, isAuthenticated, hasHydrated } = useAuthStore();
  const [items, setItems] = useState<Item[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true); const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await apiClient.get(`/${feed}`); setItems(result.data.data || []); setUpdatedAt(new Date().toISOString()); } catch { setError(`Live ${feed} data is unavailable. Check the API connection and retry.`); } finally { setLoading(false); } }, [feed]);
  useEffect(() => { if (!hasHydrated) return; if (!isAuthenticated || !token) { router.push('/login'); return; } load(); }, [hasHydrated, isAuthenticated, token, router, load]);
  if (!hasHydrated || !isAuthenticated) return null;
  const Icon = feed === 'weather' ? CloudSun : feed === 'news' ? Newspaper : Bell;
  const title = feed === 'weather' ? 'Weather intelligence' : feed === 'news' ? 'Official news feed' : 'Notifications';
  const markRead = async (id: string) => { try { await apiClient.patch(`/notifications/${id}/read`); setItems((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item)); } catch { setError('Unable to update the notification. Please retry.'); } };
  return <OperationsShell eyebrow="Public safety information" title={title}><section className="page-summary"><div><span>{feed === 'weather' ? 'Latest observations' : 'Items in view'}</span><strong>{loading ? '—' : items.length}</strong></div><div><span>Data source</span><strong className={error ? '' : 'safe-text'}>{loading ? '—' : error ? 'UNAVAILABLE' : 'LIVE'}</strong></div><div><span>Last update</span><strong>{loading ? '—' : updatedAt ? new Date(updatedAt).toLocaleTimeString() : '—'}</strong></div><button onClick={load}><RefreshCw size={15} />Refresh</button></section><section className="data-panel"><div className="data-toolbar"><div><h2>{title}</h2><p>Information is supplied by the connected provider.</p></div></div>{error ? <div className="data-error">{error}<button onClick={load}>Retry</button></div> : loading ? <div className="data-loading">Loading live information...</div> : items.length === 0 ? <div className="data-empty"><Icon size={26} />No records are available yet.</div> : <div className="feed-list">{items.map((item) => <article className="feed-row" key={item.id}><Icon size={20} />{feed === 'news' && item.imageUrl ? <div className="relative w-[72px] h-[48px]"><Image src={item.imageUrl} alt="" fill loading="lazy" /></div> : null}<div><h3>{feed === 'weather' ? `${item.temperature ?? '—'}°C · ${item.humidity ?? '—'}% humidity` : item.title || 'Notification'}</h3><p>{feed === 'weather' ? `Wind ${item.windSpeed ?? '—'} km/h · precipitation ${item.precipitation ?? '—'} mm` : item.description || item.priority || 'No summary supplied.'}</p><small>{item.source || item.category || 'CrisisMesh'}{item.severity ? ` · ${item.severity}` : ''}{item.publishedAt || item.observedAt ? ` · ${new Date(item.publishedAt || item.observedAt || '').toLocaleString()}` : ''}</small></div>{feed === 'news' && item.url ? <a href={item.url} target="_blank" rel="noreferrer">Open article</a> : null}{feed === 'notifications' && !item.is_read ? <button onClick={() => markRead(item.id)}>Mark read</button> : null}</article>)}</div>}</section></OperationsShell>;
}
