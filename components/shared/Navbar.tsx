'use client';

import React, { useState } from 'react';
import { Menu, X, Upload, LayoutDashboard, Calendar, MapPinned, ShoppingBag, Settings as SettingsIcon, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRoster } from '@/lib/contexts/RosterContext';
import { supabase } from '@/lib/utils/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export const Navbar = () => {
  const { user, setUser, openAuthModal } = useAuth();
  const { reset } = useRoster();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    reset();
  };

  const scrollToTop = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Timeline', href: '/', icon: LayoutDashboard, authRequired: true },
    { label: 'Calendar', href: '/calendar', icon: Calendar, authRequired: true },
    { label: 'Passport', href: '/profile', icon: MapPinned, authRequired: true },
    { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, authRequired: true },
    { label: 'Settings', href: '/settings', icon: SettingsIcon, authRequired: true },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-border z-[100] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={scrollToTop}
          >
            {/* Abstract Logo in Accent Color */}
            <div className="flex flex-col gap-1">
              <div className="w-6 h-1.5 bg-accent/20" />
              <div className="w-6 h-3 bg-accent/50" />
              <div className="w-6 h-6 bg-accent" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-text">Cemrosta</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 font-bold text-sm">
            {user ? (
              <>
                <div className="flex items-center gap-1 mr-6">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${pathname === link.href ? 'text-accent bg-accent/5' : 'text-text-muted hover:text-text hover:bg-surface-2'}`}
                    >
                      <link.icon size={20} />
                      {link.label}
                    </Link>
                  ))}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-text-muted hover:text-danger px-6 py-3 rounded-full transition-all active:scale-95 font-black uppercase text-[10px] tracking-widest"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => openAuthModal('login')}
                  className="text-text hover:bg-surface-2 px-8 py-3 rounded-full transition-all font-black uppercase text-[10px] tracking-widest"
                >
                  Log in
                </button>
                <button 
                  onClick={() => openAuthModal('signup')}
                  className="bg-accent text-accent-fg px-10 py-4 rounded-full hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-accent/10 font-bold flex items-center gap-3"
                >
                  <UserPlus size={18} strokeWidth={3} />
                  Join Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-4 -mr-4 text-text-muted hover:text-text transition-colors"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-0 w-full bg-white border-b border-border md:hidden p-6 space-y-6 shadow-2xl"
          >
            {user ? (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] font-bold text-lg ${pathname === link.href ? 'text-accent bg-accent/10' : 'text-text bg-surface-2'}`}
                    >
                      <link.icon size={24} />
                      {link.label}
                    </Link>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-5 text-text-muted font-black uppercase text-xs tracking-widest text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    scrollToTop();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 w-full px-8 py-6 text-accent-fg font-bold text-xl bg-accent rounded-[2rem] shadow-xl shadow-accent/20"
                >
                  <Upload size={24} strokeWidth={3} />
                  Upload Roster
                </button>
                <button 
                  onClick={() => {
                    openAuthModal('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-8 py-6 text-text font-black uppercase text-xs tracking-widest text-left border border-border rounded-[2rem] hover:bg-surface-2 transition-all"
                >
                  Sign In
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


