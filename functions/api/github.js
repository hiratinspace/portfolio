// Cloudflare Pages Function - returns the last year of GitHub contribution
// data for the profile heatmap on the home page. GitHub's public
// contributions page has no CORS headers and the GraphQL API needs a token,
// so the calendar HTML is fetched server-side, parsed into a compact JSON
// list of days, and cached at the edge (the graph only changes a few times a day).
const GITHUB_USER = 'hiratinspace';
const CONTRIB_URL = `https://github.com/users/${GITHUB_USER}/contributions`;

// Pull a single attribute value out of an HTML tag string, regardless of
// attribute order (GitHub reorders them between releases).
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const upstream = await fetch(CONTRIB_URL, {
      headers: { 'User-Agent': 'hiratrahi.com contribution graph' },
      cf: { cacheTtl: 3600, cacheEverything: true }, // 1h edge cache
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `GitHub upstream ${upstream.status}`, days: [] }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const html = await upstream.text();

    // Each day's count lives in a <tool-tip> linked to its cell by id,
    // e.g. "3 contributions on May 4th." or "No contributions on May 5th."
    const counts = {};
    for (const [, id, text] of html.matchAll(/<tool-tip[^>]*\sfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
      const m = text.match(/^(\d+) contributions?/);
      counts[id] = m ? parseInt(m[1], 10) : 0;
    }

    const days = [];
    for (const [tag] of html.matchAll(/<td[^>]*\sdata-date="[^"]+"[^>]*>/g)) {
      const date = attr(tag, 'data-date');
      const level = parseInt(attr(tag, 'data-level') ?? '0', 10);
      const id = attr(tag, 'id');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      days.push({ date, count: counts[id] ?? 0, level: Math.min(Math.max(level, 0), 4) });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));

    if (days.length === 0) {
      return new Response(JSON.stringify({ error: 'Could not parse contribution calendar', days: [] }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      user: GITHUB_USER,
      total: days.reduce((sum, d) => sum + d.count, 0),
      days,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Restrict to your own domain - same policy as the other /api routes
        'Access-Control-Allow-Origin': 'https://hiratrahi.com',
        'Cache-Control': 'public, max-age=3600', // 1h browser + edge cache
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'GitHub fetch failed', detail: err.message, days: [] }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
