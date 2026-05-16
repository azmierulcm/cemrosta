'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Clock, MapPin, Plane } from 'lucide-react';
import { DutyEvent, DutyType } from '@/lib/types';

interface EditDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: DutyEvent;
  onSave: (id: string, updates: Partial<DutyEvent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditDutyModal = ({ isOpen, onClose, event, onSave, onDelete }: EditDutyModalProps) => {
  const [formData, setFormData] = useState<Partial<DutyEvent>>({
    flightNumber: event.flightNumber,
    depPort: event.depPort,
    arrPort: event.arrPort,
    std: event.std,
    sta: event.sta,
    signOn: event.signOn,
    signOff: event.signOff,
    aircraftType: event.aircraftType,
    type: event.type,
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
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">
                    {formData.type === 'STANDBY' ? 'Start Standby' : 'STD (Departure Time)'}
                  </label>
                  <input 
                    type="text"
                    value={formData.std || formData.signOn || ''}
                    onChange={(e) => setFormData({...formData, std: e.target.value, signOn: e.target.value})}
                    placeholder="HH:MM"
                    className="w-full bg-surface-2 border border-border p-4 rounded-2xl font-bold focus:ring-2 focus:ring-accent outline-none font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">
                    {formData.type === 'STANDBY' ? 'Finish Standby' : 'STA (Arrival Time)'}
                  </label>
                  <input 
                    type="text"
                    value={formData.sta || formData.signOff || ''}
                    onChange={(e) => setFormData({...formData, sta: e.target.value, signOff: e.target.value})}
                    placeholder="HH:MM"
                    className="w-full bg-surface-2 border border-border p-4 rounded-2xl font-bold focus:ring-2 focus:ring-accent outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 border border-danger/20 text-danger py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-danger/5 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] bg-accent text-accent-fg py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <span className="animate-pulse">Saving...</span> : (
                    <>
                      <Save size={18} />
                      Save Changes
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
