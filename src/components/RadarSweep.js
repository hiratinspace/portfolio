import React from 'react';

const FONT = "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace";

// Purely decorative radar graphic: concentric rings, a crosshair, a rotating
// sweep wedge, and a few pulsing blips. No data, no interactivity - it just
// fills the right column of the Practice section with on-theme motion.
// Respects prefers-reduced-motion (animations are disabled in CSS below).
const BLIPS = [
  { cx: 138, cy: 72, delay: '0s' },
  { cx: 66, cy: 128, delay: '1.1s' },
  { cx: 120, cy: 142, delay: '2.3s' },
  { cx: 78, cy: 64, delay: '3s' },
];

const RadarSweep = () => (
  <div
    aria-hidden="true"
    className="relative w-full max-w-[220px] lg:max-w-none mx-auto select-none pointer-events-none"
    style={{ fontFamily: FONT }}
  >
    <style>{`
      @keyframes radar-spin { to { transform: rotate(360deg); } }
      @keyframes radar-blip {
        0%, 100% { opacity: 0; }
        4%       { opacity: 1; }
        40%      { opacity: 0.15; }
      }
      .radar-sweep { transform-box: view-box; transform-origin: 100px 100px;
        animation: radar-spin 4.4s linear infinite; }
      .radar-blip  { animation: radar-blip 4.4s linear infinite; }
      @media (prefers-reduced-motion: reduce) {
        .radar-sweep { animation: none; }
        .radar-blip  { animation: none; opacity: 0.6; }
      }
    `}</style>

    <svg viewBox="0 0 200 200" className="w-full h-auto" role="img" aria-label="Decorative radar animation">
      <defs>
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(239,68,68,0.18)" />
          <stop offset="70%" stopColor="rgba(239,68,68,0.03)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        {/* Sweep trail: bright at the leading edge, fading backward */}
        <linearGradient id="radar-wedge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(239,68,68,0)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0.38)" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="92" fill="url(#radar-glow)" />

      {/* Concentric rings */}
      {[30, 55, 80, 92].map(r => (
        <circle key={r} cx="100" cy="100" r={r} fill="none"
          stroke="rgba(239,68,68,0.28)" strokeWidth="0.8" />
      ))}

      {/* Crosshair */}
      <line x1="8" y1="100" x2="192" y2="100" stroke="rgba(239,68,68,0.18)" strokeWidth="0.8" />
      <line x1="100" y1="8" x2="100" y2="192" stroke="rgba(239,68,68,0.18)" strokeWidth="0.8" />

      {/* Rotating sweep */}
      <g className="radar-sweep">
        <path d="M100 100 L192 100 A92 92 0 0 0 128 11 Z" fill="url(#radar-wedge)" />
        <line x1="100" y1="100" x2="192" y2="100" stroke="rgba(248,113,113,0.9)" strokeWidth="1.2" />
      </g>

      {/* Pulsing contacts */}
      {BLIPS.map((b, i) => (
        <g key={i} className="radar-blip" style={{ animationDelay: b.delay }}>
          <circle cx={b.cx} cy={b.cy} r="2.4" fill="#f87171" />
          <circle cx={b.cx} cy={b.cy} r="5" fill="none" stroke="rgba(248,113,113,0.5)" strokeWidth="0.8" />
        </g>
      ))}

      <circle cx="100" cy="100" r="2" fill="#ef4444" />
    </svg>
  </div>
);

export default RadarSweep;
