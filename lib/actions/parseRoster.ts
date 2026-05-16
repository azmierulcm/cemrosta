'use server';

import { getDocumentProxy, extractText } from 'unpdf';
import { parseRosterText } from '@/lib/parser';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';
import { supabase } from '@/lib/utils/supabase';
import { generateICS } from '@/lib/utils/calendar';
import { recomputeStats } from '@/lib/passport-stats';
import { calculateKilometers, calculateBlockMinutes } from '@/lib/utils/geo/haversine';

export async function parseRoster(formData: FormData): Promise<RosterData> {
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;
  
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
          console.log('Successfully parsed using Python service');
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

    // Persistence Logic: If userId is provided, sync to Supabase
    if (userId) {
      // 1. Update Profile (Airline Verification)
      await supabase
        .from('profiles')
        .update({ 
          verified_at: new Date().toISOString(),
          airline: 'Malaysia Airlines' // Hardcoded for now, could be in rosterData
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
            display_name: rosterData.crewName || 'Crew Member',
            rank: 'Crew', 
            base_iata: 'KUL',
            airline_code: 'MH',
            handle: `crew.${userId.slice(0, 5)}`
          })
          .select('id')
          .single();
        
        if (createError) console.error('Failed to create crew profile', createError);
        crewProfile = newProfile;
      }

      // 3. Save All Duties
      if (crewProfile) {
        const eventsToInsert = rosterData.events.map(e => ({
          crew_id: crewProfile.id,
          flight_date: e.date,
          flight_number: e.flightNumber || `DUTY-${e.type}-${e.id.slice(-4)}`,
          origin_iata: e.depPort || 'KUL',
          destination_iata: e.arrPort || 'KUL',
          std_utc: e.std || e.signOn || e.date,
          sta_utc: e.sta || e.signOff || e.date,
          block_minutes: e.type === 'FLIGHT' && e.std && e.sta ? calculateBlockMinutes(e.std, e.sta) : 0,
          distance_km: e.type === 'FLIGHT' && e.depPort && e.arrPort ? calculateKilometers(e.depPort, e.arrPort) : 0,
          aircraft_type: e.aircraftType || 'B737',
          duty_type: e.type.toLowerCase()
        }));

        if (eventsToInsert.length > 0) {
          const { error: flightError } = await supabase
            .from('flights')
            .upsert(eventsToInsert, { onConflict: 'crew_id, flight_date, flight_number' });
          
          if (flightError) console.error('Failed to sync duties', flightError);
        }

        // 3b. Recompute Stats & Achievements
        await recomputeStats(crewProfile.id);

        // 4. Generate and Store ICS File
        const icsContent = generateICS(rosterData);
        if (icsContent) {
          const filename = `${rosterData.year}-${rosterData.month}.ics`;
          const path = `${userId}/rosters/${filename}`;
          
          const { error: uploadError } = await supabase.storage
            .from('roster-files')
            .upload(path, icsContent, {
              contentType: 'text/calendar',
              upsert: true
            });

          if (uploadError) {
            console.error('Failed to store ICS file:', uploadError);
          }
        }
      }
    }

    return rosterData;
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw new Error(err instanceof Error ? err.message : 'Could not read PDF roster.');
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
