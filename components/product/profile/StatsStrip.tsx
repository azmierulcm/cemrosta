'use client';

import React from 'react';
import { formatBlockHours, formatKilometers } from '@/lib/utils/format';
import { Plane, Clock, Globe, MapPinned } from 'lucide-react';

interface StatsStripProps {
  stats: {
    sectors: number;
    blockMinutes: number;
    kilometers: number;
    citiesCollected: number;
    totalAvailableCities: number;
  };
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}

const StatCard = ({ label, value, sub, icon: Icon }: StatCardProps) => (
  <div className="bg-white p-8 rounded-[2rem] border border-border flex flex-col gap-6 group shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all">
    <div className="flex justify-between items-start">
      <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border flex items-center justify-center group-hover:border-accent/30 transition-colors">
        <Icon size={22} className="text-text-muted group-hover:text-accent transition-colors" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle font-mono">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-bold tracking-tighter font-mono text-text">{value}</span>
      {sub && <span className="text-[10px] font-black uppercase tracking-widest text-accent font-mono">{sub}</span>}
    </div>
  </div>
);

export const StatsStrip = ({ stats }: StatsStripProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      <StatCard 
        label="Sectors" 
        value={stats.sectors.toLocaleString()} 
        icon={Plane} 
      />
      <StatCard 
        label="Block Hours" 
        value={formatBlockHours(stats.blockMinutes)} 
        sub="HRS" 
        icon={Clock} 
      />
      <StatCard 
        label="Distance" 
        value={formatKilometers(stats.kilometers)} 
        sub="KM" 
        icon={Globe} 
      />
      <StatCard 
        label="Cities" 
        value={`${stats.citiesCollected}/${stats.totalAvailableCities}`} 
        icon={MapPinned} 
      />
    </div>
  );
};
