import React from 'react';
import { motion } from 'framer-motion';
import { Destination } from '@/lib/types';

// Raw SVG Line-art icons
const Icons = {
  mountain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M2 20L12 4L22 20H2Z" />
      <path d="M8 10.4L10.5 13L13 10L16 13.5" />
    </svg>
  ),
  city: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M2 22H22" />
      <path d="M4 22V10L8 6V22" />
      <path d="M12 22V4L16 8V22" />
      <path d="M20 22V12L17 12" />
    </svg>
  ),
  beach: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M12 2C12 2 15 5 15 8C15 11 12 14 12 14C12 14 9 11 9 8C9 5 12 2 12 2Z" />
      <path d="M2 20C5 17 8 23 12 20C16 17 19 23 22 20" />
    </svg>
  ),
  tower: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M6 22L12 2L18 22" />
      <path d="M9 12H15" />
      <path d="M12 2V22" />
    </svg>
  )
};

export const DestinationPatch = ({ destination }: { destination: Destination }) => {
  const { city, country, count, colorTheme, shape } = destination;
  
  // Pick icon based on city/IATA
  let icon = Icons.city;
  if (city === 'London') icon = Icons.tower;
  if (city === 'Tokyo') icon = Icons.mountain;
  if (city === 'Guangzhou') icon = Icons.city;

  const shapeClasses = {
    oval: 'rounded-full px-8 py-10 aspect-[3/4]',
    hexagon: 'rounded-[2.5rem] p-10 aspect-square rotate-12 group-hover:rotate-0 transition-transform duration-500',
    rectangle: 'rounded-[2rem] p-10 aspect-square'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="group flex flex-col items-center justify-center shrink-0 w-48"
    >
      <div className={`
        ${shapeClasses[shape]} 
        border border-border bg-white
        flex flex-col items-center justify-center gap-4
        shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500
      `}>
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-1
          ${shape === 'hexagon' ? '-rotate-12 group-hover:rotate-0 transition-transform duration-500' : ''}
          ${colorTheme.replace('border-', 'bg-').replace('-600', '-50')} ${colorTheme.replace('border-', 'text-')}
        `}>
          {icon}
        </div>
        <div className="text-center">
          <p className="text-[15px] font-black text-text truncate max-w-[140px] tracking-tight">{city}</p>
          <p className="text-[10px] font-black text-text-muted/60 uppercase tracking-[0.2em] font-mono">{country}</p>
        </div>
      </div>
      <div className="mt-5 text-center">
        <span className="bg-white text-text-muted text-[10px] font-black px-4 py-1.5 rounded-full border border-border shadow-sm uppercase tracking-widest font-mono">
          {count} {count === 1 ? 'Trip' : 'Trips'}
        </span>
      </div>
    </motion.div>
  );
};
