'use client';

import React, { useEffect, useMemo } from 'react';
import { useRoster } from '@/lib/contexts/RosterContext';
import { DutyEvent } from '@/lib/types';

export const CalendarTab = () => {
  const { roster, switchMonth } = useRoster();

  // We want to ensure we have both current and previous month
  useEffect(() => {
    if (roster) {
      // Trigger a fetch with includePrevious if not already loaded
      // This is a bit simplified, but ensures we hit the Step 5 requirement
      switchMonth(roster.month, roster.year, true);
    }
  }, [roster?.month, roster?.year, roster, switchMonth]); // Run when month/year changes

  const eventsByDate = useMemo(() => {
    if (!roster) return {} as Record<string, DutyEvent>;
    return roster.events.reduce((acc, event) => {
      acc[event.date] = event;
      return acc;
    }, {} as Record<string, DutyEvent>);
  }, [roster]);

  if (!roster) return null;

  // Logic to render two months
  const renderMonth = (mName: string, yStr: string) => {
    const monthsMap: Record<string, number> = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    const month = monthsMap[mName] || 0;
    const year = parseInt(yStr);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = (i + 1).toString().padStart(2, '0');
      const m = (month + 1).toString().padStart(2, '0');
      const dateStr = `${year}-${m}-${d}`;
      return {
        date: dateStr,
        dayNum: i + 1,
        event: eventsByDate[dateStr]
      };
    });

    const calendarPadding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-border">
        <h3 className="text-2xl font-bold text-text mb-8 tracking-tighter uppercase italic">{mName} {yStr}</h3>
        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-text-subtle/40 uppercase py-2 font-mono">
              {d}
            </div>
          ))}
          {calendarPadding.map(i => <div key={`pad-${i}`} />)}
          {days.map(day => (
            <div
              key={day.date}
              className={`
                aspect-square rounded-xl flex items-center justify-center relative border
                ${day.event 
                  ? 'bg-accent/5 border-accent/20 text-accent font-bold' 
                  : 'bg-transparent border-transparent text-text-muted'}
              `}
            >
              <span className="text-xs font-mono">{day.dayNum}</span>
              {day.event && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-accent" />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Calculate previous month name
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentIdx = months.indexOf(roster.month);
  const prevIdx = (currentIdx - 1 + 12) % 12;
  const prevYear = currentIdx === 0 ? parseInt(roster.year) - 1 : parseInt(roster.year);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {renderMonth(months[prevIdx], prevYear.toString())}
      {renderMonth(roster.month, roster.year)}
    </div>
  );
};
