// Cloudflare Pages Function — proxies NVD API requests server-side.
// This keeps the API key out of the client bundle and avoids CORS issues.
export async function onRequest(context) {
  const { request, env } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // NVD_API_KEY is the canonical name; REACT_APP_NVD_API_KEY kept as a
  // fallback until the Cloudflare Pages dashboard variable is renamed.
  // (Never use the REACT_APP_ prefix for secrets — CRA inlines those into
  // the public client bundle if they are ever referenced in src/.)
  const apiKey = env.NVD_API_KEY ?? env.REACT_APP_NVD_API_KEY;
  const url = new URL(request.url);

  // Forward only an allowlisted set of query params — never trust the raw
  // path or pass arbitrary client params through to NVD.
  const ALLOWED_PARAMS = ['pubStartDate', 'pubEndDate', 'cvssV3Severity', 'resultsPerPage'];
  const params = new URLSearchParams();
  for (const key of ALLOWED_PARAMS) {
    const value = url.searchParams.get(key);
    if (value !== null) params.set(key, value);
  }
  // Cap page size so the proxy can't be used to pull oversized responses
  const perPage = parseInt(params.get('resultsPerPage') ?? '', 10);
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 50) {
    params.set('resultsPerPage', '20');
  }
  const nvdUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?${params.toString()}`;

  try {
    const response = await fetch(nvdUrl, {
      headers: apiKey ? { 'apiKey': apiKey } : {},
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        // Restrict to your own domain — no need for a wildcard here
        'Access-Control-Allow-Origin': 'https://hiratrahi.com',
        // 15-minute edge cache so Cloudflare absorbs repeated hits
        'Cache-Control': 'public, max-age=900',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upstream fetch failed', detail: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}