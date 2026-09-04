'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Info } from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export default function ResponderProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    apiClient
      .get('/auth/me')
      .then((res) => setUser(res.data?.data || null))
      .catch((error) => {
        console.error('Failed to load profile:', error);
        Toast.error('Failed to load profile data');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <OperationsShell eyebrow="Manage responder profile and availability" title="Responder Profile">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 -skew-x-12 translate-x-32 -translate-y-32 pointer-events-none"></div>

              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Responder Information</h3>

              {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-400"><Loader2 size={28} className="animate-spin" /></div>
              ) : !user ? (
                <p className="text-xs font-bold text-gray-400">Unable to load your profile. Please try again later.</p>
              ) : (
                <div className="flex flex-col md:flex-row gap-10">
                   <div className="flex flex-col items-center shrink-0">
                      <div className="w-32 h-32 rounded-[40px] bg-[#061a37] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-900/20 border-4 border-white">
                         {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                   </div>

                   <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-8">
                      <InfoField label="Full Name" value={user.name} />
                      <InfoField label="Official Email" value={user.email} verified />
                      <InfoField label="Roles" value={user.roles?.join(', ') || 'Unavailable'} />
                   </div>
                </div>
              )}

              <div className="mt-10 pt-10 border-t border-gray-100 flex items-start gap-3 text-gray-400">
                 <Info size={16} className="shrink-0 mt-0.5" />
                 <p className="text-[11px] font-bold leading-relaxed">
                   Responder ID, team assignment, certifications, equipment, availability status, current location,
                   and performance metrics are not yet available — the backend does not currently store or expose
                   these fields for responder accounts.
                 </p>
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm text-center text-gray-400">
              <p className="text-xs font-bold">Availability status, location tracking, and performance metrics are coming in a future update.</p>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function InfoField({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-center gap-2">
          <p className="text-xs font-black text-[#0f172a] uppercase">{value}</p>
          {verified && <CheckCircle2 size={12} className="text-green-500" />}
       </div>
    </div>
  );
}
