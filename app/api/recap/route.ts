import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, month, year } = await req.json();

    if (!userId || !month || !year) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cemrosta.vercel.app';
    
    const storiesUrl = `${baseUrl}/api/recap/${userId}/${year}/${month}/stories`;
    const cardUrl = `${baseUrl}/api/recap/${userId}/${year}/${month}/card`;

    return NextResponse.json({
      storiesUrl,
      cardUrl,
      downloadStoriesUrl: `${storiesUrl}?download=1`,
      downloadCardUrl: `${cardUrl}?download=1`
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate recap links' }, { status: 500 });
  }
}
