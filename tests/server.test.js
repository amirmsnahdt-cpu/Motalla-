/* تست‌های خودکار سرور — بدون هیچ پکیج اضافه (node:test).
   اجرا: node --experimental-sqlite --disable-warning=ExperimentalWarning --test tests/
   هر اجرا یک پوشه داده موقت و جدا می‌سازد؛ به داده واقعی دست نمی‌زند. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs'), os = require('os'), path = require('path');

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'motalla-test-'));
const { server, merge3 } = require('../server/server.js');

let base = '';
test.before(() => new Promise(r => server.listen(0, '127.0.0.1', () => { base = 'http://127.0.0.1:' + server.address().port; r(); })));
test.after(() => { server.closeAllConnections(); server.close(); fs.rmSync(process.env.DATA_DIR, { recursive: true, force: true }); });

async function api(p, { method = 'GET', body, token } = {}) {
  const r = await fetch(base + p, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { }
  return { status: r.status, j };
}
const IMG = 'data:image/png;base64,iVBORw0KGgo=', IMG2 = 'data:image/png;base64,AAAA';
let admin = '', staff = '', viewer = '';

test('وضعیت و فایل‌های ثابت', async () => {
  const s = await api('/api/status'); assert.equal(s.status, 200); assert.equal(s.j.ok, true); assert.ok(s.j.v > 0);
  const r = await fetch(base + '/index.html'); assert.equal(r.status, 200);
  for (const f of ['/app.js', '/styles.css', '/sw.js', '/manifest.json']) assert.equal((await fetch(base + f)).status, 200, f);
  assert.equal((await fetch(base + '/server/server.js')).status, 404);
});

test('بدون ورود، API بسته است', async () => {
  assert.equal((await api('/api/sync', { method: 'POST', body: {} })).status, 401);
  assert.equal((await api('/api/backups')).status, 401);
  assert.equal((await api('/api/img/x')).status, 401);
});

test('راه‌اندازی، ورود و ساخت کاربر', async () => {
  const s = await api('/api/setup', { method: 'POST', body: { username: 'boss', name: 'مدیر', password: 'secret123' } });
  assert.equal(s.status, 200); admin = s.j.token;
  assert.equal((await api('/api/setup', { method: 'POST', body: { username: 'x2', name: 'x', password: 'secret123' } })).status, 409);
  assert.equal((await api('/api/login', { method: 'POST', body: { username: 'boss', password: 'wrong-pass' } })).status, 401);
  for (const [u, perms] of [['clerk', ['add', 'edit', 'track']], ['viewer', ['add']]]) {
    assert.equal((await api('/api/users', { method: 'POST', token: admin, body: { username: u, name: u, password: 'secret123', perms } })).status, 200);
  }
  staff = (await api('/api/login', { method: 'POST', body: { username: 'clerk', password: 'secret123' } })).j.token;
  viewer = (await api('/api/login', { method: 'POST', body: { username: 'viewer', password: 'secret123' } })).j.token;
  assert.ok(staff && viewer);
  assert.equal((await api('/api/users', { token: staff })).status, 403);
});

test('همگام‌سازی و ادغام ویرایش هم‌زمان', async () => {
  const add = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'entries', id: 'e1', data: { id: 'e1', amt: 100, name: 'الف' } }] } });
  assert.equal(add.status, 200); assert.deepEqual(add.j.rejected || [], []);
  // دو کاربر از یک نسخه پایه، دو فیلد متفاوت را عوض می‌کنند؛ هر دو باید بمانند
  const b = { id: 'e1', amt: 100, name: 'الف' };
  await api('/api/sync', { method: 'POST', token: admin, body: { since: 0, changes: [{ coll: 'entries', id: 'e1', base: b, data: { ...b, amt: 200 } }] } });
  const r = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'entries', id: 'e1', base: b, data: { ...b, name: 'ب' } }] } });
  const doc = r.j.docs ? r.j.docs.find(d => d.coll === 'entries' && d.id === 'e1') : null;
  const all = JSON.stringify(r.j);
  assert.ok(doc ? doc.data.amt === 200 && doc.data.name === 'ب' : all.includes('"amt":200') && all.includes('"name":"ب"'));
  assert.deepEqual(merge3({ a: 1, b: 1 }, { a: 2, b: 1 }, { a: 1, b: 3 }), { a: 2, b: 3 });
});

test('کارمند بدون مجوز حذف، واریزی را حذف نمی‌کند', async () => {
  const r = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'entries', id: 'e1', data: null }] } });
  assert.equal(r.j.rejected.length, 1);
});

test('تاریخچه: فقط افزودن و علامت «لغو شد»', async () => {
  const ev = { id: 'a1', type: 'add', user: 'clerk', ts: '2026-10-18T00:00:00Z', summary: 'ثبت' };
  let r = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'audit', id: 'a1', data: ev }] } });
  assert.deepEqual(r.j.rejected || [], []);
  r = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'audit', id: 'a1', base: ev, data: { ...ev, summary: 'دستکاری' } }] } });
  assert.equal(r.j.rejected.length, 1, 'ویرایش متن تاریخچه باید رد شود');
  r = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'audit', id: 'a1', base: ev, data: { ...ev, undone: true } }] } });
  assert.deepEqual(r.j.rejected || [], [], 'علامت لغو مجاز است');
  r = await api('/api/sync', { method: 'POST', token: staff, body: { since: 0, changes: [{ coll: 'audit', id: 'a1', data: null }] } });
  const all = JSON.stringify(r.j); assert.ok(all.includes('دستکاری') === false && all.includes('a1'));
});

test('عکس‌ها: مجوز تغییر و نگهداری نسخه قبلی', async () => {
  assert.equal((await api('/api/img/r1', { method: 'PUT', token: viewer, body: { data: IMG } })).status, 200, 'عکس تازه را همه می‌توانند بفرستند');
  assert.equal((await api('/api/img/r1', { method: 'PUT', token: viewer, body: { data: IMG } })).status, 200, 'ارسال دوباره همان عکس');
  assert.equal((await api('/api/img/r1', { method: 'PUT', token: viewer, body: { data: IMG2 } })).status, 403);
  assert.equal((await api('/api/img/r1', { method: 'DELETE', token: viewer })).status, 403);
  assert.equal((await api('/api/img/r1', { method: 'PUT', token: staff, body: { data: IMG2 } })).status, 200);
  assert.equal((await api('/api/img/r1', { method: 'DELETE', token: staff })).status, 200);
  assert.equal((await api('/api/img/r1', { token: staff })).status, 404);
  const { db } = require('../server/server.js');
  const old = db.prepare('SELECT data FROM imgs_old WHERE k=? ORDER BY n').all('r1').map(x => x.data);
  assert.deepEqual(old, [IMG, IMG2], 'هر دو نسخه قبلی نگه داشته شده');
});

test('پشتیبان: ساخت، فهرست و ثبت زمان دانلود', async () => {
  assert.equal((await api('/api/backups', { token: staff })).status, 403);
  const mk = await api('/api/backups', { method: 'POST', token: admin }); assert.equal(mk.status, 200);
  let l = await api('/api/backups', { token: admin }); assert.ok(l.j.backups.length >= 1); assert.equal(l.j.lastDl, null);
  const r = await fetch(base + '/api/backup/full', { headers: { Authorization: 'Bearer ' + admin } }); assert.equal(r.status, 200); await r.arrayBuffer();
  l = await api('/api/backups', { token: admin }); assert.equal(l.j.lastDl, null, 'fetching alone is not a saved backup');
  assert.equal((await api('/api/backup/saved', { method: 'POST', token: staff })).status, 403);
  assert.equal((await api('/api/backup/saved', { method: 'POST', token: admin })).status, 200);
  l = await api('/api/backups', { token: admin }); assert.ok(l.j.lastDl);
});

test('بازگردانی از فایل پشتیبان: تکه‌تکه، بررسی، بازگردانی؛ تاریخچه و عکس‌های فعلی می‌مانند', async () => {
  const zlib = require('zlib'), H = t => ({ Authorization: 'Bearer ' + t, 'Content-Type': 'application/octet-stream' });
  const up = (t, q, body) => fetch(base + '/api/backup/upload?' + q, { method: 'POST', headers: H(t), body });
  await api('/api/sync', { method: 'POST', token: admin, body: { since: 0, changes: [{ coll: 'entries', id: 'rx1', data: { id: 'rx1', amt: 5, name: 'قبل' } }] } });
  const full = await (await fetch(base + '/api/backup/full', { headers: { Authorization: 'Bearer ' + admin } })).arrayBuffer();
  // بعد از پشتیبان: تغییر واریزی، یک واریزی تازه و یک ردیف تاریخچه
  await api('/api/sync', { method: 'POST', token: admin, body: { since: 0, changes: [{ coll: 'entries', id: 'rx1', data: { id: 'rx1', amt: 9, name: 'بعد' } }, { coll: 'entries', id: 'rx2', data: { id: 'rx2', amt: 1 } }, { coll: 'audit', id: 'ax9', data: { id: 'ax9', type: 'add', summary: 'بعد از پشتیبان' } }] } });
  const id = 'a1b2c3d4e5f60718', buf = Buffer.from(full), half = Math.ceil(buf.length / 2);
  assert.equal((await up(staff, 'id=' + id + '&i=0&off=0', buf.subarray(0, half))).status, 403);
  assert.equal((await up(admin, 'id=' + id + '&i=1&off=0', buf.subarray(half))).status, 409, 'out of order chunk');
  assert.equal((await up(admin, 'id=' + id + '&i=0&off=0', buf.subarray(0, half))).status, 200);
  assert.equal((await up(admin, 'id=' + id + '&i=1&off=' + half, buf.subarray(half))).status, 200);
  const s = await (await up(admin, 'id=' + id + '&done=1')).json(); assert.equal(s.kind, 'full'); assert.ok(s.entries >= 1);
  const r = await up(admin, 'id=' + id + '&restore=1'); assert.equal(r.status, 200);
  const all = (await api('/api/sync', { method: 'POST', token: admin, body: { since: 0, changes: [] } })).j;
  const docs = all.docs || all.changes || [];
  const get = (c, i) => docs.find(d => d.coll === c && d.id === i);
  assert.equal(get('entries', 'rx1').data.name, 'قبل');
  assert.ok(!get('entries', 'rx2') || get('entries', 'rx2').deleted);
  const { db } = require('../server/server.js');
  assert.ok(db.prepare("SELECT 1 FROM docs WHERE coll='audit' AND id='ax9' AND deleted=0").get(), 'audit added after the backup is kept');
  assert.ok(db.prepare("SELECT 1 FROM docs WHERE coll='audit' AND data LIKE '%بازگردانی از فایل%'").get(), 'restore is logged');
  assert.equal((await up(admin, 'id=' + id + '&restore=1')).status, 404, 'upload is consumed');
  // فایل نامربوط رد می‌شود
  const bid = 'ffffffffffffffff';
  await up(admin, 'id=' + bid + '&i=0&off=0', zlib.gzipSync(Buffer.from('{"x":1}')));
  assert.equal((await up(admin, 'id=' + bid + '&done=1')).status, 400);
  assert.equal((await up(admin, 'id=' + bid + '&i=0&off=0', Buffer.from('not gzip'))).status, 200);
  assert.equal((await up(admin, 'id=' + bid + '&done=1')).status, 400);
});

test('امنیت: کارمند بدون مجوز ویرایش، شبا و مبلغ را عوض نمی‌کند؛ تغییرها روی سرور ثبت و به مدیر اعلام می‌شوند', async () => {
  const sync = (t, changes) => api('/api/sync', { method: 'POST', token: t, body: { since: 0, changes } });
  const IB = 'IR000000000000000000000001', IB2 = 'IR000000000000000000000002';
  // کارمندی که فقط پیگیری دارد
  assert.equal((await api('/api/users', { method: 'POST', token: admin, body: { username: 'tracker', name: 'پیگیر', password: 'secret123', perms: ['track', 'add'] } })).status, 200);
  const tr = (await api('/api/login', { method: 'POST', body: { username: 'tracker', password: 'secret123' } })).j.token;
  const e0 = { id: 's1', name: 'مشتری', amount: 1000, iban: IB, settles: [] };
  assert.equal((await sync(tr, [{ coll: 'entries', id: 's1', data: e0 }])).j.rejected.length, 0, 'add is allowed');
  let r = await sync(tr, [{ coll: 'entries', id: 's1', base: e0, data: { ...e0, iban: IB2 } }]);
  assert.equal(r.j.rejected.length, 1); assert.equal(r.j.changes.find(c => c.coll === 'entries' && c.id === 's1').data.iban, IB, 'server keeps the old IBAN');
  r = await sync(tr, [{ coll: 'entries', id: 's1', base: e0, data: { ...e0, amount: 5 } }]); assert.equal(r.j.rejected.length, 1);
  // کارهای عادی پیگیری (تسویه، وضعیت) همچنان مجاز است
  const e1 = { ...e0, status: 'ok', settles: [{ amount: 200 }] };
  r = await sync(tr, [{ coll: 'entries', id: 's1', base: e0, data: e1 }]); assert.equal(r.j.rejected.length, 0);
  // لیست پیگیری: ردیف تازه با شبای جعلی رد، با شبای درست قبول؛ مبلغ مانده بعد از تسویه مجاز، مبلغ دلخواه رد
  r = await sync(tr, [{ coll: 'batches', id: 'b1', data: { id: 'b1', items: [{ id: 's1', iban: IB2, amount: 1000 }] } }]); assert.equal(r.j.rejected.length, 1);
  const b0 = { id: 'b1', items: [{ id: 's1', iban: IB, amount: 1000, name: 'مشتری' }] };
  r = await sync(tr, [{ coll: 'batches', id: 'b1', data: b0 }]); assert.equal(r.j.rejected.length, 0);
  r = await sync(tr, [{ coll: 'batches', id: 'b1', base: b0, data: { id: 'b1', items: [{ ...b0.items[0], amount: 800 }] } }]); assert.equal(r.j.rejected.length, 0, 'remaining after settlement');
  const b1 = { id: 'b1', items: [{ ...b0.items[0], amount: 800 }] };
  r = await sync(tr, [{ coll: 'batches', id: 'b1', base: b1, data: { id: 'b1', items: [{ ...b1.items[0], amount: 50 }] } }]); assert.equal(r.j.rejected.length, 1);
  r = await sync(tr, [{ coll: 'batches', id: 'b1', base: b1, data: { id: 'b1', items: [{ ...b1.items[0], iban: IB2 }] } }]); assert.equal(r.j.rejected.length, 1);
  // کارمند با مجوز ویرایش می‌تواند؛ و تغییر ثبت می‌شود
  r = await sync(staff, [{ coll: 'entries', id: 's1', base: e1, data: { ...e1, iban: IB2 } }]); assert.equal(r.j.rejected.length, 0);
  const lg = await api('/api/changes', { token: admin }); assert.equal(lg.status, 200);
  const row = lg.j.rows.find(x => x.doc === 's1' && x.field === 'iban'); assert.ok(row); assert.equal(row.old, IB); assert.equal(row.new, IB2); assert.equal(row.user, 'clerk'); assert.equal(row.alert, 1);
  assert.ok(!lg.j.rows.some(x => x.coll === 'batches' && x.field === 'amount'), 'settlement-driven amount is not an alert');
  // اعلان به مدیر و «دیدم»
  let a = await sync(admin, []); assert.ok(a.j.chg >= 1);
  assert.equal((await api('/api/changes', { token: staff })).status, 403);
  assert.equal((await api('/api/changes/seen', { method: 'POST', token: admin, body: { n: Math.max(...lg.j.rows.map(x => x.n)) } })).status, 200);
  a = await sync(admin, []); assert.equal(a.j.chg, 0);
  assert.equal((await sync(staff, [])).j.chg, undefined, 'staff gets no count');
});

test('امنیت: قفل ورود با IP جعلی دور زده نمی‌شود، رمز تازه ۸ حرفی، هدرهای امنیتی', async () => {
  const login = (xff, pw) => fetch(base + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': xff + ', 10.0.0.7' }, body: JSON.stringify({ username: 'viewer', password: pw }) });
  for (let i = 0; i < 5; i++) await login('1.1.1.' + i, 'nope-' + i);
  assert.equal((await login('9.9.9.9', 'secret123')).status, 429, 'changing the forged first IP does not reset the lock');
  assert.equal((await api('/api/users', { method: 'POST', token: admin, body: { username: 'short', name: 's', password: 'abc123' } })).status, 400);
  assert.equal((await api('/api/users', { method: 'POST', token: admin, body: { username: 'longok', name: 's', password: 'abcd1234' } })).status, 200);
  const h = await fetch(base + '/index.html', { headers: { 'X-Forwarded-Proto': 'https' } });
  assert.equal(h.headers.get('x-frame-options'), 'DENY'); assert.match(h.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.ok(h.headers.get('strict-transport-security')); assert.equal(h.headers.get('referrer-policy'), 'same-origin');
  assert.equal((await fetch(base + '/api/status')).headers.get('x-frame-options'), 'DENY');
});

test('پیش‌نمایش githack فقط برای مدیر؛ نشست ۳۰ روزه', async () => {
  const P = { Origin: 'https://raw.githack.com', 'Content-Type': 'application/json' };
  const lg = (u) => fetch(base + '/api/login', { method: 'POST', headers: P, body: JSON.stringify({ username: u, password: 'secret123' }) });
  assert.equal((await lg('clerk')).status, 403, 'staff cannot log in from preview');
  const ad = await lg('boss'); assert.equal(ad.status, 200, 'admin can log in from preview');
  assert.equal((await fetch(base + '/api/me', { headers: { ...P, Authorization: 'Bearer ' + staff } })).status, 403, 'staff token rejected from preview');
  assert.equal((await fetch(base + '/api/me', { headers: { Authorization: 'Bearer ' + staff } })).status, 200, 'staff still fine in the real app');
  const { db } = require('../server/server.js');
  const max = db.prepare('SELECT MAX(expires_at) m FROM sessions').get().m;
  assert.ok(Date.parse(max) <= Date.now() + 30 * 864e5 + 60e3, 'sessions last at most 30 days');
});
