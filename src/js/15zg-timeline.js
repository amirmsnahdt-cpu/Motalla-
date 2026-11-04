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
const TLF={all:['همه',()=>1],doc:['اسناد',x=>x.type==='cust'],dep:['واریزی‌ها',x=>['add','bulk','edit','del','clear','purge','merge','restore'].includes(x.type)],bank:['بانک',x=>x.type==='src'],todo:['وارد نشده',x=>!tlDone(x)]};
let tlF='all';
const tlChk=()=>{const r=cfgRec();return (r&&r.accChk)||null};
const tlDone=x=>{const c=tlChk();return !!(c&&x.ts&&x.ts<=c.ts)};
const tlTodo=()=>{const c=tlChk();return audit.filter(x=>x.ts&&!x.undone&&(!c||x.ts>c.ts)).length};
function tlHead(){const c=tlChk(),n=tlTodo();
  return `<div class="tlhd ${n?'w':'ok'}"><span class="tlhi">${ic(n?'clock':'check')}</span><span class="tx"><b>${n?fmt(n)+' فعالیت هنوز وارد سیستم حسابداری نشده':'همه فعالیت‌ها وارد سیستم حسابداری شده'}</b><small>${c?'آخرین تأیید: تا '+esc(relDay(isoOfTs(c.ts)))+' ساعت '+hm(c.ts)+' · '+esc(c.by||''):'هنوز تأییدی زده نشده'}</small></span>${n?`<button class="tlall" data-act="tlChkAll">${ic('check')}<span>تأیید همه</span></button>`:''}</div>
  <div class="tlnt">${tlNtBtn()}</div>`}
function tlRow(x){if(!x.ts)return evHTML(x);const[k,lab,ico,col]=TLK(x),op=histOpen.has(String(x.id)),dn=tlDone(x),A=evActs(x),acts=[...A.R,...A.L].filter(a=>canAct(a[0]));
  const parts=String(x.detail||'').split(' | ').filter(Boolean),D=isoOfTs(x.ts),cu=x.cu!=null&&custs.find(z=>String(z.id)===String(x.cu)),e=(x.ids||[]).length&&entries.find(z=>z.id===x.ids[0]);
  const links=[cu&&x.tx!=null?`<button class="sm sec" data-act="cuInv" data-cu="${esc(x.cu)}" data-tx="${esc(x.tx)}">${ic('inv')} دیدن سند</button>`:'',e?`<button class="sm sec" data-act="showEnt" data-ev="${x.id}">${ic('eye')} دیدن واریزی</button>`:''].join('');
  const inner=`<div class="tlr k-${k}${op?' open':''}${x.undone?' undone':''}${dn?' dn':''}" style="--c:${col}"><span class="tld">${ic(dn?'check':ico)}</span>
  <div class="tlc"><button class="hh tlh" data-act="evTog" data-ev="${x.id}" aria-expanded="${op}"><span class="tx"><span class="tlt"><em>${lab}</em>${dn?'<i class="tlok">وارد شد</i>':''}${x.undone?'<i class="tlun">لغو شد</i>':''}</span><b>${esc(x.summary||lab)}</b><small><span class="tlu">${esc(userInit(x.user||'؟'))}</span>${esc(x.user||'')}${parts[0]?' · '+esc(parts[0]):''}</small></span><span class="hm"><b>${hm(x.ts)}</b></span>${chevI()}</button>
  <div class="hb"><div class="tldl">${parts.map(p=>`<div>${esc(p)}</div>`).join('')}</div>${x.type==='edit'?diffHTML(x.before,x.after):''}
  <div class="hmeta"><div><small>زمان</small><b>${esc(relDay(D)+'، '+dates(D).fa+' · ساعت '+hm(x.ts))}</b></div><div><small>انجام‌دهنده</small><b>${esc(x.user||'—')}</b></div></div>
  <div class="hact">${links}${acts.map(a=>`<button class="sm ${a[0]==='undoEv'?'gold':'sec'}" data-act="${a[0]}" data-ev="${x.id}">${ic(a[2])} ${a[1]}</button>`).join('')}${dn?'':`<button class="sm tlck" data-act="tlChk" data-ev="${x.id}">${ic('check')} تا اینجا وارد سیستم شد</button>`}</div></div></div></div>`;
  return (A.R.length||A.L.length)?swW(inner,{r:A.R,l:A.L,data:{ev:x.id}}):inner}
function tlSet(ts){const r=cfgRec(1),c=tlChk();if(c&&c.ts>=ts&&ts!==c.ts){}r.accChk={ts,by:who(),at:new Date().toISOString()};r.updatedAt=r.accChk.at;saveCu();const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;
  if(!RM())document.querySelectorAll('.tlr.dn .tld').forEach((d,i)=>i<12&&d.animate&&d.animate([{transform:'scale(.5)'},{transform:'scale(1.15)'},{transform:'none'}],{duration:380,delay:i*25,easing:'cubic-bezier(.3,1.4,.5,1)'}))}
ACT.tlChk=d=>{const x=audit.find(a=>String(a.id)===String(d.ev));if(!x||!x.ts)return;tlSet(x.ts);toast('تا ساعت '+hm(x.ts)+' به‌عنوان «وارد سیستم شد» علامت خورد ✓')};
ACT.tlChkAll=()=>{const L=audit.filter(x=>x.ts);if(!L.length)return;const ts=L.reduce((m,x)=>x.ts>m?x.ts:m,'');askConfirm('همه فعالیت‌ها تا همین الان «وارد سیستم حسابداری شد» علامت بخورند؟','تأیید همه',()=>{tlSet(ts);toast('همه فعالیت‌ها تأیید شد ✓')})};
ACT.tlF=d=>{tlF=d.f;histOpen=new Set();const v=$('view');render();if(v)v.scrollTop=0};
/* ---- اعلان فعالیت تازه همکاران ---- */
const tlNtOk=()=>typeof Notification!=='undefined'&&Notification.permission==='granted';
const tlNtBtn=()=>typeof Notification==='undefined'?'':tlNtOk()?`<span class="tlnb on">${ic('check')} اعلان روی گوشی روشن است</span>`:`<button class="tlnb" data-act="tlNtOn">${ic('bell')} روشن کردن اعلان روی گوشی</button>`;
ACT.tlNtOn=async()=>{try{const p=await Notification.requestPermission();toast(p==='granted'?'اعلان روشن شد ✓':'اجازه اعلان داده نشد',p!=='granted');render()}catch(e){toast('این مرورگر اعلان را پشتیبانی نمی‌کند',true)}};
function tlNotify(L){L=L.filter(x=>x&&x.ts&&x.user!==who());if(!L.length)return;const x=L[0],[,lab,ico,col]=TLK(x),title=L.length>1?toFa(L.length)+' فعالیت تازه':(x.summary||lab),body=L.length>1?L.slice(0,3).map(z=>z.summary).join('، '):(x.user||'')+(x.detail?' · '+String(x.detail).split(' | ')[0]:'');
  let B=$('tlbn');if(B)B.remove();B=document.createElement('button');B.id='tlbn';B.className='tlbn';B.style.setProperty('--c',col);B.innerHTML=`<span class="tld">${ic(ico)}</span><span class="tx"><b>${esc(title)}</b><small>${esc(body)}</small></span><em>${hm(x.ts)}</em>`;
  B.onclick=()=>{B.remove();if(cur!=='audit'){histTab='ev';go('audit')}};document.body.appendChild(B);
  if(!RM()&&B.animate)B.animate([{transform:'translate(-50%,-140%)',opacity:0},{transform:'translate(-50%,0)',opacity:1}],{duration:520,easing:'cubic-bezier(.2,1.25,.4,1)',fill:'backwards'});
  clearTimeout(tlNotify.t);tlNotify.t=setTimeout(()=>{if(!B.isConnected)return;if(RM()||!B.animate){B.remove();return}B.animate([{transform:'translate(-50%,0)',opacity:1},{transform:'translate(-50%,-140%)',opacity:0}],{duration:300,easing:'ease-in',fill:'forwards'}).onfinish=()=>B.remove()},6000);
  try{if('vibrate' in navigator)navigator.vibrate(30)}catch(e){}
  if(tlNtOk()&&document.visibilityState!=='visible'){const o={body,tag:'motalla-'+x.id,icon:'icon-192.png'};(navigator.serviceWorker&&navigator.serviceWorker.ready?navigator.serviceWorker.ready.then(r=>r.showNotification(title,o)):Promise.reject()).catch(()=>{try{new Notification(title,o)}catch(e){}})}}
