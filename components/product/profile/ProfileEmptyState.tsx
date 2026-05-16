'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, Info } from 'lucide-react';
import { FileUploader } from '@/components/product/FileUploader';

export const ProfileEmptyState = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white border border-border rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-black/5 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
        
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-8 shadow-sm">
            <FileUp size={32} strokeWidth={2.5} className="text-accent" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-text mb-6">
            Reveal your passport.
          </h2>
          <p className="text-text-muted text-xl font-bold leading-snug max-w-md mx-auto tracking-tight">
            Drop your roster PDF to unlock every city you&apos;ve earned and sync your calendar instantly.
          </p>
        </div>

        <FileUploader />

        <div className="mt-12 flex items-center justify-center gap-4 text-text-subtle text-[10px] font-black uppercase tracking-[0.3em] font-mono">
           <Info size={16} className="text-accent" />
           MAS AIMS Rosters · PDF Only
        </div>
      </motion.div>
    </div>
  );
};
