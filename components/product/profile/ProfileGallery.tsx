import React from 'react';
import { Grid, Share, Settings } from 'lucide-react';

interface GalleryProps {
  name?: string;
  photos?: string[];
  onEdit?: () => void;
  isOwner?: boolean;
}

export const ProfileGallery = ({ name = 'Crew Member', photos = [], onEdit, isOwner }: GalleryProps) => {
  // ... (defaultPhotos remains the same)
  const defaultPhotos = [
    "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&q=80&w=1200", // Cockpit view
    "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&q=80&w=600",  // Uniform detail
    "https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&q=80&w=600",  // Layover city
    "https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80&w=600",  // Aircraft wing
    "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=600",  // Travel gear
  ];

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;

  return (
    <div className="relative mb-16">
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-text tracking-tighter mb-2">{name}&apos;s Profile</h1>
          <p className="text-text-muted font-bold text-sm tracking-tight uppercase tracking-[0.2em] font-mono opacity-60">Verified Crew Member</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm font-bold hover:bg-surface-2 px-5 py-2.5 rounded-full transition-all border border-border shadow-sm active:scale-95">
            <Share size={18} /> Share
          </button>
          {isOwner && onEdit && (
            <button 
              onClick={onEdit}
              className="flex items-center gap-2 text-sm font-bold hover:bg-surface-2 px-5 py-2.5 rounded-full transition-all border border-border shadow-sm active:scale-95"
            >
              <Settings size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* 5-Photo Bento Grid (Airbnb Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[500px] md:h-[600px] rounded-[2.5rem] overflow-hidden relative group shadow-2xl shadow-black/5 border border-border">
        {/* Main large photo */}
        <div className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-surface-2 border-r border-border">
          <img 
            src={displayPhotos[0] || defaultPhotos[0]} 
            alt="Profile main" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
          />
        </div>

        {/* Small photos (fill up with placeholders if fewer than 5) */}
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className={`relative overflow-hidden bg-surface hidden md:block border-border ${idx < 3 ? 'border-b' : ''} ${idx % 2 !== 0 ? 'border-r' : ''}`}>
            <img 
              src={displayPhotos[idx] || defaultPhotos[idx]} 
              alt={`Gallery ${idx}`} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
        ))}

        {/* Show all photos button */}
        <button className="absolute bottom-8 right-8 bg-white border border-border px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-surface-2 transition-all shadow-xl active:scale-95">
          <Grid size={18} strokeWidth={2.5} /> Show all photos
        </button>
      </div>
    </div>
  );
};
