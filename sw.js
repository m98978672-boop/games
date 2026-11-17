/* Games — лёгкий Service Worker для мгновенного старта и офлайн-витрины. */
const CACHE_NAME = 'games-store-v7';
const PRECACHE = [
  './',
  './index.html',
  './site/site.css',
  './site/games-data.js',
  './site/game-antivirus.js',
  './site/portal.js',
  './site/games-tabs.js',
  './site/news-hub.js',
  './site/news-feed.json',
  './site/user-games.js',
  './site/community-games.js',
  './site/community-games.json',
  './site/site.webmanifest',
  './site/assets/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE).catch((err) => err))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/ratmes/')) return;

  // Stale-While-Revalidate для витрины и ассетов
  const isStoreAsset =
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/') ||
    url.pathname.includes('/site/');
  if (!isStoreAsset) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((cached) => {
        const fetched = fetch(req)
          .then((res) => {
            if (res && res.ok && res.type === 'basic') {
              cache.put(req, res.clone()).catch((err) => err);
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetched;
      })
    )
  );
});
