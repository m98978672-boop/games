// Лёгкий Service Worker для PWA RatMes (офлайн-кэш статической оболочки без вмешательства в /api/*).

const CACHE_NAME = 'ratmes-shell-v8';
const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './src/engine/cloud-hub.mjs',
  './src/engine/service-guides.mjs',
  './src/web/brand-icons.mjs',
  './src/web/app.js',
  './src/web/bridge-client.mjs',
  './src/web/audio.mjs',
  './src/web/voice-recorder.mjs',
  './src/web/markdown-render.mjs',
  './src/web/telemetry-canvas.mjs',
  './src/web/command-palette.mjs',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || url.pathname.endsWith('/ws')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
