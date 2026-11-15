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
