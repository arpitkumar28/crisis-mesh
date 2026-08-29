'use client';

import React, { useState } from 'react';
import {
  AlertTriangle, RefreshCw, Filter, Search,
  ChevronDown, Plus, Download, ChevronRight,
  MoreHorizontal, Calendar, MapPin, Clock,
  CheckCircle2, AlertCircle, Info, TrendingUp
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const incidents = [
  { id: 'INC-042', title: 'Urban Flooding', type: 'Flood', location: 'Malviya Nagar, Jaipur', status: 'Active', severity: 'High', reported: '2 min ago', time: '10 Aug 2026, 02:15 PM', author: 'Local Authority' },
  { id: 'INC-041', title: 'Village Waterlogging', type: 'Flood', location: 'Sanganer, Jaipur', status: 'Active', severity: 'High', reported: '15 min ago', time: '10 Aug 2026, 02:00 PM', author: 'System Alert' },
  { id: 'INC-040', title: 'Power Line Down', type: 'Utility', location: 'Vaishali Nagar, Jaipur', status: 'Active', severity: 'Medium', reported: '32 min ago', time: '10 Aug 2026, 01:45 PM', author: 'Citizen Report' },
  { id: 'INC-039', title: 'Traffic Disruption', type: 'Other', location: 'Ajmeri Gate, Jaipur', status: 'Monitoring', severity: 'Low', reported: '1h ago', time: '10 Aug 2026, 01:15 PM', author: 'Traffic Police' },
  { id: 'INC-038', title: 'Road Washout', type: 'Infrastructure', location: 'Amer Road, Jaipur', status: 'Active', severity: 'High', reported: '2h ago', time: '10 Aug 2026, 12:15 PM', author: 'Local Authority' },
  { id: 'INC-037', title: 'Dust Storm', type: 'Weather', location: 'Jhotwara, Jaipur', status: 'Resolved', severity: 'Low', reported: '4h ago', time: '10 Aug 2026, 10:15 AM', author: 'IMD' },
  { id: 'INC-036', title: 'Wall Collapse', type: 'Structure', location: 'Old City, Jaipur', status: 'Resolved', severity: 'High', reported: '5h ago', time: '10 Aug 2026, 09:15 AM', author: 'Emergency Dept' },
];

export default function IncidentsPage() {
  return (
    <OperationsShell eyebrow="Track and manage all active and past incidents" title="Incidents">
      {/* Top Summary Cards (Screen 3 style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard label="Total Incidents" value="128" detail="+12 since last 7 days" icon={<AlertTriangle size={20} />} />
        <SummaryCard label="Active Incidents" value="24" detail="+4 in last 7 days" icon={<AlertCircle size={20} className="text-red-500" />} />
        <SummaryCard label="Resolved Incidents" value="96" detail="84% of last 7 days" icon={<CheckCircle2 size={20} className="text-green-500" />} />
        <SummaryCard label="Critical Incidents" value="6" detail="2 urgent attention req." icon={<Info size={20} className="text-orange-500" />} />
      </div>

      {/* Toolbar (Screen 3 style) */}
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <FilterSelect label="All Districts" />
          <FilterSelect label="All Hazards" />
          <FilterSelect label="All Status" />
          <FilterSelect label="Sort: Newest" />
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search location, incident, ID..."
              className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
            />
          </div>
          <button className="p-3 border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all bg-white">
            <RefreshCw size={18} />
          </button>
          <button className="flex items-center gap-2 bg-[#061a37] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-600 transition-all">
            <Plus size={16} /> New Incident
          </button>
        </div>
      </div>

      {/* Incidents Table (Screen 3 style) */}
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident ID</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident Type</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Hazard Type</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Risk Level</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Reported By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                className="hover:bg-gray-50 transition-all cursor-pointer group"
                onClick={() => window.location.href = `/incidents/${incident.id}`}
              >
                <td className="px-8 py-5">
                  <span className="text-[11px] font-black text-blue-600">#{incident.id}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-black text-[#0f172a] uppercase">{incident.title}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{incident.type}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#0f172a]">
                    <MapPin size={12} className="text-gray-400" />
                    {incident.location}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${
                    incident.severity === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                    incident.severity === 'High' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    incident.severity === 'Medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {incident.severity}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                    incident.status === 'Active' ? 'text-green-600' :
                    incident.status === 'Monitoring' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      incident.status === 'Active' ? 'bg-green-600 animate-pulse' :
                      incident.status === 'Monitoring' ? 'bg-blue-600' :
                      'bg-gray-400'
                    }`}></div>
                    {incident.status}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#0f172a] uppercase">{incident.author}</span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{incident.time}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination (Screen 3 style) */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Showing 7 of 128 Incidents</span>
          <div className="flex items-center gap-2">
            <PaginationButton label="Prev" disabled />
            <div className="flex gap-1 mx-2">
              <PaginationNumber number={1} active />
              <PaginationNumber number={2} />
              <PaginationNumber number={3} />
              <PaginationNumber number="..." />
              <PaginationNumber number={15} />
            </div>
            <PaginationButton label="Next" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Show</span>
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[10px] font-black focus:outline-none shadow-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function SummaryCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-all border border-gray-100">
          {icon}
        </div>
      </div>
      <h4 className="text-3xl font-black text-[#0f172a] mb-1">{value}</h4>
      <div className="flex items-center gap-1.5">
        <TrendingUp size={12} className="text-green-500" />
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{detail}</span>
      </div>
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-[10px] font-black text-[#0f172a] uppercase tracking-widest focus:outline-none hover:bg-white transition-all shadow-sm">
        <option>{label}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    </div>
  );
}

function PaginationButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
        disabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 shadow-sm'
      }`}
    >
      {label}
    </button>
  );
}

function PaginationNumber({ number, active = false }: { number: string | number; active?: boolean }) {
  return (
    <button className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all flex items-center justify-center ${
      active ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-500 hover:text-blue-600 shadow-sm'
    }`}>
      {number}
    </button>
  );
}
