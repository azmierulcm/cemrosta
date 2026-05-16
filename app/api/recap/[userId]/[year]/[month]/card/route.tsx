import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { CardTemplate } from '@/lib/recap/templates';
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
  const data = {
    month,
    year,
    heroValue: '82',
    heroLabel: 'BLOCK HOURS',
    sectors: '18',
    hours: '82',
    km: '142k',
    handle: '@azmierul.fo'
  };

  const mockEvents = [
    { type: 'FLIGHT', depPort: 'KUL', arrPort: 'LHR', flightNumber: 'MH 4' },
    { type: 'FLIGHT', depPort: 'LHR', arrPort: 'KUL', flightNumber: 'MH 1' },
  ];

  const superlative = getTopSuperlative(mockEvents);

  return new ImageResponse(
    <CardTemplate data={data} superlative={superlative} />,
    {
      width: 1200,
      height: 630,
      headers: download ? {
        'Content-Disposition': `attachment; filename="Recap-${month}-${year}-Card.png"`,
      } : {},
    }
  );
}
