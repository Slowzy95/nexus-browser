/* utils.js — Helpers génériques */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESCAPES = {
  [String.fromCharCode(38)]: '&' + 'amp;',
  [String.fromCharCode(60)]: '&' + 'lt;',
  [String.fromCharCode(62)]: '&' + 'gt;',
  [String.fromCharCode(34)]: '&' + 'quot;',
  [String.fromCharCode(39)]: '&' + '#39;',
};

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ESCAPES[c]);
}

/** Favicon public (DuckDuckGo) pour un domaine. */
export function faviconFor(url) {
  try { return `https://icons.duckduckgo.com/ip3/${new URL(url).hostname}.ico`; }
  catch { return ''; }
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

export function titleFromUrl(url) {
  return hostOf(url);
}

/** Normalise la saisie : URL directe ou recherche via le moteur configuré. */
export function normalizeInput(raw, engine) {
  const q = String(raw || '').trim();
  if (!q) return '';
  if (/^https?:\/\//i.test(q)) return q;
  if (/^[\w-]+(\.[\w-]+)*\.[a-z]{2,}([/:?#].*)?$/i.test(q)) return 'https://' + q;
  return engine(q);
}

export function debounce(fn, ms = 150) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

export function timeAgo(ts, lang = 'fr') {
  const s = Math.floor((Date.now() - ts) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  if (s < 60) return rtf.format(-s, 'second');
  if (s < 3600) return rtf.format(-Math.floor(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.floor(s / 3600), 'hour');
  return rtf.format(-Math.floor(s / 86400), 'day');
}
