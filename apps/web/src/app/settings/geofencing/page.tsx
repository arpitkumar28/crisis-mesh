'use client';

import React, { useState } from 'react';
import { 
  Layers, MapPin, Bell, Activity, 
  ChevronRight, Plus, Search, Filter,
  Settings, Save, Shield, Radio,
  Maximize2, Navigation, Info, Trash2,
  Edit2, Eye, Layout
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black uppercase tracking-widest text-xs">Loading Geofence Workspace...</div> 
});

const geofences = [
  { id: 'GF-001', name: 'Jaipur River Basin', type: 'Polygon', status: 'Active', alerts: 12, risk: 'High' },
  { id: 'GF-002', name: 'Malviya Sector 4', type: 'Circle', status: 'Active', alerts: 8, risk: 'Critical' },
  { id: 'GF-003', name: 'Airport Safe Zone', type: 'Polygon', status: 'Active', alerts: 0, risk: 'Low' },
  { id: 'GF-004', name: 'NH-48 Corridor', type: 'Polyline', status: 'Active', alerts: 15, risk: 'Medium' },
];

const rules = [
  { id: 'RL-102', event: 'Water Level > 3m', action: 'Send SMS Alert', priority: 'High', status: 'Active' },
  { id: 'RL-105', event: 'Rainfall > 50mm/h', action: 'Trigger Siren', priority: 'Critical', status: 'Active' },
  { id: 'RL-108', event: 'Sensor Offline > 2h', action: 'Notify Admin', priority: 'Medium', status: 'Active' },
];

export default function GeofencingRulesPage() {
  return (
    <OperationsShell eyebrow="Manage geofences and automated alert rules" title="Geofencing & Alert Rules">
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
         {['Geofences', 'Alert Rules', 'Trigger History'].map(tab => (
            <button key={tab} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
               tab === 'Geofences' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
               {tab}
               {tab === 'Geofences' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Geofence Controls Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Active Geofences</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                    <Plus size={14} /> Create
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {geofences.map(gf => (
                    <div key={gf.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all cursor-pointer">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-[8px] font-black text-blue-600 uppercase">#{gf.id}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                             gf.risk === 'Critical' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>{gf.risk}</span>
                       </div>
                       <h4 className="text-xs font-black text-[#0f172a] uppercase tracking-tight mb-2">{gf.name}</h4>
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{gf.type} • {gf.alerts} Alerts</span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="text-gray-400 hover:text-blue-600"><Edit2 size={12} /></button>
                             <button className="text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Alert Rules</h4>
                 <div className="space-y-3">
                    {rules.map(rule => (
                       <div key={rule.id} className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-[#0f172a] truncate max-w-[150px] uppercase">{rule.event}</p>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${rule.status === 'Active' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                             <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-all transform translate-x-4"></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Workspace - Right Side */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Spatial Workspace</h3>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                       <button className="px-3 py-1 bg-white text-blue-600 rounded-lg text-[9px] font-black uppercase shadow-sm">Draw</button>
                       <button className="px-3 py-1 text-gray-400 rounded-lg text-[9px] font-black uppercase">Edit</button>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Search size={16} /></button>
                    <button className="px-5 py-2 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">Save Geofence</button>
                 </div>
              </div>

              <div className="flex-1 relative bg-blue-50/20">
                 <LiveMap entities={[]} />
                 
                 {/* Map Legend/Overlay */}
                 <div className="absolute top-6 right-6 w-48 bg-white/90 backdrop-blur-md rounded-[24px] border border-gray-100 shadow-2xl p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Zone Details</p>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Area</span>
                          <span className="text-[10px] font-black text-[#0f172a]">45.2 km²</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Type</span>
                          <span className="text-[10px] font-black text-[#0f172a]">Flood Basin</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-400 uppercase">Alerts</span>
                          <span className="text-[10px] font-black text-red-600">Active</span>
                       </div>
                    </div>
                 </div>

                 {/* Drawing Toolbar */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl">
                    <DrawingTool icon={<LayoutGrid size={16} />} active />
                    <DrawingTool icon={<Radio size={16} />} />
                    <DrawingTool icon={<Navigation size={16} />} />
                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                    <DrawingTool icon={<Trash2 size={16} />} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function DrawingTool({ icon, active = false }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`p-3 rounded-xl transition-all ${
       active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:bg-gray-50'
    }`}>
       {icon}
    </button>
  );
}

function LayoutGrid({ size, className }: { size?: number; className?: string }) {
  return <Layout size={size} className={className} />;
}
