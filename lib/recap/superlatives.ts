import { calculateKilometers } from '../utils/geo/haversine';

export interface Superlative {
  key: 'marathon' | 'frontier' | 'endurance' | 'commuter' | 'workhorse';
  label: string;
  value: string;
  subValue: string;
  score: number; // For ranking
}

import { DutyEvent } from '../types';

/**
 * Computes all possible superlatives for a month and returns the top-ranked one.
 */
export function getTopSuperlative(events: DutyEvent[]): Superlative {
  const flightEvents = events.filter(e => e.type === 'FLIGHT' && e.depPort && e.arrPort);
  
  const candidates: Superlative[] = [];

  if (flightEvents.length > 0) {
    // 1. Marathon Runner (Longest Sector)
    const longestFlight = flightEvents.reduce((prev, current) => {
      const prevDist = calculateKilometers(prev.depPort || '', prev.arrPort || '');
      const currDist = calculateKilometers(current.depPort || '', current.arrPort || '');
      return currDist > prevDist ? current : prev;
    }, flightEvents[0]);

    if (longestFlight && longestFlight.depPort && longestFlight.arrPort) {
      const dist = calculateKilometers(longestFlight.depPort, longestFlight.arrPort);
      candidates.push({
        key: 'marathon',
        label: 'Longest Sector',
        value: `${longestFlight.depPort} → ${longestFlight.arrPort}`,
        subValue: `${Math.round(dist).toLocaleString()} KM · ${longestFlight.flightNumber || 'MH'}`,
        score: dist > 8000 ? 100 : 50
      });
    }
  }

  // 2. New Frontier (Farthest from home - logic placeholder)
  // In a real app we'd check if this is the FIRST time this port appears in history.
  
  // 3. Endurance (Most sectors in a day - logic placeholder)

  // 4. Fallback: The Workhorse (The longest flight anyway)
  // We already have longestFlight.

  // Rank by score desc, then dist desc
  return candidates.sort((a, b) => b.score - a.score)[0] || {
    key: 'workhorse',
    label: 'Mission Operator',
    value: 'Ready for Takeoff',
    subValue: 'Active Duty Complete',
    score: 0
  };
}
