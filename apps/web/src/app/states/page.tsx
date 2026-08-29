'use client';

import React, { useState } from 'react';
import { 
  Globe, Search, Filter, Plus, Download, 
  ChevronRight, ArrowUpRight, Shield, Bell,
  Activity, AlertTriangle, Users, Map as MapIcon,
  ChevronDown
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import Link from 'next/link';

const states = [
  { id: 'rj', name: 'Rajasthan', risk: 78, alerts: 42, sensors: 1240, districts: 33, status: 'Critical', population: '6.85 Cr' },
  { id: 'gj', name: 'Gujarat', risk: 45, alerts: 18, sensors: 980, districts: 33, status: 'Moderate', population: '6.04 Cr' },
  { id: 'mh', name: 'Maharashtra', risk: 62, alerts: 35, sensors: 1560, districts: 36, status: 'High Risk', population: '11.24 Cr' },
  { id: 'od', name: 'Odisha', risk: 85, alerts: 54, sensors: 820, districts: 30, status: 'Critical', population: '4.19 Cr' },
  { id: 'up', name: 'Uttar Pradesh', risk: 38, alerts: 22, sensors: 2100, districts: 75, status: 'Safe', population: '19.98 Cr' },
  { id: 'ka', name: 'Karnataka', risk: 51, alerts: 15, sensors: 1100, districts: 31, status: 'Moderate', population: '6.11 Cr' },
];

export default function StatesDirectory() {
  return (
    <OperationsShell eyebrow="National disaster intelligence and state-level readiness" title="States Directory">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by state name..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 shadow-sm">
            <Filter size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-50 transition-colors">
            <Download size={18} /> Export Data
          </button>
          <button className="flex items-center gap-2 bg-[#061a37] text-white px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-900/10">
            <Plus size={18} /> Add State
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {states.map((state) => (
          <Link 
            key={state.id} 
            href={`/districts?state=${state.id}`}
            className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{state.name}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Republic of India</p>
               </div>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                  state.risk > 80 ? 'bg-red-50 border-red-100 text-red-600' :
                  state.risk > 50 ? 'bg-orange-50 border-orange-100 text-orange-600' :
                  'bg-green-50 border-green-100 text-green-600'
               }`}>
                  <Globe size={24} />
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk</p>
                  <p className={`text-lg font-black ${state.risk > 80 ? 'text-red-600' : 'text-[#0f172a]'}`}>{state.risk}%</p>
               </div>
               <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Districts</p>
                  <p className="text-lg font-black text-[#0f172a]">{state.districts}</p>
               </div>
               <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sensors</p>
                  <p className="text-lg font-black text-[#0f172a]">{state.sensors}</p>
               </div>
            </div>

            <div className="space-y-4 mb-6">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Regional Readiness</span>
                  <span className="text-[#0f172a]">{100 - state.risk}%</span>
               </div>
               <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${state.risk > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${100 - state.risk}%` }}></div>
               </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                     <AlertTriangle size={14} />
                  </div>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{state.alerts} Active Alerts</span>
               </div>
               <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-[10px] font-black uppercase tracking-widest">View Districts</span>
                  <ChevronRight size={16} />
               </div>
            </div>
          </Link>
        ))}
      </div>
    </OperationsShell>
  );
}
