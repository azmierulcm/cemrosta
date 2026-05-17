'use server';

import { getSupabaseServer } from '@/lib/utils/supabase';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';
import { recomputeStats } from '@/lib/passport-stats';

export async function fetchUserRoster(userId: string, month?: string, year?: string, includePrevious: boolean = false): Promise<{ roster: RosterData, history: { month: string, year: string }[] } | null> {
  const supabase = getSupabaseServer();
  try {
    // 1. Get Crew Profile (Use maybeSingle to avoid 406/multiple rows error)
    const { data: profile, error: profileError } = await supabase
      .from('crew_profiles')
      .select('id, display_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Crew Profile Fetch Error:', profileError);
      return null;
    }

    if (!profile) return null; // Still show onboarding if no profile exists

    // 2. Fetch all flight dates to build history
    const { data: allFlights, error: historyError } = await supabase
      .from('flights')
      .select('flight_date')
      .eq('crew_id', profile.id)
      .order('flight_date', { ascending: false });

    if (historyError) {
      console.error('History Fetch Error:', historyError);
      return null;
    }

    // If no flights found, return an empty roster state instead of null
    // This tells the UI we successfully checked, but there's no data yet.
    if (!allFlights || allFlights.length === 0) {
      return {
        roster: {
          events: [],
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear().toString(),
          crewName: profile.display_name,
        },
        history: []
      };
    }

    // Build unique month/year list for history
    const historyMap = new Map<string, { month: string, year: string }>();
    allFlights.forEach(f => {
      const date = new Date(f.flight_date);
      const m = date.toLocaleString('en-US', { month: 'long' });
      const y = date.getFullYear().toString();
      const key = `${m}-${y}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, { month: m, year: y });
      }
    });
    const history = Array.from(historyMap.values());

    // 3. Determine Target Range
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });
    const currentYear = now.getFullYear().toString();

    const targetMonth = month || currentMonth;
    const targetYear = year || currentYear;

    // If requested month doesn't exist in history AND it's the default "now",
    // fallback to latest available month so we don't show an empty dashboard on first login
    const hasTarget = history.some(h => h.month === targetMonth && h.year === targetYear);
    const finalMonth = (month || hasTarget) ? targetMonth : history[0].month;
    const finalYear = (year || hasTarget) ? targetYear : history[0].year;

    // 4. Fetch Flights
    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('*')
      .eq('crew_id', profile.id)
      .order('flight_date', { ascending: true });

    if (flightsError || !flights) return null;

    const normalizeMonth = (m: string) => m.toLowerCase().slice(0, 3);
    const targetMonthNorm = normalizeMonth(finalMonth);

    // Support for previous month if requested (Step 5)
    let prevMonthNorm = '';
    if (includePrevious) {
      // Simple way: find the one after target in history
      const targetIdx = history.findIndex(h => h.month === finalMonth && h.year === finalYear);
      if (targetIdx !== -1 && history[targetIdx + 1]) {
        prevMonthNorm = normalizeMonth(history[targetIdx + 1].month);
      }
    }

    const filteredFlights = flights.filter(f => {
      const d = new Date(f.flight_date);
      const m = d.toLocaleString('en-US', { month: 'short' });
      const mNorm = normalizeMonth(m);
      const yStr = d.getFullYear().toString();
      
      if (includePrevious && prevMonthNorm) {
        return (mNorm === targetMonthNorm && yStr === finalYear) || 
               (mNorm === prevMonthNorm); // simplified year check
      }
      
      return mNorm === targetMonthNorm && yStr === finalYear;
    });

    const events: DutyEvent[] = filteredFlights.map(f => ({
      id: f.id,
      type: f.duty_type.toUpperCase() as DutyType,
      date: f.flight_date,
      flightNumber: f.flight_number.startsWith('DUTY-') ? undefined : f.flight_number,
      depPort: f.origin_iata,
      arrPort: f.destination_iata,
      std: f.std_utc,
      sta: f.sta_utc,
      signOn: f.std_utc,
      signOff: f.sta_utc,
      aircraftType: f.aircraft_type,
    }));

    return {
      roster: {
        events,
        month: finalMonth,
        year: finalYear,
        crewName: profile.display_name,
      },
      history
    };
  } catch (err) {
    console.error('Fetch Roster Error:', err);
    return null;
  }
}

export async function updateDuty(dutyId: string, updates: Partial<DutyEvent>) {
  const supabase = getSupabaseServer();
  try {
    // 1. Fetch the existing record to get the date and crewId
    const { data: existing } = await supabase
      .from('flights')
      .select('flight_date, crew_id')
      .eq('id', dutyId)
      .single();

    if (!existing) throw new Error('Duty not found');

    const dateStr = updates.date || existing.flight_date;

    const combineDateAndTime = (d: string, t?: string) => {
      if (!t || t === '--:--' || t.includes('T')) return t; // Already a timestamp or empty
      return new Date(`${d}T${t}:00Z`).toISOString();
    };

    const { error } = await supabase
      .from('flights')
      .update({
        flight_number: updates.flightNumber,
        origin_iata: updates.depPort,
        destination_iata: updates.arrPort,
        std_utc: combineDateAndTime(dateStr, updates.std || updates.signOn),
        sta_utc: combineDateAndTime(dateStr, updates.sta || updates.signOff),
        aircraft_type: updates.aircraftType,
        duty_type: updates.type?.toLowerCase(),
        description: updates.description 
      })
      .eq('id', dutyId);

    if (error) throw error;

    // 2. Recompute Stats
    await recomputeStats(existing.crew_id);

    return { success: true };
  } catch (err) {
    console.error('Update Duty Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}

export async function deleteDuty(dutyId: string) {
  const supabase = getSupabaseServer();
  try {
    // 1. Fetch crew_id before deleting
    const { data: flight } = await supabase
      .from('flights')
      .select('crew_id')
      .eq('id', dutyId)
      .single();

    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', dutyId);

    if (error) throw error;

    // 2. Recompute Stats if flight found
    if (flight?.crew_id) {
      await recomputeStats(flight.crew_id);
    }

    return { success: true };
  } catch (err) {
    console.error('Delete Duty Error:', err);
    return { success: false, error: err };
  }
}

export async function deleteMonthlyRoster(userId: string, month: string, year: string) {
  const supabase = getSupabaseServer();
  try {
    // 1. Get Crew Profile ID
    const { data: profile } = await supabase
      .from('crew_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) throw new Error('Profile not found');

    // 2. Define Date Range for the month
    const monthsMap: Record<string, number> = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    const monthIndex = monthsMap[month.toLowerCase()];
    if (monthIndex === undefined) throw new Error(`Invalid month: ${month}`);

    const startDate = new Date(Date.UTC(parseInt(year), monthIndex, 1)).toISOString();
    const endDate = new Date(Date.UTC(parseInt(year), monthIndex + 1, 0, 23, 59, 59)).toISOString();

    // 3. Delete flights within this range for this crew member
    const { error: deleteError, count } = await supabase
      .from('flights')
      .delete({ count: 'exact' })
      .eq('crew_id', profile.id)
      .gte('flight_date', startDate.split('T')[0])
      .lte('flight_date', endDate.split('T')[0]);

    if (deleteError) throw deleteError;

    // 4. Recompute Stats & Achievements immediately
    await recomputeStats(profile.id);

    return { success: true, count: count || 0 };
  } catch (err) {
    console.error('Delete Monthly Roster Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateUserProfile(userId: string, updates: Record<string, string | string[] | number | null>) {
  const supabase = getSupabaseServer();
  try {
    // 1. Update Base Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Base Profile Sync Error:', profileError);
      throw profileError;
    }

    // 2. Sync display_name and handle to Crew Profile if full_name is provided
    if (updates.full_name) {
      // Fetch existing crew profile to get current state
      const { data: existing } = await supabase
        .from('crew_profiles')
        .select('id, handle')
        .eq('user_id', userId)
        .maybeSingle();

      const { error: crewError } = await supabase
        .from('crew_profiles')
        .upsert({
          id: existing?.id || userId,
          user_id: userId,
          display_name: updates.full_name,
          handle: existing?.handle || `crew.${userId.slice(0, 5)}.${Math.floor(Math.random() * 1000)}`,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (crewError) {
        console.error('Crew Profile Name Sync Error:', crewError);
        // We don't throw here to allow base profile save to succeed
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Update Profile Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' };
  }
}
