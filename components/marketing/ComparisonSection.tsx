'use client';

import React, { useState } from 'react';
import { Clock, Download, Share2, ChevronDown, Check } from 'lucide-react';

const COMPARISONS = [
  {
    icon: Clock,
    old: "Manual UTC math at 3 AM",
    new: "One-click local time sync",
  },
  {
    icon: Download,
    old: "Dead PDFs in your downloads folder",
    new: "Living passport of every city flown",
  },
  {
    icon: Share2,
    old: "Blurry screenshot to your spouse",
    new: "Polished recap card, ready for WhatsApp",
  },
];

interface ComparisonItem {
  icon: React.ElementType;
  old: string;
  new: string;
}

const ComparisonRow = ({ item }: { item: ComparisonItem }) => {
  const [isOldVisible, setIsOldVisible] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_2px_1fr] items-center gap-6 md:gap-12 py-12 border-b border-border last:border-0 group">
      {/* Old Way (Left/Top) */}
      <div className="flex flex-col md:text-right order-2 md:order-1">
        <div className="md:hidden mb-6">
           <button 
             onClick={() => setIsOldVisible(!isOldVisible)}
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle bg-surface-2 px-5 py-2.5 rounded-full border border-border shadow-sm"
           >
             The Old Way <ChevronDown size={14} className={`transition-transform duration-300 ${isOldVisible ? 'rotate-180' : ''}`} />
           </button>
        </div>
        <div className={`${!isOldVisible ? 'hidden md:block' : 'block'} transition-all`}>
           <p className="text-xl md:text-2xl text-text-muted font-bold italic opacity-40 tracking-tight leading-snug">
             {item.old}
           </p>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block h-16 w-full bg-border/40 order-2" />

      {/* Cemrosta Way (Right/Bottom) */}
      <div className="flex items-center gap-8 order-1 md:order-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 duration-500">
          <item.icon size={26} className="text-accent" />
        </div>
        <div className="flex-1">
           <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent font-mono">CEMROSTA WAY</span>
              <Check size={14} className="text-accent" strokeWidth={4} />
           </div>
           <p className="text-xl md:text-2xl text-text font-black leading-none tracking-tighter">
             {item.new}
           </p>
        </div>
      </div>
    </div>
  );
};

export const ComparisonSection = () => {
  return (
    <section className="py-40 px-4 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
            {"// EFFICIENCY BENCHMARK"}
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-text mb-8 leading-none">
            Stop fighting <br /> your roster PDF.
          </h2>
          <p className="text-xl md:text-2xl text-text-muted font-bold max-w-xl mx-auto leading-snug tracking-tight">
            We&apos;ve automated the manual tasks so you can focus on what matters—your next mission.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 p-10 md:p-20 border border-border relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-accent/10" />
          {COMPARISONS.map((item, i) => (
            <ComparisonRow key={i} item={item} />
          ))}
        </div>
        
        <div className="mt-20 text-center">
           <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.5em] font-mono">
             {"// UPGRADE YOUR WORKFLOW"}
           </p>
        </div>
      </div>
    </section>
  );
};
