'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Loader2, AlertTriangle, Info } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';

// The backend's RBAC model is role-level only (UserRoleEnum, enforced by
// @Roles() decorators on every controller — see
// services/api/src/entities/profile.entity.ts and
// services/api/src/auth/guards/roles.guard.ts). There is no per-permission
// model, no endpoint that lists permissions, and no way to assign a role
// to a user beyond what's set at account creation. The previous version
// of this page invented 6 fake roles with fabricated user/permission
// counts and dozens of fake individually-toggleable permission
// checkboxes — none of that exists. This page now shows the real 5 roles
// the system actually enforces, with real user counts per role from
// GET /v1/users, and says plainly that granular permissions aren't a
// backend concept yet.
const REAL_ROLES = [
  { name: 'ADMIN', desc: 'Full platform access — user management, audit logs, all CRUD operations.' },
  { name: 'AUTHORITY', desc: 'Government/emergency authority — manage alerts, incidents, districts.' },
  { name: 'RESPONDER', desc: 'Field responder — view and update assigned incidents.' },
  { name: 'ANALYST', desc: 'Read-only access to risk assessments and operational data.' },
  { name: 'CITIZEN', desc: 'Public/citizen access — report incidents, view public alerts and shelters.' },
];

interface UserRecord {
  id: string;
  roles: string[];
}

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get('/users');
        if (cancelled) return;
        const users: UserRecord[] = res.data?.data || [];
        const tally: Record<string, number> = {};
        for (const role of REAL_ROLES) tally[role.name] = 0;
        for (const u of users) {
          for (const r of u.roles) {
            tally[r] = (tally[r] || 0) + 1;
          }
        }
        setCounts(tally);
      } catch (err: any) {
        if (cancelled) return;
        // Non-ADMIN accounts can't list users — the role definitions
        // below are still shown since they're just the fixed enum.
        setError(
          err?.response?.status === 403
            ? null
            : 'Unable to load user counts from the server.',
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

  return (
    <OperationsShell eyebrow="The platform's real role-based access model" title="Roles & Access">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
        <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-blue-900 uppercase tracking-wide mb-1">Role-level RBAC only</p>
          <p className="text-xs font-bold text-blue-700">
            CrisisMesh enforces access at the role level (5 fixed roles below), checked on every API
            endpoint. There is no granular, per-permission model — a role cannot be customized or
            broken into individual toggleable permissions today.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex items-center gap-3 text-orange-500 mb-8">
          <AlertTriangle size={20} />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {REAL_ROLES.map((role) => (
          <div key={role.name} className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Shield size={22} />
              </div>
              {loading ? (
                <Loader2 size={16} className="animate-spin text-gray-300" />
              ) : counts ? (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{counts[role.name] ?? 0} users</span>
              ) : null}
            </div>
            <h3 className="text-sm font-black text-[#0f172a] uppercase tracking-tight mb-2">{role.name}</h3>
            <p className="text-xs font-bold text-gray-400 leading-relaxed">{role.desc}</p>
          </div>
        ))}
      </div>
    </OperationsShell>
  );
}
