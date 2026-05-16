'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface ComparisonCardProps {
  type: 'old' | 'new';
  content: string;
}

export const ComparisonCard = ({ type, content }: ComparisonCardProps) => {
  const isOld = type === 'old';
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`p-10 rounded-[2.5rem] border h-full transition-all ${
        isOld 
          ? 'bg-surface-2 border-border text-text-muted opacity-60' 
          : 'bg-white border-accent/20 shadow-2xl shadow-black/5 text-text'
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${
        isOld ? 'bg-white text-text-subtle' : 'bg-accent text-white shadow-accent/20'
      }`}>
        {isOld ? <X size={24} /> : <Check size={24} strokeWidth={3} />}
      </div>
      <h4 className={`text-[10px] font-black mb-6 uppercase tracking-[0.3em] font-mono ${isOld ? 'text-text-subtle' : 'text-accent'}`}>
        {isOld ? '// THE OLD WAY' : '// THE CEMROSTA WAY'}
      </h4>
      <p className={`text-2xl font-bold leading-[1.1] tracking-tighter ${isOld ? 'text-text-subtle italic' : 'text-text'}`}>
        {content}
      </p>
    </motion.div>
  );
};
