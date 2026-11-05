/**
 * Cloudflare Pages Function: /api/nova
 *
 * Nova, the AI assistant on hiratrahi.com. Answers visitor questions about
 * Hirat using only the public profile in nova/profile.md, streamed back to
 * the browser as server-sent events.
 *
 * Required secrets (Cloudflare dashboard -> Settings -> Variables and Secrets):
 *   NOVA_API_KEY  - Anthropic API key used only by Nova
 *   NOVA_RULES    - Nova's behaviour rules (kept out of the public repo)
 *
 * If either is missing Nova reports itself offline instead of running
 * without guardrails.
 *
 * Abuse limits: input size caps, a short history window, a per-visitor
 * request limit, and a capped reply length. Pair with a Cloudflare WAF
 * rate-limiting rule on /api/nova and a monthly spend limit on the key.
 */
import Anthropic from '@anthropic-ai/sdk';
import PROFILE from '../../nova/profile.generated.js';

const MODEL = 'claude-haiku-5-5';
const MAX_REPLY_TOKENS = 1500;
const MAX_BODY_BYTES = 20_000;
const MAX_HISTORY = 12;          // messages sent to the model (latest first kept)
const MAX_USER_CHARS = 1000;
const MAX_ASSISTANT_CHARS = 4000;

// Per-visitor limit. Best effort only: it is per Cloudflare isolate, so the
// WAF rule in the dashboard is the real limit.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const recentRequests = new Map();

const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?hiratrahi\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?portfolio-evo\.pages\.dev$/,
  /^http:\/\/localhost:(3000|8788)$/,
];

const REFUSAL_REPLY =
  "I can't help with that one. Ask me about Hirat's work, projects, or experience, " +
  'or email him at hrahi@iwu.edu.';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (recentRequests.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recentRequests.set(ip, hits);
  if (recentRequests.size > 5000) recentRequests.clear(); // keep memory bounded
  return hits.length > MAX_REQUESTS_PER_WINDOW;
}

// Accepts only a well-formed, alternating user/assistant text history that
// ends with the visitor's question. Returns null if anything is off.
function cleanHistory(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 40) return null;

  const cleaned = [];
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null;
    const content = m.content.trim();
    const limit = m.role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS;
    if (!content || content.length > limit) return null;
    const prev = cleaned[cleaned.length - 1];
    if (prev && prev.role === m.role) return null;
    cleaned.push({ role: m.role, content });
  }
  if (cleaned[cleaned.length - 1].role !== 'user') return null;

  // Keep the latest messages, starting on a user turn
  let recent = cleaned.slice(-MAX_HISTORY);
  if (recent[0].role !== 'user') recent = recent.slice(1);
  return recent;
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && !ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    return json(403, { error: 'Forbidden' });
  }

  if (!env.NOVA_API_KEY || !env.NOVA_RULES) {
    return json(503, { error: 'Nova is on PTO now.' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  if (isRateLimited(ip)) {
    return json(429, { error: 'Too many messages. Try again in a few minutes.' });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Message too long.' });

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(400, { error: 'Invalid request.' });
  }
  const messages = cleanHistory(body?.messages);
  if (!messages) return json(400, { error: 'Invalid conversation.' });

  const client = new Anthropic({ apiKey: env.NOVA_API_KEY });
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const send = (event) => writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

  // Stream in the background while the response is already being returned
  (async () => {
    try {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: MAX_REPLY_TOKENS,
        output_config: { effort: 'low' },
        // Rules first, then the profile; the cache marker covers both, so
        // repeat visitors don't pay full price for the same ~4k tokens.
        system: [
          { type: 'text', text: env.NOVA_RULES },
          {
            type: 'text',
            text: `PROFILE (the only source of facts about Hirat):\n\n${PROFILE}`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          await send({ type: 'text', text: event.delta.text });
        }
      }

      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') {
        await send({ type: 'replace', text: REFUSAL_REPLY });
      }
      await send({ type: 'done' });
    } catch (err) {
      const status = err instanceof Anthropic.APIError ? err.status : undefined;
      console.error(`nova: request failed${status ? ` (${status})` : ''}: ${err?.message?.slice(0, 200)}`);
      const message =
        status === 429 || status === 529
          ? 'Nova is busy right now. Try again in a minute.'
          : 'Nova hit a problem answering that. Try again, or email hrahi@iwu.edu.';
      await send({ type: 'error', message }).catch(() => {});
    } finally {
      await writer.close().catch(() => {});
    }
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
