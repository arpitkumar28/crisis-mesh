'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const INDIA_VIEW: { center: L.LatLngExpression; zoom: number } = {
  center: [20.5937, 78.9629],
  zoom: 5,
};

export interface MapEntity {
  id: string;
  kind: 'device' | 'alert' | 'incident' | 'disaster' | 'weather' | 'news' | 'responder' | 'shelter';
  title: string;
  detail: string;
  severity?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
}

export type MapStyle = 'Default' | 'Satellite' | 'Terrain' | 'Dark';

export interface MapCommand {
  type: 'zoomIn' | 'zoomOut' | 'recenter';
  token: number;
}

const colors = { device: '#55d6be', alert: '#ff5c5c', incident: '#ffad4a', disaster: '#e52336', weather: '#62a8ff', news: '#f2b314', responder: '#b48cff', shelter: '#62a8ff' };
const tileLayers: Record<MapStyle, { url: string; attribution: string }> = {
  Default: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
  Satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  Terrain: { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenTopoMap contributors' },
  Dark: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
};

function coordinates(entity: MapEntity) {
  if (typeof entity.latitude !== 'number' || typeof entity.longitude !== 'number') return null;
  return [entity.latitude, entity.longitude] as L.LatLngExpression;
}

export default function LiveMap({
  entities,
  mapStyle = 'Default',
  showZoomControl = true,
  command,
}: {
  entities: MapEntity[];
  mapStyle?: MapStyle;
  showZoomControl?: boolean;
  /**
   * next/dynamic (used by every page that renders this map) does not
   * forward refs to the loaded component, so imperative zoom/recenter
   * actions from a parent page are sent as a command object instead of
   * a ref handle. Bump `token` on every dispatch so repeating the same
   * `type` (e.g. zoomIn twice) is still detected as a new command.
   */
  command?: MapCommand;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const tilesRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView(INDIA_VIEW.center, INDIA_VIEW.zoom);
    if (showZoomControl) {
      L.control.zoom({ position: 'bottomright' }).addTo(map);
    }
    const tiles = tileLayers.Default;
    tilesRef.current = L.tileLayer(tiles.url, { attribution: tiles.attribution }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    instanceRef.current = map;
    return () => { map.remove(); instanceRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;
    tilesRef.current?.removeFrom(map);
    const tiles = tileLayers[mapStyle];
    tilesRef.current = L.tileLayer(tiles.url, { attribution: tiles.attribution }).addTo(map);
    map.getContainer().classList.toggle('map-style-dark', mapStyle === 'Dark');
  }, [mapStyle]);

  useEffect(() => {
    const markers = markersRef.current;
    if (!markers) return;
    markers.clearLayers();
    entities.forEach((entity) => {
      const point = coordinates(entity);
      if (!point) return;
      const marker = L.circleMarker(point, { radius: entity.kind === 'alert' || entity.kind === 'incident' ? 9 : 7, color: colors[entity.kind], fillColor: colors[entity.kind], fillOpacity: 0.82, weight: 2 });
      marker.bindPopup(`<strong>${entity.title}</strong><br />${entity.detail}${entity.status ? `<br />Status: ${entity.status}` : ''}`);
      marker.addTo(markers);
    });
  }, [entities]);

  useEffect(() => {
    const map = instanceRef.current;
    if (!map || !command) return;
    if (command.type === 'zoomIn') map.zoomIn();
    else if (command.type === 'zoomOut') map.zoomOut();
    else if (command.type === 'recenter') map.setView(INDIA_VIEW.center, INDIA_VIEW.zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.token]);

  const positioned = entities.filter((entity) => coordinates(entity)).length;
  return <div className="map-frame"><div ref={mapRef} className="live-map" aria-label="Live disaster map" />{positioned === 0 && <div className="map-empty"><span>No geographic locations available</span><small>Markers appear when backend location coordinates are present.</small></div>}</div>;
}
