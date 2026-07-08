import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Crosshair, ChevronDown, Skull } from 'lucide-react';

const FONT = "'Monaco', 'Courier New', monospace";

const fmtDate = (s) => {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return s; }
};

// ── Single KEV card ───────────────────────────────────────────────────────────
const KevCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  const ransomware = item.knownRansomwareCampaignUse === 'Known';
  const accent = ransomware ? '#ff3333' : '#ff8c42';
  const accentBg = ransomware ? 'rgba(255,51,51,0.10)' : 'rgba(255,140,66,0.08)';
  const accentBorder = ransomware ? 'rgba(255,51,51,0.45)' : 'rgba(255,140,66,0.4)';

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: open ? accentBg : 'rgba(10,0,0,0.55)',
        borderLeft: `3px solid ${open ? accent : 'rgba(180,0,30,0.4)'}`,
        borderTop: '1px solid rgba(139,0,0,0.3)',
        borderRight: '1px solid rgba(139,0,0,0.3)',
        borderBottom: '1px solid rgba(139,0,0,0.3)',
        padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s',
        fontFamily: FONT,
        animation: `kevAppear 0.3s ease ${index * 45}ms both`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderLeftColor = accent; e.currentTarget.style.background = accentBg; }}
      onMouseLeave={e => { if (!open) { e.currentTarget.style.borderLeftColor = 'rgba(180,0,30,0.4)'; e.currentTarget.style.background = 'rgba(10,0,0,0.55)'; } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Top row: CVE ID + ransomware flag + vendor/product + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ color: '#f0f0f0', fontWeight: 700, fontSize: 13, letterSpacing: 0.5, textShadow: `0 0 10px ${accent}66` }}>
              {item.cveID}
            </span>
            {ransomware && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,51,51,0.12)', border: '1px solid rgba(255,51,51,0.5)', color: '#ff5555', fontSize: 9, fontWeight: 700, padding: '2px 8px', letterSpacing: 1.5 }}>
                <Skull size={9} /> RANSOMWARE
              </span>
            )}
            <span style={{ color: 'rgba(209,213,219,0.5)', fontSize: 11 }}>
              {item.vendorProject}{item.product ? ` · ${item.product}` : ''}
            </span>
            <span style={{ color: 'rgba(209,213,219,0.3)', fontSize: 11 }}>· added {fmtDate(item.dateAdded)}</span>
          </div>

          {/* Vulnerability name */}
          <p style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600, lineHeight: 1.5, marginBottom: 4, fontFamily: FONT }}>
            {item.vulnerabilityName}
          </p>

          {/* Short description */}
          <p style={{ color: 'rgba(209,213,219,0.7)', fontSize: 12, lineHeight: 1.6, fontFamily: FONT }}>
            {item.shortDescription}
          </p>

        </div>
        <ChevronDown size={13} style={{ color: accent, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0, marginTop: 2 }} />
      </div>

      {/* Expanded: required action + due date + link */}
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${accentBorder}` }}>
          {item.requiredAction && (
            <p style={{ color: 'rgba(209,213,219,0.6)', fontSize: 12, lineHeight: 1.65, marginBottom: 8, fontFamily: FONT }}>
              <span style={{ color: accent, fontWeight: 700 }}>REQUIRED ACTION: </span>{item.requiredAction}
            </p>
          )}
          {item.dueDate && (
            <p style={{ color: 'rgba(209,213,219,0.45)', fontSize: 11, marginBottom: 10, fontFamily: FONT, letterSpacing: 1 }}>
              REMEDIATION DUE: {fmtDate(item.dueDate)}
            </p>
          )}
          <a
            href={`https://nvd.nist.gov/vuln/detail/${item.cveID}`}
            target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ color: accent, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5, border: `1px solid ${accentBorder}`, padding: '3px 10px', textDecoration: 'none', letterSpacing: 1, fontFamily: FONT }}
          >
            <ExternalLink size={10} /> VIEW ON NVD
          </a>
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const KevSection = () => {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [ransomwareOnly, setRansomwareOnly] = useState(false);
  const [visibleCount, setVisibleCount]     = useState(4);

  const fetchKev = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kev');
      if (res.headers.get('content-type')?.includes('text/html')) {
        throw new Error('KEV API only available on deployed site — not in local dev');
      }
      if (!res.ok) throw new Error(`KEV API error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.vulnerabilities ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchKev(); }, []);

  const ransomwareCount = items.filter(i => i.knownRansomwareCampaignUse === 'Known').length;
  const filtered = ransomwareOnly ? items.filter(i => i.knownRansomwareCampaignUse === 'Known') : items;

  return (
    <div style={{ marginBottom: 56, fontFamily: FONT }}>
      <style>{`
        @keyframes kevAppear { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes kevSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .kev-spin { animation: kevSpin 1s linear infinite; }
        @media (max-width: 640px) { .refresh-label { display: none; } }
      `}</style>

      {/* Section header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(139,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Crosshair className="text-red-700 w-16 h-16" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.8)', display: 'inline-block', flexShrink: 0 }} className="pulse-dot" />
              <span style={{ color: '#ef4444', fontSize: 10, letterSpacing: 3, fontFamily: FONT }}>LIVE CISA KEV</span>
            </div>
            <h2 style={{ fontFamily: FONT, fontSize: 'clamp(1.6rem,4vw,2.25rem)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
              EXPLOITED IN THE WILD
            </h2>
            <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 11, letterSpacing: 3, marginTop: 3, fontFamily: FONT }}>
              KNOWN EXPLOITED VULNERABILITIES CATALOG
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchKev(true)} disabled={refreshing || loading}
            style={{ border: '1px solid rgba(139,0,0,0.5)', padding: '5px 14px', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: FONT, letterSpacing: 1 }}
          >
            <RefreshCw size={11} className={refreshing ? 'kev-spin' : ''} />
            <span className="refresh-label">{refreshing ? 'FETCHING…' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* Intro + ransomware filter */}
      {!loading && !error && items.length > 0 && (
        <>
          <p style={{ color: 'rgba(243,235,235,0.85)', fontSize: 13, lineHeight: 1.7, fontFamily: FONT, maxWidth: 620, marginBottom: 16 }}>
            Not just disclosed — <strong style={{ color: '#fff', fontWeight: 700 }}>confirmed exploited</strong>. CVEs that CISA has verified are under active attack in the wild (of any age), which is why federal agencies are required to patch them by the listed due date.
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => { setRansomwareOnly(false); setVisibleCount(4); }} style={{ border: `1px solid ${!ransomwareOnly ? 'rgba(239,68,68,0.7)' : 'rgba(139,0,0,0.3)'}`, background: !ransomwareOnly ? 'rgba(239,68,68,0.1)' : 'transparent', color: !ransomwareOnly ? '#ef4444' : 'rgba(209,213,219,0.55)', padding: '4px 14px', fontSize: 10, fontFamily: FONT, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.15s' }}>
              ALL RECENT ({items.length})
            </button>
            <button onClick={() => { setRansomwareOnly(true); setVisibleCount(4); }} disabled={ransomwareCount === 0} style={{ border: `1px solid ${ransomwareOnly ? 'rgba(255,51,51,0.6)' : 'rgba(139,0,0,0.3)'}`, background: ransomwareOnly ? 'rgba(255,51,51,0.12)' : 'transparent', color: ransomwareCount === 0 ? 'rgba(209,213,219,0.25)' : (ransomwareOnly ? '#ff5555' : 'rgba(209,213,219,0.55)'), padding: '4px 14px', fontSize: 10, fontFamily: FONT, letterSpacing: 1.5, cursor: ransomwareCount === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
              RANSOMWARE-LINKED ({ransomwareCount})
            </button>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(209,213,219,0.45)', fontFamily: FONT, fontSize: 12, letterSpacing: 2 }}>
          <Crosshair size={28} style={{ color: 'rgba(239,68,68,0.35)', margin: '0 auto 12px' }} />
          QUERYING CISA KEV CATALOG…
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ border: '1px solid rgba(255,51,51,0.4)', background: 'rgba(255,51,51,0.06)', padding: '16px 20px', fontSize: 12, color: '#ff6060', fontFamily: FONT }}>
          ERROR: {error}
          <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,96,96,0.6)' }}>CISA feed may be temporarily unavailable. Try refreshing.</div>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0
            ? <div style={{ color: 'rgba(209,213,219,0.35)', textAlign: 'center', padding: 40, fontSize: 12, fontFamily: FONT }}>
                NO ENTRIES
              </div>
            : <>
                {filtered.slice(0, visibleCount).map((item, i) => (
                  <KevCard key={item.cveID ?? i} item={item} index={i} />
                ))}

                {visibleCount < filtered.length && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      onClick={() => setVisibleCount(v => v + 4)}
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
          SOURCE: CISA KNOWN EXPLOITED VULNERABILITIES CATALOG · PUBLIC DOMAIN
        </div>
      )}
    </div>
  );
};

export default KevSection;
