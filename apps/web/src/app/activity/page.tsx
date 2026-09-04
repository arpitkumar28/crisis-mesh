'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Loader2, AlertTriangle, Search } from 'lucide-react';
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

export default function ActivityLogPage() {
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
            ? 'You do not have permission to view activity (ADMIN role required).'
            : 'Unable to load activity from the server.',
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
        (user?.name || '').toLowerCase().includes(q)
      );
    });
  }, [logs, search, userById]);

  if (loading) {
    return (
      <OperationsShell eyebrow="Track all system activities and user actions" title="Activity Log">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error) {
    return (
      <OperationsShell eyebrow="Track all system activities and user actions" title="Activity Log">
        <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Track all system activities and user actions" title="Activity Log">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, entity or user..."
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Activity Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">
            {logs.length === 0 ? 'No activity recorded yet.' : 'No activity matches your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entity</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((log) => {
                const user = log.user_id ? userById[log.user_id] : null;
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
                        <Clock size={14} className="text-gray-300" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-[#0f172a]">
                        {user ? user.name : log.user_id ? `User ${log.user_id.slice(0, 8)}` : 'System'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-gray-600 uppercase bg-gray-100 px-2 py-0.5 rounded">{log.action}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        {log.entity_type || '—'}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">{log.ip_address || '—'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-xs font-bold text-gray-500">
            <p>Showing {filtered.length} of {logs.length} loaded entries{logs.length === PAGE_SIZE ? ' (more exist)' : ''}</p>
          </div>
        </div>
      )}
    </OperationsShell>
  );
}
