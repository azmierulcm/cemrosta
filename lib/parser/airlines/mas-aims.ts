import { ParsedRoster, ParsedDuty, ParsedFlight } from '../types';

export function parseMasAims(text: string): ParsedRoster {
  const duties: ParsedDuty[] = [];
  
  // 1. Identify all Date Markers (e.g., 06-MAY-2026)
  const dateRegex = /(\d{2})-([A-Z]{3})-(\d{4})/gi;
  const matches = Array.from(text.matchAll(dateRegex));
  
  if (matches.length === 0) {
    throw new Error('No dates found in the roster. Please ensure this is a text-based Malaysia Airlines PDF.');
  }

  const months: Record<string, string> = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
    'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };

  // Extract crew name - heuristic for MAS AIMS
  const crewNameMatch = text.match(/Name:\s*([A-Z\s]+)/i);
  const crewName = crewNameMatch ? crewNameMatch[1].trim() : 'Crew Member';

  // 2. Extract chunks between dates
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const day = match[1];
    const monthStr = match[2].toUpperCase();
    const year = match[3];
    const currentDate = `${year}-${months[monthStr] || '01'}-${day}`;

    // Get text from this date to the next date
    const startIdx = match.index! + match[0].length;
    const endIdx = matches[i + 1] ? matches[i + 1].index : text.length;
    const chunk = text.substring(startIdx, endIdx);

    // 3. Extract Flights within this chunk (MH \d+)
    const flightRegex = /MH\s*(\d+)/gi;
    const flightMatches = Array.from(chunk.matchAll(flightRegex));

    flightMatches.forEach((fMatch, fIdx) => {
      const flightNo = fMatch[1];
      const flightChunk = chunk.substring(fMatch.index!);
      
      const times = flightChunk.match(/\d{2}:\d{2}/g) || [];
      const ports = flightChunk.match(/\b[A-Z]{3}\b/g) || [];

      const flight: ParsedFlight = {
        flightNumber: `MH${flightNo}`,
        depPort: ports[0] || '???',
        arrPort: ports[1] || '???',
        std: times[0] || '00:00',
        sta: times[1] || '00:00',
      };

      if (fIdx === 0 && times.length >= 4 && ports.length >= 2) {
        flight.signOn = times[0];
        flight.std = times[1] || '00:00';
        flight.sta = times[2] || '00:00';
        flight.signOff = times[3];
      } else if (times.length >= 3 && ports.length >= 2) {
        flight.std = times[0] || '00:00';
        flight.sta = times[1] || '00:00';
        flight.signOff = times[2];
      }

      duties.push({
        id: `MH${flightNo}-${currentDate}-${fIdx}`,
        type: 'FLIGHT',
        date: currentDate,
        flight,
      });
    });

    // 4. Extract Standbys within this chunk (S\d+-\d+)
    const standbyRegex = /(S\d+-\d+)/gi;
    const standbyMatches = Array.from(chunk.matchAll(standbyRegex));

    standbyMatches.forEach((sMatch) => {
      const code = sMatch[1];
      const sChunk = chunk.substring(sMatch.index!);
      const times = sChunk.match(/\d{2}:\d{2}/g) || [];
      
      duties.push({
        id: `${code}-${currentDate}`,
        type: 'STANDBY',
        date: currentDate,
        signOn: times[0] || '--:--',
        signOff: times[times.length - 1] || '--:--',
        description: `Standby ${code.toUpperCase()}`,
      });
    });

    // 5. Extract Other Duties (OFF, LEAVE, TRAINING)
    // Heuristic for MAS codes
    if (flightMatches.length === 0 && standbyMatches.length === 0) {
      if (chunk.match(/\bOFF\b|\bGDO\b/i)) {
        duties.push({
          id: `OFF-${currentDate}`,
          type: 'OFF',
          date: currentDate,
          description: 'Day Off',
        });
      } else if (chunk.match(/\bLVE\b|\bLEAVE\b|\bAL\b/i)) {
        duties.push({
          id: `LVE-${currentDate}`,
          type: 'LEAVE',
          date: currentDate,
          description: 'Annual Leave',
        });
      } else if (chunk.match(/\bSIM\b|\bGRD\b|\bTRG\b|\bTRAINING\b/i)) {
        duties.push({
          id: `TRG-${currentDate}`,
          type: 'TRAINING',
          date: currentDate,
          description: 'Training/Simulator',
        });
      }
    }
  }

  return {
    crewName,
    month: matches[0][2],
    year: matches[0][3],
    airline: 'Malaysia Airlines',
    duties,
  };
}
