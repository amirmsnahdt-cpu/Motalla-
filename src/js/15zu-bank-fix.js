/* ---- v84.6 اصلاح مانده بانک با موجودی واقعی ----
   خواسته صاحب اپ: «با وارد کردن مانده واقعی سند اصلاحی بزند و مانده را درست کند؛ چون قبلاً رویه فرق می‌کرد و تأمین موجودی نداشتیم
   مانده را به بانک بدهکاریم در صورتی که این‌طور نیست. تا وقتی همه سیستمی وارد کنند: با گرفتن موجودی کارتخوان مغازه مانده بانک
   درست قید شود؛ مانده قبلی سند کسر/اضافه بخورد و کارتخوان هم خودکار سند بخورد».
   در پنجره تسویه سندِ حساب نوع بانک: «اصلاح مانده با موجودی واقعی» (CK.m='bfix'). ورودی: موجودی واقعی بانک (CK.bt) و
   کارتخوان‌های مغازه که هنوز سند نخورده (CK.bp). همین سند دو ردیف می‌گیرد:
   ۱) کارتخوان: bkx k:'bpos' (موجودی بانک زیاد)؛ ۲) کسر/اضافه با علت «مانده قبلی» (bkx k:'adj') = واقعی − (مانده فعلی + کارتخوان).
   مبلغ منفی در bkx = پول بانک زیاد (مثل واریز). مانده فعلی بانک = −svRBal() (مانده نهایی با همین سند). */
const bfxCur=()=>-svRBal();
const bfxIs=()=>{const c=svCu();return !!(c&&c.grp==='بانک')};
function bfxCalc(){const t=+CK.bt||0,p=+CK.bp||0,cur=bfxCur(),neg=!!CK.bneg,T=neg?-t:t;return {cur,p,T,d:T-cur,F:T+p,ok:CK.bt!==''&&CK.bt!=null}}/* v86.2: کارتخوان امروز هنوز در موجودی بانک نیست → اختلاف = واقعی − برنامه، مانده نهایی = واقعی + کارتخوان */
const bfxTile=()=>`<button type="button" class="bfxt" data-act="ckM" data-m="bfix"><i>${ic('tag')}</i><span><b>اصلاح مانده با موجودی واقعی</b><small>موجودی بانک + کارتخوان مغازه → سند کارتخوان و کسر/اضافه «اصلاح حساب»</small></span></button>`;
function bfxX(){const z=bfxCalc(),mv=v=>`${v<0?'−':''}${fmt(Math.abs(v))}`;if(!z.ok)return 'موجودی واقعی بانک را بزنید';
  return `<span>مانده فعلی در برنامه <b>${mv(z.cur)}</b></span>${z.p?`<span>کارتخوان <b class="ar">+${fmt(z.p)}</b></span>`:''}<span>${z.d>0?'کسر':z.d<0?'اضافه':'کسر/اضافه'} · اصلاح حساب <b class="${z.d>0?'ar':z.d<0?'ab':''}">${z.d?(z.d>0?'+':'−')+fmt(Math.abs(z.d)):'لازم نیست'}</b></span><span>مانده بعد از سند <b>${mv(z.F)}</b></span>`}
function bfxForm(){const v=x=>x===''||x==null?'':Number(x).toLocaleString('en-US');
  return `<div class="ckfm bfxf"><div class="ckfh"><b>${ic('tag')} اصلاح مانده بانک</b><span class="ckfa"><button class="lnk" data-act="ckM" data-m="">انصراف</button><button type="button" class="ckok" data-act="bfxAdd">${ic('check')} افزودن</button></span></div>
  <div class="ckg"><label class="ckf"><small>موجودی واقعی بانک (تومان)</small><input id="bfT" class="ltr" inputmode="numeric" value="${v(CK.bt)}" autocomplete="off" enterkeyhint="next"></label><label class="ckf"><small>کارتخوان مغازه <i>(سند نخورده)</i></small><input id="bfP" class="ltr" inputmode="numeric" value="${v(CK.bp)}" autocomplete="off" enterkeyhint="done"></label></div>
  <button type="button" class="bfxn${CK.bneg?' on':''}" data-act="bfxNeg">${CK.bneg?'✓ ':''}موجودی منفی است (اضافه برداشت)</button>
  <div class="ckx bfxx" id="bfX">${bfxX()}</div></div>`}
function bfxRead(){const T=$('bfT'),P=$('bfP');if(T)CK.bt=T.value.trim()===''?'':num(T.value);if(P)CK.bp=num(P.value)||''}
function bfxBind(){const T=$('bfT'),P=$('bfP');if(!T)return;[T,P].forEach(e=>{selOnFocus(e);e.oninput=()=>{const n=num(e.value);e.value=n?n.toLocaleString('en-US'):e===T&&/\d/.test(toEn(e.value))?'0':'';bfxRead();const x=$('bfX');if(x)x.innerHTML=bfxX()}});
  T.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();P.focus()}};P.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.bfxAdd()}}}
ACT.bfxNeg=()=>{bfxRead();CK.bneg=CK.bneg?0:1;ckRe()};
/* ردیف‌ها را به همین سند اضافه می‌کند؛ ثبت با «پایان و ثبت سند» (یا «ثبت» بالای سند) */
function bfxApply(){bfxRead();const z=bfxCalc();if(!z.ok){toast('موجودی واقعی بانک را بزنید',true);const e=$('bfT');if(e)e.focus();return false}
  if(z.p)sv.pays.push({m:'bkx',k:'bpos',amount:-z.p,dir:'out',why:'کارتخوان مغازه'});
  if(z.d)sv.pays.push({m:'bkx',k:'adj',amount:-z.d,dir:z.d>0?'out':'in',why:'اصلاح حساب'});
  if(!z.p&&!z.d)toast('مانده همین است؛ ردیفی لازم نبود');else toast('ردیف اصلاحی اضافه شد');CK={m:''};ckBackToDoc();return true}
ACT.bfxAdd=()=>{bfxApply()};
/* ---- v85.1 «اصلاح موجودی» از خود صفحه حساب بانک (خواسته صاحب اپ: «اصلاح موجودی بهتر شود و از صفحه اول حساب هم بشود») ----
   دکمه زیر کارت مانده (bkFixBtn) → پنجره BFX: مانده فعلی (بزرگ)، کادر موجودی واقعی بانک (+ «منفی است»)، کارتخوان امروز (اختیاری)،
   دفتر زنده (فعلی → کارتخوان → کسر/اضافه مانده قبلی → مانده بعد از سند) و «ثبت سند اصلاحی» که یک سند واقعی می‌زند
   (همان ردیف‌های bkx bpos / adj پنجره تسویه؛ بی‌نیاز از باز کردن صفحه سند). حساب = همان محاسبه bfxZ */
let BFX=null;
function bfxZ(cur,bt,bp,neg){const t=+bt||0,p=+bp||0,T=neg?-t:t;return {cur,p,T,d:T-cur,F:T+p,ok:bt!==''&&bt!=null}}
/* v85.9 (خواسته صاحب اپ: «سند کارتخوان هم مجزا کنار اصلاح موجودی»): دو کاشی کنار هم زیر کارت مانده — اصلاح موجودی (آبی) و کارتخوان (سبز) */
const bkFixBtn=c=>c&&c.grp==='بانک'&&can('debt')?`<div class="bkfx2"><button type="button" class="bkq b" data-act="bkFix" data-cu="${c.id}"><span class="bkqi">${ic('tag')}</span><span class="bkqt"><strong>اصلاح موجودی</strong><em>با موجودی واقعی بانک</em></span></button><button type="button" class="bkq g" data-act="bkPos" data-cu="${c.id}"><span class="bkqi">${ic('card')}</span><span class="bkqt"><strong>کارتخوان</strong><em>سند کارتخوان این بانک</em></span></button></div>`:'';
const bfxMv=v=>`${v<0?'−':''}${fmt(Math.abs(v))}`,bfxCl=v=>v>0?'r':v<0?'b':'z';
/* v85.6 (خواسته صاحب اپ: «پنجره اصلاح موجودی جالب نیست — راحت، کاربردی، ساده و شکیل»): یک کادر بزرگ وسط برای موجودی واقعی بانک
   (دکمه کوچک «−» برای منفی)، مانده برنامه زیرش برای مقایسه، یک خط نتیجه رنگی (کسر/اضافه یا «برابر است»)، کارتخوان امروز فقط با
   «+ کارتخوان امروز» باز می‌شود؛ بی دفتر طولانی */
/* v85.8 (خواسته صاحب اپ: «به‌روزتر، شبیه سیستم‌های قدیمی نباشد»): کارت رنگی همان بانک (مانده در برنامه)، ورود مبلغ بزرگ بی‌کادر
   (مثل Apple Cash) با سوئیچ «مثبت / منفی»، یک کارت اختلاف با فلش، کارتخوان به‌صورت چیپ */
const bkClr=c=>{const b=bkOfCu(c),k=b&&(BKC[b]?b:Object.keys(BKC).find(n=>canon(n)===canon(b)));return k?BKC[k]:'#2563eb'};
function bfxRes(){const c=custs.find(z=>String(z.id)===String(BFX.cu));const z=bfxZ(bkCuBal(c),BFX.bt,BFX.bp,BFX.neg);
  if(!z.ok)return `<div class="bf3d n"><span class="bf3di">${ic('edit')}</span><span class="tx"><b>موجودی بانک را بزنید</b><small>اختلاف خودش حساب می‌شود</small></span></div>`;
  if(!z.d)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>برنامه با بانک یکی است</b><small>${z.p?'فقط کارتخوان سند می‌خورد · مانده '+bfxMv(z.F):'سندی لازم نیست'}</small></span></div>`;
  /* v91.2 (خواسته صاحب اپ: «کادرهای اصلاح حساب درست نیست»): به زبان خود بانک — موجودی واقعی کمتر است = «از موجودی کم می‌شود» (قرمز، −)، بیشتر = «به موجودی اضافه می‌شود» (سبز، +).
     قبلاً نام ردیف سند («کسر/اضافه») نوشته می‌شد که برعکسِ حس کاربر بود (موجودی کم می‌شد ولی «اضافه» می‌نوشت) */
  return `<div class="bf3d ${z.d>0?'g':'r'}"><span class="bf3di">${ic(z.d>0?'dIn':'dOut')}</span><span class="tx"><b>${z.d>0?'به موجودی اضافه می‌شود':'از موجودی کم می‌شود'}</b><small>سند اصلاح حساب · مانده بعد از سند${z.p?'ها':''} ${bfxMv(z.F)}</small></span><em data-v="${Math.abs(z.d)}">${z.d>0?'+':'−'}${fmt(Math.abs(z.d))}</em></div>`}
/* نوار کوچک بانک (لوگو، نام، مانده در برنامه) بالای پنجره‌های اصلاح موجودی و کارتخوان */
const bkStrip=(c,cur)=>`<div class="bf4b" style="--bk:${bkClr(c)}">${bkAvH(c)||`<span class="ckbi">${ic('bank')}</span>`}<span class="tx"><b>${esc(cuName(c))}</b><small>مانده در برنامه</small></span><b class="bf4v ${cur>0?'r':cur<0?'b':'z'}">${cur<0?'−':''}${fmt(Math.abs(cur))}<i>تومان</i></b></div>`;
function bfxHTML(){const c=custs.find(z=>String(z.id)===String(BFX.cu));if(!c)return '';const cur=bkCuBal(c),v=x=>x===''||x==null?'':Number(x).toLocaleString('en-US');
  return `<div class="sh-h"><div><b>اصلاح موجودی</b><small class="shsub">موجودی واقعی بانک را بزنید؛ اختلاف خودش سند می‌خورد</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bf3 bf4">${bkStrip(c,cur)}
  <div class="ckcl">موجودی واقعی بانک الان چقدر است؟</div>
  <div class="ckbg"><label class="ckbig${BFX.neg?' ng':''}">${BFX.neg?'<em>−</em>':''}<input id="bxT" class="ltr" inputmode="numeric" value="${v(BFX.bt)}" placeholder="${fmt(Math.abs(cur))}" autocomplete="off" enterkeyhint="done" aria-label="موجودی واقعی بانک"><i>تومان</i></label>
  <div class="ckq"><button type="button" class="${BFX.bt===0&&!BFX.neg?'on':''}" data-act="bfxZero">${BFX.bt===0&&!BFX.neg?ic('check')+' ':''}موجودی صفر است</button><button type="button" class="${BFX.neg?'on':''}" data-act="bfxSNeg">${BFX.neg?ic('check')+' موجودی منفی است':'موجودی بانک منفی است؟'}</button></div></div>
  <div id="bxL">${bfxRes()}</div>
  ${BFX.pos?`<div class="ckcl">کارتخوان امروز <i>هنوز به بانک ننشسته · سند جدا</i></div><div class="ckbg"><label class="ckbig gn"><input id="bxP" class="ltr" inputmode="numeric" value="${v(BFX.bp)}" placeholder="0" autocomplete="off" enterkeyhint="done" aria-label="کارتخوان امروز"><i>تومان</i></label></div>`:`<button type="button" class="bf3c" data-act="bfxPos">${ic('card')} افزودن کارتخوان امروز</button>`}
  <button type="button" class="xgo" data-act="bfxSave">${ic('check')} ثبت</button></div>`}
function bfxSRead(){const T=$('bxT'),P=$('bxP');if(T)BFX.bt=T.value.trim()===''?'':num(T.value);if(P)BFX.bp=num(P.value)||''}
function bfxSBind(f){const T=$('bxT'),P=$('bxP');if(!T)return;phPaint($('sheet'));[T,P].filter(Boolean).forEach(e=>{selOnFocus(e);e.oninput=()=>{const n=num(e.value);e.value=n?n.toLocaleString('en-US'):e===T&&/\d/.test(toEn(e.value))?'0':'';bfxSRead();const L=$('bxL');if(L){if(typeof numMorph==='function')numMorph('#bxL em',()=>{L.innerHTML=bfxRes()});else L.innerHTML=bfxRes()}};e.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();e.blur()}}});
  const el=f&&$(f);if(el)sheetFocus(el)}
ACT.bkFix=d=>{if(!can('debt'))return;BFX={cu:d.cu,bt:'',bp:'',neg:0,pos:0};sheet(bfxHTML());bfxSBind('bxT')};
ACT.bfxSNeg=d=>{bfxSRead();const n=d&&d.v!=null?+d.v:(BFX.neg?0:1);if(n===BFX.neg)return;BFX.neg=n;$('sheet').innerHTML=bfxHTML();bfxSBind()};
/* v98.4 (خواسته صاحب اپ: «موجودی بانک را نمی‌توانم صفر کنم»): «۰» با صفحه‌کلید فارسی آیفون پاک می‌شد (/\d/ فقط رقم انگلیسی را می‌شناسد)؛ حالا هم رقم فارسی قبول است و هم یک دکمه «موجودی صفر است» */
ACT.bfxZero=()=>{bfxSRead();BFX.bt=0;BFX.neg=0;$('sheet').innerHTML=bfxHTML();bfxSBind()};
ACT.bfxPos=()=>{bfxSRead();BFX.pos=1;$('sheet').innerHTML=bfxHTML();bfxSBind('bxP')};
ACT.bfxSave=()=>{bfxSRead();const c=custs.find(z=>String(z.id)===String(BFX.cu));if(!c)return;const z=bfxZ(bkCuBal(c),BFX.bt,BFX.bp,BFX.neg);
  if(!z.ok){toast('موجودی واقعی بانک را بزنید',true);const e=$('bxT');if(e)e.focus();return}if(!z.d&&!z.p){toast('مانده برنامه با بانک یکی است؛ سندی لازم نیست');closeSheet();return}
  /* v86.2 (خواسته صاحب اپ): دو سند جدا — «اصلاح حساب» (اختلاف) و «کارتخوان» (سبز، posm) */
  const now=ns(),N=[],mk=(pays,ex)=>{const no=invNext(),t={id:nid++,type:'inv',no,cn:cnNext(c),date:todayISO(),rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays,at:now,by:who(),...ex};(c.txs=c.txs||[]).push(t);N.push(t);return t};
  if(z.d)mk([{m:'bkx',k:'adj',amount:-z.d,dir:z.d>0?'out':'in',why:'اصلاح حساب'}],{fix:1});
  if(z.p)mk([{m:'bkx',k:'bpos',amount:-z.p,dir:'out',why:'کارتخوان امروز'}],{posm:1});
  c.lastAt=now;saveCu();logA('cust','اصلاح موجودی بانک',cuName(c)+' | سند '+N.map(t=>toFa(t.no)).join('، ')+' | مانده '+bfxMv(z.F),{cu:c.id,tx:N[0].id});BFX=null;closeSheet();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast((N.length>1?'سند اصلاحی و کارتخوان':z.d?'سند اصلاحی':'سند کارتخوان')+' ثبت شد · مانده '+bfxMv(z.F))};
/* رنگ ردیف‌های گردش حساب: بانک — کارتخوان سبز، واریز (پول به بانک) قرمز، برداشت آبی؛ v85.3 همه حساب‌ها — قرمز طلبکاریم، آبی بدهکاریم
   (اثر تومان، اگر نبود طلا، بعد سکه/ارز) */
function bkRowCls(t,d,bk){if(bk!==false&&t.type==='inv'){const P=(t.pays||[]).filter(p=>+p.amount);if(t.pd||(P.length&&P.every(p=>p.m==='pos'||p.lm==='pos'||(p.m==='bkx'&&p.k==='bpos'))))return 'tg'}const r=d?(Math.round(d.r||0)||Math.round((d.g||0)*1000)||Object.values(d.x||{}).find(v=>Math.round(v*100))||0):0;return r<0?'trd':r>0?'tbl':''}

/* v85.9 سند کارتخوان مستقیم از صفحه حساب بانک: مبلغ (+ شرح اختیاری) → یک سند با ردیف bkx bpos (موجودی بانک زیاد) */
let BPS=null;
function bpsHTML(){const c=custs.find(z=>String(z.id)===String(BPS.cu));if(!c)return '';const cur=bkCuBal(c),a=+BPS.a||0,v=x=>x?Number(x).toLocaleString('en-US'):'';
  return `<div class="sh-h"><div><b>سند کارتخوان</b><small class="shsub">مبلغی که کارتخوان به این حساب نشانده</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bf3 bf4">${bkStrip(c,cur)}
  <div class="ckbg"><label class="ckbig gn"><input id="bpA" class="ltr" inputmode="numeric" value="${v(BPS.a)}" placeholder="مبلغ کارتخوان" autocomplete="off" enterkeyhint="next" aria-label="مبلغ کارتخوان"><i>تومان</i></label></div>
  <label class="ckf ckf1"><small>شرح <i>(اختیاری)</i></small><input id="bpN" value="${esc(BPS.why||'')}" placeholder="شماره پایانه، تاریخ…" autocomplete="off" enterkeyhint="done"></label>
  <div id="bpL">${bpsRes(cur,a)}</div>
  <button type="button" class="xgo" data-act="bpsSave">${ic('check')} ثبت</button></div>`}
const bpsRes=(cur,a)=>a?`<div class="bf3d g"><span class="bf3di">${ic('dIn')}</span><span class="tx"><b>به موجودی اضافه می‌شود</b><small>مانده بعد از سند ${bfxMv(cur+a)}</small></span><em>+${fmt(a)}</em></div>`:`<div class="bf3d n"><span class="bf3di">${ic('card')}</span><span class="tx"><b>مبلغ کارتخوان را بزنید</b><small>مانده فعلی ${bfxMv(cur)} تومان</small></span></div>`;
function bpsBind(f){const A=$('bpA'),N=$('bpN');if(!A)return;selOnFocus(A);A.oninput=()=>{const n=num(A.value);A.value=n?n.toLocaleString('en-US'):'';BPS.a=n||'';const c=custs.find(z=>String(z.id)===String(BPS.cu)),L=$('bpL');if(c&&L)numMorph('#bpL em',()=>{L.innerHTML=bpsRes(bkCuBal(c),+BPS.a||0)})};
  A.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();N&&N.focus()}};if(N){N.oninput=()=>{BPS.why=N.value};N.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();N.blur()}}}const el=f&&$(f);if(el)sheetFocus(el)}
ACT.bkPos=d=>{if(!can('debt'))return;BPS={cu:d.cu,a:'',why:''};sheet(bpsHTML());bpsBind('bpA')};
ACT.bpsSave=()=>{const c=BPS&&custs.find(z=>String(z.id)===String(BPS.cu));if(!c)return;const a=+BPS.a||0;if(!(a>0)){toast('مبلغ کارتخوان را بزنید',true);const e=$('bpA');if(e)e.focus();return}
  const now=ns(),no=invNext(),w=clean(BPS.why||''),t={id:nid++,type:'inv',no,cn:cnNext(c),date:todayISO(),rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays:[{m:'bkx',k:'bpos',amount:-a,dir:'out',...(w?{why:w}:{})}],at:now,by:who(),posm:1};
  (c.txs=c.txs||[]).push(t);c.lastAt=now;saveCu();logA('cust','سند کارتخوان',cuName(c)+' | سند '+toFa(no)+' | '+fmt(a)+' تومان',{cu:c.id,tx:t.id});BPS=null;closeSheet();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast('سند کارتخوان '+toFa(no)+' ثبت شد · '+fmt(a)+' تومان')};

/* v86.1 (خواسته صاحب اپ: «برای اصلاح موجودی هم هر موجودی مطابق کارت بانکی»): کارت بانکی با کادر ورود مبلغ داخلش —
   سرتیتر لوگو/نام + دکمه شیشه‌ای (مثبت/منفی یا برچسب)، نوار شیشه‌ای «مانده در برنامه»، برچسب و عدد بزرگ سفید قابل تایپ */
function bkInCard(c,o){return `<div class="bkc lg bkin" style="--bk:${bkClr(c)}">${bkWmH(c)}<i class="bkcg" aria-hidden="true"></i>
  <span class="bkch"><span class="bkcl">${bkAvH(c)||ic('bank')}</span><span class="bkcn"><b>${esc(cuName(c))}</b>${c.cno?`<small>حساب ${toFa(c.cno)}</small>`:''}</span>${o.top||''}</span>
  <span class="bkic"><small>مانده در برنامه</small><b>${bfxMv(o.cur)}<i> تومان</i></b></span>
  <label class="bkii"><small>${o.label}</small><span class="bkiv">${o.plus?'<em>+</em>':o.neg?'<em>−</em>':''}<input id="${o.id}" class="ltr" inputmode="numeric" value="${o.val}" placeholder="${o.ph}" autocomplete="off" enterkeyhint="done"><i>تومان</i></span></label></div>`}
/* v86.0 (خواسته صاحب اپ: «هر کادر مانده شبیه کارت بانکی خودش؛ این طراحی را همه‌جا به کار ببر»): کارت بانکی bkCardH
   = گرادیان رنگ همان بانک (bkClr)، لوگوی سفید، نام و شماره حساب، «مانده حساب»، عدد بزرگ سفید + برچسب طلبکاریم/بدهکاریم، نقش کم‌رنگ لوگو.
   lg = کارت مانده صفحه حساب بانک؛ sm = هر ردیف زبانه بانک (زدن = باز کردن حساب) */
function bkCardH(c,sz,attr){const v=bkCuBal(c),t=sz==='sm'?'button':'div';
  return `<${t} ${t==='button'?'type="button" ':''}class="bkc ${sz||'lg'}${v<0?' neg':''}" style="--bk:${bkClr(c)}"${attr||''}>${bkWmH(c)}<i class="bkcg" aria-hidden="true"></i>
  <span class="bkch"><span class="bkcl">${bkAvH(c)||ic('bank')}</span><span class="bkcn"><b>${esc(cuName(c))}</b>${c.cno?`<small>حساب ${toFa(c.cno)}</small>`:''}</span>${sz==='sm'?ic('back').replace('class="i"','class="i flip bkcx"'):''}</span>
  <span class="bkcb"><small>مانده حساب</small><span class="bkcv ${v>0?'kr':v<0?'kb':'kz'}"><b data-v="${Math.abs(v)}">${v?fmt(Math.abs(v)):'صفر'}</b><i>تومان</i></span><em class="${v>0?'kr':v<0?'kb':'kz'}">${v>0?'طلبکاریم':v<0?'بدهکاریم':'تسویه'}</em></span></${t}>`}

/* v86.9 (خواسته صاحب اپ: «منابعی که بانک نیستند را از همین‌جا با افزودن نام بانک به بانک تبدیل کنم»): وصل منبع به حساب بانکی
   موجود (بدون منبع) یا ساخت حساب بانکی تازه با نام همین منبع → c.srcId = منبع؛ موجودی از آن حساب می‌آید */
ACT.aSrcLink=(d,e)=>{const so=sources.find(x=>String(x.id)===String(d.id));if(!so)return;const T=e&&e.target&&e.target.closest('button');
  const free=srcLinkCands();
  popMenu(T,[['aSrcLinkGo',ic('plus'),'حساب بانکی تازه «'+so.name+'»',{id:so.id,cu:''}],...free.map(c=>['aSrcLinkGo',ic('bank'),cuName(c)+' · '+bfxMv(bkCuBal(c)),{id:so.id,cu:c.id}])])};
ACT.aSrcLinkGo=d=>{const so=sources.find(x=>String(x.id)===String(d.id));if(!so)return;let c=d.cu?custs.find(z=>String(z.id)===String(d.cu)):null;
  c=srcLinkDo(so,c);if(!c)return;aSt.srcId=so.id;if(aSt.method==='amount'&&aSt.amtAuto!==0)aSt.amount=aFill(so);allocSheet();recalc();toast('«'+so.name+'» به حساب بانکی وصل شد')};
