'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Briefcase, Home } from 'lucide-react';

const AUDIENCES = [
  {
    icon: PlaneTakeoff,
    title: "Flight Deck",
    desc: "Sync your block hours to local time. Build a verifiable map of your career missions.",
  },
  {
    icon: Briefcase,
    title: "Cabin Crew",
    desc: "Ditch the paper rosters. Track your city patches and share your monthly recap with the crew.",
  },
  {
    icon: Home,
    title: "Family",
    desc: "Know exactly where they are. View shared profiles to track flight status and return times.",
  },
];

export const AudienceSection = () => {
  return (
    <section className="py-40 px-4 bg-surface-2">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
            {"// OPERATIONAL VERSATILITY"}
          </div>
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-text leading-none">
            Built for the <br /><span className="text-accent">whole crew.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {AUDIENCES.map((audience, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-border p-12 rounded-[2.5rem] hover:shadow-2xl hover:shadow-black/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-3xl bg-surface-2 border border-border flex items-center justify-center mb-10 group-hover:bg-accent/5 group-hover:border-accent/10 transition-all duration-500">
                 <audience.icon size={28} className="text-text-muted group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-3xl font-bold text-text mb-6 tracking-tighter">{audience.title}</h3>
              <p className="text-text-muted font-bold leading-snug text-lg tracking-tight">
                {audience.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
