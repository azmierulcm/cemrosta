import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ crewId: string }> }
) {
  await params;

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
          backgroundColor: '#000000',
          padding: '100px',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: '#D4AF37' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', backgroundColor: '#D4AF37' }} />

        <div style={{ color: '#D4AF37', fontSize: '18px', fontWeight: '700', letterSpacing: '8px', marginBottom: '40px', textTransform: 'uppercase' }}>
          Official Retirement
        </div>

        <h2 style={{ fontSize: '120px', fontStyle: 'italic', fontWeight: '100', marginBottom: '20px', lineHeight: '0.8', textAlign: 'center' }}>
          The Final <br /> Sector.
        </h2>

        <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '40px', margin: '60px 0' }}>
           <span style={{ fontSize: '48px', fontWeight: '900' }}>LHR</span>
           <div style={{ flex: 1, height: '2px', backgroundColor: '#D4AF37', opacity: 0.5 }} />
           <span style={{ fontSize: '48px', fontWeight: '900' }}>KUL</span>
        </div>

        <div style={{ fontSize: '24px', color: '#8FA0BC', textAlign: 'center', maxWidth: '700px', lineHeight: '1.6', fontStyle: 'italic' }}>
          &ldquo;A career defined by precision, pride, and the boundless horizon. Thank you for your service to the skies.&rdquo;
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px' }}>MUHAMMAD AZMIERUL</span>
            <span style={{ fontSize: '14px', color: '#D4AF37', fontWeight: '700', marginTop: '5px' }}>SENIOR FIRST OFFICER</span>
        </div>

        <div style={{ position: 'absolute', bottom: '60px', fontSize: '14px', color: '#5C6B85', letterSpacing: '4px' }}>CEMROSTA.COM</div>
      </div>
    ),
    { width: 1080, height: 1920 } // Story format
  );
}
