/* =========================================================
   GeoPatitas — Service Worker
   Guarda la app en caché para que abra sin conexión.
   Sube CACHE_VERSION cada vez que cambies archivos.
   ========================================================= */
const CACHE_VERSION = 'geopatitas-v1';
const APP_SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Navegación: red primero, si falla usa la app en caché
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Archivos: caché primero y guarda lo nuevo (incluye Google Fonts)
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached)
    )
  );
});
