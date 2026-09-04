'use client';

import React, { useEffect, useState } from 'react';
import {
  User, Bell, Layout, MapPin, Globe, Settings, Heart, Loader2, Info,
} from 'lucide-react';
import { CitizenShell } from '@/components/citizen-shell';
import { apiClient } from '@/lib/api-client';
import { Toast } from '@/lib/toast';

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export default function CitizenProfile() {
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
    <CitizenShell subtitle="Manage your personal profile and preferences" title="Citizen Profile">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Navigation & Basic Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col items-center">
              <div className="w-32 h-32 rounded-[40px] bg-[#061a37] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-900/20 border-4 border-white">
                 {loading ? <Loader2 size={32} className="animate-spin" /> : (user?.name?.charAt(0).toUpperCase() || '?')}
              </div>
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tighter mt-6">{loading ? 'Loading…' : user?.name || 'Unavailable'}</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{user?.roles?.[0] || ''}</p>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-2">
              <nav className="space-y-1">
                 <ProfileNavLink icon={<User size={18} />} label="Information" active />
                 <ProfileNavLink icon={<Bell size={18} />} label="My Alerts" />
                 <ProfileNavLink icon={<Layout size={18} />} label="My Reports" />
                 <ProfileNavLink icon={<MapPin size={18} />} label="Safe Zones" />
                 <ProfileNavLink icon={<Globe size={18} />} label="News & Updates" />
                 <ProfileNavLink icon={<Settings size={18} />} label="Settings" />
                 <ProfileNavLink icon={<Heart size={18} />} label="Help & Support" />
              </nav>
           </div>
        </div>

        {/* Right Column: Profile Details */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Profile Information</h3>

              {loading ? (
                <div className="flex items-center justify-center py-10 text-gray-400"><Loader2 size={28} className="animate-spin" /></div>
              ) : !user ? (
                <p className="text-xs font-bold text-gray-400">Unable to load your profile. Please try again later.</p>
              ) : (
                <div className="grid grid-cols-2 gap-10">
                   <InfoItem label="Full Name" value={user.name} />
                   <InfoItem label="Email address" value={user.email} />
                   <InfoItem label="Role" value={user.roles?.join(', ') || 'Unavailable'} />
                </div>
              )}

              <div className="mt-10 pt-10 border-t border-gray-100 flex items-start gap-3 text-gray-400">
                 <Info size={16} className="shrink-0 mt-0.5" />
                 <p className="text-[11px] font-bold leading-relaxed">
                   Phone number, address, emergency contacts, and notification preferences are not yet available —
                   the backend does not currently store or expose these fields for citizen accounts.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </CitizenShell>
  );
}

function ProfileNavLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center justify-between px-6 py-4 rounded-[24px] transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-50'
    }`}>
       <div className="flex items-center gap-4">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
       </div>
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-sm font-black text-[#0f172a]">{value}</p>
    </div>
  );
}
