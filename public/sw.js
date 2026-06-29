// Service Worker - Clear all caches on install
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    }).then(() => self.clients.claim())
  );
});

// Don't cache anything - always fetch fresh
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
