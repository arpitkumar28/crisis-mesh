'use client';

import React from 'react';
import { 
  Shield, MapPin, Clock, ChevronRight, Navigation,
  Filter, Search
} from 'lucide-react';
import { ResponderShell } from '@/components/responder-shell';

const assignments = [
  { id: 'ASN-01', title: 'Food Rescue - Mansarovar', status: 'In Progress', priority: 'High', location: 'Sector 4, Mansarovar', deadline: '03:00 PM', assignedAt: '02:15 PM' },
  { id: 'ASN-02', title: 'Health Camp Setup', status: 'Assigned', priority: 'Medium', location: 'Jaipur North', deadline: '05:00 PM', assignedAt: '02:30 PM' },
  { id: 'ASN-03', title: 'Relief Material Delivery', status: 'Assigned', priority: 'Medium', location: 'Malviya Nagar', deadline: '04:30 PM', assignedAt: '02:45 PM' },
  { id: 'ASN-05', title: 'Evacuation Support', status: 'Assigned', priority: 'High', location: 'Amer Road', deadline: '02:30 PM', assignedAt: '01:50 PM' },
  { id: 'ASN-06', title: 'Search & Rescue Unit 7', status: 'Completed', priority: 'Critical', location: 'Old City', deadline: '01:00 PM', assignedAt: '11:30 AM' },
];

export default function ResponderAssignmentsPage() {
  return (
    <ResponderShell eyebrow="Manage and track your active mission assignments" title="My Assignments">
      <div className="bg-white rounded-[32px] border border-gray-200 p-6 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex gap-2">
           {['All', 'Assigned', 'In Progress', 'Completed'].map(tab => (
              <button key={tab} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'All' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 text-gray-400'}`}>
                 {tab}
              </button>
           ))}
        </div>
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search assignments..." className="pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-black w-64 focus:outline-none" />
           </div>
           <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 transition-all"><Filter size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
         {assignments.map(asn => (
            <div key={asn.id} className="bg-white rounded-[32px] border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                    asn.status === 'Completed' ? 'bg-green-50 border-green-100 text-green-600' :
                    asn.priority === 'High' ? 'bg-red-50 border-red-100 text-red-600' :
                    'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                    <Shield size={24} />
                  </div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                     asn.status === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                     asn.status === 'Assigned' ? 'bg-green-100 text-green-600' :
                     'bg-gray-100 text-gray-400'
                  }`}>{asn.status}</span>
               </div>

               <div className="mb-8">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">#{asn.id}</p>
                  <h4 className="text-xl font-black text-[#0f172a] uppercase tracking-tight group-hover:text-blue-600 transition-colors">{asn.title}</h4>
               </div>

               <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 text-gray-500">
                     <MapPin size={16} className="text-gray-300" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{asn.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                     <Clock size={16} className="text-gray-300" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Deadline: {asn.deadline}</span>
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:translate-x-1 transition-all">
                     View Mission Details <ChevronRight size={14} />
                  </button>
                  <button className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                     <Navigation size={18} />
                  </button>
               </div>
            </div>
         ))}
      </div>
    </ResponderShell>
  );
}
