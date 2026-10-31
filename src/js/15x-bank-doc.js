/* ===== v67.2 (خواسته صاحب اپ): حساب بانک مغازه مثل سند — «واریز به حساب» و «برداشت از حساب» =====
   - صفحه هر حساب بانک دو دکمه بزرگ دارد. «با سند مشتری» همان سند معمولی را باز می‌کند با ردیف حواله روی همین حساب
     (پس هم حساب مشتری و هم گردش بانک از یک ردیف می‌آیند: srcMoves)؛ «بدون مشتری» = ثبت دستی دفتر حساب (led).
   - جستجوی طرف سند: نام حساب بانک مغازه دیگر «حساب مشتری تازه» نمی‌سازد؛ ردیف «حساب بانک مغازه» دیده می‌شود و زدنش
     ردیف حواله سند را روی همان حساب می‌گذارد.
   - حسابی که اشتباهی به نام بانک «حساب مشتری» شده: کارت «انتقال به حساب بانک» (پایین‌تر، v67.3). */
const bxIoHTML=s=>can('src')?`<div class="bxio"><button class="bxiob in" data-act="bxIO" data-id="${s.id}" data-d="in"><span class="bxioi">${ic('down')}</span><span><b>واریز به حساب</b><small>دریافت از مشتری یا واریز دستی</small></span></button><button class="bxiob out" data-act="bxIO" data-id="${s.id}" data-d="out"><span class="bxioi">${ic('share')}</span><span><b>برداشت از حساب</b><small>حواله به مشتری یا برداشت دستی</small></span></button></div>`:'';
ACT.bxIO=d=>{const s=sources.find(x=>String(x.id)===String(d.id));if(!s)return;const i=d.d==='in',bk=acBank(s);
  sheet(`<div class="sh-h"><div><b>${i?'واریز به':'برداشت از'} «${esc(s.name)}»</b><small class="shsub">${bk?'بانک '+esc(bk)+' · ':''}${esc(bkSub(s))}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bxioL">${can('debt')?`<button class="bxioR" data-act="bxDoc" data-id="${s.id}" data-d="${d.d}"><span class="bxioi ${i?'in':'out'}">${ic('edit')}</span><span class="tx"><b>${i?'دریافت از مشتری':'حواله به مشتری'}</b><small>سند مشتری باز می‌شود؛ ${i?'مانده مشتری کم و این حساب زیاد':'طلب مشتری کم و از این حساب کم'} می‌شود</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`:''}
  <button class="bxioR" data-act="acLedNew" data-id="${s.id}" data-t="${d.d}"><span class="bxioi g">${ic(i?'plus':'share')}</span><span class="tx"><b>${i?'واریز دستی':'برداشت دستی'}</b><small>بدون حساب مشتری؛ فقط مانده همین حساب عوض می‌شود</small></span>${ic('back').replace('class="i"','class="i flip"')}</button></div>`)};
ACT.bxDoc=d=>{const s=sources.find(x=>String(x.id)===String(d.id));if(!s)return;ACT.svNew({pre:d.d==='out'?'hout':'hin',src:s.id})};
/* جستجوی طرف سند: حساب‌های بانک مغازه */
const svBkRows=q0=>{const q=clean(q0||'');if(!q||q.length<2||!can('src'))return '';const L=ownL().filter(s=>bkHit(s,q)).slice(0,3);
  return L.length?`<div class="cblh">حساب بانک مغازه<small>طرف سند نمی‌شود؛ ردیف حواله روی آن می‌نشیند</small></div>${L.map(s=>{const bk=acBank(s);return cbRow('svBk',{id:s.id},bk?bankBadge(bk):ic('bank'),esc(s.name),esc(bkSub(s)),'','bk')}).join('')}`:''};
ACT.svBk=d=>{const s=sources.find(x=>String(x.id)===String(d.id));if(!s||!sv)return;const p0=sv.qa&&sv.qa.p;
  sv.qa={...qaBlank(),p:p0&&p0.m!=='disc'&&p0.m!=='gold'?{...p0,m:'hav',srcId:s.id,chId:''}:pyNew('hav',{dir:'in',srcId:s.id})};sv.q='';svQO=0;svKeep();render();
  toast('ردیف حواله روی «'+s.name+'» آماده شد'+(svCu()?'':'؛ حالا مشتری سند را انتخاب کنید'));setTimeout(()=>{const q=$('svQ');if(q&&!svCu())q.focus({preventScroll:true})},80)};
/* ===== v67.3 انتقال «حساب مشتری» اشتباهی به نام بانک به حساب بانک مغازه =====
   ردیف‌های سندهای این حساب دو نوع‌اند:
   - cust (حواله به حساب مشتری دیگر): در حساب همان مشتری یک سند حواله بانکی با همان شماره (pays m:'hav' روی بانک) جایش می‌نشیند.
   - dep (حواله به فروشنده واریزی؛ صاحب اپ: «قبلاً از همان بانک حواله شده»): تسویه از روی واریزی برداشته می‌شود و همان مبلغ
     در پیگیری به‌صورت «ارسال‌شده از این بانک و تأییدشده» با همان رسید و پیگیری ثبت می‌شود؛ پس در لیست واریز دوباره نمی‌آید،
     از مانده بانک کم می‌شود و سند خرید فروشنده (e.wd) خودش ردیف پرداخت بانکی می‌گیرد. مانده مشتری‌ها عوض نمی‌شود.
   هر ردیفی که این شرایط را ندارد جدا نشان داده می‌شود و تا وقتی هست، انتقال انجام نمی‌شود (هیچ تغییر نصفه‌ای نمی‌ماند). */
const bxLiveT=c=>(c.txs||[]).filter(t=>!t.del);
const bxEnt=p=>entries.find(e=>!e.del&&String(e.id)===String(p.entId));
/* چرا این ردیف خودکار منتقل نمی‌شود ('' = می‌شود) */
function bxWhy(t,p){if(p.m==='cust')return p.cuId&&custs.some(y=>!y.del&&String(y.id)===String(p.cuId))?'':'حساب مشتری طرف حواله پیدا نشد';
  if(p.m==='dep'){const e=bxEnt(p);if(!e)return 'واریزی این حواله پیدا نشد';const z=(e.settles||[]).find(q=>q.id===p.stlId);if(!z)return 'تسویه این حواله روی واریزی پیدا نشد';
    if(e.sentBid||entries.some(q=>!q.del&&q.splitOf===e.id)||e.splitOf!=null)return 'بخشی از این واریزی از بانک ارسال شده یا چند بخشی است';
    const st=(e.settles||[]).reduce((a,q)=>a+(+q.amount||0),0);if(Math.round((+e.amount||0)-st)>0)return 'این واریزی مانده بانکی جدا دارد';return ''}
  return 'این نوع ردیف خودکار منتقل نمی‌شود'}
function bxTxWhy(t){if(t.type!=='inv')return 'این ردیف سند نیست';if((t.items||[]).length||(t.xr||[]).length||+t.disc||t.gc)return 'سند کالا یا طلا دارد';if(!(t.pays||[]).length)return 'سند ردیف پرداخت ندارد';
  for(const p of t.pays){const w=bxWhy(t,p);if(w)return w}return ''}
const bxConvOk=c=>!!c&&!c.sys&&can('src')&&can('debt')&&bxLiveT(c).length>0&&bxLiveT(c).every(t=>!bxTxWhy(t));
const bxLike=c=>{const n=nzName(toEn(cuName(c)||c.name||''));return /بانک/.test(n)||ownL().some(s=>{const m=canon(s.name),k=canon(n);return m.length>2&&k.length>2&&(k.includes(m)||m.includes(k))})};
const bxGuessSrc=c=>{const L=ownL(),k=canon(c.name||'');return L.find(s=>canon(s.name)===k)||L.find(s=>{const m=canon(s.name);return m.length>2&&(k.includes(m)||m.includes(k))})||L.find(s=>{const b=canon(acBank(s));return b&&k.includes(b)})||null};
const bxConvHTML=c=>c&&!c.sys&&can('src')&&can('debt')&&bxLike(c)&&bxLiveT(c).length?`<button class="bxcv" data-act="bxConv" data-cu="${c.id}"><span class="bxioi">${ic('bank')}</span><span class="tx"><b>این حساب بانک مغازه است؟</b><small>${toFa(bxLiveT(c).length)} سند به حساب بانک منتقل می‌شود؛ مانده مشتری‌ها همان می‌ماند</small></span><em>انتقال</em></button>`:'';
let bxCv=null;
ACT.bxConv=d=>{const c=custs.find(x=>String(x.id)===String(d.cu));if(!c)return;if(!ownL().length){toast('اول حساب بانک مغازه را در صفحه بانک بسازید',true);return}
  const g=bxGuessSrc(c);bxCv={cu:c.id,src:bxCv&&String(bxCv.cu)===String(c.id)&&bxCv.src!=null?bxCv.src:g?g.id:null};bxConvDraw()};
function bxConvDraw(){const c=custs.find(x=>String(x.id)===String(bxCv.cu));if(!c)return;const T=bxLiveT(c),ok=bxConvOk(c),tot=T.reduce((a,t)=>a+(t.pays||[]).reduce((b,p)=>b+(+p.amount||0),0),0);
  const row=(t,p)=>{const w=bxWhy(t,p),e=p.m==='dep'?bxEnt(p):null,Y=p.m==='cust'?custs.find(y=>String(y.id)===String(p.cuId)):null,who=e?fullName(e):Y?cuName(Y):(p.entName||p.cuName||'');
    return `<div class="bxcvr${w?' no':''}"><span class="tx"><b>حواله به ${esc(who)}</b><small>سند ${toFa(t.no)} · ${esc(dates(t.date).fa)}${p.m==='dep'?' · واریزی، تأییدشده از همین بانک':''}${w?'<br><em>'+esc(w)+'</em>':''}</small></span><b class="r"><bdi dir="ltr">−${fmt(Math.abs(+p.amount||0))}</bdi> <i>تومان</i></b></div>`};
  sheet(`<div class="sh-h"><div><b>انتقال به حساب بانک</b><small class="shsub">حساب «${esc(cuName(c))}» حذف و سندهایش حواله از بانک می‌شوند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="d6l"><small>کدام حساب بانک مغازه</small><div class="chps">${ownL().map(s=>{const bk=acBank(s);return `<button class="chp${String(bxCv.src)===String(s.id)?' on':''}" data-act="bxConvS" data-id="${s.id}">${bk?bankBadge(bk):ic('bank')}<span><b>${esc(s.name)}</b><small>${esc(bkSub(s))}</small></span></button>`}).join('')}</div></div>
  <div class="bxcvL">${T.map(t=>(t.pays||[]).length?(t.pays||[]).map(p=>row(t,p)).join(''):`<div class="bxcvr no"><span class="tx"><b>${esc(invTitle(t))}</b><small><em>${esc(bxTxWhy(t))}</em></small></span></div>`).join('')}</div>
  <small class="bxcvn">${ok?`بعد از انتقال ${fmt(Math.abs(tot))} تومان برداشت از این حساب بانک ثبت می‌شود و این «حساب مشتری» حذف می‌شود (با «بازگردانی» برمی‌گردد).`:'ردیف‌های قرمز خودکار منتقل نمی‌شوند؛ اول همان سندها را درست کنید.'}</small>
  <button class="xgo" data-act="bxConvGo"${bxCv.src==null||!ok?' disabled':''}>${ic('check')} انتقال به حساب بانک</button>`)}
ACT.bxConvS=d=>{if(!bxCv)return;bxCv.src=+d.id||d.id;bxConvDraw()};
/* واریزی‌ای که قبلاً از بانک s حواله شده → در پیگیری: ارسال‌شده از s و تأییدشده، با همان رسید */
function bxDepPaid(e,z,s,now){let b=batches.find(x=>x.date===PD(e)&&!x.closed);const nb=!b;if(nb){b={id:nid++,date:PD(e),pay:PD(e),createdAt:now,by:who(),items:[]};batches.unshift(b)}
  const K=stImgs(z),at=z.at||now,d=new Date(at),it={sAt:at,pay:PD(e),id:e.id,name:e.name,title:e.title||'',code:e.code||'',amount:+e.amount||0,total:+e.amount||0,settled:0,settles:[],iban:e.iban||'',bank:ibanBank(e.iban||'')||e.bank||'',src:s.name,st:'ok',tn:z.tn||'',time:isNaN(d)?'':p2(d.getHours())+':'+p2(d.getMinutes()),at:now,mvFrom:z.id,...(K.length?{imgs:K,img:K[0]}:{})};
  b.items.push(it);e.sentBid=b.id;return {b,it,nb}}
ACT.bxConvGo=()=>{if(!bxCv)return;const c=custs.find(x=>String(x.id)===String(bxCv.cu)),s=sources.find(x=>String(x.id)===String(bxCv.src));if(!c||!s||!bxConvOk(c)){toast('انتقال انجام نشد؛ ردیف‌های قرمز را ببینید',true);if(c&&bxCv)bxConvDraw();return}
  const now=ns(),at=new Date().toISOString(),U=[],names=[];
  for(const t of bxLiveT(c)){const P=t.pays.filter(p=>p.m==='cust'),Dp=t.pays.filter(p=>p.m==='dep'),G=new Map();let first=true;
    P.forEach(p=>{const k=String(p.cuId);if(!G.has(k))G.set(k,[]);G.get(k).push(p)});
    for(const [k,Q] of G){const Y=custs.find(y=>String(y.id)===k);
      const t2={id:nid++,type:'inv',no:first?t.no:invNext(),date:t.date,rate:t.rate||0,mz:t.mz||0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,
        pays:Q.map(p=>{const q={m:'hav',srcId:s.id,amount:-(+p.amount||0),tn:p.tn||''};const K=xrPh(p);if(K.length){q.imgs=K.slice();q.img=K[0]}return q}),at:t.at,by:t.by,mv:{cu:c.id,tx:t.id,at:now,by:who()}};first=false;
      const X=Q.map(p=>(Y.txs||[]).find(x=>String(x.id)===String(p.xfId))).filter(x=>x&&!x.del);X.forEach(x=>{x.del=true;x.delAt=at;x.delBy=who()});
      (Y.txs=Y.txs||[]).push(t2);Y.lastAt=now;U.push({k:'cu',Y,t2,X});names.push(cuName(Y))}
    for(const p of Dp){const e=bxEnt(p),i=(e.settles||[]).findIndex(q=>q.id===p.stlId),z=e.settles[i];
      e.settles=e.settles.filter((_,j)=>j!==i);e.updatedAt=now;e.updatedBy=who();const R=bxDepPaid(e,z,s,now);stlSync(e);U.push({k:'dep',e,z,i,...R});names.push(fullName(e))}
    t.del=true;t.delAt=at;t.delBy=who();t.mvTo=s.id;U.push({k:'t',t})}
  c.del=true;c.delAt=at;saveE();saveB();saveCu();saveS();logA('cust','انتقال به حساب بانک',cuName(c)+' → '+s.name+' | '+names.join('، '));
  const cu=c.id;bxCv=null;closeSheet();ACT.acOpen({id:s.id});
  toast('حواله‌ها به «'+s.name+'» منتقل شد','', 'بازگردانی',()=>{const at2=new Date().toISOString();U.forEach(u=>{
    if(u.k==='cu'){u.t2.del=true;u.t2.delAt=at2;u.t2.delBy=who();u.X.forEach(x=>{x.del=false})}
    else if(u.k==='dep'){u.b.items=u.b.items.filter(x=>x!==u.it);if(u.nb&&!u.b.items.length)batches=batches.filter(x=>x!==u.b);delete u.e.sentBid;const S=u.e.settles||[];S.splice(Math.min(u.i,S.length),0,u.z);u.e.settles=S;stlSync(u.e)}
    else{u.t.del=false;delete u.t.mvTo}});
    const C=custs.find(x=>String(x.id)===String(cu));if(C)C.del=false;saveE();saveB();saveCu();saveS();render()})};
