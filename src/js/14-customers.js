/* ===== حساب مشتریان (خرید و فروش طلا، ته حساب ریالی، طلایی، سکه و ارز) ===== */
const saveCu=()=>ls.set('m_custs',custs);
let custId=null,cuQ='';
/* فقط مشتری‌ها (رکوردهای سیستمی مثل کارتخوان‌ها و تنظیمات فروش sys دارند و مشتری نیستند) */
const CU=()=>custs.filter(c=>!c.del&&!c.sys);
const GK=['متفرقه','آبشده','سکه','نو','شمش','کارکرده'];
/* نوع‌های قدیمی تراکنش (فقط برای نمایش ردیف‌های ثبت‌شده؛ ثبت تازه همه از «سند» است) */
const TXT={buy:{t:'خرید طلا',d:'از مشتری خریدیم',i:'plus',g:1,r:1},sell:{t:'فروش طلا',d:'به مشتری فروختیم',i:'debt',g:1,r:1},pin:{t:'دریافت وجه',d:'مشتری به ما پول داد',i:'down',r:1},pout:{t:'پرداخت وجه',d:'ما به مشتری پول دادیم',i:'share',r:1},gin:{t:'دریافت طلا',d:'طلای امانی از مشتری',i:'down',g:1,w:1},gout:{t:'تحویل طلا',d:'طلا به مشتری دادیم',i:'share',g:1,w:1}};
const wFmt=w=>{w=Math.round((+w||0)*1000)/1000;return toFa(w.toLocaleString('en-US',{maximumFractionDigits:3}))};
/* سکه و ارز: ته حساب هر کدام جدا از ریالی و طلایی (به تعداد یا مقدار) */
const XA={'امامی':{t:'سکه امامی',s:'امامی',u:'عدد',k:'c'},'بهار':{t:'سکه بهار آزادی',s:'بهار',u:'عدد',k:'c'},'نیم':{t:'نیم سکه',s:'نیم',u:'عدد',k:'c'},'ربع':{t:'ربع سکه',s:'ربع',u:'عدد',k:'c'},'گرمی':{t:'سکه گرمی',s:'گرمی',u:'عدد',k:'c'},'USD':{t:'دلار',s:'دلار',u:'دلار',k:'f'},'EUR':{t:'یورو',s:'یورو',u:'یورو',k:'f'},'AED':{t:'درهم',s:'درهم',u:'درهم',k:'f'}};
const qFmt=v=>{v=Math.round((+v||0)*100)/100;return toFa(v.toLocaleString('en-US',{maximumFractionDigits:2}))};
/* مثبت = ما بدهکاریم (مشتری طلبکار) · منفی = ما طلبکاریم (مشتری بدهکار) */
/* اثر هر تراکنش بر ته حساب: r ریالی، g طلایی (گرم ۱۸ عیار)، x سکه و ارز {نوع: مقدار} */
function txD(t){const a=+t.amount||0,w=+t.weight||0;switch(t.type){case 'buy':case 'pin':return{r:a,g:0};case 'sell':case 'pout':return{r:-a,g:0};case 'gin':return{r:0,g:w};case 'gout':return{r:0,g:-w};
  case 'inv':{const paid=(t.pays||[]).reduce((s,p)=>s+(+p.amount||0),0),gc=t.gc||{};return{r:-(+t.total||0)+paid+(+gc.r||0),g:-(+gc.g||0)+(+t.ge||0),x:t.xe||null}}
  case 'xf':case 'cv':return{r:+t.r||0,g:+t.g||0};default:return{r:0,g:0}}}
/* v61.43: skip = شناسه‌هایی که حساب نشوند (سندی که الان در حال ویرایش است و ردیف‌های مرتبطش، تا «مانده قبلی» خودش را دوباره نشمارد) */
function cuBal(c,skip){let R=0,G=0;const X={};for(const t of (c.txs||[])){if(t.del||(skip&&skip.has(String(t.id))))continue;const d=txD(t);R+=d.r;G+=d.g;if(d.x)for(const k in d.x)X[k]=(X[k]||0)+(+d.x[k]||0)}
  for(const k in X){X[k]=Math.round(X[k]*100)/100;if(!X[k])delete X[k]}
  return{R:Math.round(R),G:Math.round(G*1000)/1000,X}}
const balTag=(v,gold)=>{if(!v)return `<span class="bz0">تسویه</span>`;const owe=v>0;return `<span class="${owe?'bzr':'bzb'}">${gold?wFmt(Math.abs(v))+' <i>گرم</i>':fmt(Math.abs(v))+' <i>تومان</i>'}</span>`};
const balLab=v=>!v?'تسویه':v>0?'ما بدهکاریم':'ما طلبکاریم';
/* زبان مشتری (مثل کیمیا): بدهکار به ما / طلبکار از ما */
const cuLab=(v,short)=>!v?'تسویه':v<0?(short?'بدهکار':'بدهکار به ما'):(short?'طلبکار':'طلبکار از ما');
const balV=(k,v)=>k==='r'?fmt(Math.abs(v)):k==='g'?wFmt(Math.abs(v)):qFmt(Math.abs(v));
const balU=k=>k==='r'?'تومان':k==='g'?'گرم':(XA[k]||{u:''}).u;
/* قرص مانده در فهرست: مبلغ و وزن کنار هم */
const bpill=(k,v)=>v?`<span class="bp ${k==='r'?'r':k==='g'?'g':'x'} ${v<0?'d':'c'}"><b>${balV(k,v)}<i>${esc(balU(k))}</i></b><small>${ourLab(v)}</small></span>`:'';/* v61.6: از دید مغازه: طلبکاریم قرمز، بدهکاریم آبی · v61.23: واحد کامل */
/* v61.23: مانده‌ها در فهرست مشتری: ردیف جدا زیر نام، دو ستون هم‌اندازه — طلا (گرم) راست، مبلغ (تومان) چپ؛ سکه و ارز بعد از آنها */
let cuAnim=0,cuCntId=null;/* کاشی‌های صفحه مشتری فقط بار اول ورود حرکت می‌کنند، نه در هر تازه‌سازی */
const bindCust=()=>{stmBind();if(cuCntId===custId)return;cuCntId=custId;requestAnimationFrame(()=>cuCount('.cub9.anim .cbn'))};
/* v61.60: ارز (xf) زیر مبلغ، سکه (xc) زیر طلا — CSS .c6vb با grid-auto-flow dense */
const cbCell=(k,v,i,pw)=>`<span class="cbk k${k==='r'?'r':k==='g'?'g':'x x'+((XA[k]||{}).k==='f'?'f':'c')} ${v<0?'d':v>0?'c':'z'}${pw?' pw':''}" style="--i:${i}"><span class="cbh"><small>${balKL(k)}</small>${v?`<em>${ourLab(v)}</em>`:''}</span><b${fitS(v?balV(k,v):'۰')}><span class="cbn" data-k="${k}" data-v="${Math.abs(v)}">${v?balV(k,v):'۰'}</span></b></span>`;
/* v61.88: pw = جمع تسویه‌های در انتظار تأیید این مشتری → قاب مبلغ زرد (تخصیص داده شده، هنوز کسر نشده) */
function balPills(b,pw){const X=Object.keys(b.X||{}).filter(k=>b.X[k]);if(!b.R&&!b.G&&!X.length&&!pw)return `<span class="cbz"><span class="cbzi">${ic('check')}</span><span class="cbzt"><b>حساب تسویه است</b><small>مبلغ و طلا صفر</small></span><em>تسویه</em></span>`;
  const L=[['g',b.G],['r',b.R],...X.map(k=>[k,b.X[k]])];let i=0;return L.map(([k,v])=>cbCell(k,v,i++,k==='r'&&pw)).join('')}
/* v61.56 (خواسته صاحب اپ): کارت مشتری (آواتار، عنوان، نام، گروه، تلفن) در سرتیتر همه صفحه‌های مشتری، زیر عنوان صفحه
   (جای نام کوچک قبلی). حساب مشتری: زدن = ویرایش مشخصات (مداد)؛ صفحه سند ثبت‌شده: زدن = حساب مشتری؛ صفحه سند: فقط نمایش */
function cuHead(c,ttl){const a=cur==='cust'?'cuEdit':cur==='inv'?'cuOpen':'',T=a?'button':'div',m=[c.grp?`<em>${esc(c.grp)}</em>`:'',c.phone&&cur!=='cust'?(T==='button'?telS(c.phone):telP(c.phone)):''].filter(Boolean).join('');
  return `<${T} class="cuh9"${a?` data-act="${a}" data-id="${c.id}" aria-label="${a==='cuEdit'?'ویرایش مشخصات ':'حساب '}${esc(cuName(c))}"`:''}>${cuAvH(c)}<span class="cuh9t">${ttl?`<span class="cuh9k">${esc(ttl)}</span>`:''}<span class="cuh9n">${honTag(c.name)}<b>${esc(cuName(c))}</b></span>${m?`<span class="cuh9m">${m}</span>`:''}</span>${a==='cuEdit'?`<span class="c6ed">${ic('edit')}</span>`:a?`<span class="cuh9g">${ic('back').replace('class="i"','class="i flip"')}</span>`:''}</${T}>`}
/* کارت «مانده حساب»: کاشی‌های مبلغ و طلا (و سکه/ارز) با برچسب طلبکاریم/بدهکاریم؛ عدد در قاب خودش جا می‌شود.
   همان کارت در حساب مشتری و صفحه سند ثبت‌شده؛ کاشی‌ها پله‌ای بالا می‌آیند و عدد یک بار از صفر می‌شمارد */
function cuBalCard(b,an,act,c){const T=act?'button':'div',P=c?cuPend(c):[],pw=P.reduce((s,o)=>s+(+o.z.amount||0),0);return `<${T} class="c6l c6lb cub9${an?' anim':''}${pw?' pend':''}"${act?` data-act="${act.a}" data-id="${act.id}" aria-label="حساب مشتری"`:''}><span class="cub9h"><b>مانده حساب</b>${act?`<small>حساب مشتری ${ic('back').replace('class="i"','class="i flip"')}</small>`:''}</span><span class="c6v c6vb">${balPills(b,pw)}</span></${T}>${pw?cuPendHTML(b,P,pw):''}`}
/* v61.53 (خواسته صاحب اپ): «قاب مانده» — هر جنس (مبلغ، طلا، سکه/ارز) در یک قاب جدا: بالا نام جنس و برچسب طلبکاریم/بدهکاریم،
   زیرش عدد پررنگ با واحد کامل (تومان، گرم، عدد). مبلغ و طلا همیشه کنار هم؛ سکه و ارز فقط اگر مانده دارند.
   q8F = قاب کوچک (فهرست حساب‌ها و گردش حساب؛ run = مانده بعد از ردیف)، q8R = قاب بزرگ صفحه حساب مشتری */
const q8K=k=>k==='r'?'مبلغ':k==='g'?'طلا':esc((XA[k]||{t:k}).t),q8S=v=>v<0?'d':v>0?'c':'z',q8C=k=>k==='r'?'r':k==='g'?'g':'x';
const q8Keys=(...O)=>['r','g',...new Set(O.flatMap(o=>Object.keys((o&&(o.X||o.x))||{}).filter(k=>+(o.X||o.x)[k])))];
const q8V=(o,k)=>!o?0:k==='r'?+(o.R??o.r)||0:k==='g'?+(o.G??o.g)||0:+((o.X||o.x||{})[k])||0;
function q8F(k,v,o={}){const r=o.run;return `<span class="q8f k${q8C(k)} ${q8S(v)}"${o.i!=null?` style="--i:${o.i}"`:''}><span class="q8l"><small>${q8K(k)}</small>${o.eff&&!v?'':`<em>${ourLab(v)}</em>`}</span><b><span class="cbn" data-k="${k}" data-v="${Math.abs(v)}">${v?balV(k,v):'۰'}</span><i>${esc(balU(k))}</i></b>${r!==undefined?`<span class="q8rn ${q8S(r)}"><small>مانده</small><span>${r?balV(k,r):'۰'}</span><em>${ourLab(r)}</em></span>`:''}</span>`}
function balTrail(b){return `<span class="q8fs">${q8Keys(b).map((k,i)=>q8F(k,q8V(b,k),{i})).join('')}</span>`}
function q8R(k,v,i){return `<div class="q8r k${q8C(k)} ${q8S(v)}" style="--i:${i}"><span class="q8rl"><b>${q8K(k)}</b><em>${ourLab(v)}</em></span><span class="q8rv"><b class="cbn" data-k="${k}" data-v="${Math.abs(v)}">${v?balV(k,v):'۰'}</b><i>${esc(balU(k))}</i></span></div>`}
/* شمارش عددها از صفر هنگام باز شدن صفحه (یک بار) */
function cuCount(sel){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const E=[...document.querySelectorAll(sel||'#cures .c6l.anim .cbn')].filter(e=>+e.dataset.v&&e.getBoundingClientRect().top<innerHeight);if(!E.length)return;
  const t0=performance.now(),D=650,f=(k,v)=>k==='r'?fmt(Math.round(v)):k==='g'?wFmt(v):qFmt(Math.round(v*100)/100);
  const st=n=>{const q=Math.min(1,(n-t0)/D),e=1-Math.pow(1-q,3);for(const el of E)el.textContent=f(el.dataset.k,+el.dataset.v*e);if(q<1)requestAnimationFrame(st)};requestAnimationFrame(st)}
const curCu=()=>custs.find(c=>String(c.id)===String(custId))||null;
/* ---- فهرست حساب‌ها: فقط جستجو و فهرست؛ مشتری تازه از همین جستجو ---- */
function vCusts(){const L=CU();
  if(!L.length&&!cuQ)return `<div class="c6s">${cuSearchHTML(0)}</div><div class="spempty"><div class="spill">${ic('users')}</div><b>هنوز حسابی باز نشده</b><span>نام مشتری را در جستجو بنویسید؛ اگر حسابی نداشته باشد، اول مشخصاتش را می‌گیریم و بعد وارد حساب و سند او می‌شوید.</span></div>`;
  cuAnim=1;cuCntId=null;return `<div class="c6s">${cuSearchHTML(L.length)}</div>${shBanner()}<div id="cuf">${cuFiltHTML()}</div><div id="cures">${cuListHTML()}</div>`}
const cuSearchHTML=n=>`<div class="fsearch c6q0">${ic('search')}<input id="cuq" type="search" placeholder="${n?'جستجو در '+fmt(n)+' حساب…':'نام مشتری…'}" value="${esc(cuQ)}" autocomplete="off" enterkeyhint="search"><button class="x${cuQ?'':' hide'}" data-act="cuQClr" aria-label="پاک کردن">×</button>${n?cuFBtn():''}</div>`;
/* v61.96 (خواسته صاحب اپ): فیلترها به‌جای دو ردیف چیپ، یک دکمه «فیلتر» داخل جستجو + پنجره مرتب (مثل iOS)؛ زیر جستجو فقط برچسب فیلتر فعال */
Object.assign(IC,{filter:'<path d="M4 6h16M7 12h10M10 18h4"/>'});
const cuFN=()=>(cuF.b?1:0)+(cuF.g?1:0);
const cuFBtn=()=>`<button class="cufbtn${cuFN()?' on':''}" id="cuFb" data-act="cuFOpen" aria-label="فیلتر حساب‌ها">${ic('filter')}<span>فیلتر</span>${cuFN()?`<em>${toFa(cuFN())}</em>`:''}</button>`;
/* v61.93 (خواسته صاحب اپ): فیلتر حساب‌ها — مانده‌دار، بدهکار/طلبکار تومانی و طلایی، تسویه؛ و گروه. با جستجو با هم کار می‌کنند.
   انتخاب در همین گوشی می‌ماند (m_cuf). جمع مانده‌های فیلتر بالای فهرست با شمارش. */
let cuF=(()=>{const v=ls.get('m_cuf',null);return v&&typeof v==='object'?{b:v.b||'',g:v.g||''}:{b:'',g:''}})();
const CUFB=[['','همه'],['bal','مانده‌دار'],['rd','بدهکار تومانی','d'],['rc','طلبکار تومانی','c'],['gd','بدهکار طلایی','d'],['gc','طلبکار طلایی','c'],['z','تسویه']];
const cuFOk=(k,b)=>!k?true:k==='bal'?!!(b.R||b.G||Object.keys(b.X||{}).length):k==='z'?!(b.R||b.G||Object.keys(b.X||{}).length):k==='rd'?b.R<0:k==='rc'?b.R>0:k==='gd'?b.G<0:k==='gc'?b.G>0:true;
const cuGOk=(g,c)=>!g?true:g==='-'?!c.grp:c.grp===g;
function cuFiltHTML(){const G=groupsList();if(cuF.g&&cuF.g!=='-'&&!G.includes(cuF.g))cuF.g='';if(!cuFN())return '';const B=CUFB.find(x=>x[0]===cuF.b);
  return `<div class="cufa">${B&&cuF.b?`<button class="cufp ${B[2]||''}" data-act="cuFB" data-k="${cuF.b}">${B[2]?'<i class="fdot"></i>':''}${B[1]}<span class="cufx">×</span></button>`:''}${cuF.g?`<button class="cufp" data-act="cuFG" data-g="${esc(cuF.g)}">${ic('users')}${cuF.g==='-'?'بدون گروه':esc(cuF.g)}<span class="cufx">×</span></button>`:''}${cuFN()>1?`<button class="cufclr" data-act="cuFClr">پاک کردن همه</button>`:''}</div>`}
/* پنجره فیلتر: مانده (یکی) و گروه (یکی)؛ کنار هر گزینه تعداد حساب و برای مانده‌ها جمع همان مانده */
function cuFSheetHTML(){const A=CU().map(c=>[c,cuBal(c)]),G=groupsList(),inG=A.filter(([c])=>cuGOk(cuF.g,c)),inB=A.filter(([,b])=>cuFOk(cuF.b,b));
  const sumOf=(k,L)=>{if(k==='rd')return fmt(L.reduce((a,[,b])=>a+(b.R<0?-b.R:0),0))+' تومان';if(k==='rc')return fmt(L.reduce((a,[,b])=>a+(b.R>0?b.R:0),0))+' تومان';if(k==='gd')return wFmt(L.reduce((a,[,b])=>a+(b.G<0?-b.G:0),0))+' گرم';if(k==='gc')return wFmt(L.reduce((a,[,b])=>a+(b.G>0?b.G:0),0))+' گرم';return ''};
  const row=(act,data,on,lab,sub,n,cl,ico)=>`<button class="cufr${on?' on':''}${cl?' '+cl:''}" data-act="${act}" ${data}><span class="cufi">${ico||(cl?'<i class="fdot"></i>':ic('check'))}</span><span class="tx"><b>${lab}</b>${sub?`<small>${sub}</small>`:''}</span><em>${fmt(n)}</em><span class="cufc">${ic('check')}</span></button>`;
  const BR=CUFB.map(([k,t,cl])=>{const L=inG.filter(([,b])=>cuFOk(k,b));return row('cuFS',`data-b="${k}"`,cuF.b===k,t,k&&k!=='bal'&&k!=='z'&&L.length?'جمع '+sumOf(k,L):k==='bal'?'هر حسابی که مبلغ یا طلا دارد':k==='z'?'مبلغ و طلا صفر':'',L.length,cl,k===''?ic('list'):k==='bal'?ic('debt'):k==='z'?ic('check'):'')}).join('');
  const gc=g=>inB.filter(([c])=>cuGOk(g,c)).length;
  const GR=[row('cuFS',`data-g=""`,!cuF.g,'همه گروه‌ها','',inB.length,'',ic('users')),...G.map(g=>row('cuFS',`data-g="${esc(g)}"`,cuF.g===g,esc(g),'',gc(g),'',ic('users'))),...(gc('-')?[row('cuFS',`data-g="-"`,cuF.g==='-','بدون گروه','',gc('-'),'',ic('user'))]:[])].join('');
  const n=A.filter(([c,b])=>cuGOk(cuF.g,c)&&cuFOk(cuF.b,b)).length;
  return `<div class="sh-h"><div><b>فیلتر حساب‌ها</b><small class="shsub">مانده و گروه با هم و با جستجو کار می‌کنند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="cufs"><div class="f6h">مانده</div><div class="cufg2">${BR}</div>${G.length?`<div class="f6h">گروه</div><div class="cufg2">${GR}</div>`:''}</div>
  <div class="cufbar">${cuFN()?`<button class="btn sec" data-act="cuFClr">پاک کردن</button>`:''}<button class="xgo" data-act="close">${ic('check')} نمایش ${fmt(n)} حساب</button></div>`}
ACT.cuFOpen=()=>{sheet(cuFSheetHTML())};
ACT.cuFS=d=>{if(d.b!=null)cuF.b=d.b;if(d.g!=null)cuF.g=d.g;cuFRe();const S=$('sheet');if(S&&S.querySelector('.cufs')){sheetKeep(cuFSheetHTML());const o=S.querySelector(`.cufr.on[data-${d.b!=null?'b':'g'}]`);if(o&&!RM()&&o.animate)o.animate([{transform:'scale(.97)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.3,1.4,.5,1)'})}};
/* جمع مانده‌های حساب‌های فیلترشده: تومان و طلا، جدا طلب ما (قرمز) و بدهی ما (آبی) */
function cuSumHTML(B){if(!cuF.b&&!cuF.g)return '';let rd=0,rc=0,gd=0,gc=0;for(const [,b] of B){if(b.R<0)rd+=-b.R;else rc+=b.R;if(b.G<0)gd+=-b.G;else gc+=b.G}
  const showR=cuF.b!=='gd'&&cuF.b!=='gc',showG=cuF.b!=='rd'&&cuF.b!=='rc',cell=(l,k,v,cl)=>v?`<span class="cusc ${cl}"><small>${l}</small><b${fitS(balV(k,v)+' '+balU(k))}><span class="cbn" data-k="${k}" data-v="${v}">${balV(k,v)}</span><i>${balU(k)}</i></b></span>`:'';
  const C=[showR?cell('طلبکاریم','r',rd,'d'):'',showR?cell('بدهکاریم','r',rc,'c'):'',showG?cell('طلبکاریم','g',Math.round(gd*1000)/1000,'d'):'',showG?cell('بدهکاریم','g',Math.round(gc*1000)/1000,'c'):''].filter(Boolean);
  return `<div class="cusum"><div class="cush"><b>${fmt(B.length)} حساب</b><small>${esc([cuF.g?(cuF.g==='-'?'بدون گروه':'گروه '+cuF.g):'',(CUFB.find(x=>x[0]===cuF.b)||[])[1]||''].filter(Boolean).join(' · '))}</small></div>${C.length?`<div class="cusg">${C.join('')}</div>`:''}</div>`}
function cuFRe(){ls.set('m_cuf',cuF);const f=$('cuf');if(f)f.innerHTML=cuFiltHTML();const fb=$('cuFb');if(fb)fb.outerHTML=cuFBtn();const r=$('cures');cuAnim=1;if(r)srchSwap(r,cuListHTML());requestAnimationFrame(()=>cuCount('#cures .cusum .cbn'));
  document.querySelectorAll('#cuf .cufp').forEach(o=>{if(!RM()&&o.animate)o.animate([{transform:'scale(.9)',opacity:.4},{transform:'none',opacity:1}],{duration:300,easing:'cubic-bezier(.3,1.4,.5,1)'})})}
ACT.cuFB=d=>{cuF.b=cuF.b===d.k?'':d.k;cuFRe()};
ACT.cuFG=d=>{cuF.g=cuF.g===d.g?'':d.g;cuFRe()};/* برچسب‌های زیر جستجو: زدن = برداشتن همان فیلتر */
function cuListHTML(){const q0=clean(cuQ||''),q=nzName(toEn(q0)),A=CU();let B=A.map(c=>[c,cuBal(c)]);
  /* v60.3: جستجو در همه مشخصات حساب (نام، تلفن، کد ملی، گروه، یادداشت، کارت، شبا…)؛ عدد با و بدون فاصله/صفر اول */
  const dOk=pDig(q0);
  if(q)B=B.filter(([c])=>cuHit(c,q,dOk));
  B=B.filter(([c,b])=>cuGOk(cuF.g,c)&&cuFOk(cuF.b,b));
  B.sort((a,b)=>(q?(nzName(b[0].name).startsWith(q)-nzName(a[0].name).startsWith(q)):0)||String(b[0].lastAt||b[0].createdAt||'').localeCompare(String(a[0].lastAt||a[0].createdAt||'')));
  const canAdd=q0&&can('debt')&&!/^\d+$/.test(toEn(q0))&&!A.some(c=>nzName(c.name)===nzName(q0))&&!groupsList().some(g=>nzName(g)===q);
  const add=canAdd?`<button class="c6add" data-act="cuNewQ">${ic('plus')}<span><b>حساب تازه برای «${esc(q0)}»</b><small>${B.length?'اگر هیچ‌کدام از این‌ها نیست':'این نام حسابی ندارد'} · اول مشخصات، بعد ورود به حساب</small></span></button>`:'';
  /* افراد واریزی‌ها و خریدها که هنوز حساب ندارند (از حافظه برنامه): با زدن، حساب با همان مشخصات باز می‌شود */
  const P=q?memPeople(q,dOk,12):[];
  CUP=P;
  const mem=P.length?`<div class="c6gh">از واریزی‌ها و خریدها · بدون حساب</div><div class="c6l c6mem">${P.map((p,i)=>`<button class="c6r" data-act="cuNewP" data-i="${i}"><span class="c6a m">${esc(userInit(p.name))}</span><span class="tx"><b>${esc(p.name)}</b><small>${[p.phone?'<bdi dir="ltr">'+esc(toFa(p.phone))+'</bdi>':'',p.nid?'کد ملی <bdi dir="ltr">'+esc(toFa(p.nid))+'</bdi>':'',p.n?fmt(p.n)+' واریزی':'',p.last?esc(dates(p.last).fa):''].filter(Boolean).join('، ')}</small></span><span class="c6go">${ic('plus')} حساب</span></button>`).join('')}</div>`:'';
  /* v61.33: شماره سند (فاکتور فروش، خرید و…) هم جستجو می‌شود؛ زدن = باز شدن همان سند */
  const IV=cuInvHits(q0),ivh=IV.length?`<div class="c6gh">سندها</div><div class="c6l c6iv">${IV.map(([c,t])=>{const d=txD(t);return `<button class="c6r" data-act="cuInv" data-cu="${c.id}" data-tx="${t.id}"><span class="c6a iv">${ic('inv')}</span><span class="tx"><b>${esc(invTitle(t))}</b><small>${esc(cuName(c))} · ${esc(dates(t.date).fa)}</small></span><span class="c6ivv${d.r<0?' d':d.r>0?' c':''}"><b>${fmt(Math.abs(+t.total||0))}</b><small>تومان</small></span></button>`}).join('')}</div>`:'';
  if(!B.length)return (ivh+mem+add)||`<div class="bempty">${ic('search')}<b>${cuF.b||cuF.g?'حسابی با این فیلتر نیست':'حسابی پیدا نشد'}</b>${cuF.b||cuF.g?'<button class="fchip on" data-act="cuFClr">برداشتن فیلتر</button>':''}</div>`;
  const G=q&&groupsList().find(g=>nzName(g)===q),an=cuAnim?' anim':'',PW=pendMap();cuAnim=0;
  return `${ivh}${cuSumHTML(B)}${G?`<div class="c6gh">گروه «${esc(G)}» · ${fmt(B.length)} حساب</div>`:''}<div class="c6l c6lb${an}">${B.map(([c,b],ri)=>{const pw=PW.get(String(c.id)),z=cuZero(b)&&!pw;return swW(`<button class="c6r${z?' zr':''}" data-act="cuOpen" data-id="${c.id}">${cuAvH(c)}<span class="tx"><b>${esc(cuName(c))}</b><small>${[c.grp?'<em>'+esc(c.grp)+'</em>':'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span>${z?cuZTag(ri):`<span class="c6v c6vb" style="--r:${Math.min(ri,8)}">${balPills(b,pw)}</span>`}</button>`,{r:[['cuEdit','ویرایش','edit','#3b6fd6']],l:[['cuDel','حذف','trash','#d23c48']],data:{id:c.id}})}).join('')}</div>${mem}${add}`}
/* v61.93 (خواسته صاحب اپ): حساب تسویه‌شده در فهرست‌ها کوچک و کم‌رنگ (یک برچسب کنار نام، نه کارت سبز بزرگ) */
const cuZero=b=>!(b.R||b.G||Object.keys(b.X||{}).length);
const cuZTag=ri=>`<span class="c6z"${ri!=null?` style="--r:${Math.min(ri,8)}"`:''}>${ic('check')}تسویه</span>`;
ACT.cuFClr=()=>{cuF={b:'',g:''};cuFRe();const S=$('sheet');if(S&&S.querySelector('.cufs'))sheetKeep(cuFSheetHTML())};
const cuName=c=>(c.name||'');
function cuInvHits(q0){const d=toEn(q0||'').replace(/[\s,،]/g,'');if(!/^\d{1,6}$/.test(d))return [];const R=[];
  for(const c of CU())for(const t of c.txs||[])if(t.type==='inv'&&!t.del&&t.no!=null&&String(t.no).startsWith(d))R.push([c,t]);
  return R.sort((a,b)=>(String(b[1].no)===d)-(String(a[1].no)===d)||(+b[1].no||0)-(+a[1].no||0)).slice(0,6)}
ACT.cuInv=d=>invOpen(d.cu,+d.tx||d.tx);
const aCusts=()=>'';/* افتتاح حساب از همان جستجو (نام را بنویسید → «حساب تازه») */
function bindCusts(){const q=$('cuq');if(!q)return;requestAnimationFrame(()=>{cuCount();cuCount('#cures .cusum .cbn')});q.oninput=()=>{cuQ=q.value;const x=q.parentNode.querySelector('.x');if(x)x.classList.toggle('hide',!cuQ);clearTimeout(q._t);q._t=setTimeout(()=>{const r=$('cures');if(r)srchSwap(r,cuListHTML());else if(cuQ){const v=$('view');v.innerHTML=vCusts();bindCusts();const n=$('cuq');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}}},90)};
  q.onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const iv=cuInvHits(q.value);if(iv.length&&String(iv[0][1].no)===toEn(q.value).replace(/\D/g,'')){ACT.cuInv({cu:iv[0][0].id,tx:iv[0][1].id});return}const f=document.querySelector('#cures [data-act=cuOpen]');if(f)ACT.cuOpen({id:f.dataset.id});else if(clean(q.value))ACT.cuNewQ()}}
ACT.cuQClr=()=>{cuQ='';const q=$('cuq');if(q){q.value='';const x=q.parentNode.querySelector('.x');if(x)x.classList.add('hide')}const r=$('cures');if(r)srchSwap(r,cuListHTML());else{const v=$('view');v.innerHTML=vCusts();bindCusts()}};
/* ---- صفحه یک مشتری ---- */
Object.assign(IC,{hold:'<circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8" stroke-dasharray="2.5 3"/>',more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',tel:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'});
/* v61.54 (خواسته صاحب اپ، انتخاب از بین مدل‌ها): صفحه حساب مشتری = مدل v61.47 (کارت پروفایل، کاشی‌های مانده)، گردش حساب مدل v61.46؛
   «سند جدید» فقط دکمه + در سرتیتر */
function vCust(){xaSync();const c=curCu();if(!c){setTimeout(()=>{if(cur==='cust')go('custs',true)},0);return ''}const b=cuBal(c),T=(c.txs||[]).filter(t=>!t.del).slice().sort((x,y)=>String(y.date+y.at).localeCompare(String(x.date+x.at)));
  /* v60.5: کارت مشخصات مشتری برجسته؛ زدن روی کارت = ویرایش مشخصات */
  let h=`${cuBalCard(b,cuCntId!==custId,null,c)}${bxConvHTML(c)}${wdCuHTML(c)}
  ${can('debt')?`${svDraftHTML(c)}
  `:''}
  ${shBanner(c.id)}
  <div class="spsec stmh"><div><b>گردش حساب</b><small>${T.length?fmt(T.length)+' ردیف · جستجو، بازه تاریخ و صورتحساب PDF / Excel':'هنوز سندی ثبت نشده'}</small></div></div>${T.length?`<div id="stmBar">${stmBarHTML(c)}</div>`:''}`;
  /* v61.47 (خواسته صاحب اپ): گردش حساب — هر ردیف کارت گرد با اثرش به تفکیک (تومان، طلا، سکه) و زیرش مانده حساب بعد از همان ردیف؛
     رنگ‌ها: قرمز طلبکاریم، آبی بدهکاریم؛ کارت‌ها پله‌ای بالا می‌آیند */
  /* v61.55 (خواسته صاحب اپ): گردش حساب = مدل v61.46 — هر ردیف یک کارت ساده (نوع، شرح، اثر)، بدون کادر «مانده بعد از این ردیف» */
  /* v61.80: فهرست با جستجو و بازه (stmListHTML در 15p) */
  if(T.length)h+=`<div id="cuTx">${stmListHTML(c)}</div>`;
  return h}
ACT.cuQ=d=>{const c=curCu();if(!c)return;if(d.k==='xf'){ACT.xfNew();return}if(d.k==='cv'){ACT.cvNew();return}ACT.svNew({cu:c.id,pre:d.k})};
function txEff(t){const a=+t.amount||0,w=+t.weight||0;return t.type==='buy'?{r:a}:t.type==='sell'?{r:-a}:t.type==='pin'?{r:a}:t.type==='pout'?{r:-a}:t.type==='gin'?{g:w}:{g:-w}}
function txRow(c,t){if(t.type==='inv'||t.type==='xf'||t.type==='cv')return txRow2(c,t);const T=TXT[t.type]||{t:t.type},e=txEff(t),sub=[t.kind,t.weight?wFmt(t.weight)+' گرم':'',t.ppg?'هر گرم '+fmt(t.ppg):'',t.note].filter(Boolean).join('، ');
  const val=e.r!=null?`<b class="${e.r>0?'b':'r'}">${e.r>0?'+':'−'} ${fmt(Math.abs(e.r))} <i>تومان</i></b>`:`<b class="${e.g>0?'b':'r'}">${e.g>0?'+':'−'} ${wFmt(Math.abs(e.g))} <i>گرم</i></b>`;
  return swW(`<button class="txr" data-act="txOpen" data-id="${t.id}"><span class="bri t-${t.type}">${ic(T.i||'plus')}</span><span class="tx"><b>${T.t}</b><small>${esc(sub||T.d||'')}</small></span><span class="txv">${val}<small>${e.r!=null?(e.r>0?'بدهی ما':'طلب ما'):(e.g>0?'بدهی طلایی ما':'طلب طلایی ما')}</small></span></button>`,{r:[['txOpen','جزئیات','eye','#3b6fd6']],l:can('del')||isAdmin()?[['txDel','حذف','trash','#d23c48']]:[],data:{id:t.id}})}
const aCust=()=>'';
/* ---- افتتاح / ویرایش حساب: هر فیلد از اطلاعات قبلی مشتری‌ها پیشنهاد می‌دهد ---- */
let cuT='',cuEd=null;
function cuFormHTML(c){const isNew=!c.id;CUF={av:c.av||'',ids:Array.isArray(c.idImgs)?c.idImgs.slice(0,2):[]};cuT=c.title||'';cuEd=c.id||null;const g=c.grp!=null?c.grp:'';
  const fr=(id,lab,val,o={})=>`<div class="f6r${o.ac?' ac':''}${o.cls?' '+o.cls:''}"><label for="${id}">${lab}</label><div class="f6i">${o.pre?`<span class="f6pre">${o.pre}</span>`:''}<input id="${id}"${o.ltr?' class="ltr"':''}${o.im?` inputmode="${o.im}"`:''} value="${esc(val||'')}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="${o.last?'done':'next'}">${o.bk?`<span class="f6bk" id="${id}b"></span>`:''}${o.call?`<a class="f6call${val?'':' hide'}" id="${id}c" href="${val?telHref(val):'#'}" aria-label="تماس">${ic('tel')}<span>تماس</span></a>`:o.ac?`<span class="f6ic">${ic('search')}</span>`:''}</div>${o.ac?`<div class="f6sug hide" id="${id}s" role="listbox"></div>`:''}${o.hint?`<small class="eh" id="${id}v"></small>`:''}</div>`;
  /* v61.97 (خواسته صاحب اپ): فرم مشتری از نو — سرتیتر با عکس و نام زنده، ردیف‌های یک‌خطی (برچسب و مقدار کنار هم)،
     گروه با چیپ (یک لمس) و «گروه تازه»، کارت ملی جمع‌وجور، دکمه ذخیره همیشه پیدا */
  const sec=(ico,t,o)=>`<div class="c9h"><span class="c9hi">${ic(ico)}</span><b>${t}</b>${o?'<i>اختیاری</i>':''}</div>`;
  return `<div class="sh-h"><div><b>${isNew?'حساب تازه':'مشخصات مشتری'}</b><small class="shsub">${isNew?'از مشتری‌های قبلی پیشنهاد می‌آید':'تغییرها را بدهید و ذخیره کنید'}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="f6 cuf2">
  <div class="c9hero">${cuPhHTML(c)}<div class="c9ht"><b id="cuHn">${esc(clean(c.name||'')||'مشتری تازه')}</b><span id="cuHm">${cuHmTxt(g,c.phone)}</span></div></div>
  ${sec('user','مشتری')}
  <div class="f6g">${fr('cuN','نام',c.name,{ac:1,ph:'نام و نام خانوادگی'})}
  ${fr('cuP','تلفن',c.phone,{ac:1,ltr:1,im:'tel',ph:'09xxxxxxxxx',hint:1,call:!isNew})}
  ${fr('cuM','کد ملی',c.nid,{ac:1,ltr:1,im:'numeric',ph:'۱۰ رقم',hint:1})}</div>
  ${sec('users','گروه')}
  <div class="f6g c9gf">${fr('cuG','گروه',g,{ac:1,ph:'بدون گروه · بزنید'})}</div>
  ${sec('eye','عکس کارت ملی',1)}
  <div class="cuid" id="cuIdBox">${cuIdHTML()}</div>
  ${sec('bank','حساب بانکی',1)}
  <div class="f6g">${fr('cuBI','شبا',c.bk&&c.bk.iban?ibanGroups(dg(c.bk.iban)):'',{ltr:1,im:'numeric',ph:'۲۴ رقم',hint:1,pre:'IR',bk:1,cls:'f6ib'})}
  ${fr('cuBK','کارت',c.bk&&c.bk.card?grp4(c.bk.card):'',{ltr:1,im:'numeric',ph:'۱۶ رقم',hint:1,bk:1,cls:'f6ib'})}
  ${fr('cuBH','صاحب حساب',c.bk?c.bk.holder:'',{ph:'اگر با نام مشتری فرق دارد'})}</div>
  ${sec('edit','یادداشت',1)}
  <div class="f6g">${fr('cuA','آدرس / توضیح',c.note,{ph:'آدرس، معرف، …',last:1})}</div>
  </div>
  <button class="xgo" data-act="cuSave" data-id="${c.id||'new'}">${ic('check')} ${isNew?'ثبت و ورود به حساب':'ذخیره'}</button>`}
const cuHmTxt=(g,ph)=>[g?esc(g):'',ph&&/^09\d{9}$/.test(ph)?telP(ph):''].filter(Boolean).join(' · ')||'گروه و تلفن اینجا دیده می‌شود';
function cuHero(){const n=$('cuHn'),m=$('cuHm'),N=$('cuN'),P=$('cuP'),G=$('cuG');if(n&&N)n.textContent=clean(N.value)||'مشتری تازه';if(m)m.innerHTML=cuHmTxt(G?clean(G.value):'',P?toEn(P.value).replace(/\D/g,''):'');const b=document.querySelector('#sheet .cuavi b');if(b&&N)b.textContent=userInit(clean(N.value)||'؟')}
/* فهرست پیشنهاد زیر یک فیلد (مثل جستجوی آیفون): با تایپ باز می‌شود و با انتخاب بسته */
/* v61.83: o.tap (خواسته صاحب اپ برای گروه مشتری): زدن اول = فقط فهرست (بدون کیبورد)، زدن دوم = کیبورد؛ زدن بیرون = بستن (kb2 در 15j) */
function acList(inp,box,rows,pick,o){if(!inp||!box)return;const tap=o&&o.tap;const hide=()=>{box.classList.add('hide');box.innerHTML='';if(tap){inp._lo=false;if(document.activeElement!==inp)inp.readOnly=true}};
  const show=()=>{if(document.activeElement!==inp&&!(tap&&inp._lo)){hide();return}const h=rows(inp.value);if(!h){hide();return}box.innerHTML=h;box.classList.remove('hide')};
  inp.addEventListener('input',()=>{clearTimeout(inp._at);inp._at=setTimeout(show,70)});inp.addEventListener('focus',()=>setTimeout(show,0));inp.addEventListener('blur',()=>setTimeout(hide,170));
  inp.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});box.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()};
  box.onclick=e=>{const r=e.target.closest('button[data-i]');if(!r)return;hide();pick(r.dataset.i)};
  if(tap){inp._lo=false;inp.addEventListener('blur',()=>setTimeout(()=>{if(document.activeElement!==inp){inp._lo=false;inp.readOnly=true}},180));
    kb2(inp,()=>inp._lo,()=>{inp._lo=true;const h=rows('');if(!h)return;box.innerHTML=h;box.classList.remove('hide');try{box.scrollIntoView({block:'nearest',behavior:RM()?'auto':'smooth'})}catch(_){}});
    const out=e=>{if(!inp.isConnected){document.removeEventListener('pointerdown',out,true);return}if(!inp._lo||document.activeElement===inp)return;const t=e.target;if(t===inp||box.contains(t))return;hide()};
    document.addEventListener('pointerdown',out,true)}}
const sugRow=(i,av,b,sub,cls,v)=>`<button type="button" class="bzsr${cls?' '+cls:''}" data-i="${esc(i)}"><span class="av">${av}</span><span class="tx"><b>${b}</b><small>${sub}</small></span>${v?`<span class="cbv">${v}</span>`:''}</button>`;
function cuPeople(q,by){const nq=nzName(q),qd=toEn(q).replace(/\D/g,'');const P=bzPeople();
  if(by==='n'){if(!nq)return [];return P.filter(p=>p.k.includes(nq)).sort((a,b)=>(b.k.startsWith(nq)-a.k.startsWith(nq))||(b.n-a.n)||String(b.last).localeCompare(String(a.last))).slice(0,6)}
  if(qd.length<3)return [];return P.filter(p=>(by==='p'?p.phone:p.nid).includes(qd)).slice(0,6)}
function cuBind(){phPaint($('sheet'));const N=$('cuN'),P=$('cuP'),M=$('cuM'),G=$('cuG'),h=(id,t,c)=>{const o=$(id);if(o){o.textContent=t;o.className='eh'+(c?' '+c:'')}};let L=[];
  /* v64.2: دکمه «تماس» کنار تلفن در مشخصات حساب (از سرتیتر حساب برداشته شد)؛ با تغییر شماره همراهش عوض می‌شود */
  const PC=$('cuPc');if(P&&PC)P.addEventListener('input',()=>{const v=toEn(P.value).replace(/\D/g,'');PC.href=v?telHref(v):'#';PC.classList.toggle('hide',v.length<11)});
  P.oninput=()=>{const v=toEn(P.value).replace(/\D/g,'').slice(0,11);P.value=v;const d=v&&custs.find(c=>!c.del&&!c.sys&&c.phone===v&&String(c.id)!==String(cuEd));h('cuPv',d?'این شماره برای «'+cuName(d)+'» ثبت شده':v.length===11?(phoneMsg(v)[0]):'',d||(v.length===11&&!phoneOk(v))?'bad':v.length===11?'ok':'')};
  M.oninput=()=>{const v=toEn(M.value).replace(/\D/g,'').slice(0,10);M.value=v;h('cuMv',v.length===10?(nidOk(v)?'کد ملی معتبر است':'کد ملی معتبر نیست'):'',v.length===10?(nidOk(v)?'ok':'bad'):'')};
  if(P.value)P.oninput();if(M.value)M.oninput();
  /* v61.80: مشخصات بانکی مشتری (برای واریز مانده؛ از فرم واریز هم خودکار پر و ذخیره می‌شود) */
  const BI=$('cuBI'),BK=$('cuBK');if(BI){BI.oninput=()=>{const v=dg(BI.value).slice(0,24);BI.value=ibanGroups(v);const b5=v.length>=5?BANKS[v.slice(2,5)]||'':'',bb=$('cuBIb');if(bb&&bb.dataset.b!==b5){bb.dataset.b=b5;bb.innerHTML=b5?bankBadge(b5):'';if(b5&&!RM()&&bb.animate)bb.animate([{transform:'scale(.5)',opacity:0},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.3,1.4,.5,1)'})}h('cuBIv',!v?'':v.length<24?toFa(v.length)+' از ۲۴ رقم'+(b5?' · '+b5:''):ibanOk('IR'+v)?'شبا معتبر است'+(b5?' · '+b5:''):'شماره شبا اشتباه است',v.length===24?(ibanOk('IR'+v)?'ok':'bad'):'')};if(BI.value)BI.oninput()}
  if(BK){BK.oninput=()=>{const v=dg(BK.value).slice(0,16);BK.value=grp4(v);const kb=$('cuBKb'),kn=v.length>=6?bankOfCard(v):'';if(kb&&kb.dataset.b!==kn){kb.dataset.b=kn;kb.innerHTML=kn?bankBadge(kn):''}h('cuBKv',!v?'':v.length<16?toFa(v.length)+' از ۱۶ رقم':luhn(v)?'معتبر':'رقم کنترلی نمی‌خواند',v.length===16?(luhn(v)?'ok':'bad'):'')};if(BK.value)BK.oninput()}
  const pRows=by=>q=>{L=cuPeople(q,by);if(!L.length)return '';return L.map((p,i)=>{const own=p.cuId&&String(p.cuId)===String(cuEd),acc=p.cuId&&!own;return sugRow(i,esc(userInit(p.name)),esc(p.name),[acc?'<b class="c6own">حساب دارد · باز کردن</b>':'',p.phone?'<bdi dir="ltr">'+esc(toFa(p.phone))+'</bdi>':'',p.nid&&by==='m'?'کد ملی <bdi dir="ltr">'+esc(toFa(p.nid))+'</bdi>':'',!p.cuId&&p.n?toFa(p.n)+' واریزی':''].filter(Boolean).join(' · ')||'مشتری',acc?'acc':'')}).join('')};
  const pickP=i=>{const p=L[+i];if(!p)return;if(p.cuId&&String(p.cuId)!==String(cuEd)&&!cuEd){const c=CU().find(z=>String(z.id)===String(p.cuId));if(c){closeSheet();if(cuRet==='sell'){cuRet='';svPick(c.id)}else{custId=c.id;go('cust')}toast('حساب «'+cuName(c)+'» باز شد');return}}
    N.value=p.name;if(p.phone&&!P.value){P.value=p.phone;P.oninput()}if(p.nid&&!M.value){M.value=p.nid;M.oninput()}const BI=$('cuBI'),BK=$('cuBK'),BH=$('cuBH');if(BI&&p.iban&&!BI.value){BI.value=ibanGroups(dg(p.iban));BI.oninput&&BI.oninput();if(BK&&p.card&&!BK.value){BK.value=grp4(p.card);BK.oninput&&BK.oninput()}if(BH&&p.holder&&nzName(p.holder)!==nzName(p.name)&&!BH.value)BH.value=p.holder}const nx=[P,M].find(el=>!el.value);if(nx)nx.focus();else N.blur()};
  acList(N,$('cuNs'),pRows('n'),pickP);acList(P,$('cuPs'),pRows('p'),pickP);acList(M,$('cuMs'),pRows('m'),pickP);
  /* v61.98 (خواسته صاحب اپ): گروه دوباره جستجویی (مثل قبل) ولی با طراحی تازه — زدن اول = فهرست گروه‌ها (بدون کیبورد)،
     زدن دوم = کیبورد با انتخاب کل نام (تایپ = گروه تازه)؛ «بدون گروه» و «گروه تازه «…»» در همان فهرست */
  let GL=[];G.addEventListener('focus',()=>{G._v0=G.value;if(G.value)setTimeout(()=>{if(document.activeElement===G&&!G.readOnly)try{G.setSelectionRange(0,G.value.length)}catch(_){}},40)});
  acList(G,$('cuGs'),q=>{const nq=q===G._v0||q===''?'':nzName(q),A=groupsList();GL=A.filter(x=>!nq||nzName(x).includes(nq)).slice(0,nq?8:40);const ex=A.some(x=>nzName(x)===nq);const cnt=x=>CU().filter(c=>c.grp===x).length;
    const R=GL.map((x,i)=>sugRow(i,ic('users'),esc(x),fmt(cnt(x))+' مشتری','gr'+(x===G.value?' on':''),x===G.value?ic('check'):''));
    if(!nq&&G.value){GL.push('');R.unshift(sugRow(GL.length-1,ic('x'),'بدون گروه','گروه این مشتری برداشته شود','gr0'))}
    if(nq&&!ex){GL.push(clean(q));R.push(sugRow(GL.length-1,ic('plus'),'گروه تازه «'+esc(clean(q))+'»','بعداً با جستجوی همین نام پیدا می‌شود','nw'))}
    return (nq||!A.length)&&!R.length?'':`<div class="c9gl">${R.join('')}</div>`},i=>{G.value=GL[+i]||'';G.blur();cuHero();const r=G.closest('.f6r');if(r&&!RM()&&r.animate)r.animate([{backgroundColor:'color-mix(in srgb,#2152d9 12%,transparent)'},{backgroundColor:'transparent'}],{duration:600,easing:'ease-out'})},{tap:1});
  G.addEventListener('input',cuHero);[N,P].forEach(el=>el.addEventListener('input',cuHero));
  ['cuN','cuP','cuM','cuG','cuBI','cuBK','cuBH','cuA'].forEach((id,i,A)=>{const el=$(id);el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const nx=A.slice(i+1).map(x=>$(x)).find(x=>x&&x.offsetParent);if(nx)nx.focus();else el.blur()}})})}
ACT.cuNew=()=>{cuRet='';sheet(cuFormHTML({}));cuBind();sheetFocus($('cuN'))};
ACT.cuEdit=d=>{const c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;sheet(cuFormHTML(c));cuBind()};
ACT.cuSave=d=>{const name=clean($('cuN').value),phone=toEn($('cuP').value).replace(/\D/g,''),nidv=toEn($('cuM').value).replace(/\D/g,''),note=clean($('cuA').value||''),grp=clean($('cuG').value||'');
  if(!name){toast('نام مشتری را وارد کنید',true);$('cuN').focus();return}if(phone&&!phoneOk(phone)){toast('شماره تماس درست نیست',true);$('cuP').focus();return}if(nidv&&!nidOk(nidv)){toast('کد ملی معتبر نیست',true);$('cuM').focus();return}
  const bI=dg(($('cuBI')||{}).value||'').slice(0,24),bK=dg(($('cuBK')||{}).value||'').slice(0,16),bH=clean(($('cuBH')||{}).value||'');if(bI&&(bI.length!==24||!ibanOk('IR'+bI))){toast('شماره شبا درست نیست',true);$('cuBI').focus();return}
  if(grp)addGroup(grp);const now=new Date().toISOString();let c;const bk=bI||bK?{iban:bI?'IR'+bI:'',card:bK,holder:bH||name,at:now}:null;
  const ph={av:CUF.av||'',idImgs:CUF.ids.filter(Boolean)};if(d.id==='new'){c={id:nid++,title:cuT,name,phone,nid:nidv,note,grp,...ph,...(bk?{bk}:{}),txs:[],createdAt:now,lastAt:now,by:who()};custs.push(c);logA('cust','افتتاح حساب مشتری',cuName(c))}
  else{c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;Object.assign(c,{title:cuT,name,phone,nid:nidv,note,grp,...ph,updatedAt:now,updatedBy:who()});if(bk)c.bk=bk;else delete c.bk;logA('cust','ویرایش مشخصات مشتری',cuName(c))}
  saveCu();closeSheet();if(d.id==='new'&&cuRet==='peer'){cuRet='';stPeerNew(c);toast('حساب «'+cuName(c)+'» باز شد');return}if(d.id==='new'&&cuRet==='sell'){cuRet='';svPick(c.id);toast('حساب «'+cuName(c)+'» باز شد و روی سند نشست');return}if(d.id==='new'){cuQ='';custId=c.id;go('cust');toast('حساب «'+cuName(c)+'» باز شد')}else{const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast('مشخصات ذخیره شد')}};
ACT.cuDel=d=>{const c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;const b=cuBal(c);askConfirm('حساب «'+cuName(c)+'» حذف شود؟'+(b.R||b.G||Object.keys(b.X).length?' (ته حساب صفر نیست)':''),'حذف',()=>{c.del=true;c.delAt=new Date().toISOString();saveCu();logA('cust','حذف حساب مشتری',cuName(c));if(cur==='cust')go('custs');else render();toast('حساب حذف شد','', 'بازگردانی',()=>{c.del=false;saveCu();render()})})};
ACT.cuOpen=d=>{custId=d.id;go('cust')};
let CUP=[];
ACT.cuNewP=d=>{const p=CUP[+d.i];if(!p||!can('debt'))return;cuRet='';sheet(cuFormHTML({name:p.name,phone:p.phone,nid:p.nid}));cuBind()};
ACT.cuNewQ=()=>{cuRet='';const q=clean(cuQ||'');sheet(cuFormHTML({name:q}));cuBind();sheetFocus($('cuP'))};
/* موجودی مغازه به تفکیک نوع طلا: خرید و دریافت اضافه می‌کند، فروش و تحویل کم می‌کند (پولی‌ها موجودی را تغییر نمی‌دهند) */
function goldStock(){const m={};GK.forEach(k=>m[k]=0);for(const c of custs){if(c.del||c.sys)continue;for(const t of (c.txs||[])){if(t.del)continue;
    if(t.type==='inv'){for(const it of t.items||[]){const k=it.cat||'نو';m[k]=(m[k]||0)-(+it.w||0)}for(const p of t.pays||[])if(p.m==='gold'){const k=p.cat||'کارکرده';m[k]=(m[k]||0)+(+p.w||0)}
      for(const x of t.xr||[]){if(x.a!=='gold'||x.pul)continue;const k=x.cat||'متفرقه',s=x.t==='buy'||x.t==='in'?1:-1;m[k]=(m[k]||0)+s*(+x.w||0)}continue}
    if(!t.kind)continue;const w=+t.weight||0;if(t.type==='buy')m[t.kind]=(m[t.kind]||0)+w;else if(t.type==='sell')m[t.kind]=(m[t.kind]||0)-w}}
  Object.keys(m).forEach(k=>m[k]=Math.round(m[k]*1000)/1000);return m}
/* موجودی سکه و ارز مغازه (از سندها) */
function assetStock(){const m={};for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;for(const x of t.xr||[]){if(x.a==='gold'||x.pul)continue;m[x.a]=(m[x.a]||0)+(x.t==='buy'||x.t==='in'?1:-1)*(+x.q||0)}}}
  Object.keys(m).forEach(k=>{m[k]=Math.round(m[k]*100)/100;if(!m[k])delete m[k]});return m}
/* v61.12: سود پیش‌فرض ثابت: آبشده ۰٫۵٪، بقیه ۷٪ (در هر ردیف قابل تغییر؛ تغییر یک ردیف پیش‌فرض بقیه را عوض نمی‌کند) */
const PROFIT_DEF=()=>7,PROFIT_AB=0.5;
const decIn=v=>toEn(String(v||'')).replace(/[٫،,\/]/g,'.').replace(/[^0-9.]/g,'').replace(/(\..*)\./g,'$1');
ACT.txOpen=d=>{const c=curCu(),t=c&&(c.txs||[]).find(x=>String(x.id)===String(d.id));if(!t)return;if(t.type==='inv'||TXDOC.includes(t.type)){invOpen(c.id,t.id);return}if(t.type==='xf'||t.type==='cv'){xfShow(c,t);return}const T=TXT[t.type]||{t:t.type},e=txEff(t);
  const kv=(l,v)=>v?`<div class="kv"><small>${l}</small><b>${v}</b><span class="kvx"></span></div>`:'';
  sheet(`<div class="sh-h"><div><b>${T.t}</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="kvs" style="border:0;padding:0">${kv('اثر بر حساب',e.r!=null?`<span class="${e.r>0?'b':'r'}c">${e.r>0?'+':'−'} ${fmt(Math.abs(e.r))} تومان (${e.r>0?'بدهی ما':'طلب ما'})</span>`:`<span class="${e.g>0?'b':'r'}c">${e.g>0?'+':'−'} ${wFmt(Math.abs(e.g))} گرم (${e.g>0?'بدهی طلایی ما':'طلب طلایی ما'})</span>`)}${kv('نوع طلا',esc(t.kind||''))}${kv('وزن',t.weight?wFmt(t.weight)+' گرم':'')}${kv('عیار',esc(t.ayar||''))}${kv('نرخ هر گرم',t.ppg?fmt(t.ppg)+' تومان':'')}${t.type==='sell'&&t.goldVal?kv('بهای طلا',fmt(t.goldVal)+' تومان')+kv('اجرت',fmt(t.aj||0)+' تومان'+(t.ajU==='p'?' ('+toFa(t.ajIn)+'٪)':''))+kv('سود',fmt(t.profit||0)+' تومان ('+toFa(t.pp)+'٪)')+(t.tax?kv('مالیات',fmt(t.tax)+' تومان'):''):''}${kv('مبلغ',t.amount?fmt(t.amount)+' تومان':'')}${kv('تاریخ',esc(dates(t.date).wd+' '+dates(t.date).fa))}${kv('توضیح',esc(t.note||''))}${kv('ثبت‌کننده',esc(t.by||''))}</div>
  ${can('del')||isAdmin()?`<button class="edel" data-act="txDel" data-id="${t.id}">${ic('trash')} حذف این تراکنش</button>`:''}`)};
ACT.txDel=d=>{const c=curCu(),t=c&&(c.txs||[]).find(x=>String(x.id)===String(d.id));if(!t)return;closeSheet();t.del=true;t.delAt=new Date().toISOString();t.delBy=who();const L=txLinked(c,t);L.forEach(x=>{x.t.del=true;x.t.delAt=t.delAt;x.t.delBy=who()});const DU=invDepOff(t);saveCu();logA('cust','حذف تراکنش',cuName(c)+' | '+(t.type==='inv'?'سند '+toFa(t.no):(TXT[t.type]||{}).t||t.type));const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;
  toast('حذف شد'+(L.length?' (همراه '+toFa(L.length)+' ردیف مرتبط در حساب‌های دیگر)':''),'', 'بازگردانی',()=>{t.del=false;L.forEach(x=>x.t.del=false);DU();saveCu();const v2=$('view'),y2=v2.scrollTop;render();v2.scrollTop=y2})};

ACT.entryMenu=()=>{if(!can('add')){toast('دسترسی «ثبت واریزی جدید» برای حساب شما فعال نیست',true);return}sheet(`<div class="sh-h"><div><b>ورود حساب</b><small class="shsub">نوع ثبت را انتخاب کنید</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <button class="opt big" data-act="buyNew">${ic('plus')}<span><b>خرید</b><small>خرید طلا از مشتری و واریز مبلغ به حساب او، مرحله‌به‌مرحله</small></span></button>
  <button class="opt big" data-act="sellSoon">${ic('debt')}<span><b>فروش</b><small>فروش طلا به مشتری</small></span></button>
  <button class="opt big" data-act="go" data-n="bulk">${ic('paste')}<span><b>چسباندن لیست</b><small>چند واریزی یکجا از متن تلگرام یا یادداشت</small></span></button>`)};
ACT.sellSoon=()=>{closeSheet();ACT.svNew({})};
let bz={step:1,d:{},msg:''};
const ppgOf=(amt,w)=>{w=parseFloat(toEn(String(w||'')))||0;return w>0&&amt>0?Math.round(amt/w):0};
const nidOk=c=>{if(!/^\d{10}$/.test(c)||/^(\d)\1{9}$/.test(c))return false;let s=0;for(let i=0;i<9;i++)s+=+c[i]*(10-i);const r=s%11;return r<2?+c[9]===r:+c[9]===11-r};
const phoneOk=v=>/^09\d{9}$/.test(v)&&!!phoneOp(v);
/* اپراتور از روی پیش‌شماره (بدون اینترنت) */
function phoneOp(v){v=String(v||'');if(!/^09\d{9}$/.test(v))return '';const p=v.slice(0,4),p5=v.slice(0,5);
  if(/^09(1\d|90|91|92|93|94|95|96)$/.test(p))return 'همراه اول';if(/^09(01|02|03|04|05|30|33|35|36|37|38|39|41)$/.test(p))return 'ایرانسل';if(/^09(20|21|22|23)$/.test(p))return 'رایتل';if(p==='0998'||p==='0999')return p5==='09999'||p5==='09998'?'شاتل موبایل':'اپراتور مجازی';if(p==='0934')return 'تالیا / همراه اول';return ''}
const phoneMsg=v=>{v=toEn(v||'').replace(/\D/g,'');if(!v||v.length<11)return ['',''];if(!/^09/.test(v))return ['شماره تماس باید با ۰۹ شروع شود','bad'];const o=phoneOp(v);return o?['شماره معتبر است · '+o,'ok']:['پیش‌شماره این شماره برای هیچ اپراتوری نیست','bad']};
const BZK={'طلا':{u:'گرم',q:'وزن',dec:1,t:['آبشده','نو','مستعمل','ساخته'],tl:'نوع طلا'},'سکه':{u:'عدد',q:'تعداد',t:['تمام امامی','تمام بهار','نیم','ربع','گرمی'],tl:'نوع سکه',rl:'نرخ لحظه هر عدد'},'دلار':{u:'دلار',q:'مقدار'},'یورو':{u:'یورو',q:'مقدار'},'سایر':{u:'',q:''}};
function bzItems(){const d=bz.d;if(!d.items||!d.items.length)d.items=[{k:'طلا',q:d.weight||'',r:0,amt:num(d.amount||0)}]}
/* v64.2 (خواسته صاحب اپ): انتخاب نوع قلم (طلا و نوعش، سکه و نوعش، دلار، یورو، سایر) در یک پنل با جستجو؛
   در کارت قلم فقط یک دکمه با انتخاب فعلی می‌ماند */
const BZI={'طلا':'ring','سکه':'coin','دلار':'usd','یورو':'cash','سایر':'tag'};
const bzKLab=x=>x.k+(x.t?' · '+x.t:x.k==='سایر'&&x.n?' · '+x.n:'');
function bzItemsHTML(){const L=bz.d.items;return L.map((x,i)=>{const K=BZK[x.k]||BZK['سایر'];return `<div class="bzit" data-i="${i}"><div class="bzit-h"><button type="button" class="bzpk" data-act="bzPick" data-i="${i}" aria-label="انتخاب نوع قلم"><span class="bzpki">${ic(BZI[x.k]||'tag')}</span><span class="bzpkt"><small>${L.length>1?'قلم '+toFa(i+1):'نوع قلم'}</small><b>${esc(bzKLab(x))}</b></span><span class="bzpkc">تغییر ${ic('chev')}</span></button>${L.length>1?`<button class="x" data-act="bzItDel" data-i="${i}" aria-label="حذف">×</button>`:''}</div>
  ${K.q?`<div class="ef2"><div class="ef"><label>${K.q} <i>(${K.u})</i></label><input data-f="q" class="ltr" inputmode="decimal" value="${esc(x.q||'')}" autocomplete="off"></div><div class="ef"><label>${K.rl||'نرخ هر '+(K.u==='گرم'?'گرم':K.u||'واحد')} <i>(اختیاری)</i></label><input data-f="r" class="ltr" inputmode="numeric" value="${x.r?Number(x.r).toLocaleString('en-US'):''}" autocomplete="off"></div></div>`:x.k==='سایر'?`<div class="ef"><label>شرح</label><input data-f="n" value="${esc(x.n||'')}" placeholder="شرح" autocomplete="off"></div>`:''}
  <div class="ef" style="margin:0"><label>مبلغ این قلم <i>(تومان)</i></label><input data-f="amt" class="ltr" inputmode="numeric" value="${x.amt?Number(x.amt).toLocaleString('en-US'):''}" autocomplete="off"></div></div>`}).join('')}
function bzItRead(){const d=bz.d;document.querySelectorAll('#bzIt .bzit').forEach(el=>{const x=d.items[+el.dataset.i];if(!x)return;const g=f=>{const i=el.querySelector('[data-f='+f+']');return i?i.value:undefined};if(g('q')!==undefined)x.q=decIn(g('q'));if(g('r')!==undefined)x.r=num(g('r'));if(g('amt')!==undefined)x.amt=num(g('amt'));if(g('n')!==undefined)x.n=g('n')});
  d.amount=String(d.items.reduce((s,x)=>s+(+x.amt||0),0));const gw=d.items.filter(x=>x.k==='طلا').reduce((s,x)=>s+(parseFloat(x.q)||0),0);d.weight=gw?String(Math.round(gw*1000)/1000):''}
const bzGoldAmt=()=>(bz.d.items||[]).filter(x=>x.k==='طلا').reduce((s,x)=>s+(+x.amt||0),0)||(!(bz.d.items||[]).length?num(bz.d.amount||0):0);
function bzItBind(){const S=()=>{bzItRead();const d=bz.d,tot=num(d.amount),gw=parseFloat(d.weight)||0,ga=bzGoldAmt(),pg=ppgOf(ga,gw),n=d.items.filter(x=>x.amt).length;
    $('bzS').innerHTML=`${pg?`<div class="bzppg"><div><small>هر گرم طلای خام، تمام‌شده</small><b>${fmt(pg)}<i>تومان</i></b></div><span class="m">${fmt(ga)} تومان<br>÷ ${esc(toFa(d.weight))} گرم</span></div>`:''}${tot?`<div class="bztot"><span>جمع کل${n>1?' ('+toFa(n)+' قلم)':''}</span><b>${fmt(tot)} <i>تومان</i></b></div>`:''}`;
    /* تسویه از مشتری با مبلغ همین صفحه هم‌زمان (دکمه «ثبت تسویه» وقتی مبلغی هست) */const T=$('bzStl');if(T){const h=bzStlHTML();if(T._h!==h){T.innerHTML=h;T._h=h}}};
  document.querySelectorAll('#bzIt .bzit').forEach(el=>{const x=bz.d.items[+el.dataset.i],q=el.querySelector('[data-f=q]'),r=el.querySelector('[data-f=r]'),a=el.querySelector('[data-f=amt]');
    const auto=()=>{const qq=parseFloat(decIn(q?q.value:''))||0,rr=r?num(r.value):0;if(qq&&rr&&a){a.value=Math.round(qq*rr).toLocaleString('en-US')}};
    if(q)q.oninput=()=>{q.value=decIn(q.value);auto();S()};if(r)r.oninput=()=>{const v=num(r.value);r.value=v?v.toLocaleString('en-US'):'';auto();S()};if(a)a.oninput=()=>{const v=num(a.value);a.value=v?v.toLocaleString('en-US'):'';S()};
    const n=el.querySelector('[data-f=n]');if(n)n.oninput=S});
  S();const f=document.querySelector('#bzIt .bzit:last-child input');if(f&&!f.value)setTimeout(()=>f.focus(),300)}
ACT.bzAddIt=()=>{bzItRead();bz.d.items.push({k:'سکه',t:'تمام امامی',q:'',r:0,amt:0});const y=$('view').scrollTop;render();$('view').scrollTop=y+200};
ACT.bzItDel=d=>{bzItRead();bz.d.items.splice(+d.i,1);const y=$('view').scrollTop;render();$('view').scrollTop=y};
ACT.bzItT=d=>{bzItRead();const x=bz.d.items[+d.i];if(!x)return;x.t=x.t===d.t?'':d.t;const y=$('view').scrollTop;render();$('view').scrollTop=y};
const bzPkOpts=()=>Object.keys(BZK).flatMap(k=>BZK[k].t?BZK[k].t.map(t=>({k,t})):[{k,t:''}]);
function bzPkList(i,q0){const x=bz.d.items[i]||{},q=nzName(toEn(q0||'')),O=bzPkOpts().filter(o=>!q||nzName(o.k+' '+o.t).includes(q));let h='',g='';
  O.forEach(o=>{if(o.k!==g){g=o.k;h+=`<div class="bzpkg">${esc(o.k)}${BZK[o.k].tl?' <i>· '+esc(BZK[o.k].tl)+'</i>':''}</div>`}const on=x.k===o.k&&(x.t||'')===o.t;
    h+=`<button type="button" class="bzsr bzpko${on?' on':''}" data-act="bzPkSel" data-i="${i}" data-k="${esc(o.k)}" data-t="${esc(o.t)}"><span class="av">${ic(BZI[o.k]||'tag')}</span><span class="tx"><b>${esc(o.t||o.k)}</b><small>${o.t?esc(o.k):o.k==='سایر'?'با شرح دلخواه':'به '+esc(BZK[o.k].u)}</small></span>${on?`<span class="cbv">${ic('check')}</span>`:''}</button>`});
  if(q&&!O.some(o=>nzName(o.t||o.k)===q))h+=`<button type="button" class="bzsr bzpko nw" data-act="bzPkSel" data-i="${i}" data-k="سایر" data-t="" data-n="${esc(clean(q0))}"><span class="av">${ic('plus')}</span><span class="tx"><b>«${esc(clean(q0))}»</b><small>به‌عنوان سایر، با همین شرح</small></span></button>`;
  return h||'<div class="eh">موردی پیدا نشد</div>'}
ACT.bzPick=d=>{bzItRead();const i=+d.i;sheet(`<div class="sh-h"><div><b>نوع قلم</b><small class="shsub">طلا، سکه، ارز یا سایر — جستجو کنید یا انتخاب کنید</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="fsearch bzpkq">${ic('search')}<input id="bzPkQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="جستجو: آبشده، ربع، دلار…"></div><div class="bzpkl" id="bzPkL">${bzPkList(i,'')}</div>`);
  const Q=$('bzPkQ'),Lh=$('bzPkL');if(Q){Q.oninput=()=>{Lh.innerHTML=bzPkList(i,Q.value)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const b=Lh.querySelector('.bzpko');if(b)b.click()}}}};
ACT.bzPkSel=d=>{const x=bz.d.items[+d.i];if(!x)return;if(x.k!==d.k&&!BZK[d.k].q){x.q='';x.r=0}x.k=d.k;x.t=d.t||'';if(d.k==='سایر'){if(d.n)x.n=d.n}else delete x.n;closeSheet();const y=$('view').scrollTop;render();$('view').scrollTop=y;
  const el=document.querySelector(`#bzIt .bzit[data-i="${d.i}"] [data-f=${BZK[d.k].q?'q':d.k==='سایر'&&!x.n?'n':'amt'}]`);if(el)setTimeout(()=>el.focus(),260)};
ACT.bzItK=d=>{bzItRead();const x=bz.d.items[+d.i];if(!x)return;if(x.k!==d.k)x.t=(BZK[d.k]&&BZK[d.k].t&&d.k==='سکه')?'تمام امامی':'';x.k=d.k;if(!BZK[d.k].q){x.q='';x.r=0}const y=$('view').scrollTop;render();$('view').scrollTop=y};
ACT.buyNew=()=>{closeSheet();bz={step:1,d:{pay:payDef()},msg:''};go('buy')};
function bzRead(){if(cur!=='buy')return;const g=id=>{const el=$(id);return el?el.value:undefined},d=bz.d;
  if(bz.step===1){d.name=g('bzN');d.phone=g('bzP');d.nid=g('bzM');d.code=g('bzC');if(d.pk&&nzName(d.name)!==d.pk)['cuId','pk','prevIban','iban','card','holder'].forEach(k=>delete d[k])}
  if(bz.step===2){bzItRead()}
  if(bz.step===3){d.iban=g('bzI');d.card=g('bzK');d.holder=g('bzH')}
  Object.keys(d).forEach(k=>{if(d[k]===undefined)delete d[k]})}
/* v63.7 (خواسته صاحب اپ): نام صاحب حساب — با لمس کادر کل نام انتخاب می‌شود (تایپ = جایگزینی) و دکمه «تایید» داخل کادر:
   اگر صاحب حساب همان نام پیشنهادی است، با یک لمس تایید و کیبورد بسته می‌شود */
ACT.hOk=d=>{const el=$(d.f);if(!el)return;el.value=clean(el.value);if(d.f==='bzH'&&typeof bz!=='undefined'&&bz&&bz.d)bz.d.holder=el.value;el.blur();const h=$(d.f+'v');if(h){h.textContent=el.value?'صاحب حساب تایید شد ✓':'';h.className='eh'+(el.value?' ok':'')}const w=el.closest('.eok');if(w){w.classList.remove('okd');void w.offsetWidth;w.classList.add('okd')}};
document.addEventListener('focusin',e=>{const t=e.target;if(!t||!t.dataset||t.dataset.selall!=='1'||!t.value)return;const s=()=>{try{t.setSelectionRange(0,t.value.length)}catch(_){t.select()}};setTimeout(s,0);setTimeout(s,120)});
/* v64.2 (خواسته صاحب اپ): با ویرایش نامِ تاییدشده، پیام «تایید شد» هم پاک می‌شود تا دوباره تایید شود */
document.addEventListener('input',e=>{const t=e.target,w=t&&t.closest&&t.closest('.eok');if(!w)return;w.classList.remove('okd');const h=t.id&&$(t.id+'v');if(h&&/\bok\b/.test(h.className)&&!t.dataset.go){h.textContent='';h.className='eh'}});
const bzF=(id,label,val,o={})=>`<div class="ef"><label for="${id}">${label}${o.opt?' <i>(اختیاری)</i>':''}</label>${o.pre?`<div class="eib2"><span>${o.pre}</span>`:''}${o.ok||o.go?'<div class="eok">':''}<input id="${id}"${o.ltr?' class="ltr"':''} ${o.im?`inputmode="${o.im}"`:''} value="${esc(val||'')}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="${o.last?'done':'next'}"${o.sug?` aria-autocomplete="list" aria-controls="${id}s"`:''}${o.ok?' data-selall="1"':''}>${o.ok?`<button type="button" class="eokb" data-act="hOk" data-f="${id}" aria-label="تایید همین نام">${ic('check')}<span>تایید</span></button></div>`:o.go?`<button type="button" class="eokb" data-act="bzNext" aria-label="تایید و رفتن به مرحله بعد">${ic('check')}<span>تایید</span></button></div>`:''}${o.pre?'</div>':''}${o.sug?`<div class="bzsug hide" id="${id}s" role="listbox"></div>`:''}<small class="eh" id="${id}v"></small></div>`;
function vBuy(){const d=bz.d,st=bz.step,T=['اطلاعات مشتری','وزن و مبلغ','حساب و تاریخ واریز'];
  let h=`<div class="bzp">${[1,2,3].map(i=>`<i class="${i<st?'done':i===st?'on':''}"></i>`).join('')}</div><div class="bzh"><small>مرحله ${toFa(st)} از ۳</small><b>${T[st-1]}</b></div>`;
  if(bz.msg)h+=`<div class="bzok">${ic('check')}<span>${bz.msg}</span></div>`;
  if(st===1)h+=bzF('bzN','نام و نام خانوادگی',d.name,{ph:'نام و نام خانوادگی',sug:1,go:1})+bzF('bzP','شماره تماس',d.phone,{ltr:1,im:'tel',ph:'09xxxxxxxxx',opt:1,sug:1})+bzF('bzM','کد ملی',d.nid,{ltr:1,im:'numeric',ph:'۱۰ رقم',opt:1,sug:1})+bzF('bzC','شماره فاکتور',d.code,{ltr:1,im:'numeric',last:1});
  if(st===2){bzItems();h+=`<div id="bzIt">${bzItemsHTML()}</div><button class="addit" data-act="bzAddIt">${ic('plus')} افزودن قلم دیگر <small>(سکه، دلار، طلای دیگر…)</small></button><div id="bzS"></div><div id="bzStl">${bzStlHTML()}</div>`}/* v61.74 (خواسته صاحب اپ): تسویه از مشتری در صفحه «وزن و مبلغ»، آخر صفحه */
  if(st===3){h+=`<div class="ef"><label for="bzI">شماره شبا</label><div class="ibin"><input id="bzI" inputmode="numeric" value="${esc(d.iban||'')}" placeholder="شماره شبا (۲۴ رقم)" autocomplete="off" enterkeyhint="next"><span class="ibir">IR</span><span class="ibbk" id="bzIb"></span></div><small class="eh" id="bzIv"></small>${d.prevIban?`<button class="bzni" data-act="bzNewIban">${ic('edit')} شبای جدید وارد می‌کنم</button>`:''}</div>`+bzF('bzK','شماره کارت',d.card,{ltr:1,im:'numeric',ph:'۱۶ رقم',opt:1})+bzF('bzH','نام صاحب حساب',d.holder!=null?d.holder:clean(d.name||''),{last:1,ok:1})
    +`<div class="ef"><label>تاریخ واریز</label><button class="bzdate" data-act="bzCal">${ic('cal')}<span><b>${esc(payLab(d.pay))}</b><small>${esc(dates(d.pay).wd+' '+dates(d.pay).fa)}</small></span>${ic('chev')}</button></div>`
    +`<div class="bzrev"><div><small>مشتری</small><b>${esc(clean(d.name||'')||'—')}</b></div><div><small>مبلغ</small><b>${fmt(num(d.amount||0))} <i>تومان</i></b></div>${bzStlSum()?`<div><small>تسویه از مشتری</small><b>${fmt(bzStlSum())} <i>تومان</i></b></div><div><small>مانده واریز بانکی</small><b>${fmt(Math.max(0,num(d.amount||0)-bzStlSum()))} <i>تومان</i></b></div>`:''}${d.weight?`<div><small>وزن طلا</small><b>${esc(toFa(d.weight))} <i>گرم</i></b></div>`:''}${(d.items||[]).filter(x=>x.k!=='طلا'&&x.amt).map(x=>`<div><small>${esc(x.k+(x.t?' '+x.t:''))}</small><b>${x.q?esc(toFa(x.q))+' '+((BZK[x.k]||{}).u||'')+' · ':''}${fmt(x.amt)}</b></div>`).join('')}${ppgOf(bzGoldAmt(),d.weight)?`<div><small>هر گرم تمام‌شده</small><b>${fmt(ppgOf(bzGoldAmt(),d.weight))} <i>تومان</i></b></div>`:''}${d.code?`<div><small>فاکتور</small><b>${esc(toEn(d.code))}</b></div>`:''}</div>`}
  return `<div class="bzw">${h}</div>`}
const aBuy=()=>`<button class="btn gold bzgo" data-act="bzNext">${bz.step<3?'تأیید و ادامه':ic('check')+' ثبت واریزی'}</button>`;
function bindBuy(){const st=bz.step,hint=(id,t,c)=>{const o=$(id+'v');if(o){o.textContent=t;o.className='eh'+(c?' '+c:'')}};
  const ids={1:['bzN','bzP','bzM','bzC'],2:[],3:['bzI','bzK','bzH']}[st];
  ids.forEach((id,i)=>{const el=$(id);if(!el)return;el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(i<ids.length-1)$(ids[i+1]).focus();else ACT.bzNext()}})});
  if(st===1){const P=$('bzP'),M=$('bzM'),C=$('bzC');
    P.oninput=()=>{const v=toEn(P.value).replace(/\D/g,'').slice(0,11);P.value=v;hint('bzP',!v?'':v.length<11?toFa(v.length)+' از ۱۱ رقم':phoneMsg(v)[0],v.length===11?(phoneOk(v)?'ok':'bad'):'')};
    M.oninput=()=>{const v=toEn(M.value).replace(/\D/g,'').slice(0,10);M.value=v;hint('bzM',!v?'':v.length<10?toFa(v.length)+' از ۱۰ رقم':nidOk(v)?'کد ملی معتبر است':'کد ملی معتبر نیست',v.length===10?(nidOk(v)?'ok':'bad'):'')};
    C.oninput=()=>{C.value=toEn(C.value).replace(/[^0-9A-Za-z\-\/]/g,'');const c=C.value.trim(),dup=c&&entries.some(e=>e.entryDate===todayISO()&&toEn(e.code||'')===c);hint('bzC',dup?'این شماره فاکتور امروز قبلاً ثبت شده':'',dup?'bad':'')};
    [P,M,C].forEach(el=>{if(el.value)el.oninput()});bzSugBind()}
  if(st===2)bzItBind();
  if(st===3){const I=$('bzI'),K=$('bzK');
    I.oninput=()=>{const v=dg(I.value).slice(0,24);I.value=ibanGroups(v);const bb=$('bzIb'),b5=v.length>=5?BANKS[v.slice(2,5)]||'':'';if(bb)bb.innerHTML=b5?bankBadge(b5,'lg')+'<span>'+esc(b5)+'</span>':'';if(!v){hint('bzI','اگر شبا را ندارید خالی بگذارید؛ واریزی خطادار علامت می‌خورد');return}if(v.length<24){hint('bzI',toFa(v.length)+' از ۲۴ رقم');return}if(!ibanOk('IR'+v)){hint('bzI','شماره شبا اشتباه است','bad');return}const pv=dg(bz.d.prevIban||'');if(pv&&pv===v){hint('bzI','همان شبای ثبت قبلی این مشتری است · اگر عوض شده، شبای جدید را بنویسید','ok');return}if(pv){hint('bzI','شبای جدید — با شبای ثبت قبلی این مشتری فرق دارد','warn');return}hint('bzI','شماره شبا معتبر است','ok')};
    K.oninput=()=>{const v=dg(K.value).slice(0,16);K.value=grp4(v);hint('bzK',!v?'':v.length<16?toFa(v.length)+' از ۱۶ رقم':luhn(v)?'معتبر':'رقم کنترلی نمی‌خواند',v.length===16?(luhn(v)?'ok':'bad'):'')};
    I.oninput();if(K.value)K.oninput()}
  const first=ids.map(id=>$(id)).find(el=>el&&!el.value);if(first)setTimeout(()=>{if(cur==='buy'&&$('ov').classList.contains('hide')&&document.body.contains(first))first.focus()},380)}
/* v64.2 (خواسته صاحب اپ): در مرحله ۱ وقتی کیبورد باز است دکمه پایین روی پیشنهادها نمی‌افتد؛ «تایید» داخل کادر نام کار آن را می‌کند */
document.addEventListener('focusin',e=>{const t=e.target;document.body.classList.toggle('bzkb',!!(t&&t.matches&&t.matches('#view input')&&cur==='buy'&&typeof bz!=='undefined'&&bz&&bz.step===1))});
document.addEventListener('focusout',()=>setTimeout(()=>{const a=document.activeElement;if(!(a&&a.matches&&a.matches('#view input')))document.body.classList.remove('bzkb')},60));
ACT.bzNext=async()=>{bzRead();const d=bz.d;
  if(bz.step===1){if(!clean(d.name||'')){toast('نام مشتری را وارد کنید',true);$('bzN').focus();return}const ph=toEn(d.phone||'');if(ph&&!phoneOk(ph)){toast('شماره تماس درست نیست',true);$('bzP').focus();return}const n=toEn(d.nid||'');if(n&&!nidOk(n)){toast('کد ملی معتبر نیست',true);$('bzM').focus();return}bz.step=2;bz.msg='';render();return}
  if(bz.step===2){if(!num(d.amount||0)){toast('مبلغ را وارد کنید',true);const a=document.querySelector('#bzIt [data-f=amt]');if(a)a.focus();return}if(bzStlSum()>num(d.amount)){toast('جمع تسویه از مشتری از مبلغ بیشتر است؛ تسویه یا مبلغ را درست کنید',true);return}bz.step=3;bz.msg='';render();return}
  const dI=dg(d.iban||'').slice(0,24);
  const card=dg(d.card||'').slice(0,16),now=new Date().toISOString(),iban=dI?'IR'+dI:'',name=stripName(d.name),holder=clean(d.holder||'');
  if(dateVal!==todayISO()){dateVal=todayISO();ls.set('m_date',dateVal)}
  if(bzStlSum()>num(d.amount)){toast('جمع تسویه‌ها از مبلغ این واریزی بیشتر است',true);return}
  if(bz.saving)return;bz.saving=true;let S=[];try{S=await bzStlMake()}finally{bz.saving=false}/* v65.0: تسویه‌ها = سند دریافت هر پرداخت‌کننده (depLink بعد از ثبت) */
  const ne={id:nid++,name,title:'',phone:toEn(d.phone||''),nid:toEn(d.nid||''),code:toEn(d.code||'').trim(),weight:toEn(d.weight||''),amount:num(d.amount),ppg:ppgOf(bzGoldAmt(),d.weight),items:(d.items||[]).filter(x=>x.amt).map(x=>({...x})),iban,card,bank:'',holder:holder&&holder!==name?holder:'',payDate:d.pay||payDef(),kind:'buy',settles:[],entryDate:todayISO(),createdBy:who(),updatedBy:who(),updatedAt:now};
  entries.push(ne);saveE();alloc=null;depLink(ne,{cuId:d.cuId,settles:S.map(z=>({...z,st:'wait'}))});logA('add','ثبت واریزی (خرید)',name+' | '+fmt(ne.amount)+' تومان | واریز '+dates(ne.payDate).fa+(S.length?' | تسویه از مشتری '+fmt(bzStlSum(S))+' تومان':''),{ids:[ne.id],after:pick(ne)});
  const rest=ne.amount-bzStlSum(S),bad=rest>0&&(!iban||!ibanOk(iban)),why=!iban?'شبا ندارد':'شبا اشتباه است';bz={step:1,d:{pay:payDef()},msg:`«${esc(name)}» ثبت شد — ${fmt(ne.amount)} تومان، واریز ${esc(payLab(ne.payDate))}${bad?' <em>('+why+'؛ در لیست خطادار علامت خورد)</em>':''}`};
  render();$('view').scrollTop=0;toast(bad?'ثبت شد، اما '+why+' (خطادار)':'ثبت شد ✓ — ثبت بعدی',bad)};
ACT.bzCal=()=>{bzRead();openCal(bz.d.pay||todayISO(),iso=>{bz.d.pay=iso;render()})};

/* ---------- خرید طلا: پیشنهاد مشتری زیر فیلد نام (از حساب‌های مشتری و نام‌های ثبت‌شده قبلی) ---------- */
const nzName=s=>clean(String(s||'')).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/\u200c/g,' ').toLowerCase();
/* v60.6: جستجوی مشترک افراد (صفحه مشتریان، تسویه از مشتری، …): همه مشخصات حساب + افراد واریزی/خرید بدون حساب */
const pDig=q0=>{const qd=toEn(q0||'').replace(/\D/g,'');return v=>qd.length>=3&&toEn(String(v||'')).replace(/\D/g,'').includes(qd)};
const cuHay=c=>Object.keys(c).filter(k=>typeof c[k]==='string'&&!/^(id|sys|createdAt|lastAt|updatedAt|by|createdBy|updatedBy)$/.test(k)).map(k=>c[k]).join(' ');
const cuHit=(c,q,dOk)=>{const h=cuHay(c);return nzName(h).includes(q)||dOk(h)};
function memPeople(q,dOk,n){const A=CU();return bzPeople().filter(p=>!p.cuId&&!A.some(c=>nzName(c.name)===p.k)&&(p.k.includes(q)||nzName(p.holder||'').includes(q)||dOk([p.phone,p.nid,p.iban,p.card].join(' ')))).sort((a,b)=>(b.k.startsWith(q)-a.k.startsWith(q))||String(b.last).localeCompare(String(a.last))).slice(0,n)}
function bzPeople(){const M=new Map(),add=(name,o)=>{const k=nzName(name);if(!k)return;const p=M.get(k)||{name:clean(name),k,n:0,last:'',phone:'',nid:'',cuId:'',iban:'',card:'',holder:''};
    if(o.phone&&!p.phone)p.phone=o.phone;if(o.iban&&!p.iban){p.iban=o.iban;p.card=o.card||'';p.holder=o.holder||''}if(o.nid&&!p.nid)p.nid=o.nid;if(o.cuId&&!p.cuId)p.cuId=o.cuId;if(o.n)p.n+=o.n;if(o.last&&o.last>p.last)p.last=o.last;M.set(k,p)};
  /* v61.93: تلفن و کد ملی از خود حساب مشتری اول (کد ملی حساب قبلاً جا می‌ماند)؛ بعد واریزی‌ها؛ شبای حساب اگر واریزی شبا نداشت */
  CU().forEach(c=>add(cuName(c),{phone:toEn(c.phone||''),nid:toEn(c.nid||''),cuId:c.id,last:String(c.lastAt||'').slice(0,10)}));
  entries.slice().sort((a,b)=>String(b.entryDate||'').localeCompare(String(a.entryDate||''))).forEach(e=>add(e.name,{phone:toEn(e.phone||''),nid:toEn(e.nid||''),iban:e.iban||'',card:e.card||'',holder:clean(e.holder||'')||clean(e.name||''),n:1,last:e.entryDate||''}));
  CU().forEach(c=>{if(c.bk&&c.bk.iban)add(cuName(c),{iban:c.bk.iban,card:c.bk.card||'',holder:c.bk.holder||''})});
  return [...M.values()]}
function bzSugHTML(q){const nq=nzName(q),qd=toEn(q).replace(/\D/g,'');if(!nq)return '';
  const L=bzPeople().filter(p=>p.k.includes(nq)||(qd.length>=3&&(p.phone.includes(qd)||p.nid.includes(qd))))
    .sort((a,b)=>(b.k.startsWith(nq)-a.k.startsWith(nq))||(b.n-a.n)||String(b.last).localeCompare(String(a.last))).slice(0,6);
  const exact=L.some(p=>p.k===nq);
  return L.map((p,i)=>`<button type="button" class="bzsr" role="option" data-i="${i}" data-k="${esc(p.k)}"><span class="av">${esc(userInit(p.name))}</span><span class="tx"><b>${esc(p.name)}</b><small>${[p.cuId?'حساب مشتری':'',p.n?toFa(p.n)+' بار ثبت شده':'',p.phone?'<span class="ltr">'+esc(toFa(p.phone))+'</span>':'',p.nid?'کد ملی <span class="ltr">'+esc(toFa(p.nid))+'</span>':''].filter(Boolean).join(' · ')||'مشتری'}</small></span></button>`).join('')
    +(exact?'':`<button type="button" class="bzsr nw" data-k=""><span class="av">${ic('plus')}</span><span class="tx"><b>مشتری جدید: «${esc(clean(q))}»</b><small>با همین نام ثبت می‌شود</small></span></button>`)}
/* v61.93 (خواسته صاحب اپ): پیشنهاد مشتری از هر سه فیلد نام، تلفن و کد ملی؛ انتخاب = پر شدن خودکار همه (تلفن، کد ملی، حساب بانکی قبلی) */
function bzSugBind(){[['bzN','n'],['bzP','p'],['bzM','m']].forEach(([id,by])=>{const N=$(id),B=$(id+'s');if(!N||!B)return;
  const hide=()=>{B.classList.add('hide');B.innerHTML='';N.setAttribute('aria-expanded','false')};
  const show=()=>{const h=by==='n'?bzSugHTML(N.value):bzSugD(N.value,by);if(!h||document.activeElement!==N){hide();return}B.innerHTML=h;B.classList.remove('hide');N.setAttribute('aria-expanded','true')};
  N.addEventListener('input',()=>{clearTimeout(N._t);N._t=setTimeout(show,90)});N.addEventListener('focus',show);
  N.addEventListener('blur',()=>setTimeout(hide,150));N.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='Escape')hide()});
  B.onpointerdown=e=>{if(e.target.closest('.bzsr'))e.preventDefault()};
  B.onclick=e=>{const r=e.target.closest('.bzsr');if(!r)return;const p=r.dataset.k?bzPeople().find(z=>z.k===r.dataset.k):null;hide();
    if(p){const NN=$('bzN'),P=$('bzP'),M=$('bzM');NN.value=p.name;if(P&&p.phone){P.value=p.phone;P.oninput&&P.oninput()}if(M&&p.nid){M.value=p.nid;M.oninput&&M.oninput()}
      /* اطلاعات حساب از آخرین ثبت همین مشتری؛ کالا خالی می‌ماند. شبا در مرحله ۳ قابل تغییر است */
      Object.assign(bz.d,{cuId:p.cuId||'',pk:p.k,prevIban:p.iban,iban:p.iban,card:p.card,holder:p.holder});if(!p.iban){delete bz.d.iban;delete bz.d.holder;delete bz.d.prevIban}
      [NN,P,M].forEach(el=>{if(el&&el.value&&!RM()&&el.animate)el.animate([{backgroundColor:'color-mix(in srgb,#2152d9 14%,transparent)'},{backgroundColor:'transparent'}],{duration:700,easing:'ease-out'})});
      toast(p.iban?'اطلاعات «'+p.name+'» از ثبت قبلی پر شد':'«'+p.name+'» انتخاب شد')}
    else{['cuId','pk','prevIban','iban','card','holder'].forEach(k=>delete bz.d[k])}
    const nx=[$('bzP'),$('bzM'),$('bzC')].find(el=>el&&!el.value)||$('bzC');if(nx)nx.focus()}})}
/* پیشنهاد از روی شماره تماس یا کد ملی (از ۳ رقم) */
function bzSugD(v,by){const qd=toEn(v||'').replace(/\D/g,'');if(qd.length<3)return '';const L=bzPeople().filter(p=>(by==='p'?p.phone:p.nid).includes(qd)).sort((a,b)=>(b.n-a.n)||String(b.last).localeCompare(String(a.last))).slice(0,6);
  return L.map(p=>`<button type="button" class="bzsr" role="option" data-k="${esc(p.k)}"><span class="av">${esc(userInit(p.name))}</span><span class="tx"><b>${esc(p.name)}</b><small>${[p.cuId?'حساب مشتری':'',p.phone?'<span class="ltr">'+esc(toFa(p.phone))+'</span>':'',p.nid?'کد ملی <span class="ltr">'+esc(toFa(p.nid))+'</span>':''].filter(Boolean).join(' · ')}</small></span></button>`).join('')}
/* ---------- خرید طلا: تسویه از مشتری همان موقع ثبت (همان پنجره صفحه جزئیات؛ با ثبت واریزی ذخیره می‌شود) ---------- */
const bzStlSum=S=>(S||bz.d.settles||[]).reduce((a,z)=>a+(+z.amount||0),0);
function bzStlHTML(){const S=bz.d.settles||[],tot=num(bz.d.amount||0),rest=Math.max(0,tot-bzStlSum());
  return `<div class="ef bzstl"><label>تسویه از مشتری <i>(اختیاری)</i></label>${S.length?`<div class="stll2">${S.map((z,i)=>`<div class="stlrw w"><button class="stlr" data-act="bzStlOpen" data-i="${i}"><span class="bri">${ic('user')}</span><span class="tx"><b>${esc(z.name)}</b><small>${['در انتظار تأیید',z.inv?'فاکتور '+esc(z.inv):'',z.tn?'پیگیری '+esc(z.tn):'',z.imgD?'رسید دارد':''].filter(Boolean).join(' · ')}</small></span><span class="brv"><b>${fmt(z.amount)} <i>تومان</i></b></span></button><button class="stlc" data-act="bzStlDel" data-i="${i}" aria-label="حذف این تسویه">${ic('x')}</button></div>`).join('')}</div>`:''}
  ${!tot&&!S.length?'<div class="eh">بعد از نوشتن مبلغ، اگر مشتری دیگری مستقیم پرداخت کرده اینجا ثبت کنید</div>':rest>0?`<button class="addit" data-act="bzStlNew">${ic('plus')} ${S.length?'تسویه دیگر':'ثبت تسویه از مشتری'} <small>(مشتری دیگری مستقیم به این شخص پرداخت کرده)</small></button>`:`<div class="eh ok">کل مبلغ با تسویه از مشتری پرداخت می‌شود</div>`}</div>`}
const bzStlRe=()=>{const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.bzStlNew=()=>{bzRead();pxOpen(true)};
ACT.bzStlOpen=d=>{bzRead();const z=(bz.d.settles||[])[+d.i];if(!z)return;stl={...z,bz:1,i:+d.i,q:z.cuId?'':z.name,newName:!z.cuId&&!!z.name};sheet(stlHTML());stlBind()};
ACT.bzStlDel=d=>{bzRead();(bz.d.settles||[]).splice(+d.i,1);bzStlRe()};
ACT.bzStlSave=()=>{stlRead();const name=clean(stl.name||stl.q||'');if(!name){toast('پرداخت‌کننده را انتخاب یا نامش را بنویسید',true);return}const a=+stl.amount||0;if(!a){toast('مبلغ را وارد کنید',true);return}
  const S=bz.d.settles=(bz.d.settles||[]).slice(),others=S.filter((z,i)=>i!==stl.i).reduce((s,z)=>s+(+z.amount||0),0);if(others+a>num(bz.d.amount||0)){toast('جمع تسویه‌ها از مبلغ این واریزی بیشتر می‌شود',true);return}
  const z={name,phone:stl.phone||'',inv:stl.inv||'',amount:a,tn:stl.tn||'',note:stl.note||'',cuId:stl.cuId||'',imgD:stl.imgD||''};
  if(stl.i!=null)S[stl.i]=z;else S.push(z);stl=null;closeSheet();bzStlRe();toast('تسویه اضافه شد · با ثبت واریزی ذخیره می‌شود')};
/* هنگام ثبت واریزی: تسویه‌ها با وضعیت «در انتظار تأیید» ساخته می‌شوند، مثل ثبت از صفحه جزئیات */
async function bzStlMake(){const now=new Date().toISOString(),R=[];for(const s of (bz.d.settles||[])){const z={st:'wait',id:nid++,name:s.name,phone:s.phone,inv:s.inv,amount:s.amount,tn:s.tn,note:s.note,cuId:s.cuId,date:todayISO(),at:now,by:who()};
    if(s.imgD){const k=newImgKey('stl:'+z.id);if(await imgPut(k,s.imgD)){z.imgs=[k];z.img=k}else toast('حافظه پر است؛ عکس رسید ذخیره نشد',true)}R.push(z)}return R}
ACT.bzNewIban=()=>{bzRead();bz.d.iban='';bz.d.card='';const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;const I=$('bzI');if(I)I.focus()};

/* ============ v61.69 (خواسته صاحب اپ): عکس پروفایل مشتری و عکس کارت ملی ============
   در فرم مشخصات: دایره عکس بالای فرم (زدن = انتخاب یا گرفتن عکس، آیفون خودش «Take Photo» دارد؛ اندروید دکمه دوربین جدا)،
   و بخش «عکس کارت ملی» با دو خانه روی/پشت کارت. عکس‌ها مثل رسیدها کوچک و در IndexedDB + سرور (/api/img) ذخیره می‌شوند؛
   کلیدشان روی حساب مشتری (c.av، c.idImgs) با ذخیره فرم می‌نشیند. آواتار عکس‌دار همه‌جا (فهرست، سرتیتر، سند) نشان داده می‌شود. */
let CUF={av:'',ids:[]};
const cuAvH=c=>`<span class="c6a${c&&c.av?' cav':''}">${c&&c.av?`<img data-ik="${esc(c.av)}" alt="">`:''}${esc(userInit(c?c.name:''))}</span>`;
function cuPhHTML(c){const n=clean(c.name||'');return `<div class="cufp"><label class="cuav${CUF.av?' on':''}" aria-label="عکس پروفایل"><span class="cuavi">${CUF.av?`<img data-ik="${esc(CUF.av)}" alt="">`:`<b>${esc(userInit(n||'؟'))}</b>`}</span><span class="cuavb">${ic('cam')}</span><input type="file" accept="image/*" data-cuph="av" class="fcov" aria-label="عکس پروفایل"></label>
  <div class="cufpt"><b>عکس پروفایل</b><small>${CUF.av?'برای عوض کردن روی عکس بزنید':'روی دایره بزنید: گالری یا دوربین'}</small><span class="cufpa">${picCam()?`<label class="cufb">${ic('cam')}<span>دوربین</span><input type="file" accept="image/*" capture="user" data-cuph="av" class="fcov" aria-label="دوربین"></label>`:''}${CUF.av?`<button type="button" class="cufb rd" data-act="cuPhDel" data-k="av">${ic('trash')}<span>حذف</span></button>`:''}</span></div></div>`}
function cuIdHTML(){return ['روی کارت','پشت کارت'].map((t,i)=>{const k=CUF.ids[i];return `<div class="cuids${k?' on':''}"><label class="cuidp" aria-label="${t}">${k?`<img data-ik="${esc(k)}" alt="">`:`<span class="cuide">${ic('plus')}<b>${t}</b><small>گالری یا دوربین</small></span>`}<input type="file" accept="image/*" data-cuph="id${i}" class="fcov" aria-label="${t}"></label>
  <span class="cuidf"><small>${k?t:""}</small>${picCam()?`<label class="cufb">${ic('cam')}<input type="file" accept="image/*" capture="environment" data-cuph="id${i}" class="fcov" aria-label="دوربین ${t}"></label>`:''}${k?`<button type="button" class="cufb rd" data-act="cuPhDel" data-k="id${i}" aria-label="حذف ${t}">${ic('trash')}</button>`:''}</span></div>`}).join('')}
function cuPhRe(which){const W=$('sheet');if(!W)return;if(which==='av'){const o=W.querySelector('.cufp');if(o){o.outerHTML=cuPhHTML({name:($('cuN')&&$('cuN').value)||''})}}else{const B=$('cuIdBox');if(B)B.innerHTML=cuIdHTML()}
  phPaint(W);const el=which==='av'?W.querySelector('.cuav'):W.querySelector('#cuIdBox');if(el&&!RM()&&el.animate)el.animate([{transform:'scale(.92)',opacity:.4},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.9,.25,1)'})}
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.dataset||t.dataset.cuph==null)return;const w=t.dataset.cuph,f=t.files&&t.files[0];t.value='';if(!f)return;
  try{const d=await shrink(f),k=newImgKey(w==='av'?'cuav':'cuid');if(!(await imgPut(k,d))){toast('حافظه پر است؛ عکس ذخیره نشد',true);return}
    if(w==='av')CUF.av=k;else CUF.ids[+w.slice(2)]=k;cuPhRe(w==='av'?'av':'id');toast(w==='av'?'عکس پروفایل گذاشته شد · ذخیره را بزنید':'عکس کارت ملی اضافه شد · ذخیره را بزنید')}catch(e){toast('این عکس خوانده نشد',true)}});
/* v61.98 (خواسته صاحب اپ): عکس کارت ملی و پروفایل با «اولین» لمس باز شود — روی آیفون لمس اول گاهی فقط کیبورد را می‌بست یا گم می‌شد.
   خود لمس (touchend، که اجازه باز کردن انتخاب عکس را دارد) فیلد فایل را باز می‌کند و کلیک مصنوعی بعدی گرفته می‌شود تا دو بار باز نشود */
/* v62.3: علت واقعی «دو بار زدن» (ویدئوی صاحب اپ): وقتی کیبورد باز است، لمس اول کیبورد را می‌بندد و آیفون با جابه‌جا شدن صفحه
   منوی «Photo Library / Take Photo» را همان لحظه می‌بندد. حالا با شروع لمس کیبورد بسته می‌شود و منو بعد از آرام شدن صفحه باز می‌شود؛
   اگر کیبورد بسته بود، همان لحظه باز می‌شود. */
(()=>{let st=null;const SEL='.cuidp,.cuav,.cufb',txt=a=>a&&/^(INPUT|TEXTAREA)$/.test(a.tagName)&&a.type!=='file';
  document.addEventListener('touchstart',e=>{const l=e.target.closest&&e.target.closest(SEL);if(!(l&&l.querySelector('input[data-cuph]')&&e.touches.length===1)){st=null;return}
    const a=document.activeElement,kb=txt(a);st={l,x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now(),kb};if(kb)a.blur()},{passive:true,capture:true});
  document.addEventListener('touchmove',e=>{if(st&&(Math.abs(e.touches[0].clientX-st.x)>10||Math.abs(e.touches[0].clientY-st.y)>10))st=null},{passive:true,capture:true});
  document.addEventListener('touchend',e=>{const o=st;st=null;if(!o||Date.now()-o.t>1200)return;const i=o.l.querySelector('input[data-cuph]');if(!i)return;e.preventDefault();
    if(!o.kb){try{i.click()}catch(_){}return}
    const V=window.visualViewport;let h=V?V.height:innerHeight,n=0;const tick=()=>{const h2=V?V.height:innerHeight;n++;if((Math.abs(h2-h)<1&&n>3)||n>22){try{i.click()}catch(_){}return}h=h2;setTimeout(tick,30)};setTimeout(tick,60)},{passive:false,capture:true})})();
ACT.cuPhDel=d=>{if(d.k==='av'){CUF.av='';cuPhRe('av')}else{CUF.ids[+String(d.k).slice(2)]='';cuPhRe('id')}};
