// Service Worker v2 - Force clear all caches
const VERSION = 'v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(cacheNames.map(cacheName => {
        console.log('[SW] Deleting cache:', cacheName);
        return caches.delete(cacheName);
      }));
    }).then(() => {
      console.log('[SW] All caches cleared, version:', VERSION);
      return self.clients.claim();
    }).then(() => {
      // Tell all open tabs to reload
      return self.clients.matchAll({ type: 'window' });
    }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: VERSION }));
    })
  );
});

// Never cache - always fetch fresh from network
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline - please refresh', { status: 503 });
    })
  );
});
