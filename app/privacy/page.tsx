import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata = {
  title: "Privacy Policy — Cemrosta",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface-2">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-48 pb-32">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6 font-mono">
          {"// DATA PROTECTION PROTOCOL"}
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-text tracking-tighter mb-16 leading-none">Privacy Policy</h1>
        
        <div className="bg-white border border-border rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-black/5 space-y-16 text-text-muted font-bold text-lg leading-snug tracking-tight">
          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">1. Data Sovereignty</h2>
            <p>
              At Cemrosta, we believe your flight data is yours. We only process your airline rosters to generate calendar files and destination patches. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">2. Information We Collect</h2>
            <p>
              When you upload a roster, we extract flight numbers, times, and destinations. This data is stored securely in our database to build your &ldquo;Passport&rdquo; profile. We also collect your email address for account authentication.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">3. Cookies &amp; Tracking</h2>
            <p>
              We use privacy-friendly analytics to understand how the application is used. We do not use cross-site tracking cookies or advertising pixels.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">4. Data Deletion</h2>
            <p>
              You can delete your account and all associated flight data at any time from the Settings menu. Once deleted, this action cannot be undone.
            </p>
          </section>

          <section className="pt-12 border-t border-border/50">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
              LAST UPDATED: MAY 15, 2026
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
