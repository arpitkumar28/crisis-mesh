'use client';

import React from 'react';
import { 
  MessageSquare, Send, Bell, Mail, Phone, 
  Smartphone, ChevronRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const channels = [
  { name: 'SMS', icon: <Smartphone size={20} />, count: 156, active: true },
  { name: 'WhatsApp', icon: <MessageSquare size={20} />, count: 89, active: true },
  { name: 'Email', icon: <Mail size={20} />, count: 245, active: true },
  { name: 'Push Notifications', icon: <Bell size={20} />, count: 1345, active: true },
  { name: 'IVR Calls', icon: <Phone size={20} />, count: 67, active: false },
];

const recentBroadcasts = [
  { title: 'Heavy Rainfall Red Alert', channel: 'SMS, Push', date: '25 Aug, 02:00 PM', status: 'Delivered' },
  { title: 'Evacuation Advisory', channel: 'WhatsApp', date: '25 Aug, 01:15 PM', status: 'Delivered' },
  { title: 'Flood Risk Warning', channel: 'Email', date: '25 Aug, 12:30 PM', status: 'Delivered' },
  { title: 'Sensor System Update', channel: 'Push', date: '24 Aug, 04:30 PM', status: 'Delivered' },
  { title: 'Road Closure Alert', channel: 'SMS', date: '24 Aug, 09:00 AM', status: 'Failed' },
];

export default function IncidentCommunicationCenter() {
  return (
    <OperationsShell eyebrow="Coordinate communications during incidents" title="Incident Communication Center">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Channels</span>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[9px] font-black uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div> 5/6 Operational
               </div>
            </div>
         </div>
         <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
            <Send size={16} /> Send Urgent Alert
         </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Communication Channels */}
        <div className="col-span-12 lg:col-span-4">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm h-full">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Active Channels</h3>
              <div className="space-y-4">
                 {channels.map(ch => (
                    <div key={ch.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 ${ch.active ? 'text-blue-600' : 'text-gray-300'}`}>
                             {ch.icon}
                          </div>
                          <div>
                             <p className="text-xs font-black text-[#0f172a] uppercase tracking-tight">{ch.name}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{ch.count} Active Today</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Quick Broadcast Console */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider mb-8">Quick Broadcast Console</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Channel</label>
                       <select className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none">
                          <option>All Channels</option>
                          <option>SMS Only</option>
                          <option>WhatsApp Only</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Target Audience</label>
                       <select className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none">
                          <option>Jaipur District Citizens</option>
                          <option>Emergency Responders</option>
                          <option>District Officials</option>
                       </select>
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Message Template</label>
                    <select className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none mb-6">
                       <option>Emergency Flood Alert</option>
                       <option>Evacuation Notice</option>
                       <option>Weather Update</option>
                    </select>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Custom Message</label>
                    <textarea 
                      placeholder="Type your message here..." 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-[#0f172a] focus:outline-none h-24"
                    ></textarea>
                 </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-gray-50 pt-8">
                 <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Character Count: 142 / 160</span>
                 </div>
                 <button className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    Broadcast Now
                 </button>
              </div>
           </div>

           {/* Recent Broadcasts Table */}
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Broadcast History</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase">View All</button>
              </div>
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-gray-50/50">
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Message Title</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Channels</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
                       <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {recentBroadcasts.map((b, i) => (
                       <tr key={i} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                          <td className="px-8 py-5 text-xs font-black text-[#0f172a] uppercase">{b.title}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{b.channel}</td>
                          <td className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase">{b.date}</td>
                          <td className="px-8 py-5 text-right">
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                                b.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                             }`}>{b.status}</span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
         <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sent</p>
            <h4 className="text-3xl font-black text-[#0f172a]">1,802</h4>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivered</p>
            <h4 className="text-3xl font-black text-green-600">1,652</h4>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Failed</p>
            <h4 className="text-3xl font-black text-red-600">150</h4>
         </div>
         <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Success Rate</p>
            <h4 className="text-3xl font-black text-blue-600">91.7%</h4>
         </div>
      </div>
    </OperationsShell>
  );
}
