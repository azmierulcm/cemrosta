export type CrewRank = 
  | 'Captain' | 'First Officer' | 'Second Officer' | 'Cadet'
  | 'Inflight Supervisor' | 'Senior Cabin Crew' | 'Cabin Crew';

export type PrivacyMode = 'public' | 'crew' | 'family' | 'anonymous';

export interface CrewProfile {
  id: string;
  user_id: string;
  display_name: string;
  rank: CrewRank;
  base_iata: string;
  airline_code: string;
  aircraft_types: string[];
  handle: string;
  avatar_url: string | null;
  hire_date: string | null;
  birthday: string | null;
  privacy_mode: PrivacyMode;
  created_at: string;
}

export interface Flight {
  id: string;
  crew_id: string;
  flight_date: string;
  flight_number: string;
  origin_iata: string;
  destination_iata: string;
  std_utc: string;
  sta_utc: string;
  block_minutes: number;
  flight_minutes: number;
  distance_km: number;
  aircraft_type: string;
  duty_type: 'flight' | 'standby' | 'sim' | 'training' | 'leave' | 'off';
  position: 'P1' | 'P2' | 'SO' | 'CC' | null;
  is_pic: boolean;
  is_night: boolean;
  crosses_equator: boolean;
  crosses_polar: boolean;
  crosses_arctic_circle: boolean;
  crosses_antarctic_circle: boolean;
  crosses_idl: boolean;
  witnessed_sunrise: boolean;
  witnessed_sunset: boolean;
}

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  country_code: string;
  continent: 'AS' | 'EU' | 'NA' | 'SA' | 'AF' | 'OC' | 'AN';
  lat: number;
  lng: number;
  elevation_ft: number;
  is_hot_and_high: boolean;
  is_below_sea_level: boolean;
  is_polar: boolean;
  rarity_tier: 1 | 2 | 3 | 4 | 5;
}

export interface Achievement {
  id: string;
  crew_id: string;
  key: string;
  earned_at: string;
  flight_id: string | null;
  metadata: Record<string, string | number | boolean | null>;
}

export interface CrewStats {
  crew_id: string;
  total_km: number;
  total_sectors: number;
  total_block_minutes: number;
  total_flight_minutes: number;
  unique_destinations: number;
  unique_countries: number;
  unique_continents: number;
  unique_aircraft_types: number;
  unique_crew_flown_with: number;
  sunrises_witnessed: number;
  sunsets_witnessed: number;
  polar_crossings: number;
  equator_crossings: number;
  idl_crossings: number;
  ytd_km: number;
  ytd_sectors: number;
  ytd_block_minutes: number;
  ytd_unique_destinations: number;
  ytd_unique_new_destinations: number;
  ytd_sunrises: number;
  top_route_pair: string | null;
  top_route_count: number;
  longest_sector_id: string | null;
  updated_at: string;
}
