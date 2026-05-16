import React from 'react';
import { useRoster } from '@/lib/contexts/RosterContext';
import { motion } from 'framer-motion';
import { DutyEvent } from '@/lib/types';

export const DutyCalendar = () => {
  const { roster } = useRoster();
  if (!roster) return null;

  const eventsByDate = roster.events.reduce((acc, event) => {
    acc[event.date] = event;
    return acc;
  }, {} as Record<string, DutyEvent>);

  // Determine month/year
  const [firstEvent] = roster.events;
  const dateObj = new Date(firstEvent?.date || `${roster.year}-${roster.month}-01`);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-6">
        <h3 className="text-xl font-bold text-text tracking-tight uppercase italic">Duty Map.</h3>
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full border-2 border-accent/30 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-accent" />
            </div>
            Mission
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full border-2 border-border flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-text-subtle/30" />
            </div>
            Standby
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-text-subtle/40 uppercase py-2 font-mono tracking-widest">
            {d}
          </div>
        ))}
        
        {calendarPadding.map(i => <div key={`pad-${i}`} />)}

        {days.map(day => (
          <motion.div
            key={day.date}
            whileHover={{ scale: 1.1, zIndex: 10, backgroundColor: 'var(--color-surface)' }}
            className={`
              aspect-square rounded-[1.25rem] flex flex-col items-center justify-center relative cursor-pointer
              transition-all duration-200 border
              ${day.event 
                ? 'bg-accent/[0.03] border-accent/10 text-accent font-bold' 
                : 'bg-transparent border-transparent text-text-muted hover:border-border'}
            `}
          >
            <span className="text-sm font-mono leading-none">{day.dayNum}</span>
            {day.event && (
              <div className="absolute bottom-2.5">
                <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
