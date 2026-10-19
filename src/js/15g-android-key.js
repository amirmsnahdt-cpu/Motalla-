/* ============ کلید امضای تازه اندروید: راهنمای یک‌باره نصب دوباره ============
   اپ‌های اندروید قدیمی (بدون AndroidBridge.keyGen) با کلید لورفته امضا شده‌اند و نسخه جدید روی آن‌ها نصب نمی‌شود.
   وقتی سرور فایل نصب با کلید جدید دارد (/api/status → apkKey ≥ ۲)، این راهنما نشان داده می‌شود:
   ۱) همه تغییرهای گوشی به سرور برسد  ۲) دانلود نسخه جدید (فقط بعد از مرحله ۱)  ۳) حذف اپ قدیمی  ۴) نصب و ورود. */
let apkMove=false;
const apkOldKey=()=>/MotallaAndroid/.test(navigator.userAgent)&&!!window.AndroidBridge&&!(AndroidBridge.keyGen&&AndroidBridge.keyGen()>=2);
async function apkMoveCheck(){if(!apkOldKey()||!TOKEN)return;
  try{const r=await fetch(API_BASE+'/api/status',{cache:'no-store'});const j=await r.json();apkMove=+j.apkKey>=2}catch(e){return}
  if(!apkMove)return;if(cur==='settings')render();
  apkMoveShow()}
/* هر بار باز شدن برنامه یک بار؛ اگر پنجره دیگری یا قفل باز است، کمی بعد */
function apkMoveShow(){try{if(sessionStorage.getItem('m_apkmove'))return}catch(e){}
  if(!$('ov').classList.contains('hide')||lockUI){setTimeout(apkMoveShow,8000);return}
  try{sessionStorage.setItem('m_apkmove','1')}catch(e){}apkMoveSheet()}
const apkSynced=()=>!pendN()&&SY.state==='ok';
function apkMoveSheet(){const ok=apkSynced(),n=pendN();
  sheet(`<div class="sh-h"><b>نصب دوباره اپ اندروید (یک بار)</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
    <div class="muted" style="font-size:13.5px;line-height:1.9;margin:-4px 2px 12px">برای امنیت، امضای اپ اندروید عوض شده و نسخه جدید روی این نسخه نصب نمی‌شود. باید یک بار این نسخه حذف و نسخه جدید نصب شود. <b>همه اطلاعات روی سرور است و چیزی پاک نمی‌شود.</b></div>
    <div class="apkst">
      <div class="apks ${ok?'ok':'wait'}"><i>۱</i><span><b>${ok?'همه تغییرهای این گوشی روی سرور است ✓':(n?toFa(n)+' تغییر هنوز به سرور نرسیده':'در حال هماهنگی با سرور…')}</b>${ok?'':'<small>تا این مرحله سبز نشود، اپ را حذف نکنید.</small>'}</span>${ok?'':`<button class="sm sec" data-act="apkSync">ارسال الان</button>`}</div>
      <div class="apks ${ok?'':'off'}"><i>۲</i><span><b>دانلود نسخه جدید</b><small>فایل در پوشه Download می‌ماند.</small></span><button class="sm ${ok?'go':'sec'}" data-act="apkMoveDl"${ok?'':' disabled'}>${ic('down')} دانلود</button></div>
      <div class="apks ${ok?'':'off'}"><i>۳</i><span><b>حذف همین اپ</b><small>آیکون «بده بستون» را نگه دارید ← Uninstall (حذف).</small></span></div>
      <div class="apks ${ok?'':'off'}"><i>۴</i><span><b>نصب نسخه جدید</b><small>Files ← Download (یا Download/Motalla) ← motalla.apk ← نصب. بعد وارد شوید و قفل برنامه را دوباره روشن کنید.</small></span></div>
    </div>`)}
ACT.apkMove=()=>apkMoveSheet();
ACT.apkSync=async()=>{toast('در حال ارسال تغییرها…');try{await refreshAll()}catch(e){}apkMoveSheet();toast(apkSynced()?'همه تغییرها روی سرور است ✓':'ارسال کامل نشد؛ اینترنت را بررسی کنید',!apkSynced())};
ACT.apkMoveDl=async()=>{if(!apkSynced()){apkMoveSheet();return}const B=window.AndroidBridge;
  if(B&&B.version){location.href=APK_URL;toast('دانلود در مرورگر شروع شد؛ بعد مرحله ۳');return}
  try{toast('در حال دانلود نسخه جدید…');const r=await fetch(APK_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);
    const u8=new Uint8Array(await r.arrayBuffer());if(u8.length<20000||u8[0]!==0x50||u8[1]!==0x4b)throw new Error('bad file');
    let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
    if(!B.saveFile('motalla.apk',btoa(s),'application/vnd.android.package-archive'))throw new Error('save');
    toast('فایل در Download/Motalla ذخیره شد ✓ حالا مرحله ۳');apkMoveSheet()}
  catch(e){location.href=APK_URL;toast('دانلود به مرورگر سپرده شد')}};
setTimeout(apkMoveCheck,3000);
