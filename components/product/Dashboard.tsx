'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, MapPin, Hotel, Download } from 'lucide-react';
import { useRoster } from '@/lib/contexts/RosterContext';
import { DutyEvent } from '@/lib/types';
import { generateICS, downloadICS } from '@/lib/utils/calendar';
import { DutyCalendar } from './DutyCalendar';
import { DestinationPatch } from './DestinationPatch';

export const EventCard = ({ event, index }: { event: DutyEvent; index: number }) => {
  const isFlight = event.type === 'FLIGHT';
  const isStandby = event.type === 'STANDBY';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-border mb-8 group hover:shadow-2xl hover:shadow-black/5 transition-all relative overflow-hidden"
    >
      {isFlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/3 blur-[40px] -mr-16 -mt-16 rounded-full" />
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
        <div className="flex items-start gap-8">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
            ${isFlight ? 'bg-accent/5 text-accent border border-accent/10' : 'bg-orange-50 text-orange-600 border border-orange-100'}
          `}>
            {isFlight ? <Plane className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] font-mono bg-surface-2 px-3 py-1 rounded-full border border-border">
                {event.date}
              </span>
              {isStandby && (
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                  Standby Duty
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-text tracking-tighter">
              {isFlight ? `Flight ${event.flightNumber}` : `Duty Code: ${event.id}`}
            </h3>
            {isFlight && (
              <div className="flex items-center gap-3 mt-3 text-text-muted font-bold text-xl tracking-tight">
                <span className="text-text">{event.depPort}</span>
                <div className="flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                   <div className="w-8 h-[2px] bg-accent/20" />
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
                <span className="text-text">{event.arrPort}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-6 md:text-right">
          <div className="bg-surface-2 px-6 py-4 rounded-2xl border border-border shadow-sm min-w-[120px]">
            <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2 font-mono">Sign On</p>
            <p className="text-2xl font-black text-text font-mono">{event.signOn || event.std || '--:--'}</p>
          </div>
          <div className="bg-surface-2 px-6 py-4 rounded-2xl border border-border shadow-sm min-w-[120px]">
            <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2 font-mono">Sign Off</p>
            <p className="text-2xl font-black text-text font-mono">{event.signOff || event.sta || '--:--'}</p>
          </div>
        </div>
      </div>
      
      {isFlight && event.std && (
        <div className="mt-8 flex flex-wrap items-center gap-10 text-[10px] text-text-subtle font-black uppercase tracking-[0.15em] font-mono">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
               <Clock className="w-4 h-4 text-accent" />
            </div>
            <span>STD {event.std}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
               <Clock className="w-4 h-4 text-accent" />
            </div>
            <span>STA {event.sta || '--:--'}</span>
          </div>
          {event.aircraftType && (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-surface-2 flex items-center justify-center border border-border">
                  <Plane className="w-4 h-4 text-accent" />
               </div>
               <span>{event.aircraftType}</span>
            </div>
          )}
        </div>
      )}
      
      {event.hotel && (
        <div className="mt-10 pt-10 border-t border-border flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20">
                <Hotel className="w-6 h-6" strokeWidth={2.5} />
             </div>
             <span className="font-black text-text uppercase text-xs tracking-widest font-mono">Layover Operations:</span>
          </div>
          <span className="bg-accent/5 border border-accent/10 px-5 py-2.5 rounded-full text-accent font-black text-sm tracking-tight shadow-sm">{event.hotel}</span>
        </div>
      )}
    </motion.div>
  );
};

export const Dashboard = () => {
  const { roster, reset } = useRoster();

  if (!roster) return null;

  const handleExport = () => {
    if (!roster) return;
    const icsContent = generateICS(roster);
    if (icsContent) {
      downloadICS(icsContent, `roster-${roster.month}-${roster.year}.ics`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
             <MapPin size={12} className="text-accent" />
             Live Mission Control
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-text">Your Schedule.</h2>
          <p className="text-text-muted font-bold mt-3 text-lg tracking-tight">
            {roster.month} {roster.year} <span className="mx-2 text-border">•</span> {roster.events.length} Assigned Events
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={reset}
            className="px-8 py-4 rounded-full font-bold text-text-muted hover:bg-surface-2 hover:text-text transition-all active:scale-95 border border-transparent hover:border-border"
          >
            Reset
          </button>
          <button 
            onClick={handleExport}
            className="bg-accent text-accent-fg px-10 py-4 rounded-full font-bold text-lg flex items-center gap-3 shadow-xl shadow-accent/10 hover:bg-accent-hover transition-all active:scale-95"
          >
            <Download className="w-6 h-6" strokeWidth={2.5} />
            Sync Calendar
          </button>
        </div>
      </div>

      {/* Destinations Section */}
      {roster.destinations && roster.destinations.length > 0 && (
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10 border-b border-border pb-8">
            <h3 className="text-3xl font-bold text-text tracking-tighter uppercase italic">Recent Stamps.</h3>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle font-mono bg-surface-2 px-4 py-2 rounded-full border border-border">
               {roster.destinations.length} Unlocked
            </div>
          </div>
          <div className="flex gap-8 overflow-x-auto pb-10 -mx-4 px-4 scrollbar-hide">
            {roster.destinations.map((dest) => (
              <DestinationPatch key={dest.iata} destination={dest} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 relative">
          <div className="flex items-center gap-4 mb-12">
             <h3 className="text-3xl font-bold text-text tracking-tighter uppercase italic">Timeline.</h3>
             <div className="h-px flex-1 bg-border/50" />
          </div>
          
          <div className="absolute left-8 top-32 bottom-0 w-px bg-surface-2 -z-10" />
          {roster.events.map((event, index) => (
            <EventCard key={event.id + index} event={event} index={index} />
          ))}
        </div>
        
        <div className="lg:col-span-4">
          <div className="sticky top-32">
            <div className="flex items-center gap-4 mb-12">
               <h3 className="text-3xl font-bold text-text tracking-tighter uppercase italic">Calendar.</h3>
               <div className="h-px flex-1 bg-border/50" />
            </div>
            <DutyCalendar />
            
            <div className="mt-12 p-8 bg-surface-2 border border-border rounded-[2rem] text-center">
               <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono mb-6">
                 {"// MISSION SUPPORT"}
               </p>
               <p className="text-sm font-bold text-text-muted leading-snug">
                 Found an error in your roster parsing? <br />
                 Report it to our flight deck.
               </p>
               <button className="mt-6 text-accent font-black text-[10px] uppercase tracking-widest hover:underline">
                 Open Support Ticket
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
