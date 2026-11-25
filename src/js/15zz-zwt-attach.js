/* ---------- v107.0 افزودن عکس مثل تلگرام ----------
   خواسته صاحب اپ: «قسمت عکس و گالری مثل تلگرام که راحت باشد؛ قسمت اتچ کردن عکس هم این‌جوری؛ با این المان و آیکون؛ سرعت را بالا ببرد».
   هر دکمه عکس رسید/ردیف (ورودی‌های data-galadd / data-stf / data-pxf / data-xrf / data-fsadd) به‌جای پنجره خود گوشی این پنل را باز می‌کند:
   - کاشی اول = دوربین زنده (اگر اجازه دوربین از قبل داده شده)، زدنش = دوربین داخل برنامه، چند عکس پشت هم، شمارنده، زوم و فلاش اگر گوشی دارد، ✓ = افزودن
   - کاشی دوم = «گالری گوشی» (انتخاب‌گر خود گوشی، چند عکس؛ انتخاب = افزودن فوری)
   - بعد عکس‌های همین بار و «عکس‌های اخیر برنامه» (رسیدها و عکس ردیف‌های سه روز اخیر همین گوشی) با دایره انتخاب شماره‌دار
   نتیجه همان ورودی فایلِ دکمه را با فایل‌ها پر می‌کند و رویداد change می‌فرستد، پس پیش‌نمایش/تأیید (picOk) و ذخیره همان مسیر قبلی است.
   برنامه وب به عکس‌های گالری گوشی دسترسی مستقیم ندارد؛ کاشی «گالری گوشی» انتخاب‌گر خود گوشی را باز می‌کند.
   اپ اندروید: دوربین زنده داخل WebView اجازه جدا می‌خواهد (APK)؛ تا آن موقع کاشی دوربین، دوربین خود گوشی را باز می‌کند */
IC.clip='<path d="M20.4 11.3l-8.2 8.2a5.2 5.2 0 0 1-7.4-7.4l8.5-8.5a3.5 3.5 0 0 1 4.9 4.9l-8.5 8.5a1.7 1.7 0 0 1-2.5-2.5l7.8-7.8"/>';
IC.flash='<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>';
const TGSEL='input[type=file][data-galadd],input[type=file][data-stf],input[type=file][data-pxf],input[type=file][data-xrf],input[type=file][data-fsadd]';
const TGC={video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1440}},audio:false};
const TGT=new Map();/* کلید عکس → تصویر کوچک (فقط در حافظه) */
let TG=null;
const tgOk=()=>{try{return typeof DataTransfer==='function'&&!!new DataTransfer().items}catch(_){return false}};
const tgGum=()=>!/MotallaAndroid/.test(navigator.userAgent)&&!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)&&window.isSecureContext!==false;
document.addEventListener('click',e=>{if(e.defaultPrevented||!tgOk())return;const t=e.target;if(!t||!t.closest||t.closest('#tga,#tgc'))return;
  let inp=t.matches&&t.matches('input[type=file]')?t:null;if(!inp){const lb=t.closest('label');inp=lb&&lb.querySelector('input[type=file]')}
  if(!inp||!inp.matches(TGSEL)||inp.disabled)return;e.preventDefault();tgOpen(inp,inp.hasAttribute('capture'))},true);
const tgSubT=()=>TG&&TG.multi?'چند عکس را با هم انتخاب کنید':'یک عکس انتخاب کنید';
function tgOpen(inp,cam){tgClose(1);TG={inp,multi:!!inp.multiple,it:[],sel:[],n:0,shots:0};
  const w=document.createElement('div');w.id='tga';w.className='tga';
  w.innerHTML=`<div class="tgsc" data-tg="x"></div><div class="tgp" role="dialog" aria-label="افزودن عکس"><div class="tgh"><i class="tghb"></i><div class="tght"><b>افزودن عکس</b><small id="tgSub">${tgSubT()}</small></div><button type="button" class="tgxx" data-tg="x" aria-label="بستن">${ic('x')}</button></div>
  <div class="tgg" id="tgG"><button type="button" class="tgt tgcam" data-tg="cam" aria-label="دوربین"><video id="tgV" muted playsinline autoplay></video><span class="tgci">${ic('cam')}<small>دوربین</small></span></button><button type="button" class="tgt tggal" data-tg="gal" aria-label="گالری گوشی"><span class="tgci">${ic('gal')}<small>گالری گوشی</small></span></button><div id="tgI" class="tgis"></div></div>
  <div class="tgf" id="tgF"><div class="tgtabs"><button type="button" data-tg="gal"><i>${ic('gal')}</i><span>گالری</span></button><button type="button" data-tg="cam"><i>${ic('cam')}</i><span>دوربین</span></button></div><div class="tgsend"><span id="tgN"></span><button type="button" class="tgok" data-tg="ok"><b>افزودن</b><em id="tgC"></em></button></div></div></div>`;
  document.body.appendChild(w);document.documentElement.classList.add('tgon');requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add('on')));tgDrag(w);tgRecent();tgLive();if(cam)tgCam()}
function tgTile(x){const i=TG.sel.indexOf(x.id);return `<button type="button" class="tgt tgi${i>=0?' on':''}${x.u?'':' ld'}" data-tg="t" data-id="${esc(x.id)}" aria-label="عکس"><img alt="" decoding="async"${x.u?` src="${x.u}"`:''}><i class="tgck">${i>=0?toFa(i+1):''}</i></button>`}
function tgRe(){if(!TG)return;const I=$('tgI');if(!I)return;const A=TG.it.filter(x=>!x.r),R=TG.it.filter(x=>x.r&&!x.miss);
  I.innerHTML=A.map(tgTile).join('')+(R.length?`<div class="tgrh">عکس‌های اخیر برنامه</div>`+R.map(tgTile).join(''):'');tgPaint()}
function tgPaint(){if(!TG)return;document.querySelectorAll('#tgG .tgi').forEach(b=>{const i=TG.sel.indexOf(b.dataset.id);b.classList.toggle('on',i>=0);const c=b.querySelector('.tgck');if(c)c.textContent=i>=0?toFa(i+1):''});
  const n=TG.sel.length,f=$('tgF');if(f)f.classList.toggle('has',n>0);const C=$('tgC');if(C)C.textContent=n>1?toFa(n):'';const N=$('tgN');if(N)N.textContent=n?toFa(n)+' عکس انتخاب شد':''}
function tgAdd(o,sel){if(!TG)return null;const x={id:'n'+(++TG.n),...o};TG.it.unshift(x);if(sel){if(TG.multi)TG.sel.push(x.id);else TG.sel=[x.id]}return x}
function tgTog(id){const i=TG.sel.indexOf(id);if(i>=0)TG.sel.splice(i,1);else if(TG.multi)TG.sel.push(id);else TG.sel=[id];tgHapt();tgPaint();if(!TG.multi&&TG.sel.length)setTimeout(tgFinish,140)}
const tgHapt=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}};
/* گالری خود گوشی (یا دوربین خود گوشی وقتی دوربین داخل برنامه ممکن نیست) — انتخاب = افزودن فوری همراه عکس‌های انتخاب‌شده */
function tgGal(cam){if(!TG)return;document.querySelectorAll('input[data-tgn]').forEach(i=>i.remove());const i=document.createElement('input');i.type='file';i.accept='image/*';i.dataset.tgn='1';i.style.display='none';
  if(cam)i.setAttribute('capture','environment');else if(TG.multi&&picMulti())i.multiple=true;document.body.appendChild(i);
  i.addEventListener('change',()=>{const F=[...(i.files||[])];i.remove();if(!TG||!F.length)return;F.forEach(f=>tgAdd({f,u:URL.createObjectURL(f)},1));tgRe();tgFinish()});i.click()}
/* عکس‌های اخیر برنامه: کلیدهای عکس رسید/ردیف این گوشی در سه روز اخیر (زمان داخل خود کلید است، newImgKey) — مدارک شناسایی و عکس پروفایل نه */
async function tgKeys(){if(PVW){const K=[];try{for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&k.indexOf('m_img_')===0)K.push(k.slice(6))}}catch(_){}try{IMEM.forEach((v,k)=>K.push(k))}catch(_){}return K}
  try{const db=await idb();return await new Promise(res=>{try{const r=db.transaction('img').objectStore('img').getAllKeys();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>res([])}catch(_){res([])}})}catch(_){return[]}}
function tgThumb(d){return new Promise(res=>{const im=new Image();im.onload=()=>{const s=Math.min(1,260/Math.min(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*s));c.height=Math.max(1,Math.round(im.height*s));c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.72))};im.onerror=()=>res('');im.src=d})}
async function tgRecent(){const K=await tgKeys(),now=Date.now(),R=[],seen=new Set();
  K.forEach(k=>{k=String(k);if(seen.has(k)||!/^(xr|rc:|stl:)/.test(k))return;const m=/:([0-9a-z]{8})[0-9a-z]{3,4}$/.exec(k);if(!m)return;const t=parseInt(m[1],36);if(t>now-3*864e5&&t<now+6e4){seen.add(k);R.push([t,k])}});
  R.sort((a,b)=>b[0]-a[0]);if(!TG||!R.length)return;R.slice(0,15).forEach(([,k])=>TG.it.push({id:'r'+k,k,r:1,u:TGT.get(k)||''}));tgRe();
  for(const x of TG.it.filter(z=>z.r&&!z.u)){const d=await imgGet(x.k);if(!TG)return;if(!d){x.miss=1;const b=document.querySelector(`#tgI [data-id="${CSS.escape(x.id)}"]`);if(b)b.remove();continue}
    x.u=await tgThumb(d);if(!TG)return;if(x.u)TGT.set(x.k,x.u);const b=document.querySelector(`#tgI [data-id="${CSS.escape(x.id)}"]`);if(b){const im=b.querySelector('img');if(im&&x.u)im.src=x.u;b.classList.remove('ld')}}}
/* دوربین زنده در کاشی اول — فقط وقتی اجازه دوربین از قبل داده شده (باز کردن پنل نباید پرسش اجازه بیاورد) */
async function tgLive(){if(!tgGum())return;let g=false;try{g=(await navigator.permissions.query({name:'camera'})).state==='granted'}catch(_){}if(!g||!TG)return;try{await tgStream()}catch(_){}}
async function tgStream(){if(TG&&TG.st)return TG.st;const s=await navigator.mediaDevices.getUserMedia(TGC);if(!TG){s.getTracks().forEach(t=>t.stop());return null}TG.st=s;
  const v=$('tgV');if(v){v.srcObject=s;try{await v.play()}catch(_){}v.closest('.tgcam').classList.add('live')}return s}
async function tgCam(){if(!TG)return;if(!tgGum()||TG.noGum){TG.noGum=0;tgGal(1);return}let s=null;
  try{s=await tgStream()}catch(e){if(TG){TG.noGum=1;toast('اجازه دوربین داده نشد؛ دوباره «دوربین» را بزنید تا دوربین خود گوشی باز شود',true)}return}
  if(!s||!TG)return;const c=document.createElement('div');c.id='tgc';c.className='tgc';
  c.innerHTML=`<video id="tgcV" muted playsinline autoplay></video><i class="tgfl" id="tgFl"></i><div class="tgct"><button type="button" class="tgcb" data-tg="cx" aria-label="بستن دوربین">${ic('x')}</button><span class="tgcs" id="tgCs"></span><button type="button" class="tgcb tgto" id="tgTo" data-tg="torch" aria-label="فلاش" hidden>${ic('flash')}</button></div>
  <div class="tgcz" id="tgZ"></div><div class="tgcbar"><button type="button" class="tgcl" id="tgCl" data-tg="cx" aria-label="عکس‌های گرفته‌شده"><img alt="" id="tgCi"><em id="tgCn"></em></button><button type="button" class="tgshut" data-tg="snap" aria-label="گرفتن عکس"><i></i></button><button type="button" class="tgcok" id="tgCok" data-tg="cok" aria-label="افزودن عکس‌ها">${ic('check')}</button></div>`;
  document.body.appendChild(c);const v=$('tgcV');v.srcObject=s;try{await v.play()}catch(_){}requestAnimationFrame(()=>c.classList.add('on'));tgCamPaint();tgZoomInit()}
function tgCamPaint(){if(!TG)return;const n=TG.shots,l=$('tgCl'),o=$('tgCok'),N=$('tgCn'),S=$('tgCs');if(l)l.classList.toggle('on',n>0);if(o)o.classList.toggle('on',TG.sel.length>0);if(N)N.textContent=n?toFa(n):'';if(S)S.textContent=n?toFa(n)+' عکس':''}
async function tgSnap(){const v=$('tgcV');if(!TG||!v||!v.videoWidth){return}const W=v.videoWidth,H=v.videoHeight,sc=Math.min(1,1800/Math.max(W,H)),c=document.createElement('canvas');c.width=Math.round(W*sc);c.height=Math.round(H*sc);c.getContext('2d').drawImage(v,0,0,c.width,c.height);
  const fl=$('tgFl');if(fl){fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go')}tgHapt();
  const b=await new Promise(r=>c.toBlob(r,'image/jpeg',.86));if(!b||!TG)return;const u=URL.createObjectURL(b);tgAdd({f:new File([b],'cam-'+Date.now()+'.jpg',{type:'image/jpeg'}),u},1);TG.shots++;
  const ci=$('tgCi');if(ci)ci.src=u;const cl=$('tgCl');if(cl){cl.classList.remove('pop');void cl.offsetWidth;cl.classList.add('pop')}tgCamPaint();tgRe();if(!TG.multi)setTimeout(tgFinish,180)}
function tgTrack(){return TG&&TG.st&&TG.st.getVideoTracks()[0]}
function tgZoomInit(){const t=tgTrack(),Z=$('tgZ'),T=$('tgTo');if(!t||!t.getCapabilities)return;let C={};try{C=t.getCapabilities()||{}}catch(_){}
  if(C.torch&&T)T.hidden=false;const z=C.zoom;if(!z||!Z||!(z.max>z.min))return;let cur=1;try{cur=+(t.getSettings().zoom)||z.min}catch(_){}
  const V=[...new Set([z.min,1,2,3].filter(v=>v>=z.min&&v<=z.max).map(v=>+v.toFixed(1)))];if(V.length<2)return;
  Z.innerHTML=V.map(v=>`<button type="button" data-tg="z" data-v="${v}" class="${Math.abs(v-cur)<.05?'on':''}">${toFa(String(v).replace('.','٫'))}${Math.abs(v-cur)<.05?'×':''}</button>`).join('')}
async function tgZoom(v){const t=tgTrack();if(!t)return;try{await t.applyConstraints({advanced:[{zoom:v}]})}catch(_){return}document.querySelectorAll('#tgZ button').forEach(b=>{const on=Math.abs(+b.dataset.v-v)<.05;b.classList.toggle('on',on);const x=+b.dataset.v;b.textContent=toFa(String(x).replace('.','٫'))+(on?'×':'')});tgHapt()}
async function tgTorch(){const t=tgTrack(),b=$('tgTo');if(!t||!b)return;const on=!b.classList.contains('on');try{await t.applyConstraints({advanced:[{torch:on}]});b.classList.toggle('on',on)}catch(_){}}
function tgCamX(){const c=$('tgc');if(!c)return;c.classList.remove('on');c.classList.add('out');setTimeout(()=>c.remove(),260);tgPaint()}
function tgBlob(d){const m=/^data:([^;,]+)?(;base64)?,(.*)$/.exec(d||'');if(!m)return null;const s=m[2]?atob(m[3]):decodeURIComponent(m[3]),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return new Blob([a],{type:m[1]||'image/jpeg'})}
async function tgFinish(){if(!TG||TG.fin)return;const S=TG.sel.map(id=>TG.it.find(x=>x.id===id)).filter(Boolean);if(!S.length){toast('عکسی انتخاب نشده است',true);return}TG.fin=1;
  const F=[];for(const x of S){if(x.f)F.push(x.f);else if(x.k){const d=await imgGet(x.k),b=d&&tgBlob(d);if(b)F.push(new File([b],'img-'+Date.now()+'-'+F.length+'.jpg',{type:b.type}))}}
  const inp=TG.inp;tgClose();if(!F.length){toast('عکس پیدا نشد',true);return}
  let tmp=null;if(!inp.isConnected){tmp=document.createElement('div');tmp.hidden=true;tmp.appendChild(inp);document.body.appendChild(tmp)}
  try{const dt=new DataTransfer();F.forEach(f=>dt.items.add(f));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){toast('افزودن عکس در این گوشی ممکن نشد',true)}
  if(tmp)setTimeout(()=>tmp.remove(),0)}
function tgClose(now){const o=TG;TG=null;document.documentElement.classList.remove('tgon');document.querySelectorAll('input[data-tgn]').forEach(i=>i.remove());
  if(o){if(o.st)o.st.getTracks().forEach(t=>{try{t.stop()}catch(_){}});setTimeout(()=>o.it.forEach(x=>{if(x.f&&x.u)try{URL.revokeObjectURL(x.u)}catch(_){}}),1500)}
  ['tga','tgc'].forEach(id=>{const w=$(id);if(!w)return;w.removeAttribute('id');if(now){w.remove();return}w.classList.remove('on');w.classList.add('out');setTimeout(()=>w.remove(),280)})}
/* برگشت اندروید: اول دوربین، بعد پنل */
function tgBack(){if(!TG)return false;if($('tgc'))tgCamX();else tgClose();return true}
/* کشیدن سر پنل به پایین = بستن */
function tgDrag(w){const h=w.querySelector('.tgh'),p=w.querySelector('.tgp');let y0=null,dy=0;
  h.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;y0=e.touches[0].clientY;dy=0;p.style.transition='none'},{passive:true});
  h.addEventListener('touchmove',e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);p.style.transform=`translateY(${dy}px)`},{passive:true});
  h.addEventListener('touchend',()=>{if(y0==null)return;y0=null;p.style.transition='';if(dy>90)tgClose();else p.style.transform=''})}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#tga [data-tg],#tgc [data-tg]');if(!b)return;e.preventDefault();e.stopPropagation();if(!TG)return;const a=b.dataset.tg;
  if(a==='x')tgClose();else if(a==='cam')tgCam();else if(a==='gal')tgGal();else if(a==='t')tgTog(b.dataset.id);else if(a==='ok'||a==='cok')tgFinish();
  else if(a==='cx')tgCamX();else if(a==='snap')tgSnap();else if(a==='torch')tgTorch();else if(a==='z')tgZoom(+b.dataset.v)},true);
