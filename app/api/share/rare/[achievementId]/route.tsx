import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ achievementId: string }> }
) {
  await params;
  
  // Mock achievement detail
  const achievement = {
    name: 'Equator Bound',
    tier: 'rare',
    rarity_pct: 12,
    date: '15 May 2026',
    description: 'Crossed the center line of the earth.'
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
          backgroundColor: '#050B17',
          padding: '100px',
          color: 'white',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Glowing Background Effect */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', backgroundColor: '#D4AF37', opacity: 0.1, filter: 'blur(100px)' }} />

        {/* Badge Icon */}
        <div style={{ 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%', 
          border: '4px solid #D4AF37', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '60px',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          boxShadow: '0 0 50px rgba(212, 175, 55, 0.2)'
        }}>
           <div style={{ fontSize: '80px' }}>🏆</div>
        </div>

        {/* Title */}
        <div style={{ color: '#D4AF37', fontSize: '18px', fontWeight: '900', letterSpacing: '8px', marginBottom: '20px', textTransform: 'uppercase' }}>
          Rare achievement earned
        </div>
        
        <div style={{ fontSize: '72px', fontWeight: '900', marginBottom: '20px', letterSpacing: '-2px' }}>
          {achievement.name}
        </div>

        {/* Description */}
        <div style={{ fontSize: '24px', color: '#8FA0BC', textAlign: 'center', maxWidth: '600px', lineHeight: '1.4', marginBottom: '60px' }}>
          {achievement.description}
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '20px' }}>
           <div style={{ backgroundColor: '#13243F', padding: '15px 30px', borderRadius: '100px', border: '1px solid #2A3B5E', fontSize: '18px', fontWeight: '700' }}>
              Top {achievement.rarity_pct}%
           </div>
           <div style={{ backgroundColor: '#13243F', padding: '15px 30px', borderRadius: '100px', border: '1px solid #2A3B5E', fontSize: '18px', fontWeight: '700' }}>
              {achievement.date}
           </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '80px', fontSize: '14px', color: '#5C6B85', letterSpacing: '4px' }}>
          CEMROSTA.COM
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
