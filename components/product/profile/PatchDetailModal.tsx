'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Plane, ShieldCheck, Globe } from 'lucide-react';
import { ILLUSTRATIONS } from '@/lib/patches/illustrations';
import { REGION_TAXONOMY, RARITY_COLORS, getRarityTier } from '@/lib/patches/rules';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world-110m.json";

import { Destination } from '@/lib/types';

interface PatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null; 
}

export const PatchDetailModal = ({ isOpen, onClose, destination }: PatchDetailModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!destination) return null;

  const Illustration = ILLUSTRATIONS[destination.iata] || MapPin;
  const regionData = REGION_TAXONOMY[destination.region as keyof typeof REGION_TAXONOMY] || REGION_TAXONOMY['Southeast Asia'];
  const rarity = getRarityTier(destination.visits);
  const rarityColor = RARITY_COLORS[rarity];

  // Placeholder coordinates (in a real app, these would come from an airport DB)
  const coordinates: Record<string, [number, number]> = {
    'KUL': [101.7, 2.7],
    'LHR': [-0.4, 51.5],
    'SYD': [151.2, -33.9],
    'NRT': [140.4, 35.8],
    'SIN': [103.9, 1.3],
  };
  const markerPos = coordinates[destination.iata] || [101.7, 2.7];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-4xl bg-white border border-border rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-3 hover:bg-surface-2 rounded-full transition-colors text-text-muted hover:text-text z-20"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-5 h-full max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-hidden">
              {/* Left: Illustration & Map (2/5) */}
              <div className="md:col-span-2 flex flex-col border-b md:border-b-0 md:border-r border-border">
                <div className={`p-12 flex flex-col items-center justify-center relative`} style={{ backgroundColor: regionData.bg }}>
                   <div 
                     className="w-40 h-40 rounded-[2.5rem] bg-white border-2 flex items-center justify-center mb-6 shadow-xl shadow-black/5"
                     style={{ borderColor: rarityColor }}
                   >
                      <div style={{ color: regionData.accent }}>
                        <Illustration size={64} />
                      </div>
                   </div>
                   <div className="text-center">
                      <div className="text-4xl font-black font-mono tracking-tighter mb-2" style={{ color: regionData.accent }}>{destination.iata}</div>
                      <div className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-border" style={{ color: regionData.text }}>
                         {rarity} Tier
                      </div>
                   </div>
                </div>
                
                {/* Minimal Map */}
                <div className="flex-1 bg-surface-2 p-10 flex flex-col items-center">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-text-subtle mb-6 font-mono">
                      <Globe size={14} className="text-accent" />
                      Global Operations
                   </div>
                   <div className="w-full h-44 bg-white rounded-3xl border border-border overflow-hidden relative shadow-inner">
                      <ComposableMap projectionConfig={{ scale: 120 }}>
                        <Geographies geography={geoUrl}>
                          {({ geographies }) =>
                            geographies.map((geo) => (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#F7F7F7"
                                stroke="#EBEBEB"
                                strokeWidth={0.5}
                              />
                            ))
                          }
                        </Geographies>
                        <Marker coordinates={markerPos}>
                          <circle r={5} fill="var(--accent)" />
                          <circle r={10} fill="var(--accent)" opacity={0.3} className="animate-ping" />
                        </Marker>
                      </ComposableMap>
                   </div>
                </div>
              </div>

              {/* Right: Stats & Info (3/5) */}
              <div className="md:col-span-3 p-12 md:p-16 overflow-y-auto bg-white">
                 <div className="mb-12">
                    <h2 id="modal-title" className="text-5xl font-bold tracking-tighter text-text mb-2">{destination.name}</h2>
                    <p className="text-text-muted font-bold text-lg flex items-center gap-3">
                       {destination.country} <span className="w-1.5 h-1.5 rounded-full bg-border" /> {destination.region}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="bg-surface-2 p-8 rounded-3xl border border-border group hover:border-accent/30 transition-all">
                       <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-3 font-mono">Total Visits</p>
                       <p className="text-3xl font-bold text-text font-mono tracking-tighter">{destination.visits}</p>
                    </div>
                    <div className="bg-surface-2 p-8 rounded-3xl border border-border">
                       <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-3 font-mono">First Mission</p>
                       <p className="text-3xl font-bold text-text font-mono tracking-tighter">12 May 24</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center gap-6 p-6 rounded-3xl hover:bg-surface-2 transition-all border border-transparent hover:border-border group">
                       <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center shrink-0 group-hover:shadow-sm">
                          <Clock size={24} className="text-accent" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] font-mono mb-1">Cumulative Stay</p>
                          <p className="text-lg font-bold text-text tracking-tight">142 Hours on ground</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6 p-6 rounded-3xl hover:bg-surface-2 transition-all border border-transparent hover:border-border group">
                       <div className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center shrink-0 group-hover:shadow-sm">
                          <Plane size={24} className="text-accent" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] font-mono mb-1">Last Flight</p>
                          <p className="text-lg font-bold text-text tracking-tight">MH 123 · 04 Nov 25</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-16 pt-12 border-t border-border">
                    <button className="w-full bg-accent text-accent-fg py-6 rounded-full font-bold text-xl hover:bg-accent-hover transition-all flex items-center justify-center gap-4 shadow-xl shadow-accent/10">
                       <ShieldCheck size={24} strokeWidth={3} />
                       Verified Flight Record
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
