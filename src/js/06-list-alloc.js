/* ---------- جزئیات یک لیست (بر اساس تاریخ واریز) ---------- */
let ldKey=todayISO(),ldX=null,ldOpen=new Set(),ldQ='';
function ldData(key){AM=AM||allocMap();const rows=validated().filter(r=>PD(r)===key),BI=new Map();batches.forEach(b=>b.items.forEach(x=>{if(!BI.has(x.id))BI.set(x.id,{...x,bid:b.id})}));
  const G=[],FS=[];rows.forEach(r=>{if(r.full){FS.push(r);return}const bi=BI.get(r.id),al=AM.get(r.id);const x=bi?{...bi,name:bi.name||r.name}:{id:r.id,name:r.name,code:r.code||'',amount:r.amount,total:r.total,settled:r.settled,settles:r.settles,iban:r.iban,bank:r.bankShow||'',st:'none'};const k=(bi&&bi.src)||(al&&al.src)||'تخصیص نیافته';let g=G.find(z=>z.name===k);if(!g)G.push(g={name:k,rows:[]});g.rows.push(x)});
  const it=G.flatMap(g=>g.rows),c=bStat({items:it}),eds=[...new Set(rows.map(r=>r.entryDate))].sort();return{rows,G,FS,it,c,eds}}
const ldSt=x=>x.st==='ok'?['تسویه شده','g']:x.st==='fail'?['ناموفق','r']:x.st==='pending'?['در انتظار','w']:['ارسال نشده','n'];
/* ---------- لیست واحد هر تاریخ واریز: تخصیص، ارسال، پیگیری و رسید در یک صفحه ---------- */
/* واریزی‌های این لیست به گروه‌ها: خطادار، تخصیص‌نیافته، هر منبع (آماده ارسال یا ارسال‌شده با وضعیت)، تسویه با مشتری */
function hubData(k){AM=allocMap();const M=vMap(),rows=validated().filter(r=>PD(r)===k),P=parts(k),BI=new Map(),PID=new Map();
  batches.forEach(b=>b.items.forEach((x,i)=>{if(!BI.has(x.id))BI.set(x.id,{b,i,x})}));
  P.forEach(p=>(p.ids||[]).forEach(id=>{if(!PID.has(id))PID.set(id,p)}));
  const G=new Map(),un=[],bad=[],FS=[],dr=new Set();
  const gOf=name=>{let g=G.get(name);if(!g)G.set(name,g={name,so:sources.find(z=>z.name===name),rows:[],dr:[],pids:new Set(),c:{ok:0,fail:0,pending:0,none:0},sum:0,closed:true});return g};
  rows.forEach(r=>{if(r.full){FS.push(r);return}const bi=r.sentBid?BI.get(r.id):null;
    if(bi){const g=gOf(bi.x.src||'بدون منبع'),st=bi.x.st||'pending';g.rows.push({r,st,bi});g.c[st]++;g.sum+=r.amount;if(!bi.b.closed)g.closed=false;if(bi.x.pid!=null)g.pids.add(bi.x.pid);return}
    const p=PID.get(r.id);if(p&&!p.sent){const g=gOf(p.src.name);g.rows.push({r,st:'none',p});g.c.none++;g.sum+=r.amount;g.closed=false;g.pids.add(p.id);if(!g.dr.includes(p))g.dr.push(p);dr.add(p);return}
    (r.level===2?bad:un).push(r)});
  const GL=[...G.values()],it=GL.flatMap(g=>g.rows),cnt=k2=>it.filter(z=>z.st===k2).length;
  const fsT=FS.reduce((a,r)=>a+(r.total||0),0),tot=sum(rows.filter(r=>!r.full))+fsT,okS=it.filter(z=>z.st==='ok').reduce((a,z)=>a+z.r.amount,0)+fsT;
  const sent=it.filter(z=>z.bi),closed=sent.length>0&&sent.every(z=>z.bi.b.closed)&&!un.length&&!dr.size&&!bad.length;
  return{k,rows,G:GL,un,bad,FS,dr:[...dr],tot,okS,ok:cnt('ok')+FS.length,pend:cnt('pending'),fail:cnt('fail'),none:cnt('none'),sent:sent.length,closed,eds:[...new Set(rows.map(r=>r.entryDate))].sort()}}
const hubOpen=new Map();
/* منبع‌ها بسته باز می‌شوند (حتی اگر هنوز تسویه نشده باشند)؛ با زدن روی منبع باز و بسته می‌شود */
const hubIsOpen=g=>hubOpen.has(g.name)?hubOpen.get(g.name):false;
function vLday(){const d=hubData(ldKey);ldX=null;
  if(!d.rows.length)return `<div class="spempty"><div class="spill">${ic('list')}</div><b>این لیست خالی است</b><span>برای ${esc(pdHead(ldKey))} واریزی‌ای ثبت نشده.</span></div>`;
  const all=d.rows.length,pc=d.tot?d.okS/d.tot*100:0,done=d.ok===all;
  let h=`<div class="ldtop"><span class="ldic">${ic('cal')}</span><div><b>${esc(pdHead(ldKey))}</b><small>${d.eds.length&&!(d.eds.length===1&&d.eds[0]===ldKey)?'ثبت '+d.eds.map(e=>esc(relDay(e))).join('، ')+' · ':''}${fmt(all)} واریزی${d.closed?' · بایگانی شده':''}</small></div></div>
  <div class="ldhero${done?' ok':''}"><small>${done?'لیست کامل تسویه شد ✓':'تسویه شده تا الان'}</small><b>${fmt(d.okS)}<i>تومان</i></b><em>از کل ${fmt(d.tot)} تومان</em><span class="ldbar"><i style="width:${pc}%"></i></span>
  <div class="ldst"><div><small>تخصیص‌نیافته</small><b>${fmt(d.un.length+d.bad.length)}</b></div><div><small>آماده ارسال</small><b>${fmt(d.none)}</b></div><div><small>در انتظار</small><b>${fmt(d.pend)}</b></div><div><small>تسویه شده</small><b>${fmt(d.ok)}</b></div></div></div>
  <div class="fsearch ldq">${ic('search')}<input id="ldq" type="search" value="${esc(ldQ)}" placeholder="جستجو در این لیست: نام، فاکتور، مبلغ، پیگیری…" autocomplete="off" enterkeyhint="search">${ldQ?'<button class="x" data-act="ldQClr" aria-label="پاک کردن">×</button>':''}</div>`;
  const lq=toEn(ldQ.trim()).toLowerCase(),lqd=lq.replace(/\D/g,''),hit=(r,z)=>!lq||[fullName(r),toEn(r.code||''),z&&z.bi?z.bi.x.src:''].join(' ').toLowerCase().includes(lq)||(lqd.length>=3&&[String(r.amount),z&&z.bi?z.bi.x.tn:'',r.iban].some(v=>v&&String(v).includes(lqd)));let hits=0;
  const rowsHTML=L=>{ROWDATE=false;ROWSRC=false;ROWTRK=true;ROWMOVE=can('split');try{return L.map(homeRow).join('')}finally{ROWSRC=true;ROWTRK=false;ROWMOVE=false}};
  const B=d.bad.filter(r=>hit(r));hits+=B.length;
  if(B.length)h+=`<div class="spsec bad"><div><b>${fmt(B.length)} واریزی خطادار</b><small>تا اصلاح نشوند تخصیص داده نمی‌شوند؛ برای اصلاح بزنید</small></div></div><div class="blist fcard">${rowsHTML(B)}</div>`;
  const U=d.un.filter(r=>hit(r));hits+=U.length;
  if(U.length)h+=`<div class="spsec hubs"><div><b>تخصیص‌نیافته</b><small>${fmt(U.length)} واریزی · ${fmt(sum(U))} تومان · کشیدن به چپ: انتقال به یک منبع</small></div></div><div class="blist fcard">${rowsHTML(U)}</div>`;
  if(d.G.length)h+=`<div class="spsec"><div><b>منبع‌ها</b><small>برای باز و بسته شدن بزنید · «⋯» تنظیمات منبع</small></div></div>`;
  /* منبع‌هایی که هنوز کار دارند بالا، منبع‌های کاملاً تسویه‌شده پایین؛ داخل هر منبع هم تسویه‌شده‌ها پایین */
  const gDone=g=>g.c.ok===g.rows.length,RO={fail:0,pending:1,none:2,ok:3};
  d.G.slice().sort((a,b)=>gDone(a)-gDone(b)).forEach(g=>{const R=g.rows.filter(z=>hit(z.r,z)).sort((a,b)=>(RO[a.st]??2)-(RO[b.st]??2));if(lq&&!R.length)return;hits+=R.length;const n=g.rows.length,c=g.c,op=hubIsOpen(g)||!!lq,pc2=n?c.ok/n*100:0,pf=n?c.fail/n*100:0,bk=g.so?acBank(g.so):'';
    const tag=c.none===n?'<span class="d">آماده ارسال</span>':c.ok===n?'<span class="k">تسویه کامل ✓</span>':[c.ok?`<span class="k">${fmt(c.ok)} تسویه</span>`:'',c.pending?`<span class="w">${fmt(c.pending)} در انتظار</span>`:'',c.fail?`<span class="f">${fmt(c.fail)} ناموفق</span>`:'',c.none?`<span class="d">${fmt(c.none)} ارسال نشده</span>`:''].filter(Boolean).join(' · ');
    const pid=[...g.pids][0];
    h+=`<div class="ldg hubg${op?' open':''} ${c.ok===n?'gok':c.none===n?'gdr':'gpe'}"><div class="ldh"><button class="ldm" data-act="hubTog" data-k="${esc(g.name)}" aria-expanded="${op}">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(g.name))}</span>`}<span class="tx"><b>${esc(g.name)}</b><small>${fmt(n)} واریزی · ${tag}</small>${c.none<n?`<span class="pb2"><i class="ok" style="width:${pc2}%"></i><i class="no" style="width:${pf}%"></i></span>`:''}</span><span class="v"><b>${fmt(g.sum)}</b><small>تومان</small></span>${chevI()}</button>${pid!=null&&findPart(pid)?`<button class="hmore2" data-act="partView" data-id="${pid}" aria-label="تنظیمات منبع">⋯</button>`:''}</div>
    <div class="ldb"><div class="ldbi">${g.dr.length&&can('split')?`<div class="hsendr"><span>${fmt(c.none)} واریزی هنوز برای این منبع ارسال نشده</span><button class="hsend" data-act="hubSend" data-k="${esc(g.name)}">${ic('copy')} کپی و ارسال</button></div>`:''}<div class="blist">${rowsHTML(R.map(z=>z.r))}</div>${c.pending&&can('track')?`<button class="okall" data-act="hubOkAll" data-k="${esc(g.name)}">${ic('check')} همه ${fmt(c.pending)} واریز در انتظار، موفق</button>`:''}</div></div></div>`});
  const F=d.FS.filter(r=>hit(r));hits+=F.length;
  if(F.length){const op=hubOpen.get('__full')||!!lq;h+=`<div class="ldg hubg gok${op?' open':''}"><div class="ldh"><button class="ldm" data-act="hubTog" data-k="__full"><span class="bkb lg" style="--bc:#15803d">م</span><span class="tx"><b>تسویه با مشتری</b><small>${fmt(F.length)} واریزی · <span class="k">تسویه کامل ✓</span></small></span><span class="v"><b>${fmt(F.reduce((a,r)=>a+r.total,0))}</b><small>تومان</small></span>${chevI()}</button></div><div class="ldb"><div class="ldbi"><div class="blist">${rowsHTML(F)}</div></div></div></div>`}
  if(lq&&!hits)h+='<div class="spempty" style="padding:20px 8px"><b>در این لیست پیدا نشد</b></div>';
  if(d.closed&&can('close'))h+=`<div class="row"><button class="link" data-act="hubReopen">بازگشایی لیست برای تغییر وضعیت‌ها</button></div>`;
  return h}
function bindLday(){const q=$('ldq');if(!q)return;q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(q._t);ldQ=q.value;q.blur();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}};q.oninput=()=>{clearTimeout(q._t);q._t=setTimeout(()=>{ldQ=q.value;const pos=q.selectionStart,v=$('view'),y=v.scrollTop;render();v.scrollTop=y;const n=$('ldq');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}},220)}}
const aLday=()=>{const d=hubData(ldKey);if(!d.rows.length)return '';const B=[];
  if(d.un.length&&can('split'))B.push(`<button class="btn ${d.dr.length?'sec':'gold'}" data-act="allocNew">${ic('plus')} تخصیص به منبع</button>`);
  if(d.dr.length&&can('split'))B.push(`<button class="btn gold" data-act="hubSendAll">${ic('copy')} کپی و ارسال${d.dr.length>1?' '+fmt(new Set(d.dr.map(p=>p.src.name)).size)+' منبع':''}</button>`);
  if(!B.length&&d.sent&&!d.closed&&can('close'))B.push(`<button class="btn ${d.pend?'sec':'gold'}" data-act="hubArch">${ic('check')} بایگانی لیست</button>`);
  if(can('export'))B.unshift(`<button class="btn sec ico" data-act="ldExp" aria-label="خروجی">${ic('open')}</button>`);
  return B.join('')};
const ST_ORD={ok:0,fail:1,pending:2,none:3};
/* انتخاب خروجی: واریزی‌های تیک‌خورده (پیش‌فرض: همه واریزی‌های تخصیص‌داده‌شده به منبع) */
const ldXDef=d=>new Set(d.G.filter(g=>g.name!=='تخصیص نیافته').flatMap(g=>g.rows.map(r=>r.id)));
function ldPick(){const d=ldData(ldKey),X=ldX||ldXDef(d);return{reg:d.eds.map(e=>dates(e).fa).join('، '),G:d.G.map(g=>({...g,rows:g.rows.filter(r=>X.has(r.id)).sort((a,b)=>(ST_ORD[a.st]??9)-(ST_ORD[b.st]??9))})).filter(g=>g.rows.length),FS:d.FS.filter(r=>X.has(r.id)),T:'لیست واریز '+payLab(ldKey)}}
/* ---------- صفحه لیست‌ها: هر تاریخ واریز یک لیست، جدیدترین بالا ---------- */
function vSplit1(){return vArch()}
const aSplit1=()=>'';
function bindSplit1(){const q=$('arq');if(!q)return;q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(q._t);arcQ=q.value;arcD='';q.blur();render()}};q.oninput=()=>{clearTimeout(q._t);q._t=setTimeout(()=>{const was=qDate(arcQ);arcQ=q.value;arcD='';if(qDate(arcQ)!==was){const pos=q.selectionStart;render();const n=$('arq');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}},250)}}
/* ---------- پنجره تخصیص ---------- */
function allocNew(){const s0=sources[0]||{};aSt={srcId:s0.id,method:s0.bank?'bank':'amount',amount:0,min:0,max:0,cap:0,bank:s0.bank||'',sameFirst:true,count:0,sel:new Set(),q:''};allocSheet();recalc()}
const aPool=()=>remainList().filter(r=>r.level<2);
function recalc(){const P=aPool(),s=sources.find(x=>x.id==aSt.srcId)||{},m=aSt.method;let pick=[];
  const N=aSt.count||0;if(N>0&&m!=='manual'){
    if(m==='amount')pick=bestN(P,aSt.amount,N);
    else if(m==='range'){const L=P.filter(x=>(!aSt.min||x.amount>=aSt.min)&&(!aSt.max||x.amount<=aSt.max));pick=(aSt.min||aSt.max)?bestN(L,aSt.cap,N):[]}
    else if(m==='bank'){const bk=canon(aSt.bank),L=bk?P.filter(x=>bankKey(x)===bk):[];pick=bestN(L,aSt.cap,N)}
    aSt.sel=new Set(pick.map(x=>x.id));renderPrev();return}
  if(m==='manual'){renderPrev();return}
  if(m==='amount'){if(aSt.amount>0){const bk=canon(s.bank);if(aSt.sameFirst&&bk){const a=best(P.filter(x=>bankKey(x)===bk),aSt.amount,0);const rest=aSt.amount-sum(a),ids=new Set(a.map(x=>x.id));pick=a.concat(rest>0?best(P.filter(x=>!ids.has(x.id)),rest,0):[])}else pick=best(P,aSt.amount,0)}}
  else if(m==='range'){const L=P.filter(x=>(!aSt.min||x.amount>=aSt.min)&&(!aSt.max||x.amount<=aSt.max));pick=(aSt.min||aSt.max)?(aSt.cap?best(L,aSt.cap,0):L):[]}
  else if(m==='bank'){const bk=canon(aSt.bank),L=bk?P.filter(x=>bankKey(x)===bk):[];pick=aSt.cap?best(L,aSt.cap,0):L}
  aSt.sel=new Set(pick.map(x=>x.id));renderPrev()}
const numIn=(id,v,ph)=>`<input id="${id}" class="ltr num" inputmode="numeric" placeholder="${ph}" value="${v?Number(v).toLocaleString('en-US'):''}">`;
const shortAmt=n=>{n=+n||0;const f=(v,u)=>toFa(String(+v.toFixed(v<10?2:1))).replace('.','٫')+' '+u;return (n>=1e9?f(n/1e9,'میلیارد'):n>=1e6?f(n/1e6,'میلیون'):n>=1e3?f(n/1e3,'هزار'):toFa(String(n)))+' تومان'};
const MNAME={amount:'مبلغ',range:'بازه',bank:'هم‌بانک',manual:'دستی'};
const MDESC={amount:'مبلغی را که این منبع باید بپردازد بنویسید؛ نزدیک‌ترین ترکیب واریزی‌ها خودکار انتخاب می‌شود.',range:'واریزی‌هایی که مبلغشان در این بازه است انتخاب می‌شوند.',bank:'واریزی‌هایی که مقصدشان همین بانک است انتخاب می‌شوند (انتقال داخلی).',manual:'واریزی‌هایی را که باید از این منبع پرداخت شوند، پایین تیک بزنید.'};
const MIC={amount:'<svg class="i" viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></svg>',range:'<svg class="i" viewBox="0 0 24 24"><path d="M4 12h16M8 8l-4 4 4 4M16 8l4 4-4 4"/></svg>',bank:'<svg class="i" viewBox="0 0 24 24"><path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/></svg>',manual:'<svg class="i" viewBox="0 0 24 24"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>'};
function paramHTML(){const m=aSt.method;
  if(m==='amount'){const s=sources.find(x=>x.id==aSt.srcId)||{};return `<div class="bigin"><input id="pa" class="ltr num" inputmode="numeric" placeholder="0" value="${aSt.amount?Number(aSt.amount).toLocaleString('en-US'):''}"><span>تومان</span></div><div class="pwords" id="pwords">${aSt.amount?shortAmt(aSt.amount):'مثلاً ۱ میلیارد'}</div>
    <div class="qchips"><button data-act="aQuick" data-v="all">کل مانده</button><button data-act="aQuick" data-v="half">نصف مانده</button><button data-act="aQuick" data-v="500000000">۵۰۰ میلیون</button><button data-act="aQuick" data-v="1000000000">۱ میلیارد</button><button data-act="aQuick" data-v="2000000000">۲ میلیارد</button></div>
    ${cntHTML()}${s.bank?`<label class="sw"${aSt.count?' style="display:none"':''}><input type="checkbox" id="psf"${aSt.sameFirst?' checked':''}><span class="tr"></span><span>اول واریزی‌های هم‌بانک (${esc(s.bank)})</span></label>`:''}`}
  if(m==='range')return `<div class="f2"><div class="f"><label>حداقل مبلغ</label>${numIn('pmin',aSt.min,'بدون حد')}</div><div class="f"><label>حداکثر مبلغ</label>${numIn('pmax',aSt.max,'بدون حد')}</div></div><div class="f" style="margin:0"><label>سقف مجموع <i class="opt">اختیاری</i></label>${numIn('pcap',aSt.cap,'بدون سقف')}</div>${cntHTML()}`;
  if(m==='bank')return `<div class="f"><label>بانک مقصد واریزی‌ها</label><select id="pbk"><option value="">انتخاب بانک</option>${BANKOPTS.map(b=>`<option${canon(b)===canon(aSt.bank)?' selected':''}>${b}</option>`).join('')}</select></div><div class="f" style="margin:0"><label>سقف مجموع <i class="opt">اختیاری</i></label>${numIn('pcap',aSt.cap,'بدون سقف')}</div>${cntHTML()}`;
  return ''}
function allocSheet(){const S=sources,P=aPool();
  sheet(`<div class="ash"><div class="sh-h"><div><b>${aSt.editPid?'ویرایش تخصیص':'تخصیص جدید'}</b><small class="shsub">${esc(pdHead(ldKey))}، مانده ${fmt(sum(P))} تومان (${fmt(P.length)} واریزی)</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="astep"><span class="n">۱</span><b>منبع پرداخت</b><button class="link" data-act="srcMgr">ویرایش منابع</button></div>
  <div class="srcs">${S.map(s=>`<button class="srcc${aSt.srcId==s.id?' on':''}" data-act="aSrc" data-id="${s.id}">${aSt.srcId==s.id?`<span class="ed" data-act="srcSet" data-id="${s.id}" role="button" aria-label="ویرایش نام منبع">${ic('edit')}</span>`:''}${acBank(s)?bankBadge(acBank(s),'lg av'):`<span class="av">${esc(userInit(s.name))}</span>`}<b>${esc(s.name)}</b><small class="${acFree(s,aSt.editPid)!=null&&acFree(s,aSt.editPid)<=0?'neg':''}">${acFree(s,aSt.editPid)==null?esc(acBank(s)?'بانک '+acBank(s):'بانک نامشخص'):shortAmt(Math.max(0,acFree(s,aSt.editPid))).replace(/\s*تومان$/,'')}</small></button>`).join('')}<button class="srcc add" data-act="aNewSrc"><span class="av">${ic('plus')}</span><b>منبع جدید</b><small>افزودن</small></button></div>
  <div id="abal"></div>
  <div class="astep"><span class="n">۲</span><b>روش انتخاب</b></div>
  <div class="mseg">${Object.keys(MNAME).map(k=>`<button class="${aSt.method===k?'on':''}" data-act="aMeth" data-m="${k}">${MIC[k]}<span>${MNAME[k]}</span></button>`).join('')}</div>
  <div class="pcard"><div class="mdesc">${MDESC[aSt.method]}</div><div id="aparam">${paramHTML()}</div><div id="ameter"></div></div>
  <div class="astep"><span class="n">۳</span><b>واریزی‌ها</b><span id="asum" class="muted"></span></div>
  <div class="sbox asq">${ic('search')}<input id="aq" type="search" placeholder="جست‌وجو در مانده لیست…" value="${esc(aSt.q)}" autocomplete="off"></div>
  <div id="aprev"></div>
  <div class="asave"><div class="atot"><small>جمع انتخاب</small><b id="atot">۰</b><small id="arem"></small></div><button class="btn gold xgo" data-act="aSave" id="asv">${aSt.editPid?'ذخیره تغییرات':'ثبت تخصیص'}</button></div></div>`);
  const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(t.classList.contains('num')){const n=num(t.value);t.value=n?n.toLocaleString('en-US'):''}
    if(t.id==='aq'){aSt.q=t.value;renderPrev();return}
    if(t.id==='pa'){const w=$('pwords');if(w)w.textContent=num(t.value)?shortAmt(num(t.value)):'مثلاً ۱ میلیارد'}
    if(t.id==='pcnt'){const v=num(t.value);setCnt(v);t.value=v?toFa(v):'';clearTimeout(sh._t);sh._t=setTimeout(()=>{paramRefresh();recalc()},250);return}
    const map={pa:'amount',pmin:'min',pmax:'max',pcap:'cap'};if(map[t.id]){aSt[map[t.id]]=num(t.value);clearTimeout(sh._t);sh._t=setTimeout(recalc,200)}};
  sh.onchange=e=>{const t=e.target;if(t.id==='pbk'){aSt.bank=t.value;recalc()}if(t.id==='psf'){aSt.sameFirst=t.checked;recalc()}if(t.dataset.sel){const id=+t.dataset.sel;t.checked?aSt.sel.add(id):aSt.sel.delete(id);renderPrev()}}}
function aQuick(v){const P=aPool(),tot=sum(P),so=sources.find(x=>x.id==aSt.srcId),fr=so?acFree(so,aSt.editPid)||0:0;aSt.amount=v==='bal'?Math.min(tot,Math.max(0,fr)):v==='all'?tot:v==='half'?Math.round(tot/2):+v;const i=$('pa');if(i)i.value=aSt.amount.toLocaleString('en-US');const w=$('pwords');if(w)w.textContent=shortAmt(aSt.amount);recalc()}
function renderPrev(){const P=aPool(),q=aSt.q.trim(),sel=P.filter(x=>aSt.sel.has(x.id)),un=P.filter(x=>!aSt.sel.has(x.id)).filter(x=>!q||match(x,q)),sb=canon((sources.find(x=>x.id==aSt.srcId)||{}).bank||'');
  const row=x=>`<label class="arow${aSt.sel.has(x.id)?' on':''}"><input type="checkbox" data-sel="${x.id}"${aSt.sel.has(x.id)?' checked':''}><span class="tx"><b>${esc(x.name)}</b><small>${sb&&bankKey(x)===sb?'<span class="sbk">هم‌بانک</span>':''}${esc(x.bankShow||'—')}${x.code?'، فاکتور '+esc(toEn(x.code)):''}</small></span><span class="am">${fmt(x.amount)}</span></label>`;
  let h=sel.length?`<div class="albl2"><span>${fmt(sel.length)} انتخاب‌شده</span><button class="link" data-act="aNone">برداشتن همه</button></div><div class="agrp on">${sel.map(row).join('')}</div>`:`<div class="aempty">${aSt.method==='manual'?'از لیست پایین، واریزی‌ها را تیک بزنید.':'با پر کردن بخش ۲، واریزی‌ها خودشان انتخاب می‌شوند.'}</div>`;
  if(un.length)h+=`<div class="albl2" style="margin-top:12px"><span>بقیه مانده <small class="muted">(${fmt(un.length)} واریزی، ${fmt(sum(un))})</small></span><button class="link" data-act="aAll">${q?'انتخاب همه نتایج':'انتخاب همه'}</button></div><div class="agrp">${un.map(row).join('')}</div>`;
  const el=$('aprev');if(el)el.innerHTML=h;const s=sum(sel),a=$('asum');if(a)a.textContent=sel.length?fmt(sel.length)+' واریزی، '+fmt(s):'';
  const tgt=aSt.method==='amount'?aSt.amount:0,base=tgt||sum(P),pc=base?Math.min(100,s/base*100):0,m=$('ameter');
  if(m)m.innerHTML=(sel.length||tgt)?`<div class="meter"><div class="mt"><span>${tgt?'از هدف '+fmt(tgt):'از کل مانده '+fmt(sum(P))}</span><b>${toFa(String(Math.round(pc)))}٪</b></div><div class="bar"><i style="width:${pc}%"></i></div>${tgt?`<div class="mn">${s===tgt?'<span class="okc">✓ دقیقاً برابر هدف</span>':s<tgt?'کمتر از هدف: <b>'+fmt(tgt-s)+'</b>':'بیشتر از هدف: <b>'+fmt(s-tgt)+'</b>'}</div>`:''}${aSt.count&&aSt.method!=='manual'?`<div class="mn">تعداد: <b>${fmt(sel.length)}</b> از ${fmt(aSt.count)} ${sel.length===aSt.count?'<span class="okc">✓</span>':sel.length<aSt.count?'— ترکیبی با این تعداد زیر هدف پیدا نشد':''}</div>`:''}</div>`:'';
  const tt=$('atot');if(tt)tt.textContent=fmt(s);{const ab=$('abal'),so=sources.find(x=>x.id==aSt.srcId),f=so?acFree(so,aSt.editPid):null;if(ab)ab.innerHTML=f==null?'':`<div class="abal${s>f?' over':''}"><div><small>موجودی قابل تخصیص «${esc(so.name)}»</small><b>${fmt(f)}</b></div><div><small>بعد از این تخصیص</small><b>${fmt(f-s)}</b></div>${f>0&&aSt.method==='amount'?`<button data-act="aQuick" data-v="bal">تا سقف موجودی</button>`:''}</div>${s>f?'<div class="abw">مبلغ انتخاب‌شده از موجودی این حساب بیشتر است</div>':''}`}
  const b=$('asv');if(b){b.disabled=!sel.length;b.textContent=sel.length?(aSt.editPid?'ذخیره — ':'ثبت ')+fmt(sel.length)+' واریزی':'ثبت تخصیص'}const rm=$('arem');if(rm){const r=sum(P)-s;rm.innerHTML=r?'مانده بعد: '+fmt(r):'<span style="color:var(--ok)">بدون مانده ✓</span>'}}
function allocSave(){const s=sources.find(x=>x.id==aSt.srcId);if(!s){toast('منبع را انتخاب کنید',true);return}const ids=aPool().filter(x=>aSt.sel.has(x.id)).map(x=>x.id);if(!ids.length)return;
  if(aSt.editPid){const p=parts().find(z=>z.id===aSt.editPid);if(p){Object.assign(p,{src:{id:s.id,name:s.name,bank:s.bank||''},method:aSt.method,param:{amount:aSt.amount,min:aSt.min,max:aSt.max,cap:aSt.cap,bank:aSt.bank,count:aSt.count||0},ids,at:new Date().toISOString()});saveD();logA('alloc','ویرایش تخصیص '+s.name,methLabel(p)+' | '+fmt(ids.length)+' واریزی | '+fmt(sum(partRows(p)))+' تومان');aSt=null;closeSheet();render();toast('تخصیص «'+s.name+'» ویرایش شد');return}}
  const p={id:nid++,src:{id:s.id,name:s.name,bank:s.bank||''},method:aSt.method,param:{amount:aSt.amount,min:aSt.min,max:aSt.max,cap:aSt.cap,bank:aSt.bank,count:aSt.count||0},ids,sent:false,pay:ldKey,at:new Date().toISOString()};
  addPart(p);saveD();const rows=partRows(p);logA('alloc','تخصیص به '+s.name,methLabel(p)+' | '+fmt(rows.length)+' واریزی | '+fmt(sum(rows))+' تومان | '+pdHead(ldKey));
  aSt=null;closeSheet();render();const r=remainList().filter(x=>x.level<2);toast('تخصیص به '+s.name+' ثبت شد — مانده: '+(r.length?fmt(sum(r))+' تومان':'هیچ ✓'))}
/* ---------- دیدن یک تخصیص ---------- */
const curPart=()=>parts().find(p=>p.id===partId);
const partPay=(p,M)=>{if(p.pay)return p.pay;M=M||new Map(validated().map(r=>[r.id,r]));const S=new Set((p.ids||[]).map(id=>M.get(id)).filter(Boolean).map(PD));return S.size===1?[...S][0]:''};
const partSibs=p=>{const M=new Map(validated().map(r=>[r.id,r])),pp=partPay(p,M);return parts().filter(z=>String(z.src.id!=null?z.src.id:z.src.name)===String(p.src.id!=null?p.src.id:p.src.name)&&partPay(z,M)===pp)};
function vPart(){const p=curPart();if(!p)return '<div class="spempty"><b>این تخصیص پیدا نشد</b></div>';const SB=partSibs(p),RN=new Map();SB.forEach((z,k)=>z.ids.forEach(id=>RN.set(id,k+1)));const allRows=SB.flatMap(partRows),rows=partOrder((partAll||SB.length<2?SB:[p]).flatMap(partRows)),sm=sum(rows),bk=p.src.bank||'';
  const S=p.sent?rows.map(r=>stOf(r.id)):[],ok=S.filter(x=>x==='ok').length,fl=S.filter(x=>x==='fail').length,pend=rows.length-ok-fl,bad=rows.filter(r=>r.level===2).length;
  const st=!p.sent?['آماده ارسال','d']:ok===rows.length&&rows.length?['تسویه شده','ok']:['ارسال شده','w'];
  let h=`<div class="pthero"><div class="pti">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:var(--blu)">${esc(userInit(p.src.name))}</span>`}</div><b class="ptn">${esc(p.src.name)}</b><small class="ptm">${esc(methLabel(p))}</small>
    <div class="ptv">${fmt(sm)}<i>تومان</i></div><span class="est ${st[1]==='ok'?'ok':st[1]==='w'?'pend':''}">${st[0]}</span>
    <div class="ptst"><span><b>${fmt(rows.length)}</b> واریزی</span>${p.sent?`<span class="g"><b>${fmt(ok)}</b> تسویه</span><span class="w"><b>${fmt(pend)}</b> در انتظار</span>${fl?`<span class="r"><b>${fmt(fl)}</b> ناموفق</span>`:''}`:''}${bad?`<span class="r"><b>${fmt(bad)}</b> خطادار</span>`:''}</div>
    ${p.sent&&rows.length?`<div class="ptbar"><i class="ok" style="width:${ok/rows.length*100}%"></i><i class="no" style="width:${fl/rows.length*100}%"></i></div>`:''}</div>`;
  if(SB.length>1)h+=`<div class="seg frnd prnd"><button class="${partAll?'on':''}" data-act="partAllOn">همه مراحل <i>${fmt(allRows.length)}</i></button>${SB.map((z,k)=>`<button class="${!partAll&&z===p?'on':''}" data-act="partView" data-id="${z.id}" data-r="1">مرحله ${toFa(k+1)} <i>${fmt(z.ids.length)}</i>${z.sent?'':' <em>●</em>'}</button>`).join('')}</div><div class="bknote" style="margin:0 4px 10px">${partAll?'کپی و خروجی پایین صفحه برای همه مراحل با هم است.':'کپی و خروجی پایین صفحه برای مرحله انتخاب‌شده است؛ برای همه با هم «همه مراحل» را بزنید.'}${SB.some(z=>!z.sent)?' · <em style="font-style:normal;color:var(--warn)">●</em> یعنی هنوز ارسال نشده':''}</div>`;
  if(p.sent&&pend>0&&can('track'))h+=`<button class="okall" data-act="partOkAll">${ic('check')} همه ${fmt(pend)} واریز در انتظار، موفق</button>`;
  if(!p.sent)h+=`<div class="bknote" style="margin:0 4px 10px">«کپی و ارسال» متن را کپی می‌کند و همزمان این منبع را به پیگیری می‌برد.</div>`;
  ROWDATE=true;ROWSRC=false;ROWTRK=false;ROWMOVE=can('split');ROWRND=SB.length>1?RN:null;ROWTAP=can('edit')?'entEditGo':'openEnt';AM=allocMap();try{h+=`<div class="spsec"><b>واریزی‌های این منبع</b><small>برای جزئیات روی هر واریزی بزنید · کشیدن به چپ: تأیید، انتقال، کپی</small></div>${(()=>{const OK=partOrd.ok||new Set(),A=rows.filter(r=>!OK.has(r.id)),B=rows.filter(r=>OK.has(r.id));return (A.length?`<div class="blist fcard">${A.map(homeRow).join('')}</div>`:'')+(B.length?`<div class="spsec oksec"><b>${ic('check')} تسویه‌شده</b><small>${fmt(B.length)} واریزی · ${fmt(sum(B))} تومان</small></div><div class="blist fcard okc">${B.map(homeRow).join('')}</div>`:'')})()}`}finally{ROWDATE=false;ROWSRC=true;ROWTRK=false;ROWMOVE=false;ROWTAP='openEnt';ROWRND=null}
  const sg=(act,icn,t,sub,cls,attrs)=>`<button class="sgi${cls?' '+cls:''}" data-act="${act}"${attrs||''}><span class="si">${ic(icn)}</span><span class="tx"><b>${t}</b><small>${sub}</small></span><span class="cv">${ic('back')}</span></button>`;
  h+=`<div class="spsec"><b>تنظیمات این منبع</b></div><div class="sgr ptact">${sources.some(x=>String(x.id)===String(p.src.id))&&can('src')?sg('acEdit','bank','ویرایش حساب منبع','نام، بانک، شبا و کارت؛ همه‌جا به‌روز می‌شود','',` data-id="${p.src.id}"`):''}${can('split')&&rows.length?sg('partMoveAll','split','انتقال همه به منبع دیگر','همه واریزی‌های این منبع یکجا منتقل شوند'):''}${p.sent?sg('partUnsend','undo','برگرداندن از پیگیری به تخصیص','دوباره قابل ویرایش و تقسیم می‌شود'):sg('partDel','trash','لغو این تخصیص','واریزی‌ها به «مانده برای تقسیم» برمی‌گردند','rd')}</div>`;return h}
let partAll=true,partOrd={k:'',ids:[]};
/* ترتیب ردیف‌های منبع: موقع ورود، تسویه‌شده‌ها پایین می‌روند؛ تا بیرون رفتن ترتیب ثابت می‌ماند */
function partOrder(L){const k=partId+'|'+partAll;if(partOrd.k!==k){const o=r=>stOf(r.id)==='ok'?1:0;partOrd={k,ids:L.slice().sort((a,b)=>o(a)-o(b)).map(r=>r.id),ok:new Set(L.filter(r=>o(r)).map(r=>r.id))}}const pos=new Map(partOrd.ids.map((id,i)=>[id,i]));return L.slice().sort((a,b)=>(pos.has(a.id)?pos.get(a.id):1e9)-(pos.has(b.id)?pos.get(b.id):1e9))}
const partSel=()=>{const p=curPart();if(!p)return[];const SB=partSibs(p);return partAll&&SB.length>1?SB:[p]};
const partSelAlloc=()=>{const P=partSel(),p=curPart();return P.length>1?{res:[{src:{...p.src,limit:0},items:P.flatMap(partRows)}],left:[],excl:[],D:dates(ldKey)}:partsAlloc(P)};
const aPart=()=>curPart()?`${partSibs(curPart()).length>1?`<span class="rnlab">${partAll?'همه مراحل':'مرحله '+toFa(partSibs(curPart()).indexOf(curPart())+1)}</span>`:''}${curPart().sent?'':`<button class="btn sec" data-act="partEdit" data-id="${curPart().id}" style="flex:0 0 auto;padding:0 16px" aria-label="ویرایش تخصیص">${ic('edit')}</button>`}<button class="btn gold" data-act="partCopy">${ic('copy')} ${partSel().every(z=>z.sent)?'کپی دوباره':'کپی و ارسال'}</button>`:'';
const partsAlloc=P=>({res:P.map(p=>({src:{...p.src,limit:0},items:partRows(p)})),left:[],excl:[],D:dates(ldKey)});
/* ---------- ارسال تخصیص‌ها به پیگیری ---------- */
function commitParts(ids,quiet){const P=parts().filter(p=>ids.includes(p.id)&&!p.sent);if(!P.length)return null;
  /* ارسال: پیگیری هم مثل تخصیص به تاریخ واریز بسته است؛ هر واریزی تاریخ واریز خودش را با خود می‌برد */
  let b=batches.find(x=>x.date===ldKey&&!x.closed);if(!b){b={id:nid++,date:ldKey,pay:ldKey,createdAt:new Date().toISOString(),by:who(),items:[]};batches.unshift(b)}
  let n=0,s=0;P.forEach(p=>{partRows(p).forEach(r=>{if(b.items.some(x=>x.id===r.id))return;b.items.push({sAt:new Date().toISOString(),pay:PD(r),id:r.id,name:r.name,title:r.title||'',code:r.code||'',amount:r.amount,total:r.total,settled:r.settled,settles:r.settles,iban:r.iban,bank:r.bankShow||'',src:p.src.name,pid:p.id,st:'pending'});n++;s+=r.amount;const e=entries.find(z=>z.id===r.id);if(e)e.sentBid=b.id});p.sent=true;p.bid=b.id});
  saveE();saveB();saveD();logA('batch','ارسال به پیگیری',P.map(p=>p.src.name).join('، ')+' | '+fmt(n)+' واریزی | '+fmt(s)+' تومان | '+pdHead(ldKey));
  if(!quiet)toast(fmt(n)+' واریزی به پیگیری رفت','','برگرداندن',()=>uncommitParts(P.map(p=>p.id)));$('dock').innerHTML=dockHTML();if(['split1','part','lday'].includes(cur)){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}return b}
function uncommitParts(ids){let n=0;parts().filter(p=>ids.includes(p.id)&&p.sent).forEach(p=>{const b=batches.find(x=>x.id===p.bid);if(b){const keep=[];b.items.forEach(x=>{if(x.pid===p.id&&x.st==='pending'&&!x.tn&&!x.img){const e=entries.find(z=>z.id===x.id);if(e)delete e.sentBid;n++}else keep.push(x)});b.items=keep;if(!b.items.length)batches=batches.filter(z=>z!==b)}if(!b||!b.items.some(x=>x.pid===p.id)){p.sent=false;delete p.bid}});
  saveE();saveB();saveD();toast(n?fmt(n)+' واریزی به تخصیص برگشت':'موارد تیک‌خورده برنمی‌گردند',!n);render()}
function srcSettings(id){const s=id==='new'?{}:sources.find(x=>x.id==id);if(!s)return;
  acTmp={bank:id==='new'?'':acBank(s),ret:sv=>{if(aSt){if(sv){aSt.srcId=sv.id;if(aSt.method==='bank')aSt.bank=sv.bank||aSt.bank}allocSheet();recalc()}else if(srcRet==='mgr')srcMgr();else render()}};
  sheet(acFormHTML(s));acBindForm();if(id==='new')setTimeout(()=>{const n=$('acN');if(n)n.focus()},300)}

/* ============ تسویه بدهی: دفترچه حساب‌های طلبکار ============ */
let custs=ls.get('m_custs',[]);let creds=ls.get('m_creds',[]),credId=null,dTab='open',dQ='',dTmp=null;
const saveC=()=>ls.set('m_creds',creds);
const cPaid=c=>(c.pays||[]).filter(p=>p.st!=='wait').reduce((s,p)=>s+(+p.amount||0),0);
const cWait=c=>(c.pays||[]).filter(p=>p.st==='wait').reduce((s,p)=>s+(+p.amount||0),0);
const cRem=c=>Math.max(0,(+c.debt||0)-cPaid(c));
const cDone=c=>cRem(c)<=0;
const curC=()=>creds.find(c=>c.id===credId);
const openCreds=()=>creds.filter(c=>!cDone(c));
const ttlName=x=>(x.name||'');
const tChips=(sel,act)=>['خانم','آقا',''].map(t=>`<button class="tch${sel===t?' on':''}" data-act="${act}" data-t="${t}">${t||'بدون عنوان'}</button>`).join('');
/* اتصال به واریزی لیست روزانه: واریزهای انجام‌شده از مانده همان واریزی کم می‌شود */
function syncLink(c){if(!c.linkId)return;const e=entries.find(z=>z.id===c.linkId);if(!e||e.sentBid)return;
  const keep=(e.settles||[]).filter(s=>s.cred!==c.id);
  const add=(c.pays||[]).filter(p=>p.st!=='wait').map(p=>({id:p.id,title:p.title||'',name:p.name,phone:p.phone||'',inv:p.inv,amount:+p.amount,cred:c.id}));
  e.settles=keep.concat(add);e.updatedAt=new Date().toISOString();saveE();alloc=null}
