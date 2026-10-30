// Service worker: keeps Kids Read working offline and starting fast.
// vite.config.ts fills in VERSION and SHELL (the built app files) at build time.
//  - The app's own files are kept in a cache per build; old builds' caches are deleted.
//  - Pages are fetched fresh when online (so new builds arrive) and from the cache when not.
//  - Voice clips have versioned URLs (?v=), so they're served from the cache forever, and the
//    page asks for all of them to be downloaded in the background (see main.ts).
const VERSION = '__VERSION__';
const SHELL = __SHELL__;
const SHELL_CACHE = 'shell-' + VERSION;
const VOICE_CACHE = 'voice';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('shell-') && k !== SHELL_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function cacheFirst(cacheName, req) {
  const cache = await caches.open(cacheName);
  // ignoreVary: the app's script tag sends an Origin header the precached copy was stored without.
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirst(req) {
  try {
    const res = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(() => no(new Error('slow')), 4000))]);
    if (res.ok && !res.redirected) (await caches.open(SHELL_CACHE)).put('/', res.clone());
    return res;
  } catch {
    return (await caches.match('/', { ignoreVary: true })) || Response.error();
  }
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') e.respondWith(networkFirst(req));
  else if (url.pathname.startsWith('/voice/')) e.respondWith(cacheFirst(VOICE_CACHE, req));
  else e.respondWith(cacheFirst(SHELL_CACHE, req));
});

// The page sends every voice clip URL; fetch the ones we don't have (a few at a time, so the
// game stays snappy) and drop clips that are no longer used.
self.addEventListener('message', e => {
  if (e.data?.type !== 'warm') return;
  const urls = e.data.urls;
  e.waitUntil((async () => {
    const cache = await caches.open(VOICE_CACHE);
    const want = new Set(urls.map(u => new URL(u, location.origin).href));
    for (const req of await cache.keys()) if (!want.has(req.url)) await cache.delete(req);
    const have = new Set((await cache.keys()).map(r => r.url));
    const todo = [...want].filter(u => !have.has(u));
    const worker = async () => {
      for (let u; (u = todo.shift());) {
        try { const res = await fetch(u); if (res.ok) await cache.put(u, res); } catch { /* offline: try next time */ }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
  })());
});
