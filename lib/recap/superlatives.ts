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
  const flightEvents = events.filter(e => e.type === 'FLIGHT');
  
  const candidates: Superlative[] = [];

  // 1. Marathon Runner (Longest Sector > 10h)
  // Note: Needs signOff - signOn or sta - std. 
  // For now we use a heuristic or just pick the one with max distance.
  const longestFlight = flightEvents.reduce((prev, current) => {
    const prevDist = prev.depPort && prev.arrPort ? calculateKilometers(prev.depPort, prev.arrPort) : 0;
    const currDist = current.depPort && current.arrPort ? calculateKilometers(current.depPort, current.arrPort) : 0;
    return currDist > prevDist ? current : prev;
  }, flightEvents[0] || {});

  if (longestFlight.flightNumber) {
    const dist = calculateKilometers(longestFlight.depPort, longestFlight.arrPort);
    candidates.push({
      key: 'marathon',
      label: 'Longest Sector',
      value: `${longestFlight.depPort} → ${longestFlight.arrPort}`,
      subValue: `${Math.round(dist).toLocaleString()} KM · ${longestFlight.flightNumber}`,
      score: dist > 8000 ? 100 : 50 // High score if very long
    });
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
