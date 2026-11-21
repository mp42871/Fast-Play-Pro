/* FastPlay Pro service worker: makes the app open and work with no internet.
 * Change VERSION whenever you publish an update; open copies of the app will then offer an "Update" button. */
const VERSION = 'fastplay-2026-11-21-5';
const FONT_CACHE = 'fastplay-fonts';

const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/tailwind.js',
  './vendor/phosphor.js',
  './vendor/jspdf.umd.min.js',
  './vendor/phosphor/regular/style.css',
  './vendor/phosphor/regular/Phosphor.woff2',
  './vendor/phosphor/bold/style.css',
  './vendor/phosphor/bold/Phosphor-Bold.woff2',
  './vendor/phosphor/fill/style.css',
  './vendor/phosphor/fill/Phosphor-Fill.woff2',
  './icons/favicon.svg',
  './icons/icon-32.png',
  './icons/icon-192.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION && k !== FONT_CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// The page: try the network first (so updates show up), fall back to the saved copy after 3.5 s or when offline
async function pageFirstNetwork(request) {
  const cache = await caches.open(VERSION);
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500))
    ]);
    if (response && response.ok) cache.put('./index.html', response.clone());
    return response;
  } catch (_) {
    return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
  }
}

// Scripts, styles, icons: answer from the saved copy at once, refresh it in the background
async function cachedThenRefresh(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: cacheName === VERSION });
  const refresh = fetch(request).then((response) => {
    if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone());
    return response;
  }).catch(() => null);
  if (cached) return cached;
  return (await refresh) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate' || url.pathname.endsWith('/index.html')) event.respondWith(pageFirstNetwork(request));
    else event.respondWith(cachedThenRefresh(request, VERSION));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cachedThenRefresh(request, FONT_CACHE));
  }
  // Everything else (Google sign-in, Google Drive, CDN fallbacks) goes straight to the network
});
