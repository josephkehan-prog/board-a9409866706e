// Minimal service worker: cache the app shell for offline launch.
// Same-origin only — Supabase API calls (different origin) pass straight through.
const CACHE = 'jhan-dash-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;            // never touch Supabase / cross-origin
  if (e.request.mode === 'navigate') {                   // network-first for the page (stay fresh online)
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
  } else {                                               // cache-first for static assets
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
