'use client';

import React, { useState } from 'react';
import {
  Bell, AlertTriangle, Shield, Cloud, Activity,
  MapPin, Clock, Info, Filter, Search,
  ChevronRight, MoreHorizontal, CheckCircle2,
  AlertCircle, Zap, Flame, ExternalLink, ChevronDown
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const alerts = [
  { id: 'AL-902', title: 'Heavy Rainfall Warning', type: 'Weather', location: 'Jaipur, Rajasthan', severity: 'High', source: 'IMD', time: '2 min ago', status: 'Active' },
  { id: 'AL-901', title: 'Water Level Critical', type: 'Flood', location: 'Mansarovar, Jaipur', severity: 'Critical', source: 'CrisisMesh', time: '15 min ago', status: 'Active' },
  { id: 'AL-900', title: 'Flash Flood Watch', type: 'Weather', location: 'Sanganer, Jaipur', severity: 'High', source: 'IMD', time: '32 min ago', status: 'Active' },
  { id: 'AL-899', title: 'Road Closure Notice', type: 'Safety', location: 'Ajmeri Gate, Jaipur', severity: 'Medium', source: 'Authority', time: '1h ago', status: 'Active' },
  { id: 'AL-898', title: 'Cyclone Watch', type: 'Weather', location: 'Odisha Coast', severity: 'Medium', source: 'IMD', time: '2h ago', status: 'Active' },
  { id: 'AL-897', title: 'Sensor Offline Alert', type: 'System', location: 'Jhotwara Node', severity: 'Low', source: 'System', time: '4h ago', status: 'Resolved' },
  { id: 'AL-896', title: 'Power Outage Warning', type: 'Utility', location: 'Vaishali Nagar', severity: 'Medium', source: 'System', time: '5h ago', status: 'Active' },
];

export default function AlertsPage() {
  const [selectedTab, setSelectedTab] = useState('All Alerts');

  return (
    <OperationsShell eyebrow="Monitor and manage all active alerts and notifications" title="Alerts Center">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Total Alerts" value="156" icon={<Bell size={20} />} detail="+18 since last 24h" />
        <SummaryCard label="Active Alerts" value="18" icon={<AlertTriangle size={20} className="text-orange-500" />} detail="6 Immediate action req." color="text-orange-500" />
        <SummaryCard label="Critical Alerts" value="4" icon={<AlertCircle size={20} className="text-red-500" />} detail="2 Unacknowledged" color="text-red-500" />
        <SummaryCard label="Resolved Today" value="32" icon={<CheckCircle2 size={20} className="text-green-500" />} detail="Avg. time: 45 min" color="text-green-500" />
      </div>

      {/* Toolbar & Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            {['All Alerts', 'Official Alerts', 'CrisisMesh', 'Active', 'Resolved'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`text-[11px] font-black uppercase tracking-widest transition-all relative pb-2 ${
                  selectedTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {selectedTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search alerts..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors group cursor-pointer">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                alert.severity === 'Critical' ? 'bg-red-50 border-red-100 text-red-600' :
                alert.severity === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                'bg-blue-50 border-blue-100 text-blue-600'
              }`}>
                {getAlertIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-sm font-black text-[#0f172a] truncate uppercase tracking-tight">{alert.title}</h4>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                    alert.severity === 'Critical' ? 'bg-red-600 text-white' :
                    alert.severity === 'High' ? 'bg-orange-500 text-white' :
                    alert.severity === 'Medium' ? 'bg-yellow-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-300" /> {alert.location}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} className="text-gray-300" /> {alert.time}</span>
                  <span className="flex items-center gap-1.5"><Shield size={12} className="text-gray-300" /> Source: {alert.source}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                    alert.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${alert.status === 'Active' ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                    {alert.status}
                  </span>
                </div>
                <button className="text-gray-300 group-hover:text-blue-600 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 flex items-center justify-between border-t border-gray-100 text-xs font-bold text-gray-400">
          <p>Showing 7 of 156 alerts</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center">1</button>
            <button className="w-8 h-8 rounded bg-white border border-gray-200 text-gray-600 flex items-center justify-center">2</button>
            <button className="w-8 h-8 rounded bg-white border border-gray-200 text-gray-600 flex items-center justify-center">3</button>
            <span>...</span>
            <button className="px-3 h-8 rounded bg-white border border-gray-200 text-gray-600 flex items-center justify-center">Next</button>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SummaryCard({ label, value, icon, detail, color = "text-[#0f172a]" }: { label: string; value: string; icon: React.ReactNode; detail: string; color?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
          {icon}
        </div>
      </div>
      <h4 className={`text-2xl font-black ${color}`}>{value}</h4>
      <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wide">{detail}</p>
    </div>
  );
}

function getAlertIcon(type: string) {
  switch (type) {
    case 'Weather': return <Cloud size={20} />;
    case 'Flood': return <Zap size={20} />;
    case 'Safety': return <Shield size={20} />;
    case 'System': return <Info size={20} />;
    case 'Utility': return <Activity size={20} />;
    default: return <Bell size={20} />;
  }
}
