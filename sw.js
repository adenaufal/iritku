// Fuelio service worker.
//
// This has to be a real file: a Blob/inline URL can never be registered as a
// service worker (the spec requires an http(s) script URL), so index.html's
// previous `navigator.serviceWorker.register(blobUrl)` call always threw and
// the app never actually worked offline.
//
// index.html registers this as `sw.js?v=<APP_VERSION>` — the query string
// gives each release its own cache name without touching this file.
const CACHE_PREFIX = 'fuel-';
const CACHE_NAME = CACHE_PREFIX + (new URL(self.location.href).searchParams.get('v') || 'dev');
const NAV_TIMEOUT_MS = 3000;

function scopeUrls() {
  const scope = self.registration.scope;
  // Precache the scope itself and its index.html — never bare ['.', '/'],
  // which resolve relative to the *service worker's* URL, not the page's.
  return [scope, scope + 'index.html'];
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(scopeUrls()))
  );
  // No unconditional skipWaiting() here — an update sits WAITING until the
  // page's toast asks for it (see the 'message' listener below), so an open
  // tab never gets swapped out from under the user mid-session.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch (_) { /* unsupported */ }
      }
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function timeoutAfter(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function networkFirstNavigation(event) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;
  } catch (_) { /* ignore, fall through to network/cache */ }

  try {
    const network = await Promise.race([fetch(event.request), timeoutAfter(NAV_TIMEOUT_MS)]);
    if (network) return network;
  } catch (_) { /* offline or request failed — fall back to the cached shell */ }

  const cached = (await cache.match(self.registration.scope + 'index.html')) || (await cache.match(self.registration.scope));
  return cached || Response.error();
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
