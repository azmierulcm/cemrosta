'use client';

import React, { useState } from 'react';
import { MapPin, Lock } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { REGION_TAXONOMY, RARITY_COLORS, getRarityTier } from '@/lib/patches/rules';
import { ILLUSTRATIONS } from '@/lib/patches/illustrations';
import PatchDetailModal from './PatchDetailModal';

interface Destination {
  iata: string;
  name: string;
  country: string;
  region: string;
  visits: number;
  isHome?: boolean;
  isNew?: boolean;
  unlocked: boolean;
}

interface DestinationsGridProps {
  destinations: Destination[];
  collectedCount: number;
  totalCount: number;
}

const Patch = ({ destination, onClick }: { destination: Destination, onClick: () => void }) => {
  const shouldReduceMotion = useReducedMotion();
  const regionData = REGION_TAXONOMY[destination.region as keyof typeof REGION_TAXONOMY] || REGION_TAXONOMY['Southeast Asia'];
  const rarity = getRarityTier(destination.visits);
  const rarityColor = RARITY_COLORS[rarity];
  const Illustration = ILLUSTRATIONS[destination.iata] || MapPin;

  if (!destination.unlocked) {
    return (
      <div className="bg-white border border-border rounded-[2rem] aspect-[1/1.2] flex flex-col overflow-hidden opacity-100 grayscale cursor-not-allowed shadow-sm">
        <div className="h-[60%] bg-surface-2 flex items-center justify-center border-b border-border/50">
          <Lock size={28} className="text-text-subtle" strokeWidth={1.5} />
        </div>
        <div className="p-6 flex-1 flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono mb-1">Locked</p>
          <p className="text-xs font-bold text-text-subtle/40 font-mono uppercase">{destination.iata}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.button 
      onClick={onClick}
      whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.03 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      className="bg-white border border-border rounded-[2rem] aspect-[1/1.2] flex flex-col overflow-hidden group shadow-xl shadow-black/5 transition-all hover:shadow-2xl hover:shadow-black/10 text-left outline-none focus:ring-4 focus:ring-accent/10"
    >
      <div 
        className="h-[60%] flex flex-col items-center justify-center border-b border-white/5 relative"
        style={{ backgroundColor: regionData.bg }}
      >
        {/* Rarity Border */}
        <div className="absolute inset-0 border-[3px] rounded-[2rem] pointer-events-none opacity-20" style={{ borderColor: rarityColor }} />
        
        {destination.isNew && (
           <div className="absolute top-4 left-4 bg-accent text-accent-fg text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-sm z-10">New Stamp</div>
        )}
        {destination.isHome && (
           <div className="absolute top-4 left-4 bg-white text-text text-[9px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-sm z-10">Home Base</div>
        )}
        
        <div className="mb-2 transition-transform group-hover:scale-110 duration-500" style={{ color: regionData.accent }}>
           <Illustration size={32} />
        </div>
        <span className="text-2xl font-black font-mono tracking-tighter" style={{ color: regionData.accent }}>{destination.iata}</span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        <p className="text-[15px] font-bold text-text leading-tight mb-1 truncate tracking-tight">{destination.name}</p>
        <p className="text-[11px] font-bold text-text-muted flex items-center gap-1 truncate uppercase tracking-wide">
          {destination.country} <span className="w-1 h-1 rounded-full bg-border mx-1" /> {destination.visits} visits
        </p>
      </div>
    </motion.button>
  );
};

export const DestinationsGrid = ({ destinations, collectedCount, totalCount }: DestinationsGridProps) => {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-10">
        <div>
          <h3 className="text-3xl font-bold text-text tracking-tighter mb-3">Your Destinations</h3>
          <p className="text-text-muted font-bold text-sm">
            You&apos;ve collected <span className="text-accent">{collectedCount} stamps</span> across the globe.
          </p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono bg-surface-2 border border-border px-4 py-2 rounded-full">
          {totalCount - collectedCount} Cities to unlock
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {destinations.map((dest) => (
          <Patch 
            key={dest.iata} 
            destination={dest} 
            onClick={() => setSelectedDest(dest)}
          />
        ))}
      </div>

      <PatchDetailModal 
        isOpen={!!selectedDest} 
        onClose={() => setSelectedDest(null)} 
        destination={selectedDest} 
      />
    </div>
  );
};
