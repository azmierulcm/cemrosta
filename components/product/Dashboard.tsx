'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Clock, MapPin, Hotel, Download, ChevronDown, Loader2, Edit3, X, Trash2 } from 'lucide-react';
import { useRoster } from '@/lib/contexts/RosterContext';
import { DutyEvent } from '@/lib/types';
import { generateICS, downloadICS } from '@/lib/utils/calendar';
import { DutyCalendar } from './DutyCalendar';
import { DestinationPatch } from './DestinationPatch';
import { EditDutyModal } from './EditDutyModal';
import { CalendarTab } from './CalendarTab';
import { FileUploader } from './FileUploader';
import { updateDuty, deleteDuty } from '@/lib/actions/roster';

export const EventCard = ({ event, index, onEdit }: { event: DutyEvent; index: number; onEdit: (e: DutyEvent) => void }) => {
  const isFlight = event.type === 'FLIGHT';
  const isStandby = event.type === 'STANDBY';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-border mb-8 group hover:shadow-2xl hover:shadow-black/5 transition-all relative overflow-hidden"
    >
      <button 
        onClick={() => onEdit(event)}
        className="absolute top-8 right-8 p-3 rounded-full bg-surface-2 border border-border text-text-muted hover:text-accent hover:border-accent opacity-0 group-hover:opacity-100 transition-all z-20"
      >
        <Edit3 size={18} />
      </button>
      
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
  const { roster, history, switchMonth, deleteRosterMonth, isLoading, refresh } = useRoster();
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<DutyEvent | null>(null);
  const [activeTab, setActiveTab] = React.useState<'timeline' | 'calendar'>('timeline');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  if (!roster) return null;

  const handleExport = () => {
    if (!roster) return;
    const icsContent = generateICS(roster);
    if (icsContent) {
      downloadICS(icsContent, `roster-${roster.month}-${roster.year}.ics`);
    }
  };

  const handleSaveDuty = async (id: string, updates: Partial<DutyEvent>) => {
    const result = await updateDuty(id, updates);
    if (result.success) {
      await refresh();
    }
  };

  const handleDeleteDuty = async (id: string) => {
    const result = await deleteDuty(id);
    if (result.success) {
      await refresh();
    }
  };

  const handleDeleteMonth = async () => {
    if (confirm(`Are you sure you want to delete ALL data for ${roster.month} ${roster.year}? This cannot be undone.`)) {
      await deleteRosterMonth(roster.month, roster.year);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 pt-16">
      {/* Edit Modal */}
      {editingEvent && (
        <EditDutyModal 
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
          onSave={handleSaveDuty}
          onDelete={handleDeleteDuty}
        />
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-[3rem] p-4 shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center p-8">
                <h3 className="text-3xl font-black text-text tracking-tighter uppercase italic">New Roster.</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="p-3 hover:bg-surface-2 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              <FileUploader />
              <div className="p-8 text-center">
                 <p className="text-xs font-bold text-text-muted">Upload a different month to expand your passport history.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
             <MapPin size={12} className="text-accent" />
             Live Mission Control
          </div>
          
          <div className="relative inline-block text-left">
            <button 
              onClick={() => history.length > 1 && setIsHistoryOpen(!isHistoryOpen)}
              className={`flex items-center gap-4 text-5xl md:text-7xl font-bold tracking-tighter text-text group ${history.length > 1 ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {roster.month} {roster.year}
              {history.length > 1 && (
                <ChevronDown size={32} className={`text-text-subtle group-hover:text-accent transition-all duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {isHistoryOpen && history.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute left-0 mt-4 w-64 bg-white border border-border rounded-3xl shadow-2xl z-[100] overflow-hidden p-2"
              >
                {history.map((item) => (
                  <button
                    key={`${item.month}-${item.year}`}
                    onClick={() => {
                      switchMonth(item.month, item.year);
                      setIsHistoryOpen(false);
                    }}
                    className={`w-full text-left px-6 py-4 rounded-2xl font-bold text-lg flex items-center justify-between transition-all ${
                      roster.month === item.month && roster.year === item.year 
                        ? 'bg-accent/5 text-accent' 
                        : 'text-text-muted hover:bg-surface-2 hover:text-text'
                    }`}
                  >
                    <span>{item.month} {item.year}</span>
                    {roster.month === item.month && roster.year === item.year && (
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <p className="text-text-muted font-bold mt-3 text-lg tracking-tight">
            {roster.events.length} Assigned Events <span className="mx-2 text-border">•</span> {roster.crewName}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoading && <Loader2 className="animate-spin text-accent mr-4" />}
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest text-text-muted hover:bg-surface-2 hover:text-text transition-all active:scale-95 border border-border/50"
          >
            Upload Roster
          </button>
          <button 
            onClick={handleDeleteMonth}
            className="p-4 rounded-full text-danger hover:bg-danger/5 transition-all active:scale-95 border border-danger/20"
            title="Delete this month"
            aria-label="Delete this month's roster"
          >
            <Trash2 size={20} />
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

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-16 border-b border-border pb-4">
         <button 
           onClick={() => setActiveTab('timeline')}
           className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'timeline' ? 'bg-text text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
         >
           Timeline
         </button>
         <button 
           onClick={() => setActiveTab('calendar')}
           className={`px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'calendar' ? 'bg-text text-white shadow-lg' : 'text-text-muted hover:text-text'}`}
         >
           Calendar Tab
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className={activeTab === 'timeline' ? "lg:col-span-8 relative" : "lg:col-span-12"}>
          {activeTab === 'timeline' ? (
            <>
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

              <div className="flex items-center gap-4 mb-12">
                 <h3 className="text-3xl font-bold text-text tracking-tighter uppercase italic">Timeline.</h3>
                 <div className="h-px flex-1 bg-border/50" />
              </div>
              
              <div className="absolute left-8 top-32 bottom-0 w-px bg-surface-2 -z-10" />
              {roster.events.map((event, index) => (
                <EventCard key={event.id + index} event={event} index={index} onEdit={setEditingEvent} />
              ))}
            </>
          ) : (
             <CalendarTab />
          )}
        </div>
        
        {activeTab === 'timeline' && (
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
        )}
      </div>
    </div>
  );
};
