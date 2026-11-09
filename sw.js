/* sw.js — Service worker NEXUS v1.0
   Stratégie : pré-cache de l'app shell, réseau d'abord pour les navigations
   avec repli sur le cache, cache-first pour les ressources statiques. */

const CACHE = 'nexus-v1-0-0';
const PRECACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/main.js',
  './js/i18n.js',
  './js/store.js',
  './js/utils.js',
  './js/tabs.js',
  './js/ui.js',
  './js/games.js',
  './js/settings.js',
  './manifest.webmanifest',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Requêtes cross-origin (iframes, favicons) : jamais mises en cache par ce SW.
  if (url.origin !== location.origin) return;

  // Navigations : réseau d'abord, repli index.html (mode hors ligne)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || Response.error()))
    );
    return;
  }

  // Ressources statiques : réseau d'abord (mises à jour automatiques),
  // repli sur le cache (mode hors ligne), puis mise en cache de la réponse.
  e.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then((cached) => cached || Response.error()))
  );
});
