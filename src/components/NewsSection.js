import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Newspaper, ChevronDown } from 'lucide-react';

const FONT = "'Monaco', 'Courier New', monospace";

const SEVERITY_CFG = {
  CRITICAL: { color: '#ff3333', bg: 'rgba(255,51,51,0.12)',  border: 'rgba(255,51,51,0.45)',  glow: '0 0 8px rgba(255,51,51,0.35)' },
  HIGH:     { color: '#ff7a20', bg: 'rgba(255,122,32,0.10)', border: 'rgba(255,122,32,0.45)', glow: '0 0 6px rgba(255,122,32,0.3)' },
  MEDIUM:   { color: '#f5c518', bg: 'rgba(245,197,24,0.08)', border: 'rgba(245,197,24,0.4)',  glow: 'none' },
  INFO:     { color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', border: 'rgba(96,165,250,0.35)', glow: 'none' },
};

const CATEGORY_COLORS = {
  Ransomware:    '#ff3333',
  Vulnerability: '#ff7a20',
  'Data Breach': '#f5c518',
  Malware:       '#ef4444',
  APT:           '#c084fc',
  Patch:         '#4ade80',
  Policy:        '#60a5fa',
  Research:      '#34d399',
  Other:         'rgba(209,213,219,0.5)',
  General:       'rgba(209,213,219,0.5)',
};

// ── Single news card ──────────────────────────────────────────────────────────
const NewsCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  const cfg  = SEVERITY_CFG[item.severity] ?? SEVERITY_CFG.INFO;
  const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.General;

  const date = item.pubDate
    ? (() => { try { return new Date(item.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return ''; } })()
    : '';

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? cfg.bg : 'rgba(10,0,0,0.55)',
        border: `1px solid ${open ? cfg.border : 'rgba(139,0,0,0.3)'}`,
        padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: FONT,
        animation: `newsAppear 0.3s ease ${index * 50}ms both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.border; e.currentTarget.style.background = cfg.bg; }}
      onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = 'rgba(139,0,0,0.3)'; e.currentTarget.style.background = 'rgba(10,0,0,0.55)'; }}}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top row: severity + category + source + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{
              background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
              fontSize: 9, fontWeight: 700, padding: '2px 8px', letterSpacing: 1.5,
              boxShadow: cfg.glow, fontFamily: FONT,
            }}>{item.severity}</span>
            <span style={{
              fontSize: 9, padding: '2px 8px', fontWeight: 700, letterSpacing: 1,
              border: `1px solid ${catColor}40`, color: catColor, fontFamily: FONT,
            }}>{item.category}</span>
            <span style={{ color: 'rgba(209,213,219,0.45)', fontSize: 11 }}>{item.source}</span>
            {date && <span style={{ color: 'rgba(209,213,219,0.3)', fontSize: 11 }}>· {date}</span>}
          </div>

          {/* Title */}
          <p style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600, lineHeight: 1.5, marginBottom: 4, fontFamily: FONT }}>
            {item.title}
          </p>

          {/* AI summary - always visible */}
          <p style={{ color: 'rgba(209,213,219,0.7)', fontSize: 12, lineHeight: 1.6, fontFamily: FONT }}>
            {item.summary}
          </p>

        </div>
        <ChevronDown size={13} style={{ color: cfg.color, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0, marginTop: 2 }} />
      </div>

      {/* Expanded: original description + link */}
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cfg.border}` }}>
          {item.description && (
            <p style={{ color: 'rgba(209,213,219,0.6)', fontSize: 12, lineHeight: 1.65, marginBottom: 10, fontFamily: FONT }}>
              {item.description}
            </p>
          )}
          {item.link && (
            <a
              href={item.link} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: cfg.color, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${cfg.border}`, padding: '3px 10px', textDecoration: 'none', letterSpacing: 1, fontFamily: FONT }}
            >
              <ExternalLink size={10} /> READ FULL ARTICLE
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const NewsSection = () => {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [visibleCount, setVisibleCount] = useState(3);

  const fetchNews = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news');
        if (res.headers.get('content-type')?.includes('text/html')) {
        throw new Error('News API only available on deployed site - not in local dev');
        }
      if (!res.ok) throw new Error(`News API error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.items ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  const filtered = activeFilter === 'ALL' ? items : items.filter(i => i.severity === activeFilter);

  // Count per severity for the filter pills
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, INFO: 0 };
  items.forEach(i => { if (counts[i.severity] !== undefined) counts[i.severity]++; });

  return (
    <div style={{ marginBottom: 56, fontFamily: FONT }}>
      <style>{`
        @keyframes newsAppear { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes newsSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .news-spin { animation: newsSpin 1s linear infinite; }
        @media (max-width: 640px) { .refresh-label { display: none; } }
      `}</style>

      {/* Section header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(139,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Newspaper className="text-red-700 w-16 h-16" />
            <div>
                <h2 style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
                SECURITY NEWS
                </h2>
                <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 11, letterSpacing: 3, marginTop: 3, fontFamily: FONT }}>
                AI-CURATED · KREBS · THN · CISA · BLEEPINGCOMPUTER · SCHNEIER
                </p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchNews(true)} disabled={refreshing || loading}
            style={{ border: '1px solid rgba(139,0,0,0.5)', padding: '5px 14px', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: FONT, letterSpacing: 1 }}
          >
            <RefreshCw size={11} className={refreshing ? 'news-spin' : ''} />
            <span className="refresh-label">{refreshing ? 'FETCHING…' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* Filter pills */}
      {!loading && !error && items.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => { setActiveFilter('ALL'); setVisibleCount(3); }} style={{ border: `1px solid ${activeFilter === 'ALL' ? 'rgba(239,68,68,0.7)' : 'rgba(139,0,0,0.3)'}`, background: activeFilter === 'ALL' ? 'rgba(239,68,68,0.1)' : 'transparent', color: activeFilter === 'ALL' ? '#ef4444' : 'rgba(209,213,219,0.55)', padding: '4px 14px', fontSize: 10, fontFamily: FONT, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.15s' }}>
            ALL ({items.length})
          </button>
          {Object.entries(SEVERITY_CFG).map(([sev, cfg]) => counts[sev] > 0 && (
            <button key={sev} onClick={() => { setActiveFilter(sev); setVisibleCount(3); }} style={{ border: `1px solid ${activeFilter === sev ? cfg.border : 'rgba(139,0,0,0.3)'}`, background: activeFilter === sev ? cfg.bg : 'transparent', color: activeFilter === sev ? cfg.color : 'rgba(209,213,219,0.55)', padding: '4px 14px', fontSize: 10, fontFamily: FONT, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.15s' }}>
              {sev} ({counts[sev]})
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(209,213,219,0.45)', fontFamily: FONT, fontSize: 12, letterSpacing: 2 }}>
          <Newspaper size={28} style={{ color: 'rgba(239,68,68,0.35)', margin: '0 auto 12px' }} />
          FETCHING + ANALYZING NEWS…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ border: '1px solid rgba(255,51,51,0.4)', background: 'rgba(255,51,51,0.06)', padding: '16px 20px', fontSize: 12, color: '#ff6060', fontFamily: FONT }}>
          ERROR: {error}
          <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,96,96,0.6)' }}>RSS feeds may be temporarily unavailable. Try refreshing.</div>
        </div>
      )}

      {/* News cards */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0
            ? <div style={{ color: 'rgba(209,213,219,0.35)', textAlign: 'center', padding: 40, fontSize: 12, fontFamily: FONT }}>
                NO {activeFilter} ITEMS
                </div>
            : <>
                {filtered.slice(0, visibleCount).map((item, i) => (
                    <NewsCard key={`${item.source}-${i}`} item={item} index={i} />
                ))}

                {visibleCount < filtered.length && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                        onClick={() => setVisibleCount(v => v + 3)}
                        style={{ flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid rgba(139,0,0,0.5)', color: '#ef4444', fontFamily: FONT, fontSize: 12, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(139,0,0,0.5)'; }}
                    >
                        LOAD MORE ({filtered.length - visibleCount} remaining)
                    </button>
                    <button
                        onClick={() => setVisibleCount(filtered.length)}
                        style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(139,0,0,0.3)', color: 'rgba(209,213,219,0.45)', fontFamily: FONT, fontSize: 12, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.2s' }}
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

      {!loading && !error && items.length > 0 && (
        <div style={{ marginTop: 14, color: 'rgba(209,213,219,0.25)', fontSize: 10, textAlign: 'center', fontFamily: FONT, letterSpacing: 1 }}>
          SUMMARIES GENERATED BY CLAUDE AI · ORIGINAL CONTENT BELONGS TO RESPECTIVE PUBLISHERS
        </div>
      )}
    </div>
  );
};

export default NewsSection;