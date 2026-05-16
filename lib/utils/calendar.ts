import * as ics from 'ics';
import { RosterData } from '@/lib/types';

export function generateICS(roster: RosterData): string | null {
  const events: ics.EventAttributes[] = roster.events.map((event) => {
    // 1. Determine Start Time and Date
    const [year, month, day] = event.date.split('-').map(Number);
    const startTimeStr = event.signOn || event.std || '00:00';
    
    // Robustly parse time, fallback to 00:00 if malformed (e.g. "--:--")
    const parseTime = (timeStr: string) => {
      const parts = timeStr.split(':').map(p => parseInt(p, 10));
      return {
        h: isNaN(parts[0]) ? 0 : parts[0],
        m: isNaN(parts[1]) ? 0 : parts[1]
      };
    };

    const { h: startH, m: startM } = parseTime(startTimeStr);
    
    // 2. Determine End Time and Date
    const endTimeStr = event.signOff || event.sta || '23:59';
    const { h: endH, m: endM } = parseTime(endTimeStr);
    
    let endDay = day;
    let endMonth = month;
    let endYear = year;

    // Logic for duties crossing midnight
    const startTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    if (endTotalMinutes < startTotalMinutes) {
      const date = new Date(year, month - 1, day);
      date.setDate(date.getDate() + 1);
      endDay = date.getDate();
      endMonth = date.getMonth() + 1;
      endYear = date.getFullYear();
    }

    const isFlight = event.type === 'FLIGHT';

    return {
      start: [year, month, day, startH, startM],
      end: [endYear, endMonth, endDay, endH, endM],
      title: isFlight ? `${event.flightNumber} (${event.depPort}-${event.arrPort})` : `Standby (${event.description || 'S-Duty'})`,
      description: event.description || (isFlight ? `Route: ${event.depPort} to ${event.arrPort}\nSTD: ${event.std}\nSTA: ${event.sta}` : 'Standby Duty'),
      location: isFlight ? event.arrPort : 'KUL Base',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      categories: [isFlight ? 'Flight' : 'Standby'],
    };
  });

  const { error, value } = ics.createEvents(events);

  if (error) {
    console.error('ICS Validation Errors:', error);
    // Return the error message to help debugging if needed, 
    // but usually we want to return null to avoid crashing.
    return null;
  }

  return value || null;
}

export function downloadICS(content: string, filename: string) {
  try {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download failed:', err);
  }
}
