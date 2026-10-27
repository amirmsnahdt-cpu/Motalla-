/* ----- v61.89 قیمت لحظه‌ای طلای بازار -----
   سرور (داخل ایران) قیمت را از tgju می‌گیرد (/api/gold، کش ۳۰ ثانیه)؛ برنامه وقتی باز است هر ۳۰ ثانیه می‌پرسد.
   GL = {g18: هر گرم ۱۸ عیار, mz: مثقال (مظنه), at, stale, err} — همه به تومان. آخرین قیمت در m_gl می‌ماند.
   خانه: کارت «قیمت لحظه‌ای طلا» (#glH)؛ سند: نوار زیر سرتیتر (#glS) با فاصله نرخ سند از بازار و دکمه «همین نرخ». */
let GL=ls.get('m_gl',null),GLbusy=false;
const glOk=()=>!!(GL&&+GL.g18&&+GL.mz);
const glMin=()=>glOk()&&GL.at?Math.max(0,Math.round((Date.now()-Date.parse(GL.at))/60000)):0;
const glOld=()=>glOk()&&(GL.stale||glMin()>=5);
const glTime=()=>{try{return new Date(GL.at).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Tehran'})}catch(e){return ''}};
const glSub=()=>!glOk()?(GL&&GL.err?'قیمت بازار الان در دسترس نیست':'در حال دریافت…'):glOld()?'آخرین قیمت · ساعت '+glTime():'زنده · ساعت '+glTime();
async function glPull(){if(!TOKEN||GLbusy||document.visibilityState==='hidden')return;GLbusy=true;
  try{const j=await api('/api/gold');if(j&&+j.g18&&+j.mz){GL={g18:+j.g18,mz:+j.mz,at:j.at,stale:!!j.stale,err:0};ls.set('m_gl',GL)}}
  catch(e){GL=Object.assign(GL||{},{err:1})}
  finally{GLbusy=false}glPaint()}
function glHomeHTML(){const k=glOk();
  return `<button type="button" class="glc${glOld()?' old':''}" id="glH" data-act="glRef"><span class="glt"><b><i class="gldot"></i>قیمت لحظه‌ای طلا</b><small>${esc(glSub())}</small></span>
    <span class="glv"><small>هر گرم ۱۸</small><b>${k?fmt(GL.g18):'—'}</b></span><span class="glv"><small>مثقال</small><b>${k?fmt(GL.mz):'—'}</b></span></button>`}
/* فاصله نرخ سند از بازار (بر حسب هر گرم ۱۸) */
function glDiff(){if(!glOk()||!sv||!+sv.rate)return '';const d=(sv.rate-GL.g18)/GL.g18*100,a=Math.abs(d);
  if(a<0.05)return '<em class="eq">برابر بازار</em>';
  return `<em class="${a>=1?'far':''}">${toFa(a.toFixed(1))}٪ ${d>0?'بالاتر':'پایین‌تر'} از بازار</em>`}
function glSellHTML(){if(!glOk())return `<div class="gls" id="glS"><span class="glsl"><i class="gldot"></i>بازار</span><small>${esc(glSub())}</small></div>`;
  return `<div class="gls${glOld()?' old':''}" id="glS"><span class="glsl"><i class="gldot"></i>بازار</span><span class="glsv">گرم ۱۸ <b>${fmt(GL.g18)}</b></span><span class="glsv">مثقال <b>${fmt(GL.mz)}</b></span>${glDiff()}<button type="button" class="glu" data-act="glUse">همین نرخ</button></div>`}
/* فقط همین دو تکه دوباره ساخته می‌شوند؛ عددهای عوض‌شده می‌شمارند و می‌پرند */
function glPaint(){const h=$('glH'),s=$('glS');
  if(h)numMorph('#glH .glv b',()=>{const e=$('glH');if(e)e.outerHTML=glHomeHTML()});
  if(s)numMorph('#glS .glsv b',()=>{const e=$('glS');if(e)e.outerHTML=glSellHTML()})}
ACT.glRef=()=>{if(GLbusy)return;toast('در حال گرفتن قیمت بازار…');glPull()};
/* «همین نرخ»: قیمت بازار در خانه نرخ سند نوشته می‌شود (به همان شکلی که کاربر می‌زند: مظنه یا هر گرم) و همان مسیر ورود دستی اجرا می‌شود */
ACT.glUse=()=>{const M=$('svM');if(!M||!glOk())return;const v=rtK()==='g'?GL.g18:GL.mz;M.value=String(v);if(M.oninput)M.oninput();
  const w=$('svRate');if(w&&w.animate&&!RM())w.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})};
setInterval(glPull,30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')glPull()});
setTimeout(glPull,1200);
