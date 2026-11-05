import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, Check, Copy, ExternalLink, Mail, RotateCcw, Square, X } from 'lucide-react';
import { NovaAvatar, NovaBot } from './NovaBot';

// Nova: Hirat's AI assistant. Answers from his public profile via /api/nova
// (functions/api/nova.js), streaming replies as server-sent events.
//   - A little ghost holds the launcher card and floats; its eyes follow the cursor
//   - The launcher types out example questions
//   - Suggested questions match the page you're on
//   - Typing dots, a stop button, real bullet lists, link chips,
//     copy-an-answer, and "email this chat to Hirat"
// The conversation is kept for the browser tab session.
const FONT = "'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace";
const STORAGE_KEY = 'nova-chat';
const TEASER_KEY = 'nova-teased';
const MAX_CHARS = 1000;
const HISTORY_SENT = 12;
const CONTACT_EMAIL = 'hrahi@iwu.edu';

const GREETING =
  "Hi, I'm Nova, Hirat's Virtual Assistant. I answer from his public profile: experience, security work, and the products he's shipped. What would you like to know?";

// Typed out on the launcher, one after another
const HINTS = [
  "what's he building right now?",
  'tell me about SpecterAI',
  'what roles is he looking for?',
  'how does PassMyResume work?',
  'what did he do at Driving Forward?',
];

const SUGGESTIONS = {
  '/': [
    { tag: 'Overview', q: 'Give me the 30-second summary of Hirat' },
    { tag: 'Security', q: 'What has he built in security?' },
    { tag: 'Hiring', q: 'What kind of roles is he looking for?' },
  ],
  '/products': [
    { tag: 'Depth', q: 'Which product is the most technically complex?' },
    { tag: 'PassMyResume', q: 'How does PassMyResume score a resume?' },
    { tag: 'REDHEXX', q: 'What is REDHEXX building?' },
  ],
  '/intel': [
    { tag: 'This page', q: 'What is this Intel page and how is it built?' },
    { tag: 'SecOps', q: "What's his hands-on security operations experience?" },
    { tag: 'Tools', q: 'Which security tools has he built himself?' },
  ],
};

// Friendly names for links Nova is likely to mention
const LINK_LABELS = [
  [/hiratrahi\.com\/resume\.pdf/i, () => 'Resume (PDF)'],
  [/passmyresume\.com/i, () => 'PassMyResume'],
  [/redhexx\.com/i, () => 'REDHEXX'],
  [/tuitioncreep\.org/i, () => 'TuitionCreep'],
  [/hiratinspace\.github\.io\/specter-ai/i, () => 'SpecterAI demo'],
  [/pypi\.org\/project\/([\w.-]+)/i, (m) => `${m[1]} on PyPI`],
  [/github\.com\/hiratinspace\/([\w.-]+)/i, (m) => `${m[1]} on GitHub`],
  [/github\.com\/hiratinspace/i, () => 'GitHub profile'],
  [/linkedin\.com/i, () => 'LinkedIn'],
];
const labelFor = (url) => {
  for (const [re, make] of LINK_LABELS) {
    const m = url.match(re);
    if (m) return make(m);
  }
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

const URL_RE = /https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"*]/g;
const EMAIL_ONLY_RE = /^[\w.+-]+@[\w-]+\.[\w.-]*\w$/;
const TOKEN_RE = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"*]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;
// "(https://...)" after a name is shown as a link chip instead, not repeated inline
const BARE_LINK_RE = /\s*\(https?:\/\/[^\s()]+\)/g;
const BULLET_RE = /^\s*(?:[-*•]|\d+[.)])\s+/;

const linksIn = (text) => [...new Set(text.match(URL_RE) || [])].slice(0, 4);

// Inline formatting: **bold**, links and emails become safe React elements;
// everything else stays text (no HTML injection).
const renderInline = (text, keyBase) =>
  text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={`${keyBase}b${i}`} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part.split(TOKEN_RE).map((piece, j) => {
      const key = `${keyBase}-${i}-${j}`;
      if (/^https?:\/\//.test(piece)) {
        return (
          <a key={key} href={piece} target="_blank" rel="noopener noreferrer"
             className="text-red-400 underline underline-offset-2 [overflow-wrap:anywhere] hover:text-red-300">
            {labelFor(piece)}
          </a>
        );
      }
      if (EMAIL_ONLY_RE.test(piece)) {
        return (
          <a key={key} href={`mailto:${piece}`} className="text-red-400 underline underline-offset-2 hover:text-red-300">
            {piece}
          </a>
        );
      }
      return piece;
    });
  });

// Block formatting: paragraphs plus "-", "•" or "1." lines as real lists
const renderRich = (text) => {
  const blocks = [];
  let list = null;
  text.split('\n').forEach((line, i) => {
    if (BULLET_RE.test(line)) {
      if (!list) { list = []; blocks.push({ type: 'list', items: list, key: i }); }
      list.push(line.replace(BULLET_RE, ''));
    } else {
      list = null;
      if (line.trim()) blocks.push({ type: 'p', text: line, key: i });
    }
  });
  return blocks.map((b) =>
    b.type === 'list' ? (
      <ul key={b.key} className="space-y-1 my-1.5">
        {b.items.map((item, j) => (
          <li key={j} className="flex gap-2">
            <span aria-hidden="true" className="text-red-500 shrink-0">▸</span>
            <span>{renderInline(item, `${b.key}-${j}`)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p key={b.key} className="[&:not(:first-child)]:mt-2">{renderInline(b.text, b.key)}</p>
    )
  );
};

const loadJSON = (key, fallback) => {
  try {
    const v = JSON.parse(sessionStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

const transcriptMailto = (messages) => {
  const lines = messages
    .filter((m) => m.content)
    .map((m) => `${m.role === 'user' ? 'Me' : 'Nova'}: ${m.content}`);
  let body = `Hi Hirat,\n\nI was chatting with Nova on hiratrahi.com and wanted to follow up.\n\n${lines.join('\n\n')}`;
  if (body.length > 1800) body = `${body.slice(0, 1800)}\n\n[conversation shortened]`;
  body += '\n\n(Add your note and contact details here.)';
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Following up from Nova on hiratrahi.com')}&body=${encodeURIComponent(body)}`;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Types each hint out, holds it, erases it, then moves to the next
const useTypewriter = (phrases, active) => {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active || prefersReducedMotion()) { setText(phrases[0]); return undefined; }
    let phrase = 0;
    let len = 0;
    let deleting = false;
    let timer;
    const step = () => {
      const full = phrases[phrase];
      if (!deleting) {
        len += 1;
        setText(full.slice(0, len));
        if (len === full.length) { deleting = true; timer = setTimeout(step, 2200); return; }
        timer = setTimeout(step, 55 + Math.random() * 45);
      } else {
        len -= 1;
        setText(full.slice(0, len));
        if (len === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; timer = setTimeout(step, 400); return; }
        timer = setTimeout(step, 22);
      }
    };
    timer = setTimeout(step, 900);
    return () => clearTimeout(timer);
  }, [phrases, active]);
  return text;
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked */ }
  };
  return (
    <button type="button" onClick={copy}
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white px-1.5 py-1 min-h-[28px]">
      {copied ? <Check className="w-3 h-3" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

const TypingDots = () => (
  <span className="nova-typing inline-flex items-center gap-1 h-5">
    <span className="sr-only">Nova is typing</span>
    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
  </span>
);

const Message = ({ role, content, streaming, done }) => {
  if (role === 'user') {
    return (
      <li className="flex justify-end">
        <span className="sr-only">You said:</span>
        <p className="max-w-[85%] bg-red-950/70 border border-red-900/70 px-3 py-2 text-[13px] leading-relaxed text-white whitespace-pre-wrap break-words">
          {content}
        </p>
      </li>
    );
  }
  const shown = content.replace(BARE_LINK_RE, '');
  const links = done ? linksIn(content) : [];
  return (
    <li className="flex gap-2.5">
      <span aria-hidden="true" className="shrink-0 w-7 h-7 mt-0.5 border border-red-900/70 bg-black flex items-center justify-center">
        <NovaAvatar className="w-6 h-6" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="sr-only">Nova said:</span>
        <div className="text-[13px] leading-relaxed text-gray-200 break-words">
          {content ? renderRich(shown) : streaming && <TypingDots />}
          {streaming && content && (
            <span aria-hidden="true" className="nova-cursor inline-block w-[0.5em] h-[1em] -mb-[0.15em] ml-0.5 bg-red-500" />
          )}
        </div>
        {links.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Links from this answer">
            {links.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 text-[11px] text-red-300 border border-red-900/70 px-2 py-1
                              hover:border-red-500 hover:text-white">
                  {labelFor(url)} <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
        {done && content && (
          <div className="mt-1 -ml-1.5">
            <CopyButton text={content} />
          </div>
        )}
      </div>
    </li>
  );
};

const NovaChat = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = loadJSON(STORAGE_KEY, []);
    return Array.isArray(saved) ? saved.filter((m) => m && typeof m.content === 'string' && m.content) : [];
  });
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [teaser, setTeaser] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const abortRef = useRef(null);
  const wasOpen = useRef(false);

  const suggestions = SUGGESTIONS[pathname] || SUGGESTIONS['/'];
  const hint = useTypewriter(HINTS, !open);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); } catch { /* storage blocked */ }
  }, [messages]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, open, error]);

  // Focus the input on open; hand focus back to the launcher on close
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Grow the input with its content, up to a few lines
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [input, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Once per session, the ghost says hello a few seconds after the page loads
  useEffect(() => {
    if (loadJSON(TEASER_KEY, false) || messages.length) return undefined;
    const show = setTimeout(() => {
      setTeaser(true);
      try { sessionStorage.setItem(TEASER_KEY, 'true'); } catch { /* storage blocked */ }
    }, 5000);
    const hide = setTimeout(() => setTeaser(false), 12000);
    return () => { clearTimeout(show); clearTimeout(hide); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (open) setTeaser(false); }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const send = async (text) => {
    const question = text.trim().slice(0, MAX_CHARS);
    if (!question || busy) return;

    const history = [...messages.filter((m) => m.content), { role: 'user', content: question }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setError('');
    setBusy(true);

    const updateReply = (update) =>
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: update(last.content) };
        return next;
      });
    const dropEmptyReply = () =>
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        return last?.role === 'assistant' && !last.content ? prev.slice(0, -1) : prev;
      });

    const controller = new AbortController();
    abortRef.current = controller;
    let finished = false;
    try {
      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-HISTORY_SENT) }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Nova is unavailable right now.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop();
        for (const evt of events) {
          if (!evt.startsWith('data: ')) continue;
          const data = JSON.parse(evt.slice(6));
          if (data.type === 'text') updateReply((c) => c + data.text);
          else if (data.type === 'replace') updateReply(() => data.text);
          else if (data.type === 'error') throw new Error(data.message);
          else if (data.type === 'done') finished = true;
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Something went wrong.');
      dropEmptyReply();
    } finally {
      setBusy(false);
      abortRef.current = null;
      if (finished) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1300);
      }
    }
  };

  const stop = () => abortRef.current?.abort();

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setMessages([]);
    setError('');
    setBusy(false);
    inputRef.current?.focus();
  };

  const hasChat = messages.some((m) => m.content);
  const lastIndex = messages.length - 1;
  const botMode = busy ? 'think' : celebrate ? 'happy' : 'idle';

  return (
    <div style={{ fontFamily: FONT, zIndex: 150 }} className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6">
      {open ? (
        <section
          id="nova-panel"
          role="dialog"
          aria-labelledby="nova-title"
          aria-describedby="nova-desc"
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className="nova-panel flex flex-col bg-black border-red-900/70 shadow-2xl shadow-red-950/60
                     fixed inset-0 sm:relative sm:inset-auto sm:border sm:w-[400px] sm:h-[min(620px,calc(100dvh-3rem))]"
        >
          {/* The ghost holds the top edge of the panel (desktop only) */}
          <NovaBot mode={botMode} className="hidden sm:block absolute bottom-full -mb-[6px] right-20" />

          {/* Header, support-chat style */}
          <header className="flex items-center justify-between gap-2 pl-4 pr-2 pb-3 border-b border-red-900/60 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex items-center gap-3 min-w-0">
              <span aria-hidden="true" className="shrink-0 w-10 h-10 border border-red-800 bg-red-950/40 flex items-center justify-center">
                <NovaAvatar className="w-8 h-8" />
              </span>
              <div className="min-w-0">
                <h2 id="nova-title" className="text-sm font-bold text-white tracking-[0.2em]">NOVA</h2>
                <p className="flex items-center gap-1.5 text-[11px] text-gray-400 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" aria-hidden="true" />
                  {busy ? 'typing…' : "Hirat's Virtual Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {hasChat && (
                <>
                  <a href={transcriptMailto(messages)} title="Email this chat to Hirat" aria-label="Email this chat to Hirat"
                     className="p-2 text-gray-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <button type="button" onClick={reset} title="Start a new chat" aria-label="Start a new chat"
                          className="p-2 text-gray-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              )}
              <button type="button" onClick={close} aria-label="Close Nova"
                      className="p-2 text-gray-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Conversation */}
          <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-4">
            <p id="nova-desc" className="sr-only">
              AI assistant that answers questions about Hirat Rahman Rahi from his public profile. It can make mistakes.
            </p>
            <ol role="log" aria-live="polite" aria-busy={busy} className="space-y-4">
              <Message role="assistant" content={GREETING} done={false} />
              {messages.map((m, i) => (
                <Message
                  key={i}
                  role={m.role}
                  content={m.content}
                  streaming={busy && i === lastIndex}
                  done={!(busy && i === lastIndex)}
                />
              ))}
            </ol>

            {!hasChat && (
              <ul className="mt-5 ml-[2.375rem] flex flex-col gap-2" aria-label="Suggested questions">
                {suggestions.map(({ tag, q }) => (
                  <li key={q}>
                    <button type="button" onClick={() => send(q)}
                            className="group w-full text-left border border-red-900/60 px-3 py-2.5 hover:border-red-500 hover:bg-red-950/40 transition-colors">
                      <span className="block text-[10px] uppercase tracking-wider text-red-400 mb-0.5">{tag}</span>
                      <span className="flex items-start justify-between gap-2 text-[13px] text-gray-200 group-hover:text-white">
                        {q}
                        <span aria-hidden="true" className="text-red-500 group-hover:translate-x-0.5 transition-transform">→</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <div role="alert" className="mt-4 text-xs text-red-200 border border-red-900/70 bg-red-950/40 px-3 py-2.5">
                {error}{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 text-red-300 hover:text-white">
                  Email Hirat instead
                </a>
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="border-t border-red-900/60 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2 border border-red-900/70 bg-black focus-within:border-red-500 pl-3 pr-1.5 py-1.5 transition-colors">
              <label htmlFor="nova-input" className="sr-only">Ask Nova a question</label>
              <textarea
                id="nova-input"
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={MAX_CHARS}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about Hirat's work"
                className="flex-1 resize-none bg-transparent py-1 text-base sm:text-[13px] leading-relaxed text-white
                           placeholder:text-gray-400 focus-visible:outline-none"
              />
              {busy ? (
                <button type="button" onClick={stop} aria-label="Stop answering" title="Stop"
                        className="shrink-0 w-9 h-9 flex items-center justify-center border border-red-700 text-red-300 hover:bg-red-950 hover:text-white">
                  <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} aria-label="Send"
                        className="shrink-0 w-9 h-9 flex items-center justify-center bg-red-700 text-white hover:bg-red-600
                                   disabled:bg-transparent disabled:text-gray-500 transition-colors">
                  <ArrowUp className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-gray-400">
              AI answers from Hirat's public profile and can be wrong. Anything important:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-red-400 underline underline-offset-2 hover:text-red-300">{CONTACT_EMAIL}</a>
            </p>
          </form>
        </section>
      ) : (
        <div className="relative m-4 sm:m-0">
          <button
            ref={launcherRef}
            type="button"
            onClick={() => setOpen(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setHovered(true)}
            onBlur={() => setHovered(false)}
            aria-expanded={false}
            aria-controls="nova-panel"
            aria-label="Ask NOVA, Hirat's Virtual Assistant"
            className="nova-launcher group relative flex flex-col items-start justify-center w-[218px] h-[60px] pl-4 pr-3
                       bg-black border border-red-700 text-left shadow-lg shadow-red-950/60
                       hover:border-red-500 hover:bg-red-950/60 transition-colors"
          >
            {/* The ghost holds the card from behind and floats */}
            <div className="absolute bottom-full left-2 -mb-[6px] pointer-events-none">
              {teaser && (
                <p aria-hidden="true"
                   className="nova-bubble absolute bottom-full left-0 sm:bottom-[30px] sm:left-auto sm:right-full sm:mr-1
                              whitespace-nowrap text-xs text-white bg-black border border-red-700 px-3 py-2">
                  psst, ask me about Hirat
                  {/* tail: points down at the head on phones, right at it on desktop */}
                  <span className="sm:hidden absolute -bottom-[5px] left-8 w-2.5 h-2.5 rotate-45 bg-black border-r border-b border-red-700" />
                  <span className="hidden sm:block absolute top-1/2 -mt-[5px] -right-[5px] w-2.5 h-2.5 rotate-45 bg-black border-t border-r border-red-700" />
                </p>
              )}
              <NovaBot mode={hovered || teaser ? 'excited' : 'idle'} />
            </div>
            <span className="flex items-center gap-2 text-sm">
              <span className="nova-dot w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
              <span className="text-gray-300 group-hover:text-white">ask</span>
              <span className="font-bold tracking-[0.2em] text-white">NOVA</span>
            </span>
            <span aria-hidden="true" className="mt-1 text-[11px] text-gray-400 truncate max-w-full">
              <span className="text-red-500">› </span>{hint}<span className="nova-caret text-red-400">▌</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NovaChat;
