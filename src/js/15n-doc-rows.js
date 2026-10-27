/* ============ v61.61 (خواسته صاحب اپ) ============
   ۱) ردیف‌های سند: یک بار زدن = جزئیات زیر ردیف با حرکت باز/بسته؛ دو بار زدن = ویرایش (d6Tap، حالت باز در D6OP).
   ۲) مانده قبلی یک واحد در دریافت/پرداخت: تومان و طلا با هم، و هر مانده دیگر (دلار، سکه…) با «+».
      ذخیره همان ساختار قبلی است (pay m:'prev' و xr با cat 'مانده قبلی' و pul) با کلید گروه مشترک pv؛
      در فهرست ردیف‌ها یک ردیف دیده می‌شود و با هم ویرایش/حذف می‌شوند. حساب‌ها هیچ تغییری نمی‌کنند.
   ۳) جدول مانده‌های پایین (v61.63): همه مانده‌ها همیشه زیر هم — مبلغ، طلا، بعد دلار و سکه. */
const D6OP=new Set();let D6T={k:'',t:0};
ACT.d6Tap=(d,e)=>{const b=e&&e.target&&e.target.closest('.d6rb'),r=b&&b.closest('.d6r');if(!r)return;const k=d.key||'',now=Date.now();
  /* دو بار زدن پشت هم روی همان ردیف = ویرایش (باز/بسته شدن زدن اول برمی‌گردد) */
  if(d.a&&ACT[d.a]&&D6T.k===k&&now-D6T.t<380){D6T={k:'',t:0};d6Set(r,k,!r.classList.contains('op'));ACT[d.a](d);return}
  D6T={k,t:now};d6Set(r,k,!r.classList.contains('op'))};
function d6Set(r,k,on){r.classList.toggle('op',on);const b=r.querySelector('.d6rb');if(b)b.setAttribute('aria-expanded',on?'true':'false');if(k){if(on)D6OP.add(k);else D6OP.delete(k)}
  if(on&&!RM()){const x=r.querySelector('.d8xi');if(x&&x.animate)x.animate([{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.9,.25,1)'});
    setTimeout(()=>{if(!r.isConnected)return;const R=r.getBoundingClientRect(),A=$('act'),bot=(A&&A.offsetHeight?A.getBoundingClientRect().top:innerHeight)-8;if(R.bottom>bot)scrollBy({top:Math.min(R.bottom-bot,R.top-80),behavior:'smooth'})},320)}}

/* ----- مانده قبلی (یک واحد) ----- */
function pvGroups(pays,xr){const M=new Map(),sp=new Set(),sx=new Set(),G=id=>{if(!M.has(id))M.set(id,{id,p:[],x:[],dir:''});return M.get(id)};
  (pays||[]).forEach((p,i)=>{if(p&&p.pv&&p.m==='prev'){const g=G(String(p.pv));g.p.push(i);sp.add(i);if(!g.dir)g.dir=pAmt(p)<0?'out':'in'}});
  (xr||[]).forEach((x,i)=>{if(x&&x.pv&&x.cat==='مانده قبلی'){const g=G(String(x.pv));g.x.push(i);sx.add(i);if(!g.dir)g.dir=x.t==='out'?'out':'in'}});
  return {L:[...M.values()],sp,sx}}
/* v61.62: مثل بقیه ردیف‌ها کنار نام فقط مبلغ و طلا (اگر هیچ‌کدام نبود، اولین مانده دیگر)؛ بقیه در جزئیات */
const pvEffs=(G,pays,xr,eOf)=>{const E=[...G.p.map(i=>[pAmt(pays[i]),'r']),...G.x.map(i=>xr[i]).map(x=>[eOf(x),x.a==='gold'?'g':x.a])].filter(z=>z[0]).sort((a,b)=>balRk(a[1])-balRk(b[1])),M=E.filter(z=>z[1]==='r'||z[1]==='g');return (M.length?M:E.slice(0,1)).map(z=>d6Eff(z[0],z[1])).join('')};
/* جزئیات ردیف مانده قبلی (مثل بقیه ردیف‌ها): مبلغ، طلا، و هر مانده دیگر */
function pvSub(G,pays,xr){const L=[];G.p.forEach(i=>{const v=Math.abs(pAmt(pays[i]));if(v)L.push('مبلغ: '+fmt(v)+' تومان')});
  G.x.map(i=>xr[i]).sort((a,b)=>balRk(a.a==='gold'?'g':a.a)-balRk(b.a==='gold'?'g':b.a)).forEach(x=>{if(x.a==='gold'){const w=parseFloat(x.w)||0;if(w)L.push('طلا: '+wFmt(w)+' گرم')}else{const q=parseFloat(x.q)||0;if(q)L.push(esc((XA[x.a]||{t:x.a}).t)+': '+qFmt(q)+' '+esc((XA[x.a]||{}).u||''))}});return L.join(' · ')}
/* عکس‌های مانده قبلی روی اولین ردیف گروهش نگه داشته می‌شود */
const pvPh=(G,pays,xr)=>[...G.p.map(i=>pays[i]),...G.x.map(i=>xr[i])].reduce((K,o)=>K.concat(o?xrPh(o):[]),[]);
const pvHas=p=>!!(+p.r||parseFloat(p.g)||(p.xs||[]).some(z=>parseFloat(z.v)));
/* v61.62: ورود مانده قبلی با همان پله‌ها (stHTML، stSteps کلید pv): مبلغ · طلا · مانده‌های اضافه · «+ مانده دیگر» */
function pvStart(p){qaRead();const d=sv.qa.d||p.dir;sv.qa={...qaBlank(),d,pv:{dir:p.dir,r:p.r||'',g:p.g||'',xs:p.xs||[],gid:p.gid||'',...(p.imgs&&p.imgs.length?{imgs:p.imgs,img:p.imgs[0]}:{})},st:0,stMax:p.gid?1+(p.xs||[]).length:0};svKeep();stRe();
  const q=$('qa');if(q&&p.gid)q.scrollIntoView({behavior:'smooth',block:'center'})}
ACT.svPvEdit=d=>{const id=String(d.i),G=pvGroups(sv.pays,sv.xr||[]).L.find(z=>z.id===id);if(!G)return;const p={dir:G.dir,gid:id,r:'',g:'',xs:[]};
  G.p.forEach(i=>{p.r=String((+p.r||0)+Math.abs(pAmt(sv.pays[i])))});
  G.x.forEach(i=>{const x=sv.xr[i];if(x.a==='gold')p.g=String(Math.round(((parseFloat(p.g)||0)+(parseFloat(x.w)||0))*1000)/1000);else p.xs.push({k:x.a,v:String(x.q||'')})});
  p.imgs=pvPh(G,sv.pays,sv.xr||[]);pvStart(p)};
function pvRows(gid){const id=String(gid);return{P:sv.pays.filter(p=>String(p.pv||'')===id&&p.m==='prev'),X:(sv.xr||[]).filter(x=>String(x.pv||'')===id&&x.cat==='مانده قبلی')}}
function pvDrop(gid){const id=String(gid),pi=[],xi=[];sv.pays.forEach((p,i)=>{if(String(p.pv||'')===id&&p.m==='prev')pi.push([i,p])});(sv.xr||[]).forEach((x,i)=>{if(String(x.pv||'')===id&&x.cat==='مانده قبلی')xi.push([i,x])});
  sv.pays=sv.pays.filter((p,i)=>!pi.some(z=>z[0]===i));sv.xr=(sv.xr||[]).filter((x,i)=>!xi.some(z=>z[0]===i));return{pi,xi}}
ACT.pvSave=()=>{if($('stI'))stRead();const p=sv.qa.pv;if(!p)return;if(!pvHas(p)){toast('مبلغ یا طلای مانده قبلی را بزنید',true);const I=$('pvR');if(I)I.focus();return}
  const gid=p.gid||('p'+Date.now().toString(36)),sg=p.dir==='out'?-1:1;if(p.gid)pvDrop(p.gid);
  if(+p.r)sv.pays.push({m:'prev',amount:sg*Math.round(+p.r),pv:gid});
  if(parseFloat(p.g))sv.xr.push(xrNew(p.dir,'gold',{cat:'مانده قبلی',pul:true,ay:750,w:String(Math.round(parseFloat(p.g)*1000)/1000),pv:gid,fd:p.dir}));
  p.xs.forEach(z=>{if(parseFloat(z.v)&&XA[z.k])sv.xr.push(xrNew(p.dir,z.k,{cat:'مانده قبلی',pul:true,q:String(parseFloat(z.v)),pv:gid,fd:p.dir}))});
  {const K=xrPh(p),f=sv.pays.find(z=>String(z.pv||'')===gid&&z.m==='prev')||(sv.xr||[]).find(z=>String(z.pv||'')===gid&&z.cat==='مانده قبلی');if(K.length&&f){f.imgs=K;f.img=K[0]}}
  D6OP.delete('spv'+gid);qaDone();toast(p.gid?'مانده قبلی ذخیره شد':'مانده قبلی به سند اضافه شد')};
function pvDel(gid){const R=pvDrop(gid);if(sv.qa.pv&&String(sv.qa.pv.gid)===String(gid))sv.qa=qaBlank();svKeep();qaRe();svRe();
  toast('مانده قبلی حذف شد','','بازگردانی',()=>{R.pi.forEach(([i,o])=>sv.pays.splice(Math.min(i,sv.pays.length),0,o));R.xi.forEach(([i,o])=>sv.xr.splice(Math.min(i,sv.xr.length),0,o));svKeep();svRe()})}
ACT.pvDel=d=>pvDel(d.i);

/* ============ v61.62 (خواسته صاحب اپ): آبشده شرطی ============
   آبشده‌ای که عیارش هنوز درنیامده: در سند با ۷۵۰ حساب می‌شود (ردیف sh:1، پله عیار ندارد).
   در تنظیمات (زیر پروفایل) «آبشده شرطی»: همه ردیف‌های باز از همه حساب‌ها، گروه‌شده با شماره انگ
   (یک تکه آبشده که از یکی خریده و به دیگری فروخته شده = یک گروه). عیار واقعی یک بار زده می‌شود و در همه همان سندها می‌نشیند:
   ردیف sh:2 با عیار تازه، مبلغ‌ها، جمع سند و اثر طلا دوباره حساب می‌شوند (همان محاسبه ثبت سند؛ مبلغ دستی کنار می‌رود). */
function shRows(){const R=[];CU().forEach(c=>(c.txs||[]).forEach(t=>{if(t.type!=='inv'||t.del)return;
  (t.items||[]).forEach((it,i)=>{if(it.ab&&it.sh===1)R.push({c,t,k:'it',i,o:it})});
  (t.xr||[]).forEach((x,i)=>{if(x.a==='gold'&&x.cat==='آبشده'&&x.sh===1)R.push({c,t,k:'xr',i,o:x})})}));return R}
function shGroups(cu){const M=new Map();shRows().forEach(r=>{const a=clean(toEn(String(r.o.ang||''))),key=a?'a:'+a:'r:'+r.t.id+':'+r.k+r.i;
  if(!M.has(key))M.set(key,{key,ang:a,lab:'',w:0,at:'',rows:[]});const g=M.get(key);g.rows.push(r);if(!g.lab&&r.o.lab)g.lab=r.o.lab;g.w=Math.max(g.w,parseFloat(r.o.w)||0);if(String(r.t.date||'')>g.at)g.at=String(r.t.date||'')});
  return [...M.values()].filter(g=>cu==null||g.rows.some(r=>String(r.c.id)===String(cu))).sort((a,b)=>b.at.localeCompare(a.at))}
const shN=()=>{try{return shGroups().length}catch(e){return 0}};
const shKind=r=>r.k==='it'?'sell':r.o.t==='buy'?'buy':r.o.t==='in'?'in':r.o.t==='out'?'out':'sell';
function shHTML(cu){const G=shGroups(cu),C=cu!=null&&CU().find(z=>String(z.id)===String(cu));
  const card=(g,n)=>`<div class="shg" data-g="${esc(g.key)}" style="--i:${n}"><div class="shgh"><span class="shgi">${ic('coin')}</span><div class="shgt"><b>${g.ang?'انگ '+esc(g.ang):'بدون شماره انگ'}</b><small>${g.lab?'آزمایشگاه '+esc(g.lab)+' · ':''}${wFmt(g.w)} گرم · فعلاً ۷۵۰</small></div></div>
    <div class="shgr">${g.rows.map(r=>`<button type="button" class="shr" data-act="shDoc" data-cu="${esc(r.c.id)}" data-tx="${esc(r.t.id)}">${dkTag(shKind(r))}<span class="shrn"><b>${esc(cuName(r.c))}</b><small>${esc(invTitle(r.t))} · ${esc(dates(r.t.date).fa)}</small></span><i>${ic('back')}</i></button>`).join('')}</div>
    <div class="shin"><label class="shf"><small>عیار واقعی</small><input class="ltr" data-g="${esc(g.key)}" inputmode="decimal" placeholder="" autocomplete="off" enterkeyhint="done"></label><button type="button" class="shok" data-act="shSet" data-g="${esc(g.key)}">${ic('check')}<span>ثبت عیار</span></button></div>
    <div class="shpv" data-g="${esc(g.key)}"></div></div>`;
  return `<div class="sh-h"><div><b>آبشده شرطی</b><small class="shsub">${C?esc(cuName(C))+' · ':''}عیار درنیامده · فعلاً با ۷۵۰ حساب شده</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="shl">${G.length?G.map(card).join(''):`<div class="shnone">${ic('check')}<b>آبشده شرطی باز نیست</b><small>در سند: فروش، خرید، دریافت یا پرداخت › «آبشده شرطی»</small></div>`}</div>`}
function shBind(){document.querySelectorAll('#sheet .shin input').forEach(I=>{I.oninput=()=>{I.value=decIn(I.value);const k=I.dataset.g,g=shGroups().find(z=>z.key===k),P=[...document.querySelectorAll('#sheet .shpv')].find(z=>z.dataset.g===k);if(!g||!P)return;const ay=parseFloat(I.value)||0;
    P.innerHTML=ay>0&&ay<=1000?`<span>وزن ۷۵۰: <b>${wFmt(Math.round(g.w*ay/750*1000)/1000)}</b> گرم <small>(به جای ${wFmt(g.w)})</small></span>`:'';P.classList.toggle('on',!!P.innerHTML)};
  I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ACT.shSet({g:I.dataset.g})}}})}
let shCu=null;
ACT.shOpen=d=>{shCu=d&&d.cu!=null&&d.cu!==''?d.cu:null;sheet(shHTML(shCu));shBind()};
/* v61.65 (خواسته صاحب اپ): در حساب مشتریان و گردش حساب هر مشتری، فهرست آبشده‌های شرطی باز؛ زدن = پنجره ثبت عیار
   (عیار در سند همان آبشده در همه حساب‌ها اثر می‌گذارد) */
function shBanner(cu){const G=shGroups(cu);if(!G.length)return '';const R=cu==null?[]:G.flatMap(g=>g.rows.filter(r=>String(r.c.id)===String(cu)).map(r=>({g,r})));
  return `<button type="button" class="shbn" data-act="shOpen" data-cu="${cu==null?'':esc(cu)}"><span class="shgi">${ic('coin')}</span><span class="shbt"><b>آبشده شرطی</b><small>${toFa(G.length)} آبشده منتظر عیار${cu==null?' · همه حساب‌ها':''}</small>${R.length?`<span class="shbl">${R.slice(0,4).map(({g,r})=>`<span>${dkTag(shKind(r))}<b>${wFmt(parseFloat(r.o.w)||0)} گرم</b><small>${g.ang?'انگ '+esc(g.ang):esc(invTitle(r.t))}</small></span>`).join('')}${R.length>4?`<small>و ${toFa(R.length-4)} مورد دیگر</small>`:''}</span>`:''}</span><span class="shbg">ثبت عیار</span></button>`}
ACT.shDoc=d=>{closeSheet();invOpen(isNaN(+d.cu)?d.cu:+d.cu,isNaN(+d.tx)?d.tx:+d.tx)};
ACT.shSet=d=>{const I=[...document.querySelectorAll('#sheet .shin input')].find(z=>z.dataset.g===d.g),ay=Math.round((parseFloat(I&&I.value)||0)*10)/10;
  if(!(ay>0&&ay<=1000)){toast('عیار واقعی را بزنید',true);if(I)I.focus();return}const g=shGroups().find(z=>z.key===d.g);if(!g)return;
  const T=new Map();g.rows.forEach(r=>{const k=r.c.id+'|'+r.t.id;if(!T.has(k))T.set(k,{c:r.c,t:r.t,R:[]});T.get(k).R.push(r)});
  askConfirm(`عیار ${toFa(ay)} برای ${g.ang?'انگ '+toFa(g.ang):'این آبشده'} در ${toFa(T.size)} سند ثبت شود؟`,'ثبت عیار',()=>{
    T.forEach(({c,t,R})=>shFix(c,t,R,ay));saveCu();
    logA('cust','عیار آبشده شرطی',(g.ang?'انگ '+g.ang+' | ':'')+'عیار '+ay+' | '+[...T.values()].map(z=>cuName(z.c)+' '+invTitle(z.t)).join('، '));
    toast('عیار '+toFa(ay)+' در '+toFa(T.size)+' سند نشست');render();setTimeout(()=>{sheet(shHTML(shCu));shBind()},60)})};
function shFix(c,t,R,ay){const keep=sv;try{sv=invSv(c,t);R.forEach(r=>{const o=(r.k==='it'?sv.items:sv.xr)[r.i];if(!o||o.sh!==1)return;
      /* اثر تبدیل عیار بر همین ردیف (برای نمایش در جزئیات سند): مبلغ و طلای ۷۵۰ پیش و پس از عیار تازه */
      const eff=()=>{if(r.k==='it')return {r:itCalc(o,sv.rate,sv.tax).tot,g:0};const C=xrCalc(o,sv.rate);return {r:C.amount||0,g:o.t==='in'||o.t==='out'?C.q||0:0}};/* تغییر مبلغ همین ردیف و وزن ۷۵۰ آن (منفی = کمتر شد) */
      delete o.amT;delete o.amN;if(r.k==='xr'&&parseFloat(o.w)>0)delete o.am;const b=eff();o.ay=ay;o.sh=2;const a2=eff(),dr=Math.round(a2.r-b.r),dg=Math.round((a2.g-b.g)*1000)/1000;o.shd={};if(dr)o.shd.r=dr;if(dg)o.shd.g=dg});
    const T=svTot(),items=sv.items.map(it=>{const c2=itCalc(it,sv.rate,sv.tax),J=ajPT(it);return{...it,ajP:J.P,ajT:J.T,gold:c2.gold,ajv:c2.aj,prv:c2.pr,taxv:c2.tax,tot:c2.tot}}),
      xr=sv.xr.map(x=>{const C=xrCalc(x,sv.rate);return{...x,pg:C.pg,n:C.n,q750:x.a==='gold'?C.q:undefined,amount:C.amount,e:C.e}});
    t.items=items;t.xr=xr;t.sub=T.sub;t.total=T.total;t.disc=T.disc;if(T.ge)t.ge=T.ge;else delete t.ge;if(Object.keys(T.xe).length)t.xe=T.xe;else delete t.xe;
    if(t.gc&&T.rest>0&&t.rate)t.gc={r:T.rest,g:Math.round(T.rest/t.rate*1000)/1000};t.shAt=ns();c.lastAt=ns()}finally{sv=keep}}

/* ============ v61.75 (خواسته صاحب اپ): حواله به فروشنده واریزی (m:'dep') دوطرفه ============
   جزئیات ردیف سند: طرف حواله (همان شخص واریزی خرید)، بانک/شبا، تاریخ واریز، کل واریزی، مانده بانکی و وضعیت تسویه روی آن واریزی.
   عکس رسید: هر عکسی که روی تسویه واریزی (صفحه جزئیات واریزی) اضافه شود روی ردیف همان سند هم می‌نشیند و برعکس (ckDepApply). */
const depEnt=p=>entries.find(z=>String(z.id)===String(p.entId));
const depName=p=>{const e=depEnt(p);return clean((p.entName||'')||(e?fullName(e):''))||'واریزی'};
function depSub(p,txId){const e=depEnt(p);if(!e)return 'واریزی پیدا نشد';const z=(e.settles||[]).find(s=>s.id===p.stlId||(s.byInv&&txId!=null&&String(s.byInv.tx)===String(txId)));
  const st=(e.settles||[]).reduce((a,s)=>a+(+s.amount||0),0),bank=e.iban?(ibanBank(e.iban)||'')+' '+String(e.iban).slice(-4):'';
  return ['واریز به: '+esc(fullName(e)),e.holder&&e.holder!==e.name?'صاحب حساب: '+esc(e.holder):'',bank?'بانک: '+esc(bank):'','تاریخ واریز: '+esc(dates(PD(e)).fa),'کل واریزی: '+fmt(+e.amount||0)+' تومان','مانده بانکی: '+fmt(Math.max(0,(+e.amount||0)-st))+' تومان',
    'تسویه روی واریزی: '+(z?(z.st==='wait'?'در انتظار تأیید':'تأیید شد'):'با ثبت سند'),e.sentBid?'ارسال‌شده به بانک':''].filter(Boolean).join(' · ')}
function depImgSync(z,K){if(!z||!z.byInv)return;const c=custs.find(q=>String(q.id)===String(z.byInv.cu)),t=c&&(c.txs||[]).find(x=>String(x.id)===String(z.byInv.tx)&&!x.del);if(!t)return;
  let ch=false;(t.pays||[]).forEach(p=>{if(p.m==='dep'&&p.stlId===z.id){p.imgs=K.slice();p.img=K[0]||'';if(!K.length){delete p.imgs;delete p.img}ch=true}});if(ch){c.lastAt=new Date().toISOString();saveCu()}
  if(typeof sv!=='undefined'&&sv&&sv.edit&&String(sv.edit.tx)===String(t.id))(sv.pays||[]).forEach(p=>{if(p.m==='dep'&&p.stlId===z.id){p.imgs=K.slice();p.img=K[0]||''}})}
/* مانده قابل حواله یک واریزی: مانده بانکی + تسویه‌هایی که خود همین سند (در ویرایش) قبلاً روی آن گذاشته (وگرنه ویرایش سند رد می‌شد) */
const depAvail=x=>{const own=sv&&sv.edit?(x.settles||[]).filter(z=>z.byInv&&String(z.byInv.tx)===String(sv.edit.tx)).reduce((a,z)=>a+(+z.amount||0),0):0;return (x.full&&!own?0:(+x.amount||0))+own};

/* ============ v61.77 (خواسته صاحب اپ): از همان پنل حواله، اطلاعات حساب فروشنده واریزی با «مبلغ همین حواله» کپی یا فرستاده شود ============
   (نه مانده واریزی) تا مشتری پرداخت‌کننده واریز کند؛ و دکمه رفتن به خود واریزی. در جزئیات ردیف سند، سند ثبت‌شده و فرم تسویه. */
function depTxt(e,amt,payer){const bk=e.bankShow||e.bank||ibanBank(e.iban)||'';
  return 'مطلا | اطلاعات واریز'+'\nواریز به: '+Bo(fullName(e))+(e.holder&&e.holder!==e.name?'\nصاحب حساب: '+e.holder:'')+(bk?'\nبانک: '+bk:'')+(e.iban?'\nشبا: '+Mo(ibanSp(e.iban)):'')+(e.card?'\nکارت: '+Mo(e.card):'')+'\nمبلغ: '+Bo(N(amt)+' تومان')+(payer?'\nپرداخت‌کننده: '+payer:'')}
const depBar=(entId,src,i,cu)=>{const a=` data-e="${esc(entId)}" data-s="${src}"${i!=null?` data-i="${esc(i)}"`:''}${cu!=null?` data-cu="${esc(cu)}"`:''}`;
  return `<span class="depb"><span class="depbb" role="button" data-act="depCp"${a}>${ic('copy')}<span>کپی اطلاعات واریز</span></span><span class="depbb" role="button" data-act="depSh"${a}>${ic('share')}<span>ارسال</span></span><span class="depbb g" role="button" data-act="depGo" data-e="${esc(entId)}">${ic('open')}<span>واریزی</span></span></span>`};
const depActs=(p,k,c)=>depEnt(p)?depBar(p.entId,'p',k,c?c.id:null):'';
/* مبلغ: فرم تسویه = مبلغ نوشته‌شده؛ ردیف سند = مبلغ همان ردیف؛ سند ثبت‌شده = مبلغ همان ردیف */
function depAmt(d){if(d.s==='ck'){ckRead();return +CK.amount||0}const k=String(d.i||'');if(k[0]==='s'){const p=sv&&sv.pays[+k.slice(1)];return p?pAmt(p):0}
  const m=k.match(/^v(.+)\.(\d+)$/);if(m){const c=custs.find(z=>String(z.id)===String(d.cu)),t=c&&(c.txs||[]).find(x=>String(x.id)===m[1]),p=t&&(t.pays||[])[+m[2]];return p?pAmt(p):0}return 0}
function depMsg(d){const e=entries.find(z=>String(z.id)===String(d.e));if(!e){toast('واریزی پیدا نشد',true);return ''}const a=depAmt(d);if(!a){toast('اول مبلغ را بنویسید',true);return ''}
  const c=d.cu!=null&&d.cu!==''?custs.find(z=>String(z.id)===String(d.cu)):(typeof svCu==='function'&&sv?svCu():null);return depTxt(e,a,c?cuName(c):'')}
/* v61.78 (خواسته صاحب اپ): بازخورد دکمه — کپی: سبز با تیک «کپی شد» و پرش؛ ارسال: تپش کوتاه؛ بعد از ۱.۸ ثانیه به حالت اول */
function depFx(el,ok,txt){if(!el)return;const L=el.querySelector('span'),I=el.querySelector('svg');if(!el._t0){el._t0=L?L.textContent:'';el._i0=I?I.outerHTML:''}clearTimeout(el._tm);
  el.classList.remove('ok','bad');void el.offsetWidth;el.classList.add(ok?'ok':'bad');if(L)L.textContent=txt;if(I&&ok)I.outerHTML=ic('check');
  el._tm=setTimeout(()=>{el.classList.remove('ok','bad');const L2=el.querySelector('span'),I2=el.querySelector('svg');if(L2)L2.textContent=el._t0;if(I2&&el._i0)I2.outerHTML=el._i0},1800)}
ACT.depCp=async(d,e)=>{const t=depMsg(d);if(!t)return;const el=e&&e.target&&e.target.closest('.depbb'),ok=await copyText(t);
  if(ok){depFx(el,true,'کپی شد');toast('اطلاعات واریز با مبلغ '+fmt(depAmt(d))+' تومان کپی شد')}else{depFx(el,false,'کپی نشد');cpOut(t,'')}};
ACT.depSh=(d,e)=>{const t=depMsg(d);if(!t)return;depFx(e&&e.target&&e.target.closest('.depbb'),true,'آماده ارسال');if(window.AndroidBridge&&AndroidBridge.share){AndroidBridge.share(t);return}if(navigator.share)navigator.share({text:t}).catch(()=>{});else cpOut(t,'اطلاعات واریز کپی شد')};
ACT.depGo=d=>{closeSheet();ACT.openEnt({id:isNaN(+d.e)?d.e:+d.e})};

/* ============ v61.80 (خواسته صاحب اپ): «در همه سندها همه جزئیات را داشته باشم وقتی روی ردیف می‌زنم» ============
   جزئیات کامل هر ردیف (همان قالب «برچسب: مقدار» که d6Spec خانه‌خانه نشان می‌دهد) — در صفحه سند و سند ثبت‌شده.
   کالا: تعداد، وزن، عیار، وزن ۷۵۰، مظنه، هر گرم ۱۸، بهای طلا، اجرت، سود، مالیات، مبلغ، آزمایشگاه، انگ، توضیح.
   طلا/سکه/ارز (فروش، خرید، دریافت، تحویل آبشده…): نوع، دسته، وزن یا تعداد، عیار، وزن ۷۵۰، مظنه، هر گرم، مبلغ، اثر بر طلا/جنس، انگ، آزمایشگاه.
   دریافت/پرداخت: روش، مبلغ، حساب یا کارتخوان، طرف حواله، پیگیری. */
const dtT=v=>fmt(Math.round(+v||0))+' تومان';
function itDet(it,rate,tax,saved){const c=saved&&it.tot!=null?{gold:+it.gold||0,aj:+it.ajv||0,pr:+it.prv||0,tax:+it.taxv||0,tot:+it.tot||0,fx:+it.amT>0?1:0}:itCalc(it,rate,tax),r=+it.mz?(+it.mz)/MZK:(+rate||0),ay=+it.ay||750,w=+it.w||0;
  return [it.pz&&+it.cnt?'تعداد: '+qFmt(it.cnt)+' عدد':'','وزن: '+wFmt(w)+' گرم',shAyL(it)||'عیار: '+toFa(ay),ay!==750||it.ab?'وزن ۷۵۰: '+wFmt(Math.round(w*ay/750*1000)/1000)+' گرم':'',
    r?'مظنه: '+fmt(Math.round(r*MZK))+' تومان':'',r?'هر گرم ۱۸: '+dtT(r):'',c.gold?'بهای طلا: '+dtT(c.gold):'',!it.ab?'اجرت: '+ajLab(it)+(c.aj&&ajPT(it).P?' = '+dtT(c.aj):''):'',
    'سود: '+toFa(Math.round((+it.pp||0)*100)/100)+'٪'+(c.pr?' = '+dtT(c.pr):''),c.tax?'مالیات: '+dtT(c.tax):'','مبلغ: '+dtT(c.tot),c.fx?'مبلغ دستی':'',shEff(it),
    it.lab?'آزمایشگاه '+esc(it.lab):'',it.ang?'انگ '+esc(it.ang):'',it.n?'توضیح: '+esc(it.n):''].filter(Boolean).join(' · ')}
function xrDet(x,C,rate){const g=x.a==='gold',m=x.t==='sell'||x.t==='buy',u=g?'گرم':((XA[x.a]||{}).u||'واحد'),ay=+x.ay||750,q=C.q!=null?C.q:x.q750!=null?+x.q750:(g?Math.round((+C.n||0)*ay/750*1000)/1000:C.n),r=+x.mz?(+x.mz)/MZK:(+rate||0),ab=g&&x.cat==='آبشده'&&!x.pul;
  const nm={sell:'فروش',buy:'خرید',in:'دریافت',out:'پرداخت (تحویل)'}[x.t]||x.t;
  return ['نوع: '+nm+(x.pul?' پولی':''),g&&x.cat&&x.cat!=='متفرقه'?'دسته: '+esc(x.cat):'',!g?'جنس: '+esc((XA[x.a]||{t:x.a}).t):'',x.pz&&+x.cnt?'تعداد: '+qFmt(x.cnt)+' عدد':'',
    g?(x.pz&&+x.cnt?'وزن کل: ':'وزن: ')+wFmt(C.n)+' گرم':'مقدار: '+qFmt(C.n)+' '+u,g?(shAyL(x)||'عیار: '+toFa(ay)):'',g?'وزن ۷۵۰: '+wFmt(q)+' گرم':'',
    m&&g&&r&&!x.pgM?'مظنه: '+fmt(Math.round(r*MZK))+' تومان':'',m?(ab?'هر گرم ۱۸: '+dtT(Math.round((+C.pg||0)*750/ay)):(g?(x.t==='buy'&&!x.pul?'هر گرم خرید: ':'هر گرم: '):'هر '+u+': ')+dtT(C.pg)):'',
    m?'مبلغ: '+dtT(C.amount):'',C.fx?'مبلغ دستی':'',C.e?'اثر بر '+(g?'طلا':esc((XA[x.a]||{t:x.a}).t))+': '+(g?wFmt(Math.abs(C.e))+' گرم ۱۸':qFmt(Math.abs(C.e))+' '+u)+' '+ourLab(C.e):'',shEff(x),
    x.lab?'آزمایشگاه '+esc(x.lab):'',x.ang?'انگ '+esc(x.ang):'',x.note?'توضیح: '+esc(x.note):''].filter(Boolean).join(' · ')}
function pyDet(p,txId){if(p.m==='dep')return depSub(p,txId);const a=pAmt(p),out=a<0,M=PM[p.m]||PM.cash,ch=p.chId&&custs.find(z=>String(z.id)===String(p.chId)),Y=p.cuId&&custs.find(z=>String(z.id)===String(p.cuId));
  return ['نوع: '+(out?'پرداخت':'دریافت'),'روش: '+(p.m==='wd'?'واریز بانکی (لیست واریزی)':p.m==='cust'?'حواله دوطرفه بین حساب‌ها':p.m==='nm'?'حواله دستی':M.t),'مبلغ: '+dtT(Math.abs(a)),
    p.srcId!=null?'حساب ما: '+esc(srcName(p.srcId)):'',ch?(p.m==='pos'?'کارتخوان: ':'حساب: ')+esc(ch.name):'',p.m==='wd'&&p.src?'از بانک: '+esc(p.src):'',p.m==='wd'&&p.nm?'تسویه از: '+esc(p.nm):'',
    Y?(out?'به حساب: ':'از حساب: ')+esc(cuName(Y)):'',p.m==='nm'&&p.cuName?'طرف حواله: '+esc(p.cuName):'',p.m==='gold'?'وزن: '+wFmt(p.w)+' گرم':'',p.m==='gold'?'عیار: '+toFa(p.ay||750):'',
    p.m==='off'?'صفر کردن مانده':'',p.tn?'پیگیری '+esc(p.tn):'',p.note?'توضیح: '+esc(p.note):''].filter(Boolean).join(' · ')}
/* دکمه‌های زیر جزئیات دریافت/پرداخت: حواله دوطرفه → حساب و ردیف طرف مقابل؛ واریز بانکی → خود واریزی */
function pyActs(p,c,txId,no){if(p.m==='cust'&&p.cuId){const Y=custs.find(z=>String(z.id)===String(p.cuId));if(!Y)return '';return `<span class="d8eb d8lk" role="button" data-act="xfGo" data-cu="${esc(p.cuId)}" data-x="${esc(p.xfId||'')}" data-fc="${c?esc(c.id):''}" data-no="${esc(no!=null?no:'')}">${ic('swap')}<span>حساب «${esc(cuName(Y))}»</span><small>حواله دوطرفه در حساب طرف مقابل</small></span>`}
  if(p.m==='wd'&&p.entId!=null)return `<span class="d8eb d8lk" role="button" data-act="depGo" data-e="${esc(p.entId)}">${ic('open')}<span>واریزی</span><small>رسید و جزئیات واریز بانکی</small></span>`;return ''}
/* ردیف حواله در حساب طرف مقابل (xf با inv) — با شماره سند پیدا می‌شود چون ویرایش سند شناسه‌اش را عوض می‌کند */
function xfFind(Y,fc,no,xid){const T=(Y.txs||[]).filter(z=>!z.del&&z.type==='xf');let x=xid&&T.find(z=>String(z.id)===String(xid));if(x)return x;
  const C=custs.find(z=>String(z.id)===String(fc));return T.find(z=>z.inv&&String(z.inv.cu)===String(fc)&&(()=>{const t=C&&(C.txs||[]).find(q=>String(q.id)===String(z.inv.tx));return t&&String(t.no)===String(no)})())||null}
ACT.xfGo=d=>{const Y=custs.find(z=>String(z.id)===String(d.cu));if(!Y){toast('حساب طرف حواله پیدا نشد',true);return}closeSheet();custId=Y.id;go('cust');setTimeout(()=>{if(cur!=='cust'||String(custId)!==String(Y.id))return;const x=xfFind(Y,d.fc,d.no,d.x);if(x)xfShow(Y,x)},380)};
ACT.xfInv=d=>{closeSheet();invOpen(isNaN(+d.cu)?d.cu:+d.cu,isNaN(+d.tx)?d.tx:+d.tx)};
