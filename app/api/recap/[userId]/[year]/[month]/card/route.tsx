import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { CardTemplate } from '@/lib/recap/templates';
import { getTopSuperlative } from '@/lib/recap/superlatives';
import { getSupabaseServer } from '@/lib/utils/supabase';

// Switch to nodejs runtime for better reliability with ImageResponse
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; year: string; month: string }> }
) {
  const { userId, year, month } = await params;
  const { searchParams } = new URL(req.url);
  const download = searchParams.get('download') === '1';

  // Load font data for robust rendering (next/og requires .ttf)
  const fontData = await fetch(
    new URL('https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf')
  ).then((res) => res.arrayBuffer());

  const supabase = getSupabaseServer();

  // 1. Fetch Crew Profile
  const { data: profile } = await supabase
    .from('crew_profiles')
    .select('display_name, handle, id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return new Response('Profile not found', { status: 404 });
  }

  // 2. Fetch Flights for that month
  const { data: flights } = await supabase
    .from('flights')
    .select('*')
    .eq('crew_id', profile.id)
    .order('flight_date', { ascending: true });

  const normalizeMonth = (m: string) => m.toLowerCase().slice(0, 3);
  const targetMonthNorm = normalizeMonth(month);

  const monthFlights = (flights || []).filter(f => {
    const d = new Date(f.flight_date);
    const m = d.toLocaleString('en-US', { month: 'short' });
    return normalizeMonth(m) === targetMonthNorm && d.getFullYear().toString() === year;
  });

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
    <CardTemplate data={data} superlative={superlative} />,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 700,
        },
      ],
      headers: download ? {
        'Content-Disposition': `attachment; filename="Recap-${month}-${year}-Card.png"`,
      } : {},
    }
  );
}
