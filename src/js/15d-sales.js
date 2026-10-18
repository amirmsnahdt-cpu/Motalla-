/* ===== فاکتور فروش، کارتخوان‌ها و حساب‌ها، انتقال مانده بین مشتری‌ها (الگو: نرم‌افزار طلافروشی) =====
   همه داده‌ها داخل همان مجموعه custs ذخیره و همگام می‌شوند:
   - فاکتور = تراکنش type:'inv' در حساب مشتری (items، pays، total، gc = تبدیل مانده به طلایی)
   - انتقال مانده / تبدیل طلایی‌ریالی = تراکنش type:'xf' / 'cv' با r و g علامت‌دار (مثبت = بدهی ما)
   - کارتخوان و حساب بانکی خودمان = رکورد {sys:'ch', kind:'pos'|'bank'}؛ مانده = جمع تسویه‌های فاکتورها + حواله‌های ورودی − خروجی
   - گروه‌ها و فهرست کالاها = رکورد {sys:'cfg'} */
Object.assign(IC,{inv:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',card:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',coin:'<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',cash:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',ring:'<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-1.5 3.6h-3z"/>'});
let cuRet='';
const ns=()=>new Date().toISOString();
/* ---------- تنظیمات مشترک: گروه‌ها و کالاها ---------- */
function cfgRec(make){let r=custs.find(c=>c.sys==='cfg'&&!c.del);if(!r&&make){r={id:nid++,sys:'cfg',name:'',groups:[],goods:[],txs:[],createdAt:ns()};custs.push(r)}return r}
const GOODS0=['انگشتر','النگو','دستبند','گردنبند','زنجیر','گوشواره','سرویس','نیم‌ست','پلاک','آویز','سکه','شمش','آبشده'];
const goodsList=()=>{const r=cfgRec();return [...new Set([...((r&&r.goods)||[]),...GOODS0])]};
const groupsList=()=>{const r=cfgRec();return [...new Set([...((r&&r.groups)||[]),...CU().map(c=>c.grp).filter(Boolean)])]};
function addGroup(g){g=clean(g||'');if(!g)return;const r=cfgRec(1);r.groups=r.groups||[];if(!r.groups.includes(g)){r.groups.push(g);saveCu()}}
function addGoods(k){k=clean(k||'');if(!k||GOODS0.includes(k))return;const r=cfgRec(1);r.goods=r.goods||[];if(!r.goods.includes(k)){r.goods.unshift(k);saveCu()}}
/* ---------- کارتخوان‌ها و حساب‌های بانکی خودمان ---------- */
const CH=k=>custs.filter(c=>c.sys==='ch'&&!c.del&&(!k||c.kind===k));
const CHK={pos:'کارتخوان',bank:'حساب بانکی'};
function chMoves(ch){const L=[];for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;(t.pays||[]).forEach(p=>{if(String(p.chId)===String(ch.id))L.push({d:t.date,at:t.at,a:+p.amount||0,t:'فاکتور '+toFa(t.no)+' · '+cuName(c),sub:p.m==='pos'?'کارتخوان':'حواله'+(p.tn?' · پیگیری '+p.tn:''),cu:c.id,tx:t.id})})}}
  for(const t of ch.txs||[]){if(t.del)continue;const o=custs.find(z=>String(z.id)===String(t.peer));L.push({d:t.date,at:t.at,a:t.type==='tin'?+t.amount:-t.amount,t:t.type==='tin'?'حواله از «'+((o&&o.name)||'حساب')+'»':'حواله به «'+((o&&o.name)||'حساب')+'»',sub:[t.tn?'پیگیری '+t.tn:'',t.note].filter(Boolean).join(' · '),own:t.id})}
  return L.sort((a,b)=>String(b.d+b.at).localeCompare(String(a.d+a.at)))}
const chBal=ch=>chMoves(ch).reduce((s,m)=>s+m.a,0);
function chSumLab(){const L=CH();if(!L.length)return 'تعریف کارتخوان و حساب';const s=L.reduce((a,c)=>a+chBal(c),0);return 'مانده '+fmt(s)+' تومان'}
function chNew(name,kind){name=clean(name||'');if(!name)return null;const r={id:nid++,sys:'ch',kind,name,txs:[],createdAt:ns(),by:who()};custs.push(r);saveCu();logA('cust','تعریف '+CHK[kind],name);return r}
/* ---------- ردیف‌های مرتبط (برای حذف/بازگردانی هم‌زمان) ---------- */
function txLinked(c,t){const R=[],find=(cu,tx)=>{const C=custs.find(z=>String(z.id)===String(cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(tx));if(T)R.push({c:C,t:T})};
  if(t.type==='inv')(t.pays||[]).forEach(p=>{if(p.m==='cust'&&p.xfId)find(p.cuId,p.xfId)});
  if((t.type==='xf'||t.type==='cv')&&t.peer)find(t.peer.cu,t.peer.tx);
  if(t.type==='xf'&&t.inv)find(t.inv.cu,t.inv.tx);
  return R.filter(x=>x.t!==t)}
function txRow2(c,t){const d=txD(t),v=(x,g)=>`<b class="${x>0?'r':'b'}">${x>0?'+':'−'} ${g?wFmt(Math.abs(x)):fmt(Math.abs(x))} <i>${g?'گرم':'تومان'}</i></b>`;
  let T,sub,ico;if(t.type==='inv'){const paid=(t.pays||[]).reduce((s,p)=>s+(+p.amount||0),0);T='فاکتور فروش '+toFa(t.no);ico='inv';sub=[(t.items||[]).map(i=>i.k).join('، '),wFmt((t.items||[]).reduce((s,i)=>s+(+i.w||0),0))+' گرم','جمع '+fmt(t.total),paid?'پرداخت '+fmt(paid):''].filter(Boolean).join(' · ')}
  else if(t.type==='xf'){T=t.inv?'پرداخت فاکتور مشتری دیگر':'انتقال مانده';ico='swap';sub=t.note||''}else{T='تبدیل '+(t.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی');ico='coin';sub=t.note||''}
  const vals=(d.r?v(d.r):'')+(d.g?v(d.g,1):'')||'<b>تسویه</b>';
  return swW(`<button class="txr" data-act="txOpen" data-id="${t.id}"><span class="bri t-${t.type}">${ic(ico)}</span><span class="tx"><b>${esc(T)}</b><small>${esc(sub)}</small></span><span class="txv txv2">${vals}</span></button>`,{r:[['txOpen','جزئیات','eye','#3b6fd6']],l:can('del')||isAdmin()?[['txDel','حذف','trash','#d23c48']]:[],data:{id:t.id}})}
function xfShow(c,t){const d=txD(t),kv=(l,v)=>v?`<div class="kv"><small>${l}</small><b>${v}</b><span class="kvx"></span></div>`:'';const L=txLinked(c,t);
  sheet(`<div class="sh-h"><div><b>${t.type==='cv'?'تبدیل طلایی / ریالی':'انتقال مانده'}</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="kvs" style="border:0;padding:0">${kv('اثر ریالی',d.r?fmt(Math.abs(d.r))+' تومان ('+(d.r>0?'بدهی ما':'طلب ما')+')':'')}${kv('اثر طلایی',d.g?wFmt(Math.abs(d.g))+' گرم ('+(d.g>0?'بدهی طلایی ما':'طلب طلایی ما')+')':'')}${kv('نرخ',t.rate?fmt(t.rate)+' تومان هر گرم':'')}${kv('طرف دیگر',L.map(x=>esc(cuName(x.c))).join('، '))}${kv('شرح',esc(t.note||''))}${kv('تاریخ',esc(dates(t.date).wd+' '+dates(t.date).fa))}${kv('ثبت‌کننده',esc(t.by||''))}</div>
  ${can('del')||isAdmin()?`<button class="edel" data-act="txDel" data-id="${t.id}">${ic('trash')} حذف${L.length?' (ردیف طرف مقابل هم حذف می‌شود)':''}</button>`:''}`)}

/* ================= فاکتور فروش ================= */
let sv=null,svAdd=-1,si=null,sp=null;
const PM={cash:{t:'نقد',i:'cash',d:'پول نقد در صندوق'},pos:{t:'کارتخوان',i:'card',d:'کشیدن کارت روی کارتخوان مغازه'},hav:{t:'حواله',i:'bank',d:'کارت‌به‌کارت یا حواله به حساب ما'},gold:{t:'طلای مشتری',i:'coin',d:'طلای کهنه مشتری به‌جای پول'},cust:{t:'از حساب مشتری دیگر',i:'swap',d:'از طلب مشتری دیگر کم شود'}};
function invNext(){let m=1000;for(const c of custs)for(const t of c.txs||[])if(t.type==='inv'&&+t.no>m)m=+t.no;return m+1}
const svKeep=()=>ls.set('m_svd',sv);
function svBlank(cu){return{v:1,cuId:cu||'',date:todayISO(),rate:+ls.get('m_rate',0)||0,items:[],tax:!!ls.get('m_tax',false),disc:0,pays:[],gconv:false,q:'',g:''}}
ACT.svNew=d=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}closeSheet();const cu=d&&d.cu?d.cu:'',old=ls.get('m_svd',null);
  if(old&&old.v===1&&(old.items.length||old.pays.length)&&(!cu||String(old.cuId||'')===String(cu)||!old.cuId)){sv=old;if(cu)sv.cuId=cu;toast('پیش‌نویس فاکتور قبلی باز شد','', 'فاکتور تازه',()=>{sv=svBlank(cu);svKeep();render()})}else sv=svBlank(cu);
  PARENT.sell=cur==='cust'?'cust':'custs';svKeep();go('sell')};
function itCalc(it,rate,tax){const w=+it.w||0,ay=+it.ay||750,gold=Math.round(w*(+rate||0)*ay/750),aj=it.ajU==='p'?Math.round(gold*(+it.aj||0)/100):Math.round(+it.aj||0),pr=Math.round((gold+aj)*(+it.pp||0)/100),tx=tax?Math.round((aj+pr)*0.10):0;return{gold,aj,pr,tax:tx,tot:gold+aj+pr+tx}}
function svTot(){let gold=0,aj=0,pr=0,tax=0,w=0;for(const it of sv.items){const c=itCalc(it,sv.rate,sv.tax);gold+=c.gold;aj+=c.aj;pr+=c.pr;tax+=c.tax;w+=+it.w||0}
  const sub=gold+aj+pr+tax,disc=Math.min(+sv.disc||0,sub),total=sub-disc,paid=sv.pays.reduce((s,p)=>s+(+p.amount||0),0);return{gold,aj,pr,tax,w:Math.round(w*1000)/1000,sub,disc,total,paid,rest:total-paid}}
const svCu=()=>sv&&sv.cuId?CU().find(c=>String(c.id)===String(sv.cuId))||null:null;
function vSell(){if(!sv){sv=ls.get('m_svd',null)||svBlank('')}const D=dates(sv.date);
  return `<div class="svw">
  <div class="ivpaper svhead"><div class="ivh"><span class="ivmk">م</span><span class="ivbr"><b>فاکتور فروش</b><small>طلا و جواهر مطلا</small></span><span class="ivno"><small>شماره</small><b>${toFa(invNext())}</b></span></div>
    <div class="svmeta"><button class="svdate" data-act="svCal">${ic('cal')}<span><small>تاریخ</small><b>${esc(payLab(sv.date)||D.fa)}</b></span></button>
    <label class="svrate"><small>نرخ روز هر گرم <i>(۱۸ عیار، تومان)</i></small><input id="svR" class="ltr" inputmode="numeric" value="${sv.rate?Number(sv.rate).toLocaleString('en-US'):''}" placeholder="مثلاً 7,450,000" autocomplete="off"></label></div></div>
  <div class="spsec"><b>مشتری</b><small>جستجو با نام، شماره یا کد ملی؛ یا مشتری جدید اضافه کنید</small></div><div id="svCu">${svCuHTML()}</div>
  <div class="spsec"><b>کالاها</b><small id="svItS">${svItSub()}</small></div><div id="svIt">${svItHTML()}</div>
  <button class="addit" data-act="svItNew">${ic('plus')} افزودن کالا <small>(جستجوی انگشتر، النگو، سکه…)</small></button>
  <div class="svopt"><label class="taxck"><input type="checkbox" id="svT"${sv.tax?' checked':''}><span class="tgx"></span><span><b>مالیات</b><small>۱۰٪ از اجرت و سود</small></span></label>
  <label class="svdisc"><small>تخفیف <i>(تومان)</i></small><input id="svDs" class="ltr" inputmode="numeric" value="${sv.disc?Number(sv.disc).toLocaleString('en-US'):''}" placeholder="0" autocomplete="off"></label></div>
  <div id="svSum">${svSumHTML()}</div>
  <div class="spsec"><b>تسویه</b><small>هر چند روش که لازم است؛ باقی‌مانده به حساب مشتری می‌رود</small></div>
  <div class="svpm">${Object.entries(PM).map(([k,v])=>`<button class="svpb p-${k}" data-act="svPay" data-m="${k}">${ic(v.i)}<b>${v.t}</b></button>`).join('')}</div>
  <div id="svPays">${svPaysHTML()}</div><div id="svRest">${svRestHTML()}</div></div>`}
const aSell=()=>`<button class="btn gold bzgo" data-act="svSave">${ic('check')} ثبت فاکتور</button>`;
/* ----- مشتری ----- */
function svCuHTML(){const c=svCu();if(c){const b=cuBal(c);return `<div class="svcu"><span class="bri">${esc(userInit(c.name))}</span><span class="tx">${honTag(c.name)}<b>${esc(cuName(c))}</b><small>${[c.grp?'گروه '+esc(c.grp):'',c.phone?'<bdi dir="ltr">'+esc(c.phone)+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span><button class="lnk" data-act="svCuX">تغییر</button>
    <div class="svcub"><div><small>مانده ریالی</small>${balTag(b.R)}<em>${balLab(b.R)}</em></div><div><small>مانده طلایی</small>${balTag(b.G,1)}<em>${balLab(b.G)}</em></div></div></div>`}
  const GL=groupsList();
  return `<div class="svpick"><div class="fsearch">${ic('search')}<input id="svQ" type="search" value="${esc(sv.q||'')}" placeholder="جستجوی مشتری…" autocomplete="off"></div>
  ${GL.length?`<div class="fchips grp">${[['','همه'],...GL.map(g=>[g,g])].map(([k,t])=>`<button class="fchip${(sv.g||'')===k?' on':''}" data-act="svG" data-g="${esc(k)}">${esc(t)}</button>`).join('')}</div>`:''}<div id="svCr">${svCrHTML()}</div></div>`}
function svCrHTML(){const q0=clean(sv.q||''),q=nzName(toEn(q0));let L=CU();if(sv.g)L=L.filter(c=>c.grp===sv.g);if(q)L=L.filter(c=>nzName([c.name,c.phone,c.nid,c.grp].join(' ')).includes(q));
  L=L.sort((a,b)=>q?(nzName(b.name).startsWith(q)-nzName(a.name).startsWith(q))||String(b.lastAt||'').localeCompare(String(a.lastAt||'')):String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,7);
  const add=q0&&!/^\d+$/.test(toEn(q0))&&!CU().some(c=>nzName(c.name)===nzName(q0));
  return (L.length?`<div class="fcard blist">${L.map(c=>{const b=cuBal(c);return `<button class="curow" data-act="svCu" data-id="${c.id}"><span class="bri">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${c.grp?'<em class="cgp">'+esc(c.grp)+'</em> ':''}${c.phone?'<bdi dir="ltr">'+esc(c.phone)+'</bdi>':'بدون شماره'}</small></span><span class="cuv">${balTag(b.R)}${balTag(b.G,1)}</span></button>`}).join('')}</div>`:q0?'':`<div class="bempty sm">${ic('users')}<b>هنوز مشتری ثبت نشده</b></div>`)
    +`<button class="cuadd" data-act="svCuNew">${ic('plus')}<span><b>${add?'مشتری جدید «'+esc(q0)+'»':'افتتاح حساب مشتری جدید'}</b><small>${sv.g?'در گروه «'+esc(sv.g)+'» · ':''}مشخصات را بزنید و روی همین فاکتور می‌نشیند</small></span></button>`}
function svPick(id){sv.cuId=id;sv.q='';svKeep();const v=$('view'),y=v?v.scrollTop:0;if(cur!=='sell')go('sell');else{render();$('view').scrollTop=y}const e=document.querySelector('.svcu');if(e){e.classList.add('pop')}}
ACT.svCu=d=>svPick(d.id);
ACT.svCuX=()=>{sv.cuId='';sv.pays=sv.pays.filter(p=>p.m!=='cust');svKeep();render();setTimeout(()=>{const q=$('svQ');if(q)q.focus()},60)};
ACT.svG=d=>{sv.g=d.g;svKeep();$('svCu').innerHTML=svCuHTML();svBindCu()};
ACT.svCuNew=()=>{cuRet='sell';sheet(cuFormHTML({name:clean(sv.q||''),grp:sv.g||''}));cuBind();setTimeout(()=>{const n=$(sv.q?'cuP':'cuN');if(n)n.focus()},300)};
ACT.svCal=()=>openCal(sv.date,iso=>{sv.date=iso;svKeep();closeSheet();render()});
/* ----- کالاها ----- */
const svItSub=()=>sv.items.length?toFa(sv.items.length)+' قلم · '+wFmt(svTot().w)+' گرم':'هنوز کالایی اضافه نشده';
function svItHTML(){if(!sv.items.length)return `<div class="svempty">${ic('ring')}<span>کالا را جستجو و اضافه کنید؛ بهای طلا، اجرت، سود و مالیات خودکار حساب می‌شود</span></div>`;
  return `<div class="fcard blist svits">${sv.items.map((it,i)=>{const c=itCalc(it,sv.rate,sv.tax);return `<button class="svir${i===svAdd?' new':''}" data-act="svItEdit" data-i="${i}"><span class="bri gk">${esc(userInit(it.k))}</span><span class="tx"><b>${esc(it.k)}${it.n?' <i>'+esc(it.n)+'</i>':''}</b><small>${wFmt(it.w)} گرم · عیار ${toFa(it.ay||750)} · اجرت ${it.ajU==='p'?toFa(+it.aj||0)+'٪':fmt(+it.aj||0)} · سود ${toFa(+it.pp||0)}٪</small></span><span class="txv"><b>${sv.rate?fmt(c.tot):'—'}</b><small>${sv.rate?'تومان':'نرخ را بزنید'}</small></span></button>`}).join('')}</div>`}
function svSumHTML(){const T=svTot();if(!sv.items.length)return '';const row=(l,v,c)=>`<div${c?' class="'+c+'"':''}><span>${l}</span><b>${v}</b></div>`;
  return `<div class="svsum">${row('بهای طلا · '+wFmt(T.w)+' گرم',fmt(T.gold))}${row('اجرت ساخت',fmt(T.aj))}${row('سود فروشنده',fmt(T.pr))}${sv.tax?row('مالیات ۱۰٪',fmt(T.tax)):''}${T.disc?row('تخفیف','− '+fmt(T.disc),'dc'):''}
  <div class="svtot"><span>جمع فاکتور</span><b><span id="svTotN" data-v="${T.total}">${fmt(T.total)}</span> <i>تومان</i></b></div></div>`}
function svPaysHTML(){if(!sv.pays.length)return '';return `<div class="fcard blist svpays">${sv.pays.map((p,i)=>{const M=PM[p.m];const ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId)),oc=p.cuId&&custs.find(z=>String(z.id)===String(p.cuId));
  const sub=p.m==='gold'?wFmt(p.w)+' گرم عیار '+toFa(p.ay||750)+' · هر گرم '+fmt(p.gr):p.m==='cust'?'از طلب «'+esc(oc?cuName(oc):p.cuName||'')+'»':ch?esc(ch.name)+(p.tn?' · پیگیری '+esc(p.tn):''):M.d;
  return `<div class="svpr"><button class="svprb" data-act="svPayEdit" data-i="${i}"><span class="bri pm-${p.m}">${ic(M.i)}</span><span class="tx"><b>${M.t}</b><small>${sub}</small></span><span class="txv"><b>${fmt(p.amount)}</b><small>تومان</small></span></button><button class="stlc" data-act="svPayDel" data-i="${i}" aria-label="حذف این پرداخت">${ic('x')}</button></div>`}).join('')}</div>`}
function svRestHTML(){if(!sv.items.length)return '';const T=svTot(),c=svCu(),b=c?cuBal(c):{R:0,G:0};let h='';
  if(T.rest>0){const g=sv.rate?Math.round(T.rest/sv.rate*1000)/1000:0;h=`<div class="svrest due"><div><small>مانده به حساب مشتری</small><b>${fmt(T.rest)} <i>تومان</i></b><em>مشتری بدهکار می‌شود</em></div>${sv.rate?`<label class="taxck sm"><input type="checkbox" id="svGc"${sv.gconv?' checked':''}><span class="tgx"></span><span><b>مانده طلایی ثبت شود</b><small>${wFmt(g)} گرم با نرخ امروز</small></span></label>`:''}</div>`}
  else if(T.rest<0)h=`<div class="svrest over"><div><small>بیش از جمع فاکتور پرداخت شده</small><b>${fmt(-T.rest)} <i>تومان</i></b><em>به طلب مشتری اضافه می‌شود</em></div></div>`;
  else if(T.total)h=`<div class="svrest ok"><div><small>تسویه کامل</small><b>${ic('check')} پرداخت‌ها با جمع فاکتور برابر است</b></div></div>`;
  if(c){const gc=sv.gconv&&T.rest>0&&sv.rate,nr=b.R-T.total+T.paid+(gc?T.rest:0),ng=Math.round((b.G-(gc?T.rest/sv.rate:0))*1000)/1000;h+=`<div class="txeff svaft"><span>ته حساب «${esc(cuName(c))}» بعد از ثبت</span><b class="${nr>0?'r':nr<0?'b':''}">${fmt(Math.abs(nr))} تومان · ${balLab(nr)}</b>${ng||b.G?`<b class="${ng>0?'r':ng<0?'b':''}">${wFmt(Math.abs(ng))} گرم · ${balLab(ng)}</b>`:''}</div>`}
  return h}
function tween(el,to){if(!el)return;const from=+el.dataset.v||0;el.dataset.v=to;if(from===to||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=fmt(to);return}const t0=performance.now(),D=420;cancelAnimationFrame(el._r);
  const st=n=>{const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)el._r=requestAnimationFrame(st)};el._r=requestAnimationFrame(st);const p=el.closest('.svtot');if(p){p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump')}}
function svRe(){const o=$('svTotN'),old=o?+o.dataset.v||0:0;const set=(id,h)=>{const e=$(id);if(e)e.innerHTML=h};set('svIt',svItHTML());set('svItS',svItSub());set('svSum',svSumHTML());set('svPays',svPaysHTML());set('svRest',svRestHTML());
  const n=$('svTotN');if(n){const to=+n.dataset.v;n.dataset.v=old;n.textContent=fmt(old);tween(n,to)}svBindRest();svAdd=-1}
function svBindRest(){const G=$('svGc');if(G)G.onchange=()=>{sv.gconv=G.checked;svKeep();$('svRest').innerHTML=svRestHTML();svBindRest()}}
function svBindCu(){const Q=$('svQ');if(!Q)return;Q.oninput=()=>{sv.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{const r=$('svCr');if(r)r.innerHTML=svCrHTML()},100)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const f=document.querySelector('#svCr [data-act=svCu]');if(f)svPick(f.dataset.id);else if(clean(Q.value))ACT.svCuNew()}}}
function bindSell(){if(!sv)return;svBindCu();svBindRest();const R=$('svR'),T=$('svT'),D=$('svDs');
  if(R)R.oninput=()=>{const v=num(R.value);R.value=v?v.toLocaleString('en-US'):'';sv.rate=v;if(v)ls.set('m_rate',v);svKeep();clearTimeout(R._t);R._t=setTimeout(()=>{if(cur==='sell')svRe()},160)};
  if(T)T.onchange=()=>{sv.tax=T.checked;ls.set('m_tax',sv.tax);svKeep();svRe()};
  if(D)D.oninput=()=>{const v=num(D.value);D.value=v?v.toLocaleString('en-US'):'';sv.disc=v;svKeep();clearTimeout(D._t);D._t=setTimeout(()=>{if(cur==='sell')svRe()},160)};
  if(!sv.rate&&R&&!svCu())setTimeout(()=>{if(cur==='sell'&&$('ov').classList.contains('hide')){const q=$('svQ');if(q)q.focus()}},380)}
/* ----- پنجره کالا: جستجوی نوع کالا، وزن، عیار، اجرت، سود ----- */
function siChips(){const q=nzName(si.q||''),L=goodsList().filter(k=>!q||nzName(k).includes(q)),used={};for(const c of custs)for(const t of c.txs||[])if(t.type==='inv'&&!t.del)(t.items||[]).forEach(i=>used[i.k]=(used[i.k]||0)+1);
  L.sort((a,b)=>q?(nzName(b).startsWith(q)-nzName(a).startsWith(q))||(used[b]||0)-(used[a]||0):(used[b]||0)-(used[a]||0));
  return L.map(k=>`<button class="kch${si.k===k?' on':''}" data-act="siK" data-k="${esc(k)}"><b>${esc(k)}</b>${used[k]?'<small>'+toFa(used[k])+' فروش</small>':''}</button>`).join('')+(q&&!L.some(k=>nzName(k)===q)?`<button class="kch new" data-act="siK" data-k="${esc(clean(si.q))}"><b>+ ${esc(clean(si.q))}</b><small>کالای جدید</small></button>`:'')}
function siHTML(){const ed=si.i!=null,st=goldStock();
  return `<div class="sh-h"><div><b>${ed?'ویرایش کالا':'افزودن کالا'}</b><small class="shsub">${si.k?esc(si.k):'نوع کالا را جستجو یا انتخاب کنید'}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bzw" style="animation:none">
  <div class="ef"><div class="fsearch sm">${ic('search')}<input id="siQ" value="${esc(si.q||'')}" placeholder="جستجوی کالا: انگشتر، النگو، سرویس…" autocomplete="off" enterkeyhint="done"></div><div class="kchs" id="siKs">${siChips()}</div></div>
  <div class="ef2"><div class="ef"><label for="siW">وزن <i>(گرم)</i></label><input id="siW" class="ltr" inputmode="decimal" value="${esc(si.w||'')}" placeholder="مثلاً 3.250" autocomplete="off"></div><div class="ef"><label for="siY">عیار</label><input id="siY" class="ltr" inputmode="numeric" value="${esc(si.ay||750)}" autocomplete="off"></div></div>
  <div class="gks ays">${[750,740,705,585,900].map(a=>`<button class="tch${+si.ay===a?' on':''}" data-act="siAy" data-a="${a}">${toFa(a)}</button>`).join('')}</div>
  <div class="ef2"><div class="ef"><label for="siJ">اجرت <span class="uns"><button class="${si.ajU==='p'?'on':''}" data-act="siAjU" data-u="p">٪</button><button class="${si.ajU!=='p'?'on':''}" data-act="siAjU" data-u="t">تومان</button></span></label><input id="siJ" class="ltr" inputmode="decimal" value="${si.aj?(si.ajU==='p'?si.aj:Number(si.aj).toLocaleString('en-US')):''}" placeholder="${si.ajU==='p'?'مثلاً 18':'کل اجرت'}" autocomplete="off"></div><div class="ef"><label for="siS">سود <i>(درصد)</i></label><input id="siS" class="ltr" inputmode="decimal" value="${esc(si.pp)}" autocomplete="off"></div></div>
  <div class="ef"><label>کم شود از موجودی</label><div class="gks">${GK.map(k=>`<button class="tch${(si.cat||'نو')===k?' on':''}" data-act="siCat" data-k="${esc(k)}">${esc(k)}${st[k]?' <i>'+wFmt(st[k])+'</i>':''}</button>`).join('')}</div></div>
  <div class="ef"><label for="siN">توضیح یا کد <i>(اختیاری)</i></label><input id="siN" value="${esc(si.n||'')}" placeholder="مثلاً نگین‌دار، کد ۱۲۴" autocomplete="off"></div>
  <div class="brk" id="siB"></div></div>
  <div class="row">${ed?`<button class="btn red sec" data-act="siDel">${ic('trash')} حذف</button>`:''}<button class="xgo" data-act="siSave">${ic('check')} ${ed?'ذخیره':'افزودن به فاکتور'}</button></div>`}
function siRead(){const g=id=>{const e=$(id);return e?e.value:undefined};if($('siW'))si.w=decIn(g('siW'));if($('siY'))si.ay=+toEn(g('siY')).replace(/\D/g,'')||750;if($('siJ'))si.aj=si.ajU==='p'?parseFloat(decIn(g('siJ')))||0:num(g('siJ'));if($('siS'))si.pp=parseFloat(decIn(g('siS')))||0;if($('siN'))si.n=clean(g('siN')||'');if($('siQ'))si.q=g('siQ')}
function siBind(){const B=$('siB'),upd=()=>{siRead();const c=itCalc(si,sv.rate,sv.tax);B.innerHTML=!sv.rate?'<div class="z">نرخ روز را بالای فاکتور بزنید تا مبلغ حساب شود</div>':!(+si.w)?'<div class="z">با وارد کردن وزن، مبلغ این قلم حساب می‌شود</div>':`<div><span>بهای طلا</span><b>${fmt(c.gold)}</b></div><div><span>اجرت</span><b>${fmt(c.aj)}</b></div><div><span>سود ${toFa(+si.pp||0)}٪</span><b>${fmt(c.pr)}</b></div>${sv.tax?`<div><span>مالیات ۱۰٪</span><b>${fmt(c.tax)}</b></div>`:''}<div class="t"><span>مبلغ این قلم</span><b>${fmt(c.tot)} تومان</b></div>`};
  const W=$('siW'),J=$('siJ'),S=$('siS'),Y=$('siY'),Q=$('siQ');
  W.oninput=()=>{W.value=decIn(W.value);upd()};S.oninput=()=>{S.value=decIn(S.value);upd()};Y.oninput=()=>{Y.value=toEn(Y.value).replace(/\D/g,'').slice(0,3);upd();document.querySelectorAll('.ays .tch').forEach(b=>b.classList.toggle('on',b.dataset.a===Y.value))};
  J.oninput=()=>{if(si.ajU==='p')J.value=decIn(J.value);else{const v=num(J.value);J.value=v?v.toLocaleString('en-US'):''}upd()};
  {const KS=$('siKs');KS.onpointerdown=e=>{if(e.target.closest('.kch'))e.preventDefault()}}
  Q.oninput=()=>{si.q=Q.value;$('siKs').innerHTML=siChips()};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const f=document.querySelector('#siKs .kch');if(f)ACT.siK({k:f.dataset.k})}};
  upd();setTimeout(()=>{const f=si.k?W:Q;if(f&&!f.value)f.focus()},320)}
const siOpen=()=>{sheet(siHTML());siBind()};
ACT.svItNew=()=>{const L=sv.items[sv.items.length-1];si={k:'',q:'',w:'',ay:750,ajU:L?L.ajU:ls.get('m_ajU','p'),aj:L?L.aj:0,pp:L?L.pp:PROFIT_DEF(),cat:'نو',n:''};siOpen()};
ACT.svItEdit=d=>{const it=sv.items[+d.i];if(!it)return;si={...it,i:+d.i,q:''};siOpen()};
ACT.siK=d=>{siRead();si.k=d.k;addGoods(d.k);si.q='';sheet(siHTML());siBind();const W=$('siW');if(W)setTimeout(()=>W.focus(),40)};
ACT.siAy=d=>{siRead();si.ay=+d.a;sheet(siHTML());siBind()};
ACT.siCat=d=>{siRead();si.cat=d.k;sheet(siHTML());siBind()};
ACT.siAjU=d=>{siRead();si.ajU=d.u;si.aj=0;ls.set('m_ajU',d.u);sheet(siHTML());siBind();const J=$('siJ');if(J)J.focus()};
ACT.siSave=()=>{siRead();if(!si.k){const q=clean(si.q||'');if(q){si.k=q;addGoods(q)}else{toast('نوع کالا را انتخاب کنید',true);$('siQ').focus();return}}const w=parseFloat(si.w)||0;if(!w){toast('وزن را وارد کنید',true);$('siW').focus();return}
  const it={k:si.k,w,ay:+si.ay||750,ajU:si.ajU,aj:+si.aj||0,pp:+si.pp||0,cat:si.cat||'نو',n:si.n||''};if(it.pp)ls.set('m_profit',it.pp);
  if(si.i!=null)sv.items[si.i]=it;else{sv.items.push(it);svAdd=sv.items.length-1}si=null;svKeep();closeSheet();svRe();toast(svAdd>=0?'«'+it.k+'» به فاکتور اضافه شد':'کالا ذخیره شد')};
ACT.siDel=()=>{if(si.i==null)return;const k=sv.items[si.i];sv.items.splice(si.i,1);si=null;svKeep();closeSheet();svRe();toast('«'+(k&&k.k)+'» از فاکتور حذف شد','', 'بازگردانی',()=>{if(k){sv.items.push(k);svKeep();svRe()}})};
/* ----- پنجره تسویه ----- */
function spHTML(){const M=PM[sp.m],T=svTot(),others=sv.pays.filter((p,i)=>i!==sp.i).reduce((s,p)=>s+(+p.amount||0),0),left=Math.max(0,T.total-others);let body='';
  if(sp.m==='pos'||sp.m==='hav'){const kind=sp.m==='pos'?'pos':'bank',L=CH(kind);
    body+=`<div class="ef"><label>${sp.m==='pos'?'کدام کارتخوان':'واریز به کدام حساب ما'}</label><div class="chps">${L.map(c=>`<button class="chp${String(sp.chId)===String(c.id)?' on':''}" data-act="spCh" data-id="${c.id}">${ic(kind==='pos'?'card':'bank')}<span><b>${esc(c.name)}</b><small>مانده ${fmt(chBal(c))}</small></span></button>`).join('')}</div>
    <div class="fsearch sm chadd">${ic('plus')}<input id="spCn" placeholder="${kind==='pos'?'کارتخوان جدید، مثلاً پوز ملت':'حساب جدید، مثلاً حساب شخصی سامان'}" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="spChAdd">افزودن</button></div></div>`}
  if(sp.m==='gold')body+=`<div class="ef2"><div class="ef"><label for="spW">وزن <i>(گرم)</i></label><input id="spW" class="ltr" inputmode="decimal" value="${esc(sp.w||'')}" autocomplete="off"></div><div class="ef"><label for="spY">عیار</label><input id="spY" class="ltr" inputmode="numeric" value="${esc(sp.ay||750)}" autocomplete="off"></div></div>
    <div class="ef"><label for="spG">نرخ خرید هر گرم <i>(۱۸ عیار)</i></label><input id="spG" class="ltr" inputmode="numeric" value="${sp.gr?Number(sp.gr).toLocaleString('en-US'):''}" autocomplete="off"></div>
    <div class="ef"><label>اضافه شود به موجودی</label><div class="gks">${GK.map(k=>`<button class="tch${(sp.cat||'کارکرده')===k?' on':''}" data-act="spCat" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>`;
  if(sp.m==='cust'){const C=sp.cuId&&CU().find(c=>String(c.id)===String(sp.cuId));
    body+=C?`<div class="svcu sm"><span class="bri">${esc(userInit(C.name))}</span><span class="tx"><b>${esc(cuName(C))}</b><small>مانده ریالی: ${balLab(cuBal(C).R)} ${fmt(Math.abs(cuBal(C).R))} تومان</small></span><button class="lnk" data-act="spCu" data-id="">تغییر</button></div>`
      :`<div class="ef"><div class="fsearch sm">${ic('search')}<input id="spQ" value="${esc(sp.q||'')}" placeholder="مشتری‌ای که طلب دارد…" autocomplete="off"></div><div id="spCr">${spCrHTML()}</div></div>`}
  body+=`<div class="ef"><label for="spA">${sp.m==='gold'?'ارزش طلا':'مبلغ'} <i>(تومان)</i></label><input id="spA" class="ltr acbig" inputmode="numeric" value="${sp.amount?Number(sp.amount).toLocaleString('en-US'):''}" autocomplete="off"${sp.m==='gold'?' readonly':''}><small class="eh" id="spAv">${left?'مانده فاکتور: '+fmt(left)+' تومان <button class="lnk" data-act="spAll">کل مانده</button>':''}</small></div>`;
  if(sp.m==='pos'||sp.m==='hav')body+=`<div class="ef"><label for="spT">شماره پیگیری <i>(اختیاری)</i></label><input id="spT" class="ltr" inputmode="numeric" value="${esc(sp.tn||'')}" autocomplete="off"></div>`;
  return `<div class="sh-h"><div><b>${M.t}</b><small class="shsub">${M.d}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="bzw" style="animation:none">${body}</div>
  <button class="xgo" data-act="spSave">${ic('check')} ${sp.i!=null?'ذخیره':'افزودن به تسویه'}</button>`}
function spCrHTML(){const q=nzName(toEn(clean(sp.q||'')));let L=CU().filter(c=>String(c.id)!==String(sv.cuId)).map(c=>[c,cuBal(c)]);if(q)L=L.filter(([c])=>nzName([c.name,c.phone,c.grp].join(' ')).includes(q));else L=L.filter(([,b])=>b.R>0);
  L=L.sort((a,b)=>b[1].R-a[1].R).slice(0,6);if(!L.length)return `<div class="eh">${q?'مشتری‌ای پیدا نشد':'هیچ مشتری‌ای از ما طلب ریالی ندارد؛ نام را جستجو کنید'}</div>`;
  return `<div class="fcard blist">${L.map(([c,b])=>`<button class="curow" data-act="spCu" data-id="${c.id}"><span class="bri">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${b.R>0?'طلب دارد':'طلب ندارد'}</small></span><span class="cuv">${balTag(b.R)}</span></button>`).join('')}</div>`}
function spRead(){const g=id=>{const e=$(id);return e?e.value:undefined};if($('spA')&&sp.m!=='gold')sp.amount=num(g('spA'));if($('spT'))sp.tn=toEn(g('spT')||'').trim();if($('spW'))sp.w=decIn(g('spW'));if($('spY'))sp.ay=+toEn(g('spY')).replace(/\D/g,'')||750;if($('spG'))sp.gr=num(g('spG'));if($('spQ'))sp.q=g('spQ')}
function spGoldCalc(){sp.amount=Math.round((parseFloat(sp.w)||0)*(+sp.gr||0)*(+sp.ay||750)/750)}
function spBind(){const A=$('spA'),W=$('spW'),G=$('spG'),Y=$('spY'),Q=$('spQ'),CN=$('spCn');
  const gold=()=>{spRead();spGoldCalc();A.value=sp.amount?sp.amount.toLocaleString('en-US'):''};
  if(A&&sp.m!=='gold')A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};
  if(W)W.oninput=()=>{W.value=decIn(W.value);gold()};if(Y)Y.oninput=()=>{Y.value=toEn(Y.value).replace(/\D/g,'').slice(0,3);gold()};if(G)G.oninput=()=>{const v=num(G.value);G.value=v?v.toLocaleString('en-US'):'';gold()};
  if(Q)Q.oninput=()=>{sp.q=Q.value;$('spCr').innerHTML=spCrHTML()};
  if(CN)CN.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.spChAdd()}};
  setTimeout(()=>{const f=W&&!W.value?W:Q||(A&&!A.readOnly&&!A.value?A:null);if(f)f.focus()},320)}
const spRe=()=>{sheet(spHTML());spBind()};
ACT.svPay=d=>{if(!sv.items.length){toast('اول کالا را به فاکتور اضافه کنید',true);return}if(d.m==='cust'&&!svCu()){toast('اول مشتری فاکتور را انتخاب کنید',true);return}
  const T=svTot(),left=Math.max(0,T.rest);sp={m:d.m,amount:d.m==='gold'?0:left,ay:750,gr:sv.rate,cat:'کارکرده',q:''};
  if(d.m==='pos'||d.m==='hav'){const L=CH(d.m==='pos'?'pos':'bank'),last=ls.get('m_ch_'+d.m,'');sp.chId=(L.find(c=>String(c.id)===String(last))||L[0]||{}).id||''}spRe()};
ACT.svPayEdit=d=>{const p=sv.pays[+d.i];if(!p)return;sp={...p,i:+d.i,q:''};spRe()};
ACT.svPayDel=d=>{const p=sv.pays.splice(+d.i,1)[0];svKeep();svRe();toast('پرداخت حذف شد','', 'بازگردانی',()=>{if(p){sv.pays.push(p);svKeep();svRe()}})};
ACT.spCh=d=>{spRead();sp.chId=d.id;spRe()};
ACT.spChAdd=()=>{spRead();const n=$('spCn'),name=clean((n&&n.value)||'');if(!name){toast('نام '+(sp.m==='pos'?'کارتخوان':'حساب')+' را بنویسید',true);if(n)n.focus();return}const r=chNew(name,sp.m==='pos'?'pos':'bank');if(r){sp.chId=r.id;spRe();toast('«'+name+'» اضافه شد')}};
ACT.spCat=d=>{spRead();sp.cat=d.k;spRe()};
ACT.spCu=d=>{spRead();sp.cuId=d.id;if(d.id){const c=CU().find(z=>String(z.id)===String(d.id)),T=svTot(),others=sv.pays.filter((p,i)=>i!==sp.i).reduce((s,p)=>s+(+p.amount||0),0),left=Math.max(0,T.total-others),cr=c?Math.max(0,cuBal(c).R):0;sp.cuName=c?cuName(c):'';sp.amount=cr?Math.min(left,cr):left}else{sp.q=''}spRe()};
ACT.spAll=()=>{spRead();const T=svTot(),others=sv.pays.filter((p,i)=>i!==sp.i).reduce((s,p)=>s+(+p.amount||0),0);sp.amount=Math.max(0,T.total-others);if(sp.m==='gold'){const r=(+sp.gr||0)*(+sp.ay||750)/750;if(r)sp.w=String(Math.round(sp.amount/r*1000)/1000)}spRe()};
ACT.spSave=()=>{spRead();if(sp.m==='gold'){spGoldCalc();if(!(parseFloat(sp.w)>0)){toast('وزن طلای مشتری را وارد کنید',true);$('spW').focus();return}if(!sp.gr){toast('نرخ خرید را وارد کنید',true);$('spG').focus();return}}
  if((sp.m==='pos'||sp.m==='hav')&&!sp.chId){toast(sp.m==='pos'?'کارتخوان را انتخاب یا اضافه کنید':'حساب مقصد را انتخاب یا اضافه کنید',true);return}
  if(sp.m==='cust'&&!sp.cuId){toast('مشتری پرداخت‌کننده را انتخاب کنید',true);return}
  if(!(+sp.amount>0)){toast('مبلغ را وارد کنید',true);return}
  const p={m:sp.m,amount:+sp.amount};if(sp.chId&&(sp.m==='pos'||sp.m==='hav')){p.chId=sp.chId;p.tn=sp.tn||'';ls.set('m_ch_'+sp.m,sp.chId)}if(sp.m==='gold')Object.assign(p,{w:parseFloat(sp.w),ay:+sp.ay||750,gr:+sp.gr,cat:sp.cat||'کارکرده'});if(sp.m==='cust')Object.assign(p,{cuId:sp.cuId,cuName:sp.cuName||''});
  if(sp.i!=null)sv.pays[sp.i]=p;else sv.pays.push(p);sp=null;svKeep();closeSheet();svRe()};
/* ----- ثبت فاکتور ----- */
ACT.svSave=()=>{const c=svCu();if(!c){toast('مشتری فاکتور را انتخاب کنید',true);const q=$('svQ');if(q){q.focus();q.closest('.svpick').scrollIntoView({behavior:'smooth',block:'center'})}return}
  if(!sv.items.length){toast('حداقل یک کالا اضافه کنید',true);return}if(!sv.rate){toast('نرخ روز هر گرم را بزنید',true);$('svR').focus();return}
  for(const p of sv.pays)if(p.m==='cust'&&!CU().some(z=>String(z.id)===String(p.cuId))){toast('حساب پرداخت‌کننده «'+(p.cuName||'')+'» پیدا نشد',true);return}
  const T=svTot(),now=ns(),no=invNext(),items=sv.items.map(it=>({...it,...(c2=>({gold:c2.gold,ajv:c2.aj,prv:c2.pr,taxv:c2.tax,tot:c2.tot}))(itCalc(it,sv.rate,sv.tax))}));
  const t={id:nid++,type:'inv',no,date:sv.date,rate:sv.rate,items,tax:!!sv.tax,disc:T.disc,sub:T.sub,total:T.total,pays:sv.pays.map(p=>({...p})),at:now,by:who()};
  if(sv.gconv&&T.rest>0)t.gc={r:T.rest,g:Math.round(T.rest/sv.rate*1000)/1000};
  for(const p of t.pays){if(p.m!=='cust')continue;const Y=custs.find(z=>String(z.id)===String(p.cuId)),x={id:nid++,type:'xf',r:-p.amount,g:0,note:'پرداخت فاکتور '+toFa(no)+' «'+cuName(c)+'»',inv:{cu:c.id,tx:t.id},date:sv.date,at:now,by:who()};(Y.txs=Y.txs||[]).push(x);Y.lastAt=now;p.xfId=x.id}
  (c.txs=c.txs||[]).push(t);c.lastAt=now;saveCu();
  logA('cust','فاکتور فروش '+no,cuName(c)+' | '+items.map(i=>i.k+' '+wFmt(i.w)+' گرم').join('، ')+' | جمع '+fmt(T.total)+' تومان'+(T.paid?' | پرداخت '+fmt(T.paid):''));
  sv=null;ls.set('m_svd',null);invOpen(c.id,t.id,1)};
/* ================= نمایش فاکتور ================= */
let invV=null;
function invOpen(cu,tx,fresh){invV={cu,tx,fresh:!!fresh};custId=cu;closeSheet();go('inv')}
const invGet=()=>{if(!invV)return null;const c=custs.find(z=>String(z.id)===String(invV.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(invV.tx));return t&&!t.del?{c,t}:null};
function vInv(){const X=invGet();if(!X){setTimeout(()=>{if(cur==='inv')go('custs',true)},0);return ''}const {c,t}=X,paid=(t.pays||[]).reduce((s,p)=>s+(+p.amount||0),0),rest=t.total-paid,b=cuBal(c),D=dates(t.date),fresh=invV.fresh;invV.fresh=false;
  const row=(l,v,k)=>`<div${k?' class="'+k+'"':''}><span>${l}</span><b>${v}</b></div>`,S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0);
  return `${fresh?`<div class="bzok ivok">${ic('check')}<span>فاکتور ${toFa(t.no)} ثبت شد و به حساب «${esc(cuName(c))}» رفت</span></div>`:''}
  <article class="ivpaper ivfull${fresh?' reveal':''}"><div class="ivh"><span class="ivmk">م</span><span class="ivbr"><b>طلا و جواهر مطلا</b><small>فاکتور فروش</small></span><span class="ivno"><small>شماره</small><b>${toFa(t.no)}</b></span></div>
  <div class="ivmeta2"><div><small>خریدار</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<bdi dir="ltr">${esc(c.phone)}</bdi>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div><div><small>نرخ روز هر گرم</small><b>${fmt(t.rate)}</b><span>تومان · ۱۸ عیار</span></div></div>
  <div class="ivits">${(t.items||[]).map((it,i)=>`<div class="ivit"><span class="ivn">${toFa(i+1)}</span><div class="ivd"><b>${esc(it.k)}${it.n?' <i>'+esc(it.n)+'</i>':''}</b><small>${wFmt(it.w)} گرم · عیار ${toFa(it.ay||750)} · اجرت ${it.ajU==='p'?toFa(it.aj)+'٪':fmt(it.aj)} · سود ${toFa(it.pp)}٪</small><div class="ivbk"><span>طلا ${fmt(it.gold)}</span><span>اجرت ${fmt(it.ajv)}</span><span>سود ${fmt(it.prv)}</span>${it.taxv?`<span>مالیات ${fmt(it.taxv)}</span>`:''}</div></div><b class="iva">${fmt(it.tot)}</b></div>`).join('')}</div>
  <div class="ivtt">${row('جمع وزن',wFmt(S('w'))+' گرم')}${row('بهای طلا',fmt(S('gold')))}${row('اجرت ساخت',fmt(S('ajv')))}${row('سود فروشنده',fmt(S('prv')))}${t.tax?row('مالیات ۱۰٪',fmt(S('taxv'))):''}${t.disc?row('تخفیف','− '+fmt(t.disc)):''}<div class="ivgt"><span>جمع فاکتور</span><b>${fmt(t.total)} <i>تومان</i></b></div></div>
  ${(t.pays||[]).length?`<div class="ivpy"><small>تسویه</small>${t.pays.map(p=>{const ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId));return row(PM[p.m].t+(ch?' · '+esc(ch.name):'')+(p.m==='gold'?' · '+wFmt(p.w)+' گرم':'')+(p.m==='cust'?' · از طلب '+esc(p.cuName||''):'')+(p.tn?' · پیگیری '+esc(p.tn):''),fmt(p.amount))}).join('')}</div>`:''}
  <div class="ivrs ${rest>0?'due':rest<0?'over':'ok'}"><span>${rest>0?(t.gc?'مانده طلایی به حساب مشتری':'مانده به حساب مشتری'):rest<0?'اضافه پرداخت (طلب مشتری)':'تسویه کامل'}</span><b>${rest?(t.gc?wFmt(t.gc.g)+' گرم':fmt(Math.abs(rest))+' تومان'):ic('check')}</b></div>
  <div class="ivft"><span>ته حساب فعلی مشتری: ${balLab(b.R)} ${b.R?fmt(Math.abs(b.R))+' تومان':''}${b.G?' · '+balLab(b.G)+' '+wFmt(Math.abs(b.G))+' گرم':''}</span><span>صادرکننده: ${esc(t.by||'')}</span></div></article>
  <div class="ivacts"><button class="cuqb" data-act="invPrint">${ic('print')}<span><b>چاپ یا PDF</b><small>فاکتور A5 برای مشتری</small></span></button><button class="cuqb" data-act="cuOpen" data-id="${c.id}">${ic('user')}<span><b>حساب مشتری</b><small>گردش و مانده‌ها</small></span></button></div>
  <button class="addit" data-act="svNew" data-cu="${c.id}">${ic('plus')} فاکتور بعدی برای همین مشتری</button>
  ${can('del')||isAdmin()?`<button class="edel" data-act="invDel">${ic('trash')} حذف این فاکتور</button>`:''}`}
const aInv=()=>`<button class="btn gold bzgo" data-act="invPrint">${ic('print')} چاپ / PDF فاکتور</button>`;
ACT.invDel=()=>{const X=invGet();if(!X)return;askConfirm('فاکتور '+toFa(X.t.no)+' حذف شود؟ اثرش از حساب مشتری'+(txLinked(X.c,X.t).length?' و مشتری پرداخت‌کننده':'')+' برداشته می‌شود.','حذف',()=>{custId=X.c.id;cur='cust';ACT.txDel({id:X.t.id});go('cust',true)})};
function invDoc(c,t){const D=dates(t.date),paid=(t.pays||[]).reduce((s,p)=>s+(+p.amount||0),0),rest=t.total-paid,S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0);
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>فاکتور ${toFa(t.no)}</title>${PDF_FONT}<style>@page{size:A5;margin:9mm}*{box-sizing:border-box}body{font-family:Vazirmatn,Tahoma,sans-serif;color:#16213a;font-size:9pt;line-height:1.6;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .hd{background:#13284f;color:#fff;border-radius:12px 12px 4px 4px;padding:12px 14px;display:flex;align-items:center;gap:10px;position:relative;overflow:hidden}.hd:after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:linear-gradient(90deg,#ecc874,#b8862b,#ecc874)}
  .mk{width:34px;height:34px;border-radius:10px 10px 10px 3px;background:linear-gradient(135deg,#ecc874,#c99a3a);color:#13284f;font-weight:900;font-size:17pt;display:flex;align-items:center;justify-content:center;line-height:1}
  .br{flex:1}.br b{display:block;font-size:12pt;font-weight:800}.br small{color:#ecd9a6;font-size:8pt}.no{text-align:left}.no small{display:block;color:#ecd9a6;font-size:7pt}.no b{font-size:14pt;color:#ecc874}
  .mt{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:6px;margin:10px 0}.mt div{border:1px solid #e7e9ef;border-radius:8px;padding:5px 8px}.mt small{display:block;color:#8a91a1;font-size:7pt}.mt b{font-size:9.5pt}.mt span{display:block;font-size:7.4pt;color:#7a8294}
  table{width:100%;border-collapse:collapse;font-feature-settings:"tnum"}th{background:#fbf6e8;color:#7a5a17;font-size:7.6pt;font-weight:700;padding:5px 4px;border-bottom:1.5px solid #ecd9a6;text-align:right}td{padding:6px 4px;border-bottom:1px solid #eef0f4;font-size:8.6pt;vertical-align:top}td.n{text-align:left;white-space:nowrap}td small{display:block;color:#8a91a1;font-size:7pt}
  .tt{margin-top:8px;margin-right:auto;width:62%}.tt div{display:flex;justify-content:space-between;padding:2px 0;font-size:8.6pt}.tt .g{border-top:1.5px solid #13284f;margin-top:4px;padding-top:6px;font-size:11pt;font-weight:800}.tt .g b{color:#13284f}
  .py{margin-top:8px;border:1px solid #e7e9ef;border-radius:8px;padding:6px 9px}.py>small{color:#8a91a1;font-size:7.2pt}.py div{display:flex;justify-content:space-between;font-size:8.4pt}
  .rs{margin-top:8px;border-radius:8px;padding:7px 10px;display:flex;justify-content:space-between;font-weight:800;background:#fbf6e8;border:1px solid #ecd9a6}.rs.ok{background:#e9f6ef;border-color:#bfe3cd;color:#15803d}
  .sg{display:flex;justify-content:space-between;margin-top:22px;font-size:7.6pt;color:#7a8294}.sg span{border-top:1px dashed #c9ced8;padding-top:4px;min-width:34%;text-align:center}.ft{margin-top:10px;text-align:center;font-size:7pt;color:#9097a5}</style></head><body>
  <div class="hd"><span class="mk">م</span><span class="br"><b>طلا و جواهر مطلا</b><small>فاکتور فروش</small></span><span class="no"><small>شماره فاکتور</small><b>${toFa(t.no)}</b></span></div>
  <div class="mt"><div><small>خریدار</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<span dir="ltr" style="text-align:right">${esc(c.phone)}</span>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div><div><small>نرخ هر گرم ۱۸ عیار</small><b>${fmt(t.rate)}</b><span>تومان</span></div></div>
  <table><thead><tr><th>#</th><th>شرح کالا</th><th>وزن</th><th>عیار</th><th>اجرت</th><th>سود</th><th style="text-align:left">مبلغ (تومان)</th></tr></thead><tbody>${(t.items||[]).map((it,i)=>`<tr><td>${toFa(i+1)}</td><td><b>${esc(it.k)}</b>${it.n?'<small>'+esc(it.n)+'</small>':''}</td><td>${wFmt(it.w)}</td><td>${toFa(it.ay||750)}</td><td>${fmt(it.ajv)}${it.ajU==='p'?'<small>'+toFa(it.aj)+'٪</small>':''}</td><td>${fmt(it.prv)}<small>${toFa(it.pp)}٪</small></td><td class="n"><b>${fmt(it.tot)}</b></td></tr>`).join('')}</tbody></table>
  <div class="tt"><div><span>جمع وزن</span><b>${wFmt(S('w'))} گرم</b></div><div><span>بهای طلا</span><b>${fmt(S('gold'))}</b></div><div><span>اجرت ساخت</span><b>${fmt(S('ajv'))}</b></div><div><span>سود فروشنده</span><b>${fmt(S('prv'))}</b></div>${t.tax?`<div><span>مالیات بر ارزش افزوده</span><b>${fmt(S('taxv'))}</b></div>`:''}${t.disc?`<div><span>تخفیف</span><b>− ${fmt(t.disc)}</b></div>`:''}<div class="g"><span>جمع فاکتور</span><b>${fmt(t.total)} تومان</b></div></div>
  ${(t.pays||[]).length?`<div class="py"><small>تسویه</small>${t.pays.map(p=>{const ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId));return `<div><span>${PM[p.m].t}${ch?' · '+esc(ch.name):''}${p.m==='gold'?' · '+wFmt(p.w)+' گرم عیار '+toFa(p.ay):''}${p.tn?' · پیگیری '+esc(p.tn):''}</span><b>${fmt(p.amount)}</b></div>`}).join('')}</div>`:''}
  <div class="rs${rest?'':' ok'}"><span>${rest>0?'مانده بدهی خریدار':rest<0?'اضافه پرداخت':'تسویه کامل'}</span><b>${rest?(t.gc?wFmt(t.gc.g)+' گرم طلا':fmt(Math.abs(rest))+' تومان'):'✓'}</b></div>
  <div class="sg"><span>امضای خریدار</span><span>مهر و امضای فروشنده</span></div><div class="ft">صادرکننده: ${esc(t.by||'')} · مطلا</div></body></html>`}
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

/* ================= کارتخوان‌ها و حساب‌های ما ================= */
function chAllHTML(){const P=CH('pos'),B=CH('bank'),card=c=>{const v=chBal(c);return `<button class="chrow" data-act="chOpen" data-id="${c.id}"><span class="bri ${c.kind}">${ic(c.kind==='pos'?'card':'bank')}</span><span class="tx"><b>${esc(c.name)}</b><small>${CHK[c.kind]}</small></span><span class="txv"><b>${fmt(v)}</b><small>تومان</small></span></button>`};
  return `<div class="sh-h"><div><b>کارتخوان و حساب‌ها</b><small class="shsub">مانده هر کدام از تسویه فاکتورها؛ با یک حواله به حساب دیگر منتقل کنید</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="spsec"><b>کارتخوان‌ها</b></div>${P.length?`<div class="fcard blist">${P.map(card).join('')}</div>`:'<div class="eh">هنوز کارتخوانی تعریف نشده</div>'}
  <div class="spsec"><b>حساب‌های بانکی ما</b></div>${B.length?`<div class="fcard blist">${B.map(card).join('')}</div>`:'<div class="eh">هنوز حسابی تعریف نشده؛ مثلاً حساب شخصی</div>'}
  <div class="fsearch sm chadd" style="margin-top:14px">${ic('plus')}<input id="chN" placeholder="نام کارتخوان یا حساب جدید" autocomplete="off"></div><div class="row"><button class="btn sec" data-act="chAdd" data-k="pos">${ic('card')} کارتخوان</button><button class="btn sec" data-act="chAdd" data-k="bank">${ic('bank')} حساب بانکی</button></div>`}
ACT.chOpenAll=()=>{sheet(chAllHTML())};
ACT.chAdd=d=>{const n=$('chN'),name=clean((n&&n.value)||'');if(!name){toast('نام را بنویسید',true);if(n)n.focus();return}if(CH().some(c=>c.name===name)){toast('این نام قبلاً تعریف شده',true);return}chNew(name,d.k);sheet(chAllHTML());toast(CHK[d.k]+' «'+name+'» اضافه شد');if(cur==='custs'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}};
let chId=null,mv=null;
ACT.chOpen=d=>{chId=d.id;const c=custs.find(z=>String(z.id)===String(d.id));if(!c)return;const M=chMoves(c),bal=M.reduce((s,m)=>s+m.a,0);
  sheet(`<div class="sh-h"><div><b>${esc(c.name)}</b><small class="shsub">${CHK[c.kind]} · مانده ${fmt(bal)} تومان</small></div><button class="x" data-act="chOpenAll" aria-label="بازگشت">×</button></div>
  <div class="chhero ${c.kind}"><small>مانده</small><b>${fmt(bal)} <i>تومان</i></b><span>${toFa(M.length)} گردش</span></div>
  ${bal>0?`<button class="xgo" data-act="mvNew">${ic('swap')} انتقال مانده با یک حواله</button>`:''}
  <div class="spsec"><b>گردش</b></div>${M.length?`<div class="fcard blist">${M.map(m=>`<div class="chmv"><span class="tx"><b>${esc(m.t)}</b><small>${esc(dates(m.d).fa)}${m.sub?' · '+esc(m.sub):''}</small></span><b class="${m.a>0?'pc':'nc'}">${m.a>0?'+':'−'} ${fmt(Math.abs(m.a))}</b></div>`).join('')}</div>`:'<div class="eh">هنوز گردشی ندارد</div>'}
  ${!M.length&&(can('del')||isAdmin())?`<button class="edel" data-act="chDel">${ic('trash')} حذف این ${CHK[c.kind]}</button>`:''}`)};
ACT.chDel=()=>{const c=custs.find(z=>String(z.id)===String(chId));if(!c)return;c.del=true;c.delAt=ns();saveCu();logA('cust','حذف '+CHK[c.kind],c.name);sheet(chAllHTML())};
function mvHTML(){const c=custs.find(z=>String(z.id)===String(chId)),bal=chBal(c),L=CH().filter(z=>z!==c);
  return `<div class="sh-h"><div><b>انتقال با یک حواله</b><small class="shsub">از «${esc(c.name)}» · مانده ${fmt(bal)} تومان</small></div><button class="x" data-act="chOpen" data-id="${c.id}" aria-label="بازگشت">×</button></div><div class="bzw" style="animation:none">
  <div class="ef"><label>به حساب</label><div class="chps">${L.map(z=>`<button class="chp${String(mv.to)===String(z.id)?' on':''}" data-act="mvTo" data-id="${z.id}">${ic(z.kind==='pos'?'card':'bank')}<span><b>${esc(z.name)}</b><small>${CHK[z.kind]}</small></span></button>`).join('')}</div>
  <div class="fsearch sm chadd">${ic('plus')}<input id="mvCn" placeholder="حساب جدید، مثلاً حساب شخصی" autocomplete="off"><button class="lnk" data-act="mvAdd">افزودن</button></div></div>
  <div class="ef"><label for="mvA">مبلغ <i>(تومان)</i></label><input id="mvA" class="ltr acbig" inputmode="numeric" value="${mv.a?Number(mv.a).toLocaleString('en-US'):''}" autocomplete="off"><small class="eh">کل مانده: ${fmt(bal)} تومان</small></div>
  <div class="ef"><label for="mvT">شماره پیگیری حواله <i>(اختیاری)</i></label><input id="mvT" class="ltr" inputmode="numeric" value="${esc(mv.tn||'')}" autocomplete="off"></div></div>
  <button class="xgo" data-act="mvSave">${ic('check')} ثبت حواله</button>`}
function mvRead(){const A=$('mvA'),T=$('mvT');if(A)mv.a=num(A.value);if(T)mv.tn=toEn(T.value||'').trim()}
const mvRe=()=>{sheet(mvHTML());const A=$('mvA');if(A)A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''}};
ACT.mvNew=()=>{const c=custs.find(z=>String(z.id)===String(chId));if(!c)return;const B=CH('bank').filter(z=>z!==c);mv={a:chBal(c),to:(B[0]||{}).id||'',tn:''};mvRe()};
ACT.mvTo=d=>{mvRead();mv.to=d.id;mvRe()};
ACT.mvAdd=()=>{mvRead();const n=$('mvCn'),name=clean((n&&n.value)||'');if(!name){toast('نام حساب را بنویسید',true);return}const r=chNew(name,'bank');if(r){mv.to=r.id;mvRe()}};
ACT.mvSave=()=>{mvRead();const c=custs.find(z=>String(z.id)===String(chId)),to=custs.find(z=>String(z.id)===String(mv.to)&&z.sys==='ch'&&!z.del);if(!to){toast('حساب مقصد را انتخاب کنید',true);return}if(!(mv.a>0)){toast('مبلغ را وارد کنید',true);return}
  const now=ns(),A={id:nid++,type:'tout',amount:mv.a,peer:to.id,tn:mv.tn,date:todayISO(),at:now,by:who()},B={id:nid++,type:'tin',amount:mv.a,peer:c.id,tn:mv.tn,date:todayISO(),at:now,by:who()};
  (c.txs=c.txs||[]).push(A);(to.txs=to.txs||[]).push(B);saveCu();logA('cust','حواله از '+c.name+' به '+to.name,fmt(mv.a)+' تومان'+(mv.tn?' | پیگیری '+mv.tn:''));mv=null;ACT.chOpen({id:c.id});toast(fmt(A.amount)+' تومان به «'+to.name+'» منتقل شد');if(cur==='custs'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}};
