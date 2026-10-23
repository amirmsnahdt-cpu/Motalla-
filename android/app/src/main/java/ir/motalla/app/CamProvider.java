package ir.motalla.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

/** عکسی که دوربین گوشی برای رسید می‌گیرد اینجا (پوشه موقت خود برنامه) نوشته می‌شود، نه در گالری.
    فقط یک پوشه و فقط نام‌های ساده سرو می‌شوند؛ بیرونی نیست و دسترسی دوربین با grantUriPermissions موقت داده می‌شود. */
public class CamProvider extends ContentProvider {
    static final String AUTH = "ir.motalla.app.cam";

    static File dir(android.content.Context c) {
        File d = new File(c.getCacheDir(), "cam");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private File fileOf(Uri uri) throws FileNotFoundException {
        String n = uri.getLastPathSegment();
        if (n == null || !n.matches("[A-Za-z0-9_.-]+")) throw new FileNotFoundException("bad name");
        return new File(dir(getContext()), n);
    }

    @Override public boolean onCreate() { return true; }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        return ParcelFileDescriptor.open(fileOf(uri), ParcelFileDescriptor.parseMode(mode));
    }

    @Override
    public Cursor query(Uri uri, String[] proj, String sel, String[] args, String sort) {
        File f;
        try { f = fileOf(uri); } catch (FileNotFoundException e) { return null; }
        MatrixCursor c = new MatrixCursor(new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE});
        c.addRow(new Object[]{f.getName(), f.length()});
        return c;
    }

    @Override public String getType(Uri uri) { return "image/jpeg"; }
    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}
