'use client';

import React, { useEffect, useState } from 'react';
import { StoryDeck } from '@/components/product/passport/StoryDeck';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/utils/supabase';
import { CrewStats, CrewProfile } from '@/lib/types/passport';
import { Loader2 } from 'lucide-react';

export default function YearInAirStoryPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CrewStats | null>(null);
  const [profile, setProfile] = useState<CrewProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch Stats
      const { data: statsData } = await supabase
        .from('crew_stats')
        .select('*')
        .eq('crew_id', user.id)
        .maybeSingle();

      if (statsData) setStats(statsData as CrewStats);

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('crew_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) setProfile(profileData as CrewProfile);

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // Fallback Mock Data for demo
  const mockStats: CrewStats = {
    crew_id: 'demo',
    total_km: 142500,
    total_sectors: 89,
    total_block_minutes: 55920,
    total_flight_minutes: 14200,
    unique_destinations: 24,
    unique_countries: 12,
    unique_continents: 3,
    unique_aircraft_types: 2,
    unique_crew_flown_with: 142,
    sunrises_witnessed: 45,
    sunsets_witnessed: 32,
    polar_crossings: 4,
    equator_crossings: 12,
    idl_crossings: 2,
    ytd_km: 45200,
    ytd_sectors: 32,
    ytd_block_minutes: 5400,
    ytd_unique_destinations: 12,
    ytd_unique_new_destinations: 4,
    ytd_sunrises: 12,
    top_route_pair: 'KUL-LHR',
    top_route_count: 14,
    longest_sector_id: null,
    updated_at: new Date().toISOString(),
  };

  const mockProfile: CrewProfile = {
    id: 'demo',
    user_id: 'demo',
    display_name: 'Muhammad Azmierul',
    rank: 'First Officer',
    base_iata: 'KUL',
    airline_code: 'MH',
    aircraft_types: ['A350', 'B737'],
    handle: 'crew.azmierul',
    avatar_url: null,
    hire_date: null,
    birthday: null,
    privacy_mode: 'crew',
    created_at: new Date().toISOString()
  };

  if (isLoading) {
    return (
      <div className="bg-passport-bg min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-passport-gold" />
      </div>
    );
  }

  return (
    <main className="bg-passport-bg min-h-screen">
      <StoryDeck stats={stats || mockStats} crewProfile={profile || mockProfile} />
    </main>
  );
}
