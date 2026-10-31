/* ============ v61.80 (خواسته صاحب اپ): مانده‌ای که به مشتری بدهکاریم → مستقیم به لیست واریزی برای تخصیص ============
   در پنجره تسویه (وقتی بدهکاریم) کاشی «واریز به حساب مشتری»: مبلغ (پیش‌فرض = مانده آزاد)، مشخصات بانکی مشتری (شبا، کارت،
   صاحب حساب — اگر یک بار ثبت شده خودکار پر است و هر بار در مشخصات مشتری c.bk ذخیره می‌شود) و تاریخ واریز.
   با «ارسال برای واریز» سند ثبت می‌شود و یک واریزی (مثل پنجره خرید: شماره فاکتور = شماره سند، وزن، هر گرم تمام‌شده، اقلام)
   به لیست واریزی همان تاریخ می‌رود؛ پیوندش e.wd={cu,no,amt}.
   تا تأیید بانک: مانده حساب دست نمی‌خورد ولی همه‌جا «رفته برای واریز» دیده می‌شود (صفحه مشتری، سند، تسویه) و مانده آزاد برای
   تقسیم دوباره همان مقدار کمتر است. وقتی هر بخش واریزی در پیگیری تأیید شد (st:'ok')، wdSync خودکار در همان سند یک ردیف
   «پرداخت حواله از «بانک»» (pay m:'wd'، کلید wk) می‌گذارد تا مانده صفر شود؛ تأیید برداشته شود، ردیف هم برداشته می‌شود.
   ردیف m:'wd' در حساب بانکی ما (srcMoves) شمرده نمی‌شود چون خود واریزی در دفتر بانک هست. */
const wdRoots=()=>entries.filter(e=>e&&e.wd&&!e.del);
/* وضعیت یک واریزی: بخش‌های تأییدشده (هر بخش «پرداخت از چند منبع» جدا) و تسویه‌های تأییدشده از مشتری دیگر */
function wdState(e,F,BI){const ok=[],bi=BI||entBI;if(!F){try{F=famOf(e)}catch(_){F=[e]}}if(!F.length)F=[e];
  F.forEach(p=>{const b=bi(p);if(b&&b.it.st==='ok')ok.push({k:'wd'+p.id,a:+b.it.amount||+p.amount||0,src:b.it.src||'',tn:b.it.tn||'',at:b.it.at||''})});
  (e.settles||[]).forEach((z,i)=>{if(z.st==='ok'&&+z.amount)ok.push({k:'wds'+e.id+'.'+(z.id||i),a:+z.amount,nm:z.name||'',tn:z.tn||'',at:z.okAt||''})});
  const done=ok.reduce((s,o)=>s+o.a,0),amt=+(e.wd.amt)||+e.amount||0;return {ok,done,amt,pend:Math.max(0,Math.round(amt-done))}}
/* v67.5 (خواسته صاحب اپ): مانده در انتظار یک واریزی به تفکیک — هر تسویه از مشتری (با سند دریافت خودش) و هر بخش بانکی جدا،
   تا در سند فروشنده هر بخش ردیف خودش را داشته باشد (نه یک ردیف کلی). جمع بخش‌ها = S.pend (اختلاف احتمالی در ردیف بانک). */
function wdParts(e,S,A){S=S||wdState(e);if(!S.pend)return [];let F;try{F=famOf(e)}catch(_){F=[e]}if(!F.length)F=[e];const P=[];
  (e.settles||[]).forEach((z,i)=>{if(z.st==='ok'||!(+z.amount))return;const c=z.byInv&&custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);
    P.push({k:'s'+(z.id||i),t:'s',a:+z.amount,nm:z.name||'مشتری',doc:t?invTitle(t):'',cu:t?c.id:null,tx:t?t.id:null,tn:z.tn||''})});
  const sOf=p=>(p.settles||[]).reduce((s,z)=>s+(+z.amount||0),0);
  F.forEach(p=>{const b=entBI(p);if(b&&b.it.st==='ok')return;const a=Math.max(0,Math.round((+p.amount||0)-sOf(p)));if(!a)return;const al=A&&A.get(p.id);
    P.push({k:'b'+p.id,t:'b',a,ent:p.id,src:(b&&b.it.src)||(al&&al.src)||'',st:b?(b.it.st==='fail'?'ناموفق در بانک':'ارسال‌شده به بانک · منتظر تأیید'):al&&al.src?'تخصیص خورده · هنوز ارسال نشده':'در لیست واریزی · هنوز تخصیص نخورده'})});
  const sum=P.reduce((s,o)=>s+o.a,0),d=S.pend-sum;
  if(d){const b=P.find(o=>o.t==='b');if(b&&b.a+d>0)b.a+=d;else if(d>0)P.push({k:'r',t:'b',a:d,ent:e.id,src:'',st:'در لیست واریزی · هنوز تخصیص نخورده'})}
  return P.filter(o=>o.a>0)}
/* ردیف تأییدشده «تسویه از مشتری» در سند فروشنده: عنوان سند دریافت پرداخت‌کننده (wk = wds<واریزی>.<تسویه>) */
function wdSetDoc(p){const m=/^wds(.+)\.([^.]+)$/.exec(String(p.wk||''));if(!m)return '';const e=entries.find(x=>String(x.id)===m[1]),z=e&&(e.settles||[]).find(q=>String(q.id)===m[2]);if(!z||!z.byInv)return '';
  const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);return t?invTitle(t):''}
/* مانده در انتظار واریز همه مشتری‌ها یک‌جا (فهرست مشتری‌ها و فیلتر): خانواده‌ها و ردیف‌های ارسال‌شده یک بار ساخته می‌شوند */
function wdMap(){const M=new Map(),R=wdRoots();if(!R.length)return M;const V=validated(),FM=new Map(),IM=new Map();
  V.forEach(r=>{const k=famRoot(r);(FM.get(k)||FM.set(k,[]).get(k)).push(r)});batches.forEach(b=>b.items.forEach((it,i)=>{if(!IM.has(it.id))IM.set(it.id,{b,i,it})}));
  const bi=x=>IM.get(x.id)||null;
  R.forEach(e=>{const F=(FM.get(famRoot(e))||[e]).slice().sort((a,b)=>(a.id===e.id?-1:b.id===e.id?1:a.id-b.id)),S=wdState(e,F,bi);if(S.pend>0){const k=String(e.wd.cu);M.set(k,(M.get(k)||0)+S.pend)}});return M}
/* واریزی‌های در انتظار یک مشتری (یا یک سند) */
function wdPendL(c,no){if(!c)return [];return wdRoots().filter(e=>String(e.wd.cu)===String(c.id)&&(no==null||String(e.wd.no)===String(no))).map(e=>({e,S:wdState(e)})).filter(o=>o.S.pend>0)}
const wdPend=(c,no)=>wdPendL(c,no).reduce((s,o)=>s+o.S.pend,0);
/* همگام‌سازی: ردیف‌های پرداخت سند با بخش‌های تأییدشده واریزی‌ها (دو طرفه؛ تکراری‌ها یکی می‌شوند) */
let wdBusy=false;
function wdSync(){if(wdBusy)return;const R=wdRoots();let any=R.length;if(!any){for(const c of custs){if(c.sys||c.del)continue;for(const t of c.txs||[])if(!t.del&&t.type==='inv'&&(t.pays||[]).some(p=>p.m==='wd')){any=1;break}if(any)break}}if(!any)return;
  wdBusy=true;try{const W=new Map(),live=new Set(entries.filter(e=>!e.del).map(e=>String(e.id)));
    R.forEach(e=>{const k=e.wd.cu+'|'+e.wd.no;W.set(k,(W.get(k)||[]).concat(wdState(e).ok.map(o=>({...o,ent:e.id}))))});
    let ch=false;const now=new Date().toISOString();
    for(const c of custs){if(c.sys||c.del)continue;for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;const L=W.get(c.id+'|'+t.no)||[],has=(t.pays||[]).some(p=>p.m==='wd');if(!L.length&&!has)continue;
      const want=new Map(L.map(o=>[o.k,o])),seen=new Set(),P=[];let tc=false;
      for(const p of t.pays||[]){if(p.m!=='wd'){P.push(p);continue}
        /* ردیف تکراری، یا ردیفی که واریزی‌اش هنوز هست ولی دیگر تأیید ندارد → برداشته می‌شود؛ واریزی پاک‌شده → ردیف می‌ماند */
        if(seen.has(p.wk)){tc=true;continue}const o=want.get(p.wk);if(!o&&live.has(String(p.entId))){tc=true;continue}seen.add(p.wk);
        if(o&&(Math.abs(pAmt(p))!==o.a||(p.src||'')!==(o.src||'')||(p.tn||'')!==(o.tn||''))){p.amount=-o.a;p.src=o.src||'';p.tn=o.tn||'';tc=true}P.push(p)}
      L.forEach(o=>{if(seen.has(o.k))return;seen.add(o.k);P.push({m:'wd',dir:'out',amount:-o.a,wk:o.k,entId:o.ent,src:o.src||'',nm:o.nm||'',tn:o.tn||'',q:'',at:o.at||now});tc=true});
      if(tc){t.pays=P;c.lastAt=now;ch=true;logA('cust','پرداخت خودکار از واریزی',cuName(c)+' | '+invTitle(t)+' | '+fmt(L.reduce((s,o)=>s+o.a,0))+' تومان تأییدشده')}}}
    if(ch){saveCu();if(sv&&sv.edit){const c=svCu(),t=c&&(c.txs||[]).find(x=>!x.del&&x.type==='inv'&&String(x.no)===String(sv.edit.no));if(t){const keep=sv.pays.filter(p=>p.m!=='wd');sv.pays=keep.concat((t.pays||[]).filter(p=>p.m==='wd').map(p=>({...p})));svKeep()}}}}
  finally{wdBusy=false}}
/* ردیف «رفته برای واریز» (در انتظار تأیید) در فهرست ردیف‌های سند — در جمع حساب نمی‌آید */
function wdRowsHTML(c,no,txId){if(no==null||!c)return [];const A=allocMap(),view=txId!=null,R=[];
  wdPendL(c,no).forEach(({e,S})=>{const D=dates(PD(e)),dl=esc(payLab(PD(e))||D.fa),depL=`<span class="d8eb d8lk" role="button" data-act="depGo" data-e="${e.id}">${ic('open')}<span>واریزی</span><small>${dl}</small></span>`;
    wdParts(e,S,A).forEach(o=>{const v=`<span class="d6e wdv"><small>${o.t==='s'?'در انتظار تأیید':'رفته برای واریز'}</small><span class="fz"><b${fitS(fmt(o.a))}>${fmt(o.a)}</b></span><i>تومان</i></span>`;
      if(o.t==='s'){const sub=[o.doc?'تسویه با '+esc(o.doc)+' در حساب «'+esc(o.nm)+'»':'تسویه از مشتری · بدون سند دریافت','وضعیت: پرداخت مستقیم به فروشنده · منتظر تأیید',o.tn?'پیگیری '+esc(toFa(o.tn)):'','تاریخ واریز: '+esc(D.fa)].filter(Boolean).join(' · ');
        R.push(d6Row({ico:'swap',tag:'<em class="d6k k-wd">در انتظار تأیید</em>',b:esc(o.nm),sub,v,ex:view&&o.tx!=null?`<span class="d8eb d8lk" role="button" data-act="cuInv" data-cu="${esc(o.cu)}" data-tx="${esc(o.tx)}">${ic('inv')}<span>${esc(o.doc)}</span><small>${esc(o.nm)}</small></span>`:depL,key:'w'+e.id+o.k}));return}
      const sub=['وضعیت: '+o.st,'تاریخ واریز: '+esc(D.fa),o.src?'منبع: '+esc(o.src):'',e.iban?'بانک: '+esc((ibanBank(e.iban)||'')+' '+String(e.iban).slice(-4)):'شبا ندارد',e.holder?'صاحب حساب: '+esc(e.holder):''].filter(Boolean).join(' · ');
      R.push(d6Row({ico:'clock',tag:'<em class="d6k k-wd">در انتظار واریز</em>',b:'واریز بانکی'+(o.src?' · '+esc(o.src):''),sub,v,ex:depL,key:'w'+e.id+o.k}))})});return R}
/* صفحه مشتری: زیر کارت مانده حساب */
function wdCuHTML(c){const L=wdPendL(c);if(!L.length)return '';const sum=L.reduce((s,o)=>s+o.S.pend,0),b=cuBal(c),free=Math.max(0,Math.round(b.R-sum));
  return `<div class="wdcu">${L.map(({e,S})=>`<button type="button" class="wdcr" data-act="depGo" data-e="${e.id}"><span class="wdci">${ic('clock')}</span><span class="tx"><b>${fmt(S.pend)} <i>تومان</i> رفته برای واریز</b><small>سند ${toFa(e.wd.no)} · واریز ${esc(payLab(PD(e))||dates(PD(e)).fa)} · ${entBI(e)?'ارسال‌شده به بانک، منتظر تأیید':'در لیست واریزی'}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`).join('')}
  ${b.R>0?`<div class="wdfree"><span>مانده آزاد برای تقسیم</span><b>${free?fmt(free)+' <i>تومان</i>':'ندارد'}</b></div>`:''}</div>`}
/* پنجره تسویه: سطر «رفته برای واریز» زیر عدد مانده */
function wdCkHTML(){const c=svCu();if(!c||!sv.edit)return '';const p=wdPend(c,sv.edit.no);return p?`<div class="wdck">${ic('clock')}<span>${fmt(p)} تومان از این مانده رفته برای واریز · <b>مانده آزاد ${fmt(Math.max(0,ckLeft()-p))}</b></span></div>`:''}
const wdFree=()=>{const c=svCu();return Math.max(0,ckLeft()-(c&&sv.edit?wdPend(c,sv.edit.no):0))};
/* ---------- فرم واریز ---------- */
let WD=null;
function wdBank(c){if(c.bk&&c.bk.iban)return {...c.bk,from:'c'};const k=nzName(cuName(c)),k2=nzName(c.name||''),p=bzPeople().find(z=>String(z.cuId)===String(c.id)&&z.iban)||bzPeople().find(z=>(z.k===k||z.k===k2)&&z.iban);return p?{iban:p.iban,card:p.card||'',holder:p.holder||'',from:'e'}:{iban:'',card:'',holder:''}}
function wdOpen(){const c=svCu();if(!c)return;const free=wdFree();if(!free){toast('همه این مانده قبلاً برای واریز رفته است',true);return}const B=wdBank(c);
  WD={amount:free,max:free,iban:dg(B.iban||'').slice(0,24),card:dg(B.card||'').slice(0,16),holder:B.holder||clean(c.name||''),from:B.from||'',pay:payDef(),tg:CK&&CK.tg};wdShow()}
function wdRead(){if(!WD)return;const g=id=>{const e=$(id);return e?e.value:undefined};if($('wdA'))WD.amount=num(g('wdA'));if($('wdI'))WD.iban=dg(g('wdI')).slice(0,24);if($('wdK'))WD.card=dg(g('wdK')).slice(0,16);if($('wdH'))WD.holder=clean(g('wdH')||'')}
function wdShow(){const c=svCu();if(!c||!WD)return;const no=sv.edit?sv.edit.no:invNext(),T=wdDocInfo(c);
  sheet(`<div class="wdw"><div class="sh-h"><div><b>واریز به حساب مشتری</b><small class="shsub">${esc(cuName(c))} · مانده به لیست واریزی می‌رود</small></div><button class="x" data-act="wdBack" aria-label="بازگشت">×</button></div>
  <div class="wdam"><label for="wdA">مبلغ واریز</label><div class="wdai"><input id="wdA" class="ltr" inputmode="numeric" value="${WD.amount?Number(WD.amount).toLocaleString('en-US'):''}" autocomplete="off"><i>تومان</i></div><small>مانده آزاد: ${fmt(WD.max)} تومان</small></div>
  <div class="f6h">مشخصات بانکی مشتری${WD.from==='c'?'<em> · از مشخصات مشتری</em>':WD.from==='e'?'<em> · از واریزی قبلی</em>':''}</div>
  <div class="ef"><label for="wdI">شماره شبا</label><div class="ibin"><input id="wdI" inputmode="numeric" value="${esc(ibanGroups(WD.iban))}" placeholder="شماره شبا (۲۴ رقم)" autocomplete="off" enterkeyhint="next"><span class="ibir">IR</span><span class="ibbk" id="wdIb"></span></div><small class="eh" id="wdIv"></small></div>
  <div class="ef"><label for="wdK">شماره کارت <i>(اختیاری)</i></label><input id="wdK" class="ltr" inputmode="numeric" value="${esc(grp4(WD.card))}" placeholder="۱۶ رقم" autocomplete="off" enterkeyhint="next"><small class="eh" id="wdKv"></small></div>
  <div class="ef"><label for="wdH">نام صاحب حساب</label><div class="eok"><input id="wdH" value="${esc(WD.holder)}" autocomplete="off" enterkeyhint="done" data-selall="1"><button type="button" class="eokb" data-act="hOk" data-f="wdH" aria-label="تایید همین نام">${ic('check')}<span>تایید</span></button></div><small class="eh" id="wdHv"></small></div>
  <div class="ef"><label>تاریخ واریز</label><button class="bzdate" data-act="wdCal">${ic('cal')}<span><b>${esc(payLab(WD.pay))}</b><small>${esc(dates(WD.pay).wd+' '+dates(WD.pay).fa)}</small></span>${ic('chev')}</button></div>
  <div class="bzrev wdrev"><div><small>شماره فاکتور</small><b>${toFa(no)}</b></div>${T.w?`<div><small>وزن طلا</small><b>${wFmt(T.w)} <i>گرم</i></b></div>`:''}${T.ppg?`<div><small>هر گرم تمام‌شده</small><b>${fmt(T.ppg)} <i>تومان</i></b></div>`:''}${T.items.filter(x=>x.k!=='طلا').map(x=>`<div><small>${esc(x.k+(x.t?' '+x.t:''))}</small><b>${x.q?esc(toFa(x.q))+' · ':''}${fmt(x.amt)}</b></div>`).join('')}</div>
  <button class="xgo wdgo" data-act="wdSave">${ic('check')} ارسال برای واریز</button>
  <button class="lnk ckback" data-act="wdBack">بازگشت به تسویه</button></div>`);wdBind()}
function wdBind(){const A=$('wdA'),I=$('wdI'),K=$('wdK'),h=(id,t,c)=>{const o=$(id);if(o){o.textContent=t;o.className='eh'+(c?' '+c:'')}};
  if(A){selOnFocus(A);A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''}}
  if(I){I.oninput=()=>{const v=dg(I.value).slice(0,24);I.value=ibanGroups(v);const bb=$('wdIb'),b5=v.length>=5?BANKS[v.slice(2,5)]||'':'';if(bb)bb.innerHTML=b5?bankBadge(b5,'lg')+'<span>'+esc(b5)+'</span>':'';
    if(!v){h('wdIv','بدون شبا هم می‌رود، اما در لیست واریزی خطادار علامت می‌خورد');return}if(v.length<24){h('wdIv',toFa(v.length)+' از ۲۴ رقم');return}if(!ibanOk('IR'+v)){h('wdIv','شماره شبا اشتباه است','bad');return}h('wdIv','شماره شبا معتبر است · در مشخصات مشتری ذخیره می‌شود','ok')};I.oninput()}
  if(K){K.oninput=()=>{const v=dg(K.value).slice(0,16);K.value=grp4(v);h('wdKv',!v?'':v.length<16?toFa(v.length)+' از ۱۶ رقم':luhn(v)?'معتبر':'رقم کنترلی نمی‌خواند',v.length===16?(luhn(v)?'ok':'bad'):'')};if(K.value)K.oninput()}
  ['wdA','wdI','wdK','wdH'].forEach((id,i,L)=>{const el=$(id);if(el)el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const n=$(L[i+1]);if(n)n.focus();else el.blur()}})})}
/* اقلام واریزی مثل پنجره خرید: طلا (وزن، هر گرم)، سکه و ارز؛ وزن کل و هر گرم تمام‌شده */
function wdDocInfo(c){const X=(sv&&sv.xr)||[],rate=sv?sv.rate:0,items=[];let gw=0,ga=0;
  X.forEach(x=>{if(x.t!=='buy')return;const C=xrCalc(x,rate);if(!C.amount)return;if(x.a==='gold'){if(!x.pul){gw+=C.n;ga+=C.amount}items.push({k:'طلا',t:x.cat&&x.cat!=='متفرقه'?x.cat:'',q:x.pul?'':String(C.n),r:C.pg,amt:C.amount})}else{const A=XA[x.a]||{t:x.a,k:'c'};items.push({k:A.k==='f'?(A.s==='دلار'?'دلار':A.s==='یورو'?'یورو':'سایر'):'سکه',t:A.k==='f'?'':A.s||A.t,n:A.k==='f'&&A.s!=='دلار'&&A.s!=='یورو'?A.t:undefined,q:String(C.n),r:C.pg,amt:C.amount})}});
  gw=Math.round(gw*1000)/1000;return {items,w:gw,ppg:gw?Math.round(ga/gw):0}}
ACT.wdBack=()=>{wdRead();const tg=WD&&WD.tg;WD=null;ckOpen(tg)};
ACT.wdCal=()=>{wdRead();openCal(WD.pay||payDef(),iso=>{if(!WD)return;WD.pay=iso;wdShow()},{title:'تاریخ واریز',sub:'واریز مانده به حساب مشتری'})};
ACT.wdSave=()=>{wdRead();const c=svCu();if(!c||!WD)return;const X=Math.round(+WD.amount||0);
  if(!X){toast('مبلغ واریز را بنویسید',true);$('wdA').focus();return}if(X>WD.max+1){toast('مبلغ از مانده آزاد ('+fmt(WD.max)+') بیشتر است',true);$('wdA').focus();return}
  if(WD.iban&&(WD.iban.length!==24||!ibanOk('IR'+WD.iban))){toast('شماره شبا درست نیست',true);$('wdI').focus();return}
  /* اول سند ثبت شود تا شماره‌اش قطعی باشد (اگر تغییر نکرده، همان نسخه ثبت‌شده) */
  if(!sv.edit||svSig()!==sv.sig0){const er=svErr();if(er){toast('اول سند را کامل کنید: '+er,true);return}svAuto('bg')}
  if(!sv.edit){toast('سند ثبت نشد؛ دوباره امتحان کنید',true);return}
  const no=sv.edit.no,T=wdDocInfo(c),now=new Date().toISOString(),iban=WD.iban?'IR'+WD.iban:'',name=stripName(c.name||cuName(c)),holder=clean(WD.holder||'');
  /* مشخصات بانکی مشتری: خودکار ذخیره می‌شود (دفعه بعد پر است) */
  if(iban||WD.card){c.bk={iban,card:WD.card||'',holder:holder||name,at:now};c.updatedAt=now;saveCu()}
  if(dateVal!==todayISO()){dateVal=todayISO();ls.set('m_date',dateVal)}
  const ne={id:nid++,name,title:c.title||'',phone:toEn(c.phone||''),nid:toEn(c.nid||''),code:String(no),weight:T.w?String(T.w):'',amount:X,ppg:T.ppg,items:T.items.map(x=>({...x})),iban,card:WD.card||'',bank:'',holder:holder&&holder!==name?holder:'',payDate:WD.pay||payDef(),kind:'buy',settles:[],wd:{cu:c.id,no,amt:X},entryDate:todayISO(),createdBy:who(),updatedBy:who(),updatedAt:now};
  entries.push(ne);saveE();alloc=null;logA('add','ثبت واریزی (مانده سند)',name+' | سند '+toFa(no)+' | '+fmt(X)+' تومان | واریز '+dates(ne.payDate).fa,{ids:[ne.id],after:pick(ne)});
  const tg=WD.tg;WD=null;render();ckOpen(tg);toast(fmt(X)+' تومان رفت به لیست واریزی '+(payLab(ne.payDate)||dates(ne.payDate).fa)+(iban?'':' (بدون شبا؛ خطادار)'),!iban,'دیدن واریزی',()=>ACT.depGo({e:ne.id}))};
ACT.svWdRow=()=>toast('این ردیف از تأیید واریزی در بانک ساخته شده؛ برای تغییر، خود واریزی را عوض کنید')
