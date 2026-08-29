'use client';

import React, { useState } from 'react';
import {
  User, Mail, Phone, Shield, MapPin,
  Camera, Lock, Bell, Globe, ChevronRight,
  LogOut, CheckCircle2, AlertCircle, Save,
  Settings, UserCircle, ShieldAlert, History
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function ProfilePage() {
  return (
    <OperationsShell eyebrow="Manage your account information and preferences" title="User Profile / Account Settings">
      <div className="grid grid-cols-12 gap-8">
        {/* Profile Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden p-2">
              <ProfileNavLink icon={<UserCircle size={18} />} label="Information" active />
              <ProfileNavLink icon={<Lock size={18} />} label="Change Password" />
              <ProfileNavLink icon={<Settings size={18} />} label="Application Settings" />
              <ProfileNavLink icon={<Globe size={18} />} label="Language & Region" />
              <ProfileNavLink icon={<ShieldAlert size={18} />} label="Security" />
              <ProfileNavLink icon={<History size={18} />} label="Personalized Feed" />
              <ProfileNavLink icon={<Bell size={18} />} label="Notifications" />
           </div>

           <button className="w-full flex items-center gap-3 px-6 py-4 rounded-[24px] text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100">
              <LogOut size={18} /> Logout Account
           </button>
        </div>

        {/* Main Profile Settings Form (Matches Screen 10) */}
        <div className="col-span-12 lg:col-span-9">
           <div className="bg-white rounded-[40px] border border-gray-200 p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 -skew-x-12 translate-x-32 -translate-y-32 pointer-events-none"></div>

              <div className="mb-10">
                 <h3 className="text-2xl font-black text-[#0f172a] tracking-tight">Profile Settings</h3>
                 <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Manage your personal account information and preferences</p>
              </div>

              <div className="flex flex-col xl:flex-row gap-16">
                 {/* Profile Photo Section */}
                 <div className="flex flex-col items-center shrink-0">
                    <div className="relative group">
                       <div className="w-40 h-40 rounded-[48px] bg-[#061a37] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-900/20 border-4 border-white">
                          A
                       </div>
                       <button className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-xl flex items-center justify-center text-blue-600 hover:scale-110 transition-transform">
                          <Camera size={20} />
                       </button>
                    </div>
                    <button className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Change Photo</button>
                 </div>

                 {/* Form Fields */}
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <ProfileInput label="Full Name" value="Admin User" />
                    <ProfileInput label="Email Address" value="admin@crisismesh.gov.in" />
                    <ProfileInput label="Phone Number" value="+91 98765 43210" />
                    <ProfileInput label="District Authority" value="Jaipur District, Rajasthan" readOnly />
                    <ProfileInput label="Department" value="Disaster Management" />
                    <ProfileInput label="Location" value="Jaipur District, Rajasthan" />

                    <div className="col-span-full mt-4 p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-8">Preferences</h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="space-y-4">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Theme</p>
                             <div className="flex p-1 bg-white border border-gray-200 rounded-xl">
                                <button className="flex-1 py-1.5 text-[9px] font-black uppercase bg-[#061a37] text-white rounded-lg">Light</button>
                                <button className="flex-1 py-1.5 text-[9px] font-black uppercase text-gray-400">Dark</button>
                                <button className="flex-1 py-1.5 text-[9px] font-black uppercase text-gray-400">System</button>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Language</p>
                             <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-black text-[#0f172a] focus:outline-none">
                                   <option>English (IN)</option>
                                   <option>Hindi (HI)</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Time Zone</p>
                             <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-xs font-black text-[#0f172a] focus:outline-none">
                                   <option>(GMT+05:30) Asia/Kolkata</option>
                                </select>
                                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" />
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                          <PreferenceToggle label="Email Notifications" active />
                          <PreferenceToggle label="SMS/Mobile Notifications" active />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4">
                 <button className="px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600">Cancel</button>
                 <button className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-2">
                    <Save size={18} /> Save Changes
                 </button>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function ProfileNavLink({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function ProfileInput({ label, value, readOnly = false }: { label: string; value: string; readOnly?: boolean }) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</label>
       <input
         type="text"
         defaultValue={value}
         readOnly={readOnly}
         className={`w-full px-6 py-3.5 rounded-2xl text-xs font-black border transition-all focus:outline-none ${
           readOnly ? 'bg-gray-50 text-gray-500 border-gray-100 cursor-not-allowed' : 'bg-white text-[#0f172a] border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5'
         }`}
       />
    </div>
  );
}

function PreferenceToggle({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-widest">{label}</span>
       <button className={`w-12 h-6 rounded-full relative transition-all duration-300 ${active ? 'bg-blue-600' : 'bg-gray-300'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
       </button>
    </div>
  );
}
