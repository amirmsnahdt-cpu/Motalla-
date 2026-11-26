/* ===== v90.9 (خواسته صاحب اپ: «ارور باید مثل پنجره نوع حساب تازه باشد»؛ «جلوی خطاهای انسانی گرفته شود») =====
   یک پنجره شناور وسط صفحه با همان شکل «نوع حساب تازه» (کارت گرد، نشان رنگی، عنوان پررنگ، زمینه تار):
   • askWarn({t,h,ok,go,goT,kind,focus}) — خطا یا هشدار مهم که باید دیده و جواب داده شود: «اصلاح می‌کنم» (بستن، برگشت به فیلد focus) و در صورت go،
     «با همین ثبت شود» (کاربر آگاهانه ادامه می‌دهد). kind: 'err' قرمز (پیش‌فرض) · 'warn' زرد.
   • errCard(m) — همه پیام‌های خطای برنامه (toast با bad) دیگر نوار کوچک بالای صفحه نیستند؛ همین کارت با دکمه «متوجه شدم» (خودش هم بعد از چند ثانیه می‌رود).
     کارهای پس‌زمینه (همگام‌سازی، render خودکار: window.__audbg) همان نوار قبلی می‌مانند تا وسط کار پنجره نپرد. */
let WRN=null,WRNT=0;
function warnClose(now){clearTimeout(WRNT);const P=$('wrnp'),B=$('wrnbd');if(!P&&!B)return;const rm=()=>{if(P)P.remove();if(B)B.remove()};
  if(now||RM()||!P||!P.animate){rm();return}P.id='';if(B)B.id='';P.animate([{opacity:1,transform:'translate(-50%,0) scale(1)'},{opacity:0,transform:'translate(-50%,-8px) scale(.96)'}],{duration:160,easing:'ease-in',fill:'forwards'});if(B)B.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'});setTimeout(rm,170)}
function askWarn(o){o=o||{};warnClose(1);WRN={go:o.go||null,focus:o.focus||''};const k=o.kind==='warn'?'wrw':o.kind==='ok'?'wrk':o.kind==='info'?'wri':'wre';/* نام کلاس کوتاه مثل er/wr با کلاس‌های قدیمی برنامه قاطی می‌شود */
  const bd=document.createElement('div');bd.className='cntbd wrnbd';bd.id='wrnbd';bd.onclick=()=>ACT.warnX();document.body.appendChild(bd);
  const P=document.createElement('div');P.className='cntp wrnp '+k+(o.mini?' wmini':'');P.id='wrnp';P.setAttribute('role','alertdialog');P.setAttribute('aria-live','assertive');
  P.innerHTML=`<div class="cnth"><span class="cnthi">${ic(o.ico||'info')}</span><span class="tx"><b>${o.t||'توجه'}</b>${o.sub?`<small>${o.sub}</small>`:''}</span><button type="button" class="cntx" data-act="warnX" aria-label="بستن">${ic('x')}</button></div>
  ${o.h?`<div class="wrnb">${o.h}</div>`:''}<div class="wrnf"><button type="button" class="wrnok" data-act="warnX">${o.ok||'متوجه شدم'}</button>${o.go?`<button type="button" class="wrngo${o.goMain?' pri':''}" data-act="warnGo">${o.goT||'با همین ثبت شود'}</button>`:''}</div>`;
  document.body.appendChild(P);if(document.activeElement&&document.activeElement.blur&&!o.keepKb)document.activeElement.blur();
  if(!RM()&&P.animate){P.animate([{opacity:0,transform:'translate(-50%,-12px) scale(.93)'},{opacity:1,transform:'translate(-50%,0) scale(1)'}],{duration:360,easing:'cubic-bezier(.2,1.3,.4,1)'});bd.animate([{opacity:0},{opacity:1}],{duration:220,fill:'both'});
    const I=P.querySelector('.cnthi');if(I)I.animate([{transform:'scale(.5) rotate(-12deg)'},{transform:'scale(1.12)'},{transform:'none'}],{duration:480,easing:'cubic-bezier(.2,1.2,.4,1)'})}
  try{if(navigator.vibrate&&k==='wre')navigator.vibrate(18)}catch(_){}
  if(o.auto)WRNT=setTimeout(()=>{if($('wrnp')===P)ACT.warnX()},o.auto);return P}
function errCard(m){askWarn({t:esc(m),mini:1,ok:'متوجه شدم',auto:Math.min(9000,Math.max(4200,String(m).length*85)),keepKb:1})}
ACT.warnX=()=>{const f=WRN&&WRN.focus;WRN=null;warnClose();if(f){const e=typeof f==='string'?$(f):f;if(e&&e.focus)setTimeout(()=>{try{e.focus()}catch(_){}} ,200)}};
ACT.warnGo=()=>{const g=WRN&&WRN.go;WRN=null;warnClose(1);if(g)g()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('wrnp'))ACT.warnX()});

/* ---------- خطاهای خرید و فروش، پیش از نشستن ردیف در سند (خواسته صاحب اپ) ----------
   «اگر سود لحاظ نشده، یا ادیت مبلغ درست نشده و با ضرر فروخته می‌شود ارور بده؛ اگر خیلی بالا می‌خری ارور بده.»
   هر تابع یا null برمی‌گرداند (ایرادی نیست) یا {t,h,kind}؛ پنجره «اصلاح می‌کنم / با همین ثبت شود» دارد — کاربر آگاهانه می‌تواند ادامه دهد (موارد خاص هست)،
   ولی بی‌خبر رد نمی‌شود. همان ردیف که یک بار تأیید شد دوباره پرسیده نمی‌شود (WOK = امضای ردیف).
   مرجع نرخ = «هر گرم ۱۸» بالای سند (rate)؛ برای خود نرخ سند، قیمت لحظه‌ای بازار (GL.g18) اگر تازه باشد. */
let WOK='';
const wT=v=>fmt(Math.round(v))+' تومان',wPct=v=>toFa(String(Math.round(Math.abs(v)*10)/10))+'٪';
const W_ROW=3,W_HDR=4;/* درصد: فاصله نرخ ردیف با نرخ سند · فاصله نرخ سند با بازار */
function itWarn(it){{const s=rowSane({gold:1,ay:it.ay,w:it.w,ajP:it.ajP,pp:it.pp});if(s)return s}const rate=+sv.rate||0;if(!rate||!(+it.w>0))return null;const c=itCalc(it,sv.rate,sv.tax),net=c.tot-(c.tax||0),base=c.gold+c.aj,nm='«'+esc(it.k||'کالا')+'»';
  if(net<c.gold)return {t:'این ردیف با ضرر فروخته می‌شود',h:'مبلغ '+nm+' <b>'+wT(net)+'</b> است ولی فقط طلای آن (<b>'+wFmt(it.w)+'</b> گرم) <b>'+wT(c.gold)+'</b> می‌ارزد.<br><b class="rd">'+wT(c.gold-net)+' ضرر</b> — مبلغ یا نرخ را دوباره ببینید.'};
  if(c.pr<0)return {t:'سود این ردیف منفی است',h:'طلا <b>'+wT(c.gold)+'</b> + اجرت <b>'+wT(c.aj)+'</b> = <b>'+wT(base)+'</b>؛ ولی مبلغ ردیف <b>'+wT(net)+'</b> زده شده.<br><b class="rd">'+wT(-c.pr)+' کمتر از تمام‌شده</b>.'};
  const f=gdFee(it.k);if(f&&+f.b>0){if(+f.b<=100){const mk=c.gold?(c.aj+c.pr)/c.gold*100:0;if(mk+0.005<+f.b)return {t:'زیر فی خرید می‌فروشید',h:'فی خرید '+nm+' <b>'+feeTx(f.b)+'</b> است، ولی اجرت و سود این ردیف روی هم <b>'+wPct(mk)+'</b> شده.<br><b class="rd">با این مبلغ ضرر می‌کنید.</b>'}}
    else{const pg=net/(+it.w);if(pg<+f.b)return {t:'زیر فی خرید می‌فروشید',h:'فی خرید '+nm+' هر گرم <b>'+fmt(Math.round(+f.b))+'</b> است، ولی این ردیف هر گرم <b>'+fmt(Math.round(pg))+'</b> درمی‌آید.<br><b class="rd">با این مبلغ ضرر می‌کنید.</b>'}}}
  if(+it.mz){const rr=(+it.mz)/MZK,d=(rr-rate)/rate*100;if(Math.abs(d)>W_ROW)return {kind:'warn',t:'نرخ این ردیف با نرخ سند فرق زیادی دارد',h:'هر گرم در سند <b>'+fmt(rate)+'</b> است ولی برای این ردیف <b>'+fmt(Math.round(rr))+'</b> زده شده (<b>'+wPct(d)+'</b> '+(d<0?'کمتر':'بیشتر')+').<small>اگر رقمی جا افتاده اصلاح کنید.</small>'}}
  if(!it.ab&&!(+it.pp>0)&&c.pr===0)return {kind:'warn',t:'سود لحاظ نشده',h:'برای '+nm+' سود صفر است؛ فقط طلا'+(c.aj?' و اجرت':'')+' حساب شده (<b>'+wT(net)+'</b>).'};
  return null}
function xrWarn(x){if(x.a==='gold'){const s=rowSane({gold:1,ay:x.ay,w:x.w,...(xrAjOn(x)?{ajP:x.ajP,pp:x.pp}:{})});if(s)return s}const m=x.t==='sell'||x.t==='buy';if(!m)return null;const C=xrCalc(x,sv.rate),rate=+sv.rate||0;if(!(C.n>0)||!(C.amount>0))return null;
  /* v101.1 (خواسته صاحب اپ: «سکه پارسیان را زیر قیمت خام خریدم ولی خطای خیلی بالا می‌خرید داد»): قیمت تمام‌شده = مبلغ ÷ وزن واقعی (نه وزن گردشده ۷۵۰)،
     در برابر «قیمت خام» همان طلا = نرخ روز × عیار/۷۵۰. در خرید، عیار ۷۳۰ تا ۷۴۹ (۷۳۵ پارسیان و متفرقه، ۷۴۰ تعویض) کسر قراردادی خرید است نه عیار واقعی،
     پس قیمت خام با ۷۵۰ سنجیده می‌شود: خرید فقط وقتی خطاست که هر گرمش از نرخ روز ۱۸ بالاتر باشد. قبلاً مبلغ بر وزن×۷۳۵ تقسیم می‌شد و هر خریدی کمی بالاتر از ۷۳۵ خطا می‌گرفت */
  if(x.a==='gold'){if(!rate)return null;const ay=+x.ay||750,rAy=x.t==='buy'&&ay>=730&&ay<750?750:ay,pgN=C.amount/C.n,ref=rate*rAy/750,d=(pgN-ref)/ref*100,nm=x.cat&&x.cat!=='متفرقه'?'«'+esc(x.cat)+'»':'طلا',
      aT=rAy===750?'':' (عیار '+toFa(String(rAy))+')';
    if(x.t==='buy'&&d>0.1)return {t:'بالاتر از قیمت خام می‌خرید',h:'قیمت خام هر گرم این طلا'+aT+' با نرخ روز <b>'+fmt(Math.round(ref))+'</b> است، ولی این خرید ('+nm+') هر گرم <b class="rd">'+fmt(Math.round(pgN))+'</b> تمام می‌شود — <b>'+wPct(d)+'</b> بالاتر از قیمت خام.<small>وزن، عیار، نرخ یا مبلغ را دوباره ببینید.</small>'};
    if(x.t==='sell'&&d<-0.1)return {t:'زیر نرخ روز می‌فروشید',h:'قیمت خام هر گرم این طلا'+aT+' با نرخ روز <b>'+fmt(Math.round(ref))+'</b> است، ولی این فروش ('+nm+') هر گرم <b class="rd">'+fmt(Math.round(pgN))+'</b> درمی‌آید — <b>'+wPct(d)+'</b> کمتر.<small>با این مبلغ ضرر می‌کنید.</small>'};
    if(Math.abs(d)>W_ROW+3)return {kind:'warn',t:'نرخ این ردیف با نرخ سند فرق زیادی دارد',h:'قیمت خام هر گرم'+aT+' <b>'+fmt(Math.round(ref))+'</b>، این ردیف <b>'+fmt(Math.round(pgN))+'</b> (<b>'+wPct(d)+'</b> '+(d<0?'کمتر':'بیشتر')+').'};
    return null}
  /* سکه و ارز: با فی خرید/فروش همان جنس، وگرنه با آخرین نرخ ثبت‌شده */
  const u=esc((XA[x.a]||{}).u||'واحد'),nm='«'+esc((XA[x.a]||{t:x.a}).t)+'»',pg=C.pg,f=gdFee(x.a);
  if(x.t==='sell'&&f&&+f.b>100&&pg<+f.b)return {t:'زیر فی خرید می‌فروشید',h:'فی خرید '+nm+' هر '+u+' <b>'+fmt(Math.round(+f.b))+'</b> است، ولی این فروش هر '+u+' <b class="rd">'+fmt(pg)+'</b> زده شده.'};
  if(x.t==='buy'&&f&&+f.s>100&&pg>+f.s)return {t:'خیلی بالا می‌خرید',h:'فی فروش '+nm+' هر '+u+' <b>'+fmt(Math.round(+f.s))+'</b> است، ولی این خرید هر '+u+' <b class="rd">'+fmt(pg)+'</b> زده شده — بالاتر از قیمتی که می‌فروشیم.'};
  const last=+ls.get('m_px_'+x.a,0)||0;if(last>0&&pg>0){const d=(pg-last)/last*100;if(Math.abs(d)>15)return {kind:'warn',t:'نرخ با دفعه قبل فرق زیادی دارد',h:'آخرین نرخ '+nm+' هر '+u+' <b>'+fmt(last)+'</b> بود؛ الان <b>'+fmt(pg)+'</b> زده شده (<b>'+wPct(d)+'</b> '+(d<0?'کمتر':'بیشتر')+').<small>اگر رقمی جا افتاده اصلاح کنید.</small>'}}
  return null}
/* نرخ بالای سند در برابر بازار (فقط وقتی قیمت لحظه‌ای تازه است) */
function hdrWarn(){const r=+sv.rate||0;if(!r||sv.edit||typeof glOk!=='function'||!glOk()||!GL||!(+GL.g18>0)||glMin()>20)return null;const d=(r-GL.g18)/GL.g18*100;
  return Math.abs(d)>W_HDR?{kind:'warn',t:'نرخ سند با بازار فرق زیادی دارد',h:'هر گرم ۱۸ در این سند <b>'+fmt(r)+'</b> است؛ قیمت لحظه‌ای بازار <b>'+fmt(GL.g18)+'</b> (<b>'+wPct(d)+'</b> '+(d<0?'کمتر':'بیشتر')+').<small>اگر مظنه را اشتباه زده‌اید همین‌جا اصلاح کنید؛ همه ردیف‌های طلا با این نرخ حساب می‌شوند.</small>'}:null}
/* اگر ایرادی هست پنجره را نشان می‌دهد و true برمی‌گرداند (ثبت متوقف)؛ «با همین ثبت شود» همان کار را دوباره صدا می‌زند */
function warnGate(sig,w,again,focus){if(!w||window.__wauto)return false;if(WOK===sig)return false;askWarn({ok:'اصلاح می‌کنم',goT:'با همین ثبت شود',...w,go:w.hard?null:()=>{WOK=sig;again()},focus});return true}
/* عددهای پرت یک ردیف (خطای تایپ): عیار، وزن، درصدها */
function rowSane(o){const ay=+o.ay||0,w=parseFloat(o.w)||0;
  if(o.gold&&ay&&(ay<300||ay>1000))return {hard:1,t:'عیار درست نیست',h:'عیار باید بین ۳۰۰ و ۱۰۰۰ باشد (مثلاً ۷۵۰ یا ۷۳۵)؛ الان <b class="rd">'+toFa(String(ay))+'</b> زده شده.'};
  if(o.gold&&w>3000)return {kind:'warn',t:'وزن این ردیف خیلی زیاد است',h:'<b>'+wFmt(w)+'</b> گرم (حدود <b>'+toFa(String(Math.round(w/100)/10))+'</b> کیلو) زده شده.<small>اگر ممیز جا افتاده اصلاح کنید.</small>'};
  for(const [k,l] of [['ajP','اجرت'],['pp','سود']])if(+o[k]>40)return {kind:'warn',t:l+' خیلی زیاد است',h:l+' این ردیف <b class="rd">'+wPct(+o[k])+'</b> زده شده.<small>اگر ممیز جا افتاده اصلاح کنید (مثلاً ۷٫۵).</small>'};
  return null}
/* تاریخ سند تازه: آینده یا چند روز پیش */
function dateWarn(){if(!sv||sv.edit||!sv.date)return null;const t=todayISO();if(sv.date===t)return null;const dd=Math.round((Date.parse(sv.date)-Date.parse(t))/864e5),fa=dates(sv.date).fa;
  if(dd>0)return {kind:'warn',t:'تاریخ سند در آینده است',h:'تاریخ این سند <b>'+esc(fa)+'</b> است ('+toFa(String(dd))+' روز بعد از امروز).',goT:'با همین تاریخ ثبت شود'};
  if(dd<-2)return {kind:'warn',t:'تاریخ سند برای چند روز پیش است',h:'تاریخ این سند <b>'+esc(fa)+'</b> است ('+toFa(String(-dd))+' روز پیش).',goT:'با همین تاریخ ثبت شود'};return null}
