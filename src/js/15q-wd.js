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
/* v71.5 رفع باگ (خواسته صاحب اپ: «واریزی کامل تسویه شده ولی سند فروشنده هنوز «رفته برای واریز» است»):
   تسویه از مشتری در سند فروشنده حساب می‌شود اگر تأیید شده باشد (هر چیزی جز st:'wait' — تسویه‌های قدیمی st ندارند و در صفحه واریزی
   «تأیید شد» دیده می‌شدند ولی اینجا شمرده نمی‌شدند)، یا اگر هنوز در انتظار است ولی سند دریافتش در حساب پرداخت‌کننده ثبت شده
   (پول از حساب او کم شده؛ پس حساب فروشنده هم باید همان لحظه تسویه شود — دوطرفه). فقط آن ردیف «در انتظار تأیید» برچسب می‌خورد (w). */
const stlBooked=z=>{if(!z||!z.byInv)return false;const c=custs.find(q=>String(q.id)===String(z.byInv.cu));return !!(c&&(c.txs||[]).some(t=>String(t.id)===String(z.byInv.tx)&&!t.del))};
const stlCounts=z=>!!(+(z&&z.amount))&&(z.st!=='wait'||stlBooked(z));
function wdState(e,F,BI){const ok=[],bi=BI||entBI;if(!F){try{F=famOf(e)}catch(_){F=[e]}}if(!F.length)F=[e];
  F.forEach(p=>{const b=bi(p);if(b&&b.it.st==='ok')ok.push({k:'wd'+p.id,a:+b.it.amount||+p.amount||0,src:b.it.src||'',tn:b.it.tn||'',at:b.it.at||''})});
  (e.settles||[]).forEach((z,i)=>{if(stlCounts(z))ok.push({k:'wds'+e.id+'.'+(z.id||i),a:+z.amount,nm:z.name||'',tn:z.tn||'',at:z.okAt||z.at||'',w:z.st==='wait'?1:0})});
  const done=ok.reduce((s,o)=>s+o.a,0),amt=+(e.wd.amt)||+e.amount||0;return {ok,done,amt,pend:Math.max(0,Math.round(amt-done))}}
/* v67.5 (خواسته صاحب اپ): مانده در انتظار یک واریزی به تفکیک — هر تسویه از مشتری (با سند دریافت خودش) و هر بخش بانکی جدا،
   تا در سند فروشنده هر بخش ردیف خودش را داشته باشد (نه یک ردیف کلی). جمع بخش‌ها = S.pend (اختلاف احتمالی در ردیف بانک). */
/* v78.5 (خواسته صاحب اپ): هر بخش بانکی که هنوز نه بانکی گرفته نه ارسال شده fr:1 دارد = «در لیست واریز · تخصیص نخورده» (بنفش کم‌رنگ، جزو مانده آزاد)؛
   بقیه (بانک خورده، ارسال‌شده، تسویه از مشتری در انتظار) = تخصیص‌شده، زرد «در انتظار تأیید» تا تأیید واریزی */
/* مبلغ بانکی خالص یک واریزی از رکورد ذخیره‌شده (نه ردیف validated که خالص است) */
function depNet(p){const e=(p&&entries.find(z=>z.id===p.id))||p;if(!e)return 0;return Math.max(0,Math.round((+e.amount||0)-(e.settles||[]).reduce((s,z)=>s+(+z.amount||0),0)))}
function wdParts(e,S,A){S=S||wdState(e);if(!S.pend)return [];A=A||allocMap();let F;try{F=famOf(e)}catch(_){F=[e]}if(!F.length)F=[e];const P=[];
  (e.settles||[]).forEach((z,i)=>{if(stlCounts(z)||!(+z.amount))return;const c=z.byInv&&custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);
    P.push({k:'s'+(z.id||i),t:'s',a:+z.amount,nm:z.name||'مشتری',doc:t?invTitle(t):'',cu:t?c.id:null,tx:t?t.id:null,tn:z.tn||''})});
  /* v84.8 رفع باگ از ریشه (خواسته صاحب اپ: «واریزی برای سپه ارسال شده ولی در حساب مشتری «تخصیص نخورده» است»):
     famOf ردیف‌های validated() را می‌دهد که amount آن‌ها خالص است (کل − تسویه از مشتری). اینجا تسویه دوباره کم می‌شد → بخش بانکیِ
     ارسال‌شده صفر و همه مانده «در لیست واریزی · هنوز تخصیص نخورده» (بنفش) دیده می‌شد. حالا مبلغ بانکی همیشه از خود واریزی ذخیره‌شده (entries)
     حساب می‌شود: مبلغ کل − جمع تسویه‌ها (depNet)، هر نوع ردیفی که برسد */
  F.forEach(p=>{const b=entBI(p);if(b&&b.it.st==='ok')return;const a=depNet(p);if(!a)return;const al=A&&A.get(p.id);
    P.push({k:'b'+p.id,t:'b',a,ent:p.id,fr:!b&&!(al&&al.src)?1:0,src:(b&&b.it.src)||(al&&al.src)||'',st:b?(b.it.st==='fail'?'ناموفق در بانک':'ارسال‌شده به بانک · منتظر تأیید'):al&&al.src?'تخصیص خورده · هنوز ارسال نشده':'در لیست واریزی · هنوز تخصیص نخورده'})});
  const sum=P.reduce((s,o)=>s+o.a,0),d=S.pend-sum;
  if(d){const b=P.find(o=>o.t==='b');if(b&&b.a+d>0)b.a+=d;else if(d>0)P.push({k:'r',t:'b',a:d,ent:e.id,fr:1,src:'',st:'در لیست واریزی · هنوز تخصیص نخورده'})}
  return P.filter(o=>o.a>0)}
/* ردیف تأییدشده «تسویه از مشتری» در سند فروشنده: عنوان سند دریافت پرداخت‌کننده (wk = wds<واریزی>.<تسویه>) */
function wdSetDoc(p){const m=/^wds(.+)\.([^.]+)$/.exec(String(p.wk||''));if(!m)return '';const e=entries.find(x=>String(x.id)===m[1]),z=e&&(e.settles||[]).find(q=>String(q.id)===m[2]);if(!z||!z.byInv)return '';
  const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);return t?invTitle(t):''}
/* مانده در انتظار واریز همه مشتری‌ها یک‌جا (فهرست مشتری‌ها و فیلتر): خانواده‌ها و ردیف‌های ارسال‌شده یک بار ساخته می‌شوند */
let wdAL=new Map(),wdFR=new Map();/* v78.5: تخصیص‌شده / تخصیص‌نخورده هر مشتری (همراه wdMap ساخته می‌شود) */
function wdMap(){const M=new Map(),R=wdRoots();wdAL=new Map();wdFR=new Map();if(!R.length)return M;const AM=allocMap();const V=validated(),FM=new Map(),IM=new Map();
  V.forEach(r=>{const k=famRoot(r);(FM.get(k)||FM.set(k,[]).get(k)).push(r)});batches.forEach(b=>b.items.forEach((it,i)=>{if(!IM.has(it.id))IM.set(it.id,{b,i,it})}));
  const bi=x=>IM.get(x.id)||null;
  R.forEach(e=>{const F=(FM.get(famRoot(e))||[e]).slice().sort((a,b)=>(a.id===e.id?-1:b.id===e.id?1:a.id-b.id)),S=wdState(e,F,bi);if(S.pend>0){const k=String(e.wd.cu);M.set(k,(M.get(k)||0)+S.pend);let fr=0;wdParts(e,S,AM).forEach(o=>{if(o.fr)fr+=o.a});fr=Math.min(fr,S.pend);if(fr)wdFR.set(k,(wdFR.get(k)||0)+fr);if(S.pend-fr>0)wdAL.set(k,(wdAL.get(k)||0)+S.pend-fr)}});return M}
/* v78.5: یک مشتری (یا یک سند): {fr: در لیست واریز بدون تخصیص, al: تخصیص‌شده در انتظار تأیید} */
function wdSpl(c,no){const o={fr:0,al:0};if(!c)return o;const A=allocMap();wdPendL(c,no).forEach(({e,S})=>{let fr=0;wdParts(e,S,A).forEach(q=>{if(q.fr)fr+=q.a});fr=Math.min(fr,S.pend);o.fr+=fr;o.al+=S.pend-fr});return o}
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
        if(o&&(Math.abs(pAmt(p))!==o.a||(p.src||'')!==(o.src||'')||(p.tn||'')!==(o.tn||'')||!!p.w!==!!o.w)){p.amount=-o.a;p.src=o.src||'';p.tn=o.tn||'';if(o.w)p.w=1;else delete p.w;tc=true}P.push(p)}
      L.forEach(o=>{if(seen.has(o.k))return;seen.add(o.k);P.push({m:'wd',dir:'out',amount:-o.a,wk:o.k,entId:o.ent,src:o.src||'',nm:o.nm||'',tn:o.tn||'',q:'',at:o.at||now,...(o.w?{w:1}:{})});tc=true});
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
      R.push(d6Row({ico:o.fr?'cal':'clock',tag:o.fr?'<em class="d6k k-wf">در لیست واریز</em>':'<em class="d6k k-wd">در انتظار تأیید</em>',b:'واریز بانکی'+(o.src?' · '+esc(o.src):''),sub,v:o.fr?v.replace('d6e wdv','d6e wdv wf').replace('رفته برای واریز','تخصیص نخورده · آزاد'):v.replace('رفته برای واریز','تخصیص‌شده'),ex:depL+wdActs(e,o),key:'w'+e.id+o.k}))})});return R}
/* v98.6 (خواسته صاحب اپ: «مانده مستقیم ادیت و تخصیص داده شود»): زیر ردیف واریزی سند دو دکمه — «مبلغ واریزی» (wdAmt) و «انتخاب بانک» (همان پنجره پرداخت، pxUni) */
function wdActs(e,o){if(!o||o.t!=='b')return '';const p=entries.find(z=>z.id===o.ent),un=p&&p.sentBid==null,B=[];
  if(remCan())B.push(`<span class="d8eb" role="button" data-act="wdAmt" data-e="${e.id}">${ic('edit')}<span>مبلغ واریزی</span></span>`);
  if(un&&can('split'))B.push(`<span class="d8eb" role="button" data-act="entMove" data-id="${p.id}">${ic('bank')}<span>${o.src?'تغییر بانک':'انتخاب بانک'}</span></span>`);
  return B.length?`<span class="wdab">${B.join('')}</span>`:''}
/* ---- v87.7 «مسیر پرداخت» (خواسته صاحب اپ: «مدل خوانا و منطقی که بچه‌ها گیج نشوند؛ هم در حساب و سند، هم در لیست مشتری»)
   یک زبان و یک رنگ در همه جا. بدهی ما به مشتری سه مرحله دارد (واریزشده از مانده کم شده و دیگر اینجا نیست):
   ۱ نرفته به لیست (قرمز) → ۲ در لیست، تخصیص نخورده (بنفش) → ۳ تخصیص‌شده، منتظر واریز (زرد).
   ppParts = عددها؛ ppBar = نوار سه‌رنگ؛ ppLine = یک خط (فوری‌ترین مرحله) برای فهرست؛ ppCard = کارت کامل برای حساب و سند */
const PPS=[['free','f','نرفته به لیست','هنوز واریزی برایش ثبت نشده'],['wf','l','در لیست · تخصیص نخورده','واریزی ثبت شده، بانک انتخاب نشده'],['wa','a','تخصیص‌شده · منتظر واریز','بانک انتخاب شده، منتظر واریز و تأیید']];
function ppParts(R,wp,wa){wp=Math.max(0,Math.round(+wp||0));wa=Math.min(wp,Math.max(0,Math.round(+wa||0)));const tot=Math.max(Math.round(+R||0),wp);return {tot,free:tot-wp,wf:wp-wa,wa}}
function ppBar(p,big){return `<span class="ppb${big?' big':''}" aria-hidden="true">${PPS.map(([k,c])=>p[k]>0?`<i class="p${c}" style="flex-grow:${Math.max(p[k]/p.tot,.06).toFixed(3)}"></i>`:'').join('')}</span>`}
/* v88.0 (خواسته صاحب اپ: «فشرده‌تر با همه داده‌ها»): در فهرست فقط یک خط — هر مرحله یک کلمه + عدد به میلیون؛ نوار = لبه پایین کاشی (بدون ارتفاع) */
const PPL={f:'نرفته',l:'در لیست',a:'تخصیص‌شده'},PPF={l:'در لیست · منتظر تخصیص',a:'تخصیص‌شده · منتظر واریز'},ppM=n=>{n=Math.round(+n||0);return n>=1e6?fmt(Math.round(n/1e5)/10).replace('.','٫')+'م':fmt(n)};
/* v88.1 (خواسته صاحب اپ: «هنوز کمی گیج‌کننده»): همه مانده در یک مرحله = یک جمله کامل بدون عدد؛ چند مرحله = «عدد + کلمه» در قرص‌های سفید */
/* v91.7 (گزارش صاحب اپ: «بخشی از کلمه تخصیص در کادر نیست»): برچسب‌ها هیچ‌وقت بریده نمی‌شوند — پهنای نوشته (به em، از جدول اندازه‌گیری‌شده قلم) در --n می‌نشیند و
   قلم با پهنای کاشی (cqi) جمع می‌شود؛ اگر دو برچسب بلند باشند (nl) در کاشی باریک کلمه کوتاه («لیست»، «تخصیص») و در کاشی خیلی باریک فقط نقطه رنگی + عدد می‌ماند */
const PPSH={f:'نرفته',l:'لیست',a:'تخصیص'},PPE={f:[2.02,2.02],l:[3.5,2.46],a:[5.34,3.43],F:{l:10.45,a:10.57}},ppEm=t=>{let w=0;for(const ch of String(t))w+=/[۰-۹]/.test(ch)?.56:ch===','?.26:ch==='٫'?.45:.62;return w};
function ppLine(p){const S=PPS.filter(([k])=>p[k]>0),one=S.length===1&&PPF[S[0][1]],f2=v=>(v*1.05).toFixed(2),K=S.length,nn=S.reduce((a,[k])=>a+ppEm(ppM(p[k])),0),fd=K*20+(K-1)*3+2;
  if(one)return `<span class="ppl" style="--n:${f2(PPE.F[S[0][1]])};--fx:22px"><span class="${S[0][1]}"><i></i>${one}</span></span>`;
  if(K>2)return `<span class="ppl n3" style="--n:${f2(nn)};--fx:${K*16+(K-1)*3+2}px">${S.map(([k,c])=>`<span class="${c} n"><i></i>${ppM(p[k])}</span>`).join('')}</span>`;
  const n=nn+S.reduce((a,[k,c])=>a+.27+PPE[c][0],0),ns=nn+S.reduce((a,[k,c])=>a+.27+PPE[c][1],0);
  return `<span class="ppl${n>11.4?' nl':''}" style="--n:${f2(n)};--ns:${f2(ns)};--nn:${f2(nn)};--fx:${K*12+(K-1)*3+2}px;--fd:${fd}px">${S.map(([k,c])=>`<span class="${c}"><i class="d2"></i>${ppM(p[k])} <span class="lg">${PPL[c]}</span><span class="sh">${PPSH[c]}</span></span>`).join('')}</span>`}
const PPC={f:'نرفته به لیست',l:'در لیست',a:'تخصیص‌شده'};/* v87.8 (خواسته صاحب اپ: «فضای زیادی نگیرد»): کارت فشرده — یک خط عنوان، نوار، سه خانه کنار هم */
function ppCard(p,title,extra,cls){return `<div class="ppc${cls?' '+cls:''}"><div class="pph"><b>${title}</b><small>از ${fmt(p.tot)}</small></div>${ppBar(p,1)}<div class="pps">${PPS.map(([k,c])=>`<span class="ppr ${c}${p[k]>0?'':' z'}"><small><i></i>${PPC[c]}</small><b>${p[k]>0?fmt(p[k]):'—'}</b></span>`).join('')}</div>${extra||''}</div>`}
function wdSumHTML(c,no,tot){const E=wdRoots().filter(e=>String(e.wd.cu)===String(c.id)&&(no==null||String(e.wd.no)===String(no)));const s=wdSpl(c,no),sent=s.fr+s.al;if(!sent&&!E.length)return '';
  return ppCard(ppParts(tot,sent,s.al),no==null?'مسیر پرداخت مانده حساب':'مسیر پرداخت این سند')}
/* v88.5 قفل‌های ایمنی (بازبینی مسیرها):
   docDelLock = سندی که واریزی در لیست واریز دارد حذف نمی‌شود (قبلاً سند می‌رفت، واریزی در لیست می‌ماند و پول بدون طلب از بانک پرداخت می‌شد)،
   و سندی که با «حواله از واریزی» (m:'dep') یک واریزیِ تأییدشده بانک را پرداخت کرده هم؛ stlBkLock = واریز بانکی این واریزی تأیید شده، پس تسویه‌های مشتری‌اش
   دیگر عوض نمی‌شود (قبلاً مبلغ «واریز شد» بی‌صدا کم و زیاد می‌شد) */
const stlBkLock=e=>{const bi=e&&entBI(e);return !!(bi&&bi.it&&bi.it.st==='ok')};
const STLLK='واریز بانکی این واریزی تأیید شده؛ برای تغییر تسویه، اول تأیید بانک را در لیست واریز بردارید';
/* v88.8 (خواسته صاحب اپ: «با حذف سند، واریزی‌اش هم از لیست واریز حذف شود»): docWdL = واریزی‌های همین سند (با بخش‌های چندمنبعی)؛
   اگر هیچ‌کدام به بانک ارسال نشده و تسویه مشتری ندارد، با حذف سند به سطل بازیابی می‌روند (و با «بازگردانی» برمی‌گردند)؛
   اگر ارسال شده یا تسویه دارد، حذف سند بسته می‌ماند (پول در راه است) */
function docWdL(c,t){if(!c||!t||t.type!=='inv'||t.lk||t.pd||t.bl||t.bd)return [];const W=wdRoots().filter(e=>String(e.wd.cu)===String(c.id)&&String(e.wd.no)===String(t.no)),S=new Map();
  W.forEach(e=>{let F;try{F=famOf(e)}catch(_){F=[e]}[e,...F].forEach(x=>{const z=entries.find(q=>q.id===x.id);if(z)S.set(z.id,z)})});return [...S.values()]}
function docDelLock(c,t){if(!c||!t||t.del||t.type!=='inv'||t.lk||t.pd||t.bl||t.bd)return '';const W=docWdL(c,t);
  if(W.some(e=>entBI(e)||e.sentBid))return 'واریزی این سند به بانک ارسال شده؛ اول ارسال را در لیست واریز برگردانید، بعد سند را حذف کنید';
  if(W.some(e=>(e.settles||[]).length))return 'واریزی این سند تسویه از مشتری دارد؛ اول آن تسویه را بردارید، بعد سند را حذف کنید';
  /* v90.9: سندی که واریزیِ ارسال‌شده به بانک را پرداخت کرده حذف می‌شود — مبلغش «مانده» همان واریزی می‌شود (stlSync)، واریز بانکی دست نمی‌خورد؛ فقط مجوز ساخت مانده لازم است */
  for(const p of t.pays||[]){if(p.m!=='dep')continue;const e=entries.find(z=>String(z.id)===String(p.entId));if(e&&depBkFix(e)&&!remCan())return REMNO}return ''}
/* صفحه مشتری: زیر کارت مانده حساب — کارت مسیر پرداخت + واریزی‌های در راه (هر کدام = باز کردن واریزی) */
function wdCuHTML(c){const L=wdPendL(c);if(!L.length)return '';const A=allocMap(),b=cuBal(c);let fr=0,al=0;L.forEach(o=>{let f=0;wdParts(o.e,o.S,A).forEach(q=>{if(q.fr)f+=q.a});o.fr=Math.min(f,o.S.pend);o.al=o.S.pend-o.fr;fr+=o.fr;al+=o.al});
  const rows=L.map(({e,S,fr,al})=>`<button type="button" class="ppd ${al&&!fr?'a':'l'}" data-act="depGo" data-e="${e.id}"><i></i><b>${fmt(S.pend)}</b><small>سند ${toFa(e.wd.no)} · ${esc(payLab(PD(e))||dates(PD(e)).fa)}</small><em>${al&&fr?'بخشی تخصیص‌شده':al?'تخصیص‌شده':'تخصیص نخورده'}</em>${ic('back').replace('class="i"','class="i flip"')}</button>`).join('');
  return ppCard(ppParts(b.R,fr+al,al),'مسیر پرداخت بدهی',rows)}
/* پنجره تسویه: سطر «رفته برای واریز» زیر عدد مانده */
/* v87.6 (خواسته صاحب اپ): در زمان ارسال به لیست — مانده کل · رفته به لیست · نرفته به لیست */
/* v98.6 (خواسته صاحب اپ: «مانده این فاکتور را برای تخصیص پیشنهاد بده نه کلش، وقتی مانده قبلی تخصیص داده شده بود»):
   مانده آزاد = مانده‌ای که در پنجره تسویه دیده می‌شود − واریزی‌هایی که برای همان مانده رفته‌اند. «کل حساب» (f) همه واریزی‌های مشتری را کم می‌کند
   (قبلاً فقط واریزی همین سند، و در سند تازه هیچ‌کدام → کل مانده دوباره پیشنهاد می‌شد)؛ «این سند» (d) فقط واریزی همین سند؛ «مانده قبلی» (p) بقیه */
const wdPendTg=c=>{if(!c)return 0;const t=typeof ckTg==='function'?ckTg():'f',own=sv&&sv.edit?wdPend(c,sv.edit.no):0;return t==='d'?own:t==='p'?Math.max(0,wdPend(c)-own):wdPend(c)};
function wdCkHTML(){const c=svCu();if(!c)return '';const t=typeof ckTg==='function'?ckTg():'f';if(t==='d'){if(!sv.edit)return '';return wdPend(c,sv.edit.no)?wdSumHTML(c,sv.edit.no,ckLeft()):''}return wdPend(c)?wdSumHTML(c,null,ckLeft()):''}
const wdFree=()=>{const c=svCu();return Math.max(0,ckLeft()-wdPendTg(c))};
/* ---- v98.6 واریزی سند همراه سند (خواسته صاحب اپ: «وقتی مبلغ فاکتور ویرایش می‌شود مانده تخصیص‌داده‌شده چیدمان درست داشته باشد که دوباره حذف و تخصیص دوباره نشود؛
   وقتی پرداختی انجام شد و از مانده تخصیص‌داده‌شده کم شد، مانده اصلاح شود؛ مانده مستقیم ادیت و تخصیص داده شود»).
   قاعده: جمع واریزی‌های در راه یک مشتری (wdPend) هرگز از بدهی ما به او (cuBal.R) بیشتر نمی‌شود.
   wdAdj(e,d): مبلغ در راه یک واریزی (ریشه e) را d تومان کم/زیاد می‌کند — فقط بخش‌های ارسال‌نشده؛ کم کردن اول از بخش‌های بی‌بانک (مانده‌ها)،
   بعد بخش‌های بانک‌دار، ریشه آخر؛ بخش صفرشده برداشته می‌شود و اگر کل واریزی صفر شد به سطل بازیافت می‌رود. زیاد کردن روی ریشه (اگر ارسال نشده)
   وگرنه یک «مانده» آزاد (depRemAdd). wd.amt همراهش عوض می‌شود. wdFit بعد از هر ثبت سند (svCommit) این قاعده را برقرار می‌کند؛
   اگر واریزی‌های این سند پیش از ویرایش کل بدهی را پوشانده بودند و بدهی بیشتر شد، واریزی همین سند همان‌قدر بزرگ می‌شود. */
const wdFam=e=>entries.filter(z=>!z.del&&(z.id===e.id||z.splitOf===e.id));
function wdPartRm(id){allParts().forEach(p=>{if(!p.sent&&(p.ids||[]).includes(id)){p.ids=p.ids.filter(z=>z!==id);if(!p.ids.length)delPart(p)}})}
function wdAdj(e,d){d=Math.round(+d||0);if(!e||!e.wd||!d)return 0;const now=ns();
  if(d>0){if(e.sentBid==null){e.amount=(+e.amount||0)+d;e.updatedAt=now;e.updatedBy=who()}else depRemAdd(e,d);e.wd.amt=Math.round((+e.wd.amt||+e.amount||0)+d);memoClear();alloc=null;return d}
  let need=-d,got=0;const F=wdFam(e).filter(z=>z.sentBid==null),al=id=>pkSrcOf(id)?1:0,dead=[];
  const ord=F.filter(z=>z.id!==e.id).sort((a,b)=>al(a.id)-al(b.id)||b.id-a.id);if(F.includes(e))ord.push(e);
  for(const p of ord){if(need<=0)break;const net=depNet(p),root=p.id===e.id;let k=Math.min(net,need);
    /* ریشه بی‌تسویه‌ای که بخش زنده دیگری دارد صفر نمی‌شود (ردیف صفر در لیست)؛ با تسویه مشتری صفرِ خالص یعنی «تسویه کامل» و درست است */
    if(root&&k>=net&&!(e.settles||[]).length&&wdFam(e).some(z=>z.id!==e.id&&!dead.includes(z.id)))k=0;
    if(!(k>0))continue;p.amount=(+p.amount||0)-k;p.updatedAt=now;p.updatedBy=who();need-=k;got+=k;if(!root&&!(depNet(p)>0))dead.push(p.id)}
  dead.forEach(wdPartRm);if(dead.length)entries=entries.filter(z=>!dead.includes(z.id));
  e.wd.amt=Math.max(0,Math.round((+e.wd.amt||0)-got));memoClear();alloc=null;
  if(e.sentBid==null&&!(depNet(e)>0)&&!(e.settles||[]).length&&!wdFam(e).some(z=>z.id!==e.id)){wdPartRm(e.id);trashIds([e.id],'مبلغ سند کم شد')}
  return got}
const wdOwe=c=>{memoClear();return Math.max(0,Math.round(cuBal(c).R||0))};
function wdFit(c,no,R0,D0){if(!c||c.grp==='بانک')return '';const L=wdPendL(c);if(!L.length)return '';const R1=wdOwe(c),D=L.reduce((s,o)=>s+o.S.pend,0);let msg='';
  if(D>R1+1){if(!remCan())return 'واریزی‌های در راه این حساب '+fmt(D-R1)+' تومان از مانده بیشتر است؛ حساب شما اجازه تغییر واریزی ندارد';
    let need=D-R1;const O=L.slice().sort((a,b)=>(String(b.e.wd.no)===String(no))-(String(a.e.wd.no)===String(no))||b.e.id-a.e.id);
    for(const o of O){if(need<=0)break;need-=wdAdj(entries.find(z=>z.id===o.e.id),-Math.min(need,o.S.pend))}
    msg=need>0?'واریزی در راه '+fmt(need)+' تومان از مانده بیشتر است (بخش ارسال‌شده عوض نمی‌شود)':'واریزی در لیست '+fmt(D-R1)+' تومان کم شد · '+fmt(R1)+' تومان مانده'}
  else if(no!=null&&D0>0&&D0>=Math.max(0,R0)-1&&R1>Math.max(0,R0)&&remCan()){const own=L.filter(o=>String(o.e.wd.no)===String(no)),add=R1-D;
    if(own.length&&add>0){wdAdj(entries.find(z=>z.id===own[own.length-1].e.id),add);msg='واریزی در لیست '+fmt(add)+' تومان بیشتر شد · '+fmt(R1)+' تومان'}}
  if(msg){saveE();saveD();memoClear();alloc=null;logA('split','هماهنگی واریزی با مانده سند',cuName(c)+' | سند '+toFa(no)+' | '+msg)}return msg}
/* ---------- فرم واریز ---------- */
let WD=null;
function wdBank(c){if(c.bk&&c.bk.iban)return {...c.bk,from:'c'};const k=nzName(cuName(c)),k2=nzName(c.name||''),p=bzPeople().find(z=>String(z.cuId)===String(c.id)&&z.iban)||bzPeople().find(z=>(z.k===k||z.k===k2)&&z.iban);return p?{iban:p.iban,card:p.card||'',holder:p.holder||'',from:'e'}:{iban:'',card:'',holder:''}}
function wdOpen(){const c=svCu();if(!c)return;const free=wdFree();if(!free){toast('همه این مانده قبلاً برای واریز رفته است',true);return}const B=wdBank(c);
  WD={amount:free,max:free,iban:dg(B.iban||'').slice(0,24),card:dg(B.card||'').slice(0,16),holder:B.holder||clean(c.name||''),from:B.from||'',pay:payDef(),tg:CK&&CK.tg};wdShow()}
function wdRead(){if(!WD)return;const g=id=>{const e=$(id);return e?e.value:undefined};if($('wdA'))WD.amount=num(g('wdA'));if($('wdI'))WD.iban=dg(g('wdI')).slice(0,24);if($('wdK'))WD.card=dg(g('wdK')).slice(0,16);if($('wdH'))WD.holder=clean(g('wdH')||'')}
function wdShow(){const c=svCu();if(!c||!WD)return;const no=sv.edit?sv.edit.no:invNext(),T=wdDocInfo(c);
  sheet(`<div class="wdw"><div class="sh-h"><div><b>واریز به مشتری</b><small class="shsub">${esc(cuName(c))} · مانده به لیست واریزی می‌رود</small></div><button class="x" data-act="wdBack" aria-label="بازگشت">×</button></div>
  <div class="px8a wdam2"><small>مبلغ واریز</small><label class="px8i"><input id="wdA" class="ltr" inputmode="numeric" value="${WD.amount?Number(WD.amount).toLocaleString('en-US'):''}" autocomplete="off" aria-label="مبلغ واریز"><i>تومان</i></label><div class="px8l">مانده آزاد <b class="n">${fmt(WD.max)}</b> تومان</div></div>${sv.edit&&wdPend(c,sv.edit.no)?wdSumHTML(c,sv.edit.no,WD.max+wdPend(c,sv.edit.no)):''}
  <div class="f6 bzf6 wdf6">${(()=>{const sec=(ico,t,x)=>`<div class="c9h"><span class="c9hi">${ic(ico)}</span><b>${t}</b>${x||''}</div>`;/* v76.2 (خواسته صاحب اپ): مثل فرم خرید دستی — بخش‌های عنوان‌دار با ردیف‌های یک‌خطی در کارت */
    return sec('bank','حساب بانکی مشتری',WD.from==='c'?'<i>از مشخصات مشتری</i>':WD.from==='e'?'<i>از واریزی قبلی</i>':'')
    +`<div class="f6g"><div class="f6r wdibr"><label for="wdI">شبا</label><div class="f6i ibin"><input id="wdI" inputmode="numeric" value="${esc(ibanGroups(WD.iban))}" placeholder="۲۴ رقم" autocomplete="off" enterkeyhint="next"><span class="ibir">IR</span><span class="ibbk" id="wdIb"></span></div><small class="eh" id="wdIv"></small></div>
    ${f6Row('wdK','کارت',grp4(WD.card),{ltr:1,im:'numeric',ph:'۱۶ رقم · اختیاری',hint:1})}${f6Row('wdH','صاحب حساب',WD.holder,{ph:'نام صاحب حساب',hint:1,last:1})}</div>`
    +sec('cal','تاریخ واریز')+`<div class="f6g"><button class="bzdate wdd" data-act="wdCal">${ic('cal')}<span><b>${esc(payLab(WD.pay))}</b><small>${esc(dates(WD.pay).wd+' '+dates(WD.pay).fa)}</small></span>${ic('chev')}</button></div>`})()}</div>
  <div class="bzrev wdrev"><div><small>شماره فاکتور</small><b>${toFa(no)}</b></div>${T.w?`<div><small>وزن طلا</small><b>${wFmt(T.w)} <i>گرم</i></b></div>`:''}${T.ppg?`<div><small>هر گرم تمام‌شده</small><b>${fmt(T.ppg)} <i>تومان</i></b></div>`:''}${T.items.filter(x=>x.k!=='طلا').map(x=>`<div><small>${esc(x.k+(x.t?' '+x.t:''))}</small><b>${x.q?esc(toFa(x.q))+' · ':''}${fmt(x.amt)}</b></div>`).join('')}</div>
  <button class="xgo wdgo" data-act="wdSave">${ic('check')} ارسال</button>
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
  /* v81.6 رفع باگ (خواسته صاحب اپ: «واریز به حساب مشتری عمل نمی‌کند»): واریز مانده قبلی از سند خالی (بدون ردیف) رد می‌شد («سند ردیفی ندارد») و هیچ اتفاقی نمی‌افتاد.
     حالا سند خالی به‌عنوان سند همین واریز ثبت می‌شود (بعد از تأیید بانک ردیف واریز در همین سند می‌نشیند) */
  if(!sv.edit||svSig()!==sv.sig0){if(!svRows()&&!sv.edit){const R=svCommit();sv.edit={tx:R.t.id,no:R.t.no};sv.sig0=svSig();svKeep();TITLES.sell='ویرایش سند '+toFa(R.t.no)}else{const er=svErr();if(er){toast('اول سند را کامل کنید: '+er,true);return}svAuto('bg')}}
  if(!sv.edit){toast('سند ثبت نشد؛ دوباره امتحان کنید',true);return}
  const no=sv.edit.no,T=wdDocInfo(c),now=new Date().toISOString(),iban=WD.iban?'IR'+WD.iban:'',cn=clean(stripName(c.name||cuName(c)).replace(/[(（][^)）]*[)）]/g,' ')),holder=clean(WD.holder||''),name=cn||holder;/* v87.0 (خواسته صاحب اپ: «نام مشتری و صاحب حساب جدا و درست»): نام واریزی = مشتری، صاحب حساب جدا در holder (متن بانک با accName همان صاحب حساب را می‌نویسد) *//* v81.2 (خواسته صاحب اپ: «نام واریزی باید درست شود»): نام واریزی = صاحب حساب بانکی (کسی که پول به حسابش می‌رود)، وگرنه نام مشتری بدون توضیح داخل پرانتز؛ پیوند به مشتری در wd.cu می‌ماند */
  /* مشخصات بانکی مشتری: خودکار ذخیره می‌شود (دفعه بعد پر است) */
  if(iban||WD.card){c.bk={iban,card:WD.card||'',holder:holder||cn,at:now};c.updatedAt=now;saveCu()}
  if(dateVal!==todayISO()){dateVal=todayISO();ls.set('m_date',dateVal)}
  const ne={id:nid++,name,title:c.title||'',phone:toEn(c.phone||''),nid:toEn(c.nid||''),code:String(no),weight:T.w?String(T.w):'',amount:X,ppg:T.ppg,items:T.items.map(x=>({...x})),iban,card:WD.card||'',bank:'',holder:holder&&hnz(holder)!==hnz(cn)?holder:'',payDate:WD.pay||payDef(),kind:'buy',settles:[],wd:{cu:c.id,no,amt:X},entryDate:todayISO(),createdBy:who(),updatedBy:who(),updatedAt:now};
  entries.push(ne);saveE();alloc=null;logA('add','ثبت واریزی (مانده سند)',name+' | سند '+toFa(no)+' | '+fmt(X)+' تومان | واریز '+dates(ne.payDate).fa,{ids:[ne.id],after:pick(ne)});
  const tg=WD.tg;WD=null;/* v81.7: اول خود دکمه «✓ ارسال شد» می‌شود، بعد پنجره تسویه (WD=null جلوی ثبت دوباره را می‌گیرد) */{const B=document.querySelector('#sheet .sh-h .xtop');if(B&&typeof btnOk==='function')btnOk(B,'ارسال شد')}setTimeout(()=>{render();ckOpen(tg)},RM()?0:650);toast(fmt(X)+' تومان رفت به لیست واریزی '+(payLab(ne.payDate)||dates(ne.payDate).fa)+(iban?'':' (بدون شبا؛ خطادار)'),!iban,'دیدن واریزی',()=>ACT.depGo({e:ne.id}))};
ACT.svWdRow=()=>toast('این ردیف از تأیید واریزی در بانک ساخته شده؛ برای تغییر، خود واریزی را عوض کنید')

/* ---- v98.6 پنجره «مبلغ واریزی» (wdAmt): مبلغ در راه یک واریزی سند را مستقیم عوض می‌کند (wdAdj) — سقف = بدهی ما − واریزی‌های دیگر، کف = بخش ارسال‌شده و تسویه‌های در انتظار */
let WA=null;
function waInfo(){const e=WA&&entries.find(z=>z.id===WA.e);if(!e||!e.wd)return null;const c=custs.find(z=>String(z.id)===String(e.wd.cu));if(!c)return null;const S=wdState(e),cur=S.pend,P=wdParts(e,S);
  const lock=P.reduce((a,q)=>a+(q.t==='s'||(q.ent!=null&&(entries.find(z=>z.id===q.ent)||{}).sentBid!=null)?q.a:0),0),owe=wdOwe(c),oth=Math.max(0,wdPend(c)-cur),max=Math.max(cur,owe-oth);return {e,c,cur,lock,owe,oth,max}}
function waRes(){const I=waInfo();if(!I)return '';const X=WA.v===''?null:+WA.v;
  if(X==null)return `<div class="bf3d n"><span class="bf3di">${ic('edit')}</span><span class="tx"><b>مبلغ را بزنید</b><small>بدهی ما ${fmt(I.owe)}${I.oth?' · واریزی‌های دیگر '+fmt(I.oth):''}</small></span></div>`;
  if(X>I.max)return `<div class="bf3d r"><span class="bf3di">${ic('x')}</span><span class="tx"><b>بیشتر از مانده آزاد</b><small>حداکثر ${fmt(I.max)} تومان</small></span></div>`;
  if(X<I.lock)return `<div class="bf3d r"><span class="bf3di">${ic('x')}</span><span class="tx"><b>کمتر از بخش ارسال‌شده</b><small>حداقل ${fmt(I.lock)} تومان (ارسال‌شده یا تسویه در انتظار)</small></span></div>`;
  const d=X-I.cur;if(!d)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>بدون تغییر</b><small>${fmt(I.cur)} تومان در لیست</small></span></div>`;
  return `<div class="bf3d ${d>0?'g':'r'}"><span class="bf3di">${ic(d>0?'dIn':'dOut')}</span><span class="tx"><b>${d>0?'به واریزی اضافه می‌شود':(X?'از واریزی کم می‌شود':'واریزی برداشته می‌شود')}</b><small>${X&&I.owe-I.oth-X>0?'از بدهی '+fmt(I.owe-I.oth-X)+' تومان آزاد می‌ماند':'کل بدهی در لیست واریز'}</small></span><em data-v="${Math.abs(d)}">${d>0?'+':'−'}${fmt(Math.abs(d))}</em></div>`}
function waHTML(){const I=waInfo();if(!I)return '';const v=WA.v===''?'':Number(WA.v).toLocaleString('en-US');
  return `<div class="sh-h"><div><b>مبلغ واریزی</b><small class="shsub">${esc(cuName(I.c))} · سند ${toFa(I.e.wd.no)} · الان ${fmt(I.cur)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bf3 bf4"><div class="ckcl">چقدر از بدهی به لیست واریز برود؟</div>
  <div class="ckbg"><label class="ckbig"><input id="waA" class="ltr" inputmode="numeric" value="${v}" placeholder="${fmt(I.cur)}" autocomplete="off" enterkeyhint="done" aria-label="مبلغ واریزی"><i>تومان</i></label>
  <div class="ckq"><button type="button" data-act="waQ" data-v="${I.max}">کل مانده آزاد · ${fmt(I.max)}</button>${I.lock?`<button type="button" data-act="waQ" data-v="${I.lock}">فقط ارسال‌شده · ${fmt(I.lock)}</button>`:''}</div></div>
  <div id="waL">${waRes()}</div>
  <button type="button" class="xgo" data-act="waSave">${ic('check')} ثبت</button></div>`}
function waBind(f){const A=$('waA');if(!A)return;selOnFocus(A);A.oninput=()=>{const n=num(A.value);A.value=n?n.toLocaleString('en-US'):/\d/.test(toEn(A.value))?'0':'';WA.v=A.value===''?'':n;const L=$('waL');if(L)L.innerHTML=waRes()};A.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();A.blur()}};if(f)sheetFocus(A)}
ACT.wdAmt=d=>{if(!remCan()){toast(REMNO,true);return}const e=entries.find(z=>String(z.id)===String(d.e));if(!e||!e.wd)return;WA={e:e.id,v:''};const I=waInfo();if(!I)return;WA.v=I.cur;sheet(waHTML());waBind(1)};
ACT.waQ=d=>{if(!WA)return;WA.v=+d.v;$('sheet').innerHTML=waHTML();waBind()};
ACT.waSave=()=>{const I=waInfo();if(!I)return;const X=WA.v===''?I.cur:Math.round(+WA.v);if(X>I.max){toast('حداکثر '+fmt(I.max)+' تومان',true);return}if(X<I.lock){toast('حداقل '+fmt(I.lock)+' تومان (بخش ارسال‌شده)',true);return}
  const d=X-I.cur;if(!d){WA=null;closeSheet();return}const got=wdAdj(I.e,d);saveE();saveD();logA('split','ویرایش مبلغ واریزی سند',fullName(I.e)+' | سند '+toFa(I.e.wd.no)+' | '+fmt(I.cur)+' ← '+fmt(I.cur+(d>0?got:-got))+' تومان',{ids:[I.e.id]});
  WA=null;closeSheet();const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;toast(d>0?'واریزی '+fmt(got)+' تومان بیشتر شد':got>=-d?'واریزی '+fmt(got)+' تومان کم شد':'فقط '+fmt(got)+' تومان کم شد (بخش ارسال‌شده عوض نمی‌شود)')};
