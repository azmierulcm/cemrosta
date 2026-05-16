'use client';

import React from 'react';
import Link from 'next/link';
import { X, Camera, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="flex flex-col gap-1">
                <div className="w-5 h-1 bg-accent/20" />
                <div className="w-5 h-2 bg-accent/50" />
                <div className="w-5 h-4 bg-accent" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-text">Cemrosta</span>
            </Link>
            <p className="text-text-muted text-sm font-bold leading-snug mb-8 tracking-tight">
              Made for the crew, by the crew. <br />
              Own your flight data.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="w-10 h-10 bg-surface-2 border border-border rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-all hover:shadow-sm">
                <X size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 bg-surface-2 border border-border rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-all hover:shadow-sm">
                <Camera size={18} />
              </Link>
              <a href="mailto:hello@cemrosta.com" className="w-10 h-10 bg-surface-2 border border-border rounded-full flex items-center justify-center text-text-muted hover:text-accent transition-all hover:shadow-sm">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle mb-8 font-mono">{"// PRODUCT"}</h4>
            <ul className="space-y-4">
              <li><Link href="/profile" className="text-sm font-bold text-text-muted hover:text-text transition-colors">Digital Passport</Link></li>
              <li><Link href="/marketplace" className="text-sm font-bold text-text-muted hover:text-text transition-colors">Marketplace</Link></li>
              <li><Link href="#" className="text-sm font-bold text-text-muted hover:text-text transition-colors">Mobile Sync</Link></li>
            </ul>
          </div>

          {/* Supported Airlines */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle mb-8 font-mono">{"// FLEET SUPPORT"}</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(0,138,5,0.3)]" />
                <span className="text-sm font-bold text-text">Malaysia Airlines</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <span className="w-2 h-2 rounded-full bg-text-subtle" />
                <span className="text-sm font-bold text-text-muted">AirAsia (Soon)</span>
              </li>
              <li className="flex items-center gap-3 opacity-40">
                <span className="w-2 h-2 rounded-full bg-text-subtle" />
                <span className="text-sm font-bold text-text-muted">Batik Air (Soon)</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-subtle mb-8 font-mono">{"// LEGAL"}</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-sm font-bold text-text-muted hover:text-text transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-bold text-text-muted hover:text-text transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono">
            © 2026 Cemrosta • All Flights Reserved
          </p>
          <div className="text-[10px] font-black text-text-subtle uppercase tracking-[0.4em] font-mono bg-surface-2 px-4 py-1 rounded-full border border-border">
            BUILD 26.05.15
          </div>
        </div>
      </div>
    </footer>
  );
};
