// Cloudflare Pages Function - proxies the CISA Known Exploited Vulnerabilities
// (KEV) catalog. KEV lists CVEs with CONFIRMED active exploitation in the wild,
// which is distinct from the raw NVD disclosure feed. Proxied server-side to
// avoid CORS, trim the ~1MB payload to the most recent entries, and cache at
// the edge (the catalog updates roughly daily).
const KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

export async function onRequest(context) {
  const { request } = context;

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const upstream = await fetch(KEV_URL, {
      headers: { 'User-Agent': 'hiratrahi.com security intel reader' },
      cf: { cacheTtl: 3600, cacheEverything: true }, // 1h edge cache
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `KEV upstream ${upstream.status}`, vulnerabilities: [] }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await upstream.json();

    // Newest additions first, trimmed to the 40 most recent with only the
    // fields the UI needs.
    const vulnerabilities = (data.vulnerabilities ?? [])
      .slice()
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 40)
      .map(v => ({
        cveID: v.cveID,
        vendorProject: v.vendorProject,
        product: v.product,
        vulnerabilityName: v.vulnerabilityName,
        dateAdded: v.dateAdded,
        shortDescription: v.shortDescription,
        requiredAction: v.requiredAction,
        dueDate: v.dueDate,
        knownRansomwareCampaignUse: v.knownRansomwareCampaignUse,
      }));

    return new Response(JSON.stringify({
      catalogVersion: data.catalogVersion,
      dateReleased: data.dateReleased,
      totalCount: data.count,
      vulnerabilities,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Restrict to your own domain - same policy as /api/cves and /api/news
        'Access-Control-Allow-Origin': 'https://hiratrahi.com',
        'Cache-Control': 'public, max-age=3600', // 1h browser + edge cache
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'KEV fetch failed', detail: err.message, vulnerabilities: [] }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
