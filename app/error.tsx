'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { captureException } from '@/lib/monitoring/sentry';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 selection:bg-accent/30 selection:text-accent-fg">
      <div className="relative mb-12">
        <div className="w-24 h-24 bg-danger/10 rounded-3xl border border-danger/20 flex items-center justify-center">
          <AlertTriangle size={48} className="text-danger" />
        </div>
        <div className="absolute -top-4 -right-4 bg-danger text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          ERROR
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-text tracking-tighter mb-4 text-center">
        Technical Failure.
      </h1>
      <p className="text-xl text-text-muted font-medium mb-12 text-center max-w-md leading-relaxed">
        Our systems encountered an unexpected error. This has been logged and we&apos;re on it.
      </p>

      <button
        onClick={() => reset()}
        className="bg-accent text-accent-fg px-10 py-5 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 text-lg"
      >
        <RotateCcw size={20} strokeWidth={3} />
        Retry Systems
      </button>

      <div className="mt-20 flex flex-col items-center gap-4 opacity-40 pointer-events-none">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-danger rounded-full animate-ping" />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] font-mono text-danger">
            {"// EMERGENCY DESCENT // SYSTEM_OVERLOAD"}
          </p>
        </div>
        <div className="bg-surface p-3 rounded-lg border border-border">
          <code className="text-[9px] font-mono text-text-subtle">
            {error.digest || error.message || 'UNKNOWN_EXCEPTION'}
          </code>
        </div>
      </div>
    </main>
  );
}
