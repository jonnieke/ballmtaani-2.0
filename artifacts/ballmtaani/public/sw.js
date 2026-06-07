const CACHE_NAME = 'ballmtaani-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
];

// Skip waiting immediately when asked — allows instant SW activation on update
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first always.
// We do NOT cache JS/CSS assets — Vite hashes filenames on every build,
// so old cached hashes 404 after a new deploy. Let the browser handle caching.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests entirely
  if (url.origin !== self.location.origin) return;

  // Skip API calls — never cache these
  if (url.pathname.startsWith('/api/')) return;

  // Skip hashed JS/CSS assets — browser cache handles these via Vite content hashing
  if (url.pathname.startsWith('/assets/')) return;

  // For top-level document requests (SPA routes), serve index.html from cache or network
  event.respondWith(
    caches.match('/index.html').then((cached) => {
      return fetch(request).catch(() => cached || Response.error());
    })
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
      { action: 'dismiss', title: 'Dismiss' }
    ]
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
