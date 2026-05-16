'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2, Camera, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/utils/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DateTime } from 'luxon';

const CATEGORIES = ["Headsets", "Luggage", "Watches", "Uniforms", "Manuals", "Other"];
const CONDITIONS = ["New", "Lightly used", "Well used", "For parts"];

export const CreateAdModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('New');
  const [category, setCategory] = useState('Headsets');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert("Max 5 photos allowed");
      return;
    }

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setStatus({ type: 'error', text: 'You must be logged in to sell items.' });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      // 0. Check Listing Limit (client-side safety, RLS/Trigger should handle server-side)
      const { data: profile } = await supabase.from('profiles').select('active_listings_count').eq('id', user.id).single();
      if (profile && profile.active_listings_count >= 5) {
        throw new Error('Maximum limit of 5 active listings reached.');
      }

      const uploadedUrls: string[] = [];

      // 1. Upload Images
      for (const file of images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('marketplace-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('marketplace-images')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }

      // 2. Save Listing
      const { error: dbError } = await supabase
        .from('marketplace_listings')
        .insert({
          seller_id: user.id,
          title,
          description,
          price: parseFloat(price),
          condition,
          category,
          image_urls: uploadedUrls,
          status: 'available',
          expires_at: DateTime.now().plus({ days: 30 }).toISO()
        });

      if (dbError) throw dbError;

      // 3. Increment count (in a real app, a DB trigger is better)
      await supabase.rpc('increment_listing_count', { user_id: user.id });

      setStatus({ type: 'success', text: 'Your gear is now live on the marketplace!' });
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);

    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Failed to post listing.' });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCondition('New');
    setCategory('Headsets');
    setImages([]);
    setPreviews([]);
    setStatus(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
          className="bg-white border border-border w-full max-w-2xl rounded-[3rem] p-10 md:p-14 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-10 right-10 p-3 hover:bg-surface-2 rounded-full transition-colors text-text-muted">
            <X size={24} />
          </button>

          <h2 className="text-4xl md:text-5xl font-bold text-text mb-3 tracking-tighter">Sell your gear.</h2>
          <p className="text-text-muted font-bold mb-12 text-lg tracking-tight">Turn your unused items into extra travel cash.</p>

          {status && (
            <div className={`mb-10 p-6 rounded-2xl flex items-center gap-4 text-sm font-bold border shadow-sm ${
              status.type === 'success' ? 'bg-success/5 text-success border-success/10' : 'bg-danger/5 text-danger border-danger/10'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              <p>{status.text}</p>
            </div>
          )}

          <form className="space-y-12" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono px-1">Mission Gear Information</label>
              <input 
                type="text" 
                required
                placeholder="What are you selling? (e.g. Bose A20 Headset)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
              />
              <textarea 
                placeholder="Tell us about the condition, age, and key features..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono px-1">Price (RM)</label>
                <input 
                  type="number" 
                  required
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
                />
              </div>
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono px-1">Category</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm appearance-none cursor-pointer"
                  >
                     {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
                     <Plus size={20} className="rotate-45" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono px-1">Condition</label>
                <div className="relative">
                  <select 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-surface-2 border border-border p-6 rounded-2xl font-bold focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm appearance-none cursor-pointer"
                  >
                     {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
                     <Plus size={20} className="rotate-45" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-subtle font-mono px-1">Photos (Maximum 5)</label>
              
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
                
                {images.length < 5 && (
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
              
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>

            <button 
              type="submit"
              disabled={isUploading || !title || !price || images.length === 0}
              className="w-full bg-accent text-accent-fg py-6 rounded-full font-bold text-xl hover:bg-accent-hover transition-all active:scale-[0.98] shadow-2xl shadow-accent/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4 mt-8"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Clearing for takeoff...
                </>
              ) : (
                'Publish Listing'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
