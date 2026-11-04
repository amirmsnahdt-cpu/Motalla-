/* ===== v76.5 (خواسته صاحب اپ): «تاریخچه» = خط زمانی همه معاملات و فعالیت‌های همه کاربران =====
   - هر فعالیت یک گره روی خط زمانی: رنگ و آیکن از نوع (فروش قرمز، خرید/دریافت آبی، واریزی، بانک، حذف…)، ساعت، انجام‌دهنده،
     با زدن جزئیات کامل (ردیف‌های شرح جدا، زمان دقیق) و «دیدن سند / دیدن واریزی».
   - علامت «تا اینجا وارد سیستم حسابداری شد» (TLC: در رکورد تنظیمات مشترک cfg.accChk، همگام بین همه): هر چه تا آن زمان
     ثبت شده تیک سبز می‌خورد؛ بعدی‌ها «وارد نشده» می‌مانند و تعدادشان روی دکمه تاریخچه پایین صفحه نشان داده می‌شود.
   - اعلان: فعالیت تازه همکاران که با همگام‌سازی می‌رسد، بالای صفحه بنر می‌زند (و اگر اجازه داده شده، اعلان گوشی). */
Object.assign(IC,{bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/>'});
const TLK=x=>{const s=String(x.summary||''),t=x.type;
  if(t==='cust'){if(/فروش/.test(s))return ['sell','فروش','tag','var(--red)'];if(/خرید/.test(s))return ['buy','خرید','dBuy','var(--blu)'];if(/دریافت/.test(s))return ['in','دریافت','down','var(--blu)'];if(/پرداخت|واریز به حساب مشتری/.test(s))return ['out','پرداخت','share','var(--red)'];if(/حواله|انتقال/.test(s))return ['hav','حواله','swap','#7a4fd6'];if(/حذف/.test(s))return ['del','حذف','trash','var(--red)'];if(/حساب/.test(s))return ['acc','حساب مشتری','user','var(--ok)'];return ['doc','سند','inv','var(--blu)']}
  if(t==='src')return ['bank','بانک','bank','#0f8a8a'];
  if(t==='add'||t==='bulk')return ['dep','واریزی','plus','var(--ok)'];
  if(t==='del'||t==='clear'||t==='purge')return ['del','حذف','trash','var(--red)'];
  if(t==='edit')return ['edit','ویرایش','edit','var(--gold)'];
  const E=EVT[t];return ['other',E?E[0]:'فعالیت',EVI[t]||'clock',E?E[1]:'var(--mut)']};
const TLF={all:['همه',()=>1],doc:['اسناد',x=>x.type==='cust'],dep:['واریزی‌ها',x=>['add','bulk','edit','del','clear','purge','merge','restore'].includes(x.type)],bank:['بانک',x=>x.type==='src'],todo:['وارد نشده',x=>!tlDone(x)&&!x.undone]};
let tlF='all';
/* v76.6 (خواسته صاحب اپ: «تأیید نمی‌شود و همه با هم تأیید می‌خورد»): تأیید هر فعالیت جدا (نه «تا اینجا»)،
   و به‌جای رکورد تنظیمات (که کاربر بدون دسترسی حساب مشتریان را سرور رد می‌کرد) یک ردیف تاریخچه نوع acc با فهرست شناسه‌ها
   ({of:[...]} تأیید، {un:[...]} برداشتن)؛ تاریخچه برای همه کاربران قابل افزودن است و خودش سابقه «چه کسی کی تأیید کرد» است. */
let TLM={k:'',s:null};
function tlSet0(){const k=audit.length+'|'+(audit[0]&&audit[0].id);if(TLM.k===k&&TLM.s)return TLM.s;const S=new Map(),c=tlChk();
  if(c)for(const x of audit)if(x.type!=='acc'&&x.ts&&x.ts<=c.ts)S.set(String(x.id),{by:c.by,ts:c.at||c.ts});
  audit.filter(x=>x.type==='acc').sort((a,b)=>String(a.ts).localeCompare(String(b.ts))).forEach(a=>{(a.of||[]).forEach(id=>S.set(String(id),{by:a.user,ts:a.ts}));(a.un||[]).forEach(id=>S.delete(String(id)))});
  TLM={k,s:S};return S}
const tlChk=()=>{const r=cfgRec();return (r&&r.accChk)||null};
const tlDone=x=>tlSet0().has(String(x.id));
const tlTodo=()=>audit.filter(x=>x.ts&&x.type!=='acc'&&!x.undone&&!tlDone(x)).length;
function tlHead(){const c=tlChk(),n=tlTodo();
  return `<div class="tlhd ${n?'w':'ok'}"><span class="tlhi">${ic(n?'clock':'check')}</span><span class="tx"><b>${n?fmt(n)+' فعالیت هنوز وارد سیستم حسابداری نشده':'همه فعالیت‌ها وارد سیستم حسابداری شده'}</b><small>${(()=>{const a=audit.find(z=>z.type==='acc'&&(z.of||[]).length);return a?'آخرین تأیید: '+esc(relDay(isoOfTs(a.ts)))+' ساعت '+hm(a.ts)+' · '+esc(a.user||''):c?'آخرین تأیید: '+esc(c.by||''):'روی دایره کنار هر فعالیت بزنید تا تأیید شود'})()}</small></span>${n?`<button class="tlall" data-act="tlChkAll">${ic('check')}<span>تأیید همه</span></button>`:''}</div>
  <div class="tlnt">${tlNtBtn()}</div>`}
/* v76.7 (خواسته صاحب اپ): ردیف‌ها مثل فهرست واریزی‌ها (.brw با قاب وضعیت: زرد = وارد نشده، سبز = وارد شد)،
   کشیدن ردیف = «وارد شد» / «لغو تأیید» و «سند»؛ زدن = خود سند (یا واریزی / سند بانکی)، وگرنه برگه‌ای به شکل سند با همه جزئیات */
const tlNum=x=>{const m=toEn(String(x.summary||'')).match(/(\d{3,7})/);return m?+m[1]:null};
function tlFind(x){if(x.cu!=null&&x.tx!=null){const c=custs.find(z=>String(z.id)===String(x.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(x.tx));if(t&&!t.del)return {k:'inv',cu:c.id,tx:t.id}}
  const id=(x.ids||[])[0];if(id!=null&&entries.some(z=>z.id===id))return {k:'ent',id};
  /* فعالیت‌های قدیمی «افزودن رسید» بدون شناسه: واریزی هم‌نام که رسید دارد (تازه‌ترین) */
  if(/رسید/.test(String(x.summary||''))){const nm=String(x.detail||'').split(' | ')[0].replace(/\s*\(از .*\)$/,'').trim();if(nm){const E=validated().filter(e=>fullName(e)===nm&&famOf(e).some(r=>rcOfEnt(r).length)).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));if(E.length)return {k:'ent',id:famRoot(E[0])}}}
  const n=tlNum(x);if(n!=null){if(x.type==='cust')for(const c of custs)for(const t of c.txs||[])if(t.type==='inv'&&!t.del&&+t.no===n)return {k:'inv',cu:c.id,tx:t.id};
    if(x.type==='src')for(const s of sources)for(const l of s.led||[])if(!l.del&&+l.no===n)return {k:'bank',sid:s.id,l:l.id}}
  return null}
const tlAmt=x=>{const m=String(x.detail||'').match(/(?:جمع|مبلغ)\s*([\d,۰-۹٬]+)/)||String(x.detail||'').match(/([\d,۰-۹٬]{5,})\s*تومان/);return m?+toEn(m[1]).replace(/\D/g,''):0};
function tlRow(x){if(!x.ts)return evHTML(x);const[k,lab,ico,col]=TLK(x),dn=tlDone(x),A=evActs(x),parts=String(x.detail||'').split(' | ').filter(Boolean),am=tlAmt(x),st=x.undone?'':dn?'ok':'pend';
  const inner=`<div class="brw tlbr ${st}" style="--kc:${col}"><button class="brh" data-act="tlOpen" data-ev="${x.id}"><span class="bri tlki">${ic(dn?'check':ico)}</span><span class="tx"><b>${esc(x.summary||lab)}</b><small><em class="tlkb">${lab}</em>${esc(x.user||'')}${parts[0]?' · '+esc(parts[0]):''}</small></span><span class="brv">${am?`<b>${fmt(am)} <i>تومان</i></b>`:`<b class="tltm">${hm(x.ts)}</b>`}<small>${am?hm(x.ts)+' · ':''}${x.undone?'لغو شد':dn?'وارد شد':'وارد نشده'}</small></span></button></div>`;
  const R=[...(x.undone?[]:dn?[['tlUn','لغو تأیید','undo','#6b7385']]:[['tlChk','وارد شد','check','#178049']]),...A.R.filter(a=>canAct(a[0]))],L=[['tlOpen','سند','inv','#3b6fd6'],...A.L.filter(a=>canAct(a[0]))];
  return swW(inner,{r:R,l:L,data:{ev:x.id}})}
/* برگه سند برای فعالیتی که سند جدا ندارد (یا دکمه «جزئیات») */
/* v76.8 (خواسته صاحب اپ: «شبیه جزئیات واریزی»): همان قطعه‌های صفحه جزئیات واریزی — سرتیتر وسط‌چین با دایره، نام و زیرعنوان،
   کادر بزرگ مبلغ (erem)، برچسب وضعیت (est)، بخش‌های عنوان‌دار با ردیف‌های برچسب/مقدار (kvh/kvs/kv) */
function tlDocHTML(x){TLTOP=false;const[k,lab,ico,col]=TLK(x),dn=tlDone(x),D=isoOfTs(x.ts),parts=String(x.detail||'').split(' | ').filter(Boolean),f=tlFind(x),am=tlAmt(x)||(f&&f.k==='ent'?(e=>e?famOf(e).reduce((a,r)=>a+(+r.amount||0),0)+(e.settles||[]).reduce((a,z)=>a+(+z.amount||0),0):0)(validated().find(r=>r.id===f.id)):0),n=tlNum(x),by=dn&&(tlSet0().get(String(x.id))||{}),st=x.undone?'fail':dn?'ok':'pend';
  const kv=(l,v)=>`<div class="kv"><small>${l}</small><b>${v}</b><span class="ksp"></span></div>`,cust=parts[0]||'';
  const rows1=[n?kv('شماره سند',toFa(n)):'',kv('نوع',esc(lab)),cust?kv(x.type==='cust'?'مشتری':'طرف حساب',esc(cust)):''].join('');
  const rows2=parts.slice(cust?1:0).map((p,i)=>{const m=p.match(/^([^:：]{2,24})[:：]\s*(.+)$/);return m?kv(esc(m[1]),esc(m[2])):kv(toFa(i+1),esc(p))}).join('');
  const rows3=[kv('انجام‌دهنده',esc(x.user||'—')),kv('تاریخ',esc(relDay(D)+'، '+dates(D).fa)),kv('ساعت',hm(x.ts)),kv('حسابداری',dn?'<span class="tlg2">وارد شد'+(by&&by.by?' · '+esc(by.by):'')+'</span>':'<span class="tlw2">وارد نشده</span>')].join('');
  return `<div class="sh-h"><div><b>جزئیات فعالیت</b><small class="shsub">${esc(lab)}${n?' · '+toFa(n):''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="tldoc2" style="--kc:${col}"><div class="ehead"><div class="eav tlav">${ic(ico)}</div><b class="enm">${esc(x.summary||lab)}</b><small class="enms">${esc(x.user||'')} · ${esc(relDay(D))} ساعت ${hm(x.ts)}</small>
  ${am?`<div class="erem"><small>مبلغ</small><b><span>${fmt(am)}</span><i>تومان</i></b></div>`:''}<span class="est ${st}">${x.undone?'لغو شد':dn?'وارد سیستم حسابداری شد':'هنوز وارد سیستم حسابداری نشده'}</span></div>
  ${(()=>{/* v77.7: فعالیت رسید = عکس‌ها بالای پنجره، زیر سرتیتر */const rc=/رسید/.test(String(x.summary||'')),K=x.imgs&&x.imgs.length?x.imgs:rc&&f&&f.k==='ent'?[...new Set(famOf(validated().find(r=>r.id===f.id)||{id:f.id}).flatMap(r=>rcOfEnt(r).map(o=>o.key)))]:[];TLTOP=!!K.length;return K.length?tlPhH(K,x.summary||'رسید').replace('رسیدها و عکس‌ها',x.imgs&&x.imgs.length?'عکس‌های همین رسید':'رسیدهای این واریزی'):''})()}${tlFull(f)}<div class="kvh">سند</div><div class="kvs">${rows1}</div>${rows2?`<div class="kvh">جزئیات</div><div class="kvs">${rows2}</div>`:''}${x.type==='edit'&&x.before&&x.after?`<div class="kvh">تغییرها</div>${diffHTML(x.before,x.after)}`:''}<div class="kvh">ثبت</div><div class="kvs">${rows3}</div></div>
  <div class="tlda">${f?`<button class="xgo" data-act="tlGo" data-ev="${x.id}">${ic(f.k==='ent'?'eye':'inv')} ${f.k==='ent'?'دیدن واریزی':'دیدن سند کامل'}</button>`:''}${x.undone?'':dn?`<button class="btn sec" data-act="tlUn" data-ev="${x.id}">${ic('undo')} لغو تأیید</button>`:`<button class="btn tlok2" data-act="tlChk" data-ev="${x.id}">${ic('check')} وارد سیستم شد</button>`}</div>`}
/* v76.9 (خواسته صاحب اپ: «همه چیز را در پنجره جزئیات می‌خواهم»): زدن ردیف همیشه همین پنجره را باز می‌کند و اگر سند/واریزی پیدا شود
   همه آن داخلش می‌آید: مشخصات مشتری، تاریخ و مظنه، همه ردیف‌های سند (کالا، طلا، سکه، حواله، نقد…) با جزئیات بازشونده،
   همه عکس‌ها و رسیدها (زدن = بزرگ)، و دکمه «فاکتور · چاپ». برای واریزی: مشخصات بانکی، مبلغ، وضعیت و رسیدهای واریز. */
function tlPhH(K,name){K=[...new Set((K||[]).filter(Boolean))];if(!K.length)return '';return `<div class="kvh">رسیدها و عکس‌ها · ${toFa(K.length)}</div><div class="tlphs">${K.map((k,i)=>`<button type="button" class="tlph" data-act="rowPhS" data-ks="${esc(K.slice(i).concat(K.slice(0,i)).join(','))}" data-n="${esc(name)}"><img data-ik="${esc(k)}" alt=""></button>`).join('')}</div>`}
let TLTOP=false;
function tlFull(f){if(!f)return '';const kv=(l,v)=>v?`<div class="kv"><small>${l}</small><b>${v}</b><span class="ksp"></span></div>`:'';
  /* v77.6: همه رسیدهای واریز یک واریزی و همه بخش‌هایش (بانکی + تسویه‌ها) */
  const depK=e=>e?[...new Set(famOf(e).flatMap(r=>rcOfEnt(r).map(o=>o.key)))]:[];
  if(f.k==='inv'){const c=custs.find(z=>String(z.id)===String(f.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(f.tx));if(!t)return '';const b=cuBal(c),bl=[b.R?fmt(Math.abs(b.R))+' تومان '+(b.R>0?'بدهکاریم':'طلبکاریم'):'',b.G?wFmt(Math.abs(b.G))+' گرم '+(b.G>0?'بدهکاریم':'طلبکاریم'):''].filter(Boolean).join(' · ');
    const K=[...(t.items||[]).flatMap(xrPh),...(t.xr||[]).flatMap(xrPh),...(t.pays||[]).flatMap(xrPh),...(t.pays||[]).filter(p=>p.entId!=null).flatMap(p=>depK(validated().find(r=>String(r.id)===String(p.entId))||entries.find(r=>String(r.id)===String(p.entId)))),...entries.filter(e=>e.wd&&String(e.wd.cu)===String(c.id)&&+e.wd.no===+t.no).flatMap(e=>depK(validated().find(r=>r.id===e.id)||e))];
    return `<div class="kvh">مشتری</div><div class="kvs">${kv('نام',(c.cno?cuNoH(c):'')+esc(cuName(c)))}${kv('تلفن',c.phone?'<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>':'')}${kv('گروه',esc(c.grp||''))}${kv('مانده الان',bl||'تسویه')}</div>
    <div class="kvh">${esc(invTitle(t))}</div>${ivMeta(t)}<div class="tlinv">${ivDet(c,t)}</div>${tlPhH(K,invTitle(t))}
    <button type="button" class="btn sec tlprn" data-act="tlPrn" data-cu="${esc(c.id)}" data-tx="${esc(t.id)}">${ic('print')} فاکتور · چاپ / PDF</button>`}
  if(f.k==='ent'){const e=entries.find(z=>z.id===f.id);if(!e)return '';const K=depK(validated().find(r=>r.id===e.id)||e),t=entSt(e);
    return `<div class="kvh">واریزی</div><div class="kvs">${kv('مشتری',esc(fullName(e)||'—'))}${kv('صاحب حساب',e.holder&&e.holder!==e.name?esc(e.holder):'')}${kv('مبلغ واریز',fmt(e.amount)+' تومان')}${e.total&&+e.total!==+e.amount?kv('کل خرید',fmt(e.total)+' تومان'):''}${kv('بانک',esc(ibanBank(e.iban)||e.bank||''))}${kv('شبا',e.iban?'<bdi dir="ltr">'+esc(e.iban)+'</bdi>':'')}${kv('تاریخ واریز',e.payDate?esc(payLab(e.payDate)+'، '+dates(e.payDate).fa):'')}${kv('فاکتور',e.code?esc(toEn(e.code)):'')}${kv('وضعیت',t?esc(t[0]):'ثبت شده')}${kv('ثبت‌کننده',esc(e.createdBy||''))}</div>${TLTOP?'':tlPhH(K,fullName(e)||'رسید')}`}
  return ''}
ACT.tlPrn=d=>{invV={cu:d.cu,tx:+d.tx||d.tx,fresh:false};custId=d.cu;ACT.invPrint()};
ACT.tlOpen=d=>{const x=audit.find(a=>String(a.id)===String(d.ev));if(!x)return;const f=tlFind(x);if(f&&f.k==='bank'){tlGoF(f);return}sheet(tlDocHTML(x));phPaint($('sheet'))};
function tlGoF(f){closeSheet();if(f.k==='inv'){invOpen(f.cu,f.tx);PARENT.inv='audit'}else if(f.k==='ent'){ACT.openEnt({id:f.id});PARENT.ent='audit'}else if(f.k==='bank'){const s=sources.find(z=>String(z.id)===String(f.sid)),l=s&&(s.led||[]).find(z=>String(z.id)===String(f.l));if(s&&l)sheet(bdViewHTML(s,l))}}
ACT.tlGo=d=>{const x=audit.find(a=>String(a.id)===String(d.ev)),f=x&&tlFind(x);if(f)tlGoF(f)};
function tlAcc(of,un){const n=(of||[]).length+(un||[]).length;if(!n)return;logA('acc',of&&of.length?'تأیید ورود به سیستم حسابداری':'برداشتن تأیید ورود',toFa(n)+' فعالیت',of&&of.length?{of}:{un});TLM.k='';
  if(!$('ov').classList.contains('hide')&&$('sheet').querySelector('.tldoc2')){const x=audit.find(a=>String(a.id)===String((of||un)[0]));if(x&&(of||un).length===1)sheetKeep(tlDocHTML(x));else closeSheet()}
  const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;
  if(!RM()&&of)of.slice(0,20).forEach(id=>{const b=document.querySelector(`.swr [data-ev="${id}"] .bri`)||document.querySelector(`[data-act=tlOpen][data-ev="${id}"] .bri`);if(b&&b.animate)b.animate([{transform:'scale(.4)'},{transform:'scale(1.2)'},{transform:'none'}],{duration:360,easing:'cubic-bezier(.3,1.4,.5,1)'})})}
ACT.tlChk=d=>{const x=audit.find(a=>String(a.id)===String(d.ev));if(!x||tlDone(x))return;tlAcc([x.id]);toast('«'+(x.summary||'فعالیت')+'» وارد سیستم شد ✓')};
ACT.tlUn=d=>{const x=audit.find(a=>String(a.id)===String(d.ev));if(!x||!tlDone(x))return;tlAcc(null,[x.id]);toast('تأیید برداشته شد')};
ACT.tlChkAll=()=>{const L=audit.filter(x=>x.ts&&x.type!=='acc'&&!x.undone&&!tlDone(x));if(!L.length)return;askConfirm(toFa(L.length)+' فعالیتِ واردنشده همه «وارد سیستم حسابداری شد» علامت بخورند؟','تأیید همه',()=>{tlAcc(L.map(x=>x.id));toast(toFa(L.length)+' فعالیت تأیید شد ✓')})};
ACT.tlF=d=>{tlF=d.f;histOpen=new Set();const v=$('view');render();if(v)v.scrollTop=0};
/* ---- اعلان فعالیت تازه همکاران ---- */
const tlNtOk=()=>typeof Notification!=='undefined'&&Notification.permission==='granted';
const tlNtBtn=()=>typeof Notification==='undefined'?'':tlNtOk()?`<span class="tlnb on">${ic('check')} اعلان روی گوشی روشن است</span>`:`<button class="tlnb" data-act="tlNtOn">${ic('bell')} روشن کردن اعلان روی گوشی</button>`;
ACT.tlNtOn=async()=>{try{const p=await Notification.requestPermission();toast(p==='granted'?'اعلان روشن شد ✓':'اجازه اعلان داده نشد',p!=='granted');render()}catch(e){toast('این مرورگر اعلان را پشتیبانی نمی‌کند',true)}};
function tlNotify(L){L=L.filter(x=>x&&x.ts&&x.type!=='acc'&&x.user!==who());if(!L.length)return;const x=L[0],[,lab,ico,col]=TLK(x),title=L.length>1?toFa(L.length)+' فعالیت تازه':(x.summary||lab),body=L.length>1?L.slice(0,3).map(z=>z.summary).join('، '):(x.user||'')+(x.detail?' · '+String(x.detail).split(' | ')[0]:'');
  let B=$('tlbn');if(B)B.remove();B=document.createElement('button');B.id='tlbn';B.className='tlbn';B.style.setProperty('--c',col);B.innerHTML=`<span class="tld">${ic(ico)}</span><span class="tx"><b>${esc(title)}</b><small>${esc(body)}</small></span><em>${hm(x.ts)}</em>`;
  B.onclick=()=>{if(B._sw)return;B.remove();if(cur!=='audit'){histTab='ev';go('audit')}};document.body.appendChild(B);
  /* v77.5 (خواسته صاحب اپ): اعلان با کشیدن به بالا، چپ یا راست کنار می‌رود */
  {let g=null;B.addEventListener('touchstart',e=>{const t=e.touches[0];g={x:t.clientX,y:t.clientY,dx:0,dy:0};B.style.transition='none'},{passive:true});
   B.addEventListener('touchmove',e=>{if(!g)return;const t=e.touches[0];g.dx=t.clientX-g.x;g.dy=Math.min(0,t.clientY-g.y);if(Math.abs(g.dx)>6||g.dy<-6){B._sw=1;if(e.cancelable)e.preventDefault()}
     const h=Math.abs(g.dx)>-g.dy;B.style.transform=h?`translate(calc(-50% + ${g.dx}px),0)`:`translate(-50%,${g.dy}px)`;B.style.opacity=String(1-Math.min(.8,(h?Math.abs(g.dx)/220:-g.dy/120)))},{passive:false});
   B.addEventListener('touchend',()=>{if(!g)return;const z=g;g=null;const h=Math.abs(z.dx)>-z.dy,far=h?Math.abs(z.dx)>70:z.dy<-30;
     B.style.transition='transform .26s cubic-bezier(.2,.9,.3,1),opacity .26s ease';
     if(far){clearTimeout(tlNotify.t);B.style.transform=h?`translate(calc(-50% + ${z.dx>0?'110vw':'-110vw'}),0)`:'translate(-50%,-160%)';B.style.opacity='0';setTimeout(()=>B.remove(),270)}
     else{B.style.transform='translate(-50%,0)';B.style.opacity='1';setTimeout(()=>{B._sw=0},50)}},{passive:true})}
  if(!RM()&&B.animate)B.animate([{transform:'translate(-50%,-140%)',opacity:0},{transform:'translate(-50%,0)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,1.25,.4,1)',fill:'backwards'});
  clearTimeout(tlNotify.t);tlNotify.t=setTimeout(()=>{if(!B.isConnected)return;if(RM()||!B.animate){B.remove();return}B.animate([{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,-140%)',opacity:0}],{duration:300,easing:'ease-in',fill:'forwards'}).onfinish=()=>B.remove()},6000);
  try{if('vibrate' in navigator)navigator.vibrate(30)}catch(e){}
  if(tlNtOk()&&document.visibilityState!=='visible'){const o={body,tag:'motalla-'+x.id,icon:'icon-192.png'};(navigator.serviceWorker&&navigator.serviceWorker.ready?navigator.serviceWorker.ready.then(r=>r.showNotification(title,o)):Promise.reject()).catch(()=>{try{new Notification(title,o)}catch(e){}})}}
