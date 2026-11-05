// Turns nova/profile.md into a JS module the /api/nova function can import
// (Cloudflare's function bundler can't import .md files directly).
// Runs automatically before `npm start` and `npm run build`.
import { readFileSync, writeFileSync } from 'node:fs';

const source = new URL('../nova/profile.md', import.meta.url);
const target = new URL('../nova/profile.generated.js', import.meta.url);

const markdown = readFileSync(source, 'utf8');
const output =
  '// Generated from nova/profile.md by scripts/build-nova-profile.mjs.\n' +
  '// Edit the .md file, not this one.\n' +
  `export default ${JSON.stringify(markdown)};\n`;

writeFileSync(target, output);
console.log('Nova profile built from nova/profile.md');
