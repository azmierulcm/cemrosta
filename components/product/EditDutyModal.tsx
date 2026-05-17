'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Loader2 } from 'lucide-react';
import { DutyEvent, DutyType } from '@/lib/types';

interface EditDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: DutyEvent;
  onSave: (id: string, updates: Partial<DutyEvent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditDutyModal = ({ isOpen, onClose, event, onSave, onDelete }: EditDutyModalProps) => {
  const formatTime = (timeStr?: string) => {
    if (!timeStr || timeStr === '--:--') return '';
    if (timeStr.includes('T')) {
      try {
        const timePart = timeStr.split('T')[1];
        return timePart.substring(0, 5);
      } catch {
        return timeStr;
      }
    }
    return timeStr;
  };

  const [formData, setFormData] = useState<Partial<DutyEvent>>({
    flightNumber: event.flightNumber,
    depPort: event.depPort,
    arrPort: event.arrPort,
    std: formatTime(event.std),
    sta: formatTime(event.sta),
    signOn: formatTime(event.signOn),
    signOff: formatTime(event.signOff),
    aircraftType: event.aircraftType,
    type: event.type,
    description: event.description
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(event.id, formData);
    setIsSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this duty?')) {
      setIsSaving(true);
      await onDelete(event.id);
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-border flex items-center justify-between bg-surface-2">
              <h2 className="text-2xl font-bold text-text tracking-tighter">Edit Duty Details</h2>
              <button onClick={onClose} className="p-2 hover:bg-border rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">Duty Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as DutyType})}
                    className="w-full bg-surface-2 border border-border p-4 rounded-2xl font-bold focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="FLIGHT">Flight</option>
                    <option value="STANDBY">Standby</option>
                    <option value="OFF">Off Day</option>
                    <option value="LEAVE">Leave</option>
                    <option value="TRAINING">Training</option>
                  </select>
                </div>
                {formData.type === 'FLIGHT' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">Flight Number</label>
                    <input 
                      type="text"
                      value={formData.flightNumber || ''}
                      onChange={(e) => setFormData({...formData, flightNumber: e.target.value})}
                      placeholder="e.g. MH 4"
                      className="w-full bg-surface-2 border border-border p-4 rounded-2xl font-bold focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                )}
              </div>

              {formData.type === 'FLIGHT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">Origin (IATA)</label>
                    <input 
                      type="text"
                      value={formData.depPort || ''}
                      onChange={(e) => setFormData({...formData, depPort: e.target.value.toUpperCase()})}
                      maxLength={3}
                      className="w-full bg-surface-2 border border-border p-4 rounded-2xl font-bold focus:ring-2 focus:ring-accent outline-none uppercase font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">Destination (IATA)</label>
                    <input 
                      type="text"
                      value={formData.arrPort || ''}
                      onChange={(e) => setFormData({...formData, arrPort: e.target.value.toUpperCase()})}
                      maxLength={3}
                      className="w-full bg-surface-2 border border-border p-4 rounded-2xl font-bold focus:ring-2 focus:ring-accent outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] text-accent font-mono">
                    {formData.type === 'STANDBY' ? 'Start Standby' : 'STD (Departure)'}
                  </label>
                  <input 
                    type="text"
                    value={formData.std || formData.signOn || ''}
                    onChange={(e) => setFormData({...formData, std: e.target.value, signOn: e.target.value})}
                    placeholder="HH:MM"
                    className="w-full bg-surface-2 border border-border p-5 rounded-[1.5rem] font-bold focus:ring-2 focus:ring-accent outline-none font-mono text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] text-accent font-mono">
                    {formData.type === 'STANDBY' ? 'Finish Standby' : 'STA (Arrival)'}
                  </label>
                  <input 
                    type="text"
                    value={formData.sta || formData.signOff || ''}
                    onChange={(e) => setFormData({...formData, sta: e.target.value, signOff: e.target.value})}
                    placeholder="HH:MM"
                    className="w-full bg-surface-2 border border-border p-5 rounded-[1.5rem] font-bold focus:ring-2 focus:ring-accent outline-none font-mono text-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono">Mission Description / Notes</label>
                <input 
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. Annual Leave, Recurrent Training"
                  className="w-full bg-surface-2 border border-border p-5 rounded-[1.5rem] font-bold focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono">Aircraft Type</label>
                <input 
                  type="text"
                  value={formData.aircraftType || ''}
                  onChange={(e) => setFormData({...formData, aircraftType: e.target.value.toUpperCase()})}
                  placeholder="e.g. B737, A350"
                  className="w-full bg-surface-2 border border-border p-5 rounded-[1.5rem] font-bold focus:ring-2 focus:ring-accent outline-none uppercase font-mono"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-5 rounded-full text-danger hover:bg-danger/5 transition-all active:scale-95 border border-danger/20"
                >
                  <Trash2 size={24} />
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-accent text-accent-fg py-5 rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-accent/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Mission Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
