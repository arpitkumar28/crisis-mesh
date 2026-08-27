'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapEntity {
  id: string;
  kind: 'device' | 'alert' | 'incident' | 'responder' | 'shelter';
  title: string;
  detail: string;
  severity?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
}

const colors = { device: '#55d6be', alert: '#ff5c5c', incident: '#ffad4a', responder: '#b48cff', shelter: '#62a8ff' };

function coordinates(entity: MapEntity) {
  if (typeof entity.latitude !== 'number' || typeof entity.longitude !== 'number') return null;
  return [entity.latitude, entity.longitude] as L.LatLngExpression;
}

export default function LiveMap({ entities }: { entities: MapEntity[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([20.5937, 78.9629], 5);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    instanceRef.current = map;
    return () => { map.remove(); instanceRef.current = null; };
  }, []);

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

  const positioned = entities.filter((entity) => coordinates(entity)).length;
  return <div className="map-frame"><div ref={mapRef} className="live-map" aria-label="Live disaster map" />{positioned === 0 && <div className="map-empty"><span>No geographic locations available</span><small>Markers appear when backend location coordinates are present.</small></div>}</div>;
}