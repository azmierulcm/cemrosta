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

  const PORT_BLACKLIST = new Set(['OFF', 'GDO', 'LVE', 'SIM', 'TRG', 'MH', 'DAY', 'UTC', 'LOC', 'RMK', 'RPT', 'HOU', 'MIN', 'SEC', 'HRS', 'DUR']);

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

    // New approach: Line-based parsing within the day chunk
    const lines = chunk.split('\n');
    const dayDuties: ParsedDuty[] = [];

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      // 1. Flight Line Detection
      const flightMatch = line.match(/MH\s*(\d+)/i);
      if (flightMatch) {
        const flightNo = flightMatch[1];
        const times = line.match(/\d{2}:\d{2}/g) || [];
        const allPorts = line.match(/\b[A-Z]{3}\b/g) || [];
        const ports = allPorts.filter(p => !PORT_BLACKLIST.has(p.toUpperCase()));

        if (ports.length >= 2 && times.length >= 2) {
          let stdVal = times[0];
          let staVal = times[1];
          let signOn: string | undefined;
          let signOff: string | undefined;

          if (times.length >= 4) {
            signOn = times[0];
            stdVal = times[1];
            staVal = times[2];
            signOff = times[3];
          } else if (times.length === 3) {
            if (ports[0] === 'KUL') {
              signOn = times[0];
              stdVal = times[1];
              staVal = times[2];
            } else {
              stdVal = times[0];
              staVal = times[1];
              signOff = times[2];
            }
          }

          // Sanity check for large gaps (e.g. SignOff picked as STA)
          try {
            if (stdVal && staVal) {
              const [h1, m1] = stdVal.split(':').map(Number);
              const [h2, m2] = staVal.split(':').map(Number);
              let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
              if (diff < 0) diff += 1440; // Crossed midnight

              if (diff > 360 && times.length >= 2) { // > 6 hours
                if (times.length === 2) {
                  signOff = staVal;
                  staVal = '00:00'; // Mark as TBD/Unknown
                }
              }
            }
          } catch { /* ignore parse errors */ }

          const flight: ParsedFlight = {
            flightNumber: `MH ${flightNo.padStart(3, '0')}`,
            depPort: ports[0] || '???',
            arrPort: ports[1] || '???',
            std: stdVal || '00:00',
            sta: staVal || '00:00',
            signOn,
            signOff,
          };

          dayDuties.push({
            id: `MH${flightNo}-${currentDate}-${dayDuties.length}`,
            type: 'FLIGHT',
            date: currentDate,
            flight,
          });
        }
        return;
      }

      // 2. Standby Detection
      const standbyMatch = line.match(/\b(S\d+-\d+)\b/i);
      if (standbyMatch) {
        const code = standbyMatch[1];
        const times = line.match(/\d{2}:\d{2}/g) || [];
        dayDuties.push({
          id: `${code}-${currentDate}`,
          type: 'STANDBY',
          date: currentDate,
          signOn: times[0] || '--:--',
          signOff: times[times.length - 1] || '--:--',
          description: `Standby ${code.toUpperCase()}`,
        });
        return;
      }

      // 3. Ground Duties Detection
      const groundMatch = line.match(/\b(OFF|GDO|LVE|LEAVE|AL|ANNUAL LEAVE|SIM|GRD|TRG|TRAINING|SEP|CRM|MED)\b/i);
      if (groundMatch && dayDuties.length === 0) {
        let dType: DutyType = 'GROUND';
        let dDesc = groundMatch[1].toUpperCase();
        
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

        dayDuties.push({
          id: `GND-${dType}-${currentDate}`,
          type: dType,
          date: currentDate,
          description: dDesc,
        });
      }
    });

    // Sort day duties by time and add to main list
    dayDuties.sort((a, b) => {
      const timeA = a.flight?.std || a.signOn || '99:99';
      const timeB = b.flight?.std || b.signOn || '99:99';
      return timeA.localeCompare(timeB);
    });
    duties.push(...dayDuties);
  }

  return {
    crewName,
    month: matches[0][2],
    year: matches[0][3],
    airline: 'Malaysia Airlines',
    duties,
  };
}
