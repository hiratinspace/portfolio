// Dev-only: lets `npm start` serve the Cloudflare Pages Functions in
// functions/api/ (GitHub graph, KEV, news, CVEs, Nova), which the CRA dev
// server can't run on its own. Each /api/<name> request is handed to
// functions/api/<name>.js with a standard Request, the same way Cloudflare
// calls it in production. Never bundled into the production build.
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const FUNCTIONS_DIR = path.join(ROOT, 'functions', 'api');
// Nova's rules live in a Cloudflare secret in production; locally they come
// from this gitignored file.
const LOCAL_RULES = path.join(ROOT, 'nova', 'rules.local.md');

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

module.exports = function (app) {
  app.use('/api/:name', async (req, res, next) => {
    const name = req.params.name;
    const file = path.join(FUNCTIONS_DIR, `${name}.js`);
    if (!/^[a-z0-9-]+$/i.test(name) || !fs.existsSync(file)) return next();

    try {
      // The mtime query makes Node reload a function after it's edited
      // (import() caches by URL), so changes show up without a restart.
      const version = fs.statSync(file).mtimeMs;
      const mod = await import(`${pathToFileURL(file).href}?v=${version}`);
      const method = req.method.charAt(0) + req.method.slice(1).toLowerCase();
      const handler = mod[`onRequest${method}`] || mod.onRequest;
      if (!handler) return res.status(405).end();

      const url = `http://${req.headers.host}${req.originalUrl}`;
      const hasBody = !['GET', 'HEAD'].includes(req.method);
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        body: hasBody ? await readBody(req) : undefined,
      });

      // process.env already includes .env.local (loaded by react-scripts)
      const env = { ...process.env };
      if (!env.NOVA_RULES && fs.existsSync(LOCAL_RULES)) {
        env.NOVA_RULES = fs.readFileSync(LOCAL_RULES, 'utf8');
      }
      const response = await handler({ request, env });

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.flushHeaders();
      if (response.body) {
        // Stream through so Nova's replies appear as they're written
        for await (const chunk of response.body) res.write(chunk);
      }
      res.end();
    } catch (err) {
      if (res.headersSent) return res.end();
      res.status(500).json({ error: 'Local function failed', detail: err.message });
    }
  });
};
