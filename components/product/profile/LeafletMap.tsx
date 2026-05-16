'use client';

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DutyEvent } from '@/lib/types';

// Fix for Leaflet default icon issues in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const IATA_COORDS: Record<string, [number, number]> = {
  'KUL': [2.7456, 101.7099],
  'LHR': [51.4700, -0.4543],
  'CAN': [23.3924, 113.2988],
  'NRT': [35.7720, 140.3929],
  'SYD': [-33.9461, 151.1772],
  'IST': [41.2753, 28.7519],
  'SIN': [1.3644, 103.9915],
  'CDG': [49.0097, 2.5479],
  'DXB': [25.2532, 55.3657],
};

export const LeafletMap = ({ events }: { events: DutyEvent[] }) => {
  const routes = useMemo(() => {
    const paths: [number, number][][] = [];
    events.forEach((event) => {
      if (event.type === 'FLIGHT' && event.depPort && event.arrPort) {
        const start = IATA_COORDS[event.depPort.toUpperCase()];
        const end = IATA_COORDS[event.arrPort.toUpperCase()];
        if (start && end) {
          paths.push([start, end]);
        }
      }
    });
    return paths;
  }, [events]);

  const markers = useMemo(() => {
    const ports = new Set<string>();
    events.forEach(e => {
        if (e.depPort) ports.add(e.depPort.toUpperCase());
        if (e.arrPort) ports.add(e.arrPort.toUpperCase());
    });
    return Array.from(ports)
      .filter(p => IATA_COORDS[p])
      .map(p => ({ iata: p, coords: IATA_COORDS[p] }));
  }, [events]);

  return (
    <MapContainer 
      center={[2.7456, 101.7099]} 
      zoom={2} 
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {routes.map((path, i) => (
        <Polyline 
          key={i} 
          positions={path} 
          color="#FF385C" 
          weight={2} 
          opacity={0.4} 
          dashArray="5, 10"
        />
      ))}

      {markers.map((m) => (
        <Marker key={m.iata} position={m.coords} icon={icon}>
          <Popup>
            <div className="text-center font-black uppercase tracking-widest font-mono text-xs">{m.iata}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
