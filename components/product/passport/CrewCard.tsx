import React from 'react';
import { CrewProfile, CrewStats } from '@/lib/types/passport';

interface CrewCardProps {
  profile: CrewProfile;
  stats: CrewStats;
}

export const CrewCard = ({ profile, stats }: CrewCardProps) => {
  return (
    <div className="w-[360px] h-[540px] bg-passport-bg rounded-[2rem] border-[4px] border-passport-gold p-8 flex flex-col relative overflow-hidden shadow-2xl group">
      {/* Background Foil Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37, #D4AF37 1px, transparent 1px, transparent 10px)' }} />
      </div>

      {/* Header with Rank Insignia Placeholder */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-passport-gold/10 border border-passport-gold/20 flex items-center justify-center">
          <span className="text-passport-gold font-black text-xl">4</span> {/* Stripes for Captain */}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-passport-gold tracking-widest uppercase">Verified Crew</p>
          <p className="text-xs font-bold text-passport-text-secondary uppercase">{profile.airline_code}</p>
        </div>
      </div>

      {/* Avatar & Name */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="w-24 h-24 rounded-full border-2 border-passport-gold p-1 mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <div className="w-full h-full rounded-full bg-passport-surface flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-passport-gold">
                {profile.display_name.charAt(0)}
              </span>
            )}
          </div>
        </div>
        <h3 className="text-xl font-black text-passport-text tracking-tight">{profile.display_name}</h3>
        <p className="text-xs font-bold text-passport-gold-soft uppercase tracking-[0.2em] mt-1">{profile.rank}</p>
      </div>

      {/* Career Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-passport-surface/50 p-4 rounded-2xl border border-passport-border">
          <p className="text-[8px] font-bold text-passport-text-tertiary uppercase tracking-widest mb-1">Total Hours</p>
          <p className="text-lg font-black text-passport-text tracking-tighter">
            {Math.floor(stats.total_block_minutes / 60)}
          </p>
        </div>
        <div className="bg-passport-surface/50 p-4 rounded-2xl border border-passport-border">
          <p className="text-[8px] font-bold text-passport-text-tertiary uppercase tracking-widest mb-1">Countries</p>
          <p className="text-lg font-black text-passport-text tracking-tighter">{stats.unique_countries}</p>
        </div>
      </div>

      {/* Fleet Ratings */}
      <div className="relative z-10">
        <p className="text-[8px] font-bold text-passport-text-tertiary uppercase tracking-widest mb-3">Fleet Ratings</p>
        <div className="flex flex-wrap gap-2">
          {profile.aircraft_types.map((type) => (
            <span key={type} className="px-3 py-1 bg-passport-gold text-passport-bg rounded-full text-[10px] font-black uppercase">
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-auto flex justify-between items-end relative z-10">
        <div className="text-[8px] font-bold text-passport-text-tertiary uppercase tracking-[0.3em]">
          Edition 2026
        </div>
        <div className="text-passport-gold font-black text-sm tracking-tighter">
          CEMROSTA
        </div>
      </div>

      {/* Holographic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </div>
  );
};


