/**
 * PATCH EARNING RULES
 * 
 * 1. UNLOCKING (The Patch):
 *    - A patch is unlocked on the FIRST LANDING (arrPort) at any airport.
 *    - Includes active duty, deadheads (positioning), and diversions.
 *    - Technical stops unlock the patch but don't count as visits.
 * 
 * 2. VISIT COUNTING:
 *    - Outstations: Increments by 1 for every distinct OVERNIGHT stay.
 *    - Overnight = Sign-off on Day N, Sign-on on Day N+1 or later.
 *    - Turnarounds (KUL-SIN-KUL): 0 visits for outstation (SIN).
 *    - Home Base (KUL): Increments by 1 for every return to base (final arrPort of a duty).
 * 
 * 3. RARITY TIERS:
 *    - Bronze: 1 visit (The Explorer)
 *    - Silver: 5+ visits (The Regular)
 *    - Gold: 25+ visits (The Veteran)
 *    - Platinum: 100+ visits (The Legend)
 */

export type Region = 'Southeast Asia' | 'East Asia' | 'South Asia' | 'Oceania' | 'Middle East' | 'Europe' | 'Americas';

export interface RegionColorBand {
  bg: string;     // 50
  border: string; // 200
  accent: string; // 600
  text: string;   // 900
}

export const REGION_TAXONOMY: Record<Region, RegionColorBand> = {
  'Southeast Asia': {
    bg: '#FFFBEB',    // Amber 50
    border: '#FDE68A', // Amber 200
    accent: '#D97706', // Amber 600
    text: '#78350F',   // Amber 900
  },
  'East Asia': {
    bg: '#FFF1F2',    // Coral/Rose 50
    border: '#FECDD3', // Coral/Rose 200
    accent: '#E11D48', // Coral/Rose 600
    text: '#881337',   // Coral/Rose 900
  },
  'South Asia': {
    bg: '#FDF2F8',    // Pink 50
    border: '#FBCFE8', // Pink 200
    accent: '#DB2777', // Pink 600
    text: '#831843',   // Pink 900
  },
  'Oceania': {
    bg: '#F0FDFA',    // Teal 50
    border: '#CCFBF1', // Teal 200
    accent: '#0D9488', // Teal 600
    text: '#134E4A',   // Teal 900
  },
  'Middle East': {
    bg: '#FDF4FF',    // Magenta/Fuchsia 50
    border: '#FAE8FF', // Magenta/Fuchsia 200
    accent: '#C026D3', // Magenta/Fuchsia 600
    text: '#701A75',   // Magenta/Fuchsia 900
  },
  'Europe': {
    bg: '#EEF2FF',    // Indigo 50
    border: '#C7D2FE', // Indigo 200
    accent: '#4F46E5', // Indigo 600
    text: '#312E81',   // Indigo 900
  },
  'Americas': {
    bg: '#EFF6FF',    // Blue 50
    border: '#BFDBFE', // Blue 200
    accent: '#2563EB', // Blue 600
    text: '#1E3A8A',   // Blue 900
  },
};

export type RarityTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export function getRarityTier(visits: number): RarityTier {
  if (visits >= 100) return 'Platinum';
  if (visits >= 25) return 'Gold';
  if (visits >= 5) return 'Silver';
  return 'Bronze';
}

export const RARITY_COLORS: Record<RarityTier, string> = {
  Bronze: '#A8A29E',   // Warm gray/Stone
  Silver: '#94A3B8',   // Cool gray/Slate
  Gold: '#EAB308',     // Yellow
  Platinum: '#93C5FD', // Light blue/white metallic
};

import { DutyEvent } from '../types';

/**
 * Logic to calculate visits from a list of duty events
 */
export function calculateVisits(iata: string, events: DutyEvent[]): number {
  if (iata === 'KUL') {
    // Count every time KUL is the final arrPort of a day or duty period
    return events.filter(e => e.type === 'FLIGHT' && e.arrPort === 'KUL').length;
  }

  let visits = 0;
  // Simplified logic: count distinct sign-offs at this port that lead to a next-day sign-on
  // (In a real app, we'd use signOff/signOn times for higher precision)
  const portEvents = events.filter(e => e.arrPort === iata || e.depPort === iata);
  
  // Sort events by date
  const sorted = [...portEvents].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.arrPort === iata && next && next.depPort === iata) {
      if (current.date !== next.date) {
        visits++; // Distinct calendar day overnight
      }
    }
  }

  return visits;
}
