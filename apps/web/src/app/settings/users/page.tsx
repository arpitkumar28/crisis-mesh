'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, Search, Shield, CheckCircle2, XCircle, Loader2, AlertTriangle,
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  roles: string[];
}

function formatTimestamp(value?: string | null): string {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString();
}

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/users');
        if (cancelled) return;
        setUsers(res.data?.data || []);
      } catch (err: any) {
        if (cancelled) return;
        // A 403 here means the signed-in account isn't ADMIN — this
        // endpoint is ADMIN-only by design (see services/api/src/users).
        setError(
          err?.response?.status === 403
            ? 'You do not have permission to view users (ADMIN role required).'
            : 'Unable to load users from the server.',
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
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roles.some((r) => r.toLowerCase().includes(q)),
    );
  }, [users, search]);

  const activeCount = users.filter((u) => u.is_active).length;
  const adminCount = users.filter((u) => u.roles.includes('ADMIN')).length;

  if (loading) {
    return (
      <OperationsShell eyebrow="Manage platform users, roles and permissions" title="User Management">
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          <Loader2 size={40} className="animate-spin" />
        </div>
      </OperationsShell>
    );
  }

  if (error) {
    return (
      <OperationsShell eyebrow="Manage platform users, roles and permissions" title="User Management">
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <AlertTriangle size={32} className="text-red-400 mb-4" />
          <p className="text-sm font-black text-[#0f172a] mb-1">{error}</p>
        </div>
      </OperationsShell>
    );
  }

  return (
    <OperationsShell eyebrow="Manage platform users, roles and permissions" title="User Management">
      {/* Top Metrics Strip — every number here is a live count over the
          users just fetched from GET /v1/users, not a placeholder. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</span>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><Users size={20} /></div>
          </div>
          <h4 className="text-3xl font-black text-[#0f172a]">{users.length}</h4>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Users</span>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><CheckCircle2 size={20} className="text-green-500" /></div>
          </div>
          <h4 className="text-3xl font-black text-[#0f172a]">{activeCount}</h4>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrators</span>
            <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100"><Shield size={20} className="text-blue-500" /></div>
          </div>
          <h4 className="text-3xl font-black text-[#0f172a]">{adminCount}</h4>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, email or role..."
            className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-full focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-sm flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm font-black text-[#0f172a] mb-1">
            {users.length === 0 ? 'No users found.' : 'No users match your search.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">User Name</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Roles</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Last Login</th>
                <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[10px] font-black uppercase">
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-xs font-black text-[#0f172a] uppercase">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-bold text-gray-500">{u.email}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className="text-[9px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">{r}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1 text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                      u.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTimestamp(u.last_login_at)}</td>
                  <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTimestamp(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing {filtered.length} of {users.length} users</p>
          </div>
        </div>
      )}
    </OperationsShell>
  );
}
