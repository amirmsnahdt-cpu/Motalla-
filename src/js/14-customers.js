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
const bindCust=()=>{if(cuCntId===custId)return;cuCntId=custId;requestAnimationFrame(()=>cuCount('.cp7b.anim .cbn'))};
const cbCell=(k,v,i)=>`<span class="cbk k${k==='r'?'r':k==='g'?'g':'x'} ${v<0?'d':v>0?'c':'z'}" style="--i:${i}"><span class="cbh"><small>${k==='r'?'مبلغ':k==='g'?'طلا':esc((XA[k]||{t:k}).t)} <i>${esc(balU(k))}</i></small>${v?`<em>${ourLab(v)}</em>`:''}</span><b><span class="cbn" data-k="${k}" data-v="${Math.abs(v)}">${v?balV(k,v):'۰'}</span></b></span>`;
function balPills(b){const X=Object.keys(b.X||{}).filter(k=>b.X[k]);if(!b.R&&!b.G&&!X.length)return `<span class="cbz"><span class="cbzi">${ic('check')}</span><span class="cbzt"><b>حساب تسویه است</b><small>مبلغ و طلا صفر</small></span><em>تسویه</em></span>`;
  const L=[['g',b.G],['r',b.R],...X.map(k=>[k,b.X[k]])];let i=0;return L.map(([k,v])=>cbCell(k,v,i++)).join('')}
/* v61.52 (خواسته صاحب اپ: ردیف‌ها خیلی جا می‌گیرند): مانده در ردیف فهرست = ستون باریک سمت چپ؛ هر جنس یک خط:
   برچسب جهت (طلبکاریم/بدهکاریم) کوچک + عدد پررنگ + واحد؛ صفرها نمی‌آیند؛ همه صفر = «تسویه» کم‌رنگ */
const cbLine=(k,v,i)=>`<span class="cl7 ${v<0?'d':'c'} k${k==='r'?'r':k==='g'?'g':'x'}" style="--i:${i}"><em>${ourLab(v)}</em><b><span class="cbn" data-k="${k}" data-v="${Math.abs(v)}">${balV(k,v)}</span></b><i>${k==='r'?'ت':k==='g'?'گ':esc(balU(k))}</i></span>`;
function balTrail(b){const L=[['r',b.R],['g',b.G],...Object.keys(b.X||{}).map(k=>[k,b.X[k]])].filter(z=>+z[1]);
  if(!L.length)return `<span class="cl7z">${ic('check')}تسویه</span>`;return L.map((z,i)=>cbLine(z[0],+z[1],i)).join('')}
/* شمارش عددها از صفر هنگام باز شدن صفحه (یک بار) */
function cuCount(sel){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const E=[...document.querySelectorAll(sel||'#cures .c6l.anim .cbn')].filter(e=>+e.dataset.v&&e.getBoundingClientRect().top<innerHeight);if(!E.length)return;
  const t0=performance.now(),D=650,f=(k,v)=>k==='r'?fmt(Math.round(v)):k==='g'?wFmt(v):qFmt(Math.round(v*100)/100);
  const st=n=>{const q=Math.min(1,(n-t0)/D),e=1-Math.pow(1-q,3);for(const el of E)el.textContent=f(el.dataset.k,+el.dataset.v*e);if(q<1)requestAnimationFrame(st)};requestAnimationFrame(st)}
const curCu=()=>custs.find(c=>String(c.id)===String(custId))||null;
/* ---- فهرست حساب‌ها: فقط جستجو و فهرست؛ مشتری تازه از همین جستجو ---- */
function vCusts(){const L=CU();
  if(!L.length&&!cuQ)return `<div class="c6s">${cuSearchHTML(0)}</div><div class="spempty"><div class="spill">${ic('users')}</div><b>هنوز حسابی باز نشده</b><span>نام مشتری را در جستجو بنویسید؛ اگر حسابی نداشته باشد، اول مشخصاتش را می‌گیریم و بعد وارد حساب و سند او می‌شوید.</span></div>`;
  cuAnim=1;cuCntId=null;return `<div class="c6s">${cuSearchHTML(L.length)}</div><div id="cures">${cuListHTML()}</div>`}
const cuSearchHTML=n=>`<div class="fsearch c6q0">${ic('search')}<input id="cuq" type="search" placeholder="${n?'جستجو در '+fmt(n)+' حساب: نام، تلفن، کد ملی، گروه…':'نام مشتری…'}" value="${esc(cuQ)}" autocomplete="off" enterkeyhint="search">${cuQ?`<button class="x" data-act="cuQClr" aria-label="پاک کردن">×</button>`:''}</div>`;
function cuListHTML(){const q0=clean(cuQ||''),q=nzName(toEn(q0)),A=CU();let B=A.map(c=>[c,cuBal(c)]);
  /* v60.3: جستجو در همه مشخصات حساب (نام، تلفن، کد ملی، گروه، یادداشت، کارت، شبا…)؛ عدد با و بدون فاصله/صفر اول */
  const dOk=pDig(q0);
  if(q)B=B.filter(([c])=>cuHit(c,q,dOk));
  B.sort((a,b)=>(q?(nzName(b[0].name).startsWith(q)-nzName(a[0].name).startsWith(q)):0)||String(b[0].lastAt||b[0].createdAt||'').localeCompare(String(a[0].lastAt||a[0].createdAt||'')));
  const canAdd=q0&&can('debt')&&!/^\d+$/.test(toEn(q0))&&!A.some(c=>nzName(c.name)===nzName(q0))&&!groupsList().some(g=>nzName(g)===q);
  const add=canAdd?`<button class="c6add" data-act="cuNewQ">${ic('plus')}<span><b>حساب تازه برای «${esc(q0)}»</b><small>${B.length?'اگر هیچ‌کدام از این‌ها نیست':'این نام حسابی ندارد'} · اول مشخصات، بعد ورود به حساب</small></span></button>`:'';
  /* افراد واریزی‌ها و خریدها که هنوز حساب ندارند (از حافظه برنامه): با زدن، حساب با همان مشخصات باز می‌شود */
  const P=q?memPeople(q,dOk,12):[];
  CUP=P;
  const mem=P.length?`<div class="c6gh">از واریزی‌ها و خریدها · بدون حساب</div><div class="c6l c6mem">${P.map((p,i)=>`<button class="c6r" data-act="cuNewP" data-i="${i}"><span class="c6a m">${esc(userInit(p.name))}</span><span class="tx"><b>${esc(p.name)}</b><small>${[p.phone?'<bdi dir="ltr">'+esc(toFa(p.phone))+'</bdi>':'',p.nid?'کد ملی <bdi dir="ltr">'+esc(toFa(p.nid))+'</bdi>':'',p.n?fmt(p.n)+' واریزی':'',p.last?esc(dates(p.last).fa):''].filter(Boolean).join('، ')}</small></span><span class="c6go">${ic('plus')} حساب</span></button>`).join('')}</div>`:'';
  /* v61.33: شماره سند (فاکتور فروش، خرید و…) هم جستجو می‌شود؛ زدن = باز شدن همان سند */
  const IV=cuInvHits(q0),ivh=IV.length?`<div class="c6gh">سندها</div><div class="c6l c6iv">${IV.map(([c,t])=>{const d=txD(t);return `<button class="c6r" data-act="cuInv" data-cu="${c.id}" data-tx="${t.id}"><span class="c6a iv">${ic('inv')}</span><span class="tx"><b>${esc(invTitle(t))}</b><small>${esc(cuName(c))} · ${esc(dates(t.date).fa)}</small></span><span class="c6ivv${d.r<0?' d':d.r>0?' c':''}"><b>${fmt(Math.abs(+t.total||0))}</b><small>تومان</small></span></button>`}).join('')}</div>`:'';
  if(!B.length)return (ivh+mem+add)||`<div class="bempty">${ic('search')}<b>حسابی پیدا نشد</b></div>`;
  const G=q&&groupsList().find(g=>nzName(g)===q),an=cuAnim?' anim':'';cuAnim=0;
  return `${ivh}${G?`<div class="c6gh">گروه «${esc(G)}» · ${fmt(B.length)} حساب</div>`:''}<div class="c6l c6lb c7l${an}">${B.map(([c,b],ri)=>swW(`<button class="c6r c7r" data-act="cuOpen" data-id="${c.id}"><span class="c6a">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${[c.grp?'<em>'+esc(c.grp)+'</em>':'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span><span class="c7v" style="--r:${Math.min(ri,8)}">${balTrail(b)}</span></button>`,{r:[['cuEdit','ویرایش','edit','#3b6fd6']],l:[['cuDel','حذف','trash','#d23c48']],data:{id:c.id}})).join('')}</div>${mem}${add}`}
const cuName=c=>(c.name||'');
function cuInvHits(q0){const d=toEn(q0||'').replace(/[\s,،]/g,'');if(!/^\d{1,6}$/.test(d))return [];const R=[];
  for(const c of CU())for(const t of c.txs||[])if(t.type==='inv'&&!t.del&&t.no!=null&&String(t.no).startsWith(d))R.push([c,t]);
  return R.sort((a,b)=>(String(b[1].no)===d)-(String(a[1].no)===d)||(+b[1].no||0)-(+a[1].no||0)).slice(0,6)}
ACT.cuInv=d=>invOpen(d.cu,+d.tx||d.tx);
const aCusts=()=>'';/* افتتاح حساب از همان جستجو (نام را بنویسید → «حساب تازه») */
function bindCusts(){const q=$('cuq');if(!q)return;requestAnimationFrame(()=>cuCount());q.oninput=()=>{cuQ=q.value;clearTimeout(q._t);q._t=setTimeout(()=>{const r=$('cures');if(r)srchSwap(r,cuListHTML());else if(cuQ){const v=$('view');v.innerHTML=vCusts();bindCusts();const n=$('cuq');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}}},90)};
  q.onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const iv=cuInvHits(q.value);if(iv.length&&String(iv[0][1].no)===toEn(q.value).replace(/\D/g,'')){ACT.cuInv({cu:iv[0][0].id,tx:iv[0][1].id});return}const f=document.querySelector('#cures [data-act=cuOpen]');if(f)ACT.cuOpen({id:f.dataset.id});else if(clean(q.value))ACT.cuNewQ()}}
ACT.cuQClr=()=>{cuQ='';const m=flipSnap($('cures')),v=$('view');v.innerHTML=vCusts();bindCusts();flipPlay($('cures'),m)};
/* ---- صفحه یک مشتری ---- */
Object.assign(IC,{more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',tel:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'});
/* v61.52 (خواسته صاحب اپ): صفحه حساب مشتری جمع‌وجور — بالا پروفایل کوچک (نام، گروه، تلفن، کد ملی، دکمه ویرایش)،
   زیرش مانده‌ها در یک کارت (مبلغ و طلا کنار هم، سکه/ارز اگر هست)، «سند جدید» = دکمه + بالای صفحه سمت چپ،
   گردش حساب: ردیف‌های فشرده در گروه‌های هر روز (فهرست گروهی iOS) با مانده بعد از هر ردیف زیر مبلغ */
function vCust(){xaSync();const c=curCu();if(!c){setTimeout(()=>{if(cur==='cust')go('custs',true)},0);return ''}const b=cuBal(c),T=(c.txs||[]).filter(t=>!t.del).slice().sort((x,y)=>String(y.date+y.at).localeCompare(String(x.date+x.at)));
  const an=cuCntId!==custId?' anim':'';
  const cell=(k,v,i)=>`<div class="cp7c ${v<0?'d':v>0?'c':'z'}" style="--i:${i}"><small>${k==='r'?'مبلغ':k==='g'?'طلا':esc((XA[k]||{t:k}).t)}<i>${esc(balU(k))}</i></small><b><span class="cbn" data-k="${k}" data-v="${Math.abs(v)}">${v?balV(k,v):'۰'}</span></b><em>${ourLab(v)}</em></div>`;
  const X=Object.keys(b.X||{}).filter(k=>+b.X[k]),meta=[c.phone?`<a class="cp7t" href="tel:${esc(toEn(c.phone))}">${ic('tel')}<bdi dir="ltr">${esc(toFa(c.phone))}</bdi></a>`:'',c.nid?`<span>کد ملی <bdi dir="ltr">${esc(toFa(c.nid))}</bdi></span>`:''].filter(Boolean).join('');
  let h=`<div class="cp7"><div class="cp7h"><span class="c6a">${esc(userInit(c.name))}</span><span class="tx">${honTag(c.name)}<b>${esc(cuName(c))}${c.grp?`<em>${esc(c.grp)}</em>`:''}</b><small>${meta||`<span>مشخصات تکمیل نشده</span>`}</small></span><button class="cp7e" data-act="cuEdit" data-id="${c.id}" aria-label="ویرایش مشخصات ${esc(cuName(c))}">${ic('edit')}</button></div>
  <div class="cp7b${an}${X.length?' n3':''}">${cell('r',b.R,0)}${cell('g',b.G,1)}${X.map((k,n)=>cell(k,b.X[k],n+2)).join('')}</div></div>
  ${can('debt')?svDraftHTML(c):''}
  <div class="tx7h"><b>گردش حساب</b><small>${T.length?fmt(T.length)+' ردیف':'هنوز سندی ثبت نشده'}</small></div>`;
  if(T.length){const run=txRunMap(T),G=[];let last=null;T.forEach(t=>{if(t.date!==last){last=t.date;G.push({d:t.date,L:[]})}G[G.length-1].L.push(t)});let n=0;
    h+=`<div class="tx7${an}">`+G.map(g=>{const r=relDay(g.d);return `<div class="tx7d">${['امروز','دیروز','فردا'].includes(r)?r+'، ':''}${esc(dates(g.d).fa)}</div><div class="tx7g" style="--i:${Math.min(n++,8)}">${g.L.map(t=>txRow(c,t,run.get(t))).join('')}</div>`}).join('')+'</div>'}
  else if(can('debt'))h+=`<button class="tx7e" data-act="svNew" data-cu="${c.id}">${ic('plus')}<span>اولین سند این حساب</span></button>`;
  return h}
/* مانده بعد از هر ردیف: یک خط کوچک زیر مبلغ (مبلغ، طلا و سکه اگر هست) */
const txRunMini=o=>{if(!o)return '';const P=[['r',o.r],['g',o.g],...Object.keys(o.x||{}).map(k=>[k,+o.x[k]])].filter(z=>+z[1]);
  return `<small class="txrn"><i>مانده</i>${P.length?P.map(([k,v])=>`<span class="${v<0?'d':'c'}">${balV(k,v)}<u>${k==='r'?'ت':k==='g'?'گ':esc(balU(k))}</u></span>`).join(''):'<span class="z">تسویه</span>'}</small>`};
function txRunMap(T){const M=new Map(),A={r:0,g:0,x:{}};T.slice().reverse().forEach(t=>{const d=t.type==='inv'||t.type==='xf'||t.type==='cv'?txD(t):(()=>{const e=txEff(t);return {r:e.r||0,g:e.g||0,x:{}}})();A.r+=d.r||0;A.g=Math.round((A.g+(d.g||0))*1000)/1000;for(const k in d.x||{})A.x[k]=Math.round(((A.x[k]||0)+(+d.x[k]||0))*100)/100;M.set(t,{r:Math.round(A.r),g:A.g,x:{...A.x}})});return M}
ACT.cuQ=d=>{const c=curCu();if(!c)return;if(d.k==='xf'){ACT.xfNew();return}if(d.k==='cv'){ACT.cvNew();return}ACT.svNew({cu:c.id,pre:d.k})};
function txEff(t){const a=+t.amount||0,w=+t.weight||0;return t.type==='buy'?{r:a}:t.type==='sell'?{r:-a}:t.type==='pin'?{r:a}:t.type==='pout'?{r:-a}:t.type==='gin'?{g:w}:{g:-w}}
function txRow(c,t,run){if(t.type==='inv'||t.type==='xf'||t.type==='cv')return txRow2(c,t,run);const T=TXT[t.type]||{t:t.type},e=txEff(t),sub=[t.kind,t.weight?wFmt(t.weight)+' گرم':'',t.ppg?'هر گرم '+fmt(t.ppg):'',t.note].filter(Boolean).join('، ');
  const val=e.r!=null?`<b class="${e.r>0?'b':'r'}">${e.r>0?'+':'−'} ${fmt(Math.abs(e.r))} <i>تومان</i></b>`:`<b class="${e.g>0?'b':'r'}">${e.g>0?'+':'−'} ${wFmt(Math.abs(e.g))} <i>گرم</i></b>`;
  return swW(`<button class="txr" data-act="txOpen" data-id="${t.id}"><span class="bri t-${t.type}">${ic(T.i||'plus')}</span><span class="tx"><b>${T.t}</b><small>${esc(sub||T.d||'')}</small></span><span class="txv">${val}<small>${e.r!=null?(e.r>0?'بدهی ما':'طلب ما'):(e.g>0?'بدهی طلایی ما':'طلب طلایی ما')}</small>${run?txRunMini(run):''}</span></button>`,{r:[['txOpen','جزئیات','eye','#3b6fd6']],l:can('del')||isAdmin()?[['txDel','حذف','trash','#d23c48']]:[],data:{id:t.id}})}
const aCust=()=>'';
/* ---- افتتاح / ویرایش حساب: هر فیلد از اطلاعات قبلی مشتری‌ها پیشنهاد می‌دهد ---- */
let cuT='',cuEd=null;
function cuFormHTML(c){const isNew=!c.id;cuT=c.title||'';cuEd=c.id||null;const g=c.grp!=null?c.grp:'';
  const fr=(id,lab,val,o={})=>`<div class="f6r${o.ac?' ac':''}"><label for="${id}">${lab}</label><div class="f6i"><input id="${id}"${o.ltr?' class="ltr"':''}${o.im?` inputmode="${o.im}"`:''} value="${esc(val||'')}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="${o.last?'done':'next'}">${o.ac?`<span class="f6ic">${ic('search')}</span>`:''}</div>${o.ac?`<div class="f6sug hide" id="${id}s" role="listbox"></div>`:''}${o.hint?`<small class="eh" id="${id}v"></small>`:''}</div>`;
  return `<div class="sh-h"><div><b>${isNew?'حساب تازه':'مشخصات مشتری'}</b><small class="shsub">${isNew?'از مشتری‌های قبلی پیشنهاد می‌آید؛ بعد از ثبت وارد حساب او می‌شوید':'تغییرها را بدهید و ذخیره کنید'}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="f6">
  <div class="f6h">مشتری</div>
  <div class="f6g">${fr('cuN','نام و نام خانوادگی',c.name,{ac:1,ph:'مثلاً مریم احمدی'})}
  ${fr('cuP','شماره تماس',c.phone,{ac:1,ltr:1,im:'tel',ph:'09xxxxxxxxx',hint:1})}
  ${fr('cuM','کد ملی',c.nid,{ac:1,ltr:1,im:'numeric',ph:'اختیاری · ۱۰ رقم',hint:1})}</div>
  <div class="f6h">گروه</div>
  <div class="f6g">${fr('cuG','گروه مشتری',g,{ac:1,ph:'بدون گروه · مثلاً همکار، عمده'})}</div>
  <div class="f6h">بیشتر</div>
  <div class="f6g">${fr('cuA','آدرس یا توضیح',c.note,{ph:'اختیاری',last:1})}</div>
  </div>
  <button class="xgo" data-act="cuSave" data-id="${c.id||'new'}">${ic('check')} ${isNew?'ثبت و ورود به حساب':'ذخیره'}</button>`}
/* فهرست پیشنهاد زیر یک فیلد (مثل جستجوی آیفون): با تایپ باز می‌شود و با انتخاب بسته */
function acList(inp,box,rows,pick){if(!inp||!box)return;const hide=()=>{box.classList.add('hide');box.innerHTML=''};
  const show=()=>{if(document.activeElement!==inp){hide();return}const h=rows(inp.value);if(!h){hide();return}box.innerHTML=h;box.classList.remove('hide')};
  inp.addEventListener('input',()=>{clearTimeout(inp._at);inp._at=setTimeout(show,70)});inp.addEventListener('focus',()=>setTimeout(show,0));inp.addEventListener('blur',()=>setTimeout(hide,170));
  inp.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});box.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()};
  box.onclick=e=>{const r=e.target.closest('button[data-i]');if(!r)return;hide();pick(r.dataset.i)}}
const sugRow=(i,av,b,sub,cls,v)=>`<button type="button" class="bzsr${cls?' '+cls:''}" data-i="${esc(i)}"><span class="av">${av}</span><span class="tx"><b>${b}</b><small>${sub}</small></span>${v?`<span class="cbv">${v}</span>`:''}</button>`;
function cuPeople(q,by){const nq=nzName(q),qd=toEn(q).replace(/\D/g,'');const P=bzPeople();
  if(by==='n'){if(!nq)return [];return P.filter(p=>p.k.includes(nq)).sort((a,b)=>(b.k.startsWith(nq)-a.k.startsWith(nq))||(b.n-a.n)||String(b.last).localeCompare(String(a.last))).slice(0,6)}
  if(qd.length<3)return [];return P.filter(p=>(by==='p'?p.phone:p.nid).includes(qd)).slice(0,6)}
function cuBind(){const N=$('cuN'),P=$('cuP'),M=$('cuM'),G=$('cuG'),h=(id,t,c)=>{const o=$(id);if(o){o.textContent=t;o.className='eh'+(c?' '+c:'')}};let L=[];
  P.oninput=()=>{const v=toEn(P.value).replace(/\D/g,'').slice(0,11);P.value=v;const d=v&&custs.find(c=>!c.del&&!c.sys&&c.phone===v&&String(c.id)!==String(cuEd));h('cuPv',d?'این شماره برای «'+cuName(d)+'» ثبت شده':v.length===11?(phoneMsg(v)[0]):'',d||(v.length===11&&!phoneOk(v))?'bad':v.length===11?'ok':'')};
  M.oninput=()=>{const v=toEn(M.value).replace(/\D/g,'').slice(0,10);M.value=v;h('cuMv',v.length===10?(nidOk(v)?'کد ملی معتبر است':'کد ملی معتبر نیست'):'',v.length===10?(nidOk(v)?'ok':'bad'):'')};
  if(P.value)P.oninput();if(M.value)M.oninput();
  const pRows=by=>q=>{L=cuPeople(q,by);if(!L.length)return '';return L.map((p,i)=>{const own=p.cuId&&String(p.cuId)===String(cuEd),acc=p.cuId&&!own;return sugRow(i,esc(userInit(p.name)),esc(p.name),[acc?'<b class="c6own">حساب دارد · باز کردن</b>':'',p.phone?'<bdi dir="ltr">'+esc(toFa(p.phone))+'</bdi>':'',p.nid&&by==='m'?'کد ملی <bdi dir="ltr">'+esc(toFa(p.nid))+'</bdi>':'',!p.cuId&&p.n?toFa(p.n)+' واریزی':''].filter(Boolean).join(' · ')||'مشتری',acc?'acc':'')}).join('')};
  const pickP=i=>{const p=L[+i];if(!p)return;if(p.cuId&&String(p.cuId)!==String(cuEd)&&!cuEd){const c=CU().find(z=>String(z.id)===String(p.cuId));if(c){closeSheet();if(cuRet==='sell'){cuRet='';svPick(c.id)}else{custId=c.id;go('cust')}toast('حساب «'+cuName(c)+'» باز شد');return}}
    N.value=p.name;if(p.phone&&!P.value){P.value=p.phone;P.oninput()}if(p.nid&&!M.value){M.value=p.nid;M.oninput()}const nx=[P,M,G].find(el=>!el.value)||$('cuA');if(nx)nx.focus()};
  acList(N,$('cuNs'),pRows('n'),pickP);acList(P,$('cuPs'),pRows('p'),pickP);acList(M,$('cuMs'),pRows('m'),pickP);
  let GL=[];acList(G,$('cuGs'),q=>{const nq=nzName(q),A=groupsList();GL=A.filter(g=>!nq||nzName(g).includes(nq)).slice(0,6);const ex=A.some(g=>nzName(g)===nq);const cnt=g=>CU().filter(c=>c.grp===g).length;
    const R=GL.map((g,i)=>sugRow(i,ic('users'),esc(g),fmt(cnt(g))+' مشتری','gr'));if(nq&&!ex){GL.push(clean(q));R.push(sugRow(GL.length-1,ic('plus'),'گروه تازه «'+esc(clean(q))+'»','بعداً با جستجوی همین نام پیدا می‌شود','nw'))}if(G.value&&!nq)return R.join('');return R.join('')},i=>{G.value=GL[+i]||'';$('cuA').focus()});
  ['cuN','cuP','cuM','cuG','cuA'].forEach((id,i,A)=>{const el=$(id);el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(i<A.length-1)$(A[i+1]).focus();else el.blur()}})})}
ACT.cuNew=()=>{cuRet='';sheet(cuFormHTML({}));cuBind();sheetFocus($('cuN'))};
ACT.cuEdit=d=>{const c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;sheet(cuFormHTML(c));cuBind()};
ACT.cuSave=d=>{const name=clean($('cuN').value),phone=toEn($('cuP').value).replace(/\D/g,''),nidv=toEn($('cuM').value).replace(/\D/g,''),note=clean($('cuA').value||''),grp=clean($('cuG').value||'');
  if(!name){toast('نام مشتری را وارد کنید',true);$('cuN').focus();return}if(phone&&!phoneOk(phone)){toast('شماره تماس درست نیست',true);$('cuP').focus();return}if(nidv&&!nidOk(nidv)){toast('کد ملی معتبر نیست',true);$('cuM').focus();return}
  if(grp)addGroup(grp);const now=new Date().toISOString();let c;
  if(d.id==='new'){c={id:nid++,title:cuT,name,phone,nid:nidv,note,grp,txs:[],createdAt:now,lastAt:now,by:who()};custs.push(c);logA('cust','افتتاح حساب مشتری',cuName(c))}
  else{c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;Object.assign(c,{title:cuT,name,phone,nid:nidv,note,grp,updatedAt:now,updatedBy:who()});logA('cust','ویرایش مشخصات مشتری',cuName(c))}
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
ACT.txOpen=d=>{const c=curCu(),t=c&&(c.txs||[]).find(x=>String(x.id)===String(d.id));if(!t)return;if(t.type==='inv'){invOpen(c.id,t.id);return}if(t.type==='xf'||t.type==='cv'){xfShow(c,t);return}const T=TXT[t.type]||{t:t.type},e=txEff(t);
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
function bzItemsHTML(){const L=bz.d.items;return L.map((x,i)=>{const K=BZK[x.k]||BZK['سایر'];return `<div class="bzit" data-i="${i}"><div class="bzit-h">${Object.keys(BZK).map(k=>`<button class="tch${x.k===k?' on':''}" data-act="bzItK" data-i="${i}" data-k="${k}">${k}</button>`).join('')}${L.length>1?`<button class="x" data-act="bzItDel" data-i="${i}" aria-label="حذف">×</button>`:''}</div>
  ${K.t?`<div class="bzty"><span>${K.tl}</span>${K.t.map(t=>`<button class="${x.t===t?'on':''}" data-act="bzItT" data-i="${i}" data-t="${t}">${t}</button>`).join('')}</div>`:''}
  ${K.q?`<div class="ef2"><div class="ef"><label>${K.q} <i>(${K.u})</i></label><input data-f="q" class="ltr" inputmode="decimal" value="${esc(x.q||'')}" autocomplete="off"></div><div class="ef"><label>${K.rl||'نرخ هر '+(K.u==='گرم'?'گرم':K.u||'واحد')} <i>(اختیاری)</i></label><input data-f="r" class="ltr" inputmode="numeric" value="${x.r?Number(x.r).toLocaleString('en-US'):''}" autocomplete="off"></div></div>`:x.k==='سایر'?`<div class="ef"><label>شرح</label><input data-f="n" value="${esc(x.n||'')}" placeholder="مثلاً بدهی قبلی، ارز دیگر…" autocomplete="off"></div>`:''}
  <div class="ef" style="margin:0"><label>مبلغ این قلم <i>(تومان)</i></label><input data-f="amt" class="ltr" inputmode="numeric" value="${x.amt?Number(x.amt).toLocaleString('en-US'):''}" autocomplete="off"></div></div>`}).join('')}
function bzItRead(){const d=bz.d;document.querySelectorAll('#bzIt .bzit').forEach(el=>{const x=d.items[+el.dataset.i];if(!x)return;const g=f=>{const i=el.querySelector('[data-f='+f+']');return i?i.value:undefined};if(g('q')!==undefined)x.q=decIn(g('q'));if(g('r')!==undefined)x.r=num(g('r'));if(g('amt')!==undefined)x.amt=num(g('amt'));if(g('n')!==undefined)x.n=g('n')});
  d.amount=String(d.items.reduce((s,x)=>s+(+x.amt||0),0));const gw=d.items.filter(x=>x.k==='طلا').reduce((s,x)=>s+(parseFloat(x.q)||0),0);d.weight=gw?String(Math.round(gw*1000)/1000):''}
const bzGoldAmt=()=>(bz.d.items||[]).filter(x=>x.k==='طلا').reduce((s,x)=>s+(+x.amt||0),0)||(!(bz.d.items||[]).length?num(bz.d.amount||0):0);
function bzItBind(){const S=()=>{bzItRead();const d=bz.d,tot=num(d.amount),gw=parseFloat(d.weight)||0,ga=bzGoldAmt(),pg=ppgOf(ga,gw),n=d.items.filter(x=>x.amt).length;
    $('bzS').innerHTML=`${pg?`<div class="bzppg"><div><small>هر گرم طلای خام، تمام‌شده</small><b>${fmt(pg)}<i>تومان</i></b></div><span class="m">${fmt(ga)} تومان<br>÷ ${esc(toFa(d.weight))} گرم</span></div>`:''}${tot?`<div class="bztot"><span>جمع کل${n>1?' ('+toFa(n)+' قلم)':''}</span><b>${fmt(tot)} <i>تومان</i></b></div>`:''}`};
  document.querySelectorAll('#bzIt .bzit').forEach(el=>{const x=bz.d.items[+el.dataset.i],q=el.querySelector('[data-f=q]'),r=el.querySelector('[data-f=r]'),a=el.querySelector('[data-f=amt]');
    const auto=()=>{const qq=parseFloat(decIn(q?q.value:''))||0,rr=r?num(r.value):0;if(qq&&rr&&a){a.value=Math.round(qq*rr).toLocaleString('en-US')}};
    if(q)q.oninput=()=>{q.value=decIn(q.value);auto();S()};if(r)r.oninput=()=>{const v=num(r.value);r.value=v?v.toLocaleString('en-US'):'';auto();S()};if(a)a.oninput=()=>{const v=num(a.value);a.value=v?v.toLocaleString('en-US'):'';S()};
    const n=el.querySelector('[data-f=n]');if(n)n.oninput=S});
  S();const f=document.querySelector('#bzIt .bzit:last-child input');if(f&&!f.value)setTimeout(()=>f.focus(),300)}
ACT.bzAddIt=()=>{bzItRead();bz.d.items.push({k:'سکه',t:'تمام امامی',q:'',r:0,amt:0});const y=$('view').scrollTop;render();$('view').scrollTop=y+200};
ACT.bzItDel=d=>{bzItRead();bz.d.items.splice(+d.i,1);const y=$('view').scrollTop;render();$('view').scrollTop=y};
ACT.bzItT=d=>{bzItRead();const x=bz.d.items[+d.i];if(!x)return;x.t=x.t===d.t?'':d.t;const y=$('view').scrollTop;render();$('view').scrollTop=y};
ACT.bzItK=d=>{bzItRead();const x=bz.d.items[+d.i];if(!x)return;if(x.k!==d.k)x.t=(BZK[d.k]&&BZK[d.k].t&&d.k==='سکه')?'تمام امامی':'';x.k=d.k;if(!BZK[d.k].q){x.q='';x.r=0}const y=$('view').scrollTop;render();$('view').scrollTop=y};
ACT.buyNew=()=>{closeSheet();bz={step:1,d:{pay:payDef()},msg:''};go('buy')};
function bzRead(){if(cur!=='buy')return;const g=id=>{const el=$(id);return el?el.value:undefined},d=bz.d;
  if(bz.step===1){d.name=g('bzN');d.phone=g('bzP');d.nid=g('bzM');d.code=g('bzC');if(d.pk&&nzName(d.name)!==d.pk)['cuId','pk','prevIban','iban','card','holder'].forEach(k=>delete d[k])}
  if(bz.step===2){bzItRead()}
  if(bz.step===3){d.iban=g('bzI');d.card=g('bzK');d.holder=g('bzH')}
  Object.keys(d).forEach(k=>{if(d[k]===undefined)delete d[k]})}
const bzF=(id,label,val,o={})=>`<div class="ef"><label for="${id}">${label}${o.opt?' <i>(اختیاری)</i>':''}</label>${o.pre?`<div class="eib2"><span>${o.pre}</span>`:''}<input id="${id}"${o.ltr?' class="ltr"':''} ${o.im?`inputmode="${o.im}"`:''} value="${esc(val||'')}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="${o.last?'done':'next'}"${o.sug?` aria-autocomplete="list" aria-controls="${id}s"`:''}>${o.pre?'</div>':''}${o.sug?`<div class="bzsug hide" id="${id}s" role="listbox"></div>`:''}<small class="eh" id="${id}v"></small></div>`;
function vBuy(){const d=bz.d,st=bz.step,T=['اطلاعات مشتری','وزن و مبلغ','حساب و تاریخ واریز'];
  let h=`<div class="bzp">${[1,2,3].map(i=>`<i class="${i<st?'done':i===st?'on':''}"></i>`).join('')}</div><div class="bzh"><small>مرحله ${toFa(st)} از ۳</small><b>${T[st-1]}</b></div>`;
  if(bz.msg)h+=`<div class="bzok">${ic('check')}<span>${bz.msg}</span></div>`;
  if(st===1)h+=bzF('bzN','نام و نام خانوادگی',d.name,{ph:'مثلاً علی رضایی',sug:1})+bzF('bzP','شماره تماس',d.phone,{ltr:1,im:'tel',ph:'09xxxxxxxxx',opt:1})+bzF('bzM','کد ملی',d.nid,{ltr:1,im:'numeric',ph:'۱۰ رقم',opt:1})+bzF('bzC','شماره فاکتور',d.code,{ltr:1,im:'numeric',last:1});
  if(st===2){bzItems();h+=`<div id="bzIt">${bzItemsHTML()}</div><button class="addit" data-act="bzAddIt">${ic('plus')} افزودن قلم دیگر <small>(سکه، دلار، طلای دیگر…)</small></button><div id="bzS"></div>`}
  if(st===3){h+=`<div class="ef"><label for="bzI">شماره شبا</label><div class="ibin"><input id="bzI" inputmode="numeric" value="${esc(d.iban||'')}" placeholder="شماره شبا (۲۴ رقم)" autocomplete="off" enterkeyhint="next"><span class="ibir">IR</span><span class="ibbk" id="bzIb"></span></div><small class="eh" id="bzIv"></small>${d.prevIban?`<button class="bzni" data-act="bzNewIban">${ic('edit')} شبای جدید وارد می‌کنم</button>`:''}</div>`+bzF('bzK','شماره کارت',d.card,{ltr:1,im:'numeric',ph:'۱۶ رقم',opt:1})+bzF('bzH','نام صاحب حساب',d.holder!=null?d.holder:clean(d.name||''),{last:1})+bzStlHTML()
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
ACT.bzNext=async()=>{bzRead();const d=bz.d;
  if(bz.step===1){if(!clean(d.name||'')){toast('نام مشتری را وارد کنید',true);$('bzN').focus();return}const ph=toEn(d.phone||'');if(ph&&!phoneOk(ph)){toast('شماره تماس درست نیست',true);$('bzP').focus();return}const n=toEn(d.nid||'');if(n&&!nidOk(n)){toast('کد ملی معتبر نیست',true);$('bzM').focus();return}bz.step=2;bz.msg='';render();return}
  if(bz.step===2){if(!num(d.amount||0)){toast('مبلغ را وارد کنید',true);const a=document.querySelector('#bzIt [data-f=amt]');if(a)a.focus();return}bz.step=3;bz.msg='';render();return}
  const dI=dg(d.iban||'').slice(0,24);
  const card=dg(d.card||'').slice(0,16),now=new Date().toISOString(),iban=dI?'IR'+dI:'',name=stripName(d.name),holder=clean(d.holder||'');
  if(dateVal!==todayISO()){dateVal=todayISO();ls.set('m_date',dateVal)}
  if(bzStlSum()>num(d.amount)){toast('جمع تسویه‌ها از مبلغ این واریزی بیشتر است',true);return}
  if(bz.saving)return;bz.saving=true;let S=[];try{S=await bzStlMake()}finally{bz.saving=false}
  const ne={id:nid++,name,title:'',phone:toEn(d.phone||''),nid:toEn(d.nid||''),code:toEn(d.code||'').trim(),weight:toEn(d.weight||''),amount:num(d.amount),ppg:ppgOf(bzGoldAmt(),d.weight),items:(d.items||[]).filter(x=>x.amt).map(x=>({...x})),iban,card,bank:'',holder:holder&&holder!==name?holder:'',payDate:d.pay||payDef(),kind:'buy',settles:S,entryDate:todayISO(),createdBy:who(),updatedBy:who(),updatedAt:now};
  entries.push(ne);saveE();alloc=null;logA('add','ثبت واریزی (خرید)',name+' | '+fmt(ne.amount)+' تومان | واریز '+dates(ne.payDate).fa+(S.length?' | تسویه از مشتری '+fmt(bzStlSum(S))+' تومان':''),{ids:[ne.id],after:pick(ne)});
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
  entries.slice().sort((a,b)=>String(b.entryDate||'').localeCompare(String(a.entryDate||''))).forEach(e=>add(e.name,{phone:toEn(e.phone||''),nid:toEn(e.nid||''),iban:e.iban||'',card:e.card||'',holder:clean(e.holder||'')||clean(e.name||''),n:1,last:e.entryDate||''}));
  CU().forEach(c=>add(cuName(c),{phone:toEn(c.phone||''),cuId:c.id,last:String(c.lastAt||'').slice(0,10)}));
  return [...M.values()]}
function bzSugHTML(q){const nq=nzName(q),qd=toEn(q).replace(/\D/g,'');if(!nq)return '';
  const L=bzPeople().filter(p=>p.k.includes(nq)||(qd.length>=3&&(p.phone.includes(qd)||p.nid.includes(qd))))
    .sort((a,b)=>(b.k.startsWith(nq)-a.k.startsWith(nq))||(b.n-a.n)||String(b.last).localeCompare(String(a.last))).slice(0,6);
  const exact=L.some(p=>p.k===nq);
  return L.map((p,i)=>`<button type="button" class="bzsr" role="option" data-i="${i}" data-k="${esc(p.k)}"><span class="av">${esc(userInit(p.name))}</span><span class="tx"><b>${esc(p.name)}</b><small>${[p.cuId?'حساب مشتری':'',p.n?toFa(p.n)+' بار ثبت شده':'',p.phone?'<span class="ltr">'+esc(toFa(p.phone))+'</span>':''].filter(Boolean).join(' · ')||'مشتری'}</small></span></button>`).join('')
    +(exact?'':`<button type="button" class="bzsr nw" data-k=""><span class="av">${ic('plus')}</span><span class="tx"><b>مشتری جدید: «${esc(clean(q))}»</b><small>با همین نام ثبت می‌شود</small></span></button>`)}
function bzSugBind(){const N=$('bzN'),B=$('bzNs');if(!N||!B)return;
  const hide=()=>{B.classList.add('hide');B.innerHTML='';N.setAttribute('aria-expanded','false')};
  const show=()=>{const h=bzSugHTML(N.value);if(!h||document.activeElement!==N){hide();return}B.innerHTML=h;B.classList.remove('hide');N.setAttribute('aria-expanded','true')};
  N.addEventListener('input',()=>{clearTimeout(N._t);N._t=setTimeout(show,90)});N.addEventListener('focus',show);
  N.addEventListener('blur',()=>setTimeout(hide,150));N.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='Escape')hide()});
  B.onpointerdown=e=>{if(e.target.closest('.bzsr'))e.preventDefault()};
  B.onclick=e=>{const r=e.target.closest('.bzsr');if(!r)return;const p=r.dataset.k?bzPeople().find(z=>z.k===r.dataset.k):null;hide();
    if(p){N.value=p.name;const P=$('bzP'),M=$('bzM');if(P&&p.phone){P.value=p.phone;P.oninput&&P.oninput()}if(M&&p.nid){M.value=p.nid;M.oninput&&M.oninput()}
      /* اطلاعات حساب از آخرین ثبت همین مشتری؛ کالا خالی می‌ماند. شبا در مرحله ۳ قابل تغییر است */
      Object.assign(bz.d,{cuId:p.cuId||'',pk:p.k,prevIban:p.iban,iban:p.iban,card:p.card,holder:p.holder});if(!p.iban){delete bz.d.iban;delete bz.d.holder;delete bz.d.prevIban}
      toast(p.iban?'اطلاعات «'+p.name+'» از ثبت قبلی پر شد':'«'+p.name+'» انتخاب شد')}
    else{['cuId','pk','prevIban','iban','card','holder'].forEach(k=>delete bz.d[k])}
    const nx=[$('bzP'),$('bzM'),$('bzC')].find(el=>el&&!el.value)||$('bzC');if(nx)nx.focus()}}
/* ---------- خرید طلا: تسویه از مشتری همان موقع ثبت (همان پنجره صفحه جزئیات؛ با ثبت واریزی ذخیره می‌شود) ---------- */
const bzStlSum=S=>(S||bz.d.settles||[]).reduce((a,z)=>a+(+z.amount||0),0);
function bzStlHTML(){const S=bz.d.settles||[],tot=num(bz.d.amount||0),rest=Math.max(0,tot-bzStlSum());
  return `<div class="ef bzstl"><label>تسویه از مشتری <i>(اختیاری)</i></label>${S.length?`<div class="stll2">${S.map((z,i)=>`<div class="stlrw w"><button class="stlr" data-act="bzStlOpen" data-i="${i}"><span class="bri">${ic('user')}</span><span class="tx"><b>${esc(z.name)}</b><small>${['در انتظار تأیید',z.inv?'فاکتور '+esc(z.inv):'',z.tn?'پیگیری '+esc(z.tn):'',z.imgD?'رسید دارد':''].filter(Boolean).join(' · ')}</small></span><span class="brv"><b>${fmt(z.amount)} <i>تومان</i></b></span></button><button class="stlc" data-act="bzStlDel" data-i="${i}" aria-label="حذف این تسویه">${ic('x')}</button></div>`).join('')}</div>`:''}
  ${rest>0?`<button class="addit" data-act="bzStlNew">${ic('plus')} ${S.length?'تسویه دیگر':'ثبت تسویه از مشتری'} <small>(مشتری دیگری مستقیم به این شخص پرداخت کرده)</small></button>`:`<div class="eh ok">کل مبلغ با تسویه از مشتری پرداخت می‌شود</div>`}</div>`}
const bzStlRe=()=>{const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.bzStlNew=()=>{bzRead();stl={bz:1,amount:Math.max(0,num(bz.d.amount||0)-bzStlSum()),q:''};sheet(stlHTML());stlBind();setTimeout(()=>{const q=$('stQ');if(q)q.focus()},300)};
ACT.bzStlOpen=d=>{bzRead();const z=(bz.d.settles||[])[+d.i];if(!z)return;stl={...z,bz:1,i:+d.i,q:z.cuId?'':z.name};sheet(stlHTML());stlBind()};
ACT.bzStlDel=d=>{bzRead();(bz.d.settles||[]).splice(+d.i,1);bzStlRe()};
ACT.bzStlSave=()=>{stlRead();const name=clean(stl.name||stl.q||'');if(!name){toast('پرداخت‌کننده را انتخاب یا نامش را بنویسید',true);return}const a=+stl.amount||0;if(!a){toast('مبلغ را وارد کنید',true);return}
  const S=bz.d.settles=(bz.d.settles||[]).slice(),others=S.filter((z,i)=>i!==stl.i).reduce((s,z)=>s+(+z.amount||0),0);if(others+a>num(bz.d.amount||0)){toast('جمع تسویه‌ها از مبلغ این واریزی بیشتر می‌شود',true);return}
  const z={name,phone:stl.phone||'',inv:stl.inv||'',amount:a,tn:stl.tn||'',note:stl.note||'',cuId:stl.cuId||'',imgD:stl.imgD||''};
  if(stl.i!=null)S[stl.i]=z;else S.push(z);stl=null;closeSheet();bzStlRe();toast('تسویه اضافه شد · با ثبت واریزی ذخیره می‌شود')};
/* هنگام ثبت واریزی: تسویه‌ها با وضعیت «در انتظار تأیید» ساخته می‌شوند، مثل ثبت از صفحه جزئیات */
async function bzStlMake(){const now=new Date().toISOString(),R=[];for(const s of (bz.d.settles||[])){const z={st:'wait',id:nid++,name:s.name,phone:s.phone,inv:s.inv,amount:s.amount,tn:s.tn,note:s.note,cuId:s.cuId,date:todayISO(),at:now,by:who()};
    if(s.imgD){const k=newImgKey('stl:'+z.id);if(await imgPut(k,s.imgD)){z.imgs=[k];z.img=k}else toast('حافظه پر است؛ عکس رسید ذخیره نشد',true)}R.push(z)}return R}
ACT.bzNewIban=()=>{bzRead();bz.d.iban='';bz.d.card='';const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;const I=$('bzI');if(I)I.focus()};
