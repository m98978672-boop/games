// Bump this name when releasing a new static shell; the script itself is checked on every app launch.
const CACHE_NAME = 'playbridge-shell-0.3.0';
const APP_SCOPE = new URL('./', self.registration.scope);
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];
const SHELL_REQUESTS = SHELL_FILES.map((file) => new Request(new URL(file, APP_SCOPE), { cache: 'reload' }));
const SHELL_URLS = new Set(SHELL_REQUESTS.map((request) => request.url));
const APP_ENTRY_PATHS = new Set([new URL('./', APP_SCOPE).pathname, new URL('./index.html', APP_SCOPE).pathname]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL_REQUESTS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('playbridge-shell-') && name !== CACHE_NAME).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache sessions, Steam login callbacks, or user-specific library responses.
  if (url.pathname.includes('/api/') || url.pathname.includes('/auth/')) return;
  if (!url.pathname.startsWith(APP_SCOPE.pathname)) return;

  if (request.mode === 'navigate') {
    if (!APP_ENTRY_PATHS.has(url.pathname)) return;
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: 'no-store' });
        if (fresh.ok && !url.search) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request) || await cache.match(new URL('./index.html', APP_SCOPE).href);
        return cached || Response.error();
      }
    })());
    return;
  }

  if (!SHELL_URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
