'use server';

import { getDocumentProxy, extractText } from 'unpdf';
import { parseRosterText } from '@/lib/parser';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';
import { getSupabaseServer } from '@/lib/utils/supabase';
import { generateICS } from '@/lib/utils/calendar';
import { recomputeStats } from '@/lib/passport-stats';
import { calculateKilometers, calculateBlockMinutes } from '@/lib/utils/geo/haversine';

/**
 * Step 1: Just parse the PDF and return data to the client for preview.
 */
export async function parseRoster(formData: FormData): Promise<RosterData> {
  const file = formData.get('file') as File;
  
  if (!file) throw new Error('No file uploaded');

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  
  try {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    
    let rosterData: RosterData;

    // Try Python Parser Service if URL is configured
    const PARSER_SERVICE_URL = process.env.PARSER_SERVICE_URL;
    if (PARSER_SERVICE_URL) {
      try {
        const pyFormData = new FormData();
        pyFormData.append('file', new Blob([buffer], { type: 'application/pdf' }), 'roster.pdf');

        const response = await fetch(`${PARSER_SERVICE_URL}/parse-roster`, {
          method: 'POST',
          body: pyFormData,
        });

        if (response.ok) {
          const pyData = await response.json();
          rosterData = {
            events: pyData.events.map((e: {
              id: string;
              type: string;
              date: string;
              flight_number?: string;
              dep_port?: string;
              arr_port?: string;
              std?: string;
              sta?: string;
              sign_on?: string;
              sign_off?: string;
              description?: string;
            }) => ({
              id: e.id,
              type: e.type as DutyType,
              date: e.date,
              flightNumber: e.flight_number,
              depPort: e.dep_port,
              arrPort: e.arr_port,
              std: e.std,
              sta: e.sta,
              signOn: e.sign_on,
              signOff: e.sign_off,
              description: e.description,
            })),
            month: pyData.month,
            year: pyData.year,
            crewName: pyData.crew_name,
          };
        } else {
          throw new Error('Python service failed');
        }
      } catch (err) {
        console.error('Python Parser Error, falling back to TS:', err);
        rosterData = parseUsingTS(text);
      }
    } else {
      rosterData = parseUsingTS(text);
    }

    return rosterData;
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw new Error(err instanceof Error ? err.message : 'Could not read PDF roster.');
  }
}

/**
 * Step 2: Explicitly save the confirmed roster data to Supabase.
 */
export async function saveRosterData(userId: string, rosterData: RosterData) {
  const supabase = getSupabaseServer();
  
  try {
    // 1. Skip profiles table for now due to schema cache issues
    
    // 2. Ensure Crew Profile exists (Refactored to prevent handle conflicts)
    let { data: existingProfile } = await supabase
      .from('crew_profiles')
      .select('id, handle')
      .eq('user_id', userId)
      .maybeSingle();

    let crewProfileId = userId;
    
    const profilePayload = {
      user_id: userId,
      display_name: rosterData.crewName || 'Crew Member',
      rank: 'Crew', 
      base_iata: 'KUL',
      airline_code: 'MH',
      updated_at: new Date().toISOString()
    };

    // If it doesn't exist, we also need to set the initial handle and ID
    if (!existingProfile) {
      Object.assign(profilePayload, {
        id: userId,
        handle: `crew.${userId.slice(0, 5)}.${Math.floor(Math.random() * 1000)}` // Added randomness to prevent collisions
      });
    } else {
      crewProfileId = existingProfile.id;
    }

    const { data: crewProfile, error: crewProfileError } = await supabase
      .from('crew_profiles')
      .upsert({
        id: crewProfileId,
        ...profilePayload
      }, { onConflict: 'id' })
      .select('id')
      .single();

    if (crewProfileError || !crewProfile) {
      console.error('Crew Profile Sync Error:', crewProfileError);
      throw new Error(`Could not verify crew profile: ${crewProfileError?.message || 'Unknown error'}`);
    }

    // 3. Save All Duties
    if (crewProfile) {
      // 3a. Ensure airports exist in the database to avoid foreign key violations
      const airportCodes = new Set<string>();
      rosterData.events.forEach(e => {
        if (e.depPort) airportCodes.add(e.depPort.toUpperCase());
        if (e.arrPort) airportCodes.add(e.arrPort.toUpperCase());
      });
      airportCodes.add('KUL'); // Default base

      // Auto-seed missing airports with mock data to satisfy FK constraint
      const airportsToUpsert = Array.from(airportCodes).map(code => ({
        iata: code,
        icao: `W${code}`, // Mock ICAO
        name: `${code} Airport`,
        city: code,
        country: code === 'KUL' ? 'Malaysia' : 'Unknown',
        country_code: code === 'KUL' ? 'MY' : '??',
        continent: 'AS',
        lat: 0,
        lng: 0
      }));

      if (airportsToUpsert.length > 0) {
        const { error: airportError } = await supabase
          .from('airports')
          .upsert(airportsToUpsert, { onConflict: 'iata' });
        
        if (airportError) {
          console.error('Airport Seeding Error:', airportError);
        }
      }
      
      // 3b. Construct and Deduplicate Duties
      const eventsMap = new Map<string, any>();
      
      rosterData.events.forEach(e => {
        const combineDateAndTime = (dateStr: string, timeStr?: string) => {
          if (!timeStr || timeStr === '--:--') return new Date(`${dateStr}T00:00:00Z`).toISOString();
          return new Date(`${dateStr}T${timeStr}:00Z`).toISOString();
        };

        const dep = e.depPort?.toUpperCase() || 'KUL';
        const arr = e.arrPort?.toUpperCase() || 'KUL';
        const flightNum = e.flightNumber || `DUTY-${e.type}-${e.id.slice(-4)}`;
        
        const uniqueKey = `${crewProfile.id}-${e.date}-${flightNum}`;

        eventsMap.set(uniqueKey, {
          crew_id: crewProfile.id,
          flight_date: e.date,
          flight_number: flightNum,
          origin_iata: dep,
          destination_iata: arr,
          std_utc: combineDateAndTime(e.date, e.std || e.signOn),
          sta_utc: combineDateAndTime(e.date, e.sta || e.signOff),
          block_minutes: e.type === 'FLIGHT' && e.std && e.sta ? calculateBlockMinutes(e.std, e.sta) : 0,
          distance_km: e.type === 'FLIGHT' && e.depPort && e.arrPort ? calculateKilometers(e.depPort, e.arrPort) : 0,
          aircraft_type: e.aircraftType || 'B737',
          duty_type: e.type.toLowerCase()
        });
      });

      const eventsToInsert = Array.from(eventsMap.values());

      if (eventsToInsert.length > 0) {
        const { error: flightError } = await supabase
          .from('flights')
          .upsert(eventsToInsert, { onConflict: 'crew_id, flight_date, flight_number' });
        
        if (flightError) {
          console.error('Supabase Flights Upsert Error:', flightError);
          if (flightError.code === '23503') {
            if (flightError.message.includes('flights_crew_id_fkey')) {
               throw new Error(`Profile Mismatch: Your crew profile (ID: ${crewProfile.id}) was not found in the flight system. Please try running the SQL setup again.`);
            }
            throw new Error(`Save failed: Some airport codes in your roster are not yet in our database. (${flightError.message})`);
          }
          throw new Error(`Flight Sync Failed: ${flightError.message} (${flightError.code})`);
        }
      }

      // 3c. Recompute Stats & Achievements
      await recomputeStats(crewProfile.id);

      // 4. Generate and Store ICS File
      const icsContent = generateICS(rosterData);
      if (icsContent) {
        const filename = `${rosterData.year}-${rosterData.month}.ics`;
        const icsPath = `${userId}/rosters/${filename}`;
        
        const { error: uploadError } = await supabase.storage
          .from('roster-files')
          .upload(icsPath, icsContent, {
            contentType: 'text/calendar',
            upsert: true
          });

        if (uploadError) console.error('ICS Upload Error:', uploadError.message);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Save Roster Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save roster' };
  }
}

function parseUsingTS(text: string): RosterData {
  const parsed = parseRosterText(text);
  
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

  return {
    events,
    month: parsed.month,
    year: parsed.year,
    crewName: parsed.crewName,
  };
}
