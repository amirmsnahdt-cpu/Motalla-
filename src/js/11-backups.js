/* ---------- پشتیبان‌ها (فقط مدیر) ---------- */
let BK=null,bkErr='',bkOpen=new Set();
const fsz=b=>b>=1073741824?toFa((b/1073741824).toFixed(2))+' گیگ':b>=1048576?toFa((b/1048576).toFixed(1))+' مگ':toFa(Math.max(1,Math.round(b/1024)))+' کیلو';
async function loadBk(){bkErr='';try{BK=await api('/api/backups')}catch(e){if(e.status!==401)bkErr=e.message}if(cur==='backups')render()}
/* آخرین دانلود پشتیبان: از هر گوشی که مدیر دانلود کرده باشد (سرور ثبت می‌کند) یا همین گوشی */
const bkDlAgo=()=>{const t=Math.max(+ls.get('m_bk_dl',0)||0,BK&&BK.lastDl?Date.parse(BK.lastDl)||0:0);return t?Math.floor((Date.now()-t)/864e5):null};
function vBackups(){if(!isAdmin())return '<div class="card empty"><b>فقط مدیر دسترسی دارد</b></div>';
  if(bkErr)return `<div class="msg bad">${esc(bkErr)}</div><div class="row"><button class="btn sec" data-act="bkLoad">تلاش دوباره</button></div>`;
  if(!BK)return '<div class="card empty"><b>در حال دریافت…</b></div>';
  const used=BK.total?BK.total-BK.free:BK.dbSize+BK.backupsSize,pct=BK.total?Math.round(used/BK.total*100):0,warn=pct>=80,ago=bkDlAgo();
  let h=`<div class="ingot"><div class="lb">فضای دیسک سرور</div><div class="v">${BK.total?toFa(pct)+'٪':'—'}<small>${BK.total?'پر از '+fsz(BK.total):''}</small></div>
    <div class="dbar"><i style="width:${Math.min(100,pct)}%" class="${warn?'w':''}"></i></div>
    <div class="row3 r4"><div><small>اطلاعات</small><b>${fsz(Math.max(0,BK.dbSize-BK.imgBytes))}</b></div><div><small>عکس‌ها (${fmt(BK.imgCount)})</small><b>${fsz(BK.imgBytes)}</b></div><div><small>پشتیبان‌ها</small><b>${fsz(BK.backupsSize)}</b></div><div><small>خالی</small><b class="${warn?'r':''}">${BK.total?fsz(BK.free):'—'}</b></div></div></div>`;
  if(warn)h+=`<div class="msg warn">دیسک سرور نزدیک به پر شدن است. از پنل لیارا حجم دیسک «data» را بیشتر کنید.</div>`;
  h+=`<div class="msg ${ago===null||ago>=7?'warn':'ok'}">${ago===null?'هنوز پشتیبانی بیرون از سرور ذخیره نشده. هفته‌ای یک بار «دانلود کامل» (همه اطلاعات و عکس‌ها) را بزنید و فایل را جای امن نگه دارید، مثلاً تلگرام.':ago>=7?'آخرین دانلود پشتیبان '+toFa(ago)+' روز پیش بوده؛ یک نسخه تازه بگیرید.':'آخرین دانلود پشتیبان: '+(ago?toFa(ago)+' روز پیش':'امروز')+' ✓'}</div>`;
  h+=`<div class="row" style="margin:0 0 6px">${bkBtn('bkFull','','btn bkgo','down','دانلود کامل')}</div>
    <div class="row" style="margin:0 0 6px">${bkBtn('bkUpPick','','btn sec','undo','بازگردانی از فایل')}</div>`;
  h+=`<div class="sgh" style="margin:14px 6px 6px;font-size:12.5px;font-weight:800;color:var(--mut)">پشتیبان‌های روی سرور (خودکار هر شب ساعت ۳ بامداد، تا ۳۰ نسخه)</div>`;
  if(!BK.backups.length)return h+'<div class="card empty"><b>هنوز پشتیبانی ساخته نشده</b>اولین نسخه چند دقیقه بعد از راه‌اندازی سرور ساخته می‌شود.</div>';
  h+='<div class="hgrp">'+BK.backups.map(b=>{const op=bkOpen.has(b.name),man=b.name.length>26,D=b.day;return `<div class="hrow${op?' open':''}"><button class="hh" data-act="bkTog" data-n="${esc(b.name)}"><span class="hi" style="--c:var(--ok)">${ic('restore')}</span><span class="tx"><b>${relDay(D)}، ${dates(D).fa}</b><small>${man?'دستی':'خودکار'}، ساعت <bdi>${hm(b.at)}</bdi>، حجم <bdi>${fsz(b.size)}</bdi></small></span>${chevI()}</button>
    <div class="hb"><div class="hact">${bkBtn('bkDl',b.name,'sm sec','down','دانلود')}<button class="sm red" data-act="bkRestore" data-n="${esc(b.name)}">${ic('undo')} بازگردانی به این نسخه</button></div>
    <div class="muted" style="font-size:11.5px;margin-top:8px;line-height:1.8">بازگردانی، واریزی‌ها و لیست‌ها را به وضعیت همین زمان برمی‌گرداند. کاربران و عکس‌ها دست نمی‌خورند و قبلش از وضعیت فعلی هم یک نسخه گرفته می‌شود.</div></div></div>`}).join('')+'</div>';
  return h}
/* پیشرفت روی خود دکمه: دکمه به اندازه درصد دریافت پر می‌شود؛ وقتی حجم معلوم نیست (آماده‌سازی روی سرور) یک نوار نرم رفت‌وبرگشت می‌کند */
let bkBusy=null;
const bkSel=(a,n)=>`[data-act="${a}"]`+(n?`[data-n="${CSS.escape(n)}"]`:'');
function bkBtn(a,n,cls,icn,lb){const B=bkBusy&&bkBusy.a===a&&bkBusy.n===n?bkBusy:null;
  return `<button class="${cls} bkp${B?' busy'+(B.p==null?' ind':''):''}" data-act="${a}"${n?` data-n="${esc(n)}"`:''}${B?' disabled aria-busy="true"':''} style="--p:${B&&B.p!=null?B.p:0}"><i class="bkfill"></i><span class="bkl">${B?'<i class="bkspin"></i>'+esc(B.lb):ic(icn)+' '+lb}</span></button>`}
function bkSet(a,n,p,lb){const first=!bkBusy;bkBusy={a,n,p,lb};const b=document.querySelector(bkSel(a,n));if(!b)return;
  if(first||!b.classList.contains('busy')){b.classList.add('busy');b.disabled=true;b.setAttribute('aria-busy','true');b.querySelector('.bkl').innerHTML='<i class="bkspin"></i><span></span>'}
  b.classList.toggle('ind',p==null);if(p!=null)b.style.setProperty('--p',Math.max(0.02,Math.min(1,p)));const s=b.querySelector('.bkl span');if(s)s.textContent=lb}
function bkIdle(){bkBusy=null;if(cur==='backups'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}}
async function bkFetch(path,name,n){if(bkBusy)return;const a=n?'bkDl':'bkFull';bkSet(a,n||'',null,'در حال آماده‌سازی…');
  try{const r=await fetch(API_BASE+path,{headers:{Authorization:'Bearer '+TOKEN},cache:'no-store'});if(!r.ok)throw new Error('خطای '+r.status);
  const total=+r.headers.get('Content-Length')||0;let buf;
  if(r.body&&r.body.getReader){const rd=r.body.getReader(),parts=[];let got=0;
    for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;bkSet(a,n||'',total?got/total:null,total?'در حال دانلود… '+toFa(Math.floor(got/total*100))+'٪':'در حال دانلود… '+fsz(got))}
    buf=new Uint8Array(got);let o=0;for(const c of parts){buf.set(c,o);o+=c.length}}
  else buf=new Uint8Array(await r.arrayBuffer());
  bkSet(a,n||'',1,'آماده شد ✓');await new Promise(x=>setTimeout(x,350));bkIdle();
  /* آیفون: اشتراک‌گذاری فایل فقط درست بعد از لمس کاربر مجاز است و بعد از دریافت طولانی فایل این اجازه تمام شده.
     پس فایل آماده می‌شود و با یک لمس تازه روی «ذخیره فایل» منوی اشتراک باز می‌شود */
  if(!window.AndroidBridge&&isTouch()&&navigator.canShare){const f=new File([buf],name,{type:'application/gzip'});if(navigator.canShare({files:[f]})){bkReady={f,name};
    sheet(`<div class="sh-h"><b>پشتیبان آماده است</b><button class="x" data-act="close">×</button></div><div class="muted" style="font-size:13.5px;line-height:1.9;margin-bottom:12px"><bdi dir="ltr">${esc(name)}</bdi> · ${fsz(buf.length)}<br>«ذخیره فایل» را بزنید و از منوی باز شده «Save to Files» یا تلگرام را انتخاب کنید.</div><div class="row"><button class="btn bkgo" data-act="bkShare">${ic('down')} ذخیره فایل</button></div>`);return}}
  await save(name,buf,'پشتیبان ذخیره شد ✓');bkSaved()}catch(e){bkIdle();toast('دانلود انجام نشد: '+e.message,true)}}
let bkReady=null;
/* فقط وقتی فایل واقعاً ذخیره شد، زمان آخرین دانلود ثبت می‌شود (روی سرور هم، برای گوشی‌های دیگر مدیر) */
function bkSaved(){ls.set('m_bk_dl',Date.now());api('/api/backup/saved',{}).catch(()=>{});if(BK)BK.lastDl=new Date().toISOString();if(cur==='backups'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}}
/* بازگردانی از فایل «دانلود کامل»: فایل تکه‌تکه (۱ مگ) فرستاده می‌شود تا محدودیت حجم درخواست‌ها مشکل نسازد؛
   سرور فایل را بررسی می‌کند و خلاصه‌اش را برمی‌گرداند؛ بازگردانی فقط بعد از تأیید مدیر انجام می‌شود */
let bkUp=null;
async function bkUpload(file){if(!/\.gz$/i.test(file.name)){toast('فایل پشتیبان باید با پسوند .json.gz باشد (همان فایل «دانلود کامل»)',true);return}
  const id=[...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2,'0')).join(''),buf=new Uint8Array(await file.arrayBuffer()),CH=1048576,N=Math.max(1,Math.ceil(buf.length/CH));
  const post=async(q,body)=>{const r=await fetch(API_BASE+'/api/backup/upload?id='+id+q,{method:'POST',headers:{Authorization:'Bearer '+TOKEN,'Content-Type':'application/octet-stream'},body,cache:'no-store'});let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw new Error((j&&j.error)||('خطای سرور ('+r.status+')'));return j};
  try{for(let i=0;i<N;i++){bkSet('bkUpPick','',i/N,'در حال بارگذاری… '+toFa(Math.round(i/N*100))+'٪');await post('&i='+i+'&off='+i*CH,buf.subarray(i*CH,(i+1)*CH))}
    bkSet('bkUpPick','',null,'در حال بررسی فایل…');const s=await post('&done=1');bkUp={id,name:file.name,...s};bkIdle();
    const D=s.created_at?new Date(s.created_at):null,ds=D&&!isNaN(D)?dates(new Date(D.getTime()+3.5*3600e3).toISOString().slice(0,10)).fa+'، ساعت '+hm(s.created_at):'نامشخص';
    sheet(`<div class="sh-h"><b>بازگردانی از فایل</b><button class="x" data-act="close">×</button></div>
      <div class="muted" style="font-size:13px;margin-bottom:10px"><bdi dir="ltr">${esc(file.name)}</bdi> · ${fsz(buf.length)}</div>
      <div class="hgrp" style="margin-bottom:12px">${[['تاریخ فایل',ds],['واریزی‌ها',fmt(s.entries)],['لیست‌ها',fmt(s.batches)],['حساب مشتریان',fmt(s.custs)],['عکس‌ها',s.kind==='full'?fmt(s.imgs):'ندارد (پشتیبان شبانه)']].map(([a,b])=>`<div class="hrow"><div class="hh" style="cursor:default"><span class="tx"><b>${a}</b></span><b>${b}</b></div></div>`).join('')}</div>
      <div class="msg warn" style="font-size:12.5px;line-height:1.9">همه واریزی‌ها، لیست‌ها و حساب‌ها به وضعیت این فایل برمی‌گردند و تغییرات بعد از آن کنار می‌روند. قبلش از وضعیت فعلی یک پشتیبان روی سرور گرفته می‌شود. کاربران، رمزها و تاریخچه دست نمی‌خورند و عکس‌های فعلی پاک نمی‌شوند.</div>
      <div class="row"><button class="btn red" data-act="bkUpGo">${ic('undo')} بازگردانی به این فایل</button></div>`)}
  catch(e){bkUp=null;bkIdle();toast('بارگذاری انجام نشد: '+e.message,true)}}
