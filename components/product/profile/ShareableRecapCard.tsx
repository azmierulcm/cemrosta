'use client';

import React from 'react';
import { RosterData } from '@/lib/types';
import { Plane } from 'lucide-react';

export const ShareableRecapCard = ({ roster }: { roster: RosterData }) => {
  if (!roster || !roster.stats) return null;

  const topDestinations = roster.destinations?.slice(0, 3) || [];

  return (
    <div 
      id="shareable-recap"
      className="w-[360px] h-[640px] bg-black p-12 flex flex-col relative overflow-hidden"
      style={{ boxShadow: '0 0 60px rgba(0,0,0,0.3)' }}
    >
      {/* Aviation Theme Background */}
      <div className="absolute top-0 right-0 p-10 text-white/5 -rotate-12 pointer-events-none">
        <Plane size={240} strokeWidth={0.5} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/20 pb-8 mb-12">
        <p className="text-[10px] font-black tracking-[0.4em] text-accent uppercase mb-4 font-mono">
          {"// OFFICIAL MISSION RECAP"}
        </p>
        <h2 className="text-4xl font-black text-white leading-[0.9] tracking-tighter">
          {roster.month.toUpperCase()} <br />
          <span className="text-white/40 italic font-serif font-light">{roster.year}</span>
        </h2>
      </div>

      {/* Simplified Route Line Visual */}
      <div className="mb-14">
        <svg viewBox="0 0 200 60" className="w-full h-12 text-white/20">
          <path d="M0 30 Q 50 0, 100 30 T 200 30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="0" cy="30" r="4" fill="var(--color-accent)" />
          <circle cx="200" cy="30" r="4" fill="var(--color-accent)" />
        </svg>
      </div>

      {/* Stats Section */}
      <div className="space-y-10 flex-1 relative z-10">
        <div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 font-mono">Total Distance</p>
          <p className="text-5xl font-black text-white tracking-tighter font-mono">
            {roster.stats.totalMiles.toLocaleString()} <span className="text-sm font-black text-accent uppercase tracking-widest ml-1">KM</span>
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-10">
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 font-mono">Sectors</p>
            <p className="text-4xl font-black text-white tracking-tighter font-mono">{roster.stats.totalSectors}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2 font-mono">In The Air</p>
            <p className="text-4xl font-black text-white tracking-tighter font-mono">{roster.stats.totalBlockTime.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section with Patches & QR */}
      <div className="mt-auto relative z-10">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6 font-mono">New Operations</p>
        <div className="flex gap-4 mb-12">
          {topDestinations.map((dest) => (
            <div key={dest.iata} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xs font-black font-mono shadow-xl ${dest.colorTheme.replace('border-', 'border-').replace('-600', '-500')} text-white bg-white/5`}>
              {dest.iata}
            </div>
          ))}
          {topDestinations.length === 0 && (
             <div className="text-white/20 text-xs font-bold italic">Standard Operations Only</div>
          )}
        </div>

        <div className="flex items-end justify-between border-t border-white/20 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-xl">
              {/* QR Placeholder */}
              <div className="w-full h-full bg-white grid grid-cols-3 gap-0.5">
                {[...Array(9)].map((_, i) => <div key={i} className="bg-black rounded-[1px]" />)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-white tracking-widest font-mono uppercase">CEMROSTA.COM</p>
              <p className="text-[9px] font-bold text-white/40 tracking-tight">@crew.member</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[11px] font-black text-accent uppercase tracking-widest font-mono mb-1">CERTIFIED</p>
             <p className="text-[9px] font-black text-white/20 tracking-[0.2em] font-mono">VER 26.05</p>
          </div>
        </div>
      </div>
    </div>
  );
};
