'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Copy, Layout, Smartphone, Monitor } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  crewId: string;
}

type Format = 'story' | 'feed' | 'wide';
type Privacy = 'public' | 'crew' | 'family' | 'anonymous';

export const ShareModal = ({ isOpen, onClose, crewId }: ShareModalProps) => {
  const [format, setFormat] = useState<Format>('story');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [isCopying, setIsCopying] = useState(false);

  if (!isOpen) return null;

  const imageUrl = `/api/share/year-in-air/${crewId}?format=${format}&privacy=${privacy}`;

  const copyLink = () => {
    setIsCopying(true);
    navigator.clipboard.writeText(`${window.location.origin}/passport/demo`); // Placeholder
    setTimeout(() => setIsCopying(false), 2000);
  };

  const downloadImage = async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cemrosta-${format}-${new Date().getFullYear()}.png`;
    link.click();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-border w-full max-w-6xl rounded-[3rem] flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl h-[90vh] md:h-[80vh]"
        >
          <button onClick={onClose} className="absolute top-10 right-10 z-20 p-3 hover:bg-surface-2 rounded-full transition-colors">
            <X size={24} className="text-text-muted" />
          </button>

          {/* Left: Interactive Preview */}
          <div className="w-full md:w-3/5 bg-surface-2 p-10 md:p-14 flex items-center justify-center relative overflow-hidden group border-b md:border-b-0 md:border-r border-border">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(var(--color-accent) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>
            
            <div className={`
                relative shadow-2xl transition-all duration-700 overflow-hidden rounded-[2rem] border border-border bg-black
                ${format === 'story' ? 'aspect-[9/16] h-full' : format === 'feed' ? 'aspect-[4/5] h-[90%]' : 'aspect-[16/9] w-full max-w-2xl'}
            `}>
                <img 
                  src={imageUrl} 
                  alt="Passport Card Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 opacity-20" />
            </div>
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-2/5 p-10 md:p-16 flex flex-col overflow-y-auto no-scrollbar bg-white">
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-text mb-3 tracking-tighter leading-tight">Share your mission.</h2>
              <p className="text-text-muted font-bold text-lg leading-snug tracking-tight">Ready for Stories, Feed, and LinkedIn.</p>
            </div>

            {/* Format Selection */}
            <div className="mb-12">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle mb-6 block font-mono px-1">Select Export Format</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'story', label: 'Story', icon: Smartphone },
                  { id: 'feed', label: 'Feed', icon: Layout },
                  { id: 'wide', label: 'Wide', icon: Monitor },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id as Format)}
                    className={`
                      flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all shadow-sm
                      ${format === f.id ? 'border-accent bg-accent/5 text-accent' : 'border-border text-text-subtle bg-white hover:border-accent/40'}
                    `}
                  >
                    <f.icon size={24} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Toggles */}
            <div className="mb-14">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle mb-6 block font-mono px-1">Mission Privacy Mode</label>
              <div className="space-y-3">
                {[
                  { id: 'public', label: 'Public', desc: 'Show full name and exact flight stats.' },
                  { id: 'crew', label: 'Crew only', desc: 'Hide exact dates, show aggregates only.' },
                  { id: 'family', label: 'Family', desc: 'Non-aviation terms and simpler city names.' },
                  { id: 'anonymous', label: 'Anonymous', desc: 'No name or handle. Perfect for forums.' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPrivacy(p.id as Privacy)}
                    className={`
                      w-full text-left p-6 rounded-[2rem] border-2 transition-all flex items-center gap-6 shadow-sm
                      ${privacy === p.id ? 'border-accent bg-accent/5' : 'border-border bg-white hover:border-accent/40'}
                    `}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${privacy === p.id ? 'border-accent bg-accent' : 'border-border'}`}>
                      {privacy === p.id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className={`text-base font-black uppercase tracking-widest ${privacy === p.id ? 'text-text' : 'text-text-muted'}`}>{p.label}</p>
                      <p className="text-xs text-text-subtle font-bold tracking-tight">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-4">
              <button 
                onClick={downloadImage}
                className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all active:scale-95"
              >
                <Download size={24} strokeWidth={3} />
                Save PNG to Device
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={copyLink}
                  className="bg-white border border-border text-text py-5 rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-2 transition-all active:scale-95 shadow-sm"
                >
                  <Copy size={20} />
                  {isCopying ? 'Copied!' : 'Copy Passport URL'}
                </button>
                <button className="bg-white border border-border text-text py-5 rounded-full font-bold text-sm flex items-center justify-center gap-3 hover:bg-surface-2 transition-all active:scale-95 shadow-sm">
                  <Share2 size={20} />
                  Share Directly
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
