export async function onRequest(context) {
  const apiKey = context.env.REACT_APP_NVD_API_KEY;
  const url = new URL(context.request.url);
  
  // Forward query params from the client request to NVD
  const nvdUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?${url.searchParams.toString()}`;
  
  const response = await fetch(nvdUrl, {
    headers: apiKey ? { 'apiKey': apiKey } : {}
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=900' // 15 min edge cache
    }
  });
}