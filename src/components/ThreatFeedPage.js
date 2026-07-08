import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, RefreshCw, ExternalLink, ChevronRight,
  Database, ArrowLeft, ChevronDown, Shield, Menu, X
} from 'lucide-react';
import NewsSection from './NewsSection';
import KevSection from './KevSection';

const FONT = "'Monaco', 'Courier New', monospace";

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#ff4444', bg: 'rgba(255,68,68,0.08)',   border: '#ff4444', glow: '0 0 20px rgba(255,68,68,0.4)',   dim: 'rgba(255,68,68,0.4)'   },
  HIGH:     { color: '#ff8c42', bg: 'rgba(255,140,66,0.08)',  border: '#ff8c42', glow: '0 0 16px rgba(255,140,66,0.35)', dim: 'rgba(255,140,66,0.4)'  },
  MEDIUM:   { color: '#ffd166', bg: 'rgba(255,209,102,0.07)', border: '#ffd166', glow: '0 0 12px rgba(255,209,102,0.3)', dim: 'rgba(255,209,102,0.4)' },
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.07)',   border: '#22c55e', glow: '0 0 10px rgba(34,197,94,0.2)',   dim: 'rgba(34,197,94,0.35)'  },
  ALL:      { color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', border: '#ff6b6b', glow: '0 0 14px rgba(255,107,107,0.3)', dim: 'rgba(255,107,107,0.4)' },
};

const getSeverity = (score) => {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  return 'LOW';
};

const getScore = (cve) => {
  const mm = cve.cve?.metrics;
  if (mm?.cvssMetricV31?.[0]) return mm.cvssMetricV31[0].cvssData?.baseScore ?? 0;
  if (mm?.cvssMetricV30?.[0]) return mm.cvssMetricV30[0].cvssData?.baseScore ?? 0;
  if (mm?.cvssMetricV2?.[0])  return mm.cvssMetricV2[0].cvssData?.baseScore  ?? 0;
  return 0;
};

// ── Score bar ─────────────────────────────────────────────────────────────────
const ScoreBar = ({ score }) => {
  const cfg = SEVERITY_CONFIG[getSeverity(score)];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 1 }}>
        <div style={{
          width: `${(score / 10) * 100}%`, height: '100%',
          background: cfg.color, boxShadow: cfg.glow,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 700, fontFamily: FONT, letterSpacing: 1 }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
};

// ── CVE card — log-entry style ────────────────────────────────────────────────
const CVECard = ({ cve, index }) => {
  const [expanded, setExpanded] = useState(false);
  const id    = cve.cve?.id ?? 'CVE-UNKNOWN';
  const desc  = (cve.cve?.descriptions ?? []).find(d => d.lang === 'en')?.value ?? 'No description available.';
  const score = getScore(cve);
  const sev   = getSeverity(score);
  const cfg   = SEVERITY_CONFIG[sev];
  const published = cve.cve?.published
    ? new Date(cve.cve.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + '…' : desc;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="cve-entry"
      style={{
        background: expanded ? cfg.bg : 'rgba(15,3,8,0.95)',
        borderLeft: `3px solid ${expanded ? cfg.color : 'rgba(180,0,30,0.4)'}`,
        borderTop: '1px solid rgba(180,0,30,0.2)',
        borderRight: '1px solid rgba(180,0,30,0.2)',
        borderBottom: '1px solid rgba(180,0,30,0.2)',
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        animationDelay: `${index * 40}ms`,
        animationFillMode: 'both',
        fontFamily: FONT,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = cfg.bg;
        e.currentTarget.style.borderLeftColor = cfg.color;
        e.currentTarget.style.boxShadow = `inset 3px 0 0 ${cfg.color}, ${cfg.glow}`;
      }}
      onMouseLeave={e => {
        if (!expanded) {
          e.currentTarget.style.background = 'rgba(15,3,8,0.95)';
          e.currentTarget.style.borderLeftColor = 'rgba(180,0,30,0.4)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top row — ID, badge, date, score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{
              color: '#f0f0f0', fontWeight: 700, fontSize: 13, letterSpacing: 0.5,
              textShadow: `0 0 10px ${cfg.dim}`,
            }}>{id}</span>

            <span style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              fontSize: 9, fontWeight: 700, padding: '2px 9px',
              letterSpacing: 2, boxShadow: cfg.glow,
            }}>{sev}</span>

            <span style={{ color: 'rgba(200,180,180,0.45)', fontSize: 11 }}>{published}</span>

            <ScoreBar score={score} />
          </div>

          {/* Description */}
          <p style={{ color: '#d4c8c8', fontSize: 12, lineHeight: 1.75, margin: 0 }}>
            {expanded ? desc : shortDesc}
          </p>
        </div>

        <ChevronRight size={13} style={{
          color: cfg.dim, flexShrink: 0, marginTop: 2,
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(90deg)' : 'none',
        }} />
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${cfg.border}22` }}>
          <a
            href={`https://nvd.nist.gov/vuln/detail/${id}`}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{
              color: cfg.color, fontSize: 11,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              border: `1px solid ${cfg.border}`,
              padding: '5px 14px', textDecoration: 'none',
              letterSpacing: 1.5, background: cfg.bg,
              transition: 'all 0.15s',
            }}
          >
            <ExternalLink size={10} /> VIEW ON NVD
          </a>
        </div>
      )}
    </div>
  );
};

// ── Accordion panel ───────────────────────────────────────────────────────────
const CategoryPanel = ({ cves, category }) => {
  const [visibleCount, setVisibleCount] = useState(4);
  const panelRef = useRef(null);
  const filtered = category === 'ALL' ? cves : cves.filter(c => getSeverity(getScore(c)) === category);
  const cfg = SEVERITY_CONFIG[category];

  useEffect(() => { setVisibleCount(4); }, [category]);
  useEffect(() => {
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, [category]);

  return (
    <div ref={panelRef} className="panel-drop" style={{
      borderLeft: `2px solid ${cfg.color}`,
      borderRight: '1px solid rgba(180,0,30,0.25)',
      borderBottom: '1px solid rgba(180,0,30,0.25)',
      background: 'rgba(10,1,5,0.97)',
      padding: '20px 20px 18px',
    }}>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${cfg.color}22` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 6, height: 6, background: cfg.color, boxShadow: cfg.glow }} />
          <span style={{ color: cfg.color, fontFamily: FONT, fontWeight: 700, fontSize: 13, letterSpacing: 3 }}>
            {category} VULNERABILITIES
          </span>
        </div>
        <span style={{ color: 'rgba(200,180,180,0.3)', fontFamily: FONT, fontSize: 10, letterSpacing: 2 }}>
          {filtered.length} ENTRIES
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'rgba(200,180,180,0.3)', textAlign: 'center', padding: '36px 0', fontSize: 11, fontFamily: FONT, letterSpacing: 3 }}>
          NO {category} ENTRIES IN CURRENT FEED
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {filtered.slice(0, visibleCount).map((cve, i) => (
              <CVECard key={cve.cve?.id ?? i} cve={cve} index={i} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                onClick={() => setVisibleCount(v => v + 4)}
                style={{
                  flex: 1, padding: '9px 0', background: 'transparent',
                  border: `1px solid ${cfg.border}`, color: cfg.color,
                  fontFamily: FONT, fontSize: 11, letterSpacing: 2, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = cfg.bg; e.currentTarget.style.boxShadow = cfg.glow; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                LOAD MORE — {filtered.length - visibleCount} REMAINING
              </button>
              <button
                onClick={() => setVisibleCount(filtered.length)}
                style={{
                  padding: '9px 20px', background: 'transparent',
                  border: '1px solid rgba(180,0,30,0.35)', color: 'rgba(200,180,180,0.35)',
                  fontFamily: FONT, fontSize: 11, letterSpacing: 2, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = cfg.color; e.currentTarget.style.borderColor = cfg.border; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,180,180,0.35)'; e.currentTarget.style.borderColor = 'rgba(180,0,30,0.35)'; }}
              >
                LOAD ALL
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Category tile ─────────────────────────────────────────────────────────────
const CategoryTile = ({ label, count, isActive, onClick, loading }) => {
  const cfg = SEVERITY_CONFIG[label];
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        position: 'relative',
        border: `1px solid ${isActive ? cfg.color : 'rgba(180,0,30,0.35)'}`,
        borderTop: `3px solid ${isActive ? cfg.color : 'rgba(180,0,30,0.35)'}`,
        background: isActive ? cfg.bg : 'rgba(12,2,6,0.9)',
        padding: '18px 14px 14px',
        cursor: loading ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.18s ease',
        boxShadow: isActive ? cfg.glow : 'none',
        fontFamily: FONT,
        outline: 'none',
        opacity: loading ? 0.35 : 1,
      }}
      onMouseEnter={e => {
        if (!isActive && !loading) {
          e.currentTarget.style.borderColor = cfg.color;
          e.currentTarget.style.borderTopColor = cfg.color;
          e.currentTarget.style.background = cfg.bg;
          e.currentTarget.style.boxShadow = cfg.glow;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'rgba(180,0,30,0.35)';
          e.currentTarget.style.borderTopColor = 'rgba(180,0,30,0.35)';
          e.currentTarget.style.background = 'rgba(12,2,6,0.9)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Count — always in severity color */}
      <div style={{
        color: cfg.color,
        fontSize: 38, fontWeight: 700, lineHeight: 1,
        textShadow: isActive ? cfg.glow : `0 0 10px ${cfg.dim}`,
        transition: 'all 0.18s',
        marginBottom: 10,
      }}>
        {loading ? '—' : count}
      </div>

      {/* Label + chevron — always in severity color */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          color: isActive ? cfg.color : `${cfg.color}cc`,
          fontSize: 12, letterSpacing: 2, fontWeight: 700,
          transition: 'color 0.18s',
        }}>
          {label}
        </span>
        <ChevronDown size={12} style={{
          color: isActive ? cfg.color : cfg.dim,
          transition: 'transform 0.22s',
          transform: isActive ? 'rotate(180deg)' : 'none',
        }} />
      </div>
    </button>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const ThreatFeedPage = () => {
  const navigate = useNavigate();
  const [cves, setCves]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [refreshing, setRefreshing]         = useState(false);
  const [matrixColumns, setMatrixColumns]   = useState([]);
  const [sideNavOpen, setSideNavOpen]       = useState(false);
  const [activeSection, setActiveSection]   = useState('threat-feed');
  // Matrix rain
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 28);
    const chars = '0123456789ABCDEF'.split('');
    const terms = ['0x','PWN','ROP','NOP','JMP','XOR','DEP','PIE','root@','sudo','nc','sh','bin'];
    const init = Array.from({ length: columns }, (_, i) => ({
      id: i, x: i * 28, y: Math.random() * -2000, speed: 0.8 + Math.random() * 2.5,
      chars: Array.from({ length: 14 + Math.floor(Math.random() * 12) }, () =>
        Math.random() > 0.7 ? terms[Math.floor(Math.random() * terms.length)] : chars[Math.floor(Math.random() * chars.length)]
      ),
    }));
    setMatrixColumns(init);
    const interval = setInterval(() => {
      setMatrixColumns(prev => prev.map(col => {
        const newY = col.y + col.speed;
        if (newY > window.innerHeight + 200) {
          return { ...col, y: -200 - Math.random() * 500, speed: 0.8 + Math.random() * 2.5,
            chars: Array.from({ length: 14 + Math.floor(Math.random() * 12) }, () =>
              Math.random() > 0.7 ? terms[Math.floor(Math.random() * terms.length)] : chars[Math.floor(Math.random() * chars.length)]
            ),
          };
        }
        return { ...col, y: newY };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      const res = await fetch(url, options);
      if (res.status === 429) { await new Promise(r => setTimeout(r, 6000 * (i + 1))); continue; }
      return res;
    }
    throw new Error('NVD rate limit exceeded. Try again in a moment.');
  };

  const fetchCVEs = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    const CACHE_KEY = 'nvd_cve_cache';
    const CACHE_TTL = 15 * 60 * 1000;
    if (!isRefresh) {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setCves(data); setLoading(false); return;
          }
        }
      } catch (_) {}
    }
    setError(null);
    try {
      const end = new Date(), start = new Date();
      start.setDate(start.getDate() - 7);
      const fmt = d => d.toISOString().replace(/\.\d+Z$/, '.000');
      const [r1, r2] = await Promise.all([
        fetchWithRetry(`/api/cves?pubStartDate=${fmt(start)}&pubEndDate=${fmt(end)}&cvssV3Severity=CRITICAL&resultsPerPage=20`),
        fetchWithRetry(`/api/cves?pubStartDate=${fmt(start)}&pubEndDate=${fmt(end)}&cvssV3Severity=HIGH&resultsPerPage=15`),
      ]);
      if (!r1.ok) throw new Error(`NVD API error: ${r1.status}`);
      const [d1, d2] = await Promise.all([r1.json(), r2.ok ? r2.json() : { vulnerabilities: [] }]);
      const merged = [...(d1.vulnerabilities ?? []), ...(d2.vulnerabilities ?? [])]
        .sort((a, b) => getScore(b) - getScore(a)).slice(0, 40);
      setCves(merged);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: merged, timestamp: Date.now() }));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCVEs(); }, [fetchCVEs]);

  // Scroll-based active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const kevEl  = document.getElementById('kev-feed');
      const newsEl = document.getElementById('security-news');
      const mid    = window.scrollY + window.innerHeight / 2;
      if (newsEl && mid >= newsEl.offsetTop) {
        setActiveSection('security-news');
      } else if (kevEl && mid >= kevEl.offsetTop) {
        setActiveSection('kev-feed');
      } else {
        setActiveSection('threat-feed');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const counts = { ALL: cves.length, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  cves.forEach(c => counts[getSeverity(getScore(c))]++);
  const handleTileClick = (cat) => setActiveCategory(prev => prev === cat ? null : cat);

  return (
    <div style={{ background: '#07010400', minHeight: '100vh', fontFamily: FONT, color: '#f0e8e8', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        /* Page background — deep red-black with a faint grid */
        body { background: #080103 !important; }

        .intel-bg {
          background-color: #080103;
          background-image:
            linear-gradient(rgba(180,0,30,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,0,30,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: center center;
        }

        /* Scanline overlay */
        .intel-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.08) 2px,
            rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 2;
        }

        /* Vignette */
        .intel-bg::after {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%);
          pointer-events: none;
          z-index: 2;
        }

        @keyframes cveAppear  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        .cve-entry { animation: cveAppear 0.2s ease; }

        @keyframes panelDrop  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .panel-drop { animation: panelDrop 0.18s ease; }

        @keyframes fadeUp     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease both; }

        @keyframes pulseDot   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
        .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }

        @keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin { animation: spin 0.9s linear infinite; }

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; background: #080103; }
        ::-webkit-scrollbar-thumb { background: rgba(180,0,30,0.5); border-radius: 2px; }

        /* Tiles — 5 columns desktop, 2 columns mobile */
        .tiles-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }

        @media (max-width: 640px) {
          .tiles-grid { grid-template-columns: repeat(2, 1fr); }
          .portfolio-label,
          .refresh-label { display: none !important; }
        }
      `}</style>

      {/* ── Page wrapper with grid bg ── */}
      <div className="intel-bg" style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Matrix rain — full visibility */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 3 }}>
          {matrixColumns.map(col => (
            <div key={col.id} style={{ position: 'absolute', left: col.x, top: col.y, fontFamily: FONT, fontSize: 12, lineHeight: 1.4, transform: 'translateZ(0)', willChange: 'transform' }}>
              {col.chars.map((char, idx) => {
                const opacity = Math.max(0.15, 1 - idx / col.chars.length);
                return (
                  <div key={idx} style={{
                    color: idx === 0 ? '#ff6666' : `rgba(220,38,38,${opacity})`,
                    textShadow: idx === 0 ? '0 0 6px rgba(255,68,68,0.9)' : 'none',
                    opacity, fontWeight: idx === 0 ? 700 : 400,
                  }}>{char}</div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Center dimming overlay — fades the matrix behind the content column,
            leaves both side edges fully visible */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'linear-gradient(to right, transparent 0%, rgba(8,1,4,0.87) 18%, rgba(8,1,4,0.87) 82%, transparent 100%)',
        }} />

        {/* Navbar */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 200,
          background: 'rgba(6,0,2,0.96)',
          borderBottom: '1px solid rgba(180,0,30,0.5)',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ maxWidth: 980, margin: '0 auto', padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

            {/* Left — back to portfolio */}
            <button
              onClick={() => navigate('/')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'rgba(200,180,180,0.45)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 1.5, justifySelf: 'start', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,180,180,0.45)'}
            >
              <ArrowLeft size={20} />
              <span style={{ display: 'inline', fontSize: 15, letterSpacing: 1.5 }} className="portfolio-label">PORTFOLIO</span>
            </button>

            {/* Centre — current page label, not a link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 18px', border: '1px solid rgba(180,0,30,0.4)', background: 'rgba(180,0,30,0.07)' }}>
              <span style={{ color: 'rgba(200,140,140,0.8)', fontSize: 12, fontWeight: 700, letterSpacing: 3, fontFamily: FONT }}>INTEL</span>
              <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff4444', display: 'inline-block', flexShrink: 0 }} />
            </div>

            {/* Right — hamburger */}
            <button
              onClick={() => setSideNavOpen(o => !o)}
              style={{ justifySelf: 'end', background: 'none', border: '1px solid rgba(180,0,30,0.4)', padding: '6px 8px', cursor: 'pointer', color: '#ff6b6b', display: 'flex', alignItems: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,68,68,0.7)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(180,0,30,0.4)'}
              aria-label="Toggle navigation"
            >
              {sideNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>
        </nav>

        {/* Side nav backdrop */}
        {sideNavOpen && (
          <div
            onClick={() => setSideNavOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, backdropFilter: 'blur(2px)' }}
          />
        )}

        {/* Side drawer */}
        <div style={{
          position: 'fixed', top: 0, right: 0, height: '100vh', width: 260,
          background: 'rgba(6,0,2,0.98)', borderLeft: '1px solid rgba(180,0,30,0.5)',
          zIndex: 301, fontFamily: FONT,
          transform: sideNavOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Drawer header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(180,0,30,0.35)' }}>
            <span style={{ color: '#ff6b6b', fontSize: 11, letterSpacing: 3, fontWeight: 700 }}>NAVIGATION</span>
            <button onClick={() => setSideNavOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(200,140,140,0.6)', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Nav items */}
          <nav style={{ padding: '20px 0', flex: 1 }}>
            {/* Threat Feed */}
            <button
              onClick={() => { setSideNavOpen(false); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 260); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: activeSection === 'threat-feed' ? 'rgba(239,68,68,0.06)' : 'none', border: 'none', padding: '10px 20px', color: activeSection === 'threat-feed' ? '#ef4444' : 'rgba(200,140,140,0.55)', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 2, textAlign: 'left', transition: 'all 0.15s', borderLeft: `2px solid ${activeSection === 'threat-feed' ? '#ef4444' : 'transparent'}` }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: activeSection === 'threat-feed' ? '#ef4444' : 'rgba(200,140,140,0.4)', boxShadow: activeSection === 'threat-feed' ? '0 0 6px rgba(239,68,68,0.9)' : 'none', display: 'inline-block', flexShrink: 0, transition: 'all 0.15s' }} />
              THREAT FEED
            </button>

            {/* Exploited in the Wild (KEV) */}
            <button
              onClick={() => { setSideNavOpen(false); setTimeout(() => { const el = document.getElementById('kev-feed'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 260); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: activeSection === 'kev-feed' ? 'rgba(239,68,68,0.06)' : 'none', border: 'none', padding: '10px 20px', color: activeSection === 'kev-feed' ? '#ef4444' : 'rgba(200,140,140,0.55)', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 2, textAlign: 'left', transition: 'all 0.15s', borderLeft: `2px solid ${activeSection === 'kev-feed' ? '#ef4444' : 'transparent'}` }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: activeSection === 'kev-feed' ? '#ef4444' : 'rgba(200,140,140,0.4)', boxShadow: activeSection === 'kev-feed' ? '0 0 6px rgba(239,68,68,0.9)' : 'none', display: 'inline-block', flexShrink: 0, transition: 'all 0.15s' }} />
              EXPLOITED (KEV)
            </button>

            {/* Security News */}
            <button
              onClick={() => { setSideNavOpen(false); setTimeout(() => { const el = document.getElementById('security-news'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 260); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: activeSection === 'security-news' ? 'rgba(239,68,68,0.06)' : 'none', border: 'none', padding: '10px 20px', color: activeSection === 'security-news' ? '#ef4444' : 'rgba(200,140,140,0.55)', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 2, textAlign: 'left', transition: 'all 0.15s', borderLeft: `2px solid ${activeSection === 'security-news' ? '#ef4444' : 'transparent'}` }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: activeSection === 'security-news' ? '#ef4444' : 'rgba(200,140,140,0.4)', boxShadow: activeSection === 'security-news' ? '0 0 6px rgba(239,68,68,0.9)' : 'none', display: 'inline-block', flexShrink: 0, transition: 'all 0.15s' }} />
              SECURITY NEWS
            </button>

          </nav>

          {/* Drawer footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(180,0,30,0.25)' }}>
            <button
              onClick={() => navigate('/')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1px solid rgba(180,0,30,0.35)', padding: '8px 14px', color: 'rgba(200,140,140,0.55)', cursor: 'pointer', fontSize: 11, fontFamily: FONT, letterSpacing: 1.5, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,68,68,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,140,140,0.55)'; e.currentTarget.style.borderColor = 'rgba(180,0,30,0.35)'; }}
            >
              <ArrowLeft size={13} /> BACK TO PORTFOLIO
            </button>
          </div>
        </div>


        {/* ── Content ────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 10, paddingTop: 70 }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px 100px' }}>

            {/* Hero */}
            <div style={{ marginBottom: 48, borderBottom: '1px solid rgba(139,0,0,0.3)', paddingBottom: 32 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Shield className="text-red-700 w-12 h-12 sm:w-16 sm:h-16" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.8)', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ color: '#ef4444', fontSize: 10, letterSpacing: 3, fontFamily: FONT }}>LIVE NVD NIST</span>
                  </div>
                  <h2 style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
                    THREAT FEED
                  </h2>
                  <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 11, letterSpacing: 3, marginTop: 3, fontFamily: FONT }}>
                    NATIONAL VULNERABILITY DATABASE
                  </p>
                </div>
              </div>
              {/* Refresh, matching Security News */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => fetchCVEs(true)} disabled={refreshing || loading}
                  style={{ border: '1px solid rgba(139,0,0,0.5)', padding: '5px 14px', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: FONT, letterSpacing: 1 }}
                >
                  <RefreshCw size={11} className={refreshing ? 'spin' : ''} />
                  <span className="refresh-label">{refreshing ? 'FETCHING…' : 'REFRESH'}</span>
                </button>
              </div>
            </div>
            <p style={{ color: 'rgba(243, 235, 235, 0.92)', fontSize: 13, lineHeight: 1.7, fontFamily: FONT, maxWidth: 600 }}>
              CRITICAL &amp; HIGH severity disclosures from the past 7 days, sorted by CVSS score. Click a severity tile to drill down.
            </p>
          </div>

            {/* Error */}
            {error && (
              <div style={{ borderLeft: '3px solid #ff4444', border: '1px solid rgba(255,68,68,0.4)', background: 'rgba(255,68,68,0.06)', padding: '16px 20px', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6060', fontSize: 12, marginBottom: 5 }}>
                  <AlertTriangle size={14} /> ERROR: {error}
                </div>
                <div style={{ color: 'rgba(255,96,96,0.5)', fontSize: 11 }}>NVD may be rate-limiting. Try refreshing in a moment.</div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '90px 0' }}>
                <Database size={30} style={{ color: 'rgba(255,68,68,0.3)', display: 'block', margin: '0 auto 16px' }} />
                <div style={{ color: 'rgba(210,185,185,0.3)', fontSize: 11, letterSpacing: 4 }}>QUERYING NVD…</div>
              </div>
            )}

            {/* Tiles + accordion */}
            {!loading && !error && (
              <div className="fade-up" style={{ animationDelay: '0.1s' }}>

                {/* Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ color: 'rgba(249, 239, 239, 0.55)', fontSize: 11, letterSpacing: 4, fontWeight: 700, flexShrink: 0 }}>
                    SEVERITY FILTER
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(180,0,30,0.5), transparent)' }} />
                </div>

                {/* Tiles grid */}
                <div className="tiles-grid">
                  {['ALL','CRITICAL','HIGH','MEDIUM','LOW'].map(cat => (
                    <CategoryTile
                      key={cat} label={cat} count={counts[cat]}
                      isActive={activeCategory === cat}
                      onClick={() => handleTileClick(cat)}
                      loading={loading}
                    />
                  ))}
                </div>

                {/* Accordion panel */}
                {activeCategory
                  ? <CategoryPanel cves={cves} category={activeCategory} />
                  : (
                    <div style={{ textAlign: 'center', padding: '24px 0 4px', color: 'rgba(249, 239, 239, 0.55)', fontSize: 10, letterSpacing: 1, lineHeight: 2, borderTop: '1px solid rgba(180,0,30,0.2)', paddingTop: 15 }}>
                      THIS PRODUCT USES THE NVD API BUT IS NOT ENDORSED OR CERTIFIED BY THE NVD
                    </div>
                  )
                }

              </div>
            )}

            {/* ── Known Exploited Vulnerabilities (CISA KEV) ── */}
            <div id="kev-feed" style={{ marginTop: 64, borderTop: '1px solid rgba(139,0,0,0.3)', paddingTop: 48 }}>
              <KevSection />
            </div>

            {/* ── Security News ── */}
            <div id="security-news" style={{ marginTop: 64, borderTop: '1px solid rgba(139,0,0,0.3)', paddingTop: 48 }}>
              <NewsSection />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatFeedPage;