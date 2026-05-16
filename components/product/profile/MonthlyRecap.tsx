'use client';

import React, { useState } from 'react';
import { formatBlockHours } from '@/lib/utils/format';
import { Sparkles, Calendar } from 'lucide-react';
import { RecapCardModal } from './RecapCardModal';
import { useAuth } from '@/lib/contexts/AuthContext';

interface MonthlyRecapProps {
  recap: {
    month: string;
    year: string;
    sectors: number;
    blockMinutes: number;
    newCity: string | null;
  };
}

export const MonthlyRecap = ({ recap }: MonthlyRecapProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <div className="bg-white border border-border rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group shadow-2xl shadow-black/5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-accent opacity-20" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle mb-6 font-mono">
              <Calendar size={14} className="text-accent" />
              Monthly Mission Recap
            </div>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-text">
              {recap.month} <span className="text-text-subtle">{recap.year}</span>
            </h2>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-accent text-accent-fg px-10 py-5 rounded-full font-bold text-lg hover:bg-accent-hover transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-accent/10"
          >
            Generate Recap Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 pt-16 border-t border-border/50">
          <div>
            <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-3 font-mono">Sectors Flown</p>
            <p className="text-4xl font-bold text-text font-mono tracking-tighter">{recap.sectors}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-3 font-mono">Total Air Time</p>
            <p className="text-4xl font-bold text-text font-mono tracking-tighter">
              {formatBlockHours(recap.blockMinutes)} <span className="text-xs uppercase font-black text-accent">hrs</span>
            </p>
          </div>
          {recap.newCity && (
            <div>
              <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-3 font-mono">New Frontier</p>
              <div className="flex items-center gap-4">
                <p className="text-4xl font-bold text-text font-mono tracking-tighter">{recap.newCity}</p>
                <div className="bg-accent/5 border border-accent/10 text-accent text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter flex items-center gap-1.5">
                  <Sparkles size={10} fill="currentColor" />
                  New Unlock
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <RecapCardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={user?.id || 'demo-user'} 
        month={recap.month}
        year={recap.year}
      />
    </>
  );
};
