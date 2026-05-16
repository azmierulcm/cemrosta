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
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-text-subtle font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent/20 border border-accent/30" />
            Mission
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-2 border border-border" />
            Standby
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-text-subtle/50 uppercase py-2 font-mono">
            {d}
          </div>
        ))}
        
        {calendarPadding.map(i => <div key={`pad-${i}`} />)}

        {days.map(day => (
          <motion.div
            key={day.date}
            whileHover={{ scale: 1.15, zIndex: 10, backgroundColor: 'var(--color-surface-2)' }}
            className={`
              aspect-square rounded-xl flex flex-col items-center justify-center relative cursor-pointer
              transition-all duration-300 border
              ${day.event 
                ? 'bg-accent/5 border-accent/10 text-accent font-black shadow-sm' 
                : 'bg-white border-transparent text-text-muted hover:border-border'}
            `}
          >
            <span className="text-sm font-mono">{day.dayNum}</span>
            {day.event && (
              <div className="absolute bottom-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(255,56,92,0.5)]" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
