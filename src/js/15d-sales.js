/* ===== سند (فاکتور فروش، خرید، دریافت و پرداخت)، کارتخوان‌ها، انتقال مانده بین مشتری‌ها (الگو: نرم‌افزار کیمیا) =====
   همه داده‌ها داخل همان مجموعه custs ذخیره و همگام می‌شوند:
   - سند = تراکنش type:'inv' در حساب مشتری: items (کالای فروشی با اجرت و سود)، xr (طلا/سکه/ارز: فروش، خرید، دریافت، تحویل؛ pul = پولی)،
     pays (دریافت و پرداخت پول)، total (خالص ریالی کالاها)، ge (اثر طلایی، گرم ۱۸)، xe (اثر سکه و ارز)، gc = تبدیل مانده به طلایی
   - انتقال مانده / تبدیل طلایی‌ریالی = تراکنش type:'xf' / 'cv' با r و g علامت‌دار (مثبت = بدهی ما)
   - کارتخوان = رکورد {sys:'ch', kind:'pos'}؛ مانده = کارت‌های کشیده‌شده − واریز به حساب بانکی (sources)
   - حواله به حساب ما = pays با srcId (حساب‌های بخش بانک) — حساب‌های قدیمی {sys:'ch',kind:'bank'} هم کار می‌کنند
   - گروه‌ها و فهرست کالاها = رکورد {sys:'cfg'} */
Object.assign(IC,{gal:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',tag:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',inv:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',card:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',coin:'<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',cash:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',ring:'<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-1.5 3.6h-3z"/>',bar:'<path d="M4 17l3-9h10l3 9z"/><path d="M8 13h8"/>',usd:'<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5v11"/>'});
let cuRet='';
const ns=()=>new Date().toISOString();
/* ---------- تنظیمات مشترک: گروه‌ها و کالاها ---------- */
function cfgRec(make){let r=custs.find(c=>c.sys==='cfg'&&!c.del);if(!r&&make){r={id:nid++,sys:'cfg',name:'',groups:[],goods:[],txs:[],createdAt:ns()};custs.push(r)}return r}
const GOODS0=['انگشتر','النگو','دستبند','گردنبند','زنجیر','گوشواره','سرویس','نیم‌ست','پلاک','آویز','سکه','شمش','آبشده'];
/* v61.60: کالای پیش‌فرض حذف‌شده در r.ghide پنهان می‌ماند */
const goodsList=()=>{const r=cfgRec(),H=(r&&r.ghide)||[];return [...new Set([...((r&&r.goods)||[]),...GOODS0])].filter(k=>!H.includes(k))};
const groupsList=()=>{const r=cfgRec();return [...new Set([...((r&&r.groups)||[]),...CU().map(c=>c.grp).filter(Boolean)])]};
function addGroup(g){g=clean(g||'');if(!g)return;const r=cfgRec(1);r.groups=r.groups||[];if(!r.groups.includes(g)){r.groups.push(g);saveCu()}}
function addGoods(k){k=clean(k||'');if(!k)return;const r0=cfgRec();if(r0&&(r0.ghide||[]).includes(k)){r0.ghide=r0.ghide.filter(x=>x!==k);saveCu()}if(GOODS0.includes(k))return;const r=cfgRec(1);r.goods=r.goods||[];if(!r.goods.includes(k)){r.goods.unshift(k);saveCu()}}
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
  const s={id:nid++,name,bank:'',limit:0,count:0,iban:'',card:''};if(ownSet())s.own=1;sources.push(s);saveS();logA('src','حساب بانکی جدید',name);return s}
/* ---------- ردیف‌های مرتبط (برای حذف/بازگردانی هم‌زمان) ---------- */
function txLinked(c,t){const R=[],find=(cu,tx)=>{const C=custs.find(z=>String(z.id)===String(cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(tx));if(T)R.push({c:C,t:T})};
  if(t.type==='inv')(t.pays||[]).forEach(p=>{if(p.m==='cust'&&p.xfId)find(p.cuId,p.xfId)});
  if((t.type==='xf'||t.type==='cv')&&t.peer)find(t.peer.cu,t.peer.tx);
  if(t.type==='xf'&&t.inv)find(t.inv.cu,t.inv.tx);
  return R.filter(x=>x.t!==t)}
const invTitle=t=>t.legacy?(t.dk==='out'?'سند پرداخت وجه':'سند دریافت وجه'):(t.dk==='buy'?'سند خرید ':t.dk==='in'&&t.auto==='stl'?'سند دریافت ':(t.items||[]).length?'فاکتور فروش ':'سند ')+toFa(t.no);
function txRow2(c,t){const d=txD(t),v=(x,k)=>`<b class="${x>0?'b':'r'}"><span>${balV(k,x)} <i>${balU(k)}</i></span><small>${ourLab(x)}</small></b>`;
  let T,sub,ico;if(t.type==='inv'){const paid=(t.pays||[]).reduce((s,p)=>s+pAmt(p),0);T=invTitle(t);ico='inv';sub=[(t.items||[]).map(i=>i.k).join('، '),...(t.xr||[]).map(xrLab),(t.items||[]).length?wFmt((t.items||[]).reduce((s,i)=>s+(+i.w||0),0))+' گرم':'',paid?(paid>0?'دریافت ':'پرداخت ')+fmt(Math.abs(paid)):''].filter(Boolean).join(' · ')}
  else if(t.type==='xf'){T=t.inv?'پرداخت فاکتور مشتری دیگر':'انتقال مانده';ico='swap';sub=t.note||''}else{T='تبدیل '+(t.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی');ico='coin';sub=t.note||''}
  const vals=(d.r?v(d.r,'r'):'')+(d.g?v(d.g,'g'):'')+Object.keys(d.x||{}).filter(k=>+d.x[k]).map(k=>v(+d.x[k],k)).join('')||'<b>تسویه</b>';
  const wp=t.type==='inv'&&typeof wdPend==='function'?wdPend(c,t.no):0;/* v61.80: مانده رفته برای واریز */
  return swW(`<button class="txr" data-act="txOpen" data-id="${t.id}"><span class="bri t-${t.type}">${ic(ico)}</span><span class="tx"><b>${esc(T)}</b><small>${esc(sub)}</small>${wp?`<em class="txwd">${ic('clock')} ${fmt(wp)} رفته برای واریز</em>`:''}</span><span class="txv txv2">${vals}</span></button>`,{r:[['txOpen','جزئیات','eye','#3b6fd6']],l:can('del')||isAdmin()?[['txDel','حذف','trash','#d23c48']]:[],data:{id:t.id}})}
function xfShow(c,t){const d=txD(t),kv=(l,v)=>v?`<div class="kv"><small>${l}</small><b>${v}</b><span class="kvx"></span></div>`:'';const L=txLinked(c,t);
  sheet(`<div class="sh-h"><div><b>${t.type==='cv'?'تبدیل طلایی / ریالی':'انتقال مانده'}</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="kvs" style="border:0;padding:0">${kv('اثر ریالی',d.r?fmt(Math.abs(d.r))+' تومان ('+(d.r>0?'بدهی ما':'طلب ما')+')':'')}${kv('اثر طلایی',d.g?wFmt(Math.abs(d.g))+' گرم ('+(d.g>0?'بدهی طلایی ما':'طلب طلایی ما')+')':'')}${kv('نرخ',t.rate?fmt(t.rate)+' تومان هر گرم':'')}${kv('طرف دیگر',L.map(x=>esc(cuName(x.c))).join('، '))}${kv('شرح',esc(t.note||''))}${kv('تاریخ',esc(dates(t.date).wd+' '+dates(t.date).fa))}${kv('ثبت‌کننده',esc(t.by||''))}</div>
  ${L.filter(x=>x.t.type==='inv').map(x=>`<button class="xgo xfinv" data-act="xfInv" data-cu="${x.c.id}" data-tx="${x.t.id}">${ic('open')} دیدن ${esc(invTitle(x.t))} «${esc(cuName(x.c))}»</button>`).join('')}${L.filter(x=>x.t.type!=='inv').map(x=>`<button class="xgo xfinv" data-act="cuOpen" data-id="${x.c.id}">${ic('user')} حساب «${esc(cuName(x.c))}»</button>`).join('')}
  ${can('del')||isAdmin()?`<button class="edel" data-act="txDel" data-id="${t.id}">${ic('trash')} حذف${L.length?' (ردیف طرف مقابل هم حذف می‌شود)':''}</button>`:''}`)}

/* ================= سند ================= */
let sv=null,svAdd=-1;
/* مظنه (هر مثقال ۷۰۵) = نرخ هر گرم ۱۸ عیار × ۴٫۳۳۱۸ */
const MZK=4.3318,mzOf=r=>Math.round((+r||0)*MZK),rOfMz=m=>Math.round((+m||0)/MZK);
const PM={off:{t:'تخفیف',i:'tag'},prev:{t:'مانده قبلی',i:'clock'},dep:{t:'حواله به فروشنده واریزی',i:'swap'},cash:{t:'نقد',i:'cash'},pos:{t:'کارتخوان',i:'card'},hav:{t:'حواله',i:'bank'},cust:{t:'حساب مشتری',i:'swap'},nm:{t:'حواله دستی',i:'swap'},gold:{t:'طلای مشتری',i:'coin'},disc:{t:'تخفیف',i:'tag'},wd:{t:'واریز بانکی',i:'bank'}};
function invNext(){let m=1000;for(const c of custs)for(const t of c.txs||[])if(t.type==='inv'&&+t.no>m)m=+t.no;return m+1}
const svKeep=()=>ls.set('m_svd',sv);
function svBlank(cu){const r=+ls.get('m_rate',0)||0;return{v:2,cuId:cu||'',date:todayISO(),rate:r,mz:+ls.get('m_mz',0)||mzOf(r),items:[],xr:[],tax:!!ls.get('m_tax',false),disc:0,pays:[],gconv:false,q:'',live:1}}
const svFix=()=>{if(sv.gconv)sv.gconv=false;/* v60.9: «مانده ریالی طلایی ثبت شود» فعلاً برداشته شده */if(!sv.xr)sv.xr=[];if(!sv.items)sv.items=[];if(!sv.pays)sv.pays=[];if(sv.mz==null)sv.mz=mzOf(sv.rate);if(!sv.qa)sv.qa=qaBlank();
  /* v61.46: مبلغ دستی قدیمی (با مالیات داخلش) یک بار به «پیش از مالیات» برگردانده می‌شود؛ جمع همان می‌ماند */
  sv.items.forEach(it=>{if(+it.amT>0&&!it.amN){const c=itCalc(it,sv.rate,sv.tax);if(c.fx){it.amT=c.gold+c.aj+c.pr;it.amN=1}}});};
ACT.svNew=d=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}closeSheet();const cu=d&&d.cu?d.cu:'',old=ls.get('m_svd',null);
  if(old&&(old.v===1||old.v===2)&&((old.items||[]).length||(old.pays||[]).length||(old.xr||[]).length)&&(!cu||String(old.cuId||'')===String(cu)||!old.cuId)){sv=old;if(cu)sv.cuId=cu;toast('پیش‌نویس سند قبلی باز شد','', 'سند تازه',()=>{const dk=sv.dk,fc=sv.fixCu;sv=svBlank(cu);sv.dk=dk;sv.fixCu=fc;svFix();svKeep();render()})}else sv=svBlank(cu);
  /* v60.5: نوع سند: فروش یا خرید (فقط عنوان و پیشنهادهای جستجو را عوض می‌کند؛ ساختار سند همان است) */
  sv.dk=d&&d.dk==='buy'?'buy':'';sv.fixCu=!!cu;
  svFix();const k=d&&d.pre;if(k==='in'||k==='out')sv.qa={...qaBlank(),p:pyNew('cash',{dir:k})};else if(k==='gin'||k==='gout')sv.qa={...qaBlank(),x:xrNew(k==='gin'?'in':'out','gold')};
  PARENT.sell=cur==='cust'?'cust':'custs';svKeep();go('sell')};
/* v61.6: سندی که ثبت نشده (خروج ناگهانی از صفحه سند) زیر «سند جدید» در صفحه همان مشتری دیده می‌شود */
function svDraft(c){const o=ls.get('m_svd',null);if(!o||!(o.v===1||o.v===2)||String(o.cuId||'')!==String(c.id))return null;const n=(o.items||[]).length+(o.xr||[]).length+(o.pays||[]).length;return n?{o,n}:null}
function svDraftHTML(c){const D=svDraft(c);if(!D)return '';const keep=sv;let T;try{sv=D.o;svFix();T=svTot()}catch(_){T=null}finally{sv=keep}
  const r=T?T.rest:0;return `<div class="c6dr"><button class="c6drb" data-act="svNew" data-cu="${c.id}"><span class="c6ni">${ic('edit')}</span><span><b>${D.o.edit?'ویرایش ناتمام سند '+toFa(D.o.edit.no):'سند ثبت‌نشده'}</b><small>${toFa(D.n)} ردیف${D.o.date?'، '+esc(dates(D.o.date).fa):''}${r?'، '+ourLab(-r)+' '+fmt(Math.abs(r)):''} · برای ادامه بزنید</small></span>${ic('back').replace('class="i"','class="i flip"')}</button><button class="c6drx" data-act="svDraftDel" aria-label="دور انداختن">${ic('trash')}</button></div>`}
ACT.svDraftDel=()=>{const o=ls.get('m_svd',null);askConfirm('سند ثبت‌نشده دور ریخته شود؟','دور انداختن',()=>{ls.set('m_svd',null);render();toast('سند ثبت‌نشده دور ریخته شد','','برگرداندن',()=>{ls.set('m_svd',o);render()})})};
/* اجرت: درصدی و تومانی با هم (ردیف‌های قدیمی فقط یکی از این دو را دارند) */
const ajPT=it=>({P:it.ajP!=null?+it.ajP||0:(it.ajU==='p'?+it.aj||0:0),T:it.ajT!=null?+it.ajT||0:(it.ajU==='t'?+it.aj||0:0)});
const ajLab=it=>{const J=ajPT(it);return [J.P?toFa(J.P)+'٪':'',J.T?fmt(J.T)+' تومان':''].filter(Boolean).join(' + ')||'۰'};
function itCalc(it,rate,tax){if(+it.mz)rate=(+it.mz)/MZK;/* v61.7: مظنه همان ردیف */const w=+it.w||0,ay=+it.ay||750,gold=Math.round(w*(+rate||0)*ay/750),J=ajPT(it),aj=Math.round(gold*J.P/100)+Math.round(J.T),pr0=Math.round((gold+aj)*(+it.pp||0)/100),tx0=tax&&!it.ab?Math.round((aj+pr0)*0.10):0;
  /* v61.27: مبلغ دستی کالا (it.amT): جمع همان می‌ماند و فرقش در «سود» می‌نشیند (با مالیات ۱۰٪ روی اجرت+سود، اگر سند مالیات دارد) */
  /* v61.46: مبلغ دستی تازه (it.amN) = مبلغ پیش از مالیات؛ تیک مالیات ۱۰٪ اجرت+سود را رویش اضافه می‌کند (قبلاً مالیات از سود کم می‌شد و جمع تکان نمی‌خورد) */
  if(+it.amT>0&&w>0&&it.amN){const T=Math.round(+it.amT),pr=T-gold-aj,x=tax&&!it.ab?Math.max(0,Math.round((aj+pr)*0.10)):0;return{gold,aj,pr,tax:x,tot:T+x,fx:1}}
  if(+it.amT>0&&w>0){const T=Math.round(+it.amT),t=tax&&!it.ab,pr=Math.round(t?(T-gold)/1.1:T-gold)-aj,x=T-gold-aj-pr;return{gold,aj,pr,tax:x,tot:T,fx:1}}
  return{gold,aj,pr:pr0,tax:tx0,tot:gold+aj+pr0+tx0}}
/* ردیف طلا، سکه یا ارز: t فروش|خرید|دریافت|تحویل · pul = پولی (جنس جابه‌جا نمی‌شود، به حساب مشتری می‌رود) */
const XT={sell:'فروش',buy:'خرید',in:'دریافت',out:'تحویل'};
/* v61.12: عیار پیش‌فرض همه ۷۵۰؛ فقط خرید ۷۳۵ و تعویض ۷۴۰ */
const xrAy=(t,pul,cat)=>pul?750:cat==='تعویض'?740:cat==='مرجوعی'?750:t==='buy'?735:750;
function xrNew(t,a,o){const g=a==='gold',x={t,a,pul:false,w:'',q:'',ay:g?xrAy(t,o&&o.pul,o&&o.cat):0,pg:0,pgM:false,cat:g?(t==='in'||t==='out'?'آبشده':'متفرقه'):'',...(o||{})};if(!g&&!x.pg)x.pg=+ls.get('m_px_'+a,0)||0;return x}
/* خرید متفرقه = نرخ روز با عیار ۷۳۵، فروش متفرقه = عیار ۷۴۰؛ نرخ هر گرم با تغییر مظنه خودکار عوض می‌شود مگر دستی زده شده باشد */
const fcs=id=>{const e=$(id);if(e)e.focus()};
function xrCalc(x,rate){const g=x.a==='gold',money=x.t==='sell'||x.t==='buy';
  const pg=g&&!x.pgM?Math.round((g&&+x.mz?(+x.mz)/MZK:(+rate||0))*(+x.ay||750)/750):+x.pg||0;
  /* v61.6: اگر مبلغ داده شده (x.am)، وزن از مظنه حساب می‌شود */
  const n=g&&money&&+x.am&&pg?Math.round(+x.am/pg*1000)/1000:g?(parseFloat(x.w)||0):(parseFloat(x.q)||0),q=g?Math.round(n*(+x.ay||750)/750*1000)/1000:n;
  /* v61.25: مبلغ دستی (x.amT) برای همه ردیف‌های پولی (خرید، تعویض، فروش متفرقه، سکه و ارز): مبلغ همان می‌ماند و نرخ نهایی هر گرم/عدد = مبلغ ÷ وزن (وزن تبدیل نمی‌شود) */
  const fx=money&&!(g&&+x.am)&&+x.amT>0&&n>0,amount=money?(fx?Math.round(+x.amT):g&&+x.am?Math.round(+x.am):Math.round(n*(fx?0:pg))):0,pgF=fx?Math.round(amount/n):pg;
  const e=x.t==='in'?q:x.t==='out'?-q:x.pul?(x.t==='sell'?q:-q):0;return{n,pg:pgF,q,amount,e,...(fx?{fx:1}:{})}}
function xrLab(x){const g=x.a==='gold',A=g?'طلا':(XA[x.a]||{t:x.a}).t;if(!g&&XA[x.a]&&XA[x.a].k==='o')return (x.t==='sell'?'فروش ':'خرید ')+(x.nt||A);if(g&&x.sh===1&&x.cat==='آبشده')return (x.t==='buy'?'خرید':x.t==='sell'?'فروش':x.t==='in'?'دریافت':'تحویل')+' آبشده شرطی';if(g&&x.pz)return (x.t==='buy'?'خرید':x.t==='sell'?'فروش':x.t==='in'?'دریافت':'تحویل')+' سکه پارسیان';
  if(x.cat==='مانده قبلی')return 'مانده قبلی '+(g?'طلا':A)+' · '+(x.t==='out'?'طلبکاریم':'بدهکاریم');if(g&&x.cat==='تعویض')return 'تعویض طلا';if(g&&x.cat==='مرجوعی')return 'مرجوعی';if(g&&(x.t==='in'||x.t==='out')&&x.cat&&x.cat!=='متفرقه')return (x.t==='in'?'دریافت ':'تحویل ')+x.cat;
  if(g){if(x.cat==='قلک'&&x.pul)return (x.t==='buy'?'خرید':'فروش')+' قلک';if(x.t==='buy')return x.pul?'خرید پولی طلا':'خرید '+(x.cat&&x.cat!=='متفرقه'?'طلا · '+x.cat:'متفرقه');if(x.t==='sell')return x.pul?'فروش پولی طلا':'فروش '+(x.cat&&x.cat!=='متفرقه'?'طلا · '+x.cat:'متفرقه');return (x.t==='in'?'دریافت طلا':'تحویل طلا')}
  return XT[x.t]+(x.pul?' پولی ':' ')+A}
function xrSub(x,C){const g=x.a==='gold',m=x.t==='sell'||x.t==='buy';C=C||xrCalc(x,sv?sv.rate:0);
  return g?[x.pz&&+x.cnt?qFmt(x.cnt)+' عدد':'',(x.pz&&+x.cnt?'وزن کل ':'')+wFmt(C.n)+' گرم',shAyL(x)||(x.ay!=750?'عیار: '+toFa(x.ay):''),shEff(x),/* v61.60: خرید آبشده = وزن ۷۵۰ و هر گرم ۱۸ (عیار روی وزن نه قیمت) */g&&x.cat==='آبشده'&&!x.pul&&m&&C.q?'وزن ۷۵۰: '+wFmt(C.q)+' گرم':'',m?(g&&x.cat==='آبشده'&&!x.pul&&!C.fx?'هر گرم ۱۸: '+fmt(Math.round(C.pg*750/(+x.ay||750)))+' تومان':(x.t==='buy'&&!x.pul?'هر گرم خرید: ':'هر گرم: ')+fmt(C.pg)+' تومان'+(C.fx?' · مبلغ دستی':'')):'',C.e&&Math.abs(C.e)!==C.n?'معادل '+wFmt(Math.abs(C.e))+' گرم ۱۸':''].filter(Boolean).join(' · ')
    :[qFmt(C.n)+' '+((XA[x.a]||{}).u||''),m?'هر '+((XA[x.a]||{}).u||'واحد')+': '+fmt(C.pg)+' تومان'+(C.fx?' · مبلغ دستی':''):''].filter(Boolean).join(' · ')}
function svTot(){let gold=0,aj=0,pr=0,tax=0,w=0;for(const it of sv.items){const c=itCalc(it,sv.rate,sv.tax);gold+=c.gold;aj+=c.aj;pr+=c.pr;tax+=c.tax;w+=+it.w||0}
  let xs=0,xb=0,ge=0;const xe={};for(const x of sv.xr||[]){const c=xrCalc(x,sv.rate);if(x.t==='sell')xs+=c.amount;else if(x.t==='buy')xb+=c.amount;if(c.e){if(x.a==='gold')ge+=c.e;else xe[x.a]=Math.round(((xe[x.a]||0)+c.e)*100)/100}}
  const sub=gold+aj+pr+tax,gross=sub+xs,disc=Math.min(+sv.disc||0,Math.max(0,gross)),total=gross-disc-xb,paid=svPaid();
  return{gold,aj,pr,tax,w:Math.round(w*1000)/1000,sub,xs,xb,disc,total,paid,rest:total-paid,ge:Math.round(ge*1000)/1000,xe}}
const svCu=()=>sv&&sv.cuId?CU().find(c=>String(c.id)===String(sv.cuId))||null:null;
const svHasG=()=>sv.items.length||(sv.xr||[]).some(x=>x.a==='gold'&&(x.t==='sell'||x.t==='buy')&&!x.pgM);
function vSell(){xaSync();if(!sv){sv=ls.get('m_svd',null)||svBlank('')}svFix();glSync();svUsed=goodsUsed();const D=dates(sv.date);
  return `<div class="d6">
  <div class="d6hd"><button class="d6no" data-act="svCal"><small>${sv.items.length?'فاکتور':'سند'}</small><b>${toFa(sv.edit?sv.edit.no:invNext())}</b><span>${ic('cal')}${esc(payLab(sv.date)||D.fa)}</span></button><button type="button" class="d6tx${sv.tax?' on':''}" id="svTx" data-act="svTax" aria-pressed="${!!sv.tax}"><i>${ic('check')}</i><span>مالیات</span><small>۱۰٪</small></button>
    ${rateHTML()}</div>
  <div id="svCu">${svCuHTML()}</div>
  <div class="d6q" id="qa">${qaHTML()}</div>
  <div id="svRows"${render._same?'':' class="first"'}>${svRowsHTML()}</div>
</div>`}
/* v60.5: نرخ طلا: فقط یکی (مظنه یا هر گرم ۱۸) وارد می‌شود و دیگری خودکار حساب می‌شود (×/÷ ۴٫۳۳۱۸) */
/* v61.5: نرخ طلا یک فیلد کوچک بدون کلید: برنامه خودش تشخیص می‌دهد عدد «مظنه» است یا «هر گرم ۱۸» (نسبت ۴٫۳۳۱۸)،
   با مقایسه با نرخ قبلی (یا اگر نرخی نبود، بالای ۶۰ میلیون = مظنه) و دیگری را کوچک زیرش می‌نویسد */
const rtK=()=>sv&&sv.rk?sv.rk:(ls.get('m_rtk','mz')==='g'?'g':'mz');
const rtDetect=(v,ref)=>!v?rtK():ref?(Math.abs(v-ref*MZK)<Math.abs(v-ref)?'mz':'g'):(v>=6e7?'mz':'g');
function rateHTML(){const k=rtK(),v=k==='mz'?sv.mz:sv.rate;
  return `<label class="d6rate2${sv.rate?'':' need'}" id="svRate"><small id="svRl">${sv.rate?(k==='mz'?'مظنه':'هر گرم ۱۸'):'مظنه یا هر گرم'}</small><input id="svM" class="ltr" inputmode="numeric" value="${v?Number(v).toLocaleString('en-US'):''}" placeholder="" autocomplete="off" enterkeyhint="next"><span class="d6rx" id="svRx">${rateX()}</span>${glRateHTML()}</label>`}
const rateX=()=>sv.rate?(rtK()==='mz'?'هر گرم <b>'+fmt(sv.rate)+'</b>':'مظنه <b>'+fmt(sv.mz)+'</b>'):'دیگری خودکار';
ACT.svTax=()=>{sv.tax=!sv.tax;ls.set('m_tax',sv.tax);svKeep();const b=$('svTx');if(b){b.classList.toggle('on',sv.tax);b.setAttribute('aria-pressed',sv.tax);if(!RM()&&b.animate)b.animate([{transform:'scale(1)'},{transform:'scale(.9)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:420,easing:'cubic-bezier(.3,1.4,.5,1)'})}svRe();const t=svTot();toast(sv.tax?'مالیات ۱۰٪ روی اجرت و سود'+(t.tax?' · '+fmt(t.tax)+' تومان':''):'مالیات برداشته شد')};
const aSell=()=>`<div id="svFt" class="svgo">${svFtIn()}</div>`;
/* ----- مشتری ----- */
function svCuHTML(){const c=svCu();if(c&&sv.fixCu)return '';/* v61.5: صاحب سند در نوار بالا */if(c){const B=svCuBHTML();return `<div class="d6cuw${B?' wb':''}"><div class="d6cu">${cuAvH(c)}<span class="tx">${honTag(c.name)}<b>${esc(cuName(c))}</b><small>${[c.grp?'<em>'+esc(c.grp)+'</em>':'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span>${sv.fixCu?"":`<button class="lnk" data-act="svCuX">تغییر</button>`}</div><div id="svCuB">${B}</div></div>`}
  return `<div class="d6pick cbx"><div class="fsearch">${ic('search')}<input id="svQ" type="search" value="${esc(sv.q||'')}" placeholder="مشتری: نام، شماره، کد ملی یا گروه…" autocomplete="off" enterkeyhint="search"></div><div id="svCr">${svCrHTML()}</div></div>`}
/* v61.93 (خواسته صاحب اپ): تا سند ردیفی ندارد، «مانده حساب» داخل کارت مشتری است (نه نوار پایین)؛ با اولین ردیف، نوار پایین برمی‌گردد.
   هر قاب = تسویه همان مانده (مثل نوار پایین) */
function svCuBHTML(){const c=svCu();if(!c||svRows())return '';const b=svCuBal(c);if(cuZero(b))return `<div class="d6cub z"><small>مانده حساب</small>${cuZTag()}</div>`;
  return `<div class="d6cub"><small>مانده حساب</small><span class="q8fs">${q8Keys(b).map((k,i)=>`<button type="button" class="q8b" data-act="svBal" data-k="${k}">${q8F(k,q8V(b,k),{i})}</button>`).join('')}</span></div>`}
function svCuBSync(){const B=$('svCuB'),h=svCuBHTML();if(B&&B.innerHTML!==h){B.innerHTML=h;const w=B.parentNode;if(w)w.classList.toggle('wb',!!h)}const a=$('act'),g=$('svFt');if(a&&g&&cur==='sell')a.classList.toggle('sv0',!g.innerHTML.trim())}
function svCrHTML(){const q0=clean(sv.q||''),q=nzName(toEn(q0)),A=CU();
  /* v61.93: زدن اول روی جستجو = فهرست آخرین مشتری‌ها با مانده (بدون کیبورد)؛ زدن دوم = تایپ */
  if(!q){if(!svQO)return '';const R=A.slice().sort((a,b)=>String(b.lastAt||b.createdAt||'').localeCompare(String(a.lastAt||a.createdAt||''))).slice(0,8);
    return `<div class="bzsug cbl" role="listbox"><div class="cblh">آخرین حساب‌ها<small>برای جستجو دوباره بزنید</small></div>${R.map(c=>cbRow('svCu',{id:c.id},cuAvI(c),esc(cuName(c)),[c.grp?esc(c.grp):'',c.phone?'<span class="ltr">'+esc(toFa(c.phone))+'</span>':''].filter(Boolean).join(' · ')||'حساب مشتری',cuBalMini(c))).join('')}${cbRow('svCuNew',{},ic('plus'),'افتتاح حساب تازه','اول مشخصات، بعد روی همین سند می‌نشیند','','nw')}</div>`}
  const L=A.filter(c=>nzName([c.name,c.phone,c.nid,c.grp].join(' ')).includes(q)).sort((a,b)=>(nzName(b.name).startsWith(q)-nzName(a.name).startsWith(q))||String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,6);
  const add=!/^\d+$/.test(toEn(q0))&&!A.some(c=>nzName(c.name)===nzName(q0));
  return `<div class="bzsug cbl" role="listbox">${L.map(c=>cbRow('svCu',{id:c.id},cuAvI(c),esc(cuName(c)),[c.grp?esc(c.grp):'',c.phone?'<span class="ltr">'+esc(toFa(c.phone))+'</span>':''].filter(Boolean).join(' · ')||'حساب مشتری',cuBalMini(c))).join('')}
    ${cbRow('svCuNew',{},ic('plus'),add?'حساب تازه: «'+esc(q0)+'»':'افتتاح حساب تازه',(L.length?'':'مشتری‌ای پیدا نشد · ')+'اول مشخصات، بعد روی همین سند می‌نشیند','','nw')}</div>`}
let svQO=0;const cuAvI=c=>c&&c.av?`<img data-ik="${esc(c.av)}" alt="">`:esc(userInit(c?c.name:''));
function svPick(id){svQO=0;sv.cuId=id;sv.q='';svKeep();if(cur!=='sell')go('sell');else{$('svCu').innerHTML=svCuHTML();svRe()}const e=document.querySelector('.d6cu');if(e)e.classList.add('pop');setTimeout(()=>{const f=!sv.rate&&svHasG()?$('svM'):null;if(f&&cur==='sell'&&$('ov').classList.contains('hide'))f.focus()},60)}
ACT.svCu=d=>svPick(d.id);
ACT.svCuX=()=>{sv.cuId='';sv.pays=sv.pays.filter(p=>p.m!=='cust');svKeep();$('svCu').innerHTML=svCuHTML();svBindCu();svQO=1;srchSwap('svCr',svCrHTML());phPaint($('svCr'));svRe()};
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
  ...Object.keys(XA).filter(k=>XA[k].k!=='o').map(k=>({id:'a'+k,t:XA[k].t,d:XA[k].k==='c'?'فروش، خرید، دریافت یا تحویل سکه':'فروش، خرید، دریافت یا تحویل ارز',i:XA[k].k==='c'?'coin':'usd',al:XA[k].t+' '+(XA[k].k==='c'?'سکه':'ارز دلار یورو درهم'),x:['sell',k]})),
  {id:'pi',t:'دریافت وجه',d:'نقد، کارتخوان، حواله یا از حساب مشتری دیگر',i:'down',al:'دریافت وجه پول نقد واریز',p:['cash','in']},
  {id:'po',t:'پرداخت وجه',d:'نقد، حواله یا به حساب مشتری دیگر',i:'share',al:'پرداخت وجه پول نقد',p:['cash','out']},
  {id:'pp',t:'کارتخوان',d:'کشیدن کارت روی کارتخوان مغازه',i:'card',al:'کارتخوان کارت پوز',p:['pos','in']},
  {id:'ph',t:'حواله',d:'به یا از حساب‌های ما',i:'bank',al:'حواله کارت به کارت انتقال بانک ساتنا پایا',p:['hav','in']},
  {id:'pd',t:'تخفیف',d:'از جمع سند کم می‌شود',i:'tag',al:'تخفیف کسر',p:['disc','in']}];
function goodsUsed(){const u={};for(const c of custs)if(!c.del)for(const t of c.txs||[])if(t.type==='inv'&&!t.del)for(const i of t.items||[])u[i.k]=(u[i.k]||0)+1;return u}
function qaBlank(){const L=sv&&sv.items&&sv.items[sv.items.length-1],J=L?ajPT(L):{P:+ls.get('m_aj',0)||0,T:0};return{k:'',q:'',w:'',ay:750,ajP:J.P||'',ajT:J.T||'',pp:PROFIT_DEF(),p:null,x:null,i:null}}
const pAmt=p=>+p.amount||0,svPaid=skip=>sv.pays.reduce((s,p,i)=>i===skip?s:s+pAmt(p),0);
const srcName=id=>{const s=sources.find(z=>String(z.id)===String(id));return s?s.name:''};
function pyLab(p,long){const ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId)),acc=p.srcId!=null?srcName(p.srcId):ch?ch.name:'',out=pAmt(p)<0,nm=p.cuName||((p.cuId&&custs.find(z=>String(z.id)===String(p.cuId)))||{}).name||'';
  switch(p.m){case 'cash':return out?'پرداخت نقد':'دریافت نقد';case 'pos':return 'کارتخوان'+(acc?' · '+acc:'');case 'hav':return (out?'پرداخت حواله':'دریافت حواله')+(acc?' · '+acc:'');
    case 'gold':return 'طلای مشتری · '+wFmt(p.w)+' گرم'+(long?' عیار '+toFa(p.ay||750):'');case 'dep':return 'حواله به «'+depName(p)+'»';case 'cust':return out?'حواله به حساب «'+nm+'»':'حواله از حساب «'+nm+'»';case 'nm':return (out?'حواله از «':'حواله به «')+(p.cuName||'')+'» · دستی';case 'off':return out?'پرداخت تخفیف':'دریافت تخفیف';case 'prev':return 'مانده قبلی تومان · '+(out?'طلبکاریم':'بدهکاریم');case 'wd':return p.nm?'تسویه از «'+p.nm+'» · روی واریزی':(out?'پرداخت حواله از «':'دریافت حواله از «')+(p.src||'بانک')+'»';default:return (PM[p.m]||{}).t||''}}
function qaChips(){const a=sv.qa,q=nzName(toEn(a.q||''));if(!q)return '';
  const A=goodsList().filter(k=>nzName(k).includes(q)).sort((x,y)=>(nzName(y).startsWith(q)-nzName(x).startsWith(q))||(svUsed[y]||0)-(svUsed[x]||0)).slice(0,5);
  const bu=sv.dk==='buy',S=SPK.filter(s=>nzName(s.t+' '+s.al).includes(q)).sort((a,b)=>bu?((b.x&&b.x[0]==='buy')-(a.x&&a.x[0]==='buy')):0).slice(0,6);
  const P=CH('pos').filter(c=>nzName(c.name).includes(q)).slice(0,3),B=ownL().filter(s=>nzName(s.name+' '+(s.bank||'')).includes(q)).slice(0,3),U=CU().filter(c=>String(c.id)!==String(sv.cuId)&&nzName([c.name,c.phone,c.grp].join(' ')).includes(q)).slice(0,4);
  const rA=A.map(k=>cbRow('qaK',{k},ic('ring'),esc(k),'کالا · با اجرت و سود'+(svUsed[k]?'، '+toFa(svUsed[k])+' بار فروخته شده':''),'','gd')),rS=S.map(s=>cbRow('qaS',{s:s.id},ic(s.i),s.t,s.d,'','spk'));
  const rows=(bu?rS.concat(rA):rA.concat(rS))
    .concat(P.map(c=>cbRow('qaCh',{id:c.id},ic('card'),esc(c.name),'کارتخوان ما','<b class="chv">'+fmt(chBal(c))+'</b>','ch')))
    .concat(B.map(s=>{const e=acFin(s);return cbRow('qaSrc',{id:s.id},ic('bank'),esc(s.name),'حواله با حساب ما',e==null?'':'<b class="chv">'+fmt(e)+'</b>','ch')}))
    .concat(U.map(c=>cbRow('qaCu',{id:c.id},esc(userInit(c.name)),esc(cuName(c)),'حواله با حساب این مشتری',`<span class="c6v">${bpill('r',cuBal(c).R)}</span>`)));
  if(!A.some(k=>nzName(k)===q)&&!/^\d+$/.test(q))rows.push(cbRow('qaK',{k:clean(a.q)},ic('plus'),'کالای تازه «'+esc(clean(a.q))+'»','به فهرست کالاها اضافه می‌شود','','nw'));
  return `<div class="bzsug cbl" role="listbox">${rows.join('')}</div>`}
const numV=(v,dec)=>v===''||v==null||(!dec&&!+v)?'':dec?esc(v):Number(v).toLocaleString('en-US');
const cell=(id,lab,val,o={})=>`<label class="d6c${o.cls?' '+o.cls:''}"><small>${lab}</small><input id="${id}" class="ltr" inputmode="${o.im||'decimal'}" value="${val}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="done"${o.ro?' readonly':''}></label>`;
function qaHTML(){const a=sv.qa;if(a.pv)return stHTML();if(a.p&&a.p.m!=='disc'&&a.p.m!=='gold'||a.x||a.k)return stHTML();/* v61.6: همه ردیف‌ها پله‌به‌پله */if(a.p)return pyHTML();if(a.x)return xrHTML();
  if(!a.k)return dkHTML();
  const ed=a.i!=null;
  if(a.ab)return `<div class="d6qh"><b><span class="d6ti gd">${ic('coin')}</span>${ed?'آبشده':'فروش › آبشده'}</b><button class="lnk" data-act="${ed?'qaX':'qaK'}" data-k="">${ed?'بستن':'تغییر'}</button></div>
  <div class="d6g">${cell('qW','وزن آبشده (گرم)',numV(a.w,1),{ph:'0.000',cls:'w'})}${cell('qY','عیار',esc(a.ay||750),{im:'numeric'})}<div class="d6c ro"><small>وزن ۷۵۰</small><b id="qW7">—</b></div>${cell('qS','سود ٪',numV(a.pp,1),{ph:'۰٫۵ تا ۱'})}<label class="d6c"><small>کد آزمایشگاه</small><input id="qL" class="ltr" value="${esc(a.lab||'')}" autocomplete="off" enterkeyhint="next"></label><label class="d6c"><small>شماره انگ</small><input id="qN" class="ltr" inputmode="numeric" value="${esc(a.ang||'')}" autocomplete="off" enterkeyhint="done"></label></div>
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="qaDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="qaAdd">${ic(ed?'check':'plus')} ${ed?'ذخیره':'افزودن'}</button></div>`;
  return `<div class="d6qh"><b><span class="d6ti gd">${ic('ring')}</span>${esc(a.k)}</b><button class="lnk" data-act="${ed?'qaX':'qaK'}" data-k="">${ed?'بستن':'تغییر'}</button></div>
  <div class="d6g">${cell('qW','وزن (گرم)',numV(a.w,1),{ph:'0.000',cls:'w'})}${cell('qY','عیار',esc(a.ay||750),{im:'numeric'})}${cell('qJ','اجرت ٪',numV(a.ajP,1),{ph:'۰'})}${cell('qJT','اجرت تومانی',numV(a.ajT),{im:'numeric',ph:'۰'})}${cell('qS','سود ٪',numV(a.pp,1),{ph:'۰'})}<div class="d6c ro"><small>هر گرم این عیار</small><b id="qPg">—</b></div></div>
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="qaDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="qaAdd">${ic(ed?'check':'plus')} ${ed?'ذخیره':'افزودن'}</button></div>`}
function qaRead(){const a=sv.qa,g=id=>{const e=$(id);return e?e.value:undefined};if($('stI')&&typeof stRead==='function')stRead();if($('qW'))a.w=decIn(g('qW'));if($('qY'))a.ay=+toEn(g('qY')).replace(/\D/g,'')||'';if($('qJ'))a.ajP=decIn(g('qJ'));if($('qJT'))a.ajT=num(g('qJT'));if($('qS'))a.pp=decIn(g('qS'));if($('qL'))a.lab=clean(g('qL'));if($('qN'))a.ang=clean(g('qN'));if($('qK'))a.q=g('qK');if(a.p)pyRead();if(a.x)xrRead()}

function ajLast(k){const q=nzName(k||''),c=svCu(),ok=it=>it&&!it.ab&&nzName(it.k||'')===q&&(()=>{const J=ajPT(it);return J.P||J.T})();
  for(let i=(sv.items||[]).length-1;i>=0;i--)if(ok(sv.items[i]))return ajPT(sv.items[i]);
  const scan=L=>{let b=null,ba='';for(const t of L){if(!t||t.type!=='inv'||t.del)continue;const at=String(t.at||'');if(at<ba)continue;for(const it of t.items||[])if(ok(it)){b=it;ba=at}}return b};
  const own=c&&scan(c.txs||[]);if(own)return ajPT(own);const any=scan(CU().flatMap(z=>z.txs||[]));return any?ajPT(any):null}
const qaIt=a=>({...(+a.mz?{mz:+a.mz}:{}),k:a.k,w:parseFloat(a.w)||0,ay:+a.ay||750,ajP:a.ab?0:parseFloat(a.ajP)||0,ajT:a.ab?0:+a.ajT||0,pp:parseFloat(a.pp)||0,...(a.pz?{pz:1,cnt:+a.cnt||0}:{}),...(Array.isArray(a.imgs)&&a.imgs.length?{imgs:a.imgs.slice(),img:a.imgs[0]}:{}),...(+a.amT>0?{amT:Math.round(+a.amT),amN:1}:{}),...(a.ab?{ab:1,lab:a.lab||'',ang:a.ang||'',...(a.sh?{sh:a.sh}:{})}:{})});
function qaCalc(){const B=$('qB');if(!B)return;qaRead();const a=sv.qa;if(a.p){pyHint();return}if(a.x){xrHint();return}const it=qaIt(a),c=itCalc(it,sv.rate,sv.tax),pg=$('qPg'),w7=$('qW7');if(w7)w7.textContent=it.w?wFmt(Math.round(it.w*it.ay/750*1000)/1000)+' گرم':'—';if(pg)pg.textContent=sv.rate?fmt(Math.round(sv.rate*it.ay/750)):'—';
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
/* v61.18–v61.45 نوار مانده‌ها و پنل بازشونده برداشته شد (v61.46: کارت تسویه، svFtIn) */
const bpRise=(root,sel)=>{if(RM()||!root)return;root.querySelectorAll(sel).forEach((el,i)=>el.animate&&el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:300,delay:40+i*35,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'}))};
/* در سند: رنگ و نوشته از دید مغازه — طلبکاریم (مشتری به ما بدهکار) قرمز، بدهکاریم (ما به مشتری) آبی */
const ourLab=v=>!v?'تسویه':v<0?'طلبکاریم':'بدهکاریم';
/* عیار و عددها: با زدن روی کادر، کل عدد انتخاب می‌شود و با تایپ جایگزین */
const selOnFocus=el=>{if(el&&!el.readOnly)el.addEventListener('focus',()=>setTimeout(()=>{try{el.select()}catch(e){}},0))};
function qaBind(){const K=$('qK'),a=sv.qa,keep=()=>{qaRead();svKeep()};
  if($('qa')&&$('qa').querySelector('.stw')){stBind();return}
  if(a.p){pyBind();return}if(a.x){xrBind();return}
  /* v61.2: فهرست تشخیص/نوع با لمس فیلد باز و با ترک آن (اگر خالی است) بسته می‌شود */
  if(K&&!a.k){const B=K.closest('.dkbox');if(B){K.onfocus=()=>{dkOpen=true;B.classList.add('open')};K.onblur=null}}
  /* v61.59: فهرست باز → زدن = کیبورد؛ فهرست بسته → زدن = باز شدن فهرست (kb2 در 15j) */
  if(K){const B=K.closest('.dkbox');kb2(K,()=>!!(B&&B.classList.contains('open')),()=>dkShow())}
  if(K){K.oninput=()=>{a.q=K.value;clearTimeout(K._t);K._t=setTimeout(()=>{const r=$('qKs');if(r)r.innerHTML=dkList()},60);svKeep()};
    K.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();a.q=K.value;const r=$('qKs');if(r)r.innerHTML=dkList();const f=document.querySelector('#qKs [data-act]');if(f)ACT[f.dataset.act]({...f.dataset})}};
    const KS=$('qKs');if(KS)KS.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
  const ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.qaAdd()}};
  ['qL','qN'].forEach(id=>{const el=$(id);if(el){el.oninput=keep;el.onkeydown=ent}});[['qW','d'],['qY','i'],['qJ','d'],['qJT','n'],['qS','d']].forEach(([id,k])=>{const el=$(id);if(!el)return;selOnFocus(el);el.onkeydown=ent;el.oninput=()=>{if(k==='d')el.value=decIn(el.value);else if(k==='i')el.value=toEn(el.value).replace(/\D/g,'').slice(0,3);else{const v=num(el.value);el.value=v?v.toLocaleString('en-US'):''}keep();qaCalc()}});
  qaCalc()}
/* v61.61: جهت حرکت پنجره ورود ردیف — 'bw' برگشت (از راست می‌آید)، بقیه جلو (از چپ) */
let qaDir='';
/* v61.95 (خواسته صاحب اپ): در ورود سند کیبورد پایین نمی‌رود — اگر پیش از تازه‌سازی پنجره ردیف فیلدی فعال بود (کیبورد باز)،
   همان لحظه (هم‌زمان با لمس؛ آیفون فوکوسِ دیرتر را نادیده می‌گیرد) فیلد مناسب پنجره تازه فوکوس می‌گیرد: پله ← فیلد پله، تشخیص ← جستجوی تشخیص با فهرست باز */
const qaKbOn=()=>{const q=$('qa'),a=document.activeElement;return !!(q&&a&&q.contains(a)&&/^(INPUT|TEXTAREA)$/.test(a.tagName)&&a.type!=='file'&&!a.readOnly)};
function qaKbKeep(){const q=$('qa');if(!q)return;const I=$('stI');if(I&&!I.readOnly){try{I.focus({preventScroll:true})}catch(_){I.focus()}return}
  const K=$('qK');if(K){dkShow();K.readOnly=false;try{K.focus({preventScroll:true})}catch(_){K.focus()}return}
  const F=[...q.querySelectorAll('input:not([type=file]):not(.stkb),textarea')].find(x=>!x.readOnly&&!x.disabled&&x.offsetParent);if(F)try{F.focus({preventScroll:true})}catch(_){F.focus()}}
const qaRe=f=>{const q=$('qa');if(!q)return;const dir=qaDir,kb=qaKbOn();qaDir='';q.innerHTML=qaHTML();qaBind();/* v61.57: جستجوی تشخیص/کالا خودکار فوکوس نمی‌گیرد (کیبورد فقط با زدن دوم) — مگر کیبورد از قبل باز بوده (v61.95) */const e=f&&f!=='qK'&&$(f);if(e)e.focus({preventScroll:false});else if(kb)qaKbKeep();q.classList.remove('swap','bw');void q.offsetWidth;q.classList.add('swap');if(dir==='bw')q.classList.add('bw')};
const qaDone=()=>{sv.qa=qaBlank();svKeep();qaRe();svRe()};/* v61.2: بعد از افزودن، فهرست تشخیص بسته می‌ماند تا ردیف‌ها دیده شوند */
ACT.qaK=d=>{qaRead();const a=sv.qa;a.k=d.k?clean(d.k):'';a.i=null;if(a.ab||a.k)Object.assign(a,{ab:0,lab:'',ang:'',mz:'',mzk:'',pp:PROFIT_DEF(),ay:750,pz:0,cnt:'',imgs:[],img:'',amT:''});/* v61.47 (خواسته صاحب اپ): متفرقه و سکه پارسیان اجرت ندارند و سود پیش‌فرض ثابت ۷٪؛ کالای ساخته = آخرین اجرت همین کالا برای همین مشتری
  (اگر نبود، آخرین اجرت همین کالا برای هر مشتری) */if(a.k){const J=ajLast(a.k);a.ajP=J&&J.P||'';a.ajT=J&&J.T||''}if(a.k)addGoods(a.k);a.q='';svKeep();qaRe(a.k?'qW':'qK')};
ACT.qaS=d=>{const s=SPK.find(z=>z.id===d.s);if(!s)return;qaRead();if(s.x){if(s.x[1]==='gold'&&s.x[0]!=='in'&&s.x[0]!=='out'&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true);$('svM').focus();return}xrStart(xrNew(s.x[0],s.x[1],{pul:!!s.x[2]}));return}
  if(s.p[0]==='disc'){pyStart(pyNew('disc'));return}pyStart(pyNew(s.p[0],{dir:s.p[1]}))};
ACT.qaAdd=()=>{qaRead();const a=sv.qa;if(!a.k){toast('کالا را انتخاب کنید',true);dkShow();return}const it0=qaIt(a);if(!it0.w){toast('وزن را بزنید',true);fcs('qW');return}
  const old=a.i!=null?sv.items[a.i]:null,it={...it0,cat:it0.ab?'آبشده':old&&old.cat?old.cat:GK.includes(a.k)?a.k:'نو',n:old?old.n||'':''};if(!it.ab)ls.set('m_aj',it.ajP)
  if(a.i!=null){sv.items[a.i]=it;svAdd=a.i}else{sv.items.push(it);svAdd=sv.items.length-1;svUsed[it.k]=(svUsed[it.k]||0)+1}const ay=it.ay;qaDone();sv.qa.ay=ay};
ACT.qaDel=()=>{const a=sv.qa;if(a.i==null)return;const k=sv.items.splice(a.i,1)[0];qaDone();toast('«'+(k&&k.k)+'» از سند حذف شد','', 'بازگردانی',()=>{if(k){sv.items.push(k);svKeep();svRe()}})};
ACT.svItEdit=d=>{const it=sv.items[+d.i];if(!it)return;qaRead();const J=ajPT(it);sv.qa={...qaBlank(),mz:it.mz||'',k:it.k,w:String(it.w),ay:it.ay||750,ajP:J.P||'',ajT:J.T||'',pp:it.pp,amT:it.amT||'',pz:it.pz?1:0,cnt:it.cnt||'',imgs:xrPh(it),i:+d.i,...(it.ab?{ab:1,lab:it.lab||'',ang:it.ang||'',sh:it.sh||0}:{})};svKeep();qaRe('qW');const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
/* ----- ردیف طلا / سکه / ارز ----- */
const xrStart=x=>{qaRead();sv.qa.x=x;sv.qa.p=null;sv.qa.q='';svKeep();qaRe()};
function xrHTML(){const x=sv.qa.x,g=x.a==='gold',m=x.t==='sell'||x.t==='buy',ed=x.i!=null,C=xrCalc(x,sv.rate),fl=x.fl||'';
  /* v61: پنجره از «تشخیص» باز شده → فقط همان نوع جنس، بدون انتخاب دوباره فروش/خرید/دریافت/تحویل */
  const KL=fl==='coin'?COINS():fl==='fx'?FXS():fl==='gold'||fl==='one'?[]:['gold',...Object.keys(XA).filter(k=>XA[k].k!=='o')];
  const ttl=fl?esc((x.fd==='swap'?'تعویض':x.fd==='ret'?'مرجوعی':dkT(x.fd||({sell:'sell',buy:'buy',in:'in',out:'out'})[x.t]))+(x.fd==='swap'||x.fd==='ret'?' · طلای مشتری':' › '+(g?(x.pul?(x.cat==='قلک'?'قلک':'پولی'):x.cat||'طلا'):(XA[x.a]||{}).t||''))):esc(xrLab(x));
  const kinds=KL.map(k=>`<button class="${x.a===k?'on':''}" data-act="xrA" data-a="${k}">${k==='gold'?'طلا':esc(XA[k].s)}</button>`).join('');
  return `<div class="d6qh"><b><span class="d6ti x-${x.t}">${ic(g?'coin':(XA[x.a]||{}).k==='f'?'usd':'coin')}</span>${ttl}</b><button class="lnk" data-act="qaX">${ed?'بستن':'انصراف'}</button></div>
  ${KL.length>1?`<div class="d6kd">${kinds}</div>`:''}
  ${fl?'':`<div class="seg2 d6seg">${Object.entries(XT).map(([k,t])=>`<button class="${x.t===k?'on':''}" data-act="xrT" data-t="${k}">${t}</button>`).join('')}</div>`}
  ${m&&(!fl||x.pul)?`<label class="d6sw"><input type="checkbox" id="xrP"${x.pul?' checked':''}><span class="tgx"></span><span><b>پولی</b><small>${x.pul?(x.t==='sell'?'جنس تحویل نمی‌شود؛ مشتری مبلغ را بدهکار و جنس را طلبکار می‌شود':'جنس تحویل گرفته نمی‌شود؛ مشتری مبلغ را طلبکار و جنس را بدهکار می‌شود'):'جنس همین الان جابه‌جا می‌شود'}</small></span></label>`:''}
  <div class="d6g">${g?cell('xrW','وزن (گرم)',numV(x.w,1),{ph:'0.000',cls:'w'})+cell('xrY','عیار',esc(x.ay||750),{im:'numeric'}):cell('xrQ','تعداد / مقدار ('+esc(XA[x.a].u)+')',numV(x.q,1),{ph:'۰',cls:'w'})}
    ${m?cell('xrG',g?'هر گرم'+(x.pgM?' (دستی)':''):'نرخ هر '+esc(XA[x.a].u),C.pg?Number(C.pg).toLocaleString('en-US'):'',{im:'numeric',ph:'تومان'})+`<div class="d6c ro"><small>مبلغ</small><b id="xrA">${C.amount?fmt(C.amount):'—'}</b></div>`:''}</div>
  ${g&&m&&x.pgM?`<button class="lnk d6rs" data-act="xrPgR">برگشت به نرخ مظنه</button>`:''}
  ${g&&(x.cat==='آبشده'||x.lab||x.ang)?`<div class="d6g"><label class="d6c"><small>کد آزمایشگاه</small><input id="xrL" class="ltr" value="${esc(x.lab||'')}" autocomplete="off"></label><label class="d6c"><small>شماره انگ</small><input id="xrN" class="ltr" inputmode="numeric" value="${esc(x.ang||'')}" autocomplete="off"></label></div>`:''}
  ${!g&&XA[x.a]&&XA[x.a].k==='c'?`<label class="xrph${x.img?' on':''}"><span class="xrpi" id="xrFi">${x.img?'':ic('cam')}</span><span><b>${x.img?'عکس سکه ✓':'عکس سکه'}</b><small>${x.img?'برای عوض کردن بزنید':'از دوربین یا گالری (اختیاری)'}</small></span><input type="file" accept="image/*" id="xrF" hidden></label>`:''}
  ${g&&!x.pul&&!fl?`<div class="d6cat"><small>${x.t==='buy'||x.t==='in'?'اضافه شود به موجودی':'کم شود از موجودی'}</small><div class="gks">${GK.map(k=>`<button class="tch${(x.cat||'متفرقه')===k?' on':''}" data-act="xrCat" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>`:''}
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="xrDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="xrSave">${ic('check')} ${ed?'ذخیره':'افزودن'}</button></div>`}
function xrRead(){const x=sv.qa.x,g=id=>{const e=$(id);return e?e.value:undefined};if(!x)return;if($('xrW'))x.w=decIn(g('xrW'));if($('xrQ'))x.q=decIn(g('xrQ'));if($('xrY'))x.ay=+toEn(g('xrY')).replace(/\D/g,'')||'';if($('xrP'))x.pul=$('xrP').checked;if($('xrL'))x.lab=clean(g('xrL'));if($('xrN'))x.ang=clean(g('xrN'));
  if($('xrG')){const v=num(g('xrG'));if(x.a==='gold'){const auto=Math.round((+sv.rate||0)*(+x.ay||750)/750);if(v&&v!==auto&&document.activeElement===$('xrG')){x.pgM=true;x.pg=v}else if(x.pgM)x.pg=v}else x.pg=v}}
function xrHint(){const B=$('qB'),x=sv.qa.x;if(!B||!x)return;const C=xrCalc(x,sv.rate),A=$('xrA');if(A)A.textContent=C.amount?fmt(C.amount):'—';const G=$('xrG');if(G&&document.activeElement!==G&&x.a==='gold'&&!x.pgM)G.value=C.pg?C.pg.toLocaleString('en-US'):'';
  const u=x.a==='gold'?'گرم':(XA[x.a]||{}).u,qv=x.a==='gold'?wFmt(Math.abs(C.e)):qFmt(Math.abs(C.e)),R=x.t==='sell'?-C.amount:x.t==='buy'?C.amount:0,P=[];
  if(R)P.push(`مشتری <b>${fmt(Math.abs(R))}</b> تومان ${R<0?'بدهکار':'طلبکار'}`);if(C.e)P.push(`<b>${qv}</b> ${u}${x.a==='gold'&&x.ay!=750?' (۱۸ عیار)':''} ${C.e<0?'بدهکار':'طلبکار'}`);
  B.innerHTML=!C.n?'<small>'+(x.a==='gold'?'وزن را بزنید':'تعداد را بزنید')+'</small>':P.length?'<span class="t">'+P.join(' · ')+'</span>':'<small>فقط موجودی مغازه عوض می‌شود</small>'}
function xrBind(){const x=sv.qa.x,keep=()=>{xrRead();svKeep();xrHint()},ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.xrSave()}};
  [['xrW','d'],['xrQ','d'],['xrY','i'],['xrG','n']].forEach(([id,k])=>{const el=$(id);if(!el)return;selOnFocus(el);el.onkeydown=ent;el.oninput=()=>{if(k==='d')el.value=decIn(el.value);else if(k==='i')el.value=toEn(el.value).replace(/\D/g,'').slice(0,3);else{const v=num(el.value);el.value=v?v.toLocaleString('en-US'):''}keep()}});
  const P=$('xrP');if(P)P.onchange=()=>{const was=!P.checked;if(x.a==='gold'&&+x.ay===xrAy(x.t,was)){x.ay=xrAy(x.t,P.checked);const Y=$('xrY');if(Y)Y.value=x.ay}xrRead();svKeep();qaRe()};xrHint();
  ['xrL','xrN'].forEach(id=>{const el=$(id);if(el){el.oninput=keep;el.onkeydown=ent}});xrImgPaint();
  setTimeout(()=>{if(!$('ov').classList.contains('hide'))return;const f=$('xrW')||$('xrQ');if(f&&!f.value&&document.activeElement!==f)f.focus({preventScroll:true})},40)}
ACT.xrT=d=>{xrRead();const x=sv.qa.x;if(x.t===d.t)return;const g=x.a==='gold',np=(d.t==='sell'||d.t==='buy')&&x.pul;if(g&&+x.ay===xrAy(x.t,x.pul))x.ay=xrAy(d.t,np);x.t=d.t;x.pul=np;if(g&&(d.t==='in'||d.t==='out')&&x.cat==='متفرقه')x.cat='آبشده';svKeep();qaRe()};
ACT.xrA=d=>{xrRead();const x=sv.qa.x;if(x.a===d.a)return;const n=xrNew(x.t,d.a,{pul:x.pul,i:x.i,fl:x.fl,fd:x.fd});if(d.a==='gold'&&(x.t==='sell'||x.t==='buy')&&!sv.rate){toast('اول مظنه یا نرخ گرم را بالای سند بزنید',true)}sv.qa.x=n;svKeep();qaRe()};
ACT.xrCat=d=>{xrRead();sv.qa.x.cat=d.k;svKeep();qaRe()};
ACT.xrPgR=()=>{xrRead();const x=sv.qa.x;x.pgM=false;x.pg=0;svKeep();qaRe()};
ACT.xrSave=()=>{xrRead();const x=sv.qa.x;if(!x)return;const C=xrCalc(x,sv.rate),g=x.a==='gold',m=x.t==='sell'||x.t==='buy';
  if(!C.n){toast(g?'وزن را بزنید':'تعداد را بزنید',true);const f=$('xrW')||$('xrQ');if(f)f.focus();return}if(g&&!(+x.ay)){toast('عیار را بزنید',true);fcs('xrY');return}
  if(m&&!C.pg){toast(g?'مظنه یا نرخ گرم را بالای سند بزنید':'نرخ هر واحد را بزنید',true);const f=g&&!x.pgM?$('svM'):$('xrG');if(f)f.focus();return}
  if(!g&&m)ls.set('m_px_'+x.a,x.pg);const o={t:x.t,a:x.a,pul:!!x.pul,w:g?C.n:0,q:g?0:C.n,ay:g?+x.ay:0,pg:x.pgM||!g?+x.pg:0,pgM:!!(g&&x.pgM),cat:g?x.cat||'متفرقه':''};if(x.lab)o.lab=x.lab;if(x.ang)o.ang=x.ang;if(x.sh)o.sh=x.sh;if(x.pv)o.pv=x.pv;if(x.pz){o.pz=1;o.cnt=+x.cnt||0}if(x.img)o.img=x.img;if(Array.isArray(x.imgs)&&x.imgs.length){o.imgs=x.imgs.slice();o.img=x.imgs[0]}if(g&&m&&+x.am)o.am=Math.round(+x.am);if(m&&!(g&&+x.am)&&+x.amT)o.amT=Math.round(+x.amT);if(g&&m&&+x.mz)o.mz=+x.mz;
  if(x.i!=null)sv.xr[x.i]=o;else sv.xr.push(o);qaDone()};
ACT.xrDel=()=>{const x=sv.qa.x;if(!x||x.i==null)return;const o=sv.xr.splice(x.i,1)[0];qaDone();toast('ردیف حذف شد','', 'بازگردانی',()=>{if(o){sv.xr.push(o);svKeep();svRe()}})};
ACT.svXrEdit=d=>{const o=sv.xr[+d.i];if(!o)return;qaRead();xrStart({...o,w:o.w?String(o.w):'',q:o.q?String(o.q):'',i:+d.i});const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
/* ----- ردیف پول: دریافت یا پرداخت · نقد، کارتخوان، حواله (حساب‌های ما) یا حساب مشتری دیگر ----- */
function pyLeft(p){const T=svTot(),r=T.total-svPaid(p.i),c=svCu();if(!r&&c&&!sv.items.length&&!(sv.xr||[]).length){const b=svCuBal(c).R-svPaid(p.i);return p.dir==='out'?Math.max(0,b):Math.max(0,-b)}return p.dir==='out'?Math.max(0,-r):Math.max(0,r)}
function pyNew(m,o){const p={m,dir:'in',amount:0,q:'',tn:'',...(o||{})};if(m==='pos')p.dir='in';pyAcc(p);
  if(m==='disc')p.amount=+sv.disc||0;else if(m==='off')p.amount=offLeft(p);else if(m==='prev')p.amount='';else{p.amount=pyLeft(p);if(m==='cust')pyCuCap(p)}return p}
/* v61.29: تخفیف = یک ردیف دریافت/پرداخت (m:'off') که فقط مانده مبلغ را صفر می‌کند (هیچ حساب بانک، کارتخوان یا نقدی را جابه‌جا نمی‌کند).
   طلبکاریم (مشتری بدهکار) → «دریافت تخفیف»؛ بدهکاریم → «پرداخت تخفیف». مانده همان خانه «مبلغ» پایین سند است (حساب مشتری یا این سند). */
const svRBal=skip=>{const L=svBalL(),r=L.find(z=>z[0]==='r');if(!r)return 0;const v=svCu()?r[3]:r[2];return v-(skip!=null&&sv.pays[skip]?pAmt(sv.pays[skip]):0)};
/* v61.36: پیش‌فرض تخفیف = ۶ رقم آخر مانده (اگر مانده کمتر از یک میلیون است، کل آن)؛ پنجره تخفیف کادر مبلغ قابل ویرایش دارد */
const off6=b=>{b=Math.abs(Math.round(b||0));return b%1000000||Math.min(b,1000000)};
const offLeft=p=>{const b=svRBal(p.i),v=p.dir==='out'?Math.max(0,b):Math.max(0,-b);return v?off6(v):0};
/* a = مبلغ تخفیف (مثبت)؛ جهتش از علامت مانده: طلبکاریم → دریافت، بدهکاریم → پرداخت */
function svOffApply(a){const v=offBal();if(!v){toast('مانده مبلغ صفر است');return}a=Math.round(+a||0);if(!(a>0)){toast('مبلغ تخفیف را بزنید',true);return}if(a>Math.abs(v)){toast('تخفیف بیشتر از مانده است',true);return}
  const sg=v<0?1:-1,i=sv.pays.findIndex(p=>p.m==='off'),old=i>=0?{...sv.pays[i]}:null,na=(old?pAmt(old):0)+sg*a;
  if(i>=0){if(na)sv.pays[i].amount=na;else sv.pays.splice(i,1)}else sv.pays.push({m:'off',amount:na});svKeep();closeSheet();svRe();const r=Math.abs(v)-a;
  toast((v<0?'دریافت تخفیف ':'پرداخت تخفیف ')+fmt(a)+(r?' · مانده '+fmt(r):' · مانده صفر شد'),'','بازگردانی',()=>{const j=sv.pays.findIndex(p=>p.m==='off');if(old){if(j>=0)sv.pays[j]=old;else sv.pays.push(old)}else if(j>=0)sv.pays.splice(j,1);svKeep();svRe()})}
let OFF=null;
/* مانده هدف تخفیف: از پنجره تسویه = مانده همین سند؛ از خانه مبلغ پایین سند = مانده حساب (منفی = طلبکاریم) */
const offBal=()=>OFF&&OFF.doc?-ckRest():svRBal();
function offHTML(){const v=offBal(),A=Math.abs(v),d6=off6(A),a=+OFF.a||0,r=A-a,dir=v<0?'دریافت تخفیف':'پرداخت تخفیف',cl=v<0?'d':'c';
  return `<div class="sh-h"><div><b>${dir}</b><small class="shsub">${OFF.doc?'مانده این سند':'مانده حساب'} ${fmt(A)} تومان · ${ourLab(v)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="offq"><button type="button" class="offc${a===d6?' on':''}" data-act="offPick" data-v="${d6}"><small>۶ رقم آخر</small><b>${fmt(d6)}</b></button>${A!==d6?`<button type="button" class="offc${a===A?' on':''}" data-act="offPick" data-v="${A}"><small>کل مانده</small><b>${fmt(A)}</b></button>`:''}</div>
  <label class="offf ${cl}"><small>مبلغ تخفیف (تومان)</small><input id="offA" class="ltr" inputmode="numeric" autocomplete="off" enterkeyhint="done" value="${a?a.toLocaleString('en-US'):''}"></label>
  <div class="offr" id="offR">${offRes(A,a)}</div>
  <button class="xgo ${cl==='d'?'offgo d':'offgo c'}" data-act="offOk">${ic('tag')} ثبت ${dir}</button>`}
const offRes=(A,a)=>a>A?'<span class="er">بیشتر از مانده است</span>':`مانده بعد از تخفیف: <b>${fmt(A-a)}</b> تومان${A-a?'':' ✓'}`;
function svOffOpen(doc){OFF={doc:!!doc};const v=offBal();if(!v){toast(doc?'مانده این سند صفر است':'مانده مبلغ صفر است');OFF=null;return}OFF.a=off6(v);sheet(offHTML());offBind()}
ACT.svOff=()=>svOffOpen(false);
function offBind(){const I=$('offA');if(!I)return;selOnFocus(I);I.oninput=()=>{const n=num(I.value);I.value=n?n.toLocaleString('en-US'):'';OFF.a=n;const R=$('offR');if(R)R.innerHTML=offRes(Math.abs(offBal()),n);document.querySelectorAll('.offc').forEach(b=>b.classList.toggle('on',+b.dataset.v===n))};I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.offOk()}}}
ACT.offPick=d=>{OFF.a=+d.v;const I=$('offA');if(I){I.value=OFF.a.toLocaleString('en-US');I.oninput()}};
ACT.offOk=()=>{const I=$('offA');if(I)OFF.a=num(I.value);svOffApply(OFF.a)};
/* حساب پیش‌فرض: آخرین کارتخوان یا حساب استفاده‌شده */
function pyAcc(p){if(p.m==='pos'&&!p.chId){const L=CH('pos'),last=ls.get('m_ch_pos','');p.chId=(L.find(c=>String(c.id)===String(last))||L[0]||{}).id||''}
  if(p.m==='hav'&&p.srcId==null&&!p.chId){const last=ls.get('m_src_hav',''),O=ownL();const s=O.find(z=>String(z.id)===String(last))||O[0];if(s)p.srcId=s.id;else{const B=CH('bank');if(B[0])p.chId=B[0].id}}}
function pyCuCap(p){const c=CU().find(z=>String(z.id)===String(p.cuId));if(!c)return;p.cuName=cuName(c);if(p.dir==='in'){const cr=Math.max(0,cuBal(c).R);if(cr)p.amount=Math.min(pyLeft(p),cr)}}
/* v66.0: حساب (یا کارتخوان) خودکار انتخاب‌شده → از همان اول پله «مبلغ»؛ حساب در نوار پله‌ها با یک لمس عوض می‌شود */
const pyStart=p=>{qaRead();sv.qa.p=p;sv.qa.x=null;sv.qa.q='';sv.qa.sq='';const pre=(p.m==='hav'&&p.srcId!=null&&p.srcId!=='')||(p.m==='pos'&&!!p.chId);sv.qa.st=pre?1:0;sv.qa.stMax=sv.qa.st;svKeep();qaRe()};
ACT.qaCh=d=>{const c=CH().find(z=>String(z.id)===String(d.id));if(!c)return;pyStart(pyNew(c.kind==='pos'?'pos':'hav',{chId:c.id}))};
ACT.qaSrc=d=>pyStart(pyNew('hav',{srcId:+d.id||d.id}));
ACT.qaCu=d=>{if(!svCu()){toast('اول مشتری سند را انتخاب کنید',true);return}pyStart(pyNew('cust',{cuId:d.id}))};
ACT.qaX=()=>{sv.qa.p=null;sv.qa.x=null;sv.qa.i=null;sv.qa.k='';svKeep();qaRe('qK')};
function pyHTML(){const p=sv.qa.p,ed=p.i!=null;let b='';
  if(p.m==='disc')return `<div class="d6qh"><b><span class="d6ti pm-disc">${ic('tag')}</span>تخفیف</b><button class="lnk" data-act="qaX">${ed||sv.disc?'بستن':'انصراف'}</button></div>
  <div class="d6g g1">${cell('pyA','مبلغ تخفیف (تومان)',numV(p.amount),{im:'numeric',cls:'w'})}</div><div class="d6br" id="qB"></div><div class="d6qf"><button class="qago" data-act="pySave">${ic('check')} ثبت تخفیف</button></div>`;
  if(p.m==='gold')return `<div class="d6qh"><b>طلای مشتری</b><button class="lnk" data-act="qaX">بستن</button></div><div class="d6br"><small>این ردیف قدیمی است؛ آن را حذف کنید و با «خرید طلا» دوباره بزنید.</small></div><div class="d6qf"><button class="qago red" data-act="pyDel" aria-label="حذف">${ic('trash')}</button></div>`;
  const out=p.dir==='out';
  if(!p.fl)b+=`<div class="seg2 d6seg"><button class="${!out?'on':''}" data-act="pyD" data-d="in">دریافت از مشتری</button><button class="${out?'on':''}" data-act="pyD" data-d="out"${p.m==='pos'?' disabled':''}>پرداخت به مشتری</button></div>
  <div class="d6pm">${['cash','pos','hav','cust'].map(m=>`<button class="${p.m===m?'on':''}" data-act="pyM" data-m="${m}"${m==='pos'&&out?' disabled':''}>${ic(PM[m].i)}<span>${PM[m].t}</span></button>`).join('')}</div>`;
  if(p.m==='pos'){const L=CH('pos');b+=`<div class="d6l"><small>کدام کارتخوان</small><div class="chps">${L.map(c=>`<button class="chp${String(p.chId)===String(c.id)?' on':''}" data-act="pyCh" data-id="${c.id}">${ic('card')}<span><b>${esc(c.name)}</b><small>مانده ${fmt(chBal(c))}</small></span></button>`).join('')}</div>
    <div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="نام کارتخوان تازه" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="pyChAdd">افزودن</button></div></div>`}
  if(p.m==='hav'){const B=CH('bank');b+=`<div class="d6l"><small>${out?'از کدام حساب ما':'به کدام حساب ما'}</small><div class="chps">${ownL(p.srcId).map(s=>{const bk=acBank(s);return `<button class="chp${p.srcId!=null&&String(p.srcId)===String(s.id)?' on':''}" data-act="pySrc" data-id="${s.id}">${bk?bankBadge(bk):ic('bank')}<span><b>${esc(s.name)}</b><small>${esc(bkSub(s))}</small></span></button>`}).join('')}${B.map(c=>`<button class="chp${p.srcId==null&&String(p.chId)===String(c.id)?' on':''}" data-act="pyCh" data-id="${c.id}">${ic('bank')}<span><b>${esc(c.name)}</b><small>مانده ${fmt(chBal(c))}</small></span></button>`).join('')}</div>
    ${can('src')?`<div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="نام حساب تازه ما" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="pyChAdd">افزودن</button></div>`:''}</div>`}
  if(p.m==='cust'){const C=CU().find(c=>String(c.id)===String(p.cuId));b+=`<div class="d6l"><small>${out?'به حساب کدام مشتری':'از طلب کدام مشتری'}</small>${C?`<div class="d6cu sm">${cuAvH(C)}<span class="tx"><b>${esc(cuName(C))}</b><small>${cuLab(cuBal(C).R)} ${cuBal(C).R?fmt(Math.abs(cuBal(C).R))+' تومان':''}</small></span><button class="lnk" data-act="pyCu" data-id="">تغییر</button></div>`
      :`<div class="cbx"><div class="fsearch sm">${ic('search')}<input id="pyQ" value="${esc(p.q||'')}" placeholder="نام مشتری…" autocomplete="off"></div><div id="pyCr">${pyCrHTML()}</div></div>`}</div>`}
  b+=`<div class="d6g ${p.m==='pos'||p.m==='hav'?'':'g1'}">${cell('pyA','مبلغ (تومان)',numV(p.amount),{im:'numeric',cls:'w'})}${p.m==='pos'||p.m==='hav'?cell('pyT','پیگیری (اختیاری)',esc(p.tn||''),{im:'numeric'}):''}</div>`;
  return `<div class="d6qh"><b><span class="d6ti ${out?'pm-out':'pm-in'}">${ic(out?'share':'down')}</span>${p.fl?(out?'پرداخت':'دریافت')+' › '+esc(dkST(out?'out':'in',p.m)||PM[p.m].t):out?'پرداخت وجه':'دریافت وجه'}</b><button class="lnk" data-act="qaX">${ed?'بستن':'انصراف'}</button></div>${b}
  <div class="d6br" id="qB"></div>
  <div class="d6qf">${ed?`<button class="qago red" data-act="pyDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="pySave">${ic('check')} ${ed?'ذخیره':'افزودن'}</button></div>`}
function pyCrHTML(){const p=sv.qa.p,q=nzName(toEn(clean(p.q||'')));let L=CU().filter(c=>String(c.id)!==String(sv.cuId)).map(c=>[c,cuBal(c)]);if(q)L=L.filter(([c])=>nzName([c.name,c.phone,c.grp].join(' ')).includes(q));else L=L.filter(([,b])=>p.dir==='out'?true:b.R>0).sort((a,b)=>String(b[0].lastAt||'').localeCompare(String(a[0].lastAt||'')));
  L=L.slice(0,q?6:3);if(!L.length)return q?'<div class="eh">مشتری‌ای پیدا نشد</div>':'';
  return `<div class="bzsug cbl" role="listbox">${L.map(([c,b])=>cbRow('pyCu',{id:c.id},esc(userInit(c.name)),esc(cuName(c)),c.phone?'<span class="ltr">'+esc(toFa(c.phone))+'</span>':'مشتری',`<span class="c6v">${bpill('r',b.R)||'<span class="bp z"><small>تسویه</small></span>'}</span>`)).join('')}</div>`}
function pyRead(){const p=sv.qa.p,g=id=>{const e=$(id);return e?e.value:undefined};if(!p)return;if($('pyA'))p.amount=num(g('pyA'));if($('pyT'))p.tn=toEn(g('pyT')||'').trim();if($('pyQ'))p.q=g('pyQ')}
function pyHint(){const B=$('qB'),p=sv.qa.p;if(!B||!p)return;if(p.m==='disc'){B.innerHTML='<small>از جمع سند کم می‌شود</small>';return}if(p.m==='gold')return;const r=svTot().total-svPaid(p.i),l=pyLeft(p);
  const c=svCu(),cb=c?svCuBal(c).R-svPaid(p.i):0,docOnly=!r&&c&&!sv.items.length&&!(sv.xr||[]).length;
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
  if(p.m==='cust'&&!p.cuId){toast('حساب مشتری را انتخاب کنید',true);return}if(p.m==='nm'&&!clean(p.cuName||'')){toast('نام طرف حواله را بنویسید',true);return}
  if(!(amt>0)){toast('مبلغ را وارد کنید',true);const a=$('pyA');if(a)a.focus();return}
  const sg=p.dir==='out'&&p.m!=='pos'?-1:1,o={m:p.m,amount:sg*amt};
  if(p.m==='pos'){o.chId=p.chId;o.tn=p.tn||'';ls.set('m_ch_pos',p.chId)}
  if(p.m==='hav'){if(p.srcId!=null){o.srcId=p.srcId;ls.set('m_src_hav',p.srcId)}else o.chId=p.chId;o.tn=p.tn||''}
  const pk=xrPh(p);if(pk.length&&!PHNO.includes(p.m)){o.imgs=pk;o.img=pk[0]}
  if(p.m==='cust')Object.assign(o,{cuId:p.cuId,cuName:p.cuName||''});if(p.m==='nm')o.cuName=clean(p.cuName||'');
  /* v61.75: ویرایش ردیف «حواله به فروشنده واریزی» پیوند واریزی را نگه می‌دارد (قبلاً entId پاک می‌شد → سند ثبت نمی‌شد و موقت می‌ماند) */if(p.m==='dep'){if(!p.entId){toast('واریزی این حواله پیدا نشد؛ ردیف را حذف و دوباره اضافه کنید',true);return}Object.assign(o,{entId:p.entId,entName:p.entName||depName(p),...(p.stlId?{stlId:p.stlId}:{})})}
  if(p.i!=null)sv.pays[p.i]=o;else sv.pays.push(o);qaDone()};
ACT.pyDel=()=>{const p=sv.qa.p;if(!p||p.i==null)return;const o=sv.pays.splice(p.i,1)[0];qaDone();toast('ردیف حذف شد','', 'بازگردانی',()=>{if(o){sv.pays.push(o);svKeep();svRe()}})};
ACT.svPayEdit=d=>{const o=sv.pays[+d.i];if(!o)return;qaRead();const p={...o,i:+d.i,dir:pAmt(o)<0?'out':'in',amount:Math.abs(pAmt(o)),q:''};pyStart(p);const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
ACT.svDisc=()=>{qaRead();pyStart(pyNew('disc'));const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
ACT.svRowDel=d=>{if(d.k==='pv'){pvDel(d.i);return}if(d.k==='py'&&sv.pays[+d.i]&&sv.pays[+d.i].m==='wd'){ACT.svWdRow();svRe();return}const L=d.k==='it'?sv.items:d.k==='xr'?sv.xr:d.k==='py'?sv.pays:null;let o;if(d.k==='dc'){o=sv.disc;sv.disc=0}else if(L)o=L.splice(+d.i,1)[0];if(sv.qa.i!=null||(sv.qa.p&&sv.qa.p.i!=null)||(sv.qa.x&&sv.qa.x.i!=null))sv.qa=qaBlank();svKeep();qaRe();svRe();
  toast('ردیف حذف شد','', 'بازگردانی',()=>{if(d.k==='dc')sv.disc=o;else if(L&&o)L.splice(+d.i,0,o);svKeep();svRe()})};
/* ----- ردیف‌های سند: مثل جدول کیمیا، هر ردیف با اثرش بر حساب مشتری (بدهکار / طلبکار) ----- */
/* v61.6: برچسب تشخیص روی هر ردیف سند */
const dkOfX=x=>x.cat==='تعویض'?'swap':x.cat==='مرجوعی'?'ret':x.t;
const dkTag=id=>{const D=DK.find(z=>z[0]===id);return D?`<em class="d6k k-${id}">${D[1]}</em>`:''};
/* v61.47: ردیف سند فشرده و منظم (خواسته صاحب اپ): آیکون نوع کار، نام با برچسب، مشخصات به شکل تکه‌های کوچک مرتب (نه یک جمله بلند)،
   مبلغ پررنگ با رنگ اثرش — قرمز طلبکاریم، آبی بدهکاریم — و یک نوار باریک هم‌رنگ کنار ردیف */
/* v61.56 (خواسته صاحب اپ): مشخصات ردیف سند منظم — هر مشخصه یک خانه: برچسب کوچک بالا (وزن، عیار، هر گرم خرید، اجرت، سود…)
   و مقدار پررنگ زیرش، در ستون‌های هم‌عرض؛ «مبلغ دستی» یک نشان طلایی */
const d6Cell=x=>{if(/مبلغ دستی/.test(x))return `<span class="d8c own"><b>مبلغ دستی</b></span>`;let l='',v=x,m;
  if((m=x.match(/^([^:]+):\s*(.+)$/))){l=m[1]==='۷۵۰'?'وزن ۷۵۰':m[1];v=m[2]}
  else if((m=x.match(/^(.*?)\s*([0-9۰-۹].*)$/))){l=m[1];v=m[2];if(!l)l=/عدد$/.test(v)?'تعداد':/گرم/.test(v)?'وزن':'مقدار'}
  else if((m=x.match(/^(آزمایشگاه|انگ|پیگیری)\s+(.+)$/))){l=m[1];v=m[2]}
  else return `<span class="d8c nt"><b>${x}</b></span>`;
  return `<span class="d8c${String(v).replace(/<[^>]*>/g,'').length>10?' w2':''}">${l?`<small>${l}</small>`:''}<b>${v}</b></span>`};
const d6Spec=sub=>String(sub||'').split(' · ').map(x=>x.trim()).filter(Boolean).map(d6Cell).join('');
/* اثر ردیف در یک قاب: برچسب طلبکاریم/بدهکاریم، عدد (در قاب جا می‌شود) و واحد */
const d6Eff=(v,k)=>{if(!v)return '';k=k||'r';const n=balV(k,v);return `<span class="d6e ${v<0?'d':'c'}"><small>${ourLab(v)}</small><span class="fz"><b${fitS(n)}>${n}</b></span><i>${esc(k==='r'?'تومان':balU(k))}</i></span>`};
const d6Dir=v=>{const m=String(v||'').match(/d6e (d|c)\b/);return m?'r'+m[1]:'rz'};/* v61.59: رنگ کنار ردیف از اثر اول (مبلغ) */
const DKI={sell:'dSell',buy:'dBuy',swap:'dSwap',in:'dIn',out:'dOut',ret:'dRet'};
const d6Ico=(k,ico)=>DKI[k]||ico;
/* v61.61 (خواسته صاحب اپ): ردیف سند جمع‌وجور — بالا آیکون، نوع و نام و مبلغ‌ها؛ یک بار زدن = جزئیات زیرش با حرکت باز/بسته می‌شود،
   دو بار زدن = ویرایش (در جزئیات هم دکمه «ویرایش» هست). ردیف بی‌جزئیات با یک زدن ویرایش می‌شود. حالت باز با کلید ردیف (o.key) در D6OP می‌ماند */
function d6Row(o){const P=o.phs||(o.ph?[o.ph]:[]),tile=P.length?`<span class="d6ti ph" data-act="rowPhS" data-ks="${esc(P.join(','))}" data-n="${esc(String(o.b).replace(/<[^>]*>/g,''))}" role="button" aria-label="دیدن عکس"><img data-ik="${esc(P[0])}" alt="">${P.length>1?`<em>${toFa(P.length)}</em>`:''}</span>`:`<span class="d6ti">${ic(o.ico)}</span>`,dir=d6Dir(o.v);
  const nm=o.tag?String(o.b).replace(/^(فروش|خرید|دریافت|پرداخت)\s+/,''):o.b,hasX=!!o.sub,key=o.key||'',op=hasX&&key&&D6OP.has(key);
  const head=`<span class="d8h">${tile}<span class="d6t">${o.tag||''}<b>${nm}</b></span>${o.v?`<span class="d6v">${o.v}</span>`:''}${hasX?`<i class="d8ch" aria-hidden="true">${ic('back')}</i>`:''}</span>`;
  const det=hasX?`<span class="d8x"><span class="d8xi"><span class="d8s">${d6Spec(o.sub)}</span>${o.ex||''}${o.act?`<span class="d8eb" role="button" data-act="${o.act}" data-i="${o.i}">${ic('edit')}<span>ویرایش</span><small>یا دو بار بزنید</small></span>`:''}</span></span>`:'';
  const tap=hasX?` data-act="d6Tap" data-a="${o.act||''}" data-i="${o.i}" data-key="${esc(key)}" aria-expanded="${op?'true':'false'}"`:o.act?` data-act="${o.act}" data-i="${o.i}"`:'';
  return `<div class="d6r d8 ${dir}${hasX?' d8z':''}${op?' op':''}${o.nw?' new':''}"${o.n!=null?` style="--i:${o.n}"`:''}>${tap?`<button class="d6rb"${tap}>${head}${det}</button>`:`<div class="d6rb">${head}</div>`}</div>`}
/* v61.65 (خواسته صاحب اپ): هر مقدار در جزئیات با واحدش (گرم، تومان، عدد، دلار…)؛ عیار آبشده شرطی «۷۵۰ شرطی» و بعد از ثبت عیار
   «۷۴۸ (شرطی ۷۵۰)» با اثر تبدیل عیار بر همین ردیف (shAy) */
const shAyL=o=>o.sh===1?'عیار: '+toFa(750)+' شرطی':o.sh===2?'عیار: '+toFa(o.ay||750)+'، از ۷۵۰ شرطی':'';
const shEff=o=>{if(o.sh!==2||!o.shd)return '';const d=o.shd,w=v=>v<0?' کمتر':' بیشتر';return [d.r?'اثر عیار بر مبلغ: '+fmt(Math.abs(d.r))+' تومان'+w(d.r):'',d.g?'اثر عیار بر طلا: '+wFmt(Math.abs(d.g))+' گرم'+w(d.g):''].filter(Boolean).join(' · ')};
const itSub=it=>it.ab?[wFmt(it.w)+' گرم',shAyL(it)||'عیار: '+toFa(it.ay||750),'۷۵۰: '+wFmt(Math.round(it.w*(it.ay||750)/750*1000)/1000)+' گرم','سود '+toFa(+it.pp||0)+'٪',shEff(it),it.lab?'آزمایشگاه '+esc(it.lab):'',it.ang?'انگ '+esc(it.ang):''].filter(Boolean).join(' · ')
  :[it.pz&&+it.cnt?qFmt(it.cnt)+' عدد':'',wFmt(it.w)+' گرم',(+it.ay||750)!==750?'عیار: '+toFa(it.ay):'',(()=>{const J=ajPT(it);return J.P||J.T?'اجرت: '+ajLab(it):''})(),'سود '+toFa(+it.pp||0)+'٪'].filter(Boolean).join(' · ');
function svRowsHTML(){const R=[],eff=d6Eff;
  /* v61.6: بدون ضربدر؛ کشیدن به چپ = حذف، به راست = ویرایش */
  const row=(k,i,act,ico,tag,b,sub,v,phs,ex)=>swW(d6Row({act,i,ico,phs,tag,b,sub,v,ex,key:'s'+k+i,nw:k==='it'&&i===svAdd}),{r:[[act,'ویرایش','edit','#3b6fd6']],l:[['svRowDel','حذف','trash','#d23c48']],data:{k,i}});
  const PG=pvGroups(sv.pays,sv.xr||[]);
  sv.items.forEach((it,i)=>{const c=itCalc(it,sv.rate,sv.tax);R.push(row('it',i,'svItEdit',d6Ico('sell'),dkTag('sell'),esc(it.k)+(it.sh===1?' شرطی':'')+(it.n?' <i>'+esc(it.n)+'</i>':''),itDet(it,sv.rate,sv.tax),sv.rate?eff(-c.tot):'<small class="d6nr">نرخ را بزنید</small>',xrPh(it)))});
  (sv.xr||[]).forEach((x,i)=>{if(PG.sx.has(i))return;const C=xrCalc(x,sv.rate),R0=x.t==='sell'?-C.amount:x.t==='buy'?C.amount:0,k=dkOfX(x);R.push(row('xr',i,'svXrEdit',d6Ico(k,'coin'),dkTag(k),esc(xrLab(x)),xrDet(x,C,sv.rate),eff(R0)+eff(C.e,x.a==='gold'?'g':x.a),xrPh(x)))});
  if(+sv.disc)R.push(row('dc',0,'svDisc','tag','','تخفیف','از جمع سند کم می‌شود',eff(+sv.disc)));
  sv.pays.forEach((p,i)=>{if(PG.sp.has(i))return;const out=pAmt(p)<0,M=PM[p.m]||PM.cash;R.push(row('py',i,p.m==='wd'?'svWdRow':'svPayEdit',M.i,dkTag(out?'out':'in'),esc(pyLab(p)),pyDet(p,sv.edit&&sv.edit.tx),eff(pAmt(p)),xrPh(p),p.m==='dep'?depActs(p,'s'+i):pyActs(p,svCu(),sv.edit&&sv.edit.tx,sv.edit?sv.edit.no:'')))});
  wdRowsHTML(svCu(),sv.edit?sv.edit.no:null).forEach(h=>R.push(h));
  PG.L.forEach(G=>R.push(row('pv',G.id,'svPvEdit','clock',dkTag(G.dir),'مانده قبلی',pvSub(G,sv.pays,sv.xr||[]),pvEffs(G,sv.pays,sv.xr||[],x=>xrCalc(x,sv.rate).e),pvPh(G,sv.pays,sv.xr||[]))));
  if(!R.length)return '';
  const nI=sv.items.length;
  return `<div class="d6sh"><b>ردیف‌های سند</b><small>${nI?toFa(nI)+' قلم کالا، ':''}${toFa(R.length)} ردیف · بزنید = جزئیات، دو بار = ویرایش</small></div><div class="d6rows d7">${R.join('')}</div>`}
/* v61.11: کارت «جمع سند» برداشته شد؛ جزئیات (پنجره کوچک)، شمارنده و تپش همه در خانه «این سند» نوار مانده پایین است */
/* نوار مانده‌ها پایین صفحه (ثابت هنگام پیمایش): قبلی · این سند · نهایی برای ریالی، طلایی، سکه و ارز */
/* v61.13: نوار پایین جمع‌وجور: یک خط مانده نهایی هر جنس (بدون بریده شدن عدد) + دکمه ثبت با جمع سند.
   جزئیات (بهای طلا، اجرت، سود، مالیات، تخفیف، پرداخت‌ها و جدول قبلی · این سند · نهایی) در پنجره‌ای که با زدن نوار بالا می‌آید */
/* v61.43: مانده حساب بدون همین سند — وقتی سند ثبت خودکار شده (پس‌زمینه) یا برای ویرایش باز است، نسخه ثبت‌شده‌اش قبلاً
   در حساب هست؛ اگر کنار گذاشته نشود مانده سند دو بار شمرده می‌شود (مانده قبلی غلط) */
function svCuBal(c){if(!c)return {R:0,G:0,X:{}};if(!sv||!sv.edit)return cuBal(c);const sk=new Set([String(sv.edit.tx)]),t0=(c.txs||[]).find(x=>String(x.id)===String(sv.edit.tx));
  if(t0)try{txLinked(c,t0).forEach(z=>{if(z.c===c)sk.add(String(z.t.id))})}catch(_){}return cuBal(c,sk)}
function svBalL(){const c=svCu(),T=svTot(),b=c?svCuBal(c):{R:0,G:0,X:{}},gc=sv.gconv&&T.rest>0&&sv.rate;
  const dr=-T.rest+(gc?T.rest:0),dg=Math.round((T.ge-(gc?T.rest/sv.rate:0))*1000)/1000;
  const keys=[...new Set([...Object.keys(b.X||{}),...Object.keys(T.xe||{})])];
  const rd=(k,v)=>k==='r'?Math.round(v):k==='g'?Math.round(v*1000)/1000:Math.round(v*100)/100;
  return [['r',b.R,dr],['g',b.G,dg],...keys.map(k=>[k,(b.X||{})[k]||0,(T.xe||{})[k]||0])].filter(([k,p,d],i)=>i===0||d||(c&&p&&k==='g')).map(([k,p,d])=>[k,rd(k,p),rd(k,d),rd(k,p+d)])}
const balNm=k=>k==='r'?'تومان':k==='g'?'طلا':esc((XA[k]||{s:k}).s);
/* v61.20: واحد همه‌جا کنار عدد: تومان، گرم، عدد سکه */
const balVU=(k,v)=>balV(k,v)+' <i>'+balU(k)+'</i>';
/* v61.46: پایین سند = یک کارت که خودش دکمه تسویه است (خواسته صاحب اپ): مانده قبلی، این سند (جمع یا مانده سند)، و مانده نهایی پررنگ؛
   رنگ کل کارت از مانده نهایی (قرمز طلبکاریم / آبی بدهکاریم / سبز تسویه)؛ زدن = تسویه، نگه داشتن = جزئیات فاکتور.
   طلا و سکه/ارز (اگر هست) یک خط کوچک زیرش: قبلی · سند · نهایی */
const ftCls=v=>v<0?'d':v>0?'c':'z';
const ftNum=(k,v)=>`<b class="ftn">${v?balV(k,v):'۰'}</b>`;
/* v61.47 (خواسته صاحب اپ): مانده‌ها سه خانه کنار هم — قبلی · سند · نهایی — هر کدام هم مبلغ (تومان) و هم طلا (گرم)، سکه/ارز اگر باشد؛
   هر عدد با رنگ خودش (قرمز طلبکاریم، آبی بدهکاریم)، «نهایی» پررنگ‌تر با زمینه رنگی. زدن هر خانه = پنجره تسویه برای مبلغ همان مانده
   (با ریز قبلی/سند/نهایی بالای آن)؛ نگه داشتن = جزئیات فاکتور */
const ftLn=(k,v,big)=>`<span class="f3l ${ftCls(v)}${k==='r'?' r':''}"><b${k==='r'?' class="ftn"':''}${fitS((v?balV(k,v):'۰')+(k==='r'?'':' '+balU(k)))}>${v?balV(k,v):'۰'}</b><i>${balU(k)}</i>${big&&v?`<em>${ourLab(v)}</em>`:''}</span>`;
function svFtIn(){if(!sv)return '';const c=svCu(),ready=!!(sv.rate||!svHasG()),has=svRows();if(!has)return '';
  if(!ready)return `<div class="iv8b iv9b"><button type="button" class="f3c f3w" data-act="svSave"><small>مانده سند</small><span class="ftw">اول مظنه را وارد کنید</span></button></div>`;
  /* v61.57: همان جدول مانده‌های سند ثبت‌شده (balGrid)؛ زدن هر قاب = تسویه همان مانده، نگه داشتن = جزئیات فاکتور */
  const L=svBalL(),get=k=>L.find(z=>z[0]===k)||[k,0,0,0],R=[get('r')];if(c||L.some(z=>z[0]==='g'&&(z[1]||z[2]||z[3])))R.push(get('g'));L.forEach(z=>{if(z[0]!=='r'&&z[0]!=='g'&&(z[1]||z[2]||z[3]))R.push(z)});
  const cols=!c?[{lab:sv.pays.length?'مانده سند':'جمع سند',ix:2,w:'d',m:1}]:!has?[{lab:'مانده حساب',ix:1,w:'f',m:1}]:[{lab:'قبلی',ix:1,w:'p'},{lab:sv.pays.length?'مانده سند':'این سند',ix:2,w:'d'},{lab:'نهایی',ix:3,w:'f',m:1}];
  return balGrid(R.map(z=>[z[0],...cols.map(cl=>z[cl.ix])]),cols,{act:'svBal',hint:'زدن = تسویه · نگه داشتن = جزئیات فاکتور'})}
const svFtC=()=>{if(!sv)return '';const c=svCu(),has=sv.items.length||sv.pays.length||(sv.xr||[]).length;if(!(sv.rate||!svHasG()))return '';const r=svBalL().find(z=>z[0]==='r'),v=r?(c?r[3]:r[2]):0;return v<0?'d':v>0?'c':(has?'ok':'')};
function tween(el,to){if(!el)return;const from=+el.dataset.v||0;el.dataset.v=to;if(from===to||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=fmt(to);return}const t0=performance.now(),D=420;cancelAnimationFrame(el._r);
  const st=n=>{const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)el._r=requestAnimationFrame(st)};el._r=requestAnimationFrame(st)}
function svRe(){numMorph('#svRows .d6e b,#svFt .iv8c .fz>b,#stPv .stam .fz>b',()=>svRe0())}
function svRe0(){const set=(id,h)=>{const e=$(id);if(e)e.innerHTML=h};set('svRows',svRowsHTML());
  document.querySelectorAll('.d6rt').forEach(l=>l.classList.toggle('need',!sv.rate));const g=$('svFt');if(g)g.innerHTML=svFtIn();svCuBSync();qaCalc();
  svBindRest();svAdd=-1}
/* v61.34: نگه داشتن دکمه «تسویه» = جزئیات کامل سند (خواسته صاحب اپ): بهای طلا، اجرت، سود، مالیات، فروش و خرید، تخفیف،
   دریافت‌ها و پرداخت‌ها، مانده این سند، و برای هر جنس قبلی / این سند / نهایی. زدن کوتاه همان تسویه است. */
/* v61.40: جزئیات فاکتور (نه مانده‌ها — مانده در نوار پایین سند است): ریز هر ردیف (بهای کالا، اجرت، سود، مالیات، مبلغ کل)،
   جمع‌های فاکتور، و دریافت/پرداخت‌های همین سند */
/* v61.41: جزئیات فاکتور — طراحی گروهی مثل iOS (راهنمای اپل: گروه‌ها با زمینه خاکستری، جداکننده مویی، عدد تنها جای پررنگ):
   هر ردیف یک کارت (آیکون، نام و مشخصات، مبلغ کل در سرتیتر؛ زیرش ریز بها، اجرت، سود، مالیات)، کارت جمع فاکتور با جمع پایانی رنگی
   (قرمز طلبکاریم / آبی بدهکاریم)، کارت دریافت و پرداخت. حرکت: کارت‌ها پله‌ای بالا می‌آیند و جمع‌ها از صفر شمرده می‌شوند. */
const rdLn=(l,v,cl)=>`<div class="rdl${cl?' '+cl:''}"><span>${l}</span><b>${v}</b></div>`;
const rdN=v=>`<span class="rdn" data-n="${Math.round(Math.abs(v))}">${fmt(Math.abs(v))}</span>`;
/* v61.46: جزئیات فاکتور فشرده و مرتب (خواسته صاحب اپ: «خیلی بزرگ و نامنظم»): یک صورت‌حساب با ستون عدد هم‌تراز —
   هر ردیف: نام و مشخصات در یک خط کوچک، مبلغ کل؛ زیرش ریز بها/اجرت/سود/مالیات کوچک و کم‌رنگ. جمع‌ها بدون تکرار ریز:
   جمع فروش، خرید از مشتری، تخفیف، جمع فاکتور؛ بعد دریافت/پرداخت و مانده سند. */
const dtL=(l,v,cl)=>`<div class="dtl${cl?' '+cl:''}"><span>${l}</span><b>${v}</b></div>`;
function svRowDet(){const R=[];
  sv.items.forEach(it=>{const c=itCalc(it,sv.rate,sv.tax),J=ajPT(it);
    const sub=[dtL('بها',fmt(c.gold)),it.ab?'':dtL('اجرت'+(J.P||J.T?' '+[J.P?toFa(J.P)+'٪':'',J.T?fmt(J.T)+' ت':''].filter(Boolean).join(' + '):''),fmt(c.aj)),dtL('سود '+toFa(String(+it.pp||0))+'٪',fmt(c.pr)),c.tax?dtL('مالیات ۱۰٪',fmt(c.tax)):''].join('');
    R.push(`<div class="dtr"><div class="dth"><span class="dtn"><b>${esc(it.k)}</b><small>${it.pz&&+it.cnt?qFmt(it.cnt)+' عدد · ':''}${wFmt(it.w)} گرم · ${toFa(it.ay||750)}${+it.mz?' · مظنه '+fmt(it.mz):''}${c.fx?' · دستی':''}</small></span><b class="dtv d">${rdN(c.tot)}</b></div><div class="dts">${sub}</div></div>`)});
  (sv.xr||[]).forEach(x=>{const C=xrCalc(x,sv.rate),g=x.a==='gold',m=x.t==='sell'||x.t==='buy',u=g?'گرم':(XA[x.a]||{}).u||'';if(!m&&!C.n)return;const buy=x.t==='buy'||x.t==='in';
    R.push(`<div class="dtr"><div class="dth"><span class="dtn"><b>${esc(xrLab(x))}</b><small>${x.pz&&+x.cnt?qFmt(x.cnt)+' عدد · ':''}${g?wFmt(C.n)+' گرم · '+toFa(x.ay||750):qFmt(C.n)+' '+esc(u)}${m?' · '+(g?'هر گرم ':'هر '+esc(u||'واحد')+' ')+fmt(C.pg):''}${C.fx?' · دستی':''}</small></span>${m?`<b class="dtv ${buy?'c':'d'}">${buy?'<bdi dir="ltr">− '+rdN(C.amount)+'</bdi>':rdN(C.amount)}</b>`:`<b class="dtv z">${x.t==='in'?'دریافت':'تحویل'}</b>`}</div></div>`)});
  return R.length?`<div class="dtg"><div class="dtt">ردیف‌ها <i>${toFa(R.length)}</i><span>تومان</span></div><div class="dtc">${R.join('')}</div></div>`:''}
function svDetHTML(o){o=o||{};const c=svCu(),T=svTot(),ng=v=>'<bdi dir="ltr">− '+fmt(v)+'</bdi>',dc=T.total>0?'d':T.total<0?'c':'z',R=T.rest,rc=R>0?'d':R<0?'c':'z';
  const sale=T.sub+T.xs,tot=[sale&&(T.xb||T.disc)?dtL('جمع فروش',fmt(sale)):'',T.tax?dtL('مالیات <i>داخل فروش</i>',fmt(T.tax),'mu'):'',T.xb?dtL('خرید از مشتری',ng(T.xb)):'',T.disc?dtL('تخفیف',ng(T.disc)):''].join('');
  const pays=sv.pays.map(p=>{const o=pAmt(p)<0;return dtL(esc(pyLab(p))+`<i>${o?'پرداخت':'دریافت'}</i>`,fmt(Math.abs(pAmt(p))))}).join('');
  return `<div class="sh-h"><div><b>جزئیات فاکتور${sv.edit?' '+toFa(sv.edit.no):''}</b><small class="shsub">${esc(c?cuName(c):'بدون مشتری')}${sv.rate?' · مظنه '+fmt(sv.mz||Math.round(sv.rate*MZK)):''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="svdet dt">${svRowDet()}
  <div class="dtg"><div class="dtc">${tot}<div class="dtl sum ${dc}"><span>${T.total<0?'خالص خرید':'جمع فاکتور'}<em>${T.total?ourLab(-T.total):'تسویه'}</em></span><b>${rdN(T.total)}</b></div>
  ${pays?pays+`<div class="dtl sum ${rc}"><span>مانده سند<em>${ourLab(-R)}</em></span><b>${rdN(R)}</b></div>`:''}</div></div></div>
  ${o.inv?(can('debt')?`<button class="xgo" data-act="invEdit">${ic('edit')} ویرایش سند</button>`:''):`<button class="xgo" data-act="svDetGo">${ic('check')} تسویه</button>`}`}
/* شمارش عددها از صفر (یک بار، با باز شدن پنجره) */
function rdCount(root){if(!root)return;root.querySelectorAll('.rdn[data-n]').forEach((el,i)=>{const to=+el.dataset.n;if(RM()||!to){el.textContent=fmt(to);return}el.textContent=fmt(0);const t0=performance.now()+120+i*60,D=520;
  const st=n=>{const k=Math.max(0,Math.min(1,(n-t0)/D)),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(to*e));if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st)})}
ACT.svDetGo=()=>{closeSheet();setTimeout(()=>ACT.svSave(),60)};
/* v61.43: انگشت بعد از باز شدن جزئیات هنوز روی صفحه است؛ آیفون آن را «نگه داشتن روی متن» می‌گیرد و متن انتخاب می‌شود.
   تا انگشت برداشته نشده هیچ انتخابی شروع نمی‌شود و هر انتخابی پاک می‌شود؛ متن پنجره جزئیات هم اصلاً انتخاب‌شدنی نیست */
let lpHold=0;document.addEventListener('selectstart',e=>{if(lpHold)e.preventDefault()},true);
['pointerup','pointercancel','touchend','touchcancel'].forEach(ev=>document.addEventListener(ev,()=>{if(lpHold){lpHold=0;try{getSelection().removeAllRanges()}catch(_){}}},true));
(()=>{let tm=0,x0=0,y0=0,btn=null;const cancel=()=>{clearTimeout(tm);tm=0};
  document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('#act .svgo,#act .iv8b');if(!b||!(cur==='sell'&&sv||cur==='inv'&&invGet()))return;b._lp=0;btn=b;x0=e.clientX;y0=e.clientY;cancel();
    tm=setTimeout(()=>{tm=0;b._lp=1;lpHold=1;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}sheet(cur==='inv'?invDetHTML():svDetHTML());const P=document.querySelector('.svdet');if(P){bpRise(P,'.dtg');rdCount(P);phPaint(P)}},460)},true);
  document.addEventListener('pointermove',e=>{if(tm&&(Math.abs(e.clientX-x0)>10||Math.abs(e.clientY-y0)>10))cancel()},true);
  ['pointerup','pointercancel','scroll'].forEach(ev=>document.addEventListener(ev,cancel,true));
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#act .svgo,#act .iv8b');if(b&&b._lp){b._lp=0;e.stopPropagation();e.preventDefault()}},true);
  document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#act .svgo,#act .iv8b'))e.preventDefault()},true)})();
/* v61.35: عکس سکه — چند عکس برای هر ردیف سکه (x.imgs، اولی هم در x.img برای داده‌های قبلی)؛ دوربین همان لحظه یا گالری،
   در اندروید و آیفون. عکس‌ها مثل رسیدها در IndexedDB و روی سرور (imgPut). */
const xrPh=x=>Array.isArray(x.imgs)?x.imgs.slice():x.img?[x.img]:[];
/* v61.47 (خواسته صاحب اپ): عکس برای همه کالاهای خرید و فروش (نه فقط سکه) — جمع‌وجور: یک خط با عکس‌های کوچک و یک «+»؛
   «+» مثل رسید واریزی‌ها پنجره عکس را باز می‌کند (گالری، دوربین، بزرگ‌نمایی، چرخش، برش، حذف — همان openGal با GAL.k='row')؛
   عکس اول روی آیکون ردیف سند می‌نشیند و زدن روی آن عکس را بزرگ نشان می‌دهد (ردیف سند و صفحه نمایش سند) */
/* v61.72 (خواسته صاحب اپ): رسید برای ردیف‌های دریافت/پرداخت هم (ردیف در حال ویرایش a.p، یا فرم پنجره تسویه CK با GAL.ck) */
/* v61.82 (خواسته صاحب اپ: «همه سندها عکس داشته باشد»): عکس برای همه ردیف‌ها — تخفیف و مانده قبلی هم */
const PHNO=[],phRc=x=>!!x&&(x===(sv&&sv.qa&&sv.qa.p)||(typeof CK!=='undefined'&&x===CK));
const phT=()=>{if(typeof GAL!=='undefined'&&GAL&&GAL.ck&&document.querySelector('#sheet .galg,#sheet .ckw,#zv:not(.hide)'))return typeof CK!=='undefined'&&CK&&CK.m?CK:null;const a=sv&&sv.qa;if(!a)return null;if(a.p)return PHNO.includes(a.p.m)?null:a.p;if(a.x)return a.x;if(a.pv)return a.pv;return a.k?a:null};
const phName=x=>x===(sv&&sv.qa&&sv.qa.pv)?'مانده قبلی':x===(typeof CK!=='undefined'&&CK)?(((ckOut()?CKO:CKT).find(z=>z[0]===x.m)||[])[1]||'رسید'):x===(sv&&sv.qa&&sv.qa.p)?pyLab({...x,amount:(x.dir==='out'&&x.m!=='pos'?-1:1)*(+x.amount||0)}):x===(sv&&sv.qa)?(x.ab?'آبشده':x.k||'کالا'):xrLab(x);
const phAmt=x=>{try{if(x===(sv&&sv.qa&&sv.qa.pv))return +x.r||0;return phRc(x)?(+x.amount||0):x===(sv&&sv.qa)?itCalc(qaIt(x),sv.rate,sv.tax).tot||0:xrCalc(x,sv.rate).amount||0}catch(_){return 0}};
async function phPaint(root){for(const im of (root||document).querySelectorAll('img[data-ik]:not([src])')){const v=await imgGet(im.dataset.ik);if(v&&im.isConnected)im.src=v;else if(im.isConnected)im.closest('.ph,.stpht,.cuidp')&&im.closest('.ph,.stpht,.cuidp').classList.add('miss')}}
function stPhHTML(x0){const x=x0||phT();if(!x)return '';const K=xrPh(x),rc=phRc(x);
  return `<div class="stph2"><span class="stphl2"><small>${ic('cam')}${K.length?toFa(K.length)+' عکس':rc?'عکس رسید':x===(sv&&sv.qa&&sv.qa.pv)?'عکس':'عکس کالا'}</small>${K.map((k,i)=>`<button type="button" class="stpht" data-act="${x===(typeof CK!=='undefined'&&CK)?'ckPhV':'rowPhV'}" data-i="${i}" aria-label="دیدن عکس"><img data-ik="${esc(k)}" alt=""></button>`).join('')}</span><button type="button" class="stphadd" data-act="${x===(typeof CK!=='undefined'&&CK)?'ckGal':'rowGal'}" aria-label="افزودن عکس">${ic('plus')}</button></div>`}
ACT.rowGal=()=>{if(!phT())return;qaRead();openGal({k:'row'})};
ACT.rowPhV=d=>{if(!phT())return;GAL={k:'row'};zvOpen(+d.i||0)};
/* عکس ردیف ثبت‌شده: فقط دیدن (data-ks = کلیدها با «,») */
ACT.rowPhS=d=>{const K=String(d.ks||'').split(',').filter(Boolean);if(!K.length)return;GAL={k:'view',keys:K,name:d.n||'عکس کالا'};zvOpen(0)};
function svBindRest(){phPaint($('svRows'));const G=$('svGc');if(G)G.onchange=()=>{sv.gconv=G.checked;svKeep();svRe()};const T=$('svT');if(T)T.onchange=()=>{sv.tax=T.checked;ls.set('m_tax',sv.tax);svKeep();svRe()}}
function svBindCu(){const Q=$('svQ');if(!Q)return;svQO=0;const cr=()=>{srchSwap('svCr',svCrHTML());phPaint($('svCr'))};
  kb2(Q,()=>svQO||!!clean(Q.value),()=>{svQO=1;cr();const w=Q.closest('.d6pick');try{(w||Q).scrollIntoView({block:'start',behavior:RM()?'auto':'smooth'})}catch(_){}});
  const out=e=>{if(!Q.isConnected){document.removeEventListener('pointerdown',out,true);return}if(!svQO||clean(Q.value)||document.activeElement===Q)return;const w=Q.closest('.d6pick');if(w&&w.contains(e.target))return;svQO=0;Q.readOnly=true;cr()};document.addEventListener('pointerdown',out,true);Q.oninput=()=>{sv.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{srchSwap('svCr',svCrHTML())},80)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(Q._t);sv.q=Q.value;const r=$('svCr');if(r)r.innerHTML=svCrHTML();const f=document.querySelector('#svCr [data-act=svCu]');if(f)svPick(f.dataset.id);else if(clean(Q.value))ACT.svCuNew()}};const C=$('svCr');if(C)C.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
function bindSell(){if(!sv)return;svBindCu();svCuBSync();phPaint($('svCu'));svBindRest();qaBind();const M=$('svM');TITLES.sell=sv.edit?'ویرایش سند '+toFa(sv.edit.no):'سند جدید';
  const setRate=(r,m)=>{sv.rate=r;sv.mz=m;if(r)ls.set('m_rate',r);if(m)ls.set('m_mz',m);const x=$('svRx'),w=$('svRate');if(x)x.innerHTML=rateX();if(w)w.classList.toggle('need',!r);svKeep();glPaint();clearTimeout(bindSell._t);bindSell._t=setTimeout(()=>{if(cur!=='sell')return;svRe();if(sv.qa.x)xrHint()},140)};
  const ref=+sv.rate||+ls.get('m_rate',0)||0;
  if(M){selOnFocus(M);M.oninput=()=>{const v=num(M.value);if(!GLset&&sv.live){sv.live=0;glPaint()}M.value=v?v.toLocaleString('en-US'):'';const k=rtDetect(v,ref);sv.rk=k;ls.set('m_rtk',k);const l=$('svRl');if(l)l.textContent=v?(k==='mz'?'مظنه':'هر گرم ۱۸'):'مظنه یا هر گرم';if(k==='mz')setRate(rOfMz(v),v);else setRate(v,mzOf(v))}}
  [M].forEach(el=>{if(el)el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const f=!svCu()?$('svQ'):$('qW')||$('xrW')||$('pyA');if(f)f.focus()}}});
  setTimeout(()=>{if(cur!=='sell'||!$('ov').classList.contains('hide'))return;const f=!svCu()?$('svQ'):sv.qa.p||sv.qa.x||sv.qa.pv?null:!sv.rate?M:null;if(f)f.focus()},380)}
/* ----- ثبت سند ----- */
/* v61.32: سند خودکار ثبت می‌شود (خواسته صاحب اپ): دکمه پایین «تسویه» است و پنجره تسویه را باز می‌کند؛
   هر دریافت (کارتخوان، حواله…) که در تسویه اضافه شود به همان سند برمی‌گردد. با بیرون رفتن از صفحه سند
   (دکمه برگشت، کشیدن، برگشت مرورگر) یا رفتن برنامه به پس‌زمینه، سند ثبت می‌شود؛ باز کردن دوباره فقط برای ویرایش است. */
const svSig=()=>sv?JSON.stringify([sv.cuId,sv.date,+sv.rate||0,+sv.mz||0,sv.items,sv.xr,sv.pays,!!sv.tax,+sv.disc||0,sv.dk||'']):'';
const svRows=()=>!!(sv&&(sv.items.length||sv.pays.length||(sv.xr||[]).length));
/* ردیف نیمه‌کاره‌ای که کامل است اول به سند اضافه می‌شود */
function svFlush(){const a=sv.qa;if(a&&a.pv){if($('stI'))stRead();if(pvHas(a.pv)){ACT.pvSave();if(sv.qa.pv)return false}}if(a&&a.k&&parseFloat(a.w))ACT.qaAdd();if(a&&a.x&&(parseFloat(a.x.w)||parseFloat(a.x.q))){ACT.xrSave();if(sv.qa.x)return false}if(a&&a.p&&(+a.p.amount>0)){ACT.pySave();if(sv.qa.p)return false}return true}
/* خطای ثبت (خالی = قابل ثبت) */
function svErr(){const c=svCu();if(!c)return 'مشتری سند انتخاب نشده';if(!svRows())return 'سند ردیفی ندارد';if(svHasG()&&!sv.rate)return 'مظنه یا نرخ گرم زده نشده';
  for(const p of sv.pays)if(p.m==='cust'&&!CU().some(z=>String(z.id)===String(p.cuId)))return 'حساب «'+(p.cuName||'')+'» پیدا نشد';
  for(const p of sv.pays)if(p.m==='dep'){const x=validated().find(z=>String(z.id)===String(p.entId));const mine=sv.edit&&(x&&x.settles||[]).some(z=>z.byInv&&String(z.byInv.tx)===String(sv.edit.tx));if(!x||(x.full&&!mine)||x.sentBid||depAvail(x)<ckUsedDep(p.entId))return 'واریزی «'+(p.entName||'')+'» دیگر قابل تسویه نیست؛ ردیفش را حذف کنید'}
  return ''}
/* ثبت واقعی سند (تازه یا جایگزین نسخه قبلی در ویرایش) — برمی‌گرداند {c,t} */
function svCommit(){const c=svCu();let depOld=null;
  /* v61.7: ویرایش سند ثبت‌شده: نسخه قبلی (و ردیف‌های مرتبطش) کنار می‌رود و همین سند با همان شماره دوباره ثبت می‌شود */
  let OLD=null;if(sv.edit){const t0=(c.txs||[]).find(x=>String(x.id)===String(sv.edit.tx)&&!x.del);if(t0){OLD=t0;const at=new Date().toISOString();t0.del=true;t0.delAt=at;t0.delBy=who();t0.edBy=1;txLinked(c,t0).forEach(x=>{x.t.del=true;x.t.delAt=at;x.t.delBy=who()});depOld=depKeep(t0);invDepOff(t0)}}
  const T=svTot(),now=ns(),no=sv.edit?sv.edit.no:invNext(),items=sv.items.map(it=>{const c2=itCalc(it,sv.rate,sv.tax),J=ajPT(it);return{...it,ajP:J.P,ajT:J.T,gold:c2.gold,ajv:c2.aj,prv:c2.pr,taxv:c2.tax,tot:c2.tot}});
  const xr=sv.xr.map(x=>{const C=xrCalc(x,sv.rate);return{...x,pg:C.pg,n:C.n,q750:x.a==='gold'?C.q:undefined,amount:C.amount,e:C.e}});
  const t={id:nid++,type:'inv',dk:sv.dk||undefined,no,date:sv.date,rate:sv.rate,mz:sv.mz||0,items,xr,tax:!!sv.tax,disc:T.disc,sub:T.sub,total:T.total,pays:sv.pays.map(p=>{const q={...p};delete q.xfId;return q}),at:now,by:who()};if(OLD){t.edOf=OLD.id;t.at0=OLD.at0||OLD.at}
  if(T.ge)t.ge=T.ge;if(Object.keys(T.xe).length)t.xe=T.xe;
  if(sv.gconv&&T.rest>0&&sv.rate)t.gc={r:T.rest,g:Math.round(T.rest/sv.rate*1000)/1000};
  for(const p of t.pays){if(p.m!=='cust')continue;const Y=custs.find(z=>String(z.id)===String(p.cuId)),x={id:nid++,type:'xf',r:-p.amount,g:0,note:'پرداخت سند '+toFa(no)+' «'+cuName(c)+'»',inv:{cu:c.id,tx:t.id},date:sv.date,at:now,by:who()};(Y.txs=Y.txs||[]).push(x);Y.lastAt=now;p.xfId=x.id}
  (c.txs=c.txs||[]).push(t);c.lastAt=now;saveCu();if(t.pays.some(p=>p.srcId!=null))saveS();ckDepApply(c,t,now,depOld);
  logA('cust',(OLD?'ویرایش ':'')+invTitle(t),cuName(c)+(items.length?' | '+items.map(i=>i.k+' '+wFmt(i.w)+' گرم').join('، '):'')+(xr.length?' | '+xr.map(xrLab).join('، '):'')+' | جمع '+fmt(T.total)+' تومان'+(T.paid?' | دریافت/پرداخت '+fmt(T.paid):''));
  return {c,t}}
/* v61.96 (خواسته صاحب اپ): فاکتور / PDF از داخل خود سند (پیش از ثبت) — همان برگه فاکتور با ردیف‌های فعلی، بدون ثبت و بدون تغییر حساب‌ها */
function svDraftTx(){const c=svCu(),T=svTot(),items=sv.items.map(it=>{const c2=itCalc(it,sv.rate,sv.tax),J=ajPT(it);return{...it,ajP:J.P,ajT:J.T,gold:c2.gold,ajv:c2.aj,prv:c2.pr,taxv:c2.tax,tot:c2.tot}}),xr=(sv.xr||[]).map(x=>{const C=xrCalc(x,sv.rate);return{...x,pg:C.pg,n:C.n,q750:x.a==='gold'?C.q:undefined,amount:C.amount,e:C.e}});
  const O=sv.edit&&c?(c.txs||[]).find(x=>String(x.id)===String(sv.edit.tx)):null;
  const t={id:'draft',type:'inv',dk:sv.dk||undefined,no:sv.edit?sv.edit.no:invNext(),date:sv.date,rate:sv.rate,mz:sv.mz||0,items,xr,tax:!!sv.tax,disc:T.disc,sub:T.sub,total:T.total,pays:sv.pays.map(p=>({...p})),at:ns(),by:who(),draft:1};if(O)t.at0=O.at0||O.at;
  if(T.ge)t.ge=T.ge;if(Object.keys(T.xe).length)t.xe=T.xe;if(sv.gconv&&T.rest>0&&sv.rate)t.gc={r:T.rest,g:Math.round(T.rest/sv.rate*1000)/1000};
  if(O){const c2={...c,txs:(c.txs||[]).filter(x=>x!==O)};return {c:c2,t}}return {c,t}}
ACT.svPrint=()=>{if(!sv)return;const e=!svCu()?'اول مشتری سند را انتخاب کنید':!svRows()?'سند هنوز ردیفی ندارد':svHasG()&&!sv.rate?'اول مظنه یا نرخ گرم را بزنید':'';if(e){toast(e,true);return}if(sv.qa&&(sv.qa.k||sv.qa.x||sv.qa.p||sv.qa.pv)&&$('stI'))stRead();
  const X=svDraftTx();openPrint(()=>invDoc(X.c,X.t))};
/* دکمه پایین سند: «تسویه» */
ACT.svSave=d=>{const c=svCu();if(!c){toast('مشتری سند را انتخاب کنید',true);const q=$('svQ');if(q){q.focus();q.scrollIntoView({behavior:'smooth',block:'center'})}return}
  if(!svFlush())return;if(!svRows()&&!svRBal()&&!(d&&d.w==='f'&&svBalL().some(z=>z[3]))){toast('حساب این مشتری تسویه است؛ کالا، طلا یا سکه اضافه کنید',true);dkShow();return}
  if(svHasG()&&!sv.rate){toast('مظنه یا نرخ گرم را بزنید',true);$('svM').focus();return}
  ckOpen(d&&d.w)};
/* v61.47: زدن هر مانده (قبلی / سند / نهایی) = تسویه همان مبلغ */
/* v61.59: زدن مانده طلا = تسویه طلا (gkOpen در 15i)؛ مبلغ و سکه = تسویه تومانی */
ACT.svBal=d=>{if(d&&d.k==='g'){if(!svCu()){toast('مشتری سند را انتخاب کنید',true);return}if(!svFlush())return;gkOpen(d.w);return}ACT.svSave(d)};
/* خروج از صفحه سند → ثبت خودکار. نتیجه: true = ثبت شد */
let svAutoBusy=false;
function svAuto(why){if(!sv||svAutoBusy)return false;svAutoBusy=true;try{
  try{svFlush()}catch(e){}
  if(!svRows()){if(!sv.edit){sv=null;ls.set('m_svd',null)}else{toast('همه ردیف‌ها برداشته شده؛ سند قبلی دست نخورد. برای حذف، از صفحه سند «حذف» را بزنید',true);sv=null;ls.set('m_svd',null)}return false}
  if(sv.edit&&sv.sig0&&svSig()===sv.sig0){if(why!=='bg'){sv=null;ls.set('m_svd',null)}return false}
  const er=svErr();if(er){svKeep();if(why!=='bg')toast('سند ثبت نشد: '+er+' · پیش‌نویس در صفحه مشتری ماند',true);return false}
  const fromInv=PARENT.sell==='inv',{c,t}=svCommit();
  if(why==='bg'){if(fromInv&&invV)invV.tx=t.id;sv.edit={tx:t.id,no:t.no};sv.sig0=svSig();svKeep();TITLES.sell='ویرایش سند '+toFa(t.no);return true}
  if(fromInv&&invV)invV.tx=t.id;sv=null;ls.set('m_svd',null);toast(invTitle(t)+' ثبت شد','', 'دیدن سند',()=>invOpen(c.id,t.id));return true}
  finally{svAutoBusy=false}}
/* v61.83: باز شدن گالری/دوربین (input file) روی آیفون و اندروید صفحه را «پنهان» می‌کند؛ قبلاً همین ثبت خودکار ردیفِ در حال ورود را می‌بست
   (svFlush → pvSave/qaAdd → sv.qa خالی) و عکس انتخاب‌شده دیگر صاحبی نداشت و ثبت نمی‌شد. حالا تا انتخاب‌گر عکس باز است ثبت خودکار نمی‌شود. */
let PICKING=0;
document.addEventListener('click',e=>{const t=e.target;if(t&&t.tagName==='INPUT'&&t.type==='file')PICKING=Date.now()},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.type==='file')PICKING=0},true);
document.addEventListener('cancel',e=>{const t=e.target;if(t&&t.type==='file')PICKING=0},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(PICKING){const p=PICKING;setTimeout(()=>{if(PICKING===p)PICKING=0},4000)}return}
  if(PICKING&&Date.now()-PICKING<10*60e3)return;
  if(cur==='sell'&&sv&&svRows()&&!svErr()&&(!sv.edit||svSig()!==sv.sig0))svAuto('bg')});
/* ================= نمایش سند ================= */
let invV=null;
function invOpen(cu,tx,fresh){invV={cu,tx,fresh:!!fresh};custId=cu;if(cur!=='inv')PARENT.inv=cur==='bank'?'bank':'cust';closeSheet();go('inv')}
/* v66.0 (خواسته صاحب اپ: «سند رو به من نشون بده نه جزئیات»): تراکنش‌های قدیمی «دریافت/پرداخت وجه» (مثل تسویه واریزی پیش از v65)
   هم در همان صفحه سند باز می‌شوند؛ فقط نمای سند است (داده دست نمی‌خورد، ویرایش ندارد، حذف همان تراکنش را حذف می‌کند) */
const TXDOC=['pin','pout'];
const txDocV=t=>{const o=t.type==='pout',a=(+t.amount||0)*(o?-1:1),n=String(t.note||''),nm=(n.match(/«(.+?)»/)||[])[1]||'',tn=(n.match(/پیگیری\s*(\S+)/)||[])[1]||'',p=t.entId?{m:'dep',amount:a,entId:t.entId,entName:nm}:{m:'cash',amount:a};if(tn)p.tn=tn;if(t.img)p.img=t.img;
  return {id:t.id,type:'inv',legacy:t.type,no:'',dk:o?'out':'in',date:t.date,at:t.at,by:t.by,note:n,items:[],xr:[],pays:[p],total:0,ge:0}};
const invGet=()=>{if(!invV)return null;const c=custs.find(z=>String(z.id)===String(invV.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(invV.tx));if(!t||t.del)return null;if(t.type==='inv')return {c,t,raw:t};return TXDOC.includes(t.type)?{c,t:txDocV(t),raw:t}:null};
const xrRowsOf=t=>(t.xr||[]).map(x=>({lab:xrLab(x),sub:xrSub(x,{n:x.n!=null?x.n:(x.a==='gold'?x.w:x.q),pg:x.pg,amount:x.amount,e:x.e}),amt:x.t==='sell'?x.amount:x.t==='buy'?-x.amount:0}));
function invEffTxt(t){const d=txD(t),P=[];if(d.r)P.push((d.r<0?'بدهکار ':'طلبکار ')+fmt(Math.abs(d.r))+' تومان');if(d.g)P.push((d.g<0?'بدهکار ':'طلبکار ')+wFmt(Math.abs(d.g))+' گرم طلا');for(const k in d.x||{})if(+d.x[k])P.push((d.x[k]<0?'بدهکار ':'طلبکار ')+qFmt(Math.abs(d.x[k]))+' '+(XA[k]||{u:k}).u+(XA[k]&&XA[k].k==='c'?' '+XA[k].s:''));return P}
function vInv(){const X=invGet();if(!X){setTimeout(()=>{if(cur==='inv')go('custs',true)},0);return ''}const {c,t}=X,b=cuBal(c),D=dates(t.date),fresh=invV.fresh;invV.fresh=false;
  const row=(l,v,k)=>`<div${k?' class="'+k+'"':''}><span>${l}</span><b>${v}</b></div>`,S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0),XR=xrRowsOf(t),E=invEffTxt(t),hasI=(t.items||[]).length;
  /* v61.47 (خواسته صاحب اپ): «نمایش فاکتور» و «چاپ» یکی شد (فقط دکمه پایین «فاکتور · چاپ / PDF»)؛ حساب مشتری بالای صفحه با مانده‌ها؛
     دکمه‌ها ساده‌تر: ویرایش و سند بعدی کنار هم */
  return `${fresh?`<div class="bzok ivok">${ic('check')}<span>${esc(invTitle(t))} ثبت شد و به حساب «${esc(cuName(c))}» رفت</span></div>`:''}
  ${ivMeta(t)}${ivDet(c,t)}`}/* v61.63 (خواسته صاحب اپ): کارت «مانده حساب» بالای سند ثبت‌شده برداشته شد — مانده‌ها فقط پایین صفحه */
/* v61.54 (خواسته صاحب اپ): بالای صفحه سند، کارت حساب مشتری مثل ردیف فهرست حساب‌ها (نام، گروه، تلفن، کاشی مبلغ و طلا با برچسب)،
   در یک کادر با همان ورود پله‌ای و شمارش عدد (فقط بار اول هر سند)؛ زدن = حساب مشتری */
let ivCntId=null;
const bindInv=()=>{const k=String(invV&&invV.tx);if(ivCntId===k)return;ivCntId=k;requestAnimationFrame(()=>cuCount('.cub9.anim .cbn'))};
/* v61.52 (خواسته صاحب اپ): ویرایش، سند بعدی و حذف از پایین صفحه برداشته شد و در منوی کوچک بالا سمت چپ (⋯) آمد */
ACT.invMenu=()=>{const X=invGet();if(!X)return;const it=[can('debt')&&!X.t.legacy?['invEdit',ic('edit'),'ویرایش سند']:null,can('debt')?['svNew',ic('plus'),'سند بعدی برای «'+cuName(X.c)+'»',{cu:X.c.id}]:null,['invPrint',ic('print'),'فاکتور · چاپ / PDF'],['cuOpen',ic('users'),'حساب مشتری',{id:X.c.id}],can('del')||isAdmin()?['invDel',ic('trash'),'حذف این سند',null,1]:null].filter(Boolean);
  popMenu(document.querySelector('#bar .hmo'),it)};
/* منوی کوچک زیر یک دکمه سرتیتر (مثل منوی iOS): زدن بیرون یا Esc = بسته؛ هر گزینه همان data-act همیشگی را اجرا می‌کند */
function popMenu(btn,items){let m=$('pmenu');if(m){m.remove();return}if(!btn)return;m=document.createElement('div');m.id='pmenu';m.className='pmenu';m.setAttribute('role','menu');
  m.innerHTML=items.map(([a,ico,l,d,red])=>`<button role="menuitem" class="pmi${red?' red':''}" data-act="${a}"${Object.entries(d||{}).map(([k,v])=>` data-${k}="${esc(String(v))}"`).join('')}><span>${esc(l)}</span>${ico}</button>`).join('');
  document.body.appendChild(m);const r=btn.getBoundingClientRect();m.style.top=Math.round(r.bottom+6)+'px';m.style.left=Math.max(8,Math.round(r.left))+'px';btn.setAttribute('aria-expanded','true');
  const out=e=>{if(!m.contains(e.target)&&!btn.contains(e.target))close()},key=e=>{if(e.key==='Escape')close()},close=()=>{if(m._c)return;m._c=1;m.classList.add('out');btn.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',out,true);document.removeEventListener('keydown',key,true);setTimeout(()=>m.remove(),RM()?0:160)};
  setTimeout(()=>{document.addEventListener('pointerdown',out,true);document.addEventListener('keydown',key,true)},0);m.addEventListener('click',e=>{if(e.target.closest('.pmi'))setTimeout(close,0)});const f=m.querySelector('.pmi');if(f)f.focus({preventScroll:true})}
/* v61.57 (خواسته صاحب اپ): تاریخ و مظنه سند بالای صفحه، زیر سرتیتر (پیش از کارت مانده حساب) */
function ivMeta(t){const D=dates(t.date);return `<div class="iv8m"><span>${ic('cal')}<b>${esc(D.fa)}</b><small>${esc(D.wd)}</small></span>${t.rate?`<span>${ic('tag')}<small>${t.mz?'مظنه':'هر گرم'}</small><b>${fmt(t.mz||t.rate)}</b></span>`:''}${t.tax?`<span><small>با مالیات</small></span>`:''}</div>`}
/* v61.6: باز کردن سند = جزئیات سند و ردیف‌ها (مثل صفحه سند)؛ فاکتور کاغذی فقط با «نمایش فاکتور» */
function ivDet(c,t){const D=dates(t.date),eff=d6Eff,R=[];
  let n=0;const row=(ico,tag,b,sub,v,phs,ex)=>d6Row({ico,phs,tag:dkTag(tag),b,sub,v,ex,key:'v'+t.id+'.'+n,n:n++}),PG=pvGroups(t.pays||[],t.xr||[]);
  (t.items||[]).forEach(it=>R.push(row(d6Ico('sell'),'sell',esc(it.k)+(it.sh===1?' شرطی':'')+(it.n?' <i>'+esc(it.n)+'</i>':''),itDet(it,t.rate,t.tax,1),eff(-(+it.tot||0)),xrPh(it))));
  (t.xr||[]).forEach((x,xi)=>{if(PG.sx.has(xi))return;const C={n:x.n!=null?x.n:(x.a==='gold'?x.w:x.q),pg:x.pg,amount:+x.amount||0,e:+x.e||0},R0=x.t==='sell'?-C.amount:x.t==='buy'?C.amount:0,k=dkOfX(x);R.push(row(d6Ico(k,'coin'),k,esc(xrLab(x)),xrDet(x,C,t.rate),eff(R0)+eff(C.e,x.a==='gold'?'g':x.a),xrPh(x)))});
  if(+t.disc)R.push(row('tag','','تخفیف','از جمع سند کم شد',eff(+t.disc)));
  (t.pays||[]).forEach((p,pi)=>{if(PG.sp.has(pi))return;const out=pAmt(p)<0,M=PM[p.m]||PM.cash;R.push(row(M.i,out?'out':'in',esc(pyLab(p)),pyDet(p,t.id),eff(pAmt(p)),xrPh(p),p.m==='dep'?depActs(p,'v'+t.id+'.'+pi,c):pyActs(p,c,t.id,t.no)))});
  wdRowsHTML(c,t.no,t.id).forEach(h=>R.push(h));
  PG.L.forEach(G=>R.push(row('clock',G.dir,'مانده قبلی',pvSub(G,t.pays||[],t.xr||[]),pvEffs(G,t.pays||[],t.xr||[],x=>+x.e||0),pvPh(G,t.pays||[],t.xr||[]))));
  const E=txD(t),ef=[E.r?eff(E.r):'',E.g?eff(E.g,'g'):'',...Object.keys(E.x||{}).filter(k=>+E.x[k]).map(k=>eff(E.x[k],k))].filter(Boolean);
  return `<div class="ivd6${ivCntId!==String(t.id)?' anim':''}">
  ${R.length?`<div class="d6sh"><b>ردیف‌های سند</b><small>${toFa(R.length)} ردیف</small></div><div class="d6rows d7">${R.join('')}</div>`:''}
  </div>`}
/* v61.53 (خواسته صاحب اپ): مانده‌های سند پایین صفحه (جای دکمه چاپ)؛ هر جنس یک قاب: نام و واحد کامل کنار هم،
   قبلی · این سند · نهایی در سه ستون، نهایی پررنگ با زمینه رنگی. مبلغ و طلا همیشه، سکه/ارز اگر هست */
/* v61.57 (خواسته صاحب اپ): «مانده‌ها یک شکل در همه قسمت‌ها» — یک جدول مشترک برای پایین صفحه سند و سند ثبت‌شده:
   هر جنس یک ردیف (نام و واحد)، هر مانده (قبلی، سند، نهایی) در قاب خودش، نهایی پررنگ با زمینه رنگی؛ عدد در قاب جا می‌شود.
   rows = [[جنس, مقدار ستون ۱, ستون ۲, …]]، cols = [{lab, w (هدف تسویه با زدن), m (ستون اصلی)}]. نگه داشتن = جزئیات فاکتور */
/* v61.60 (خواسته صاحب اپ): ارز (دلار…) درست زیر مبلغ؛ بعد طلا و سکه‌ها */
/* v61.61 (خواسته صاحب اپ): مانده‌های اصلی مبلغ و طلا بالا؛ دلار و سکه پایین‌تر و جمع‌شده (دکمه گوشه جدول) */
const balRk=k=>k==='r'?0:k==='g'?1:(XA[k]||{}).k==='f'?2:3;
/* نام و واحد هر جنس در مانده‌ها: مبلغ · تومان، طلا · گرم، ارز · دلار، سکه امامی · عدد (نه «دلار دلار») */
const balKL=(k,two)=>{const X=XA[k]||{},n=k==='r'?'مبلغ':k==='g'?'طلا':X.k==='f'?'ارز':esc(X.t||k),u=k==='r'?'تومان':k==='g'?'گرم':X.k==='f'?esc(X.t||k):esc(X.u||'عدد');return two?`<b>${n}</b><small>${u}</small>`:`${n} <i>${u}</i>`};
function balGrid(rows,cols,o){o=o||{};rows=rows.map((r,i)=>[r,i]).sort((a,b)=>balRk(a[0][0])-balRk(b[0][0])||a[1]-b[1]).map(z=>z[0]);let n=0;const N=cols.length;
  const cell=(k,v,c)=>{const x=v?balV(k,v):'۰',T=o.act&&c.w?'button':'span';return `<${T} class="iv8c ${q8S(v)}${c.m?' m':''}" style="--i:${n++}"${T==='button'?` type="button" data-act="${o.act}" data-w="${c.w}" data-k="${k}" aria-label="${esc(c.lab)}: ${esc(x)} ${esc(balU(k))}"`:''}><span class="fz"><b${fitS(x)}>${x}</b></span><small>${v?ourLab(v):'تسویه'}</small></${T}>`};
  const rw=([k,...V])=>`<div class="iv8r k${q8C(k)}"><span class="iv8k">${balKL(k,1)}</span>${cols.map((c,j)=>cell(k,V[j]||0,c)).join('')}</div>`,
    M=rows,full=`<div class="iv8h">${cols.map(c=>`<span>${esc(c.lab)}</span>`).join('')}</div>${M.map(rw).join('')}`,hint=`<div class="iv9hint">${ic('hold')}${o.hint||'برای جزئیات فاکتور نگه دارید'}</div>`;
  if(N<2)return `<div class="iv8b iv9b n${N}${o.an?' anim':''}" role="group" aria-label="مانده‌ها">${full}${hint}</div>`;
  /* v61.65 (خواسته صاحب اپ): اول فقط مانده‌های نهایی (مبلغ، طلا، دلار…) جمع‌وجور؛ دکمه فلش بالای کارت (یا زدن روی مانده‌ها) =
     جدول کامل قبلی · این سند · نهایی با حرکت بالا می‌آید؛ دوباره زدن = جمع می‌شود. حالت باز/بسته در BGO می‌ماند */
  /* v61.66 (خواسته صاحب اپ): ترتیب از چپ: مبلغ، طلا (کنار مبلغ)، بعد ارز و سکه به سمت راست؛ همه قاب‌ها هم‌اندازه و عددها با یک اندازه
     (اندازه بلندترین عدد)؛ برچسب «ارز · دلار»، «سکه امامی · عدد» */
  const mi=Math.max(0,cols.findIndex(c=>c.m)),MV=M.map(([k,...V])=>[k,V[mi]||0]).reverse(),fw=Math.min(...MV.map(([k,v])=>fitW(v?balV(k,v):'۰'))),
    fc=cols[mi],mini=MV.map(([k,v])=>{const x=v?balV(k,v):'۰',T=o.act&&fc.w?'button':'span';/* v61.67: زدن هر قاب نهایی = تسویه همان (مثل قبل)؛ فلش = جدول کامل */
      return `<${T} class="bgmc ${q8S(v)}"${T==='button'?` type="button" data-act="${o.act}" data-w="${fc.w}" data-k="${k}" aria-label="تسویه ${esc(String(balKL(k)).replace(/<[^>]*>/g,''))}: ${esc(x)}"`:''}><small>${balKL(k)}</small><span class="fz"><b style="--fw:${fw}">${x}</b></span><em>${v?ourLab(v):'تسویه'}</em></${T}>`}).join('');
  return `<div class="iv8b iv9b bgc n${N}${o.an?' anim':''}${BGO?' op':''}" role="group" aria-label="مانده‌ها"><button type="button" class="bgup" data-act="bgO" aria-expanded="${BGO?'true':'false'}" aria-label="${BGO?'بستن جزئیات مانده‌ها':'مانده‌های قبلی، این سند و نهایی'}">${ic('chev')}</button>
  <div class="bgx"><div class="bgxi">${full}</div></div><div class="bgmw"><div class="bgm"><button type="button" class="bgmt" data-act="bgO">مانده نهایی ${o.act?'· زدن = تسویه':'· جزئیات'}</button><span class="bgml">${mini}</span></div></div>${hint}</div>`}
let BGO=false;
ACT.bgO=()=>{BGO=!BGO;document.querySelectorAll('.iv9b.bgc').forEach(B=>{B.classList.toggle('op',BGO);const u=B.querySelector('.bgup');if(u){u.setAttribute('aria-expanded',BGO?'true':'false');u.setAttribute('aria-label',BGO?'بستن جزئیات مانده‌ها':'مانده‌های قبلی، این سند و نهایی')}
  if(BGO&&!RM())B.querySelectorAll('.bgx .iv8c,.bgx .iv8k,.bgx .iv8h span').forEach((c,i)=>c.animate&&c.animate([{opacity:0,transform:'translateY(10px) scale(.96)'},{opacity:1,transform:'none'}],{duration:360,delay:40+i*22,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'}))})};
function ivBalP(c,t){const P=cuBalBefore(c,t),d=txD(t),K=q8Keys(P,d);
  const rows=K.map(k=>{const a=q8V(P,k),b=q8V(d,k);return [k,a,b,k==='g'?Math.round((a+b)*1000)/1000:k==='r'?a+b:Math.round((a+b)*100)/100]});
  /* سندهای بعد از این سند (به تاریخ) هم هست → مانده امروز حساب زیر جدول، تا با صفحه مشتری اشتباه نشود */
  const B=cuBal(c),fin=rows.reduce((o,[k,,,f])=>(o[k]=f,o),{}),diff=Math.round(B.R-(fin.r||0))||Math.round((B.G-(fin.g||0))*1000);
  const now=diff?`<button type="button" class="ivnow" data-act="cuOpen" data-id="${c.id}">${ic('clock')}<span><small>سندهای بعدی هم ثبت شده · مانده امروز حساب</small><b>${[B.R?fmt(Math.abs(B.R))+' تومان '+ourLab(B.R):'',B.G?wFmt(Math.abs(B.G))+' گرم '+ourLab(B.G):''].filter(Boolean).join(' · ')||'تسویه'}</b></span>${ic('back').replace('class="i"','class="i flip"')}</button>`:'';
  return now+balGrid(rows,[{lab:'قبلی',w:'p'},{lab:'این سند',w:'d'},{lab:'نهایی',w:'f',m:1}],{an:ivCntId!==String(t.id),act:can('debt')?'invBal':'',hint:can('debt')?'زدن = تسویه · نگه داشتن = جزئیات فاکتور':''})}
/* v61.67 (خواسته صاحب اپ): در سند ثبت‌شده هم زدن روی مانده = تسویه — سند برای ویرایش باز و پنجره تسویه همان مانده باز می‌شود */
ACT.invBal=d=>{if(!invGet())return;ACT.invEdit();setTimeout(()=>{if(cur==='sell'&&sv&&sv.edit)ACT.svBal(d)},420)};
/* سند ثبت‌شده به شکل «سند در حال ویرایش» (برای ویرایش و برای پنجره جزئیات فاکتور) */
function invSv(c,t){const items=(t.items||[]).map(it=>{const o={...it};['gold','ajv','prv','taxv','tot'].forEach(k=>delete o[k]);return o}),xr=(t.xr||[]).map(x=>{const o={...x};['n','q750','amount','e'].forEach(k=>delete o[k]);if(o.a==='gold'&&!o.pgM)o.pg=0;return o}),pays=(t.pays||[]).map(p=>{const o={...p};delete o.xfId;return o});
  const keep=sv;sv={v:2,cuId:c.id,date:t.date,rate:+t.rate||0,mz:+t.mz||mzOf(t.rate),items,xr,pays,tax:!!t.tax,disc:+t.disc||0,gconv:false,q:'',dk:t.dk||'',fixCu:true,edit:{tx:t.id,no:t.no}};svFix();const r=sv;sv=keep;return r}
/* v61.56 (خواسته صاحب اپ): در صفحه سند ثبت‌شده هم نگه داشتن روی مانده‌های پایین = جزئیات فاکتور (همان پنجره صفحه سند) */
function invDetHTML(){const X=invGet();if(!X)return '';const keep=sv;try{sv=invSv(X.c,X.t);return svDetHTML({inv:1})}finally{sv=keep}}
ACT.invEdit=()=>{const X=invGet();if(!X)return;if(X.t.legacy){toast('این سند قدیمی است و ویرایش ندارد؛ در صورت نیاز حذف و دوباره ثبت کنید',true);return}if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}const {c,t}=X;
  sv=invSv(c,t);sv.sig0=svSig();svKeep();TITLES.sell='ویرایش سند '+toFa(t.no);PARENT.sell='inv';go('sell')};
ACT.invPaper=()=>{if(!invV)return;invV.paper=!invV.paper;render();scrollTo({top:0,behavior:RM()?'auto':'smooth'})};
const aInv=()=>{const X=invGet();return X?ivBalP(X.c,X.t):''};
ACT.invDel=()=>{const X=invGet();if(!X)return;askConfirm(invTitle(X.t)+' حذف شود؟ اثرش از حساب مشتری'+(txLinked(X.c,X.t).length?' و مشتری پرداخت‌کننده':'')+' برداشته می‌شود.','حذف',()=>{custId=X.c.id;cur='cust';ACT.txDel({id:X.t.id});go('cust',true)})};
/* v61.33: برگه سند (چاپ / PDF) — خواسته صاحب اپ: هر ردیف فقط مشخصات (کالا، وزن، عیار، مظنه، اجرت ٪، سود ٪) و مبلغ نهایی؛
   بعد جمع کالاها، ردیف‌های دریافت و پرداخت که اعمال می‌شوند و جمعشان، و در آخر مانده قبلی، این سند و نهایی (تومان، طلا، سکه).
   برچسب‌ها از دید مشتری: «بدهکار» = مشتری باید بپردازد، «طلبکار» = ما باید بپردازیم. */
/* v61.80 (خواسته صاحب اپ: «مانده‌ها در دو قسمت اختلاف دارد»): مانده قبلی هر سند به ترتیب تاریخ سند (و در یک روز، زمان ثبت) —
   همان ترتیب گردش حساب و صورتحساب. قبلاً به ترتیب زمان ثبت بود: سندی با تاریخ عقب‌تر که بعداً ثبت شده بود در مانده سندهای بعدش نمی‌آمد. */
function cuBalBefore(c,t){const K=x=>String(x.date||'')+'|'+String(x.at0||x.at||''),k=K(t);let R=0,G=0;const X={};
  for(const x of c.txs||[]){if(x.del||x===t||String(x.id)===String(t.id)||String(x.id)===String(t.edOf))continue;if(K(x)>=k)continue;const d=txD(x);R+=d.r;G+=d.g;if(d.x)for(const q in d.x)X[q]=(X[q]||0)+(+d.x[q]||0)}
  return {R:Math.round(R),G:Math.round(G*1000)/1000,X}}
function invDoc(c,t){const nl=v=>String(v).replace(/ · (طلبکاریم|بدهکاریم)$/,''),D=dates(t.date),its=t.items||[],xs=t.xr||[],hasI=its.length,mzOf2=o=>+o.mz||+t.mz||(t.rate?Math.round(t.rate*MZK):0);
  /* v61.84 (خواسته صاحب اپ): «تومان» جلوی همه مبلغ‌ها؛ عددها در ستون خودشان دقیقاً زیر هم (رقم یکان هم‌تراز، واحد و برچسب عرض ثابت) */
  const mo=(v,sg)=>'<span class="mo"><bdi dir="ltr">'+(sg?sg+' ':'')+fmt(Math.abs(v))+'</bdi><u>تومان</u></span>',ng=(v,pl)=>mo(v,pl?'+':'−'),lab=v=>!v?'<i class="z">تسویه</i>':v<0?'<i class="d">طلبکاریم</i>':'<i class="c">بدهکاریم</i>';/* v62.2 (خواسته صاحب اپ): از دید مغازه — طلبکاریم / بدهکاریم */
  const P=cuBalBefore(c,t),d=txD(t),dX=d.x||{},keys=[...new Set([...Object.keys(P.X),...Object.keys(dX)])].filter(k=>Math.round(((P.X[k]||0)+(+dX[k]||0))*100)||+dX[k]||P.X[k]);
  const w3=v=>toFa((Math.round(Math.abs(+v||0)*1000)/1000).toLocaleString('en-US',{minimumFractionDigits:3,maximumFractionDigits:3})),col=[['g','طلا · گرم ۱۸ عیار',v=>v?w3(v):'۰','گرم'],['r','ریالی · تومان',v=>fmt(Math.abs(v)),'تومان'],...keys.map(k=>[k,(XA[k]||{s:k}).s+' ('+((XA[k]||{}).u||'')+')',v=>qFmt(Math.abs(v)),(XA[k]||{}).u||''])].filter(([k])=>k!=='g'||P.G||d.g);
  const val=(k,o)=>k==='r'?o.r:k==='g'?o.g:(+(o.x||{})[k]||0),PB={r:P.R,g:P.G,x:P.X},DB={r:d.r,g:d.g,x:dX},FB={r:P.R+d.r,g:Math.round((P.G+d.g)*1000)/1000,x:Object.fromEntries(keys.map(k=>[k,(P.X[k]||0)+(+dX[k]||0)]))};
  const balRow=(t0,o,cl)=>`<tr${cl?' class="'+cl+'"':''}><th>${t0}</th>${col.map(([k,,f,u])=>{const v=val(k,o);return `<td><span class="bv ${v<0?'vd':v>0?'vc':''}">${lab(v)}<span class="bn"><bdi dir="ltr">${v?f(v):'۰'}</bdi><u>${esc(u)}</u></span></span></td>`}).join('')}</tr>`;
  /* ردیف‌ها: کالا با مشخصات؛ طلا/سکه/ارز با مقدار و نرخ */
  let n=0;const R=[];
  /* v61.64 (خواسته صاحب اپ): ردیف‌های برگه مرتب — ستون‌ها: کالا · مقدار · عیار · نرخ · اجرت و سود · مبلغ؛ خانه خالی بی‌خط تیره؛
     مانده قبلی (تومان، طلا، دلار…) یک ردیف جدا در جمع پایین، نه در اقلام */
  const PG=pvGroups(t.pays||[],xs),pvP=new Set([...PG.sp]),un=x=>g0(x)?'گرم':(XA[x.a]||{}).u||'',g0=x=>x.a==='gold',em='';
  its.forEach(it=>{const sub=[it.pz&&+it.cnt?qFmt(it.cnt)+' عدد':'',it.lab?'آزمایشگاه '+esc(it.lab):'',it.ang?'انگ '+esc(it.ang):''].filter(Boolean).join(' · '),J=it.ab?'':ajLab(it);
    R.push(`<tr><td class="k">${toFa(++n)}</td><td><b>${esc(it.k)}${it.sh===1?' <i class="z">شرطی</i>':''}</b>${it.n?'<small>'+esc(it.n)+'</small>':''}${sub?'<small>'+sub+'</small>':''}</td><td>${wFmt(it.w)} <u>گرم</u></td><td>${toFa(it.ay||750)}</td><td>${fmt(mzOf2(it))}<small>مظنه</small></td><td>${J&&J!=='۰'?esc(J)+(+it.ajv&&ajPT(it).P?'<small>'+fmt(it.ajv)+' تومان</small>':''):em}</td><td>${+it.pp?toFa(String(+it.pp))+'٪'+(+it.prv?'<small>'+fmt(it.prv)+' تومان</small>':''):+it.prv?fmt(it.prv)+'<small>تومان</small>':em}</td><td class="n">${mo(it.tot)}${+it.taxv?'<small>با مالیات '+fmt(it.taxv)+'</small>':''}</td></tr>`)});
  xs.forEach((x,xi)=>{if(PG.sx.has(xi))return;const g=g0(x),m=x.t==='sell'||x.t==='buy',amt=x.t==='sell'?x.amount:x.t==='buy'?-x.amount:0,u=un(x),q=g?(x.n!=null?x.n:x.w):(x.n!=null?x.n:x.q);
    const rate=g&&m?(x.t==='buy'&&!x.pul&&x.cat!=='آبشده'?fmt(Math.round(mzOf2(x)*(+x.ay||750)/750))+'<small>مظنه خرید</small>':fmt(mzOf2(x))+'<small>مظنه</small>'):m&&x.pg?fmt(x.pg)+'<small>هر '+esc(u||'واحد')+'</small>':em;
    const sub=[x.pz&&+x.cnt?qFmt(x.cnt)+' عدد':'',x.lab?'آزمایشگاه '+esc(x.lab):'',x.ang?'انگ '+esc(x.ang):''].filter(Boolean).join(' · ');
    /* v61.84: دریافت/تحویل و خرید طلا وزن ۷۵۰ را هم نشان می‌دهد (همان وزنی که به حساب می‌رود) */
    const w75=g?(+x.q750||+x.e||Math.round((+q||0)*(+x.ay||750)/750*1000)/1000):0,s75=g&&!x.pul&&(x.t==='in'||x.t==='out'||x.t==='buy'||x.cat==='آبشده');
    R.push(`<tr${amt<0?' class="by"':''}><td class="k">${toFa(++n)}</td><td><b>${esc(nl(xrLab(x)))}${x.sh===1?' <i class="z">شرطی</i>':''}</b>${sub?'<small>'+sub+'</small>':''}</td><td>${g?wFmt(q):qFmt(q)} <u>${esc(u)}</u>${s75?'<small class="w75">وزن ۷۵۰: <b>'+wFmt(w75)+'</b> گرم</small>':''}</td><td>${g?toFa(x.ay||750):em}</td><td>${rate}</td><td>${em}</td><td>${em}</td><td class="n">${amt?(amt<0?ng(amt):mo(amt)):`<span class="gd ${x.t==='in'?'gi':'go'}">${x.t==='in'?'دریافت':'تحویل'} <bdi dir="ltr">${g?wFmt(Math.abs(w75)):qFmt(q)}</bdi> ${g?'گرم ۷۵۰':esc(u)}</span>`}</td></tr>`)});
  const pvLine=()=>PG.L.map(G=>{const P=[...G.p.map(i=>mo(pAmt(t.pays[i]))),...G.x.map(i=>xs[i]).map(x=>g0(x)?wFmt(parseFloat(x.w)||0)+' گرم':qFmt(parseFloat(x.q)||0)+' '+esc(un(x)))];return line('مانده قبلی <small>'+(G.dir==='out'?'بدهی قبلی مشتری':'طلب قبلی مشتری')+'</small>','<span class="pvs">'+P.map(v=>'<bdi>'+v+'</bdi>').join('')+'</span>',G.dir==='out'?'o':'p')}).join('');
  const sold=its.reduce((s,i)=>s+(+i.tot||0),0)+xs.reduce((s,x)=>s+(x.t==='sell'?+x.amount||0:0),0),bought=xs.reduce((s,x)=>s+(x.t==='buy'?+x.amount||0:0),0),W=its.reduce((s,i)=>s+(+i.w||0),0);
  const pays=t.pays||[],paid=pays.reduce((s,p)=>s+pAmt(p),0);
  const line=(l,v,cl,sub)=>`<div class="l${cl?' '+cl:''}"><span>${l}${sub?'<small>'+sub+'</small>':''}</span><b>${v}</b></div>`;
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(invTitle(t))} · ${esc(cuName(c))}</title>${PDF_FONT}<style>@page{size:A5 landscape;margin:7mm}html,body{-webkit-text-size-adjust:100%;text-size-adjust:100%}*{box-sizing:border-box}body{font-family:Vazirmatn,Tahoma,sans-serif;color:#16213a;font-size:8.6pt;line-height:1.55;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
  /* v61.62 (خواسته صاحب اپ): فاکتور با لوگوی مغازه (مهر طلای مطلا): سرتیتر سرمه‌ای با لوگو، نوار طلایی، مهر کنار امضای فروشنده و نقش کم‌رنگ لوگو پشت برگه */
  .pg{position:relative}.pg:before{content:"";position:absolute;left:50%;top:46%;width:72%;aspect-ratio:477/202;transform:translate(-50%,-50%) rotate(-8deg);background:url(logo-stamp.png) center/contain no-repeat;opacity:.05;pointer-events:none;z-index:0}.pg>*{position:relative;z-index:1}
  .hd{background:linear-gradient(135deg,#0f1f3f,#13284f 60%,#1a3366);color:#fff;border-radius:14px 14px 4px 4px;padding:8px 12px 10px;display:flex;align-items:center;gap:12px;position:relative;overflow:hidden}.hd:after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:linear-gradient(90deg,#b8862b,#f3d892,#b8862b,#f3d892,#b8862b)}
  .lg{flex:none;width:31mm;aspect-ratio:477/202;background:url(logo-stamp.png) center/contain no-repeat;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
  .br{flex:1;min-width:0;border-inline-start:1px solid rgba(236,200,116,.35);padding-inline-start:12px}.br b{display:block;font-size:12.5pt;font-weight:900;letter-spacing:-.2px}.br small{display:block;color:#ecd9a6;font-size:7.4pt}
  .no{text-align:center;border:1px solid rgba(236,200,116,.55);border-radius:10px;padding:3px 10px 4px}.no small{display:block;color:#ecd9a6;font-size:6.8pt}.no b{font-size:14pt;color:#f3d892;line-height:1.2}
  .mt{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:6px;margin:7px 0}.mt div{border:1px solid #e7e9ef;border-radius:8px;padding:4px 8px}.mt small{display:block;color:#8a91a1;font-size:6.8pt}.mt b{font-size:9pt}.mt span{display:block;font-size:7pt;color:#7a8294}
  h4{margin:7px 0 3px;font-size:7.6pt;color:#7a5a17;font-weight:800;letter-spacing:.2px}
  table{width:100%;border-collapse:collapse;font-feature-settings:"tnum"}
  .it th{background:#fbf6e8;color:#7a5a17;font-size:7pt;font-weight:700;padding:4px 3px;border-bottom:1.5px solid #ecd9a6;text-align:right;white-space:nowrap}.it td{padding:3.5px 3px;border-bottom:1px solid #eef0f4;font-size:8.2pt;vertical-align:top;white-space:nowrap}
  .it td:nth-child(2){white-space:normal}.it td small{display:block;color:#8a91a1;font-size:6.6pt;font-weight:400}.it td.k{color:#8a91a1}.it td.n,.it th.n{text-align:left;font-weight:800}.it td u{text-decoration:none;font-size:6.6pt;color:#8a91a1}.it td small.gd{display:inline;color:#7a5a17;font-weight:700;font-size:7pt}.it td b i{font-size:6.4pt;vertical-align:1px}.it tr.by td.n{color:#1d4ed8}
  .it tfoot td{border-bottom:0;border-top:1.5px solid #ecd9a6;font-weight:800;padding-top:5px}
  .sm{margin:6px 0 0 auto;width:74%;border:1px solid #e7e9ef;border-radius:9px;padding:4px 10px}.l{display:flex;justify-content:space-between;gap:8px;padding:2px 0;font-size:8.4pt}.l b{white-space:nowrap;font-feature-settings:"tnum"}.l small{display:block;font-size:6.6pt;color:#8a91a1}
  .pvs{display:flex;flex-direction:column;align-items:flex-end;gap:1px}.pvs bdi{display:block;unicode-bidi:isolate}.l.t{border-top:1px solid #dfe3ea;margin-top:3px;padding-top:5px;font-weight:800}.l.g span{white-space:nowrap}.l.g{border-top:1.5px solid #13284f;margin-top:4px;padding-top:6px;font-size:10pt;font-weight:900;color:#13284f}.l.p b{color:#15803d}.l.o b{color:#c2414b}.l .pt{margin-inline-end:5px}em.pt{font-style:normal;font-size:6.6pt;font-weight:900;padding:0 6px;border-radius:5px;display:inline-block;vertical-align:1px}em.pt.p{background:#e3f5ea;color:#15803d}em.pt.o{background:#fde8ea;color:#b4232f}.it td.n .gd.gi{color:#15803d}.it td.n .gd.go{color:#c2414b}.bn{display:inline-flex;align-items:baseline;gap:3px;justify-content:flex-end}.bn u{text-decoration:none;font-size:6.6pt;font-weight:600;color:#8a91a1}.bv.vd bdi{color:#c2414b}.bv.vc bdi{color:#1d4ed8}.bl tr.f .bv bdi{color:#fff}.bl tr.f .bn u{color:#cdd5e6}.bv{display:inline-flex!important;align-items:center;gap:7px}.bv i{min-width:56px}.bl td{text-align:right}.lgd{display:flex;flex-wrap:wrap;gap:3px 12px;margin:5px 2px 0;font-size:6.8pt;color:#6b7280}.lgd i{margin:0 0 0 3px}
  .bl{margin-top:7px;border:1px solid #ecd9a6;border-radius:9px;overflow:hidden}.bl table th,.bl table td{padding:4px 8px;font-size:8.2pt;border-bottom:1px solid #f1e8cf;text-align:right;white-space:nowrap}.bl thead th{background:#fbf6e8;color:#7a5a17;font-size:7pt}.bl tbody th{font-weight:700;color:#4a5263;width:24%}
  .bl tr.f th,.bl tr.f td{background:#13284f;color:#fff;font-weight:900;font-size:9pt;border:0}.bl tr.f i{background:rgba(255,255,255,.16)!important;color:#fff!important}
  i{font-style:normal;font-size:6.8pt;font-weight:800;padding:0 5px;border-radius:5px;margin-inline-start:3px}i.d{background:#fde8ea;color:#b4232f}i.c{background:#e6efff;color:#1d4ed8}i.z{background:#eef0f4;color:#6b7280}
  .sg{display:flex;justify-content:space-between;align-items:flex-end;margin-top:26px;font-size:7.4pt;color:#7a8294;break-inside:avoid}.sg>span{border-top:1px dashed #c9ced8;padding-top:4px;min-width:36%;text-align:center;position:relative}
  .ed{break-inside:avoid;page-break-inside:avoid}
  .ft{margin-top:6px;padding-top:5px;border-top:1px solid #f1e8cf;display:flex;justify-content:space-between;font-size:6.8pt;color:#9097a5}.ft b{color:#b8862b;font-weight:800}
  .mo{display:inline-flex;align-items:baseline;gap:3px;white-space:nowrap}.mo bdi{unicode-bidi:isolate}.mo u{text-decoration:none;font-size:.78em;font-weight:600;color:#8a91a1}
  .sm .l{align-items:baseline}.sm .l>b{flex:0 0 40%;text-align:right}.l.g .mo u{color:#13284f}.it td.n{text-align:right;width:1%}.it th.n{text-align:right;padding-inline-start:6px}.it td.n small{text-align:right}.it td.n .gd{color:#7a5a17;font-weight:700;font-size:7.6pt}
  .it td small.w75{color:#7a5a17;font-weight:600}.it td small.w75 b{font-weight:800}
  .bv{display:grid;grid-template-columns:42px 1fr;align-items:center;gap:6px}.bv i{margin:0;text-align:center}.bv bdi{text-align:right;font-weight:800;unicode-bidi:isolate}.bl td{width:auto}.bl thead th{text-align:right}
  /* v61.84: A5 افقی با همان طراحی پیش‌نمایش (یک ستون) */.sg{margin-top:16px}
  .mt{break-inside:avoid}.it tr,.sm,.bl{break-inside:avoid;page-break-inside:avoid}.it thead{display:table-header-group}.it tfoot{display:table-row-group}.hd,.mt,h4{break-after:avoid;page-break-after:avoid}/* v61.71: همان طراحی A5؛ فهرست بلند به صفحه بعد با سرستون تکرارشده، ردیف نصف نمی‌شود */</style></head><body><div class="pg">
  <div class="hd"><span class="lg" role="img" aria-label="طلای مطلا"></span><span class="br"><b>${t.total<0&&!hasI?'سند خرید':hasI?'فاکتور فروش':'سند'}</b><small>طلا و جواهر مطلا</small></span><span class="no"><small>شماره</small><b>${toFa(t.no)}</b></span></div>
  <div class="mt"><div><small>مشتری</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<span dir="ltr" style="text-align:right">${telA(c.phone,esc(toFa(c.phone)))}</span>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div><div><small>مظنه روز</small><b>${t.rate?fmt(t.mz||Math.round(t.rate*MZK)):'—'}</b><span>${t.rate?'هر گرم ۱۸: '+fmt(t.rate):''}</span></div></div>
  ${R.length?`<h4>اقلام سند</h4><table class="it"><thead><tr><th>#</th><th>کالا</th><th>مقدار</th><th>عیار</th><th>نرخ</th><th>اجرت</th><th>سود</th><th class="n">مبلغ</th></tr></thead><tbody>${R.join('')}</tbody>${hasI?`<tfoot><tr><td></td><td>جمع وزن کالا</td><td>${wFmt(W)} <u>گرم</u></td><td colspan="5"></td></tr></tfoot>`:''}</table>`:''}
  <div class="sm">${sold?line('جمع فروش',mo(sold)):''}${bought?line('خرید از مشتری',ng(bought)):''}${t.tax&&its.some(i=>+i.taxv)?line('مالیات بر ارزش افزوده <small>در مبلغ ردیف‌ها</small>',mo(its.reduce((s,i)=>s+(+i.taxv||0),0))):''}${+t.disc?line('تخفیف',ng(t.disc)):''}
    ${line(t.total<0?'خالص خرید (به نفع مشتری)':'جمع سند',mo(t.total),sold||bought?'t':'')}
    ${pvLine()}${pays.map((p,pi)=>pvP.has(pi)?'':line('<em class="pt '+(pAmt(p)>0?'p':'o')+'">'+(pAmt(p)>0?'دریافت':'پرداخت')+'</em>'+esc(nl(pyLab(p,1)).replace(/^(دریافت|پرداخت)\s*/,'')),ng(pAmt(p),pAmt(p)<0),pAmt(p)>0?'p':'o',p.tn?'پیگیری '+esc(p.tn):'')).join('')}
    ${pays.length>1?line('جمع دریافت و پرداخت',ng(paid,paid<0),'t'):''}
    ${line('مانده این سند '+lab(d.r),d.r?mo(d.r):'<span class="mo"><bdi>۰</bdi><u>تومان</u></span>','g')}</div>
  <div class="bl"><table><thead><tr><th></th>${col.map(([,h])=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${balRow('مانده قبلی',PB)}${balRow('این سند',DB)}${balRow('مانده نهایی',FB,'f')}</tbody></table></div>
  <div class="lgd"><span><i class="d">طلبکاریم</i> مشتری به مطلا بدهکار است</span><span><i class="c">بدهکاریم</i> مطلا به مشتری بدهکار است</span><span><em class="pt p">دریافت</em> از مشتری</span><span><em class="pt o">پرداخت</em> به مشتری</span></div>
  <div class="ed"><div class="sg"><span>امضای مشتری</span><span>مهر و امضای فروشنده</span></div><div class="ft"><span>صادرکننده: ${esc(t.by||'')}</span><b>طلای مطلا</b></div></div></div></body></html>`}
ACT.invPrint=()=>{const X=invGet();if(!X)return;openPrint(()=>invDoc(X.c,X.t))};

/* ================= انتقال مانده بین مشتری‌ها ================= */
let xs=null;
function xsHTML(){const c=curCu(),b=cuBal(c),bal=xs.u==='g'?b.G:b.R,G=xs.u==='g',to=xs.to&&CU().find(z=>String(z.id)===String(xs.to)),v=+xs.amt||0,s=xs.s;
  const fmtU=x=>G?wFmt(Math.abs(x))+' گرم':fmt(Math.abs(x))+' تومان',tb=to?cuBal(to):null,tv=tb?(G?tb.G:tb.R):0;
  return `<div class="sh-h"><div><b>انتقال مانده</b><small class="shsub">از حساب «${esc(cuName(c))}» به مشتری دیگر</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="bzw" style="animation:none">
  <div class="seg2">${[['r','تومان'],['g','طلا']].map(([k,t])=>`<button class="${xs.u===k?'on':''}" data-act="xsU" data-u="${k}">${t}</button>`).join('')}</div>
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
  <div class="cvbal"><div><small>مانده تومانی</small>${balTag(b.R)}<em>${balLab(b.R)}</em></div><div><small>مانده طلایی</small>${balTag(b.G,1)}<em>${balLab(b.G)}</em></div></div>
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
  <div class="fsearch sm chadd" style="margin-top:14px">${ic('plus')}<input id="chN" placeholder="نام کارتخوان تازه" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="chAdd" data-k="pos">افزودن</button></div>`}
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
  <div class="ef"><label>به کدام حساب</label>${sources.length?`<div class="chps">${ownL(posD.to).map(s=>{const bk=acBank(s);return `<button class="chp${String(posD.to)===String(s.id)?' on':''}" data-act="pdTo" data-id="${s.id}">${bk?bankBadge(bk):ic('bank')}<span><b>${esc(s.name)}</b><small>${esc(bkSub(s))}</small></span></button>`}).join('')}</div>`:'<div class="eh">در بخش بانک حسابی تعریف نشده</div>'}</div>
  <div class="ef"><label for="pdA">مبلغ <i>(تومان)</i></label><input id="pdA" class="ltr acbig" inputmode="numeric" value="${posD.a?Number(posD.a).toLocaleString('en-US'):''}" autocomplete="off"><small class="eh">کل مانده: ${fmt(bal)} تومان</small></div></div>
  <button class="xgo" data-act="pdSave">${ic('check')} ثبت واریز</button>`}
const pdRe=()=>{sheet(pdHTML());const A=$('pdA');if(A){selOnFocus(A);A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';posD.a=v}}};
ACT.posDep=d=>{if(d&&d.id)chId=d.id;const c=custs.find(z=>String(z.id)===String(chId));if(!c)return;const last=ls.get('m_posdep_'+c.id,'');posD={a:Math.max(0,chBal(c)),to:(chSrc(c)||sources.find(s=>String(s.id)===String(last))||sources.find(s=>s.bal!=null)||sources[0]||{}).id};pdRe()};
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
