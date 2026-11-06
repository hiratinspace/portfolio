/**
 * Cloudflare Pages Function: /api/nova-message
 *
 * The "Leave a message" form in the Nova chat. Emails a visitor's note (and,
 * if they choose, their chat with Nova) to Hirat through Cloudflare Email
 * Service. Hirat's address is a verified Email Routing destination, so these
 * sends are free and don't count toward any sending quota. Replying to the
 * email goes straight to the visitor.
 *
 *   GET  -> { enabled, siteKey }  whether messages are set up, and the
 *                                 public Turnstile site key for the form
 *   POST -> { ok: true }          sends the message
 *
 * Settings (Cloudflare dashboard -> Settings -> Variables and Secrets):
 *   CF_ACCOUNT_ID       - Cloudflare account ID (plain variable)
 *   NOVA_EMAIL_TOKEN    - API token with the "Email Sending: Edit" permission (secret)
 *   TURNSTILE_SITE_KEY  - Turnstile widget site key (plain variable, public)
 *   TURNSTILE_SECRET    - Turnstile widget secret key (secret)
 *
 * Spam protection: a Turnstile check on every message, a hidden honeypot
 * field, an origin allowlist, size limits, and a per-visitor limit.
 */
import { createRateLimiter, isAllowedOrigin, json, readJson } from '../../nova/http.js';

const TO = 'hrahi@iwu.edu';
const FROM = { address: 'nova@hiratrahi.com', name: 'Nova on hiratrahi.com' };

const MAX_BODY_BYTES = 40_000;
const MAX_NAME = 80;
const MAX_EMAIL = 254;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const MAX_TRANSCRIPT = 24;        // chat messages included at most
const MAX_TRANSCRIPT_ITEM = 4000;

// 5 messages per visitor per hour
const isRateLimited = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i;
// Control characters, including line breaks, which have no place in a name
const CONTROL_RE = /[\u0000-\u001f\u007f]/;

const SEND_FAILED =
  "Your message couldn't be sent right now. Please email Hirat at hrahi@iwu.edu instead.";

const isConfigured = (env) =>
  Boolean(env.CF_ACCOUNT_ID && env.NOVA_EMAIL_TOKEN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET);

export function onRequestGet({ env }) {
  return isConfigured(env)
    ? json(200, { enabled: true, siteKey: env.TURNSTILE_SITE_KEY })
    : json(200, { enabled: false });
}

// Checks the form fields. Returns { message } or { error }.
function cleanMessage(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const page = typeof body?.page === 'string' ? body.page.slice(0, 200) : '';

  if (!name || name.length > MAX_NAME || CONTROL_RE.test(name)) {
    return { error: 'Please enter your name.' };
  }
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }
  if (message.length < MIN_MESSAGE) return { error: 'Please write a little more in your message.' };
  if (message.length > MAX_MESSAGE) return { error: 'Your message is too long.' };

  let transcript = [];
  if (body.transcript !== undefined) {
    if (!Array.isArray(body.transcript) || body.transcript.length > MAX_TRANSCRIPT) {
      return { error: 'Invalid request.' };
    }
    for (const m of body.transcript) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
        return { error: 'Invalid request.' };
      }
      const content = m.content.trim().slice(0, MAX_TRANSCRIPT_ITEM);
      if (content) transcript.push({ role: m.role, content });
    }
  }

  return { message: { name, email, message, page, transcript } };
}

async function passesTurnstile(token, request, secret) {
  if (typeof token !== 'string' || !token || token.length > 2048) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: request.headers.get('CF-Connecting-IP') || undefined,
      }),
    });
    const result = await res.json();
    if (!result.success) console.warn(`nova-message: turnstile failed: ${(result['error-codes'] || []).join(',')}`);
    return result.success === true;
  } catch (err) {
    console.error(`nova-message: turnstile check errored: ${err?.message}`);
    return false;
  }
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function composeEmail({ name, email, message, page, transcript }) {
  const lines = [
    'New message from the Nova chat on hiratrahi.com',
    '',
    `From: ${name} <${email}>`,
    page ? `Page: ${page}` : null,
    '',
    'Message:',
    message,
  ].filter((l) => l !== null);

  if (transcript.length) {
    lines.push('', '---', 'Their chat with Nova:', '');
    for (const m of transcript) lines.push(`${m.role === 'user' ? 'Visitor' : 'Nova'}: ${m.content}`, '');
  }
  lines.push('', `Reply to this email to answer ${name} directly.`);

  const text = lines.join('\n');
  const html =
    '<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap">' +
    escapeHtml(text) +
    '</div>';

  return {
    to: TO,
    from: FROM,
    reply_to: { address: email, name },
    subject: `Nova: message from ${name}`,
    text,
    html,
  };
}

export async function onRequestPost({ request, env }) {
  if (!isAllowedOrigin(request)) return json(403, { error: 'Forbidden' });
  if (!isConfigured(env)) {
    return json(503, { error: "Messages aren't set up yet. Please email hrahi@iwu.edu." });
  }
  const { body, error } = await readJson(request, MAX_BODY_BYTES);
  if (error) return error;

  // Bots fill in the hidden "website" field; act as if it worked and drop it
  if (body?.website) return json(200, { ok: true });

  const { message, error: invalid } = cleanMessage(body);
  if (invalid) return json(400, { error: invalid });

  // Counted only for well-formed messages, so typos don't use up a visitor's limit
  if (isRateLimited(request)) {
    return json(429, { error: 'Too many messages. Please try again later or email hrahi@iwu.edu.' });
  }

  if (!(await passesTurnstile(body.turnstileToken, request, env.TURNSTILE_SECRET))) {
    return json(400, { error: "We couldn't verify you're human. Please try again." });
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.NOVA_EMAIL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composeEmail(message)),
      },
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.success) {
      const codes = (result.errors || []).map((e) => `${e.code} ${e.message}`).join('; ');
      console.error(`nova-message: send failed (${res.status}): ${codes.slice(0, 300)}`);
      return json(502, { error: SEND_FAILED });
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error(`nova-message: send errored: ${err?.message?.slice(0, 200)}`);
    return json(502, { error: SEND_FAILED });
  }
}
