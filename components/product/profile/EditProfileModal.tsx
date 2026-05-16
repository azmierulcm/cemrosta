'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Camera, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/utils/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { updateUserProfile } from '@/lib/actions/roster';

export const EditProfileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, profile, setProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState(() => profile?.full_name || '');
  const [rank, setRank] = useState(() => profile?.rank || 'First Officer');
  const [airline, setAirline] = useState(() => profile?.airline || 'Malaysia Airlines');
  const [bio, setBio] = useState(() => profile?.bio || '');
  
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(() => profile?.gallery_urls || []);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 5) {
      alert("Max 5 photos allowed in the gallery");
      return;
    }

    setNewFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    // Note: In a more complex app, we'd specifically track which File to remove from newFiles
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatus({ type: 'error', text: 'Auth Error: No user session found.' });
      return;
    }

    setIsUpdating(true);
    setStatus(null);

    try {
      // 1. Filter existing URLs
      const finalGalleryUrls = previews.filter(url => url.startsWith('http'));

      // 2. Upload NEW Images
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);
        
        finalGalleryUrls.push(publicUrl);
      }

      const updateData = {
        full_name: fullName,
        rank,
        airline,
        bio,
        gallery_urls: finalGalleryUrls.slice(0, 5)
      };

      // 3. Update Profile in DB using Server Action (Bypass RLS)
      const result = await updateUserProfile(user.id, updateData);

      if (!result.success) throw result.error;

      // 4. Update Global State
      setProfile({
        id: user.id,
        ...updateData
      });

      setStatus({ type: 'success', text: 'Profile saved! Refreshing...' });
      
      setTimeout(() => {
        onClose();
        setStatus(null);
        setNewFiles([]);
      }, 1500);

    } catch (err) {
      setStatus({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to update profile. Check Supabase RLS policies.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white border border-border w-full max-w-2xl rounded-[3rem] p-10 md:p-14 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-surface-2 rounded-full transition-colors text-text-muted">
            <X size={24} />
          </button>

          <h2 className="text-4xl md:text-5xl font-bold text-text mb-3 tracking-tighter">Edit Passport.</h2>
          <p className="text-text-muted font-bold mb-12 text-lg tracking-tight">Build your pilot persona.</p>

          {status && (
            <div className={`mb-10 p-6 rounded-2xl flex items-center gap-4 text-sm font-bold border shadow-sm ${
              status.type === 'success' ? 'bg-success/5 text-success border-success/10' : 'bg-danger/5 text-danger border-danger/10'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={24} /> : <Trash2 size={24} />}
              <p>{status.text}</p>
            </div>
          )}

          <form className="space-y-12" onSubmit={handleUpdate}>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle font-mono px-1">Identity Information</label>
                <input 
                  type="text" 
                  required
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm placeholder:text-text-subtle/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle font-mono px-1">Current Rank</label>
                  <input 
                    type="text" 
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle font-mono px-1">Primary Airline</label>
                  <input 
                    type="text" 
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle font-mono px-1">Biography</label>
                <textarea 
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your story to other crew members..."
                  className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm placeholder:text-text-subtle/50"
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-subtle font-mono px-1">Gallery (Max 5 Photos)</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group border border-border shadow-sm">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-danger/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                ))}
                
                {previews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-accent/40 hover:bg-surface-2 transition-all text-text-subtle hover:text-accent shadow-sm"
                  >
                    <Camera size={28} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
            </div>

            <button 
              type="submit"
              disabled={isUpdating}
              className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-xl hover:bg-accent-hover transition-all active:scale-[0.98] shadow-2xl shadow-accent/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 mt-8"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  Updating Flight Deck...
                </>
              ) : 'Save Passport Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
