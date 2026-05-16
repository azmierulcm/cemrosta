'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileUp, CalendarSync, MapPinned } from 'lucide-react';

const STEPS = [
  {
    icon: FileUp,
    title: "Drop Roster",
    desc: "Drag your Malaysia Airlines AIMS PDF into the dash. We extract every flight and duty instantly.",
  },
  {
    icon: CalendarSync,
    title: "Sync Calendar",
    desc: "Download the .ics file and sync to iPhone or Google Calendar. All times converted to local automatically.",
  },
  {
    icon: MapPinned,
    title: "Collect Cities",
    desc: "Every destination flown earns a digital patch. Watch your lifetime passport grow with every mission.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-40 px-4 bg-surface-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-24">
          <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-subtle font-mono">
            {"// OPERATIONAL PROTOCOL"}
          </div>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-text leading-none">
            Three steps. <br />
            <span className="text-text-subtle opacity-40 italic font-serif font-light">Ready in seconds.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-white border border-border flex items-center justify-center mb-10 group-hover:border-accent group-hover:shadow-2xl group-hover:shadow-black/5 transition-all duration-500 shadow-sm">
                 <step.icon size={32} strokeWidth={2.5} className="text-accent" />
              </div>
              <div className="flex items-center gap-6 mb-6">
                 <span className="text-[12px] font-black font-mono text-accent bg-accent/5 px-3 py-1 rounded-full border border-accent/10">0{i + 1}</span>
                 <h3 className="text-3xl font-bold text-text tracking-tighter uppercase italic">{step.title}</h3>
              </div>
              <p className="text-text-muted font-bold leading-snug text-xl tracking-tight">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
