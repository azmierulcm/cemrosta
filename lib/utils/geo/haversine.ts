import { DutyEvent } from '../../types';

// IATA coordinates database for distance calculations (Lat, Lon)
const IATA_COORDS: Record<string, [number, number]> = {
  'KUL': [2.7456, 101.7099],
  'LHR': [51.4700, -0.4543],
  'CAN': [23.3924, 113.2988],
  'NRT': [35.7720, 140.3929],
  'SYD': [-33.9461, 151.1772],
  'IST': [41.2753, 28.7519],
  'SIN': [1.3644, 103.9915],
  'CDG': [49.0097, 2.5479],
  'DXB': [25.2532, 55.3657],
};

export function calculateKilometers(depIata: string, arrIata: string): number {
  const dep = IATA_COORDS[depIata.toUpperCase()];
  const arr = IATA_COORDS[arrIata.toUpperCase()];

  if (!dep || !arr) return 0;

  const [lat1, lon1] = dep;
  const [lat2, lon2] = arr;

  const R = 6371; // Radius of Earth in Kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function calculateBlockMinutes(std: string, sta: string): number {
  if (!std || !sta || std.includes('-') || sta.includes('-')) return 0;
  try {
    const [h1, m1] = std.split(':').map(Number);
    const [h2, m2] = sta.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
    
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 1440; // Midnight crossing
    return diff;
  } catch {
    return 0;
  }
}

export function formatBlockHours(events: DutyEvent[]): string {
  let totalMinutes = 0;
  events.forEach(e => {
    if (e.type === 'FLIGHT' && e.std && e.sta) {
        if (e.std.includes('-') || e.sta.includes('-')) return;
        try {
          const [h1, m1] = e.std.split(':').map(Number);
          const [h2, m2] = e.sta.split(':').map(Number);
          if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return;
          
          let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (diff < 0) diff += 1440; // Midnight crossing
          totalMinutes += diff;
        } catch { /* ignore */ }
    }
  });

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}
