/* ---- v61.88 مانده مشتری در تسویه و «تخصیص در انتظار تأیید» ----
   خواسته صاحب اپ: وقتی از مانده یک مشتری برای تسویه واریزی دیگری تخصیص داده می‌شود (تسویه از مشتری با st:'wait')،
   تا تأیید نشده از مانده کم نمی‌شود ولی باید معلوم باشد: قاب مبلغ زرد + فهرست تسویه‌های در انتظار زیر کارت مانده.
   با «تأیید» (ACT.stlOk → stlTx) سند «دریافت وجه» خودکار در حساب مشتری ثبت و از مانده کم می‌شود.
   جستجوی پرداخت‌کننده: کنار هر حساب، مانده طلا (گرم) و مبلغ (تومان) با رنگ طلبکاریم (قرمز) / بدهکاریم (آبی). */
function cuPend(c){const id=String(c.id),L=[];for(const e of entries)for(const z of (e.settles||[]))if(z&&z.st==='wait'&&!z.byInv&&z.cuId!==''&&z.cuId!=null&&String(z.cuId)===id)L.push({e,z});return L}
function pendMap(){const M=new Map();for(const e of entries)for(const z of (e.settles||[]))if(z&&z.st==='wait'&&!z.byInv&&z.cuId!==''&&z.cuId!=null){const k=String(z.cuId);M.set(k,(M.get(k)||0)+(+z.amount||0))}
  for(const [k,o] of cuWaitM())M.set(k,(M.get(k)||0)+Math.abs(o.v));return M}
/* v104.1 (خواسته صاحب اپ: «مشتری وقتی حواله به مشتری دیگر می‌زند، سندش مثل بزرگی در انتظار تأیید باشد؛ مانده‌ای که به ما بدهکار است
   در انتظار تأیید بماند و بعد از تأیید صفر شود»). سند همان لحظه ثبت می‌شود (حساب‌ها و واریزی‌ها مثل قبل)، ولی پرداخت‌های تأییدنشده
   در کارت‌ها و فهرست حساب‌ها «در انتظار تأیید» (زرد) می‌مانند: مانده نمایش‌داده‌شده = مانده بدون آن پرداخت‌ها؛ بعد از تأیید همان مانده واقعی.
   پرداخت در انتظار: (۱) m:'dep' که تسویه‌اش روی واریزی هنوز st:'wait' است؛ (۲) m:'cust' با wt (حواله مشتری به مشتری، svCommit علامت می‌زند)
   و سند طرف مقابلش (m:'lnk' lm:'cust' با wt). نقشه cuWaitM: شناسه حساب → {v: جمع علامت‌دار پرداخت‌ها، L: ردیف‌ها} (حافظه window.__cwm) */
function cuWaitM(){if(window.__cwm)return window.__cwm;const W=new Set();for(const e of entries)if(!e.del)for(const z of (e.settles||[]))if(z&&z.st==='wait'&&z.byInv)W.add(String(e.id)+'|'+String(z.id));
  const M=new Map();for(const c of custs){if(!c||c.sys||c.del)continue;let v=0;const L=[];for(const t of (c.txs||[])){if(!t||t.del||t.type!=='inv')continue;(t.pays||[]).forEach((p,i)=>{
      const w=(p.m==='cust'||p.m==='lnk'&&p.lm==='cust')&&p.wt?1:p.m==='dep'&&p.entId!=null&&p.stlId!=null&&W.has(String(p.entId)+'|'+String(p.stlId))?2:0;if(!w)return;const a=pAmt(p);if(!a)return;v+=a;L.push({t,p,i,a,k:w})})}
    if(L.length)M.set(String(c.id),{v:Math.round(v),L})}
  return window.__cwm=M}
const cuWait=c=>c?(cuWaitM().get(String(c.id))||{v:0,L:[]}):{v:0,L:[]};
/* علامت‌گذاری در svCommit: حواله مشتری به مشتری (نه حساب بانکی) تازه = در انتظار تأیید؛ ردیف همان شخص در نسخه قبلی سند وضعش را نگه می‌دارد */
function cwMark(c,t,OLD){for(const p of (t.pays||[])){if(p.m!=='cust'||p.bk||p.wt!=null||p.okAt)continue;const Y=custs.find(z=>String(z.id)===String(p.cuId));if(!Y||Y.grp==='بانک'||c.grp==='بانک')continue;
    const o=OLD&&(OLD.pays||[]).find(q=>q.m==='cust'&&String(q.cuId)===String(p.cuId));if(o){if(o.wt)p.wt=1;if(o.okAt){p.okAt=o.okAt;p.okBy=o.okBy}continue}p.wt=1}}
/* تأیید: هر دو سند (اصلی و طرف مقابل) */
ACT.cwOk=d=>{const c=custs.find(z=>String(z.id)===String(d.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(d.tx)&&!z.del);if(!t)return;
  let src=t,sc=c,p=d.i!=null?(t.pays||[])[+d.i]:(t.pays||[]).find(q=>q.wt&&(q.m==='cust'&&String(q.cuId)===String(d.y)||q.m==='lnk'&&q.lm==='cust'));if(!p)return;if(p.m==='lnk'&&t.lk){sc=custs.find(z=>String(z.id)===String(t.lk.cu));src=sc&&(sc.txs||[]).find(z=>String(z.id)===String(t.lk.tx)&&!z.del);p=src&&(src.pays||[]).find(q=>q.m==='cust'&&String(q.cuId)===String(c.id)&&q.wt)}
  if(!src||!p){toast('سند اصلی این حواله پیدا نشد',true);return}
  askConfirm('رسیدن حواله «'+(sc?cuName(sc):'')+'» → «'+(p.cuName||'')+'» به مبلغ '+fmt(Math.abs(pAmt(p)))+' تومان تأیید شود؟','تأیید رسید',()=>{const now=new Date().toISOString();delete p.wt;p.okAt=now;p.okBy=who();
    const Y=custs.find(z=>String(z.id)===String(p.cuId)),m=Y&&(Y.txs||[]).find(z=>!z.del&&z.lk&&String(z.lk.tx)===String(src.id));if(m)for(const q of (m.pays||[]))if(q.m==='lnk'&&q.wt){delete q.wt;q.okAt=now;q.okBy=who()}
    saveCu();memoClear();logA('edit','تأیید حواله مشتری به مشتری',(sc?cuName(sc):'')+' → '+(p.cuName||'')+' | '+fmt(Math.abs(pAmt(p)))+' تومان',{cu:sc&&sc.id,tx:src.id});render();toast('حواله تأیید شد ✓')})};
/* ردیف‌های «در انتظار تأیید» زیر کارت مانده */
function cuWaitRows(W){return W.L.map(o=>{const dep=o.k===2,nm=dep?depName(o.p):(o.p.cuName||''),lab=dep?'حواله به واریزی «'+nm+'»':(o.p.m==='lnk'?(pAmt(o.p)<0?'حواله از «':'حواله به «'):(pAmt(o.p)>0?'حواله به «':'حواله از «'))+nm+'»';
    return `<button class="cupr" data-act="${dep?'depGo':'invOpenA'}" ${dep?`data-e="${esc(o.p.entId)}"`:`data-cu="${esc(String((custs.find(c=>(c.txs||[]).includes(o.t))||{}).id||''))}" data-tx="${esc(o.t.id)}"`}><span class="tx"><b>${esc(lab)}</b><small>سند ${toFa(o.t.no||'')} · ${esc(dates(o.t.date).fa)}${dep?' · تأیید روی واریزی':''}</small></span><b>${fmt(Math.abs(o.a))}</b>${ic('back').replace('class="i"','class="i flip"')}</button>`}).join('')}
ACT.invOpenA=d=>invOpen(d.cu,d.tx);
const cuPendSum=c=>cuPend(c).reduce((s,o)=>s+(+o.z.amount||0),0);
function cuPendHTML(b,P,pw,W,R2x){const R2=R2x!=null?R2x:(+b.R||0)+pw;/* تسویه = «دریافت وجه» از مشتری → مبلغ به سمت بدهکاریم می‌رود */
  return `<div class="cupd"><div class="cupdh"><span class="cupdi">${ic('clock')}</span><span class="tx"><b>تسویه در انتظار تأیید</b><small>بعد از تأیید از مانده کم می‌شود و سند خودکار می‌خورد</small></span><b class="cupda">${fmt(pw)}<i>تومان</i></b></div>
  ${W&&W.L.length?cuWaitRows(W):''}${P.map(({e,z})=>`<button class="cupr" data-act="openEnt" data-id="${e.id}"><span class="tx"><b>به «${esc(fullName(e))}»</b><small>${esc(dates(z.date||e.entryDate).fa)}${z.tn?' · پیگیری <bdi dir="ltr">'+esc(toFa(z.tn))+'</bdi>':''}</small></span><b>${fmt(+z.amount||0)}</b>${ic('back').replace('class="i"','class="i flip"')}</button>`).join('')}
  <div class="cupdf"><small>مانده مبلغ بعد از تأیید</small><b class="${q8S(R2)}">${R2?balV('r',R2):'۰'} <i>تومان</i></b><em class="${q8S(R2)}">${ourLab(R2)}</em></div></div>`}
/* مانده کوچک کنار نام در جستجوی پرداخت‌کننده: یک ردیف گرم، یک ردیف تومان (+ در انتظار تأیید، زرد) */
/* v78.4 (خواسته صاحب اپ: «مبالغی که تخصیص داده شده مشخص باشه و زرد بشه»): wp = بخشی از مانده که به واریزی‌ها تخصیص خورده و هنوز واریز/تأیید نشده (wdMap)؛ با تسویه‌های در انتظار یک خط زرد «تخصیص‌شده» */
function cuMiniBal(c,wp){const b=cuBal(c),wa=c?(cuWA.get(String(c.id))||0):0,wf=c?(cuWF.get(String(c.id))||0):0,pw=cuPendSum(c)+wa,row=(k,v)=>`<span class="stbv ${q8S(v)}"><b>${v?balV(k,v):'۰'}</b><i>${esc(balU(k))}</i><em>${ourLab(v)}</em></span>`;
  /* v90.9: حسابی که فقط مانده سکه/ارز دارد «۰ گرم» نشان می‌داد؛ حالا هر مانده‌ای که هست (طلا، تومان، تا دو نوع سکه/ارز) */
  const XK=Object.keys(b.X||{}).filter(k=>b.X[k]).slice(0,2),any=+b.G||+b.R||XK.length;
  return `<span class="stbl${pw?' pw':wf?' wf':''}">${+b.G||!any?row('g',+b.G||0):''}${+b.R?row('r',+b.R):''}${XK.map(k=>row(k,+b.X[k])).join('')}${pw?`<span class="stbv p"><b>${fmt(pw)}</b><i>تومان</i><em>تخصیص‌شده</em></span>`:''}${wf?`<span class="stbv f"><b>${fmt(wf)}</b><i>تومان</i><em>در لیست واریز</em></span>`:''}</span>`}

/* v61.93: مانده کوچک در همه جستجوهای مشتری (سند، تسویه): تسویه = برچسب کوچک کم‌رنگ؛ وگرنه گرم و تومان */
const cuBalMini=(c,wp)=>{const b=cuBal(c);return cuZero(b)&&!cuPendSum(c)&&!wp?cuZTag():cuMiniBal(c,wp)};
