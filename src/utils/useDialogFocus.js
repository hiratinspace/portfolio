import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Accessible modal behaviour for a dialog element: moves focus into it on
// open, keeps Tab / Shift+Tab inside it, closes on Escape, and returns focus
// to whatever opened it when it closes. Returns a ref for the dialog panel.
const useDialogFocus = (onClose) => {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector(FOCUSABLE);
    (first || panel)?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, []);

  return panelRef;
};

export default useDialogFocus;
