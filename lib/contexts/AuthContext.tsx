'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/utils/supabase';

export interface Profile {
  id: string;
  full_name?: string;
  rank?: string;
  airline?: string;
  bio?: string;
  avatar_url?: string;
  gallery_urls?: string[];
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthModalOpen: boolean;
  authView: 'login' | 'signup';
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthView: (view: 'login' | 'signup') => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('signup');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setProfile(data as Profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (view: 'login' | 'signup' = 'signup') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthModalOpen,
        authView,
        setUser,
        setProfile,
        openAuthModal,
        closeAuthModal,
        setAuthView,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
