'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FileUp, CalendarSync, MapPinned } from 'lucide-react';

export const HeroAnimation = () => {
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 3);
    }, 2500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className="flex items-center justify-center gap-12 py-12">
        <FileUp size={48} className="text-text-subtle" />
        <div className="w-12 h-0.5 bg-border" />
        <MapPinned size={48} className="text-accent" />
      </div>
    );
  }

  const stages = [
    {
      icon: FileUp,
      text: "Parsing PDF...",
      color: "text-text-subtle",
      glow: "bg-text-subtle/10",
    },
    {
      icon: CalendarSync,
      text: "Syncing Calendar...",
      color: "text-accent",
      glow: "bg-accent/20",
    },
    {
      icon: MapPinned,
      text: "Stamping Passport...",
      color: "text-accent",
      glow: "bg-accent/30",
    },
  ];

  const CurrentIcon = stages[stage].icon;

  return (
    <div className="h-40 flex flex-col items-center justify-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -10 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="flex flex-col items-center"
        >
          <div className={`w-20 h-20 rounded-3xl ${stages[stage].glow} flex items-center justify-center mb-4 relative`}>
             <CurrentIcon size={40} className={stages[stage].color} />
             {stage === 1 && (
               <motion.div 
                 initial={{ top: "10%" }}
                 animate={{ top: "90%" }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute left-4 right-4 h-0.5 bg-accent shadow-[0_0_10px_rgba(0,212,255,1)] z-10"
               />
             )}
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-text-subtle font-mono">
            {stages[stage].text}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Connection lines */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 flex justify-between -z-10 opacity-20">
         <div className={`h-px w-24 border-t-2 border-dashed transition-colors duration-500 ${stage >= 1 ? 'border-accent' : 'border-border'}`} />
         <div className={`h-px w-24 border-t-2 border-dashed transition-colors duration-500 ${stage >= 2 ? 'border-accent' : 'border-border'}`} />
      </div>
    </div>
  );
};
