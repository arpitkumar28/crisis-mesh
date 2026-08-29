'use client';

import React from 'react';
import {
  Home, Users, CheckCircle2, AlertTriangle,
  Search, Filter, Plus, Download, ChevronDown,
  MapPin, Phone, Navigation, MoreHorizontal,
  Building2, ArrowUpRight, Bed
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';

const shelterStats = [
  { label: 'Total Shelters', value: '32', sub: 'Across 6 Districts', icon: <Home size={20} /> },
  { label: 'Total Capacity', value: '12,500', sub: 'Beds available', icon: <Users size={20} /> },
  { label: 'Occupied', value: '7,820', sub: '62.5% Occupancy', icon: <CheckCircle2 size={20} className="text-blue-600" /> },
  { label: 'Available', value: '4,680', sub: '37.5% Vacancy', icon: <Bed size={20} className="text-green-600" /> },
  { label: 'Water Maintenance', value: '2', sub: '6.2%', icon: <AlertTriangle size={20} className="text-orange-500" /> },
];

const shelterList = [
  { name: 'SMS Stadium', district: 'Jaipur', capacity: 5000, occupied: 4120, available: 880, status: 'Available', lastUpdated: '2 min ago' },
  { name: 'JGDRI Campus', district: 'Jaipur', capacity: 2000, occupied: 1845, available: 155, status: 'Available', lastUpdated: '8 min ago' },
  { name: 'Malviya School', district: 'Jaipur', capacity: 800, occupied: 785, available: 15, status: 'Full', lastUpdated: '15 min ago' },
  { name: 'Rajasthan College', district: 'Jaipur', capacity: 1500, occupied: 812, available: 688, status: 'Available', lastUpdated: '32 min ago' },
  { name: 'Arya College', district: 'Jaipur', capacity: 4000, occupied: 3215, available: 785, status: 'Available', lastUpdated: '1h ago' },
  { name: 'Govt. Sr. Sec. School', district: 'Dausa', capacity: 300, occupied: 218, available: 82, status: 'Available', lastUpdated: '2h ago' },
  { name: 'Community Hall', district: 'Dausa', capacity: 250, occupied: 153, available: 97, status: 'Available', lastUpdated: '4h ago' },
  { name: 'Panchayat Bhawan', district: 'Alwar', capacity: 200, occupied: 156, available: 44, status: 'Available', lastUpdated: '5h ago' },
];

export default function ShelterManagement() {
  return (
    <OperationsShell eyebrow="Manage and monitor safe evacuation shelters" title="Shelter Management">
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {shelterStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
               <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">{stat.icon}</div>
            </div>
            <h4 className="text-3xl font-black text-[#0f172a]">{stat.value}</h4>
            <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect label="All Districts" />
          <FilterSelect label="All Status" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search shelters..."
              className="pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-[11px] font-black w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            />
          </div>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all">
          <Plus size={16} /> Add Shelter
        </button>
      </div>

      {/* Shelters Table */}
      <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Shelter Name</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">District</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Capacity</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Occupied</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Available</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {shelterList.map((s, idx) => (
              <tr key={idx} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="px-8 py-5 text-sm font-black text-[#0f172a] uppercase">{s.name}</td>
                <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">{s.district}</td>
                <td className="px-8 py-5 text-xs font-black text-[#0f172a]">{s.capacity}</td>
                <td className="px-8 py-5 text-xs font-bold text-blue-600">{s.occupied}</td>
                <td className="px-8 py-5 text-xs font-bold text-green-600">{s.available}</td>
                <td className="px-8 py-5">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                    s.status === 'Available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>{s.status}</span>
                </td>
                <td className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase">{s.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Showing 8 of 32 Shelters</p>
           <div className="flex gap-1">
              <button className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">2</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">3</button>
              <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center text-[10px] font-black">4</button>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function FilterSelect({ label }: { label: string }) {
  return (
    <div className="relative">
      <select className="appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-2.5 pr-10 text-[10px] font-black text-[#0f172a] uppercase tracking-widest focus:outline-none hover:bg-gray-50 transition-all shadow-sm cursor-pointer">
        <option>{label}</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
    </div>
  );
}
