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
