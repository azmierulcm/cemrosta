'use client';

import React from 'react';
import { Share2, MapPin, Settings } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  role: string;
  homeBase: string;
  aircraftType: string;
  onEdit?: () => void;
}

export const ProfileHeader = ({ name, role, homeBase, aircraftType, onEdit }: ProfileHeaderProps) => {
  // Initials for avatar fallback
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white border border-border rounded-[2.5rem] p-10 md:p-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 shadow-2xl shadow-black/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/3 blur-[100px] -mr-32 -mt-32 rounded-full" />
      
      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] bg-surface-2 border border-border flex items-center justify-center text-3xl md:text-5xl font-black text-accent shadow-sm">
          {initials}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-text mb-3">
            {name}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-text-muted font-bold text-sm">
            <span className="bg-accent/5 text-accent border border-accent/10 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{role}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-accent" />
              <span>{homeBase}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
            <span className="font-mono">{aircraftType}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto relative z-10">
        <button 
          onClick={onEdit}
          className="bg-white border border-border text-text px-8 py-5 rounded-full font-bold text-lg hover:bg-surface-2 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm"
        >
          <Settings size={20} />
          Edit
        </button>
        <button className="bg-accent text-accent-fg px-10 py-5 rounded-full font-bold text-lg hover:bg-accent-hover transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-accent/10">
          <Share2 size={20} strokeWidth={2.5} />
          Share Passport
        </button>
      </div>
    </div>
  );
};
