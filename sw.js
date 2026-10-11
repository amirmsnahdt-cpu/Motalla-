/* سرویس ورکر مطلا: همیشه اول نسخه تازه از سرور؛ فقط وقتی اینترنت نیست از نسخه ذخیره‌شده */
const CACHE = 'motalla-shell-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== self.location.origin || u.pathname.startsWith('/api/')) return;
  const key = r.mode === 'navigate' ? '/' : r;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(key, cp)); } return res; })
    .catch(() => caches.match(key).then(m => m || caches.match('/'))));
});
