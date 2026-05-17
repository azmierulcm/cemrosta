'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAuth, Profile } from '@/lib/contexts/AuthContext';
import { updateUserProfile } from '@/lib/actions/roster';
import { motion } from 'framer-motion';
import { Save, User, Shield, Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, setProfile, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    rank: 'First Officer',
    airline: 'Malaysia Airlines',
    bio: '',
  });

  const hasHydrated = React.useRef(false);

  useEffect(() => {
    if (profile && !hasHydrated.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        full_name: profile.full_name || '',
        rank: profile.rank || 'First Officer',
        airline: profile.airline || 'Malaysia Airlines',
        bio: profile.bio || '',
      });
      hasHydrated.current = true;
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
        <Shield size={64} className="text-text-subtle mb-6" />
        <h1 className="text-4xl font-black tracking-tighter mb-4">Secure Area.</h1>
        <p className="text-text-muted text-lg max-w-md mx-auto mb-8 font-bold">Please sign in to access your flight deck settings.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-accent text-accent-fg px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-accent/10"
        >
          Return to Base
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: null, text: '' });

    try {
      const result = await updateUserProfile(user.id, formData);
      if (result.success) {
        setProfile({ ...profile, ...formData } as Profile);
        setStatus({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        throw new Error(result.error as string);
      }
    } catch (err) {
      setStatus({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface pt-32 pb-32">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-16">
          <h1 className="text-6xl font-black tracking-tighter text-text mb-4 uppercase italic">Settings.</h1>
          <p className="text-text-muted text-xl font-bold tracking-tight">Configure your flight deck identity and preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Sidebar */}
          <div className="md:col-span-4 space-y-2">
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-accent/5 text-accent font-black text-sm uppercase tracking-widest border border-accent/10">
              <User size={20} />
              Identity
            </button>
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-text-muted hover:bg-surface-2 font-black text-sm uppercase tracking-widest transition-all">
              <Shield size={20} />
              Privacy
            </button>
            <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-text-muted hover:bg-surface-2 font-black text-sm uppercase tracking-widest transition-all">
              <Bell size={20} />
              Notifications
            </button>
          </div>

          {/* Form */}
          <div className="md:col-span-8">
            <form onSubmit={handleSubmit} className="bg-white border border-border rounded-[3rem] p-10 shadow-sm space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono ml-2">Public Name</label>
                  <input 
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full bg-surface-2 border border-border p-6 rounded-[2rem] font-bold text-xl focus:ring-4 focus:ring-accent/10 outline-none transition-all"
                    placeholder="Captain Marvel"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono ml-2">Rank</label>
                    <select 
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="w-full bg-surface-2 border border-border p-6 rounded-[2rem] font-bold focus:ring-4 focus:ring-accent/10 outline-none transition-all appearance-none"
                    >
                      <option value="Captain">Captain</option>
                      <option value="First Officer">First Officer</option>
                      <option value="Second Officer">Second Officer</option>
                      <option value="Cadet">Cadet</option>
                      <option value="Cabin Crew">Cabin Crew</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono ml-2">Main Carrier</label>
                    <input 
                      type="text"
                      value={formData.airline}
                      onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                      className="w-full bg-surface-2 border border-border p-6 rounded-[2rem] font-bold focus:ring-4 focus:ring-accent/10 outline-none transition-all"
                      placeholder="Malaysia Airlines"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono ml-2">Crew Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-surface-2 border border-border p-6 rounded-[2rem] font-bold focus:ring-4 focus:ring-accent/10 outline-none transition-all h-32"
                    placeholder="Tell your story..."
                  />
                </div>
              </div>

              {status.type && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-4 p-6 rounded-2xl ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                >
                  {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  <span className="font-bold">{status.text}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-accent/20"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save size={24} />}
                {isSaving ? 'Syncing...' : 'Save Flight Deck Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
