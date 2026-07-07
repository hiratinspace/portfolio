/**
 * Email obfuscation — decoded at runtime so the address never
 * appears as a literal string in the HTML source or JS bundle.
 * Defeats static scrapers and harvesting bots.
 *
 * To re-encode a new address, run in DevTools console:
 *   "you@email.com".split('').map(c => c.charCodeAt(0))
 */
export const getEmail = () => String.fromCharCode(
  104, 114, 97, 104, 105, 64, 105, 119, 117, 46, 101, 100, 117
);
