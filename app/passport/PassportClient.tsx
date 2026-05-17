'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { PassportDashboard } from '@/components/product/passport/PassportDashboard';
import { supabase } from '@/lib/utils/supabase';
import { CrewStats, Flight } from '@/lib/types/passport';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function PassportPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CrewStats | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([]);
  const [recentFlights, setRecentFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 1. Fetch Stats
      const { data: statsData } = await supabase
        .from('crew_stats')
        .select('*')
        .eq('crew_id', user.id)
        .single();

      if (statsData) setStats(statsData as CrewStats);

      // 2. Fetch Achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('key')
        .eq('crew_id', user.id);

      if (achievementsData) {
        setEarnedAchievements(achievementsData.map(a => a.key));
      }

      // 3. Fetch Recent Flights
      const { data: flightsData } = await supabase
        .from('flights')
        .select('*')
        .eq('crew_id', user.id)
        .order('flight_date', { ascending: false })
        .limit(4);

      if (flightsData) {
        setRecentFlights(flightsData as Flight[]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // Mock data for demo
  const mockAchievements = ['first-flight', 'first-international', 'equator-bound'];
  const mockStats: CrewStats = {
    crew_id: 'demo',
    total_km: 124500,
    total_sectors: 89,
    total_block_minutes: 15420,
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

  const mockFlights: Flight[] = [
    { id: '1', crew_id: 'demo', flight_date: '2026-05-15', flight_number: 'MH 004', origin_iata: 'KUL', destination_iata: 'LHR' } as Flight,
    { id: '2', crew_id: 'demo', flight_date: '2026-05-13', flight_number: 'MH 001', origin_iata: 'LHR', destination_iata: 'KUL' } as Flight,
    { id: '3', crew_id: 'demo', flight_date: '2026-05-10', flight_number: 'MH 123', origin_iata: 'KUL', destination_iata: 'SIN' } as Flight,
    { id: '4', crew_id: 'demo', flight_date: '2026-05-10', flight_number: 'MH 124', origin_iata: 'SIN', destination_iata: 'KUL' } as Flight,
  ];

  if (isLoading) {
    return (
      <div className="bg-passport-bg min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-passport-gold" />
      </div>
    );
  }

  return (
    <main id="main-content">
      <Navbar />
      <PassportDashboard 
        stats={stats || mockStats} 
        earnedAchievements={stats ? earnedAchievements : mockAchievements}
        recentFlights={stats ? recentFlights : mockFlights}
      />
    </main>
  );
}
