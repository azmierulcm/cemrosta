'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  image: string;
  seller: string;
  avatar: string;
  isVerified?: boolean;
  airline?: string;
}

export const MarketplaceCard = ({ listing }: { listing: Listing }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { y: -10 }}
      className="group cursor-pointer"
    >
      <div className="aspect-square rounded-[2.5rem] overflow-hidden mb-6 relative shadow-sm border border-border bg-white transition-all group-hover:shadow-2xl group-hover:shadow-black/10">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className={`w-full h-full object-cover transition-transform duration-700 ${shouldReduceMotion ? '' : 'group-hover:scale-110'}`}
          loading="lazy"
        />
        <div className="absolute top-5 left-5 flex flex-col gap-2">
           <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-text shadow-xl border border-border">
             {listing.condition}
           </div>
           {listing.isVerified && (
             <div className="bg-success text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                <ShieldCheck size={12} strokeWidth={3} />
                Verified
             </div>
           )}
        </div>
      </div>
      <div className="px-1">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h4 className="text-lg font-bold text-text truncate tracking-tight">{listing.title}</h4>
          <span className="font-black text-text text-xl tracking-tighter">RM{listing.price.toLocaleString()}</span>
        </div>
        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-6 font-mono">{listing.category}</p>
        <div className="flex items-center gap-3 border-t border-border/50 pt-5">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-2 border border-border shadow-sm">
            <img src={listing.avatar} alt={listing.seller} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-text truncate max-w-[140px] tracking-tight">{listing.seller}</span>
            {listing.isVerified ? (
              <span className="text-[9px] font-black text-success uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck size={10} strokeWidth={3} />
                {listing.airline || 'Verified Crew'}
              </span>
            ) : (
              <span className="text-[9px] font-black text-text-subtle uppercase tracking-widest flex items-center gap-1">
                <AlertCircle size={10} strokeWidth={3} />
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
