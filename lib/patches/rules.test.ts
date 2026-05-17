import { describe, it, expect } from 'vitest';
import { calculateVisits, getRarityTier } from './rules';
import { DutyEvent } from '../types';

describe('Patch Earning Rules', () => {
  const mockEvents: DutyEvent[] = [
    { id: '1', date: '2025-11-01', type: 'FLIGHT', depPort: 'KUL', arrPort: 'LHR' },
    { id: '2', date: '2025-11-03', type: 'FLIGHT', depPort: 'LHR', arrPort: 'KUL' },
    { id: '3', date: '2025-11-05', type: 'FLIGHT', depPort: 'KUL', arrPort: 'SIN' },
    { id: '4', date: '2025-11-05', type: 'FLIGHT', depPort: 'SIN', arrPort: 'KUL' }, // Turnaround
    { id: '5', date: '2025-11-07', type: 'FLIGHT', depPort: 'KUL', arrPort: 'SYD' },
    { id: '6', date: '2025-11-10', type: 'FLIGHT', depPort: 'SYD', arrPort: 'MEL' }, // Multi-leg outstation
    { id: '7', date: '2025-11-12', type: 'FLIGHT', depPort: 'MEL', arrPort: 'KUL' },
  ];


  it('calculates outstation visits based on distinct overnights', () => {
    // LHR: Landed 1st, Departed 3rd = 1 visit (overnight)
    expect(calculateVisits('LHR', mockEvents)).toBe(1);
    
    // SIN: Landed 5th, Departed 5th = 0 visits (turnaround)
    expect(calculateVisits('SIN', mockEvents)).toBe(0);
    
    // SYD: Landed 7th, Departed 10th = 1 visit
    expect(calculateVisits('SYD', mockEvents)).toBe(1);
  });

  it('calculates home base visits based on every return to base', () => {
    // KUL: Final arrPort on 3rd, 5th, 12th
    expect(calculateVisits('KUL', mockEvents)).toBe(3);
  });

  it('assigns correct rarity tiers based on visit count', () => {
    expect(getRarityTier(1)).toBe('Bronze');
    expect(getRarityTier(5)).toBe('Silver');
    expect(getRarityTier(25)).toBe('Gold');
    expect(getRarityTier(100)).toBe('Platinum');
  });
});
