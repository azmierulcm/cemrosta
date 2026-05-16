'use client';

import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle, XCircle, Plane, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRoster } from '@/lib/contexts/RosterContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { parseRoster } from '@/lib/actions/parseRoster';
import { RosterData } from '@/lib/types';

export const FileUploader = () => {
  const shouldReduceMotion = useReducedMotion();
  const { history, isLoading, setLoading, error, setError, setRoster, syncToSupabase } = useRoster();
  const { user } = useAuth();
  
  const [previewData, setPreviewData] = React.useState<RosterData | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncSuccess, setSyncSyncSuccess] = React.useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    setPreviewData(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await parseRoster(formData);
      setPreviewData(result);
      setLoading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse roster');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const handleConfirmSync = async () => {
    if (!previewData) return;

    // Check for duplicate month in history
    const isDuplicate = history.some(
      (h) => h.month.toLowerCase() === previewData.month.toLowerCase() && h.year === previewData.year
    );

    if (isDuplicate) {
      setError(`A roster for ${previewData.month} ${previewData.year} already exists in your history. Please delete the existing records first if you wish to re-upload.`);
      return;
    }

    setIsSyncing(true);
    
    const result = await syncToSupabase(previewData);
    if (result.success) {
      setSyncSyncSuccess(true);
      // Wait a moment for the user to see success before redirecting to dashboard
      setTimeout(() => {
        setRoster(previewData); // This triggers the switch to Dashboard in HomeClient
      }, 1500);
    } else {
      setError(result.error || 'Failed to save to database');
    }
    setIsSyncing(false);
  };

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const error = fileRejections[0]?.errors[0];
    console.error('File rejected:', fileRejections);
    if (error?.code === 'file-invalid-type') {
      setError('Invalid file type. Please upload a PDF roster.');
    } else {
      setError(error?.message || 'File upload failed');
    }
  }, [setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'application/x-pdf': ['.pdf'],
      'application/octet-stream': ['.pdf']
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 w-full">
      <AnimatePresence mode="wait">
        {!previewData ? (
          <div {...getRootProps()}>
            <motion.div
              key="dropzone"
              whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`
                relative cursor-pointer rounded-[2.5rem] border-2 border-dashed transition-all duration-300
                p-14 flex flex-col items-center justify-center gap-6
                ${isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40 hover:bg-surface-2'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <div className={`
                w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500
                ${isDragActive ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'bg-surface-2 text-text-subtle border border-border'}
              `}>
                {isLoading ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10" strokeWidth={2.5} />
                )}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-text tracking-tight">
                  {isLoading ? 'Parsing your mission...' : 'Drop your roster PDF here'}
                </p>
                <p className="text-text-muted mt-2 font-bold tracking-tight">
                  {isLoading ? 'Hold tight, we\'re decoding the flight data' : 'or click to browse from your computer'}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-text-subtle bg-surface-2 border border-border px-5 py-2.5 rounded-full font-mono uppercase tracking-[0.2em]">
                <FileText className="w-4 h-4 text-accent" />
                PDF ROSTERS ONLY
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-border rounded-[3rem] p-10 shadow-2xl shadow-black/5"
          >
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-border">
               <div>
                  <h3 className="text-2xl font-black text-text tracking-tighter uppercase italic">Preview.</h3>
                  <p className="text-sm font-bold text-text-muted">{previewData.month} {previewData.year} Roster</p>
               </div>
               <div className="bg-surface-2 px-6 py-2.5 rounded-full border border-border flex items-center gap-3">
                  <Plane className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-black text-text uppercase tracking-widest font-mono">
                    {previewData.events.filter(e => e.type === 'FLIGHT').length} Sectors Found
                  </span>
               </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-10 pr-2 custom-scrollbar">
               {previewData.events.slice(0, 8).map((event, i) => (
                 <div key={i} className="flex items-center justify-between p-5 bg-surface-2 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-5">
                       <span className="text-[10px] font-black text-text-subtle font-mono">{event.date.split('-').slice(2).join('')}</span>
                       <span className="font-bold text-text tracking-tight">
                         {event.type === 'FLIGHT' ? `${event.flightNumber} (${event.depPort}-${event.arrPort})` : event.description}
                       </span>
                    </div>
                    <span className="text-[10px] font-black text-text-subtle font-mono uppercase tracking-widest">{event.std || event.signOn}</span>
                 </div>
               ))}
               {previewData.events.length > 8 && (
                 <p className="text-center text-[10px] font-black text-text-subtle uppercase tracking-widest pt-4">
                   + {previewData.events.length - 8} more missions...
                 </p>
               )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
               <button 
                 onClick={() => setPreviewData(null)}
                 disabled={isSyncing || syncSuccess}
                 className="flex-1 bg-surface-2 text-text border border-border py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-border transition-all disabled:opacity-50"
               >
                 Re-upload
               </button>
               <button 
                 onClick={handleConfirmSync}
                 disabled={isSyncing || syncSuccess}
                 className={`
                    flex-[2] py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
                    ${syncSuccess ? 'bg-success text-white shadow-success/20' : 'bg-accent text-accent-fg shadow-accent/20 hover:bg-accent-hover'}
                    ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
               >
                 {isSyncing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Syncing...
                    </>
                 ) : syncSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Saved Successfully
                    </>
                 ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Save to Dashboard
                    </>
                 )}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-8 p-6 bg-danger/5 border border-danger/10 rounded-[2rem] flex items-center gap-4 text-danger shadow-sm"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div className="flex-1 text-sm font-bold tracking-tight">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="p-2 hover:bg-danger/10 rounded-xl transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
