import { Metadata } from "next";
import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Your passport — Cemrosta",
  description: "Your lifetime flight passport. Destinations, sectors, block hours, and monthly recap.",
  alternates: {
    canonical: "/profile",
  },
  openGraph: {
    title: "Your passport — Cemrosta",
    description: "Track your career milestones, destination stamps, and flight stats in one place.",
    images: ["/api/og/profile"],
  },
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileClient />
    </Suspense>
  );
}
