// Cloudflare Pages Function — proxies NVD API requests server-side.
// This keeps the API key out of the client bundle and avoids CORS issues.
export async function onRequest(context) {
  const { request, env } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = env.REACT_APP_NVD_API_KEY;
  const url = new URL(request.url);

  // Forward only the query params — never trust the raw path
  const nvdUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?${url.searchParams.toString()}`;

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