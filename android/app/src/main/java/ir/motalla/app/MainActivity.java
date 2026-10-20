package ir.motalla.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.SharedPreferences;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyPermanentlyInvalidatedException;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** پوسته اندروید مطلا: برنامه وب را از سرور باز می‌کند و ذخیره فایل، چاپ و انتخاب عکس را فراهم می‌کند. */
public class MainActivity extends Activity {
    private static final int FILE_REQ = 1001;
    private WebView web;
    private WebView printView;
    private ValueCallback<Uri[]> fileCb;
    private String serverUrl;
    private final Handler ui = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        serverUrl = getString(R.string.server_url);
        boolean night = isSystemNight();
        web = new WebView(this);
        applyBars(night ? "#0A1222" : "#F5F6F8", night);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setSupportZoom(false);
        s.setTextZoom(100);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " MotallaAndroid/1.0");

        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                String host = Uri.parse(serverUrl).getHost();
                if (host != null && host.equalsIgnoreCase(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }
        });
        // دانلود فایل (مثل نسخه جدید اپ) به مرورگر گوشی سپرده می‌شود
        web.setDownloadListener((url, ua, cd, mime, len) -> {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { toast("مرورگری برای دانلود پیدا نشد"); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try {
                    startActivityForResult(params.createIntent(), FILE_REQ);
                } catch (Exception e) {
                    fileCb = null;
                    toast("انتخاب فایل در این گوشی ممکن نیست");
                    return false;
                }
                return true;
            }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl(serverUrl);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == FILE_REQ && fileCb != null) {
            fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCb = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        // برنامه وب تصمیم می‌گیرد: بستن پنجره، رفتن به صفحه قبل، یا خروج از خانه
        web.evaluateJavascript("(window.__androidBack&&window.__androidBack())?'1':'0'", v -> {
            if (!"\"1\"".equals(v)) super.onBackPressed();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    private boolean isSystemNight() {
        return (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
    }

    /** رنگ نوار وضعیت (بالا) و نوار ناوبری (دکمه‌های برگشت/خانه) را هم‌رنگ برنامه می‌کند */
    private void applyBars(String hex, boolean dark) {
        int c;
        try { c = Color.parseColor(hex); } catch (Exception e) { c = Color.parseColor(dark ? "#0A1222" : "#F5F6F8"); }
        Window w = getWindow();
        w.setStatusBarColor(c);
        View d = w.getDecorView();
        int f = d.getSystemUiVisibility();
        if (dark) f &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR; else f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (Build.VERSION.SDK_INT >= 26) {
            w.setNavigationBarColor(c);
            if (dark) f &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR; else f |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            if (Build.VERSION.SDK_INT >= 28) w.setNavigationBarDividerColor(dark ? Color.parseColor("#1B2641") : Color.parseColor("#E7E9EF"));
        } else {
            // اندروید ۷: آیکون تیره در نوار ناوبری پشتیبانی نمی‌شود، پس نوار تیره می‌ماند تا دکمه‌ها دیده شوند
            w.setNavigationBarColor(Color.parseColor("#0A1222"));
        }
        d.setSystemUiVisibility(f);
        w.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(c));
        if (web != null) web.setBackgroundColor(c);
    }

    private void toast(final String msg) {
        runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_LONG).show());
    }

    /** نتیجه اثر انگشت به صفحه برمی‌گردد (قفل برنامه) */
    private void bioResult(final boolean ok, final String msg) {
        ui.post(() -> { if (web != null) web.evaluateJavascript("window.__bioDone&&window.__bioDone(" + ok + "," + JSONObject.quote(msg == null ? "" : msg) + ")", null); });
    }

    /* ---- ورود با اثر انگشت ----
       کلید ورود این گوشی (که سرور می‌دهد) با یک کلید AES داخل Android Keystore رمز می‌شود. آن کلید از گوشی بیرون نمی‌آید
       و فقط بعد از تأیید اثر انگشت (کلاس قوی) کار می‌کند؛ اگر اثر انگشت تازه‌ای به گوشی اضافه شود، خود اندروید باطلش می‌کند. */
    private static final String BIO_ALIAS = "motalla_login_v1";
    private SharedPreferences bioPrefs() { return getSharedPreferences("bio_login", MODE_PRIVATE); }

    private void keyResult(final boolean ok, final String v) {
        ui.post(() -> { if (web != null) web.evaluateJavascript("window.__bioKey&&window.__bioKey(" + ok + "," + JSONObject.quote(v == null ? "" : v) + ")", null); });
    }

    private void bioWipe() {
        bioPrefs().edit().clear().apply();
        try { KeyStore ks = KeyStore.getInstance("AndroidKeyStore"); ks.load(null); if (ks.containsAlias(BIO_ALIAS)) ks.deleteEntry(BIO_ALIAS); } catch (Exception ignored) { }
    }

    private SecretKey bioNewKey() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        if (ks.containsAlias(BIO_ALIAS)) ks.deleteEntry(BIO_ALIAS);
        KeyGenParameterSpec.Builder b = new KeyGenParameterSpec.Builder(BIO_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setKeySize(256)
            .setUserAuthenticationRequired(true)
            .setInvalidatedByBiometricEnrollment(true);
        if (Build.VERSION.SDK_INT >= 30) b.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG);
        KeyGenerator kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        kg.init(b.build());
        return kg.generateKey();
    }

    private interface CipherDone { void run(Cipher c) throws Exception; }

    /** پنجره اثر انگشت سیستم همراه با کلید Keystore؛ فقط بعد از تأیید، cipher قابل استفاده است */
    @android.annotation.TargetApi(28)
    private void bioCrypto(final String title, final Cipher c, final CipherDone done) {
        android.hardware.biometrics.BiometricPrompt p = new android.hardware.biometrics.BiometricPrompt.Builder(MainActivity.this)
            .setTitle(title == null || title.isEmpty() ? "بده بستون" : title)
            .setNegativeButton("انصراف", getMainExecutor(), (d, w) -> keyResult(false, "cancel"))
            .build();
        p.authenticate(new android.hardware.biometrics.BiometricPrompt.CryptoObject(c), new CancellationSignal(), getMainExecutor(),
            new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
                @Override public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult r) {
                    try { done.run(r.getCryptoObject().getCipher()); } catch (Exception e) { keyResult(false, "error"); }
                }
                @Override public void onAuthenticationError(int code, CharSequence msg) {
                    keyResult(false, code == 5 || code == 10 ? "cancel" : String.valueOf(msg));
                }
            });
    }

    /** آیا اثر انگشت قوی (قابل استفاده با Keystore) روی گوشی ثبت شده؟ */
    private boolean bioStrong() {
        try {
            if (Build.VERSION.SDK_INT >= 30) {
                android.hardware.biometrics.BiometricManager bm = getSystemService(android.hardware.biometrics.BiometricManager.class);
                return bm != null && bm.canAuthenticate(android.hardware.biometrics.BiometricManager.Authenticators.BIOMETRIC_STRONG) == android.hardware.biometrics.BiometricManager.BIOMETRIC_SUCCESS;
            }
            if (Build.VERSION.SDK_INT >= 29) {
                android.hardware.biometrics.BiometricManager bm = getSystemService(android.hardware.biometrics.BiometricManager.class);
                return bm != null && bm.canAuthenticate() == android.hardware.biometrics.BiometricManager.BIOMETRIC_SUCCESS;
            }
            if (Build.VERSION.SDK_INT >= 28) {
                android.hardware.fingerprint.FingerprintManager fm = getSystemService(android.hardware.fingerprint.FingerprintManager.class);
                return fm != null && fm.isHardwareDetected() && fm.hasEnrolledFingerprints();
            }
        } catch (Exception ignored) { }
        return false;
    }

    /** پل جاوااسکریپت ← اندروید */
    private class Bridge {
        /** نسل کلید امضای این APK: ۲ = کلید جدید (۱۴۰۵). اپ‌هایی که این متد را ندارند با کلید قدیمی امضا شده‌اند */
        @JavascriptInterface
        public int keyGen() { return 2; }

        /** آیا این گوشی اثر انگشت/چهره ثبت‌شده دارد؟ (اندروید ۹ به بالا) */
        @JavascriptInterface
        public boolean bioAvailable() {
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    android.hardware.biometrics.BiometricManager bm = getSystemService(android.hardware.biometrics.BiometricManager.class);
                    return bm != null && bm.canAuthenticate() == android.hardware.biometrics.BiometricManager.BIOMETRIC_SUCCESS;
                }
                if (Build.VERSION.SDK_INT >= 28) return getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT);
            } catch (Exception ignored) { }
            return false;
        }

        /** پنجره اثر انگشت سیستم؛ نتیجه با window.__bioDone(ok, msg) */
        @JavascriptInterface
        public void bioAuth(final String title) {
            if (Build.VERSION.SDK_INT < 28) { bioResult(false, "unsupported"); return; }
            runOnUiThread(() -> {
                try {
                    android.hardware.biometrics.BiometricPrompt p = new android.hardware.biometrics.BiometricPrompt.Builder(MainActivity.this)
                        .setTitle(title == null || title.isEmpty() ? "بده بستون" : title)
                        .setNegativeButton("رمز عددی", getMainExecutor(), (d, w) -> bioResult(false, "cancel"))
                        .build();
                    p.authenticate(new CancellationSignal(), getMainExecutor(), new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
                        @Override public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult r) { bioResult(true, ""); }
                        @Override public void onAuthenticationError(int code, CharSequence msg) { bioResult(false, String.valueOf(msg)); }
                    });
                } catch (Exception e) { bioResult(false, String.valueOf(e.getMessage())); }
            });
        }

        /** وضعیت اثر انگشت: ok | none (حسگر هست، اثری ثبت نشده) | nohw (حسگر ندارد) | old (اندروید ۸ یا قدیمی‌تر) */
        @JavascriptInterface
        public String bioStatus() {
            if (Build.VERSION.SDK_INT < 28) return "old";
            if (bioAvailable()) return "ok";
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    android.hardware.biometrics.BiometricManager bm = getSystemService(android.hardware.biometrics.BiometricManager.class);
                    int r = bm == null ? -1 : bm.canAuthenticate();
                    if (r == android.hardware.biometrics.BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED) return "none";
                    return "nohw";
                }
                return getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT) ? "none" : "nohw";
            } catch (Exception e) { return "nohw"; }
        }

        /** ورود با اثر انگشت ممکن است؟ (اثر انگشت قوی، لازم برای Keystore) */
        @JavascriptInterface
        public boolean bioLoginReady() { return Build.VERSION.SDK_INT >= 28 && bioStrong(); }

        /** کلید ورود رمزشده روی این گوشی هست؟ */
        @JavascriptInterface
        public boolean bioHas() { return bioPrefs().contains("blob"); }

        /** کلید ورود را بعد از تأیید اثر انگشت رمز و ذخیره می‌کند؛ نتیجه با window.__bioKey(ok, msg) */
        @JavascriptInterface
        public void bioSeal(final String title, final String plain) {
            if (Build.VERSION.SDK_INT < 28 || plain == null || plain.isEmpty()) { keyResult(false, "unsupported"); return; }
            runOnUiThread(() -> {
                try {
                    bioWipe();
                    Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
                    c.init(Cipher.ENCRYPT_MODE, bioNewKey());
                    bioCrypto(title, c, cc -> {
                        byte[] ct = cc.doFinal(plain.getBytes(StandardCharsets.UTF_8));
                        String blob = Base64.encodeToString(cc.getIV(), Base64.NO_WRAP) + ":" + Base64.encodeToString(ct, Base64.NO_WRAP);
                        bioPrefs().edit().putString("blob", blob).apply();
                        keyResult(true, "");
                    });
                } catch (Exception e) { bioWipe(); keyResult(false, "error"); }
            });
        }

        /** کلید ورود را بعد از تأیید اثر انگشت باز می‌کند؛ نتیجه با window.__bioKey(true, کلید) یا (false, cancel|invalid|none|پیام) */
        @JavascriptInterface
        public void bioOpen(final String title) {
            final String blob = bioPrefs().getString("blob", null);
            if (Build.VERSION.SDK_INT < 28 || blob == null || blob.indexOf(':') < 0) { keyResult(false, "none"); return; }
            runOnUiThread(() -> {
                try {
                    KeyStore ks = KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
                    SecretKey k = (SecretKey) ks.getKey(BIO_ALIAS, null);
                    if (k == null) { bioWipe(); keyResult(false, "invalid"); return; }
                    String[] parts = blob.split(":", 2);
                    final byte[] iv = Base64.decode(parts[0], Base64.NO_WRAP), ct = Base64.decode(parts[1], Base64.NO_WRAP);
                    Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
                    c.init(Cipher.DECRYPT_MODE, k, new GCMParameterSpec(128, iv));
                    bioCrypto(title, c, cc -> keyResult(true, new String(cc.doFinal(ct), StandardCharsets.UTF_8)));
                } catch (KeyPermanentlyInvalidatedException e) { bioWipe(); keyResult(false, "invalid"); }
                catch (Exception e) { keyResult(false, "error"); }
            });
        }

        /** خاموش کردن ورود با اثر انگشت روی این گوشی */
        @JavascriptInterface
        public void bioClear() { bioWipe(); }

        @JavascriptInterface
        public boolean saveFile(String name, String base64, String mime) {
            try {
                byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
                String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_");
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
                    cv.put(MediaStore.MediaColumns.MIME_TYPE, mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
                    cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Motalla");
                    Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
                    if (uri == null) throw new Exception("insert failed");
                    try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                        if (os == null) throw new Exception("stream failed");
                        os.write(bytes);
                    }
                    toast("ذخیره شد در پوشه Download/Motalla: " + safe);
                } else {
                    File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "Motalla");
                    if (!dir.exists() && !dir.mkdirs()) throw new Exception("mkdir failed");
                    File f = new File(dir, safe);
                    try (FileOutputStream os = new FileOutputStream(f)) { os.write(bytes); }
                    toast("ذخیره شد: " + f.getAbsolutePath());
                }
                return true;
            } catch (Exception e) {
                toast("ذخیره فایل انجام نشد");
                return false;
            }
        }

        @JavascriptInterface
        public void printHtml(final String html, final String title) {
            runOnUiThread(() -> {
                final WebView pv = new WebView(MainActivity.this);
                printView = pv;
                pv.getSettings().setJavaScriptEnabled(false);
                final boolean[] done = {false};
                final Runnable go = () -> {
                    if (done[0]) return;
                    done[0] = true;
                    try {
                        PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                        String jobName = (title == null || title.isEmpty()) ? "Motalla" : title;
                        pm.print(jobName, pv.createPrintDocumentAdapter(jobName), new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                    } catch (Exception e) { toast("چاپ ممکن نشد"); }
                };
                pv.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) { ui.postDelayed(go, 500); }
                });
                // نکته: این WebView به صفحه وصل نیست و view.postDelayed روی آن هرگز اجرا نمی‌شود؛ پس از Handler اصلی استفاده می‌کنیم.
                // اگر بارگذاری منابع طول کشید، بعد از ۴ ثانیه به‌هرحال چاپ باز شود
                ui.postDelayed(go, 4000);
                pv.loadDataWithBaseURL(serverUrl, html, "text/html", "utf-8", null);
            });
        }

        /** شماره نسخه اپ اندروید (برای اینکه صفحه وب بداند این پوسته چه امکاناتی دارد) */
        @JavascriptInterface
        public int version() {
            try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode; } catch (Exception e) { return 0; }
        }

        /** صفحه وب پس از انتخاب حالت روز/شب این را صدا می‌زند */
        @JavascriptInterface
        public void setTheme(final String bg, final boolean dark) {
            runOnUiThread(() -> applyBars(bg, dark));
        }

        /** فقط نوار وضعیت بالا (مثلاً آبی در صفحه خانه)؛ نوار پایین دست نمی‌خورد */
        @JavascriptInterface
        public void setStatusBar(final String hex, final boolean lightIcons) {
            runOnUiThread(() -> {
                int c;
                try { c = Color.parseColor(hex); } catch (Exception e) { return; }
                Window w = getWindow();
                w.setStatusBarColor(c);
                View d = w.getDecorView();
                int f = d.getSystemUiVisibility();
                if (lightIcons) f &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR; else f |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                d.setSystemUiVisibility(f);
            });
        }

        @JavascriptInterface
        public void share(String text) {
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, text);
            startActivity(Intent.createChooser(i, "ارسال"));
        }
    }
}
