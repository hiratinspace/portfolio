/**
 * /functions/api/news.js  - Cloudflare Pages Function
 *
 * Fetches cybersecurity RSS feeds in parallel, strips them down to
 * title + description + link, then sends a single batch request to
 * Claude to categorize every item and add a severity tag.
 *
 * Environment variables needed (set in Cloudflare Pages dashboard):
 *   ANTHROPIC_API_KEY   - your Anthropic API key
 *
 * Response is cached at the edge for 20 minutes so Claude isn't
 * called on every page load.
 */

const FEEDS = [
  { source: 'Krebs on Security',  url: 'https://krebsonsecurity.com/feed/',                    limit: 3 },
  { source: 'The Hacker News',    url: 'https://feeds.feedburner.com/TheHackersNews',            limit: 4 },
  { source: 'CISA Alerts',        url: 'https://www.cisa.gov/news.xml',                          limit: 3 },
  { source: 'BleepingComputer',   url: 'https://www.bleepingcomputer.com/feed/',                 limit: 3 },
  { source: 'Schneier on Security', url: 'https://www.schneier.com/feed/atom/',                  limit: 2 },
];

// ── Minimal XML parser - extracts <item> / <entry> blocks from RSS/Atom ──────
function parseItems(xml, limit) {
  const items = [];
  // Support both RSS <item> and Atom <entry>
  const tagRe = /<(?:item|entry)[\s>]([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;
  while ((match = tagRe.exec(xml)) !== null && items.length < limit) {
    const block = match[1];
    const get = (tag) => {
      // Try CDATA first, then plain text
      const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))</${tag}>`, 'i');
      const m = re.exec(block);
      return m ? (m[1] ?? m[2] ?? '').trim() : '';
    };
    const title = get('title');
    const link  = get('link') || (/<link[^>]+href="([^"]+)"/i.exec(block)?.[1] ?? '');
    const desc  = get('description') || get('summary') || get('content');
    const pubDate = get('pubDate') || get('published') || get('updated') || '';

    if (title) {
      items.push({
        title,
        link,
        // Strip HTML tags from description; cap at 300 chars for the Claude prompt
        description: desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 300),
        pubDate,
      });
    }
  }
  return items;
}

// ── Fetch one RSS feed, return parsed items ───────────────────────────────────
async function fetchFeed({ source, url, limit }) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'hiratrahi.com security intel reader' },
      cf: { cacheTtl: 1200 }, // Cloudflare edge cache for 20 min
    });
    if (!res.ok) return [];
    const xml   = await res.text();
    const items = parseItems(xml, limit);
    return items.map(item => ({ ...item, source }));
  } catch {
    return []; // Individual feed failure shouldn't break the whole response
  }
}

// ── Ask Claude to categorize and summarize all items in one batch call ────────
async function enrichWithClaude(items, apiKey) {
  if (!apiKey) {
    // No API key - return items with neutral tags so the UI still works
    return items.map(item => ({
      ...item,
      severity: 'INFO',
      category: 'General',
      summary: item.description || item.title,
    }));
  }

  const prompt = `You are a cybersecurity analyst. For each news item below, return a JSON array where each element has:
- "severity": one of CRITICAL / HIGH / MEDIUM / INFO  (based on threat level, not hype)
- "category": one short label from: Ransomware | Vulnerability | Data Breach | Malware | APT | Patch | Policy | Research | Other
- "summary": one sentence (max 20 words) summarising the security significance

Be conservative with CRITICAL - only use it for actively exploited 0-days, major breaches, or widespread ransomware campaigns.

Respond ONLY with a valid JSON array, no markdown, no preamble.

Items:
${items.map((item, i) => `${i}. [${item.source}] ${item.title} - ${item.description}`).join('\n')}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // Fast + cheap for batch categorization
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    // Claude call failed - return items as-is with neutral tags
    return items.map(item => ({ ...item, severity: 'INFO', category: 'General', summary: item.description || item.title }));
  }

  const data = await res.json();
  const raw  = data.content?.[0]?.text ?? '[]';

  try {
    const enriched = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return items.map((item, i) => ({
      ...item,
      severity: enriched[i]?.severity ?? 'INFO',
      category: enriched[i]?.category ?? 'General',
      summary:  enriched[i]?.summary  ?? item.description ?? item.title,
    }));
  } catch {
    return items.map(item => ({ ...item, severity: 'INFO', category: 'General', summary: item.description || item.title }));
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function onRequest(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;

  // Fetch all feeds in parallel
  const allItems = (await Promise.all(FEEDS.map(fetchFeed))).flat();

  if (allItems.length === 0) {
    return new Response(JSON.stringify({ error: 'All feeds failed', items: [] }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Enrich with Claude (single batch call)
  const enriched = await enrichWithClaude(allItems, apiKey);

  // Sort: CRITICAL first, then HIGH, then others; within same severity by date
  const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, INFO: 3 };
  enriched.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3));

  return new Response(JSON.stringify({ items: enriched, fetchedAt: new Date().toISOString() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=1200', // 20 min browser + edge cache
      // Restrict to your own domain - same policy as /api/cves
      'Access-Control-Allow-Origin': 'https://hiratrahi.com',
    },
  });
}