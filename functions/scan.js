export async function onRequest(context) {
  const url = new URL(context.request.url);
  const indexUrl = new URL('/index.html', url);
  return context.env.ASSETS.fetch(indexUrl.toString());
}
