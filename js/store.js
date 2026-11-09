/* store.js — État global et persistance localStorage (préfixé nexus_) */

const PREFIX = 'nexus_';

export const DEFAULT_APPS = [
  { name: 'Wikipedia', desc: { fr: 'Encyclopédie libre', en: 'Free encyclopedia' }, url: 'https://www.wikipedia.org', initial: 'W', category: { fr: 'Recherche', en: 'Search' } },
  { name: 'DuckDuckGo', desc: { fr: 'Moteur de recherche privé', en: 'Private search engine' }, url: 'https://duckduckgo.com', initial: 'D', category: { fr: 'Recherche', en: 'Search' } },
  { name: 'GitHub', desc: { fr: 'Code et projets', en: 'Code & projects' }, url: 'https://github.com', initial: 'G', category: { fr: 'Développement', en: 'Dev' } },
  { name: 'OpenStreetMap', desc: { fr: 'Cartographie libre', en: 'Free world map' }, url: 'https://www.openstreetmap.org', initial: 'O', category: { fr: 'Outils', en: 'Tools' } },
  { name: 'Qwant', desc: { fr: 'Recherche européenne', en: 'European search' }, url: 'https://www.qwant.com', initial: 'Q', category: { fr: 'Recherche', en: 'Search' } },
  { name: 'Moodle', desc: { fr: 'Plateforme pédagogique', en: 'Learning platform' }, url: 'https://moodle.org', initial: 'M', category: { fr: 'Éducation', en: 'Education' } },
  { name: 'Khan Academy', desc: { fr: 'Cours gratuits', en: 'Free courses' }, url: 'https://fr.khanacademy.org', initial: 'K', category: { fr: 'Éducation', en: 'Education' } },
  { name: 'Wikipedia FR', desc: { fr: 'Encyclopédie en français', en: 'French encyclopedia' }, url: 'https://fr.wikipedia.org', initial: 'W', category: { fr: 'Éducation', en: 'Education' } },
];

export const ENGINES = {
  duckduckgo: { label: 'DuckDuckGo', url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  qwant: { label: 'Qwant', url: (q) => `https://www.qwant.com/?q=${encodeURIComponent(q)}` },
  google: { label: 'Google', url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  bing: { label: 'Bing', url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  ecosia: { label: 'Ecosia', url: (q) => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}` },
  startpage: { label: 'Startpage', url: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}` },
};

export const DEFAULT_SHORTCUTS = [
  { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Reddit', url: 'https://www.reddit.com' },
];

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }
}

function write(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* quota */ }
}

export const state = {
  settings: Object.assign(
    { lang: 'auto', theme: 'dark', engine: 'duckduckgo', proxy: '' },
    read('settings', {})
  ),
  favorites: read('favorites', []),
  history: read('history', []),
  shortcuts: read('shortcuts', DEFAULT_SHORTCUTS),
};

export function saveSettings() { write('settings', state.settings); }
export function saveFavorites() { write('favorites', state.favorites); }
export function saveHistory() { write('history', state.history); }
export function saveShortcuts() { write('shortcuts', state.shortcuts); }

export function exportData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: state.settings,
    favorites: state.favorites,
    history: state.history,
    shortcuts: state.shortcuts,
  };
}

export function importData(json) {
  if (!json || typeof json !== 'object' || !('favorites' in json)) throw new Error('invalid backup');
  if (json.settings) { state.settings = Object.assign(state.settings, json.settings); saveSettings(); }
  if (Array.isArray(json.favorites)) { state.favorites = json.favorites; saveFavorites(); }
  if (Array.isArray(json.history)) { state.history = json.history; saveHistory(); }
  if (Array.isArray(json.shortcuts)) { state.shortcuts = json.shortcuts; saveShortcuts(); }
}

export function clearAllData() {
  for (const k of ['settings', 'favorites', 'history', 'shortcuts']) {
    try { localStorage.removeItem(PREFIX + k); } catch { /* noop */ }
  }
  state.settings = { lang: 'auto', theme: 'dark', engine: 'duckduckgo', proxy: '' };
  state.favorites = [];
  state.history = [];
  state.shortcuts = DEFAULT_SHORTCUTS;
}
