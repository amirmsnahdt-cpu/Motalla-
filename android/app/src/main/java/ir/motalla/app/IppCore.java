package ir.motalla.app;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * چاپ مستقیم از خود برنامه روی چاپگر وای‌فای (v100.2) — بخش بدون اندروید (با javac جدا تست می‌شود):
 * پروتکل IPP (همان که سرویس چاپ اندروید/Mopria و AirPrint استفاده می‌کنند) روی HTTP ساده، و ساختن داده چاپ
 * به شکل PWG Raster (استاندارد IPP Everywhere) یا URF (اپل) از پیکسل‌های صفحه، بدون هیچ کوچک‌کردن: صفحه همان اندازه کاغذ است.
 */
public final class IppCore {
    private IppCore() { }

    /* ---------- IPP: ساختن درخواست ---------- */
    public static final int OP_PRINT_JOB = 0x0002, OP_GET_PRINTER_ATTRIBUTES = 0x000B;
    static final int T_OP = 0x01, T_JOB = 0x02, T_END = 0x03, T_PRINTER = 0x04;
    static final int V_INT = 0x21, V_BOOL = 0x22, V_ENUM = 0x23, V_RES = 0x32, V_RANGE = 0x33, V_BEGCOL = 0x34, V_ENDCOL = 0x37,
        V_TEXTLANG = 0x35, V_NAMELANG = 0x36, V_TEXT = 0x41, V_NAME = 0x42, V_KEYWORD = 0x44, V_URI = 0x45, V_CHARSET = 0x47,
        V_LANG = 0x48, V_MIME = 0x49, V_MEMBER = 0x4A;

    public static final class Req {
        private final ByteArrayOutputStream b = new ByteArrayOutputStream();
        public Req(int op, int id) { b.write(2); b.write(0); u16(op); u32(id); }
        private void u16(int v) { b.write((v >> 8) & 255); b.write(v & 255); }
        private void u32(int v) { b.write((v >>> 24) & 255); b.write((v >> 16) & 255); b.write((v >> 8) & 255); b.write(v & 255); }
        public Req group(int tag) { b.write(tag); return this; }
        private void head(int tag, String name) { byte[] n = name.getBytes(StandardCharsets.UTF_8); b.write(tag); u16(n.length); b.write(n, 0, n.length); }
        public Req str(int tag, String name, String... vals) {
            for (int i = 0; i < vals.length; i++) {
                head(tag, i == 0 ? name : "");
                byte[] v = vals[i].getBytes(StandardCharsets.UTF_8); u16(v.length); b.write(v, 0, v.length);
            }
            return this;
        }
        public Req num(int tag, String name, int v) { head(tag, name); u16(4); u32(v); return this; }
        public byte[] end() { b.write(T_END); return b.toByteArray(); }
    }

    /** پاسخ IPP: وضعیت + ویژگی‌ها (نام ← فهرست مقدار متنی). ویژگی‌های مجموعه‌ای (collection) نادیده گرفته می‌شوند. */
    public static final class Resp {
        public int status = -1;
        public final Map<String, List<String>> attrs = new LinkedHashMap<>();
        public List<String> get(String k) { List<String> l = attrs.get(k); return l == null ? new ArrayList<>() : l; }
        public String one(String k) { List<String> l = attrs.get(k); return l == null || l.isEmpty() ? "" : l.get(0); }
        public boolean ok() { return status >= 0 && status < 0x0100; }
    }

    public static Resp parse(byte[] d) throws IOException {
        Resp r = new Resp();
        if (d.length < 8) throw new IOException("short ipp response");
        r.status = ((d[2] & 255) << 8) | (d[3] & 255);
        int p = 8, depth = 0;
        String last = null;
        while (p < d.length) {
            int tag = d[p++] & 255;
            if (tag == T_END) break;
            if (tag < 0x10) { last = null; continue; }
            if (p + 2 > d.length) break;
            int nl = ((d[p] & 255) << 8) | (d[p + 1] & 255); p += 2;
            String name = new String(d, p, Math.min(nl, d.length - p), StandardCharsets.UTF_8); p += nl;
            if (p + 2 > d.length) break;
            int vl = ((d[p] & 255) << 8) | (d[p + 1] & 255); p += 2;
            if (p + vl > d.length) break;
            int vs = p; p += vl;
            if (tag == V_BEGCOL) { if (depth == 0 && nl > 0) last = null; depth++; continue; }
            if (tag == V_ENDCOL) { if (depth > 0) depth--; continue; }
            if (depth > 0) continue;
            if (nl > 0) last = name;
            if (last == null) continue;
            String v;
            switch (tag) {
                case V_INT: case V_ENUM: v = vl == 4 ? String.valueOf(i32(d, vs)) : ""; break;
                case V_BOOL: v = vl > 0 && d[vs] != 0 ? "true" : "false"; break;
                case V_RES: v = vl == 9 ? i32(d, vs) + "x" + i32(d, vs + 4) + (d[vs + 8] == 3 ? "dpi" : "dpcm") : ""; break;
                case V_RANGE: v = vl == 8 ? i32(d, vs) + "-" + i32(d, vs + 4) : ""; break;
                case V_TEXTLANG: case V_NAMELANG: {
                    int ll = ((d[vs] & 255) << 8) | (d[vs + 1] & 255), tl = ((d[vs + 2 + ll] & 255) << 8) | (d[vs + 3 + ll] & 255);
                    v = new String(d, vs + 4 + ll, tl, StandardCharsets.UTF_8); break;
                }
                default: v = new String(d, vs, vl, StandardCharsets.UTF_8);
            }
            List<String> l = r.attrs.get(last);
            if (l == null) { l = new ArrayList<>(); r.attrs.put(last, l); }
            l.add(v);
        }
        return r;
    }

    static int i32(byte[] d, int p) { return ((d[p] & 255) << 24) | ((d[p + 1] & 255) << 16) | ((d[p + 2] & 255) << 8) | (d[p + 3] & 255); }

    /* ---------- HTTP ساده (سوکت؛ چاپگر داخل شبکه مغازه است و HTTPS ندارد) ---------- */
    public interface Body { long length(); void write(OutputStream o) throws IOException; }

    public static Resp post(String host, int port, String path, byte[] head, Body doc, int timeoutMs) throws IOException {
        long len = head.length + (doc == null ? 0 : doc.length());
        try (Socket s = new Socket()) {
            s.connect(new InetSocketAddress(host, port), Math.min(timeoutMs, 8000));
            s.setSoTimeout(timeoutMs);
            OutputStream o = new java.io.BufferedOutputStream(s.getOutputStream(), 65536);
            String h = "POST /" + path.replaceFirst("^/+", "") + " HTTP/1.1\r\nHost: " + (host.contains(":") ? "[" + host + "]" : host) + ":" + port
                + "\r\nContent-Type: application/ipp\r\nContent-Length: " + len + "\r\nUser-Agent: Motalla\r\nConnection: close\r\n\r\n";
            o.write(h.getBytes(StandardCharsets.US_ASCII));
            o.write(head);
            if (doc != null) doc.write(o);
            o.flush();
            return parse(httpBody(s.getInputStream()));
        }
    }

    static String line(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        int c;
        while ((c = in.read()) >= 0) { if (c == '\n') break; if (c != '\r') sb.append((char) c); }
        if (c < 0 && sb.length() == 0) throw new IOException("connection closed");
        return sb.toString();
    }

    static byte[] httpBody(InputStream raw) throws IOException {
        InputStream in = new java.io.BufferedInputStream(raw);
        String st;
        int code;
        long cl;
        boolean chunked;
        while (true) {
            st = line(in);
            String[] sp = st.split(" ");
            code = sp.length > 1 ? Integer.parseInt(sp[1].trim()) : 0;
            cl = -1; chunked = false;
            String hl;
            while (!(hl = line(in)).isEmpty()) {
                String k = hl.toLowerCase(java.util.Locale.ROOT);
                if (k.startsWith("content-length:")) cl = Long.parseLong(k.substring(15).trim());
                else if (k.startsWith("transfer-encoding:") && k.contains("chunked")) chunked = true;
            }
            if (code != 100) break;
        }
        if (code != 200) throw new IOException("HTTP " + code);
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        byte[] buf = new byte[8192];
        if (chunked) {
            while (true) {
                String sz = line(in).split(";")[0].trim();
                int n = sz.isEmpty() ? 0 : Integer.parseInt(sz, 16);
                if (n == 0) break;
                while (n > 0) { int r = in.read(buf, 0, Math.min(buf.length, n)); if (r < 0) throw new IOException("eof"); b.write(buf, 0, r); n -= r; }
                line(in);
            }
        } else if (cl >= 0) {
            long n = cl;
            while (n > 0) { int r = in.read(buf, 0, (int) Math.min(buf.length, n)); if (r < 0) break; b.write(buf, 0, r); n -= r; }
        } else {
            int r;
            while ((r = in.read(buf)) >= 0) b.write(buf, 0, r);
        }
        return b.toByteArray();
    }

    /* ---------- درخواست‌های آماده ---------- */
    public static String uri(String host, int port, String path) {
        return "ipp://" + (host.contains(":") ? "[" + host + "]" : host) + ":" + port + "/" + path.replaceFirst("^/+", "");
    }

    public static Resp printerInfo(String host, int port, String path) throws IOException {
        byte[] q = new Req(OP_GET_PRINTER_ATTRIBUTES, 1).group(T_OP)
            .str(V_CHARSET, "attributes-charset", "utf-8").str(V_LANG, "attributes-natural-language", "en")
            .str(V_URI, "printer-uri", uri(host, port, path)).str(V_NAME, "requesting-user-name", "motalla")
            .str(V_KEYWORD, "requested-attributes", "printer-description", "job-template", "media-col-database")
            .end();
        return post(host, port, path, q, null, 15000);
    }

    /** یک کار چاپ: fmt = image/pwg-raster | image/urf | application/pdf | image/jpeg */
    public static Resp printJob(String host, int port, String path, String fmt, String title, String media, int copies, boolean color, Body doc) throws IOException {
        Req q = new Req(OP_PRINT_JOB, 2).group(T_OP)
            .str(V_CHARSET, "attributes-charset", "utf-8").str(V_LANG, "attributes-natural-language", "en")
            .str(V_URI, "printer-uri", uri(host, port, path)).str(V_NAME, "requesting-user-name", "motalla")
            .str(V_NAME, "job-name", title == null || title.isEmpty() ? "Motalla" : title)
            .str(V_MIME, "document-format", fmt);
        q.group(T_JOB);
        if (copies > 1) q.num(V_INT, "copies", copies);
        if (media != null && !media.isEmpty()) q.str(V_KEYWORD, "media", media);
        q.str(V_KEYWORD, "sides", "one-sided");
        q.str(V_KEYWORD, "print-color-mode", color ? "color" : "monochrome");
        if (!fmt.startsWith("image/pwg") && !fmt.equals("image/urf")) q.str(V_KEYWORD, "print-scaling", "none");
        return post(host, port, path, q.end(), doc, 120000);
    }

    /* ---------- داده چاپ (raster) ---------- */
    /** پیکسل‌های صفحه (ARGB) سطر به سطر؛ پیاده‌سازی اندروید از Bitmap می‌خواند */
    public interface Page { int width(); int height(); void row(int y, int[] out); }

    /** PWG Raster (PWG 5102.4): سرصفحه ۱۷۹۶ بایتی + سطرها با فشرده‌سازی PackBits؛ gray = sgray_8 وگرنه srgb_8 */
    public static void writePwg(OutputStream o, List<Page> pages, int dpi, boolean gray, String sizeName, int ptW, int ptH) throws IOException {
        o.write("RaS2".getBytes(StandardCharsets.US_ASCII));
        for (Page pg : pages) {
            int w = pg.width(), h = pg.height(), bpp = gray ? 1 : 3;
            byte[] hd = new byte[1796];
            putS(hd, 0, "PwgRaster");
            putI(hd, 276, dpi); putI(hd, 280, dpi);
            putI(hd, 340, 1);
            putI(hd, 352, ptW); putI(hd, 356, ptH);
            putI(hd, 372, w); putI(hd, 376, h);
            putI(hd, 384, 8); putI(hd, 388, 8 * bpp); putI(hd, 392, w * bpp);
            putI(hd, 396, 0); putI(hd, 400, gray ? 18 : 19);
            putI(hd, 420, bpp);
            putI(hd, 452, pages.size());
            putI(hd, 456, 1); putI(hd, 460, 1);
            putI(hd, 464, 0); putI(hd, 468, 0); putI(hd, 472, w); putI(hd, 476, h);
            putS(hd, 1732, sizeName == null ? "" : sizeName);
            o.write(hd);
            rows(o, pg, gray, false);
        }
    }

    /** URF (Apple Raster) برای چاپگرهای AirPrint: سرآغاز UNIRAST + سرصفحه ۳۲ بایتی؛ W8 یا SRGB24 */
    public static void writeUrf(OutputStream o, List<Page> pages, int dpi, boolean gray) throws IOException {
        byte[] fh = new byte[12];
        System.arraycopy("UNIRAST".getBytes(StandardCharsets.US_ASCII), 0, fh, 0, 7);
        putI(fh, 8, pages.size());
        o.write(fh);
        for (Page pg : pages) {
            byte[] hd = new byte[32];
            hd[0] = (byte) (gray ? 8 : 24);
            hd[1] = (byte) (gray ? 0 : 1);
            hd[2] = 1; /* یک‌رو */
            hd[3] = 4; /* کیفیت معمولی */
            putI(hd, 12, pg.width()); putI(hd, 16, pg.height()); putI(hd, 20, dpi);
            o.write(hd);
            rows(o, pg, gray, true);
        }
    }

    static void putI(byte[] b, int p, int v) { b[p] = (byte) (v >>> 24); b[p + 1] = (byte) (v >> 16); b[p + 2] = (byte) (v >> 8); b[p + 3] = (byte) v; }
    static void putS(byte[] b, int p, String s) { byte[] x = s.getBytes(StandardCharsets.US_ASCII); System.arraycopy(x, 0, b, p, Math.min(x.length, 63)); }

    /** سطرها: بایت تکرار سطر (۰ تا ۲۵۵ سطر یکسان بعدی) + PackBits پیکسلی (۰..۱۲۷ = n+1 تکرار، ۱۲۹..۲۵۵ = 257−n پیکسل جدا) */
    static void rows(OutputStream o, Page pg, boolean gray, boolean urf) throws IOException {
        int w = pg.width(), h = pg.height(), bpp = gray ? 1 : 3;
        int[] argb = new int[w];
        byte[] cur = new byte[w * bpp], nxt = new byte[w * bpp];
        ByteArrayOutputStream enc = new ByteArrayOutputStream(w * bpp + w / 64 + 8);
        pg.row(0, argb); px(argb, cur, gray);
        int y = 0;
        while (y < h) {
            int rep = 0;
            while (y + rep + 1 < h && rep < 255) {
                pg.row(y + rep + 1, argb); px(argb, nxt, gray);
                if (!java.util.Arrays.equals(cur, nxt)) break;
                rep++;
            }
            o.write(rep);
            enc.reset(); pack(cur, w, bpp, enc); enc.writeTo(o);
            y += rep + 1;
            if (y < h) {
                /* سطر بعدی که فرق داشت قبلاً در nxt خوانده شده (مگر اینکه به سقف ۲۵۵ رسیده باشیم) */
                if (rep == 255) { pg.row(y, argb); px(argb, cur, gray); }
                else { byte[] t = cur; cur = nxt; nxt = t; }
            }
        }
    }

    static void px(int[] a, byte[] out, boolean gray) {
        if (gray) {
            for (int i = 0; i < a.length; i++) {
                int c = a[i], al = (c >>> 24), r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
                if (al < 255) { r = 255 - ((255 - r) * al) / 255; g = 255 - ((255 - g) * al) / 255; b = 255 - ((255 - b) * al) / 255; }
                out[i] = (byte) ((r * 299 + g * 587 + b * 114 + 500) / 1000);
            }
        } else {
            for (int i = 0, j = 0; i < a.length; i++, j += 3) {
                int c = a[i], al = (c >>> 24), r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
                if (al < 255) { r = 255 - ((255 - r) * al) / 255; g = 255 - ((255 - g) * al) / 255; b = 255 - ((255 - b) * al) / 255; }
                out[j] = (byte) r; out[j + 1] = (byte) g; out[j + 2] = (byte) b;
            }
        }
    }

    static boolean same(byte[] s, int a, int b, int bpp) { for (int k = 0; k < bpp; k++) if (s[a * bpp + k] != s[b * bpp + k]) return false; return true; }

    static void pack(byte[] s, int w, int bpp, ByteArrayOutputStream o) {
        int i = 0;
        while (i < w) {
            if (i + 1 < w && same(s, i, i + 1, bpp)) {
                int n = 2;
                while (i + n < w && n < 128 && same(s, i, i + n, bpp)) n++;
                o.write(n - 1); o.write(s, i * bpp, bpp); i += n;
            } else {
                int n = 1;
                while (i + n < w && n < 128 && !(i + n + 1 < w && same(s, i + n, i + n + 1, bpp))) n++;
                if (n == 1) { o.write(0); o.write(s, i * bpp, bpp); }
                else { o.write(257 - n); o.write(s, i * bpp, n * bpp); }
                i += n;
            }
        }
    }

    /** شمارش بایت‌ها بدون نگه داشتن داده (برای Content-Length) */
    public static final class Count extends OutputStream {
        public long n;
        @Override public void write(int b) { n++; }
        @Override public void write(byte[] b, int off, int len) { n += len; }
    }
}
