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
function tlRow(x){if(!x.ts)return evHTML(x);const[k,lab,ico,col]=TLK(x),op=histOpen.has(String(x.id)),dn=tlDone(x),A=evActs(x),acts=[...A.R,...A.L].filter(a=>canAct(a[0]));
  const parts=String(x.detail||'').split(' | ').filter(Boolean),D=isoOfTs(x.ts),cu=x.cu!=null&&custs.find(z=>String(z.id)===String(x.cu)),e=(x.ids||[]).length&&entries.find(z=>z.id===x.ids[0]);
  const links=[cu&&x.tx!=null?`<button class="sm sec" data-act="cuInv" data-cu="${esc(x.cu)}" data-tx="${esc(x.tx)}">${ic('inv')} دیدن سند</button>`:'',e?`<button class="sm sec" data-act="showEnt" data-ev="${x.id}">${ic('eye')} دیدن واریزی</button>`:''].join('');
  const inner=`<div class="tlr k-${k}${op?' open':''}${x.undone?' undone':''}${dn?' dn':''}" style="--c:${col}"><span class="tld">${ic(dn?'check':ico)}</span>
  <div class="tlc"><button class="hh tlh" data-act="evTog" data-ev="${x.id}" aria-expanded="${op}"><span class="tx"><span class="tlt"><em>${lab}</em>${dn?'<i class="tlok">وارد شد</i>':''}${x.undone?'<i class="tlun">لغو شد</i>':''}</span><b>${esc(x.summary||lab)}</b><small><span class="tlu">${esc(userInit(x.user||'؟'))}</span>${esc(x.user||'')}${parts[0]?' · '+esc(parts[0]):''}</small></span><span class="hm"><b>${hm(x.ts)}</b></span>${chevI()}</button><button type="button" class="tlcb${dn?' on':''}" data-act="${dn?'tlUn':'tlChk'}" data-ev="${x.id}" aria-label="${dn?'برداشتن تأیید':'وارد سیستم شد'}" title="${dn?'تأیید شده توسط '+esc((tlSet0().get(String(x.id))||{}).by||''):'تأیید ورود به سیستم'}">${ic('check')}</button>
  <div class="hb"><div class="tldl">${parts.map(p=>`<div>${esc(p)}</div>`).join('')}</div>${x.type==='edit'?diffHTML(x.before,x.after):''}
  <div class="hmeta"><div><small>زمان</small><b>${esc(relDay(D)+'، '+dates(D).fa+' · ساعت '+hm(x.ts))}</b></div><div><small>انجام‌دهنده</small><b>${esc(x.user||'—')}</b></div></div>
  <div class="hact">${links}${acts.map(a=>`<button class="sm ${a[0]==='undoEv'?'gold':'sec'}" data-act="${a[0]}" data-ev="${x.id}">${ic(a[2])} ${a[1]}</button>`).join('')}${dn?`<button class="sm sec" data-act="tlUn" data-ev="${x.id}">${ic('undo')} برداشتن تأیید</button>`:`<button class="sm tlck" data-act="tlChk" data-ev="${x.id}">${ic('check')} وارد سیستم شد</button>`}</div></div></div></div>`;
  return (A.R.length||A.L.length)?swW(inner,{r:A.R,l:A.L,data:{ev:x.id}}):inner}
function tlAcc(of,un){const n=(of||[]).length+(un||[]).length;if(!n)return;logA('acc',of&&of.length?'تأیید ورود به سیستم حسابداری':'برداشتن تأیید ورود',toFa(n)+' فعالیت',of&&of.length?{of}:{un});TLM.k='';
  const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;
  if(!RM()&&of)of.slice(0,20).forEach(id=>{const b=document.querySelector(`.tlcb[data-ev="${id}"]`);if(b&&b.animate)b.animate([{transform:'scale(.4)'},{transform:'scale(1.2)'},{transform:'none'}],{duration:360,easing:'cubic-bezier(.3,1.4,.5,1)'})})}
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
  B.onclick=()=>{B.remove();if(cur!=='audit'){histTab='ev';go('audit')}};document.body.appendChild(B);
  if(!RM()&&B.animate)B.animate([{transform:'translate(-50%,-140%)',opacity:0},{transform:'translate(-50%,0)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,1.25,.4,1)',fill:'backwards'});
  clearTimeout(tlNotify.t);tlNotify.t=setTimeout(()=>{if(!B.isConnected)return;if(RM()||!B.animate){B.remove();return}B.animate([{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,-140%)',opacity:0}],{duration:300,easing:'ease-in',fill:'forwards'}).onfinish=()=>B.remove()},6000);
  try{if('vibrate' in navigator)navigator.vibrate(30)}catch(e){}
  if(tlNtOk()&&document.visibilityState!=='visible'){const o={body,tag:'motalla-'+x.id,icon:'icon-192.png'};(navigator.serviceWorker&&navigator.serviceWorker.ready?navigator.serviceWorker.ready.then(r=>r.showNotification(title,o)):Promise.reject()).catch(()=>{try{new Notification(title,o)}catch(e){}})}}
