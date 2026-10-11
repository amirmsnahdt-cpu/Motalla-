package ir.motalla.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.provider.MediaStore;
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

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

/** پوسته اندروید مطلا: برنامه وب را از سرور باز می‌کند و ذخیره فایل، چاپ و انتخاب عکس را فراهم می‌کند. */
public class MainActivity extends Activity {
    private static final int FILE_REQ = 1001;
    private WebView web;
    private WebView printView;
    private ValueCallback<Uri[]> fileCb;
    private String serverUrl;

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

    /** پل جاوااسکریپت ← اندروید */
    private class Bridge {
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
                printView = new WebView(MainActivity.this);
                printView.getSettings().setJavaScriptEnabled(false);
                printView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        view.postDelayed(() -> {
                            PrintManager pm = (PrintManager) getSystemService(PRINT_SERVICE);
                            String jobName = (title == null || title.isEmpty()) ? "Motalla" : title;
                            pm.print(jobName, view.createPrintDocumentAdapter(jobName), new PrintAttributes.Builder().setMediaSize(PrintAttributes.MediaSize.ISO_A4).build());
                        }, 600);
                    }
                });
                printView.loadDataWithBaseURL(serverUrl, html, "text/html", "utf-8", null);
            });
        }

        /** صفحه وب پس از انتخاب حالت روز/شب این را صدا می‌زند */
        @JavascriptInterface
        public void setTheme(final String bg, final boolean dark) {
            runOnUiThread(() -> applyBars(bg, dark));
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
