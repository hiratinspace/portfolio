import React from 'react';
import { ExternalLink, Zap } from 'lucide-react';

const FONT = "'Monaco', 'Courier New', monospace";

// ─── Edit this data to update your progress ──────────────────────────────────
const PLATFORM_PROGRESS = [
  { name: 'HackTheBox', url: 'https://hackthebox.com', progress: 12, color: '#ef4444', label: 'machines rooted' },
  { name: 'TryHackMe',  url: 'https://tryhackme.com',  progress: 18, color: '#ff7a20', label: 'rooms completed' },
  { name: 'picoCTF',    url: 'https://picoctf.org',    progress: 42, color: '#f5c518', label: 'challenges solved' },
];
// ──────────────────────────────────────────────────────────────────────────────

const CertTracker = () => {
  return (
    <section id="cert-roadmap" className="py-16 sm:py-24 bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
      <style>{`
        @keyframes barGrow { from{width:0} to{width:var(--w)} }
        .bar-animated { animation: barGrow 0.8s ease forwards; }
      `}</style>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <Zap className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
          <div>
            <h2 style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>PRACTICE PLATFORMS</h2>
            <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 11, letterSpacing: 3, marginTop: 3, fontFamily: FONT }}>HANDS-ON PROGRESS</p>
          </div>
        </div>

        {/* Platform progress bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PLATFORM_PROGRESS.map(p => (
            <div key={p.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  style={{ color: p.color, fontSize: 13, fontFamily: FONT, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {p.name} <ExternalLink size={11} />
                </a>
                <span style={{ color: 'rgba(209,213,219,0.55)', fontSize: 12, fontFamily: FONT }}>{p.progress} {p.label}</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div className="bar-animated" style={{ '--w': `${p.progress}%`, width: `${p.progress}%`, height: '100%', background: p.color, borderRadius: 2, boxShadow: `0 0 6px ${p.color}` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertTracker;
