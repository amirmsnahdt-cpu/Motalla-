/* ============ لیست‌ها ============ */
const SORTS={seq:'ترتیب ثبت (ردیف)',new:'آخرین ثبت، اول',amtD:'مبلغ: بیشترین اول',amtA:'مبلغ: کمترین اول',name:'نام (الفبا)',bank:'بانک مقصد',err:'خطادارها اول'};
const faColl=new Intl.Collator('fa');
function sortRows(a){const s=listSort,c=[...a];
  const f={seq:(x,y)=>x.entryDate===y.entryDate?x.seq-y.seq:(x.entryDate<y.entryDate?1:-1),new:(x,y)=>String(y.updatedAt||y.id).localeCompare(String(x.updatedAt||x.id))||(y.id-x.id),amtD:(x,y)=>y.amount-x.amount,amtA:(x,y)=>x.amount-y.amount,name:(x,y)=>faColl.compare(x.name||'',y.name||''),bank:(x,y)=>faColl.compare(x.bankShow||'',y.bankShow||'')||x.seq-y.seq,err:(x,y)=>(y.level-x.level)||x.seq-y.seq}[s]||(()=>0);
  return c.sort(f)}
/* کدام فیلدها با عبارت جست‌وجو تطابق دارند */
function match(r,q){const qn=norm(q).trim();if(!qn)return null;const qd=toEn(q).replace(/\D/g,''),h={};
  if(norm(r.name).includes(qn))h.name=1;if(norm(r.code).includes(qn))h.code=1;if(norm(r.bankShow).includes(qn))h.bank=1;if(norm(r.createdBy).includes(qn))h.by=1;if(r.sentBid){const si=srcInfo(r.id);if(si&&(norm(si.src).includes(qn)||(qd.length>=3&&String(si.tn).includes(qd))))h.src=1}
  if(qd.length>=3){if(String(r.amount).includes(qd))h.amount=1;if((r.iban||'').includes(qd))h.iban=1;if((r.card||'').includes(qd))h.card=1;if((r.acct||'').includes(qd))h.acct=1}
  return Object.keys(h).length?h:null}
const HITNAME={src:'منبع',name:'نام',code:'فاکتور',bank:'بانک',by:'ثبت‌کننده',amount:'مبلغ',iban:'شبا',card:'کارت',acct:'حساب'};
const slipHTML=(r,q,h,sd)=>swW(slipCore(r,q,h,sd),{r:[['edit','ویرایش','edit','#3b6fd6'],['cpEnt','کپی','copy','#b8862b']],l:[['del','حذف','trash','#d23c48']],data:{id:r.id}});
function slipCore(r,q,h,showDate){h=h||{};const qq=q||'';
  const ib=cpIb((r.iban||'').slice(2)),ibx=h.iban?ib.replace('class="cp ib"','class="cp ib hl"'):ib;
  const ac=r.acct?cpPlain(r.acct):'',acx=h.acct?ac.replace('class="cp"','class="cp hl"'):ac,cd=r.card?cpCard(r.card):'',cdx=h.card?cd.replace('class="cp"','class="cp hl"'):cd;
  return `<div class="slip ${r.level===2?'bad':r.level===1?'warn':''}${q?' hit':''}"><div class="a"><div style="min-width:0"><div class="nmb"><span class="idx" title="ردیف">${fmt(r.seq)}</span><b>${h.name?hl(r.name,qq):esc(r.name)}</b></div>
  <div class="meta"><span class="pill">${h.bank?hl(r.bankShow||'بانک نامشخص',qq):esc(r.bankShow||'بانک نامشخص')}</span>${stPill(r)}${r.sentBid?(si=>si?`<span class="pill psrc">منبع: ${h.src?hl(si.src,qq):esc(si.src)}${si.tn?' · پیگیری '+esc(si.tn):''}</span>`:'')(srcInfo(r.id)):''}${r.code?`<span class="pill g">فاکتور ${h.code?hl(toEn(r.code),qq):esc(toEn(r.code))}</span>`:''}${showDate?`<span class="pill gd">${dates(r.entryDate).fa}</span>`:''}${h.by?`<span class="pill g">ثبت: ${hl(r.createdBy,qq)}</span>`:''}${q?`<span class="pill gd">تطابق: ${Object.keys(h).map(k=>HITNAME[k]).join('، ')}</span>`:''}</div></div>
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px"><div class="amt">${h.amount?'<mark>'+fmt(r.amount)+'</mark>':fmt(r.amount)}<small>تومان</small></div><button class="more" data-act="entMenu" data-id="${r.id}" aria-label="گزینه‌ها">⋯</button></div></div>
  <div class="b">${r.settled?`<div class="setinfo">مبلغ کل ${fmt(r.total)} — ${esc(r.settles.map(setLine).join('؛ '))}${r.full?'':` — <b>مانده بانکی ${fmt(r.amount)}</b>`}</div>`:''}<div class="ibn">${ibx}</div>${(r.acct||r.card)?`<div class="ac">${r.acct?'حساب: '+acx+' ':''}${r.card?' کارت: '+cdx:''}</div>`:''}
  ${r.issues.length?`<div class="iss">${esc(r.issues.join(' • '))}</div>`:''}
</div></div>`}
function dayDone(iso,V){V=V||validated();const L=V.filter(r=>r.entryDate===iso);return L.length>0&&L.every(r=>{const t=entSt(r);return t&&t[1]==='ok'})}
const doneCnt=L=>L.filter(r=>{const t=entSt(r);return t&&t[1]==='ok'}).length;
function lstrip(){const D=datesWith(),V=validated(),all=listMode==='all';if(!all&&!D.some(x=>x.iso===dateVal))D.unshift({iso:dateVal,n:0,s:0,bad:0});D.sort((a,b)=>a.iso<b.iso?1:-1);
  return `<div class="dstrip lstrip"><button class="dpill all${all?' on':''}" data-act="lsel" data-iso="all"><b>همه لیست‌ها</b><small>${fmt(datesWith().length)} روز</small></button>${D.map(x=>{const r=relDay(x.iso),dn=dayDone(x.iso,V),Dt=dates(x.iso);return `<button class="dpill${!all&&x.iso===dateVal?' on':''}${x.bad?' err':''}${dn?' done':''}" data-act="lsel" data-iso="${x.iso}"><b>${dn?'✓ ':''}${['امروز','دیروز','فردا'].includes(r)?r:toFa(Dt.jd)+' '+JM[Dt.jm-1]}</b><small>${x.n?fmt(x.n)+' واریزی':'خالی'}${dn?'، تسویه':''}</small></button>`}).join('')}</div>`}
function vList(){return `${lstrip()}${ltoolsHTML()}<div id="lst"></div>`}
function listBody(){const V=validated(),q=listQ.trim(),base=listMode==='day'?V.filter(r=>r.entryDate===dateVal):V;
  let rows=base.map(r=>({r,h:q?match(r,q):{}})).filter(x=>!q||x.h);
  const nBad=rows.filter(x=>x.r.level===2).length,nOk=rows.length-nBad;
  if(listFilter==='bad')rows=rows.filter(x=>x.r.level===2);else if(listFilter==='ok')rows=rows.filter(x=>x.r.level<2);
  const H=new Map(rows.map(x=>[x.r.id,x.h]));let L=sortRows(rows.map(x=>x.r));lastList=L;
  let h='';
  if(q)h+=`<div class="sres"><span>${ic('search')} <b>«${esc(q)}»</b> — ${fmt(rows.length)} نتیجه${listMode==='day'?' در '+esc(dates(dateVal).fa):' در همه لیست‌ها'}</span><button class="sm sec" data-act="clearQ">پاک کردن</button></div>`;
  h+=`<div class="chips"><button class="chip${listFilter==='all'?' on':''}" data-act="lfilter" data-f="all">همه ${fmt(nBad+nOk)}</button><button class="chip r${listFilter==='bad'?' on':''}" data-act="lfilter" data-f="bad">خطادار ${fmt(nBad)}</button><button class="chip${listFilter==='ok'?' on':''}" data-act="lfilter" data-f="ok">سالم ${fmt(nOk)}</button>${listSort!=='seq'?`<button class="chip" data-act="sortSheet">${ic('sort').replace('class="i"','class="i" style="width:14px;height:14px;vertical-align:-2px"')} ${SORTS[listSort]}</button>`:''}</div>`;
  if(!L.length){
    if(q){const other=listMode==='day'?V.filter(r=>r.entryDate!==dateVal&&match(r,q)).length:0;
      return h+`<div class="card empty">${ic('search')}<b>چیزی با «${esc(q)}» پیدا نشد</b>${other?`در تاریخ‌های دیگر ${fmt(other)} نتیجه هست.<div class="row"><button class="btn sec" data-act="lmode" data-m="all">جست‌وجو در همه لیست‌ها</button></div>`:'املای نام یا چند رقم از شبا یا مبلغ را امتحان کنید.'}</div>`}
    if(listMode==='day'){const dw=datesWith().filter(x=>x.iso!==dateVal)[0];
      return h+`<div class="card empty">${ic('list')}<b>برای ${dates(dateVal).fa} واریزی‌ای ثبت نشده</b><div class="row"><button class="btn gold" data-act="tab" data-n="entry">ثبت واریزی</button></div>${dw?`<div class="row"><button class="btn sec" data-act="pickDate" data-iso="${dw.iso}">رفتن به آخرین لیست: ${dates(dw.iso).fa} (${fmt(dw.n)})</button></div>`:''}</div>`}
    return h+`<div class="card empty">${ic('list')}<b>هنوز هیچ لیستی ثبت نشده</b></div>`}
  if(listMode==='day'){
    if(!q)h+=`<div class="ingot"><div class="lb">جمع ${listFilter==='bad'?'ردیف‌های خطادار':listFilter==='ok'?'ردیف‌های سالم':'لیست'} — ${dates(dateVal).fa}</div><div class="v">${fmt(sum(L))}<small>تومان</small></div><div class="rule"></div><div class="row3"><div><small>تعداد</small><b>${fmt(L.length)}</b></div><div><small>تسویه‌شده</small><b>${fmt(doneCnt(L))} از ${fmt(L.length)}</b></div><div><small>خطادار</small><b class="${nBad?'r':''}">${fmt(nBad)}</b></div></div></div>`;
    if(!q&&dayDone(dateVal,V))h+=`<div class="msg ok">✓ این لیست کامل تسویه شده است.</div>`;
    h+=swTip();L.forEach(r=>h+=slipHTML(r,q,H.get(r.id),false));
    if(!q&&listFilter==='all')h+='<button class="link" style="color:var(--red)" data-act="clearDay">انتقال کل لیست این تاریخ به سطل بازیابی</button>';return h}
  /* همه لیست‌ها: گروه‌بندی بر اساس تاریخ */
  const by={};L.forEach(r=>(by[r.entryDate]=by[r.entryDate]||[]).push(r));const ks=Object.keys(by).sort().reverse();
  if(!q)h+=`<div class="ingot"><div class="lb">جمع همه لیست‌ها</div><div class="v">${fmt(sum(L))}<small>تومان</small></div><div class="rule"></div><div class="row3"><div><small>لیست‌ها</small><b>${fmt(ks.length)}</b></div><div><small>تسویه کامل</small><b>${fmt(ks.filter(k=>dayDone(k,V)).length)}</b></div><div><small>کل واریزی‌ها</small><b>${fmt(L.length)}</b></div></div></div>`;
  ks.forEach(k=>{const g=by[k],D=dates(k),gb=g.filter(r=>r.level===2).length,op=q||openGroups.has(k),dn=dayDone(k,V),dc=doneCnt(V.filter(r=>r.entryDate===k));
    h+=`<div class="dgrp${op?' open':''}${dn?' done':''}" data-g="${k}"><button class="h" data-act="tgl" data-g="${k}" aria-expanded="${op}"><span class="cal"><b>${toFa(D.jd)}</b><small>${JM[D.jm-1]}</small></span><span class="mid"><b>${relDay(k)}، ${D.fa}</b><small>${fmt(g.length)} واریزی${gb?`، <span style="color:var(--red)">${fmt(gb)} خطادار</span>`:''}</small><span class="tags">${dn?'<span class="pill okp">✓ تسویه کامل</span>':dc?`<span class="pill gd">${fmt(dc)} از ${fmt(V.filter(r=>r.entryDate===k).length)} تسویه</span>`:'<span class="pill g">در جریان</span>'}</span></span><span class="sum">${fmt(sum(g))}</span>${ic('chev').replace('class="i"','class="i chev"')}</button>
    <div class="in">${g.map(r=>slipHTML(r,q,H.get(r.id),false)).join('')}</div></div>`});
  return h}
function refreshList(fx){const l=$('lst');if(l){if(fx)srchSwap(l,listBody());else l.innerHTML=listBody()}const c=document.querySelector('.sbox .clr');if(c)c.classList.toggle('hide',!listQ)}
function bindList(){const q=$('lq');if(!q)return;q.oninput=()=>{listQ=q.value;clearTimeout(q._t);q._t=setTimeout(()=>refreshList(true),140)};
  q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(q._t);listQ=q.value;refreshList();q.blur()}});refreshList()}
function openSort(){sheet(`<div class="sh-h"><b>مرتب‌سازی لیست</b><button class="x" data-act="close" aria-label="بستن">×</button></div>${Object.entries(SORTS).map(([k,t])=>`<button class="opt${listSort===k?' on':''}" data-act="setSort" data-s="${k}">${ic(listSort===k?'check':'sort')}<span>${t}</span></button>`).join('')}`)}
/* ============ الگوریتم تقسیم ============ */
const gcd=(a,b)=>b?gcd(b,a%b):a;
function best(items,cap,maxCount){if(!items.length||cap<=0)return[];
  const greedy=()=>{let rem=cap;const out=[];[...items].sort((a,b)=>b.amount-a.amount).forEach(x=>{if((!maxCount||out.length<maxCount)&&x.amount<=rem){out.push(x);rem-=x.amount}});return out};
  if(maxCount>0)return greedy();
  const u=items.reduce((a,x)=>gcd(a,x.amount),0),C=Math.floor(cap/u);if(C>3e6)return greedy();
  const dp=new Int32Array(C+1).fill(-1);dp[0]=-2;items.forEach((x,k)=>{const a=x.amount/u;for(let s=C;s>=a;s--)if(dp[s]===-1&&dp[s-a]!==-1)dp[s]=k});
  let s=C;while(s>0&&dp[s]===-1)s--;const out=[];while(s>0){const k=dp[s];out.push(items[k]);s-=items[k].amount/u}return out}
/* ============ تقسیم: مرحله ۱ — مبلغ هر منبع ============ */
let srcIdx=0,expCtx=null;
/* ============ تقسیم: مرحله ۲ — نتیجه (لایه‌لایه) ============ */
function vSplit3(){if(!alloc)return `<div class="card empty">${ic('split')}<b>هنوز تقسیمی انجام نشده</b><div class="row"><button class="btn gold" data-act="tab" data-n="split">شروع تقسیم</button></div></div>`;
  const A=alloc,tot=sum(A.res.flatMap(r=>r.items)),cnt=A.res.reduce((s,r)=>s+r.items.length,0);
  let h=flowBar(2)+(A.bid?`<div class="msg ok">✓ ارسال شد و به پیگیری رفت. هنوز می‌توانید متن هر منبع را دوباره کپی کنید.</div>`:`<div class="banner"><span>با کپی متن یا خروجی، این واریزی‌ها از تقسیم خارج و وارد پیگیری می‌شوند.</span></div>`)+(A.fromHist?`<div class="banner"><span>نتیجه ذخیره‌شده از تاریخچه — ${relDay(isoOfTs(A.fromHist))} ${hm(A.fromHist)}</span></div>`:'');
  h+=`<div class="ingot"><div class="lb">تقسیم ${A.D.fa}</div><div class="v">${fmt(tot)}<small>تومان</small></div><div class="rule"></div><div class="row3"><div><small>تقسیم‌شده</small><b>${fmt(cnt)}</b></div><div><small>منبع</small><b>${fmt(A.res.length)}</b></div>${A.left.length?`<div><small>بدون منبع</small><b class="r">${fmt(A.left.length)}</b></div>`:''}</div></div>`;
  if(!A.left.length&&!A.excl.length)h+='<div class="msg ok">همه واریزی‌ها تقسیم شدند.</div>';
  h+=`<div class="sec-h"><b>منابع</b><small class="muted">برای دیدن لیست و خروجی، روی هر منبع بزنید</small></div>`;
  A.res.forEach((R,i)=>{const s=sum(R.items),l=+R.src.limit||0;
    h+=`<button class="lrow" data-act="srcView" data-i="${i}"><span class="ic gd">${esc(userInit(R.src.name))}</span><span class="tx"><b>${esc(R.src.name)}</b><small>${fmt(R.items.length)} واریزی${l&&l-s>0?`، ${fmt(l-s)} از موجودی ماند`:''}</small></span><span class="v">${fmt(s)}</span>${ic('back').replace('class="i"','class="i flip"')}</button>`});
  if(A.left.length)h+=`<button class="lrow bad" data-act="srcView" data-i="left"><span class="ic">!</span><span class="tx"><b>بدون منبع</b><small>${fmt(A.left.length)} واریزی؛ موجودی منابع کافی نبود</small></span><span class="v">${fmt(sum(A.left))}</span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  if(alloc.bid&&splitList().length)h+=`<button class="lrow" data-act="tab" data-n="split" style="border-color:var(--gold2);background:var(--goldbg)"><span class="ic gd">↻</span><span class="tx"><b>${fmt(splitList().length)} واریزی مانده</b><small>تقسیم دور بعد با موجودی باقی‌مانده منابع</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  if(A.excl.length)h+=`<button class="lrow bad" data-act="srcView" data-i="excl"><span class="ic">×</span><span class="tx"><b>خطادار (تقسیم نشد)</b><small>${fmt(A.excl.length)} واریزی؛ اول اصلاحشان کنید</small></span><span class="v">${fmt(sum(A.excl))}</span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  return h}
const aSplit3=()=>alloc?(alloc.bid?`<button class="btn sec" data-act="expOpen" data-sc="all">خروجی همه</button><button class="btn gold" data-act="openBatch" data-id="${alloc.bid}">رفتن به پیگیری</button>`:`<button class="btn sec" data-act="expOpen" data-sc="all">خروجی همه</button><button class="btn gold" data-act="trackNow">ارسال شد ← پیگیری</button>`):'';
function srcRows(){if(!alloc)return null;if(srcIdx==='left')return{name:'تخصیص نیافته',rows:alloc.left,x:1};if(srcIdx==='excl')return{name:'خطادار',rows:alloc.excl,x:1};const R=alloc.res[+srcIdx];return R?{name:R.src.name,rows:R.items,limit:+R.src.limit||0}:null}
function vSrc(){const S=srcRows();if(!S)return '';const s=sum(S.rows);
  let h=`<div class="ingot"><div class="lb">${esc(S.name)} — ${alloc.D.fa}</div><div class="v">${fmt(s)}<small>تومان</small></div><div class="rule"></div><div class="row3"><div><small>تعداد</small><b>${fmt(S.rows.length)}</b></div>${S.limit?`<div><small>موجودی</small><b>${fmt(S.limit)}</b></div><div><small>باقی‌مانده</small><b>${fmt(Math.max(0,S.limit-s))}</b></div>`:''}</div></div>`;
  if(!S.rows.length)return h+'<div class="card empty"><b>چیزی به این منبع نرسید</b></div>';
  S.rows.forEach((r,i)=>{h+=`<div class="slip${S.x?' bad':''}"><div class="a"><div class="nmb"><span class="idx">${fmt(i+1)}</span><b>${esc(r.name)}</b></div><div class="amt">${fmt(r.amount)}<small>تومان</small></div></div><div class="b"><div class="meta"><span class="pill">${esc(r.bankShow||'—')}</span>${r.code?`<span class="pill g">فاکتور ${esc(toEn(r.code))}</span>`:''}</div><div class="ibn">${cpIb((r.iban||'').slice(2))}</div>${r.issues&&r.issues.length?`<div class="iss">${esc(r.issues.join('، '))}</div>`:''}${srcIdx==='excl'&&entries.some(e=>e.id===r.id)?`<div class="eact"><button class="sm" data-act="edit" data-id="${r.id}">${ic('edit')} اصلاح</button></div>`:''}</div></div>`});
  return h}
const aSrc=()=>{const S=srcRows();return S&&S.rows.length&&!S.x?`<button class="btn sec" data-act="copySrc">${ic('copy')} کپی متن</button><button class="btn gold" data-act="expOpen" data-sc="${srcIdx}">خروجی</button>`:''};
/* ============ خروجی: متن به فرمت بانک ============ */
const N=n=>Number(n||0).toLocaleString('en-US');
/* شبا در متن‌های ارسالی با همان فاصله‌های داخل برنامه: IR 12 3456 7890 … */
const ibanSp=i=>{const d=String(i||'').replace(/^IR/,'').replace(/\D/g,'');return d?'IR '+ibanGroups(d):'—'};
const ibanPdf=i=>{const d=String(i||'').replace(/^IR/,'').replace(/\D/g,'');return d?'IR'+d:'—'};/* ستون باریک PDF: بدون فاصله */
let txtStyle=ls.get('m_txtstyle2','plain');
const TS={plain:'ساده',tg:'تلگرام',wa:'واتس‌اپ'};
const Bo=t=>txtStyle==='tg'?'**'+t+'**':txtStyle==='wa'?'*'+t+'*':t;
const Mo=t=>txtStyle==='plain'?t:'`'+t+'`';
const LINE='┈┈┈┈┈┈┈┈┈┈┈┈┈',DLINE='━━━━━━━━━━━━';
function txtBlock(g,D){const tot=sum(g.rows);
  let t=Bo('مطلا · '+g.name)+'\n'+payLine()+'\n'+toFa(g.rows.length)+' واریزی · جمع '+Bo(N(tot)+' تومان')+'\n'+LINE+'\n';
  g.rows.forEach((r,i)=>{const bk=r.bankShow||r.bank||ibanBank(r.iban)||'';t+='\n'+Bo(toFa(i+1)+') '+fullName(r))+'\nشماره فاکتور: '+(toEn(r.code||'')||'—')+(bk?'\nبانک: '+bk:'')+'\nمبلغ: '+N(r.amount)+' تومان'+'\nشبا: '+Mo(ibanSp(r.iban))+'\n'});
  return t+LINE+'\n'+Bo('جمع '+g.name+': '+N(tot)+' تومان')+'\n'+toFa(g.rows.length)+' واریزی'}
function txt(sc){const D=alloc.D,G=groups(sc).filter(g=>g.rows.length);if(G.length===1)return txtBlock(G[0],D);
  const tc=G.reduce((s,g)=>s+g.rows.length,0),ta=G.reduce((s,g)=>s+sum(g.rows),0);
  let t=Bo('مطلا · گزارش کلی واریزی')+'\n'+payLine()+'\n'+toFa(tc)+' واریزی · جمع '+Bo(N(ta)+' تومان')+'\n'+LINE+'\n';
  G.forEach(g=>t+='▫ '+g.name+': '+N(sum(g.rows))+' ('+toFa(g.rows.length)+')\n');
  t+='\n'+DLINE+'\n\n'+G.map(g=>txtBlock(g,D)).join('\n\n'+DLINE+'\n\n');
  return t+'\n\n'+DLINE+'\n'+Bo('جمع کل همه منابع: '+N(ta)+' تومان')+'\n'+toFa(tc)+' واریزی'}
/* ============ لایه خروجی (بدون نیاز به دانلود) ============ */
function expDates(A){if(!A||A.Dp!==undefined)return;const rows=(A.res||[]).flatMap(r=>r.items||[]),P=[...new Set(rows.map(r=>r.payDate||r.entryDate).filter(Boolean))].sort(),E=[...new Set(rows.map(r=>r.entryDate).filter(Boolean))].sort();A.Dp=P.length===1?dates(P[0]):null;A.Pl=P;A.reg=E.length?E.map(e=>dates(e).fa).join('، '):''}
function withCtx(f){const saved=alloc;alloc=expCtx.A;expDates(alloc);try{return f(expCtx.sc)}finally{alloc=saved}}
const DP=()=>(alloc&&alloc.Dp)||(alloc&&alloc.D);
const payLine=()=>{const A=alloc||{};return A.Dp?'تاریخ واریز: '+A.Dp.fa+' — '+A.Dp.en:A.Pl&&A.Pl.length>1?'تاریخ واریز: '+A.Pl.map(k=>dates(k).fa).join('، '):A.D.fa+' — '+A.D.en};
function ctxName(){return withCtx(sc=>fileBase(alloc.Dp?alloc.Dp.iso:alloc.D.iso,sc==='all'?'':alloc.res[+sc].src.name))}
function openExport(A,sc){expCtx={A,sc};txtGen=null;const nm=withCtx(s=>s==='all'?'همه منابع':alloc.res[+s].src.name);
  sheet(`<div class="sh-h"><b>خروجی — ${esc(nm)}</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <button class="opt big" data-act="expText">${ic('copy')}<span><b>متن برای تلگرام و بانک</b><small>نمایش، کپی یا اشتراک‌گذاری</small></span></button>
  <button class="opt big" data-act="expPdf">${ic('paste')}<span><b>PDF</b><small>پیش‌نمایش گزارش، بعد «چاپ» ← ذخیره PDF</small></span></button>
  <button class="opt big" data-act="expXls"${typeof XLSX==='undefined'?' disabled':''}>${ic('list')}<span><b>Excel</b><small>${typeof XLSX==='undefined'?'برای Excel اینترنت لازم است':'فایل xlsx برای ذخیره یا ارسال'}</small></span></button>
  <button class="opt big" data-act="expAll" style="border-color:var(--gold);background:var(--goldbg)">${ic('open')}<span><b>هر سه خروجی با هم</b><small>Excel و متن ذخیره می‌شوند و PDF باز می‌شود</small></span></button>`)}
function openText(){const t=txtGen?txtGen():withCtx(txt),ln=t.split('\n').length;
  sheet(`<div class="sh-h"><div><b>متن خروجی</b><small class="shsub">${fmt(t.length)} نویسه · ${fmt(ln)} خط</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="seg txseg">${Object.entries(TS).map(([k,v])=>`<button data-act="tstyle" data-s="${k}" class="${txtStyle===k?'on':''}">${v}</button>`).join('')}</div>
  <div class="txnote">${ic('copy')}<span>${txtStyle==='plain'?'بدون علامت؛ مناسب برنامه بانک و پیامک':'بخش‌های پررنگ و شبا در '+TS[txtStyle]+' مرتب نمایش داده می‌شوند'}</span></div>
  <textarea id="tout" class="txout" readonly dir="rtl" rows="${Math.min(18,Math.max(6,ln+1))}">${esc(t)}</textarea>
  <div class="txbar"><button class="xgo" data-act="copyOut">${ic('copy')} کپی متن</button>
  <div class="txacts">${(navigator.share||window.AndroidBridge)?`<button data-act="shareOut">${ic('open')} اشتراک‌گذاری</button>`:''}<button data-act="saveTxt">${ic('down')} ذخیره فایل</button></div></div>`)}
/* v61.68 (خواسته صاحب اپ): آماده شدن PDF بدون لگ — پیش‌نمایش همان لحظه با «در حال آماده‌سازی» باز می‌شود؛
   ساختن برگه (h0 می‌تواند متن، تابع یا Promise باشد) بعد از نمایش پنجره انجام می‌شود و برگه بعد از بار شدن فونت‌ها و عکس‌ها
   با محو شدن نرم دیده می‌شود؛ تا آن موقع دکمه‌های چاپ و اشتراک غیرفعال‌اند */
let pvSeq=0;
function openPrint(h0){const P=$('pv'),f=$('pvf'),seq=++pvSeq;P.classList.remove('hide');P.classList.add('ld');f.classList.remove('rdy');document.body.style.overflow='hidden';
  const L=P.querySelector('.pvld');if(!L)P.querySelector('.pvw').insertAdjacentHTML('beforeend','<div class="pvld" role="status" aria-live="polite"><span class="pvsp"></span><b>در حال آماده‌سازی…</b><small>چند لحظه</small></div>');
  const fail=e=>{if(seq!==pvSeq)return;P.classList.remove('ld');toast('برگه آماده نشد؛ دوباره امتحان کنید',true);closePrint()};
  requestAnimationFrame(()=>setTimeout(async()=>{if(seq!==pvSeq)return;let html;try{html=await (typeof h0==='function'?h0():h0!=null?h0:withCtx(reportHTML))}catch(e){fail(e);return}
    if(seq!==pvSeq||!html)return;html=String(html).replace(/<button class="pb"[^>]*>.*?<\/button>/,'');window.__pv=html;
    /* v61.72: روی آیفون بعد از دیده شدن برگه، فایل PDF A5 هم ساخته می‌شود؛ دکمه‌ها تا آماده شدنش صبر می‌کنند */
    const show=()=>{if(seq!==pvSeq)return;f.classList.add('rdy');if(!pdfOn()){P.classList.remove('ld');return}
      const L2=P.querySelector('.pvld b');if(L2)L2.textContent='در حال ساخت PDF…';P.classList.add('ld2');
      pdfPrep(html).then(()=>{if(seq!==pvSeq)return;P.classList.remove('ld','ld2');const b=P.querySelector('.pvld b');if(b)b.textContent='در حال آماده‌سازی…'})};
    f.onload=()=>{let done=false;const ok=()=>{if(!done){done=true;show()}};try{/* v61.84: پیش‌نمایش با اندازه و حاشیه دقیق کاغذ همان برگه (@page) چیده می‌شود تا با PDF و چاپ یکی باشد */const d=f.contentDocument,Q=pageSpec(html),PXm=96/25.4,W=Math.round(Q.mmW*PXm);
      const st=d.createElement('style');st.textContent=`@media screen{html{background:transparent!important;min-height:100%}body{width:${W}px!important;max-width:none!important;margin:18px auto 28px!important;padding:${Math.round(Q.mv*PXm)}px ${Math.round(Q.mh*PXm)}px!important;min-height:${Math.round(Q.mmH*PXm)}px;background:#fff!important;box-shadow:0 10px 34px rgba(16,33,58,.16),0 0 0 1px rgba(16,33,58,.06);border-radius:10px;box-sizing:border-box}}`;d.head.appendChild(st);
      pvZoomBind(f,d,W);
      const imgs=[...d.images].filter(i=>!i.complete).map(i=>new Promise(r=>{i.onload=i.onerror=r}));Promise.all([d.fonts&&d.fonts.ready,...imgs]).then(ok,ok)}catch(e){ok()}setTimeout(ok,2500)};
    f.srcdoc=html},40))}
/* v61.96 (خواسته صاحب اپ): زوم پیش‌نمایش روی آیفون و اندروید. آیفون iframe را به اندازه محتوا بزرگ می‌کرد (برگه بیرون از صفحه و زوم بی‌اثر)؛
   حالا اندازه iframe دقیقاً اندازه برگه بزرگ‌شده است و خود کادر پیش‌نمایش اسکرول می‌خورد. اول برگه در عرض صفحه جا می‌شود؛
   زدن = بزرگ/کوچک (دو برابر)، دو انگشت = زوم آزاد (از اندازه جا شده تا ۴ برابر)؛ نقطه وسط صفحه هنگام زوم ثابت می‌ماند. */
function pvZoomBind(f,d,W){const box=f.parentNode,H0=()=>{d.documentElement.style.zoom='1';return Math.max(d.documentElement.scrollHeight,d.body?d.body.scrollHeight+46:0)};
  let NW=W+24,H=H0(),fz=1,z=1,atFit=true;const cw=()=>box.clientWidth,chh=()=>box.clientHeight;
  const apply=(nz,keep)=>{const ow=f.offsetWidth||1,oh=f.offsetHeight||1,cx=(box.scrollLeft+cw()/2)/ow,cy=(box.scrollTop+chh()/2)/oh;z=Math.max(fz,Math.min(fz*4,nz));atFit=Math.abs(z-fz)<.01;
    d.documentElement.style.zoom=String(z);const w=Math.max(cw(),Math.ceil(NW*z)),h=Math.ceil(H*z);f.style.width=w+'px';f.style.height=h+'px';
    if(keep){box.scrollLeft=cx*w-cw()/2;box.scrollTop=cy*h-chh()/2}};
  const refit=()=>{fz=Math.min(1,(cw()-12)/NW);apply(atFit?fz:z,false)};refit();
  let tap=null,pin=null,raf=0;
  d.addEventListener('touchstart',e=>{if(e.touches.length===2){const[a,b]=e.touches;pin={d0:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z0:z};tap=null;e.preventDefault()}else if(e.touches.length===1)tap={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}},{passive:false});
  d.addEventListener('touchmove',e=>{if(pin&&e.touches.length===2){e.preventDefault();const[a,b]=e.touches,dd=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),nz=pin.z0*dd/Math.max(1,pin.d0);cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>apply(nz,true))}else if(tap&&e.touches[0]&&Math.hypot(e.touches[0].clientX-tap.x,e.touches[0].clientY-tap.y)>8)tap=null},{passive:false});
  d.addEventListener('touchend',e=>{if(pin&&e.touches.length<2){pin=null;return}},{passive:true});
  d.addEventListener('click',()=>{if(pin)return;apply(atFit?Math.min(fz*4,Math.max(fz*2,1)):fz,true)});
  addEventListener('resize',refit);f._pvOff=()=>removeEventListener('resize',refit)}
function closePrint(){const f0=$('pvf');if(f0&&f0._pvOff){f0._pvOff();f0._pvOff=null}if(f0){f0.style.width='';f0.style.height=''}pvSeq++;$('pv').classList.add('hide');$('pv').classList.remove('ld');$('pvf').srcdoc='';document.body.style.overflow=''}
/* کپی با پشتیبان برای وب‌ویوهایی که clipboard ندارند */
async function copyText(t){try{await navigator.clipboard.writeText(t);return true}catch(e){}
  try{const ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;opacity:0';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,t.length);const ok=document.execCommand('copy');ta.remove();return ok}catch(e){return false}}
/* ذخیره فایل: اشتراک‌گذاری روی موبایل، دانلود روی کامپیوتر */
const MIME={jpg:'image/jpeg',gz:'application/gzip',html:'text/html',txt:'text/plain',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
const isTouch=()=>matchMedia('(pointer:coarse)').matches;
async function save(name,data,ok){const ext=name.split('.').pop(),type=MIME[ext]||'application/octet-stream';
  try{if(typeof claude!=='undefined'){const d=await claude.use('downloads');if(d){await d.save({filename:name,data});toast(ok);return}}}catch(e){if(e&&e.code==='declined'){toast('ذخیره لغو شد');return}}
  if(isTouch()&&navigator.canShare){try{const f=new File([data],name,{type});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return}}catch(e){if(e&&e.name==='AbortError')return}}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:type+';charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast(ok)}
  catch(e){blockedHelp()}
  if(isTouch()&&!navigator.canShare)setTimeout(()=>toast('اگر فایل ذخیره نشد، از «متن» یا «PDF» استفاده کنید','', 'راهنما',blockedHelp),2300)}
function blockedHelp(){sheet(`<div class="sh-h"><b>این برنامه اجازه ذخیره فایل نمی‌دهد</b><button class="x" data-act="close">×</button></div><div class="muted" style="font-size:13.5px;line-height:1.9">بعضی برنامه‌ها (مثل نمایش‌گر Documents) دانلود فایل را می‌بندند. این راه‌ها همیشه کار می‌کنند:<br>• <b>متن</b>: کپی و چسباندن در تلگرام یا برنامه بانک<br>• <b>PDF</b>: پیش‌نمایش ← «چاپ / ذخیره PDF» ← از منوی اشتراک، Save to Files<br>• برای Excel، فایل برنامه را در <b>Safari</b> باز کنید (فایل ← اشتراک‌گذاری ← Safari)</div><div class="row"><button class="btn gold" data-act="close">متوجه شدم</button></div>`)}

/* ============ پیگیری واریز و لیست‌های روزانه ============ */
let batches=ls.get('m_batches',[]).map(b=>({...b,items:(b.items||[]).map(x=>({...x,name:stripName(x.name)}))})),batchId=null,tkFilter='all',tkQ='',trTab='open',dayIso=null,itemIdx=null,txtGen=null,txtName=null,tmpSt=null,tmpImg;
const saveB=()=>ls.set('m_batches',batches);
/* ورژن‌های قبلی: واریزی‌های داخل لیست پیگیری را «ارسال‌شده» علامت بزن */
(()=>{let ch=0;batches.forEach(b=>b.items.forEach(x=>{const e=entries.find(z=>z.id===x.id);if(e&&!e.sentBid){e.sentBid=b.id;ch=1}}));if(ch)saveE()})();
/* مانده برای تخصیص در لیست جاری (همه واریزی‌های این تاریخ واریز، از هر روز ثبت) */
const splitList=()=>validated().filter(r=>PD(r)===ldKey&&!r.sentBid&&!r.full);
const pVis=()=>true;
function stOf(id){if(!_stm){_stm=new Map();for(const b of batches)for(const x of b.items)if(!_stm.has(x.id))_stm.set(x.id,x.st);queueMicrotask(memoClear)}return _stm.has(id)?_stm.get(id):null}
const entSt=r=>r.full?['تسویه با مشتری','ok']:r.sentBid?(s=>s==='ok'?['تسویه شده','ok']:s==='fail'?['واریز ناموفق','rd']:['ارسال شده','gd'])(stOf(r.id)):r.settled?['تسویه بخشی','g']:null;
const stPill=r=>{const s=entSt(r);return s?`<span class="pill ${s[1]==='ok'?'okp':s[1]}">${s[0]}</span>`:''};
const bStat=b=>{const c={ok:0,fail:0,pending:0,okSum:0,all:b.items.length,sum:0,img:0,tn:0};b.items.forEach(x=>{c[x.st]++;c.sum+=x.amount;if(x.st==='ok')c.okSum+=x.amount;if(x.img)c.img++;if(x.tn)c.tn++});return c};
const openB=()=>batches.filter(b=>!b.closed);
const pendingAll=()=>openB().reduce((s,b)=>s+b.items.filter(x=>x.st==='pending').length,0);
const curB=()=>batches.find(x=>x.id===batchId);
const ST={pending:['در انتظار','⏳'],ok:['انجام شد','✅'],fail:['انجام نشد','❌'],none:['ارسال نشده','⚪']};
const setType=x=>x.full?'تسویه کامل با مشتری':x.settled?'ترکیبی: مشتری + بانک':'واریز بانکی';
