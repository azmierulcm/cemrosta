'use server';

import { getSupabaseServer } from '@/lib/utils/supabase';
import { RosterData, DutyEvent, DutyType } from '@/lib/types';

export async function fetchUserRoster(userId: string, month?: string, year?: string, includePrevious: boolean = false): Promise<{ roster: RosterData, history: { month: string, year: string }[] } | null> {
  const supabase = getSupabaseServer();
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
      const prevDate = new Date(parseInt(finalYear), history.findIndex(h => h.month === finalMonth && h.year === finalYear) + 1, 0);
      // Wait, simple way: find the one after target in history
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
    const { error } = await supabase
      .from('flights')
      .update({
        flight_number: updates.flightNumber,
        origin_iata: updates.depPort,
        destination_iata: updates.arrPort,
        std_utc: updates.std,
        sta_utc: updates.sta,
        aircraft_type: updates.aircraftType,
        duty_type: updates.type?.toLowerCase()
      })
      .eq('id', dutyId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Update Duty Error:', err);
    return { success: false, error: err };
  }
}

export async function deleteDuty(dutyId: string) {
  const supabase = getSupabaseServer();
  try {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', dutyId);

    if (error) throw error;
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

    // 2. Fetch all flights for this user to filter manually by month name
    // (Filtering by month name is safer since we store ISO dates)
    const { data: flights, error: fetchError } = await supabase
      .from('flights')
      .select('id, flight_date')
      .eq('crew_id', profile.id);

    if (fetchError) throw fetchError;

    const normalizeMonth = (m: string) => m.toLowerCase().slice(0, 3);
    const targetMonthNorm = normalizeMonth(month);

    const idsToDelete = (flights || [])
      .filter(f => {
        const d = new Date(f.flight_date);
        const m = d.toLocaleString('en-US', { month: 'short' });
        return normalizeMonth(m) === targetMonthNorm && d.getFullYear().toString() === year;
      })
      .map(f => f.id);

    if (idsToDelete.length === 0) return { success: true, count: 0 };

    // 3. Delete those flights
    const { error: deleteError } = await supabase
      .from('flights')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) throw deleteError;

    return { success: true, count: idsToDelete.length };
  } catch (err) {
    console.error('Delete Monthly Roster Error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = getSupabaseServer();
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Update Profile Error:', err);
    return { success: false, error: err };
  }
}
