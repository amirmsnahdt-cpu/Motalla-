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
/* v95.1 (خواسته صاحب اپ: «موجودی آبشده شرطی وقتی عیارش ثبت شد از شرطی به موجودی آبشده برود»): آبشده‌ای که با عیار شرطی خریده/دریافت شده (sh:1) موجودی جدا دارد: STK_SH.
   با ثبت عیار (shFix → sh:2 و زمانش sht) همان وزن در همان لحظه از «آبشده شرطی» کم و به «آبشده» اضافه می‌شود. ردیف‌های قدیمیِ عیارخورده که sht ندارند مثل قبل از اول در آبشده‌اند.
   فروش/تحویل شرطی از همان موجودی «آبشده» کم می‌شود (طلا از انبار آبشده بیرون رفته) */
const STK_SH='آبشده شرطی';
const gdKeyOf=(id,d)=>{id=String(id||'');if(id==='g:abs'&&d&&d!=='sell'&&d!=='out')return STK_SH;return GDSK[id]||(id.slice(0,2)==='a:'||id.slice(0,2)==='k:'?id.slice(2):'')};
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
      if(x.a==='gold'){if(x.cat==='مانده قبلی')continue;
        if(x.cat==='آبشده'&&s>0&&!x.pz&&(x.sh===1||(x.sh===2&&x.sht))){const w=parseFloat(x.w)||0;mv(STK_SH,w,0,at,1);if(x.sh===2){mv(STK_SH,-w,0,x.sht,0);mv('آبشده',w,0,x.sht,1)}continue}
        const k=x.pz?'سکه پارسیان':!x.cat||x.cat==='تعویض'||x.cat==='مرجوعی'?'متفرقه':x.cat;mv(k,s*(parseFloat(x.w)||0),s*(+x.cnt||0),at,s>0)}
      else mv(x.a,0,s*(parseFloat(x.q)||0),at,s>0)}}}
  for(const k in B){const b=B[k]||{},o=M.get(k)||{w:0,n:0,rc:0};o.w+=+b.w||0;o.n+=+b.n||0;o.base=1;M.set(k,o)}
  M.forEach(o=>{o.w=Math.round(o.w*1000)/1000;o.n=Math.round(o.n*1000)/1000});return window.__gsc=M}
const gdSgn=(v,t)=>(v<0?'−':'')+t(Math.abs(v));
/* متن موجودی یک کالا ('' = چیزی برای نشان دادن نیست) */
/* v102.2 (صاحب اپ: «موجودی کالاها را برای ساخته و همه چیز در لیست حتماً می‌خواهم»): موجودی همیشه نشان داده می‌شود — بدون رسید و موجودی اولیه هم
   (صفر، یا منفی وقتی فقط فروش خورده)؛ غیر طلا (سایر) فقط تعداد */
function gdStkTx(k){if(!k)return '';const o=gdStockAll().get(k)||{w:0,n:0};if(XA[k])return gdSgn(o.n||0,qFmt)+' '+esc(XA[k].u||'عدد');if(gCat(k)==='سایر')return gdSgn(o.n||0,qFmt)+' عدد';return gdSgn(o.w||0,wFmt)+' گرم'+(gdCnt(k)||o.n?' · '+gdSgn(o.n||0,qFmt)+' عدد':'')}
/* بلوک کنار هر ردیف فهرست: موجودی (پررنگ) و زیرش فی خرید · فی فروش */
function gdEx(k){if(!k)return '';const st=gdStkTx(k),o=gdStockAll().get(k),f=gdFee(k),neg=!!st&&o&&(XA[k]||gCat(k)==='سایر'?o.n<0:o.w<0),z=!!st&&!(o&&(XA[k]||gCat(k)==='سایر'?o.n:o.w));
  const fe=f?[+f.b>0?'خرید '+feeTx(f.b):'',+f.s>0?'فروش '+feeTx(f.s):''].filter(Boolean).join(' · '):'';
  return st||fe?`<span class="dkst${neg?' ng':''}${z?' z':''}">${st?`<b>${st}</b>`:''}${fe?`<small>فی ${fe}</small>`:''}</span>`:''}
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
const stkGoods=()=>goodsList().filter(k=>!['آبشده',STK_SH,'متفرقه','سکه','سکه پارسیان'].includes(k)&&!XA[k]&&!['سکه','ارز'].includes(gCat(k)));
/* همه ردیف‌ها: [کلید، نام، گروه g/c/f، تعدادی؟] */
/* v101.0 (صاحب اپ: «هر موجودی از کالا باید در لیست باشد و بشود اصلاح کرد؛ کالاهای ساخته و غیره، همه چیز»): گروه‌ها g طلای خام (آبشده، شرطی، متفرقه، پارسیان)،
   m طلای ساخته (کالاهای نوع ساخته)، o غیر طلا (نوع «سایر»: فقط تعداد)، c سکه، f ارز؛ هر کالایی که در سندی جابه‌جا شده هم می‌آید، حتی اگر در فهرست کالاهای مغازه نباشد */
function stkAll(){xaSync();const M=gdStockAll(),RAW=['آبشده',STK_SH,'متفرقه','سکه پارسیان'],seen=new Set(RAW),L=RAW.map(k=>[k,k,'g']),gd=[...stkGoods()];
  for(const k of M.keys())if(k&&!seen.has(k)&&!XA[k]&&!gd.includes(k)&&k!=='سکه'&&!['سکه','ارز'].includes(gCat(k)))gd.push(k);
  gd.forEach(k=>{if(seen.has(k))return;seen.add(k);L.push([k,k,gCat(k)==='سایر'?'o':'m'])});
  for(const k in XA)L.push([k,XA[k].t||k,XA[k].k==='f'?'f':'c']);
  return L.map(([k,t,g])=>{const o=M.get(k)||{w:0,n:0},isX=g==='c'||g==='f'||g==='o';return {k,t,g,isX,cn:isX||gdCnt(k),w:isX?0:o.w,n:o.n,v:isX?o.n:o.w,base:!!o.base}})}
const stkDay=at=>{const d=new Date(at);if(isNaN(d))return '';const [,jm,jd]=g2j(d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()));return toFa(jd)+' '+JM[jm-1]};
const stkLast=k=>((gdC().gstkL||[]).find(z=>z.k===k))||null;
const stkVal=r=>r.isX?gdSgn(r.n,qFmt)+' <i>'+esc((XA[r.k]||{}).u||'عدد')+'</i>':gdSgn(r.w,wFmt)+' <i>گرم</i>';
const stkIc=r=>ic(r.g==='o'?'tag':r.g==='f'?'usd':r.g==='c'||r.k==='سکه پارسیان'||r.k==='آبشده'||r.k===STK_SH||r.k==='متفرقه'?'coin':'ring');
function stkRow(r,i){const L=stkLast(r.k),sub=(L?'اصلاح '+stkDay(L.at)+(L.by?' · '+esc(L.by):''):r.base?'موجودی دستی':'از روی سندها')+(r.k===STK_SH?' · با ثبت عیار به آبشده می‌رود':'');
  return `<button type="button" class="stkr${r.v<0?' ng':!r.v?' zr':''}" data-act="stkFix" data-k="${esc(r.k)}" style="--i:${Math.min(i,14)}"><span class="stki g-${r.g}">${stkIc(r)}</span><span class="tx"><b>${esc(r.t)}</b><small>${sub}${!r.isX&&r.cn&&r.n?' · '+gdSgn(r.n,qFmt)+' عدد':''}</small></span><span class="stkv">${stkVal(r)}</span><span class="cv">${ic('back')}</span></button>`}
function stkListHTML(){const q=nzName(STK.q||''),f=STK.f,A=stkAll(),L=A.filter(r=>(f==='all'||(f==='neg'?r.v<0:r.g===f))&&(!q||nzName(r.t).includes(q)||nzName(r.k).includes(q)));
  if(!L.length)return `<div class="card empty"><b>${q?'چیزی با این نام پیدا نشد':'موردی نیست'}</b></div>`;
  let h='',i=0;for(const [g,t] of STKG){const R=L.filter(r=>r.g===g);if(!R.length)continue;const sw=g==='g'||g==='m'?Math.round(R.reduce((a,r)=>a+r.w,0)*1000)/1000:null;h+=`<div class="stkh">${t}<i>${toFa(R.length)} قلم${sw!=null?' · '+gdSgn(sw,wFmt)+' گرم':''}</i></div><div class="stkc">${R.map(r=>stkRow(r,i++)).join('')}</div>`}return h}
const STKG=[['g','طلای خام'],['m','طلای ساخته'],['o','غیر طلا'],['c','سکه'],['f','ارز']];
function stkHeroHTML(){const A=stkAll(),G=A.filter(r=>r.g==='g'||r.g==='m'),tw=Math.round(G.reduce((s,r)=>s+r.w,0)*1000)/1000,neg=A.filter(r=>r.v<0).length,has=A.filter(r=>r.v).length;
  return `<div class="stkhero"><span class="stkwm">${ic('coin')}</span><div class="stkht"><span class="stkhi">${ic('coin')}</span><span class="tx"><b>موجودی طلا</b><small>طلای خام و ساخته با هم</small></span></div>
  <div class="stkhv${tw<0?' ng':''}"><b>${gdSgn(tw,wFmt)}</b><i>گرم</i></div>
  <div class="stkhc"><em>${toFa(has)} قلم موجود</em>${neg?`<button type="button" class="ng" data-act="stkF" data-f="neg">${toFa(neg)} قلم منفی · نیاز به اصلاح</button>`:`<em class="ok">${ic('check')} موجودی منفی نداریم</em>`}</div></div>`}
const STKF=[['all','همه'],['g','طلای خام'],['m','ساخته'],['o','غیر طلا'],['c','سکه'],['f','ارز'],['neg','منفی‌ها']];
function vStock(){return `<div class="stkp">${stkHeroHTML()}${typeof bcStkTile==='function'?bcStkTile():''}
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
function skRes(){const z=skCalc(),r=z.r,u=r.isX?esc((XA[r.k]||{}).u||'عدد'):'گرم';
  if(!z.ok)return `<div class="bf3d n"><span class="bf3di">${ic('edit')}</span><span class="tx"><b>موجودی واقعی را بزنید</b><small>اختلاف خودش حساب می‌شود</small></span></div>`;
  const d=r.isX?z.dn:z.hw?z.dw:z.dn,du=r.isX||!z.hw?(r.isX?u:'عدد'):'گرم',ex=!r.isX&&z.hw&&z.hn&&z.dn?' · تعداد '+(z.dn>0?'+':'−')+qFmt(Math.abs(z.dn)):'';
  if(!d&&!ex)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>برنامه با انبار یکی است</b><small>اصلاحی لازم نیست</small></span></div>`;
  if(!d)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>وزن یکی است</b><small>فقط تعداد اصلاح می‌شود${ex}</small></span></div>`;
  return `<div class="bf3d ${d>0?'g':'r'}"><span class="bf3di">${ic(d>0?'dIn':'dOut')}</span><span class="tx"><b>${d>0?'به موجودی اضافه می‌شود':'از موجودی کم می‌شود'}</b><small>اصلاح موجودی «${esc(r.t)}»${ex}</small></span><em>${d>0?'+':'−'}${(du==='گرم'?wFmt:qFmt)(Math.abs(d))} <small>${du}</small></em></div>`}
function stkFixHTML(){const r=skRow();if(!r)return '';const L=stkLast(r.k),u=r.isX?esc((XA[r.k]||{}).u||'عدد'):'گرم',can1=stkCan();
  return `<div class="sh-h"><div><b>اصلاح موجودی</b><small class="shsub">موجودی واقعی «${esc(r.t)}» را بزنید؛ اختلاف خودش حساب می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bf3 bf4 skw"><div class="bf4b" style="--bk:#b27c0e"><span class="ckbi stki g-${r.g}">${stkIc(r)}</span><span class="tx"><b>${esc(r.t)}</b><small>موجودی در برنامه</small></span><b class="bf4v ${r.v<0?'r':r.v?'g':'z'}">${r.isX?gdSgn(r.n,qFmt):gdSgn(r.w,wFmt)}<i>${u}</i></b></div>
  ${!can1?`<div class="bf3d n"><span class="bf3di">${ic('padlock')}</span><span class="tx"><b>اصلاح موجودی فقط با مدیر است</b><small>شما فقط می‌توانید موجودی را ببینید</small></span></div>`:`
  ${r.isX?'':`<div class="ckcl">وزن واقعی موجود چقدر است؟</div><div class="ckbg"><label class="ckbig"><input id="skW" class="ltr" inputmode="decimal" value="${esc(SKX.w)}" placeholder="${wFmt(Math.abs(r.w))}" autocomplete="off" enterkeyhint="done" aria-label="وزن واقعی موجود"><i>گرم</i></label></div>`}
  ${r.cn?`<div class="ckcl">${r.isX?'تعداد واقعی موجود چقدر است؟':'تعداد موجود <i>اختیاری</i>'}</div><div class="ckbg"><label class="ckbig${r.isX?'':' sm'}"><input id="skN" class="ltr" inputmode="decimal" value="${esc(SKX.n)}" placeholder="${qFmt(Math.abs(r.n))}" autocomplete="off" enterkeyhint="done" aria-label="تعداد موجود"><i>${r.isX?u:'عدد'}</i></label></div>`:''}
  <div class="ckq skq"><button type="button" data-act="skZero">موجودی صفر است</button></div>
  <div id="skL">${skRes()}</div>`}${r.k==='آبشده'?abStkHTML():''}
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
  saveCu();window.__gsc=null;window.__abp=null;const u=r.isX?((XA[r.k]||{}).u||'عدد'):'گرم',fx=v=>r.isX?gdSgn(v,qFmt):gdSgn(v,wFmt);
  logA('cust','اصلاح موجودی کالا',r.t+' | از '+fx(r.isX?r.n:r.w)+' به '+fx(r.isX?nn:nw)+' '+u+(!r.isX&&z.hn&&z.dn?' | تعداد '+qFmt(nn):''));
  SKX=null;closeSheet();stkRe();if(typeof gdRe==='function')gdRe();toast('موجودی «'+r.t+'» اصلاح شد · '+fx(r.isX?nn:nw)+' '+u)};

/* ---- v96.1 آبشده‌های موجود (خواسته صاحب اپ، مثل پنجره «تسویه با آبشده» کیمیا: «وقتی می‌خواهیم آبشده تحویل بدهیم فهرست آبشده‌های موجود خودمان را بدهد») ----
   هر ردیف خرید/دریافت آبشده = یک «تکه» با شناسه ثابت pid (ردیف‌های قدیمی: L<شناسه سند>:<ردیف>). ردیف فروش/تحویل آبشده می‌تواند با pc به یک تکه وصل شود.
   موجودی هر تکه = وزنش − خروجی‌های وصل‌شده؛ خروجی‌های بدون تکه (سندهای قدیمی یا «بدون انتخاب») از قدیمی‌ترین تکه‌ها کم می‌شود تا جمع فهرست با موجودی آبشده بخواند.
   اگر «موجودی فعلی» آبشده دستی اصلاح شده باشد: همان عدد یک تکه «موجودی قبلی» است و فقط سندهای بعد از آن شمرده می‌شود (مثل gdStockAll). */
const abIn=x=>!!x&&x.a==='gold'&&!x.pul&&x.cat==='آبشده'&&!x.pz&&(x.t==='buy'||x.t==='in');
const abOutX=x=>!!x&&x.a==='gold'&&!x.pul&&x.cat==='آبشده'&&(x.t==='sell'||x.t==='out');
const abKey=(x,t,i)=>x.pid||'L'+t.id+':'+i;
const abR3=v=>Math.round(v*1000)/1000;
function abBase(ex){ex=ex==null?'':String(ex);const C=window.__abp;if(C&&C.k===ex)return C.L;
  const b=(gdC().gstk||{})['آبشده'],bat=b&&b.at?String(b.at):'',P=[],U=new Map();let free=0;
  const out=(pc,w)=>{if(!(w>0))return;if(pc)U.set(pc,(U.get(pc)||0)+w);else free+=w};
  for(const c of custs){if(!c||c.del||c.sys)continue;for(const t of c.txs||[]){if(!t||t.del||t.type!=='inv')continue;const at=String(t.at0||t.at||'');if(bat&&at<=bat)continue;const own=!!ex&&String(t.id)===ex;
    (t.xr||[]).forEach((x,i)=>{if(abIn(x))P.push({key:abKey(x,t,i),w:parseFloat(x.w)||0,ay:x.sh===1?0:+x.ay||750,sh:x.sh===1?1:0,lab:x.lab||'',ang:x.ang||'',ds:x.ds||'',cu:cuName(c),cid:c.id,tx:t.id,no:t.no,date:t.date||'',at});else if(abOutX(x)&&!own)out(x.pc,parseFloat(x.w)||0)});
    if(!own)for(const it of t.items||[])if(it&&it.ab)out(it.pc,+it.w||0)}}
  if(bat&&+b.w>0)P.push({key:'B',w:+b.w,ay:750,sh:0,lab:'',ang:'',ds:'',cu:'',base:1,date:bat.slice(0,10),at:bat});
  P.sort((x,y)=>x.at<y.at?-1:x.at>y.at?1:0);const K=new Set(P.map(p=>p.key));U.forEach((w,k)=>{if(!K.has(k))free+=w});
  for(const p of P)p.av=p.w-(U.get(p.key)||0);
  for(const p of P){if(!(free>0.0004))break;if(p.av<=0)continue;const d=Math.min(p.av,free);p.av-=d;free-=d}
  for(const p of P)p.av=abR3(p.av);window.__abp={k:ex,L:P};return P}
/* فهرست برای سندِ باز: ردیف‌های همین سند (ذخیره‌نشده) هم کم می‌شود، جز ردیفی که همین حالا ویرایش می‌شود */
function abList(){const hs=typeof sv!=='undefined'&&sv&&cur==='sell',B=abBase(hs&&sv.edit?sv.edit.tx:'');if(!hs)return B.filter(p=>p.av>0.0004);
  const a=sv.qa||{},U=new Map(),add=(pc,w)=>{if(pc&&w>0)U.set(pc,(U.get(pc)||0)+w)};
  (sv.items||[]).forEach((it,i)=>{if(it.ab&&!(a.k&&!a.x&&a.i===i))add(it.pc,+it.w||0)});(sv.xr||[]).forEach((x,i)=>{if(abOutX(x)&&!(a.x&&a.x.i===i))add(x.pc,parseFloat(x.w)||0)});
  const me=a.x?a.x.pc:a.pc,g=typeof GTK!=='undefined'&&GTK?GTK.pc:'';
  return B.map(p=>U.has(p.key)?{...p,av:abR3(p.av-U.get(p.key))}:p).filter(p=>p.av>0.0004||p.key===me||p.key===g)}
const abDate=p=>p.date?payLab(p.date):'';
const abNm=p=>p.base?'موجودی قبلی':[p.ang?'انگ '+toFa(String(p.ang)):'',p.lab||'',p.ds||''].filter(Boolean).join(' · ')||'آبشده';
const abSub=p=>p.base?'از اصلاح موجودی · '+abDate(p):[p.cu?'از '+p.cu:'',abDate(p),p.no?'سند '+toFa(String(p.no)):''].filter(Boolean).join(' · ');
const abAyT=p=>p.sh?'شرطی':'عیار '+toFa(String(p.ay));
/* پله اول اختیاری ردیف فروش/تحویل آبشده: انتخاب از آبشده‌های موجود (وزن، عیار، انگ و آزمایشگاه همان تکه پر می‌شود) */
function stPcS(o){const L=abList();if(!L.length&&!o.pc)return [];
  return [stS('pc','آبشده موجود','','pick',()=>o.pc||'',v=>{if(v==='-'){o.pc='';return}const p=abList().find(z=>z.key===v);if(!p)return;o.pc=p.key;if(o.sh!==1&&p.ay)o.ay=p.ay;if(p.lab)o.lab=p.lab;if(p.ang)o.ang=p.ang;if(p.av>0){o.w=String(p.av);o.amT='';if('am' in o)o.am=''}},
    {opt:1,opts:()=>[...L.map(p=>({v:p.key,t:abNm(p),sub:abSub(p),amt:wFmt(p.av),lab:'گرم · '+abAyT(p),ico:'coin',cls:'ab'})),{v:'-',t:'بدون انتخاب',sub:'آبشده‌ای که در این فهرست نیست',ico:'plus'}],
     lab0:v=>{const p=v&&abBase(sv.edit?sv.edit.tx:'').find(z=>z.key===v);return p?abNm(p):''}})]}
/* وزن ردیف از موجودی تکه انتخاب‌شده بیشتر نشود */
function stPcN(o){if(!o.pc)return {};const p=abList().find(z=>z.key===o.pc);if(!p)return {};return {need:()=>(parseFloat(o.w)||0)>p.av+0.0004,msg:'وزن از موجودی این آبشده بیشتر است · موجود '+wFmt(p.av)+' گرم'}}
/* تسویه طلا (تحویل آبشده): همان تکه‌ها به شکل برچسب بالای وزن */
function gkPcH(){if(!GTK||GTK.m!=='dl'||gkRest()>0||(GTK.cat||'آبشده')!=='آبشده')return '';const L=abList();if(!L.length)return '';
  return `<div class="gkty abpc" id="gkPcs"><small>آبشده‌های موجود <i>${toFa(L.length)} تکه</i></small><div class="gktys">${L.map(p=>`<button type="button" class="gktc abpb${p.key===GTK.pc?' on':''}" data-act="gkPc" data-k="${esc(p.key)}">${ic('check')}<span><b>${wFmt(p.av)} گرم</b><small>${esc(abAyT(p))}${p.base?' · موجودی قبلی':p.ang?' · انگ '+toFa(String(p.ang)):p.cu?' · '+esc(p.cu):''}</small></span></button>`).join('')}</div></div>`}
ACT.gkPc=d=>{if(!GTK)return;gkRead();const p=abList().find(z=>z.key===d.k);if(!p)return;if(GTK.pc===p.key)GTK.pc='';else{GTK.pc=p.key;if(p.ay)GTK.ay=p.ay;/* وزن پیش‌فرض: به اندازه مانده طلای سند، نه بیشتر از موجودی تکه */const need=abR3(Math.abs(gkRest())*750/(+GTK.ay||750));GTK.wt=String(need>0?Math.min(p.av,need):p.av)}gkRe()};
/* صفحه موجودی › آبشده: فهرست تکه‌های موجود */
function abStkHTML(){const L=abBase('').filter(p=>p.av>0.0004);if(!L.length)return '';
  return `<div class="abpl"><div class="abph"><b>آبشده‌های موجود</b><small>${toFa(L.length)} تکه · ${wFmt(abR3(L.reduce((s,p)=>s+p.av,0)))} گرم</small></div>${L.map(p=>`<div class="abpr"><span class="tx"><b>${esc(abNm(p))}</b><small>${esc(abSub(p))}</small></span><span class="abpv"><b>${wFmt(p.av)}</b><small>گرم · ${esc(abAyT(p))}${p.av<p.w-0.0004?' · از '+wFmt(p.w):''}</small></span></div>`).join('')}</div>`}

/* ---- v96.4 مرجوعی از روی فروش‌های همین مشتری (خواسته صاحب اپ: «در مرجوعی طلاهایی که به مشتری فروخته شده با وزن لیست شود، انتخاب شود و بشود ویرایش کرد») ----
   فهرست = ردیف‌های کالای فروخته‌شده (items) و فروش طلا (xr sell، غیر پولی) در سندهای زنده همین حساب. کلید = «شماره سند:ردیف» (شماره سند با ویرایش عوض نمی‌شود).
   ردیف مرجوعی کلید را در rf نگه می‌دارد؛ مانده قابل برگشت هر کالا = وزن فروش − مرجوعی‌های ثبت‌شده (و ردیف‌های همین سندِ باز). انتخاب، وزن و عیار و شرح را پر می‌کند و همه قابل ویرایش است. */
function rfSold(c){if(!c)return [];const L=[],U=new Map(),ex=sv&&sv.edit?String(sv.edit.tx):'',a=sv&&sv.qa||{},add=(k,w)=>{if(k&&w>0)U.set(k,(U.get(k)||0)+w)};
  for(const t of c.txs||[]){if(!t||t.del||t.type!=='inv')continue;const b={no:t.no,date:t.date||'',at:String(t.at0||t.at||'')};
    (t.items||[]).forEach((it,i)=>{if(+it.w>0)L.push({...b,key:t.no+':i'+i,nm:it.k+dsP(it),w:+it.w,ay:+it.ay||750,...(it.bc?{bc:it.bc}:{})})});
    (t.xr||[]).forEach((x,i)=>{if(!x||x.a!=='gold'||x.pul)return;const w=parseFloat(x.w)||0;if(x.t==='sell'&&w>0)L.push({...b,key:t.no+':x'+i,nm:(x.pz?'سکه پارسیان':x.cat||'طلا')+dsP(x),w,ay:+x.ay||750});else if(x.cat==='مرجوعی'&&x.rf&&String(t.id)!==ex)add(x.rf,w)})}
  (sv&&sv.xr||[]).forEach((x,i)=>{if(x.cat==='مرجوعی'&&x.rf&&!(a.x&&a.x.i===i))add(x.rf,parseFloat(x.w)||0)});const me=a.x?a.x.rf:'';
  return L.map(p=>({...p,av:abR3(p.w-(U.get(p.key)||0))})).filter(p=>p.av>0.0004||p.key===me).sort((x,y)=>x.at<y.at?1:x.at>y.at?-1:0)}
function stRfS(x){const L=rfSold(svCu());if(!L.length&&!x.rf)return [];
  return [stS('rf','کالای فروخته‌شده','','pick',()=>x.rf||'',v=>{if(v==='-'){x.rf='';return}const p=rfSold(svCu()).find(z=>z.key===v);if(!p)return;x.rf=p.key;x.ay=p.ay;x.w=String(p.av);x.am='';x.amT='';x.ds=p.nm;/* v108.0: برگشت قطعه بارکددار = قطعه دوباره موجود */x.bc=p.bc||''},
    {opt:1,opts:()=>[...L.map(p=>({v:p.key,t:p.nm,sub:['فروش',p.date?payLab(p.date):'','سند '+toFa(String(p.no)),p.av<p.w-0.0004?'از '+wFmt(p.w)+' گرم':''].filter(Boolean).join(' · '),amt:wFmt(p.av),lab:'گرم · عیار '+toFa(String(p.ay)),ico:'ring',cls:'ab'})),{v:'-',t:'بدون انتخاب',sub:'طلایی که در این فهرست نیست',ico:'plus'}],
     lab0:v=>{const p=v&&L.find(z=>z.key===v);return p?p.nm:''}})]}
function stRfN(x){if(!x.rf)return {};const p=rfSold(svCu()).find(z=>z.key===x.rf);if(!p)return {};return {need:()=>(parseFloat(x.w)||0)>p.av+0.0004,msg:'وزن مرجوعی از وزن فروخته‌شده بیشتر است · '+wFmt(p.av)+' گرم'}}
