'use client';

import React, { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Smartphone, Globe,
  ChevronRight, Save, Shield, AlertTriangle,
  CheckCircle2, Info, Clock, Lock, User, Plus
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('Notification Preferences');

  return (
    <OperationsShell eyebrow="Manage your alerts, notifications and communication channels" title="Notifications & Subscriptions">
      <div className="grid grid-cols-12 gap-8">
        {/* Left Sidebar - Tabs */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-2">
                {['Notification Preferences', 'Subscribed Districts', 'Email Subscriptions', 'SMS & WhatsApp', 'Push Notifications', 'Alert History'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                    <ChevronRight size={14} className={activeTab === tab ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
             </div>
          </div>

          <div className="mt-6 bg-[#0f172a] rounded-2xl p-6 text-white shadow-xl">
             <h3 className="text-sm font-black uppercase tracking-widest mb-4">Emergency Broadcast</h3>
             <p className="text-xs text-gray-400 leading-relaxed mb-6">
                Broadcast critical safety information to all registered users in a specific radius.
             </p>
             <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> Create Broadcast
             </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">{activeTab}</h3>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2">
                   <Save size={16} /> Save Settings
                </button>
             </div>

             <div className="space-y-8">
                {/* Alert Notifications */}
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Alert Notifications</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <NotificationToggle
                        title="Critical Alerts"
                        desc="Immediate life-threatening situations"
                        icon={<AlertTriangle className="text-red-500" />}
                        active
                      />
                      <NotificationToggle
                        title="High Priority Alerts"
                        desc="Severe weather and regional incidents"
                        icon={<Bell className="text-orange-500" />}
                        active
                      />
                      <NotificationToggle
                        title="Medium Priority Alerts"
                        desc="Local updates and monitoring reports"
                        icon={<Info className="text-blue-500" />}
                        active
                      />
                      <NotificationToggle
                        title="Informational Alerts"
                        desc="General news and platform updates"
                        icon={<Globe className="text-gray-400" />}
                      />
                   </div>
                </div>

                {/* Communication Channels */}
                <div>
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Communication Channels</h4>
                   <div className="space-y-4">
                      <ChannelRow icon={<Mail />} label="Email Notifications" value="admin@crisismesh.gov.in" active />
                      <ChannelRow icon={<Smartphone />} label="SMS Alerts" value="+91 98765 43210" active />
                      <ChannelRow icon={<Bell />} label="Web Push Notifications" value="Standard browser notifications" active />
                      <ChannelRow icon={<MessageSquare />} label="WhatsApp Updates" value="+91 98765 43210" />
                   </div>
                </div>

                {/* Quiet Hours */}
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <Clock size={20} className="text-[#0f172a]" />
                         <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Quiet Hours</h4>
                      </div>
                      <button className="text-[10px] font-black text-blue-600 uppercase">Edit</button>
                   </div>
                   <p className="text-xs font-bold text-gray-500">10:00 PM - 06:00 AM</p>
                   <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">No notifications during quiet hours except critical alerts.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function NotificationToggle({ title, desc, icon, active = false }: { title: string; desc: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div>
          <h5 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">{title}</h5>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{desc}</p>
        </div>
      </div>
      <button className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`}></div>
      </button>
    </div>
  );
}

function ChannelRow({ icon, label, value, active = false }: { icon: React.ReactNode; label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="text-blue-600">
          {icon}
        </div>
        <div>
          <h5 className="text-xs font-black text-[#0f172a] uppercase tracking-tight">{label}</h5>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{value}</p>
        </div>
      </div>
      <button className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}`}></div>
      </button>
    </div>
  );
}
