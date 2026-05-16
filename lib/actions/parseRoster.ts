'use server';

import { getDocumentProxy, extractText } from 'unpdf';
import { parseRosterText } from '@/lib/parser';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';
import { supabase } from '@/lib/utils/supabase';
// Server-side tracking would normally go here
// import { trackServerEvent } from '@/lib/analytics/server';

export async function parseRoster(formData: FormData): Promise<RosterData> {
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;
  
  if (!file) throw new Error('No file uploaded');

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  try {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    
    const parsed = parseRosterText(text);
    
    // Map ParsedRoster to RosterData (legacy support)
    const events: DutyEvent[] = parsed.duties.map(d => ({
      id: d.id,
      type: d.type as DutyType,
      date: d.date,
      flightNumber: d.flight?.flightNumber,
      depPort: d.flight?.depPort,
      arrPort: d.flight?.arrPort,
      std: d.flight?.std,
      sta: d.flight?.sta,
      signOn: d.signOn || d.flight?.signOn,
      signOff: d.signOff || d.flight?.signOff,
      hotel: d.flight?.hotel,
      description: d.description,
    }));

    // Persistence Logic: If userId is provided, sync to Supabase
    if (userId) {
      // 1. Update Profile (Airline Verification)
      await supabase
        .from('profiles')
        .update({ 
          verified_at: new Date().toISOString(),
          airline: parsed.airline 
        })
        .eq('id', userId);

      // 2. Ensure Crew Profile exists
      let { data: crewProfile } = await supabase
        .from('crew_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!crewProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('crew_profiles')
          .insert({
            user_id: userId,
            display_name: parsed.crewName || 'Crew Member',
            rank: 'Crew', // Default, would be refined by rank parser
            base_iata: 'KUL',
            airline_code: parsed.airline === 'Malaysia Airlines' ? 'MH' : 'XX',
            handle: `crew.${userId.slice(0, 5)}`
          })
          .select('id')
          .single();
        
        if (createError) console.error('Failed to create crew profile', createError);
        crewProfile = newProfile;
      }

      // 3. Save Flights
      if (crewProfile) {
        const flightsToInsert = events
          .filter(e => e.type === 'FLIGHT')
          .map(f => ({
            crew_id: crewProfile.id,
            flight_date: f.date,
            flight_number: f.flightNumber,
            origin_iata: f.depPort,
            destination_iata: f.arrPort,
            std_utc: f.std || f.date, // Fallback to date if no time
            sta_utc: f.sta || f.date,
            block_minutes: 0, // Should be calculated
            distance_km: 0, // Should be calculated
            aircraft_type: f.aircraftType || 'B737',
            duty_type: 'flight'
          }));

        if (flightsToInsert.length > 0) {
          const { error: flightError } = await supabase
            .from('flights')
            .upsert(flightsToInsert, { onConflict: 'crew_id, flight_date, flight_number' });
          
          if (flightError) console.error('Failed to sync flights', flightError);
        }
      }
    }

    return {
      events,
      month: parsed.month,
      year: parsed.year,
      crewName: parsed.crewName,
    };
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw new Error(err instanceof Error ? err.message : 'Could not read PDF roster.');
  }
}
