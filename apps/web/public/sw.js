/* LearnSphere service worker: offline shell + cache-first for lesson media segments. */
const SHELL_CACHE = 'ls-shell-v3';
const MEDIA_CACHE = 'ls-media-v1';
const SHELL_ASSETS = ['/', '/courses', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![SHELL_CACHE, MEDIA_CACHE].includes(k)).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/media/')) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const hit = await cache.match(event.request);
        if (hit) return hit;
        const res = await fetch(event.request);
        if (res.ok && url.pathname.endsWith('.ts')) cache.put(event.request, res.clone());
        return res;
      }),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((r) => r || caches.match('/offline.html'))),
  );
});
