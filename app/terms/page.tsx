import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata = {
  title: "Terms of Service — Cemrosta",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface-2">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-48 pb-32">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6 font-mono">
          {"// OPERATIONAL STANDARDS"}
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-text tracking-tighter mb-16 leading-none">Terms of Service</h1>
        
        <div className="bg-white border border-border rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-black/5 space-y-16 text-text-muted font-bold text-lg leading-snug tracking-tight">
          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">1. Acceptable Use</h2>
            <p>
              Cemrosta is built for airline crew members. You agree to use the service only for personal, non-commercial purposes. Do not attempt to reverse engineer the parser or scrape data from the marketplace.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">2. Marketplace Conduct</h2>
            <p>
              The marketplace is a classifieds platform. Cemrosta does not process payments or verify items. You use the marketplace at your own risk. We reserve the right to remove any listing for any reason.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">3. Disclaimer of Liability</h2>
            <p>
              Cemrosta is provided &ldquo;as is&rdquo;. We are not responsible for errors in calendar synchronization, missed flights, or inaccuracies in the destination passport. Always verify your roster with your airline&apos;s official system.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-text mb-6 tracking-tight">4. Account Suspension</h2>
            <p>
              We reserve the right to suspend accounts that violate these terms, specifically those engaging in fraud on the marketplace or attempting to disrupt the service.
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
