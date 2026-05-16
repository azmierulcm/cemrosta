'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { LandingHero } from '@/components/marketing/LandingHero';
import { ComparisonSection } from '@/components/marketing/ComparisonSection';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { AudienceSection } from '@/components/marketing/AudienceSection';
import { PricingCTA } from '@/components/marketing/PricingCTA';
import { Dashboard } from '@/components/product/Dashboard';
import { FileUploader } from '@/components/product/FileUploader';
import { Footer } from '@/components/shared/Footer';
import { useRoster } from '@/lib/contexts/RosterContext';
import { AnimatePresence, motion } from 'framer-motion';

import { AuthModal } from '@/components/shared/AuthModal';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/utils/supabase';
import { Upload, Loader2 } from 'lucide-react';

export default function HomeClient() {
  const { roster, isLoading: rosterLoading } = useRoster();
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Monitor scroll for sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      // Show CTA when scrolled 800px or roughly past the hero
      if (window.scrollY > 800) {
        setShowStickyCTA(true);
      } else {
        setShowStickyCTA(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main id="main-content" className="min-h-screen bg-surface-2 selection:bg-accent/30 selection:text-accent-fg flex flex-col">
      <Navbar />
      <AuthModal />
      
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {/* Auth Loading State - Only show full screen loader for initial auth check */}
          {authLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center gap-6"
            >
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono animate-pulse">Initializing Flight Deck...</p>
            </motion.div>
          ) : !user ? (
            /* Scenario 1: User is not logged in - Show Landing Page */
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LandingHero />
              <ComparisonSection />
              <HowItWorks />
              <AudienceSection />
              <PricingCTA />
            </motion.div>
          ) : (rosterLoading && !roster) ? (
            /* Initial data fetch when user is logged in but no roster state yet */
            <motion.div
              key="data-fetching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center gap-6"
            >
              <Loader2 className="w-12 h-12 animate-spin text-accent" />
              <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono animate-pulse">Fetching Mission Data...</p>
            </motion.div>
          ) : (!roster || roster.events.length === 0) ? (
            /* Scenario 2: User is logged in but has NO roster events - Show Upload Zone */
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pt-40 pb-20 px-4 min-h-[100svh] flex flex-col items-center justify-center"
            >
              <div className="max-w-4xl mx-auto text-center mb-16">
                 <div className="flex items-center justify-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
                   {"// WELCOME CREW MEMBER"}
                 </div>
                 <h2 className="text-5xl md:text-8xl font-bold text-text mb-8 tracking-tighter">Clear for Takeoff.</h2>
                 <p className="text-xl md:text-2xl text-text-muted font-bold tracking-tight max-w-xl mx-auto leading-snug">
                   Your account is ready. Now, upload your Malaysia Airlines roster PDF to sync your life.
                 </p>
              </div>
              <div className="w-full max-w-2xl">
                <FileUploader />
              </div>
            </motion.div>
          ) : (
            /* Scenario 3: Roster with events exists - Show Dashboard */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-32"
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!roster && !user && <Footer />}

      {/* Mobile Sticky Upload CTA */}
      {!roster && !!user && (
        <AnimatePresence>
          {showStickyCTA && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-4 right-4 z-[60] md:hidden"
            >
              <button 
                onClick={scrollToTop}
                className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <Upload size={20} strokeWidth={3} />
                Upload roster
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </main>
  );
}
