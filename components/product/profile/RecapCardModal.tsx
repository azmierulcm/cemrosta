'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Copy, Check, Smartphone, Monitor } from 'lucide-react';

interface RecapCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  month: string;
  year: string;
}

export const RecapCardModal = ({ isOpen, onClose, userId, month, year }: RecapCardModalProps) => {
  const [view, setView] = useState<'stories' | 'card'>('stories');
  const [isCopied, setIsCopied] = useState(false);
  
  const storiesUrl = `/api/recap/${userId}/${year}/${month}/stories`;
  const cardUrl = `/api/recap/${userId}/${year}/${month}/card`;
  
  const currentUrl = view === 'stories' ? storiesUrl : cardUrl;

  const handleCopy = async () => {
    try {
      const fullUrl = `${window.location.origin}${currentUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${month} Mission Recap`,
          text: 'Check out my flight stats on Cemrosta!',
          url: `${window.location.origin}${currentUrl}`,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-5xl bg-white border border-border rounded-[3rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row h-full max-h-[85vh] md:h-auto"
          >
            {/* Left: Preview */}
            <div className="flex-1 bg-surface-2 p-10 md:p-14 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border min-h-[450px]">
               <div className="flex items-center gap-3 mb-10 bg-white p-1.5 rounded-full border border-border shadow-sm">
                  <button 
                    onClick={() => setView('stories')}
                    className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'stories' ? 'bg-accent text-accent-fg shadow-xl shadow-accent/10' : 'text-text-muted hover:text-text'}`}
                  >
                    <Smartphone size={14} /> Stories
                  </button>
                  <button 
                    onClick={() => setView('card')}
                    className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'card' ? 'bg-accent text-accent-fg shadow-xl shadow-accent/10' : 'text-text-muted hover:text-text'}`}
                  >
                    <Monitor size={14} /> Card
                  </button>
               </div>

               <div className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-border transition-all duration-700 ${view === 'stories' ? 'aspect-[9/16] h-[550px]' : 'aspect-[1.91/1] w-full max-w-lg'}`}>
                  <img 
                    key={`${currentUrl}-${view}`}
                    src={currentUrl} 
                    alt="Recap Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 opacity-20" />
               </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full md:w-[420px] p-10 md:p-16 flex flex-col bg-white">
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col gap-1.5">
                  <div className="w-10 h-1.5 bg-accent/20" />
                  <div className="w-10 h-3 bg-accent/50" />
                  <div className="w-10 h-6 bg-accent" />
                </div>
                <button onClick={onClose} className="p-3 hover:bg-surface-2 rounded-full transition-colors text-text-muted hover:text-text">
                  <X size={28} />
                </button>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-text mb-4 leading-none">Share your mission.</h2>
              <p className="text-text-muted font-bold text-lg leading-snug tracking-tight mb-12">
                Your monthly highlights are ready for takeoff. Share your card to update your crew and family.
              </p>

              <div className="space-y-4 mt-auto">
                <a 
                  href={`${currentUrl}?download=1`}
                  className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all active:scale-95"
                >
                  <Download size={24} strokeWidth={3} />
                  Download PNG
                </a>

                <button 
                  onClick={handleCopy}
                  className="w-full bg-white border border-border text-text py-6 rounded-full font-bold text-lg flex items-center justify-center gap-4 hover:bg-surface-2 transition-all active:scale-95 shadow-sm"
                >
                  {isCopied ? <Check size={24} className="text-success" strokeWidth={3} /> : <Copy size={24} />}
                  {isCopied ? 'Copied Link' : 'Copy Link'}
                </button>

                {typeof navigator !== 'undefined' && !!navigator.share && (
                  <button 
                    onClick={handleShare}
                    className="w-full bg-white border border-border text-text py-6 rounded-full font-bold text-lg flex items-center justify-center gap-4 hover:bg-surface-2 transition-all active:scale-95 shadow-sm"
                  >
                    <Share2 size={24} />
                    Share Directly
                  </button>
                )}
              </div>

              <div className="mt-16 text-center">
                 <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.5em] font-mono bg-surface-2 py-3 rounded-full border border-border">
                   {"// MISSION RECAP ENGINE"}
                 </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
