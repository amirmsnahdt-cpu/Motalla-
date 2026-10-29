/* سرویس ورکر مطلا: همیشه اول نسخه تازه از اینترنت؛ فقط وقتی اینترنت نیست از نسخه ذخیره‌شده */
const CACHE = 'motalla-v2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'motalla-share').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* v63.5: «اشتراک‌گذاری» عکس رسید از برنامه‌های دیگر به برنامه نصب‌شده (اندروید/Chrome): عکس‌ها در کش موقت، بعد باز شدن برنامه با ?share=1 */
self.addEventListener('fetch', e => {
  const r0 = e.request, u0 = new URL(r0.url);
  if (r0.method === 'POST' && u0.origin === self.location.origin && u0.pathname.endsWith('/share-in')) {
    e.respondWith((async () => {
      const home = new URL('index.html?share=1', self.registration.scope).href;
      try {
        const f = await r0.formData(), F = f.getAll('rc').filter(x => x && x.type && x.type.startsWith('image/')).slice(0, 10), c = await caches.open('motalla-share');
        let i = 0; for (const x of F) await c.put(new Request(self.registration.scope + '__share/' + Date.now() + '_' + (i++)), new Response(x, { headers: { 'Content-Type': x.type } }));
      } catch (_) {}
      return Response.redirect(home, 303);
    })());
    return;
  }
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope).pathname; if (!u.pathname.startsWith(scope) || u.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match(scope + 'index.html'))));
});
