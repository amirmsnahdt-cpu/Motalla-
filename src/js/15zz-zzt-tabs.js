/* ---- v107.9 سندهای هم‌زمان (چند مشتری با هم) ----
   صاحب اپ: «وقتی شلوغ می‌شود، وقتی پنجره مشتری باز است و کارش تمام نشده، بتوانم برای مشتری بعدی سند جدید باز کنم
   و هم‌زمان چند صفحه داشته باشم و تسویه‌ها و فروش و خریدشان انجام شود».
   - سند جاری همان sv است (پیش‌نویسش m_svd)؛ سندهای باز دیگر در m_svp روی همین گوشی می‌مانند (هر کدام با کلید tk).
   - بالای صفحه سند نوار سندهای باز (svtHTML): زدن یکی = سند جاری کنار می‌رود و آن یکی باز می‌شود (هیچ‌کدام ثبت نمی‌شود)؛
     «مشتری بعدی» = سند تازه کنار بقیه؛ × روی سند کنار گذاشته = ثبت و بستن آن سند.
   - «پایان و ثبت سند» سند جاری را ثبت می‌کند و اگر سند باز دیگری هست همان باز می‌شود (svFinish).
   - تا وقتی سند باز دیگری هست، بیرون رفتن از صفحه سند، سند جاری را هم باز نگه می‌دارد (svLeave) و دکمه شناور
     «N سند باز» در همه صفحه‌ها برمی‌گرداند (svtFloat). بی سند باز دیگر، رفتار قبلی (ثبت خودکار هنگام خروج) همان است.
   - شماره سند فقط هنگام ثبت گرفته می‌شود، پس سندهای باز شماره هم را نمی‌گیرند. */
const SVT_MAX=8;
const svtL=()=>{const L=ls.get('m_svp',[]);return Array.isArray(L)?L.filter(o=>o&&o.tk&&(o.v===1||o.v===2)):[]};
const svtSet=L=>ls.set('m_svp',L);
const svtRows=o=>o?(o.items||[]).length+(o.xr||[]).length+(o.pays||[]).length:0;
const svtCuOf=o=>o&&o.cuId?custs.find(c=>!c.del&&String(c.id)===String(o.cuId))||null:null;
const svtNm=o=>{const c=svtCuOf(o);return c?clean(String(c.name||'').replace(/\s*\([^)]*\)\s*/g,' '))||'حساب شماره '+toFa(c.cno||''):'مشتری انتخاب نشده'};
const svtKey=()=>'t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
/* سند جاری کنار گذاشته می‌شود (ثبت نمی‌شود). سند خالی (بی مشتری و بی ردیف) نگه داشته نمی‌شود */
function svtPark(){if(!sv)return false;try{if(cur==='sell'&&$('qa')&&typeof qaRead==='function')qaRead()}catch(e){}
  if(!sv.cuId&&!svtRows(sv))return false;if(!sv.tk)sv.tk=svtKey();sv.pk=Date.now();const k=sv.tk,L=svtL().filter(o=>o.tk!==k);L.push(sv);svtSet(L);return true}
/* پیش‌نویس قدیمی مشتری دیگر (m_svd) که قبلاً با سند تازه پاک می‌شد، حالا سند باز می‌ماند */
function svtKeepOld(o){if(!o||!svtRows(o))return;if(!o.tk)o.tk=svtKey();o.pk=Date.now();const L=svtL().filter(x=>x.tk!==o.tk);L.push(o);svtSet(L)}
function svtTake(f){const L=svtL(),i=L.findIndex(f);if(i<0)return null;const o=L.splice(i,1)[0];svtSet(L);return o}
function svtReset(){try{svQO=0;svCuLim=40;svAdd=-1;dkOpen=false}catch(e){}try{if(typeof qaPinned==='function'&&qaPinned())qaUnpin()}catch(e){}}
const svtCount=()=>{const d=sv||ls.get('m_svd',null);return svtL().length+(d&&(svtRows(d)||(cur==='sell'&&d.cuId))?1:0)};
/* مانده سند کنار گذاشته (برای نوار) */
function svtRest(o){const keep=sv;try{sv=JSON.parse(JSON.stringify(o));svFix();return svTot().rest||0}catch(e){return 0}finally{sv=keep}}
/* ---- نوار سندهای باز بالای صفحه سند ---- */
function svtHTML(){if(!sv)return '';const L=svtL().slice().sort((a,b)=>(a.pk||0)-(b.pk||0)),c0=svCu();
  const chip=(o,on)=>{const c=svtCuOf(o),n=svtRows(o),r=on?0:svtRest(o),nm=svtNm(o);
    const sub=on?(o.edit?'ویرایش سند '+toFa(o.edit.no):n?toFa(n)+' ردیف · در حال کار':'در حال کار'):(n?toFa(n)+' ردیف'+(r?' · '+(r>0?'طلبکاریم ':'بدهکاریم ')+fmtShort(Math.abs(r)):''):'بی ردیف');
    const av=c?`<span class="svta" style="--h:${cuHue(c)}">${esc(userInit(c.name))}</span>`:`<span class="svta q">${ic('user')}</span>`;
    return on?`<div class="svtc on" aria-current="true">${av}<span class="svtt"><b>${esc(nm)}</b><small>${esc(sub)}</small></span></div>`
      :`<div class="svtc" data-fk="svt:${esc(o.tk)}"><button type="button" class="svtg" data-act="svtGo" data-k="${esc(o.tk)}">${av}<span class="svtt"><b>${esc(nm)}</b><small>${esc(sub)}</small></span></button><button type="button" class="svtx" data-act="svtX" data-k="${esc(o.tk)}" aria-label="ثبت و بستن این سند">${ic('x')}</button></div>`};
  const cur0={...sv,cuId:c0?c0.id:sv.cuId};
  return `<div class="svtb${L.length?' many':''}" role="tablist" aria-label="سندهای باز"><button type="button" class="svtn" data-act="svtNew" aria-label="سند هم‌زمان برای مشتری بعدی">${ic('plus')}<span>مشتری بعدی</span></button>${chip(cur0,1)}${L.map(o=>chip(o,0)).join('')}</div>`}
ACT.svtNew=()=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}
  if(svtL().length>=SVT_MAX-1){toast('حداکثر '+toFa(SVT_MAX)+' سند باز؛ اول یکی را تمام کنید',true);return}
  if(sv&&!sv.cuId&&!svtRows(sv)){toast('اول مشتری همین سند را انتخاب کنید');const q=$('svQ');if(q)q.focus();return}
  closeSheet();svtPark();const dk=sv&&sv.dk;sv=svBlank('');sv.dk=dk||'';sv.fixCu=false;sv.tk=svtKey();svFix();svKeep();svtReset();svQO=1;render();
  try{$('view').scrollTop=0}catch(e){}setTimeout(()=>{const q=$('svQ');if(q&&cur==='sell')q.focus()},140)};
function svtSwitch(k){const o=svtL().find(x=>x.tk===k);if(!o)return false;closeSheet();svtPark();svtTake(x=>x.tk===k);sv=o;svFix();svKeep();svtReset();render();try{$('view').scrollTop=0}catch(e){}
  setTimeout(()=>{const b=document.querySelector('.svtc.on');if(b){b.scrollIntoView({block:'nearest',inline:'center'});b.classList.add('pop')}},40);return true}
ACT.svtGo=d=>{svtSwitch(d.k)};
/* یک سند باز را از هر صفحه‌ای باز می‌کند */
ACT.svtOpenK=d=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}if(cur==='sell'){svtSwitch(d.k);return}
  const o=svtTake(x=>x.tk===d.k);if(!o)return;if(sv&&(sv.cuId||svtRows(sv)))svtPark();sv=o;svFix();svKeep();svtReset();PARENT.sell=['cust','custs','banks','home','bank'].includes(cur)?cur:'custs';go('sell')};
/* دکمه شناور: آخرین سند باز */
ACT.svtOpen=()=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}
  if(!sv){const d=ls.get('m_svd',null);if(d&&(d.v===1||d.v===2)&&(svtRows(d)||d.cuId))sv=d;else{const L=svtL().sort((a,b)=>(a.pk||0)-(b.pk||0)),o=L.pop();if(!o)return;svtTake(x=>x.tk===o.tk);sv=o}}
  svFix();svKeep();svtReset();PARENT.sell=['cust','custs','banks','home','bank'].includes(cur)?cur:'custs';go('sell')};
/* ثبت یک سند کنار گذاشته بی آنکه باز شود */
function svtCommit(o){const keep=sv;try{sv=JSON.parse(JSON.stringify(o));svFix();if(!svRows())return 1;if(sv.edit&&sv.sig0&&svSig()===sv.sig0)return 1;
  const er=svErr();if(er){toast('سند «'+svtNm(o)+'» ثبت نشد: '+er+' · بازش کنید و کامل کنید',true);return 0}const R=svCommit();toast(invTitle(R.t)+' «'+svtNm(o)+'» ثبت شد','', 'دیدن سند',()=>invOpen(R.c.id,R.t.id));return 2}
  catch(e){toast('ثبت این سند نشد؛ بازش کنید و دوباره امتحان کنید',true);return 0}finally{sv=keep}}
ACT.svtX=d=>{const o=svtL().find(x=>x.tk===d.k);if(!o)return;const n=svtRows(o),done=()=>{svtTake(x=>x.tk===d.k);render()};
  if(!n){askConfirm('سند خالی «'+svtNm(o)+'» بسته شود؟','بستن',done);return}
  askConfirm('سند «'+svtNm(o)+'» با '+toFa(n)+' ردیف ثبت و بسته شود؟ (مثل «پایان و ثبت سند»، بدون تسویه)','ثبت و بستن',()=>{if(svtCommit(o))done()})};
/* خروج از صفحه سند (go در 01-core): با سند باز دیگر، سند جاری هم باز می‌ماند؛ وگرنه ثبت خودکار قبلی */
function svLeave(){if(svtL().length){const p=svtPark();sv=null;ls.set('m_svd',null);if(p)toast(toFa(svtL().length)+' سند باز ماند · از دکمه «سند باز» برگردید');return}svAuto('leave')}
/* «پایان و ثبت سند» (15i): ثبت سند جاری؛ اگر سند باز دیگری هست همان باز می‌شود */
function svFinish(){if(!svtL().length){back();return}svAuto('leave');if(sv){render();return}
  const L=svtL().sort((a,b)=>(a.pk||0)-(b.pk||0)),o=L.pop();if(!o){back();return}svtTake(x=>x.tk===o.tk);sv=o;svFix();svKeep();svtReset();render();try{$('view').scrollTop=0}catch(e){}
  setTimeout(()=>{const b=document.querySelector('.svtc.on');if(b)b.classList.add('pop');toast('سند «'+svtNm(o)+'» باز شد')},700)}
/* سندهای باز همان مشتری در صفحه حساب (svDraftHTML در 15d) */
function svtCuHTML(c){return svtL().filter(o=>String(o.cuId||'')===String(c.id)).map(o=>{const n=svtRows(o),r=svtRest(o);
  return `<div class="c6dr"><button class="c6drb" data-act="svtOpenK" data-k="${esc(o.tk)}"><span class="c6ni">${ic('edit')}</span><span><b>${o.edit?'ویرایش ناتمام سند '+toFa(o.edit.no):'سند باز (ثبت‌نشده)'}</b><small>${toFa(n)} ردیف${o.date?'، '+esc(dates(o.date).fa):''}${r?'، '+ourLab(-r)+' '+fmt(Math.abs(r)):''} · برای ادامه بزنید</small></span>${ic('back').replace('class="i"','class="i flip"')}</button><button class="c6drx" data-act="svtX" data-k="${esc(o.tk)}" aria-label="ثبت و بستن">${ic('trash')}</button></div>`}).join('')}
/* دکمه شناور «N سند باز» در صفحه‌های دیگر (render در 01-core) */
function svtFloat(){let b=document.getElementById('svtf');const n=cur==='sell'||!TOKEN?0:svtCount();
  if(!n){if(b)b.classList.add('hide');return}
  if(!b){b=document.createElement('button');b.id='svtf';b.type='button';b.setAttribute('data-act','svtOpen');document.body.appendChild(b)}
  const L=svtL(),o=L.sort((a,c)=>(a.pk||0)-(c.pk||0))[L.length-1]||sv||ls.get('m_svd',null);
  b.innerHTML=`<span class="svtfi">${ic('edit')}</span><span><b>${toFa(n)} سند باز</b><small>${esc(o?svtNm(o):'')}</small></span>`;b.classList.remove('hide');
  requestAnimationFrame(()=>{let y=window.innerHeight;for(const id of ['dock','act']){const e=$(id);if(!e)continue;const r=e.getBoundingClientRect();if(r.height>4&&r.top<y&&getComputedStyle(e).display!=='none')y=r.top}b.style.bottom=Math.max(14,window.innerHeight-y+10)+'px'})}
