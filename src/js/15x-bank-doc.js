/* ===== v67.2 (خواسته صاحب اپ): حساب بانک مغازه مثل سند — «واریز به حساب» و «برداشت از حساب» =====
   - صفحه هر حساب بانک دو دکمه بزرگ دارد. «با سند مشتری» همان سند معمولی را باز می‌کند با ردیف حواله روی همین حساب
     (پس هم حساب مشتری و هم گردش بانک از یک ردیف می‌آیند: srcMoves)؛ «بدون مشتری» = ثبت دستی دفتر حساب (led).
   - جستجوی طرف سند: نام حساب بانک مغازه دیگر «حساب مشتری تازه» نمی‌سازد؛ ردیف «حساب بانک مغازه» دیده می‌شود و زدنش
     ردیف حواله سند را روی همان حساب می‌گذارد.
   - حسابی که اشتباهی به نام بانک «حساب مشتری» شده (سندهایش فقط انتقال به حساب مشتری‌های دیگر است): کارت «انتقال به حساب بانک»
     هر سند را به یک سند حواله روی حساب بانک (با همان شماره، در حساب همان مشتری) تبدیل می‌کند؛ مانده مشتری‌ها عوض نمی‌شود. */
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
/* حساب مشتریِ اشتباهی به نام بانک → انتقال به حساب بانک */
const bxLiveT=c=>(c.txs||[]).filter(t=>!t.del);
function bxConvOk(c){if(!c||c.sys||!can('src')||!can('debt'))return false;const T=bxLiveT(c);if(!T.length)return false;
  return T.every(t=>t.type==='inv'&&!(t.items||[]).length&&!(t.xr||[]).length&&!+t.disc&&!t.gc&&(t.pays||[]).length&&(t.pays||[]).every(p=>p.m==='cust'&&p.cuId&&custs.some(y=>!y.del&&String(y.id)===String(p.cuId))))}
const bxLike=c=>{const n=canon(cuName(c)||c.name||'');return n.includes(canon('بانک'))||ownL().some(s=>{const m=canon(s.name);return m.length>2&&(n.includes(m)||m.includes(n))})};
const bxGuessSrc=c=>{const n=canon(c.name||''),L=ownL();return L.find(s=>canon(s.name)===n)||L.find(s=>{const m=canon(s.name);return m.length>2&&(n.includes(m)||m.includes(n))})||L.find(s=>{const b=acBank(s);return b&&n.includes(canon(b))})||null};
const bxConvHTML=c=>bxConvOk(c)&&bxLike(c)?`<button class="bxcv" data-act="bxConv" data-cu="${c.id}"><span class="bxioi">${ic('bank')}</span><span class="tx"><b>این حساب بانک مغازه است؟</b><small>${toFa(bxLiveT(c).length)} سند به حساب بانک منتقل می‌شود؛ مانده مشتری‌ها همان می‌ماند</small></span><em>انتقال</em></button>`:'';
let bxCv=null;
ACT.bxConv=d=>{const c=custs.find(x=>String(x.id)===String(d.cu));if(!bxConvOk(c)){toast('سندهای این حساب قابل انتقال خودکار نیستند',true);return}const L=ownL();if(!L.length){toast('اول حساب بانک مغازه را در صفحه بانک بسازید',true);return}
  const g=bxGuessSrc(c);bxCv={cu:c.id,src:bxCv&&String(bxCv.cu)===String(c.id)&&bxCv.src!=null?bxCv.src:g?g.id:null};bxConvDraw()};
function bxConvDraw(){const c=custs.find(x=>String(x.id)===String(bxCv.cu));if(!c)return;const T=bxLiveT(c),tot=T.reduce((a,t)=>a+(t.pays||[]).reduce((b,p)=>b+(+p.amount||0),0),0);
  sheet(`<div class="sh-h"><div><b>انتقال به حساب بانک</b><small class="shsub">حساب «${esc(cuName(c))}» حذف و سندهایش حواله بانکی می‌شوند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="d6l"><small>کدام حساب بانک مغازه</small><div class="chps">${ownL().map(s=>{const bk=acBank(s);return `<button class="chp${String(bxCv.src)===String(s.id)?' on':''}" data-act="bxConvS" data-id="${s.id}">${bk?bankBadge(bk):ic('bank')}<span><b>${esc(s.name)}</b><small>${esc(bkSub(s))}</small></span></button>`}).join('')}</div></div>
  <div class="bxcvL">${T.map(t=>(t.pays||[]).map(p=>{const Y=custs.find(y=>String(y.id)===String(p.cuId)),a=-(+p.amount||0);return `<div class="bxcvr"><span class="tx"><b>${a<0?'حواله به ':'حواله از '}${esc(Y?cuName(Y):'')}</b><small>سند ${toFa(t.no)} · ${esc(dates(t.date).fa)}</small></span><b class="${a<0?'r':'b'}"><bdi dir="ltr">${a<0?'−':'+'}${fmt(Math.abs(a))}</bdi> <i>تومان</i></b></div>`}).join('')).join('')}</div>
  <small class="bxcvn">بعد از انتقال: ${tot>0?'از':'به'} مانده این حساب بانک ${fmt(Math.abs(tot))} تومان ${tot>0?'کم':'اضافه'} می‌شود و این «حساب مشتری» حذف می‌شود (با «بازگردانی» برمی‌گردد).</small>
  <button class="xgo" data-act="bxConvGo"${bxCv.src==null?' disabled':''}>${ic('check')} انتقال به حساب بانک</button>`)}
ACT.bxConvS=d=>{if(!bxCv)return;bxCv.src=+d.id||d.id;bxConvDraw()};
ACT.bxConvGo=()=>{if(!bxCv)return;const c=custs.find(x=>String(x.id)===String(bxCv.cu)),s=sources.find(x=>String(x.id)===String(bxCv.src));if(!c||!s||!bxConvOk(c)){toast('انتقال انجام نشد؛ دوباره امتحان کنید',true);return}
  const now=ns(),at=new Date().toISOString(),U=[];
  for(const t of bxLiveT(c)){const G=new Map();(t.pays||[]).forEach(p=>{const k=String(p.cuId);if(!G.has(k))G.set(k,[]);G.get(k).push(p)});let first=true;
    for(const [k,P] of G){const Y=custs.find(y=>String(y.id)===k);
      const t2={id:nid++,type:'inv',no:first?t.no:invNext(),date:t.date,rate:t.rate||0,mz:t.mz||0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,
        pays:P.map(p=>{const q={m:'hav',srcId:s.id,amount:-(+p.amount||0),tn:p.tn||''};if(p.imgs&&p.imgs.length){q.imgs=p.imgs.slice();q.img=q.imgs[0]}else if(p.img){q.img=p.img;q.imgs=[p.img]}return q}),
        at:t.at,by:t.by,mv:{cu:c.id,tx:t.id,at:now,by:who()}};first=false;
      const X=P.map(p=>(Y.txs||[]).find(x=>String(x.id)===String(p.xfId))).filter(x=>x&&!x.del);X.forEach(x=>{x.del=true;x.delAt=at;x.delBy=who()});
      (Y.txs=Y.txs||[]).push(t2);Y.lastAt=now;U.push({Y,t2,X})}
    t.del=true;t.delAt=at;t.delBy=who();t.mvTo=s.id;U.push({t})}
  c.del=true;c.delAt=at;saveCu();saveS();logA('cust','انتقال به حساب بانک',cuName(c)+' → '+s.name+' | '+U.filter(u=>u.t2).map(u=>'سند '+toFa(u.t2.no)+' '+cuName(u.Y)).join('، '));
  const cu=c.id;bxCv=null;closeSheet();ACT.acOpen({id:s.id});
  toast('سندها به «'+s.name+'» منتقل شد','', 'بازگردانی',()=>{U.forEach(u=>{if(u.t2){u.t2.del=true;u.t2.delAt=new Date().toISOString();u.t2.delBy=who();u.X.forEach(x=>{x.del=false})}else{u.t.del=false;delete u.t.mvTo}});const C=custs.find(x=>String(x.id)===String(cu));if(C)C.del=false;saveCu();saveS();render()})};
