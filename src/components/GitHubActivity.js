import React, { useState, useEffect, useRef } from 'react';
import { Github, ExternalLink } from 'lucide-react';

const FONT = "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace";
const PROFILE_URL = 'https://github.com/hiratinspace';

// Red heat scale to match the site theme (GitHub levels 0-4)
const LEVEL_COLORS = [
  'rgba(127,29,29,0.18)',
  'rgba(153,27,27,0.55)',
  'rgba(185,28,28,0.75)',
  'rgba(220,38,38,0.9)',
  '#f87171',
];

// Cell size and spacing in px (53 weeks x 18px fills the desktop card; mobile scrolls)
const CELL = 14;
const GAP = 4;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Dates arrive as YYYY-MM-DD; parse as UTC so the weekday never shifts with
// the visitor's time zone.
const parseDay = (s) => new Date(`${s}T00:00:00Z`);

const fmtDay = (s) =>
  parseDay(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const computeStats = (days) => {
  let longest = 0, run = 0, best = days[0];
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (d.count > best.count) best = d;
  }
  // Current streak counts back from today; an empty "today" doesn't break it
  // because the day isn't over yet.
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].count > 0) { current++; i--; }
  return { longest, current, best };
};

const GitHubActivity = () => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/github')
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(json => {
        if (cancelled) return;
        if (!Array.isArray(json.days) || json.days.length === 0) throw new Error('empty');
        setData(json);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  // On narrow screens the graph scrolls sideways; start at the most recent week.
  useEffect(() => {
    if (data && scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [data]);

  // Build week columns, padding the first week so each row is a weekday.
  let weeks = [];
  let monthLabels = [];
  let stats = null;
  if (data) {
    const cells = [...Array(parseDay(data.days[0].date).getUTCDay()).fill(null), ...data.days];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    let lastMonth = -1;
    monthLabels = weeks.map((week) => {
      const first = week.find(Boolean);
      const month = first ? parseDay(first.date).getUTCMonth() : lastMonth;
      if (month !== lastMonth) { lastMonth = month; return MONTHS[month]; }
      return '';
    });
    stats = computeStats(data.days);
  }

  return (
    <section id="github" className="py-16 sm:py-[clamp(4rem,10vh,6rem)] bg-gradient-to-b from-black to-burgundy-950/20 px-4 sm:px-6 relative" style={{ zIndex: 10 }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div className="flex items-center space-x-3">
            <Github className="text-red-500 w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">GITHUB ACTIVITY</h2>
          </div>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="self-start sm:self-auto px-4 py-2 border border-red-900 hover:border-red-700 hover:bg-red-950/30 transition-all text-xs tracking-widest text-red-400 flex items-center gap-2"
            style={{ fontFamily: FONT }}
            aria-label="GitHub profile (opens in new tab)"
          >
            @hiratinspace <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="border border-red-900/50 p-4 sm:p-6 bg-gradient-to-br from-burgundy-950/20 to-black">
          {failed && (
            <p className="text-gray-400 text-sm" style={{ fontFamily: FONT }}>
              Contribution graph unavailable right now.{' '}
              <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline">
                View it on GitHub
              </a>.
            </p>
          )}

          {!failed && !data && (
            <div className="h-40 animate-pulse bg-red-950/20" aria-label="Loading contribution graph" />
          )}

          {data && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: 'CONTRIBUTIONS / YEAR', value: data.total.toLocaleString('en-US') },
                  { label: 'CURRENT STREAK', value: `${stats.current} day${stats.current === 1 ? '' : 's'}` },
                  { label: 'LONGEST STREAK', value: `${stats.longest} day${stats.longest === 1 ? '' : 's'}` },
                  { label: 'BEST DAY', value: `${stats.best.count} on ${fmtDay(stats.best.date).replace(/, \d{4}$/, '')}` },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-red-900/40 bg-black/40 px-3 py-3">
                    <p className="text-[10px] tracking-widest text-red-400 mb-1" style={{ fontFamily: FONT }}>{label}</p>
                    <p className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: FONT }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Heatmap */}
              <div ref={scrollRef} className="overflow-x-auto pb-2">
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, fontFamily: FONT }}>
                  <div aria-hidden="true" style={{ display: 'flex', gap: GAP, paddingLeft: 34 }}>
                    {monthLabels.map((m, i) => (
                      <span key={i} style={{ width: CELL, fontSize: 10, color: 'rgba(209,213,219,0.7)', whiteSpace: 'nowrap', overflow: 'visible' }}>{m}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: GAP }}>
                    <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: GAP, width: 30 }}>
                      {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <span key={i} style={{ height: CELL, fontSize: 9, lineHeight: `${CELL}px`, color: 'rgba(209,213,219,0.7)' }}>{d}</span>
                      ))}
                    </div>
                    <div role="img" aria-label={`Contribution heatmap: ${data.total.toLocaleString('en-US')} GitHub contributions in the last year, longest streak ${stats.longest} days`} style={{ display: 'flex', gap: GAP }}>
                      {weeks.map((week, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                          {week.map((day, di) => (
                            day ? (
                              <div
                                key={di}
                                title={`${day.count === 0 ? 'No' : day.count} contribution${day.count === 1 ? '' : 's'} on ${fmtDay(day.date)}`}
                                style={{
                                  width: CELL, height: CELL,
                                  background: LEVEL_COLORS[day.level],
                                  boxShadow: day.level === 4 ? '0 0 6px rgba(248,113,113,0.6)' : 'none',
                                }}
                              />
                            ) : <div key={di} style={{ width: CELL, height: CELL }} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-gray-400" style={{ fontFamily: FONT }}>
                <span className="mr-1">Less</span>
                {LEVEL_COLORS.map((c, i) => <span key={i} style={{ width: 11, height: 11, background: c, display: 'inline-block' }} />)}
                <span className="ml-1">More</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GitHubActivity;
