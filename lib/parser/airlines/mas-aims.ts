import { ParsedRoster, ParsedDuty, ParsedFlight, DutyType } from '../types';

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

  const PORT_BLACKLIST = new Set(['OFF', 'GDO', 'LVE', 'SIM', 'TRG', 'MH', 'DAY', 'UTC', 'LOC', 'RMK', 'RPT', 'HOU', 'MIN']);

  // Extract crew name
  const crewNameMatch = text.match(/Name:\s*([A-Z\s,]+)/i);
  let crewName = crewNameMatch ? crewNameMatch[1].trim() : 'Crew Member';
  crewName = crewName.replace(/\s+/g, ' ').replace(/,/g, '');

  // 2. Extract chunks between dates
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const day = match[1];
    const monthStr = match[2].toUpperCase();
    const year = match[3];
    const currentDate = `${year}-${months[monthStr] || '01'}-${day}`;

    const startIdx = match.index! + match[0].length;
    const endIdx = matches[i + 1] ? matches[i + 1].index! : text.length;
    const chunk = text.substring(startIdx, endIdx);

    // Ground Duty Check
    const groundDutyMatch = chunk.match(/\b(OFF|GDO|LVE|LEAVE|AL|ANNUAL LEAVE|SIM|GRD|TRG|TRAINING|SEP|CRM|MED)\b/i);

    // 3. Extract Flights
    const flightRegex = /MH\s*(\d+)/gi;
    const flightMatches = Array.from(chunk.matchAll(flightRegex));

    flightMatches.forEach((fMatch, fIdx) => {
      const flightNo = fMatch[1];
      const nextFStart = flightMatches[fIdx + 1] ? flightMatches[fIdx + 1].index! : chunk.length;
      const flightChunk = chunk.substring(fMatch.index!, nextFStart);
      
      const times = flightChunk.match(/\d{2}:\d{2}/g) || [];
      const allPorts = flightChunk.match(/\b[A-Z]{3}\b/g) || [];
      const ports = allPorts.filter(p => !PORT_BLACKLIST.has(p.toUpperCase()));

      const flight: ParsedFlight = {
        flightNumber: `MH${flightNo}`,
        depPort: ports[0] || '???',
        arrPort: ports[1] || '???',
        std: times[0] || '00:00',
        sta: times[1] || '00:00',
      };

      if (fIdx === 0) {
        if (times.length >= 4) {
          flight.signOn = times[0];
          flight.std = times[1];
          flight.sta = times[2];
          flight.signOff = times[3];
        } else if (times.length === 3) {
          flight.signOn = times[0];
          flight.std = times[1];
          flight.sta = times[2];
        }
      } else {
        if (times.length >= 3) {
          flight.std = times[0] || '00:00';
          flight.sta = times[1] || '00:00';
          flight.signOff = times[2];
        } else if (times.length === 2) {
          flight.std = times[0] || '00:00';
          flight.sta = times[1] || '00:00';
        }
      }

      duties.push({
        id: `MH${flightNo}-${currentDate}-${fIdx}`,
        type: 'FLIGHT',
        date: currentDate,
        flight,
      });
    });

    // 4. Extract Standbys
    const standbyRegex = /\b(S\d+-\d+)\b/gi;
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

    // 5. Extract Ground Duties (Only if no flights/standbys)
    if (flightMatches.length === 0 && standbyMatches.length === 0 && groundDutyMatch) {
      let dType: 'OFF' | 'LEAVE' | 'TRAINING' | 'OTHER' = 'OTHER';
      let dDesc = groundDutyMatch[1].toUpperCase();
      
      if (['OFF', 'GDO'].includes(dDesc)) {
        dType = 'OFF';
        dDesc = 'Day Off';
      } else if (['LVE', 'LEAVE', 'AL'].includes(dDesc)) {
        dType = 'LEAVE';
        dDesc = 'Annual Leave';
      } else if (['SIM', 'GRD', 'TRG', 'TRAINING', 'SEP', 'CRM', 'MED'].includes(dDesc)) {
        dType = 'TRAINING';
        dDesc = `Training (${dDesc})`;
      }

      duties.push({
        id: `GND-${dType}-${currentDate}`,
        type: dType as DutyType,
        date: currentDate,
        description: dDesc,
      });
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
