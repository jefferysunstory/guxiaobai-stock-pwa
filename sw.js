/* ═════════════════════════════════════════
   Service Worker — 股小白 PWA
   Cache-first for app shell; pass-through for API.
   ═════════════════════════════════════════ */

const CACHE = 'gxb-v1';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/style.css',
  '/js/store.js',
  '/js/indicators.js',
  '/js/signals.js',
  '/js/data.js',
  '/js/ui-dashboard.js',
  '/js/ui-watchlist.js',
  '/js/ui-signals.js',
  '/js/ui-news.js',
  '/js/ui-glossary.js',
  '/js/app.js',
  '/data/glossary.json',
  '/data/popular.json',
  '/assets/icons/icon-180.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/maskable-512.png',
  '/assets/icons/icon-152.png',
  '/assets/icons/icon-167.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);

  // App shell → cache-first
  if (
    u.pathname.endsWith('.html') ||
    u.pathname.endsWith('.css') ||
    u.pathname.endsWith('.js') ||
    u.pathname.endsWith('.json') ||
    u.pathname.includes('/icons/')
  ) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
    return;
  }

  // Everything else (API / external) → network only
  e.respondWith(fetch(e.request));
});
