'use client';

import type { ReactNode } from 'react';
import { Activity, Bell, Boxes, LogOut, Map, Radio, Shield, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { wsClient } from '@/lib/websocket-client';

const links = [
  ['Overview', '/dashboard', Activity],
  ['Live map', '/map', Map],
  ['Devices', '/devices', Radio],
  ['Alerts', '/alerts', Bell],
  ['Incidents', '/incidents', AlertTriangle],
  ['Resources', '#resources', Boxes],
] as const;

export function OperationsShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const pathname = typeof window === 'undefined' ? '' : window.location.pathname;
  const logout = () => { useAuthStore.getState().logout(); localStorage.removeItem('access_token'); wsClient.disconnect(); router.push('/login'); };
  return <div className="operations-shell">
    <aside className="operations-sidebar">
      <a className="operations-brand" href="/dashboard"><span className="operations-brand-icon"><Shield size={18} /></span>CRISIS<span>MESH</span></a>
      <span className="operations-kicker">Command center</span>
      <nav>{links.map(([label, href, Icon]) => <a key={label} href={href} className={pathname === href ? 'current' : ''}><Icon size={17} /> <span>{label}</span></a>)}</nav>
      <div className="operations-sidebar-bottom"><span className="system-pulse" />System monitoring<br /><small>CM-01 · Secure node</small></div>
    </aside>
    <main className="operations-main">
      <header className="operations-header"><div><p>{eyebrow}</p><h1>{title}</h1></div><div className="operations-user"><span className="connection-chip"><i />Live connection</span><span className="user-initial">{(user?.name || 'O').slice(0, 1).toUpperCase()}</span><span className="user-name">{user?.name || 'Operator'}<small>{user?.role || 'OPERATOR'}</small></span><button onClick={logout} aria-label="Log out"><LogOut size={17} /></button></div></header>
      {children}
    </main>
  </div>;
}
