import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { RosterProvider } from "@/lib/contexts/RosterContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cemrosta.vercel.app"),
  title: {
    default: "Cemrosta | The Crew Passport",
    template: "%s — Cemrosta",
  },
  description: "Convert your airline roster to calendar and build your digital destination passport.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: "https://cemrosta.vercel.app",
    siteName: "Cemrosta",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@cemrosta",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text selection:bg-accent/30">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-accent-fg focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:shadow-2xl"
        >
          Skip to content
        </a>
        <AuthProvider>
          <RosterProvider>
            {children}
          </RosterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
