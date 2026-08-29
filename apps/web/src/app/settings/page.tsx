'use client';

import React, { useState } from 'react';
import { 
  Settings, Shield, Lock, Bell, Globe, 
  Database, Cpu, Share2, Save, RefreshCw,
  HardDrive, Cloud, Terminal, CheckCircle2,
  AlertTriangle, Info, ChevronRight, UserPlus
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function SettingsPage() {
  const [activeSection, setActiveTab] = useState('General');

  const sections = [
    { id: 'General', icon: <Settings size={16} /> },
    { id: 'Sensor Settings', icon: <Cpu size={16} /> },
    { id: 'Alert Settings', icon: <Bell size={16} /> },
    { id: 'User Management', icon: <UserPlus size={16} /> },
    { id: 'Data Management', icon: <Database size={16} /> },
    { id: 'Integrations', icon: <Share2 size={16} /> },
  ];

  return (
    <OperationsShell eyebrow="Configure system preferences and parameters" title="System Settings">
      <div className="grid grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-2">
                {sections.map(section => (
                  <button 
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeSection === section.id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {section.icon}
                      {section.id}
                    </div>
                    <ChevronRight size={14} className={activeSection === section.id ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
             </div>
          </div>

          <div className="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                <HardDrive size={18} className="text-[#0f172a]" />
                <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">System Status</h4>
             </div>
             <div className="space-y-4">
                <StatusRow label="Storage" value="45% Used" />
                <StatusRow label="API Latency" value="124ms" color="text-green-600" />
                <StatusRow label="MQTT Broker" value="Active" color="text-green-600" />
                <StatusRow label="AI Engine" value="Healthy" color="text-green-600" />
             </div>
             <button className="w-full mt-6 py-2 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <RefreshCw size={12} /> Run Diagnostics
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">{activeSection}</h3>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2">
                   <Save size={16} /> Save Changes
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* System Information */}
                <div className="space-y-8">
                   <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">System Information</h4>
                      <div className="space-y-4">
                         <SettingsInput label="System Name" value="CrisisMesh Platform" />
                         <SettingsInput label="System Version" value="v2.1.0" readonly />
                         <SettingsInput label="Last Updated" value="25 Aug 2026, 02:00 PM" readonly />
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</span>
                            <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                               <div className="w-1 h-1 rounded-full bg-green-600"></div> Operational
                            </span>
                         </div>
                         <ToggleRow label="Maintenance Mode" desc="Disable public access for maintenance" />
                      </div>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Security Settings</h4>
                      <div className="space-y-4">
                         <ToggleRow label="Two-Factor Authentication" active />
                         <ToggleRow label="IP Whitelisting" />
                         <ToggleRow label="Auto-Logout Session" desc="30 minutes of inactivity" active />
                      </div>
                   </div>
                </div>

                {/* Regional Settings */}
                <div className="space-y-8">
                   <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Regional Settings</h4>
                      <div className="space-y-4">
                         <SettingsSelect label="Time Zone" value="(GMT+05:30) Asia/Kolkata" />
                         <SettingsSelect label="Language" value="English (India)" />
                         <SettingsSelect label="Date Format" value="DD MMM YYYY" />
                         <SettingsSelect label="Currency" value="INR (₹)" />
                      </div>
                   </div>

                   <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-2 mb-3 text-blue-600">
                         <Info size={18} />
                         <h4 className="text-xs font-black uppercase tracking-wider">Storage Advice</h4>
                      </div>
                      <p className="text-xs font-bold text-blue-800/70 leading-relaxed">
                         System is currently using 45% of allocated cloud storage. 
                         Automated cleanup is scheduled for the first of every month.
                      </p>
                      <button className="mt-4 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage Storage →</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <h4 className="text-sm font-black text-red-500 uppercase tracking-[0.2em] mb-6">Danger Zone</h4>
             <div className="flex items-center justify-between p-4 border border-red-100 rounded-2xl bg-red-50/30">
                <div>
                   <h5 className="text-xs font-black text-[#0f172a] uppercase">Purge System Cache</h5>
                   <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">This will clear all temporary data and restart the API services.</p>
                </div>
                <button className="px-6 py-2 border border-red-200 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Purge Cache</button>
             </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SettingsInput({ label, value, readonly = false }: { label: string; value: string; readonly?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input 
        type="text" 
        defaultValue={value}
        readOnly={readonly}
        className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          readonly ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200' : 'bg-gray-50 border border-gray-200 text-[#0f172a]'
        }`} 
      />
    </div>
  );
}

function SettingsSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option>{value}</option>
        </select>
        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={14} />
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, active = false }: { label: string; desc?: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-[10px] font-black text-[#0f172a] uppercase tracking-wider">{label}</p>
        {desc && <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{desc}</p>}
      </div>
      <button className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ml-4 ${active ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`}></div>
      </button>
    </div>
  );
}

function StatusRow({ label, value, color = "text-gray-500" }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-[10px] font-black uppercase ${color}`}>{value}</span>
    </div>
  );
}
