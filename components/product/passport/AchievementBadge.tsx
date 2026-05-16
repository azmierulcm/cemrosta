'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { AchievementDefinition, AchievementTier } from '@/lib/achievements/definitions';

interface BadgeProps {
  definition: AchievementDefinition;
  earned?: boolean;
  earnedAt?: string;
}

export const AchievementBadge = ({ definition, earned }: BadgeProps) => {
  const Icon = (Icons as Record<string, React.ElementType>)[definition.icon_key] || Icons.Award;

  const tierStyles: Record<AchievementTier, string> = {
    'common': 'bg-surface-2 border-border text-text-subtle',
    'uncommon': 'border-slate-300 bg-slate-50 text-slate-500 shadow-sm',
    'rare': 'border-blue-400 bg-blue-50/30 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    'epic': 'border-purple-400 bg-purple-50/30 text-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    'legendary': 'border-passport-gold bg-passport-gold/10 text-passport-gold shadow-[0_0_25px_rgba(212,175,55,0.4)]',
    'mythic': 'border-white/20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl',
    'easter-egg': 'bg-gray-900 border-gray-800 text-text-muted'
  };

  const activeStyle = earned ? tierStyles[definition.tier] : 'bg-surface border-border text-gray-200 opacity-40';

  return (
    <motion.div
      whileHover={earned ? { y: -5, scale: 1.05 } : {}}
      className={`
        relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all cursor-default
        ${activeStyle}
      `}
    >
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center mb-4
        ${earned ? '' : 'bg-surface-2'}
      `}>
        <Icon size={24} strokeWidth={earned ? 2.5 : 1.5} />
      </div>

      <div className="text-center">
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${earned ? '' : 'text-gray-300'}`}>
          {definition.tier}
        </p>
        <h4 className={`text-sm font-black leading-tight ${earned ? 'text-text' : 'text-gray-300'}`}>
          {definition.name}
        </h4>
        
        {earned && definition.rarity_pct && (
          <p className="text-[9px] font-bold text-accent mt-2 uppercase tracking-tight">
            Top {definition.rarity_pct}%
          </p>
        )}
      </div>

      {!earned && (
        <div className="absolute top-3 right-3">
          <Icons.Lock size={12} className="text-gray-300" />
        </div>
      )}
      
      {earned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-green-500 text-white p-1 rounded-full shadow-lg"
        >
          <Icons.Check size={10} strokeWidth={4} />
        </motion.div>
      )}
    </motion.div>
  );
};


