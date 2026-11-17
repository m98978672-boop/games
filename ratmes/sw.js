// Service Worker для RatMes — Network-First с немедленным обновлением кэша без устаревших стилей.

const CACHE_NAME = 'ratmes-shell-v15';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || url.pathname.endsWith('/ws')) return;
  if (event.request.method !== 'GET') return;

  const isAppAsset =
    event.request.mode === 'navigate'
    || /\.(html|css|js|mjs)$/i.test(url.pathname)
    || url.pathname.endsWith('/ratmes/');

  event.respondWith(
    fetch(event.request, isAppAsset ? { cache: 'no-cache' } : undefined)
      .then((res) => {
        if (res && res.ok && isAppAsset && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
