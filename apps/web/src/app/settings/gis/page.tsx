'use client';

import React, { useState } from 'react';
import { 
  Layers, Globe, Map as MapIcon, Database, 
  Settings, ChevronRight, CheckSquare, Square,
  Eye, EyeOff, Maximize2, Navigation,
  Plus, Search, Filter, Info
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), { 
  ssr: false, 
  loading: () => <div className="h-full bg-blue-50 flex items-center justify-center text-blue-900/20 font-black">Loading GIS Workspace...</div> 
});

const layerCategories = [
  {
    title: 'Administrative',
    layers: [
      { name: 'District Boundaries', active: true, opacity: 100 },
      { name: 'Ward Boundaries', active: true, opacity: 70 },
      { name: 'Village Boundaries', active: false, opacity: 50 },
    ]
  },
  {
    title: 'Environmental',
    layers: [
      { name: 'Flood Hazard Zones', active: true, opacity: 85 },
      { name: 'River Networks', active: true, opacity: 100 },
      { name: 'Elevation Models (DEM)', active: false, opacity: 60 },
      { name: 'Land Cover', active: false, opacity: 50 },
    ]
  },
  {
    title: 'Infrastructure',
    layers: [
      { name: 'Primary Road Network', active: true, opacity: 100 },
      { name: 'Power Grid Nodes', active: false, opacity: 100 },
      { name: 'Water Pipelines', active: false, opacity: 100 },
      { name: 'Communication Towers', active: true, opacity: 80 },
    ]
  },
  {
    title: 'Social & Emergency',
    layers: [
      { name: 'Population Density', active: true, opacity: 40 },
      { name: 'Health Facilities', active: true, opacity: 100 },
      { name: 'Evacuation Shelters', active: true, opacity: 100 },
      { name: 'Police Stations', active: false, opacity: 100 },
    ]
  }
];

export default function GISMapLayersPage() {
  return (
    <OperationsShell eyebrow="Manage platform layers and geospatial data" title="GIS & Map Layers">
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
         {['Map Layers', 'Geospatial Data', 'Layer Settings'].map(tab => (
            <button key={tab} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${
               tab === 'Map Layers' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}>
               {tab}
               {tab === 'Map Layers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
            </button>
         ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Layer Controls Sidebar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-wider">Layer Control</h3>
                 <button className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1">
                    <Plus size={14} /> Add Layer
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 {layerCategories.map(cat => (
                    <div key={cat.title}>
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{cat.title}</h4>
                       <div className="space-y-4">
                          {cat.layers.map(layer => (
                             <div key={layer.name} className="space-y-2">
                                <div className="flex items-center justify-between group cursor-pointer">
                                   <div className="flex items-center gap-3">
                                      {layer.active ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-gray-300" />}
                                      <span className="text-[11px] font-black text-[#0f172a] uppercase tracking-tight">{layer.name}</span>
                                   </div>
                                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {layer.active ? <Eye size={14} className="text-gray-400" /> : <EyeOff size={14} className="text-gray-400" />}
                                      <Settings size={14} className="text-gray-400 hover:text-blue-600" />
                                   </div>
                                </div>
                                {layer.active && (
                                   <div className="pl-7 pr-2 flex items-center gap-3">
                                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                         <div className="h-full bg-blue-500" style={{ width: `${layer.opacity}%` }}></div>
                                      </div>
                                      <span className="text-[8px] font-black text-gray-400">{layer.opacity}%</span>
                                   </div>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Base Map</p>
                 <div className="grid grid-cols-3 gap-3">
                    <div className="aspect-square bg-white border-2 border-blue-600 rounded-xl overflow-hidden relative cursor-pointer">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                       <p className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-blue-600 uppercase">Default</p>
                    </div>
                    <div className="aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden relative cursor-pointer hover:border-blue-600 transition-all">
                       <div className="absolute inset-0 bg-gray-800 opacity-80"></div>
                       <p className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-white uppercase">Satellite</p>
                    </div>
                    <div className="aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden relative cursor-pointer hover:border-blue-600 transition-all">
                       <div className="absolute inset-0 bg-gray-200"></div>
                       <p className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-gray-400 uppercase">Terrain</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Workspace - Right Side */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[40px] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">GIS Workspace</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-xl text-[9px] font-black text-blue-600 uppercase">
                       <Globe size={12} /> EPSG:4326 - WGS 84
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Search size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Maximize2 size={16} /></button>
                    <button className="px-5 py-2 bg-[#0f172a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">Export View</button>
                 </div>
              </div>

              <div className="flex-1 relative bg-blue-50/20">
                 <LiveMap entities={[]} />
                 
                 {/* Legend Overlay */}
                 <div className="absolute top-6 right-6 w-48 bg-white/90 backdrop-blur-md rounded-[24px] border border-gray-100 shadow-2xl p-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Legend</p>
                    <div className="space-y-4">
                       <LegendItem color="bg-red-500" label="Flood Zone (High)" />
                       <LegendItem color="bg-orange-500" label="Flood Zone (Med)" />
                       <LegendItem color="bg-blue-600" label="Water Network" />
                       <LegendItem color="bg-green-500" label="Safe Shelter" />
                       <LegendItem color="bg-purple-600" label="Health Facility" />
                    </div>
                 </div>

                 {/* Navigation Controls */}
                 <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center text-[#0f172a] font-black">+</button>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center text-[#0f172a] font-black">-</button>
                 </div>
                 
                 <div className="absolute bottom-6 right-6">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                       <p className="text-[8px] font-black text-gray-400 uppercase">Current View</p>
                       <p className="text-[9px] font-black text-[#0f172a]">Jaipur, Rajasthan • Scale 1:25,000</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </OperationsShell>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
       <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`}></div>
       <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-tight leading-none">{label}</span>
    </div>
  );
}
