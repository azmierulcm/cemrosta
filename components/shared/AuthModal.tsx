'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/utils/supabase';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authView, setAuthView, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isLogin = authView === 'login';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user);
        closeAuthModal();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user && data.session) {
          setUser(data.user);
          closeAuthModal();
        } else {
          setError('Check your email for the confirmation link!');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-md rounded-[3rem] p-12 md:p-14 relative z-10 shadow-2xl overflow-hidden border border-border"
      >
        <button onClick={closeAuthModal} className="absolute top-10 right-10 p-3 hover:bg-surface-2 rounded-full transition-colors text-text-muted">
          <X size={24} />
        </button>

        <div className="w-20 h-20 bg-accent/5 border border-accent/10 rounded-3xl flex items-center justify-center mb-10 shadow-sm">
           {isLogin ? <LogIn className="text-accent w-10 h-10" /> : <UserPlus className="text-accent w-10 h-10" />}
        </div>

        <div className="mb-12">
          <h2 className="text-4xl font-black text-text mb-3 tracking-tighter">
            {isLogin ? 'Welcome back.' : 'Join the crew.'}
          </h2>
          <p className="text-text-muted font-bold italic text-lg leading-snug tracking-tight">
            {isLogin ? 'Log in to manage your mission data.' : 'Create your account to transform your schedule.'}
          </p>
        </div>

        {error && (
          <div className={`mb-8 p-6 rounded-2xl flex items-start gap-4 text-sm font-bold border shadow-sm ${
            error.includes('Check your email') ? 'bg-success/5 text-success border-success/10' : 'bg-danger/5 text-danger border-danger/10'
          }`}>
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="leading-snug">{error}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
              <input 
                type="email" 
                placeholder="Aviation Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-2 border border-border pl-16 pr-8 py-6 rounded-2xl font-bold placeholder:text-text-subtle focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-text-subtle" size={20} />
              <input 
                type="password" 
                placeholder="Secure Password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-2 border border-border pl-16 pr-8 py-6 rounded-2xl font-bold placeholder:text-text-subtle focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm"
              />
            </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-accent text-accent-fg py-6 rounded-full font-black text-xl shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : isLogin ? 'LOG IN →' : 'SIGN UP →'}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-border/50 text-center">
          <p className="text-text-muted font-bold">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button 
              onClick={() => {
                setAuthView(isLogin ? 'signup' : 'login');
                setError(null);
              }}
              className="ml-2 text-accent font-black hover:underline underline-offset-4"
            >
              {isLogin ? 'Create Account' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
