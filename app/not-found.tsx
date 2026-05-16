import Link from 'next/link';
import { PlaneLanding, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 selection:bg-accent/30 selection:text-accent-fg">
      <div className="relative mb-12">
        <div className="w-24 h-24 bg-surface rounded-3xl border border-border flex items-center justify-center animate-pulse">
          <PlaneLanding size={48} className="text-text-subtle" />
        </div>
        <div className="absolute -top-4 -right-4 bg-danger text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
          404
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-text tracking-tighter mb-4 text-center">
        Off Course.
      </h1>
      <p className="text-xl text-text-muted font-medium mb-12 text-center max-w-md leading-relaxed">
        The sector you&apos;re looking for doesn&apos;t exist in our database. Let&apos;s get you back to base.
      </p>

      <Link 
        href="/" 
        className="bg-accent text-accent-fg px-10 py-5 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 text-lg"
      >
        <Home size={20} strokeWidth={3} />
        Back to Dashboard
      </Link>

      <div className="mt-20 flex flex-col items-center gap-4 opacity-40 grayscale pointer-events-none">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-border rounded-full" />
          <div className="w-8 h-1 bg-border rounded-full" />
          <div className="w-20 h-1 bg-accent rounded-full" />
          <div className="w-8 h-1 bg-border rounded-full" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] font-mono text-text-subtle">
          {"// SIGNAL LOST // GPS MALFUNCTION"}
        </p>
      </div>
    </main>
  );
}
