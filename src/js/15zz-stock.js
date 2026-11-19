/* ===== v90.9 (خواسته صاحب اپ): موجودی و «فی» کالاها =====
   «در فهرست خرید/فروش موجودی و فی کارها نشان داده شود؛ برای هر کاری که وارد سیستم و دریافت می‌شود فی خرید و فی فروش در نظر گرفته شود
   (چقدر برای ما تمام شده و چقدر می‌خواهیم بفروشیم)؛ مانده کارها («این‌قدر از این کار داریم»)؛ برای کارهایی که تعداد دارند تعداد هم.»
   داده روی رکورد cfg (همگام بین گوشی‌ها):
     gfee[k]={b,s}   فی خرید / فی فروش — عدد تا ۱۰۰ = درصد، بیشتر = تومان (هر گرم یا هر عدد)؛ feeTx همین را نشان می‌دهد
     gcnt[k]=1       کالای تعدادی (پله «تعداد» در فروش و دریافت)
     gstk[k]={w,n,at} «موجودی فعلی» که دستی زده شده؛ سندهای بعد از آن لحظه رویش می‌نشینند (سندهای قبل‌تر دیگر حساب نمی‌شوند)
   موجودی از خود سندها (gdStockAll، یک بار ساخته و تا تغییر داده نگه داشته می‌شود — memoClear پاکش می‌کند):
     فروش کالا (items) کم می‌کند؛ ردیف طلا (xr، غیر پولی) با cat = نام کالا: خرید/دریافت/ورود اضافه، فروش/پرداخت/خروج کم
     («تعویض»، «مرجوعی» و بی‌دسته = متفرقه؛ پارسیان = سکه پارسیان)؛ سکه و ارز (xr غیر طلا، غیر پولی) به تعداد.
   کلید = نام کالا، یا کد سکه/ارز (XA). موجودی فقط وقتی نشان داده می‌شود که «موجودی فعلی» زده شده یا دست‌کم یک دریافت/خرید ثبت شده باشد
   (وگرنه همه کالاها منفی دیده می‌شدند). */
const GDSK={'g:ab':'آبشده','g:abs':'آبشده','g:misc':'متفرقه','g:pz':'سکه پارسیان'};
const gdKeyOf=id=>{id=String(id||'');return GDSK[id]||(id.slice(0,2)==='a:'||id.slice(0,2)==='k:'?id.slice(2):'')};
const gdC=()=>cfgRec()||{};
const gdFee=k=>(gdC().gfee||{})[k]||null;
const gdCnt=k=>!!k&&(!!(gdC().gcnt||{})[k]||k==='سکه پارسیان');
const feeTx=v=>!(+v>0)?'':+v<=100?toFa(String(Math.round(+v*100)/100))+'٪':fmt(Math.round(+v));
const gdNamed=x=>!!(x&&x.a==='gold'&&!x.pul&&x.cat&&goodsList().includes(x.cat));
function gdStockAll(){if(window.__gsc)return window.__gsc;const M=new Map(),B=gdC().gstk||{};
  const mv=(k,w,n,at,rc)=>{if(!k)return;const b=B[k];if(b&&b.at&&String(at||'')<=String(b.at))return;let o=M.get(k);if(!o)M.set(k,o={w:0,n:0,rc:0});o.w+=w||0;o.n+=n||0;if(rc)o.rc++};
  for(const c of custs){if(!c||c.del||c.sys)continue;for(const t of c.txs||[]){if(!t||t.del||t.type!=='inv')continue;const at=t.at0||t.at;
    for(const it of t.items||[])mv(it.k,-(+it.w||0),-(+it.cnt||0),at,0);
    for(const x of t.xr||[]){if(!x||x.pul)continue;const s=x.t==='buy'||x.t==='in'?1:-1;
      if(x.a==='gold'){if(x.cat==='مانده قبلی')continue;const k=x.pz?'سکه پارسیان':!x.cat||x.cat==='تعویض'||x.cat==='مرجوعی'?'متفرقه':x.cat;mv(k,s*(parseFloat(x.w)||0),s*(+x.cnt||0),at,s>0)}
      else mv(x.a,0,s*(parseFloat(x.q)||0),at,s>0)}}}
  for(const k in B){const b=B[k]||{},o=M.get(k)||{w:0,n:0,rc:0};o.w+=+b.w||0;o.n+=+b.n||0;o.base=1;M.set(k,o)}
  M.forEach(o=>{o.w=Math.round(o.w*1000)/1000;o.n=Math.round(o.n*1000)/1000});return window.__gsc=M}
const gdSgn=(v,t)=>(v<0?'−':'')+t(Math.abs(v));
/* متن موجودی یک کالا ('' = چیزی برای نشان دادن نیست) */
function gdStkTx(k){const o=gdStockAll().get(k);if(!o||!(o.base||o.rc))return '';if(XA[k])return gdSgn(o.n,qFmt)+' '+esc(XA[k].u||'عدد');return gdSgn(o.w,wFmt)+' گرم'+(gdCnt(k)||o.n?' · '+gdSgn(o.n,qFmt)+' عدد':'')}
/* بلوک کنار هر ردیف فهرست: موجودی (پررنگ) و زیرش فی خرید · فی فروش */
function gdEx(k){if(!k)return '';const st=gdStkTx(k),o=gdStockAll().get(k),f=gdFee(k),neg=!!st&&o&&(XA[k]?o.n<0:o.w<0);
  const fe=f?[+f.b>0?'خرید '+feeTx(f.b):'',+f.s>0?'فروش '+feeTx(f.s):''].filter(Boolean).join(' · '):'';
  return st||fe?`<span class="dkst${neg?' ng':''}">${st?`<b>${st}</b>`:''}${fe?`<small>فی ${fe}</small>`:''}</span>`:''}
/* ردیف دریافت/خرید کالا: فی‌هایی که زده شد «فی فعلی» همان کالا می‌شود */
function gdFeeKeep(x){if(!gdNamed(x)||!(x.t==='buy'||x.t==='in'))return;const b=+x.fb||0,s=+x.fs||0;if(!b&&!s)return;const r=cfgRec(1),o=(r.gfee||{})[x.cat]||{},n={b:b||+o.b||0,s:s||+o.s||0};
  if(+o.b===n.b&&+o.s===n.s)return;r.gfee={...(r.gfee||{}),[x.cat]:n};window.__gsc=null}
/* پله‌های اختیاری «فی خرید / فی فروش» برای دریافت و خرید کالای نام‌دار */
const gdFeeSteps=x=>gdNamed(x)&&(x.t==='buy'||x.t==='in')?[stS('fb','فی خرید','','dec',()=>x.fb!=null&&x.fb!==''?x.fb:((gdFee(x.cat)||{}).b||''),v=>x.fb=v,{opt:1,fm:v=>+v?feeTx(v):null,ph:'فی خرید · تا ۱۰۰ = درصد، بیشتر = تومان'}),stS('fs','فی فروش','','dec',()=>x.fs!=null&&x.fs!==''?x.fs:((gdFee(x.cat)||{}).s||''),v=>x.fs=v,{opt:1,fm:v=>+v?feeTx(v):null,ph:'فی فروش · تا ۱۰۰ = درصد، بیشتر = تومان'})]:[];

/* ---------- پنجره «فی و موجودی» ---------- */
let GI=null;
const giNum=id=>{const e=$(id);return e?decIn(toEn(e.value).replace(/,/g,'')):''};
function gdInfoHTML(){const k=GI.k,isX=!!XA[k],o=gdStockAll().get(k),f=gdFee(k)||{},st=gdStkTx(k),cn=GI.cn;
  const fld=(id,lab,v,ph,u)=>`<label class="gif" for="${id}"><span>${lab}</span><span class="gifv"><input id="${id}" class="ltr" inputmode="decimal" autocomplete="off" value="${esc(v===0||v?String(v):'')}" placeholder="${ph}"><i id="${id}u">${u||''}</i></span></label>`;
  return `<div class="sh-h"><div><b>فی و موجودی</b><small class="shsub">«${esc(XA[k]?XA[k].t:k)}»</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="gih">${ic('coin')}<span class="tx"><small>موجودی از روی سندها</small><b class="${o&&(isX?o.n<0:o.w<0)?'ng':''}">${st||'هنوز دریافتی ثبت نشده'}</b></span></div>
  <div class="gil">فی (قیمت تمام‌شده و قیمت فروش)</div>
  <div class="gic">${fld('giB','فی خرید',+f.b||'','چقدر برای ما تمام شده',feeTx(f.b))}${fld('giS','فی فروش',+f.s||'','چقدر می‌خواهیم بفروشیم',feeTx(f.s))}</div>
  <small class="gin">عدد تا ۱۰۰ درصد حساب می‌شود (مثلاً ۷ = ۷٪)؛ بیشتر از آن تومان (هر ${isX?esc(XA[k].u||'عدد'):'گرم'}).</small>
  <div class="gil">موجودی فعلی <i>اگر با انبار نمی‌خواند</i></div>
  <div class="gic">${isX?'':fld('giW','وزن موجود','','مثلاً ۱۲۵.۴','گرم')}${isX||cn?fld('giN','تعداد موجود','','مثلاً ۱۲',isX?esc(XA[k].u||'عدد'):'عدد'):''}</div>
  <small class="gin">خالی بماند = همان موجودی سندها. اگر عدد بزنید، موجودی از همین لحظه با این عدد شروع می‌شود و سندهای بعدی رویش می‌نشیند.</small>
  ${isX||k==='سکه پارسیان'?'':`<label class="sw gisw"><input type="checkbox" id="giC"${cn?' checked':''} data-act="gdInfoCn"><span class="tr"></span><span class="sbt"><b>این کالا تعدادی است</b><small>در فروش و دریافت «تعداد» هم پرسیده می‌شود</small></span></label>`}
  <button class="xgo" data-act="gdInfoSave">${ic('check')} ذخیره</button>`}
function gdInfoBind(){['giB','giS'].forEach(id=>{const e=$(id),u=$(id+'u');if(e)e.oninput=()=>{e.value=decIn(toEn(e.value).replace(/,/g,''));if(u)u.textContent=feeTx(e.value)}});['giW','giN'].forEach(id=>{const e=$(id);if(e)e.oninput=()=>{e.value=decIn(toEn(e.value).replace(/,/g,''))}})}
ACT.gdInfo=d=>{const k=d.k;if(!k)return;if(!isAdmin()&&!can('src')){toast('تنظیم فی و موجودی فقط با مدیر است',true);return}GI={k,cn:gdCnt(k)};sheet(gdInfoHTML());gdInfoBind()};
ACT.gdInfoCn=()=>{if(!GI)return;const keep={};['giB','giS','giW','giN'].forEach(id=>{const e=$(id);if(e)keep[id]=e.value});const c=$('giC');GI.cn=!!(c&&c.checked);$('sheet').innerHTML=gdInfoHTML();gdInfoBind();Object.keys(keep).forEach(id=>{const e=$(id);if(e){e.value=keep[id];if(e.oninput)e.oninput()}})};
ACT.gdInfoSave=()=>{if(!GI)return;const k=GI.k,isX=!!XA[k],r=cfgRec(1),b=+giNum('giB')||0,s=+giNum('giS')||0,w=giNum('giW'),n=giNum('giN');
  if(b>0&&s>0&&(b<=100)===(s<=100)&&s<b){askWarn({t:'فی فروش از فی خرید کمتر است',h:'فی خرید <b>'+feeTx(b)+'</b> و فی فروش <b>'+feeTx(s)+'</b> زده شده؛ با این فی، فروش این کالا ضرر است.',ok:'اصلاح می‌کنم'});return}
  r.gfee={...(r.gfee||{})};if(b||s)r.gfee[k]={b,s};else delete r.gfee[k];
  if(!isX&&k!=='سکه پارسیان'){r.gcnt={...(r.gcnt||{})};if(GI.cn)r.gcnt[k]=1;else delete r.gcnt[k]}
  if(w!==''||n!==''){const o=gdStockAll().get(k)||{w:0,n:0};r.gstk={...(r.gstk||{}),[k]:{w:isX?0:(w!==''?+w||0:o.w),n:n!==''?+n||0:(isX||GI.cn?o.n:0),at:ns()}}}
  saveCu();window.__gsc=null;logA('cust','فی و موجودی کالا',k+(b?' | فی خرید '+feeTx(b):'')+(s?' | فی فروش '+feeTx(s):'')+(w!==''||n!==''?' | موجودی '+gdStkTx(k):''));GI=null;closeSheet();if(typeof gdRe==='function')gdRe();toast('ذخیره شد')};

/* ===== v92.5 (خواسته صاحب اپ: «یک قسمتی برای موجودی کالاها و ادیت مانده‌هایشان می‌خواهیم؛ اصلاح موجودی باید انجام شود») =====
   صفحه «موجودی کالاها» (stock): همه طلاها، کالاهای مغازه، سکه‌ها و ارزها با موجودی‌شان (حتی منفی و صفر)، جستجو و فیلتر.
   زدن هر ردیف = پنجره «اصلاح موجودی»، هم‌شکل اصلاح موجودی بانک: موجودی در برنامه، موجودی واقعی، یک کارت اختلاف، «ثبت».
   ثبت = پایه تازه gstk[k] از همین لحظه (سندهای بعدی رویش می‌نشینند) + یک سطر در cfg.gstkL (۸۰ اصلاح آخر: چه کسی، کی، از چه به چه) + تاریخچه. */
let STK={q:'',f:'all'},SKX=null;
const stkCan=()=>isAdmin()||can('src');
const stkGoods=()=>goodsList().filter(k=>!['آبشده','متفرقه','سکه','سکه پارسیان'].includes(k)&&!XA[k]&&!['سکه','ارز'].includes(gCat(k)));
/* همه ردیف‌ها: [کلید، نام، گروه g/c/f، تعدادی؟] */
function stkAll(){xaSync();const L=[['آبشده','آبشده','g'],['متفرقه','متفرقه','g'],['سکه پارسیان','سکه پارسیان','g'],...stkGoods().map(k=>[k,k,'g'])];
  for(const k in XA)L.push([k,XA[k].t||k,XA[k].k==='f'?'f':'c']);const M=gdStockAll();
  return L.map(([k,t,g])=>{const o=M.get(k)||{w:0,n:0},isX=g!=='g';return {k,t,g,isX,cn:isX||gdCnt(k),w:isX?0:o.w,n:o.n,v:isX?o.n:o.w,base:!!o.base}})}
const stkDay=at=>{const d=new Date(at);if(isNaN(d))return '';const [,jm,jd]=g2j(d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()));return toFa(jd)+' '+JM[jm-1]};
const stkLast=k=>((gdC().gstkL||[]).find(z=>z.k===k))||null;
const stkVal=r=>r.isX?gdSgn(r.n,qFmt)+' <i>'+esc(XA[r.k].u||'عدد')+'</i>':gdSgn(r.w,wFmt)+' <i>گرم</i>';
const stkIc=r=>ic(r.g==='f'?'usd':r.g==='c'||r.k==='سکه پارسیان'||r.k==='آبشده'||r.k==='متفرقه'?'coin':'ring');
function stkRow(r,i){const L=stkLast(r.k),sub=L?'اصلاح '+stkDay(L.at)+(L.by?' · '+esc(L.by):''):r.base?'موجودی دستی':'از روی سندها';
  return `<button type="button" class="stkr${r.v<0?' ng':!r.v?' zr':''}" data-act="stkFix" data-k="${esc(r.k)}" style="--i:${Math.min(i,14)}"><span class="stki g-${r.g}">${stkIc(r)}</span><span class="tx"><b>${esc(r.t)}</b><small>${sub}${!r.isX&&r.cn&&r.n?' · '+gdSgn(r.n,qFmt)+' عدد':''}</small></span><span class="stkv">${stkVal(r)}</span><span class="cv">${ic('back')}</span></button>`}
function stkListHTML(){const q=nzName(STK.q||''),f=STK.f,A=stkAll(),L=A.filter(r=>(f==='all'||(f==='neg'?r.v<0:r.g===f))&&(!q||nzName(r.t).includes(q)||nzName(r.k).includes(q)));
  if(!L.length)return `<div class="card empty"><b>${q?'چیزی با این نام پیدا نشد':'موردی نیست'}</b></div>`;
  let h='',i=0;for(const [g,t] of [['g','طلا و کالاهای مغازه'],['c','سکه'],['f','ارز']]){const R=L.filter(r=>r.g===g);if(!R.length)continue;h+=`<div class="stkh">${t}<i>${toFa(R.length)}</i></div><div class="stkc">${R.map(r=>stkRow(r,i++)).join('')}</div>`}return h}
function stkHeroHTML(){const A=stkAll(),G=A.filter(r=>r.g==='g'),tw=Math.round(G.reduce((s,r)=>s+r.w,0)*1000)/1000,neg=A.filter(r=>r.v<0).length,has=A.filter(r=>r.v).length;
  return `<div class="stkhero"><span class="stkwm">${ic('coin')}</span><div class="stkht"><span class="stkhi">${ic('coin')}</span><span class="tx"><b>موجودی طلا</b><small>جمع وزن طلا و کالاهای مغازه</small></span></div>
  <div class="stkhv${tw<0?' ng':''}"><b>${gdSgn(tw,wFmt)}</b><i>گرم</i></div>
  <div class="stkhc"><em>${toFa(has)} قلم موجود</em>${neg?`<button type="button" class="ng" data-act="stkF" data-f="neg">${toFa(neg)} قلم منفی · نیاز به اصلاح</button>`:`<em class="ok">${ic('check')} موجودی منفی نداریم</em>`}</div></div>`}
const STKF=[['all','همه'],['g','طلا'],['c','سکه'],['f','ارز'],['neg','منفی‌ها']];
function vStock(){return `<div class="stkp">${stkHeroHTML()}
  <div class="fsearch stkq">${ic('search')}<input id="stkQ" type="search" value="${esc(STK.q||'')}" placeholder="جستجوی کالا، سکه یا ارز…" autocomplete="off" enterkeyhint="search" aria-label="جستجوی کالا"></div>
  <div class="stkf" role="tablist">${STKF.map(([k,t])=>`<button type="button" role="tab" aria-selected="${STK.f===k}" class="${STK.f===k?'on':''}" data-act="stkF" data-f="${k}">${t}</button>`).join('')}</div>
  <div id="stkL">${stkListHTML()}</div>
  <div class="stkn">${stkCan()?'روی هر ردیف بزنید و موجودی واقعی را وارد کنید؛ از همان لحظه موجودی با عدد شما شروع می‌شود و سندهای بعدی رویش می‌نشیند.':'اصلاح موجودی فقط با مدیر است.'}</div></div>`}
const aStock=()=>'';
function bindStock(){const q=$('stkQ');if(!q)return;q.oninput=()=>{STK.q=q.value;const L=$('stkL');if(L){L.classList.add('noan');L.innerHTML=stkListHTML()}};q.onfocus=()=>{STK.foc=1};q.onblur=()=>{STK.foc=0};
  if(STK.foc&&document.activeElement!==q){try{q.focus({preventScroll:true});q.setSelectionRange(q.value.length,q.value.length)}catch(e){}}}
function stkRe(){if(cur!=='stock')return;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}
ACT.stkF=d=>{STK.f=d.f||'all';document.querySelectorAll('#view .stkf button').forEach(b=>{const on=b.dataset.f===STK.f;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});const L=$('stkL');if(L){L.classList.remove('noan');L.innerHTML=stkListHTML()}};
/* از «ورود حساب» خانه: برگشت به خانه (بدون باز شدن کشوی تنظیمات) */
ACT.stkGo=()=>{meRet=null;closeSheet();go('stock')};

/* ---------- پنجره «اصلاح موجودی کالا» ---------- */
const skNum=id=>{const e=$(id);if(!e)return '';const v=decIn(toEn(e.value).replace(/,/g,''));return v};
function skRow(){return stkAll().find(r=>r.k===SKX.k)}
function skCalc(){const r=skRow(),w=SKX.w,n=SKX.n,hw=!r.isX&&w!=='',hn=r.cn&&n!=='';return {r,hw,hn,ok:hw||hn,dw:hw?Math.round((+w-r.w)*1000)/1000:0,dn:hn?Math.round((+n-r.n)*1000)/1000:0}}
function skRes(){const z=skCalc(),r=z.r,u=r.isX?esc(XA[r.k].u||'عدد'):'گرم';
  if(!z.ok)return `<div class="bf3d n"><span class="bf3di">${ic('edit')}</span><span class="tx"><b>موجودی واقعی را بزنید</b><small>اختلاف خودش حساب می‌شود</small></span></div>`;
  const d=r.isX?z.dn:z.hw?z.dw:z.dn,du=r.isX||!z.hw?(r.isX?u:'عدد'):'گرم',ex=!r.isX&&z.hw&&z.hn&&z.dn?' · تعداد '+(z.dn>0?'+':'−')+qFmt(Math.abs(z.dn)):'';
  if(!d&&!ex)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>برنامه با انبار یکی است</b><small>اصلاحی لازم نیست</small></span></div>`;
  if(!d)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>وزن یکی است</b><small>فقط تعداد اصلاح می‌شود${ex}</small></span></div>`;
  return `<div class="bf3d ${d>0?'g':'r'}"><span class="bf3di">${ic(d>0?'dIn':'dOut')}</span><span class="tx"><b>${d>0?'به موجودی اضافه می‌شود':'از موجودی کم می‌شود'}</b><small>اصلاح موجودی «${esc(r.t)}»${ex}</small></span><em>${d>0?'+':'−'}${(du==='گرم'?wFmt:qFmt)(Math.abs(d))} <small>${du}</small></em></div>`}
function stkFixHTML(){const r=skRow();if(!r)return '';const L=stkLast(r.k),u=r.isX?esc(XA[r.k].u||'عدد'):'گرم',can1=stkCan();
  return `<div class="sh-h"><div><b>اصلاح موجودی</b><small class="shsub">موجودی واقعی «${esc(r.t)}» را بزنید؛ اختلاف خودش حساب می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bf3 bf4 skw"><div class="bf4b" style="--bk:#b27c0e"><span class="ckbi stki g-${r.g}">${stkIc(r)}</span><span class="tx"><b>${esc(r.t)}</b><small>موجودی در برنامه</small></span><b class="bf4v ${r.v<0?'r':r.v?'g':'z'}">${r.isX?gdSgn(r.n,qFmt):gdSgn(r.w,wFmt)}<i>${u}</i></b></div>
  ${!can1?`<div class="bf3d n"><span class="bf3di">${ic('padlock')}</span><span class="tx"><b>اصلاح موجودی فقط با مدیر است</b><small>شما فقط می‌توانید موجودی را ببینید</small></span></div>`:`
  ${r.isX?'':`<div class="ckcl">وزن واقعی موجود چقدر است؟</div><div class="ckbg"><label class="ckbig"><input id="skW" class="ltr" inputmode="decimal" value="${esc(SKX.w)}" placeholder="${wFmt(Math.abs(r.w))}" autocomplete="off" enterkeyhint="done" aria-label="وزن واقعی موجود"><i>گرم</i></label></div>`}
  ${r.cn?`<div class="ckcl">${r.isX?'تعداد واقعی موجود چقدر است؟':'تعداد موجود <i>اختیاری</i>'}</div><div class="ckbg"><label class="ckbig${r.isX?'':' sm'}"><input id="skN" class="ltr" inputmode="decimal" value="${esc(SKX.n)}" placeholder="${qFmt(Math.abs(r.n))}" autocomplete="off" enterkeyhint="done" aria-label="تعداد موجود"><i>${r.isX?u:'عدد'}</i></label></div>`:''}
  <div class="ckq skq"><button type="button" data-act="skZero">موجودی صفر است</button></div>
  <div id="skL">${skRes()}</div>`}
  ${L?`<div class="skl">${ic('clock')}<span>آخرین اصلاح: ${stkDay(L.at)}${L.by?' · '+esc(L.by):''} · از ${r.isX?gdSgn(+L.n0||0,qFmt):gdSgn(+L.w0||0,wFmt)} به ${r.isX?gdSgn(+L.n||0,qFmt):gdSgn(+L.w||0,wFmt)} ${u}</span></div>`:''}
  ${can1?`<button type="button" class="bf3c skfe" data-act="skFee">${ic('gear')} فی خرید و فروش و تنظیم کالا</button><button type="button" class="xgo" data-act="skSave">${ic('check')} ثبت</button>`:''}</div>`}
function skRead(){if($('skW'))SKX.w=skNum('skW');if($('skN'))SKX.n=skNum('skN')}
function skBind(f){['skW','skN'].forEach(id=>{const e=$(id);if(!e)return;selOnFocus(e);e.oninput=()=>{e.value=decIn(toEn(e.value).replace(/,/g,''));skRead();const L=$('skL');if(L)L.innerHTML=skRes()};e.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();e.blur()}}});const el=f&&$(f);if(el)sheetFocus(el)}
ACT.stkFix=d=>{const k=d.k;if(!k)return;SKX={k,w:'',n:''};const r=skRow();if(!r){SKX=null;return}sheet(stkFixHTML());skBind(stkCan()?(r.isX?'skN':'skW'):'')};
ACT.skZero=()=>{if(!SKX)return;const r=skRow();if(!r.isX)SKX.w='0';if(r.cn)SKX.n='0';$('sheet').innerHTML=stkFixHTML();skBind()};
ACT.skFee=()=>{if(!SKX)return;const k=SKX.k;SKX=null;ACT.gdInfo({k})};
ACT.skSave=()=>{if(!SKX)return;if(!stkCan()){toast('اصلاح موجودی فقط با مدیر است',true);return}skRead();const z=skCalc(),r=z.r;
  if(!z.ok){toast('موجودی واقعی را بزنید',true);const e=$(r.isX?'skN':'skW');if(e)e.focus();return}
  if((z.hw&&+SKX.w<0)||(z.hn&&+SKX.n<0)){toast('موجودی نمی‌تواند منفی باشد',true);return}
  if(!z.dw&&!z.dn){toast('موجودی برنامه با انبار یکی است؛ اصلاحی لازم نیست');SKX=null;closeSheet();return}
  const c=cfgRec(1),now=ns(),nw=r.isX?0:(z.hw?+SKX.w||0:r.w),nn=z.hn?+SKX.n||0:(r.cn?r.n:0);
  c.gstk={...(c.gstk||{}),[r.k]:{w:nw,n:nn,at:now}};c.gstkL=[{k:r.k,at:now,by:who(),w0:r.w,n0:r.n,w:nw,n:nn},...(c.gstkL||[])].slice(0,80);
  saveCu();window.__gsc=null;const u=r.isX?(XA[r.k].u||'عدد'):'گرم',fx=v=>r.isX?gdSgn(v,qFmt):gdSgn(v,wFmt);
  logA('cust','اصلاح موجودی کالا',r.t+' | از '+fx(r.isX?r.n:r.w)+' به '+fx(r.isX?nn:nw)+' '+u+(!r.isX&&z.hn&&z.dn?' | تعداد '+qFmt(nn):''));
  SKX=null;closeSheet();stkRe();if(typeof gdRe==='function')gdRe();toast('موجودی «'+r.t+'» اصلاح شد · '+fx(r.isX?nn:nw)+' '+u)};
