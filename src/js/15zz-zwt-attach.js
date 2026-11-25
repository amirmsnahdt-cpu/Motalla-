/* ---------- v107.0 دوربین سریع داخل برنامه ----------
   صاحب اپ: «عکس و گالری مستقیم همان‌جا باشد، همان قبلی بهتر است ولی بهتر شود» (v106.9 پنل تلگرامی را نخواست).
   دکمه «دوربین» هر جای برنامه (ورودی‌های عکس رسید/ردیف با capture: data-galadd / data-stf / data-pxf / data-xrf / data-fsadd)
   به‌جای دوربین خود گوشی، دوربین تمام‌صفحه داخل برنامه را باز می‌کند: بدون خروج از برنامه، چند عکس پشت هم با شمارنده،
   زوم و فلاش اگر گوشی دارد، ✓ = افزودن همه. نتیجه همان ورودی فایل دکمه را با عکس‌ها پر می‌کند و change می‌فرستد،
   پس پیش‌نمایش/تأیید (picOk) و ذخیره همان مسیر قبلی است. دکمه «گالری» دست نخورده = گالری خود گوشی.
   اپ اندروید (WebView بدون اجازه دوربین زنده) و مرورگر بی‌getUserMedia: همان دوربین خود گوشی؛
   اگر اجازه دوربین داده نشد، از آن به بعد در همین باز بودن برنامه هم دوربین خود گوشی (TGNO) */
const TGSEL='input[type=file][capture][data-galadd],input[type=file][capture][data-stf],input[type=file][capture][data-pxf],input[type=file][capture][data-xrf],input[type=file][capture][data-fsadd]';
const TGC={video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}},audio:false};
IC.flash='<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>';
let TG=null,TGNO=0;
const tgOk=()=>{try{return typeof DataTransfer==='function'&&!!new DataTransfer().items}catch(_){return false}};
const tgGum=()=>!TGNO&&!/MotallaAndroid/.test(navigator.userAgent)&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)&&window.isSecureContext!==false;
document.addEventListener('click',e=>{if(e.defaultPrevented||TG||!tgGum()||!tgOk())return;const t=e.target;if(!t||!t.closest)return;
  let inp=t.matches&&t.matches('input[type=file]')?t:null;if(!inp){const lb=t.closest('label');inp=lb&&lb.querySelector('input[type=file]')}
  if(!inp||!inp.matches(TGSEL)||inp.disabled)return;e.preventDefault();tgCam(inp)},true);
const tgHapt=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}};
async function tgCam(inp){TG={inp,multi:!!(inp.multiple||inp.dataset.galadd!=null||inp.dataset.fsadd!=null),shots:[],st:null};let s=null;
  try{s=await navigator.mediaDevices.getUserMedia(TGC)}catch(e){TG=null;TGNO=1;toast('اجازه دوربین داده نشد؛ دوباره «دوربین» را بزنید تا دوربین خود گوشی باز شود',true);return}
  if(!TG){s.getTracks().forEach(t=>t.stop());return}TG.st=s;const c=document.createElement('div');c.id='tgc';c.className='tgc';
  c.innerHTML=`<video id="tgcV" muted playsinline autoplay></video><i class="tgfl" id="tgFl"></i><div class="tgct"><button type="button" class="tgcb" data-tg="cx" aria-label="بستن دوربین">${ic('x')}</button><span class="tgcs" id="tgCs"></span><button type="button" class="tgcb tgto" id="tgTo" data-tg="torch" aria-label="فلاش" hidden>${ic('flash')}</button></div>
  <div class="tgcz" id="tgZ"></div><div class="tgcbar"><button type="button" class="tgcl" id="tgCl" data-tg="cok" aria-label="عکس‌های گرفته‌شده"><img alt="" id="tgCi"><em id="tgCn"></em></button><button type="button" class="tgshut" data-tg="snap" aria-label="گرفتن عکس"><i></i></button><button type="button" class="tgcok" id="tgCok" data-tg="cok" aria-label="افزودن عکس‌ها">${ic('check')}<span>افزودن</span></button></div>`;
  document.body.appendChild(c);const v=$('tgcV');v.srcObject=s;try{await v.play()}catch(_){}requestAnimationFrame(()=>c.classList.add('on'));tgCamPaint();tgZoomInit()}
function tgCamPaint(){if(!TG)return;const n=TG.shots.length,l=$('tgCl'),o=$('tgCok'),N=$('tgCn'),S=$('tgCs');if(l)l.classList.toggle('on',n>0);if(o)o.classList.toggle('on',n>0);if(N)N.textContent=n?toFa(n):'';if(S)S.textContent=n?toFa(n)+' عکس':(TG.multi?'چند عکس پشت هم بگیرید':'')}
async function tgSnap(){const v=$('tgcV');if(!TG||TG.fin||!v||!v.videoWidth)return;const W=v.videoWidth,H=v.videoHeight,sc=Math.min(1,1800/Math.max(W,H)),c=document.createElement('canvas');c.width=Math.round(W*sc);c.height=Math.round(H*sc);c.getContext('2d').drawImage(v,0,0,c.width,c.height);
  const fl=$('tgFl');if(fl){fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go')}tgHapt();
  const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.86));if(!b||!TG)return;const u=URL.createObjectURL(b);TG.shots.push({f:new File([b],'cam-'+Date.now()+'.jpg',{type:'image/jpeg'}),u});
  const ci=$('tgCi');if(ci)ci.src=u;const cl=$('tgCl');if(cl){cl.classList.remove('pop');void cl.offsetWidth;cl.classList.add('pop')}tgCamPaint();if(!TG.multi)setTimeout(tgFinish,180)}
function tgTrack(){return TG&&TG.st&&TG.st.getVideoTracks()[0]}
const tgZl=v=>toFa(String(v).replace('.','٫'));
function tgZoomInit(){const t=tgTrack(),Z=$('tgZ'),T=$('tgTo');if(!t||!t.getCapabilities)return;let C={};try{C=t.getCapabilities()||{}}catch(_){}
  if(C.torch&&T)T.hidden=false;const z=C.zoom;if(!z||!Z||!(z.max>z.min))return;let cur=1;try{cur=+(t.getSettings().zoom)||z.min}catch(_){}
  const V=[...new Set([z.min,1,2,3].filter(v=>v>=z.min&&v<=z.max).map(v=>+v.toFixed(1)))];if(V.length<2)return;
  Z.innerHTML=V.map(v=>{const on=Math.abs(v-cur)<.05;return `<button type="button" data-tg="z" data-v="${v}" class="${on?'on':''}">${tgZl(v)}${on?'×':''}</button>`}).join('')}
async function tgZoom(v){const t=tgTrack();if(!t)return;try{await t.applyConstraints({advanced:[{zoom:v}]})}catch(_){return}document.querySelectorAll('#tgZ button').forEach(b=>{const x=+b.dataset.v,on=Math.abs(x-v)<.05;b.classList.toggle('on',on);b.textContent=tgZl(x)+(on?'×':'')});tgHapt()}
async function tgTorch(){const t=tgTrack(),b=$('tgTo');if(!t||!b)return;const on=!b.classList.contains('on');try{await t.applyConstraints({advanced:[{torch:on}]});b.classList.toggle('on',on)}catch(_){}}
function tgFinish(){if(!TG||TG.fin)return;const F=TG.shots.map(x=>x.f);if(!F.length)return;TG.fin=1;const inp=TG.inp;tgClose();
  let tmp=null;if(!inp.isConnected){tmp=document.createElement('div');tmp.hidden=true;tmp.appendChild(inp);document.body.appendChild(tmp)}
  try{const dt=new DataTransfer();F.forEach(f=>dt.items.add(f));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){toast('افزودن عکس در این گوشی ممکن نشد',true)}
  if(tmp)setTimeout(()=>tmp.remove(),0)}
function tgClose(){const o=TG;TG=null;if(o){if(o.st)o.st.getTracks().forEach(t=>{try{t.stop()}catch(_){}});setTimeout(()=>o.shots.forEach(x=>{try{URL.revokeObjectURL(x.u)}catch(_){}}),1500)}
  const w=$('tgc');if(!w)return;w.removeAttribute('id');w.classList.remove('on');w.classList.add('out');setTimeout(()=>w.remove(),260)}
/* × با عکس گرفته‌شده: بار اول فقط هشدار روی خود دوربین (پنجره تأیید زیر دوربین می‌ماند)، بار دوم در ۳ ثانیه = بستن بی‌افزودن */
function tgX(){if(!TG)return;const n=TG.shots.length;if(n&&!(TG.xw&&Date.now()-TG.xw<3000)){TG.xw=Date.now();const S=$('tgCs');if(S){S.textContent='یک بار دیگر × = بستن بدون افزودن '+toFa(n)+' عکس';S.classList.add('wr')}setTimeout(()=>{if(TG&&Date.now()-TG.xw>=2900){const S2=$('tgCs');if(S2)S2.classList.remove('wr');tgCamPaint()}},3000);return}tgClose()}
/* برگشت اندروید (16-boot) */
function tgBack(){if(!TG)return false;tgX();return true}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#tgc [data-tg]');if(!b)return;e.preventDefault();e.stopPropagation();if(!TG)return;const a=b.dataset.tg;
  if(a==='cx')tgX();else if(a==='snap')tgSnap();else if(a==='cok')tgFinish();else if(a==='torch')tgTorch();else if(a==='z')tgZoom(+b.dataset.v)},true);
