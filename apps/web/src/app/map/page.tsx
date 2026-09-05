'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Layers, ZoomIn, ZoomOut,
  Navigation, MapPin, Clock,
  Loader2, RefreshCw
} from 'lucide-react';
import { OperationsShell } from '@/components/operations-shell';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api-client';
import { wsClient } from '@/lib/websocket-client';
import { parseGeoPoint } from '@/lib/geo';
import type { MapCommand, MapStyle } from '@/components/live-map';

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

type LayerKey = 'incident' | 'alert' | 'device';

const LAYERS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'incident', label: 'Incidents', color: 'bg-orange-500' },
  { key: 'alert', label: 'Alerts', color: 'bg-red-500' },
  { key: 'device', label: 'Sensor Network', color: 'bg-green-500' },
];

export default function CommandMapPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<MapEntity[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    incident: true,
    alert: true,
    device: true,
  });
  const [mapStyle, setMapStyle] = useState<MapStyle>('Default');
  const [mapCommand, setMapCommand] = useState<MapCommand | undefined>(undefined);
  const [wsConnected, setWsConnected] = useState(wsClient.isConnected());

  useEffect(() => {
    const stopConnection = wsClient.onConnectionChange((state) => {
      setWsConnected(state === 'connected' || state === 'reconnected');
    });
    return () => {
      stopConnection();
    };
  }, []);

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const [incidentsRes, alertsRes, devicesRes] = await Promise.all([
        apiClient.get('/incidents'),
        apiClient.get('/alerts/active'),
        apiClient.get('/devices'),
      ]);

      const mapEntities: MapEntity[] = [];

      incidentsRes.data.data.forEach((item: any) => {
        if (item.location?.location) {
          const coords = parseGeoPoint(item.location.location);
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
          const coords = parseGeoPoint(item.location.location);
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

      devicesRes.data.data.forEach((item: any) => {
        if (item.location?.location) {
          const coords = parseGeoPoint(item.location.location);
          if (coords) {
            mapEntities.push({
              id: item.id,
              kind: 'device',
              title: item.serial_number || item.name || 'Sensor',
              detail: item.type,
              status: item.status,
              latitude: coords.lat,
              longitude: coords.lng
            });
          }
        }
      });

      setEntities(mapEntities);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch map data:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const visibleEntities = entities.filter((e) => visibleLayers[e.kind as LayerKey] !== false);
  const dispatchMapCommand = (type: MapCommand['type']) =>
    setMapCommand((prev) => ({ type, token: (prev?.token ?? 0) + 1 }));

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
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Operational Layers</p>
                 <div className="space-y-3">
                    {LAYERS.map((layer) => (
                      <LayerToggle
                        key={layer.key}
                        label={layer.label}
                        color={layer.color}
                        active={visibleLayers[layer.key]}
                        count={entities.filter((e) => e.kind === layer.key).length}
                        onToggle={() =>
                          setVisibleLayers((prev) => ({ ...prev, [layer.key]: !prev[layer.key] }))
                        }
                      />
                    ))}
                 </div>
              </div>
           </div>

           <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setVisibleLayers({ incident: true, alert: true, device: true })}
                className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-white hover:border-blue-500 transition-all"
              >
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
              </div>

              <div className="flex items-center gap-3 pointer-events-auto">
                 {loading && (
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-2 border border-gray-200 rounded-xl shadow-lg flex items-center gap-2">
                     <Loader2 size={14} className="animate-spin text-blue-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing...</span>
                   </div>
                 )}
                 <div className="flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-1">
                    <button
                      onClick={() => setMapStyle('Default')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${mapStyle === 'Default' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    >
                      2D
                    </button>
                    <button
                      onClick={() => setMapStyle('Satellite')}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${mapStyle === 'Satellite' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                    >
                      SAT
                    </button>
                 </div>
              </div>
           </div>

           {/* Floating Map Controls (Bottom Right) */}
           <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-3">
              <div className="flex bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                 <button
                   onClick={() => dispatchMapCommand('zoomIn')}
                   className="p-3 hover:bg-white text-gray-600 border-r border-gray-100 transition-colors"
                 >
                   <ZoomIn size={20} />
                 </button>
                 <button
                   onClick={() => dispatchMapCommand('zoomOut')}
                   className="p-3 hover:bg-white text-gray-600 transition-colors"
                 >
                   <ZoomOut size={20} />
                 </button>
              </div>
              <button
                onClick={() => dispatchMapCommand('recenter')}
                title="Recenter on India"
                className="p-3 bg-blue-600 text-white border border-blue-500 rounded-xl shadow-lg hover:bg-blue-700 transition-all"
              >
                 <Navigation size={20} />
              </button>
           </div>

           {/* Map Legend (Bottom Left) */}
           <div className="absolute bottom-8 left-8 z-10 max-w-xs">
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-5">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Map Status</h4>
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase ${wsConnected ? 'text-green-600' : 'text-gray-400'}`}>
                       <div className={`w-1 h-1 rounded-full ${wsConnected ? 'bg-green-600' : 'bg-gray-400'}`}></div> {wsConnected ? 'Connected' : 'Disconnected'}
                    </span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3">
                       <div className={`w-2.5 h-2.5 rounded-full ${visibleEntities.length > 0 ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                       <p className="text-xs font-bold text-[#0f172a]">{visibleEntities.length} Active Operational Markers</p>
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
              <LiveMap entities={visibleEntities} mapStyle={mapStyle} showZoomControl={false} command={mapCommand} />
           </div>

           {/* Map Footer Info */}
           <div className="bg-white border-t border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {wsConnected ? 'Real-time Synchronization Active' : 'Live Feed Disconnected'}
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {lastUpdated ? `Last Updated: ${lastUpdated.toLocaleTimeString()}` : 'Not yet synced'}
                    </span>
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

function LayerToggle({ label, color, active = false, count, onToggle }: { label: string; color: string; active?: boolean; count?: number; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
       <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded ${color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
          <span className={`text-xs font-bold transition-colors ${active ? 'text-[#0f172a]' : 'text-gray-400 group-hover:text-gray-600'}`}>{label}</span>
          {count !== undefined && <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded-md font-bold text-gray-500">{count}</span>}
       </div>
       <button
         type="button"
         onClick={(e) => { e.stopPropagation(); onToggle(); }}
         className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-200'}`}
       >
          <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all" style={{ left: active ? '18px' : '2px' }}></div>
       </button>
    </div>
  );
}
