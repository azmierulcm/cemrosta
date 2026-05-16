export const SAMPLE_PROFILE = {
  id: 'sample-azmierul',
  name: 'Muhammad Azmierul',
  role: 'Senior First Officer',
  homeBase: 'KUL',
  aircraftType: 'Airbus A350',
  lifetimeStats: {
    sectors: 847,
    blockMinutes: 128400, // 2140 hours
    kilometers: 1200000, // 1.2M
    citiesCollected: 12,
    totalAvailableCities: 62
  },
  monthlyRecap: {
    month: 'November',
    year: '2025',
    sectors: 18,
    blockMinutes: 5040, // 84 hours
    newCity: 'LHR'
  },
  destinations: [
    { iata: 'KUL', name: 'Kuala Lumpur', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia', visits: 420, count: 420, lastVisited: '2025-11-20', colorTheme: 'border-blue-600', shape: 'oval' as const, isHome: true, unlocked: true },
    { iata: 'LHR', name: 'London', city: 'London', country: 'United Kingdom', region: 'Europe', visits: 12, count: 12, lastVisited: '2025-11-15', colorTheme: 'border-red-600', shape: 'hexagon' as const, isNew: true, unlocked: true },
    { iata: 'SYD', name: 'Sydney', city: 'Sydney', country: 'Australia', region: 'Oceania', visits: 24, count: 24, lastVisited: '2025-10-10', colorTheme: 'border-green-600', shape: 'rectangle' as const, unlocked: true },
    { iata: 'NRT', name: 'Tokyo', city: 'Tokyo', country: 'Japan', region: 'Asia', visits: 18, count: 18, lastVisited: '2025-09-05', colorTheme: 'border-purple-600', shape: 'oval' as const, unlocked: true },
    { iata: 'CDG', name: 'Paris', city: 'Paris', country: 'France', region: 'Europe', visits: 8, count: 8, lastVisited: '2025-08-12', colorTheme: 'border-indigo-600', shape: 'hexagon' as const, unlocked: true },
    { iata: 'DXB', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', region: 'MENA', visits: 14, count: 14, lastVisited: '2025-07-20', colorTheme: 'border-orange-600', shape: 'rectangle' as const, unlocked: true },
    { iata: 'SIN', name: 'Singapore', city: 'Singapore', country: 'Singapore', region: 'Asia', visits: 64, count: 64, lastVisited: '2025-11-25', colorTheme: 'border-emerald-600', shape: 'oval' as const, unlocked: true },
    { iata: 'BKK', name: 'Bangkok', city: 'Bangkok', country: 'Thailand', region: 'Asia', visits: 32, count: 32, lastVisited: '2025-11-05', colorTheme: 'border-yellow-600', shape: 'hexagon' as const, unlocked: true },
    { iata: 'ICN', name: 'Seoul', city: 'Seoul', country: 'South Korea', region: 'Asia', visits: 9, count: 9, lastVisited: '2025-06-15', colorTheme: 'border-cyan-600', shape: 'rectangle' as const, unlocked: true },
    { iata: 'MEL', name: 'Melbourne', city: 'Melbourne', country: 'Australia', region: 'Oceania', visits: 11, count: 11, lastVisited: '2025-05-10', colorTheme: 'border-pink-600', shape: 'oval' as const, unlocked: true },
    { iata: 'AMS', name: 'Amsterdam', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', visits: 5, count: 5, lastVisited: '2025-04-20', colorTheme: 'border-sky-600', shape: 'hexagon' as const, unlocked: true },
    { iata: 'HKG', name: 'Hong Kong', city: 'Hong Kong', country: 'China', region: 'Asia', visits: 21, count: 21, lastVisited: '2025-11-10', colorTheme: 'border-violet-600', shape: 'rectangle' as const, unlocked: true },
    { iata: 'JFK', name: 'New York', city: 'New York', country: 'United States', region: 'Americas', visits: 0, count: 0, lastVisited: '', colorTheme: 'border-gray-600', shape: 'oval' as const, unlocked: false },
    { iata: 'SFO', name: 'San Francisco', city: 'San Francisco', country: 'United States', region: 'Americas', visits: 0, count: 0, lastVisited: '', colorTheme: 'border-gray-600', shape: 'hexagon' as const, unlocked: false },
    { iata: 'FRA', name: 'Frankfurt', city: 'Frankfurt', country: 'Germany', region: 'Europe', visits: 0, count: 0, lastVisited: '', colorTheme: 'border-gray-600', shape: 'rectangle' as const, unlocked: false },
    { iata: 'DOH', name: 'Doha', city: 'Doha', country: 'Qatar', region: 'MENA', visits: 0, count: 0, lastVisited: '', colorTheme: 'border-gray-600', shape: 'oval' as const, unlocked: false },
  ]
};
