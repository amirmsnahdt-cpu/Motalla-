package ir.motalla.app;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * v100.2 چاپ مستقیم از خود برنامه (صاحب اپ: «چاپ و وصل شدن به پرینتر هم از خود برنامه صورت بگیرد»):
 * پیدا کردن چاپگرهای وای‌فای شبکه مغازه (DNS-SD «_ipp._tcp»)، پرسیدن توانایی‌های چاپگر و فرستادن صفحه‌ها با IPP (IppCore).
 * هیچ پنجره چاپ اندروید و هیچ کوچک‌کردنی در کار نیست: صفحه‌ها با اندازه دقیق کاغذ ساخته می‌شوند (در صفحه وب) و همان‌طور چاپ می‌شوند.
 * نتیجه‌ها با emit به صفحه وب برمی‌گردد: window.__prn(kind, data)
 */
final class DirectPrint {
    interface Emit { void emit(String kind, String json); }

    private final Context ctx;
    private final Emit out;
    private final Handler ui = new Handler(Looper.getMainLooper());
    private NsdManager nsd;
    private NsdManager.DiscoveryListener disc;
    private final ArrayDeque<NsdServiceInfo> queue = new ArrayDeque<>();
    private boolean resolving;
    private final Map<String, JSONObject> found = new LinkedHashMap<>();
    private volatile boolean busy;

    DirectPrint(Context c, Emit e) { ctx = c; out = e; }

    /* ---------- پیدا کردن چاپگرها ---------- */
    synchronized void find(int ms) {
        stopFind();
        found.clear();
        queue.clear();
        resolving = false;
        try {
            nsd = (NsdManager) ctx.getSystemService(Context.NSD_SERVICE);
            disc = new NsdManager.DiscoveryListener() {
                @Override public void onDiscoveryStarted(String t) { }
                @Override public void onDiscoveryStopped(String t) { }
                @Override public void onStartDiscoveryFailed(String t, int code) { done("discovery failed " + code); }
                @Override public void onStopDiscoveryFailed(String t, int code) { }
                @Override public void onServiceLost(NsdServiceInfo s) { }
                @Override public void onServiceFound(NsdServiceInfo s) { synchronized (DirectPrint.this) { queue.add(s); next(); } }
            };
            nsd.discoverServices("_ipp._tcp", NsdManager.PROTOCOL_DNS_SD, disc);
        } catch (Exception e) { done("discovery error"); return; }
        ui.postDelayed(() -> done(null), Math.max(2000, Math.min(ms, 15000)));
    }

    private synchronized void next() {
        if (resolving || nsd == null) return;
        final NsdServiceInfo s = queue.poll();
        if (s == null) return;
        resolving = true;
        try {
            nsd.resolveService(s, new NsdManager.ResolveListener() {
                @Override public void onResolveFailed(NsdServiceInfo i, int code) { synchronized (DirectPrint.this) { resolving = false; if (code == NsdManager.FAILURE_ALREADY_ACTIVE) queue.add(s); } ui.postDelayed(DirectPrint.this::next, 150); }
                @Override public void onServiceResolved(NsdServiceInfo i) { add(i); synchronized (DirectPrint.this) { resolving = false; } ui.post(DirectPrint.this::next); }
            });
        } catch (Exception e) { resolving = false; }
    }

    private void add(NsdServiceInfo i) {
        try {
            InetAddress a = i.getHost();
            if (a == null) return;
            String host = a.getHostAddress();
            if (host == null) return;
            int pc = host.indexOf('%');
            if (pc > 0) host = host.substring(0, pc);
            Map<String, byte[]> tx = i.getAttributes();
            JSONObject o = new JSONObject();
            o.put("n", i.getServiceName());
            o.put("h", host);
            o.put("p", i.getPort());
            o.put("rp", txt(tx, "rp", "ipp/print"));
            o.put("ty", txt(tx, "ty", ""));
            o.put("c", "T".equalsIgnoreCase(txt(tx, "Color", "")));
            o.put("pdl", txt(tx, "pdl", ""));
            synchronized (this) { found.put(host + ":" + i.getPort() + "/" + o.getString("rp"), o); }
            out.emit("found", o.toString());
        } catch (Exception ignored) { }
    }

    private static String txt(Map<String, byte[]> m, String k, String d) {
        if (m == null) return d;
        for (Map.Entry<String, byte[]> e : m.entrySet()) if (e.getKey().equalsIgnoreCase(k) && e.getValue() != null) return new String(e.getValue(), StandardCharsets.UTF_8);
        return d;
    }

    private synchronized void done(String err) {
        if (disc == null) return;
        stopFind();
        JSONArray a = new JSONArray();
        for (JSONObject o : found.values()) a.put(o);
        JSONObject r = new JSONObject();
        try { r.put("list", a); if (err != null) r.put("err", err); } catch (Exception ignored) { }
        out.emit("list", r.toString());
    }

    synchronized void stopFind() {
        if (nsd != null && disc != null) { try { nsd.stopServiceDiscovery(disc); } catch (Exception ignored) { } }
        disc = null;
    }

    /* ---------- توانایی‌های چاپگر ---------- */
    void info(final String host, final int port, final String path) {
        new Thread(() -> {
            JSONObject r = new JSONObject();
            try {
                r.put("h", host); r.put("p", port); r.put("rp", path);
                IppCore.Resp p = IppCore.printerInfo(host, port, path);
                r.put("ok", p.ok());
                r.put("status", p.status);
                r.put("name", p.one("printer-name"));
                r.put("model", p.one("printer-make-and-model"));
                r.put("info", p.one("printer-info"));
                r.put("state", p.one("printer-state"));
                r.put("reasons", new JSONArray(p.get("printer-state-reasons")));
                r.put("formats", new JSONArray(p.get("document-format-supported")));
                r.put("pwgRes", new JSONArray(p.get("pwg-raster-document-resolution-supported")));
                r.put("pwgTypes", new JSONArray(p.get("pwg-raster-document-type-supported")));
                r.put("urf", new JSONArray(p.get("urf-supported")));
                r.put("color", "true".equals(p.one("color-supported")));
                r.put("media", new JSONArray(p.get("media-supported")));
                r.put("ready", new JSONArray(p.get("media-ready")));
                r.put("mediaDef", p.one("media-default"));
                r.put("scaling", new JSONArray(p.get("print-scaling-supported")));
            } catch (Exception e) {
                try { r.put("ok", false); r.put("err", String.valueOf(e.getMessage())); } catch (Exception ignored) { }
            }
            out.emit("info", r.toString());
        }).start();
    }

    /* ---------- چاپ ---------- */
    /** j: {h,p,rp,fmt,dpi,gray,media,ptW,ptH,copies,title,pages:[base64 تصویر صفحه با اندازه دقیق کاغذ],pdf:base64} */
    boolean print(final String json) {
        if (busy) return false;
        busy = true;
        new Thread(() -> {
            JSONObject r = new JSONObject();
            try {
                JSONObject j = new JSONObject(json);
                final String host = j.getString("h"), path = j.optString("rp", "ipp/print"), fmt = j.optString("fmt", "image/pwg-raster"), media = j.optString("media", ""), title = j.optString("title", "Motalla");
                final int port = j.optInt("p", 631), dpi = j.optInt("dpi", 300), copies = j.optInt("copies", 1);
                final boolean gray = j.optBoolean("gray", true);
                JSONArray pg = j.optJSONArray("pages");
                out.emit("stage", "{\"s\":\"prep\"}");
                List<IppCore.Resp> res = new ArrayList<>();
                if (fmt.equals("application/pdf")) {
                    byte[] pdf = Base64.decode(j.getString("pdf"), Base64.DEFAULT);
                    out.emit("stage", "{\"s\":\"send\"}");
                    res.add(IppCore.printJob(host, port, path, fmt, title, media, copies, !gray, bytes(pdf)));
                } else if (fmt.equals("image/jpeg")) {
                    for (int i = 0; i < pg.length(); i++) {
                        out.emit("stage", "{\"s\":\"send\",\"i\":" + i + "}");
                        res.add(IppCore.printJob(host, port, path, fmt, title, media, copies, !gray, bytes(Base64.decode(pg.getString(i), Base64.DEFAULT))));
                    }
                } else {
                    final int wpx = (int) Math.round(j.getDouble("mmW") / 25.4 * dpi), hpx = (int) Math.round(j.getDouble("mmH") / 25.4 * dpi);
                    List<IppCore.Page> pages = new ArrayList<>();
                    for (int i = 0; i < pg.length(); i++) pages.add(new BmpPage(pg.getString(i), wpx, hpx));
                    ByteArrayOutputStream b = new ByteArrayOutputStream(1 << 20);
                    if (fmt.equals("image/urf")) IppCore.writeUrf(b, pages, dpi, gray);
                    else IppCore.writePwg(b, pages, dpi, gray, j.optString("media", ""), j.optInt("ptW"), j.optInt("ptH"));
                    out.emit("stage", "{\"s\":\"send\"}");
                    res.add(IppCore.printJob(host, port, path, fmt, title, media, copies, !gray, bytes(b.toByteArray())));
                }
                boolean ok = true;
                int st = 0;
                for (IppCore.Resp p : res) if (!p.ok()) { ok = false; st = p.status; }
                r.put("ok", ok);
                r.put("status", st);
                if (!res.isEmpty()) r.put("job", res.get(0).one("job-id"));
            } catch (OutOfMemoryError e) {
                try { r.put("ok", false); r.put("err", "memory"); } catch (Exception ignored) { }
            } catch (Exception e) {
                try { r.put("ok", false); r.put("err", String.valueOf(e.getMessage())); } catch (Exception ignored) { }
            } finally {
                busy = false;
            }
            out.emit("done", r.toString());
        }).start();
        return true;
    }

    private static IppCore.Body bytes(final byte[] d) {
        return new IppCore.Body() {
            @Override public long length() { return d.length; }
            @Override public void write(OutputStream o) throws IOException { o.write(d); }
        };
    }

    /** صفحه از تصویر (JPEG/PNG)؛ وقتی اندازه با کاغذ فرق دارد کشیده می‌شود. تصویر فقط موقع نوشتن همان صفحه باز می‌شود و بعد آزاد می‌شود. */
    private static final class BmpPage implements IppCore.Page {
        private final String b64;
        private final int w, h;
        private Bitmap bmp;
        BmpPage(String b64, int w, int h) { this.b64 = b64; this.w = w; this.h = h; }
        @Override public int width() { return w; }
        @Override public int height() { return h; }
        @Override public void row(int y, int[] o) {
            if (bmp == null) {
                byte[] d = Base64.decode(b64, Base64.DEFAULT);
                Bitmap s = BitmapFactory.decodeByteArray(d, 0, d.length);
                if (s == null) throw new IllegalStateException("bad page image");
                bmp = s.getWidth() == w && s.getHeight() == h ? s : Bitmap.createScaledBitmap(s, w, h, true);
                if (bmp != s) s.recycle();
            }
            bmp.getPixels(o, 0, w, 0, y, w, 1);
            if (y == h - 1) { bmp.recycle(); bmp = null; }
        }
    }
}
