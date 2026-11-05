import React, { useEffect, useId, useRef } from 'react';

// Nova's mascot: a little red ghost. Purely decorative (aria-hidden); animations
// live in index.css under .nova-bot and stop under prefers-reduced-motion.
//
// <NovaBot mode="idle" />  holds the edge it sits on, floats, and waves now and then
//   mode="excited"          happy face (hovering the card)
//   mode="think"            tilts its head and looks up while Nova is answering
//   mode="happy"            happy face (an answer just finished)
// The float never changes between modes, so switching never makes it jump.
// Its eyes follow the visitor's cursor.
//
// <NovaAvatar /> is just the ghost's face, for small avatar spots.

// Shared gradients and glow, with ids unique to each instance
const Defs = ({ id }) => (
  <defs>
    <radialGradient id={`${id}-sheet`} cx="0.38" cy="0.3" r="0.85">
      <stop offset="0" stopColor="#fca5a5" />
      <stop offset="0.45" stopColor="#ef4444" />
      <stop offset="1" stopColor="#991b1b" />
    </radialGradient>
    {/* hides whatever is below the edge, so the sheet always looks tucked in */}
    <clipPath id={`${id}-above-edge`}>
      <rect x="-20" y="-20" width="120" height="80.5" />
    </clipPath>
    <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#ef4444" floodOpacity="0.55" />
    </filter>
  </defs>
);

// Head and body, floating around a point on the edge (40, 60)
const Ghost = ({ id }) => (
  <g className="ng-body">
    <g className="ng-tilt">
      {/* sheet, with a little curl on top */}
      <path
        d="M20 70 V31 C20 16 29 7.5 40 7.5 C51 7.5 60 16 60 31 V70 Z"
        fill={`url(#${id}-sheet)`}
        filter={`url(#${id}-glow)`}
      />
      <path d="M39 8 C38 4.5 41 2.5 43.5 4" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />

      {/* cheeks */}
      <ellipse cx="27" cy="38.2" rx="3.4" ry="2" fill="#fecaca" opacity="0.45" />
      <ellipse cx="53" cy="38.2" rx="3.4" ry="2" fill="#fecaca" opacity="0.45" />

      {/* eyes: round with a shine, or happy arcs */}
      <g className="ng-eyes">
        <g className="ng-eyes-open">
          <g className="ng-eye">
            <ellipse cx="33" cy="29.5" rx="3.3" ry="4.3" fill="#1c0606" />
            <circle cx="34.2" cy="27.8" r="1.2" fill="#ffffff" />
          </g>
          <g className="ng-eye">
            <ellipse cx="47" cy="29.5" rx="3.3" ry="4.3" fill="#1c0606" />
            <circle cx="48.2" cy="27.8" r="1.2" fill="#ffffff" />
          </g>
        </g>
        <g className="ng-eyes-happy" fill="none" stroke="#1c0606" strokeWidth="2" strokeLinecap="round">
          <path d="M29.8 31 Q33 26.4 36.2 31" />
          <path d="M43.8 31 Q47 26.4 50.2 31" />
        </g>
      </g>

      {/* round glasses: tinted lenses with a glint, a bridge, and arms to the sides */}
      <g className="ng-glasses">
        <circle cx="33" cy="29.5" r="5.8" fill="#ffffff" fillOpacity="0.14" stroke="#1c0606" strokeWidth="1.5" />
        <circle cx="47" cy="29.5" r="5.8" fill="#ffffff" fillOpacity="0.14" stroke="#1c0606" strokeWidth="1.5" />
        <path d="M38.8 29 Q40 27.6 41.2 29" fill="none" stroke="#1c0606" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M27.2 28.6 L20.6 27.4 M52.8 28.6 L59.4 27.4" stroke="#1c0606" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M29.6 26.4 Q31 25 32.8 24.8 M43.6 26.4 Q45 25 46.8 24.8" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="0.9" strokeLinecap="round" />
      </g>

      {/* mouth: a small "boo", or a smile */}
      <ellipse className="ng-mouth-o" cx="40" cy="38.5" rx="1.9" ry="2.4" fill="#1c0606" />
      <path className="ng-mouth-smile" d="M36.8 37.2 Q40 41 43.2 37.2" fill="none" stroke="#1c0606" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </g>
);

// Moves the eyes toward the pointer (max ~1.6 units)
const useEyesFollowPointer = (ref) => {
  useEffect(() => {
    let frame = null;
    let point = null;
    const update = () => {
      frame = null;
      const el = ref.current;
      if (!el || !point) return;
      const r = el.getBoundingClientRect();
      const dx = point.x - (r.left + r.width / 2);
      const dy = point.y - (r.top + r.height * 0.45);
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / 160) * 1.6;
      el.style.setProperty('--ng-eye-x', `${((dx / dist) * reach).toFixed(2)}px`);
      el.style.setProperty('--ng-eye-y', `${((dy / dist) * reach * 0.7).toFixed(2)}px`);
    };
    const onMove = (e) => {
      point = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
};

// The full ghost, holding the top edge of whatever it's placed on. The edge
// sits at y = 60 of the 80 x 66 drawing; hands overlap it slightly.
export const NovaBot = ({ mode = 'idle', className = '', style }) => {
  const id = useId().replace(/:/g, '');
  const ref = useRef(null);
  useEyesFollowPointer(ref);
  return (
    <svg
      ref={ref}
      viewBox="0 0 80 66"
      width="80"
      height="66"
      aria-hidden="true"
      focusable="false"
      data-mode={mode}
      className={`nova-bot pointer-events-none overflow-visible ${className}`}
      style={style}
    >
      <Defs id={id} />

      {/* left arm (on screen right) reaching out to the edge, behind the sheet */}
      <path d="M57 45 Q65 48 64.5 57" fill="none" stroke="#b91c1c" strokeWidth="5.5" strokeLinecap="round" />

      {/* right arm (on screen left): rests on the edge, and now and then
          lifts from the shoulder (23, 45) to wave. Drawn behind the sheet. */}
      <g className="ng-wave-arm">
        <path d="M23 45 Q15 48 15.5 57" fill="none" stroke="#b91c1c" strokeWidth="5.5" strokeLinecap="round" />
        <ellipse cx="15.5" cy="60" rx="4.6" ry="3.6" fill={`url(#${id}-sheet)`} />
      </g>

      <g clipPath={`url(#${id}-above-edge)`}>
        <Ghost id={id} />
      </g>

      {/* left hand draped over the edge */}
      <ellipse cx="64.5" cy="60" rx="4.6" ry="3.6" fill={`url(#${id}-sheet)`} />
    </svg>
  );
};

// Face only, for avatars
export const NovaAvatar = ({ className = '' }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="16 2 48 46" aria-hidden="true" focusable="false" className={`nova-bot nova-avatar ${className}`}>
      <Defs id={id} />
      <Ghost id={id} />
    </svg>
  );
};

export default NovaBot;
