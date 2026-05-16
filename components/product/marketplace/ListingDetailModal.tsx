'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, AlertTriangle, Flag, Clock, Loader2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAuth } from '@/lib/contexts/AuthContext';
import { trackEvent } from '@/lib/analytics/events';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  image_urls: string[];
  seller_id: string;
  created_at: string;
  expires_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
    rank: string;
    airline?: string;
    verified_at?: string | null;
  };
}

export const ListingDetailModal = ({ listing, isOpen, onClose }: { listing: Listing | null, isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const [currentImg, setCurrentImg] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!listing) return null;

  const handleReport = async () => {
    if (!user) {
      alert('You must be logged in to report a listing.');
      return;
    }
    setIsSubmittingReport(true);
    try {
      const { reportListing } = await import('@/lib/actions/marketplace');
      await reportListing({
        listingId: listing.id,
        reporterId: user.id,
        reason: reportReason,
        details: reportDetails
      });
      trackEvent('MARKETPLACE_REPORT_SUBMITTED', { listing_id: listing.id, reason: reportReason });
      setReportSuccess(true);
      setTimeout(() => {
        setIsReporting(false);
        setReportSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to report:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const images = (listing.image_urls && listing.image_urls.length > 0) 
    ? listing.image_urls 
    : ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"];

  const isVerified = !!listing.profiles?.verified_at;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 text-left">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-6xl md:rounded-[3rem] relative z-10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-full md:h-[85vh]"
          >
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 z-50 p-4 bg-white/95 backdrop-blur-md hover:bg-white rounded-full transition-all shadow-xl border border-border"
            >
              <X size={20} className="text-text" strokeWidth={2.5} />
            </button>

            {/* Left: Image Carousel */}
            <div className="w-full md:w-3/5 bg-surface-2 relative group h-1/3 md:h-full">
              <img 
                src={images[currentImg]} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev > 0 ? prev - 1 : images.length - 1)); }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentImg(prev => (prev < images.length - 1 ? prev + 1 : 0)); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/90 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                  >
                    <ChevronRight size={24} />
                  </button>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                     {images.map((_, i) => (
                       <div key={i} className={`h-2 rounded-full transition-all ${i === currentImg ? 'bg-white w-8 shadow-sm' : 'bg-white/40 w-2'}`} />
                     ))}
                  </div>
                </>
              )}
            </div>

            {/* Right: Details Section */}
            <div className="w-full md:w-2/5 p-10 md:p-14 overflow-y-auto no-scrollbar flex flex-col bg-white">
              <div className="mb-10">
                 <div className="flex flex-wrap items-center gap-3 mb-8">
                    {isVerified ? (
                      <div className="bg-success/5 text-success px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-success/10 flex items-center gap-2 shadow-sm">
                        <ShieldCheck size={16} strokeWidth={3} />
                        Verified {listing.profiles?.airline || 'Crew'}
                      </div>
                    ) : (
                      <div className="bg-surface-2 text-text-subtle px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-border flex items-center gap-2">
                        <AlertTriangle size={16} strokeWidth={3} />
                        Unverified Seller
                      </div>
                    )}
                 </div>
                 
                 <h2 className="text-4xl font-bold text-text leading-tight mb-4 tracking-tighter">{listing.title}</h2>
                 <p className="text-5xl font-black text-accent tracking-tighter mb-10">RM{listing.price.toLocaleString()}</p>

                 <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-surface-2 p-5 rounded-2xl border border-border shadow-sm">
                       <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2 font-mono">Category</p>
                       <p className="text-sm font-bold text-text">{listing.category}</p>
                    </div>
                    <div className="bg-surface-2 p-5 rounded-2xl border border-border shadow-sm">
                       <p className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-2 font-mono">Condition</p>
                       <p className="text-sm font-bold text-text">{listing.condition}</p>
                    </div>
                 </div>

                 <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl mb-10 shadow-sm">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2 font-mono">
                       <AlertTriangle size={14} strokeWidth={3} />
                       Buyer Protection
                    </p>
                    <p className="text-[11px] text-text-muted leading-snug font-bold tracking-tight">
                       Cemrosta is not responsible for transactions. Arrange directly with the seller. Meet in a safe public location and verify authenticity.
                    </p>
                 </div>
              </div>

              <div className="prose prose-sm text-text-muted font-bold text-lg leading-snug tracking-tight mb-14 flex-1">
                 <p className="whitespace-pre-wrap">{listing.description || "No description provided."}</p>
              </div>

              <div className="space-y-8 mt-auto pt-8 border-t border-border/50">
                 {/* Seller Card */}
                 <div className="bg-surface-2 p-6 rounded-[2rem] border border-border flex items-center gap-5 group transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-border overflow-hidden relative shadow-sm">
                       <img 
                         src={listing.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${listing.seller_id}`} 
                         alt="Seller" 
                         className="w-full h-full object-cover" 
                       />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-text-subtle uppercase tracking-widest mb-1 font-mono">Listed By</p>
                      <p className="text-xl font-bold text-text tracking-tight">{listing.profiles?.full_name || "Crew Member"}</p>
                      <p className="text-xs text-accent font-black uppercase tracking-widest">{listing.profiles?.rank || 'Malaysia Airlines'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <button className="flex-1 bg-accent text-accent-fg py-6 rounded-full font-bold text-xl hover:bg-accent-hover transition-all active:scale-[0.98] shadow-2xl shadow-accent/20 flex items-center justify-center gap-4">
                       <MessageCircle size={24} strokeWidth={2.5} />
                       Contact Seller
                    </button>
                    <button 
                      onClick={() => setIsReporting(true)}
                      className="w-16 h-16 bg-white border border-border rounded-full flex items-center justify-center text-text-subtle hover:text-danger hover:border-danger/30 transition-all active:scale-95 shadow-sm"
                      title="Report Listing"
                    >
                       <Flag size={24} />
                    </button>
                 </div>
                 
                 <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono">
                       <Clock size={14} className="text-accent" />
                       Expires {DateTime.fromISO(listing.expires_at).toFormat('LLL dd, yyyy')}
                    </div>
                    <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest font-mono bg-surface-2 px-3 py-1 rounded-full border border-border">
                       ID: {listing.id.slice(0, 8)}
                    </div>
                 </div>
              </div>
            </div>

            {/* Reporting Overlay */}
            <AnimatePresence>
              {isReporting && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-xl flex items-center justify-center p-10"
                >
                  <div className="w-full max-w-md">
                    {reportSuccess ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-success/10 text-success rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                          <ShieldCheck size={48} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl font-bold text-text mb-4 tracking-tighter">Report Submitted.</h3>
                        <p className="text-text-muted font-bold text-lg leading-snug">Thank you for helping keep our community safe. Our flight deck team will review this listing shortly.</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-4xl font-bold text-text mb-3 tracking-tighter">Report Listing</h3>
                        <p className="text-text-muted font-bold text-lg tracking-tight mb-10">Tell us what&apos;s wrong with this listing. Your report is anonymous.</p>
                        
                        <div className="space-y-4 mb-10">
                          {['spam', 'fraud', 'inappropriate', 'other'].map((reason) => (
                            <button
                              key={reason}
                              onClick={() => setReportReason(reason)}
                              className={`w-full p-5 rounded-2xl border transition-all text-left flex items-center justify-between group shadow-sm ${
                                reportReason === reason 
                                  ? 'bg-accent/5 border-accent text-accent' 
                                  : 'bg-white border-border text-text-muted hover:border-accent/30'
                              }`}
                            >
                              <span className="font-black uppercase text-xs tracking-widest">{reason}</span>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                reportReason === reason ? 'border-accent bg-accent' : 'border-border group-hover:border-accent/40'
                              }`}>
                                {reportReason === reason && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                              </div>
                            </button>
                          ))}
                        </div>

                        <div className="mb-10">
                          <label className="text-[10px] font-black text-text-subtle uppercase tracking-[0.2em] mb-3 block font-mono px-1">Additional Details</label>
                          <textarea 
                            value={reportDetails}
                            onChange={(e) => setReportDetails(e.target.value)}
                            placeholder="Please provide more context for our moderators..."
                            className="w-full bg-surface-2 border border-border rounded-2xl p-5 text-text font-bold placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all h-40 resize-none shadow-sm"
                          />
                        </div>

                        <div className="flex gap-4">
                          <button 
                            onClick={() => setIsReporting(false)}
                            className="flex-1 py-5 bg-white border border-border rounded-full font-bold text-text hover:bg-surface-2 transition-all active:scale-95 shadow-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            disabled={isSubmittingReport}
                            onClick={handleReport}
                            className="flex-1 py-5 bg-danger text-white rounded-full font-bold text-lg hover:bg-danger/90 transition-all active:scale-95 shadow-xl shadow-danger/20 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                          >
                            {isSubmittingReport ? (
                              <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                              <>Submit Report</>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
