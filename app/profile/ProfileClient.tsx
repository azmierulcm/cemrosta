'use client';

import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ProfileFilled } from '@/components/product/profile/ProfileFilled';
import { ProfileEmptyState } from '@/components/product/profile/ProfileEmptyState';
import { EditProfileModal } from '@/components/product/profile/EditProfileModal';
import { useRoster } from '@/lib/contexts/RosterContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { SAMPLE_PROFILE } from '@/lib/fixtures/sample-profile';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { ProfileData } from '@/lib/types';

export default function ProfileClient() {
  const { roster } = useRoster();
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // map real roster to profile structure (simplified for Phase 3)
  const realProfileData: ProfileData | null = roster ? {
    name: profile?.full_name || roster.crewName || 'Crew Member',
    role: profile?.rank || 'Crew Member',
    homeBase: 'KUL',
    aircraftType: profile?.airline || 'B737',
    lifetimeStats: {
      sectors: roster.stats?.totalSectors || 0,
      blockMinutes: roster.events.reduce((acc) => {
        // block time logic would go here
        return acc + 0; 
      }, 0),
      kilometers: roster.stats?.totalMiles || 0,
      citiesCollected: roster.destinations?.length || 0,
      totalAvailableCities: 62
    },
    monthlyRecap: {
      month: roster.month,
      year: roster.year,
      sectors: roster.stats?.totalSectors || 0,
      blockMinutes: 0,
      newCity: roster.destinations?.[0]?.iata || null
    },
    destinations: roster.destinations?.map(d => ({
      ...d,
      iata: d.iata,
      name: d.city,
      city: d.city,
      country: d.country,
      region: 'Asia', // placeholder
      visits: d.count,
      count: d.count,
      lastVisited: d.lastVisited,
      colorTheme: d.colorTheme,
      shape: d.shape,
      unlocked: true
    })) || []
  } : null;

  const showDemo = !roster && isDemoMode;

  return (
    <main id="main-content" className="min-h-screen bg-surface-2 flex flex-col relative">
      <Navbar />
      
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {!roster && !isDemoMode ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Blurred background view */}
              <div className="opacity-[0.1] pointer-events-none filter blur-md">
                <ProfileFilled data={SAMPLE_PROFILE} />
              </div>
              <ProfileEmptyState />
            </motion.div>
          ) : (
            <motion.div
              key="filled"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {showDemo ? (
                <ProfileFilled data={SAMPLE_PROFILE} />
              ) : (
                realProfileData && (
                  <ProfileFilled data={realProfileData} onEdit={() => setIsEditModalOpen(true)} />
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />

      {isEditModalOpen && (
        <EditProfileModal 
          key={profile?.id || 'none'}
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
        />
      )}
    </main>
  );
}
