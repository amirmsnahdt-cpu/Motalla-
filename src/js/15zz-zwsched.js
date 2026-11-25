/* ---- v106.2 «زمان‌بندی واریزی‌های سند» (خواسته صاحب اپ: «۴۱۸ برای فردا و ۱۰۰ برای امروز؛ وقتی ۱۰۰ را حذف کردم باید خودکار برود برای فردا؛
   مبالغ و تاریخ‌ها را جدا جدا درست نکنم، اتوماتیک ادیت شود؛ تخصیص را با کشیدن ردیف هم از سند و هم از لیست واریز حذف کنم»).
   همه واریزی‌های در راه یک سند در یک پنجره: هر ردیف = روز واریز + مبلغ. جمع ثابت می‌ماند: مبلغ یک ردیف که عوض شود، اختلاف از ردیف دیگر
   (آخرین روز) کم/زیاد می‌شود؛ حذف یک روز = مبلغش به روز دیگر اضافه می‌شود؛ «روز دیگر» = واریزی تازه با همان مشخصات برای روز دیگر.
   بخش ارسال‌شده به بانک و تسویه‌های در انتظار قفل‌اند (کف مبلغ، روزِ قفل). */
let WS=null;
const wsLock=e=>{const S=wdState(e),P=wdParts(e,S);return P.reduce((a,q)=>a+(q.t==='s'||(q.ent!=null&&(entries.find(z=>z.id===q.ent)||{}).sentBid!=null)?q.a:0),0)};
const wsDLock=e=>wdFam(e).some(z=>z.sentBid!=null)||(e.settles||[]).length>0;
function wsInfo(){if(!WS)return null;const c=custs.find(z=>String(z.id)===String(WS.cu));if(!c)return null;return {c,owe:wdOwe(c)}}
function wsOpen(cu,no){const c=custs.find(z=>String(z.id)===String(cu));if(!c)return;const L=wdPendL(c,no).sort((a,b)=>String(PD(a.e)).localeCompare(String(PD(b.e)))||a.e.id-b.e.id);if(!L.length){toast('این سند واریزی در راه ندارد',true);return}
  const R=L.map(({e,S})=>({id:e.id,d:PD(e),d0:PD(e),a:S.pend,a0:S.pend,lk:wsLock(e),dl:wsDLock(e),x:0,nw:0}));const T0=R.reduce((s,r)=>s+r.a,0);
  WS={cu:c.id,no:String(no),R,T0,oth:Math.max(0,wdPend(c)-T0),tw:0};sheet(wsHTML());wsBind()}
const wsLive=()=>WS.R.filter(r=>!r.x);
const wsTot=()=>wsLive().reduce((s,r)=>s+(+r.a||0),0);
const wsMax=()=>{const I=wsInfo();return I?Math.max(WS.T0,I.owe-WS.oth):WS.T0};
/* ردیفی که اختلاف را می‌گیرد: آخرین روز (غیر از خودش) که جا دارد */
function wsMate(i,need){const L=WS.R.map((r,j)=>({r,j})).filter(o=>o.j!==i&&!o.r.x).sort((a,b)=>String(b.r.d).localeCompare(String(a.r.d))||b.j-a.j);
  for(const o of L){if(need<0||(+o.r.a||0)-o.r.lk>=need)return o.j}return L.length?L[0].j:-1}
function wsShift(i,diff){/* diff = مقداری که ردیف i اضافه گرفت؛ همان از ردیف دیگر کم می‌شود */let left=diff;const tried=new Set();
  while(left&&tried.size<WS.R.length){const j=wsMate(i,left);if(j<0||tried.has(j))break;tried.add(j);const r=WS.R[j],room=left>0?(+r.a||0)-r.lk:Infinity,k=left>0?Math.min(left,room):left;if(!k)continue;r.a=(+r.a||0)-k;left-=k}
  return left}
function wsRow(r,i,n){const lab=payLab(r.d)||'',D=dates(r.d);
  return `<div class="wsr${r.nw?' nw':''}" data-i="${i}"><button type="button" class="wsd${r.dl?' wlk':''}" data-act="wsDate" data-i="${i}"${r.dl?' disabled':''}>${ic('cal')}<span><b>${esc(lab||D.fa)}</b><small>${esc(lab?D.fa:D.wd||'')}</small></span></button>
  <label class="wsa"><input id="wsA${i}" class="ltr" inputmode="numeric" value="${r.a?Number(r.a).toLocaleString('en-US'):''}" placeholder="۰" data-i="${i}" autocomplete="off" enterkeyhint="done" aria-label="مبلغ این روز"><i>تومان</i></label>
  ${n>1&&!r.lk&&!r.dl?`<button type="button" class="wsx" data-act="wsDel" data-i="${i}" aria-label="حذف این روز">${ic('trash')}</button>`:`<span class="wsx0">${r.lk||r.dl?ic('padlock'):''}</span>`}
  ${r.lk||r.dl?`<small class="wsl">${r.lk?fmt(r.lk)+' تومان ارسال‌شده یا تسویه در انتظار است؛ کمتر از این نمی‌شود':'بخشی از این واریزی رفته یا تسویه مشتری دارد؛ روزش عوض نمی‌شود'}</small>`:''}</div>`}
function wsRes(){const T=wsTot(),M=wsMax(),d=T-WS.T0,bad=wsLive().find(r=>(+r.a||0)<r.lk);
  if(bad)return `<div class="bf3d r"><span class="bf3di">${ic('x')}</span><span class="tx"><b>کمتر از بخش ارسال‌شده</b><small>روز ${esc(payLab(bad.d)||dates(bad.d).fa)} حداقل ${fmt(bad.lk)} تومان</small></span></div>`;
  if(T>M)return `<div class="bf3d r"><span class="bf3di">${ic('x')}</span><span class="tx"><b>بیشتر از بدهی ما</b><small>حداکثر ${fmt(M)} تومان برای این سند</small></span></div>`;
  if(!d)return `<div class="bf3d ok"><span class="bf3di">${ic('check')}</span><span class="tx"><b>جمع واریزی‌ها ${fmt(T)} تومان</b><small>${toFa(wsLive().length)} روز واریز · جمع همان قبلی است</small></span></div>`;
  return `<div class="bf3d ${d>0?'g':'r'}"><span class="bf3di">${ic(d>0?'dIn':'dOut')}</span><span class="tx"><b>جمع واریزی‌ها ${fmt(T)} تومان</b><small>${d>0?'بیشتر از قبل · از بدهی آزاد ما برداشته می‌شود':'کمتر از قبل · '+fmt(-d)+' تومان «نرفته به لیست» می‌ماند'}</small></span><em>${d>0?'+':'−'}${fmt(Math.abs(d))}</em></div>`}
function wsHTML(){const I=wsInfo();if(!I)return '';const L=WS.R.map((r,i)=>({r,i})).filter(o=>!o.r.x),n=L.length;
  return `<div class="sh-h"><div><b>واریزی‌های سند ${toFa(WS.no)}</b><small class="shsub">${esc(cuName(I.c))} · بدهی ما ${fmt(I.owe)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bf3 bf4 wsw"><div class="ckcl">هر روز چقدر واریز شود؟ مبلغ یک روز را که عوض کنید، روز دیگر خودش درست می‌شود.</div>
  <div class="wsl0">${L.map(o=>wsRow(o.r,o.i,n)).join('')}</div>
  <button type="button" class="wsadd" data-act="wsAdd">${ic('plus')}<span>واریز برای روز دیگر</span></button>
  <label class="wst"><span>جمع واریزی‌های این سند</span><input id="wsT" class="ltr" inputmode="numeric" value="${Number(wsTot()).toLocaleString('en-US')}" autocomplete="off" enterkeyhint="done" aria-label="جمع"><i>تومان</i></label>
  <div id="wsR">${wsRes()}</div>
  <button type="button" class="xgo" data-act="wsSave">${ic('check')} ثبت</button></div>`}
function wsPaint(skip){WS.R.forEach((r,i)=>{if(i===skip||r.x)return;const I=$('wsA'+i);if(I)I.value=r.a?Number(r.a).toLocaleString('en-US'):''});const T=$('wsT');if(T&&document.activeElement!==T)T.value=Number(wsTot()).toLocaleString('en-US');const R=$('wsR');if(R)R.innerHTML=wsRes()}
function wsRe(){const s=$('sheet');if(!s||!WS)return;s.innerHTML=wsHTML();wsBind()}
function wsBind(){const s=$('sheet');if(!s||!WS)return;s.querySelectorAll('.wsa input').forEach(I=>{selOnFocus(I);const i=+I.dataset.i;
    I.oninput=()=>{const r=WS.R[i];if(!r)return;const v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';const old=+r.a||0;r.a=v;const left=wsShift(i,v-old);if(left&&left>0){/* بقیه جا نداشت؛ همان‌قدر جمع بالا می‌رود */}wsPaint(i)};
    I.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();I.blur()}}});
  const T=$('wsT');if(T){selOnFocus(T);T.oninput=()=>{const v=num(T.value);T.value=v?v.toLocaleString('en-US'):'';const d=v-wsTot();if(d){const L=wsLive();const last=WS.R.indexOf(L.slice().sort((a,b)=>String(b.d).localeCompare(String(a.d)))[0]);if(last>=0){const r=WS.R[last];r.a=Math.max(r.lk,(+r.a||0)+d)}}wsPaint(-1)};T.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();T.blur()}}}}
ACT.wsDel=d=>{if(!WS)return;const i=+d.i,r=WS.R[i];if(!r||r.lk||r.dl)return;const a=+r.a||0;r.a=0;r.x=1;if(a){/* مبلغش به نزدیک‌ترین روز باقی‌مانده می‌رود */const L=wsLive().sort((p,q)=>Math.abs(new Date(p.d)-new Date(r.d))-Math.abs(new Date(q.d)-new Date(r.d))||String(q.d).localeCompare(String(p.d)));if(L[0])L[0].a=(+L[0].a||0)+a}wsRe()};
ACT.wsAdd=()=>{if(!WS)return;if(!can('edit')&&!can('split')){toast('اجازه این کار را ندارید',true);return}const L=wsLive(),mx=L.map(r=>r.d).sort().pop()||todayISO();WS.R.push({id:null,d:isoAdd(mx>todayISO()?mx:todayISO(),1),d0:'',a:0,a0:0,lk:0,dl:0,x:0,nw:1});wsRe();setTimeout(()=>{const I=$('wsA'+(WS.R.length-1));if(I)I.focus()},60)};
ACT.wsDate=d=>{if(!WS)return;const i=+d.i,r=WS.R[i];if(!r||r.dl)return;const keep=WS;openCal(r.d||todayISO(),iso=>{WS=keep;const t=WS.R[i];if(t&&iso)t.d=iso;sheet(wsHTML());wsBind()})};
/* ثبت: اول کم‌شدن‌ها (و حذف‌ها)، بعد زیاد شدن‌ها، روزها، واریزی‌های تازه */
ACT.wsSave=()=>{const I=wsInfo();if(!I)return;const L=wsLive();L.forEach(r=>{r.a=Math.round(+r.a||0)});
  const bad=L.find(r=>r.a<r.lk);if(bad){toast('روز '+(payLab(bad.d)||dates(bad.d).fa)+' حداقل '+fmt(bad.lk)+' تومان',true);return}
  if(wsTot()>wsMax()){toast('حداکثر '+fmt(wsMax())+' تومان برای این سند',true);return}
  if(!remCan()){toast(REMNO,true);return}
  const now=ns(),by=who(),E=id=>entries.find(z=>z.id===id),log=[];let tpl=null;
  WS.R.forEach(r=>{if(r.id!=null){const e=E(r.id);if(e&&!tpl)tpl=e}});
  /* حذف کامل یک روز یا صفر شدن: کل خانواده ارسال‌نشده به سطل بازیابی */
  const gone=WS.R.filter(r=>r.id!=null&&(r.x||!(r.a>0))&&!r.lk&&!r.dl);
  gone.forEach(r=>{const e=E(r.id);if(!e)return;const ids=wdFam(e).filter(z=>z.sentBid==null).map(z=>z.id);ids.forEach(wdPartRm);trashIds(ids,'ادغام در روز دیگرِ همان سند');log.push('حذف '+(payLab(r.d0)||dates(r.d0).fa)+' '+fmt(r.a0))});
  const keep=WS.R.filter(r=>r.id!=null&&!gone.includes(r));
  keep.filter(r=>r.a<r.a0).forEach(r=>{const e=E(r.id);if(e){wdAdj(e,r.a-r.a0);log.push((payLab(r.d0)||dates(r.d0).fa)+' '+fmt(r.a0)+' ← '+fmt(r.a))}});
  keep.filter(r=>r.a>r.a0).forEach(r=>{const e=E(r.id);if(e){wdAdj(e,r.a-r.a0);log.push((payLab(r.d0)||dates(r.d0).fa)+' '+fmt(r.a0)+' ← '+fmt(r.a))}});
  keep.filter(r=>r.d!==r.d0&&!r.dl).forEach(r=>{const e=E(r.id);if(!e)return;wdFam(e).filter(z=>z.sentBid==null&&(z.id===e.id||!z.payDate||PD(z)===r.d0)).forEach(z=>{z.payDate=r.d;z.updatedAt=now;z.updatedBy=by});log.push('روز '+(payLab(r.d0)||dates(r.d0).fa)+' → '+(payLab(r.d)||dates(r.d).fa))});
  const add=WS.R.filter(r=>r.nw&&!r.x&&r.a>0);
  if(add.length&&!tpl){toast('واریزی پایه پیدا نشد',true);return}
  add.forEach(r=>{const t=tpl,ne={id:nid++,name:t.name,title:t.title||'',phone:t.phone||'',nid:t.nid||'',code:t.code||String(WS.no),weight:'',amount:r.a,ppg:'',items:[],iban:t.iban||'',card:t.card||'',bank:t.bank||'',holder:t.holder||'',payDate:r.d,kind:t.kind||'buy',settles:[],wd:{cu:t.wd.cu,no:t.wd.no,amt:r.a},entryDate:todayISO(),createdBy:by,updatedBy:by,updatedAt:now};
    entries.push(ne);log.push('روز تازه '+(payLab(r.d)||dates(r.d).fa)+' '+fmt(r.a))});
  memoClear();alloc=null;saveE();saveD();
  if(log.length)logA('split','زمان‌بندی واریزی‌های سند',cuName(I.c)+' | سند '+toFa(WS.no)+' | '+log.join(' · '),{ids:WS.R.map(r=>r.id).filter(x=>x!=null),cu:I.c.id});
  WS=null;closeSheet();const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;toast(log.length?'واریزی‌های سند به‌روز شد':'تغییری نبود')};
/* حذف یک واریزی سند (کشیدن ردیف در سند یا لیست واریز): مبلغش به واریزی دیگرِ همان سند (نزدیک‌ترین روز) اضافه می‌شود */
function wdMergeTarget(e){if(!e||!e.wd||e.splitOf!=null||e.sentBid!=null||(e.settles||[]).length||wdFam(e).some(z=>z.sentBid!=null))return null;const c=custs.find(z=>String(z.id)===String(e.wd.cu));if(!c)return null;
  const L=wdPendL(c,e.wd.no).map(o=>o.e).filter(z=>z.id!==e.id);if(!L.length)return null;const t0=new Date(PD(e));
  return L.sort((a,b)=>Math.abs(new Date(PD(a))-t0)-Math.abs(new Date(PD(b))-t0)||String(PD(b)).localeCompare(String(PD(a))))[0]}
function wdMergeDel(e,go){const t=wdMergeTarget(e);if(!t)return false;const a=wdState(e).pend,d1=payLab(PD(t))||dates(PD(t)).fa,d0=payLab(PD(e))||dates(PD(e)).fa,b=wdState(t).pend;
  askConfirm('واریزی '+d0+' ('+fmt(a)+' تومان) حذف شود؟ مبلغش به واریزی '+d1+' همین سند اضافه می‌شود: '+fmt(b)+' ← '+fmt(b+a)+' تومان','حذف و ادغام',()=>{
    const ids=wdFam(e).filter(z=>z.sentBid==null).map(z=>z.id);ids.forEach(wdPartRm);trashIds(ids,'ادغام در واریزی '+d1);wdAdj(t,a);memoClear();alloc=null;saveE();saveD();
    logA('split','حذف واریزی و ادغام در روز دیگر سند',fullName(e)+' | سند '+toFa(e.wd.no)+' | '+d0+' '+fmt(a)+' → '+d1+' ('+fmt(b+a)+')',{ids:[e.id,t.id]});
    if(go)go();else{const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y}toast('واریزی '+d1+' شد '+fmt(b+a)+' تومان')});return true}
ACT.wdDel=d=>{const e=entries.find(z=>String(z.id)===String(d.e));if(!e)return;if(wdMergeDel(e))return;
  if(e.sentBid!=null||wdFam(e).some(z=>z.sentBid!=null)){toast('بخشی از این واریزی به بانک رفته؛ اول «حذف تخصیص» آن بخش را بزنید',true);return}
  if((e.settles||[]).length){toast('این واریزی تسویه مشتری دارد؛ از صفحه واریزی تسویه را بردارید',true);return}
  askConfirm('واریزی '+fmt(wdState(e).pend)+' تومان از لیست واریز برداشته شود؟ مبلغش «نرفته به لیست» می‌ماند.','حذف',()=>{const ids=wdFam(e).filter(z=>z.sentBid==null).map(z=>z.id);ids.forEach(wdPartRm);trashIds(ids,'حذف از سند');memoClear();alloc=null;saveE();saveD();
    logA('del','حذف واریزی سند',fullName(e)+' | سند '+toFa(e.wd.no)+' | '+fmt(e.amount),{ids});const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y})};
