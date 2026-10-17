/* تست مرورگر (Playwright): سرور را با داده موقت بالا می‌آورد، با یک مدیر آزمایشی وارد می‌شود،
   چند واریزی ساختگی می‌سازد و همه صفحه‌ها را باز می‌کند؛ هر خطای جاوااسکریپت = شکست.
   اجرا: node tests/smoke.mjs        (نیاز: پکیج playwright و مرورگر chromium)
   SMOKE_DARK=1 و SMOKE_WIDTH=700 حالت تیره و عرض دیگر را می‌آزمایند.
   با --styles out.json سبک محاسبه‌شده همه عناصر هر صفحه را هم ذخیره می‌کند (برای مقایسه CSS قبل/بعد). */
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'motalla-smoke-'));
const PORT = 3900 + Math.floor(Math.random() * 90), BASE = 'http://127.0.0.1:' + PORT;
const si = process.argv.indexOf('--styles'), STYLES = si > 0 ? process.argv[si + 1] : null;
const VIEWS = ['home', 'find', 'entry', 'bulk', 'list', 'lday', 'split1', 'split3', 'srcview', 'part', 'track', 'batch', 'day',
  'ent', 'buy', 'banks', 'custs', 'cust', 'debt', 'cred', 'cwiz', 'pwiz', 'audit', 'users', 'settings', 'backups'];

const srv = spawn(process.execPath, ['--experimental-sqlite', '--disable-warning=ExperimentalWarning', 'server/server.js'],
  { cwd: ROOT, env: { ...process.env, DATA_DIR: DATA, PORT: String(PORT), HOST: '127.0.0.1' }, stdio: 'inherit' });
const fail = [];
let browser;
try {
  for (let i = 0; ; i++) { try { if ((await fetch(BASE + '/api/status')).ok) break; } catch (e) { } if (i > 50) throw new Error('server did not start'); await new Promise(r => setTimeout(r, 200)); }
  const s = await (await fetch(BASE + '/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'tester', name: 'آزمایش', password: 'secret123' }) })).json();
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +(process.env.SMOKE_WIDTH || 390), height: 844 }, colorScheme: process.env.SMOKE_DARK ? 'dark' : 'light', locale: 'fa-IR', timezoneId: 'Asia/Tehran' });
  page.on('pageerror', e => fail.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) fail.push('console: ' + m.text()); });
  await page.addInitScript(([t, u]) => { if (!localStorage.getItem('m_token')) { localStorage.setItem('m_token', t); localStorage.setItem('m_me', JSON.stringify(u)); } }, [s.token, s.user]);
  await page.goto(BASE + '/index.html'); await page.waitForTimeout(1500);
  // داده ساختگی (بدون اطلاعات واقعی مشتری)
  await page.evaluate(() => {
    const t = new Date().toISOString();
    for (let i = 1; i <= 4; i++) entries.push({ id: nid++, name: 'مشتری آزمایشی ' + i, code: '', amount: i * 1500000, card: '', bank: '', iban: '', title: '', settles: [], payDate: dateVal, entryDate: dateVal, createdBy: who(), updatedBy: who(), updatedAt: t });
    saveE(); render();
  });
  await page.waitForTimeout(500);
  const out = {};
  for (const v of VIEWS) {
    await page.evaluate(n => { try { if (typeof closeSheet === 'function') closeSheet() } catch (e) { } go(n) }, v).catch(e => fail.push(v + ': ' + e.message));
    await page.waitForTimeout(STYLES ? 1200 : 450);
    if (STYLES) out[v] = await page.evaluate(() => {
      const props = [...getComputedStyle(document.body)].filter(p => !p.startsWith('--') && !/^(transition|animation)/.test(p));
      return [...document.querySelectorAll('body *')].map(el => { const c = getComputedStyle(el); return el.tagName + '.' + el.className + '|' + props.map(p => c.getPropertyValue(p)).join(';'); });
    });
  }
  if (STYLES) fs.writeFileSync(STYLES, JSON.stringify(out));
} catch (e) { fail.push(String(e && e.stack || e)); }
finally { if (browser) await browser.close(); srv.kill(); fs.rmSync(DATA, { recursive: true, force: true }); }
if (fail.length) { console.error('SMOKE FAILED:\n' + [...new Set(fail)].join('\n')); process.exit(1); }
console.log('smoke ok: ' + VIEWS.length + ' صفحه بدون خطا');
