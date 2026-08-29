'use client';

import React from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ChevronRight, Camera, CheckCircle2, 
  Settings, Bell, Shield, Globe, 
  MessageSquare, Layout, LogOut,
  Clock, Heart, Plus
} from 'lucide-react';
import { CitizenShell } from '@/components/citizen-shell';

export default function CitizenProfile() {
  return (
    <CitizenShell subtitle="Manage your personal profile and preferences" title="Citizen Profile">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Navigation & Basic Info */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col items-center">
              <div className="relative mb-6">
                 <div className="w-32 h-32 rounded-[40px] bg-[#061a37] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-900/20 border-4 border-white">
                    AK
                 </div>
                 <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-lg flex items-center justify-center text-blue-600">
                    <Camera size={18} />
                 </button>
              </div>
              <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tighter">Arpit Kumar</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Verified Citizen</p>
              
              <button className="w-full mt-8 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all">Change Photo</button>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-2">
              <nav className="space-y-1">
                 <ProfileNavLink icon={<User size={18} />} label="Information" active />
                 <ProfileNavLink icon={<Bell size={18} />} label="My Alerts" badge={3} />
                 <ProfileNavLink icon={<Layout size={18} />} label="My Reports" />
                 <ProfileNavLink icon={<MapPin size={18} />} label="Safe Zones" />
                 <ProfileNavLink icon={<Globe size={18} />} label="News & Updates" />
                 <ProfileNavLink icon={<User size={18} />} label="Profile" />
                 <ProfileNavLink icon={<Settings size={18} />} label="Settings" />
                 <ProfileNavLink icon={<Heart size={18} />} label="Help & Support" />
              </nav>
           </div>
        </div>

        {/* Right Column: Profile Details & Preferences */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Profile Information</h3>
              
              <div className="grid grid-cols-2 gap-10">
                 <InfoItem label="Full Name" value="Arpit Kumar" />
                 <InfoItem label="Email address" value="arpit.kumar@example.com" verified />
                 <InfoItem label="Mobile Number" value="+91 98765 43210" verified />
                 <InfoItem label="Location" value="Jaipur, Rajasthan, India" />
                 <InfoItem label="Date of Birth" value="15 Jan 1995" />
                 <InfoItem label="Gender" value="Male" />
              </div>

              <div className="mt-12 pt-10 border-t border-gray-100">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em]">Emergency Contacts</h3>
                    <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase hover:underline">
                       <Plus size={14} /> Add Contact
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContactCard name="Rajesh Kumar (Brother)" phone="+91 99999 11111" />
                    <ContactCard name="Neha Sharma (Sister)" phone="+91 99999 22222" />
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-gray-200 p-10 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Preferences</h3>
              
              <div className="space-y-10">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Preferred Language</p>
                    <button className="flex items-center justify-between w-full max-w-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-[#0f172a]">
                       English <ChevronRight size={14} className="rotate-90" />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-10">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Alert Preferences</p>
                       <div className="space-y-3">
                          <CheckOption label="Severe Weather" active />
                          <CheckOption label="Flood Alerts" active />
                          <CheckOption label="Safety Tips" active />
                          <CheckOption label="General Updates" />
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Communication Channels</p>
                       <div className="space-y-3">
                          <CheckOption label="SMS / WhatsApp" active />
                          <CheckOption label="Push Notification" active />
                          <CheckOption label="Email" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</p>
                       <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Edit Address</button>
                    </div>
                    <p className="text-xs font-bold text-[#0f172a] leading-relaxed">
                       House No. 12, Gopal Pura Bypass,<br />
                       Jaipur, Rajasthan - 302018
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </CitizenShell>
  );
}

function ProfileNavLink({ icon, label, active = false, badge }: { icon: React.ReactNode; label: string; active?: boolean; badge?: number }) {
  return (
    <button className={`w-full flex items-center justify-between px-6 py-4 rounded-[24px] transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-50'
    }`}>
       <div className="flex items-center gap-4">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
       </div>
       {badge && <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function InfoItem({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div>
       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-center gap-2">
          <p className="text-sm font-black text-[#0f172a] uppercase">{value}</p>
          {verified && <CheckCircle2 size={14} className="text-green-500" />}
          {verified && <span className="text-[8px] font-black text-green-500 uppercase">Verified</span>}
       </div>
    </div>
  );
}

function ContactCard({ name, phone }: { name: string; phone: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl">
       <div>
          <p className="text-xs font-black text-[#0f172a] uppercase">{name}</p>
          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{phone}</p>
       </div>
       <button className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all">
          <Phone size={14} />
       </button>
    </div>
  );
}

function CheckOption({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
       <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
         active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-transparent'
       }`}>
          <CheckCircle2 size={10} strokeWidth={3} />
       </div>
       <span className={`text-[10px] font-black uppercase ${active ? 'text-[#0f172a]' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}
