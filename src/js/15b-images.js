/* ---------- عکس رسیدها: چند عکس برای هر واریز بانکی و هر تسویه مشتری، ویرایش (چرخش و برش) و بزرگ‌نمایی داخل برنامه ---------- */
/* کلید عکس‌ها روی خود ردیف ذخیره می‌شود (imgs)؛ ردیف‌های قدیمی که فقط img دارند همان کلید قبلی را نگه می‌دارند */
const itImgs=(b,x)=>Array.isArray(x.imgs)?x.imgs.slice():x.img?[ikey(b,x)]:[];
const stImgs=z=>Array.isArray(z.imgs)?z.imgs.slice():z.img&&typeof z.img==='string'?[z.img]:[];
const newImgKey=p=>p+':'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
let GAL=null;
/* v59.6: اپ اندرویدِ قدیمی نتیجه «چند عکس با هم» گالری را به صفحه نمی‌داد (عکس انتخاب می‌شد ولی اضافه نمی‌شد)؛
   در آن نسخه‌ها انتخاب تک‌عکسی است تا همیشه کار کند. اپ جدید (multiPick) و آیفون/مرورگر چند عکس با هم. */
/* v59.9: اپ اندروید جدید دوربین را مستقیم باز می‌کند (عکس همان لحظه)؛ آیفون خودش در منوی انتخاب «Take Photo» دارد */
const picCam=()=>!!(window.AndroidBridge&&AndroidBridge.camera&&(()=>{try{return AndroidBridge.camera()}catch(e){return false}})());
const picMulti=()=>!/MotallaAndroid/.test(navigator.userAgent)||!!(window.AndroidBridge&&AndroidBridge.multiPick);
/* صاحب عکس‌ها: {k:'it',eid} = رسید واریز بانکی یک واریزی، {k:'st',eid,sid} = رسید یک تسویه مشتری */
function galCtx(){if(!GAL)return null;const e=entries.find(z=>String(z.id)===String(GAL.eid));if(!e)return null;const now=()=>new Date().toISOString();
  if(GAL.k==='it'){const q=entBI(e);if(!q)return null;/* رسید حتی بعد از تأیید و بایگانی لیست هم اضافه می‌شود؛ وضعیت واریز در لیست بسته تغییر نمی‌کند */
    return{keys:itImgs(q.b,q.it),ed:can('track'),pre:'rc:'+e.id,
    set:K=>{q.it.imgs=K;q.it.img=K.length>0;q.it.at=now();saveB()},
    meta:{name:fullName(e),holder:e.holder||fullName(e),amount:q.it.amount,tn:q.it.tn||'',src:q.it.src||'',date:PD(e),kind:'bank'}}}
  const z=(e.settles||[]).find(s=>String(s.id)===String(GAL.sid));if(!z)return null;
  return{keys:stImgs(z),ed:can('edit'),pre:'stl:'+z.id,
    set:K=>{z.imgs=K;z.img=K[0]||'';e.updatedAt=now();e.updatedBy=who();saveE();stlSync(e)},
    meta:{name:fullName(e)+' (از '+z.name+')',holder:e.holder||fullName(e),payer:z.name,amount:z.amount,tn:z.tn||'',date:z.date,kind:'cust'}}}
function galHTML(){const c=galCtx();if(!c)return `<div class="sh-h"><b>رسید</b><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="spempty"><b>پیدا نشد</b></div>`;const K=c.keys;
  return `<div class="sh-h"><div><b>${GAL.k==='it'?'رسید واریز بانکی':'رسید تسویه مشتری'}</b><small class="shsub">${esc(c.meta.name)} · ${fmt(c.meta.amount)} تومان${K.length?'، '+fmt(K.length)+' عکس':''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="galg">${K.map((k,i)=>`<button class="galt" data-act="galView" data-i="${i}" aria-label="دیدن عکس ${toFa(i+1)}"><span class="galim" id="gal${i}"></span><i>${toFa(i+1)}</i></button>`).join('')}${c.ed?`<label class="galt add">${ic('plus')}<span>${K.length?'عکس دیگر':'افزودن عکس'}</span><input type="file" accept="image/*"${picMulti()?' multiple':''} data-galadd="1" hidden></label>${picCam()?`<label class="galt add">${ic('cam')}<span>دوربین</span><input type="file" accept="image/*" capture="environment" data-galadd="1" hidden></label>`:''}`:''}</div>
  ${!K.length?`<div class="galnote">${c.ed?(picMulti()?'می‌توانید چند عکس با هم انتخاب کنید؛':'عکس‌ها را یکی‌یکی اضافه کنید؛')+' هر عکس را بعداً بزرگ کنید، بچرخانید یا برش بزنید.':'برای این واریز عکسی ثبت نشده است.'}</div>`:`<div class="galnote">برای بزرگ‌نمایی، چرخش یا برش روی عکس بزنید.</div><div class="txacts"><button data-act="galShare">${ic('open')} اشتراک${K.length>1?' همه':''}</button><button data-act="galSave">${ic('down')} ذخیره${K.length>1?' همه':''}</button></div>`}`}
function openGal(ref){GAL=ref;sheet(galHTML());galThumbs()}
function galThumbs(){const c=galCtx();if(!c)return;c.keys.forEach(async(k,i)=>{const d=await imgGet(k),el=$('gal'+i);if(el&&d)el.style.backgroundImage=`url(${d})`})}
function galRefresh(){const ig=$('itgal');if(!$('ov').classList.contains('hide')&&GAL&&ig){ig.innerHTML=itGalHTML();galThumbs()}else if(!$('ov').classList.contains('hide')&&GAL&&$('sheet').querySelector('.galg'))$('sheet').innerHTML=galHTML(),galThumbs();if(['ent','lday','part','batch','day'].includes(cur)){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}}
const galFiles=c=>c.keys.map(k=>({key:k,...c.meta}));
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.dataset||t.dataset.galadd==null)return;const F=[...(t.files||[])];t.value='';if(!F.length)return;const c=galCtx();if(!c||!c.ed)return;
  const K=c.keys;let n=0;for(const f of F){try{const d=await shrink(f),k=newImgKey(c.pre);if(await imgPut(k,d)){K.push(k);n++}else{toast('حافظه پر است؛ عکس ذخیره نشد',true);break}}catch(e){toast('این عکس خوانده نشد',true)}}
  if(n){galCtx().set(K);logA('edit','افزودن رسید',c.meta.name+' | '+fmt(n)+' عکس');galRefresh();toast(n>1?fmt(n)+' عکس اضافه شد':'عکس اضافه شد')}});
ACT.galIt=d=>{const e=entries.find(z=>String(z.id)===String(d.id));if(!e||!entBI(e)){toast('این واریزی هنوز ارسال نشده است',true);return}openGal({k:'it',eid:e.id})};
/* v61.2: رسید تسویه‌های یک واریزیِ کامل با مشتری — یک پنجره با همه تسویه‌ها؛ هر تسویه عکس‌هایش و دکمه گالری/دوربین همان‌جا */
let FSE=null;
function fsHTML(){const e=entries.find(z=>String(z.id)===String(FSE));if(!e)return '';const S=e.settles||[],ed=can('edit');
  return `<div class="sh-h"><div><b>رسیدهای تسویه</b><small class="shsub">${esc(fullName(e))}، ${toFa(S.length)} تسویه</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${S.map(z=>{const K=stImgs(z);return `<div class="fss"><div class="fsh"><span class="bkb lg" style="--bc:#15803d">${esc(userInit(z.name||'؟'))}</span><span class="tx"><b>${esc(z.name||'—')}</b><small>${fmt(z.amount)} تومان${K.length?'، '+toFa(K.length)+' عکس':'، بدون رسید'}</small></span></div>
    <div class="galg itgal">${K.map((k,i)=>`<button class="galt" data-act="galFsP" data-id="${e.id}" data-sid="${z.id}" data-i="${i}" aria-label="دیدن عکس"><span class="galim" id="fs${z.id}_${i}"></span></button>`).join('')}${ed?`<label class="galt add">${ic('plus')}<span>گالری</span><input type="file" accept="image/*"${picMulti()?' multiple':''} data-fsadd="${z.id}" hidden></label>${picCam()?`<label class="galt add">${ic('cam')}<span>دوربین</span><input type="file" accept="image/*" capture="environment" data-fsadd="${z.id}" hidden></label>`:''}`:''}</div></div>`}).join('')}`}
function fsThumbs(){const e=entries.find(z=>String(z.id)===String(FSE));if(!e)return;(e.settles||[]).forEach(z=>stImgs(z).forEach(async(k,i)=>{const d=await imgGet(k),el=$('fs'+z.id+'_'+i);if(el&&d)el.style.backgroundImage=`url(${d})`}))}
ACT.galFs=d=>{const e=entries.find(z=>String(z.id)===String(d.id));if(!e||!(e.settles||[]).length)return;FSE=e.id;sheet(fsHTML());fsThumbs()};
ACT.galFsP=d=>{openGal({k:'st',eid:+d.id||d.id,sid:+d.sid||d.sid});if(d.i!=null)setTimeout(()=>zvOpen(+d.i),60)};
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.dataset||t.dataset.fsadd==null)return;const F=[...(t.files||[])];t.value='';if(!F.length||!can('edit'))return;
  const e=entries.find(z=>String(z.id)===String(FSE)),z=e&&(e.settles||[]).find(q=>String(q.id)===String(t.dataset.fsadd));if(!z)return;const K=stImgs(z);let n=0;
  for(const f of F){try{const d=await shrink(f),k=newImgKey('stl:'+z.id);if(await imgPut(k,d)){K.push(k);n++}else{toast('حافظه پر است؛ عکس ذخیره نشد',true);break}}catch(x){toast('این عکس خوانده نشد',true)}}
  if(n){z.imgs=K;z.img=K[0]||'';e.updatedAt=new Date().toISOString();e.updatedBy=who();saveE();stlSync(e);logA('edit','افزودن رسید تسویه',fullName(e)+' ← '+z.name+' | '+fmt(n)+' عکس');if($('sheet').querySelector('.fss')){$('sheet').innerHTML=fsHTML();fsThumbs()}if(['lday','ent'].includes(cur)){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}toast(n>1?fmt(n)+' عکس اضافه شد':'عکس اضافه شد')}});
ACT.galSt=d=>{const e=stlE(),z=e&&(e.settles||[])[+d.i];if(!z)return;openGal({k:'st',eid:e.id,sid:z.id})};
ACT.galView=d=>zvOpen(+d.i);
ACT.galShare=async()=>{const c=galCtx();if(c)rcShare(await rcFiles(galFiles(c)),'رسید '+c.meta.name)};
ACT.galSave=async()=>{const c=galCtx();if(c)rcDown(await rcFiles(galFiles(c)))};
/* ---------- نمایش تمام‌صفحه: دو انگشت یا دو بار زدن برای بزرگ‌نمایی، کشیدن برای جابه‌جایی ---------- */
let ZV=null;
function zvEl(){let z=$('zv');if(!z){z=document.createElement('div');z.id='zv';z.className='zv hide';z.setAttribute('role','dialog');z.setAttribute('aria-label','نمایش عکس');document.body.appendChild(z);zvBind(z)}return z}
/* v61.3: عکس‌ها در حافظه نگه داشته می‌شوند (و عکس قبلی/بعدی از قبل خوانده می‌شود) تا ورق زدن بی‌مکث باشد */
const ZVC=new Map();async function zvGet(k){if(ZVC.has(k))return ZVC.get(k);const v=await imgGet(k);if(v){ZVC.set(k,v);if(ZVC.size>24)ZVC.delete(ZVC.keys().next().value)}return v}
function zvPre(){const c=galCtx();if(!c||!ZV)return;[ZV.i-1,ZV.i+1].forEach(j=>{if(j>=0&&j<c.keys.length)zvGet(c.keys[j])})}
async function zvOpen(i,from){const c=galCtx();if(!c||!c.keys.length)return;i=Math.max(0,Math.min(c.keys.length-1,i));const k=c.keys[i];ZV={i,k,s:1,x:0,y:0,crop:null,src:ZVC.get(k)||''};const z=zvEl();z.classList.remove('hide');zvBar();
  const im0=$('zvi');if(from&&im0&&!RM()&&im0.animate)im0.animate([{translate:(from*0.35*innerWidth)+'px 0',opacity:.2},{translate:'0 0',opacity:1}],{duration:260,easing:'cubic-bezier(.2,.9,.25,1)'});
  const v=await zvGet(k);const im=$('zvi');if(!v){toast('عکس پیدا نشد',true);zvClose();return}if(im&&ZV&&ZV.k===k){if(im.getAttribute('src')!==v)im.src=v;ZV.src=v}zvPre()}
function zvBar(){const c=galCtx(),z=zvEl();if(!c||!ZV)return;const n=c.keys.length,ed=c.ed;
  z.innerHTML=`<div class="zvt"><button class="zb" data-act="zvClose" aria-label="بستن">×</button><span class="zc">${toFa(ZV.i+1)} از ${toFa(n)}</span><span class="zsp"></span>${ZV.crop?`<button class="zb t" data-act="zvCropNo">انصراف</button><button class="zb t pri" data-act="zvCropOk">${ic('check')} برش</button>`:`${ed?`<button class="zb" data-act="zvRot" aria-label="چرخش">${ic('undo')}</button><button class="zb" data-act="zvCrop" aria-label="برش">${ZCROP}</button><button class="zb" data-act="zvDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="zb" data-act="zvShare" aria-label="اشتراک">${ic('open')}</button>`}</div>
  <div class="zvs" id="zvs"><img id="zvi" alt="رسید" draggable="false"${ZV.src?` src="${ZV.src}"`:''}>${ZV.crop?'<div class="zcr" id="zcr"><i data-h="nw"></i><i data-h="ne"></i><i data-h="sw"></i><i data-h="se"></i></div>':''}</div>
  ${n>1&&!ZV.crop?`<div class="zvn"><button class="zb" data-act="zvGo" data-d="-1" aria-label="قبلی"${ZV.i?'':' disabled'}>${ic('back')}</button><span>${esc(c.meta.name)}</span><button class="zb" data-act="zvGo" data-d="1" aria-label="بعدی"${ZV.i<n-1?'':' disabled'}>${ic('back').replace('class="i"','class="i flip"')}</button></div>`:`<div class="zvn"><span>${esc(c.meta.name)} · ${fmt(c.meta.amount)} تومان</span></div>`}`;
  zvApply();if(ZV.crop)requestAnimationFrame(zvCropInit)}
const ZCROP='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14"/></svg>';
function zvApply(){const im=$('zvi');if(im&&ZV)im.style.transform=`translate(${ZV.x}px,${ZV.y}px) scale(${ZV.s})`}
function zvClose(){ZV=null;const z=$('zv');if(z){z.classList.add('hide');z.innerHTML=''}}
function zvClamp(){const s=$('zvs'),im=$('zvi');if(!s||!im||!ZV)return;if(ZV.s<=1){ZV.s=1;ZV.x=0;ZV.y=0;return}const W=im.offsetWidth*ZV.s,H=im.offsetHeight*ZV.s,mx=Math.max(0,(W-s.clientWidth)/2),my=Math.max(0,(H-s.clientHeight)/2);ZV.x=Math.max(-mx,Math.min(mx,ZV.x));ZV.y=Math.max(-my,Math.min(my,ZV.y))}
/* v61.3: لمس نمایش‌گر — عکس همراه انگشت جابه‌جا می‌شود؛ رها کردن با سرعت یا بیش از یک‌پنجم عرض = عکس بعدی/قبلی با حرکت،
   کشیدن به پایین = بستن (پس‌زمینه کم‌رنگ می‌شود)، دو انگشت = بزرگ‌نمایی، دو ضربه = بزرگ/کوچک */
function zvBind(z){const P=new Map();let st=null,lastTap=0;
  const img=()=>$('zvi'),tr=(x,y)=>{const im=img();if(im)im.style.transform=`translate(${x}px,${y}px) scale(1)`};
  const back=()=>{const im=img();if(im){im.style.transition='transform .28s cubic-bezier(.2,.9,.25,1)';tr(0,0);setTimeout(()=>{if(im)im.style.transition=''},300)}z.style.background=''};
  z.addEventListener('pointerdown',e=>{if(!ZV||ZV.crop||!e.target.closest('#zvs'))return;z.classList.add('drag');z.setPointerCapture&&z.setPointerCapture(e.pointerId);P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(P.size===2){const [a,b]=[...P.values()];st={d:Math.hypot(a.x-b.x,a.y-b.y),s:ZV.s,x:ZV.x,y:ZV.y,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2}}else{st={px:e.clientX,py:e.clientY,x:ZV.x,y:ZV.y,moved:false,lk:null,t:performance.now(),lx:e.clientX,ly:e.clientY,lt:performance.now(),vx:0,vy:0}}});
  z.addEventListener('pointermove',e=>{if(!ZV||!P.has(e.pointerId)||!st)return;P.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(P.size===2&&st.d){const [a,b]=[...P.values()],d=Math.hypot(a.x-b.x,a.y-b.y);ZV.s=Math.max(1,Math.min(6,st.s*d/st.d));const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;ZV.x=st.x+(cx-st.cx);ZV.y=st.y+(cy-st.cy);zvClamp();zvApply();return}
    if(P.size!==1||st.px==null)return;const dx=e.clientX-st.px,dy=e.clientY-st.py,now=performance.now(),dt=Math.max(1,now-st.lt);
    st.vx=(e.clientX-st.lx)/dt;st.vy=(e.clientY-st.ly)/dt;st.lx=e.clientX;st.ly=e.clientY;st.lt=now;
    if(Math.abs(dx)+Math.abs(dy)>6)st.moved=true;
    if(ZV.s>1){ZV.x=st.x+dx;ZV.y=st.y+dy;zvClamp();zvApply();return}
    if(!st.lk&&st.moved)st.lk=Math.abs(dx)>Math.abs(dy)?'h':'v';
    if(st.lk==='h'){const c=galCtx(),n=c?c.keys.length:1,edge=(dx>0&&ZV.i===0)||(dx<0&&ZV.i>=n-1);tr(edge?dx*.3:dx,0)}
    else if(st.lk==='v'&&dy>0){tr(0,dy);z.style.background=`rgba(5,8,15,${Math.max(.35,1-dy/500)})`}});
  const up=e=>{if(!ZV||!P.has(e.pointerId))return;P.delete(e.pointerId);if(!P.size)z.classList.remove('drag');
    if(!P.size&&st&&st.px!=null){const dx=e.clientX-st.px,dy=e.clientY-st.py,W=innerWidth;
      if(!st.moved){const t=Date.now();if(t-lastTap<300){const s=$('zvs'),r=s.getBoundingClientRect();if(ZV.s>1){ZV.s=1;ZV.x=0;ZV.y=0}else{ZV.s=2.5;ZV.x=(r.left+r.width/2-e.clientX)*1.5;ZV.y=(r.top+r.height/2-e.clientY)*1.5;zvClamp()}zvApply();lastTap=0}else lastTap=t}
      else if(ZV.s<=1&&st.lk==='v'){if(dy>110||st.vy>.6){const im=img();z.style.transition='background .2s';z.style.background='rgba(5,8,15,0)';if(im&&!RM()&&im.animate){im.animate([{transform:`translate(0,${dy}px)`},{transform:`translate(0,${innerHeight}px)`}],{duration:200,easing:'ease-in',fill:'forwards'}).onfinish=()=>{z.style.transition='';z.style.background='';zvClose()}}else{z.style.transition='';z.style.background='';zvClose()}}else back()}
      else if(ZV.s<=1&&st.lk==='h'){/* لبه راست به چپ = برگشت (مثل آیفون) */if(st.px>W-32&&dx<-70){zvClose();return}
        const c=galCtx(),ni=ZV.i+(dx<0?1:-1);
        if(c&&ni>=0&&ni<c.keys.length&&(Math.abs(dx)>W*.18||Math.abs(st.vx)>.45)){const im=img(),dir=dx<0?-1:1;if(im&&!RM()&&im.animate){im.style.transition='';im.animate([{transform:`translate(${dx}px,0)`},{transform:`translate(${dir*W}px,0)`,opacity:.3}],{duration:170,easing:'cubic-bezier(.4,0,.8,.6)',fill:'forwards'}).onfinish=()=>zvOpen(ni,-dir)}else zvOpen(ni)}
        else back()}}
    if(P.size<2)st=P.size===1?(()=>{const p=[...P.values()][0];return{px:p.x,py:p.y,x:ZV.x,y:ZV.y,moved:true,lk:null,lx:p.x,ly:p.y,lt:performance.now(),vx:0,vy:0}})():null};
  z.addEventListener('pointerup',up);z.addEventListener('pointercancel',up);
  z.addEventListener('wheel',e=>{if(!ZV||ZV.crop)return;e.preventDefault();ZV.s=Math.max(1,Math.min(6,ZV.s*(e.deltaY<0?1.15:1/1.15)));zvClamp();zvApply()},{passive:false})}
ACT.zvClose=()=>zvClose();
ACT.zvGo=d=>{if(ZV)zvOpen(ZV.i+(+d.d),-(+d.d))};
ACT.zvShare=async()=>{const c=galCtx();if(!c||!ZV)return;rcShare(await rcFiles([{key:ZV.k,...c.meta}]),'رسید '+c.meta.name)};
ACT.zvDel=()=>{const c=galCtx();if(!c||!ZV)return;const k=ZV.k,i=ZV.i;askConfirm('این عکس حذف شود؟','حذف عکس',async()=>{const K=c.keys.filter(z=>z!==k);c.set(K);await imgDel(k);logA('edit','حذف رسید',c.meta.name);galRefresh();if(K.length)zvOpen(Math.min(i,K.length-1));else zvClose();toast('عکس حذف شد')})};
/* ویرایش: نسخه جدید روی همان کلید ذخیره می‌شود؛ نسخه قبلی روی سرور ۹۰ روز نگه داشته می‌شود و تا چند ثانیه «برگرداندن» دارد */
function zvLoad(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=src})}
async function zvSave(nd,msg){const c=galCtx();if(!c||!ZV)return;const k=ZV.k,old=ZV.src;if(!(await imgPut(k,nd))){toast('ذخیره نشد',true);return}ZVC.set(k,nd);c.set(c.keys);ZV.src=nd;ZV.s=1;ZV.x=0;ZV.y=0;ZV.crop=null;zvBar();galRefresh();
  toast(msg,'','برگرداندن',async()=>{await imgPut(k,old);ZVC.set(k,old);if(ZV&&ZV.k===k){ZV.src=old;zvBar()}galRefresh()})}
ACT.zvRot=async()=>{if(!ZV||!ZV.src)return;const im=await zvLoad(ZV.src),c=document.createElement('canvas');c.width=im.height;c.height=im.width;const g=c.getContext('2d');g.translate(c.width,0);g.rotate(Math.PI/2);g.drawImage(im,0,0);zvSave(c.toDataURL('image/jpeg',.9),'عکس چرخید')};
ACT.zvCrop=()=>{if(!ZV||!ZV.src)return;ZV.s=1;ZV.x=0;ZV.y=0;ZV.crop={l:.05,t:.05,r:.95,b:.95};zvBar()};
ACT.zvCropNo=()=>{if(!ZV)return;ZV.crop=null;zvBar()};
ACT.zvCropOk=async()=>{if(!ZV||!ZV.crop)return;const k=ZV.crop,im=await zvLoad(ZV.src),W=im.naturalWidth,H=im.naturalHeight,x=Math.round(k.l*W),y=Math.round(k.t*H),w=Math.max(20,Math.round((k.r-k.l)*W)),h=Math.max(20,Math.round((k.b-k.t)*H)),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);zvSave(c.toDataURL('image/jpeg',.9),'عکس برش خورد')};
/* کادر برش: گوشه‌ها برای اندازه، وسط برای جابه‌جایی */
function zvCropInit(){const im=$('zvi'),cr=$('zcr');if(!im||!cr||!ZV||!ZV.crop)return;
  const place=()=>{const a=im.getBoundingClientRect(),s=$('zvs').getBoundingClientRect(),k=ZV.crop;cr.style.left=(a.left-s.left+k.l*a.width)+'px';cr.style.top=(a.top-s.top+k.t*a.height)+'px';cr.style.width=((k.r-k.l)*a.width)+'px';cr.style.height=((k.b-k.t)*a.height)+'px'};
  if(!im.complete){im.onload=place}place();let dr=null;
  cr.onpointerdown=e=>{e.stopPropagation();cr.setPointerCapture&&cr.setPointerCapture(e.pointerId);const a=im.getBoundingClientRect();dr={h:e.target.dataset.h||'m',x:e.clientX,y:e.clientY,k:{...ZV.crop},w:a.width,ht:a.height}};
  cr.onpointermove=e=>{if(!dr||!ZV)return;const dx=(e.clientX-dr.x)/dr.w,dy=(e.clientY-dr.y)/dr.ht,k={...dr.k},m=.08,cl=v=>Math.max(0,Math.min(1,v));
    if(dr.h==='m'){const w=k.r-k.l,h=k.b-k.t;k.l=cl(k.l+dx);k.t=cl(k.t+dy);if(k.l+w>1)k.l=1-w;if(k.t+h>1)k.t=1-h;k.r=k.l+w;k.b=k.t+h}
    else{if(dr.h.includes('w'))k.l=Math.min(cl(k.l+dx),k.r-m);if(dr.h.includes('e'))k.r=Math.max(cl(k.r+dx),k.l+m);if(dr.h.includes('n'))k.t=Math.min(cl(k.t+dy),k.b-m);if(dr.h.includes('s'))k.b=Math.max(cl(k.b+dy),k.t+m)}
    ZV.crop=k;place()};
  cr.onpointerup=cr.onpointercancel=()=>{dr=null}}
addEventListener('keydown',e=>{if(!ZV)return;if(e.key==='Escape')zvClose();else if(e.key==='ArrowLeft'||e.key==='ArrowRight')ACT.zvGo({d:e.key==='ArrowLeft'?1:-1})});
