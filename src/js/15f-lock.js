/* ============ قفل برنامه: رمز ۶ رقمی + Face ID / اثر انگشت ============
   - روی هر گوشی جدا تنظیم می‌شود (m_lock). رمز خودش ذخیره نمی‌شود؛ فقط هش PBKDF2 با نمک تصادفی.
   - بعد از ۲۰ دقیقه بیکاری (یا برگشتن به برنامه بعد از ۲۰ دقیقه) قفل می‌شود.
   - ۵ رمز اشتباه، یا «فراموش کردم»: اول هماهنگی با سرور، بعد خروج امن (داده روی سرور می‌ماند).
   - Face ID روی آیفون و مرورگرها با WebAuthn (کلید دستگاه)، اثر انگشت در اپ اندروید با BiometricPrompt (AndroidBridge.bioAuth). */
const LOCK_IDLE=20*60e3,LOCK_MAX_FAIL=5;
let lockUI=null,lockLast=Date.now(),lockSaved=0;
/* قفل مال همان کاربری است که تنظیمش کرده؛ اگر کاربر دیگری روی این گوشی وارد شود، قفل قبلی اعمال نمی‌شود */
const lockCfg=()=>{const c=ls.get('m_lock',null);return c&&c.hash&&c.salt&&(!c.u||!ME||c.u===ME.username)?c:null};
const lockOn=()=>!!(TOKEN&&lockCfg());
const isIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const bioName=()=>window.AndroidBridge?'اثر انگشت':isIOS()?'Face ID':'ورود بیومتریک';
const b64u=u8=>btoa(String.fromCharCode(...u8)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const ub64=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
async function pinHash(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
  return b64u(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:ub64(salt),iterations:150000},k,256)))}

/* ---- بیومتریک ---- */
async function bioAvail(){try{if(window.AndroidBridge)return !!(AndroidBridge.bioAvailable&&AndroidBridge.bioAvailable());
  if(!window.PublicKeyCredential||!window.isSecureContext)return false;
  /* اندروید در مرورگر (نه اپ): کلید در حساب گوگل ذخیره می‌شد؛ مالک فقط اثر انگشت خود گوشی را می‌خواهد → فقط در اپ اندروید (BiometricPrompt، بدون هیچ حساب ابری) */
  if(/Android/i.test(navigator.userAgent))return false;
  /* آیفون: همه آیفون‌های امروزی Face ID یا Touch ID دارند، ولی Safari در بعضی حالت‌ها (مرورگر داخل برنامه‌ها، صفحه افزوده به خانه)
     به این سؤال «نه» جواب می‌دهد و گزینه اصلاً دیده نمی‌شد. روی آیفون همیشه گزینه را نشان بده؛ اگر وصل نشد، پیام روشن می‌دهیم. */
  if(isIOS())return true;
  return !!(PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable&&await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())}catch(e){return isIOS()}}
let bioWait=null;
window.__bioDone=(ok,msg)=>{const w=bioWait;bioWait=null;if(w)w(ok?{ok:true}:{ok:false,msg:msg||''})};
function bioAndroid(title){return new Promise(r=>{bioWait=r;try{AndroidBridge.bioAuth(title)}catch(e){bioWait=null;r({ok:false,msg:String(e)})}})}
async function bioEnroll(){
  if(window.AndroidBridge){const r=await bioAndroid('وصل کردن اثر انگشت به قفل بده بستون');return r.ok?{t:'and'}:null}
  const rnd=n=>crypto.getRandomValues(new Uint8Array(n));
  const c=await navigator.credentials.create({publicKey:{challenge:rnd(32),rp:{name:'بده بستون',id:location.hostname},
    user:{id:rnd(16),name:(ME&&ME.username)||'motalla',displayName:(ME&&ME.name)||'بده بستون'},
    pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],
    authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'discouraged'},timeout:60000,attestation:'none'}});
  return c?{t:'wa',id:b64u(new Uint8Array(c.rawId))}:null}
async function bioCheck(){const c=lockCfg(),b=c&&c.bio;if(!b)return false;
  try{if(b.t==='and'){if(!window.AndroidBridge||!AndroidBridge.bioAuth)return false;return (await bioAndroid('باز کردن بده بستون')).ok}
    const a=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rpId:location.hostname,
      allowCredentials:[{type:'public-key',id:ub64(b.id),transports:['internal']}],userVerification:'required',timeout:60000}});
    return !!a}catch(e){return false}}

/* ---- صفحه قفل (یک صفحه برای باز کردن، تنظیم، تأیید رمز) ---- */
const LKI={face:'<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M9 9.5v1M15 9.5v1M12 9.5v3.5h-1M9.5 16c1.5 1 3.5 1 5 0"/>',
  fp:'<path d="M12 11v3a6 6 0 0 1-1.2 3.6"/><path d="M8.6 7.6A5 5 0 0 1 17 11v1.5c0 1.5-.2 3-.7 4.4"/><path d="M7 11a5 5 0 0 1 .3-1.7M7 11v1.5c0 1.6-.5 3.1-1.4 4.3"/><path d="M5 8.2A8 8 0 0 1 19.6 9M4.2 12.5V11c0-.5 0-1 .1-1.5M19.9 12v.5c0 1.6-.2 3.1-.6 4.5"/>',
  del:'<path d="M21 6H9l-6 6 6 6h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z"/><path d="M17 10l-4 4M13 10l4 4"/>',
  pad:'<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'};
const lkI=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LKI[k]}</svg>`;
function lockEl(){let e=$('lock');if(!e){e=document.createElement('div');e.id='lock';e.className='lk hide';e.setAttribute('role','dialog');e.setAttribute('aria-modal','true');document.body.appendChild(e);
  e.addEventListener('click',ev=>{const b=ev.target.closest('[data-lk]');if(!b||b.disabled)return;ev.preventDefault();ev.stopPropagation();lockKey(b.dataset.lk)});}return e}
/* m: unlock | set1 | set2 | verify | bio | forgot */
function lockShow(m,cb){lockUI={m,pin:'',first:'',cb,err:'',busy:false};lockDraw();const e=lockEl();e.classList.remove('hide');document.documentElement.classList.add('locked');try{document.activeElement&&document.activeElement.blur()}catch(_){}
  if(m==='unlock'&&lockCfg().bio)setTimeout(()=>{if(lockUI&&lockUI.m==='unlock'&&document.visibilityState==='visible')lockKey('bio',true)},350)}
function lockHide(){const e=$('lock');if(e)e.classList.add('hide');document.documentElement.classList.remove('locked');lockUI=null;lockLast=Date.now();lockTouch(true)}
function lockDraw(){const S=lockUI,e=lockEl();if(!S)return;const c=lockCfg(),bio=c&&c.bio&&S.m==='unlock';
  const T={unlock:['بده بستون',ME?esc(ME.name):''],set1:['رمز قفل تازه','یک رمز ۶ رقمی انتخاب کنید'],set2:['تکرار رمز','همان ۶ رقم را دوباره بزنید'],verify:['رمز فعلی','برای ادامه، رمز قفل را وارد کنید']}[S.m];
  if(S.m==='bio'||S.m==='forgot'){const f=S.m==='forgot';
    e.innerHTML=`<div class="lkw"><div class="lkmark">${f?lkI('pad'):lkI(window.AndroidBridge?'fp':'face')}</div><b class="lkt">${f?'رمز را فراموش کرده‌اید؟':bioName()+' هم وصل شود؟'}</b>
      <p class="lks">${f?'برای رمز تازه باید یک بار با نام کاربری و رمز عبور وارد شوید. اطلاعات روی سرور می‌ماند و فقط این گوشی خارج می‌شود.':'از این به بعد برنامه را با '+bioName()+' باز کنید؛ رمز ۶ رقمی همیشه به‌عنوان راه دوم کار می‌کند.'}</p>
      <div class="lkbtns"><button class="btn ${f?'red':'bkgo'}" data-lk="${f?'logout':'bioYes'}"${S.busy?' disabled':''}>${f?'خروج و ورود دوباره':'وصل کن'}</button><button class="btn sec" data-lk="${f?'back':'bioNo'}">${f?'انصراف':'فعلاً نه'}</button></div>${S.err?`<p class="lkerr">${esc(S.err)}</p>`:''}</div>`;return}
  const dots=Array.from({length:6},(_,i)=>`<i class="${i<S.pin.length?'on':''}"></i>`).join('');
  const k=n=>`<button data-lk="${n}" aria-label="${n}"><b>${toFa(String(n))}</b></button>`;
  const left=bio?`<button data-lk="bio" class="lkf" aria-label="${bioName()}">${lkI(window.AndroidBridge?'fp':'face')}</button>`:'<span></span>';
  e.innerHTML=`<div class="lkw"><div class="lkmark">${S.m==='unlock'?'<span class="lkm">م</span>':lkI('pad')}</div><b class="lkt">${T[0]}</b><p class="lks">${T[1]}</p>
    <div class="lkd${S.shake?' shake':''}" aria-label="${toFa(S.pin.length)} رقم از ۶">${dots}</div><p class="lkerr" aria-live="polite">${esc(S.err||'')}</p>
    <div class="lkp">${[1,2,3,4,5,6,7,8,9].map(k).join('')}${left}${k(0)}<button data-lk="del" class="lkf" aria-label="پاک کردن">${lkI('del')}</button></div>
    <button class="lkl" data-lk="${S.m==='unlock'?'forgot':'cancel'}">${S.m==='unlock'?'رمز را فراموش کرده‌ام':'انصراف'}</button></div>`;
  S.shake=false}
async function lockKey(k,auto){const S=lockUI;if(!S||S.busy)return;
  if(k==='cancel'){const cb=S.cb;lockHide();cb&&cb(false);return}
  if(k==='forgot'){S.m='forgot';S.err='';lockDraw();return}
  if(k==='back'){S.m='unlock';S.pin='';S.err='';lockDraw();return}
  if(k==='logout'){S.busy=true;lockDraw();await lockWipe('برای رمز قفل تازه دوباره وارد شوید');return}
  if(k==='bioNo'){const cb=S.cb,set=!!S.first;lockHide();if(set)toast('قفل برنامه روشن شد ✓');cb&&cb(true);return}
  if(k==='bioYes'){S.busy=true;S.err='';lockDraw();let r=null,er='';try{r=await bioEnroll()}catch(e){r=null;er=e&&e.name||''}
    if(!lockUI)return;S.busy=false;if(!r){S.err=er==='NotAllowedError'?bioName()+' لغو شد یا اجازه داده نشد؛ دوباره «وصل کن» را بزنید':er==='NotSupportedError'||er==='SecurityError'?'این مرورگر '+bioName()+' را پشتیبانی نمی‌کند؛ برنامه را در Safari باز کنید':bioName()+' وصل نشد؛ دوباره امتحان کنید یا «فعلاً نه» را بزنید';lockDraw();return}
    const c=lockCfg();c.bio=r;ls.set('m_lock',c);const cb=S.cb;lockHide();toast('قفل برنامه با '+bioName()+' روشن شد ✓');cb&&cb(true);return}
  if(k==='bio'){S.busy=true;const ok=await bioCheck();if(!lockUI)return;S.busy=false;if(ok){const c=lockCfg();c.fails=0;ls.set('m_lock',c);const cb=S.cb;lockHide();cb&&cb(true)}else if(!auto){S.err=bioName()+' تأیید نشد؛ رمز را وارد کنید';lockDraw()}return}
  if(k==='del'){S.pin=S.pin.slice(0,-1);S.err='';lockDraw();return}
  if(!/^\d$/.test(k)||S.pin.length>=6)return;
  S.pin+=k;S.err='';lockDraw();try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}
  if(S.pin.length<6)return;
  const pin=S.pin;
  if(S.m==='set1'){S.first=pin;S.pin='';S.m='set2';setTimeout(lockDraw,120);return}
  if(S.m==='set2'){if(pin!==S.first){S.m='set1';S.pin='';S.first='';S.err='دو رمز یکی نبودند؛ دوباره انتخاب کنید';S.shake=true;setTimeout(lockDraw,120);return}
    if(/^(\d)\1{5}$/.test(pin)||'0123456789'.includes(pin)||'9876543210'.includes(pin)){S.m='set1';S.pin='';S.first='';S.err='رمز خیلی ساده است (مثل ۱۱۱۱۱۱ یا ۱۲۳۴۵۶)؛ رمز دیگری انتخاب کنید';S.shake=true;setTimeout(lockDraw,120);return}
    S.busy=true;const salt=b64u(crypto.getRandomValues(new Uint8Array(16))),old=lockCfg();
    ls.set('m_lock',{u:ME&&ME.username||'',salt,hash:await pinHash(pin,salt),bio:old&&old.bio||null,fails:0,at:new Date().toISOString()});S.busy=false;
    if(!(old&&old.bio)&&await bioAvail()){S.m='bio';S.pin='';lockDraw();return}
    const cb=S.cb;lockHide();toast(old?'رمز قفل عوض شد ✓':'قفل برنامه روشن شد ✓');cb&&cb(true);return}
  /* unlock | verify */
  S.busy=true;const c=lockCfg(),ok=c&&(await pinHash(pin,c.salt))===c.hash;S.busy=false;if(!lockUI)return;
  if(ok){c.fails=0;ls.set('m_lock',c);const cb=S.cb;lockHide();cb&&cb(true);return}
  c.fails=(c.fails||0)+1;ls.set('m_lock',c);S.pin='';S.shake=true;
  if(S.m==='unlock'&&c.fails>=LOCK_MAX_FAIL){S.err='رمز ۵ بار اشتباه بود؛ خروج امن…';lockDraw();S.busy=true;await lockWipe('رمز قفل ۵ بار اشتباه وارد شد؛ دوباره وارد شوید');return}
  S.err=S.m==='unlock'?'رمز اشتباه است؛ '+toFa(LOCK_MAX_FAIL-c.fails)+' بار دیگر فرصت دارید':'رمز اشتباه است';setTimeout(lockDraw,60)}
/* خروج امن: اول تغییرهای ثبت‌نشده به سرور فرستاده می‌شوند، بعد این گوشی خارج می‌شود */
async function lockWipe(msg){try{if(typeof syncNow==='function'&&navigator.onLine){await Promise.race([syncNow(),new Promise(r=>setTimeout(r,8000))])}}catch(e){}
  try{await api('/api/logout',{})}catch(e){}ls.set('m_lock',null);try{localStorage.removeItem('m_lock')}catch(e){}lockHide();forceLogout(msg)}

/* ---- قفل خودکار بعد از ۲۰ دقیقه بیکاری ---- */
function lockTouch(force){lockLast=Date.now();if(force||lockLast-lockSaved>15e3){lockSaved=lockLast;try{localStorage.setItem('m_lock_at',String(lockLast))}catch(e){}}}
function lockDue(){if(!lockOn()||lockUI)return false;let t=lockLast;try{t=Math.max(t,+localStorage.getItem('m_lock_at')||0)}catch(e){}return Date.now()-t>=LOCK_IDLE}
function lockCheck(){if(lockDue())lockShow('unlock')}
['pointerdown','keydown','touchstart','wheel'].forEach(ev=>document.addEventListener(ev,()=>{if(!lockUI)lockTouch()},{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){if(!lockUI)lockTouch(true)}else lockCheck()});
window.addEventListener('pageshow',lockCheck);
setInterval(lockCheck,30e3);
/* شروع برنامه: اگر از آخرین استفاده ۲۰ دقیقه گذشته، اول قفل */
(()=>{let t=0;try{t=+localStorage.getItem('m_lock_at')||0}catch(e){}if(lockOn()&&(!t||Date.now()-t>=LOCK_IDLE))lockShow('unlock');else lockTouch(true)})();

/* ---- تنظیمات «قفل برنامه» ---- */
async function lockSheet(){const c=lockCfg(),av=await bioAvail(),on=!!c;
  const row=(act,ic,t,s,cls)=>`<button class="lkrow${cls?' '+cls:''}" data-act="${act}"><span class="lki">${ic}</span><span class="tx"><b>${t}</b>${s?`<small>${s}</small>`:''}</span></button>`;
  sheet(`<div class="sh-h"><b>قفل برنامه</b><button class="x" data-act="close">×</button></div>
    <div class="muted" style="font-size:13px;line-height:1.9;margin:-4px 2px 12px">${on?'روشن است. بعد از ۲۰ دقیقه بیکاری، برای باز کردن برنامه رمز ۶ رقمی'+(c.bio?' یا '+bioName():'')+' لازم است.':'اگر گوشی گم شود یا دست کس دیگری بیفتد، بدون رمز ۶ رقمی برنامه باز نمی‌شود. بعد از ۲۰ دقیقه بیکاری قفل می‌شود.'}</div>
    <div class="lkrows">${on?
      (av||c.bio?row('lockBio',lkI(window.AndroidBridge?'fp':'face'),c.bio?bioName()+' روشن است':'وصل کردن '+bioName(),c.bio?'برای خاموش کردن بزنید':'باز کردن برنامه بدون زدن رمز'):'')+
      row('lockChange',lkI('pad'),'تغییر رمز ۶ رقمی','')+row('lockNow',lkI('pad'),'قفل کن، همین الان','')+row('lockOff',lkI('pad'),'خاموش کردن قفل','با وارد کردن رمز فعلی','r')
      :`<button class="btn bkgo" data-act="lockSet">${lkI('pad')} روشن کردن قفل</button>`}</div>`)}
ACT.lockSheet=()=>{if(!TOKEN){toast('اول وارد شوید');return}lockSheet()};
ACT.lockSet=()=>{closeSheet();lockShow('set1',()=>{if(cur==='settings')render()})};
ACT.lockChange=()=>{closeSheet();lockShow('verify',ok=>{if(ok)setTimeout(()=>lockShow('set1'),150)})};
ACT.lockNow=()=>{closeSheet();lockShow('unlock')};
ACT.lockOff=()=>{closeSheet();lockShow('verify',ok=>{if(!ok)return;ls.set('m_lock',null);try{localStorage.removeItem('m_lock')}catch(e){}toast('قفل برنامه خاموش شد');if(cur==='settings')render()})};
ACT.lockBio=async()=>{const c=lockCfg();if(!c)return;closeSheet();
  if(c.bio){c.bio=null;ls.set('m_lock',c);toast(bioName()+' خاموش شد؛ فقط رمز ۶ رقمی');if(cur==='settings')render();return}
  lockShow('verify',ok=>{if(ok){lockUI=null;setTimeout(()=>{lockShow('bio',()=>{if(cur==='settings')render()})},150)}})};
/* بعد از ورود، یک بار روی هر گوشی پیشنهاد روشن کردن قفل */
/* اپ اندروید قدیمی (کلید امضای قبلی) باید نصب دوباره شود؛ پیشنهاد قفل می‌ماند برای اپ جدید */
function lockOffer(){if(!TOKEN||!ME||lockCfg()||ls.get('m_lock_ask','')===ME.username||lockUI||apkOldKey())return;if(!$('ov').classList.contains('hide')){setTimeout(lockOffer,20e3);return}
  ls.set('m_lock_ask',ME.username);sheet(`<div class="sh-h"><b>قفل برنامه را روشن کنید</b><button class="x" data-act="close">×</button></div>
    <div class="muted" style="font-size:13.5px;line-height:1.9;margin:-4px 2px 14px">اطلاعات مشتری‌ها روی این گوشی است. با یک رمز ۶ رقمی${'PublicKeyCredential' in window||window.AndroidBridge?' (و '+bioName()+')':''}، اگر گوشی گم شود یا دست کس دیگری بیفتد، برنامه باز نمی‌شود.</div>
    <div class="row"><button class="btn sec" data-act="close">بعداً</button><button class="btn bkgo" data-act="lockSet">روشن کردن</button></div>`)}
if(TOKEN)setTimeout(lockOffer,5000);
/* صفحه‌کلید (کامپیوتر): عدد و پاک کردن روی صفحه قفل */
document.addEventListener('keydown',e=>{if(!lockUI)return;if(/^\d$/.test(e.key))lockKey(e.key);else if(e.key==='Backspace')lockKey('del');else if(e.key==='Escape'&&lockUI.m!=='unlock')lockKey('cancel');else return;e.preventDefault();e.stopPropagation()},true);
IC.padlock=LKI.pad;
