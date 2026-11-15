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
/* v90.9: نام این کار stlAmtEd شد — قبلاً هم‌نام دکمه‌های «کل مانده / طلب ما» پنجره تسویه (ACT.stlAmt) بود و آن دکمه‌ها را از کار انداخته بود.
   سقف مبلغ = مبلغ فعلی + جای خالی (stlRoom)؛ کمتر شدن روی واریز بانکیِ ثبت‌شده «مانده» می‌سازد (stlSync) */
ACT.stlAmtEd=d=>{const e=entries.find(z=>String(z.id)===String(d.e));const z=e&&(e.settles||[])[+d.i];if(!z)return;if(z.st!=='wait'){toast('این تسویه تأیید شده؛ اول «لغو تأیید» بزنید',true);return}
  const fx=!!depBkFix(e),mx=(+z.amount||0)+stlRoom(e);
  sheet(`<div class="sh-h"><div><b>ویرایش مبلغ تسویه</b><small class="shsub">${esc(z.name||'')} → ${esc(fullName(e))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="px8a"><small>مبلغ واقعی واریز شده</small><label class="px8i"><input id="saA" class="ltr" inputmode="numeric" value="${Number(z.amount||0).toLocaleString('en-US')}" autocomplete="off" aria-label="مبلغ"><i>تومان</i></label><div class="px8l">قبلی <b class="n">${fmt(z.amount)}</b> تومان${z.byInv?' · ردیف سند پرداخت‌کننده هم عوض می‌شود':''}</div><div class="px8l sarm" id="saH"></div></div>
  <button class="xgo" data-act="stlAmtSave" data-e="${e.id}" data-i="${d.i}">${ic('check')} ذخیره مبلغ</button>`);
  const A=$('saA'),H=$('saH'),old=+z.amount||0,hint=()=>{const v=num(A.value);H.className='px8l sarm'+(v>mx?' bad':v&&v<old&&fx?' rm':'');H.innerHTML=!v||v===old?'':v>mx?'بیشتر از مانده این واریزی ('+fmt(mx)+')':v<old?(fx?`<b>${fmt(old-v)}</b> تومان «مانده» می‌شود · واریز بانکیِ ثبت‌شده عوض نمی‌شود`:`<b>${fmt(old-v)}</b> تومان به مانده بانکی برمی‌گردد`):`<b>${fmt(v-old)}</b> تومان از مانده کم می‌شود`};
  A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';hint()};selOnFocus(A);sheetFocus(A)};
ACT.stlAmtSave=d=>{const e=entries.find(z=>String(z.id)===String(d.e)),z=e&&(e.settles||[])[+d.i];if(!z)return;const a=num($('saA').value);if(!a){toast('مبلغ را وارد کنید',true);return}
  const old=+z.amount||0;if(a===old){closeSheet();return}
  if(a>old+stlRoom(e)){toast(stlBkLock(e)&&!depFreeSum(e)?STLLK:'بیشتر از مانده این واریزی است (حداکثر '+fmt(old+stlRoom(e))+')',true);return}
  if(a<old&&depBkFix(e)&&!remCan()){toast(REMNO,true);return}
  const now=new Date().toISOString();z.amount=a;z.edAt=now;z.edBy=who();
  if(z.byInv){const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx));const p=t&&(t.pays||[]).find(q=>String(q.stlId)===String(z.id));
    if(p){p.amount=(+p.amount<0?-1:1)*a;t.updatedAt=now;c.lastAt=now;saveCu()}}
  e.updatedAt=now;e.updatedBy=who();const rm=stlSync(e);saveE();logA('edit','ویرایش مبلغ تسویه',fullName(e)+' | '+(z.name||'')+' | '+fmt(old)+' ← '+fmt(a)+' تومان'+(rm>0?' | مانده '+fmt(rm)+' تومان':''),{ids:[e.id]});
  closeSheet();alloc=null;if(rm>0){const p=depFreeP(e).pop();pyFlash=p?p.id:null;setTimeout(()=>{pyFlash=null},1600)}const vw=$('view'),y=vw?vw.scrollTop:0;render();if(vw)vw.scrollTop=y;toast(rm>0?'مبلغ تسویه '+fmt(a)+' شد · '+remMsg(rm):'مبلغ تسویه '+fmt(a)+' تومان شد')};

/* v90.9 (خواسته صاحب اپ: «مانده در نظر بگیرد که از حساب بانکی واریز کنم»): «بانک مبلغ کمتری واریز کرد؟» در پنجره رسید/پیگیری هر واریز بانکیِ ارسال‌شده —
   مبلغ واقعی را بزنید؛ اختلاف «مانده» همان واریزی می‌شود (بخش بدون بانک، depRemAdd) و در لیست واریز تخصیص‌نخورده می‌آید. برای ردیف تأییدشده هم هست
   (اصلاح مبلغ واقعی است، نه تغییر بی‌صدا)؛ لیست بایگانی‌شده اول باید بازگشایی شود. واریزی‌هایی که پیش از این نسخه مبلغ بانکی‌شان با ویرایش تسویه بزرگ شده، با همین راه درست می‌شوند. */
ACT.itLess=()=>{const b=batches.find(z=>z.id==batchId),x=b&&b.items[itemIdx];if(!x)return;if(b.closed){toast('این لیست بایگانی شده؛ اول «بازگشایی لیست» را بزنید',true);return}
  sheet(`<div class="sh-h"><div><b>مبلغ واقعی واریز بانکی</b><small class="shsub">${esc(x.name||'')}${x.src?' · '+esc(x.src):''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="px8a"><small>بانک واقعاً چقدر واریز کرد؟</small><label class="px8i"><input id="ilA" class="ltr" inputmode="numeric" value="${Number(x.amount||0).toLocaleString('en-US')}" autocomplete="off" aria-label="مبلغ واقعی"><i>تومان</i></label><div class="px8l">ثبت‌شده <b class="n">${fmt(x.amount)}</b> تومان</div><div class="px8l sarm" id="ilH"></div></div>
  <button class="xgo" data-act="itLessSave">${ic('check')} ثبت</button>`);
  const A=$('ilA'),H=$('ilH'),old=+x.amount||0,hint=()=>{const v=num(A.value);H.className='px8l sarm'+(v>old?' bad':v&&v<old?' rm':'');H.innerHTML=!v||v===old?'':v>old?'بیشتر از مبلغ ثبت‌شده است':`<b>${fmt(old-v)}</b> تومان «مانده» می‌شود · بانکش را بعد انتخاب می‌کنید`};
  A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';hint()};selOnFocus(A);sheetFocus(A)};
ACT.itLessSave=()=>{const b=batches.find(z=>z.id==batchId),x=b&&b.items[itemIdx];if(!x)return;const e=entries.find(z=>z.id===x.id);if(!e){toast('واریزی این ردیف پیدا نشد',true);return}
  if(b.closed){toast('این لیست بایگانی شده؛ اول «بازگشایی لیست» را بزنید',true);return}
  const a=num($('ilA').value),old=+x.amount||0;if(!a){toast('مبلغ را وارد کنید',true);return}if(a===old){closeSheet();return}
  if(a>old){toast('بیشتر از مبلغ ثبت‌شده است؛ برای مبلغ بیشتر، خود واریزی را ویرایش کنید',true);return}
  const d=old-a,root=(e.splitOf!=null&&entries.find(z=>z.id===e.splitOf))||e,now=new Date().toISOString();
  e.amount=Math.max(0,(+e.amount||0)-d);e.updatedAt=now;e.updatedBy=who();x.amount=a;if(x.total!=null)x.total=Math.max(0,(+x.total||0)-d);x.at=now;
  const p=depRemAdd(root,d);saveE();saveB();alloc=null;logA('split','واریز بانکی کمتر از مبلغ ثبت‌شده',fullName(root)+' | '+(x.src||'بانک')+' | '+fmt(old)+' ← '+fmt(a)+' تومان | مانده '+fmt(d)+' تومان',{ids:[root.id]});
  closeSheet();pyFlash=p.id;setTimeout(()=>{pyFlash=null},1600);const vw=$('view'),y=vw?vw.scrollTop:0;render();if(vw)vw.scrollTop=y;toast(remMsg(d))};
