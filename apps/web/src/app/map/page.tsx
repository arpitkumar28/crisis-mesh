'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Layers, Search, ZoomIn, ZoomOut,
  Navigation, MapPin, Clock,
  Loader2, RefreshCw
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';

const LiveMap = dynamic(() => import('@/components/live-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-blue-50 flex items-center justify-center font-bold text-blue-900/20 text-4xl">Loading Command Map...</div>
});

interface MapEntity {
  id: string;
  kind: 'device' | 'alert' | 'incident' | 'disaster' | 'weather' | 'news' | 'responder' | 'shelter';
  title: string;
  detail: string;
  severity?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
}

export default function CommandMapPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<MapEntity[]>([]);

  // Helper to parse PostGIS geography string
  // This handles simple WKT "POINT(lng lat)" or common JSON formats
  const parseGeo = useCallback((geo: any) => {
    if (typeof geo === 'string' && geo.includes('POINT')) {
      const match = geo.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
      if (match) {
        return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
      }
    }
    if (geo && typeof geo === 'object' && geo.coordinates) {
      return { lng: geo.coordinates[0], lat: geo.coordinates[1] };
    }
    // Fallback: If the backend already sends lat/lng in location object
    return null;
  }, []);

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      // Using the specialized map endpoint if available, otherwise fallback to separate ones
      // Based on DashboardService, there's a getPublicMap logic, but let's check if there's a controller for it
      // For now, we'll fetch incidents and alerts which are P0/P1 requirements
      const [incidentsRes, alertsRes] = await Promise.all([
        apiClient.get('/incidents'),
        apiClient.get('/alerts/active')
      ]);

      const mapEntities: MapEntity[] = [];

      incidentsRes.data.data.forEach((item: any) => {
        if (item.location?.location) {
          // Parse PostGIS location if it's in a usable format or has lat/lng
          // Assuming the backend might be sending lat/lng now or we need to extract from WKT/WKB
          // If the backend sends WKT "POINT(lng lat)"
          const coords = parseGeo(item.location.location);
          if (coords) {
            mapEntities.push({
              id: item.id,
              kind: 'incident',
              title: item.title,
              detail: item.description || item.type,
              severity: item.severity,
              status: item.status,
              latitude: coords.lat,
              longitude: coords.lng
            });
          }
        }
      });

      alertsRes.data.data.forEach((item: any) => {
        if (item.location?.location) {
          const coords = parseGeo(item.location.location);
          if (coords) {
            mapEntities.push({
              id: item.id,
              kind: 'alert',
              title: item.title,
              detail: item.description || item.type,
              severity: item.severity,
              status: item.status,
              latitude: coords.lat,
              longitude: coords.lng
            });
          }
        }
      });

      setEntities(mapEntities);
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseGeo]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  return (
    <OperationsShell eyebrow="Interactive geospatial disaster intelligence" title="Live Operational Map">
      <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[600px]">

        {/* Map Layers & Controls Sidebar */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-0'}`}>
           <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-black text-[#0f172a] uppercase tracking-wider text-xs">Map Layers</h3>
              <button onClick={fetchMapData} className="text-gray-400 hover:text-blue-600">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-5 space-y-8">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Active Operations</p>
                 <div className="space-y-3">
                    <LayerToggle label="Incidents" color="bg-orange-500" active count={entities.filter(e => e.kind === 'incident').length} />
                    <LayerToggle label="Alerts" color="bg-red-500" active count={entities.filter(e => e.kind === 'alert').length} />
                 </div>
              </div>

              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Infrastructure</p>
                 <div className="space-y-3">
                    <LayerToggle label="Sensor Network" color="bg-green-500" active />
                    <LayerToggle label="Relief Shelters" color="bg-cyan-500" />
                    <LayerToggle label="Road Blockages" color="bg-gray-700" />
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
                 {loading && (
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-2 border border-gray-200 rounded-xl shadow-lg flex items-center gap-2">
                     <Loader2 size={14} className="animate-spin text-blue-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing...</span>
                   </div>
                 )}
                 <div className="flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-1">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest">2D</button>
                    <button className="px-4 py-2 text-gray-400 text-xs font-black uppercase tracking-widest">SAT</button>
                 </div>
              </div>
           </div>

           {/* Floating Map Controls (Bottom Right) */}
           <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
              <div className="flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                 <button className="p-3 hover:bg-white text-gray-600 border-r border-gray-100 transition-colors"><ZoomIn size={20} /></button>
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
                       <div className={`w-2.5 h-2.5 rounded-full ${entities.length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                       <p className="text-xs font-bold text-[#0f172a]">{entities.length} Active Operational Markers</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                       <MapPin size={14} className="text-blue-500" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">Command Center View</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Actual Map Component */}
           <div className="flex-1 bg-blue-50">
              <LiveMap entities={entities} />
           </div>

           {/* Map Footer Info */}
           <div className="bg-white border-t border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Real-time Synchronization Active</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated: {new Date().toLocaleTimeString()}</span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Data Source: CrisisMesh Central Authority</span>
              </div>
           </div>
        </div>

      </div>
    </OperationsShell>
  );
}

function LayerToggle({ label, color, active = false, count }: { label: string; color: string; active?: boolean; count?: number }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
       <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
          <span className={`text-xs font-bold transition-colors ${active ? 'text-[#0f172a]' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
          {count !== undefined && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-md font-bold text-gray-500">{count}</span>}
       </div>
       <button className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200'}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left(4.5)' : 'left-0.5'}`} style={{ left: active ? '18px' : '2px' }}></div>
       </button>
    </div>
  );
}
