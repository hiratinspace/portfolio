import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Terminal, AlertTriangle, ChevronRight } from 'lucide-react';

const TERMINAL_LINES = [
  { text: '> Initializing scan...', delay: 0 },
  { text: '> Reading QR payload...', delay: 600 },
  { text: '> Resolving target host:........', delay: 1000 },
  { text: '> Probing open ports...', delay: 1900 },
  { text: '> CVE-2025-????  [CRITICAL]  exploiting...', delay: 1700 },
  { text: '> Privilege escalation: ████████ 100%', delay: 2500 },
  { text: '> ROOT ACCESS GRANTED', delay: 3400, red: true },
  { text: '> Exfiltrating data...', delay: 4000 },
  { text: '> lol jk.', delay: 5500, reveal: true },
];

const MatrixRain = () => {
  const [cols, setCols] = useState([]);

  useEffect(() => {
    const chars = '01ABCDEF0x'.split('');
    const terms = ['PWN', 'ROP', 'NOP', 'XOR', 'root@', 'sh'];
    const build = (w) =>
      Array.from({ length: Math.floor(w / 28) }, (_, i) => ({
        id: i, x: i * 28, y: Math.random() * -1500, speed: 1 + Math.random() * 2.5,
        chars: Array.from({ length: 18 }, () =>
          Math.random() > 0.75
            ? terms[Math.floor(Math.random() * terms.length)]
            : chars[Math.floor(Math.random() * chars.length)]
        ),
      }));

    setCols(build(window.innerWidth));
    const interval = setInterval(() => {
      setCols(prev => prev.map(col => {
        const newY = col.y + col.speed;
        if (newY > window.innerHeight + 200)
          return { ...col, y: -300 - Math.random() * 400, speed: 1 + Math.random() * 2.5 };
        return { ...col, y: newY };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {cols.map(col => (
        <div key={col.id} className="absolute font-mono text-xs"
          style={{ left: col.x, top: col.y, color: '#ef4444', opacity: 0.45 }}>
          {col.chars.map((c, i) => <div key={i}>{c}</div>)}
        </div>
      ))}
    </div>
  );
};

const QRLandingPage = () => {
  const navigate = useNavigate();
  const [visibleLines, setVisibleLines] = useState([]);
  const [phase, setPhase] = useState('typing');
  const [blink, setBlink] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
  const timers = [];
  TERMINAL_LINES.forEach(({ text, delay, red, reveal }) => {
    const t = setTimeout(() => {
      setVisibleLines(prev => [...prev, { text, red, reveal }]);
      if (reveal) {
        const t1 = setTimeout(() => setPhase('revealed'), 600);
        const t2 = setTimeout(() => setPhase('cta'), 1400);
        timers.push(t1, t2);
      }
    }, delay);
    timers.push(t);
  });

  return () => timers.forEach(clearTimeout);
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleLines, phase]);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 py-12"
      style={{ fontFamily: "'Courier New', Courier, monospace", backgroundColor: '#000000' }}
    >
      <MatrixRain />

      {/* Scanline overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 1,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)'
      }} />

      <div className="relative w-full max-w-2xl" style={{ zIndex: 2 }}>

        {/* Terminal window */}
        <div
          className="border border-red-800"
          style={{
            backgroundColor: '#0a0a0a',
            boxShadow: '0 0 60px rgba(127,29,29,0.4), inset 0 0 60px rgba(0,0,0,0.8)'
          }}
        >
          {/* Title bar */}
          <div className="flex items-center px-4 py-2 border-b border-red-900/50"
            style={{ backgroundColor: '#110808' }}>
            <div className="flex space-x-2 mr-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#7f1d1d' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#78350f' }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#14532d' }} />
            </div>
            <Terminal className="w-3 h-3 mr-2" style={{ color: '#dc2626' }} />
            <span className="text-s tracking-widest" style={{ color: '#dc2626' }}>
              redhexx@kali — bash — 80×24
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-6 min-h-64" style={{ backgroundColor: '#050505' }}>

            {visibleLines.map((line, i) => (
              <div key={i} className="mb-1 leading-relaxed" style={{
                fontSize: '0.95rem',
                color: line.reveal ? '#f87171' : line.red ? '#ef4444' : '#f3f4f6'
              }}>
                {line.text}
              </div>
            ))}

            {/* Blinking cursor */}
            {phase !== 'cta' && (
              <span
                className="inline-block w-2 h-5 align-middle"
                style={{ backgroundColor: '#ef4444', opacity: blink ? 1 : 0 }}
              />
            )}

            {/* Security awareness reveal */}
            {phase !== 'typing' && (
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(153,27,27,0.5)' }}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: '#ef4444' }} />
                  <div>
                    <p className="font-bold tracking-wider mb-3" style={{ fontSize: '1.5rem', color: '#f87171' }}>
                      Congrats!!
                    </p>
                    <p className="leading-relaxed" style={{ fontSize: '0.95rem', color: 'rgb(255, 255, 255)' }}>
                      You scanned a random QR code you found somewhere — and got teleported to a stranger's website.
                      That's giving very{' '}
                      <span style={{ color: '#f87171' }}>main character in a cybercrime documentary</span> energy.
                    </p>
                    <p className="leading-relaxed mt-3" style={{ fontSize: '0.95rem', color: 'rgb(255, 255, 255)' }}>
                      <span style={{ color: '#f87171' }}>Good news:</span> you're not hacked.<br />
                      <span style={{ color: '#f87171' }}>Bad News:</span> you absolutely could've been!<br />
                      <span style={{ color: '#f87171' }}></span> I just wanted to see who was curious enough to scan. Apparently, it's you.
                      Next time though? Maybe don't.
                    </p>
                    
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            {phase === 'cta' && (
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(153,27,27,0.3)' }}>
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5" style={{ color: '#dc2626' }} />
                  <span className="text-lg tracking-wider" style={{ color: '#991b1b' }}>— redhexx</span>
                </div>
                <p className="mb-5" style={{ fontSize: '0.95rem', color: 'rgb(255, 255, 255)' }}>
                  Since you're already here and clearly curious — the person behind this QR code builds
                  security tools and breaks things for fun 'ethically'. Might as well make the click worth it.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="group flex items-center space-x-3 px-6 py-3 transition-all"
                  style={{
                    fontSize: '0.9rem',
                    border: '1px solid #991b1b',
                    backgroundColor: 'rgba(127,29,29,0.3)',
                    color: '#fca5a5'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(127,29,29,0.6)';
                    e.currentTarget.style.borderColor = '#dc2626';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(127,29,29,0.3)';
                    e.currentTarget.style.borderColor = '#991b1b';
                  }}
                >
                  <span className="tracking-wider">VIEW HIS PORTFOLIO</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Footer sign */}
        <p className="text-center text-xs mt-4 tracking-widest" style={{ color: '#6b0909' }}>
          [ built by redhexx ]
        </p>
      </div>
    </div>
  );
};

export default QRLandingPage;