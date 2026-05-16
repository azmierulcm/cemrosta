import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { StoriesTemplate } from '@/lib/recap/templates';
import { getTopSuperlative } from '@/lib/recap/superlatives';
import { getSupabaseServer } from '@/lib/utils/supabase';

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

    // Fetch font data (Inter Bold)
    const fontData = await fetch(
      new URL('https://rsms.me/inter/font-files/Inter-Bold.otf')
    ).then((res) => {
      if (!res.ok) throw new Error('Failed to fetch font');
      return res.arrayBuffer();
    });

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
      const d = new Date(f.flight_date);
      const m = d.toLocaleString('en-US', { month: 'short' });
      return normalizeMonth(m) === targetMonthNorm && d.getFullYear().toString() === year;
    });

    console.log(`Found ${monthFlights.length} flights for recap`);

    // 3. Calculate Stats
    const sectors = monthFlights.filter(f => f.duty_type === 'flight').length;
    const totalKm = monthFlights.reduce((acc, f) => acc + Number(f.distance_km || 0), 0);
    const totalMinutes = monthFlights.reduce((acc, f) => acc + Number(f.block_minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);

    const data = {
      month,
      year,
      heroValue: hours.toString(),
      heroLabel: 'BLOCK HOURS',
      sectors,
      hours: hours.toString(),
      km: totalKm > 1000 ? `${(totalKm / 1000).toFixed(1)}k` : totalKm.toString(),
      handle: profile.handle ? `@${profile.handle}` : `@${profile.display_name.toLowerCase().replace(/\s+/g, '.')}`
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

    const superlative = getTopSuperlative(events as any);

    return new ImageResponse(
      <StoriesTemplate data={data} superlative={superlative} />,
      {
        width: 1080,
        height: 1920,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
        headers: download ? {
          'Content-Disposition': `attachment; filename="Recap-${month}-${year}-Stories.png"`,
        } : {},
      }
    );
  } catch (err) {
    console.error('OG Image Generation Error:', err);
    return new Response(`Error generating image: ${err instanceof Error ? err.message : 'Unknown error'}`, { status: 500 });
  }
}
