import { ParsedRoster, ParsedDuty } from '../types';

/**
 * Template for adding a new airline parser to Cemrosta.
 * 
 * 1. Define the detection logic in lib/parser/index.ts
 * 2. Implement the parsing logic here.
 * 3. Add tests in tests/parser/airline-name.test.ts
 */

export function parseAirlineName(_text: string): ParsedRoster {
  const duties: ParsedDuty[] = [];
  
  // Implementation goes here
  // 1. Extract dates
  // 2. Extract flights
  // 3. Extract ground duties
  
  return {
    crewName: 'Crew Member',
    month: 'JAN',
    year: '2026',
    airline: 'Airline Name',
    duties,
  };
}
