'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DutyEvent } from '@/lib/types';
import { MapPin, ExternalLink } from 'lucide-react';

// Dynamically import Leaflet map to avoid SSR "window is not defined" issues
const LeafletMap = dynamic(() => import('./LeafletMap').then(mod => mod.LeafletMap), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-2 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
    </div>
  )
});

const IATA_CITIES: Record<string, string> = {
  'KUL': 'Kuala Lumpur International Airport',
  'LHR': 'London Heathrow Airport',
  'CAN': 'Guangzhou Baiyun International Airport',
  'NRT': 'Narita International Airport',
  'SYD': 'Sydney Airport',
  'IST': 'Istanbul Airport',
  'SIN': 'Singapore Changi Airport',
  'CDG': 'Charles de Gaulle Airport',
  'DXB': 'Dubai International Airport',
};

export const FlightMap = ({ events }: { events: DutyEvent[] }) => {
  const uniquePorts = Array.from(new Set(
    events.flatMap(e => [e.depPort?.toUpperCase(), e.arrPort?.toUpperCase()])
      .filter((p): p is string => !!p && !!IATA_CITIES[p])
  ));

  return (
    <div className="space-y-8 mb-24">
      {/* Interactive World Map */}
      <div className="w-full h-[600px] rounded-[3rem] overflow-hidden border border-border shadow-2xl shadow-black/5 bg-white relative">
        <LeafletMap events={events} />
        
        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-xl z-10 pointer-events-none">
          <p className="text-[10px] font-black text-text flex items-center gap-3 tracking-[0.3em] uppercase font-mono">
              <MapPin size={14} className="text-accent" />
              {"// MISSION TRACKER"}
          </p>
        </div>
      </div>

      {/* Destinations Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {uniquePorts.map((port) => (
          <a 
            key={port}
            href={`https://www.google.com/maps/search/${encodeURIComponent(IATA_CITIES[port])}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xl font-black text-text font-mono tracking-tighter">{port}</span>
              <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-text-subtle group-hover:text-accent group-hover:bg-accent/5 transition-all">
                <ExternalLink size={14} />
              </div>
            </div>
            <p className="text-[10px] text-text-muted font-black truncate uppercase tracking-widest font-mono">
              {IATA_CITIES[port].split(' ')[0]}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};
