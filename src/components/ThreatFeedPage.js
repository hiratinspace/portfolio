import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, ExternalLink, ChevronRight, Database, ArrowLeft, Radio } from 'lucide-react';

const FONT = "'Monaco', 'Courier New', monospace";

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#ff3333', bg: 'rgba(255,51,51,0.12)',  border: 'rgba(255,51,51,0.5)',  glow: '0 0 12px rgba(255,51,51,0.4)' },
  HIGH:     { color: '#ff7a20', bg: 'rgba(255,122,32,0.10)', border: 'rgba(255,122,32,0.5)', glow: '0 0 8px rgba(255,122,32,0.3)' },
  MEDIUM:   { color: '#f5c518', bg: 'rgba(245,197,24,0.08)', border: 'rgba(245,197,24,0.4)', glow: '0 0 6px rgba(245,197,24,0.2)' },
  LOW:      { color: '#4ade80', bg: 'rgba(74,222,128,0.07)', border: 'rgba(74,222,128,0.35)', glow: 'none' },
};

const getSeverity = (score) => {
  if (score >= 9.0) return 'CRITICAL';
  if (score >= 7.0) return 'HIGH';
  if (score >= 4.0) return 'MEDIUM';
  return 'LOW';
};

const ScoreBar = ({ score }) => {
  const cfg = SEVERITY_CONFIG[getSeverity(score)];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <div style={{ width: 90, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${(score / 10) * 100}%`, height: '100%', background: cfg.color, borderRadius: 2, boxShadow: cfg.glow }} />
      </div>
      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 700, letterSpacing: 1, fontFamily: FONT }}>
        {score.toFixed(1)} / 10
      </span>
    </div>
  );
};

const CVECard = ({ cve, index }) => {
  const [expanded, setExpanded] = useState(false);
  const id   = cve.cve?.id ?? 'CVE-UNKNOWN';
  const desc = (cve.cve?.descriptions ?? []).find(d => d.lang === 'en')?.value ?? 'No description available.';
  const m    = cve.cve?.metrics;
  let score  = 0;
  if (m?.cvssMetricV31?.[0])      score = m.cvssMetricV31[0].cvssData?.baseScore ?? 0;
  else if (m?.cvssMetricV30?.[0]) score = m.cvssMetricV30[0].cvssData?.baseScore ?? 0;
  else if (m?.cvssMetricV2?.[0])  score = m.cvssMetricV2[0].cvssData?.baseScore  ?? 0;
  const sev  = getSeverity(score);
  const cfg  = SEVERITY_CONFIG[sev];
  const published = cve.cve?.published
    ? new Date(cve.cve.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const shortDesc = desc.length > 200 ? desc.slice(0, 200) + '…' : desc;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="cve-card-appear"
      style={{
        background: expanded ? cfg.bg : 'rgba(10,0,0,0.6)',
        border: `1px solid ${expanded ? cfg.border : 'rgba(139,0,0,0.35)'}`,
        padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
        animationDelay: `${index * 40}ms`, animationFillMode: 'both', fontFamily: FONT,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.background = cfg.bg; }}
      onMouseLeave={e => { if (!expanded) { e.currentTarget.style.borderColor = 'rgba(139,0,0,0.35)'; e.currentTarget.style.background = 'rgba(10,0,0,0.6)'; }}}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ color: cfg.color, fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>{id}</span>
            <span style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontSize: 10, fontWeight: 700, padding: '2px 9px', letterSpacing: 2, boxShadow: cfg.glow }}>{sev}</span>
            <span style={{ color: 'rgba(209,213,219,0.6)', fontSize: 12 }}>{published}</span>
          </div>
          <ScoreBar score={score} />
          <p style={{ color: '#d1d5db', fontSize: 13, lineHeight: 1.65, marginTop: 10 }}>
            {expanded ? desc : shortDesc}
          </p>
        </div>
        <ChevronRight size={15} style={{ color: cfg.color, transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0, marginTop: 3 }} />
      </div>
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${cfg.border}` }}>
          <a href={`https://nvd.nist.gov/vuln/detail/${id}`} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: cfg.color, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${cfg.border}`, padding: '4px 12px', textDecoration: 'none', letterSpacing: 1 }}>
            <ExternalLink size={11} /> VIEW ON NVD
          </a>
        </div>
      )}
    </div>
  );
};

const ThreatFeedPage = () => {
  const navigate = useNavigate();
  const [cves, setCves]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState('ALL');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing]   = useState(false);
  const [matrixColumns, setMatrixColumns] = useState([]);
  const [visibleCount, setVisibleCount]   = useState(4);

  // Same matrix rain as main site
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 25);
    const chars = '0123456789ABCDEF'.split('');
    const securityTerms = ['0x','PWN','ROP','NOP','JMP','XOR','DEP','PIE','root@','sudo','nc','sh','bin'];
    const init = Array.from({ length: columns }, (_, i) => ({
      id: i, x: i * 25, y: Math.random() * -2000, speed: 1 + Math.random() * 3,
      chars: Array.from({ length: 15 + Math.floor(Math.random() * 15) }, () =>
        Math.random() > 0.7 ? securityTerms[Math.floor(Math.random() * securityTerms.length)] : chars[Math.floor(Math.random() * chars.length)]
      ),
    }));
    setMatrixColumns(init);
    const interval = setInterval(() => {
      setMatrixColumns(prev => prev.map(col => {
        const newY = col.y + col.speed;
        if (newY > window.innerHeight + 200) {
          return { ...col, y: -200 - Math.random() * 500, speed: 1 + Math.random() * 3,
            chars: Array.from({ length: 15 + Math.floor(Math.random() * 15) }, () =>
              Math.random() > 0.7 ? securityTerms[Math.floor(Math.random() * securityTerms.length)] : chars[Math.floor(Math.random() * chars.length)]
            ),
          };
        }
        return { ...col, y: newY };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const fetchCVEs = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.REACT_APP_NVD_API_KEY;
      const headers = apiKey ? { 'apiKey': apiKey } : {};
      const end = new Date(), start = new Date();
      start.setDate(start.getDate() - 7);
      const fmt = d => d.toISOString().replace(/\.\d+Z$/, '.000');
      const [r1, r2] = await Promise.all([
        fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${fmt(start)}&pubEndDate=${fmt(end)}&cvssV3Severity=CRITICAL&resultsPerPage=20`, { headers }),
        fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${fmt(start)}&pubEndDate=${fmt(end)}&cvssV3Severity=HIGH&resultsPerPage=15`, { headers }),
      ]);
      if (!r1.ok) throw new Error(`NVD API error: ${r1.status}`);
      const [d1, d2] = await Promise.all([r1.json(), r2.ok ? r2.json() : { vulnerabilities: [] }]);
      const getScore = v => {
        const mm = v.cve?.metrics;
        if (mm?.cvssMetricV31?.[0]) return mm.cvssMetricV31[0].cvssData?.baseScore ?? 0;
        if (mm?.cvssMetricV30?.[0]) return mm.cvssMetricV30[0].cvssData?.baseScore ?? 0;
        return 0;
      };
      setCves([...(d1.vulnerabilities ?? []), ...(d2.vulnerabilities ?? [])].sort((a, b) => getScore(b) - getScore(a)).slice(0, 40));
      setLastUpdated(new Date());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchCVEs(); }, [fetchCVEs]);

  const getScore = cve => {
    const mm = cve.cve?.metrics;
    if (mm?.cvssMetricV31?.[0]) return mm.cvssMetricV31[0].cvssData?.baseScore ?? 0;
    if (mm?.cvssMetricV30?.[0]) return mm.cvssMetricV30[0].cvssData?.baseScore ?? 0;
    return 0;
  };
  const filteredCves = filter === 'ALL' ? cves : cves.filter(c => getSeverity(getScore(c)) === filter);
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  cves.forEach(c => counts[getSeverity(getScore(c))]++);

  return (
    <div style={{ background: '#000', minHeight: '100vh', fontFamily: FONT, color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @keyframes cveAppear  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .cve-card-appear { animation: cveAppear 0.3s ease; }
        @keyframes pulseDot   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pulse-dot { animation: pulseDot 1.5s infinite; }
        @keyframes spinSlow   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin-slow { animation: spinSlow 1s linear infinite; }
        @keyframes navPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        * { box-sizing: border-box; }
      `}</style>

      {/* Matrix rain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
        {matrixColumns.map(col => (
          <div key={col.id} style={{ position: 'absolute', left: col.x, top: col.y, fontFamily: FONT, fontSize: 14, lineHeight: 1.4, transform: 'translateZ(0)', willChange: 'transform' }}>
            {col.chars.map((char, idx) => {
              const opacity = Math.max(0.1, 1 - idx / col.chars.length);
              return (
                <div key={idx} style={{
                  color: idx === 0 ? '#fff' : idx === col.chars.length - 1 ? '#450a0a' : `rgba(220,38,38,${opacity})`,
                  textShadow: idx === 0 ? '0 0 8px rgba(220,38,38,0.8)' : 'none',
                  opacity, fontWeight: idx === 0 ? 700 : 400,
                }}>{char}</div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Navbar — matches main site style */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', background: 'rgba(0,0,0,0.95)', borderBottom: '1px solid rgba(139,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 100 }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '14px 24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>

          {/* Left — back to portfolio */}
          <button onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(209,213,219,0.55)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: FONT, letterSpacing: 1, justifySelf: 'start' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(209,213,219,0.55)'}
          >
            <ArrowLeft size={14} /> BACK TO PORTFOLIO
          </button>

          {/* Centre — page identity (same style as main nav INTEL button) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: '1px solid rgba(139,0,0,0.6)' }}>
            <Radio size={14} style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 700, letterSpacing: 2, fontFamily: FONT }}>INTEL</span>
            <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          </div>

          {/* Right — refresh + timestamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end' }}>
            {lastUpdated && (
              <span style={{ color: 'rgba(209,213,219,0.4)', fontSize: 11, fontFamily: FONT }}>
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button onClick={() => fetchCVEs(true)} disabled={refreshing || loading}
              style={{ border: '1px solid rgba(139,0,0,0.5)', padding: '5px 14px', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: FONT, letterSpacing: 1 }}>
              <RefreshCw size={12} className={refreshing ? 'spin-slow' : ''} />
              {refreshing ? 'FETCHING…' : 'REFRESH'}
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 60px' }}>

          {/* Hero */}
          <div style={{ marginBottom: 48, borderBottom: '1px solid rgba(139,0,0,0.3)', paddingBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ color: '#ef4444', fontSize: 11, letterSpacing: 3 }}>LIVE · NVD FEED</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: '#fff', letterSpacing: 2, marginBottom: 12 }}>
              THREAT FEED
            </h1>
            <p style={{ color: 'rgba(209,213,219,0.65)', fontSize: 14, lineHeight: 1.75, maxWidth: 600 }}>
              Real-time CVE intelligence pulled from the National Vulnerability Database.
              CRITICAL &amp; HIGH severity disclosures from the past 7 days, sorted by CVSS score.
            </p>
          </div>

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10, marginBottom: 24 }}>
            {Object.entries(SEVERITY_CONFIG).map(([sev, cfg]) => (
              <button key={sev} onClick={() => setFilter(filter === sev ? 'ALL' : sev)}
                style={{ border: `1px solid ${filter === sev ? cfg.border : 'rgba(139,0,0,0.3)'}`, background: filter === sev ? cfg.bg : 'rgba(10,0,0,0.4)', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: filter === sev ? cfg.glow : 'none', fontFamily: FONT }}>
                <div style={{ color: cfg.color, fontSize: 26, fontWeight: 700 }}>{counts[sev]}</div>
                <div style={{ color: cfg.color, fontSize: 10, letterSpacing: 2, marginTop: 3 }}>{sev}</div>
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
              <button key={f} onClick={() => { setFilter(f); setVisibleCount(4); }}
                style={{ border: `1px solid ${filter === f ? 'rgba(239,68,68,0.7)' : 'rgba(139,0,0,0.3)'}`, background: filter === f ? 'rgba(239,68,68,0.1)' : 'transparent', color: filter === f ? '#ef4444' : 'rgba(209,213,219,0.6)', padding: '5px 16px', fontSize: 11, fontFamily: FONT, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.15s' }}>
                {f}
              </button>
            ))}
          </div>

          {/* Feed */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Database size={36} style={{ color: 'rgba(239,68,68,0.4)', margin: '0 auto 16px' }} />
              <div style={{ color: 'rgba(209,213,219,0.5)', fontSize: 13, letterSpacing: 3 }}>QUERYING NVD…</div>
            </div>
          )}
          {error && (
            <div style={{ border: '1px solid rgba(255,51,51,0.4)', background: 'rgba(255,51,51,0.06)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff6060', fontSize: 13, marginBottom: 8 }}>
                <AlertTriangle size={16} /> ERROR: {error}
              </div>
              <div style={{ color: 'rgba(255,96,96,0.6)', fontSize: 12 }}>NVD may be rate-limiting. Try refreshing in a moment.</div>
            </div>
          )}
          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredCves.length === 0
                ? <div style={{ color: 'rgba(209,213,219,0.4)', textAlign: 'center', padding: 60, fontSize: 13 }}>
                    NO RESULTS FOR FILTER: {filter}
                  </div>
                : <>
                    {filteredCves.slice(0, visibleCount).map((cve, i) => (
                      <CVECard key={cve.cve?.id ?? i} cve={cve} index={i} />
                    ))}

                    {/* Load more / load all controls */}
                    {visibleCount < filteredCves.length && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button
                          onClick={() => setVisibleCount(v => v + 4)}
                          style={{
                            flex: 1, padding: '10px 0', background: 'transparent',
                            border: '1px solid rgba(139,0,0,0.5)', color: '#ef4444',
                            fontFamily: FONT, fontSize: 12, letterSpacing: 1.5,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.5)'; }}
                        >
                          LOAD MORE  ({filteredCves.length - visibleCount} remaining)
                        </button>
                        <button
                          onClick={() => setVisibleCount(filteredCves.length)}
                          style={{
                            padding: '10px 24px', background: 'transparent',
                            border: '1px solid rgba(139,0,0,0.3)', color: 'rgba(209,213,219,0.45)',
                            fontFamily: FONT, fontSize: 12, letterSpacing: 1.5,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.5)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(209,213,219,0.45)'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.3)'; }}
                        >
                          LOAD ALL
                        </button>
                      </div>
                    )}
                  </>
              }
            </div>
          )}
          {!loading && !error && filteredCves.length > 0 && (
            <div style={{ marginTop: 20, textAlign: 'center', color: 'rgba(209,213,219,0.25)', fontSize: 11, letterSpacing: 1 }}>
              THIS PRODUCT USES THE NVD API BUT IS NOT ENDORSED OR CERTIFIED BY THE NVD · DATA MAY BE DELAYED UP TO 2 HOURS
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreatFeedPage;