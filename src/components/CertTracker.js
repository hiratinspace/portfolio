import React from 'react';
import { Zap } from 'lucide-react';

const FONT = "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace";

// ─── Edit this data to update your progress ──────────────────────────────────
const PLATFORM_PROGRESS = [
  { name: 'HackTheBox', progress: 12, color: '#ef4444', label: 'machines rooted' },
  { name: 'TryHackMe',  progress: 18, color: '#ff7a20', label: 'rooms completed' },
  { name: 'picoCTF',    progress: 42, color: '#f5c518', label: 'challenges solved' },
];
// ──────────────────────────────────────────────────────────────────────────────

const CertTracker = () => {
  return (
    <section id="cert-roadmap" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <Zap className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
          <div>
            <h2 style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>PRACTICE PLATFORMS</h2>
            <p style={{ color: 'rgba(209,213,219,0.75)', fontSize: 13, marginTop: 4, fontFamily: FONT }}>Hands-on reps outside of class: CTFs, labs, and practice machines.</p>
          </div>
        </div>

        {/* Terminal-style readout: raw counts, no implied maximum */}
        <div
          className="border border-red-900/50 bg-black/60 max-w-2xl"
          style={{ fontFamily: FONT }}
        >
          <div className="px-4 py-2 border-b border-red-900/40 text-xs text-gray-400">
            <span className="text-red-400">$</span> practice --stats
          </div>
          <ul className="px-4 py-3 space-y-2">
            {PLATFORM_PROGRESS.map(p => (
              <li key={p.name} className="flex items-baseline gap-3 text-sm sm:text-base">
                <span
                  className="font-semibold py-1"
                  style={{ color: p.color }}
                >
                  {p.name}
                </span>
                <span aria-hidden="true" className="flex-1 border-b border-dotted border-red-900/70 translate-y-[-4px]" />
                <span className="text-white font-bold tabular-nums">{p.progress}</span>
                <span className="text-gray-300">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CertTracker;
