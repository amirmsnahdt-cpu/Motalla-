/* سرویس ورکر مطلا: همیشه اول نسخه تازه از اینترنت؛ فقط وقتی اینترنت نیست از نسخه ذخیره‌شده */
const CACHE = 'motalla-v2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope).pathname; if (!u.pathname.startsWith(scope) || u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match(scope + 'index.html'))));
});
