import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ crewId: string }> }
) {
  await params;

  // Mock data for OG generation
  const data = {
    name: 'Muhammad Azmierul',
    rank: 'First Officer',
    airline: 'MH',
    hours: 8420,
    countries: 42,
    fleet: ['A350', 'A330']
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
          justifyContent: 'center',
          backgroundColor: '#0A1628',
          padding: '60px',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
          border: '12px solid #D4AF37',
        }}
      >
        {/* Card Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', fontSize: '64px', fontWeight: '900', backgroundColor: '#13243F' }}>
              MA
            </div>
            <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '10px', letterSpacing: '-2px' }}>{data.name}</h2>
            <p style={{ fontSize: '20px', fontWeight: '900', color: '#D4AF37', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '40px' }}>{data.rank}</p>
        </div>

        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(19, 36, 63, 0.5)', padding: '20px 40px', borderRadius: '24px', border: '1px solid #2A3B5E' }}>
                <span style={{ fontSize: '12px', color: '#8FA0BC', textTransform: 'uppercase', fontWeight: '700', marginBottom: '5px' }}>Total Hours</span>
                <span style={{ fontSize: '32px', fontWeight: '900' }}>{data.hours}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(19, 36, 63, 0.5)', padding: '20px 40px', borderRadius: '24px', border: '1px solid #2A3B5E' }}>
                <span style={{ fontSize: '12px', color: '#8FA0BC', textTransform: 'uppercase', fontWeight: '700', marginBottom: '5px' }}>Countries</span>
                <span style={{ fontSize: '32px', fontWeight: '900' }}>{data.countries}</span>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
            {data.fleet.map(f => (
                <div key={f} style={{ backgroundColor: '#D4AF37', color: '#0A1628', padding: '5px 15px', borderRadius: '100px', fontSize: '12px', fontWeight: '900' }}>{f}</div>
            ))}
        </div>

        <div style={{ position: 'absolute', bottom: '40px', fontSize: '14px', color: '#5C6B85', letterSpacing: '4px' }}>CEMROSTA.COM</div>
      </div>
    ),
    { width: 1080, height: 1350 } // Feed format
  );
}
