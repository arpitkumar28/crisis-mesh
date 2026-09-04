'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  History, Search, Loader2, AlertTriangle, Clock,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';

interface AuditLogRecord {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  timestamp: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
}

const PAGE_SIZE = 50;

function formatTimestamp(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString();
}

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [userById, setUserById] = useState<Record<string, UserRecord>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [logsRes, usersRes] = await Promise.all([
          apiClient.get('/audit-logs', { params: { limit: PAGE_SIZE, offset: 0 } }),
          // Best-effort: used only to show a real name instead of a raw
          // user_id. If this call fails (e.g. non-ADMIN), logs still render.
          apiClient.get('/users').catch(() => null),
        ]);
        if (cancelled) return;
        setLogs(logsRes.data?.data || []);
        const users: UserRecord[] = usersRes?.data?.data || [];
        setUserById(Object.fromEntries(users.map((u) => [u.id, u])));
      } catch (err: any) {
        if (cancelled) return;
        setError(
          err?.response?.status === 403
            ? 'You do not have permission to view audit logs (ADMIN role required).'
            : 'Unable to load audit logs from the server.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      const user = l.user_id ? userById[l.user_id] : null;
      return (
        l.action.toLowerCase().includes(q) ||
        (l.entity_type || '').toLowerCase().includes(q) ||
        (user?.name || '').toLowerCase().includes(q) ||
        (user?.email || '').toLowerCase().includes(q)
      );
    });
  }, [logs, search, userById]);

  if (loading) {
    return (
      <OperationsShell eyebrow="Track system activities and audit trails" title="Audit Logs">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error) {
    return (
      <OperationsShell eyebrow="Track system activities and audit trails" title="Audit Logs">
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Track system activities and audit trails" title="Audit Logs">
      {/* Single real metric — a fabricated breakdown (critical/failed/etc.)
          would require an AuditLog status field that does not exist. */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm mb-8 inline-flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><History size={20} /></div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Log Entries Loaded</p>
          <h4 className="text-2xl font-black text-[#0f172a]">{logs.length}{logs.length === PAGE_SIZE ? '+' : ''}</h4>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, module or user..."
            className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-full focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>
      </div>

      {/* Audit Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">
            {logs.length === 0 ? 'No audit log entries yet.' : 'No entries match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Entity</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log) => {
                const user = log.user_id ? userById[log.user_id] : null;
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
                        <Clock size={12} className="text-gray-300" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase">
                      {user ? user.name : log.user_id ? `User ${log.user_id.slice(0, 8)}` : 'System'}
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-gray-700 uppercase tracking-widest">{log.action}</td>
                    <td className="px-8 py-5 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                      {log.entity_type || '—'}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-gray-400 font-mono">{log.ip_address || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing {filtered.length} of {logs.length} loaded entries{logs.length === PAGE_SIZE ? ' (more exist — narrow your search or request a larger page from the API)' : ''}
            </p>
          </div>
        </div>
      )}
    </OperationsShell>
  );
}
