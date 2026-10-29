/* ----- v61.89 قیمت لحظه‌ای طلای بازار -----
   سرور (داخل ایران) قیمت را از tgju می‌گیرد (/api/gold، کش ۳۰ ثانیه)؛ برنامه وقتی باز است هر ۳۰ ثانیه می‌پرسد.
   اگر سرور جواب نداد، گوشی خودش مستقیم از tgju امتحان می‌کند (glDirect).
   GL = {g18: هر گرم ۱۸ عیار, mz: مثقال (مظنه), at, stale, err} — همه به تومان. آخرین قیمت در m_gl می‌ماند.
   خانه: کارت «قیمت لحظه‌ای طلا» (#glH). سند: وضعیت داخل پنل مظنه (#glS). زدن هر دو = پنجره کوچک نرخ‌ها (#glpop).
   v61.90: سند تازه «لحظه‌ای» است (sv.live): نرخ سند همراه بازار به‌روز می‌شود تا وقتی کاربر نرخ را دستی عوض کند
   (oninput نرخ → sv.live=0). «لحظه‌ای» در نوار دوباره روشنش می‌کند. سند ثبت‌شده نرخ خودش را نگه می‌دارد (ویرایش سند live ندارد). */
let GL=ls.get('m_gl',null),GLbusy=false,GLset=false;
const glOk=()=>!!(GL&&+GL.g18&&+GL.mz);
const glMin=()=>glOk()&&GL.at?Math.max(0,Math.round((Date.now()-Date.parse(GL.at))/60000)):0;
const glOld=()=>glOk()&&(GL.stale||glMin()>=5||glQuiet());
const glTime=()=>{try{return new Date(GL.at).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'})}catch(e){return ''}};
/* v61.91: ساعت روی کارت = آخرین تغییر خود بازار (mt)، نه ساعت پرسیدن؛ تا قیمت کهنه «زنده» دیده نشود */
const glMt=()=>glOk()&&+GL.mt?+GL.mt:0;
const glHM=t=>{try{return new Date(t).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'})}catch(e){return ''}};
const glMkt=()=>{const t=glMt();if(!t)return '';const d=new Date(t),n=new Date(),day=d.toLocaleDateString('fa-IR',{timeZone:'Asia/Tehran'})===n.toLocaleDateString('fa-IR',{timeZone:'Asia/Tehran'});
  return (day?'':d.toLocaleDateString('fa-IR',{timeZone:'Asia/Tehran',weekday:'long'})+' ')+glHM(t)};
const glQuiet=()=>glMt()&&Date.now()-glMt()>15*60000;
const glSub=()=>!glOk()?(GL&&GL.err?'در دسترس نیست؛ دوباره می‌پرسیم':'در حال دریافت…'):glOld()?'آخرین قیمت · '+glTime():glMt()?(glQuiet()?'بازار بدون تغییر از '+glMkt():'زنده · تغییر بازار '+glMkt()):'زنده · ساعت '+glTime();
/* همان خواندن سرور: ریال → تومان، نسبت مثقال به گرم باید حدود ۴٫۳۳ باشد */
function glParse(j){const cur=j&&(j.current||j),n=v=>{const t=toEn(String(v==null?'':v)).replace(/[^\d.]/g,''),x=+t;return isFinite(x)&&x>0?x:0},
  it=k=>{const o=cur&&cur[k];if(!o)return 0;return Math.round(n(typeof o==='object'?(o.p??o.price??o.value):o)/10)};
  let g=it('geram18'),m=it('mesghal');if(!g&&!m)return null;if(!g)g=rOfMz(m);if(!m)m=mzOf(g);if(!(m/g>4.1&&m/g<4.6))return null;
  const x={};for(const [k,src] of GLX)if(it(src))x[k]=it(src);return{g18:g,mz:m,x}}
/* v61.93: نرخ‌های دیگر (همان کلیدهای سرور) */
const GLX=[['g24','geram24'],['emami','sekee'],['bahar','sekeb'],['nim','nim'],['rob','rob'],['gerami','gerami'],['usd','price_dollar_rl'],['eur','price_eur'],['aed','price_aed']];
/* v61.91: rev تازه تا CDN نسخه کهنه ندهد؛ هر چهار آینه با هم و تازه‌ترین (زمان بازار) برداشته می‌شود */
const glTs=ts=>{const m=/^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)(?::(\d\d))?/.exec(String(ts||''));if(!m)return 0;const t=Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]||'00'}+03:30`);return isFinite(t)?t:0};
async function glDirect(){const one=async n=>{try{const r=await fetch(`https://call${n}.tgju.org/ajax.json?rev=${Date.now().toString(36)}`,{cache:'no-store'});if(!r.ok)return null;const j=await r.json(),v=glParse(j);if(!v)return null;const c=j&&(j.current||j);v.mt=Math.max(glTs(c.geram18&&c.geram18.ts),glTs(c.mesghal&&c.mesghal.ts));return v}catch(e){return null}};
  const all=(await Promise.all([1,2,3,4].map(one))).filter(Boolean);return all.sort((a,b)=>b.mt-a.mt)[0]||null}
async function glPull(){if(!TOKEN||GLbusy||document.visibilityState==='hidden')return;GLbusy=true;let v=null;
  try{const j=await api('/api/gold');if(j&&+j.g18&&+j.mz)v={g18:+j.g18,mz:+j.mz,mt:+j.mt||0,x:j.x||null,at:j.at,stale:!!j.stale}}catch(e){}
  /* سرور جواب نداد، کهنه بود، زمان بازار نفرستاد (سرور قدیمی تا دیپلوی شبانه)، یا بازار ۱۵ دقیقه از نظر سرور تکان نخورده: گوشی خودش هم می‌پرسد و تازه‌تر را نگه می‌دارد */
  if(!v||v.stale||!v.mt||Date.now()-v.mt>15*60000){const d=await glDirect();if(d&&(!v||v.stale||(d.mt||0)>(v.mt||0)))v={...d,at:new Date().toISOString(),stale:false}}
  if(v){GL={...v,err:0};ls.set('m_gl',GL)}else GL=Object.assign(GL||{},{err:1});
  GLbusy=false;glApply();glPaint()}
function glHomeHTML(){const k=glOk();
  return `<button type="button" class="glc${glOld()?' old':''}${k?'':' none'}" id="glH" data-act="glPop" aria-haspopup="dialog"><span class="glt"><b><i class="gldot"></i>قیمت لحظه‌ای طلا</b><small>${esc(glSub())}</small></span>
    <span class="glv"><small>هر گرم ۱۸</small><b>${k?fmt(GL.g18):'—'}</b></span><span class="glv"><small>مثقال</small><b>${k?fmt(GL.mz):'—'}</b></span></button>`}
/* فاصله نرخ دستی سند از بازار (بر حسب هر گرم ۱۸) */
function glDiff(){if(!glOk()||!sv||!+sv.rate)return '';const d=(sv.rate-GL.g18)/GL.g18*100,a=Math.abs(d);
  if(a<0.05)return '<em class="eq">برابر بازار</em>';
  return `<em class="${a>=1?'far':''}">${toFa(a.toFixed(1))}٪ ${d>0?'بالاتر':'پایین‌تر'} از بازار</em>`}
const glOn=()=>!!(sv&&sv.live&&!sv.edit);
/* v61.93 (خواسته صاحب اپ): وضعیت بازار داخل خود پنل مظنه سند (نه نوار جدا): نقطه سبز + ساعت تغییر بازار؛
   اگر نرخ سند دستی است، فاصله از بازار. زدن = پنجره کوچک نرخ‌های بازار (مثل منوی ⋯) */
function glRateHTML(){const k=glOk(),on=glOn(),st=!k?'none':glOld()?'old':'';
  const t=!k?glSub():on?(glOld()?'آخرین قیمت ':'زنده ')+(glMkt()||glTime()):sv&&+sv.rate?'دستی · '+glDiffT():'بازار '+fmt(GL.g18);
  return `<button type="button" class="d6gl ${st}${on?' on':''}" id="glS" data-act="glPop" aria-haspopup="dialog"><i class="gldot"></i><span>${esc(t)}</span>${ic('chev')}</button>`}
const glDiffT=()=>{if(!glOk()||!sv||!+sv.rate)return '';const d=(sv.rate-GL.g18)/GL.g18*100,a=Math.abs(d);return a<0.05?'برابر بازار':toFa(a.toFixed(1))+'٪ '+(d>0?'بالاتر':'پایین‌تر')};
/* پنجره کوچک نرخ‌ها: طلا (فروش ۷۵۰، خرید ۷۳۵، تعویض ۷۴۰، ۲۴ عیار، مثقال)، سکه، ارز — به تومان */
const GLN={emami:'سکه امامی',bahar:'سکه بهار آزادی',nim:'نیم سکه',rob:'ربع سکه',gerami:'سکه گرمی',usd:'دلار',eur:'یورو',aed:'درهم'};
/* فاصله امن پایین (نوار خانه آیفون) */
let glSb=null;const glSab=()=>{if(glSb==null){const d=document.createElement('div');d.style.cssText='position:fixed;bottom:0;height:0;padding-bottom:env(safe-area-inset-bottom,0px);visibility:hidden';document.body.appendChild(d);glSb=parseFloat(getComputedStyle(d).paddingBottom)||0;d.remove()}return glSb};
const glAy=a=>Math.round(GL.g18*a/750);
function glPopHTML(){const k=glOk(),X=(GL&&GL.x)||{},row=(l,v,sub,cl)=>`<div class="glpr${cl?' '+cl:''}"><span><b>${l}</b>${sub?`<small>${sub}</small>`:''}</span><em class="glpv">${v?fmt(v):'—'}</em></div>`;
  const sec=(t,R)=>R.length?`<div class="glps"><div class="glpt">${t}</div>${R.join('')}</div>`:'';
  const sw=cur==='sell'&&sv&&!sv.edit?`<button type="button" class="glu2${glOn()?' on':''}" data-act="glLive" aria-pressed="${glOn()}"><span class="tx"><b>نرخ سند همراه بازار</b><small>${glOn()?'با هر تغییر بازار به‌روز می‌شود':sv&&+sv.rate?'نرخ دستی · '+esc(glDiffT())+' از بازار':'روشن کنید تا نرخ از بازار پر شود'}</small></span><i class="tg"></i></button>`:'';
  if(!k)return `<div class="glph"><i class="gldot"></i><b>نرخ‌های بازار</b><small>${esc(glSub())}</small></div>${sw}<button type="button" class="glpre" data-act="glRef">${ic('refresh')} دوباره بپرس</button>`;
  const G=[row('فروش ۱۸ عیار',GL.g18,'۷۵۰ · هر گرم','k'),row('خرید',glAy(735),'۷۳۵ · هر گرم'),row('تعویض',glAy(740),'۷۴۰ · هر گرم'),row('۲۴ عیار',X.g24||glAy(1000),'هر گرم'),row('مثقال (مظنه)',GL.mz,'')];
  const C=['emami','bahar','nim','rob','gerami'].filter(z=>X[z]).map(z=>row(GLN[z],X[z],'')),F=['usd','eur','aed'].filter(z=>X[z]).map(z=>row(GLN[z],X[z],''));
  return `<div class="glph${glOld()?' old':''}"><i class="gldot"></i><b>نرخ‌های بازار</b><small>${esc(glSub())}</small><button type="button" class="glpre i" data-act="glRef" aria-label="دوباره بپرس">${ic('refresh')}</button></div>${sw}
  <div class="glpb">${sec('طلا · تومان',G)}${sec('سکه',C)}${sec('ارز',F)}${C.length||F.length?'':'<div class="glpn">نرخ سکه و ارز بعد از به‌روزرسانی سرور می‌آید</div>'}</div>`}
function glPopOpen(btn){let m=$('glpop');if(m){m._close();return}if(!btn)return;m=document.createElement('div');m.id='glpop';m.className='pmenu glp';m.setAttribute('role','dialog');m.setAttribute('aria-label','نرخ‌های بازار');m.innerHTML=glPopHTML();document.body.appendChild(m);
  /* v63.2: ارتفاع پنجره به فضای واقعی صفحه (منهای نوار پایین آیفون) محدود می‌شود تا ته فهرست همیشه با اسکرول دیده شود */
  const place=()=>{if(!btn.isConnected){m._close();return}const r=btn.getBoundingClientRect(),w=m.offsetWidth,vw=innerWidth,vh=(window.visualViewport&&visualViewport.height)||innerHeight,sb=glSab()+12,dn=vh-r.bottom-8-sb,up=r.top-8-10;
    m.style.maxHeight='';const h0=m.scrollHeight,below=dn>=Math.min(h0,240)||dn>=up,room=Math.max(160,below?dn:up);m.style.maxHeight=Math.min(h0,room)+'px';const h=m.offsetHeight,top=below?r.bottom+8:r.top-8-h;
    m.style.top=Math.round(Math.max(10,top))+'px';m.style.left=Math.round(Math.min(Math.max(8,r.left+r.width/2-w/2),vw-w-8))+'px';m.style.transformOrigin=(r.left+r.width/2-parseFloat(m.style.left))+'px '+(below?'0':'100%')};place();
  btn.setAttribute('aria-expanded','true');const out=e=>{if(!m.contains(e.target)&&!btn.contains(e.target))m._close()},key=e=>{if(e.key==='Escape')m._close()},sc=()=>m._close();
  m._close=()=>{if(m._c)return;m._c=1;m.classList.add('out');btn.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',out,true);document.removeEventListener('keydown',key,true);$('view').removeEventListener('scroll',sc);setTimeout(()=>m.remove(),RM()?0:160)};
  setTimeout(()=>{document.addEventListener('pointerdown',out,true);document.addEventListener('keydown',key,true);$('view').addEventListener('scroll',sc,{passive:true})},0)}
/* فقط همین دو تکه دوباره ساخته می‌شوند؛ عددهای عوض‌شده می‌شمارند و می‌پرند */
function glPaint(){if($('glH'))numMorph('#glH .glv b',()=>{const e=$('glH');if(e)e.outerHTML=glHomeHTML()});
  const r=$('glS');if(r)r.outerHTML=glRateHTML();const p=$('glpop');if(p&&!p._c){const y=p.scrollTop;p.innerHTML=glPopHTML();p.scrollTop=y}}
const glVal=()=>rtK()==='g'?GL.g18:GL.mz;
/* سند لحظه‌ای بیرون از صفحه سند (پیش‌نویس): فقط عددها؛ داخل صفحه سند: همان مسیر ورود دستی نرخ (شمارش، محاسبه دوباره ردیف‌ها) */
function glSync(){if(!glOn()||!glOk())return;const g=rtK()==='g';sv.rate=g?GL.g18:rOfMz(GL.mz);sv.mz=g?mzOf(GL.g18):GL.mz}
function glApply(){if(!glOn()||!glOk())return;const M=$('svM');if(cur!=='sell'||!M){glSync();return}
  const v=glVal();if(num(M.value)===v)return;M.value=String(v);GLset=true;try{if(M.oninput)M.oninput()}finally{GLset=false}
  const w=$('svRate');if(w&&w.animate&&!RM())w.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})}
ACT.glRef=()=>{if(GLbusy)return;const b=document.querySelector('#glpop .glpre');if(b)b.classList.add('spin');else toast('در حال گرفتن قیمت بازار…');glPull()};
ACT.glPop=(d,e)=>glPopOpen(e&&e.target&&e.target.closest?e.target.closest('[data-act=glPop]'):$('glS')||$('glH'));
ACT.glLive=()=>{if(!sv||sv.edit)return;sv.live=sv.live?0:1;svKeep();if(sv.live){if(!glOk()){toast('قیمت بازار هنوز نرسیده؛ به محض رسیدن نرخ سند پر می‌شود');glPull()}glApply()}glPaint();
  const b=document.querySelector('#glpop .glu2 .tg');if(b&&b.animate&&!RM())b.animate([{transform:'scale(.9)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.3,1.4,.5,1)'})};
setInterval(glPull,30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')glPull()});
setTimeout(glPull,1200);
