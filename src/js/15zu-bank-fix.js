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
function bfxCalc(){const t=+CK.bt||0,p=+CK.bp||0,cur=bfxCur(),neg=!!CK.bneg,T=neg?-t:t;return {cur,p,T,d:T-(cur+p),ok:CK.bt!==''&&CK.bt!=null}}
const bfxTile=()=>`<button type="button" class="bfxt" data-act="ckM" data-m="bfix"><i>${ic('tag')}</i><span><b>اصلاح مانده با موجودی واقعی</b><small>موجودی بانک + کارتخوان مغازه → سند کارتخوان و کسر/اضافه «مانده قبلی»</small></span></button>`;
function bfxX(){const z=bfxCalc(),mv=v=>`${v<0?'−':''}${fmt(Math.abs(v))}`;if(!z.ok)return 'موجودی واقعی بانک را بزنید';
  return `<span>مانده فعلی در برنامه <b>${mv(z.cur)}</b></span>${z.p?`<span>کارتخوان <b class="ar">+${fmt(z.p)}</b></span>`:''}<span>${z.d>0?'کسر':z.d<0?'اضافه':'کسر/اضافه'} · مانده قبلی <b class="${z.d>0?'ar':z.d<0?'ab':''}">${z.d?(z.d>0?'+':'−')+fmt(Math.abs(z.d)):'لازم نیست'}</b></span><span>مانده بعد از سند <b>${mv(z.T)}</b></span>`}
function bfxForm(){const v=x=>x?Number(x).toLocaleString('en-US'):'';
  return `<div class="ckfm bfxf"><div class="ckfh"><b>${ic('tag')} اصلاح مانده بانک</b><span class="ckfa"><button class="lnk" data-act="ckM" data-m="">انصراف</button><button type="button" class="ckok" data-act="bfxAdd">${ic('check')} افزودن</button></span></div>
  <div class="ckg"><label class="ckf"><small>موجودی واقعی بانک (تومان)</small><input id="bfT" class="ltr" inputmode="numeric" value="${v(CK.bt)}" autocomplete="off" enterkeyhint="next"></label><label class="ckf"><small>کارتخوان مغازه <i>(سند نخورده)</i></small><input id="bfP" class="ltr" inputmode="numeric" value="${v(CK.bp)}" autocomplete="off" enterkeyhint="done"></label></div>
  <button type="button" class="bfxn${CK.bneg?' on':''}" data-act="bfxNeg">${CK.bneg?'✓ ':''}موجودی منفی است (اضافه برداشت)</button>
  <div class="ckx bfxx" id="bfX">${bfxX()}</div></div>`}
function bfxRead(){const T=$('bfT'),P=$('bfP');if(T)CK.bt=T.value.trim()===''?'':num(T.value);if(P)CK.bp=num(P.value)||''}
function bfxBind(){const T=$('bfT'),P=$('bfP');if(!T)return;[T,P].forEach(e=>{selOnFocus(e);e.oninput=()=>{const n=num(e.value);e.value=n?n.toLocaleString('en-US'):e===T&&/\d/.test(e.value)?'0':'';bfxRead();const x=$('bfX');if(x)x.innerHTML=bfxX()}});
  T.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();P.focus()}};P.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.bfxAdd()}}}
ACT.bfxNeg=()=>{bfxRead();CK.bneg=CK.bneg?0:1;ckRe()};
/* ردیف‌ها را به همین سند اضافه می‌کند؛ ثبت با «پایان و ثبت سند» (یا «ثبت» بالای سند) */
function bfxApply(){bfxRead();const z=bfxCalc();if(!z.ok){toast('موجودی واقعی بانک را بزنید',true);const e=$('bfT');if(e)e.focus();return false}
  if(z.p)sv.pays.push({m:'bkx',k:'bpos',amount:-z.p,dir:'out',why:'کارتخوان مغازه'});
  if(z.d)sv.pays.push({m:'bkx',k:'adj',amount:-z.d,dir:z.d>0?'out':'in',why:'مانده قبلی'});
  if(!z.p&&!z.d)toast('مانده همین است؛ ردیفی لازم نبود');else toast('ردیف اصلاحی اضافه شد');CK={m:''};ckBackToDoc();return true}
ACT.bfxAdd=()=>{bfxApply()};
/* ---- v85.1 «اصلاح موجودی» از خود صفحه حساب بانک (خواسته صاحب اپ: «اصلاح موجودی بهتر شود و از صفحه اول حساب هم بشود») ----
   دکمه زیر کارت مانده (bkFixBtn) → پنجره BFX: مانده فعلی (بزرگ)، کادر موجودی واقعی بانک (+ «منفی است»)، کارتخوان امروز (اختیاری)،
   دفتر زنده (فعلی → کارتخوان → کسر/اضافه مانده قبلی → مانده بعد از سند) و «ثبت سند اصلاحی» که یک سند واقعی می‌زند
   (همان ردیف‌های bkx bpos / adj پنجره تسویه؛ بی‌نیاز از باز کردن صفحه سند). حساب = همان محاسبه bfxZ */
let BFX=null;
function bfxZ(cur,bt,bp,neg){const t=+bt||0,p=+bp||0,T=neg?-t:t;return {cur,p,T,d:T-(cur+p),ok:bt!==''&&bt!=null}}
const bfxRows=z=>z.ok?[...(z.p?[{m:'bkx',k:'bpos',amount:-z.p,dir:'out',why:'کارتخوان مغازه'}]:[]),...(z.d?[{m:'bkx',k:'adj',amount:-z.d,dir:z.d>0?'out':'in',why:'مانده قبلی'}]:[])]:[];
const bkFixBtn=c=>c&&c.grp==='بانک'&&can('debt')?`<button type="button" class="bkfx" data-act="bkFix" data-cu="${c.id}"><span class="bkdi">${ic('tag')}</span><span class="bkft"><strong>اصلاح موجودی</strong><em>موجودی واقعی بانک و کارتخوان امروز → سند اصلاحی خودکار</em></span><span class="bkfa">${ic('chev')}</span></button>`:'';
const bfxMv=v=>`${v<0?'−':''}${fmt(Math.abs(v))}`,bfxCl=v=>v>0?'r':v<0?'b':'z';
function bfxLedger(){const c=custs.find(z=>String(z.id)===String(BFX.cu));const z=bfxZ(bkCuBal(c),BFX.bt,BFX.bp,BFX.neg);if(!z.ok)return `<div class="bfl0">موجودی واقعی بانک را بزنید تا اختلاف حساب شود</div>`;
  const L=(l,v,cls,sg)=>`<div class="bflr${cls?' '+cls:''}"><span>${l}</span><b class="${bfxCl(sg??v)}" data-v="${Math.abs(v)}">${sg!=null&&v?(sg>0?'+':'−'):v<0?'−':''}${fmt(Math.abs(v))}</b></div>`;
  return `${L('مانده فعلی در برنامه',z.cur)}${z.p?L('کارتخوان امروز',z.p,'',1):''}${L(z.d>0?'کسر · مانده قبلی':z.d<0?'اضافه · مانده قبلی':'اختلاف مانده قبلی',Math.abs(z.d),'',z.d?Math.sign(z.d):null)}<div class="bflh"></div>${L('مانده بعد از سند',z.T,'fin')}${!z.p&&!z.d?'<div class="bfl0 ok">مانده برنامه با بانک یکی است ✓</div>':''}`}
function bfxHTML(){const c=custs.find(z=>String(z.id)===String(BFX.cu));if(!c)return '';const cur=bkCuBal(c),v=x=>x?Number(x).toLocaleString('en-US'):'';
  return `<div class="sh-h"><div><b>اصلاح موجودی</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bfxw"><div class="bfcur ${bfxCl(cur)}"><small>مانده فعلی در برنامه · ${cur>0?'طلبکاریم':cur<0?'بدهکاریم':'تسویه'}</small><b>${bfxMv(cur)}<i>تومان</i></b></div>
  <label class="bfin"><small>موجودی واقعی بانک</small><span><input id="bxT" class="ltr" inputmode="numeric" value="${v(BFX.bt)}" placeholder="0" autocomplete="off" enterkeyhint="next"><i>تومان</i></span></label>
  <div class="bfch"><button type="button" class="bfc${BFX.neg?' on':''}" data-act="bfxSNeg">${BFX.neg?'✓ ':''}منفی است (اضافه برداشت)</button><button type="button" class="bfc" data-act="bfxSame">همان مانده برنامه</button></div>
  <label class="bfin sm"><small>کارتخوان امروز <i>(سند نخورده، اختیاری)</i></small><span><input id="bxP" class="ltr" inputmode="numeric" value="${v(BFX.bp)}" placeholder="0" autocomplete="off" enterkeyhint="done"><i>تومان</i></span></label>
  <div class="bfl" id="bxL">${bfxLedger()}</div>
  <button type="button" class="xgo" data-act="bfxSave">${ic('check')} ثبت سند اصلاحی</button></div>`}
function bfxSRead(){const T=$('bxT'),P=$('bxP');if(T)BFX.bt=T.value.trim()===''?'':num(T.value);if(P)BFX.bp=num(P.value)||''}
function bfxSBind(f){const T=$('bxT'),P=$('bxP');if(!T)return;[T,P].forEach(e=>{selOnFocus(e);e.oninput=()=>{const n=num(e.value);e.value=n?n.toLocaleString('en-US'):e===T&&/\d/.test(e.value)?'0':'';bfxSRead();const L=$('bxL');if(L){if(typeof numMorph==='function')numMorph('#bxL b',()=>{L.innerHTML=bfxLedger()});else L.innerHTML=bfxLedger()}}});
  T.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();P.focus()}};P.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();P.blur()}};const el=f&&$(f);if(el)sheetFocus(el)}
ACT.bkFix=d=>{if(!can('debt'))return;BFX={cu:d.cu,bt:'',bp:'',neg:0};sheet(bfxHTML());bfxSBind('bxT')};
ACT.bfxSNeg=()=>{bfxSRead();BFX.neg=BFX.neg?0:1;$('sheet').innerHTML=bfxHTML();bfxSBind()};
ACT.bfxSame=()=>{const c=custs.find(z=>String(z.id)===String(BFX.cu));if(!c)return;bfxSRead();const v=bkCuBal(c)+(+BFX.bp||0);BFX.bt=Math.abs(v);BFX.neg=v<0?1:0;$('sheet').innerHTML=bfxHTML();bfxSBind()};
ACT.bfxSave=()=>{bfxSRead();const c=custs.find(z=>String(z.id)===String(BFX.cu));if(!c)return;const z=bfxZ(bkCuBal(c),BFX.bt,BFX.bp,BFX.neg);
  if(!z.ok){toast('موجودی واقعی بانک را بزنید',true);const e=$('bxT');if(e)e.focus();return}const P=bfxRows(z);if(!P.length){toast('مانده برنامه با بانک یکی است؛ سندی لازم نیست');closeSheet();return}
  const now=ns(),no=invNext(),t={id:nid++,type:'inv',no,cn:cnNext(c),date:todayISO(),rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays:P,at:now,by:who(),fix:1};
  (c.txs=c.txs||[]).push(t);c.lastAt=now;saveCu();logA('cust','اصلاح موجودی بانک',cuName(c)+' | سند '+toFa(no)+' | مانده '+bfxMv(z.T),{cu:c.id,tx:t.id});BFX=null;closeSheet();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast('سند اصلاحی '+toFa(no)+' ثبت شد · مانده '+bfxMv(z.T))};
/* رنگ ردیف‌های گردش حساب بانک: کارتخوان سبز، واریز (پول به بانک) قرمز، برداشت آبی */
function bkRowCls(t,d){if(t.type==='inv'){const P=(t.pays||[]).filter(p=>+p.amount);if(t.pd||(P.length&&P.every(p=>p.m==='pos'||p.lm==='pos'||(p.m==='bkx'&&p.k==='bpos'))))return 'tg'}const r=d?d.r:0;return r<0?'trd':r>0?'tbl':''}
