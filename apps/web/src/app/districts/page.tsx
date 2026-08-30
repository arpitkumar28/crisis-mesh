'use client';

import React, { useState } from 'react';
import {
  MapPin, Search, Filter, Plus,
  ChevronRight, Shield,
  AlertTriangle, Users,
  ChevronDown, Map as MapIcon, Globe
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import Link from 'next/link';

const districts = [
  { id: 'raj-jpr', name: 'Jaipur', state: 'Rajasthan', risk: 87, alerts: 7, sensors: 67, status: 'High Risk', population: '6.98 Lakh' },
  { id: 'raj-jod', name: 'Jodhpur', state: 'Rajasthan', risk: 42, alerts: 2, sensors: 45, status: 'Moderate', population: '1.13M' },
  { id: 'raj-udp', name: 'Udaipur', state: 'Rajasthan', risk: 15, alerts: 0, sensors: 32, status: 'Safe', population: '451k' },
  { id: 'raj-ajm', name: 'Ajmer', state: 'Rajasthan', risk: 64, alerts: 4, sensors: 38, status: 'High Risk', population: '542k' },
  { id: 'raj-kot', name: 'Kota', state: 'Rajasthan', risk: 55, alerts: 3, sensors: 41, status: 'Moderate', population: '1.00M' },
  { id: 'raj-bik', name: 'Bikaner', state: 'Rajasthan', risk: 28, alerts: 1, sensors: 29, status: 'Safe', population: '644k' },
];

export default function DistrictsDirectory() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <OperationsShell eyebrow="Regional disaster readiness and surveillance" title="Districts Directory">
      {/* Search & Filter Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by district name, code or state..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[#0f172a] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <select className="appearance-none bg-white border border-gray-200 rounded-xl px-5 py-3 pr-12 text-sm font-bold text-gray-700 focus:outline-none shadow-sm">
              <option>All States</option>
              <option>Rajasthan</option>
              <option>Gujarat</option>
              <option>Odisha</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
          <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 shadow-sm">
            <Filter size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button onClick={() => setView('grid')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Grid</button>
             <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>List</button>
          </div>
          <button className="flex items-center gap-2 bg-[#061a37] text-white px-5 py-3 rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-900/10">
            <Plus size={18} /> Add District
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Globe size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total States</p>
               <h4 className="text-2xl font-black text-[#0f172a]">28</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
               <MapIcon size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Districts</p>
               <h4 className="text-2xl font-black text-[#0f172a]">766</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
               <AlertTriangle size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">High Risk Areas</p>
               <h4 className="text-2xl font-black text-red-600">42</h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
               <Shield size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safe Zones</p>
               <h4 className="text-2xl font-black text-green-600">685</h4>
            </div>
         </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {districts.map((district) => (
            <Link
              key={district.id}
              href={`/districts/${district.id}`}
              className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{district.name}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{district.state}, India</p>
                 </div>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                    district.risk > 80 ? 'bg-red-50 border-red-100 text-red-600' :
                    district.risk > 40 ? 'bg-orange-50 border-orange-100 text-orange-600' :
                    'bg-green-50 border-green-100 text-green-600'
                 }`}>
                    <MapPin size={24} />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                 <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk</p>
                    <p className={`text-lg font-black ${district.risk > 80 ? 'text-red-600' : 'text-[#0f172a]'}`}>{district.risk}%</p>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Alerts</p>
                    <p className="text-lg font-black text-[#0f172a]">{district.alerts}</p>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sensors</p>
                    <p className="text-lg font-black text-[#0f172a]">{district.sensors}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                       <Users size={14} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{district.population}</span>
                 </div>
                 <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-black uppercase tracking-widest">Full Analysis</span>
                    <ChevronRight size={16} />
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">District</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">State</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Risk</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Alerts</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Sensors</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {districts.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                       <td className="px-8 py-5">
                          <span className="text-sm font-black text-[#0f172a] uppercase">{d.name}</span>
                       </td>
                       <td className="px-8 py-5 text-sm font-bold text-gray-500 uppercase">{d.state}</td>
                       <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${d.risk > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${d.risk}%` }}></div>
                             </div>
                             <span className="text-xs font-black text-[#0f172a]">{d.risk}%</span>
                          </div>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                             d.status === 'High Risk' ? 'bg-red-100 text-red-600' :
                             d.status === 'Moderate' ? 'bg-orange-100 text-orange-600' :
                             'bg-green-100 text-green-600'
                          }`}>{d.status}</span>
                       </td>
                       <td className="px-8 py-5 text-center font-black text-sm text-[#0f172a]">{d.alerts}</td>
                       <td className="px-8 py-5 text-center font-black text-sm text-[#0f172a]">{d.sensors}</td>
                       <td className="px-8 py-5 text-right">
                          <Link href={`/districts/${d.id}`} className="text-blue-600 hover:underline text-[10px] font-black uppercase tracking-widest">View Profile →</Link>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
         <p>Showing 6 of 766 districts</p>
         <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Previous</button>
            <div className="flex gap-1">
               <button className="w-10 h-10 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">1</button>
               <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">2</button>
               <button className="w-10 h-10 rounded-xl bg-white border border-gray-200 hover:bg-gray-50">3</button>
            </div>
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Next</button>
         </div>
      </div>
    </OperationsShell>
  );
}
