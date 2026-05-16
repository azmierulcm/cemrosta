import React from 'react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <section className="pt-48 pb-24 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter text-text mb-8"
        >
          Your roster, <span className="text-accent">reimagined.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-text-muted mb-12 max-w-2xl mx-auto leading-tight font-bold tracking-tight"
        >
          Upload your monthly PDF roster and get a beautifully organized, 
          synced timeline. Designed for crew, by crew.
        </motion.p>
      </div>
    </section>
  );
};
