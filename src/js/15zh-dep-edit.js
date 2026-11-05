/* ===== v78.0 (خواسته صاحب اپ) =====
   ۱) «تاریخ واریز» هر بخش بانکی ارسال‌نشده جدا: بخشی از مانده یک واریزی پس‌فردا را می‌شود به لیست فردا برد
      (بخش اول با «افزودن پرداخت › بانک» جدا می‌شود، بعد این‌جا تاریخش عوض می‌شود). بخش به لیست همان روز با همان بانک می‌رود.
   ۲) «ویرایش مبلغ» تسویه مشتری در انتظار تأیید (مثلاً سند دریافت ۸ میلیارد که واقعاً ۷٫۵۵ واریز شد) — مبلغ تسویه و ردیف سند
      طرف پرداخت‌کننده با هم عوض می‌شوند. */
ACT.pkDate=d=>{const r=entries.find(z=>String(z.id)===String(d.id));if(!r||r.sentBid){toast('این بخش ارسال شده؛ تاریخش از لیست واریز عوض می‌شود',true);return}
  const v=validated().find(z=>z.id===r.id);openCal(PD(v||r),iso=>{const old=PD(v||r);if(iso===old)return;let fp=null;for(const k in drafts){fp=(drafts[k]||[]).find(p=>p&&!p.sent&&(p.ids||[]).includes(r.id));if(fp)break}
    r.payDate=iso;r.updatedAt=new Date().toISOString();r.updatedBy=who();saveE();
    if(fp){const so=sources.find(s=>String(s.id)===String(fp.src.id))||sources.find(s=>s.name===fp.src.name);if(so){const k0=ldKey;ldKey=iso;try{moveTo([r.id],fp,so)}finally{ldKey=k0}}}
    logA('split','تغییر تاریخ واریز بخش',fullName(r)+' | '+fmt(+r.amount||0)+' تومان | '+dates(old).fa+' ← '+dates(iso).fa,{ids:[r.id]});alloc=null;
    const vw=$('view'),y=vw?vw.scrollTop:0;render();if(vw)vw.scrollTop=y;toast('این بخش به لیست واریز '+payLab(iso)+' رفت')})};
ACT.stlAmt=d=>{const e=entries.find(z=>String(z.id)===String(d.e));const z=e&&(e.settles||[])[+d.i];if(!z)return;if(z.st!=='wait'){toast('این تسویه تأیید شده؛ اول «لغو تأیید» بزنید',true);return}
  sheet(`<div class="sh-h"><div><b>ویرایش مبلغ تسویه</b><small class="shsub">${esc(z.name||'')} → ${esc(fullName(e))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="px8a"><small>مبلغ واقعی واریز شده</small><label class="px8i"><input id="saA" class="ltr" inputmode="numeric" value="${Number(z.amount||0).toLocaleString('en-US')}" autocomplete="off" aria-label="مبلغ"><i>تومان</i></label><div class="px8l">قبلی <b class="n">${fmt(z.amount)}</b> تومان${z.byInv?' · ردیف سند پرداخت‌کننده هم عوض می‌شود':''}</div></div>
  <button class="xgo" data-act="stlAmtSave" data-e="${e.id}" data-i="${d.i}">${ic('check')} ذخیره مبلغ</button>`);
  const A=$('saA');A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};selOnFocus(A);sheetFocus(A)};
ACT.stlAmtSave=d=>{const e=entries.find(z=>String(z.id)===String(d.e)),z=e&&(e.settles||[])[+d.i];if(!z)return;const a=num($('saA').value);if(!a){toast('مبلغ را وارد کنید',true);return}
  const old=+z.amount||0;if(a===old){closeSheet();return}const now=new Date().toISOString();z.amount=a;z.edAt=now;z.edBy=who();
  if(z.byInv){const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx));const p=t&&(t.pays||[]).find(q=>String(q.stlId)===String(z.id));
    if(p){p.amount=(+p.amount<0?-1:1)*a;t.updatedAt=now;c.lastAt=now;saveCu()}}
  e.updatedAt=now;e.updatedBy=who();if(typeof stlSync==='function')stlSync(e);saveE();logA('edit','ویرایش مبلغ تسویه',fullName(e)+' | '+(z.name||'')+' | '+fmt(old)+' ← '+fmt(a)+' تومان',{ids:[e.id]});
  closeSheet();alloc=null;const vw=$('view'),y=vw?vw.scrollTop:0;render();if(vw)vw.scrollTop=y;toast('مبلغ تسویه '+fmt(a)+' تومان شد')};
