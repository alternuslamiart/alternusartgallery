// Service Worker for offline fallback on Alternus Art / Casynus Studio
const CACHE_NAME = 'alternus-offline-v1';
const OFFLINE_ASSETS = ['/offline.html', '/no-wifi.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept HTML page navigation requests when network is unavailable
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedFallback = await cache.match('/offline.html');
        return (
          cachedFallback ||
          new Response('Offline - No connection', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          })
        );
      })
    );
  }
});
