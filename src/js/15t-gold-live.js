/* ----- v61.89 قیمت لحظه‌ای طلای بازار -----
   سرور (داخل ایران) قیمت را از tgju می‌گیرد (/api/gold، کش ۳۰ ثانیه)؛ برنامه وقتی باز است هر ۳۰ ثانیه می‌پرسد.
   اگر سرور جواب نداد، گوشی خودش مستقیم از tgju امتحان می‌کند (glDirect).
   GL = {g18: هر گرم ۱۸ عیار, mz: مثقال (مظنه), at, stale, err} — همه به تومان. آخرین قیمت در m_gl می‌ماند.
   خانه: کارت «قیمت لحظه‌ای طلا» (#glH). سند: نوار زیر نرخ (#glS).
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
  let g=it('geram18'),m=it('mesghal');if(!g&&!m)return null;if(!g)g=rOfMz(m);if(!m)m=mzOf(g);return m/g>4.1&&m/g<4.6?{g18:g,mz:m}:null}
/* v61.91: rev تازه تا CDN نسخه کهنه ندهد؛ هر چهار آینه با هم و تازه‌ترین (زمان بازار) برداشته می‌شود */
const glTs=ts=>{const m=/^(\d{4})-(\d\d)-(\d\d)[ T](\d\d):(\d\d)(?::(\d\d))?/.exec(String(ts||''));if(!m)return 0;const t=Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]||'00'}+03:30`);return isFinite(t)?t:0};
async function glDirect(){const one=async n=>{try{const r=await fetch(`https://call${n}.tgju.org/ajax.json?rev=${Date.now().toString(36)}`,{cache:'no-store'});if(!r.ok)return null;const j=await r.json(),v=glParse(j);if(!v)return null;const c=j&&(j.current||j);v.mt=Math.max(glTs(c.geram18&&c.geram18.ts),glTs(c.mesghal&&c.mesghal.ts));return v}catch(e){return null}};
  const all=(await Promise.all([1,2,3,4].map(one))).filter(Boolean);return all.sort((a,b)=>b.mt-a.mt)[0]||null}
async function glPull(){if(!TOKEN||GLbusy||document.visibilityState==='hidden')return;GLbusy=true;let v=null;
  try{const j=await api('/api/gold');if(j&&+j.g18&&+j.mz)v={g18:+j.g18,mz:+j.mz,mt:+j.mt||0,at:j.at,stale:!!j.stale}}catch(e){}
  /* سرور جواب نداد، کهنه بود، یا بازار ۱۵ دقیقه از نظر سرور تکان نخورده: گوشی خودش هم می‌پرسد و تازه‌تر را نگه می‌دارد */
  if(!v||v.stale||(v.mt&&Date.now()-v.mt>15*60000)){const d=await glDirect();if(d&&(!v||v.stale||(d.mt||0)>(v.mt||0)))v={...d,at:new Date().toISOString(),stale:false}}
  if(v){GL={...v,err:0};ls.set('m_gl',GL)}else GL=Object.assign(GL||{},{err:1});
  GLbusy=false;glApply();glPaint()}
function glHomeHTML(){const k=glOk();
  return `<button type="button" class="glc${glOld()?' old':''}${k?'':' none'}" id="glH" data-act="glRef"><span class="glt"><b><i class="gldot"></i>قیمت لحظه‌ای طلا</b><small>${esc(glSub())}</small></span>
    <span class="glv"><small>هر گرم ۱۸</small><b>${k?fmt(GL.g18):'—'}</b></span><span class="glv"><small>مثقال</small><b>${k?fmt(GL.mz):'—'}</b></span></button>`}
/* فاصله نرخ دستی سند از بازار (بر حسب هر گرم ۱۸) */
function glDiff(){if(!glOk()||!sv||!+sv.rate)return '';const d=(sv.rate-GL.g18)/GL.g18*100,a=Math.abs(d);
  if(a<0.05)return '<em class="eq">برابر بازار</em>';
  return `<em class="${a>=1?'far':''}">${toFa(a.toFixed(1))}٪ ${d>0?'بالاتر':'پایین‌تر'} از بازار</em>`}
const glOn=()=>!!(sv&&sv.live&&!sv.edit);
function glSellHTML(){const on=glOn(),k=glOk(),sw=sv&&!sv.edit?`<button type="button" class="glu${on?' on':''}" data-act="glLive" aria-pressed="${on}"><i>${ic('check')}</i>لحظه‌ای</button>`:'';
  const vals=k?`<span class="glsv">گرم ۱۸ <b>${fmt(GL.g18)}</b></span><span class="glsv">مثقال <b>${fmt(GL.mz)}</b></span>`:`<small>${esc(glSub())}</small>`;
  const note=!k?'':on?`<small class="gln">نرخ سند همراه بازار به‌روز می‌شود · ${esc(glSub())}</small>`:`${glDiff()}<small class="gln">نرخ سند دستی است؛ برای پیروی از بازار «لحظه‌ای» را بزنید</small>`;
  return `<div class="gls${glOld()?' old':''}${on?' live':''}" id="glS"><span class="glsl"><i class="gldot"></i>بازار</span>${vals}${sw}${note}</div>`}
/* فقط همین دو تکه دوباره ساخته می‌شوند؛ عددهای عوض‌شده می‌شمارند و می‌پرند */
function glPaint(){if($('glH'))numMorph('#glH .glv b',()=>{const e=$('glH');if(e)e.outerHTML=glHomeHTML()});
  if($('glS'))numMorph('#glS .glsv b',()=>{const e=$('glS');if(e)e.outerHTML=glSellHTML()})}
const glVal=()=>rtK()==='g'?GL.g18:GL.mz;
/* سند لحظه‌ای بیرون از صفحه سند (پیش‌نویس): فقط عددها؛ داخل صفحه سند: همان مسیر ورود دستی نرخ (شمارش، محاسبه دوباره ردیف‌ها) */
function glSync(){if(!glOn()||!glOk())return;const g=rtK()==='g';sv.rate=g?GL.g18:rOfMz(GL.mz);sv.mz=g?mzOf(GL.g18):GL.mz}
function glApply(){if(!glOn()||!glOk())return;const M=$('svM');if(cur!=='sell'||!M){glSync();return}
  const v=glVal();if(num(M.value)===v)return;M.value=String(v);GLset=true;try{if(M.oninput)M.oninput()}finally{GLset=false}
  const w=$('svRate');if(w&&w.animate&&!RM())w.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})}
ACT.glRef=()=>{if(GLbusy)return;toast('در حال گرفتن قیمت بازار…');glPull()};
ACT.glLive=()=>{if(!sv||sv.edit)return;sv.live=sv.live?0:1;svKeep();if(sv.live){if(!glOk()){toast('قیمت بازار هنوز نرسیده؛ به محض رسیدن نرخ سند پر می‌شود');glPull()}glApply()}glPaint();
  const b=document.querySelector('#glS .glu');if(b&&b.animate&&!RM())b.animate([{transform:'scale(.9)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.3,1.4,.5,1)'})};
setInterval(glPull,30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')glPull()});
setTimeout(glPull,1200);
