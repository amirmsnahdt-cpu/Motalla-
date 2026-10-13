# بده بستون (اپ واریزی مطلا)

Single-page PWA for the gold shop مطلا: deposits, split into bank sources, tracking, customer accounts.
UI is Persian/RTL. Owner writes Persian; reply in Persian.

## Files
- `index.html` — shell only (~5KB): meta, boot/update-swap script, `const APP_V`, links to the two files below.
- `styles.css` — all app CSS. Later rules override earlier ones; new overrides go at the END.
- `app.js` — all app JS (one classic script, globals). Later sections redefine earlier functions
  (blocks marked `/* ---------- v21/v22/v28 ... */`), so always edit the LAST definition:
  `grep -n "function NAME\|NAME=" app.js | tail -1`.
- `server/server.js` — Node server on Liara. Serves only paths listed in `STATIC`; add new static files there.
- `sw.js` — network-first service worker.
- `android/` — WebView shell (loads the Liara URL). Icons in `android/app/src/main/res/mipmap-*`.

## app.js map
- render(): view table `R={view:[vX,aX]}`; navigate with `go('view')`. Actions: `ACT.name` + `data-act="name"`.
- Permissions: `PERM_OF`. Data: `validated()`, `PD(x)` (pay date), `drafts[date]`, `batches`, `stOf(id)`.
- Split/allocation: `parts()`, `allocMap()`, `spTab` ('split'|'lists'|'arch'), `splitAuto()`.
- Lists: `listsData()`, `listCard`, `vLday`. Home: `homeRow`, `homeP`.
- Settlements: `e.settles` (`st:'wait'|'ok'`), `stlTx`/`stlUntx`. Receipts: `imgPut/imgGet`, `rcStamp`.
- Bank ledger: `acEst`, `acSent`, `acFree`, `posNight`.
- Section headers are `/* ---------- title ---------- */` — `grep -n "/\* ----" app.js` for a map.

## Workflow
1. Edit with targeted greps; don't read whole files.
2. `python3 tools/bump.py <new version>` (updates APP_V, boot V, cache-busting `?v=`).
3. Smoke test in Playwright (open index.html via file://, check no `pageerror`).
4. Commit, push to main, send the user:
   `https://raw.githack.com/amirmsnahdt-cpu/Motalla-/<SHA>/index.html`
5. Production deploy runs nightly 00:05 Tehran (`.github/workflows/deploy-liara.yml`).
   Manual: `gh workflow run deploy-liara.yml --ref main -R amirmsnahdt-cpu/Motalla-`.

## Rules from the owner
- Root-cause fixes, no leftover bugs. Simple iOS-like blue UI, rounded cards, bold amounts.
- Status frames: green settled, yellow pending, red unconfirmed — one clean rounded border, no halo.
- Repo is public: never commit customer data, phone numbers or national IDs. Liara token lives only in GitHub secrets.

## In-app update (careful)
- Production: client polls `/api/status` (version read from `const APP_V` in index.html) and reloads.
- githack: client fetches `<sha>/index.html`, rewrites `app.js`/`styles.css` to that sha's absolute URL,
  stores it in localStorage, and the boot script swaps it in. Any new file loaded by index.html must be
  added to that rewrite regex in `checkUpdate` and to `STATIC` in server.js.
