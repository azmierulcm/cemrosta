'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { CrewStats, CrewProfile } from '@/lib/types/passport';

interface StoryDeckProps {
  stats: CrewStats;
  crewProfile: CrewProfile;
}

export const StoryDeck = ({ stats, crewProfile }: StoryDeckProps) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDES = useMemo(() => {
    const year = new Date().getFullYear();
    const earthCircumference = 40075;
    const timesAroundEarth = (stats.total_km / earthCircumference).toFixed(1);

    return [
      { id: 1, type: 'text', title: `Your ${year} in the air.`, sub: `Welcome back, ${crewProfile.display_name}.` },
      { id: 2, type: 'stat', label: "Total Distance", value: stats.total_km.toLocaleString(), unit: "KM" },
      { id: 3, type: 'quote', title: `That's ${timesAroundEarth} times around the earth.`, sub: "A massive year of operations." },
      { id: 4, type: 'stat', label: "Mission Hubs", value: stats.unique_destinations, unit: "Cities" },
      { id: 5, type: 'highlight', title: "Most Flown Route", sub: stats.top_route_pair || "Connecting the World", meta: `${stats.top_route_count} Times` },
      { id: 6, type: 'stat', label: "Sunrises Witnessed", value: stats.sunrises_witnessed, unit: "from FL370" },
      { id: 7, type: 'stat', label: "Time in the Air", value: Math.floor(stats.total_block_minutes / 60), unit: "Block Hours" },
      { id: 8, type: 'stat', label: "Mission Colleagues", value: stats.unique_crew_flown_with, unit: "Crew Members" },
      { id: 10, type: 'achievement', title: "Rarest Moment", sub: stats.equator_crossings > 0 ? "Equator Bound" : "The Explorer", meta: stats.equator_crossings > 0 ? "Crossed the center line" : "Mapping new horizons" },
      { id: 11, type: 'text', title: "Ready for next year?", sub: `See you in ${year + 1}, ${crewProfile.rank} ${crewProfile.display_name.split(' ')[0]}.` },
    ];
  }, [stats, crewProfile]);

  const next = useCallback(() => {
    if (current < SLIDES.length - 1) {
      setCurrent(prev => prev + 1);
      setProgress(0);
    }
  }, [current, SLIDES.length]);

  const prev = useCallback(() => {
    if (current > 0) {
      setCurrent(prev => prev - 1);
      setProgress(0);
    }
  }, [current]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + 1;
      });
    }, 35); // 3.5s per slide

    return () => clearInterval(interval);
  }, [isPaused, next]);

  const slide = SLIDES[current];

  return (
    <div className="fixed inset-0 z-[500] bg-passport-bg flex flex-col items-center justify-center p-4">
      {/* Top Bars */}
      <div className="absolute top-6 left-0 right-0 px-6 flex gap-1 z-50">
        {SLIDES.map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-bg/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-passport-gold"
              initial={{ width: 0 }}
              animate={{ width: i < current ? '100%' : i === current ? `${progress}%` : '0%' }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Header Actions */}
      <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-passport-gold text-passport-bg flex items-center justify-center font-black text-xs">
              MA
           </div>
           <div>
              <p className="text-xs font-black text-white leading-none">CEMROSTA</p>
              <p className="text-[10px] font-bold text-passport-gold-soft uppercase tracking-widest mt-0.5">Passport &apos;26</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setIsPaused(!isPaused)} className="p-2 text-white/50 hover:text-white transition-colors">
              {isPaused ? <Play size={20} /> : <Pause size={20} />}
           </button>
           <Link href="/passport" className="p-2 text-white/50 hover:text-white transition-colors">
              <X size={24} />
           </Link>
        </div>
      </div>

      {/* Slide Content */}
      <div className="relative w-full max-w-lg aspect-[9/16] flex flex-col items-center justify-center text-center px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            className="flex flex-col items-center"
          >
            {slide.type === 'text' && (
              <>
                <h2 className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter">{slide.title}</h2>
                <p className="text-xl text-passport-gold-soft font-medium italic">{slide.sub}</p>
              </>
            )}

            {slide.type === 'stat' && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-passport-secondary mb-8">{slide.label}</p>
                <h2 className="text-8xl font-serif text-white mb-4 tracking-tighter">{slide.value}</h2>
                <p className="text-2xl font-black text-passport-gold uppercase tracking-widest italic">{slide.unit}</p>
              </>
            )}

            {slide.type === 'quote' && (
              <>
                <h2 className="text-4xl font-serif italic text-white leading-relaxed mb-8">&ldquo;{slide.title}&rdquo;</h2>
                <p className="text-lg text-passport-secondary font-medium">{slide.sub}</p>
              </>
            )}

            {slide.type === 'highlight' && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-passport-secondary mb-12">{slide.title}</p>
                <div className="w-24 h-24 rounded-3xl bg-passport-gold/10 border border-passport-gold/20 flex items-center justify-center mb-10">
                    <Globe className="text-passport-gold w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2">{slide.sub}</h2>
                <p className="text-xl font-bold text-passport-gold-soft">{slide.meta}</p>
              </>
            )}

            {slide.type === 'achievement' && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-passport-secondary mb-12">Achievement Unlocked</p>
                <div className="w-32 h-32 rounded-full bg-passport-gold/10 border border-passport-gold/20 flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                    <Award className="text-passport-gold w-16 h-16" />
                </div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">{slide.sub}</h2>
                <p className="text-sm font-bold text-passport-gold-soft uppercase tracking-[0.2em]">{slide.meta}</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Areas (Invisible tap zones) */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 h-full" onClick={prev} />
        <div className="w-2/3 h-full" onClick={next} />
      </div>

      {/* Bottom Footer */}
      <div className="absolute bottom-12 flex flex-col items-center gap-6 z-50">
         <button className="bg-bg/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full flex items-center gap-2 text-sm font-bold hover:bg-bg/20 transition-all">
            <Download size={16} />
            Save slide
         </button>
         <p className="text-[10px] font-bold text-passport-secondary uppercase tracking-[0.4em]">Cemrosta.com</p>
      </div>
    </div>
  );
};

// Simplified icon helper for the component
const Globe = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const Award = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M12 15l-2 5 2-1 2 1-2-5z" />
    <path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
    <path d="M8.21 13.89L7 23l5-3 5 9-1.21-9.11" />
  </svg>
);


