import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ crewId: string; year: string; month: string }> }
) {
  const { year, month } = await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'story';

  const dimensions = {
    story: { width: 1080, height: 1920 },
    feed: { width: 1080, height: 1350 },
    wide: { width: 1200, height: 675 },
  }[format as 'story' | 'feed' | 'wide'] || { width: 1080, height: 1920 };

  // Mock monthly data
  const stats = {
    month_name: month,
    total_km: 12400,
    total_sectors: 14,
    top_dest: 'LHR',
    longest_flight: '13h 40m',
    new_cities: 2
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          backgroundColor: '#0A1628',
          padding: '80px',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Background Detail */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
           <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '1px', backgroundColor: '#D4AF37' }} />
           <div style={{ position: 'absolute', top: '90%', left: '10%', width: '80%', height: '1px', backgroundColor: '#D4AF37' }} />
        </div>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '40px' }}>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#D4AF37', letterSpacing: '4px' }}>CEMROSTA</span>
          <span style={{ fontSize: '24px', fontWeight: '500', color: '#B8A878', letterSpacing: '2px' }}>{month.toUpperCase()} {year}</span>
        </div>

        {/* Title */}
        <div style={{ color: '#D4AF37', fontSize: '18px', fontWeight: '900', letterSpacing: '10px', marginBottom: '40px', textTransform: 'uppercase' }}>
          Monthly Mission Recap
        </div>

        {/* Hero Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
            <div style={{ fontSize: '120px', fontWeight: '500', lineHeight: 1 }}>{stats.total_km.toLocaleString()}</div>
            <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '6px', color: '#8FA0BC', textTransform: 'uppercase' }}>
              Kilometres
            </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', gap: '40px', justifyContent: 'center', marginBottom: '80px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', padding: '30px', backgroundColor: '#13243F', borderRadius: '32px', border: '1px solid #2A3B5E' }}>
              <span style={{ fontSize: '36px', fontWeight: '500' }}>{stats.total_sectors}</span>
              <span style={{ fontSize: '12px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>Sectors</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', padding: '30px', backgroundColor: '#13243F', borderRadius: '32px', border: '1px solid #2A3B5E' }}>
              <span style={{ fontSize: '36px', fontWeight: '500' }}>{stats.top_dest}</span>
              <span style={{ fontSize: '12px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>Top Hub</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', padding: '30px', backgroundColor: '#13243F', borderRadius: '32px', border: '1px solid #2A3B5E' }}>
              <span style={{ fontSize: '32px', fontWeight: '500' }}>{stats.longest_flight}</span>
              <span style={{ fontSize: '12px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>Longest Mission</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%', padding: '30px', backgroundColor: '#13243F', borderRadius: '32px', border: '1px solid #2A3B5E' }}>
              <span style={{ fontSize: '36px', fontWeight: '500' }}>{stats.new_cities}</span>
              <span style={{ fontSize: '12px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>New Stamps</span>
           </div>
        </div>

        {/* Crew Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
            <div style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '2px', marginBottom: '5px' }}>Muhammad Azmierul</div>
            <div style={{ fontSize: '14px', color: '#8FA0BC' }}>Verified First Officer · MA-ID: 2112524</div>
        </div>

        <div style={{ marginTop: '40px', fontSize: '12px', color: '#5C6B85', letterSpacing: '4px' }}>CEMROSTA.COM</div>
      </div>
    ),
    dimensions
  );
}
