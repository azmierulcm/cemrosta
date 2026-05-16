import React from 'react';

const bg = '#0A0B0F';
const surface = '#14161C';
const accent = '#00D4FF';
const text = '#F4F5F7';
const textMuted = '#9CA0AD';

export interface RecapData {
  month: string;
  year: string;
  heroValue: string | number;
  heroLabel: string;
  sectors: number;
  hours: string;
  km: string;
  handle?: string;
}

export interface Superlative {
  label: string;
  value: string;
  subValue: string;
}

interface TemplateProps {
  data: RecapData;
  superlative: Superlative;
  watermark?: boolean;
}

export const StoriesTemplate = ({ data, superlative, watermark = true }: TemplateProps) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bg,
        backgroundImage: 'radial-gradient(circle at 50% 400px, #1C1F27 0%, transparent 70%)',
        padding: '100px 80px',
        color: text,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ width: '32px', height: '6px', background: accent, opacity: 0.3 }} />
          <div style={{ width: '32px', height: '12px', background: accent, opacity: 0.6 }} />
          <div style={{ width: '32px', height: '24px', background: accent }} />
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}>{data.month} {data.year}</div>
      </div>

      {/* Hero Stat */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '140px' }}>
        <div style={{ fontSize: 240, fontWeight: 900, lineHeight: 1, color: text, marginBottom: '20px' }}>
          {data.heroValue}
        </div>
        <div style={{ fontSize: 48, fontWeight: 800, color: accent, letterSpacing: '0.4em' }}>
          {data.heroLabel}
        </div>
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '40px', padding: '60px 40px', justifyContent: 'space-around', marginBottom: '120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 60, fontWeight: 800, marginBottom: '10px' }}>{data.sectors}</div>
          <div style={{ fontSize: 20, color: textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sectors</div>
        </div>
        <div style={{ width: '1px', height: '80px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 60, fontWeight: 800, marginBottom: '10px' }}>{data.hours}</div>
          <div style={{ fontSize: 20, color: textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hours</div>
        </div>
        <div style={{ width: '1px', height: '80px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 60, fontWeight: 800, marginBottom: '10px' }}>{data.km}</div>
          <div style={{ fontSize: 20, color: textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>KM</div>
        </div>
      </div>

      {/* Signature Flight */}
      <div style={{ display: 'flex', flexDirection: 'column', background: surface, border: '1px solid #262A35', borderRadius: '40px', padding: '60px', marginTop: 'auto' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: accent, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          {superlative.label}
        </div>
        <div style={{ fontSize: 56, fontWeight: 900, marginBottom: '15px' }}>{superlative.value}</div>
        <div style={{ fontSize: 32, color: textMuted, fontWeight: 600 }}>{superlative.subValue}</div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '80px' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: text }}>{data.handle || '@crew'}</div>
        {watermark && <div style={{ fontSize: 28, fontWeight: 700, color: '#5E6473' }}>cemrosta.com</div>}
      </div>
    </div>
  );
};

export const CardTemplate = ({ data, superlative, watermark = true }: TemplateProps) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        backgroundColor: bg,
        color: text,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: '60px', justifyContent: 'space-between', borderRight: '1px solid #262A35' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '20px', height: '4px', background: accent, opacity: 0.3 }} />
            <div style={{ width: '20px', height: '8px', background: accent, opacity: 0.6 }} />
            <div style={{ width: '20px', height: '16px', background: accent }} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{data.month} {data.year}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, marginBottom: '10px' }}>{data.heroValue}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: accent, letterSpacing: '0.4em' }}>{data.heroLabel}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{data.handle || '@crew'}</div>
          {watermark && <div style={{ fontSize: 18, fontWeight: 700, color: '#5E6473' }}>cemrosta.com</div>}
        </div>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: '60px', backgroundColor: '#14161C' }}>
        {/* Secondary Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 800, marginBottom: '5px' }}>{data.sectors}</div>
            <div style={{ fontSize: 14, color: textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sectors</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 800, marginBottom: '5px' }}>{data.km}</div>
            <div style={{ fontSize: 14, color: textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>KM Flown</div>
          </div>
        </div>

        {/* Signature Flight */}
        <div style={{ display: 'flex', flexDirection: 'column', background: bg, border: '1px solid #262A35', borderRadius: '30px', padding: '40px', marginTop: 'auto' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: accent, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            {superlative.label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, marginBottom: '10px' }}>{superlative.value}</div>
          <div style={{ fontSize: 18, color: textMuted, fontWeight: 600 }}>{superlative.subValue}</div>
        </div>
      </div>
    </div>
  );
};
