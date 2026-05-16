'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Copy, Check, Smartphone, Monitor, Loader2 } from 'lucide-react';

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
  const [isImageLoading, setIsImageLoading] = useState(true);

  if (!isOpen) return null;

  const currentUrl = view === 'stories' 
    ? `/api/recap/${userId}/${year}/${month}/stories`
    : `/api/recap/${userId}/${year}/${month}/card`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${currentUrl}?download=1`;
    link.download = `Mission-Recap-${month}-${year}-${view}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    const shareUrl = `${window.location.origin}/api/share/monthly/${userId}/${year}/${month}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 z-50 p-3 bg-surface-2 hover:bg-border rounded-full transition-all text-text-muted hover:text-text shadow-sm"
            >
              <X size={24} />
            </button>

            {/* Left: Preview */}
            <div className="flex-[1.2] bg-surface-2 p-10 md:p-16 flex flex-col items-center justify-center gap-10">
               <div className="flex bg-white p-2 rounded-2xl border border-border shadow-sm">
                  <button 
                    onClick={() => { setView('stories'); setIsImageLoading(true); }}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'stories' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-text'}`}
                  >
                    <Smartphone size={14} />
                    Stories
                  </button>
                  <button 
                    onClick={() => { setView('card'); setIsImageLoading(true); }}
                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'card' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-muted hover:text-text'}`}
                  >
                    <Monitor size={14} />
                    Card
                  </button>
               </div>

               <div className={`relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-border transition-all duration-700 flex items-center justify-center ${view === 'stories' ? 'aspect-[9/16] h-[550px]' : 'aspect-[1.91/1] w-full max-w-lg'}`}>
                  {isImageLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-2 z-20">
                       <Loader2 className="w-10 h-10 animate-spin text-accent" />
                       <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono">Generating Vision...</p>
                    </div>
                  )}
                  <img 
                    key={`${currentUrl}-${view}`}
                    src={currentUrl} 
                    alt="Recap Preview" 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => {
                      setIsImageLoading(false);
                      console.error("Recap image failed to load");
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 opacity-20" />
               </div>
            </div>

            {/* Right: Actions */}
            <div className="flex-1 p-10 md:p-16 flex flex-col justify-center">
              <div className="max-w-sm mx-auto w-full">
                 <div className="mb-12">
                   <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-accent font-mono">
                      {"// MISSION EXPORT"}
                   </div>
                   <h3 className="text-5xl font-black text-text mb-6 tracking-tighter leading-none">Share your mission.</h3>
                   <p className="text-text-muted text-lg font-bold leading-snug tracking-tight">
                     Your monthly highlights are ready for takeoff. Share your card to update your crew and family.
                   </p>
                 </div>

                 <div className="space-y-4">
                    <button 
                      onClick={handleDownload}
                      className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all active:scale-95"
                    >
                       <Download size={24} strokeWidth={3} />
                       Download PNG
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={handleCopy}
                        className="bg-surface-2 border border-border text-text py-5 rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-border transition-all active:scale-95 shadow-sm"
                      >
                         {isCopied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
                         {isCopied ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button className="bg-surface-2 border border-border text-text py-5 rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-border transition-all active:scale-95 shadow-sm">
                         <Share2 size={20} />
                         Share Directly
                      </button>
                    </div>
                 </div>

                 <p className="mt-16 text-center text-text-subtle font-black text-[10px] uppercase tracking-[0.5em] font-mono bg-surface-2 py-3 rounded-full border border-border">
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
