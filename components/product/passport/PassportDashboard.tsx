'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Globe, Award, Calendar, ChevronRight, Play } from 'lucide-react';
import { CrewStats, Flight } from '@/lib/types/passport';
import { ShareModal } from './ShareModal';
import { AchievementBadge } from './AchievementBadge';
import { ACHIEVEMENT_CATALOG } from '@/lib/achievements/definitions';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { CrewCard } from './CrewCard';
import { CrewProfile } from '@/lib/types/passport';
import { supabase } from '@/lib/utils/supabase';
import { toPng } from 'html-to-image';

interface DashboardProps {
  stats: CrewStats;
  earnedAchievements?: string[];
  recentFlights?: Flight[];
  crewProfile?: CrewProfile;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}

const StatCard = ({ label, value, sub, icon: Icon }: StatCardProps) => (
  <div className="bg-white p-8 rounded-[2rem] border border-border hover:shadow-2xl hover:shadow-black/5 transition-all group shadow-sm">
    <div className="flex justify-between items-start mb-10">
      <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center border border-border group-hover:border-accent/20 transition-all duration-500 shadow-sm">
        <Icon size={24} className="text-text-muted group-hover:text-accent transition-colors" />
      </div>
      <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono">{label}</p>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black text-text tracking-tighter font-mono">{value}</span>
      {sub && <span className="text-[10px] font-black text-accent uppercase tracking-widest font-mono">{sub}</span>}
    </div>
  </div>
);

export const PassportDashboard = ({ stats, earnedAchievements = [], recentFlights = [], crewProfile: initialCrewProfile }: DashboardProps) => {
  const { user, profile } = useAuth();
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [crewProfile, setCrewProfile] = React.useState<CrewProfile | null>(initialCrewProfile || null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const earnedSet = new Set(earnedAchievements);
  const hasInitializedProfile = React.useRef(false);

  React.useEffect(() => {
    if (initialCrewProfile && !hasInitializedProfile.current) {
      setCrewProfile(initialCrewProfile);
      hasInitializedProfile.current = true;
    }
  }, [initialCrewProfile]);

  // Also sync with AuthContext profile for immediate updates
  React.useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCrewProfile(prev => {
        // Only update if data actually changed to avoid cascading renders
        if (prev?.display_name === profile.full_name && prev?.airline_code === profile.airline?.substring(0, 2).toUpperCase()) {
          return prev;
        }
        return {
          ...prev,
          ...profile,
          display_name: profile.full_name || prev?.display_name || 'Crew Member',
          airline_code: profile.airline?.substring(0, 2).toUpperCase() || prev?.airline_code || 'MH',
        } as CrewProfile;
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (user) {
      supabase
        .from('crew_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setCrewProfile(data as CrewProfile);
        });
    }
  }, [user]);

  const handleDownloadCard = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = `cemrosta-crew-card-${crewProfile?.handle || 'passport'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  return (
    <div className="bg-surface-2 min-h-screen text-text p-4 md:p-10 selection:bg-accent/30 selection:text-accent-fg">
      <div className="max-w-7xl mx-auto pt-24 md:pt-40 pb-20">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.5em] text-accent font-mono">
               {"// OFFICIAL DIGITAL PASSPORT"}
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] text-text mb-6">
              Mission <br />
              <span className="text-text-subtle italic font-serif font-light opacity-40">Summary.</span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <Link 
              href="/passport/story/year-in-air"
              className="bg-white border border-border text-text px-10 py-5 rounded-full font-black text-lg flex items-center justify-center gap-3 hover:bg-surface-2 transition-all shadow-sm active:scale-95"
            >
              Watch Story
              <Play size={20} fill="currentColor" />
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareModalOpen(true)}
              className="bg-accent text-accent-fg px-10 py-5 rounded-full font-black text-lg shadow-2xl shadow-accent/10 hover:bg-accent-hover transition-all flex items-center justify-center gap-3"
            >
              Share Passport
              <ChevronRight size={20} strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        <ShareModal 
          isOpen={isShareModalOpen} 
          onClose={() => setIsShareModalOpen(false)} 
          crewId={user?.id || 'demo'} 
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          <StatCard label="Distance" value={stats.total_km.toLocaleString()} sub="KM" icon={Globe} />
          <StatCard label="Sectors" value={stats.total_sectors} sub="Flights" icon={Plane} />
          <StatCard label="In Air" value={Math.floor(stats.total_block_minutes / 60)} sub="Hours" icon={Award} />
          <StatCard label="Stamps" value={stats.unique_destinations} sub="Cities" icon={Calendar} />
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Left: Achievement Collection */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-16 border-b border-border pb-10">
              <h3 className="text-[10px] font-black text-text-subtle uppercase tracking-[0.5em] font-mono">
                {"// ACHIEVEMENT COLLECTION"}
              </h3>
              <div className="text-[10px] font-black text-accent uppercase tracking-widest font-mono bg-white border border-border px-4 py-1.5 rounded-full shadow-sm">
                {earnedSet.size} / {ACHIEVEMENT_CATALOG.length} UNLOCKED
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
               {ACHIEVEMENT_CATALOG.map((def) => (
                 <AchievementBadge 
                   key={def.key} 
                   definition={def} 
                   earned={earnedSet.has(def.key)} 
                 />
               ))}
            </div>

            {/* Crew Trading Card Feature */}
            <div className="bg-white rounded-[3.5rem] p-12 md:p-16 border border-border flex flex-col md:flex-row items-center gap-16 mt-32 shadow-2xl shadow-black/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-accent/3 blur-[80px] -mr-32 -mt-32 rounded-full" />
               <div className="scale-90 md:scale-110 origin-center shrink-0 relative z-10" ref={cardRef}>
                  <CrewCard profile={crewProfile || {} as CrewProfile} stats={stats} />
               </div>
               <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-4xl font-black mb-6 tracking-tighter text-text uppercase italic">Your Digital Asset.</h3>
                  <p className="text-text-muted text-xl font-bold leading-snug tracking-tight mb-12">
                     A persistent, shareable identity card that carries your career stats. 
                     Exchange with colleagues to build your global aviation network.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                     <button 
                       onClick={() => setIsShareModalOpen(true)}
                       className="bg-accent text-accent-fg px-10 py-5 rounded-full font-black text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-accent/20"
                     >
                        Exchange Card
                     </button>
                     <button 
                       onClick={handleDownloadCard}
                       className="bg-surface-2 text-text border border-border px-10 py-5 rounded-full font-black text-sm flex items-center gap-3 hover:bg-border transition-all"
                     >
                        Download PNG
                     </button>
                  </div>
               </div>
            </div>
          </div>

          {/* Right: Sidebar Content */}
          <div className="lg:col-span-4 space-y-32">
            {/* Recent Missions */}
            <div>
              <h3 className="text-[10px] font-black text-text-subtle uppercase tracking-[0.5em] mb-12 border-b border-border pb-8 font-mono">
                {"// RECENT MISSIONS"}
              </h3>
              <div className="space-y-4">
                {recentFlights.length > 0 ? (
                  recentFlights.map((flight) => (
                    <div key={flight.id} className="flex items-center justify-between p-8 bg-white rounded-[2rem] border border-border hover:border-accent/40 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:shadow-black/5">
                      <div className="flex items-center gap-8">
                        <div className="font-mono text-[10px] font-black text-text-subtle bg-surface-2 px-3 py-1 rounded-full">{flight.flight_number}</div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-base tracking-tighter text-text uppercase font-mono">{flight.origin_iata}</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          <span className="font-black text-base tracking-tighter text-text uppercase font-mono">{flight.destination_iata}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 bg-white rounded-[2rem] border border-border border-dashed text-center">
                    <p className="text-text-muted text-sm font-bold tracking-tight italic">No missions found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rare Milestone Highlight */}
            <div>
               <h3 className="text-[10px] font-black text-text-subtle uppercase tracking-[0.5em] mb-12 border-b border-border pb-8 font-mono">
                {"// ELITE MILESTONE"}
              </h3>
              {(() => {
                const earnedCatalog = ACHIEVEMENT_CATALOG.filter(a => earnedSet.has(a.key));
                const rarest = earnedCatalog.sort((a, b) => {
                  const tiers = { 'mythic': 0, 'legendary': 1, 'epic': 2, 'rare': 3, 'uncommon': 4, 'common': 5 };
                  return (tiers[a.tier as keyof typeof tiers] || 10) - (tiers[b.tier as keyof typeof tiers] || 10);
                })[0];

                const highlight = rarest || {
                  name: 'Equator Bound',
                  tier: 'rare',
                  description: 'Earned for your first crossing of the earth\'s center line. A true navigator\'s landmark.',
                };

                return (
                  <div className="bg-white p-10 rounded-[3rem] border border-border relative overflow-hidden group shadow-2xl shadow-black/5 hover:border-accent/10 transition-all">
                      <div className="absolute top-0 left-0 w-full h-2 bg-accent/20" />
                      <Award className="absolute -top-10 -right-10 w-48 h-48 text-accent/3 group-hover:scale-110 transition-transform duration-700" />
                      <div className="relative z-10">
                         <div className="w-16 h-16 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center mb-10 shadow-sm">
                            <Award className="text-accent" size={32} />
                         </div>
                         <h4 className="text-3xl font-black mb-4 tracking-tighter text-text uppercase italic">{highlight.name}</h4>
                         <p className="text-text-muted text-lg font-bold leading-snug tracking-tight mb-12">
                            {highlight.description}
                         </p>
                         <div className="bg-surface-2 px-6 py-3 rounded-full border border-border inline-block text-[10px] font-black text-accent uppercase tracking-[0.3em] font-mono shadow-sm">
                            {highlight.tier.toUpperCase()} BADGE
                         </div>
                      </div>
                  </div>
                );
              })()}
            </div>

            {/* Final Flight / Retirement CTA */}
            <div>
               <h3 className="text-[10px] font-black text-text-subtle uppercase tracking-[0.5em] mb-12 border-b border-border pb-8 font-mono">
                {"// CAREER HORIZON"}
              </h3>
              <div className="bg-white p-10 rounded-[3rem] border border-border shadow-2xl shadow-black/5 relative overflow-hidden group hover:border-accent/10 transition-all">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-black" />
                  <h4 className="text-2xl font-black text-text mb-6 italic tracking-tight underline underline-offset-8 decoration-accent/20">The Final Sector.</h4>
                  <p className="text-text-muted text-sm font-bold leading-snug tracking-tight mb-12">
                     Unlock the ceremonial black-and-gold card to commemorate your retirement mission.
                  </p>
                  <button className="text-accent font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 group-hover:gap-6 transition-all font-mono">
                     REQUEST CERTIFICATE <ChevronRight size={18} strokeWidth={3} />
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
