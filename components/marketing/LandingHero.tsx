'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Zap, Heart } from 'lucide-react';
import { HeroAnimation } from './HeroAnimation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { WaitlistSheet } from './WaitlistSheet';

const FORMAT_PILLS = [
  { name: 'MAS AIMS', status: 'live' },
  { name: 'AirAsia', status: 'soon' },
  { name: 'Batik Air', status: 'soon' },
  { name: 'SIA', status: 'soon' },
];

export const LandingHero = () => {
  const shouldReduceMotion = useReducedMotion();
  const { openAuthModal } = useAuth();
  const [waitlistAirline, setWaitlistAirline] = useState<string | null>(null);
  const rostersProcessed = 1242; // Seeded constant + real count logic would go here

  return (
    <section className="pt-40 pb-24 px-4 min-h-[100svh] flex flex-col items-center bg-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/3 blur-[120px] rounded-full -z-10" />

      <div className="max-w-5xl mx-auto text-center flex-1 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <HeroAnimation />
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-text mb-8 mt-12 max-w-5xl mx-auto leading-[0.95]">
            Your roster, <span className="text-accent">reimagined.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-muted mb-16 max-w-2xl mx-auto font-bold leading-tight tracking-tight">
            The ultimate companion for MAS crew. Sync your calendar, track your destinations, and unlock verified marketplace deals.
          </p>

          <div className="flex flex-col items-center gap-8 mb-20">
            <button 
              onClick={openAuthModal}
              className="bg-accent text-white px-12 py-6 rounded-full font-black text-xl shadow-2xl shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4"
            >
              Get Started for Free
              <Zap size={24} fill="currentColor" />
            </button>
            <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.3em] font-mono">
              {"// SYNC IN SECONDS. NO MANUAL INPUT."}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-2xl mb-16"
        >
          {/* Format Pills */}
          <div className="flex flex-wrap justify-center gap-4">
             {FORMAT_PILLS.map((pill) => (
               <button
                 key={pill.name}
                 onClick={() => pill.status === 'soon' && setWaitlistAirline(pill.name)}
                 className={`
                   px-8 py-3 rounded-full text-xs font-black transition-all flex items-center gap-3 border uppercase tracking-widest
                   ${pill.status === 'live' 
                     ? 'bg-accent/5 border-accent/10 text-accent shadow-sm' 
                     : 'bg-surface-2 border-border text-text-muted hover:border-text-subtle hover:text-text shadow-sm'}
                 `}
               >
                 {pill.name}
                 {pill.status === 'live' ? <CheckCircle2 size={14} strokeWidth={3} /> : <span className="opacity-40">· soon</span>}
               </button>
             ))}
          </div>
        </motion.div>
      </div>

      {/* Trust Strip */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-7xl mx-auto mt-auto pt-16 border-t border-border flex flex-wrap justify-center md:justify-between items-center gap-10 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-text-subtle font-mono"
      >
        <div className="flex items-center gap-3">
          <Zap size={16} className="text-accent" />
          <span>MAS AIMS Support</span>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 size={16} className="text-success" />
          <span>{rostersProcessed.toLocaleString()} Crew Syncing</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-accent" />
          <span>Session Privacy</span>
        </div>
        <div className="flex items-center gap-3">
          <Heart size={16} className="text-accent" />
          <span>Built for Crew</span>
        </div>
      </motion.div>

      <WaitlistSheet 
        isOpen={!!waitlistAirline} 
        onClose={() => setWaitlistAirline(null)} 
        airline={waitlistAirline || ''} 
      />
    </section>
  );
};
