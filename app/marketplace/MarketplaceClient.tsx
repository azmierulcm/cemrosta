'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { MarketplaceCard } from '@/components/product/marketplace/MarketplaceCard';
import { CreateAdModal } from '@/components/product/marketplace/CreateAdModal';
import { ListingDetailModal } from '@/components/product/marketplace/ListingDetailModal';
import { Search, Plus, Loader2, PackageOpen, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/utils/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/events';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  seller_id: string;
  image_urls?: string[];
  created_at: string;
  expires_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    rank: string;
    airline: string;
    verified_at: string | null;
  };
}

const CATEGORIES = ["All", "Headsets", "Luggage", "Watches", "Uniforms", "Manuals", "Other"];
const CONDITIONS = ["All", "New", "Lightly used", "Well used", "For parts"];

export default function MarketplaceClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCondition, setActiveCondition] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?auth=required&returnTo=/marketplace');
    }
  }, [user, authLoading, router]);

  const fetchListings = useCallback(async () => {
    if (!user) return;
    
    setTimeout(() => setIsLoading(true), 0);
    
    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*, profiles(full_name, avatar_url, rank, airline, verified_at)')
        .eq('status', 'available')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (activeCategory !== "All") {
        query = query.eq('category', activeCategory);
      }

      if (activeCondition !== "All") {
        query = query.eq('condition', activeCondition);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = (data as unknown as Listing[]) || [];
      if (verifiedOnly) {
        filteredData = filteredData.filter(item => item.profiles?.verified_at);
      }

      setListings(filteredData);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, activeCategory, activeCondition, searchQuery, verifiedOnly]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-surface-2 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-surface-2 pb-32">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-40 md:pt-48">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4 font-mono">
              {"// CREW EXCLUSIVE ACCESS"}
            </div>
            <h1 className="text-5xl md:text-8xl font-bold text-text tracking-tighter mb-4">Marketplace</h1>
            <p className="text-xl md:text-2xl text-text-muted font-bold tracking-tight">Premium gear for aviation professionals.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-accent text-accent-fg px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-accent/10 hover:bg-accent-hover active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus size={20} strokeWidth={3} />
            Sell an Item
          </button>
        </div>

        {/* Disclaimer Strip */}
        <div className="bg-white border border-border p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 mb-20 shadow-2xl shadow-black/5">
           <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="text-orange-600" size={32} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <p className="text-lg font-black text-text mb-2 uppercase tracking-widest font-mono">Buyer Protection Warning</p>
              <p className="text-sm text-text-muted leading-snug font-bold tracking-tight">
                Cemrosta is a platform for crew connectivity. We do not process payments or hold items in escrow. Arrange directly with the seller. Meet in a safe public location and verify authenticity before transaction.
              </p>
           </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-10 mb-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:flex-1 relative">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-text-subtle" size={24} />
              <input 
                type="text" 
                placeholder="Search headsets, luggage, watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-border pl-20 pr-10 py-6 rounded-full font-bold text-lg focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all text-text shadow-sm placeholder:text-text-subtle/50"
              />
            </div>
            
            <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-full border border-border shadow-sm">
               <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">Verified Sellers Only</span>
               <button 
                 onClick={() => setVerifiedOnly(!verifiedOnly)}
                 className={`w-14 h-8 rounded-full transition-all relative ${verifiedOnly ? 'bg-accent shadow-lg shadow-accent/20' : 'bg-surface-2 border border-border'}`}
               >
                 <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${verifiedOnly ? 'left-7.5' : 'left-1.5'}`} />
               </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest mr-6 font-mono">Filter by Category</span>
             <div className="flex flex-wrap gap-3">
               {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                      px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border whitespace-nowrap transition-all
                      ${activeCategory === cat 
                        ? 'bg-accent border-accent text-accent-fg shadow-xl shadow-accent/10' 
                        : 'bg-white border-border text-text-muted hover:border-accent/40 hover:text-accent shadow-sm'}
                    `}
                  >
                    {cat}
                  </button>
               ))}
             </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <span className="text-[10px] font-black text-text-subtle uppercase tracking-widest mr-6 font-mono">Filter by Condition</span>
             <div className="flex flex-wrap gap-3">
               {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setActiveCondition(cond)}
                    className={`
                      px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest border whitespace-nowrap transition-all
                      ${activeCondition === cond 
                        ? 'bg-text border-text text-white shadow-xl shadow-black/10' 
                        : 'bg-white border-border text-text-muted hover:border-text shadow-sm'}
                    `}
                  >
                    {cond}
                  </button>
               ))}
             </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <Loader2 className="w-16 h-16 animate-spin text-accent mb-6" />
             <p className="text-text-subtle font-black uppercase tracking-[0.4em] text-xs font-mono">Scanning Inventory...</p>
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-20">
            {listings.map((item) => (
              <div 
                key={item.id} 
                onClick={() => {
                  setSelectedListing(item);
                  trackEvent('MARKETPLACE_LISTING_VIEWED', { listing_id: item.id });
                }} 
                className="cursor-pointer"
              >
                <MarketplaceCard listing={{
                  ...item,
                  image: (item.image_urls && item.image_urls.length > 0) ? item.image_urls[0] : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
                  seller: item.profiles?.full_name || "Crew Member",
                  avatar: item.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${item.seller_id}`,
                  isVerified: !!item.profiles?.verified_at,
                  airline: item.profiles?.airline
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-border shadow-sm">
             <PackageOpen className="w-24 h-24 text-text-subtle mb-8" strokeWidth={1.5} />
             <h3 className="text-3xl font-bold text-text mb-3 tracking-tighter">No active listings found.</h3>
             <p className="text-text-muted font-bold text-lg tracking-tight">Be the first to list your gear in this category.</p>
          </div>
        )}
      </div>

      <CreateAdModal isOpen={isCreateModalOpen} onClose={() => {
        setIsCreateModalOpen(false);
        fetchListings(); // Refresh list after closing sell modal
      }} />

      <ListingDetailModal 
        key={selectedListing?.id || 'none'}
        listing={selectedListing} 
        isOpen={!!selectedListing} 
        onClose={() => setSelectedListing(null)} 
      />
    </main>
  );
}
