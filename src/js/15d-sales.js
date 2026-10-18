/* ===== فاکتور فروش، کارتخوان‌ها و حساب‌ها، انتقال مانده بین مشتری‌ها (الگو: نرم‌افزار طلافروشی) =====
   همه داده‌ها داخل همان مجموعه custs ذخیره و همگام می‌شوند:
   - فاکتور = تراکنش type:'inv' در حساب مشتری (items، pays، total، gc = تبدیل مانده به طلایی)
   - انتقال مانده / تبدیل طلایی‌ریالی = تراکنش type:'xf' / 'cv' با r و g علامت‌دار (مثبت = بدهی ما)
   - کارتخوان و حساب بانکی خودمان = رکورد {sys:'ch', kind:'pos'|'bank'}؛ مانده = جمع تسویه‌های فاکتورها + حواله‌های ورودی − خروجی
   - گروه‌ها و فهرست کالاها = رکورد {sys:'cfg'} */
Object.assign(IC,{tag:'<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',inv:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',card:'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',coin:'<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',cash:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',ring:'<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-1.5 3.6h-3z"/>'});
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
function chMoves(ch){const L=[];for(const c of custs){if(c.del||c.sys)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;(t.pays||[]).forEach(p=>{if(String(p.chId)===String(ch.id))L.push({d:t.date,at:t.at,a:+p.amount||0,t:'فاکتور '+toFa(t.no)+' · '+cuName(c),sub:(p.m==='pos'?'کارتخوان':+p.amount<0?'پرداخت حواله':'دریافت حواله')+(p.tn?' · پیگیری '+p.tn:''),cu:c.id,tx:t.id})})}}
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
  let T,sub,ico;if(t.type==='inv'){const paid=(t.pays||[]).reduce((s,p)=>s+pAmt(p),0);T='فاکتور فروش '+toFa(t.no);ico='inv';sub=[(t.items||[]).map(i=>i.k).join('، '),wFmt((t.items||[]).reduce((s,i)=>s+(+i.w||0),0))+' گرم','جمع '+fmt(t.total),paid?'پرداخت '+fmt(paid):''].filter(Boolean).join(' · ')}
  else if(t.type==='xf'){T=t.inv?'پرداخت فاکتور مشتری دیگر':'انتقال مانده';ico='swap';sub=t.note||''}else{T='تبدیل '+(t.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی');ico='coin';sub=t.note||''}
  const vals=(d.r?v(d.r):'')+(d.g?v(d.g,1):'')||'<b>تسویه</b>';
  return swW(`<button class="txr" data-act="txOpen" data-id="${t.id}"><span class="bri t-${t.type}">${ic(ico)}</span><span class="tx"><b>${esc(T)}</b><small>${esc(sub)}</small></span><span class="txv txv2">${vals}</span></button>`,{r:[['txOpen','جزئیات','eye','#3b6fd6']],l:can('del')||isAdmin()?[['txDel','حذف','trash','#d23c48']]:[],data:{id:t.id}})}
function xfShow(c,t){const d=txD(t),kv=(l,v)=>v?`<div class="kv"><small>${l}</small><b>${v}</b><span class="kvx"></span></div>`:'';const L=txLinked(c,t);
  sheet(`<div class="sh-h"><div><b>${t.type==='cv'?'تبدیل طلایی / ریالی':'انتقال مانده'}</b><small class="shsub">${esc(cuName(c))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="kvs" style="border:0;padding:0">${kv('اثر ریالی',d.r?fmt(Math.abs(d.r))+' تومان ('+(d.r>0?'بدهی ما':'طلب ما')+')':'')}${kv('اثر طلایی',d.g?wFmt(Math.abs(d.g))+' گرم ('+(d.g>0?'بدهی طلایی ما':'طلب طلایی ما')+')':'')}${kv('نرخ',t.rate?fmt(t.rate)+' تومان هر گرم':'')}${kv('طرف دیگر',L.map(x=>esc(cuName(x.c))).join('، '))}${kv('شرح',esc(t.note||''))}${kv('تاریخ',esc(dates(t.date).wd+' '+dates(t.date).fa))}${kv('ثبت‌کننده',esc(t.by||''))}</div>
  ${can('del')||isAdmin()?`<button class="edel" data-act="txDel" data-id="${t.id}">${ic('trash')} حذف${L.length?' (ردیف طرف مقابل هم حذف می‌شود)':''}</button>`:''}`)}

/* ================= فاکتور فروش ================= */
let sv=null,svAdd=-1,si=null;
const PM={cash:{t:'نقد',i:'cash',d:'پول نقد در صندوق'},pos:{t:'کارتخوان',i:'card',d:'کشیدن کارت روی کارتخوان مغازه'},hav:{t:'حواله',i:'bank',d:'کارت‌به‌کارت یا حواله به حساب ما'},gold:{t:'طلای مشتری',i:'coin',d:'طلای کهنه مشتری به‌جای پول'},cust:{t:'از حساب مشتری دیگر',i:'swap',d:'از طلب مشتری دیگر کم شود'}};
function invNext(){let m=1000;for(const c of custs)for(const t of c.txs||[])if(t.type==='inv'&&+t.no>m)m=+t.no;return m+1}
const svKeep=()=>ls.set('m_svd',sv);
function svBlank(cu){return{v:1,cuId:cu||'',date:todayISO(),rate:+ls.get('m_rate',0)||0,items:[],tax:!!ls.get('m_tax',false),disc:0,pays:[],gconv:false,q:'',g:''}}
ACT.svNew=d=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}closeSheet();const cu=d&&d.cu?d.cu:'',old=ls.get('m_svd',null);
  if(old&&old.v===1&&(old.items.length||old.pays.length)&&(!cu||String(old.cuId||'')===String(cu)||!old.cuId)){sv=old;if(cu)sv.cuId=cu;toast('پیش‌نویس فاکتور قبلی باز شد','', 'فاکتور تازه',()=>{sv=svBlank(cu);svKeep();render()})}else sv=svBlank(cu);
  PARENT.sell=cur==='cust'?'cust':'custs';svKeep();go('sell')};
function itCalc(it,rate,tax){const w=+it.w||0,ay=+it.ay||750,gold=Math.round(w*(+rate||0)*ay/750),aj=it.ajU==='p'?Math.round(gold*(+it.aj||0)/100):Math.round(+it.aj||0),pr=Math.round((gold+aj)*(+it.pp||0)/100),tx=tax?Math.round((aj+pr)*0.10):0;return{gold,aj,pr,tax:tx,tot:gold+aj+pr+tx}}
function svTot(){let gold=0,aj=0,pr=0,tax=0,w=0;for(const it of sv.items){const c=itCalc(it,sv.rate,sv.tax);gold+=c.gold;aj+=c.aj;pr+=c.pr;tax+=c.tax;w+=+it.w||0}
  const sub=gold+aj+pr+tax,disc=Math.min(+sv.disc||0,sub),total=sub-disc,paid=svPaid();return{gold,aj,pr,tax,w:Math.round(w*1000)/1000,sub,disc,total,paid,rest:total-paid}}
const svCu=()=>sv&&sv.cuId?CU().find(c=>String(c.id)===String(sv.cuId))||null:null;
function vSell(){if(!sv){sv=ls.get('m_svd',null)||svBlank('')}if(!sv.qa)sv.qa=qaBlank();svUsed=goodsUsed();const D=dates(sv.date);
  return `<div class="svw sv2">
  <div class="ivpaper svhead2"><div class="ivh"><span class="ivmk">م</span><button class="svdt" data-act="svCal"><b>فاکتور ${toFa(invNext())}</b><small>${ic('cal')} ${esc(payLab(sv.date)||D.fa)}</small></button>
    <label class="svrt${sv.rate?'':' need'}"><small>نرخ هر گرم ۱۸</small><input id="svR" class="ltr" inputmode="numeric" value="${sv.rate?Number(sv.rate).toLocaleString('en-US'):''}" placeholder="نرخ روز" autocomplete="off" enterkeyhint="next"></label></div></div>
  <div id="svCu">${svCuHTML()}</div>
  <div id="svRest">${svRestHTML()}</div>
  <div class="qa" id="qa">${qaHTML()}</div>
  <div id="svIt">${svItHTML()}</div>
  ${sv.items.length||sv.tax?`<label class="taxck sm svtx"><input type="checkbox" id="svT"${sv.tax?' checked':''}><span class="tgx"></span><span><b>مالیات</b><small>۱۰٪ اجرت و سود</small></span></label>`:''}
  <div id="svSum">${svSumHTML()}</div>
  <div id="svPays">${svPaysHTML()}</div>
</div>`}
const aSell=()=>`<button class="btn gold bzgo" data-act="svSave">${ic('check')} ثبت فاکتور<span id="svBt">${svBtTxt()}</span></button>`;
const svBtTxt=()=>sv&&sv.items.length&&sv.rate?fmt(svTot().total)+' تومان':'';
/* ----- مشتری ----- */
function svCuHTML(){const c=svCu();if(c){const b=cuBal(c);return `<div class="svcu"><span class="bri">${esc(userInit(c.name))}</span><span class="tx">${honTag(c.name)}<b>${esc(cuName(c))}</b><small>${[c.grp?'گروه '+esc(c.grp):'',c.phone?'<bdi dir="ltr">'+esc(c.phone)+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری'}</small></span><button class="lnk" data-act="svCuX">تغییر</button></div>`}
  return `<div class="svpick"><div class="fsearch">${ic('search')}<input id="svQ" type="search" value="${esc(sv.q||'')}" placeholder="مشتری: نام، شماره یا کد ملی…" autocomplete="off" enterkeyhint="search"></div><div id="svCr">${svCrHTML()}</div></div>`}
function svCrHTML(){const q0=clean(sv.q||''),q=nzName(toEn(q0)),A=CU();
  if(!q){const L=A.slice().sort((a,b)=>String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,8);
    return `<div class="svrc">${L.map(c=>`<button class="svrcb" data-act="svCu" data-id="${c.id}">${esc(cuName(c))}</button>`).join('')}<button class="svrcb nw" data-act="svCuNew">${ic('plus')} مشتری جدید</button></div>`}
  const L=A.filter(c=>nzName([c.name,c.phone,c.nid,c.grp].join(' ')).includes(q)).sort((a,b)=>(nzName(b.name).startsWith(q)-nzName(a.name).startsWith(q))||String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,6);
  const add=!/^\d+$/.test(toEn(q0))&&!A.some(c=>nzName(c.name)===nzName(q0));
  return `<div class="fcard blist svdd">${L.map(c=>{const b=cuBal(c);return `<button class="curow" data-act="svCu" data-id="${c.id}"><span class="bri">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${c.grp?'<em class="cgp">'+esc(c.grp)+'</em> ':''}${c.phone?'<bdi dir="ltr">'+esc(c.phone)+'</bdi>':'بدون شماره'}</small></span><span class="cuv">${balTag(b.R)}${balTag(b.G,1)}</span></button>`}).join('')}
    <button class="curow nw" data-act="svCuNew"><span class="bri">${ic('plus')}</span><span class="tx"><b>${add?'مشتری جدید «'+esc(q0)+'»':'افتتاح حساب جدید'}</b><small>${L.length?'':'مشتری‌ای پیدا نشد · '}مشخصات را بزنید و روی همین فاکتور می‌نشیند</small></span></button></div>`}
function svPick(id){sv.cuId=id;sv.q='';svKeep();if(cur!=='sell')go('sell');else{$('svCu').innerHTML=svCuHTML();svRe()}const e=document.querySelector('.svcu');if(e){e.classList.add('pop')}setTimeout(()=>{const f=!sv.rate?$('svR'):$('qK');if(f&&cur==='sell'&&$('ov').classList.contains('hide'))f.focus()},60)}
ACT.svCu=d=>svPick(d.id);
ACT.svCuX=()=>{sv.cuId='';sv.pays=sv.pays.filter(p=>p.m!=='cust');svKeep();$('svCu').innerHTML=svCuHTML();svBindCu();svRe();setTimeout(()=>{const q=$('svQ');if(q)q.focus()},60)};
ACT.svCuNew=()=>{cuRet='sell';sheet(cuFormHTML({name:clean(sv.q||''),grp:sv.g||''}));cuBind();setTimeout(()=>{const n=$(sv.q?'cuP':'cuN');if(n)n.focus()},300)};
ACT.svCal=()=>openCal(sv.date,iso=>{sv.date=iso;svKeep();closeSheet();render()});
/* ----- کالاها ----- */
/* ردیف تازه سند (شبیه «شرح» در نرم‌افزار کیمیا): یک جستجو برای همه چیز — کالا، نقد، کارتخوان، حواله، طلای مشتری، تخفیف،
   حساب‌های ما و حساب مشتری‌های دیگر (با مانده). کالا ← وزن ← افزودن؛ پول ← جهت (دریافت/پرداخت) ← طرف حساب ← مبلغ ← افزودن.
   پرداخت به مشتری = مبلغ منفی در pays (همه جمع‌ها، مانده کارتخوان/حساب و حواله به مشتری دیگر بی‌تغییر درست حساب می‌شوند). */
let svUsed={};
const MK={cash:{t:'نقد',i:'cash',al:'نقد نقدی پول صندوق'},pos:{t:'کارتخوان',i:'card',al:'کارتخوان کارت پوز'},hav:{t:'حواله',i:'bank',al:'حواله کارت به کارت واریز انتقال بانک'},gold:{t:'طلای مشتری',i:'coin',al:'طلای مشتری آبشده کهنه کارکرده طلا'},disc:{t:'تخفیف',i:'tag',al:'تخفیف کسر'}};
function goodsUsed(){const u={};for(const c of custs)if(!c.del)for(const t of c.txs||[])if(t.type==='inv'&&!t.del)for(const i of t.items||[])u[i.k]=(u[i.k]||0)+1;return u}
function qaBlank(){const L=sv&&sv.items[sv.items.length-1];return{k:'',q:'',w:'',ay:750,ajU:L?L.ajU:ls.get('m_ajU','p'),aj:L?L.aj:(+ls.get('m_aj',0)||''),pp:L?L.pp:PROFIT_DEF(),p:null}}
const pAmt=p=>+p.amount||0,svPaid=skip=>sv.pays.reduce((s,p,i)=>i===skip?s:s+pAmt(p),0);
function pyLab(p,long){const ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId)),out=pAmt(p)<0,nm=p.cuName||((p.cuId&&custs.find(z=>String(z.id)===String(p.cuId)))||{}).name||'';
  switch(p.m){case 'cash':return out?'پرداخت نقد':'دریافت نقد';case 'pos':return 'کارتخوان'+(ch?' · '+ch.name:'');case 'hav':return (out?'پرداخت حواله':'دریافت حواله')+(ch?' · '+ch.name:'');
    case 'gold':return 'طلای مشتری · '+wFmt(p.w)+' گرم'+(long?' عیار '+toFa(p.ay||750):'');case 'cust':return out?'حواله به حساب «'+nm+'»':'حواله از حساب «'+nm+'»';default:return (PM[p.m]||{}).t||''}}
function qaChips(){const a=sv.qa,q=nzName(toEn(a.q||'')),A=goodsList().filter(k=>!q||nzName(k).includes(q)).sort((x,y)=>q?(nzName(y).startsWith(q)-nzName(x).startsWith(q))||(svUsed[y]||0)-(svUsed[x]||0):(svUsed[y]||0)-(svUsed[x]||0)).slice(0,q?6:8);
  const M=Object.entries(MK).filter(([,v])=>!q||nzName(v.al).includes(q)),C=q?CH().filter(c=>nzName(c.name).includes(q)).slice(0,3):[],U=q?CU().filter(c=>String(c.id)!==String(sv.cuId)&&nzName([c.name,c.phone,c.grp].join(' ')).includes(q)).slice(0,4):[];
  let h=`<div class="qks">${A.map(k=>`<button class="kch" data-act="qaK" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>
  ${M.length?`<div class="qks mk">${M.map(([m,v])=>`<button class="kch m-${m}" data-act="qaM" data-m="${m}">${ic(v.i)}${v.t}</button>`).join('')}</div>`:''}`;
  if(C.length||U.length)h+=`<div class="fcard blist qpl">${C.map(c=>`<button class="curow" data-act="qaCh" data-id="${c.id}"><span class="bri ${c.kind}">${ic(c.kind==='pos'?'card':'bank')}</span><span class="tx"><b>${esc(c.name)}</b><small>${CHK[c.kind]} ما</small></span><span class="cuv"><b class="chv">${fmt(chBal(c))}</b></span></button>`).join('')}
      ${U.map(c=>{const b=cuBal(c);return `<button class="curow" data-act="qaCu" data-id="${c.id}"><span class="bri">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>حواله با حساب این مشتری</small></span><span class="cuv">${balTag(b.R)}</span></button>`}).join('')}</div>`;
  if(q&&!A.length&&!M.length)h+=`<button class="kch new qnew" data-act="qaK" data-k="${esc(clean(a.q))}">+ تعریف کالای «${esc(clean(a.q))}»</button>`;
  return h}
function qaHTML(){const a=sv.qa;if(a.p)return pyHTML();const AY=[750,740,705,585,900];if(!AY.includes(+a.ay))AY.push(+a.ay);
  if(!a.k)return `<div class="qah"><b>ردیف تازه</b><small>کالا، نقد، کارتخوان، حواله، تخفیف یا نام حساب</small></div>
  <div class="fsearch sm">${ic('search')}<input id="qK" value="${esc(a.q||'')}" placeholder="جستجو: انگشتر، حواله، ملت، نام مشتری…" autocomplete="off" enterkeyhint="next"></div><div id="qKs">${qaChips()}</div>`;
  return `<div class="qah"><b>${esc(a.k)}</b><button class="lnk" data-act="qaK" data-k="">تغییر</button></div>
  <div class="qag"><label><small>وزن (گرم)</small><input id="qW" class="ltr" inputmode="decimal" value="${esc(a.w||'')}" placeholder="0.000" autocomplete="off" enterkeyhint="done"></label>
  <label><small>عیار</small><select id="qY">${AY.map(x=>`<option value="${x}"${+a.ay===x?' selected':''}>${toFa(x)}</option>`).join('')}</select></label>
  <label><small>اجرت <span class="uns"><button type="button" class="${a.ajU==='p'?'on':''}" data-act="qaU" data-u="p">٪</button><button type="button" class="${a.ajU!=='p'?'on':''}" data-act="qaU" data-u="t">ت</button></span></small><input id="qJ" class="ltr" inputmode="decimal" value="${a.aj?(a.ajU==='p'?a.aj:Number(a.aj).toLocaleString('en-US')):''}" placeholder="${a.ajU==='p'?'٪':'تومان'}" autocomplete="off" enterkeyhint="done"></label>
  <label><small>سود ٪</small><input id="qS" class="ltr" inputmode="decimal" value="${esc(a.pp)}" autocomplete="off" enterkeyhint="done"></label></div>
  <div class="qaf"><span id="qB"></span><button class="qago" data-act="qaAdd">${ic('plus')} افزودن</button></div>`}
function qaRead(){const a=sv.qa,g=id=>{const e=$(id);return e?e.value:undefined};if($('qW'))a.w=decIn(g('qW'));if($('qY'))a.ay=+g('qY')||750;if($('qJ'))a.aj=a.ajU==='p'?parseFloat(decIn(g('qJ')))||0:num(g('qJ'));if($('qS'))a.pp=parseFloat(decIn(g('qS')))||0;if($('qK'))a.q=g('qK');if(a.p)pyRead()}
function qaCalc(){const B=$('qB');if(!B)return;qaRead();const a=sv.qa;if(a.p){pyHint();return}B.innerHTML=!sv.rate?'<small>نرخ روز را بالا بزنید</small>':!(+a.w)?'<small>وزن را بزنید</small>':`<small>مبلغ این قلم</small><b>${fmt(itCalc(a,sv.rate,sv.tax).tot)}</b>`}
function qaBind(){const K=$('qK'),W=$('qW'),J=$('qJ'),S=$('qS'),Y=$('qY'),a=sv.qa,keep=()=>{qaRead();svKeep()};
  if(a.p){pyBind();return}
  if(K){K.oninput=()=>{a.q=K.value;clearTimeout(K._t);K._t=setTimeout(()=>{const r=$('qKs');if(r)r.innerHTML=qaChips()},60);svKeep()};
    K.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();a.q=K.value;const r=$('qKs');if(r)r.innerHTML=qaChips();const f=document.querySelector('#qKs [data-act]');if(f)ACT[f.dataset.act]({...f.dataset})}};
    const KS=$('qKs');if(KS)KS.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
  const ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.qaAdd()}};
  if(W){W.oninput=()=>{W.value=decIn(W.value);keep();qaCalc()};W.onkeydown=ent}
  if(S){S.oninput=()=>{S.value=decIn(S.value);keep();qaCalc()};S.onkeydown=ent}
  if(J){J.oninput=()=>{if(a.ajU==='p')J.value=decIn(J.value);else{const v=num(J.value);J.value=v?v.toLocaleString('en-US'):''}keep();qaCalc()};J.onkeydown=ent}
  if(Y)Y.onchange=()=>{keep();qaCalc()};qaCalc()}
const qaRe=f=>{const q=$('qa');if(!q)return;q.innerHTML=qaHTML();qaBind();const e=f&&$(f);if(e)e.focus({preventScroll:false})};
const qaDone=()=>{sv.qa=qaBlank();svKeep();qaRe();svRe();setTimeout(()=>{const k=$('qK');if(k&&$('ov').classList.contains('hide'))k.focus({preventScroll:true})},30)};
ACT.qaK=d=>{qaRead();const a=sv.qa;a.k=d.k?clean(d.k):'';if(a.k)addGoods(a.k);a.q='';svKeep();qaRe(a.k?'qW':'qK')};
ACT.qaU=d=>{qaRead();const a=sv.qa;if(a.ajU===d.u)return;a.ajU=d.u;a.aj=0;ls.set('m_ajU',d.u);svKeep();qaRe('qJ')};
ACT.qaAdd=()=>{qaRead();const a=sv.qa;if(!a.k){toast('کالا را انتخاب کنید',true);const k=$('qK');if(k)k.focus();return}const w=parseFloat(a.w)||0;if(!w){toast('وزن را بزنید',true);$('qW').focus();return}
  const it={k:a.k,w,ay:+a.ay||750,ajU:a.ajU,aj:+a.aj||0,pp:+a.pp||0,cat:GK.includes(a.k)?a.k:'نو',n:''};if(it.pp)ls.set('m_profit',it.pp);ls.set('m_aj',it.ajU==='t'?0:it.aj);
  sv.items.push(it);svAdd=sv.items.length-1;svUsed[it.k]=(svUsed[it.k]||0)+1;const ay=it.ay;qaDone();sv.qa.ay=ay};
/* ----- ردیف پولی: نقد، کارتخوان، حواله (به حساب ما یا مشتری دیگر)، طلای مشتری، تخفیف ----- */
function pyLeft(p){const T=svTot(),r=T.total-svPaid(p.i);return p.dir==='out'?Math.max(0,-r):Math.max(0,r)}
function pyNew(m,o){const p={m,dir:'in',amount:0,ay:750,gr:sv.rate,cat:'کارکرده',q:'',tn:'',...(o||{})};
  if(m==='pos'||(m==='hav'&&!p.chId&&!p.cuId)){const L=CH(m==='pos'?'pos':'bank'),last=ls.get('m_ch_'+m,'');if(!p.chId)p.chId=(L.find(c=>String(c.id)===String(last))||L[0]||{}).id||''}
  if(m==='disc')p.amount=+sv.disc||0;else if(m!=='gold'){p.amount=pyLeft(p);if(m==='cust')pyCuCap(p)}return p}
function pyCuCap(p){const c=CU().find(z=>String(z.id)===String(p.cuId));if(!c)return;p.cuName=cuName(c);if(p.dir==='in'){const cr=Math.max(0,cuBal(c).R);if(cr)p.amount=Math.min(pyLeft(p),cr)}}
const pyStart=p=>{qaRead();sv.qa.p=p;sv.qa.q='';svKeep();qaRe()};
ACT.qaM=d=>{if(d.m==='gold'&&!sv.rate){toast('اول نرخ روز را بالای فاکتور بزنید',true);$('svR').focus();return}pyStart(pyNew(d.m))};
ACT.qaCh=d=>{const c=CH().find(z=>String(z.id)===String(d.id));if(!c)return;pyStart(pyNew(c.kind==='pos'?'pos':'hav',{chId:c.id}))};
ACT.qaCu=d=>{if(!svCu()){toast('اول مشتری فاکتور را انتخاب کنید',true);return}pyStart(pyNew('cust',{cuId:d.id}))};
ACT.qaX=()=>{sv.qa.p=null;svKeep();qaRe('qK')};
function pyHTML(){const p=sv.qa.p,M=MK[p.m==='cust'?'hav':p.m],ed=p.i!=null;let b='';
  if(['cash','hav','cust'].includes(p.m))b+=`<div class="seg2 pyd"><button class="${p.dir!=='out'?'on':''}" data-act="pyD" data-d="in">دریافت از مشتری</button><button class="${p.dir==='out'?'on':''}" data-act="pyD" data-d="out">پرداخت به مشتری</button></div>`;
  if(p.m==='pos'||p.m==='hav'||p.m==='cust'){const kind=p.m==='pos'?'pos':'bank',L=CH(kind),C=p.m==='cust'&&CU().find(c=>String(c.id)===String(p.cuId));
    b+=`<div class="pyl"><small>${p.m==='pos'?'کدام کارتخوان':p.dir==='out'?'از کدام حساب':'به کدام حساب'}</small><div class="chps">${L.map(c=>`<button class="chp${p.m!=='cust'&&String(p.chId)===String(c.id)?' on':''}" data-act="pyCh" data-id="${c.id}">${ic(kind==='pos'?'card':'bank')}<span><b>${esc(c.name)}</b><small>مانده ${fmt(chBal(c))}</small></span></button>`).join('')}</div>
    <div class="fsearch sm chadd">${ic('plus')}<input id="pyCn" placeholder="${kind==='pos'?'کارتخوان جدید، مثلاً پوز ملت':'حساب جدید ما، مثلاً سامان'}" autocomplete="off" enterkeyhint="done"><button class="lnk" data-act="pyChAdd">افزودن</button></div></div>`;
    if(p.m!=='pos')b+=`<div class="pyl"><small>یا حساب مشتری دیگر ${p.dir==='out'?'(به حساب او)':'(از طلب او)'}</small>${C?`<div class="svcu sm"><span class="bri">${esc(userInit(C.name))}</span><span class="tx"><b>${esc(cuName(C))}</b><small>مانده: ${fmt(Math.abs(cuBal(C).R))} · ${balLab(cuBal(C).R)}</small></span><button class="lnk" data-act="pyCu" data-id="">تغییر</button></div>`
      :`<div class="fsearch sm">${ic('search')}<input id="pyQ" value="${esc(p.q||'')}" placeholder="نام مشتری…" autocomplete="off"></div><div id="pyCr">${pyCrHTML()}</div>`}</div>`}
  if(p.m==='gold')b+=`<div class="qag g3"><label><small>وزن (گرم)</small><input id="pyW" class="ltr" inputmode="decimal" value="${esc(p.w||'')}" placeholder="0.000" autocomplete="off"></label><label><small>عیار</small><input id="pyY" class="ltr" inputmode="numeric" value="${esc(p.ay||750)}" autocomplete="off"></label><label><small>نرخ خرید هر گرم</small><input id="pyG" class="ltr" inputmode="numeric" value="${p.gr?Number(p.gr).toLocaleString('en-US'):''}" autocomplete="off"></label></div>
    <div class="pyl"><small>اضافه شود به موجودی</small><div class="gks">${GK.map(k=>`<button class="tch${(p.cat||'کارکرده')===k?' on':''}" data-act="pyCat" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>`;
  b+=`<div class="qag ${p.m==='pos'||p.m==='hav'?'g2':'g1'}"><label><small>${p.m==='gold'?'ارزش طلا (تومان)':'مبلغ (تومان)'}</small><input id="pyA" class="ltr" inputmode="numeric" value="${p.amount?Number(p.amount).toLocaleString('en-US'):''}" autocomplete="off" enterkeyhint="done"${p.m==='gold'?' readonly':''}></label>${p.m==='pos'||p.m==='hav'?`<label><small>پیگیری (اختیاری)</small><input id="pyT" class="ltr" inputmode="numeric" value="${esc(p.tn||'')}" autocomplete="off" enterkeyhint="done"></label>`:''}</div>`;
  return `<div class="qah"><b class="pyt">${ic(M.i)} ${M.t}</b><button class="lnk" data-act="qaX">${ed?'بستن':'انصراف'}</button></div>${b}
  <div class="qaf"><span id="qB"></span><span class="pybt">${ed?`<button class="qago red" data-act="pyDel" aria-label="حذف">${ic('trash')}</button>`:''}<button class="qago" data-act="pySave">${ic('check')} ${ed?'ذخیره':'افزودن'}</button></span></div>`}
function pyCrHTML(){const p=sv.qa.p,q=nzName(toEn(clean(p.q||'')));let L=CU().filter(c=>String(c.id)!==String(sv.cuId)).map(c=>[c,cuBal(c)]);if(q)L=L.filter(([c])=>nzName([c.name,c.phone,c.grp].join(' ')).includes(q));else L=L.filter(([,b])=>p.dir==='out'?true:b.R>0).sort((a,b)=>String(b[0].lastAt||'').localeCompare(String(a[0].lastAt||'')));
  L=L.slice(0,q?6:3);if(!L.length)return q?'<div class="eh">مشتری‌ای پیدا نشد</div>':'';
  return `<div class="fcard blist">${L.map(([c,b])=>`<button class="curow" data-act="pyCu" data-id="${c.id}"><span class="bri">${esc(userInit(c.name))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>${balLab(b.R)}</small></span><span class="cuv">${balTag(b.R)}</span></button>`).join('')}</div>`}
function pyRead(){const p=sv.qa.p,g=id=>{const e=$(id);return e?e.value:undefined};if(!p)return;if($('pyA')&&p.m!=='gold')p.amount=num(g('pyA'));if($('pyT'))p.tn=toEn(g('pyT')||'').trim();if($('pyW'))p.w=decIn(g('pyW'));if($('pyY'))p.ay=+toEn(g('pyY')).replace(/\D/g,'')||750;if($('pyG'))p.gr=num(g('pyG'));if($('pyQ'))p.q=g('pyQ');if(p.m==='gold')p.amount=Math.round((parseFloat(p.w)||0)*(+p.gr||0)*(+p.ay||750)/750)}
function pyHint(){const B=$('qB'),p=sv.qa.p;if(!B||!p)return;if(p.m==='disc'){B.innerHTML='<small>از جمع فاکتور کم می‌شود</small>';return}const r=svTot().total-svPaid(p.i),l=pyLeft(p);
  B.innerHTML=!r?'<small>بدون این ردیف، سند تسویه است</small>':`<small>${r>0?'بدهی مشتری در این سند':'طلب مشتری در این سند'}</small><b>${fmt(Math.abs(r))}</b>${l&&l!==+p.amount&&p.m!=='gold'?' <button class="lnk" data-act="pyAll">همه</button>':''}`}
function pyBind(){const p=sv.qa.p,A=$('pyA'),W=$('pyW'),G=$('pyG'),Y=$('pyY'),Q=$('pyQ'),CN=$('pyCn'),T=$('pyT'),keep=()=>{pyRead();svKeep();pyHint()},ent=e=>{if(e.key==='Enter'){e.preventDefault();ACT.pySave()}};
  const gold=()=>{keep();if(A)A.value=p.amount?p.amount.toLocaleString('en-US'):''};
  if(A&&p.m!=='gold'){A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';keep()};A.onkeydown=ent}if(T){T.oninput=keep;T.onkeydown=ent}
  if(W)W.oninput=()=>{W.value=decIn(W.value);gold()};if(Y)Y.oninput=()=>{Y.value=toEn(Y.value).replace(/\D/g,'').slice(0,3);gold()};if(G)G.oninput=()=>{const v=num(G.value);G.value=v?v.toLocaleString('en-US'):'';gold()};
  if(Q){Q.oninput=()=>{p.q=Q.value;$('pyCr').innerHTML=pyCrHTML()};const R=$('pyCr');if(R)R.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
  if(CN)CN.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.pyChAdd()}};
  pyHint();setTimeout(()=>{if(!$('ov').classList.contains('hide'))return;const f=W&&!W.value?W:A&&!A.readOnly?A:null;if(f&&document.activeElement!==f)f.focus({preventScroll:true});if(f&&f.select)f.select()},40)}
const pyRe=f=>{qaRe(f)};
ACT.pyD=d=>{pyRead();const p=sv.qa.p;if(p.dir===d.d)return;p.dir=d.d;p.amount=pyLeft(p);if(p.m==='cust')pyCuCap(p);svKeep();pyRe()};
ACT.pyCh=d=>{pyRead();const p=sv.qa.p;p.chId=d.id;if(p.m==='cust'){p.m='hav';delete p.cuId;delete p.cuName}svKeep();pyRe()};
ACT.pyCu=d=>{pyRead();const p=sv.qa.p;if(d.id){if(!svCu()){toast('اول مشتری فاکتور را انتخاب کنید',true);return}p.m='cust';p.cuId=d.id;p.chId='';p.amount=pyLeft(p);pyCuCap(p)}else{p.cuId='';p.q=''}svKeep();pyRe(d.id?'':'pyQ')};
ACT.pyCat=d=>{pyRead();sv.qa.p.cat=d.k;svKeep();pyRe()};
ACT.pyAll=()=>{pyRead();const p=sv.qa.p;p.amount=pyLeft(p);svKeep();pyRe()};
ACT.pyChAdd=()=>{pyRead();const p=sv.qa.p,n=$('pyCn'),name=clean((n&&n.value)||''),kind=p.m==='pos'?'pos':'bank';if(!name){toast('نام '+CHK[kind]+' را بنویسید',true);if(n)n.focus();return}const r=chNew(name,kind);if(r){p.chId=r.id;if(p.m==='cust'){p.m='hav';delete p.cuId}svKeep();pyRe();toast('«'+name+'» اضافه شد')}};
ACT.pySave=()=>{pyRead();const p=sv.qa.p;if(!p)return;const amt=+p.amount||0;
  if(p.m==='disc'){sv.disc=amt;if(amt)toast('تخفیف '+fmt(amt)+' تومان ثبت شد');qaDone();return}
  if(p.m==='gold'){if(!(parseFloat(p.w)>0)){toast('وزن طلای مشتری را وارد کنید',true);$('pyW').focus();return}if(!p.gr){toast('نرخ خرید را وارد کنید',true);$('pyG').focus();return}}
  if((p.m==='pos'||p.m==='hav')&&!p.chId){toast(p.m==='pos'?'کارتخوان را انتخاب یا اضافه کنید':'حساب را انتخاب یا اضافه کنید',true);return}
  if(p.m==='cust'&&!p.cuId){toast('حساب مشتری را انتخاب کنید',true);return}
  if(!(amt>0)){toast('مبلغ را وارد کنید',true);const a=$('pyA');if(a)a.focus();return}
  const sg=p.dir==='out'&&p.m!=='pos'&&p.m!=='gold'?-1:1,o={m:p.m,amount:sg*amt};
  if(p.chId&&(p.m==='pos'||p.m==='hav')){o.chId=p.chId;o.tn=p.tn||'';ls.set('m_ch_'+p.m,p.chId)}if(p.m==='gold')Object.assign(o,{w:parseFloat(p.w),ay:+p.ay||750,gr:+p.gr,cat:p.cat||'کارکرده'});if(p.m==='cust')Object.assign(o,{cuId:p.cuId,cuName:p.cuName||''});
  if(p.i!=null)sv.pays[p.i]=o;else sv.pays.push(o);qaDone()};
ACT.pyDel=()=>{const p=sv.qa.p;if(!p||p.i==null)return;const o=sv.pays.splice(p.i,1)[0];qaDone();toast('ردیف حذف شد','', 'بازگردانی',()=>{if(o){sv.pays.push(o);svKeep();svRe()}})};
ACT.svPayEdit=d=>{const o=sv.pays[+d.i];if(!o)return;qaRead();const p={...o,i:+d.i,dir:pAmt(o)<0?'out':'in',amount:Math.abs(pAmt(o)),q:''};pyStart(p);const q=$('qa');if(q)q.scrollIntoView({behavior:'smooth',block:'center'})};
ACT.svPayDel=d=>{const o=sv.pays.splice(+d.i,1)[0];if(sv.qa.p&&sv.qa.p.i!=null)sv.qa.p=null;svKeep();qaRe();svRe();toast('ردیف حذف شد','', 'بازگردانی',()=>{if(o){sv.pays.push(o);svKeep();svRe()}})};
ACT.svDiscX=()=>{const v=sv.disc;sv.disc=0;svKeep();svRe();toast('تخفیف برداشته شد','', 'بازگردانی',()=>{sv.disc=v;svKeep();svRe()})};
function svItHTML(){if(!sv.items.length)return '';
  return `<div class="svith"><b>${toFa(sv.items.length)} قلم · ${wFmt(svTot().w)} گرم</b><small>برای ویرایش یا حذف، ردیف را بزنید</small></div><div class="fcard blist svits">${sv.items.map((it,i)=>{const c=itCalc(it,sv.rate,sv.tax);return `<button class="svir${i===svAdd?' new':''}" data-act="svItEdit" data-i="${i}"><span class="bri gk">${esc(userInit(it.k))}</span><span class="tx"><b>${esc(it.k)}${it.n?' <i>'+esc(it.n)+'</i>':''}</b><small>${wFmt(it.w)} گرم · عیار ${toFa(it.ay||750)} · اجرت ${it.ajU==='p'?toFa(+it.aj||0)+'٪':fmt(+it.aj||0)} · سود ${toFa(+it.pp||0)}٪</small></span><span class="txv"><b>${sv.rate?fmt(c.tot):'—'}</b><small>${sv.rate?'تومان':'نرخ را بزنید'}</small></span></button>`}).join('')}</div>`}
function svSumHTML(){const T=svTot();if(!sv.items.length)return '';const row=(l,v,c)=>`<div${c?' class="'+c+'"':''}><span>${l}</span><b>${v}</b></div>`;
  return `<div class="svsum">${row('بهای طلا · '+wFmt(T.w)+' گرم',fmt(T.gold))}${row('اجرت ساخت',fmt(T.aj))}${row('سود فروشنده',fmt(T.pr))}${sv.tax?row('مالیات ۱۰٪',fmt(T.tax)):''}${T.disc?row('تخفیف','− '+fmt(T.disc),'dc'):''}
  <div class="svtot"><span>جمع فاکتور</span><b><span id="svTotN" data-v="${T.total}">${fmt(T.total)}</span> <i>تومان</i></b></div></div>
  ${T.rest>0&&sv.rate?`<label class="taxck sm svgc"><input type="checkbox" id="svGc"${sv.gconv?' checked':''}><span class="tgx"></span><span><b>مانده این فاکتور طلایی ثبت شود</b><small>${wFmt(Math.round(T.rest/sv.rate*1000)/1000)} گرم با نرخ امروز</small></span></label>`:''}`}
function svPaysHTML(){const D=+sv.disc||0;if(!sv.pays.length&&!D)return '';
  return `<div class="svith"><b>دریافت و پرداخت</b><small>برای ویرایش، ردیف را بزنید</small></div><div class="fcard blist svpays">${D?`<div class="svpr"><button class="svprb" data-act="qaM" data-m="disc"><span class="bri pm-disc">${ic('tag')}</span><span class="tx"><b>تخفیف</b><small>از جمع فاکتور کم می‌شود</small></span><span class="txv"><b>${fmt(D)}</b><small>تومان</small></span></button><button class="stlc" data-act="svDiscX" aria-label="برداشتن تخفیف">${ic('x')}</button></div>`:''}
  ${sv.pays.map((p,i)=>{const out=pAmt(p)<0,M=MK[p.m==='cust'?'hav':p.m]||{i:'cash'};
  return `<div class="svpr"><button class="svprb" data-act="svPayEdit" data-i="${i}"><span class="bri pm-${p.m}">${ic(M.i)}</span><span class="tx"><b>${esc(pyLab(p))}</b><small>${out?'پرداخت به مشتری':'دریافت از مشتری'}${p.tn?' · پیگیری '+esc(p.tn):''}</small></span><span class="txv ${out?'out':'in'}"><b>${out?'+':'−'} ${fmt(Math.abs(pAmt(p)))}</b><small>تومان</small></span></button><button class="stlc" data-act="svPayDel" data-i="${i}" aria-label="حذف این ردیف">${ic('x')}</button></div>`}).join('')}</div>`}
function svRestHTML(){const c=svCu(),T=svTot();if(!c&&!sv.items.length&&!sv.pays.length)return '';const b=c?cuBal(c):{R:0,G:0},gc=sv.gconv&&T.rest>0&&sv.rate;
  const nr=b.R-T.rest+(gc?T.rest:0),ng=Math.round((b.G-(gc?T.rest/sv.rate:0))*1000)/1000,dg=Math.round((ng-b.G)*1000)/1000;
  const cell=(l,v,g,cls)=>`<div class="${cls||''}"><small>${l}</small><b class="${v>0?'r':v<0?'b':''}">${v?(g?wFmt(Math.abs(v))+' <i>گرم</i>':fmt(Math.abs(v))):'—'}</b><em>${v?balLab(v):'تسویه'}</em></div>`;
  const doc=-T.rest;
  let h=`<div class="svbal"><div class="svbr">${c?cell('مانده قبلی',b.R):''}${cell('این سند',doc+(gc?T.rest:0),0,'doc')}${c?cell('مانده نهایی',nr,0,'fin'):''}</div>
  ${c&&(b.G||dg)?`<div class="svbr g">${cell('طلایی قبلی',b.G,1)}${cell('این سند',dg,1,'doc')}${cell('طلایی نهایی',ng,1,'fin')}</div>`:''}
</div>`;
  return h}
function tween(el,to){if(!el)return;const from=+el.dataset.v||0;el.dataset.v=to;if(from===to||matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=fmt(to);return}const t0=performance.now(),D=420;cancelAnimationFrame(el._r);
  const st=n=>{const k=Math.min(1,(n-t0)/D),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(from+(to-from)*e));if(k<1)el._r=requestAnimationFrame(st)};el._r=requestAnimationFrame(st);const p=el.closest('.svtot');if(p){p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump')}}
function svRe(){const o=$('svTotN'),old=o?+o.dataset.v||0:0;const set=(id,h)=>{const e=$(id);if(e)e.innerHTML=h};set('svIt',svItHTML());set('svSum',svSumHTML());set('svPays',svPaysHTML());set('svRest',svRestHTML());const tx=document.querySelector('.svtx');if(!tx&&sv.items.length){const r=$('svSum');if(r)r.insertAdjacentHTML('beforebegin',`<label class="taxck sm svtx"><input type="checkbox" id="svT"${sv.tax?' checked':''}><span class="tgx"></span><span><b>مالیات</b><small>۱۰٪ اجرت و سود</small></span></label>`);svBindTax()}const bt=$('svBt');if(bt)bt.textContent=svBtTxt();qaCalc();
  const n=$('svTotN');if(n){const to=+n.dataset.v;n.dataset.v=old;n.textContent=fmt(old);tween(n,to)}svBindRest();svAdd=-1}
function svBindRest(){const G=$('svGc');if(G)G.onchange=()=>{sv.gconv=G.checked;svKeep();$('svRest').innerHTML=svRestHTML()}}
function svBindCu(){const Q=$('svQ');if(!Q)return;Q.oninput=()=>{sv.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{const r=$('svCr');if(r)r.innerHTML=svCrHTML()},80)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(Q._t);sv.q=Q.value;const r=$('svCr');if(r)r.innerHTML=svCrHTML();const f=document.querySelector('#svCr .curow[data-act=svCu]');if(f)svPick(f.dataset.id);else if(clean(Q.value))ACT.svCuNew()}};const C=$('svCr');if(C)C.onpointerdown=e=>{if(e.target.closest('button'))e.preventDefault()}}
function svBindTax(){const T=$('svT');if(T)T.onchange=()=>{sv.tax=T.checked;ls.set('m_tax',sv.tax);svKeep();svRe()}}
function bindSell(){if(!sv)return;svBindCu();svBindRest();qaBind();const R=$('svR');
  if(R)R.oninput=()=>{const v=num(R.value);R.value=v?v.toLocaleString('en-US'):'';sv.rate=v;if(v)ls.set('m_rate',v);svKeep();R.parentNode.classList.toggle('need',!v);clearTimeout(R._t);R._t=setTimeout(()=>{if(cur==='sell')svRe()},160)};
  svBindTax();
  if(R)R.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const f=!svCu()?$('svQ'):$('qK')||$('qW');if(f)f.focus()}};
  setTimeout(()=>{if(cur!=='sell'||!$('ov').classList.contains('hide'))return;const f=!svCu()?$('svQ'):!sv.rate?R:!sv.items.length?($('qK')||$('qW')):null;if(f)f.focus()},380)}
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
/* ----- ثبت فاکتور ----- */
ACT.svSave=()=>{const c=svCu();if(!c){toast('مشتری فاکتور را انتخاب کنید',true);const q=$('svQ');if(q){q.focus();q.scrollIntoView({behavior:'smooth',block:'center'})}return}
  if(sv.qa&&sv.qa.k&&parseFloat(sv.qa.w))ACT.qaAdd();if(sv.qa&&sv.qa.p&&(+sv.qa.p.amount>0)){ACT.pySave();if(sv.qa.p)return}
  if(!sv.items.length&&!sv.pays.length){toast('کالا یا دریافت/پرداختی اضافه کنید',true);const k=$('qK')||$('qW');if(k)k.focus();return}if(sv.items.length&&!sv.rate){toast('نرخ روز هر گرم را بزنید',true);$('svR').focus();return}
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
function vInv(){const X=invGet();if(!X){setTimeout(()=>{if(cur==='inv')go('custs',true)},0);return ''}const {c,t}=X,paid=(t.pays||[]).reduce((s,p)=>s+pAmt(p),0),rest=t.total-paid,b=cuBal(c),D=dates(t.date),fresh=invV.fresh;invV.fresh=false;
  const row=(l,v,k)=>`<div${k?' class="'+k+'"':''}><span>${l}</span><b>${v}</b></div>`,S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0);
  return `${fresh?`<div class="bzok ivok">${ic('check')}<span>فاکتور ${toFa(t.no)} ثبت شد و به حساب «${esc(cuName(c))}» رفت</span></div>`:''}
  <article class="ivpaper ivfull${fresh?' reveal':''}"><div class="ivh"><span class="ivmk">م</span><span class="ivbr"><b>طلا و جواهر مطلا</b><small>${(t.items||[]).length?'فاکتور فروش':'سند دریافت و پرداخت'}</small></span><span class="ivno"><small>شماره</small><b>${toFa(t.no)}</b></span></div>
  <div class="ivmeta2"><div><small>خریدار</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<bdi dir="ltr">${esc(c.phone)}</bdi>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div>${(t.items||[]).length?`<div><small>نرخ روز هر گرم</small><b>${fmt(t.rate)}</b><span>تومان · ۱۸ عیار</span></div>`:''}</div>
  ${(t.items||[]).length?`<div class="ivits">${(t.items||[]).map((it,i)=>`<div class="ivit"><span class="ivn">${toFa(i+1)}</span><div class="ivd"><b>${esc(it.k)}${it.n?' <i>'+esc(it.n)+'</i>':''}</b><small>${wFmt(it.w)} گرم · عیار ${toFa(it.ay||750)} · اجرت ${it.ajU==='p'?toFa(it.aj)+'٪':fmt(it.aj)} · سود ${toFa(it.pp)}٪</small><div class="ivbk"><span>طلا ${fmt(it.gold)}</span><span>اجرت ${fmt(it.ajv)}</span><span>سود ${fmt(it.prv)}</span>${it.taxv?`<span>مالیات ${fmt(it.taxv)}</span>`:''}</div></div><b class="iva">${fmt(it.tot)}</b></div>`).join('')}</div>
  <div class="ivtt">${row('جمع وزن',wFmt(S('w'))+' گرم')}${row('بهای طلا',fmt(S('gold')))}${row('اجرت ساخت',fmt(S('ajv')))}${row('سود فروشنده',fmt(S('prv')))}${t.tax?row('مالیات ۱۰٪',fmt(S('taxv'))):''}${t.disc?row('تخفیف','− '+fmt(t.disc)):''}<div class="ivgt"><span>جمع فاکتور</span><b>${fmt(t.total)} <i>تومان</i></b></div></div>`:''}
  ${(t.pays||[]).length?`<div class="ivpy"><small>دریافت و پرداخت</small>${t.pays.map(p=>row(esc(pyLab(p))+(p.tn?' · پیگیری '+esc(p.tn):''),(pAmt(p)<0?'+ ':'')+fmt(Math.abs(pAmt(p))))).join('')}</div>`:''}
  <div class="ivrs ${rest>0?'due':rest<0?'over':'ok'}"><span>${rest>0?(t.gc?'مانده طلایی به حساب مشتری':'بدهی مشتری از این سند'):rest<0?'اضافه پرداخت (طلب مشتری)':'تسویه کامل'}</span><b>${rest?(t.gc?wFmt(t.gc.g)+' گرم':fmt(Math.abs(rest))+' تومان'):ic('check')}</b></div>
  <div class="ivft"><span>ته حساب فعلی مشتری: ${balLab(b.R)} ${b.R?fmt(Math.abs(b.R))+' تومان':''}${b.G?' · '+balLab(b.G)+' '+wFmt(Math.abs(b.G))+' گرم':''}</span><span>صادرکننده: ${esc(t.by||'')}</span></div></article>
  <div class="ivacts"><button class="cuqb" data-act="invPrint">${ic('print')}<span><b>چاپ یا PDF</b><small>فاکتور A5 برای مشتری</small></span></button><button class="cuqb" data-act="cuOpen" data-id="${c.id}">${ic('user')}<span><b>حساب مشتری</b><small>گردش و مانده‌ها</small></span></button></div>
  <button class="addit" data-act="svNew" data-cu="${c.id}">${ic('plus')} فاکتور بعدی برای همین مشتری</button>
  ${can('del')||isAdmin()?`<button class="edel" data-act="invDel">${ic('trash')} حذف این فاکتور</button>`:''}`}
const aInv=()=>`<button class="btn gold bzgo" data-act="invPrint">${ic('print')} چاپ / PDF فاکتور</button>`;
ACT.invDel=()=>{const X=invGet();if(!X)return;askConfirm('فاکتور '+toFa(X.t.no)+' حذف شود؟ اثرش از حساب مشتری'+(txLinked(X.c,X.t).length?' و مشتری پرداخت‌کننده':'')+' برداشته می‌شود.','حذف',()=>{custId=X.c.id;cur='cust';ACT.txDel({id:X.t.id});go('cust',true)})};
function invDoc(c,t){const D=dates(t.date),paid=(t.pays||[]).reduce((s,p)=>s+pAmt(p),0),rest=t.total-paid,S=k=>(t.items||[]).reduce((s,i)=>s+(+i[k]||0),0);
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
  <div class="hd"><span class="mk">م</span><span class="br"><b>طلا و جواهر مطلا</b><small>${(t.items||[]).length?'فاکتور فروش':'سند دریافت و پرداخت'}</small></span><span class="no"><small>شماره فاکتور</small><b>${toFa(t.no)}</b></span></div>
  <div class="mt"><div><small>خریدار</small><b>${esc((c.title?c.title+' ':'')+cuName(c))}</b>${c.phone?`<span dir="ltr" style="text-align:right">${esc(c.phone)}</span>`:''}</div><div><small>تاریخ</small><b>${esc(D.fa)}</b><span>${esc(D.wd)}</span></div><div><small>نرخ هر گرم ۱۸ عیار</small><b>${fmt(t.rate)}</b><span>تومان</span></div></div>
  ${(t.items||[]).length?`<table><thead><tr><th>#</th><th>شرح کالا</th><th>وزن</th><th>عیار</th><th>اجرت</th><th>سود</th><th style="text-align:left">مبلغ (تومان)</th></tr></thead><tbody>${(t.items||[]).map((it,i)=>`<tr><td>${toFa(i+1)}</td><td><b>${esc(it.k)}</b>${it.n?'<small>'+esc(it.n)+'</small>':''}</td><td>${wFmt(it.w)}</td><td>${toFa(it.ay||750)}</td><td>${fmt(it.ajv)}${it.ajU==='p'?'<small>'+toFa(it.aj)+'٪</small>':''}</td><td>${fmt(it.prv)}<small>${toFa(it.pp)}٪</small></td><td class="n"><b>${fmt(it.tot)}</b></td></tr>`).join('')}</tbody></table>
  <div class="tt"><div><span>جمع وزن</span><b>${wFmt(S('w'))} گرم</b></div><div><span>بهای طلا</span><b>${fmt(S('gold'))}</b></div><div><span>اجرت ساخت</span><b>${fmt(S('ajv'))}</b></div><div><span>سود فروشنده</span><b>${fmt(S('prv'))}</b></div>${t.tax?`<div><span>مالیات بر ارزش افزوده</span><b>${fmt(S('taxv'))}</b></div>`:''}${t.disc?`<div><span>تخفیف</span><b>− ${fmt(t.disc)}</b></div>`:''}<div class="g"><span>جمع فاکتور</span><b>${fmt(t.total)} تومان</b></div></div>`:''}
  ${(t.pays||[]).length?`<div class="py"><small>دریافت و پرداخت</small>${t.pays.map(p=>`<div><span>${esc(pyLab(p,1))}${p.tn?' · پیگیری '+esc(p.tn):''}</span><b>${pAmt(p)<0?'+ ':''}${fmt(Math.abs(pAmt(p)))}</b></div>`).join('')}</div>`:''}
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
