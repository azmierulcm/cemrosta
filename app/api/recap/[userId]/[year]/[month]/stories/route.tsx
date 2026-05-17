import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { StoriesTemplate } from '@/lib/recap/templates';
import { getTopSuperlative } from '@/lib/recap/superlatives';
import { getSupabaseServer } from '@/lib/utils/supabase';
import { DutyEvent } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; year: string; month: string }> }
) {
  try {
    const { userId, year, month } = await params;
    const { searchParams } = new URL(req.url);
    const download = searchParams.get('download') === '1';

    console.log(`Generating Stories Recap for ${userId} - ${month} ${year}`);

    const supabase = getSupabaseServer();

    // 1. Fetch Crew Profile
    const { data: profile, error: profileError } = await supabase
      .from('crew_profiles')
      .select('display_name, handle, id')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response('Profile not found', { status: 404 });
    }

    // 2. Fetch Flights for that month
    const { data: flights, error: flightsError } = await supabase
      .from('flights')
      .select('*')
      .eq('crew_id', profile.id)
      .order('flight_date', { ascending: true });

    if (flightsError) {
      console.error('Flights fetch error:', flightsError);
    }

    const normalizeMonth = (m: string) => m.toLowerCase().slice(0, 3);
    const targetMonthNorm = normalizeMonth(month);

    const monthFlights = (flights || []).filter(f => {
      if (!f.flight_date) return false;
      try {
        const d = new Date(f.flight_date);
        if (isNaN(d.getTime())) return false;
        
        const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const mNorm = shortMonths[d.getUTCMonth()];
        return mNorm === targetMonthNorm && d.getUTCFullYear().toString() === year;
      } catch {
        return false;
      }
    });

    console.log(`Found ${monthFlights.length} flights for recap`);

    if (monthFlights.length === 0) {
      console.warn(`No flights found for ${userId} in ${month} ${year}`);
    }

    // 3. Calculate Stats
    const sectors = monthFlights.filter(f => f.duty_type?.toLowerCase() === 'flight').length;
    const totalKm = monthFlights.reduce((acc, f) => acc + (Number(f.distance_km) || 0), 0);
    const totalMinutes = monthFlights.reduce((acc, f) => acc + (Number(f.block_minutes) || 0), 0);
    const hours = Math.floor(totalMinutes / 60);

    const displayName = profile.display_name || 'Crew Member';
    const cleanHandle = profile.handle ? `@${profile.handle}` : `@${displayName.toLowerCase().replace(/[^a-z0-9]/g, '.')}`;
    
    const data = {
      month: month.toUpperCase(),
      year,
      heroValue: hours.toString(),
      heroLabel: 'BLOCK HOURS',
      sectors,
      hours: hours.toString(),
      km: totalKm > 1000 ? `${(totalKm / 1000).toFixed(1)}k` : Math.round(totalKm).toString(),
      handle: cleanHandle
    };

    // 4. Map to DutyEvent for Superlative engine
    const events = monthFlights.map(f => ({
      id: f.id,
      type: 'FLIGHT' as const,
      date: f.flight_date,
      flightNumber: f.flight_number,
      depPort: f.origin_iata,
      arrPort: f.destination_iata,
    }));

    const superlative = getTopSuperlative(events as DutyEvent[]);

    return new ImageResponse(
      <StoriesTemplate data={data} superlative={superlative} />,
      {
        width: 1080,
        height: 1920,
        headers: download ? {
          'Content-Disposition': `attachment; filename="Recap-${month}-${year}-Stories.png"`,
        } : {},
      }
    );
  } catch (err) {
    console.error('CRITICAL: OG Image Generation Error:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Recap generation failed', details: errorMsg }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
