/* ===== سند (فاکتور فروش، خرید، دریافت و پرداخت)، کارتخوان‌ها، انتقال مانده بین مشتری‌ها (الگو: نرم‌افزار کیمیا) =====
   همه داده‌ها داخل همان مجموعه custs ذخیره و همگام می‌شوند:
   - سند = تراکنش type:'inv' در حساب مشتری: items (کالای فروشی با اجرت و سود)، xr (طلا/سکه/ارز: فروش، خرید، دریافت، تحویل؛ pul = پولی)،
     pays (دریافت و پرداخت پول)، total (خالص ریالی کالاها)، ge (اثر طلایی، گرم ۱۸)، xe (اثر سکه و ارز)، gc = تبدیل مانده به طلایی
   - انتقال مانده / تبدیل طلایی‌ریالی = تراکنش type:'xf' / 'cv' با r و g علامت‌دار (مثبت = بدهی ما)
   - کارتخوان = رکورد {sys:'ch', kind:'pos'}؛ مانده = کارت‌های کشیده‌شده − واریز به حساب بانکی (sources)
   - حواله به حساب ما = pays با srcId (حساب‌های بخش بانک) — حساب‌های قدیمی {sys:'ch',kind:'bank'} هم کار می‌کنند
   - گروه‌ها و فهرست کالاها = رکورد {sys:'cfg'} */
Object.assign(IC,{tag:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',inv:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',card:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',coin:'<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',cash:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',ring:'<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-1.5 3.6h-3z"/>',bar:'<path d="M4 17l3-9h10l3 9z"/><path d="M8 13h8"/>',usd:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5v11"/>'});
let cuRet='';
const ns=()=>new Date().toISOString();
/* ---------- تنظیمات مشترک: گروه‌ها و کالاها ---------- */
function cfgRec(make){let r=custs.find(c=>c.sys==='cfg'&&!c.del);if(!r&&make){r={id:nid++,sys:'cfg',name:'',groups:[],goods:[],txs:[],createdAt:ns()};custs.push(r)}return r}
const GOODS0=['انگشتر','النگو','دستبند','گردنبند','زنجیر','گوشواره','سرویس','نیم‌ست','پلاک','آویز','سکه','شمش','آبشده'];
const goodsList=()=>{const r=cfgRec();return [...new Set([...((r&&r.goods)||[]),...GOODS0])]};
const groupsList=()=>{const r=cfgRec();return [...new Set([...((r&&r.groups)||[]),...CU().map(c=>c.grp).filter(Boolean)])]};
function addGroup(g){g=clean(g||'');if(!g)return;const r=cfgRec(1);r.groups=r.groups||[];if(!r.groups.includes(g)){r.groups.push(g);saveCu()}}
function addGoods(k){k=clean(k||'');if(!k||GOODS0.includes(k))return;const r=cfgRec(1);r.goods=r.goods||[];if(!r.goods.includes(k)){r.goods.unshift(k);saveCu()}}
/* ---------- کارتخوان‌ها (و حساب‌های بانکی قدیمی خودمان) ---------- */
const CH=k=>custs.filter(c=>c.sys==='ch'&&!c.del&&(!k||c.kind===k));
const CHK={pos:'کارتخوان',bank:'حساب بانکی'};
function chMoves(ch){const L=[];for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;(t.pays||[]).forEach(p=>{if(String(p.chId)===String(ch.id))L.push({d:t.date,at:t.at,a:+p.amount||0,t:'سند '+toFa(t.no)+' · '+cuName(c),sub:(p.m==='pos'?'کارتخوان':+p.amount<0?'پرداخت حواله':'دریافت حواله')+(p.tn?' · پیگیری '+p.tn:''),cu:c.id,tx:t.id})})}}
  for(const t of ch.txs||[]){if(t.del)continue;const so=t.srcId!=null&&sources.find(s=>String(s.id)===String(t.srcId)),o=!so&&custs.find(z=>String(z.id)===String(t.peer));
    L.push({d:t.date,at:t.at,a:t.type==='tin'?+t.amount:-t.amount,t:so?'واریز به حساب «'+so.name+'»':t.type==='tin'?'حواله از «'+((o&&o.name)||'حساب')+'»':'حواله به «'+((o&&o.name)||'حساب')+'»',sub:[t.tn?'پیگیری '+t.tn:'',t.note].filter(Boolean).join(' · '),own:t.id})}
  return L.sort((a,b)=>String(b.d+b.at).localeCompare(String(a.d+a.at)))}
const chBal=ch=>chMoves(ch).reduce((s,m)=>s+m.a,0);
function chNew(name,kind){name=clean(name||'');if(!name)return null;const r={id:nid++,sys:'ch',kind,name,txs:[],createdAt:ns(),by:who()};custs.push(r);saveCu();logA('cust','تعریف '+CHK[kind],name);return r}
/* حواله‌های سندها به حساب‌های بخش بانک (از آخرین تطبیق موجودی آن حساب) */
function srcMoves(s){const L=[];for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv'||(s.balAt&&String(t.at||'')<s.balAt))continue;(t.pays||[]).forEach(p=>{if(p.srcId!=null&&String(p.srcId)===String(s.id))L.push({at:t.at,date:t.date,a:+p.amount||0,t:(+p.amount<0?'حواله به ':'حواله از ')+cuName(c),sub:'سند '+toFa(t.no)+(p.tn?' · پیگیری '+p.tn:'')})})}}return L}
const srcInvSum=s=>srcMoves(s).reduce((a,m)=>a+m.a,0);
function srcQuick(name){name=clean(name||'');if(!name)return null;const ex=sources.find(s=>s.name===name);if(ex)return ex;if(!can('src')){toast('تعریف حساب بانکی برای حساب شما فعال نیست',true);return null}
  const s={id:nid++,name,bank:'',limit:0,count:0,iban:'',card:''};sources.push(s);saveS();logA('src','حساب بانکی جدید',name);return s}
/* ---------- ردیف‌های مرتبط (برای حذف/بازگردانی هم‌زمان) ---------- */
function txLinked(c,t){const R=[],find=(cu,tx)=>{const C=custs.find(z=>String(z.id)===String(cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(tx));if(T)R.push({c:C,t:T})};
  if(t.type==='inv')(t.pays||[]).forEach(p=>{if(p.m==='cust'&&p.xfId)find(p.cuId,p.xfId)});
  if((t.type==='xf'||t.type==='cv')&&t.peer)find(t.peer.cu,t.peer.tx);
  if(t.type==='xf'&&t.inv)find(t.inv.cu,t.inv.tx);
  return R.filter(x=>x.t!==t)}
const invTitle=t=>(t.dk==='buy'?'سند خرید ':(t.items||[]).length?'فاکتور فروش ':'سند ')+toFa(t.no);
function txRow2(c,t){const d=txD(t),v=(x,k)=>`<b class="${x>0?'r':'b'}">${x>0?'+':'−'} ${balV(k,x)} <i>${balU(k)}</i></b>`;
  let T,sub,ico;if(t.type==='inv'){const paid=(t.pays||[]).reduce((s,p)=>s+pAmt(p),0);T=invTitle(t);ico='inv';sub=[(t.items||[]).map(i=>i.k).join('، '),...(t.xr||[]).map(xrLab),(t.items||[]).length?wFmt((t.items||[]).reduce((s,i)=>s+(+i.w||0),0))+' گرم':'',paid?(paid>0?'دریافت ':'پرداخت ')+fmt(Math.abs(paid)):''].filter(Boolean).join(' · ')}
  else if(t.type==='xf'){T=t.inv?'پرداخت فاکتور مشتری دیگر':'انتقال مانده';ico='swap';sub=t.note||''}else{T='تبدیل '+(t.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی');ico='coin';sub=t.note||''}
  const vals=(d.r?v(d.r,'r'):'')+(d.g?v(d.g,'g'):'')+Object.keys(d.x||{}).filter(k=>+d.x[k]).map(k=>v(+d.x[k],k)).join('')||'<b>تسویه</b>';
  return swW(`<button class="txr" data-act="txOpen" data-id="${t.id}"><span class="bri t-${t.type}">${ic(ico)}</span><span class="tx"><b>${esc(T)}</b><small>${esc(sub)}</small></span><span class="txv txv2">${vals}</span></button>`,{r:[['txOpen','جزئیات','eye','#3b6fd6']],l:can('del')||isAdmin()?[['txDel','حذف','trash','#d23c48']]:[],data:{id:t.id}})}
function xfShow(c,t){const d=txD(t),kv=(l,v)=>v?`<div class="kv"><small>${l}</small><b>${v}</b><span class="kvx"></span></div>`:'';const L=txLinked(c,t);
  sheet(`<div class="sh-h"><div><b>${t.type==='cv'?'تبدیل طلایی / ریالی':'انتقال مانده'}</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="kvs" style="border:0;padding:0">${kv('اثر ریالی',d.r?fmt(Math.abs(d.r))+' تومان ('+(d.r>0?'بدهی ما':'طلب ما')+')':'')}${kv('اثر طلایی',d.g?wFmt(Math.abs(d.g))+' گرم ('+(d.g>0?'بدهی طلایی ما':'طلب طلایی ما')+')':'')}${kv('نرخ',t.rate?fmt(t.rate)+' تومان هر گرم':'')}${kv('طرف دیگر',L.map(x=>esc(cuName(x.c))).join('، '))}${kv('شرح',esc(t.note||''))}${kv('تاریخ',esc(dates(t.date).wd+' '+dates(t.date).fa))}${kv('ثبت‌کننده',esc(t.by||''))}</div>
  ${can('del')||isAdmin()?`<button class="edel" data-act="txDel" data-id="${t.id}">${ic('trash')} حذف${L.length?' (ردیف طرف مقابل هم حذف می‌شود)':''}</button>`:''}`)}

/* ================= سند ================= */
let sv=null,svAdd=-1;
/* مظنه (هر مثقال ۷۰۵) = نرخ هر گرم ۱۸ عیار × ۴٫۳۳۱۸ */
const MZK=4.3318,mzOf=r=>Math.round((+r||0)*MZK),rOfMz=m=>Math.round((+m||0)/MZK);
const PM={dep:{t:'حواله به فروشنده واریزی',i:'swap'},cash:{t:'نقد',i:'cash'},pos:{t:'کارتخوان',i:'card'},hav:{t:'حواله',i:'bank'},cust:{t:'حساب مشتری',i:'swap'},gold:{t:'طلای مشتری',i:'coin'},disc:{t:'تخفیف',i:'tag'}};
function invNext(){let m=1000;for(const c of custs)for(const t of c.txs||[])if(t.type==='inv'&&+t.no>m)m=+t.no;return m+1}
const svKeep=()=>ls.set('m_svd',sv);
function svBlank(cu){const r=+ls.get('m_rate',0)||0;return{v:2,cuId:cu||'',date:todayISO(),rate:r,mz:+ls.get('m_mz',0)||mzOf(r),items:[],xr:[],tax:!!ls.get('m_tax',false),disc:0,pays:[],gconv:false,q:''}}
const svFix=()=>{if(sv.gconv)sv.gconv=false;/* v60.9: «مانده ریالی طلایی ثبت شود» فعلاً برداشته شده */if(!sv.xr)sv.xr=[];if(!sv.items)sv.items=[];if(!sv.pays)sv.pays=[];if(sv.mz==null)sv.mz=mzOf(sv.rate);if(!sv.qa)sv.qa=qaBlank()};
ACT.svNew=d=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}closeSheet();const cu=d&&d.cu?d.cu:'',old=ls.get('m_svd',null);
  if(old&&(old.v===1||old.v===2)&&((old.items||[]).length||(old.pays||[]).length||(old.xr||[]).length)&&(!cu||String(old.cuId||'')===String(cu)||!old.cuId)){sv=old;if(cu)sv.cuId=cu;toast('پیش‌نویس سند قبلی باز شد','', 'سند تازه',()=>{const dk=sv.dk,fc=sv.fixCu;sv=svBlank(cu);sv.dk=dk;sv.fixCu=fc;svFix();svKeep();render()})}else sv=svBlank(cu);
  /* v60.5: نوع سند: فروش یا خرید (فقط عنوان و پیشنهادهای جستجو را عوض می‌کند؛ ساختار سند همان است) */
  if(d&&d.dk)sv.dk=d.dk==='buy'?'buy':'sell';else if(!sv.dk)sv.dk='sell';sv.fixCu=!!cu;
  svFix();const k=d&&d.pre;if(k==='in'||k==='out')sv.qa={...qaBlank(),p:pyNew('cash',{dir:k})};else if(k==='gin'||k==='gout')sv.qa={...qaBlank(),x:xrNew(k==='gin'?'in':'out','gold')};
  PARENT.sell=cur==='cust'?'cust':'custs';svKeep();go('sell')};
/* اجرت: درصدی و تومانی با هم (ردیف‌های قدیمی فقط یکی از این دو را دارند) */
const ajPT=it=>({P:it.ajP!=null?+it.ajP||0:(it.ajU==='p'?+it.aj||0:0),T:it.ajT!=null?+it.ajT||0:(it.ajU==='t'?+it.aj||0:0)});
const ajLab=it=>{const J=ajPT(it);return [J.P?toFa(J.P)+'٪':'',J.T?fmt(J.T)+' ت':''].filter(Boolean).join(' + ')||'۰'};
function itCalc(it,rate,tax){const w=+it.w||0,ay=+it.ay||750,gold=Math.round(w*(+rate||0)*ay/750),J=ajPT(it),aj=Math.round(gold*J.P/100)+Math.round(J.T),pr=Math.round((gold+aj)*(+it.pp||0)/100),tx=tax?Math.round((aj+pr)*0.10):0;return{gold,aj,pr,tax:tx,tot:gold+aj+pr+tx}}
/* ردیف طلا، سکه یا ارز: t فروش|خرید|دریافت|تحویل · pul = پولی (جنس جابه‌جا نمی‌شود، به حساب مشتری می‌رود) */
const XT={sell:'فروش',buy:'خرید',in:'دریافت',out:'تحویل'};
const xrAy=(t,pul)=>pul?750:t==='buy'?735:t==='sell'?740:750;
function xrNew(t,a,o){const g=a==='gold',x={t,a,pul:false,w:'',q:'',ay:g?xrAy(t,o&&o.pul):0,pg:0,pgM:false,cat:g?(t==='in'||t==='out'?'آبشده':'متفرقه'):'',...(o||{})};if(!g&&!x.pg)x.pg=+ls.get('m_px_'+a,0)||0;return x}
/* خرید متفرقه = نرخ روز با عیار ۷۳۵، فروش متفرقه = عیار ۷۴۰؛ نرخ هر گرم با تغییر مظنه خودکار عوض می‌شود مگر دستی زده شده باشد */
function xrCalc(x,rate){const g=x.a==='gold',n=g?(parseFloat(x.w)||0):(parseFloat(x.q)||0),money=x.t==='sell'||x.t==='buy';
  const pg=g&&!x.pgM?Math.round((+rate||0)*(+x.ay||750)/750):+x.pg||0,q=g?Math.round(n*(+x.ay||750)/750*1000)/1000:n,amount=money?Math.round(n*pg):0;
  const e=x.t==='in'?q:x.t==='out'?-q:x.pul?(x.t==='sell'?q:-q):0;return{n,pg,q,amount,e}}
function xrLab(x){const g=x.a==='gold',A=g?'طلا':(XA[x.a]||{t:x.a}).t;
  if(g){if(x.t==='buy')return x.pul?'خرید پولی طلا':'خرید '+(x.cat&&x.cat!=='متفرقه'?'طلا · '+x.cat:'متفرقه');if(x.t==='sell')return x.pul?'فروش پولی طلا':'فروش '+(x.cat&&x.cat!=='متفرقه'?'طلا · '+x.cat:'متفرقه');return (x.t==='in'?'دریافت طلا':'تحویل طلا')}
  return XT[x.t]+(x.pul?' پولی ':' ')+A}
function xrSub(x,C){const g=x.a==='gold',m=x.t==='sell'||x.t==='buy';C=C||xrCalc(x,sv?sv.rate:0);
  return g?[wFmt(C.n)+' گرم',x.ay!=750?'عیار '+toFa(x.ay):'',m?'هر گرم '+fmt(C.pg):'',C.e&&Math.abs(C.e)!==C.n?'معادل '+wFmt(Math.abs(C.e))+' گرم ۱۸':''].filter(Boolean).join(' · ')
    :[qFmt(C.n)+' '+((XA[x.a]||{}).u||''),m?'هر واحد '+fmt(C.pg):''].filter(Boolean).join(' · ')}
function svTot(){let gold=0,aj=0,pr=0,tax=0,w=0;for(const it of sv.items){const c=itCalc(it,sv.rate,sv.tax);gold+=c.gold;aj+=c.aj;pr+=c.pr;tax+=c.tax;w+=+it.w||0}
  let xs=0,xb=0,ge=0;const xe={};for(const x of sv.xr||[]){const c=xrCalc(x,sv.rate);if(x.t==='sell')xs+=c.amount;else if(x.t==='buy')xb+=c.amount;if(c.e){if(x.a==='gold')ge+=c.e;else xe[x.a]=Math.round(((xe[x.a]||0)+c.e)*100)/100}}
  const sub=gold+aj+pr+tax,gross=sub+xs,disc=Math.min(+sv.disc||0,Math.max(0,gross)),total=gross-disc-xb,paid=svPaid();
  return{gold,aj,pr,tax,w:Math.round(w*1000)/1000,sub,xs,xb,disc,total,paid,rest:total-paid,ge:Math.round(ge*1000)/1000,xe}}
const svCu=()=>sv&&sv.cuId?CU().find(c=>String(c.id)===String(sv.cuId))||null:null;
const svHasG=()=>sv.items.length||(sv.xr||[]).some(x=>x.a==='gold'&&(x.t==='sell'||x.t==='buy')&&!x.pgM);
function vSell(){if(!sv){sv=ls.get('m_svd',null)||svBlank('')}svFix();svUsed=goodsUsed();const D=dates(sv.date);
  return `<div class="d6">
  <div class="d6hd"><button class="d6no" data-act="svCal"><small>${sv.dk==='buy'?'سند خرید':sv.items.length?'فاکتور':'سند'}</small><b>${toFa(invNext())}</b><span>${ic('cal')}${esc(payLab(sv.date)||D.fa)}</span></button>
    ${rateHTML()}</div>
  <div id="svCu">${svCuHTML()}</div>
  <div class="d6q" id="qa">${qaHTML()}</div>
  <div id="svRows"${render._same?'':' class="first"'}>${svRowsHTML()}</div>
  <div id="svSum">${svSumHTML()}</div>
</div>`}
/* v60.5: نرخ طلا: فقط یکی (مظنه یا هر گرم ۱۸) وارد می‌شود و دیگری خودکار حساب می‌شود (×/÷ ۴٫۳۳۱۸) */
const rtK=()=>ls.get('m_rtk','mz')==='g'?'g':'mz';
function rateHTML(){const k=rtK(),v=k==='mz'?sv.mz:sv.rate;
  return `<div class="d6rate${sv.rate?'':' need'}" id="svRate"><div class="d6seg" style="--i:${k==='mz'?0:1}"><i></i><button type="button" data-act="svRk" data-k="mz" class="${k==='mz'?'on':''}">مظنه</button><button type="button" data-act="svRk" data-k="g" class="${k==='g'?'on':''}">هر گرم ۱۸</button></div>
  <label class="d6rv"><input id="svM" class="ltr" inputmode="numeric" value="${v?Number(v).toLocaleString('en-US'):''}" placeholder="${k==='mz'?'مظنه روز':'نرخ هر گرم'}" autocomplete="off" enterkeyhint="next"><i>تومان</i></label>
  <div class="d6rx" id="svRx">${rateX()}</div></div>`}
const rateX=()=>sv.rate?(rtK()==='mz'?'هر گرم ۱۸: <b>'+fmt(sv.rate)+'</b>':'مظنه: <b>'+fmt(sv.mz)+'</b>'):'یکی را بزنید؛ دیگری خودکار حساب می‌شود';
ACT.svRk=d=>{const k=d.k==='g'?'g':'mz';if(k===rtK())return;ls.set('m_rtk',k);const w=$('svRate');if(!w)return;const s=w.querySelector('.d6seg');s.style.setProperty('--i',k==='mz'?0:1);s.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));
  const M=$('svM'),v=k==='mz'?sv.mz:sv.rate;M.value=v?Number(v).toLocaleString('en-US'):'';M.placeholder=k==='mz'?'مظنه روز':'نرخ هر گرم';$('svRx').innerHTML=rateX();w.classList.remove('flip');void w.offsetWidth;w.classList.add('flip');M.focus()};
const aSell=()=>`<div class="d6foot"><div id="svBal">${svBalHTML()}</div><button class="btn gold bzgo" data-act="svSave">${ic('check')} ثبت سند<span id="svBt">${svBtTxt()}</span></button></div>`;
const svBtTxt=()=>{if(!sv)return '';const T=svTot();return T.total&&(sv.rate||!svHasG())?fmt(Math.abs(T.total))+' تومان':''};
/* ----- مشتری ----- */
function svCuHTML(){const c=svCu();if(c){return `<div class="d6cu"><span class="c6a">${esc(userInit(c.name))}</span><span class="tx">${honTag(c.name)}<b>${esc(cuName(c))}</b><small>${[c.grp?'<em>'+esc(c.grp)+'</em>':'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span>${sv.fixCu?"":`<button class="lnk" data-act="svCuX">تغییر</button>`}</div>`}
  return `<div class="d6pick cbx"><div class="fsearch">${ic('search')}<input id="svQ" type="search" value="${esc(sv.q||'')}" placeholder="مشتری: نام، شماره، کد ملی یا گروه…" autocomplete="off" enterkeyhint="search"></div><div id="svCr">${svCrHTML()}</div></div>`}
function svCrHTML(){const q0=clean(sv.q||''),q=nzName(toEn(q0)),A=CU();
  if(!q)return '';
  const L=A.filter(c=>nzName([c.name,c.phone,c.nid,c.grp].join(' ')).includes(q)).sort((a,b)=>(nzName(b.name).startsWith(q)-nzName(a.name).startsWith(q))||String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,6);
  const add=!/^\d+$/.test(toEn(q0))&&!A.some(c=>nzName(c.name)===nzName(q0));
  return `<div class="bzsug cbl" role="listbox">${L.map(c=>cbRow('svCu',{id:c.id},esc(userInit(c.name)),esc(cuName(c)),[c.grp?esc(c.grp):'',c.phone?'<span class="ltr">'+esc(toFa(c.phone))+'</span>':''].filter(Boolean).join(' · ')||'حساب مشتری',`<span class="c6v">${balPills(cuBal(c))}</span>`)).join('')}
    ${cbRow('svCuNew',{},ic('plus'),add?'حساب تازه: «'+esc(q0)+'»':'افتتاح حساب تازه',(L.length?'':'مشتری‌ای پیدا نشد · ')+'اول مشخصات، بعد روی همین سند می‌نشیند','','nw')}</div>`}
function svPick(id){sv.cuId=id;sv.q='';svKeep();if(cur!=='sell')go('sell');else{$('svCu').innerHTML=svCuHTML();svRe()}const e=document.querySelector('.d6cu');if(e)e.classList.add('pop');setTimeout(()=>{const f=!sv.rate&&svHasG()?$('svM'):$('qK');if(f&&cur==='sell'&&$('ov').classList.contains('hide'))f.focus()},60)}
ACT.svCu=d=>svPick(d.id);
ACT.svCuX=()=>{sv.cuId='';sv.pays=sv.pays.filter(p=>p.m!=='cust');svKeep();$('svCu').innerHTML=svCuHTML();svBindCu();svRe();setTimeout(()=>{const q=$('svQ');if(q)q.focus()},60)};
ACT.svCuNew=()=>{cuRet='sell';sheet(cuFormHTML({name:clean(sv.q||'')}));cuBind();setTimeout(()=>{const n=$(sv.q?'cuP':'cuN');if(n)n.focus()},320)};
ACT.svCal=()=>openCal(sv.date,iso=>{sv.date=iso;svKeep();closeSheet();render()});
/* ----- ردیف تازه: یک جستجو برای همه چیز (مثل «شرح» در کیمیا) ----- */
let svUsed={};
const cbRow=(act,data,av,b,sub,v,cls)=>`<button type="button" class="bzsr${cls?' '+cls:''}" data-act="${act}"${Object.entries(data).map(([k,x])=>` data-${k}="${esc(x)}"`).join('')}><span class="av">${av}</span><span class="tx"><b>${b}</b><small>${sub}</small></span>${v?`<span class="cbv">${v}</span>`:''}</button>`;
/* ورودی‌های ویژه جستجو: x = ردیف طلا/سکه/ارز، p = ردیف پول */
const SPK=[
  {id:'xb',t:'خرید طلا (متفرقه)',d:'نرخ روز با عیار ۷۳۵ · به موجودی اضافه می‌شود',i:'coin',al:'خرید طلا متفرقه کهنه کارکرده آبشده طلای مشتری',x:['buy','gold']},
  {id:'xs',t:'فروش متفرقه',d:'نرخ روز با عیار ۷۴۰ · بدون اجرت',i:'coin',al:'فروش متفرقه طلا',x:['sell','gold']},
  {id:'xbp',t:'خرید پولی',d:'طلا تحویل نمی‌شود · مبلغ طلبکار، طلا بدهکار مشتری',i:'swap',al:'خرید پولی معامله پولی فردایی',x:['buy','gold',1]},
  {id:'xsp',t:'فروش پولی',d:'طلا تحویل نمی‌شود · مبلغ بدهکار، طلا طلبکار مشتری',i:'swap',al:'فروش پولی معامله پولی فردایی',x:['sell','gold',1]},
  {id:'xi',t:'دریافت طلا',d:'طلا از مشتری گرفتیم · به حساب طلایی او',i:'down',al:'دریافت طلا تحویل گرفتن طلا آبشده',x:['in','gold']},
  {id:'xo',t:'تحویل طلا',d:'طلا به مشتری دادیم · از حساب طلایی او',i:'share',al:'تحویل طلا پرداخت طلا',x:['out','gold']},
  ...Object.keys(XA).map(k=>({id:'a'+k,t:XA[k].t,d:XA[k].k==='c'?'فروش، خرید، دریافت یا تحویل سکه':'فروش، خرید، دریافت یا تحویل ارز',i:XA[k].k==='c'?'coin':'usd',al:XA[k].t+' '+(XA[k].k==='c'?'سکه':'ارز دلار یورو درهم'),x:['sell',k]})),
  {id:'pi',t:'دریافت وجه',d:'نقد، کارتخوان، حواله یا از حساب مشتری دیگر',i:'down',al:'دریافت وجه پول نقد واریز',p:['cash','in']},
  {id:'po',t:'پرداخت وجه',d:'نقد، حواله یا به حساب مشتری دیگر',i:'share',al:'پرداخت وجه پول نقد',p:['cash','out']},
  {id:'pp',t:'کارتخوان',d:'کشیدن کارت روی کارتخوان مغازه',i:'card',al:'کارتخوان کارت پوز',p:['pos','in']},
  {id:'ph',t:'حواله',d:'به یا از حساب‌های ما',i:'bank',al:'حواله کارت به کارت انتقال بانک ساتنا پایا',p:['hav','in']},
  {id:'pd',t:'تخفیف',d:'از جمع سند کم می‌شود',i:'tag',al:'تخفیف کسر',p:['disc','in']}];
function goodsUsed(){const u={};for(const c of custs)if(!c.del)for(const t of c.txs||[])if(t.type==='inv'&&!t.del)for(const i of t.items||[])u[i.k]=(u[i.k]||0)+1;return u}
function qaBlank(){const L=sv&&sv.items&&sv.items[sv.items.length-1],J=L?ajPT(L):{P:+ls.get('m_aj',0)||0,T:0};return{k:'',q:'',w:'',ay:750,ajP:J.P||'',ajT:J.T||'',pp:L?L.pp:PROFIT_DEF(),p:null,x:null,i:null}}
const pAmt=p=>+p.amount||0,svPaid=skip=>sv.pays.reduce((s,p,i)=>i===skip?s:s+pAmt(p),0);
const srcName=id=>{const s=sources.find(z=>String(z.id)===String(id));return s?s.name:''};
function pyLab(p,long){const ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId)),acc=p.srcId!=null?srcName(p.srcId):ch?ch.name:'',out=pAmt(p)<0,nm=p.cuName||((p.cuId&&custs.find(z=>String(z.id)===String(p.cuId)))||{}).name||'';
  switch(p.m){case 'cash':return out?'پرداخت نقد':'دریافت نقد';case 'pos':return 'کارتخوان'+(acc?' · '+acc:'');case 'hav':return (out?'پرداخت حواله':'دریافت حواله')+(acc?' · '+acc:'');
    case 'gold':return 'طلای مشتری · '+wFmt(p.w)+' گرم'+(long?' عیار '+toFa(p.ay||750):'');case 'dep':return 'حواله به «'+(p.entName||'')+'» (واریزی)';case 'cust':return out?'حواله به حساب «'+nm+'»':'حواله از حساب «'+nm+'»';default:return (PM[p.m]||{}).t||''}}
function qaChips(){const a=sv.qa,q=nzName(toEn(a.q||''));if(!q)return '';
  const A=goodsList().filter(k=>nzName(k).includes(q)).sort((x,y)=>(nzName(y).startsWith(q)-nzName(x).startsWith(q))||(svUsed[y]||0)-(svUsed[x]||0)).slice(0,5);
  const bu=sv.dk==='buy',S=SPK.filter(s=>nzName(s.t+' '+s.al).includes(q)).sort((a,b)=>bu?((b.x&&b.x[0]==='buy')-(a.x&&a.x[0]==='buy')):0).slice(0,6);
  const P=CH('pos').filter(c=>nzName(c.name).includes(q)).slice(0,3),B=sources.filter(s=>nzName(s.name+' '+(s.bank||'')).includes(q)).slice(0,3),U=CU().filter(c=>String(c.id)!==String(sv.cuId)&&nzName([c.name,c.phone,c.grp].join(' ')).includes(q)).slice(0,4);
  const rA=A.map(k=>cbRow('qaK',{k},ic('ring'),esc(k),'کالا · با اجرت و سود'+(svUsed[k]?' · '+toFa(svUsed[k])+' بار فروخته شده':''),'','gd')),rS=S.map(s=>cbRow('qaS',{s:s.id},ic(s.i),s.t,s.d,'','spk'));
  const rows=(bu?rS.concat(rA):rA.concat(rS))
    .concat(P.map(c=>cbRow('qaCh',{id:c.id},ic('card'),esc(c.name),'کارتخوان ما','<b class="chv">'+fmt(chBal(c))+'</b>','ch')))
    .concat(B.map(s=>{const e=acEst(s);return cbRow('qaSrc',{id:s.id},ic('bank'),esc(s.name),'حواله با حساب ما',e==null?'':'<b class="chv">'+fmt(e)+'</b>','ch')}))
    .concat(U.map(c=>cbRow('qaCu',{id:c.id},esc(userInit(c.name)),esc(cuName(c)),'حواله با حساب این مشتری',`<span class="c6v">${bpill('r',cuBal(c).R)}</span>`)));
  if(!A.some(k=>nzName(k)===q)&&!/^\d+$/.test(q))rows.push(cbRow('qaK',{k:clean(a.q)},ic('plus'),'کالای تازه «'+esc(clean(a.q))+'»','به فهرست کالاها اضافه می‌شود','','nw'));
  return `<div class="bzsug cbl" role="listbox">${rows.join('')}</div>`}
const numV=(v,dec)=>v===''||v==null||(!dec&&!+v)?'':dec?esc(v):Number(v).toLocaleString('en-US');
const cell=(id,lab,val,o={})=>`<label class="d6c${o.cls?' '+o.cls:''}"><small>${lab}</small><input id="${id}" class="ltr" inputmode="${o.im||'decimal'}" value="${val}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="done"${o.ro?' readonly':''}></label>`;
function qaHTML(){const a=sv.qa;if(a.p)return pyHTML();if(a.x)return xrHTML();
  if(!a.k)return `<div class="d6qh"><b>ردیف تازه</b><small>کالا، خرید و فروش طلا، سکه، ارز، دریافت و پرداخت</small></div>
  <div class="cbx"><div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="${sv.dk==='buy'?'جستجو: خرید طلا، سکه امامی، دلار، پرداخت…':'جستجو: انگشتر، خرید، پولی، امامی، دلار، دریافت…'}" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${qaChips()}</div></div>`;
  const ed=a.i!=null;
  return `<div class="d6qh"><b><span class="d6ti gd">${ic('ring')}</span>${esc(a.k)}</b><button class="lnk" data-act="${ed?'qaX':'qaK'}" data-k="">${ed?'بستن':'تغییر'}</button></div>
  <div class="d6g">${cell('qW','وزن (گرم)',numV(a.w,1),{ph:'0.000',cls:'w'})}${cell('qY','عیار',esc(a.ay||750),{im:'numeric'})}${cell('qJ','اجرت ٪',numV(a.ajP,1),{ph:'۰'})}${cell('qJT','اجرت تومانی',numV(a.ajT),{im:'numeric',ph:'۰'})}${cell('qS','سود ٪',numV(a.pp,1),{ph:'۰'})}<div class="d6c ro"><small>هر گرم این عیار</small><b id="qPg">—</b></div></div>
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="qaDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="qaAdd">${ic(ed?'check':'plus')} ${ed?'ذخیره':'افزودن'}</button></div>`}
function qaRead(){const a=sv.qa,g=id=>{const e=$(id);return e?e.value:undefined};if($('qW'))a.w=decIn(g('qW'));if($('qY'))a.ay=+toEn(g('qY')).replace(/\D/g,'')||'';if($('qJ'))a.ajP=decIn(g('qJ'));if($('qJT'))a.ajT=num(g('qJT'));if($('qS'))a.pp=decIn(g('qS'));if($('qK'))a.q=g('qK');if(a.p)pyRead();if(a.x)xrRead()}
const qaIt=a=>({k:a.k,w:parseFloat(a.w)||0,ay:+a.ay||750,ajP:parseFloat(a.ajP)||0,ajT:+a.ajT||0,pp:parseFloat(a.pp)||0});
function qaCalc(){const B=$('qB');if(!B)return;qaRead();const a=sv.qa;if(a.p){pyHint();return}if(a.x){xrHint();return}const it=qaIt(a),c=itCalc(it,sv.rate,sv.tax),pg=$('qPg');if(pg)pg.textContent=sv.rate?fmt(Math.round(sv.rate*it.ay/750)):'—';
  B.innerHTML=!sv.rate?'<small>مظنه یا نرخ گرم را بالای سند بزنید</small>':!it.w?'<small>وزن را بزنید</small>':`<button type="button" class="d6bt" data-act="qaBrk"><span>مبلغ این کالا</span><b>${fmt(c.tot)}</b><i>جزئیات ${ic('back').replace('class="i"','class="i flip"')}</i></button>`}
/* v60.8: جزئیات طلا/اجرت/سود پنهان؛ با زدن (یا نگه داشتن) روی مبلغ، در یک حباب کوچک مثل پیام نشان داده می‌شود */
const brkRows=(L,t)=>`<div class="bubt">${t}</div>${L.filter(Boolean).map(([l,v,c])=>`<div class="bubr${c?' '+c:''}"><span>${l}</span><b>${v}</b></div>`).join('')}`;
function bubble(el,html){bubClose();if(!el)return;const b=document.createElement('div');b.className='bub';b.setAttribute('role','dialog');b.innerHTML=html;document.body.appendChild(b);
  const r=el.getBoundingClientRect(),W=Math.min(300,innerWidth-24);b.style.width=W+'px';const x=Math.max(12,Math.min(innerWidth-W-12,r.left+r.width/2-W/2));b.style.left=x+'px';
  const h=b.offsetHeight,up=r.top-h-12>60;b.style.top=(up?r.top-h-10:r.bottom+10)+'px';b.classList.add(up?'up':'dn');b.style.setProperty('--ax',(r.left+r.width/2-x)+'px');
  try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}setTimeout(()=>{document.addEventListener('pointerdown',bubOut,true);addEventListener('scroll',bubClose,true)},0)}
function bubOut(e){if(!e.target.closest('.bub'))bubClose()}
function bubClose(){document.removeEventListener('pointerdown',bubOut,true);removeEventListener('scroll',bubClose,true);document.querySelectorAll('.bub').forEach(b=>{b.classList.add('out');setTimeout(()=>b.remove(),180)})}
ACT.qaBrk=(d,el)=>{qaRead();const it=qaIt(sv.qa),c=itCalc(it,sv.rate,sv.tax);bubble(document.querySelector('.d6bt'),brkRows([['طلا · '+wFmt(it.w)+' گرم',fmt(c.gold)],['اجرت',fmt(c.aj)],['سود',fmt(c.pr)],c.tax?['مالیات',fmt(c.tax)]:null,['مبلغ',fmt(c.tot),'t']],esc(it.k)))};
ACT.svBrk=()=>{const T=svTot();bubble(document.querySelector('.d6tot'),brkRows([sv.items.length?['بهای طلا · '+wFmt(T.w)+' گرم',fmt(T.gold)]:null,sv.items.length?['اجرت ساخت',fmt(T.aj)]:null,sv.items.length?['سود فروشنده',fmt(T.pr)]:null,T.tax?['مالیات',fmt(T.tax)]:null,T.xs?['فروش طلا، سکه و ارز',fmt(T.xs)]:null,T.disc?['تخفیف','− '+fmt(T.disc)]:null,T.xb?['خرید از مشتری','− '+fmt(T.xb)]:null,['جمع سند',fmt(Math.abs(T.total)),'t']],'جزئیات سند'))};
/* در سند: رنگ و نوشته از دید مغازه — طلبکاریم (مشتری به ما بدهکار) قرمز، بدهکاریم (ما به مشتری) آبی */
const ourLab=v=>!v?'تسویه':v<0?'طلبکاریم':'بدهکاریم';
/* عیار و عددها: با زدن روی کادر، کل عدد انتخاب می‌شود و با تایپ جایگزین */
const selOnFocus=el=>{if(el&&!el.readOnly)el.addEventListener('focus',()=>setTimeout(()=>{try{el.select()}catch(e){}},0))};
function qaBind(){const K=$('qK'),a=sv.qa,keep=()=>{qaRead();svKeep()};
  if(a.p){pyBind();return}if(a.x){xrBind();return}
  if(K){K.oninput=()=>{a.q=K.value;clearTimeout(K._t);K._t=setTimeout(()=>{const r=$('qKs');if(r)r.innerHTML=qaChips()},60);svKeep()};
    K.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();a.q=K.value;const r=$('qKs');if(r)r.innerHTML=qaChips();const f=document.querySelector('#qKs [data-act]');if(f)ACT[f.dataset.act]({...f.dataset})}};
    const KS=$('qKs');if(KS)KS.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
  const ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.qaAdd()}};
  [['qW','d'],['qY','i'],['qJ','d'],['qJT','n'],['qS','d']].forEach(([id,k])=>{const el=$(id);if(!el)return;selOnFocus(el);el.onkeydown=ent;el.oninput=()=>{if(k==='d')el.value=decIn(el.value);else if(k==='i')el.value=toEn(el.value).replace(/\D/g,'').slice(0,3);else{const v=num(el.value);el.value=v?v.toLocaleString('en-US'):''}keep();qaCalc()}});
  qaCalc()}
const qaRe=f=>{const q=$('qa');if(!q)return;q.innerHTML=qaHTML();qaBind();const e=f&&$(f);if(e)e.focus({preventScroll:false});q.classList.remove('swap');void q.offsetWidth;q.classList.add('swap')};
const qaDone=()=>{sv.qa=qaBlank();svKeep();qaRe();svRe();setTimeout(()=>{const k=$('qK');if(k&&$('ov').classList.contains('hide'))k.focus({preventScroll:true})},30)};
ACT.qaK=d=>{qaRead();const a=sv.qa;a.k=d.k?clean(d.k):'';a.i=null;if(a.k)addGoods(a.k);a.q='';svKeep();qaRe(a.k?'qW':'qK')};
ACT.qaS=d=>{const s=SPK.find(z=>z.id===d.s);if(!s)return;qaRead();if(s.x){if(s.x[1]==='gold'&&s.x[0]!=='in'&&s.x[0]!=='out'&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);$('svM').focus();return}xrStart(xrNew(s.x[0],s.x[1],{pul:!!s.x[2]}));return}
  if(s.p[0]==='disc'){pyStart(pyNew('disc'));return}pyStart(pyNew(s.p[0],{dir:s.p[1]}))};
ACT.qaAdd=()=>{qaRead();const a=sv.qa;if(!a.k){toast('کالا را انتخاب کنید',true);const k=$('qK');if(k)k.focus();return}const it0=qaIt(a);if(!it0.w){toast('وزن را بزنید',true);$('qW').focus();return}
  const old=a.i!=null?sv.items[a.i]:null,it={...it0,cat:old&&old.cat?old.cat:GK.includes(a.k)?a.k:'نو',n:old?old.n||'':''};if(it.pp)ls.set('m_profit',it.pp);ls.set('m_aj',it.ajP);
  if(a.i!=null){sv.items[a.i]=it;svAdd=a.i}else{sv.items.push(it);svAdd=sv.items.length-1;svUsed[it.k]=(svUsed[it.k]||0)+1}const ay=it.ay;qaDone();sv.qa.ay=ay};
ACT.qaDel=()=>{const a=sv.qa;if(a.i==null)return;const k=sv.items.splice(a.i,1)[0];qaDone();toast('«'+(k&&k.k)+'» از سند حذف شد','', 'بازگردانی',()=>{if(k){sv.items.push(k);svKeep();svRe()}})};
ACT.svItEdit=d=>{const it=sv.items[+d.i];if(!it)return;qaRead();const J=ajPT(it);sv.qa={...qaBlank(),k:it.k,w:String(it.w),ay:it.ay||750,ajP:J.P||'',ajT:J.T||'',pp:it.pp,i:+d.i};svKeep();qaRe('qW');const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
/* ----- ردیف طلا / سکه / ارز ----- */
const xrStart=x=>{qaRead();sv.qa.x=x;sv.qa.p=null;sv.qa.q='';svKeep();qaRe()};
function xrHTML(){const x=sv.qa.x,g=x.a==='gold',m=x.t==='sell'||x.t==='buy',ed=x.i!=null,C=xrCalc(x,sv.rate);
  const kinds=['gold',...Object.keys(XA)].map(k=>`<button class="${x.a===k?'on':''}" data-act="xrA" data-a="${k}">${k==='gold'?'طلا':esc(XA[k].s)}</button>`).join('');
  return `<div class="d6qh"><b><span class="d6ti x-${x.t}">${ic(g?'coin':(XA[x.a]||{}).k==='f'?'usd':'coin')}</span>${esc(xrLab(x))}</b><button class="lnk" data-act="qaX">${ed?'بستن':'انصراف'}</button></div>
  <div class="d6kd">${kinds}</div>
  <div class="seg2 d6seg">${Object.entries(XT).map(([k,t])=>`<button class="${x.t===k?'on':''}" data-act="xrT" data-t="${k}">${t}</button>`).join('')}</div>
  ${m?`<label class="d6sw"><input type="checkbox" id="xrP"${x.pul?' checked':''}><span class="tgx"></span><span><b>پولی</b><small>${x.pul?(x.t==='sell'?'جنس تحویل نمی‌شود؛ مشتری مبلغ را بدهکار و جنس را طلبکار می‌شود':'جنس تحویل گرفته نمی‌شود؛ مشتری مبلغ را طلبکار و جنس را بدهکار می‌شود'):'جنس همین الان جابه‌جا می‌شود'}</small></span></label>`:''}
  <div class="d6g">${g?cell('xrW','وزن (گرم)',numV(x.w,1),{ph:'0.000',cls:'w'})+cell('xrY','عیار',esc(x.ay||750),{im:'numeric'}):cell('xrQ','تعداد / مقدار ('+esc(XA[x.a].u)+')',numV(x.q,1),{ph:'۰',cls:'w'})}
    ${m?cell('xrG',g?'هر گرم'+(x.pgM?' (دستی)':''):'نرخ هر '+esc(XA[x.a].u),C.pg?Number(C.pg).toLocaleString('en-US'):'',{im:'numeric',ph:'تومان'})+`<div class="d6c ro"><small>مبلغ</small><b id="xrA">${C.amount?fmt(C.amount):'—'}</b></div>`:''}</div>
  ${g&&m&&x.pgM?`<button class="lnk d6rs" data-act="xrPgR">برگشت به نرخ مظنه</button>`:''}
  ${g&&!x.pul?`<div class="d6cat"><small>${x.t==='buy'||x.t==='in'?'اضافه شود به موجودی':'کم شود از موجودی'}</small><div class="gks">${GK.map(k=>`<button class="tch${(x.cat||'متفرقه')===k?' on':''}" data-act="xrCat" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>`:''}
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="xrDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="xrSave">${ic('check')} ${ed?'ذخیره':'افزودن'}</button></div>`}
function xrRead(){const x=sv.qa.x,g=id=>{const e=$(id);return e?e.value:undefined};if(!x)return;if($('xrW'))x.w=decIn(g('xrW'));if($('xrQ'))x.q=decIn(g('xrQ'));if($('xrY'))x.ay=+toEn(g('xrY')).replace(/\D/g,'')||'';if($('xrP'))x.pul=$('xrP').checked;
  if($('xrG')){const v=num(g('xrG'));if(x.a==='gold'){const auto=Math.round((+sv.rate||0)*(+x.ay||750)/750);if(v&&v!==auto&&document.activeElement===$('xrG')){x.pgM=true;x.pg=v}else if(x.pgM)x.pg=v}else x.pg=v}}
function xrHint(){const B=$('qB'),x=sv.qa.x;if(!B||!x)return;const C=xrCalc(x,sv.rate),A=$('xrA');if(A)A.textContent=C.amount?fmt(C.amount):'—';const G=$('xrG');if(G&&document.activeElement!==G&&x.a==='gold'&&!x.pgM)G.value=C.pg?C.pg.toLocaleString('en-US'):'';
  const u=x.a==='gold'?'گرم':(XA[x.a]||{}).u,qv=x.a==='gold'?wFmt(Math.abs(C.e)):qFmt(Math.abs(C.e)),R=x.t==='sell'?-C.amount:x.t==='buy'?C.amount:0,P=[];
  if(R)P.push(`مشتری <b>${fmt(Math.abs(R))}</b> تومان ${R<0?'بدهکار':'طلبکار'}`);if(C.e)P.push(`<b>${qv}</b> ${u}${x.a==='gold'&&x.ay!=750?' (۱۸ عیار)':''} ${C.e<0?'بدهکار':'طلبکار'}`);
  B.innerHTML=!C.n?'<small>'+(x.a==='gold'?'وزن را بزنید':'تعداد را بزنید')+'</small>':P.length?'<span class="t">'+P.join(' · ')+'</span>':'<small>فقط موجودی مغازه عوض می‌شود</small>'}
function xrBind(){const x=sv.qa.x,keep=()=>{xrRead();svKeep();xrHint()},ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.xrSave()}};
  [['xrW','d'],['xrQ','d'],['xrY','i'],['xrG','n']].forEach(([id,k])=>{const el=$(id);if(!el)return;selOnFocus(el);el.onkeydown=ent;el.oninput=()=>{if(k==='d')el.value=decIn(el.value);else if(k==='i')el.value=toEn(el.value).replace(/\D/g,'').slice(0,3);else{const v=num(el.value);el.value=v?v.toLocaleString('en-US'):''}keep()}});
  const P=$('xrP');if(P)P.onchange=()=>{const was=!P.checked;if(x.a==='gold'&&+x.ay===xrAy(x.t,was)){x.ay=xrAy(x.t,P.checked);const Y=$('xrY');if(Y)Y.value=x.ay}xrRead();svKeep();qaRe()};xrHint();
  setTimeout(()=>{if(!$('ov').classList.contains('hide'))return;const f=$('xrW')||$('xrQ');if(f&&!f.value&&document.activeElement!==f)f.focus({preventScroll:true})},40)}
ACT.xrT=d=>{xrRead();const x=sv.qa.x;if(x.t===d.t)return;const g=x.a==='gold',np=(d.t==='sell'||d.t==='buy')&&x.pul;if(g&&+x.ay===xrAy(x.t,x.pul))x.ay=xrAy(d.t,np);x.t=d.t;x.pul=np;if(g&&(d.t==='in'||d.t==='out')&&x.cat==='متفرقه')x.cat='آبشده';svKeep();qaRe()};
ACT.xrA=d=>{xrRead();const x=sv.qa.x;if(x.a===d.a)return;const n=xrNew(x.t,d.a,{pul:x.pul,i:x.i});if(d.a==='gold'&&(x.t==='sell'||x.t==='buy')&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true)}sv.qa.x=n;svKeep();qaRe()};
ACT.xrCat=d=>{xrRead();sv.qa.x.cat=d.k;svKeep();qaRe()};
ACT.xrPgR=()=>{xrRead();const x=sv.qa.x;x.pgM=false;x.pg=0;svKeep();qaRe()};
ACT.xrSave=()=>{xrRead();const x=sv.qa.x;if(!x)return;const C=xrCalc(x,sv.rate),g=x.a==='gold',m=x.t==='sell'||x.t==='buy';
  if(!C.n){toast(g?'وزن را بزنید':'تعداد را بزنید',true);const f=$('xrW')||$('xrQ');if(f)f.focus();return}if(g&&!(+x.ay)){toast('عیار را بزنید',true);$('xrY').focus();return}
  if(m&&!C.pg){toast(g?'مظنه یا نرخ گرم را بالای سند بزنید':'نرخ هر واحد را بزنید',true);const f=g&&!x.pgM?$('svM'):$('xrG');if(f)f.focus();return}
  if(!g&&m)ls.set('m_px_'+x.a,x.pg);const o={t:x.t,a:x.a,pul:!!x.pul,w:g?C.n:0,q:g?0:C.n,ay:g?+x.ay:0,pg:x.pgM||!g?+x.pg:0,pgM:!!(g&&x.pgM),cat:g?x.cat||'متفرقه':''};
  if(x.i!=null)sv.xr[x.i]=o;else sv.xr.push(o);qaDone()};
ACT.xrDel=()=>{const x=sv.qa.x;if(!x||x.i==null)return;const o=sv.xr.splice(x.i,1)[0];qaDone();toast('ردیف حذف شد','', 'بازگردانی',()=>{if(o){sv.xr.push(o);svKeep();svRe()}})};
ACT.svXrEdit=d=>{const o=sv.xr[+d.i];if(!o)return;qaRead();xrStart({...o,w:o.w?String(o.w):'',q:o.q?String(o.q):'',i:+d.i});const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
/* ----- ردیف پول: دریافت یا پرداخت · نقد، کارتخوان، حواله (حساب‌های ما) یا حساب مشتری دیگر ----- */
function pyLeft(p){const T=svTot(),r=T.total-svPaid(p.i),c=svCu();if(!r&&c&&!sv.items.length&&!(sv.xr||[]).length){const b=cuBal(c).R-svPaid(p.i);return p.dir==='out'?Math.max(0,b):Math.max(0,-b)}return p.dir==='out'?Math.max(0,-r):Math.max(0,r)}
function pyNew(m,o){const p={m,dir:'in',amount:0,q:'',tn:'',...(o||{})};if(m==='pos')p.dir='in';pyAcc(p);
  if(m==='disc')p.amount=+sv.disc||0;else{p.amount=pyLeft(p);if(m==='cust')pyCuCap(p)}return p}
/* حساب پیش‌فرض: آخرین کارتخوان یا حساب استفاده‌شده */
function pyAcc(p){if(p.m==='pos'&&!p.chId){const L=CH('pos'),last=ls.get('m_ch_pos','');p.chId=(L.find(c=>String(c.id)===String(last))||L[0]||{}).id||''}
  if(p.m==='hav'&&p.srcId==null&&!p.chId){const last=ls.get('m_src_hav','');const s=sources.find(z=>String(z.id)===String(last))||sources[0];if(s)p.srcId=s.id;else{const B=CH('bank');if(B[0])p.chId=B[0].id}}}
function pyCuCap(p){const c=CU().find(z=>String(z.id)===String(p.cuId));if(!c)return;p.cuName=cuName(c);if(p.dir==='in'){const cr=Math.max(0,cuBal(c).R);if(cr)p.amount=Math.min(pyLeft(p),cr)}}
const pyStart=p=>{qaRead();sv.qa.p=p;sv.qa.x=null;sv.qa.q='';svKeep();qaRe()};
ACT.qaCh=d=>{const c=CH().find(z=>String(z.id)===String(d.id));if(!c)return;pyStart(pyNew(c.kind==='pos'?'pos':'hav',{chId:c.id}))};
ACT.qaSrc=d=>pyStart(pyNew('hav',{srcId:+d.id||d.id}));
ACT.qaCu=d=>{if(!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}pyStart(pyNew('cust',{cuId:d.id}))};
ACT.qaX=()=>{sv.qa.p=null;sv.qa.x=null;sv.qa.i=null;sv.qa.k='';svKeep();qaRe('qK')};
function pyHTML(){const p=sv.qa.p,ed=p.i!=null;let b='';
  if(p.m==='disc')return `<div class="d6qh"><b><span class="d6ti pm-disc">${ic('tag')}</span>تخفیف</b><button class="lnk" data-act="qaX">${ed||sv.disc?'بستن':'انصراف'}</button></div>
  <div class="d6g g1">${cell('pyA','مبلغ تخفیف (تومان)',numV(p.amount),{im:'numeric',cls:'w'})}</div><div class="d6br" id="qB"></div><div class="d6qf"><button class="qago" data-act="pySave">${ic('check')} ثبت تخفیف</button></div>`;
  if(p.m==='gold')return `<div class="d6qh"><b>طلای مشتری</b><button class="lnk" data-act="qaX">بستن</button></div><div class="d6br"><small>این ردیف قدیمی است؛ آن را حذف کنید و با «خرید طلا» دوباره بزنید.</small></div><div class="d6qf"><button class="qago red" data-act="pyDel" aria-label="حذف">${ic('trash')}</button></div>`;
  const out=p.dir==='out';
  b+=`<div class="seg2 d6seg"><button class="${!out?'on':''}" data-act="pyD" data-d="in">دریافت از مشتری</button><button class="${out?'on':''}" data-act="pyD" data-d="out"${p.m==='pos'?' disabled':''}>پرداخت به مشتری</button></div>
  <div class="d6pm">${['cash','pos','hav','cust'].map(m=>`<button class="${p.m===m?'on':''}" data-act="pyM" data-m="${m}"${m==='pos'&&out?' disabled':''}>${ic(PM[m].i)}<span>${PM[m].t}</span></button>`).join('')}</div>`;
  if(p.m==='pos'){const L=CH('pos');b+=`<div class="d6l"><small>کدام کارتخوان</small><div class="chps">${L.map(c=>`<button class="chp${String(p.chId)===String(c.id)?' on':''}" data-act="pyCh" data-id="${c.id}">${ic('card')}<span><b>${esc(c.name)}</b><small>مانده ${fmt(chBal(c))}</small></span></button>`).join('')}</div>
    <div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="کارتخوان تازه، مثلاً پوز ملت" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="pyChAdd">افزودن</button></div></div>`}
  if(p.m==='hav'){const B=CH('bank');b+=`<div class="d6l"><small>${out?'از کدام حساب ما':'به کدام حساب ما'}</small><div class="chps">${sources.map(s=>{const e=acEst(s),bk=acBank(s);return `<button class="chp${p.srcId!=null&&String(p.srcId)===String(s.id)?' on':''}" data-act="pySrc" data-id="${s.id}">${bk?bankBadge(bk):ic('bank')}<span><b>${esc(s.name)}</b><small>${e==null?(bk?'بانک '+esc(bk):'حساب ما'):'موجودی '+fmt(e)}</small></span></button>`}).join('')}${B.map(c=>`<button class="chp${p.srcId==null&&String(p.chId)===String(c.id)?' on':''}" data-act="pyCh" data-id="${c.id}">${ic('bank')}<span><b>${esc(c.name)}</b><small>مانده ${fmt(chBal(c))}</small></span></button>`).join('')}</div>
    ${can('src')?`<div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="حساب تازه ما، مثلاً سامان" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="pyChAdd">افزودن</button></div>`:''}</div>`}
  if(p.m==='cust'){const C=CU().find(c=>String(c.id)===String(p.cuId));b+=`<div class="d6l"><small>${out?'به حساب کدام مشتری':'از طلب کدام مشتری'}</small>${C?`<div class="d6cu sm"><span class="c6a">${esc(userInit(C.name))}</span><span class="tx"><b>${esc(cuName(C))}</b><small>${cuLab(cuBal(C).R)} ${cuBal(C).R?fmt(Math.abs(cuBal(C).R))+' تومان':''}</small></span><button class="lnk" data-act="pyCu" data-id="">تغییر</button></div>`
      :`<div class="cbx"><div class="fsearch sm">${ic('search')}<input id="pyQ" value="${esc(p.q||'')}" placeholder="نام مشتری…" autocomplete="off"></div><div id="pyCr">${pyCrHTML()}</div></div>`}</div>`}
  b+=`<div class="d6g ${p.m==='pos'||p.m==='hav'?'':'g1'}">${cell('pyA','مبلغ (تومان)',numV(p.amount),{im:'numeric',cls:'w'})}${p.m==='pos'||p.m==='hav'?cell('pyT','پیگیری (اختیاری)',esc(p.tn||''),{im:'numeric'}):''}</div>`;
  return `<div class="d6qh"><b><span class="d6ti ${out?'pm-out':'pm-in'}">${ic(out?'share':'down')}</span>${out?'پرداخت وجه':'دریافت وجه'}</b><button class="lnk" data-act="qaX">${ed?'بستن':'انصراف'}</button></div>${b}
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="pyDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="pySave">${ic('check')} ${ed?'ذخیره':'افزودن'}</button></div>`}
function pyCrHTML(){const p=sv.qa.p,q=nzName(toEn(clean(p.q||'')));let L=CU().filter(c=>String(c.id)!==String(sv.cuId)).map(c=>[c,cuBal(c)]);if(q)L=L.filter(([c])=>nzName([c.name,c.phone,c.grp].join(' ')).includes(q));else L=L.filter(([,b])=>p.dir==='out'?true:b.R>0).sort((a,b)=>String(b[0].lastAt||'').localeCompare(String(a[0].lastAt||'')));
  L=L.slice(0,q?6:3);if(!L.length)return q?'<div class="eh">مشتری‌ای پیدا نشد</div>':'';
  return `<div class="bzsug cbl" role="listbox">${L.map(([c,b])=>cbRow('pyCu',{id:c.id},esc(userInit(c.name)),esc(cuName(c)),c.phone?'<span class="ltr">'+esc(toFa(c.phone))+'</span>':'مشتری',`<span class="c6v">${bpill('r',b.R)||'<span class="bp z"><small>تسویه</small></span>'}</span>`)).join('')}</div>`}
function pyRead(){const p=sv.qa.p,g=id=>{const e=$(id);return e?e.value:undefined};if(!p)return;if($('pyA'))p.amount=num(g('pyA'));if($('pyT'))p.tn=toEn(g('pyT')||'').trim();if($('pyQ'))p.q=g('pyQ')}
function pyHint(){const B=$('qB'),p=sv.qa.p;if(!B||!p)return;if(p.m==='disc'){B.innerHTML='<small>از جمع سند کم می‌شود</small>';return}if(p.m==='gold')return;const r=svTot().total-svPaid(p.i),l=pyLeft(p);
  const c=svCu(),cb=c?cuBal(c).R-svPaid(p.i):0,docOnly=!r&&c&&!sv.items.length&&!(sv.xr||[]).length;
  B.innerHTML=docOnly?(cb?`<small>مانده مشتری: ${cuLab(cb)}</small> <b>${fmt(Math.abs(cb))}</b>`:'<small>حساب ریالی مشتری تسویه است</small>'):!r?'<small>بدون این ردیف، سند تسویه است</small>':`<small>${r>0?'مشتری در این سند بدهکار':'مشتری در این سند طلبکار'}</small> <b>${fmt(Math.abs(r))}</b>`;if(l&&l!==+p.amount)B.innerHTML+=' <button class="lnk" data-act="pyAll">همه</button>'}
function pyBind(){const p=sv.qa.p,A=$('pyA'),Q=$('pyQ'),CN=$('pyCn'),T=$('pyT'),keep=()=>{pyRead();svKeep();pyHint()},ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.pySave()}};
  if(A){selOnFocus(A);A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';keep()};A.onkeydown=ent}if(T){T.oninput=keep;T.onkeydown=ent}
  if(Q){Q.oninput=()=>{p.q=Q.value;$('pyCr').innerHTML=pyCrHTML()};const R=$('pyCr');if(R)R.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
  if(CN)CN.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.pyChAdd()}};
  pyHint();setTimeout(()=>{if(!$('ov').classList.contains('hide')||p.m==='gold')return;const f=Q&&!p.cuId?Q:A;if(f&&document.activeElement!==f)f.focus({preventScroll:true})},40)}
ACT.pyD=d=>{pyRead();const p=sv.qa.p;if(p.dir===d.d||(p.m==='pos'&&d.d==='out'))return;p.dir=d.d;p.amount=pyLeft(p);if(p.m==='cust')pyCuCap(p);svKeep();qaRe()};
ACT.pyM=d=>{pyRead();const p=sv.qa.p;if(p.m===d.m)return;if(d.m==='cust'&&!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}p.m=d.m;if(d.m==='pos')p.dir='in';if(d.m!=='cust'){delete p.cuId;delete p.cuName}if(d.m!=='hav')delete p.srcId;if(d.m!=='pos'&&d.m!=='hav')p.chId='';else if(d.m==='pos'||d.m==='hav'){const c=p.chId&&CH().find(z=>String(z.id)===String(p.chId));if(c&&(c.kind==='pos')!==(d.m==='pos'))p.chId=''}pyAcc(p);if(!p.amount)p.amount=pyLeft(p);svKeep();qaRe(d.m==='cust'?'pyQ':'')};
ACT.pyCh=d=>{pyRead();const p=sv.qa.p;p.chId=d.id;delete p.srcId;svKeep();qaRe()};
ACT.pySrc=d=>{pyRead();const p=sv.qa.p;p.srcId=+d.id||d.id;p.chId='';svKeep();qaRe()};
ACT.pyCu=d=>{pyRead();const p=sv.qa.p;if(d.id){if(!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}p.m='cust';p.cuId=d.id;p.chId='';delete p.srcId;p.amount=pyLeft(p);pyCuCap(p)}else{p.cuId='';p.q=''}svKeep();qaRe(d.id?'':'pyQ')};
ACT.pyAll=()=>{pyRead();const p=sv.qa.p;p.amount=pyLeft(p);svKeep();qaRe()};
ACT.pyChAdd=()=>{pyRead();const p=sv.qa.p,n=$('pyCn'),name=clean((n&&n.value)||'');if(!name){toast(p.m==='pos'?'نام کارتخوان را بنویسید':'نام حساب را بنویسید',true);if(n)n.focus();return}
  if(p.m==='pos'){const r=chNew(name,'pos');if(r){p.chId=r.id;svKeep();qaRe();toast('«'+name+'» اضافه شد')}return}const s=srcQuick(name);if(s){p.srcId=s.id;p.chId='';svKeep();qaRe();toast('حساب «'+name+'» اضافه شد')}};
ACT.pySave=()=>{pyRead();const p=sv.qa.p;if(!p)return;const amt=+p.amount||0;
  if(p.m==='disc'){sv.disc=amt;if(amt)toast('تخفیف '+fmt(amt)+' تومان ثبت شد');qaDone();return}
  if(p.m==='pos'&&!p.chId){toast('کارتخوان را انتخاب یا اضافه کنید',true);return}if(p.m==='hav'&&p.srcId==null&&!p.chId){toast('حساب را انتخاب یا اضافه کنید',true);return}
  if(p.m==='cust'&&!p.cuId){toast('حساب مشتری را انتخاب کنید',true);return}
  if(!(amt>0)){toast('مبلغ را وارد کنید',true);const a=$('pyA');if(a)a.focus();return}
  const sg=p.dir==='out'&&p.m!=='pos'?-1:1,o={m:p.m,amount:sg*amt};
  if(p.m==='pos'){o.chId=p.chId;o.tn=p.tn||'';ls.set('m_ch_pos',p.chId)}
  if(p.m==='hav'){if(p.srcId!=null){o.srcId=p.srcId;ls.set('m_src_hav',p.srcId)}else o.chId=p.chId;o.tn=p.tn||''}
  if(p.m==='cust')Object.assign(o,{cuId:p.cuId,cuName:p.cuName||''});
  if(p.i!=null)sv.pays[p.i]=o;else sv.pays.push(o);qaDone()};
ACT.pyDel=()=>{const p=sv.qa.p;if(!p||p.i==null)return;const o=sv.pays.splice(p.i,1)[0];qaDone();toast('ردیف حذف شد','', 'بازگردانی',()=>{if(o){sv.pays.push(o);svKeep();svRe()}})};
ACT.svPayEdit=d=>{const o=sv.pays[+d.i];if(!o)return;qaRead();const p={...o,i:+d.i,dir:pAmt(o)<0?'out':'in',amount:Math.abs(pAmt(o)),q:''};pyStart(p);const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
ACT.svDisc=()=>{qaRead();pyStart(pyNew('disc'));const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
ACT.svRowDel=d=>{const L=d.k==='it'?sv.items:d.k==='xr'?sv.xr:d.k==='py'?sv.pays:null;let o;if(d.k==='dc'){o=sv.disc;sv.disc=0}else if(L)o=L.splice(+d.i,1)[0];if(sv.qa.i!=null||(sv.qa.p&&sv.qa.p.i!=null)||(sv.qa.x&&sv.qa.x.i!=null))sv.qa=qaBlank();svKeep();qaRe();svRe();
  toast('ردیف حذف شد','', 'بازگردانی',()=>{if(d.k==='dc')sv.disc=o;else if(L&&o)L.splice(+d.i,0,o);svKeep();svRe()})};
/* ----- ردیف‌های سند: مثل جدول کیمیا، هر ردیف با اثرش بر حساب مشتری (بدهکار / طلبکار) ----- */
function svRowsHTML(){const R=[],eff=(v,k)=>v?`<span class="d6e ${v<0?'d':'c'}"><b>${balV(k||'r',v)}${k&&k!=='r'?' <i>'+balU(k)+'</i>':''}</b><small>${ourLab(v)}</small></span>`:'';
  const row=(k,i,act,ico,cls,b,sub,v)=>`<div class="d6r${k==='it'&&i===svAdd?' new':''}"><button class="d6rb" data-act="${act}" data-i="${i}"><span class="d6n">${toFa(R.length+1)}</span><span class="d6ti ${cls}">${ic(ico)}</span><span class="tx"><b>${b}</b><small>${sub}</small></span><span class="d6v">${v}</span></button><button class="d6x" data-act="svRowDel" data-k="${k}" data-i="${i}" aria-label="حذف">${ic('x')}</button></div>`;
  sv.items.forEach((it,i)=>{const c=itCalc(it,sv.rate,sv.tax);R.push(row('it',i,'svItEdit','ring','gd',esc(it.k)+(it.n?' <i>'+esc(it.n)+'</i>':''),`${wFmt(it.w)} گرم · عیار ${toFa(it.ay||750)} · اجرت ${ajLab(it)} · سود ${toFa(+it.pp||0)}٪`,sv.rate?eff(-c.tot):'<small class="d6nr">نرخ را بزنید</small>'))});
  (sv.xr||[]).forEach((x,i)=>{const C=xrCalc(x,sv.rate),R0=x.t==='sell'?-C.amount:x.t==='buy'?C.amount:0;R.push(row('xr',i,'svXrEdit',x.a==='gold'?'coin':(XA[x.a]||{}).k==='f'?'usd':'coin','x-'+x.t,esc(xrLab(x)),esc(xrSub(x,C)),eff(R0)+eff(C.e,x.a==='gold'?'g':x.a)))});
  if(+sv.disc)R.push(row('dc',0,'svDisc','tag','pm-disc','تخفیف','از جمع سند کم می‌شود',eff(+sv.disc)));
  sv.pays.forEach((p,i)=>{const out=pAmt(p)<0,M=PM[p.m]||PM.cash;R.push(row('py',i,'svPayEdit',M.i,out?'pm-out':'pm-in',esc(pyLab(p)),(out?'پرداخت به مشتری':'دریافت از مشتری')+(p.tn?' · پیگیری '+esc(p.tn):''),eff(pAmt(p))))});
  if(!R.length)return '';
  const nI=sv.items.length;
  return `<div class="d6sh"><b>ردیف‌های سند</b><small>${nI?toFa(nI)+' قلم کالا، ':''}${toFa(R.length)} ردیف · برای ویرایش بزنید</small></div><div class="d6rows">${R.join('')}</div>`}
function svSumHTML(){const T=svTot();if(!sv.items.length&&!(sv.xr||[]).length)return '';const row=(l,v,c)=>`<div${c?' class="'+c+'"':''}><span>${l}</span><b>${v}</b></div>`;
  return `<div class="d6sum">
  ${T.disc?row('تخفیف','− '+fmt(T.disc),'dc'):''}
  <button type="button" class="d6tot" data-act="svBrk"><span>${T.total<0?'خالص خرید (طلب مشتری)':'جمع سند'}<small>${toFa(sv.items.length+(sv.xr||[]).length)} قلم · جزئیات</small></span><b><span id="svTotN" data-v="${Math.abs(T.total)}">${fmt(Math.abs(T.total))}</span> <i>تومان</i></b></button></div>
`}
/* نوار مانده‌ها پایین صفحه (ثابت هنگام پیمایش): قبلی · این سند · نهایی برای ریالی، طلایی، سکه و ارز */
function svBalHTML(){if(!sv)return '';const c=svCu(),T=svTot(),b=c?cuBal(c):{R:0,G:0,X:{}},gc=sv.gconv&&T.rest>0&&sv.rate;
  const dr=-T.rest+(gc?T.rest:0),dg=Math.round((T.ge-(gc?T.rest/sv.rate:0))*1000)/1000;
  const keys=[...new Set([...Object.keys(b.X||{}),...Object.keys(T.xe||{})])];
  const L=[['r',b.R,dr],['g',b.G,dg],...keys.map(k=>[k,(b.X||{})[k]||0,(T.xe||{})[k]||0])].filter(([k,p,d],i)=>i===0||d||(c&&p&&k==='g'));
  if(!c&&!sv.items.length&&!sv.pays.length&&!(sv.xr||[]).length)return '';
  const v=(x,k,cls)=>`<span class="${cls||''} ${x<0?'d':x>0?'c':'z'}"><b>${x?balV(k,x):'۰'}</b><small>${ourLab(x)}</small></span>`;
  const lg=L.some(([k,p,d])=>[p,d,p+d].some(x=>balV(k,x).length>11));
  /* v60.9: کلید مالیات کنار مانده‌ها */
  const tx=sv.items.length?`<label class="d6sw sm d6tax${sv.tax?' on':''}"><input type="checkbox" id="svT"${sv.tax?' checked':''}><span class="tgx"></span><span><b>مالیات ۱۰٪</b><small>${sv.tax?fmt(T.tax)+' تومان':'اجرت و سود'}</small></span></label>`:'';
  return `${tx}<div class="d6bal${c?'':' noc'}${lg?' lg':''}">${c?'<div class="d6bh"><i></i><span>قبلی</span><span>این سند</span><span>نهایی</span></div>':''}${L.map(([k,p,d])=>{const f=k==='r'?Math.round(p+d):k==='g'?Math.round((p+d)*1000)/1000:Math.round((p+d)*100)/100;return `<div class="d6bl"><i>${k==='r'?'تومان':k==='g'?'طلا':esc((XA[k]||{s:k}).s)}</i>${c?v(p,k):''}${v(d,k,'doc')}${c?v(f,k,'fin'):''}</div>`}).join('')}</div>`}
function tween(el,to){if(!el)return;const from=+el.dataset.v||0;el.dataset.v=to;if(from===to||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=fmt(to);return}const t0=performance.now(),D=420;cancelAnimationFrame(el._r);
  const st=n=>{const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)el._r=requestAnimationFrame(st)};el._r=requestAnimationFrame(st);const p=el.closest('.d6tot');if(p){p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump')}}
function svRe(){const o=$('svTotN'),old=o?+o.dataset.v||0:0;const set=(id,h)=>{const e=$(id);if(e)e.innerHTML=h};set('svRows',svRowsHTML());set('svSum',svSumHTML());set('svBal',svBalHTML());
  document.querySelectorAll('.d6rt').forEach(l=>l.classList.toggle('need',!sv.rate));const bt=$('svBt');if(bt)bt.textContent=svBtTxt();qaCalc();
  const n=$('svTotN');if(n){const to=+n.dataset.v;n.dataset.v=old;n.textContent=fmt(old);tween(n,to)}svBindRest();svAdd=-1}
function svBindRest(){const G=$('svGc');if(G)G.onchange=()=>{sv.gconv=G.checked;svKeep();svRe()};const T=$('svT');if(T)T.onchange=()=>{sv.tax=T.checked;ls.set('m_tax',sv.tax);svKeep();svRe()}}
function svBindCu(){const Q=$('svQ');if(!Q)return;Q.oninput=()=>{sv.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{srchSwap('svCr',svCrHTML())},80)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(Q._t);sv.q=Q.value;const r=$('svCr');if(r)r.innerHTML=svCrHTML();const f=document.querySelector('#svCr [data-act=svCu]');if(f)svPick(f.dataset.id);else if(clean(Q.value))ACT.svCuNew()}};const C=$('svCr');if(C)C.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
function bindSell(){if(!sv)return;svBindCu();svBindRest();qaBind();const M=$('svM');TITLES.sell=sv.dk==='buy'?'سند خرید':'سند فروش';
  const setRate=(r,m)=>{sv.rate=r;sv.mz=m;if(r)ls.set('m_rate',r);if(m)ls.set('m_mz',m);const x=$('svRx'),w=$('svRate');if(x)x.innerHTML=rateX();if(w)w.classList.toggle('need',!r);svKeep();clearTimeout(bindSell._t);bindSell._t=setTimeout(()=>{if(cur!=='sell')return;svRe();if(sv.qa.x)xrHint()},140)};
  if(M){selOnFocus(M);M.oninput=()=>{const v=num(M.value);M.value=v?v.toLocaleString('en-US'):'';if(rtK()==='mz')setRate(rOfMz(v),v);else setRate(v,mzOf(v))}}
  [M].forEach(el=>{if(el)el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const f=!svCu()?$('svQ'):$('qK')||$('qW')||$('xrW')||$('pyA');if(f)f.focus()}}});
  setTimeout(()=>{if(cur!=='sell'||!$('ov').classList.contains('hide'))return;const f=!svCu()?$('svQ'):sv.qa.p||sv.qa.x?null:!sv.rate?M:!sv.items.length&&!sv.xr.length?$('qK'):null;if(f)f.focus()},380)}
/* ----- ثبت سند ----- */
ACT.svSave=()=>{const go=ckGo;ckGo=false;const c=svCu();if(!c){toast('مشتری سند را انتخاب کنید',true);const q=$('svQ');if(q){q.focus();q.scrollIntoView({behavior:'smooth',block:'center'})}return}
  const a=sv.qa;if(a&&a.k&&parseFloat(a.w)){ACT.qaAdd()}if(a&&a.x&&(parseFloat(a.x.w)||parseFloat(a.x.q))){ACT.xrSave();if(sv.qa.x)return}if(a&&a.p&&(+a.p.amount>0)){ACT.pySave();if(sv.qa.p)return}
  if(!sv.items.length&&!sv.pays.length&&!sv.xr.length){toast('کالا، طلا، سکه یا دریافت و پرداختی اضافه کنید',true);const k=$('qK');if(k)k.focus();return}
  if(svHasG()&&!sv.rate){toast('مظنه یا نرخ گرم را بزنید',true);$('svM').focus();return}
  for(const p of sv.pays)if(p.m==='cust'&&!CU().some(z=>String(z.id)===String(p.cuId))){toast('حساب «'+(p.cuName||'')+'» پیدا نشد',true);return}
  for(const p of sv.pays)if(p.m==='dep'){const x=validated().find(z=>String(z.id)===String(p.entId));if(!x||x.full||x.sentBid||x.amount<ckUsedDep(p.entId)){toast('واریزی «'+(p.entName||'')+'» دیگر قابل تسویه نیست (ارسال یا تسویه شده)؛ ردیفش را حذف کنید',true);return}}
  /* v60.9: سند فروش → اول پنجره تسویه، بعد ثبت */
  if(!go&&sv.dk!=='buy'&&(sv.items.length||(sv.xr||[]).length)){ckOpen();return}
  const T=svTot(),now=ns(),no=invNext(),items=sv.items.map(it=>{const c2=itCalc(it,sv.rate,sv.tax),J=ajPT(it);return{...it,ajP:J.P,ajT:J.T,gold:c2.gold,ajv:c2.aj,prv:c2.pr,taxv:c2.tax,tot:c2.tot}});
  const xr=sv.xr.map(x=>{const C=xrCalc(x,sv.rate);return{...x,pg:C.pg,n:C.n,q750:x.a==='gold'?C.q:undefined,amount:C.amount,e:C.e}});
  const t={id:nid++,type:'inv',dk:sv.dk==='buy'?'buy':'sell',no,date:sv.date,rate:sv.rate,mz:sv.mz||0,items,xr,tax:!!sv.tax,disc:T.disc,sub:T.sub,total:T.total,pays:sv.pays.map(p=>({...p})),at:now,by:who()};
  if(T.ge)t.ge=T.ge;if(Object.keys(T.xe).length)t.xe=T.xe;
  if(sv.gconv&&T.rest>0&&sv.rate)t.gc={r:T.rest,g:Math.round(T.rest/sv.rate*1000)/1000};
  for(const p of t.pays){if(p.m!=='cust')continue;const Y=custs.find(z=>String(z.id)===String(p.cuId)),x={id:nid++,type:'xf',r:-p.amount,g:0,note:'پرداخت سند '+toFa(no)+' «'+cuName(c)+'»',inv:{cu:c.id,tx:t.id},date:sv.date,at:now,by:who()};(Y.txs=Y.txs||[]).push(x);Y.lastAt=now;p.xfId=x.id}
  (c.txs=c.txs||[]).push(t);c.lastAt=now;saveCu();if(t.pays.some(p=>p.srcId!=null))saveS();ckDepApply(c,t,now);
  logA('cust',invTitle(t),cuName(c)+(items.length?' | '+items.map(i=>i.k+' '+wFmt(i.w)+' گرم').join('، '):'')+(xr.length?' | '+xr.map(xrLab).join('، '):'')+' | جمع '+fmt(T.total)+' تومان'+(T.paid?' | دریافت/پرداخت '+fmt(T.paid):''));
  sv=null;ls.set('m_svd',null);invOpen(c.id,t.id,1)};
/* ================= نمایش سند ================= */
let invV=null;
function invOpen(cu,tx,fresh){invV={cu,tx,fresh:!!fresh};custId=cu;closeSheet();go('inv')}
const invGet=()=>{if(!invV)return null;const c=custs.find(z=>String(z.id)===String(invV.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(invV.tx));return t&&!t.del?{c,t}:null};
const xrRowsOf=t=>(t.xr||[]).map(x=>({lab:xrLab(x),sub:xrSub(x,{n:x.n!=null?x.n:(x.a==='gold'?x.w:x.q),pg:x.pg,amount:x.amount,e:x.e}),amt:x.t==='sell'?x.amount:x.t==='buy'?-x.amount:0}));
function invEffTxt(t){const d=txD(t),P=[];if(d.r)P.push((d.r<0?'بدهکار ':'طلبکار ')+fmt(Math.abs(d.r))+' تومان');if(d.g)P.push((d.g<0?'بدهکار ':'طلبکار ')+wFmt(Math.abs(d.g))+' گرم طلا');for(const k in d.x||{})if(+d.x[k])P.push((d.x[k]<0?'بدهکار ':'طلبکار ')+qFmt(Math.abs(d.x[k]))+' '+(XA[k]||{u:k}).u+(XA[k]&&XA[k].k==='c'?' '+XA[k].s:''));return P}
function vInv(){const X=invGet();if(!X){setTimeout(()=>{if(cur==='inv')go('custs',true)},0);return ''}const {c,t}=X,b=cuBal(c),D=dates(t.date),fresh=invV.fresh;invV.fresh=false;
  const row=(l,v,k)=>`<div${k?' class="'+k+'"':''}><span>${l}</span><b>${v}</b></div>`,S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0),XR=xrRowsOf(t),E=invEffTxt(t),hasI=(t.items||[]).length;
  return `${fresh?`<div class="bzok ivok">${ic('check')}<span>${esc(invTitle(t))} ثبت شد و به حساب «${esc(cuName(c))}» رفت</span></div>`:''}
  <article class="ivpaper ivfull${fresh?' reveal':''}"><div class="ivh"><span class="ivmk">م</span><span class="ivbr"><b>طلا و جواهر مطلا</b><small>${hasI?'فاکتور فروش':'سند'}</small></span><span class="ivno"><small>شماره</small><b>${toFa(t.no)}</b></span></div>
  <div class="ivmeta2"><div><small>مشتری</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<bdi dir="ltr">${esc(c.phone)}</bdi>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div>${t.rate&&(hasI||XR.length)?`<div><small>${t.mz?'مظنه':'نرخ روز هر گرم'}</small><b>${fmt(t.mz||t.rate)}</b><span>${t.mz?'هر گرم ۱۸: '+fmt(t.rate):'تومان · ۱۸ عیار'}</span></div>`:''}</div>
  ${hasI?`<div class="ivits">${(t.items||[]).map((it,i)=>`<div class="ivit"><span class="ivn">${toFa(i+1)}</span><div class="ivd"><b>${esc(it.k)}${it.n?' <i>'+esc(it.n)+'</i>':''}</b><small>${wFmt(it.w)} گرم · عیار ${toFa(it.ay||750)} · اجرت ${ajLab(it)} · سود ${toFa(it.pp)}٪</small><div class="ivbk"><span>طلا ${fmt(it.gold)}</span><span>اجرت ${fmt(it.ajv)}</span><span>سود ${fmt(it.prv)}</span>${it.taxv?`<span>مالیات ${fmt(it.taxv)}</span>`:''}</div></div><b class="iva">${fmt(it.tot)}</b></div>`).join('')}</div>`:''}
  ${XR.length?`<div class="ivits">${XR.map((x,i)=>`<div class="ivit"><span class="ivn">${toFa((t.items||[]).length+i+1)}</span><div class="ivd"><b>${esc(x.lab)}</b><small>${esc(x.sub)}</small></div><b class="iva">${x.amt?(x.amt<0?'− ':'')+fmt(Math.abs(x.amt)):'—'}</b></div>`).join('')}</div>`:''}
  ${hasI||XR.some(x=>x.amt)?`<div class="ivtt">${hasI?row('جمع وزن',wFmt(S('w'))+' گرم')+row('بهای طلا',fmt(S('gold')))+row('اجرت ساخت',fmt(S('ajv')))+row('سود فروشنده',fmt(S('prv'))):''}${t.tax?row('مالیات ۱۰٪',fmt(S('taxv'))):''}${t.disc?row('تخفیف','− '+fmt(t.disc)):''}<div class="ivgt"><span>${t.total<0?'خالص خرید':'جمع سند'}</span><b>${fmt(Math.abs(t.total))} <i>تومان</i></b></div></div>`:''}
  ${(t.pays||[]).length?`<div class="ivpy"><small>دریافت و پرداخت</small>${t.pays.map(p=>row(esc(pyLab(p))+(p.tn?' · پیگیری '+esc(p.tn):''),(pAmt(p)<0?'+ ':'')+fmt(Math.abs(pAmt(p))))).join('')}</div>`:''}
  <div class="ivrs ${E.length?'due':'ok'}"><span>${E.length?'اثر این سند بر حساب مشتری':'تسویه کامل'}</span><b>${E.length?E.map(esc).join('<br>'):ic('check')}</b></div>
  <div class="ivft"><span>مانده فعلی مشتری: ${[b.R?cuLab(b.R)+' '+fmt(Math.abs(b.R))+' تومان':'',b.G?cuLab(b.G)+' '+wFmt(Math.abs(b.G))+' گرم':'',...Object.keys(b.X).map(k=>cuLab(b.X[k])+' '+qFmt(Math.abs(b.X[k]))+' '+(XA[k]||{s:k}).s)].filter(Boolean).join(' · ')||'تسویه'}</span><span>صادرکننده: ${esc(t.by||'')}</span></div></article>
  <div class="ivacts"><button class="cuqb" data-act="invPrint">${ic('print')}<span><b>چاپ یا PDF</b><small>برای مشتری</small></span></button><button class="cuqb" data-act="cuOpen" data-id="${c.id}">${ic('user')}<span><b>حساب مشتری</b><small>گردش و مانده‌ها</small></span></button></div>
  <button class="addit" data-act="svNew" data-cu="${c.id}">${ic('plus')} سند بعدی برای همین مشتری</button>
  ${can('del')||isAdmin()?`<button class="edel" data-act="invDel">${ic('trash')} حذف این سند</button>`:''}`}
const aInv=()=>`<button class="btn gold bzgo" data-act="invPrint">${ic('print')} چاپ / PDF</button>`;
ACT.invDel=()=>{const X=invGet();if(!X)return;askConfirm(invTitle(X.t)+' حذف شود؟ اثرش از حساب مشتری'+(txLinked(X.c,X.t).length?' و مشتری پرداخت‌کننده':'')+' برداشته می‌شود.','حذف',()=>{custId=X.c.id;cur='cust';ACT.txDel({id:X.t.id});go('cust',true)})};
function invDoc(c,t){const D=dates(t.date),S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0),XR=xrRowsOf(t),E=invEffTxt(t),hasI=(t.items||[]).length;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${esc(invTitle(t))}</title>${PDF_FONT}<style>@page{size:A5;margin:9mm}*{box-sizing:border-box}body{font-family:Vazirmatn,Tahoma,sans-serif;color:#16213a;font-size:9pt;line-height:1.6;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .hd{background:#13284f;color:#fff;border-radius:12px 12px 4px 4px;padding:12px 14px;display:flex;align-items:center;gap:10px;position:relative;overflow:hidden}.hd:after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:linear-gradient(90deg,#ecc874,#b8862b,#ecc874)}
  .mk{width:34px;height:34px;border-radius:10px 10px 10px 3px;background:linear-gradient(135deg,#ecc874,#c99a3a);color:#13284f;font-weight:900;font-size:17pt;display:flex;align-items:center;justify-content:center;line-height:1}
  .br{flex:1}.br b{display:block;font-size:12pt;font-weight:800}.br small{color:#ecd9a6;font-size:8pt}.no{text-align:left}.no small{display:block;color:#ecd9a6;font-size:7pt}.no b{font-size:14pt;color:#ecc874}
  .mt{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:6px;margin:10px 0}.mt div{border:1px solid #e7e9ef;border-radius:8px;padding:5px 8px}.mt small{display:block;color:#8a91a1;font-size:7pt}.mt b{font-size:9.5pt}.mt span{display:block;font-size:7.4pt;color:#7a8294}
  table{width:100%;border-collapse:collapse;font-feature-settings:"tnum"}th{background:#fbf6e8;color:#7a5a17;font-size:7.6pt;font-weight:700;padding:5px 4px;border-bottom:1.5px solid #ecd9a6;text-align:right}td{padding:6px 4px;border-bottom:1px solid #eef0f4;font-size:8.6pt;vertical-align:top}td.n{text-align:left;white-space:nowrap}td small{display:block;color:#8a91a1;font-size:7pt}
  .tt{margin-top:8px;margin-right:auto;width:62%}.tt div{display:flex;justify-content:space-between;padding:2px 0;font-size:8.6pt}.tt .g{border-top:1.5px solid #13284f;margin-top:4px;padding-top:6px;font-size:11pt;font-weight:800}.tt .g b{color:#13284f}
  .py{margin-top:8px;border:1px solid #e7e9ef;border-radius:8px;padding:6px 9px}.py>small{color:#8a91a1;font-size:7.2pt}.py div{display:flex;justify-content:space-between;font-size:8.4pt}
  .rs{margin-top:8px;border-radius:8px;padding:7px 10px;display:flex;justify-content:space-between;gap:10px;font-weight:800;background:#fbf6e8;border:1px solid #ecd9a6}.rs b{text-align:left}.rs.ok{background:#e9f6ef;border-color:#bfe3cd;color:#15803d}
  .sg{display:flex;justify-content:space-between;margin-top:22px;font-size:7.6pt;color:#7a8294}.sg span{border-top:1px dashed #c9ced8;padding-top:4px;min-width:34%;text-align:center}.ft{margin-top:10px;text-align:center;font-size:7pt;color:#9097a5}</style></head><body>
  <div class="hd"><span class="mk">م</span><span class="br"><b>طلا و جواهر مطلا</b><small>${hasI?'فاکتور فروش':'سند'}</small></span><span class="no"><small>شماره</small><b>${toFa(t.no)}</b></span></div>
  <div class="mt"><div><small>مشتری</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<span dir="ltr" style="text-align:right">${esc(c.phone)}</span>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div><div><small>${t.mz?'مظنه':'نرخ هر گرم ۱۸ عیار'}</small><b>${t.rate?fmt(t.mz||t.rate):'—'}</b><span>${t.mz?'هر گرم ۱۸: '+fmt(t.rate):'تومان'}</span></div></div>
  ${hasI||XR.length?`<table><thead><tr><th>#</th><th>شرح</th><th>وزن / مقدار</th><th>عیار</th><th>اجرت</th><th>سود</th><th style="text-align:left">مبلغ (تومان)</th></tr></thead><tbody>${(t.items||[]).map((it,i)=>`<tr><td>${toFa(i+1)}</td><td><b>${esc(it.k)}</b>${it.n?'<small>'+esc(it.n)+'</small>':''}</td><td>${wFmt(it.w)}</td><td>${toFa(it.ay||750)}</td><td>${fmt(it.ajv)}<small>${esc(ajLab(it))}</small></td><td>${fmt(it.prv)}<small>${toFa(it.pp)}٪</small></td><td class="n"><b>${fmt(it.tot)}</b></td></tr>`).join('')}${XR.map((x,i)=>`<tr><td>${toFa(hasI+i+1)}</td><td><b>${esc(x.lab)}</b></td><td colspan="4">${esc(x.sub)}</td><td class="n"><b>${x.amt?(x.amt<0?'− ':'')+fmt(Math.abs(x.amt)):'—'}</b></td></tr>`).join('')}</tbody></table>
  <div class="tt">${hasI?`<div><span>جمع وزن</span><b>${wFmt(S('w'))} گرم</b></div><div><span>بهای طلا</span><b>${fmt(S('gold'))}</b></div><div><span>اجرت ساخت</span><b>${fmt(S('ajv'))}</b></div><div><span>سود فروشنده</span><b>${fmt(S('prv'))}</b></div>`:''}${t.tax?`<div><span>مالیات بر ارزش افزوده</span><b>${fmt(S('taxv'))}</b></div>`:''}${t.disc?`<div><span>تخفیف</span><b>− ${fmt(t.disc)}</b></div>`:''}<div class="g"><span>${t.total<0?'خالص خرید':'جمع سند'}</span><b>${fmt(Math.abs(t.total))} تومان</b></div></div>`:''}
  ${(t.pays||[]).length?`<div class="py"><small>دریافت و پرداخت</small>${t.pays.map(p=>`<div><span>${esc(pyLab(p,1))}${p.tn?' · پیگیری '+esc(p.tn):''}</span><b>${pAmt(p)<0?'+ ':''}${fmt(Math.abs(pAmt(p)))}</b></div>`).join('')}</div>`:''}
  <div class="rs${E.length?'':' ok'}"><span>${E.length?'اثر بر حساب مشتری':'تسویه کامل'}</span><b>${E.length?E.map(esc).join('<br>'):'✓'}</b></div>
  <div class="sg"><span>امضای مشتری</span><span>مهر و امضای فروشنده</span></div><div class="ft">صادرکننده: ${esc(t.by||'')} · مطلا</div></body></html>`}
ACT.invPrint=()=>{const X=invGet();if(!X)return;openPrint(invDoc(X.c,X.t))};

/* ================= انتقال مانده بین مشتری‌ها ================= */
let xs=null;
function xsHTML(){const c=curCu(),b=cuBal(c),bal=xs.u==='g'?b.G:b.R,G=xs.u==='g',to=xs.to&&CU().find(z=>String(z.id)===String(xs.to)),v=+xs.amt||0,s=xs.s;
  const fmtU=x=>G?wFmt(Math.abs(x))+' گرم':fmt(Math.abs(x))+' تومان',tb=to?cuBal(to):null,tv=tb?(G?tb.G:tb.R):0;
  return `<div class="sh-h"><div><b>انتقال مانده</b><small class="shsub">از حساب «${esc(cuName(c))}» به مشتری دیگر</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="bzw" style="animation:none">
  <div class="seg2">${[['r','ریالی'],['g','طلایی']].map(([k,t])=>`<button class="${xs.u===k?'on':''}" data-act="xsU" data-u="${k}">${t}</button>`).join('')}</div>
  <div class="ef"><label>چه چیزی منتقل شود</label><div class="gks">${[[1,'طلب مشتری (بدهی ما)'],[-1,'بدهی مشتری به ما']].map(([k,t])=>`<button class="tch${s===k?' on':''}" data-act="xsS" data-s="${k}">${t}</button>`).join('')}</div><small class="eh">مانده فعلی: ${balLab(bal)} ${bal?fmtU(bal):''}</small></div>
  ${to?`<div class="svcu sm"><span class="bri">${esc(userInit(to.name))}</span><span class="tx"><b>${esc(cuName(to))}</b><small>${balLab(tv)} ${tv?fmtU(tv):''}</small></span><button class="lnk" data-act="xsTo" data-id="">تغییر</button></div>`:`<div class="ef"><label>به حساب</label><div class="fsearch sm">${ic('search')}<input id="xsQ" value="${esc(xs.q||'')}" placeholder="جستجوی مشتری مقصد…" autocomplete="off"></div><div id="xsR">${xsResHTML()}</div></div>`}
  <div class="ef"><label for="xsA">${G?'وزن (گرم)':'مبلغ (تومان)'}</label><input id="xsA" class="ltr acbig" inputmode="${G?'decimal':'numeric'}" value="${v?(G?xs.amt:Number(v).toLocaleString('en-US')):''}" autocomplete="off"></div>
  <div class="ef"><label for="xsN">شرح <i>(اختیاری)</i></label><input id="xsN" value="${esc(xs.note||'')}" autocomplete="off"></div>
  <div class="txeff" id="xsE"></div></div><button class="xgo" data-act="xsSave">${ic('swap')} انتقال</button>`}
function xsResHTML(){const c=curCu(),q=nzName(toEn(clean(xs.q||'')));let L=CU().filter(z=>z!==c);if(q)L=L.filter(z=>nzName([z.name,z.phone,z.grp].join(' ')).includes(q));L=L.sort((a,b)=>String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,6);
  return L.length?`<div class="fcard blist">${L.map(z=>{const b=cuBal(z);return `<button class="curow" data-act="xsTo" data-id="${z.id}"><span class="bri">${esc(userInit(z.name))}</span><span class="tx"><b>${esc(cuName(z))}</b><small>${z.grp?esc(z.grp):'مشتری'}</small></span><span class="cuv">${balTag(b.R)}${balTag(b.G,1)}</span></button>`}).join('')}</div>`:`<div class="eh">مشتری‌ای پیدا نشد</div>`}
function xsRead(){const A=$('xsA'),N=$('xsN'),Q=$('xsQ');if(A)xs.amt=xs.u==='g'?decIn(A.value):num(A.value);if(N)xs.note=clean(N.value||'');if(Q)xs.q=Q.value}
function xsBind(){const A=$('xsA'),Q=$('xsQ'),E=$('xsE'),upd=()=>{xsRead();const c=curCu(),to=xs.to&&CU().find(z=>String(z.id)===String(xs.to)),v=+xs.amt||0,G=xs.u==='g',k=G?'G':'R',f=x=>G?wFmt(Math.abs(x))+' گرم':fmt(Math.abs(x))+' تومان';if(!v||!to){E.innerHTML='';return}
    const a=cuBal(c)[k]-xs.s*v,b=cuBal(to)[k]+xs.s*v;E.innerHTML=`<span>بعد از انتقال</span><b class="${a>0?'r':a<0?'b':''}">«${esc(cuName(c))}»: ${f(a)} · ${balLab(a)}</b><b class="${b>0?'r':b<0?'b':''}">«${esc(cuName(to))}»: ${f(b)} · ${balLab(b)}</b>`};
  if(A)A.oninput=()=>{if(xs.u==='g')A.value=decIn(A.value);else{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''}upd()};if(Q)Q.oninput=()=>{xs.q=Q.value;$('xsR').innerHTML=xsResHTML()};upd();setTimeout(()=>{const f=Q||A;if(f&&!f.value)f.focus()},300)}
const xsRe=()=>{sheet(xsHTML());xsBind()};
ACT.xfNew=()=>{if(!can('debt'))return;const c=curCu();if(!c)return;const b=cuBal(c),u=!b.R&&b.G?'g':'r',bal=u==='g'?b.G:b.R;xs={u,s:bal<0?-1:1,amt:bal?(u==='g'?String(Math.abs(bal)):Math.abs(bal)):0,q:'',to:''};xsRe()};
ACT.xsU=d=>{xsRead();const b=cuBal(curCu()),bal=d.u==='g'?b.G:b.R;xs.u=d.u;xs.s=bal<0?-1:1;xs.amt=bal?(d.u==='g'?String(Math.abs(bal)):Math.abs(bal)):0;xsRe()};
ACT.xsS=d=>{xsRead();xs.s=+d.s;xsRe()};
ACT.xsTo=d=>{xsRead();xs.to=d.id;if(!d.id)xs.q='';xsRe()};
ACT.xsSave=()=>{xsRead();const c=curCu(),to=xs.to&&CU().find(z=>String(z.id)===String(xs.to)),G=xs.u==='g',v=G?Math.round((parseFloat(xs.amt)||0)*1000)/1000:+xs.amt||0;if(!to){toast('مشتری مقصد را انتخاب کنید',true);return}if(!v){toast(G?'وزن را وارد کنید':'مبلغ را وارد کنید',true);$('xsA').focus();return}
  {const bal=cuBal(c)[G?'G':'R'],have=Math.sign(bal)===xs.s?Math.abs(bal):0;if(v>have+1e-9&&!xs.ok){xs.ok=1;toast((xs.s>0?'طلب':'بدهی')+' این مشتری '+(have?'فقط '+(G?wFmt(have)+' گرم':fmt(have)+' تومان')+' است':'صفر است')+'؛ برای انتقال بیشتر دوباره بزنید',true);setTimeout(()=>{if(xs)xs.ok=0},4000);return}}
  const now=ns(),f=G?wFmt(v)+' گرم':fmt(v)+' تومان',what=xs.s>0?'طلب':'بدهی',A={id:nid++,type:'xf',r:G?0:-xs.s*v,g:G?-xs.s*v:0,note:'انتقال '+what+' '+f+' به «'+cuName(to)+'»'+(xs.note?' · '+xs.note:''),date:todayISO(),at:now,by:who()},B={id:nid++,type:'xf',r:G?0:xs.s*v,g:G?xs.s*v:0,note:'انتقال '+what+' '+f+' از «'+cuName(c)+'»'+(xs.note?' · '+xs.note:''),date:todayISO(),at:now,by:who()};
  A.peer={cu:to.id,tx:B.id};B.peer={cu:c.id,tx:A.id};(c.txs=c.txs||[]).push(A);(to.txs=to.txs||[]).push(B);c.lastAt=to.lastAt=now;saveCu();logA('cust','انتقال مانده',cuName(c)+' ← '+cuName(to)+' | '+what+' '+f);xs=null;closeSheet();const vw=$('view'),y=vw.scrollTop;render();vw.scrollTop=y;toast(what+' '+f+' به «'+cuName(to)+'» منتقل شد')};

/* ================= تبدیل مانده طلایی ↔ ریالی (پولی کردن / طلایی کردن) ================= */
let cv=null;
function cvHTML(){const c=curCu(),b=cuBal(c),g2r=cv.dir==='g2r',bal=g2r?b.G:b.R;
  return `<div class="sh-h"><div><b>تبدیل مانده</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="bzw" style="animation:none">
  <div class="seg2">${[['g2r','طلایی به ریالی'],['r2g','ریالی به طلایی']].map(([k,t])=>`<button class="${cv.dir===k?'on':''}" data-act="cvD" data-d="${k}">${t}</button>`).join('')}</div>
  <div class="cvbal"><div><small>مانده ریالی</small>${balTag(b.R)}<em>${balLab(b.R)}</em></div><div><small>مانده طلایی</small>${balTag(b.G,1)}<em>${balLab(b.G)}</em></div></div>
  <div class="ef2"><div class="ef"><label for="cvA">${g2r?'وزن (گرم)':'مبلغ (تومان)'}</label><input id="cvA" class="ltr" inputmode="${g2r?'decimal':'numeric'}" value="${cv.amt?(g2r?cv.amt:Number(cv.amt).toLocaleString('en-US')):''}" autocomplete="off"></div><div class="ef"><label for="cvR">نرخ هر گرم</label><input id="cvR" class="ltr" inputmode="numeric" value="${cv.rate?Number(cv.rate).toLocaleString('en-US'):''}" autocomplete="off"></div></div>
  <small class="eh">${bal?'جهت: '+balLab(bal)+' — همین مانده تبدیل می‌شود':'این مانده صفر است؛ تبدیل اثر علامت‌دار ندارد'}</small><div class="txeff" id="cvE"></div></div><button class="xgo" data-act="cvSave">${ic('coin')} تبدیل</button>`}
function cvRead(){const A=$('cvA'),R=$('cvR');if(A)cv.amt=cv.dir==='g2r'?decIn(A.value):num(A.value);if(R)cv.rate=num(R.value)}
function cvCalc(){const c=curCu(),b=cuBal(c),g2r=cv.dir==='g2r',s=(g2r?b.G:b.R)<0?-1:1,a=g2r?parseFloat(cv.amt)||0:+cv.amt||0,r=+cv.rate||0;if(!a||!r)return null;
  return g2r?{g:-s*Math.round(a*1000)/1000,r:s*Math.round(a*r)}:{r:-s*a,g:s*Math.round(a/r*1000)/1000}}
function cvBind(){const A=$('cvA'),R=$('cvR'),E=$('cvE'),upd=()=>{cvRead();const x=cvCalc(),b=cuBal(curCu());if(!x){E.innerHTML='';return}const nr=b.R+x.r,ng=Math.round((b.G+x.g)*1000)/1000;E.innerHTML=`<span>بعد از تبدیل</span><b class="${nr>0?'r':nr<0?'b':''}">${fmt(Math.abs(nr))} تومان · ${balLab(nr)}</b><b class="${ng>0?'r':ng<0?'b':''}">${wFmt(Math.abs(ng))} گرم · ${balLab(ng)}</b>`};
  A.oninput=()=>{if(cv.dir==='g2r')A.value=decIn(A.value);else{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''}upd()};R.oninput=()=>{const v=num(R.value);R.value=v?v.toLocaleString('en-US'):'';upd()};upd()}
const cvRe=()=>{sheet(cvHTML());cvBind()};
ACT.cvNew=()=>{if(!can('debt'))return;const c=curCu();if(!c)return;const b=cuBal(c),dir=b.G?'g2r':'r2g';cv={dir,amt:dir==='g2r'?String(Math.abs(b.G)):Math.abs(b.R),rate:+ls.get('m_rate',0)||0};cvRe()};
ACT.cvD=d=>{cvRead();const b=cuBal(curCu());cv.dir=d.d;cv.amt=d.d==='g2r'?(b.G?String(Math.abs(b.G)):''):Math.abs(b.R);cvRe()};
ACT.cvSave=()=>{cvRead();const x=cvCalc(),c=curCu();if(!x){toast('مقدار و نرخ را وارد کنید',true);return}if(cv.rate)ls.set('m_rate',cv.rate);const now=ns();
  (c.txs=c.txs||[]).push({id:nid++,type:'cv',dir:cv.dir,r:x.r,g:x.g,rate:cv.rate,note:(cv.dir==='g2r'?wFmt(Math.abs(x.g))+' گرم به '+fmt(Math.abs(x.r))+' تومان':fmt(Math.abs(x.r))+' تومان به '+wFmt(Math.abs(x.g))+' گرم')+' · نرخ '+fmt(cv.rate),date:todayISO(),at:now,by:who()});c.lastAt=now;saveCu();logA('cust','تبدیل مانده',cuName(c)+' | '+(cv.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی'));cv=null;closeSheet();const vw=$('view'),y=vw.scrollTop;render();vw.scrollTop=y;toast('مانده تبدیل شد')};

/* ================= کارتخوان‌ها: مانده کارت‌های کشیده‌شده، واریز به حساب بانکی (بخش بانک) ================= */
const bkRe=()=>{if(cur==='banks'||cur==='custs'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}};
function chAllHTML(){const P=CH('pos'),B=CH('bank'),card=c=>{const v=chBal(c);return `<button class="chrow" data-act="chOpen" data-id="${c.id}"><span class="bri ${c.kind}">${ic(c.kind==='pos'?'card':'bank')}</span><span class="tx"><b>${esc(c.name)}</b><small>${c.kind==='pos'?'مانده واریزنشده به حساب':CHK[c.kind]}</small></span><span class="txv"><b>${fmt(v)}</b><small>تومان</small></span></button>`};
  return `<div class="sh-h"><div><b>کارتخوان‌ها</b><small class="shsub">کارت‌هایی که در سندها کشیده می‌شود اینجا جمع می‌شود؛ بعد از تسویه بانک به حساب واریز کنید</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${P.length?`<div class="fcard blist">${P.map(card).join('')}</div>`:'<div class="eh">هنوز کارتخوانی تعریف نشده</div>'}
  ${B.length?`<div class="spsec"><b>حساب‌های قدیمی</b><small>حساب‌های بانکی تازه در بخش بانک تعریف می‌شوند</small></div><div class="fcard blist">${B.map(card).join('')}</div>`:''}
  <div class="fsearch sm chadd" style="margin-top:14px">${ic('plus')}<input id="chN" placeholder="نام کارتخوان تازه، مثلاً پوز ملت" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="chAdd" data-k="pos">افزودن</button></div>`}
ACT.chOpenAll=()=>{sheet(chAllHTML());const n=$('chN');if(n)n.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.chAdd({k:'pos'})}}};
ACT.chAdd=d=>{const n=$('chN'),name=clean((n&&n.value)||'');if(!name){toast('نام را بنویسید',true);if(n)n.focus();return}if(CH().some(c=>c.name===name)){toast('این نام قبلاً تعریف شده',true);return}chNew(name,d.k||'pos');ACT.chOpenAll();toast(CHK[d.k||'pos']+' «'+name+'» اضافه شد');bkRe()};
let chId=null,chMv=null;
ACT.chOpen=d=>{chId=d.id;const c=custs.find(z=>String(z.id)===String(d.id));if(!c)return;const M=chMoves(c),bal=M.reduce((s,m)=>s+m.a,0),pos=c.kind==='pos';
  sheet(`<div class="sh-h"><div><b>${esc(c.name)}</b><small class="shsub">${CHK[c.kind]} · ${pos?'واریزنشده':'مانده'} ${fmt(bal)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="chhero ${c.kind}"><small>${pos?'کارت کشیده و هنوز به حساب نرفته':'مانده'}</small><b>${fmt(bal)} <i>تومان</i></b><span>${toFa(M.length)} گردش</span></div>
  ${bal>0&&can('src')?`<button class="xgo" data-act="${pos?'posDep':'chMvNew'}">${ic(pos?'down':'swap')} ${pos?'واریز به حساب بانکی':'انتقال مانده با یک حواله'}</button>`:''}
  <div class="spsec"><b>گردش</b></div>${M.length?`<div class="fcard blist">${M.map(m=>`<div class="chmv"><span class="tx"><b>${esc(m.t)}</b><small>${esc(dates(m.d).fa)}${m.sub?' · '+esc(m.sub):''}</small></span><b class="${m.a>0?'pc':'nc'}">${m.a>0?'+':'−'} ${fmt(Math.abs(m.a))}</b></div>`).join('')}</div>`:'<div class="eh">هنوز گردشی ندارد</div>'}
  ${!M.length&&(can('del')||isAdmin())?`<button class="edel" data-act="chDel">${ic('trash')} حذف این ${CHK[c.kind]}</button>`:''}`)};
ACT.chDel=()=>{const c=custs.find(z=>String(z.id)===String(chId));if(!c)return;c.del=true;c.delAt=ns();saveCu();logA('cust','حذف '+CHK[c.kind],c.name);ACT.chOpenAll();bkRe()};
/* واریز مانده کارتخوان به یکی از حساب‌های بخش بانک: از کارتخوان کم و به دفتر آن حساب (کارتخوان) اضافه می‌شود */
let posD=null;
function pdHTML(){const c=custs.find(z=>String(z.id)===String(chId)),bal=chBal(c);
  return `<div class="sh-h"><div><b>واریز «${esc(c.name)}» به حساب</b><small class="shsub">مانده واریزنشده ${fmt(bal)} تومان</small></div><button class="x" data-act="chOpen" data-id="${c.id}" aria-label="بازگشت">×</button></div><div class="bzw" style="animation:none">
  <div class="ef"><label>به کدام حساب</label>${sources.length?`<div class="chps">${sources.map(s=>{const bk=acBank(s),e=acEst(s);return `<button class="chp${String(posD.to)===String(s.id)?' on':''}" data-act="pdTo" data-id="${s.id}">${bk?bankBadge(bk):ic('bank')}<span><b>${esc(s.name)}</b><small>${e==null?'موجودی اولیه ثبت نشده':'موجودی '+fmt(e)}</small></span></button>`}).join('')}</div>`:'<div class="eh">در بخش بانک حسابی تعریف نشده</div>'}</div>
  <div class="ef"><label for="pdA">مبلغ <i>(تومان)</i></label><input id="pdA" class="ltr acbig" inputmode="numeric" value="${posD.a?Number(posD.a).toLocaleString('en-US'):''}" autocomplete="off"><small class="eh">کل مانده: ${fmt(bal)} تومان</small></div></div>
  <button class="xgo" data-act="pdSave">${ic('check')} ثبت واریز</button>`}
const pdRe=()=>{sheet(pdHTML());const A=$('pdA');if(A){selOnFocus(A);A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';posD.a=v}}};
ACT.posDep=d=>{if(d&&d.id)chId=d.id;const c=custs.find(z=>String(z.id)===String(chId));if(!c)return;const last=ls.get('m_posdep_'+c.id,'');posD={a:Math.max(0,chBal(c)),to:(sources.find(s=>String(s.id)===String(last))||sources.find(s=>s.bal!=null)||sources[0]||{}).id};pdRe()};
ACT.pdTo=d=>{const A=$('pdA');if(A)posD.a=num(A.value);posD.to=d.id;pdRe()};
ACT.pdSave=()=>{const A=$('pdA');if(A)posD.a=num(A.value);const c=custs.find(z=>String(z.id)===String(chId)),s=sources.find(z=>String(z.id)===String(posD.to));if(!c)return;if(!s){toast('حساب مقصد را انتخاب کنید',true);return}if(!(posD.a>0)){toast('مبلغ را وارد کنید',true);return}
  const now=ns(),T={id:nid++,type:'tout',amount:posD.a,srcId:s.id,date:todayISO(),at:now,by:who()},L={id:nid++,type:'pos',amount:posD.a,note:'کارتخوان «'+c.name+'»',chId:c.id,chTx:T.id,date:todayISO(),at:now,by:who()};T.ledId=L.id;
  (c.txs=c.txs||[]).push(T);(s.led=s.led||[]).push(L);s.updatedAt=now;saveCu();saveS();ls.set('m_posdep_'+c.id,s.id);logA('src','واریز کارتخوان به حساب',c.name+' ← '+s.name+' | '+fmt(posD.a)+' تومان');posD=null;closeSheet();bkRe();toast(fmt(T.amount)+' تومان به «'+s.name+'» واریز شد')};
function chMvHTML(){const c=custs.find(z=>String(z.id)===String(chId)),bal=chBal(c),L=CH().filter(z=>z!==c);
  return `<div class="sh-h"><div><b>انتقال با یک حواله</b><small class="shsub">از «${esc(c.name)}» · مانده ${fmt(bal)} تومان</small></div><button class="x" data-act="chOpen" data-id="${c.id}" aria-label="بازگشت">×</button></div><div class="bzw" style="animation:none">
  <div class="ef"><label>به حساب</label><div class="chps">${L.map(z=>`<button class="chp${String(chMv.to)===String(z.id)?' on':''}" data-act="chMvTo" data-id="${z.id}">${ic(z.kind==='pos'?'card':'bank')}<span><b>${esc(z.name)}</b><small>${CHK[z.kind]}</small></span></button>`).join('')}</div></div>
  <div class="ef"><label for="mvA">مبلغ <i>(تومان)</i></label><input id="mvA" class="ltr acbig" inputmode="numeric" value="${chMv.a?Number(chMv.a).toLocaleString('en-US'):''}" autocomplete="off"><small class="eh">کل مانده: ${fmt(bal)} تومان</small></div>
  <div class="ef"><label for="mvT">شماره پیگیری حواله <i>(اختیاری)</i></label><input id="mvT" class="ltr" inputmode="numeric" value="${esc(chMv.tn||'')}" autocomplete="off"></div></div>
  <button class="xgo" data-act="chMvSave">${ic('check')} ثبت حواله</button>`}
function chMvRead(){const A=$('mvA'),T=$('mvT');if(A)chMv.a=num(A.value);if(T)chMv.tn=toEn(T.value||'').trim()}
const chMvRe=()=>{sheet(chMvHTML());const A=$('mvA');if(A)A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''}};
ACT.chMvNew=()=>{const c=custs.find(z=>String(z.id)===String(chId));if(!c)return;const B=CH('bank').filter(z=>z!==c);chMv={a:chBal(c),to:(B[0]||{}).id||'',tn:''};chMvRe()};
ACT.chMvTo=d=>{chMvRead();chMv.to=d.id;chMvRe()};
ACT.chMvSave=()=>{chMvRead();const c=custs.find(z=>String(z.id)===String(chId)),to=custs.find(z=>String(z.id)===String(chMv.to)&&z.sys==='ch'&&!z.del);if(!to){toast('حساب مقصد را انتخاب کنید',true);return}if(!(chMv.a>0)){toast('مبلغ را وارد کنید',true);return}
  const now=ns(),A={id:nid++,type:'tout',amount:chMv.a,peer:to.id,tn:chMv.tn,date:todayISO(),at:now,by:who()},B={id:nid++,type:'tin',amount:chMv.a,peer:c.id,tn:chMv.tn,date:todayISO(),at:now,by:who()};
  (c.txs=c.txs||[]).push(A);(to.txs=to.txs||[]).push(B);saveCu();logA('cust','حواله از '+c.name+' به '+to.name,fmt(chMv.a)+' تومان'+(chMv.tn?' | پیگیری '+chMv.tn:''));chMv=null;ACT.chOpen({id:c.id});toast(fmt(A.amount)+' تومان به «'+to.name+'» منتقل شد');bkRe()};
