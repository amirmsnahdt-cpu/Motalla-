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
    for(const s of S){const pc=cuOf({cuId:s.cuId,name:s.name,title:s.title,phone:s.phone},'پرداخت‌کننده واریزی');payDocMake(e,pc,+s.amount,{tn:s.tn||'',note:s.note||'',imgs:stImgs(s),st:s.st||'ok'})}
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
function entPay(x){const e=entries.find(z=>z.id===x.id)||x,S=e.settles||[],ed=can('edit'),F=famOf(x),A=allocMap(),sent=F.some(r=>r.sentBid),tot=+e.amount||0;
  const open=!x.full&&x.amount>0&&!(x.sentBid&&stOf(x.id)==='ok'),canAdd=ed&&open;if(!S.length&&!tot)return '';
  const cOk=S.filter(z=>z.st!=='wait').reduce((a,z)=>a+(+z.amount||0),0),cW=S.filter(z=>z.st==='wait').reduce((a,z)=>a+(+z.amount||0),0);
  const bk=F.length>1?F.map(r=>({r,s:famSrc(r,A)})):[{r:x,s:famSrc(x,A)}],bOk=bk.filter(o=>o.s&&o.s.sent&&o.s.st==='ok').reduce((a,o)=>a+(+o.r.amount||0),0),bAll=Math.max(0,tot-cOk-cW);
  const pc=v=>tot?Math.max(0,Math.min(100,v/tot*100)).toFixed(2)+'%':'0%';
  const cuRow=(z,i)=>{const w=z.st==='wait',n=stImgs(z).length,dt=z.byInv&&(()=>{const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(q=>String(q.id)===String(z.byInv.tx)&&!q.del);return t?invTitle(t):''})(),sub=[dt||'',!dt&&z.cuId?'حساب مشتری':!dt?'بدون حساب':'',z.tn?'پیگیری '+esc(toFa(z.tn)):''].filter(Boolean).join(' · ');
    return swW(`<div class="py7r ${w?'w':'k'}${pyFlash!=null&&String(pyFlash)===String(z.id)?' nw':''}"><button class="py7b" data-act="pyOpen" data-i="${i}" aria-label="${z.byInv?'دیدن سند ':''}${esc(z.name||'')}"><span class="py7a">${esc(userInit(z.name||'؟'))}</span><span class="tx"><b>${esc(z.name||'—')}</b><small>${sub}</small></span><span class="py7v"><b>${fmt(z.amount)}<i>تومان</i></b><small>${w?'در انتظار تأیید':'تأیید شد'}</small></span></button>${n||can('track')?`<button class="py7c${n?' on':''}" data-act="galSt" data-i="${i}" aria-label="رسیدهای تسویه">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:''}</div>`,
      {r:ed&&w?[['stlOk','تأیید','check','#178049']]:ed?[['stlUnok','لغو تأیید','undo','#6b7385']]:[],l:ed?[['stlDelI',w?'رد':'حذف',w?'undo':'trash','#d23c48']]:[],data:{i}})};
  const bkRow=({r,s},i)=>{const st=s&&s.sent?(s.st==='ok'?['k','تأیید بانک']:s.st==='fail'?['f','ناموفق']:['w','ارسال‌شده · منتظر تأیید']):s?['d','آماده ارسال']:['n','منبع انتخاب نشده'],me=r.id===x.id;
    const act=F.length>1&&!me?`data-act="openEnt" data-id="${r.id}"`:can('split')&&!sent&&!x.full?`data-act="paySplit" data-id="${x.id}"`:'';
    return `<div class="py7r b ${st[0]}"><${act?'button':'div'} class="py7b" ${act}><span class="py7a bk">${(so=>so&&acBank(so)?bankBadge(acBank(so)):ic('bank'))(s&&sources.find(z=>z.name===s.name))}</span><span class="tx"><b>${F.length>1?'بخش '+toFa(i+1)+' · ':''}${esc(s?s.name:'واریز بانکی')}</b><small>${me&&F.length>1?'همین بخش · ':''}${st[1]}</small></span><span class="py7v"><b>${fmt(r.amount)}<i>تومان</i></b><small>واریز بانکی</small></span></${act?'button':'div'}></div>`};
  const head=x.full?'<em class="py7st ok">تسویه کامل</em>':cW?`<em class="py7st w">${toFa(S.filter(z=>z.st==='wait').length)} در انتظار</em>`:'';
  return `<div class="esec py7" id="py7"><div class="py7h"><div><b>پرداخت این واریزی</b><small>جمع ${fmt(tot)} تومان${S.length?' · '+toFa(S.length)+' پرداخت‌کننده':''}${bAll?' · بانک '+fmt(bAll):''}</small></div>${head}</div>
  <div class="py7bar" role="img" aria-label="${esc('از مشتری '+fmt(cOk+cW)+' تومان، از بانک '+fmt(bAll)+' تومان')}"><i class="k" style="--w:${pc(cOk)}"></i><i class="w" style="--w:${pc(cW)}"></i><i class="b${bOk>=bAll&&bAll?' ok':''}" style="--w:${pc(bAll)}"></i></div>
  <div class="py7k"><span class="k">از مشتری ${fmt(cOk+cW)}</span><span class="b">از بانک ${fmt(bAll)}</span></div>
  <div class="py7l">${S.map(cuRow).join('')}${bAll||!S.length?bk.map(bkRow).join(''):''}</div>
  ${canAdd&&!x.sentBid?`<button class="py7add" data-act="pyAdd"><span class="py7s">${ic('search')}</span><span class="tx"><b>افزودن پرداخت‌کننده</b><small>مشتری‌ای که مستقیم پرداخت کرده، یا بانک دیگر ما</small></span><span class="py7p">${ic('plus')}</span></button>`:''}
  ${F.length>1&&can('split')&&!sent&&!x.full?`<button class="link" data-act="paySplitUndo" data-id="${x.id}">یکی کردن بخش‌های بانکی</button>`:''}${sent&&F.length<2&&!x.sentBid&&can('split')?'<div class="muted py7m">بخشی ارسال شده؛ برای تغییر بانک اول از پیگیری برگردانید.</div>':''}</div>`}
ACT.pyOpen=d=>{const e=stlE(),z=e&&(e.settles||[])[+d.i];if(!z)return;if(z.byInv&&custs.some(c=>String(c.id)===String(z.byInv.cu)&&(c.txs||[]).some(t=>String(t.id)===String(z.byInv.tx)&&!t.del))){invOpen(z.byInv.cu,z.byInv.tx);return}ACT.stlOpen(d)};
function pyRe(){const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y}

/* ---------- پنل «پرداخت از کجا؟»: مرحله ۱ جستجو (فهرست = اسکرول خود پنل، جستجو چسبیده بالا)، مرحله ۲ مبلغ و رسید ---------- */
let PX=null;
const pxRest=()=>{if(PX.bz)return Math.max(0,num(bz.d.amount||0)-bzStlSum());const x=entRow();return x?Math.max(0,+x.amount||0):0};
const pxWho=()=>PX.bz?clean(bz.d.name||''):fullName(entRow()||{});
function pxOpen(bzMode){PX={step:1,q:'',sel:null,amount:0,tn:'',note:'',imgD:'',bz:!!bzMode,dir:1};sheet(pxHTML());pxBind()}
ACT.pyAdd=()=>pxOpen(false);
const pxRow=(k,id,av,name,sub,v,cls)=>`<button type="button" class="px7o${cls?' '+cls:''}" data-act="pxPick" data-k="${k}" data-id="${esc(id)}"><span class="py7a${k==='bk'?' bk':''}${k==='mem'||k==='new'?' m':''}">${av}</span><span class="tx"><b>${name}</b><small>${sub}</small></span>${v?`<span class="px7v">${v}</span>`:''}</button>`;
const cuSub=c=>[c.grp?esc(c.grp):'',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':''].filter(Boolean).join(' · ')||'حساب مشتری';
let PXM=[];
function pxList(){const q0=clean(PX.q||''),q=nzName(toEn(q0)),dOk=pDig(q0),me=PX.bz?String(bz.d.cuId||''):(e=>e&&e.wd?String(e.wd.cu):'')(entries.find(z=>String(z.id)===String(entId))),A=CU().filter(c=>String(c.id)!==me),out=[],g=(t,n)=>out.push(`<div class="px7g">${t}${n?` <i>${toFa(n)}</i>`:''}</div>`);
  if(!q){const owe=A.map(c=>({c,b:cuBal(c)})).filter(o=>o.b.R<0).sort((a,b)=>a.b.R-b.b.R),seen=new Set(owe.map(o=>String(o.c.id)));
    if(owe.length){g('طلب ما از این مشتری‌ها',owe.length);owe.forEach(o=>out.push(pxRow('cu',o.c.id,esc(userInit(cuName(o.c))),esc(cuName(o.c)),cuSub(o.c),cuBalMini(o.c))))}
    const R=A.filter(c=>!seen.has(String(c.id))).sort((a,b)=>String(b.lastAt||b.createdAt||'').localeCompare(String(a.lastAt||a.createdAt||''))).slice(0,15);
    if(R.length){g('آخرین حساب‌ها');R.forEach(c=>out.push(pxRow('cu',c.id,esc(userInit(cuName(c))),esc(cuName(c)),cuSub(c),cuBalMini(c))))}}
  else{const C=A.filter(c=>cuHit(c,q,dOk)).sort((a,b)=>(nzName(b.name).startsWith(q)-nzName(a.name).startsWith(q))||String(b.lastAt||'').localeCompare(String(a.lastAt||'')));
    if(C.length){g('حساب‌های مشتری',C.length);C.slice(0,60).forEach(c=>out.push(pxRow('cu',c.id,esc(userInit(cuName(c))),esc(cuName(c)),cuSub(c),cuBalMini(c))))}
    PXM=memPeople(q,dOk,8);if(PXM.length){g('از واریزی‌ها و خریدها · حساب برایشان باز می‌شود');PXM.forEach((p,i)=>out.push(pxRow('mem',i,esc(userInit(p.name)),esc(p.name),[p.phone?'<bdi dir="ltr">'+esc(toFa(p.phone))+'</bdi>':'',p.n?toFa(p.n)+' واریزی':''].filter(Boolean).join(' · ')||'بدون حساب')))}
    if(!/^\d+$/.test(toEn(q0))&&!C.some(c=>nzName(c.name)===q))out.push(pxRow('new','',ic('plus'),'حساب تازه: «'+esc(q0)+'»','حساب مشتری با همین نام باز می‌شود','','nw'))}
  if(!PX.bz&&can('split')){const x=entRow(),F=x?famOf(x):[];if(x&&!F.some(r=>r.sentBid)&&x.amount>0){const B=sources.filter(s=>!q||nzName(s.name+' '+(s.bank||'')).includes(q));
    if(B.length){g('بانک‌های ما · تقسیم مبلغ بانکی');B.forEach(s=>{const b=acBank(s);out.push(pxRow('bk',s.id,b?bankBadge(b):ic('bank'),esc(s.name),'بخشی از مبلغ از این حساب واریز شود',''))})}}}
  return out.length?out.join(''):`<div class="px7e"><b>«${esc(q0)}» پیدا نشد</b><small>نام را کامل‌تر بنویسید یا با شماره تلفن جستجو کنید</small></div>`}
function pxSel(){const s=PX.sel;if(!s)return null;if(s.k==='cu'){const c=CU().find(z=>String(z.id)===String(s.id));if(!c)return null;const R=cuBal(c).R;return {c,name:cuName(c),sub:cuSub(c),bal:R?`<b class="${R<0?'r':'b'}">${R<0?'طلب ما':'بدهی ما'} ${fmt(Math.abs(R))} تومان</b>`:'<b>حساب تسویه است</b>',R}}return {c:null,name:s.name,sub:s.k==='mem'?'از واریزی‌ها · با ثبت، حساب باز می‌شود':'حساب تازه با ثبت باز می‌شود',bal:'',R:0}}
function pxHTML(){const rest=pxRest(),who0=pxWho();
  if(PX.step===1)return `<div class="px7w s1"><div class="sh-h"><div><b>پرداخت از کجا؟</b><small class="shsub">مانده بانکی «${esc(who0)}»: ${fmt(rest)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="px7q"><div class="fsearch">${ic('search')}<input id="pxQ" type="search" enterkeyhint="search" autocomplete="off" value="${esc(PX.q)}" placeholder="نام، تلفن یا گروه مشتری، یا بانک…" aria-label="جستجوی پرداخت‌کننده" aria-controls="pxL"></div></div>
  <div class="px7l" id="pxL" role="listbox">${pxList()}</div></div>`;
  const S=pxSel(),owe=S&&S.R<0?Math.min(rest,-S.R):0;
  return `<div class="px7w s2"><div class="sh-h"><div><b>پرداخت از «${esc(S?S.name:'')}»</b><small class="shsub">مستقیم به «${esc(who0)}» · از مانده بانکی کم می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <button type="button" class="px7sel" data-act="pxBack" aria-label="تغییر پرداخت‌کننده"><span class="py7a">${esc(userInit(S?S.name:'؟'))}</span><span class="tx"><b>${esc(S?S.name:'')}</b><small>${S?S.sub:''}</small>${S&&S.bal?`<span class="px7sb">${S.bal}</span>`:''}</span><span class="px7ch">تغییر</span></button>
  <div class="ef"><label for="pxA">مبلغ پرداختی <i>(تومان)</i></label><input id="pxA" class="ltr acbig" inputmode="numeric" autocomplete="off" value="${PX.amount?Number(PX.amount).toLocaleString('en-US'):''}">
  <div class="px7qa"><button type="button" data-act="pxAmt" data-v="${rest}">کل مانده · ${fmt(rest)}</button>${owe&&owe!==rest?`<button type="button" data-act="pxAmt" data-v="${owe}">به اندازه طلب ما · ${fmt(owe)}</button>`:''}</div><small class="eh" id="pxAv"></small></div>
  <div class="ef2"><div class="ef"><label for="pxT">شماره پیگیری <i>(اختیاری)</i></label><input id="pxT" class="ltr" inputmode="numeric" autocomplete="off" value="${esc(PX.tn)}"></div><div class="ef"><label>رسید <i>(اختیاری)</i></label><label class="stimg${PX.imgD?' on':''}">${PX.imgD?`<img src="${PX.imgD}" alt="">`:`<i>${ic('cam')}</i>`}<span>${PX.imgD?'تغییر رسید':'افزودن عکس'}</span><input type="file" accept="image/*" id="pxF" hidden></label></div></div>
  <div class="ef"><label for="pxN">یادداشت <i>(اختیاری)</i></label><input id="pxN" autocomplete="off" value="${esc(PX.note)}"></div>
  <div class="px7in">${ic('inv')}<span>${PX.bz?'با ثبت واریزی، یک سند «دریافت» در حساب این مشتری ثبت می‌شود.':'یک سند «دریافت» در حساب این مشتری ثبت می‌شود (قابل چاپ) و تا تأیید، «در انتظار» می‌ماند.'}</span></div>
  <button class="xgo" data-act="pxSave">${ic('check')} ${PX.bz?'افزودن تسویه':'ثبت و صدور سند'}</button></div>`}
function pxRead(){const g=id=>{const el=$(id);return el?el.value:undefined};if(g('pxQ')!==undefined)PX.q=g('pxQ');if(g('pxA')!==undefined)PX.amount=num(g('pxA'));if(g('pxT')!==undefined)PX.tn=toEn(g('pxT')).trim();if(g('pxN')!==undefined)PX.note=clean(g('pxN'))}
function pxAv(){const A=$('pxA'),h=$('pxAv');if(!A||!h)return;const a=num(A.value),r=pxRest();h.textContent=!a?'':a>r?'بیشتر از مانده بانکی ('+fmt(r)+')':'مانده بانکی بعد از این: '+fmt(r-a)+' تومان';h.className='eh'+(a>r?' bad':a?' ok':'')}
function pxBind(){const W=$('sheet').querySelector('.px7w');if(W&&!RM()&&W.animate)W.animate([{opacity:0,transform:`translateX(${PX.dir*-18}px)`},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.9,.25,1)'});
  if(PX.step===1){const Q=$('pxQ'),L=$('pxL');if(Q){Q.oninput=()=>{PX.q=Q.value;clearTimeout(Q._t);Q._t=setTimeout(()=>{if(L.isConnected){L.innerHTML=pxList();L.scrollTop=0;const s=$('sheet');if(s&&s.scrollTop>0)s.scrollTop=0}},90)};Q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const b=L.querySelector('.px7o');if(b)b.click()}}}
    if(L)L.onpointerdown=e=>{if(e.target.closest('.px7o'))e.preventDefault()};return}
  const A=$('pxA'),F=$('pxF');if(A){A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):'';pxAv()};pxAv();if(!PX.amount)setTimeout(()=>{if(A.isConnected)A.focus()},280)}
  if(F)F.onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{PX.imgD=await shrink(f);pxRead();pxRe(0)}catch(z){toast('این عکس خوانده نشد',true)}}}
function pxRe(dir){PX.dir=dir==null?1:dir;$('sheet').innerHTML=pxHTML();pxBind()}
ACT.pxPick=d=>{pxRead();if(d.k==='bk'){const x=entRow();closeSheet();PX=null;if(!x)return;setTimeout(()=>{ACT.paySplit({id:x.id});if(PS&&PS.L.length){const l=PS.L.find((z,i)=>i>0&&!+z.amount)||PS.L[PS.L.length-1];l.src=String(d.id);psRedraw()}},60);return}
  if(d.k==='cu')PX.sel={k:'cu',id:d.id};else if(d.k==='mem'){const p=PXM[+d.id];if(!p)return;const c=cuFindBy({name:p.name,phone:p.phone});PX.sel=c?{k:'cu',id:c.id}:{k:'mem',name:p.name,phone:p.phone||'',nid:p.nid||''}}
  else PX.sel={k:'new',name:clean(PX.q)};
  const S=pxSel(),r=pxRest();if(!PX.amount)PX.amount=S&&S.R<0?Math.min(r,-S.R):r;PX.step=2;pxRe(1)};
ACT.pxBack=()=>{pxRead();PX.step=1;pxRe(-1);setTimeout(()=>{const q=$('pxQ');if(q)q.focus()},260)};
ACT.pxAmt=d=>{const A=$('pxA');if(!A)return;A.value=(+d.v).toLocaleString('en-US');pxAv();A.focus()};
ACT.pxSave=async()=>{pxRead();const a=Math.round(PX.amount||0),r=pxRest(),s=PX.sel;if(!s){PX.step=1;pxRe(-1);return}if(!a){toast('مبلغ را وارد کنید',true);$('pxA').focus();return}if(a>r){toast('بیشتر از مانده بانکی ('+fmt(r)+') است',true);$('pxA').focus();return}
  if(PX.bz){const S=pxSel();bz.d.settles=(bz.d.settles||[]).concat([{name:S.name,phone:s.phone||(S.c&&S.c.phone)||'',cuId:S.c?S.c.id:'',amount:a,tn:PX.tn,note:PX.note,imgD:PX.imgD||'',inv:''}]);PX=null;closeSheet();bzStlRe();toast('تسویه اضافه شد · با ثبت واریزی سندش صادر می‌شود');return}
  const x=entRow(),e=x&&entries.find(z=>z.id===x.id);if(!e)return;if(PX.busy)return;PX.busy=1;
  try{let K=[];if(PX.imgD){const k=newImgKey('stl:'+e.id+'.'+Date.now());if(await imgPut(k,PX.imgD))K=[k];else toast('حافظه پر است؛ عکس ذخیره نشد',true)}
    const c=s.k==='cu'?CU().find(z=>String(z.id)===String(s.id)):cuOf({name:s.name,phone:s.phone,nid:s.nid},'پرداخت‌کننده واریزی');if(!c){toast('حساب پیدا نشد',true);return}
    const R=payDocMake(e,c,a,{tn:PX.tn,note:PX.note,imgs:K});e.updatedAt=ns();e.updatedBy=who();saveE();
    logA('edit','تسویه از مشتری (سند)',fullName(e)+' ← '+cuName(c)+' | '+fmt(a)+' تومان | '+invTitle(R.t));pyFlash=R.z?R.z.id:null;PX=null;closeSheet();pyRe();
    setTimeout(()=>{pyFlash=null},1400);const el=$('py7');if(el&&!RM())try{el.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
    toast(invTitle(R.t)+' در حساب «'+cuName(c)+'» ثبت شد','','دیدن سند',()=>invOpen(c.id,R.t.id))}finally{if(PX)PX.busy=0}};
