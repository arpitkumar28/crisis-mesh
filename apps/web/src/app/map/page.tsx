'use client';

import React, { useState } from 'react';
import {
  Map as MapIcon, Filter, Search, Layers,
  ChevronRight, Maximize2, ZoomIn, ZoomOut,
  Navigation, MousePointer2, AlertTriangle,
  Bell, Activity, Radio, Shield, MapPin,
  ChevronDown, Settings, Info, Clock, ArrowUpRight
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-black text-blue-900/20 text-4xl">Loading Command Map...</div>
});

export default function CommandMapPage() {
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <OperationsShell eyebrow="Interactive geospatial disaster intelligence" title="Live Operational Map">
      <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[600px]">

        {/* Map Layers & Controls Sidebar */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-0'}`}>
           <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Map Layers</h3>
              <button className="text-gray-400 hover:text-blue-600"><Settings size={16} /></button>
           </div>

           <div className="flex-1 overflow-y-auto p-5 space-y-8">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Hazard Overlays</p>
                 <div className="space-y-3">
                    <LayerToggle label="Flood Risk Zones" color="bg-blue-500" active />
                    <LayerToggle label="Fire Vulnerability" color="bg-red-500" />
                    <LayerToggle label="Cyclone Trajectory" color="bg-purple-500" active />
                    <LayerToggle label="Seismic Activity" color="bg-orange-500" />
                 </div>
              </div>

              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Infrastructure</p>
                 <div className="space-y-3">
                    <LayerToggle label="Sensor Network" color="bg-green-500" active />
                    <LayerToggle label="Relief Shelters" color="bg-cyan-500" active />
                    <LayerToggle label="Medical Facilities" color="bg-rose-500" />
                    <LayerToggle label="Road Blockages" color="bg-gray-700" active />
                 </div>
              </div>

              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dynamic Data</p>
                 <div className="space-y-3">
                    <LayerToggle label="Live Rainfall (IMD)" color="bg-blue-400" active />
                    <LayerToggle label="Cloud Coverage" color="bg-gray-200" />
                    <LayerToggle label="Active Incidents" color="bg-red-600" active />
                 </div>
              </div>
           </div>

           <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-white hover:border-blue-500 transition-all">
                 Reset All Layers
              </button>
           </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
           {/* Map Toolbar */}
           <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto">
                 <button
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                   className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-[#0f172a] hover:bg-white transition-all"
                 >
                    <Layers size={20} />
                 </button>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search location..."
                      className="w-80 pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-sm font-bold text-[#0f172a] focus:outline-none"
                    />
                 </div>
              </div>

              <div className="flex items-center gap-3 pointer-events-auto">
                 <div className="flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-1">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest">2D</button>
                    <button className="px-4 py-2 text-gray-400 text-xs font-black uppercase tracking-widest">3D</button>
                    <button className="px-4 py-2 text-gray-400 text-xs font-black uppercase tracking-widest">SAT</button>
                 </div>
                 <button className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg text-[#0f172a]">
                    <Maximize2 size={20} />
                 </button>
              </div>
           </div>

           {/* Floating Map Controls (Bottom Right) */}
           <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
              <div className="flex flex-col bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                 <button className="p-3 hover:bg-white text-gray-600 border-b border-gray-100 transition-colors"><ZoomIn size={20} /></button>
                 <button className="p-3 hover:bg-white text-gray-600 transition-colors"><ZoomOut size={20} /></button>
              </div>
              <button className="p-3 bg-blue-600 text-white border border-blue-500 rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                 <Navigation size={20} />
              </button>
           </div>

           {/* Map Legend (Bottom Left) */}
           <div className="absolute bottom-8 left-8 z-10 max-w-xs">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-5">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Map Status</h4>
                    <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                       <div className="w-1 h-1 rounded-full bg-green-600"></div> Connected
                    </span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)] animate-pulse"></div>
                       <p className="text-xs font-bold text-[#0f172a]">3 Critical Incidents in Area</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                       <MapPin size={14} className="text-blue-500" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">Jaipur, Rajasthan • 26.91°N, 75.78°E</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Actual Map Component */}
           <div className="flex-1 bg-blue-50">
              <LiveMap entities={[]} />
           </div>

           {/* Map Footer Info */}
           <div className="bg-white border-t border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historical View: 24h</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Interval: 30s</span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Data Source: CrisisMesh IoT + IMD Sentinel</span>
                 <button className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    Detailed Analytics <ArrowUpRight size={14} />
                 </button>
              </div>
           </div>
        </div>

      </div>
    </OperationsShell>
  );
}

function LayerToggle({ label, color, active = false }: { label: string; color: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
       <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
          <span className={`text-xs font-bold transition-colors ${active ? 'text-[#0f172a]' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
       </div>
       <button className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left(4.5)' : 'left-0.5'}`} style={{ left: active ? '18px' : '2px' }}></div>
       </button>
    </div>
  );
}
