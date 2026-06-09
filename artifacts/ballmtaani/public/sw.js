// BallMtaani Service Worker v9
// KEY CHANGE from v8: never manufacture fake 503 responses. On any fetch
// failure, fall through to the real network error so the browser/app can
// handle it, instead of synthesizing a 503 that broke SPA routes.
// index.html is NEVER cached — every navigation fetches fresh.

const CACHE_NAME = 'ballmtaani-v9';

// Only cache true static assets that never change between deploys
const STATIC_ASSETS = [
  '/manifest.json',
  '/logo.png',
];

// Skip waiting immediately — allows instant SW activation on update
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Install: cache only truly static assets (NOT index.html)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete all old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip cross-origin (Supabase, API-Football, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip API calls — never cache
  if (url.pathname.startsWith('/api/')) return;

  // Skip Vite-hashed JS/CSS assets — browser HTTP cache handles these
  // Vite sets immutable Cache-Control headers so the browser caches them correctly
  if (url.pathname.startsWith('/assets/')) return;

  // For ALL document/navigation requests (SPA routes):
  // ALWAYS fetch fresh from network. Never serve index.html from SW cache.
  // This ensures users always get the latest chunk hashes after a deploy.
  // Fall back to a simple offline page only if network is completely unavailable.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() => {
        // True offline fallback — only if network is down
        return caches.match('/index.html') || new Response(
          '<html><body style="background:#070a0f;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px"><div style="font-size:2rem">⚽</div><div style="font-weight:bold;letter-spacing:0.2em;text-transform:uppercase">BallMtaani</div><div style="opacity:0.4;font-size:0.8rem">No internet connection</div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
    return;
  }

  // For everything else (manifest, logo, etc.) — cache-first.
  // On a cache miss, fetch from network. Do NOT manufacture a fake 503 on
  // failure — just let the real network response/error pass through.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '⚽ BallMtaani';
  const options = {
    body: data.body || 'New activity waiting for you!',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: data.tag || 'ballmtaani-general',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => c.url === url && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
