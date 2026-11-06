import React, { useEffect, useRef } from 'react';

// Decorative matrix rain, drawn on a single <canvas>. Replaces the earlier
// version that re-rendered ~1,000 React nodes 20 times a second. It pauses
// when the tab is hidden and shows a still frame when the visitor has
// "reduce motion" turned on.
const FONT = "'JetBrains Mono Variable', 'Monaco', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace";
const HEX = '0123456789ABCDEF'.split('');
const TERMS = ['0x', 'PWN', 'ROP', 'NOP', 'JMP', 'XOR', 'DEP', 'PIE', 'root@', 'sudo', 'nc', 'sh', 'bin'];

const randomTrail = (min, spread) =>
  Array.from({ length: min + Math.floor(Math.random() * spread) }, () =>
    Math.random() > 0.7 ? TERMS[Math.floor(Math.random() * TERMS.length)] : HEX[Math.floor(Math.random() * HEX.length)]
  );

const VARIANTS = {
  // Home page: denser, larger, white glowing heads
  home: { spacing: 25, fontSize: 14, lineHeight: 1.25, speedMin: 1, speedRange: 3, trailMin: 15, trailSpread: 15, head: '#ffffff', headGlow: 'rgba(220,38,38,0.8)', tail: '#450a0a', minAlpha: 0.1 },
  // Products / Intel pages: lighter, smaller, red heads
  page: { spacing: 28, fontSize: 12, lineHeight: 1.4, speedMin: 0.8, speedRange: 2.5, trailMin: 14, trailSpread: 12, head: '#ff6666', headGlow: 'rgba(255,68,68,0.9)', tail: null, minAlpha: 0.15 },
};

const MatrixRain = ({ variant = 'home', style }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const v = VARIANTS[variant] || VARIANTS.home;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rowHeight = v.fontSize * v.lineHeight;
    let columns = [];
    let width = 0;
    let height = 0;
    let frame = null;
    let last = 0;

    const newColumn = (x, initial) => ({
      x,
      // Reduced motion gets a frozen frame, so spread trails across the screen
      y: initial
        ? (motionQuery.matches ? Math.random() * height : Math.random() * -2000)
        : -200 - Math.random() * 500,
      speed: v.speedMin + Math.random() * v.speedRange, // px per 50ms, as before
      chars: randomTrail(v.trailMin, v.trailSpread),
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.floor(width / v.spacing);
      columns = Array.from({ length: count }, (_, i) => columns[i] || newColumn(i * v.spacing, true));
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.textBaseline = 'top';
      for (const col of columns) {
        const n = col.chars.length;
        for (let i = 0; i < n; i++) {
          const y = col.y + i * rowHeight;
          if (y < -rowHeight || y > height) continue;
          const alpha = Math.max(v.minAlpha, 1 - i / n);
          if (i === 0) {
            ctx.font = `700 ${v.fontSize}px ${FONT}`;
            ctx.fillStyle = v.head;
            ctx.shadowColor = v.headGlow;
            ctx.shadowBlur = 8;
          } else {
            ctx.font = `400 ${v.fontSize}px ${FONT}`;
            ctx.shadowBlur = 0;
            // Text colour alpha times element opacity, matching the old DOM look
            ctx.fillStyle = (v.tail && i === n - 1) ? v.tail : `rgba(220,38,38,${alpha * alpha})`;
          }
          ctx.fillText(col.chars[i], col.x, y);
        }
      }
      ctx.shadowBlur = 0;
    };

    const tick = (now) => {
      const dt = last ? Math.min(now - last, 100) : 16;
      last = now;
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed * (dt / 50);
        if (col.y > height + 200) columns[i] = newColumn(col.x, false);
      }
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || motionQuery.matches || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionChange = () => { stop(); resize(); start(); };

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    resize();
    start();
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener?.('change', onMotionChange);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener?.('change', onMotionChange);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', ...style }}
    />
  );
};

export default MatrixRain;
