'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/utils/supabase';

interface WaitlistSheetProps {
  isOpen: boolean;
  onClose: () => void;
  airline: string;
}

export const WaitlistSheet = ({ isOpen, onClose, airline }: WaitlistSheetProps) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const { error } = await supabase
        .from('waitlist_entries')
        .insert([{ email, airline_name: airline }]);

      if (error) throw error;
      
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setEmail('');
      }, 3000);
    } catch (err) {
      console.error('Waitlist error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100]"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-border z-[101] shadow-2xl p-10 md:p-14 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex flex-col gap-1">
                <div className="w-10 h-1.5 bg-accent/20" />
                <div className="w-10 h-3 bg-accent/50" />
                <div className="w-10 h-6 bg-accent" />
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-surface-2 rounded-full transition-colors text-text-muted hover:text-text"
              >
                <X size={28} />
              </button>
            </div>

            {status === 'success' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-success/10 rounded-[2.5rem] flex items-center justify-center mb-10 text-success shadow-sm">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-4xl font-bold text-text mb-4 tracking-tighter">You&apos;re on the list.</h3>
                 <p className="text-text-muted leading-snug font-bold text-lg tracking-tight">
                   We&apos;ll notify you the moment {airline} support is cleared for takeoff.
                 </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
                  {"// FLEET EXPANSION PROTOCOL"}
                </div>
                <h3 className="text-5xl font-bold text-text mb-6 tracking-tighter leading-none">
                  Bring Cemrosta to <span className="text-accent">{airline}.</span>
                </h3>
                <p className="text-text-muted mb-16 leading-snug font-bold text-xl tracking-tight">
                  We&apos;re expanding our flight deck. Join the waitlist and be the first to know when we support your airline&apos;s roster format.
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle mb-4 font-mono px-1">
                      Aviation or Personal Email
                    </label>
                    <input 
                      id="email"
                      type="email"
                      required
                      placeholder="crew@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-2 border border-border px-8 py-5 rounded-2xl text-text focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-bold text-lg shadow-sm placeholder:text-text-subtle/50"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl text-danger text-sm font-bold tracking-tight">
                       {errorMessage}
                    </div>
                  )}

                  <button 
                    disabled={status === 'loading'}
                    className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-xl flex items-center justify-center gap-4 shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        Request Access
                        <Send size={24} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-auto pt-16">
                   <p className="text-[10px] text-text-subtle font-mono font-black uppercase tracking-[0.3em] text-center bg-surface-2 py-3 rounded-full border border-border">
                     {"// SECURE TRANSMISSION // NO SPAM"}
                   </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
