/* v63.5 (خواسته صاحب اپ): رسید را از برنامه‌های دیگر (تلگرام، واتساپ، گالری، برنامه بانک…) با «اشتراک‌گذاری» مستقیم به حساب مشتری بفرستد.
   راه رسیدن عکس‌ها: برنامه اندروید (AndroidBridge.takeShared → window.__shareIn) و برنامه نصب‌شده از Chrome (share_target → sw.js → کش «motalla-share»).
   عکس‌ها مثل رسیدهای دیگر کوچک و در حافظه عکس ذخیره می‌شوند؛ بعد از انتخاب مشتری، سند تازه همان مشتری با یک ردیف «حواله» و رسیدهای پیوست باز می‌شود
   (مبلغ را خود کاربر می‌زند و ثبت می‌کند؛ تا ثبت نشود چیزی در حساب نمی‌نشیند). آیفون اشتراک به برنامه‌های وب را اجازه نمی‌دهد. */
let SHIN=null,shinQ='',shinBusy=false;
const SHIN_MAX=10;
/* ورودی: Blob/File یا data URL؛ فقط عکس */
async function shareInAdd(list){const L=(list||[]).filter(Boolean).slice(0,SHIN_MAX);if(!L.length)return;
  const K=[];let bad=0;for(const f0 of L){try{let f=f0;if(typeof f==='string'){if(!/^data:image\//.test(f)){bad++;continue}f=d2b(f)}if(!/^image\//.test(f.type||'')){bad++;continue}
    const d=await shrink(f),k=newImgKey('xr');if(await imgPut(k,d))K.push(k);else{toast('حافظه پر است؛ رسید ذخیره نشد',true);break}}catch(e){bad++}}
  if(bad&&!K.length){toast('فقط عکس رسید را می‌شود فرستاد (PDF و فایل‌های دیگر نه)',true);return}
  if(bad)toast('فقط عکس‌ها برداشته شد',true);if(!K.length)return;
  SHIN={keys:(SHIN?SHIN.keys:[]).concat(K).slice(0,SHIN_MAX),dir:SHIN?SHIN.dir:'in'};shinQ='';shinTry()}
/* صبر تا ورود و باز شدن قفل برنامه */
function shinTry(){if(!SHIN)return;const au=$('auth');if(!TOKEN||(au&&!au.classList.contains('hide'))||(typeof lockUI!=='undefined'&&lockUI)){setTimeout(shinTry,700);return}
  if(!can('debt')){toast('دسترسی حساب مشتری‌ها برای شما فعال نیست؛ رسید ثبت نشد',true);SHIN=null;return}sheet(shinHTML());shinBind();phPaint($('sheet'))}
function shinList(){const q=clean(shinQ||''),qd=toEn(q).replace(/\D/g,''),qn=norm(q);
  return CU().filter(c=>!q||norm(cuName(c)).includes(qn)||(qd.length>=3&&String(c.phone||'').includes(qd))||(c.grp&&norm(c.grp).includes(qn)))
    .sort((a,b)=>String(b.lastAt||b.createdAt||'').localeCompare(String(a.lastAt||a.createdAt||''))).slice(0,40)}
function shinRows(){const L=shinList();return L.length?L.map(c=>`<button class="acrow" data-act="shinPick" data-id="${c.id}">${cuAvH(c)}<span class="tx"><b>${esc(cuName(c))}</b><small>${[c.grp?esc(c.grp):'',c.phone?'<bdi dir="ltr">'+esc(toFa(phShow(c.phone)))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span><span class="brv">${cuBalMini(c)}</span></button>`).join('')
  :`<div class="spempty" style="padding:18px"><b>مشتری پیدا نشد</b><small>اول حساب مشتری را باز کنید، بعد دوباره رسید را بفرستید</small></div>`}
function shinHTML(){const S=SHIN,n=S.keys.length;
  return `<div class="sh-h"><div><b>رسید به حساب کدام مشتری؟</b><small class="shsub">${toFa(n)} عکس رسید از برنامه دیگر</small></div><button class="x" data-act="shinNo" aria-label="بستن">×</button></div>
  <div class="shinph">${S.keys.map(k=>`<span class="d6ti ph"><img data-ik="${esc(k)}" alt=""></span>`).join('')}</div>
  <div class="seg shinseg"><button data-act="shinDir" data-d="in" class="${S.dir==='in'?'on':''}">دریافت از مشتری</button><button data-act="shinDir" data-d="out" class="${S.dir==='out'?'on':''}">پرداخت به مشتری</button></div>
  <div class="fsearch sm">${ic('search')}<input id="shq" value="${esc(shinQ)}" placeholder="نام، تلفن یا گروه مشتری…" autocomplete="off" enterkeyhint="search"></div>
  <div class="sgr smg" id="shl">${shinRows()}</div>`}
function shinBind(){const q=$('shq');if(q)q.oninput=()=>{shinQ=q.value;const l=$('shl');if(l)l.innerHTML=shinRows()}}
ACT.shinDir=d=>{if(!SHIN)return;SHIN.dir=d.d==='out'?'out':'in';document.querySelectorAll('.shinseg button').forEach(b=>b.classList.toggle('on',b.dataset.d===SHIN.dir))};
/* بستن بدون انتخاب: عکس‌های ذخیره‌شده پاک می‌شوند (هنوز به هیچ سندی وصل نیستند) */
ACT.shinNo=()=>{const S=SHIN;SHIN=null;closeSheet();if(S)for(const k of S.keys)try{imgDel(k)}catch(e){}};
ACT.shinPick=d=>{const S=SHIN,c=custs.find(x=>String(x.id)===String(d.id)&&!x.del&&!x.sys);if(!S||!c||shinBusy)return;shinBusy=true;
  try{SHIN=null;ACT.svNew({cu:c.id});if(!sv||String(sv.cuId)!==String(c.id))return;
    const p=pyNew('hav',{dir:S.dir});p.imgs=S.keys.slice();p.img=p.imgs[0];sv.qa={...qaBlank(),p};svKeep();render();
    toast(toFa(S.keys.length)+' رسید به سند «'+cuName(c)+'» پیوست شد؛ مبلغ را بزنید و ثبت کنید')}
  finally{shinBusy=false}};
/* برنامه اندروید: عکس‌ها را به صورت data URL می‌دهد */
window.__shareIn=()=>{try{const B=window.AndroidBridge;if(!B||!B.takeShared)return;const j=B.takeShared();if(!j)return;const L=JSON.parse(j);if(Array.isArray(L)&&L.length)shareInAdd(L)}catch(e){}};
/* برنامه نصب‌شده از Chrome: سرویس ورکر عکس‌ها را در کش گذاشته و صفحه را با ?share=1 باز کرده */
async function shareInPwa(){if(!/[?&]share=1/.test(location.search)||!('caches' in window))return;try{history.replaceState(history.state,'',location.pathname)}catch(e){}
  try{const c=await caches.open('motalla-share'),R=await c.keys(),L=[];for(const r of R){const m=await c.match(r);if(m)L.push(await m.blob());await c.delete(r)}if(L.length)shareInAdd(L)}catch(e){}}
setTimeout(()=>{window.__shareIn();shareInPwa()},0);
