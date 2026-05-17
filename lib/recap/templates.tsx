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
        backgroundColor: '#0A0B0F',
        padding: '100px 80px',
        color: '#F4F5F7',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Background Glow Simulator - Use simple rectangle */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '800px', backgroundColor: '#1C1F27', opacity: 0.5 }} />

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '120px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ width: '32px', height: '6px', background: '#00D4FF', opacity: 0.3 }} />
          <div style={{ width: '32px', height: '12px', background: '#00D4FF', opacity: 0.6 }} />
          <div style={{ width: '32px', height: '24px', background: '#00D4FF' }} />
        </div>
        <div style={{ fontSize: '36px', fontWeight: 700 }}>{data.month} {data.year}</div>
      </div>

      {/* Hero Stat */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '140px', width: '100%' }}>
        <div style={{ fontSize: '240px', fontWeight: 900, color: '#F4F5F7' }}>
          {data.heroValue}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 800, color: '#00D4FF', letterSpacing: '20px' }}>
          {data.heroLabel}
        </div>
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: '#1E2028', border: '1px solid #262A35', borderRadius: '40px', padding: '60px 40px', justifyContent: 'space-around', marginBottom: '120px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '60px', fontWeight: 800, marginBottom: '10px' }}>{data.sectors}</div>
          <div style={{ fontSize: '20px', color: '#9CA0AD', fontWeight: 700, textTransform: 'uppercase' }}>Sectors</div>
        </div>
        <div style={{ width: '2px', height: '80px', backgroundColor: '#262A35' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '60px', fontWeight: 800, marginBottom: '10px' }}>{data.hours}</div>
          <div style={{ fontSize: '20px', color: '#9CA0AD', fontWeight: 700, textTransform: 'uppercase' }}>Hours</div>
        </div>
        <div style={{ width: '2px', height: '80px', backgroundColor: '#262A35' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '60px', fontWeight: 800, marginBottom: '10px' }}>{data.km}</div>
          <div style={{ fontSize: '20px', color: '#9CA0AD', fontWeight: 700, textTransform: 'uppercase' }}>KM</div>
        </div>
      </div>

      {/* Signature Flight */}
      <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#14161C', border: '1px solid #262A35', borderRadius: '40px', padding: '60px', marginTop: 'auto', width: '100%' }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#00D4FF', marginBottom: '30px', textTransform: 'uppercase' }}>
          {superlative.label}
        </div>
        <div style={{ fontSize: '56px', fontWeight: 900, marginBottom: '15px' }}>{superlative.value}</div>
        <div style={{ fontSize: '32px', color: '#9CA0AD', fontWeight: 600 }}>{superlative.subValue}</div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '80px', width: '100%' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#F4F5F7' }}>{data.handle || '@crew'}</div>
        {watermark && <div style={{ fontSize: '28px', fontWeight: 700, color: '#5E6473' }}>cemrosta.com</div>}
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
        flexDirection: 'row',
        backgroundColor: '#0A0B0F',
        color: '#F4F5F7',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: '60px', justifyContent: 'space-between', borderRight: '1px solid #262A35' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ width: '20px', height: '4px', background: '#00D4FF' }} />
            <div style={{ width: '20px', height: '8px', background: '#00D4FF' }} />
            <div style={{ width: '20px', height: '16px', background: '#00D4FF' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{data.month} {data.year}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '120px', fontWeight: 900, lineHeight: 1, marginBottom: '10px' }}>{data.heroValue}</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#00D4FF', letterSpacing: '10px' }}>{data.heroLabel}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>{data.handle || '@crew'}</div>
          {watermark && <div style={{ fontSize: '18px', fontWeight: 700, color: '#5E6473' }}>cemrosta.com</div>}
        </div>
      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%', padding: '60px', backgroundColor: '#14161C' }}>
        {/* Secondary Stats */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '5px' }}>{data.sectors}</div>
            <div style={{ fontSize: '14px', color: '#9CA0AD', fontWeight: 700, textTransform: 'uppercase' }}>Sectors</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '40px', fontWeight: 800, marginBottom: '5px' }}>{data.km}</div>
            <div style={{ fontSize: '14px', color: '#9CA0AD', fontWeight: 700, textTransform: 'uppercase' }}>KM Flown</div>
          </div>
        </div>

        {/* Signature Flight */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#0A0B0F', border: '1px solid #262A35', borderRadius: '30px', padding: '40px', marginTop: 'auto' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#00D4FF', marginBottom: '15px', textTransform: 'uppercase' }}>
            {superlative.label}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '10px' }}>{superlative.value}</div>
          <div style={{ fontSize: '18px', color: '#9CA0AD', fontWeight: 600 }}>{superlative.subValue}</div>
        </div>
      </div>
    </div>
  );
};
