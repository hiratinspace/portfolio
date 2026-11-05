// Helpers shared by Nova's Pages Functions (functions/api/nova.js and
// functions/api/nova-message.js). Kept outside functions/ so Pages doesn't
// turn this file into a route.

const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?hiratrahi\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?portfolio-evo\.pages\.dev$/,
  /^http:\/\/localhost:(3000|8788)$/,
];

// Browsers always send Origin on POST; requests without one (curl, servers)
// are let through and left to the other limits.
export const isAllowedOrigin = (request) => {
  const origin = request.headers.get('Origin');
  return !origin || ALLOWED_ORIGINS.some((re) => re.test(origin));
};

export const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Per-visitor request limit. Best effort only: it is per Cloudflare isolate,
// so a WAF rate-limiting rule in the dashboard is the real limit.
export const createRateLimiter = ({ windowMs, max }) => {
  const hits = new Map();
  return (request) => {
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 5000) hits.clear(); // keep memory bounded
    return recent.length > max;
  };
};

// Reads a JSON body up to maxBytes. Returns { body } or { error: Response }.
export const readJson = async (request, maxBytes) => {
  const raw = await request.text();
  if (raw.length > maxBytes) return { error: json(413, { error: 'Message too long.' }) };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: json(400, { error: 'Invalid request.' }) };
  }
};
