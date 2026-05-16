'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

export const PricingCTA = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-48 px-4 bg-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 blur-[120px] rounded-full -z-10" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-2 mb-8 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
            {"// FINAL MISSION DEBRIEF"}
          </div>
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-text mb-12 leading-none">
            Ready for <br /> <span className="text-accent italic font-serif font-light">takeoff.</span>
          </h2>
          <p className="text-xl md:text-2xl text-text-muted font-bold leading-snug tracking-tight">
            Join the Malaysia Airlines crew already using Cemrosta to own their mission data.
          </p>

          <button 
            onClick={scrollToTop}
            className="bg-accent text-accent-fg px-14 py-7 rounded-full text-2xl font-black shadow-2xl shadow-accent/20 hover:scale-[1.05] hover:bg-accent-hover transition-all active:scale-95 flex items-center gap-4 mx-auto"
          >
            <Upload size={28} strokeWidth={3} />
            Upload your roster
          </button>

          <div className="mt-24 space-y-10">
            <p className="text-text-muted font-bold italic text-lg max-w-xl mx-auto leading-snug tracking-tight opacity-60">
              Verified crew get access to a private marketplace for headsets, luggage, and specialized manuals.
            </p>
            <div className="text-[11px] font-black text-text-subtle uppercase tracking-[0.5em] font-mono bg-surface-2 inline-block px-6 py-2 rounded-full border border-border">
              {"// FREE FOREVER FOR INDIVIDUAL CREW"}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
