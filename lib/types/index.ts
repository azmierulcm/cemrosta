export type DutyType = 'FLIGHT' | 'STANDBY' | 'LAYOVER' | 'OFF' | 'OTHER';

export interface DutyEvent {
  id: string;
  type: DutyType;
  date: string; // ISO format YYYY-MM-DD
  flightNumber?: string;
  depPort?: string;
  arrPort?: string;
  std?: string; // ISO format or time string
  sta?: string; // ISO format or time string
  signOn?: string;
  signOff?: string;
  duration?: string;
  hotel?: string;
  description?: string;
}

export interface Destination {
  city: string;
  country: string;
  iata: string;
  count: number;
  lastVisited: string;
  colorTheme: string;
  shape: 'oval' | 'hexagon' | 'rectangle';
}

export interface RosterStats {
  totalSectors: number;
  totalMiles: number;
  totalBlockTime: string;
  uniqueDestinations: number;
}

export interface ProfileData {
  name: string;
  role: string;
  homeBase: string;
  aircraftType: string;
  lifetimeStats: {
    sectors: number;
    blockMinutes: number;
    kilometers: number;
    citiesCollected: number;
    totalAvailableCities: number;
  };
  monthlyRecap: {
    month: string;
    year: string;
    sectors: number;
    blockMinutes: number;
    newCity: string | null;
  };
  destinations: {
    iata: string;
    name: string;
    country: string;
    region: string;
    visits: number;
    unlocked: boolean;
    isNew?: boolean;
    isHome?: boolean;
  }[];
}

export interface RosterData {
  events: DutyEvent[];
  month: string;
  year: string;
  crewName?: string;
  destinations?: Destination[];
  stats?: RosterStats;
}
