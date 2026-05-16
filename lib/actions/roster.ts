'use server';

import { supabase } from '@/lib/utils/supabase';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';

export async function fetchUserRoster(userId: string, month?: string, year?: string): Promise<{ roster: RosterData, history: { month: string, year: string }[] } | null> {
  try {
    // 1. Get Crew Profile
    const { data: profile, error: profileError } = await supabase
      .from('crew_profiles')
      .select('id, display_name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) return null;

    // 2. Fetch all flight dates to build history
    const { data: allFlights, error: historyError } = await supabase
      .from('flights')
      .select('flight_date')
      .eq('crew_id', profile.id)
      .order('flight_date', { ascending: false });

    if (historyError || !allFlights || allFlights.length === 0) return null;

    // Build unique month/year list for history
    const historyMap = new Map<string, { month: string, year: string }>();
    allFlights.forEach(f => {
      const date = new Date(f.flight_date);
      const m = date.toLocaleString('default', { month: 'long' });
      const y = date.getFullYear().toString();
      const key = `${m}-${y}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, { month: m, year: y });
      }
    });
    const history = Array.from(historyMap.values());

    // 3. Fetch Flights for specific month
    // Detect latest month if not provided
    const latest = history[0];
    const targetMonth = month || latest.month;
    const targetYear = year || latest.year;

    // Build start/end of month for query
    // Simplified: Just fetch all and filter in JS for now to avoid complex SQL date logic in this action
    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('*')
      .eq('crew_id', profile.id)
      .order('flight_date', { ascending: true });

    if (flightsError || !flights) return null;

    const filteredFlights = flights.filter(f => {
      const d = new Date(f.flight_date);
      return d.toLocaleString('default', { month: 'long' }) === targetMonth && 
             d.getFullYear().toString() === targetYear;
    });

    const events: DutyEvent[] = filteredFlights.map(f => ({
      id: f.id,
      type: f.duty_type.toUpperCase() as DutyType,
      date: f.flight_date,
      flightNumber: f.flight_number,
      depPort: f.origin_iata,
      arrPort: f.destination_iata,
      std: f.std_utc,
      sta: f.sta_utc,
      aircraftType: f.aircraft_type,
    }));

    return {
      roster: {
        events,
        month: targetMonth,
        year: targetYear,
        crewName: profile.display_name,
      },
      history
    };
  } catch (err) {
    console.error('Fetch Roster Error:', err);
    return null;
  }
}
