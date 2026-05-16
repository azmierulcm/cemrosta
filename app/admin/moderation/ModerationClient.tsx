'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { supabase } from '@/lib/utils/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2, ShieldAlert, CheckCircle, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { DateTime } from 'luxon';

const ADMIN_EMAILS = ['azmierulchemat@gmail.com', 'admin@cemrosta.com'];

interface Report {
  reason: string;
  details: string;
  created_at: string;
  reporter_id: string;
}

interface ReportedListing {
  id: string;
  title: string;
  status: string;
  reports_count: number;
  image_urls: string[];
  created_at: string;
  profiles: {
    full_name: string;
    airline: string;
  };
  marketplace_reports: Report[];
}

export default function ModerationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [reportedListings, setReportedListings] = useState<ReportedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive isAdmin from user during render to avoid useEffect cascade
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  const fetchReportedListings = useCallback(async () => {
    if (!isAdmin) return;
    
    setTimeout(() => setIsLoading(true), 0);

    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          profiles(full_name, airline),
          marketplace_reports(reason, details, created_at, reporter_id)
        `)
        .gt('reports_count', 0)
        .order('reports_count', { ascending: false });

      if (error) throw error;
      setReportedListings((data as unknown as ReportedListing[]) || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReportedListings();
  }, [fetchReportedListings]);

  const handleDismiss = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ reports_count: 0, status: 'available' })
        .eq('id', listingId);

      if (error) throw error;
      
      // Optionally delete reports
      await supabase.from('marketplace_reports').delete().eq('listing_id', listingId);
      
      setReportedListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      alert('Failed to dismiss reports');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to permanently hide this listing?')) return;
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'hidden' })
        .eq('id', listingId);

      if (error) throw error;
      setReportedListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'hidden' } : l));
    } catch (err) {
      alert('Failed to hide listing');
    }
  };

  if (authLoading) return <div className="min-h-screen bg-surface-2 flex items-center justify-center"><Loader2 className="animate-spin text-accent w-10 h-10" /></div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-2 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white border border-border rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-black/5">
           <ShieldAlert size={48} className="text-danger" />
        </div>
        <h1 className="text-4xl font-bold text-text mb-4 tracking-tighter">Access Restricted.</h1>
        <p className="text-text-muted mb-10 font-bold text-lg max-w-md mx-auto leading-snug">This area is for Cemrosta administrators only. If you believe this is an error, please contact flight support.</p>
        <button onClick={() => window.location.href = '/'} className="px-10 py-4 bg-white border border-border rounded-full font-black text-xs uppercase tracking-widest text-text shadow-sm hover:bg-surface-2 transition-all">Return Home</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-2 pb-32">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-40 md:pt-48">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
              {"// HQ MODERATION CONSOLE"}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-text tracking-tighter">Moderation Queue</h1>
            <p className="text-xl text-text-muted font-bold mt-2">Review reported marketplace gear.</p>
          </div>
          <div className="bg-white border border-border px-8 py-4 rounded-full flex items-center gap-4 shadow-sm">
             <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(255,56,92,0.5)]" />
             <span className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] font-mono">{reportedListings.length} Reports Pending</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <Loader2 className="w-16 h-16 animate-spin text-accent mb-6" />
             <p className="text-text-subtle font-black uppercase tracking-[0.4em] text-xs font-mono">Querying Database...</p>
          </div>
        ) : reportedListings.length > 0 ? (
          <div className="space-y-10">
            {reportedListings.map((listing) => (
              <div key={listing.id} className="bg-white border border-border rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/5 hover:border-accent/10 transition-all group">
                <div className="w-full md:w-80 h-64 md:h-auto bg-surface-2 shrink-0 border-b md:border-b-0 md:border-r border-border overflow-hidden">
                  <img src={listing.image_urls?.[0]} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="flex-1 p-10 md:p-14 flex flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
                    <div>
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-3xl font-bold text-text tracking-tight">{listing.title}</h3>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          listing.status === 'hidden' ? 'bg-danger/5 text-danger border-danger/20' : 'bg-success/5 text-success border-success/20'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted font-bold tracking-tight">
                        Listed by <span className="text-text">{listing.profiles?.full_name}</span> <span className="mx-2 opacity-30">·</span> {DateTime.fromISO(listing.created_at).toFormat('LLL dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-danger text-white px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-danger/10 border border-white/20">
                        <AlertTriangle size={16} strokeWidth={3} />
                        {listing.reports_count} Flag{listing.reports_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-2 rounded-3xl p-8 mb-10 border border-border/50">
                    <div className="flex items-center gap-2 mb-6 text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] font-mono">
                      {"// REPORT LOGS"}
                    </div>
                    <div className="space-y-6">
                      {listing.marketplace_reports?.map((report, i) => (
                        <div key={i} className="border-l-2 border-accent/20 pl-6 relative">
                          <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-accent" />
                          <p className="text-xs font-black text-accent mb-2 uppercase tracking-widest font-mono">{report.reason}</p>
                          <p className="text-base text-text font-bold italic leading-snug tracking-tight mb-2">&ldquo;{report.details || 'No details provided'}&rdquo;</p>
                          <p className="text-[10px] text-text-subtle font-black uppercase tracking-widest font-mono opacity-50">{DateTime.fromISO(report.created_at).toFormat('LLL dd, yyyy, h:mm a')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-auto pt-6 border-t border-border/50">
                    <button 
                      onClick={() => handleDismiss(listing.id)}
                      className="flex-1 bg-success text-white py-5 rounded-full font-bold text-lg hover:bg-success/90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-success/10 active:scale-95"
                    >
                      <CheckCircle size={24} strokeWidth={2.5} />
                      Dismiss & Restore
                    </button>
                    <button 
                      onClick={() => handleDelete(listing.id)}
                      className="flex-1 bg-danger/5 text-danger border border-danger/10 py-5 rounded-full font-bold text-lg hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                    >
                      <Trash2 size={24} strokeWidth={2.5} />
                      Permanently Hide
                    </button>
                    <a 
                      href={`/marketplace?id=${listing.id}`} 
                      target="_blank"
                      className="w-16 h-16 bg-white border border-border rounded-full flex items-center justify-center text-text-subtle hover:text-text transition-all shadow-sm active:scale-95"
                    >
                      <ExternalLink size={24} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-border shadow-sm">
            <div className="w-24 h-24 bg-success/5 border border-success/10 rounded-full flex items-center justify-center mb-10 shadow-sm">
               <CheckCircle size={48} className="text-success" />
            </div>
            <h3 className="text-3xl font-bold text-text mb-3 tracking-tighter">Mission Clear.</h3>
            <p className="text-text-muted font-bold text-lg tracking-tight">No pending reports in the queue.</p>
          </div>
        )}
      </div>
    </main>
  );
}
