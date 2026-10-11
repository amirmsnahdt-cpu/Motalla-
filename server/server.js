'use strict';
/* سرور مطلا — بدون وابستگی خارجی (Node.js 22+ و SQLite داخلی) */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = +process.env.PORT || 3000;
process.on('uncaughtException', e => { console.error('uncaught:', e); });
process.on('unhandledRejection', e => { console.error('unhandled:', e); });
const ROOT = path.join(__dirname, '..');
// پوشه داده: اول DATA_DIR، بعد پوشه data کنار برنامه (دیسک لیارا روی همین سوار می‌شود)
function pickDataDir() {
  const C = process.env.DATA_DIR ? [process.env.DATA_DIR] : [path.join(ROOT, 'data'), '/app/data', '/usr/src/app/data'];
  for (const c of C) {
    let p = c;
    try { const l = fs.readlinkSync(c); p = path.resolve(path.dirname(c), l); } catch (e) { /* not a symlink */ }
    try {
      fs.mkdirSync(p, { recursive: true });
      const t = path.join(p, '.w'); fs.writeFileSync(t, '1'); fs.unlinkSync(t);
      return p;
    } catch (e) { console.error('data dir not usable:', c, '->', p, e.code || e.message); }
  }
  throw new Error('no writable data directory (tried ' + C.join(', ') + ')');
}
const DATA_DIR = pickDataDir();
const SESSION_DAYS = 180;
const ALLOWED_ORIGINS = new Set(['https://raw.githack.com', ...(process.env.EXTRA_ORIGINS || '').split(',').filter(Boolean)]);
const COLLS = new Set(['entries', 'sources', 'batches', 'creds', 'trash', 'audit', 'drafts']);

const db = new DatabaseSync(path.join(DATA_DIR, 'motalla.db'));
db.exec(`
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  pass TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_login TEXT
);
CREATE TABLE IF NOT EXISTS sessions(
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  device TEXT
);
CREATE TABLE IF NOT EXISTS docs(
  coll TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT,
  deleted INTEGER NOT NULL DEFAULT 0,
  ver INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT,
  PRIMARY KEY(coll, id)
);
CREATE INDEX IF NOT EXISTS docs_ver ON docs(ver);
CREATE TABLE IF NOT EXISTS meta(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS imgs(k TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL);
`);

const now = () => new Date().toISOString();
const q = {
  userCount: db.prepare('SELECT COUNT(*) n FROM users'),
  userByName: db.prepare('SELECT * FROM users WHERE username=?'),
  userById: db.prepare('SELECT * FROM users WHERE id=?'),
  users: db.prepare('SELECT id,username,name,role,active,created_at,last_login FROM users ORDER BY id'),
  addUser: db.prepare('INSERT INTO users(username,name,pass,role,active,created_at) VALUES(?,?,?,?,1,?)'),
  addSession: db.prepare('INSERT INTO sessions(token,user_id,created_at,expires_at,device) VALUES(?,?,?,?,?)'),
  session: db.prepare('SELECT s.expires_at, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?'),
  delSession: db.prepare('DELETE FROM sessions WHERE token=?'),
  delUserSessions: db.prepare('DELETE FROM sessions WHERE user_id=?'),
  delOtherSessions: db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?'),
  purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at<?'),
  getDoc: db.prepare('SELECT * FROM docs WHERE coll=? AND id=?'),
  putDoc: db.prepare(`INSERT INTO docs(coll,id,data,deleted,ver,updated_at,updated_by) VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(coll,id) DO UPDATE SET data=excluded.data,deleted=excluded.deleted,ver=excluded.ver,updated_at=excluded.updated_at,updated_by=excluded.updated_by`),
  since: db.prepare('SELECT coll,id,data,deleted,ver FROM docs WHERE ver>? ORDER BY ver LIMIT ?'),
  allLive: db.prepare("SELECT coll,id,data,deleted,ver FROM docs WHERE deleted=0 AND coll<>'audit'"),
  recentAudit: db.prepare("SELECT coll,id,data,deleted,ver FROM docs WHERE deleted=0 AND coll='audit' ORDER BY ver DESC LIMIT 500"),
  getMeta: db.prepare('SELECT v FROM meta WHERE k=?'),
  setMeta: db.prepare('INSERT INTO meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v'),
  getImg: db.prepare('SELECT data FROM imgs WHERE k=?'),
  putImg: db.prepare('INSERT INTO imgs(k,data,updated_at) VALUES(?,?,?) ON CONFLICT(k) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at'),
  delImg: db.prepare('DELETE FROM imgs WHERE k=?'),
  allDocs: db.prepare('SELECT coll,id,data,deleted,ver,updated_at,updated_by FROM docs WHERE deleted=0 ORDER BY coll,id'),
};
let VER = +(q.getMeta.get('ver') || { v: 0 }).v || 0;
const nextVer = () => { VER += 1; q.setMeta.run('ver', String(VER)); return VER; };
function tx(fn) { db.exec('BEGIN IMMEDIATE'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { try { db.exec('ROLLBACK'); } catch (_) { } throw e; } }

/* ---------- رمز عبور ---------- */
function hashPass(p) { const salt = crypto.randomBytes(16); const h = crypto.scryptSync(String(p), salt, 64, { N: 16384, r: 8, p: 1 }); return 'scrypt$' + salt.toString('hex') + '$' + h.toString('hex'); }
function checkPass(p, stored) {
  try { const [alg, s, h] = String(stored).split('$'); if (alg !== 'scrypt') return false; const want = Buffer.from(h, 'hex'); const got = crypto.scryptSync(String(p), Buffer.from(s, 'hex'), want.length, { N: 16384, r: 8, p: 1 }); return crypto.timingSafeEqual(want, got); } catch (e) { return false; }
}
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const pubUser = u => ({ id: u.id, username: u.username, name: u.name, role: u.role, active: !!u.active, created_at: u.created_at, last_login: u.last_login || null });

/* ---------- ادغام سه‌طرفه (برای ویرایش هم‌زمان چند کاربر) ---------- */
function stable(v) { if (v === undefined) return 'u'; if (v === null || typeof v !== 'object') return JSON.stringify(v); if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']'; return '{' + Object.keys(v).sort().filter(k => v[k] !== undefined).map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}'; }
const eq = (a, b) => stable(a) === stable(b);
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isIdArr = v => Array.isArray(v) && v.every(x => isObj(x) && x.id !== undefined && x.id !== null);
function merge3(base, mine, theirs) {
  if (eq(mine, base)) return theirs;
  if (eq(theirs, base) || eq(mine, theirs)) return mine;
  if (isObj(mine) && isObj(theirs)) {
    const b = isObj(base) ? base : {}, out = {};
    const keys = new Set([...Object.keys(b), ...Object.keys(mine), ...Object.keys(theirs)]);
    for (const k of keys) {
      const inM = k in mine, inT = k in theirs, inB = k in b;
      if (!inM && inB) { if (inT && !eq(theirs[k], b[k])) out[k] = theirs[k]; continue; }   // حذف محلی
      if (!inT && inB) { if (inM && !eq(mine[k], b[k])) out[k] = mine[k]; continue; }      // حذف از طرف دیگر
      const v = merge3(inB ? b[k] : undefined, inM ? mine[k] : undefined, inT ? theirs[k] : undefined);
      if (v !== undefined) out[k] = v;
    }
    return out;
  }
  if (isIdArr(mine) && isIdArr(theirs) && (base === undefined || base === null || isIdArr(base))) {
    const key = x => String(x.id), B = new Map((base || []).map(x => [key(x), x])), M = new Map(mine.map(x => [key(x), x])), T = new Set(theirs.map(key)), out = [];
    for (const t of theirs) {
      const k = key(t);
      if (M.has(k)) out.push(merge3(B.get(k), M.get(k), t));
      else if (B.has(k)) { if (!eq(t, B.get(k))) out.push(t); }   // محلی حذف شده؛ اگر دیگری تغییرش داده نگه دار
      else out.push(t);
    }
    for (const m of mine) { const k = key(m); if (T.has(k)) continue; if (B.has(k)) { if (!eq(m, B.get(k))) out.push(m); } else out.push(m); }
    return out;
  }
  return mine;
}

/* ---------- مجوزها ---------- */
function deny(user, coll, deleting, theirs) {
  if (user.role === 'admin') return null;
  if (coll === 'sources') return 'تغییر منابع فقط برای مدیر مجاز است';
  if (deleting && (coll === 'entries' || coll === 'creds')) return 'حذف فقط برای مدیر مجاز است';
  if (deleting && coll === 'batches' && theirs && theirs.closed) return 'حذف لیست بایگانی‌شده فقط برای مدیر مجاز است';
  return null;
}

/* ---------- محدودیت تلاش ورود ---------- */
const fails = new Map();
function throttled(key) { const f = fails.get(key); return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 1000) : 0; }
function failed(key) { const f = fails.get(key) || { n: 0, until: 0 }; f.n += 1; if (f.n >= 5) { f.until = Date.now() + 60_000 * Math.min(15, f.n - 4); } fails.set(key, f); }

/* ---------- ابزار HTTP ---------- */
let APP_VER = '';
function appVersion() { try { APP_VER = sha(fs.readFileSync(path.join(ROOT, 'index.html'))).slice(0, 12); } catch (e) { APP_VER = 'dev'; } return APP_VER; }
appVersion();
function cors(req, res) {
  const o = req.headers.origin;
  if (o && ALLOWED_ORIGINS.has(o)) { res.setHeader('Access-Control-Allow-Origin', o); res.setHeader('Vary', 'Origin'); res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); res.setHeader('Access-Control-Expose-Headers', 'X-App-Version'); res.setHeader('Access-Control-Max-Age', '86400'); }
}
function send(res, code, obj) { const b = JSON.stringify(obj); res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-App-Version': APP_VER }); res.end(b); }
const bad = (res, code, msg) => send(res, code, { error: msg });
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(Object.assign(new Error('too large'), { code: 413 })); req.destroy(); return; } chunks.push(c); });
    req.on('end', () => { try { const s = Buffer.concat(chunks).toString('utf8'); resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(Object.assign(new Error('bad json'), { code: 400 })); } });
    req.on('error', reject);
  });
}
function auth(req) {
  const h = req.headers.authorization || ''; const m = h.match(/^Bearer\s+([a-f0-9]{64})$/i); if (!m) return null;
  const row = q.session.get(sha(m[1])); if (!row || !row.active || row.expires_at < now()) return null;
  return { user: row, tokenHash: sha(m[1]) };
}
function newSession(user, req) {
  const tok = crypto.randomBytes(32).toString('hex'), exp = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  q.addSession.run(sha(tok), user.id, now(), exp, String(req.headers['user-agent'] || '').slice(0, 200));
  db.prepare('UPDATE users SET last_login=? WHERE id=?').run(now(), user.id);
  return tok;
}
const validUsername = u => /^[a-zA-Z0-9._-]{3,32}$/.test(u);
const validPass = p => typeof p === 'string' && p.length >= 6 && p.length <= 128;

/* ---------- همگام‌سازی ---------- */
function rowOut(r) { return { coll: r.coll, id: r.id, ver: r.ver, deleted: !!r.deleted, data: r.deleted ? null : JSON.parse(r.data) }; }
function doSync(user, body) {
  const since = Math.max(0, +body.since || 0), changes = Array.isArray(body.changes) ? body.changes : [], rejected = [], touched = new Set();
  if (changes.length > 20000) throw Object.assign(new Error('too many changes'), { code: 413 });
  tx(() => {
    for (const ch of changes) {
      const coll = String(ch && ch.coll || ''), id = String(ch && ch.id != null ? ch.id : '');
      if (!COLLS.has(coll) || !id || id.length > 80) continue;
      const cur = q.getDoc.get(coll, id), theirs = cur && !cur.deleted ? JSON.parse(cur.data) : null;
      const deleting = ch.data === null || ch.data === undefined;
      const why = deny(user, coll, deleting, theirs);
      if (why) { rejected.push({ coll, id, why }); touched.add(coll + '\u0000' + id); continue; }
      if (deleting) {
        if (!cur || cur.deleted) continue;
        if (coll === 'audit') continue;                         // تاریخچه هرگز حذف نمی‌شود
        q.putDoc.run(coll, id, null, 1, nextVer(), now(), user.name);
      } else {
        if (!isObj(ch.data)) continue;
        const merged = theirs ? merge3(ch.base === undefined ? null : ch.base, ch.data, theirs) : ch.data;
        if (isObj(merged)) merged.id = ch.data.id;
        if (cur && !cur.deleted && eq(merged, theirs)) { touched.add(coll + '\u0000' + id); continue; }
        q.putDoc.run(coll, id, JSON.stringify(merged), 0, nextVer(), now(), user.name);
      }
      touched.add(coll + '\u0000' + id);
    }
  });
  let rows, more = false;
  if (since === 0) rows = q.allLive.all().concat(q.recentAudit.all());
  else { rows = q.since.all(since, 5001); if (rows.length > 5000) { more = true; rows = rows.slice(0, 5000); } }
  const out = rows.map(rowOut), have = new Set(out.map(r => r.coll + '\u0000' + r.id));
  for (const k of touched) { if (have.has(k)) continue; const [c, i] = k.split('\u0000'); const r = q.getDoc.get(c, i); if (r) out.push(rowOut(r)); }
  const ver = more ? rows[rows.length - 1].ver : VER;
  return { ver, full: since === 0, more, changes: out, rejected, app: APP_VER };
}

/* ---------- فایل‌های ثابت ---------- */
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'], '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/sw.js': ['sw.js', 'text/javascript; charset=utf-8'], '/manifest.json': ['manifest.json', 'application/manifest+json'],
  '/apple-touch-icon.png': ['apple-touch-icon.png', 'image/png'], '/icon-192.png': ['icon-192.png', 'image/png'], '/icon-512.png': ['icon-512.png', 'image/png'],
};
function serveStatic(req, res, p) {
  const s = STATIC[p]; if (!s) return false;
  fs.readFile(path.join(ROOT, s[0]), (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const isApp = s[0] === 'index.html' || s[0] === 'sw.js';
    res.writeHead(200, { 'Content-Type': s[1], 'Cache-Control': isApp ? 'no-cache' : 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff', ...(s[0] === 'index.html' ? { 'X-App-Version': APP_VER } : {}) });
    res.end(buf);
  });
  return true;
}

/* ---------- مسیرها ---------- */
async function handle(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  const url = new URL(req.url, 'http://x'), p = url.pathname;
  if (p === '/robots.txt') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('User-agent: *\nAllow: /api/status\nDisallow: /\n'); return; }
  if (p === '/app.apk' || p === '/android') { res.writeHead(302, { Location: 'https://github.com/amirmsnahdt-cpu/Motalla-/releases/download/apk/motalla.apk' }); res.end(); return; }
  if (!p.startsWith('/api/')) { if (req.method === 'GET' && serveStatic(req, res, p)) return; res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('not found'); return; }

  if (p === '/api/status' && req.method === 'GET') return send(res, 200, { ok: true, setup: q.userCount.get().n === 0, app: APP_VER });

  if (p === '/api/setup' && req.method === 'POST') {
    const b = await readBody(req, 1e5);
    if (q.userCount.get().n > 0) return bad(res, 409, 'راه‌اندازی قبلاً انجام شده است');
    const username = String(b.username || '').trim(), name = String(b.name || '').trim();
    if (!validUsername(username)) return bad(res, 400, 'نام کاربری باید ۳ تا ۳۲ حرف انگلیسی یا عدد باشد');
    if (!name) return bad(res, 400, 'نام را بنویسید');
    if (!validPass(b.password)) return bad(res, 400, 'رمز عبور باید حداقل ۶ کاراکتر باشد');
    const r = q.addUser.run(username, name.slice(0, 60), hashPass(b.password), 'admin', now());
    const u = q.userById.get(r.lastInsertRowid);
    tx(() => { [[1, 'بانک سینا', 'سینا'], [2, 'بانک ملی', 'ملی'], [3, 'سینا فلاح', ''], [4, 'بلو بانک', 'بلو']].forEach(([id, n, bk]) => { if (!q.getDoc.get('sources', String(id))) q.putDoc.run('sources', String(id), JSON.stringify({ id, name: n, bank: bk, limit: 0, count: 0 }), 0, nextVer(), now(), name); }); });
    return send(res, 200, { token: newSession(u, req), user: pubUser(u) });
  }

  if (p === '/api/login' && req.method === 'POST') {
    const b = await readBody(req, 1e5), username = String(b.username || '').trim(), ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const key = ip + '|' + username.toLowerCase(), wait = throttled(key);
    if (wait) return bad(res, 429, 'تلاش زیاد بود؛ ' + wait + ' ثانیه دیگر دوباره امتحان کنید');
    const u = q.userByName.get(username);
    if (!u || !checkPass(b.password, u.pass)) { failed(key); return bad(res, 401, 'نام کاربری یا رمز عبور اشتباه است'); }
    if (!u.active) return bad(res, 403, 'این حساب غیرفعال است؛ با مدیر تماس بگیرید');
    fails.delete(key);
    return send(res, 200, { token: newSession(u, req), user: pubUser(u) });
  }

  const a = auth(req);
  if (!a) return bad(res, 401, 'دوباره وارد شوید');
  const me = a.user;

  if (p === '/api/me' && req.method === 'GET') return send(res, 200, { user: pubUser(me), app: APP_VER });
  if (p === '/api/logout' && req.method === 'POST') { q.delSession.run(a.tokenHash); return send(res, 200, { ok: true }); }
  if (p === '/api/password' && req.method === 'POST') {
    const b = await readBody(req, 1e5);
    if (!checkPass(b.old, me.pass)) return bad(res, 400, 'رمز فعلی اشتباه است');
    if (!validPass(b.password)) return bad(res, 400, 'رمز جدید باید حداقل ۶ کاراکتر باشد');
    db.prepare('UPDATE users SET pass=? WHERE id=?').run(hashPass(b.password), me.id); q.delOtherSessions.run(me.id, a.tokenHash);
    return send(res, 200, { ok: true });
  }
  if (p === '/api/sync' && req.method === 'POST') { const b = await readBody(req, 30e6); return send(res, 200, doSync(me, b)); }

  const im = p.match(/^\/api\/img\/(.{1,200})$/);
  let imk = null; if (im) { try { imk = decodeURIComponent(im[1]); } catch (e) { } }
  if (imk && /^[A-Za-z0-9:_\-.]{1,120}$/.test(imk)) {
    const k = imk;
    if (req.method === 'GET') { const r = q.getImg.get(k); return r ? send(res, 200, { data: r.data }) : bad(res, 404, 'not found'); }
    if (req.method === 'PUT') { const b = await readBody(req, 8e6); if (typeof b.data !== 'string' || !b.data.startsWith('data:image/')) return bad(res, 400, 'bad image'); q.putImg.run(k, b.data, now()); return send(res, 200, { ok: true }); }
    if (req.method === 'DELETE') { q.delImg.run(k); return send(res, 200, { ok: true }); }
  }

  /* ---- مدیریت کاربران (فقط مدیر) ---- */
  if (p.startsWith('/api/users') || p === '/api/backup') {
    if (me.role !== 'admin') return bad(res, 403, 'فقط مدیر دسترسی دارد');
    if (p === '/api/backup' && req.method === 'GET') {
      const rows = q.allDocs.all().map(r => ({ coll: r.coll, id: r.id, data: JSON.parse(r.data), updated_at: r.updated_at, updated_by: r.updated_by }));
      return send(res, 200, { app: 'motalla', exported_at: now(), users: q.users.all().map(pubUser), docs: rows });
    }
    if (p === '/api/users' && req.method === 'GET') return send(res, 200, { users: q.users.all().map(pubUser) });
    if (p === '/api/users' && req.method === 'POST') {
      const b = await readBody(req, 1e5), username = String(b.username || '').trim(), name = String(b.name || '').trim(), role = b.role === 'admin' ? 'admin' : 'staff';
      if (!validUsername(username)) return bad(res, 400, 'نام کاربری باید ۳ تا ۳۲ حرف انگلیسی، عدد، نقطه یا خط تیره باشد');
      if (!name) return bad(res, 400, 'نام کامل را بنویسید');
      if (!validPass(b.password)) return bad(res, 400, 'رمز عبور باید حداقل ۶ کاراکتر باشد');
      if (q.userByName.get(username)) return bad(res, 409, 'این نام کاربری قبلاً ساخته شده است');
      const r = q.addUser.run(username, name.slice(0, 60), hashPass(b.password), role, now());
      return send(res, 200, { user: pubUser(q.userById.get(r.lastInsertRowid)) });
    }
    const um = p.match(/^\/api\/users\/(\d+)$/);
    if (um) {
      const u = q.userById.get(+um[1]); if (!u) return bad(res, 404, 'کاربر پیدا نشد');
      const admins = db.prepare("SELECT COUNT(*) n FROM users WHERE role='admin' AND active=1").get().n;
      if (req.method === 'PATCH') {
        const b = await readBody(req, 1e5);
        if (b.name !== undefined) { const n = String(b.name).trim(); if (!n) return bad(res, 400, 'نام خالی است'); db.prepare('UPDATE users SET name=? WHERE id=?').run(n.slice(0, 60), u.id); }
        if (b.role !== undefined) { const role = b.role === 'admin' ? 'admin' : 'staff'; if (u.role === 'admin' && role !== 'admin' && admins <= 1) return bad(res, 400, 'حداقل یک مدیر لازم است'); db.prepare('UPDATE users SET role=? WHERE id=?').run(role, u.id); }
        if (b.active !== undefined) { const act = b.active ? 1 : 0; if (!act && u.id === me.id) return bad(res, 400, 'نمی‌توانید حساب خودتان را غیرفعال کنید'); if (!act && u.role === 'admin' && admins <= 1) return bad(res, 400, 'حداقل یک مدیر فعال لازم است'); db.prepare('UPDATE users SET active=? WHERE id=?').run(act, u.id); if (!act) q.delUserSessions.run(u.id); }
        if (b.password !== undefined) { if (!validPass(b.password)) return bad(res, 400, 'رمز عبور باید حداقل ۶ کاراکتر باشد'); db.prepare('UPDATE users SET pass=? WHERE id=?').run(hashPass(b.password), u.id); if (u.id !== me.id) q.delUserSessions.run(u.id); }
        return send(res, 200, { user: pubUser(q.userById.get(u.id)) });
      }
      if (req.method === 'DELETE') {
        if (u.id === me.id) return bad(res, 400, 'نمی‌توانید حساب خودتان را حذف کنید');
        if (u.role === 'admin' && admins <= 1) return bad(res, 400, 'حداقل یک مدیر لازم است');
        db.prepare('DELETE FROM users WHERE id=?').run(u.id);
        return send(res, 200, { ok: true });
      }
    }
  }
  return bad(res, 404, 'not found');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(e => { const code = e && e.code >= 400 && e.code < 600 ? e.code : 500; if (code === 500) console.error(e); try { bad(res, code, code === 413 ? 'حجم درخواست زیاد است' : code === 400 ? 'درخواست نامعتبر' : 'خطای سرور'); } catch (_) { } });
});
setInterval(() => { try { q.purgeSessions.run(now()); } catch (e) { } }, 6 * 3600e3).unref();
try { fs.watch(path.join(ROOT, 'index.html'), () => setTimeout(appVersion, 200)); } catch (e) { }
if (require.main === module) server.listen(PORT, process.env.HOST || '0.0.0.0', () => console.log('motalla server on :' + PORT + ' data=' + DATA_DIR + ' app=' + APP_VER));
module.exports = { server, merge3, db };
