import { CrewStats } from '@/lib/types/passport';
import { supabase } from '@/lib/utils/supabase';
import { evaluateAchievements } from './achievements/evaluator';

/**
 * Recomputes CrewStats for a specific user
 * This logic should ideally live in a Supabase Edge Function,
 * but for local development and initial phase, we can trigger it from the frontend.
 */
export async function recomputeStats(crewId: string) {
  // 1. Fetch all flights for the crew
  const { data: flights, error: flightError } = await supabase
    .from('flights')
    .select('*')
    .eq('crew_id', crewId);

  if (flightError || !flights) return null;

  // 2. Aggregate Lifetime Stats
  const lifetimeStats = flights.reduce((acc, f) => {
    acc.total_km += Number(f.distance_km);
    acc.total_sectors += 1;
    acc.total_block_minutes += f.block_minutes;
    acc.total_flight_minutes += (f.flight_minutes || 0);
    
    if (f.witnessed_sunrise) acc.sunrises_witnessed += 1;
    if (f.witnessed_sunset) acc.sunsets_witnessed += 1;
    if (f.crosses_polar) acc.polar_crossings += 1;
    if (f.crosses_equator) acc.equator_crossings += 1;
    if (f.crosses_idl) acc.idl_crossings += 1;

    return acc;
  }, {
    total_km: 0,
    total_sectors: 0,
    total_block_minutes: 0,
    total_flight_minutes: 0,
    sunrises_witnessed: 0,
    sunsets_witnessed: 0,
    polar_crossings: 0,
    equator_crossings: 0,
    idl_crossings: 0,
  });

  // 3. Aggregate YTD Stats (Current Year)
  const currentYear = new Date().getFullYear().toString();
  const ytdFlights = flights.filter(f => f.flight_date.startsWith(currentYear));
  
  const ytdStats = ytdFlights.reduce((acc, f) => {
    acc.ytd_km += Number(f.distance_km);
    acc.ytd_sectors += 1;
    acc.ytd_block_minutes += f.block_minutes;
    if (f.witnessed_sunrise) acc.ytd_sunrises += 1;
    return acc;
  }, {
    ytd_km: 0,
    ytd_sectors: 0,
    ytd_block_minutes: 0,
    ytd_sunrises: 0
  });

  // 4. Unique Counts
  const destinations = new Set(flights.flatMap(f => [f.origin_iata, f.destination_iata]));
  const aircraftTypes = new Set(flights.map(f => f.aircraft_type).filter(Boolean));

  const finalStats: Partial<CrewStats> = {
    ...lifetimeStats,
    ...ytdStats,
    unique_destinations: destinations.size,
    unique_aircraft_types: aircraftTypes.size,
    updated_at: new Date().toISOString(),
  };

  // 5. Save to Supabase
  const { error: updateError } = await supabase
    .from('crew_stats')
    .upsert({ crew_id: crewId, ...finalStats });

  if (updateError) console.error('Stats recompute failed:', updateError);

  // 6. Evaluate Achievements
  await evaluateAchievements(crewId, finalStats as CrewStats);

  return finalStats;
}
