/* ============ v65.0 (خواسته صاحب اپ): هر واریزی = حساب مشتری + سند؛ پرداخت یک واریزی در یک بخش ============
   ۱) هر واریزی تازه (پنجره خرید، فرم ثبت، چسباندن لیست) به حساب مشتری‌اش وصل می‌شود (پیدا کردن با تلفن یا نام یکتا، وگرنه حساب تازه)
      و یک سند «خرید» در همان حساب می‌خورد (t.auto:'dep'، t.entId). پیوند واریزی ↔ سند همان e.wd={cu,no,amt} است (15q-wd)،
      پس تأیید بانک و تسویه‌های تأییدشده خودکار ردیف پرداخت سند می‌شوند و مانده حساب صفر می‌شود.
   ۲) «تسویه از مشتری» یک سند «دریافت» در حساب پرداخت‌کننده است با ردیف m:'dep' (همان حواله دوطرفه سند فروش، byInv)؛
      قابل چاپ مثل همه سندها. حذف تسویه سندش را برمی‌دارد و حذف/بازگردانی واریزی سندهایش را هم.
   ۳) جزئیات واریزی: یک بخش «پرداخت این واریزی» (مشتری‌ها + بانک) و یک پنل جستجو؛ سندها با سازوکار همان سند دستی (svCommit) ساخته می‌شوند.
   فقط واریزی‌های تازه خودکار؛ برای واریزی قبلی دکمه «ساخت سند» در جزئیات هست. */

/* کالای بدون وزن یا «سایر» در سند: یک ردیف خرید پولی بدون اثر جنسی (k:'o' در فهرست سکه/ارز نمی‌آید) */
if(!XA['کالا'])XA['کالا']={t:'کالا',s:'کالا',u:'مورد',k:'o'};
const COINK={'تمام امامی':'امامی','تمام بهار':'بهار','نیم':'نیم','ربع':'ربع','گرمی':'گرمی'};
function depXr(e){let I=(e.items||[]).filter(z=>+z.amt);/* اقلام فقط اگر جمعشان همان مبلغ واریزی است (بعد از ویرایش مبلغ، یک ردیف طلا با وزن و مبلغ تازه) */if(!I.length||Math.round(I.reduce((s,z)=>s+(+z.amt||0),0))!==Math.round(+e.amount||0))I=[{k:'طلا',q:e.weight||'',amt:+e.amount||0}];
  return I.map(z=>{const a=Math.round(+z.amt||0),q=parseFloat(toEn(String(z.q||'')))||0;
    if(z.k==='طلا'&&q>0)return xrNew('buy','gold',{w:String(q),ay:750,amT:a,cat:z.t||'متفرقه'});
    if(z.k==='سکه'&&COINK[z.t])return xrNew('buy',COINK[z.t],{q:String(q||1),amT:a});
    if((z.k==='دلار'||z.k==='یورو')&&q>0)return xrNew('buy',z.k==='دلار'?'USD':'EUR',{q:String(q),amT:a});
    return xrNew('buy','کالا',{q:'1',amT:a,nt:clean([z.k==='سایر'?'':z.k,z.t||'',z.n||''].filter(Boolean).join(' '))||'خرید'})})}

/* ---------- حساب مشتری ---------- */
const phD=p=>toEn(String(p||'')).replace(/\D/g,'');
function cuFindBy(o){const A=CU(),ph=phD(o.phone),nm=nzName(stripName(o.name||''));
  if(o.cuId!=null&&o.cuId!==''){const c=A.find(c=>String(c.id)===String(o.cuId));if(c)return c}
  if(ph.length===11){const c=A.find(c=>phD(c.phone)===ph);if(c)return c}
  if(nm){const L=A.filter(c=>nzName(c.name)===nm||nzName(cuName(c))===nm);if(L.length===1)return L[0]}return null}
function cuMakeBy(o,why){const now=ns(),iban=o.iban&&ibanOk(o.iban)?o.iban:'',c={id:nid++,title:o.title||'',name:clean(stripName(o.name||'')),phone:phD(o.phone).length===11?phD(o.phone):'',nid:toEn(o.nid||''),note:'',grp:'',av:'',idImgs:[],txs:[],createdAt:now,lastAt:now,by:who()};
  if(iban||o.card)c.bk={iban,card:o.card||'',holder:clean(o.holder||'')||c.name,at:now};
  custs.push(c);logA('cust','افتتاح حساب مشتری'+(why?' ('+why+')':''),cuName(c));return c}
const cuOf=(o,why)=>cuFindBy(o)||cuMakeBy(o,why);

/* ---------- ساخت سند با همان سازوکار سند دستی (svCommit)، بدون دست زدن به سند باز کاربر ---------- */
function docMake(c,set){const S0=sv;let R=null;try{sv=svBlank(c.id);sv.rate=0;sv.mz=0;set(sv);R=svCommit()}finally{sv=S0}return R}
const depDoc=e=>{if(!e||!e.wd)return null;const c=custs.find(z=>!z.del&&String(z.id)===String(e.wd.cu)),t=c&&(c.txs||[]).find(t=>!t.del&&t.type==='inv'&&String(t.no)===String(e.wd.no));return t?{c,t}:null};
/* سند خرید فروشنده برای یک واریزی (e باید در entries باشد) */
function depDocMake(e,c){const R=docMake(c,s=>{s.dk='buy';s.date=e.entryDate||todayISO();s.xr=depXr(e)});R.t.auto='dep';R.t.entId=e.id;
  e.wd={cu:c.id,no:R.t.no,amt:+e.amount||0,w:String(e.weight||'')};e.cuId=c.id;saveCu();saveE();return R}
/* بعد از ویرایش مبلغ/وزن واریزی: سند خودکارش با همان شماره دوباره ساخته می‌شود (ردیف‌های پرداخت می‌مانند) */
function depDocFix(e){const D=depDoc(e);if(!D||D.t.auto!=='dep'||String(D.t.entId)!==String(e.id))return;if(+e.wd.amt===+e.amount&&String(e.wd.w||'')===String(e.weight||''))return;
  const R=docMake(D.c,s=>{s.edit={tx:D.t.id,no:D.t.no};s.dk='buy';s.date=D.t.date;s.xr=depXr(e);s.pays=(D.t.pays||[]).map(p=>({...p}))});R.t.auto='dep';R.t.entId=e.id;e.wd.amt=+e.amount||0;e.wd.w=String(e.weight||'');saveCu();saveE()}
/* سند «دریافت» پرداخت‌کننده: ردیف حواله به فروشنده همین واریزی → تسویه byInv روی واریزی (ckDepApply در svCommit) */
function payDocMake(e,c,a,o){o=o||{};const p={m:'dep',amount:Math.round(a),entId:e.id,entName:fullName(e)};if(o.tn)p.tn=o.tn;if(o.imgs&&o.imgs.length){p.imgs=o.imgs.slice();p.img=o.imgs[0]}
  const R=docMake(c,s=>{s.dk='in';s.date=todayISO();s.pays=[p]});const t=R.t;t.auto='stl';t.entId=e.id;
  const z=(e.settles||[]).find(s=>s.id===(t.pays[0]||{}).stlId);if(z){z.inv='';z.note=o.note||'';if(o.st==='ok'){z.st='ok';z.okAt=ns();z.okBy=who()}stlSync(e)}saveCu();saveE();return {c,t,z}}
/* واریزی تازه → حساب + سند؛ تسویه‌های همراهش → سند دریافت هر پرداخت‌کننده */
function depLink(e,o){o=o||{};try{const S=(o.settles||[]).filter(s=>+s.amount>0);
    const c=cuOf({cuId:o.cuId,name:e.name,title:e.title,phone:e.phone,nid:e.nid,iban:e.iban,card:e.card,holder:e.holder},'از واریزی');depDocMake(e,c);
    for(const s of S){const pc=pyOf({cuId:s.cuId,name:s.name,phone:s.phone});payDocMake(e,pc,+s.amount,{tn:s.tn||'',note:s.note||'',imgs:stImgs(s),st:s.st||'ok'})}
    return c}catch(err){toast('واریزی ثبت شد، اما سند حساب مشتری ساخته نشد',true);return null}}
/* حذف تسویه از سمت واریزی: سند خودکارش حذف، در سند دستی فقط همان ردیف */
function stlDocOff(z){if(!z||!z.byInv)return;const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);if(!t)return;const now=ns();
  if(t.auto==='stl'){t.del=true;t.delAt=now;t.delBy=who()}else t.pays=(t.pays||[]).filter(p=>!(p.m==='dep'&&p.stlId===z.id));c.lastAt=now;saveCu()}
/* حذف واریزی (سطل) → سندهای خودکارش هم حذف؛ بازگردانی → برمی‌گردند */
function depDocTrash(L){const S=new Set(L.map(e=>String(e.id))),now=ns();let n=0;for(const c of custs)for(const t of c.txs||[])if(!t.del&&t.auto&&S.has(String(t.entId))){t.del=true;t.delAt=now;t.delBy=who();t.delEnt=t.entId;c.lastAt=now;n++}if(n)saveCu()}
function depDocBack(L){const S=new Set(L.map(e=>String(e.id))),now=ns();let n=0;for(const c of custs)for(const t of c.txs||[])if(t.del&&t.delEnt!=null&&S.has(String(t.delEnt))){t.del=false;delete t.delAt;delete t.delBy;delete t.delEnt;c.lastAt=now;n++}if(n)saveCu()}

/* ---------- جزئیات واریزی: پیوند به سند مشتری ---------- */
function entDocLink(x){const e=entries.find(z=>z.id===famRoot(x))||x,D=depDoc(e);
  if(D)return `<button class="py7doc" data-act="depDocGo" data-id="${e.id}"><span class="py7di">${ic('inv')}</span><span class="tx"><b>${esc(invTitle(D.t))}</b><small>در حساب «${esc(cuName(D.c))}» · ${(b=>b.R?balLab(b.R)+' '+fmt(Math.abs(b.R))+' تومان':'حساب تسویه است')(cuBal(D.c))}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`;
  return can('edit')&&!x.splitOf?`<button class="py7doc nw" data-act="depDocNew" data-id="${e.id}"><span class="py7di">${ic('plus')}</span><span class="tx"><small>این واریزی هنوز سند ندارد</small><b>ساخت حساب و سند در حساب مشتری</b></span></button>`:''}
ACT.depDocGo=d=>{const e=entries.find(z=>String(z.id)===String(d.id)),D=depDoc(e);if(D)invOpen(D.c.id,D.t.id)};
ACT.depDocNew=d=>{const e=entries.find(z=>String(z.id)===String(d.id));if(!e||depDoc(e))return;
  const c=cuFindBy({name:e.name,phone:e.phone});askConfirm((c?'سند خرید در حساب «'+cuName(c)+'» ثبت شود؟':'حساب «'+clean(e.name)+'» باز و سند خرید در آن ثبت شود؟')+' مبلغ '+fmt(+e.amount||0)+' تومان.','ثبت سند',()=>{
    const cc=c||cuMakeBy({name:e.name,title:e.title,phone:e.phone,nid:e.nid,iban:e.iban,card:e.card,holder:e.holder},'از واریزی');const R=depDocMake(e,cc);wdSync();
    logA('edit','ساخت سند برای واریزی',fullName(e)+' | '+invTitle(R.t));pyRe();toast(invTitle(R.t)+' در حساب «'+cuName(cc)+'» ثبت شد','','دیدن سند',()=>invOpen(cc.id,R.t.id))})};

/* ---------- بخش یکپارچه «پرداخت این واریزی» ---------- */
let pyFlash=null;
function entPay(x){const F=famOf(x),e=entries.find(z=>z.id===x.id)||x,S=e.settles||[],ed=can('edit'),A=allocMap(),sent=F.some(r=>r.sentBid),tot=(+e.amount||0)+(x.id===famRoot(x)?F.filter(r=>r.id!==e.id).reduce((a,r)=>a+(+r.amount||0),0):0);
  const open=!x.full&&x.amount>0&&!(x.sentBid&&stOf(x.id)==='ok'),canAdd=ed&&open;if(!S.length&&!tot)return '';
  const cOk=S.filter(z=>z.st!=='wait').reduce((a,z)=>a+(+z.amount||0),0),cW=S.filter(z=>z.st==='wait').reduce((a,z)=>a+(+z.amount||0),0);
  const bk=F.length>1?F.map(r=>({r,s:famSrc(r,A)})):[{r:x,s:famSrc(x,A)}],bOk=bk.filter(o=>o.s&&o.s.sent&&o.s.st==='ok').reduce((a,o)=>a+(+o.r.amount||0),0),bAll=Math.max(0,tot-cOk-cW);
  const pc=v=>tot?Math.max(0,Math.min(100,v/tot*100)).toFixed(2)+'%':'0%';
  const cuRow=(z,i)=>{const w=z.st==='wait',n=stImgs(z).length,dt=z.byInv&&(()=>{const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);return t?invTitle(t):''})(),sub=[dt||'',!dt&&z.cuId?'حساب مشتری':!dt?'بدون حساب':'',z.tn?'پیگیری '+esc(toFa(z.tn)):''].filter(Boolean).join(' · ');
    return swW(`<div class="py7r ${w?'w':'k'}${pyFlash!=null&&String(pyFlash)===String(z.id)?' nw':''}"><button class="py7b" data-act="pyOpen" data-i="${i}" aria-label="${z.byInv?'دیدن سند ':''}${esc(z.name||'')}"><span class="py7a">${esc(userInit(z.name||'؟'))}</span><span class="tx"><b>${esc(z.name||'—')}</b><small>${sub}</small></span><span class="py7v"><em class="py9t c">مشتری</em><b>${fmt(z.amount)}<i>تومان</i></b><small>${w?'در انتظار تأیید':'تأیید شد'}</small></span></button>${n||can('track')?`<button class="py7c${n?' on':''}" data-act="galSt" data-i="${i}" aria-label="رسیدهای تسویه">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:''}</div>`,
      {r:ed&&w?[['stlOk','تأیید','check','#178049']]:ed?[['stlUnok','لغو تأیید','undo','#6b7385']]:[],l:ed?[['stlDelI',w?'رد':'حذف',w?'undo':'trash','#d23c48']]:[],data:{i}})};
  /* v69.6 (خواسته صاحب اپ: «همه نحوه تسویه‌ها در یک لیست، ولی نوعشان جدا؛ واریزی دو بار نخورد»):
     یک فهرست برای همه: تسویه از مشتری، هر بخش واریز بانکی (ارسال‌شده یا نه) و مانده. کارت جدای «واریز بانکی» دیگر نیست.
     هر ردیف برچسب نوع دارد (مشتری / بانک / مانده). کارها با کشیدن:
       بانک ارسال‌نشده: به چپ = ثبت واریز (ارسال همین یکی)، به راست = تغییر بانک یا ویرایش/برداشتن بخش؛ زدن = انتخاب یا تغییر بانک (همه یا بخشی از مبلغ)
       بانک ارسال‌شده: به چپ = تأیید / لغو تأیید، به راست = ویرایش بانک و مبلغ، ناموفق، برگرداندن به تخصیص؛ زدن = رسید و شماره پیگیری
       مشتری: به چپ = تأیید، به راست = رد/حذف؛ زدن = سند یا ویرایش */
  const rootId=famRoot(x),edB=can('split')&&!x.full,tk=can('track');
  const bkSt=(s,q)=>q?(q.it.st==='ok'?['k','واریز شد']:q.it.st==='fail'?['f','ناموفق']:['w','در انتظار تأیید']):s?['d','آماده ارسال']:['n','بانک انتخاب نشده'];
  const bkAv=s=>(so=>so&&acBank(so)?bankBadge(acBank(so)):ic('bank'))(s&&sources.find(z=>z.name===s.name));
  const multi=bk.length>1,hasCu=S.length>0;
  const bkRow=({r,s},k)=>{const root=r.id===rootId,q=r.sentBid?entBI(r):null,st=bkSt(s,q),lk=q&&ssLock(q.it),cl=q&&q.b.closed,n=q?itImgs(q.b,q.it).length:0;
    const tag=root&&hasCu&&!multi?'مانده · بانک':'بانک',ttl=s?esc(s.name):'انتخاب بانک',
      sub=[st[1],multi?'بخش '+toFa(k+1):'',q&&q.it.tn?'پیگیری '+esc(toFa(q.it.tn)):''].filter(Boolean).join(' · ');
    const act=q?`data-act="itOpen" data-b="${q.b.id}" data-i="${q.i}"`:!edB||F.some(z=>z.sentBid)?(s&&tk?`data-act="bkGo" data-id="${r.id}"`:''):root?`data-act="entMove" data-id="${r.id}"`:`data-act="pkEdit" data-id="${r.id}"`;
    const cam=q?(n||tk?`<button class="py7c${n?' on':''}" data-act="galIt" data-id="${r.id}" aria-label="رسیدهای واریز">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:''):s&&tk?`<button class="py7c" data-act="bkGo" data-id="${r.id}" aria-label="ثبت واریز و رسید">${ic('plus')}</button>`:'';
    const row=`<div class="py7r b py9 ${st[0]}${pyFlash!=null&&String(pyFlash)===String(r.id)?' nw':''}"><${act?'button':'div'} class="py7b" ${act}><span class="py7a bk">${bkAv(s)}</span><span class="tx"><b>${ttl}</b><small>${sub}</small></span><span class="py7v"><em class="py9t b">${tag}</em><b>${fmt(q&&q.it.amount!=null?+q.it.amount:r.amount)}<i>تومان</i></b></span></${act?'button':'div'}>${cam}</div>`;
    let R=[],L=[];
    if(q){if(tk&&!cl)R=q.it.st==='ok'?[['entTkQ','لغو تأیید','undo','#6b7385']]:[['entTkQ','تأیید','check','#178049']];
      if(edB&&!cl){const xr=validated().find(z=>z.id===rootId);if(xr&&ssCan(xr)&&!lk)L.push(['sentSplit','ویرایش','edit','#3b6fd6']);if(tk&&q.it.st!=='fail'&&q.it.st!=='ok')L.push(['entTkF','ناموفق','x','#d23c48']);if(root&&xr&&unsendCan(xr))L.push(['entUnsend','برگرداندن','undo','#6b7385'])}}
    else{if(s&&tk)R=[['bkGo','ثبت واریز','check','#178049']];
      /* بخشی ارسال شده باشد: مبلغ بخش‌های ارسال‌نشده از بانک اصلی ارسال‌شده کم/زیاد نمی‌شود؛ اول این بخش هم ثبت شود، بعد «ویرایش» همه بخش‌ها */
      if(edB&&!F.some(z=>z.sentBid))L=root?[['entMove',s?'تغییر بانک':'انتخاب بانک','swap','#3b6fd6']]:[['pkEdit','ویرایش','edit','#3b6fd6'],['pkDel','برداشتن','trash','#d23c48']]}
    return swW(row,{r:R,l:L,data:{id:r.id,st:'ok',b:q?q.b.id:'',i:q?q.i:''}})};
  const bkS=bk.slice().sort((p,q)=>(p.r.id===rootId)-(q.r.id===rootId)||p.r.id-q.r.id);
  const head=x.full?'<em class="py7st ok">تسویه کامل</em>':cW?`<em class="py7st w">${toFa(S.filter(z=>z.st==='wait').length)} در انتظار</em>`:'';
  const xr=validated().find(z=>z.id===rootId)||x,lockR=xr.sentBid&&(q0=>!q0||ssLock(q0.it)||q0.b.closed)(entBI(xr)),addOk=ed&&open&&x.id===rootId&&!lockR,rc=rcOfEnt(x);
  return `<div class="esec py7" id="py7"><div class="py7h"><div><b>پرداخت این واریزی</b><small>جمع ${fmt(tot)} تومان${S.length?' · '+toFa(S.length)+' از مشتری':''}${bAll?' · بانک '+fmt(bAll):''}</small></div>${head}${rc.length?`<button class="stladd sh" data-act="rcEntAll" data-id="${x.id}">${ic('open')} رسیدها <i>${toFa(rc.length)}</i></button>`:''}</div>
  <div class="py7bar" role="img" aria-label="${esc('از مشتری '+fmt(cOk+cW)+' تومان، از بانک '+fmt(bAll)+' تومان')}"><i class="k" style="--w:${pc(cOk)}"></i><i class="w" style="--w:${pc(cW)}"></i><i class="b${bOk>=bAll&&bAll?' ok':''}" style="--w:${pc(bAll)}"></i></div>
  <div class="py7k"><span class="k">از مشتری ${fmt(cOk+cW)}</span><span class="b">از بانک ${fmt(bAll)}</span></div>
  <div class="py7l">${S.map(cuRow).join('')}${bAll||!S.length?bkS.map(bkRow).join(''):''}</div>
  ${addOk?`<button class="py7add" data-act="pyAdd"><span class="py7s">${ic('search')}</span><span class="tx"><b>افزودن پرداخت</b><small>مشتری (با حساب یا بدون حساب) یا بخشی از بانک دیگر مغازه</small></span><span class="py7p">${ic('plus')}</span></button>`:''}
  ${(ed||tk)&&(bAll||!S.length)?`<div class="py9h">${ic('back').replace('class="i"','class="i flip"')}<span>ردیف را بکشید: به چپ ${x.sentBid?'تأیید':'ثبت واریز'} · به راست ${x.sentBid?'ویرایش، ناموفق، برگرداندن':'تغییر بانک'}</span></div>`:''}
  ${multi&&can('split')&&!F.some(r=>r.sentBid)&&!x.full?`<button class="link" data-act="paySplitUndo" data-id="${x.id}">یکی کردن بخش‌های بانکی</button>`:''}</div>`}
/* v68.8: ردیف پیگیری یک واریزی؛ اگر هنوز ارسال نشده، فقط همین واریزی (جدا از بقیه همان منبع) به پیگیری می‌رود */
function bkItem(e){const b=e&&e.sentBid&&batches.find(z=>z.id===e.sentBid),i=b?b.items.findIndex(x=>x.id===e.id):-1;return i<0?null:{b,i,it:b.items[i]}}
function bkSend(e){let p=null;for(const d in drafts){p=(drafts[d]||[]).find(z=>z&&!z.sent&&(z.ids||[]).includes(e.id));if(p)break}if(!p)return null;
  const k0=ldKey;ldKey=PD(e);try{if(p.ids.length>1)p=moveTo([e.id],p,p.src,'new');commitParts([p.id],true)}finally{ldKey=k0}
  const q=bkItem(e);if(q){const pid=p.id;toast('واریز بانکی ثبت شد · رسید و پیگیری را وارد کنید','','برگرداندن',()=>{const k1=ldKey;ldKey=PD(e);try{uncommitParts([pid])}finally{ldKey=k1}closeSheet();pyRe()})}return q}
ACT.bkGo=d=>{const e=entries.find(z=>String(z.id)===String(d.id));if(!e||!can('track'))return;let q=bkItem(e);if(!q){q=bkSend(e);if(q)pyRe()/* v69.6: ردیف همان لحظه «در انتظار تأیید» می‌شود (قبلاً تا بستن صفحه کهنه می‌ماند) */}if(!q){toast('اول بانک این واریزی را انتخاب کنید',true);return}openItem(q.b.id,q.i)};
ACT.bkOk=d=>{const e=entries.find(z=>String(z.id)===String(d.id)),q=e&&bkItem(e);if(!q||!can('track'))return;q.it.st='ok';q.it.at=new Date().toISOString();saveB();logA('edit','تأیید واریز بانکی',fullName(e)+' | '+fmt(e.amount)+' تومان | '+(q.it.src||''));pyRe();toast('واریز بانکی تأیید شد ✓')};
ACT.pyOpen=d=>{const e=stlE(),z=e&&(e.settles||[])[+d.i];if(!z)return;if(z.byInv&&custs.some(c=>String(c.id)===String(z.byInv.cu)&&(c.txs||[]).some(t=>String(t.id)===String(z.byInv.tx)&&!t.del))){invOpen(z.byInv.cu,z.byInv.tx);return}ACT.stlOpen(d)};
function pyRe(){const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y}

/* ---------- پنل «پرداخت از کجا؟»: مرحله ۱ جستجو (فهرست = اسکرول خود پنل، جستجو چسبیده بالا)، مرحله ۲ مبلغ و رسید ---------- */
let PX=null;
const pxRest=()=>{if(PX.bz)return Math.max(0,num(bz.d.amount||0)-bzStlSum());const x=entRow();if(!x)return 0;if(PX.sel&&PX.sel.k==='bk'){const L=pkL(x);return Math.max(0,(L[0]?+L[0].amount:0)+(PX.edit!=null?pkCur():0))}return Math.max(0,+x.amount||0)};
/* ---------- v66.0 (خواسته صاحب اپ): «بخشی از مبلغ از بانک دیگر» بدون پنجره چند منبع ----------
   بخش‌ها همان واریزی‌های همراه (splitOf) هستند و با psApply ساخته می‌شوند؛ این فقط راه ساده‌تر ثبت است:
   بانک را بزنید، مبلغ را بزنید؛ از مانده بانک اصلی کم می‌شود و در «پرداخت این واریزی» یک ردیف با مانده می‌آید. */
const pkSid=n=>{const s=sources.find(z=>z.name===n);return s?String(s.id):''};
/* منبع هر بخش از خود تخصیص (شناسه حساب، نه فقط نام) */
const pkSrcOf=id=>{for(const L of Object.values(drafts||{}))for(const p of L||[])if((p.ids||[]).includes(id)&&p.src)return p.src.id!=null?String(p.src.id):pkSid(p.src.name);return ''};
function pkL(x){return famOf(x).map(r=>({id:r.id,src:pkSrcOf(r.id),amount:+r.amount||0}))}
const pkCur=()=>{const x=entRow(),L=x?pkL(x):[],l=L.find(z=>String(z.id)===String(PX.edit));return l?l.amount:0};
function pkGo(x,L,msg){PS={root:famRoot(x),name:fullName(x),pay:PD(x),R:L.reduce((a,l)=>a+(+l.amount||0),0),L:L.map(l=>({src:l.src,amount:l.amount}))};psApply();if(msg)toast(msg)}
/* a تومان از بانک srcId؛ edit = شناسه بخشی که ویرایش می‌شود */
function pkSave(x,srcId,a,edit){const L=pkL(x);if(!L.length)return false;if(L.some((l,i)=>i&&!l.amount))return false;srcId=String(srcId);
  if(edit!=null){const j=L.findIndex(l=>String(l.id)===String(edit));if(j<1)return false;const tot=L[0].amount+L[j].amount;if(a>tot)return false;
    if(a===tot){L[0].amount=tot;L[0].src=srcId;L.splice(j,1)}else{L[0].amount=tot-a;L[j].amount=a;L[j].src=srcId}
    pkGo(x,L,'بخش «'+srcName(srcId)+'» '+fmt(a)+' تومان شد');return true}
  if(a>L[0].amount)return false;const j=L.findIndex((l,i)=>i>0&&l.src===srcId);
  if(a===L[0].amount){if(j>0){L[0].amount+=L[j].amount;L.splice(j,1)}L[0].src=srcId;pkGo(x,L,'همه مبلغ بانکی از «'+srcName(srcId)+'»');return true}
  L[0].amount-=a;if(j>0)L[j].amount+=a;else L.push({src:srcId,amount:a});pkGo(x,L,fmt(a)+' تومان از «'+srcName(srcId)+'» · مانده '+fmt(L[0].amount));return true}
ACT.pkDel=d=>{const x=entRow();if(!x)return;const L=pkL(x),j=L.findIndex(l=>String(l.id)===String(d.id));if(j<1)return;const l=L[j];
  askConfirm('بخش «'+(srcName(l.src)||'بانک')+'» ('+fmt(l.amount)+' تومان) برداشته شود؟ مبلغش به بانک اصلی برمی‌گردد.','برداشتن',()=>{L[0].amount+=l.amount;L.splice(j,1);pkGo(x,L,'مبلغ به بانک اصلی برگشت')})};
ACT.pkEdit=d=>{const x=entRow();if(!x)return;const L=pkL(x),l=L.find(z=>String(z.id)===String(d.id));if(!l)return;PX={step:2,q:'',sel:{k:'bk',id:l.src},amount:l.amount,tn:'',note:'',imgD:'',bz:false,dir:1,edit:l.id,more:{}};sheet(pxHTML());pxBind()};
/* از صفحه لیست/تخصیص: همان پنل، فقط بانک‌ها */
ACT.pkFrom=d=>{closeSheet();entId=d.id;setTimeout(()=>{PX={step:1,q:'',sel:null,amount:0,tn:'',note:'',imgD:'',bz:false,dir:1,only:'bk',more:{}};sheet(pxHTML());pxBind()},60)};
const pxWho=()=>PX.bz?clean(bz.d.name||''):fullName(entRow()||{});
function pxOpen(bzMode){PX={step:1,q:'',sel:null,amount:0,tn:'',note:'',imgD:'',bz:!!bzMode,dir:1,more:{}};sheet(pxHTML());pxBind()}
ACT.pyAdd=()=>pxOpen(false);
const cuSub=c=>[c.grp?esc(c.grp):'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری';
let PXM=[];
/* v69.7 (خواسته صاحب اپ): پنل «پرداخت از کجا؟» دو بخش جدا با دکمه بالا سمت چپ — «مشتری»: فقط حساب‌هایی که از آن‌ها طلبکاریم
   (با جستجو، حساب‌های دیگر و نام تازه هم جدا زیرش)، «بانک»: حساب‌های بانک مغازه. هر حساب یک کارت جدا مثل صفحه حساب مشتریان.
   جستجو: همه کلمه‌ها (به هر ترتیب) در نام، تلفن، گروه یا عنوان؛ یا ۳ رقم به بالا از تلفن/کد ملی؛ ی/ک عربی و فاصله‌ها یکسان. */
const pxMe=()=>PX.bz?String(bz.d.cuId||''):(e=>e&&e.wd?String(e.wd.cu):'')(entries.find(z=>String(z.id)===String(entId)));
const pxOwe=()=>{const me=pxMe();return CU().filter(c=>String(c.id)!==me).map(c=>({c,b:cuBal(c)})).filter(o=>o.b.R<0||o.b.G<0).sort((a,b)=>a.b.R-b.b.R||a.b.G-b.b.G)}/* v69.9: طلب طلا هم طلب است */;
function pxTab(){if(PX.only==='bk')return 'bk';if(PX.tab)return PX.tab;return 'cu'}
/* v69.9 (خواسته صاحب اپ): دکمه دوبخشی تازه — یک «قرص» آبی زیر دو دکمه که با فنر به سمت انتخاب‌شده می‌لغزد (بدون ساختن دوباره پنل، پس پرش ندارد) */
const pxSegHTML=tb=>`<div class="px9seg" role="tablist" style="--i:${tb==='bk'?1:0}"><i class="px9th" aria-hidden="true"></i><button type="button" role="tab" class="${tb==='cu'?'on':''}" aria-selected="${tb==='cu'}" data-act="pxTab" data-t="cu">${ic('users')}<span>حساب مشتری</span>${(n=>n?`<em>${toFa(n)}</em>`:'')(pxOwe().length)}</button><button type="button" role="tab" class="${tb==='bk'?'on':''}" aria-selected="${tb==='bk'}" data-act="pxTab" data-t="bk">${ic('bank')}<span>بانک‌های مغازه</span></button></div>`;
ACT.pxTab=d=>{pxRead();if(pxTab()===d.t)return;PX.tab=d.t;PX.q='';PX.dt='';PX.fo=0;PX.fg='';PX.fk='';PX.fb=0;const W=$('sheet').querySelector('.px9');if(!W){pxRe(0);return}
  const S=W.querySelector('.px9seg');if(S){S.style.setProperty('--i',d.t==='bk'?1:0);S.querySelectorAll('button').forEach(b=>{const on=b.dataset.t===d.t;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)})}
  pxTopRe();const L=$('pxL');if(L){L.innerHTML=pxList();L.scrollTop=0;if(!RM()&&L.animate)L.animate([{opacity:0,transform:`translateX(${d.t==='bk'?-22:22}px)`},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.25,1)'})}};
/* v69.9 (خواسته صاحب اپ): جستجو دقیقاً مثل جستجوی واریزی‌ها — ذره‌بین، فیلد، ×، تقویم، «فیلتر»؛ با حاله آبی.
   تقویم: مشتری = حساب‌هایی که آن روز گردش دارند، بانک = حساب‌هایی که آن روز حواله/برداشت دارند. فیلتر زیر جستجو باز می‌شود. */
const pxFN=()=>pxTab()==='bk'?(PX.fb?1:0):(PX.fg?1:0)+(PX.fk?1:0);
function pxTopHTML(){const tb=pxTab(),n=pxFN(),G=tb==='cu'?groupsList().filter(g=>clean(g)):[];
  const bar=`<div class="fwrap pxfw"><div class="fsearch">${ic('search')}<input id="pxQ" type="search" placeholder="${tb==='bk'?'نام بانک یا حساب…':'نام، تلفن یا گروه مشتری…'}" value="${esc(PX.q||'')}" autocomplete="off" enterkeyhint="search" aria-label="جستجو" aria-controls="pxL"><button class="x${PX.q?'':' hide'}" data-act="pxQClr" aria-label="پاک کردن">×</button><button class="fcal${PX.dt?' on':''}" data-act="pxCal" aria-label="جستجوی تاریخ">${ic('cal')}</button><button class="cufbtn${n||PX.fo?' on':''}" data-act="pxFlt" aria-label="فیلتر" aria-expanded="${!!PX.fo}">${ic('filter')}<span>فیلتر</span>${n?`<em>${toFa(n)}</em>`:''}</button></div></div>`;
  const chip=(act,v,on,t)=>`<button type="button" class="${on?'on':''}" data-act="${act}" data-v="${esc(v)}">${t}</button>`;
  const fp=PX.fo?`<div class="pxfp">${tb==='bk'?`<div class="pxfr"><small>نمایش</small><div>${chip('pxFb','0',!PX.fb,'همه حساب‌ها')}${chip('pxFb','1',!!PX.fb,'فقط با مانده ثبت‌شده')}</div></div>`:
    `<div class="pxfr"><small>نوع طلب</small><div>${chip('pxFk','',!PX.fk,'همه')}${chip('pxFk','r',PX.fk==='r','طلب مبلغ')}${chip('pxFk','g',PX.fk==='g','طلب طلا')}</div></div>${G.length?`<div class="pxfr"><small>گروه</small><div>${chip('pxFg','',!PX.fg,'همه')}${G.map(g=>chip('pxFg',g,PX.fg===g,esc(g))).join('')}</div></div>`:''}`}</div>`:'';
  const act=[PX.dt?`<div class="fdate">${ic('cal')} ${tb==='bk'?'گردش':'گردش حساب'}: ${esc(relDay(PX.dt))}، ${esc(dates(PX.dt).fa)}<button data-act="pxDtClr" aria-label="حذف">×</button></div>`:'',
    !PX.fo&&PX.fk?`<div class="fdate">${ic('filter')} ${PX.fk==='g'?'طلب طلا':'طلب مبلغ'}<button data-act="pxFk" data-v="" aria-label="حذف">×</button></div>`:'',
    !PX.fo&&PX.fg?`<div class="fdate">${ic('filter')} گروه «${esc(PX.fg)}»<button data-act="pxFg" data-v="" aria-label="حذف">×</button></div>`:'',
    !PX.fo&&PX.fb?`<div class="fdate">${ic('filter')} فقط با مانده ثبت‌شده<button data-act="pxFb" data-v="0" aria-label="حذف">×</button></div>`:''].join('');
  return bar+fp+act}
function pxTopRe(focus){const T=$('pxTop');if(!T)return;T.innerHTML=pxTopHTML();pxBindQ();if(focus){const Q=$('pxQ');if(Q)Q.focus()}}
function pxListRe(){const L=$('pxL');if(L){L.innerHTML=pxList();L.scrollTop=0}}
const pxFRe=()=>{pxTopRe();pxListRe()};
ACT.pxFlt=()=>{pxRead();PX.fo=PX.fo?0:1;pxTopRe();const F=document.querySelector('#pxTop .pxfp');if(F&&!RM()&&F.animate)F.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.2,.9,.25,1)'})};
ACT.pxFk=d=>{pxRead();PX.fk=d.v||'';pxFRe()};ACT.pxFg=d=>{pxRead();PX.fg=d.v||'';pxFRe()};ACT.pxFb=d=>{pxRead();PX.fb=+d.v?1:0;pxFRe()};
ACT.pxQClr=()=>{PX.q='';pxTopRe(true);pxListRe()};ACT.pxDtClr=()=>{pxRead();PX.dt='';pxFRe()};
/* تقویم همان پنجره سراسری است؛ بعد از انتخاب یا بستن، همین پنل با همان بخش برمی‌گردد */
ACT.pxCal=()=>{pxRead();const P=PX,tb=pxTab(),M=new Set();if(tb==='bk')ownL().forEach(s=>{srcMoves(s).forEach(m=>m.date&&M.add(m.date));(s.led||[]).forEach(x=>!x.del&&x.date&&M.add(x.date))});else CU().forEach(c=>(c.txs||[]).forEach(t=>!t.del&&t.date&&M.add(t.date)));
  openCal(P.dt||todayISO(),iso=>{PX=P;PX.dt=iso;PX.step=1;sheet(pxHTML());pxBind(true)},{title:tb==='bk'?'گردش بانک در روز':'حساب‌هایی که این روز گردش دارند',marks:M})};
const pxCuDay=c=>!PX.dt||(c.txs||[]).some(t=>!t.del&&t.date===PX.dt);
const pxCuF=(c,b)=>(!PX.fg||(c.grp||'')===PX.fg)&&(!PX.fk||(PX.fk==='g'?b.G<0:b.R<0))&&pxCuDay(c);
const pxBkDay=s=>!PX.dt||srcMoves(s).some(m=>m.date===PX.dt)||(s.led||[]).some(x=>!x.del&&x.date===PX.dt);
const pxTok=q=>nzName(toEn(clean(q||''))).split(/\s+/).filter(Boolean);
const pxHitC=(c,T,dOk)=>{if(!T.length)return true;const h=nzName(toEn(cuHay(c)));return T.every(t=>h.includes(t))||dOk(cuHay(c))};
/* v69.8 (خواسته صاحب اپ): فهرست مشتری‌ها دقیقاً همان فهرست صفحه «حساب مشتریان» (همان ردیف cuRowH و همان سبک، .cuLs) */
function pxCuL(B){const PW=pendMap();return `<div class="cuLs"><div class="c6l c6lb cuL">${B.map(([c,b],ri)=>cuRowH(c,b,ri,PW,{act:'pxPick',k:'cu',sw:false,cls:'px7o'})).join('')}</div></div>`}
const pxGh=(t,n)=>`<div class="c6gh px9g">${t}${n?` <i>${toFa(n)}</i>`:''}</div>`;
function pxCuList(){const q0=clean(PX.q||''),T=pxTok(q0),dOk=pDig(q0),me=pxMe(),O=pxOwe().filter(o=>pxHitC(o.c,T,dOk)&&pxCuF(o.c,o.b)),out=[],fl=!!(PX.dt||PX.fg||PX.fk);
  if(O.length)out.push(pxGh(T.length?'طلب ما · نتیجه جستجو':'طلب ما از این مشتری‌ها',O.length),pxCuL(O.map(o=>[o.c,o.b])));
  else if(!T.length)out.push(fl?`<div class="px7e px9e">${ic('filter')}<b>با این فیلتر حسابی نیست</b><small>تاریخ یا فیلتر را بردارید</small></div>`:`<div class="px7e px9e">${ic('check')}<b>از هیچ مشتری‌ای طلب نداریم</b><small>برای مشتری دیگر یا نام تازه، نامش را جستجو کنید</small></div>`);
  if(T.length||dOk('')){const seen=new Set(O.map(o=>String(o.c.id))),C=CU().filter(c=>String(c.id)!==me&&!seen.has(String(c.id))&&pxHitC(c,T,dOk)&&(!PX.dt&&!PX.fg||pxCuF(c,{R:-1,G:-1}))).sort((a,b)=>(nzName(b.name).startsWith(T[0]||'#')-nzName(a.name).startsWith(T[0]||'#'))||String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,30);
    if(C.length)out.push(pxGh('حساب‌های دیگر · طلبی از آن‌ها نداریم',C.length),pxCuL(C.map(c=>[c,cuBal(c)])));
    PXM=memPeople(T.join(' '),dOk,6);if(PXM.length)out.push(pxGh('از واریزی‌ها و خریدها · بدون حساب'),`<div class="c6l px9l">${PXM.map((p,i)=>`<button type="button" class="c6r px7o px9c one" data-act="pxPick" data-k="mem" data-id="${i}"><span class="c6a m">${esc(userInit(p.name))}</span><span class="tx"><b>${esc(p.name)}</b><small>${[p.phone?'<bdi dir="ltr">'+esc(toFa(p.phone))+'</bdi>':'',p.n?toFa(p.n)+' واریزی':''].filter(Boolean).join(' · ')||'بدون حساب'}</small></span></button>`).join('')}</div>`);
    if(T.length&&!/^\d+$/.test(toEn(q0))&&![...O.map(o=>o.c),...C].some(c=>nzName(c.name)===T.join(' ')))out.push(`<div class="c6l px9l"><button type="button" class="c6r px7o px9c one px9n" data-act="pxPick" data-k="new" data-id=""><span class="c6a">${ic('plus')}</span><span class="tx"><b>پرداخت‌کننده تازه: «${esc(q0)}»</b><small>بدون باز کردن حساب؛ فقط سند تسویه ثبت می‌شود</small></span></button></div>`)}
  return out.join('')}
function pxBkList(){const x=entRow(),q0=clean(PX.q||''),q=nzName(toEn(q0)),out=[];if(!x)return '';const F=famOf(x),sent=F.some(r=>r.sentBid);
  if(PX.bz||!can('split'))return `<div class="px7e px9e">${ic('bank')}<b>اینجا بانکی برای انتخاب نیست</b></div>`;
  const xr=validated().find(z=>z.id===famRoot(x))||x;if(xr.id!==famRoot(x)||!(xr.amount>0))return `<div class="px7e px9e">${ic('bank')}<b>بانک را از واریزی اصلی عوض کنید</b></div>`;
  if(sent&&!ssCan(xr))return F.some(r=>!r.sentBid)?`<div class="px7e px9e">${ic('bank')}<b>بخشی هنوز ثبت واریز نشده</b><small>اول ردیف‌های بانکی «آماده ارسال» را با کشیدن به چپ ثبت واریز کنید، بعد بانک یا مبلغ را عوض کنید</small></div>`:`<div class="px7e px9e">${ic('check')}<b>بخش‌های بانکی تأیید شده یا رسید دارند</b><small>بانک یا مبلغ قفل است</small></div>`;
  const L=pkL(xr),main=sent?'':(L[0]?L[0].src:''),B=ownL().filter(s=>String(s.id)!==main&&(!q||bkHit(s,q0))&&pxBkDay(s)&&(!PX.fb||s.bal!=null));
  if(!B.length)return `<div class="px7e px9e">${ic('bank')}<b>${q?'بانکی با «'+esc(q0)+'» نیست':'بانک دیگری در مغازه تعریف نشده'}</b></div>`;
  out.push(pxGh(sent?'بخشی از مبلغ به این بانک · بقیه در بانک فعلی':'بانک‌های مغازه · بخشی یا همه مبلغ',B.length));
  out.push(`<div class="c6l bxlist px9l">${B.map((s,ri)=>{const bk=acBank(s),m=acSum(s),has=!sent&&L.find((l,i)=>i&&l.src===String(s.id)),sub=has?'الان '+fmt(has.amount)+' تومان از این حساب':(bk&&!canon(s.name).includes(canon(bk))?'بانک '+bk:'حساب مغازه');
    return `<button type="button" class="c6r bxrow px7o px9c" data-act="${sent?'pxSentBk':'pxPick'}" data-k="bk" data-id="${s.id}" style="--r:${Math.min(ri,8)}"><span class="c6a bxlogo">${bk?bankBadge(bk,'lg'):esc(userInit(s.name))}</span><span class="tx"><b>${esc(s.name)}</b><small>${esc(sub)}</small></span><span class="bxv"><small>مانده نهایی</small>${bxV(m)}</span></button>`}).join('')}</div>`);
  return out.join('')}
function pxList(){return pxTab()==='bk'?pxBkList():pxCuList()}
/* واریزی ارسال‌شده: بانک انتخاب‌شده در پنجره منابع با مبلغ خالی می‌آید (بقیه در بانک فعلی) */
ACT.pxSentBk=d=>{const x=entRow();if(!x)return;const id=famRoot(x);PX=null;closeSheet();setTimeout(()=>ACT.sentSplit({id,to:d.id}),80)};
function pxSel(){const s=PX.sel;if(!s)return null;if(s.k==='bk'){const z=sources.find(o=>String(o.id)===String(s.id));if(!z)return null;const bk=acBank(z);return {bk:z,name:z.name,av:bk?bankBadge(bk,'lg'):ic('bank'),sub:bkSub(z),bal:'',R:0}}if(s.k==='cu'){const c=CU().find(z=>String(z.id)===String(s.id));if(!c)return null;const R=cuBal(c).R;return {c,name:cuName(c),sub:cuSub(c),bal:R?`<b class="${R<0?'r':'b'}">${R<0?'طلب ما':'بدهی ما'} ${fmt(Math.abs(R))} تومان</b>`:'<b>حساب تسویه است</b>',R}}return {c:null,name:s.name,sub:'پرداخت‌کننده تسویه · حساب مشتری باز نمی‌شود',bal:'',R:0}}
function pxHTML(){const rest=pxRest(),who0=pxWho();
  if(PX.step===1){const tb=pxTab(),seg=PX.only==='bk'||PX.bz||!can('split')?'':pxSegHTML(tb);
    return `<div class="px7w s1 px9"><div class="sh-h px9h"><div><b>پرداخت از کجا؟</b><small class="shsub">مانده بانکی «${esc(who0)}»: ${fmt(rest)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${seg}<div class="px7q" id="pxTop">${pxTopHTML()}</div>
  <div class="px7l" id="pxL" role="listbox">${pxList()}</div></div>`}
  /* v66.0 (خواسته صاحب اپ: «فیلدها دونه‌دونه، خودکار پر بشه و بعد مبلغ»): مسیر «از → به» خودکار پر است، بعد یک عدد بزرگ با دکمه‌های
     آماده، و فیلدهای اختیاری فقط وقتی لازم است با یک لمس باز می‌شوند */
  const S=pxSel()||{name:'',sub:'',bal:'',R:0},bkm=PX.sel&&PX.sel.k==='bk',owe=S.R<0?Math.min(rest,-S.R):0,a=+PX.amount||0,M=PX.more||{},x=entRow(),L0=bkm&&x?pkL(x)[0]:null;
  const half=rest>1?Math.round(rest/2):0,chip=(v,t)=>v>0?`<button type="button" class="${a===v?'on':''}" data-act="pxAmt" data-v="${v}">${t} · ${fmt(v)}</button>`:'';
  const opt=[['tn','شماره پیگیری','list'],['img','رسید','cam'],['note','یادداشت','edit']].filter(o=>!bkm);
  const fld={tn:`<div class="ef px8f"><label for="pxT">شماره پیگیری</label><input id="pxT" class="ltr" inputmode="numeric" autocomplete="off" value="${esc(PX.tn)}"></div>`,
    img:`<div class="ef px8f"><label>رسید</label><label class="stimg${PX.imgD?' on':''}">${PX.imgD?`<img src="${PX.imgD}" alt="">`:`<i>${ic('cam')}</i>`}<span>${PX.imgD?'تغییر رسید':'افزودن عکس'}</span><input type="file" accept="image/*" id="pxF" hidden></label></div>`,
    note:`<div class="ef px8f"><label for="pxN">یادداشت</label><input id="pxN" autocomplete="off" value="${esc(PX.note)}"></div>`};
  /* v69.8 (خواسته صاحب اپ: «طراحی تخصیص درست‌تر و راحت‌تر»): یک کارت مسیر فشرده (از → به، زدن = تغییر)، مبلغ بزرگ وسط با
     دکمه‌های آماده زیرش، فیلدهای اختیاری کوچک، و دکمه ثبت که همیشه پایین پنجره دیده می‌شود. بدون متن راهنمای اضافه. */
  const ttl=bkm?(PX.edit!=null?'ویرایش بخش بانکی':'تخصیص به بانک'):PX.bz?'تسویه از مشتری':'تسویه از مشتری',
    main=bkm&&L0&&L0.src?srcName(L0.src):'',toSub=bkm?(main?'بقیه در «'+esc(main)+'»':'بقیه بدون بانک می‌ماند'):'مانده بانکی '+fmt(rest);
  return `<div class="px7w s2 px10"><div class="sh-h"><div><b>${ttl}</b><small class="shsub">${esc(who0)} · مانده بانکی ${fmt(rest)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <button type="button" class="pxr" data-act="pxBack" aria-label="تغییر ${bkm?'بانک':'پرداخت‌کننده'}">
    <span class="pxr1"><span class="py7a${bkm?' bk':''}">${bkm?S.av:esc(userInit(S.name||'؟'))}</span><span class="tx"><small>${bkm?'از بانک':'پرداخت‌کننده'}</small><b>${esc(S.name)}</b>${!bkm&&S.bal?`<em>${S.bal}</em>`:''}</span></span>
    <span class="pxra" aria-hidden="true">${ic('back').replace('class="i"','class="i flip"')}</span>
    <span class="pxr1 to"><span class="tx"><small>به</small><b>${esc(who0)}</b><em>${toSub}</em></span></span>
    <span class="pxrc">تغییر</span></button>
  <div class="pxam"><label class="pxin"><input id="pxA" class="ltr" inputmode="numeric" autocomplete="off" enterkeyhint="done" placeholder="۰" aria-label="مبلغ" value="${a?a.toLocaleString('en-US'):''}"><i>تومان</i></label>
    <div class="px8l" id="pxAv"></div>
    <div class="px7qa px8q pxch">${chip(rest,'همه')}${half&&half!==rest?chip(half,'نصف'):''}${owe&&owe!==rest&&owe!==half?chip(owe,'به اندازه طلب ما'):''}</div></div>
  ${opt.length?`<div class="px8m pxop">${opt.map(([k,t,i])=>M[k]?'':`<button type="button" data-act="pxMore" data-f="${k}">${ic(i)}<span>${t}</span></button>`).join('')}</div><div class="px8fs">${opt.filter(([k])=>M[k]).map(([k])=>fld[k]).join('')}</div>`:''}
  <div class="pxgo"><button class="xgo" data-act="pxSave">${ic('check')} ${bkm?(PX.edit!=null?'ذخیره':'ثبت تخصیص'):PX.bz?'افزودن تسویه':'ثبت تسویه'}</button></div></div>`}
function pxRead(){const g=id=>{const el=$(id);return el?el.value:undefined};if(g('pxQ')!==undefined)PX.q=g('pxQ');if(g('pxA')!==undefined)PX.amount=num(g('pxA'));if(g('pxT')!==undefined)PX.tn=toEn(g('pxT')).trim();if(g('pxN')!==undefined)PX.note=clean(g('pxN'))}
function pxAv(){const A=$('pxA'),h=$('pxAv');if(!A||!h)return;const a=num(A.value),r=pxRest(),bk=PX.sel&&PX.sel.k==='bk'&&sources.find(z=>String(z.id)===String(PX.sel.id)),f=bk?acFin(bk):null;
  h.innerHTML=!a?'':a>r?'بیشتر از مانده بانکی ('+fmt(r)+')':`<span>مانده بانکی بعد از این <b>${fmt(r-a)}</b></span>${bk&&f!=null?`<span>مانده «${esc(bk.name)}» <b class="${f-a<0?'n':''}">${f-a<0?'−':''}${fmt(Math.abs(f-a))}</b></span>`:''}`;h.className='px8l'+(a>r?' bad':a?' ok':'');
  document.querySelectorAll('#sheet .px8q button').forEach(b=>b.classList.toggle('on',+b.dataset.v===a))}
ACT.pxMore=d=>{pxRead();(PX.more=PX.more||{})[d.f]=1;$('sheet').innerHTML=pxHTML();pxBind(true);const f=document.querySelector('#sheet .px8fs .px8f:last-child');if(f){if(!RM()&&f.animate)f.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'});const i=f.querySelector('input:not([type=file])');if(i)i.focus();else{const fi=f.querySelector('input[type=file]');if(fi)fi.click()}}};
function pxBind(still){const W=$('sheet').querySelector('.px7w');if(W&&!still&&!RM()&&W.animate)W.animate([{opacity:0,transform:`translateX(${PX.dir*-18}px)`},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'});
  if(PX.step===1){pxBindQ();const L=$('pxL');if(L)L.onpointerdown=e=>{if(e.target.closest('.px7o'))e.preventDefault()};return}
  const A=$('pxA'),F=$('pxF');if(A){A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';PX.amount=v;pxAv()};A.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();A.blur()}};pxAv();if(!PX.amount&&!still)setTimeout(()=>{if(A.isConnected)A.focus()},280)}
  if(F)F.onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{PX.imgD=await shrink(f);pxRead();PX.more.img=1;$('sheet').innerHTML=pxHTML();pxBind(true)}catch(z){toast('این عکس خوانده نشد',true)}}}
function pxBindQ(){const Q=$('pxQ');if(!Q)return;Q.oninput=()=>{PX.q=Q.value;const x=Q.parentNode.querySelector('.x');if(x)x.classList.toggle('hide',!PX.q);clearTimeout(Q._t);Q._t=setTimeout(()=>{const L=$('pxL');if(L&&L.isConnected){L.innerHTML=pxList();L.scrollTop=0}},90)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const b=document.querySelector('#pxL .px7o');if(b)b.click()}}}
function pxRe(dir){PX.dir=dir==null?1:dir;$('sheet').innerHTML=pxHTML();pxBind()}
ACT.pxPick=d=>{pxRead();if(d.k==='bk'){PX.sel={k:'bk',id:d.id};const x=entRow(),L=x?pkL(x):[],has=L.find((l,i)=>i&&l.src===String(d.id));if(has&&PX.edit==null)PX.edit=has.id;PX.amount=PX.edit!=null?pkCur():Math.min(pxRest(),+PX.amount||0)||0;PX.step=2;pxRe(1);return}
  if(d.k==='cu')PX.sel={k:'cu',id:d.id};else if(d.k==='mem'){const p=PXM[+d.id];if(!p)return;const c=cuFindBy({name:p.name,phone:p.phone});PX.sel=c?{k:'cu',id:c.id}:{k:'mem',name:p.name,phone:p.phone||'',nid:p.nid||''}}
  else PX.sel={k:'new',name:clean(PX.q)};
  const S=pxSel(),r=pxRest();if(!PX.amount)PX.amount=S&&S.R<0?Math.min(r,-S.R):r;PX.step=2;pxRe(1)};
ACT.pxBack=()=>{pxRead();PX.step=1;if(PX.sel&&PX.sel.k==='bk'){PX.only='bk';PX.edit=null}pxRe(-1);setTimeout(()=>{const q=$('pxQ');if(q)q.focus()},260)};
ACT.pxAmt=d=>{const A=$('pxA');if(!A)return;PX.amount=+d.v;A.value=(+d.v).toLocaleString('en-US');pxAv();const h=A.closest('.px8i');if(h&&!RM()&&h.animate)h.animate([{transform:'scale(1.03)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.25,1)'})};
ACT.pxSave=async()=>{pxRead();const a=Math.round(PX.amount||0),r=pxRest(),s=PX.sel;if(!s){PX.step=1;pxRe(-1);return}if(!a){toast('مبلغ را وارد کنید',true);$('pxA').focus();return}if(a>r){toast('بیشتر از مانده بانکی ('+fmt(r)+') است',true);$('pxA').focus();return}
  if(s.k==='bk'){const x=entRow();if(!x)return;const ed=PX.edit;PX=null;closeSheet();if(!pkSave(x,s.id,a,ed))toast('این تغییر ممکن نیست؛ یکی از بخش‌ها ارسال شده یا مبلغ بیشتر است',true);return}
  if(PX.bz){const S=pxSel();bz.d.settles=(bz.d.settles||[]).concat([{name:S.name,phone:s.phone||(S.c&&S.c.phone)||'',cuId:S.c?S.c.id:'',amount:a,tn:PX.tn,note:PX.note,imgD:PX.imgD||'',inv:''}]);PX=null;closeSheet();bzStlRe();toast('تسویه اضافه شد · با ثبت واریزی سندش صادر می‌شود');return}
  const x=entRow(),e=x&&entries.find(z=>z.id===x.id);if(!e)return;if(PX.busy)return;PX.busy=1;
  try{let K=[];if(PX.imgD){const k=newImgKey('stl:'+e.id+'.'+Date.now());if(await imgPut(k,PX.imgD))K=[k];else toast('حافظه پر است؛ عکس ذخیره نشد',true)}
    const c=s.k==='cu'?CU().find(z=>String(z.id)===String(s.id)):pyOf({name:s.name,phone:s.phone});if(!c){toast('حساب پیدا نشد',true);return}
    const R=payDocMake(e,c,a,{tn:PX.tn,note:PX.note,imgs:K});e.updatedAt=ns();e.updatedBy=who();saveE();
    logA('edit','تسویه از مشتری (سند)',fullName(e)+' ← '+cuName(c)+' | '+fmt(a)+' تومان | '+invTitle(R.t));pyFlash=R.z?R.z.id:null;PX=null;closeSheet();pyRe();
    setTimeout(()=>{pyFlash=null},1400);const el=$('py7');if(el&&!RM())try{el.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
    toast(invTitle(R.t)+' در حساب «'+cuName(c)+'» ثبت شد','','دیدن سند',()=>invOpen(c.id,R.t.id))}finally{if(PX)PX.busy=0}};
