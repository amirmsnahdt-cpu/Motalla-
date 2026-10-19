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
  h+=`<div class="row" style="margin:0 0 6px"><button class="btn bkgo" data-act="bkFull">${ic('down')} دانلود کامل</button></div>`;
  h+=`<div class="sgh" style="margin:14px 6px 6px;font-size:12.5px;font-weight:800;color:var(--mut)">پشتیبان‌های روی سرور (خودکار هر شب ساعت ۳ بامداد، تا ۳۰ نسخه)</div>`;
  if(!BK.backups.length)return h+'<div class="card empty"><b>هنوز پشتیبانی ساخته نشده</b>اولین نسخه چند دقیقه بعد از راه‌اندازی سرور ساخته می‌شود.</div>';
  h+='<div class="hgrp">'+BK.backups.map(b=>{const op=bkOpen.has(b.name),man=b.name.length>26,D=b.day;return `<div class="hrow${op?' open':''}"><button class="hh" data-act="bkTog" data-n="${esc(b.name)}"><span class="hi" style="--c:var(--ok)">${ic('restore')}</span><span class="tx"><b>${relDay(D)}، ${dates(D).fa}</b><small>${man?'دستی':'خودکار'}، ساعت <bdi>${hm(b.at)}</bdi>، حجم <bdi>${fsz(b.size)}</bdi></small></span>${chevI()}</button>
    <div class="hb"><div class="hact"><button class="sm sec" data-act="bkDl" data-n="${esc(b.name)}">${ic('down')} دانلود</button><button class="sm red" data-act="bkRestore" data-n="${esc(b.name)}">${ic('undo')} بازگردانی به این نسخه</button></div>
    <div class="muted" style="font-size:11.5px;margin-top:8px;line-height:1.8">بازگردانی، واریزی‌ها و لیست‌ها را به وضعیت همین زمان برمی‌گرداند. کاربران و عکس‌ها دست نمی‌خورند و قبلش از وضعیت فعلی هم یک نسخه گرفته می‌شود.</div></div></div>`}).join('')+'</div>';
  return h}
async function bkFetch(path,name){toast('در حال دانلود…');try{const r=await fetch(API_BASE+path,{headers:{Authorization:'Bearer '+TOKEN},cache:'no-store'});if(!r.ok)throw new Error('خطای '+r.status);
  const buf=new Uint8Array(await r.arrayBuffer());
  /* آیفون: اشتراک‌گذاری فایل فقط درست بعد از لمس کاربر مجاز است و بعد از دریافت طولانی فایل این اجازه تمام شده.
     پس فایل آماده می‌شود و با یک لمس تازه روی «ذخیره فایل» منوی اشتراک باز می‌شود */
  if(!window.AndroidBridge&&isTouch()&&navigator.canShare){const f=new File([buf],name,{type:'application/gzip'});if(navigator.canShare({files:[f]})){bkReady={f,name};
    sheet(`<div class="sh-h"><b>پشتیبان آماده است</b><button class="x" data-act="close">×</button></div><div class="muted" style="font-size:13.5px;line-height:1.9;margin-bottom:12px"><bdi dir="ltr">${esc(name)}</bdi> · ${fsz(buf.length)}<br>«ذخیره فایل» را بزنید و از منوی باز شده «Save to Files» یا تلگرام را انتخاب کنید.</div><div class="row"><button class="btn bkgo" data-act="bkShare">${ic('down')} ذخیره فایل</button></div>`);return}}
  await save(name,buf,'پشتیبان ذخیره شد ✓');bkSaved()}catch(e){toast('دانلود انجام نشد: '+e.message,true)}}
let bkReady=null;
/* فقط وقتی فایل واقعاً ذخیره شد، زمان آخرین دانلود ثبت می‌شود (روی سرور هم، برای گوشی‌های دیگر مدیر) */
function bkSaved(){ls.set('m_bk_dl',Date.now());api('/api/backup/saved',{}).catch(()=>{});if(BK)BK.lastDl=new Date().toISOString();if(cur==='backups'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}}
