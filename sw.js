/* Games — лёгкий Service Worker для мгновенного старта и офлайн-витрины. */
const CACHE_NAME = 'games-store-v10';
// Кэш живой Квени нельзя сносить при обновлении витрины: там её модель
// на ~400 МБ, и пользователь специально скачивал её один раз.
const PRESERVED_CACHES = new Set([CACHE_NAME, 'transformers-cache']);
const PRECACHE = [
  './',
  './index.html',
  './site/site.css',
  './site/games-data.js',
  './site/game-antivirus.js',
  './site/portal.js',
  './site/games-tabs.js',
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
      .then((keys) => Promise.all(keys.filter((k) => !PRESERVED_CACHES.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/ratmes/') || url.pathname.includes('/news/')) return;

  const isHtmlDoc =
    req.mode === 'navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/');

  // Network-First для HTML — чтобы новые вкладки и обновления появлялись с первого открытия
  if (isHtmlDoc) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy).catch((err) => err));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Stale-While-Revalidate для статических ассетов витрины
  if (!url.pathname.includes('/site/')) return;

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
