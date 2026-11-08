/* ============ v79.2 (خواسته صاحب اپ: «اگر کاربری حذف شد، اطلاعاتی که وارد کرده از بین نرود») ============
   روی سرور چیزی پاک نمی‌شود: سندها فقط نام ثبت‌کننده را دارند و حذف کاربر فقط نشست‌ها و کلید اثر انگشتش را می‌برد.
   خطر روی گوشی بود: وقتی سرور ورود را نمی‌پذیرد (کاربر حذف/غیرفعال شده، رمز عوض شده، نشست تمام شده) forceLogout همه داده‌های
   گوشی را پاک می‌کرد، از جمله تغییرهایی که هنوز به سرور نرسیده بودند. حالا پیش از پاک کردن، همین تغییرها (و صف عکس‌های
   ارسال‌نشده) جدا نگه داشته می‌شوند (m_held)؛ بعد از ورود بعدی روی همین گوشی یک پنجره می‌پرسد «ارسال به سرور؟».
   سرور مثل همیشه مجوزها را بررسی و ادغام سه‌طرفه می‌کند؛ ردیف تاریخچه به نام کسی که الان ارسال می‌کند ثبت می‌شود. */
function heldSave(){let ch=[],q=[];
  try{for(const c in SYNC)markDirty(c)}catch(e){}
  try{for(const pk in SY.pend){const i=pk.indexOf('|'),c=pk.slice(0,i),id=pk.slice(i+1);if(!SYNC[c])continue;const r=SYNC[c].get().find(x=>x&&String(x.id)===id);if(!r&&SYNC[c].noDel)continue;
    ch.push({coll:c,id,base:SY.pend[pk]===null?null:JSON.parse(SY.pend[pk]),data:r?JSON.parse(sj(r)):null})}}catch(e){}
  try{q=ls.get('m_imgq',[])||[]}catch(e){}
  if(!ch.length&&!q.length)return 0;
  const O=ls.get('m_held',null)||{},seen=new Set(ch.map(x=>x.coll+'|'+x.id));
  ls.set('m_held',{who:(ME&&ME.name)||user||'',at:new Date().toISOString(),changes:ch.concat((O.changes||[]).filter(x=>!seen.has(x.coll+'|'+x.id))),imgq:[...new Set([...(O.imgq||[]),...q])]});
  return ch.length}
function heldOffer(){const H=ls.get('m_held',null);if(!H||!TOKEN)return;const n=(H.changes||[]).length,m=(H.imgq||[]).length;if(!n&&!m)return;
  sheet(`<div class="sh-h"><div><b>تغییرهای ارسال‌نشده روی این گوشی</b><small class="shsub">از «${esc(H.who||'کاربر قبلی')}» · ${esc(dates(String(H.at||'').slice(0,10)||todayISO()).fa)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="kvs"><div class="kv"><small>تغییر در اطلاعات</small><b>${fmt(n)}</b></div>${m?`<div class="kv"><small>عکس رسید</small><b>${fmt(m)}</b></div>`:''}</div>
  <p class="muted" style="font-size:13px;line-height:1.9;margin:4px 2px 12px">این‌ها قبل از بیرون رفتن از حساب به سرور نرسیده بودند و پاک نشدند. با ارسال، سرور با اطلاعات فعلی یکی‌شان می‌کند؛ مجوزهای حساب شما بررسی می‌شود.</p>
  <div class="row"><button class="btn sec" data-act="close">بعداً</button><button class="btn" data-act="heldSend">${ic('check')} ارسال به سرور</button></div>`)}
ACT.heldSend=async()=>{const H=ls.get('m_held',null);if(!H||!TOKEN)return;closeSheet();
  try{if((H.imgq||[]).length){ls.set('m_imgq',[...new Set([...(ls.get('m_imgq',[])||[]),...H.imgq])]);try{flushImgs()}catch(e){}}
    let r={rejected:[]};if((H.changes||[]).length)r=await api('/api/sync',{since:SY.since||0,changes:H.changes});
    const bad=(r.rejected||[]).length,ok=(H.changes||[]).length-bad;ls.set('m_held',null);
    logA('sync','ارسال تغییرهای مانده روی گوشی',(H.who||'')+' | '+fmt(ok)+' تغییر'+(bad?' | '+fmt(bad)+' رد شد':''));
    try{await refreshAll()}catch(e){}render();toast(bad?fmt(ok)+' تغییر ارسال شد؛ '+fmt(bad)+' مورد را مجوز شما اجازه نداد':'تغییرهای مانده به سرور رسید',!!bad)}
  catch(e){toast('ارسال نشد؛ بعداً دوباره امتحان کنید',true)}};
