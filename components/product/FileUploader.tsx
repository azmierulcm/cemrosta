'use client';

import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRoster } from '@/lib/contexts/RosterContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { parseRoster } from '@/lib/actions/parseRoster';

export const FileUploader = () => {
  const shouldReduceMotion = useReducedMotion();
  const { isLoading, setLoading, error, setError, setRoster } = useRoster();
  const { user } = useAuth();
  const userId = user?.id;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      console.warn('No file accepted');
      return;
    }

    console.log('File accepted:', file.name, file.type, file.size);
    setError(null);
    setLoading(true);
    
    // Create FormData for the Server Action
    const formData = new FormData();
    formData.append('file', file);
    if (userId) {
      formData.append('userId', userId);
    }

    try {
      const result = await parseRoster(formData);
      await setRoster(result);
      setLoading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse roster');
      setLoading(false);
    }
  }, [setLoading, setError, setRoster, userId]);

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
    <div className="max-w-2xl mx-auto px-4">
      <div {...getRootProps()}>
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
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
