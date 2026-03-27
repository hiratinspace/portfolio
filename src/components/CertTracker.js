import React, { useState } from 'react';
import { GraduationCap, CheckCircle, Clock, Circle, ChevronDown, ExternalLink, Zap } from 'lucide-react';

const FONT = "'Monaco', 'Courier New', monospace";

// ─── Edit this data to update your progress ──────────────────────────────────
const CERT_ROADMAP = [
  {
    phase: 'FOUNDATION',
    phaseColor: '#4ade80',
    certs: [
      {
        name: 'ISC2 CC',
        provider: 'ISC2',
        status: 'IN_PROGRESS',
        progress: 85,
        url: 'https://www.isc2.org/certifications/cc',
        tags: ['Security Concepts', 'GRC', 'Fundamentals'],
        eta: 'April 2026',
        notes: 'Covering core security principles, access controls, and network security basics.',
      },
      {
        name: 'HTB CPTS',
        provider: 'Hack The Box',
        status: 'IN_PROGRESS',
        progress: 25,
        url: 'https://academy.hackthebox.com/preview/certifications/htb-certified-penetration-testing-specialist',
        tags: ['Pentest', 'AD', 'Web', 'Reporting'],
        eta: 'Aug 2026',
        notes: 'Working through HTB Academy modules. Focus on methodology and structured reporting.',
      },
    ],
  },
  {
    phase: 'INTERMEDIATE',
    phaseColor: '#f5c518',
    certs: [
      {
        name: 'PNPT',
        provider: 'TCM Security',
        status: 'NOT_STARTED',
        progress: 0,
        url: 'https://certifications.tcm-sec.com/pnpt/',
        tags: ['AD', 'Pivoting', 'Report Writing'],
        eta: 'Q4 2026',
        notes: 'Practical exam with real report deliverable — great OSCP stepping stone.',
      },
      {
        name: 'eWPTX',
        provider: 'INE Security',
        status: 'NOT_STARTED',
        progress: 0,
        url: 'https://ine.com/learning/certifications/internal/elearnsecurity-web-application-penetration-tester-extreme',
        tags: ['Web', 'XSS', 'SQLi', 'Advanced'],
        eta: 'Q1 2027',
        notes: '',
      },
    ],
  },
  {
    phase: 'ADVANCED',
    phaseColor: '#ff7a20',
    certs: [
      {
        name: 'OSCP',
        provider: 'Offensive Security',
        status: 'NOT_STARTED',
        progress: 0,
        url: 'https://www.offsec.com/courses/pen-200/',
        tags: ['BoF', 'Privesc', 'AD', '24h Exam'],
        eta: 'Target: 2027',
        notes: 'The goal. Everything else is prep.',
      },
      {
        name: 'CRTO',
        provider: 'Zero-Point Security',
        status: 'NOT_STARTED',
        progress: 0,
        url: 'https://training.zeropointsecurity.co.uk/courses/red-team-ops',
        tags: ['C2', 'Cobalt Strike', 'Red Team Ops'],
        eta: 'Target: 2027',
        notes: '',
      },
    ],
  },
];

const PLATFORM_PROGRESS = [
  { name: 'HackTheBox', url: 'https://hackthebox.com', progress: 12, color: '#ef4444', label: 'machines rooted' },
  { name: 'TryHackMe',  url: 'https://tryhackme.com',  progress: 18, color: '#ff7a20', label: 'rooms completed' },
  { name: 'picoCTF',    url: 'https://picoctf.org',    progress: 42, color: '#f5c518', label: 'challenges solved' },
];
// ──────────────────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  COMPLETED:   { icon: CheckCircle, color: '#4ade80', label: 'COMPLETED',   bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.45)' },
  IN_PROGRESS: { icon: Clock,       color: '#f5c518', label: 'IN PROGRESS', bg: 'rgba(245,197,24,0.08)', border: 'rgba(245,197,24,0.45)' },
  NOT_STARTED: { icon: Circle,      color: 'rgba(209,213,219,0.45)', label: 'QUEUED', bg: 'transparent', border: 'rgba(139,0,0,0.3)' },
};

const ProgressRing = ({ pct, color, size = 56 }) => {
  const r    = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={pct === 0 ? 9 : 12} fontWeight="700" fontFamily={FONT}
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {pct === 0 ? '—' : `${pct}%`}
      </text>
    </svg>
  );
};

const CertCard = ({ cert }) => {
  const [open, setOpen] = useState(false);
  const cfg  = STATUS_CFG[cert.status];
  const Icon = cfg.icon;
  return (
    <div
      style={{ border: `1px solid ${cert.status === 'IN_PROGRESS' ? cfg.border : 'rgba(139,0,0,0.3)'}`, background: cert.status === 'IN_PROGRESS' ? cfg.bg : 'rgba(10,0,0,0.5)', transition: 'all 0.2s', cursor: 'pointer', fontFamily: FONT }}
      onClick={() => setOpen(!open)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.border; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = cert.status === 'IN_PROGRESS' ? cfg.border : 'rgba(139,0,0,0.3)'; }}
    >
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <ProgressRing pct={cert.progress} color={cfg.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{cert.name}</span>
            <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: 9, fontWeight: 700, padding: '2px 9px', letterSpacing: 1.5, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon size={9} /> {cfg.label}
            </span>
          </div>
          <div style={{ color: 'rgba(209,213,219,0.6)', fontSize: 12, marginTop: 3 }}>{cert.provider} · ETA {cert.eta}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
            {cert.tags.map(t => (
              <span key={t} style={{ fontSize: 10, padding: '2px 8px', border: '1px solid rgba(139,0,0,0.45)', color: 'rgba(239,68,68,0.8)', letterSpacing: 0.5 }}>{t}</span>
            ))}
          </div>
        </div>
        {(cert.notes || cert.url) && (
          <ChevronDown size={14} style={{ color: cfg.color, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
        )}
      </div>
      {open && (cert.notes || cert.url) && (
        <div style={{ padding: '0 20px 16px 20px', borderTop: `1px solid ${cfg.border}` }}>
          {cert.notes && <p style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>{cert.notes}</p>}
          {cert.url && (
            <a href={cert.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: cfg.color, fontSize: 12, border: `1px solid ${cfg.border}`, padding: '4px 12px', textDecoration: 'none', letterSpacing: 1 }}>
              <ExternalLink size={11} /> LEARN MORE
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const CertTracker = () => {
  const allCerts   = CERT_ROADMAP.flatMap(p => p.certs);
  const completed  = allCerts.filter(c => c.status === 'COMPLETED').length;
  const inProgress = allCerts.filter(c => c.status === 'IN_PROGRESS').length;
  const overallPct = Math.round(((completed + inProgress * 0.5) / allCerts.length) * 100);

  return (
    <section id="cert-roadmap" className="py-16 sm:py-24 bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
      <style>{`
        @keyframes barGrow { from{width:0} to{width:var(--w)} }
        .bar-animated { animation: barGrow 0.8s ease forwards; }
      `}</style>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <GraduationCap className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>CERT ROADMAP</h2>
              <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 11, letterSpacing: 3, marginTop: 3, fontFamily: FONT }}>OFFENSIVE SECURITY PATH</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(139,0,0,0.4)', padding: '12px 20px', background: 'rgba(10,0,0,0.5)', fontFamily: FONT }}>
            <ProgressRing pct={overallPct} color="#ef4444" size={52} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>OVERALL PROGRESS</div>
              <div style={{ color: 'rgba(209,213,219,0.55)', fontSize: 12, marginTop: 3 }}>{completed}/{allCerts.length} certs · {inProgress} active</div>
            </div>
          </div>
        </div>

        {/* Phases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {CERT_ROADMAP.map(phase => (
            <div key={phase.phase}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, background: phase.phaseColor, borderRadius: 2, boxShadow: `0 0 8px ${phase.phaseColor}`, flexShrink: 0 }} />
                <span style={{ color: phase.phaseColor, fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 3 }}>{phase.phase}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${phase.phaseColor}30, transparent)` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 20, borderLeft: `1px solid ${phase.phaseColor}25` }}>
                {phase.certs.map(cert => <CertCard key={cert.name} cert={cert} />)}
              </div>
            </div>
          ))}
        </div>

        {/* Practice platforms */}
        <div style={{ marginTop: 48, borderTop: '1px solid rgba(139,0,0,0.3)', paddingTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
            <Zap size={16} style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontFamily: FONT, fontWeight: 700, fontSize: 12, letterSpacing: 3 }}>PRACTICE PLATFORMS</span>
          </div>
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
      </div>
    </section>
  );
};

export default CertTracker;