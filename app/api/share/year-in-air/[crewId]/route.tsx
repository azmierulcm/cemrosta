import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Font loading logic would go here in a full implementation
// For now, using system fonts available to Satori

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ crewId: string }> }
) {
  await params;
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'story';
  
  // Dimensions based on format
  const dimensions = {
    story: { width: 1080, height: 1920 },
    feed: { width: 1080, height: 1350 },
    wide: { width: 1200, height: 675 },
  }[format as 'story' | 'feed' | 'wide'] || { width: 1080, height: 1920 };

  // Mock data for initial render test
  const stats = {
    ytd_km: 142500,
    total_sectors: 89,
    block_hrs: 932,
    new_cities: 12
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
        {/* Background Aurora Wash */}
        <div style={{ position: 'absolute', top: -200, left: 0, right: 0, height: 600, display: 'flex', opacity: 0.2 }}>
           <div style={{ width: '50%', height: '100%', backgroundColor: '#4B3F7A', filter: 'blur(100px)' }} />
           <div style={{ width: '50%', height: '100%', backgroundColor: '#2A6B7B', filter: 'blur(100px)' }} />
        </div>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '40px' }}>
          <span style={{ fontSize: '32px', fontWeight: '900', color: '#D4AF37', letterSpacing: '4px' }}>CEMROSTA</span>
          <span style={{ fontSize: '24px', fontWeight: '500', color: '#B8A878', letterSpacing: '2px' }}>Passport · 2026</span>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', backgroundColor: '#2A3B5E', marginBottom: '60px' }} />

        {/* Pretitle */}
        <div style={{ color: '#D4AF37', fontSize: '18px', fontWeight: '900', letterSpacing: '10px', marginBottom: '40px', textTransform: 'uppercase' }}>
          Year in the air
        </div>

        {/* Hero Number */}
        <div style={{ fontSize: '160px', fontWeight: '500', marginBottom: '10px', letterSpacing: '-4px' }}>
          {stats.ytd_km.toLocaleString()}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '6px', color: '#8FA0BC', textTransform: 'uppercase', marginBottom: '20px' }}>
          Kilometres flown
        </div>

        {/* Equivalence */}
        <div style={{ fontSize: '32px', fontStyle: 'italic', color: '#B8A878', marginBottom: '80px' }}>
          ≈ 3.5 times around the earth
        </div>

        {/* Constellation Map Placeholder */}
        <div style={{ display: 'flex', width: '500px', height: '300px', position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: '80px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#D4AF37', boxShadow: '0 0 0 10px rgba(212, 175, 55, 0.1)' }} />
            {/* Dest Dots */}
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{ 
                position: 'absolute', 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#D4AF37',
                transform: `rotate(${i * 51}deg) translateY(-120px)`
              }} />
            ))}
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '0 40px', marginBottom: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
               <span style={{ fontSize: '48px', fontWeight: '500' }}>{stats.total_sectors}</span>
               <span style={{ fontSize: '14px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>Sectors</span>
               <span style={{ fontSize: '12px', color: '#5C6B85', marginTop: '5px' }}>{stats.block_hrs} block hrs</span>
            </div>
            <div style={{ width: '1px', height: '80px', backgroundColor: '#2A3B5E' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
               <span style={{ fontSize: '48px', fontWeight: '500' }}>{stats.new_cities}</span>
               <span style={{ fontSize: '14px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>New Cities</span>
               <span style={{ fontSize: '12px', color: '#5C6B85', marginTop: '5px' }}>Unlocked</span>
            </div>
            <div style={{ width: '1px', height: '80px', backgroundColor: '#2A3B5E' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
               <span style={{ fontSize: '48px', fontWeight: '500' }}>45</span>
               <span style={{ fontSize: '14px', color: '#8FA0BC', letterSpacing: '2px', textTransform: 'uppercase' }}>Sunrises</span>
               <span style={{ fontSize: '12px', color: '#5C6B85', marginTop: '5px' }}>From FL370</span>
            </div>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', fontSize: '24px', fontWeight: '900' }}>
              AR
            </div>
            <div style={{ fontSize: '20px', fontWeight: '500', letterSpacing: '2px', marginBottom: '5px' }}>Capt. Aishah Rahman</div>
            <div style={{ fontSize: '14px', color: '#8FA0BC' }}>A350 Fleet · @aishah.captain</div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', fontSize: '12px', color: '#5C6B85', letterSpacing: '4px' }}>CEMROSTA.COM</div>
      </div>
    ),
    dimensions
  );
}
