// Dev-only: lets `npm start` serve the Cloudflare Pages Functions in
// functions/api/ (GitHub graph, KEV, news, CVEs), which the CRA dev server
// can't run on its own. Each /api/<name> request is handed to
// functions/api/<name>.js with a standard Request, the same way Cloudflare
// calls it in production. Never bundled into the production build.
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const FUNCTIONS_DIR = path.join(__dirname, '..', 'functions', 'api');

module.exports = function (app) {
  app.use('/api/:name', async (req, res, next) => {
    const name = req.params.name;
    const file = path.join(FUNCTIONS_DIR, `${name}.js`);
    if (!/^[a-z0-9-]+$/i.test(name) || !fs.existsSync(file)) return next();

    try {
      const { onRequest } = await import(pathToFileURL(file).href);
      const url = `http://${req.headers.host}${req.originalUrl}`;
      const request = new Request(url, { method: req.method, headers: req.headers });
      // process.env already includes .env.local (loaded by react-scripts)
      const response = await onRequest({ request, env: process.env });

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      res.status(500).json({ error: 'Local function failed', detail: err.message });
    }
  });
};
