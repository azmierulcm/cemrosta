import { CrewStats, Flight, CrewProfile } from '@/lib/types/passport';

export type AchievementTier = 
  | 'common' | 'uncommon' | 'rare' | 'epic' 
  | 'legendary' | 'mythic' | 'easter-egg';

export type AchievementCategory = 
  | 'distance' | 'geography' | 'time' | 'career' 
  | 'sentimental' | 'crew' | 'easter-egg';

export interface AchievementDefinition {
  key: string;
  name: string;
  tier: AchievementTier;
  category: AchievementCategory;
  description: string;
  icon_key: string;
  rarity_pct?: number;
  unlock: (stats: CrewStats, flight?: Flight, profile?: CrewProfile) => boolean | { earned: true; metadata: Record<string, string | number | boolean | null> };
}

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  // COMMON
  {
    key: 'first-flight',
    name: 'First mission',
    tier: 'common',
    category: 'career',
    description: 'Your first sector logged on Cemrosta.',
    icon_key: 'plane',
    unlock: (stats) => stats.total_sectors >= 1
  },
  {
    key: 'hundred-sectors',
    name: 'Centurion',
    tier: 'common',
    category: 'career',
    description: 'Logged 100 mission sectors.',
    icon_key: 'layers',
    unlock: (stats) => stats.total_sectors >= 100
  },
  {
    key: 'first-international',
    name: 'Global entry',
    tier: 'common',
    category: 'geography',
    description: 'First flight crossing international borders.',
    icon_key: 'globe',
    unlock: (stats) => stats.unique_countries >= 2
  },

  // UNCOMMON
  {
    key: 'first-europe',
    name: 'European tour',
    tier: 'uncommon',
    category: 'geography',
    description: 'First mission to the European continent.',
    icon_key: 'map-pin',
    unlock: (stats, flight) => !!flight && flight.destination_iata === 'LHR' // Simplified for demo
  },

  // RARE
  {
    key: 'equator-bound',
    name: 'Equator bound',
    tier: 'rare',
    category: 'geography',
    description: 'Crossed the center line of the earth.',
    icon_key: 'anchor',
    rarity_pct: 12,
    unlock: (stats, flight) => !!flight && flight.crosses_equator
  },
  {
    key: 'around-the-world',
    name: 'Around the world',
    tier: 'rare',
    category: 'distance',
    description: 'Total distance exceeded the circumference of the earth (40,075 KM).',
    icon_key: 'refresh-cw',
    rarity_pct: 8,
    unlock: (stats) => stats.total_km >= 40075
  },

  // EPIC
  {
    key: 'moon-shot',
    name: 'Moon shot',
    tier: 'epic',
    category: 'distance',
    description: 'Total distance exceeded the earth-moon distance (384,400 KM).',
    icon_key: 'moon',
    rarity_pct: 2,
    unlock: (stats) => stats.total_km >= 384400
  },
  {
    key: 'two-sunrises',
    name: 'Double dawn',
    tier: 'epic',
    category: 'sentimental',
    description: 'Witnessed two sunrises in a single mission sector.',
    icon_key: 'sunrise',
    rarity_pct: 1,
    unlock: (_, flight) => !!flight && !!flight.witnessed_sunrise && false // Would need complex logic
  },

  // LEGENDARY
  {
    key: 'type-master',
    name: 'Type master',
    tier: 'legendary',
    category: 'career',
    description: 'Accumulated 5,000 block hours on a single aircraft type.',
    icon_key: 'star',
    rarity_pct: 0.5,
    unlock: () => false // Needs per-type stats
  }
];
