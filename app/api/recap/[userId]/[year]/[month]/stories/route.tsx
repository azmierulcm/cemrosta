import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { StoriesTemplate } from '@/lib/recap/templates';
import { getTopSuperlative } from '@/lib/recap/superlatives';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; year: string; month: string }> }
) {
  const { year, month } = await params;
  const { searchParams } = new URL(req.url);
  const download = searchParams.get('download') === '1';

  // In a real app: fetch from Supabase
  // For Phase 5, we'll use slightly randomized "impressive" data for the user
  const data = {
    month,
    year,
    heroValue: '82',
    heroLabel: 'BLOCK HOURS',
    sectors: 18,
    hours: '82',
    km: '142k',
    handle: '@azmierul.fo'
  };

  const mockEvents = [
    { id: '1', type: 'FLIGHT' as const, date: '2026-05-01', depPort: 'KUL', arrPort: 'LHR', flightNumber: 'MH 4' },
    { id: '2', type: 'FLIGHT' as const, date: '2026-05-15', depPort: 'LHR', arrPort: 'KUL', flightNumber: 'MH 1' },
  ];

  const superlative = getTopSuperlative(mockEvents);

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
}
