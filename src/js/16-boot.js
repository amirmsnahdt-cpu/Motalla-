/* صفحه‌های کشویی (جزئیات، تقسیم): از بالای صفحه به پایین بکشید تا بسته شود */
(()=>{let g=null;const els=()=>[$('view'),$('bar'),$('act')];
  document.addEventListener('touchstart',e=>{const v=$('view');if(e.touches.length!==1||!SLIDEP.has(cur)||!v||v.scrollTop>0||!$('ov').classList.contains('hide')||(cur==='ent'&&entEdit)||e.target.closest('input,textarea,select,.swr'))return;const t=e.touches[0];g={y:t.clientY,x:t.clientX,lk:null,d:0}},{passive:true});
  tmAdd(e=>{if(!g)return;const t=e.touches[0],dy=t.clientY-g.y,dx=t.clientX-g.x;
    if(!g.lk){if(Math.abs(dy)<8&&Math.abs(dx)<8)return;g.lk=dy>0&&dy>Math.abs(dx)*1.2&&$('view').scrollTop<=0?'v':'x';if(g.lk==='v')els().forEach(el=>{if(el)el.style.transition='none'})}
    if(g.lk!=='v')return;e.preventDefault();g.d=Math.max(0,dy);els().forEach(el=>{if(el)el.style.transform=`translateY(${g.d}px)`})});
  const end=()=>{if(!g)return;const z=g;g=null;if(z.lk!=='v')return;const E=els();
    if(z.d>110){pageLeave((cur==='ent'?PARENT.ent:PARENT[cur])||'home',{dy:z.d})}
    else E.forEach(el=>{if(el){el.style.transition='transform .25s cubic-bezier(.2,.9,.3,1.2),opacity .25s';el.style.transform='';el.style.opacity='';setTimeout(()=>{el.style.transition=''},260)}})};
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true})})();
/* دکمه برگشت اندروید: اول پنجره باز، بعد صفحه قبلی، در خانه خروج */
window.__androidBack=()=>{try{const au=$('auth');if(au&&!au.classList.contains('hide'))return false;
  if(!$('ov').classList.contains('hide')){ACT.close();return true}
  const pv=$('pv');if(pv&&!pv.classList.contains('hide')){closePrint();return true}
  if(cur==='entry'&&editId){ACT.cancelEdit();return true}
  if(cur!=='home'){back();return true}return false}catch(e){return false}};
/* پیام نسخه جدید روی صفحه ورود هم دیده شود */
{const W=f=>function(){const r=f.apply(this,arguments);try{updBar()}catch(e){}return r};showAuth=W(showAuth);authForm=W(authForm);loggedIn=W(loggedIn);forceLogout=W(forceLogout)}
ACT.checkUpd=async()=>{if(UPD){applyUpd();return}
  if(location.protocol==='https:'&&location.hostname!=='raw.githack.com'){toast('در حال بررسی…');
    try{const j=await (await fetch('/api/status?t='+Date.now(),{cache:'no-store'})).json(),sv=+j.v||0;
      if(sv>APP_V){updFound(sv);toast('نسخه '+toFa(sv)+' آماده است؛ دکمه پایین صفحه را بزنید')}else toast('برنامه به‌روز است ✓ نسخه شما '+toFa(APP_V)+' · نسخه سرور '+toFa(sv))}
    catch(e){toast('اتصال به سرور برقرار نیست',true)}return}
  if(location.protocol==='https:'){toast('در حال بررسی…');checkUpdate(true);setTimeout(()=>{if(!UPD)toast('برنامه به‌روز است ✓ نسخه '+toFa(APP_V));else toast('نسخه جدید پیدا شد؛ دکمه طلایی پایین صفحه را بزنید')},6000);return}
  ACT.checkUpd0()};
ACT.checkUpd0=()=>{if(location.hostname!=='raw.githack.com'){if(location.protocol!=='https:'){toast('برنامه به‌روز است ✓ نسخه '+toFa(APP_V));return}toast('در حال دریافت آخرین نسخه…');const r=()=>location.reload();try{navigator.serviceWorker.getRegistration().then(g=>g&&g.update()).catch(()=>{}).finally(()=>setTimeout(r,500))}catch(e){setTimeout(r,500)}return}
  toast('در حال بررسی…');const v0=APP_V;try{sessionStorage.removeItem('m_updchk')}catch(e){}checkUpdate(true);setTimeout(()=>{let nv=0;try{nv=+localStorage.getItem('m_app_next_v')||0}catch(e){}if(!(nv>v0))toast('برنامه به‌روز است ✓ نسخه '+toFa(v0))},6000)};
/* دانلود نسخه جدید اپ اندروید:
   - مرورگر: مستقیم دانلود
   - اپ جدید (version دارد): به مرورگر گوشی سپرده می‌شود
   - اپ قدیمی: فایل از سرور گرفته و با پل اندروید در پوشه Download/Motalla ذخیره می‌شود (در همه نسخه‌ها هست) */
ACT.getApk=async()=>{if(apkMove&&apkOldKey()){apkMoveSheet();return}const B=window.AndroidBridge,inApp=/MotallaAndroid/.test(navigator.userAgent);
  if(!inApp||!B){location.href=APK_URL;return}
  if(B.version){location.href=APK_URL;return}
  try{toast('در حال دانلود نسخه جدید…');const r=await fetch(APK_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(r.status);
    const u8=new Uint8Array(await r.arrayBuffer());if(u8.length<20000||u8[0]!==0x50||u8[1]!==0x4b)throw new Error('bad file');
    let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
    if(!B.saveFile('motalla.apk',btoa(s),'application/vnd.android.package-archive'))throw new Error('save');
    sheet(`<div class="sh-h"><b>فایل نصب دانلود شد ✓</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
      <div class="muted" style="font-size:13.5px;line-height:2;margin:-4px 2px 12px">۱. برنامه <b>Files</b> (فایل‌ها) گوشی را باز کنید.<br>۲. به پوشه <b>Download</b> و بعد <b>Motalla</b> بروید.<br>۳. روی <b>motalla.apk</b> بزنید و «نصب» را بزنید. اطلاعات پاک نمی‌شود.</div>
      <div class="muted" style="font-size:12.5px;margin:0 2px 8px">یا این آدرس را در Chrome باز کنید:</div><div class="card cinfo"><div class="ci"><b class="ltrv">${APK_URL}</b></div></div>
      <div class="row"><button class="btn sec" data-act="copyApk">${ic('copy')} کپی آدرس</button><button class="btn gold" data-act="close">باشه</button></div>`)}
  catch(e){sheet(`<div class="sh-h"><b>دانلود از داخل برنامه انجام نشد</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
      <div class="muted" style="font-size:13.5px;line-height:2;margin:-4px 2px 12px">این آدرس را کپی کنید و در <b>Chrome</b> باز کنید؛ فایل را نصب کنید (روی همین برنامه نصب می‌شود):</div>
      <div class="card cinfo"><div class="ci"><b class="ltrv">${APK_URL}</b></div></div><div class="row"><button class="btn gold" data-act="copyApk">${ic('copy')} کپی آدرس</button></div>`)}};
ACT.copyApk=()=>copyText(APK_URL).then(ok=>toast(ok?'آدرس کپی شد ✓':'کپی نشد؛ روی آدرس انگشت نگه دارید و کپی کنید',!ok));
ACT.shareInstall=d=>{const ios=d.os==='ios',t='نصب برنامه «بده بستون» — طلای مطلا\n\n'+(ios?'آیفون: این لینک را در Safari باز کنید، دکمه اشتراک‌گذاری ← Add to Home Screen\n'+WEB_URL:'اندروید: فایل نصب را دانلود و نصب کنید\n'+APK_URL)+'\n\nنام کاربری و رمز را از مدیر بگیرید.';
  if(window.AndroidBridge&&AndroidBridge.share){AndroidBridge.share(t);return}if(navigator.share)navigator.share({text:t}).catch(()=>{});else copyText(t)};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||t.disabled)return;const f=ACT[t.dataset.act];if(f){e.preventDefault();f(t.dataset,e)}});
$('ov').addEventListener('click',e=>{if(e.target.id==='ov'){aSt=null;srcRet='';closeSheet()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('ov').classList.contains('hide')){aSt=null;srcRet='';closeSheet()}});
try{history.replaceState({n:'home'},'')}catch(e){}
/* آیفون (برنامه روی صفحه اصلی): iOS ارتفاع صفحه را به اندازه نوار ساعت کم گزارش می‌کند؛ قاب را به اندازه کامل صفحه می‌کنیم */

if(ME)user=ME.name;applyPerms();syncInit();
try{if(sessionStorage.getItem('m_back_settings')){sessionStorage.removeItem('m_back_settings');if(ME&&TOKEN)cur='settings'}}catch(e){}
render(true);
if(!TOKEN)showAuth();else{setSync(navigator.onLine===false?'off':'busy');syncNow()}
if('serviceWorker' in navigator&&(location.protocol==='https:'||/^(127\.0\.0\.1|localhost)$/.test(location.hostname))){navigator.serviceWorker.register('sw.js').catch(()=>{})}
