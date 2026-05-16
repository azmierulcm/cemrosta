import { Destination, DutyEvent } from '@/lib/types';

const IATA_MAP: Record<string, { city: string, country: string, color: string, shape: 'oval' | 'hexagon' | 'rectangle' }> = {
  'LHR': { city: 'London', country: 'United Kingdom', color: 'border-gray-500 text-gray-600', shape: 'oval' },
  'KUL': { city: 'Kuala Lumpur', country: 'Malaysia', color: 'border-accent text-accent', shape: 'rectangle' },
  'CAN': { city: 'Guangzhou', country: 'China', color: 'border-red-500 text-red-600', shape: 'hexagon' },
  'NRT': { city: 'Tokyo', country: 'Japan', color: 'border-pink-400 text-pink-500', shape: 'oval' },
  'SYD': { city: 'Sydney', country: 'Australia', color: 'border-emerald-500 text-emerald-600', shape: 'rectangle' },
  'IST': { city: 'Istanbul', country: 'Turkey', color: 'border-orange-500 text-orange-600', shape: 'hexagon' },
};

const SHAPES = ['oval', 'hexagon', 'rectangle'] as const;

export function extractDestinations(events: DutyEvent[]): Destination[] {
  const destMap = new Map<string, Destination>();

  events.forEach(event => {
    if (event.type === 'FLIGHT' && event.arrPort) {
      const iata = event.arrPort.toUpperCase();
      const meta = IATA_MAP[iata] || { 
        city: iata, 
        country: 'Global', 
        color: 'border-gray-400 text-gray-500',
        shape: SHAPES[iata.charCodeAt(0) % SHAPES.length]
      };

      const existing = destMap.get(iata);
      if (existing) {
        existing.count += 1;
        existing.visits += 1;
        if (new Date(event.date) > new Date(existing.lastVisited)) {
          existing.lastVisited = event.date;
        }
      } else {
        destMap.set(iata, {
          iata,
          name: meta.city,
          city: meta.city,
          country: meta.country,
          region: 'Asia', // Placeholder
          count: 1,
          visits: 1,
          lastVisited: event.date,
          colorTheme: meta.color,
          shape: meta.shape,
          unlocked: true
        });
      }
    }
  });

  return Array.from(destMap.values());
}
