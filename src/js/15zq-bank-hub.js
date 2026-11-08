/* ============ v82.4 (خواسته صاحب اپ: «بانک‌ها هنوز کامل نیست و جالب نیست؛ عمیق فکر کن و بهتر طراحی کن») ============
   صفحه بانک‌ها = داشبورد کار روزانه مغازه:
   ۱) کارت موجودی کل (همه حساب‌های مغازه + صندوق) و سه عدد امروز: آمد، رفت، کارتخوان در راه (bkHubTop)
   ۲) «کارهای امروز» — سه قدم با وضعیت: تطبیق موجودی با اپ بانک، کارتخوان امشب، تخصیص واریزی‌های فردا (bkTasks)
   ۳) حساب‌ها به شکل کارت دو ستونی (bkCard): مانده نهایی بزرگ، آزاد/در راه کوچک؛ حساب بدون موجودی خط‌چین
   «کارتخوان امشب» (ACT.posNight) حالا بر اساس هر کارتخوان است، نه هر حساب: مبلغ امروزِ سندها کنارش است و با یک زدن پر می‌شود؛
   ثبت = همان واریز دوطرفه کارتخوان به حساب (tout روی کارتخوان + ردیف pos روی حساب، chTx/ledId) — پس ثبت خودکار نیمه‌شب (posAuto) دوباره حساب نمی‌کند. */
const bkLocalDay=iso=>{try{return new Date(iso).toLocaleDateString('en-CA')}catch(_){return String(iso||'').slice(0,10)}};
/* آمد و رفت امروز یک حساب (حواله/نقد سندها، ردیف‌های دستی و کارتخوان نشسته، واریزی‌های ارسال‌شده) */
function bkToday(s){const td=todayISO();let i=0,o=0;
  srcMoves(s).forEach(m=>{if(m.date===td){if(m.a>0)i+=m.a;else o-=m.a}});
  (s.led||[]).forEach(x=>{if(x.del||x.date!==td)return;const a=+x.amount||0;if(x.type==='out')o+=a;else if(x.type==='in'||x.type==='pos')i+=a});
  if(!s.cash)batches.forEach(b=>b.items.forEach(x=>{if(x.src===s.name&&x.st!=='fail'&&bkLocalDay(x.sAt||b.createdAt)===td)o+=+x.amount||0}));
  return {i,o}}
function bkHubTop(L){const K=L.filter(s=>s.bal!=null),tot=K.reduce((a,s)=>a+acSum(s).fin,0),T=L.reduce((a,s)=>{const x=bkToday(s);a.i+=x.i;a.o+=x.o;return a},{i:0,o:0}),way=L.reduce((a,s)=>a+acPosPend(s),0),miss=L.length-K.length;
  const st=(l,v,c)=>`<span class="bkhs ${c}"><small>${l}</small><b><span class="cbn" data-k="r" data-v="${Math.round(v)}">${fmt(Math.round(v))}</span></b></span>`;
  return `<div class="bkh${bxWas?'':' anim'}"><small>موجودی کل حساب‌ها</small><b class="bkhv">${K.length?`<span class="cbn" data-k="r" data-v="${Math.abs(Math.round(tot))}">${tot<0?'−':''}${fmt(Math.abs(Math.round(tot)))}</span><i>تومان</i>`:'—'}</b>
    ${miss?`<em>${toFa(miss)} حساب بدون موجودی (در جمع نیست)</em>`:''}<div class="bkhr">${st('امروز آمد',T.i,'in')}${st('امروز رفت',T.o,'out')}${st('کارتخوان در راه',way,'way')}</div></div>
  ${can('src')?bkTasks(L):''}`}
/* کارهای امروز */
function bkPosToday(){const td=todayISO();let e=0;CH('pos').forEach(c=>chMoves(c).forEach(m=>{if(m.d===td&&m.a>0&&!m.own)e+=m.a}));return e}
function bkPosDone(){const td=todayISO();let a=0;sources.forEach(s=>(s.led||[]).forEach(x=>{if(!x.del&&x.type==='pos'&&!x.auto&&x.date===td)a+=+x.amount||0}));return a}
function bkTomorrow(){const tk=isoAdd(todayISO(),1),keep=ldKey;let P=[];try{ldKey=tk;P=aPool()}catch(_){}finally{ldKey=keep}return {tk,n:P.length,a:P.reduce((t,x)=>t+(+x.amount||0),0)}}
function bkTasks(L){const td=todayISO(),rec=L.filter(s=>s.balAt&&bkLocalDay(s.balAt)===td),pe=bkPosToday(),pd=bkPosDone(),tm=bkTomorrow();
  const last=rec.map(s=>s.balAt).sort().pop();
  const row=(act,ico,t,sub,ok,i)=>`<button type="button" class="bktr${ok?' ok':''}" data-act="${act}" style="--i:${i}"><span class="bkti">${ic(ok?'check':ico)}</span><span class="tx"><b>${t}</b><small>${sub}</small></span><span class="bktc">${ok?'انجام شد':'انجام'}</span></button>`;
  return `<div class="bkts"><div class="bktsh"><b>کارهای امروز</b><small>${esc(dates(td).fa)}</small></div>
  ${row('bkRec','bank','تطبیق موجودی با اپ بانک',rec.length?`${toFa(rec.length)} حساب · ساعت ${esc(bxTime(last))}`:'موجودی هر حساب را از اپ بانک بنویسید',rec.length>0,0)}
  ${row('posNight','card','کارتخوان امشب',pd?`ثبت شد · ${fmt(pd)} تومان`:pe?`از سندهای امروز ${fmt(pe)} تومان`:'امروز کارتخوانی در سندها نیست',pd>0,1)}
  ${row('bkGoAlloc','split','تخصیص واریزی‌های فردا',tm.n?`${toFa(tm.n)} واریزی بدون تخصیص · ${fmt(tm.a)} تومان`:'همه واریزی‌های فردا تخصیص یافته',!tm.n,2)}</div>`}
ACT.bkGoAlloc=()=>{const tm=bkTomorrow();ldKey=tm.tk;PARENT.lday='banks';go('lday');if(tm.n&&can('split'))setTimeout(()=>{if(cur==='lday')ACT.aaOpen()},420)};
/* کارت حساب */
function bkCard(s,m,ri){const bk=acBank(s),known=m.known,fr=known?acFree(s):null,way=acPosPend(s);
  return `<button class="bkc${known?'':' nb'}" data-act="acOpen" data-id="${s.id}" style="--i:${Math.min(ri,10)}"><span class="bkcl">${bk?bankBadge(bk):s.cash?ic('cash'):esc(userInit(s.name))}</span><b class="bkcn">${esc(s.name)}</b>
  ${known?`<b class="bkcv${m.fin<0?' neg':''}"><span class="cbn" data-k="r" data-v="${Math.abs(Math.round(m.fin))}">${m.fin<0?'−':''}${fmt(Math.abs(Math.round(m.fin)))}</span></b><small class="bkcs">${way?'کارتخوان در راه '+fmt(way):fr!=null&&fr!==m.fin?'آزاد '+fmt(fr):s.cash?'صندوق':'تومان'}</small>`:'<small class="bkcs nb">موجودی ثبت نشده · بزنید</small>'}</button>`}
/* ----- کارتخوان امشب (بر اساس هر کارتخوان) ----- */
function bkPosRows(){const td=todayISO(),P=CH('pos');return P.map(c=>{let e=0,d=0;chMoves(c).forEach(m=>{if(m.d===td){if(m.a>0&&!m.own)e+=m.a;else if(m.own&&m.a<0)d-=m.a}});return {c,s:chSrc(c),e,d,bal:chBal(c)}})}
ACT.posNight=()=>{if(!can('src'))return;const R=bkPosRows(),L=ownL();if(!R.length){sheet(`<div class="sh-h"><div><b>کارتخوان امشب</b><small class="shsub">هنوز کارتخوانی تعریف نشده</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div><div class="aae">از منوی «⋯» صفحه بانک‌ها «تعریف کارتخوان» را بزنید و بگویید پول هر کارتخوان به کدام حساب می‌نشیند.</div>`);return}
  sheet(`<div class="sh-h"><div><b>کارتخوان امشب</b><small class="shsub">${esc(dates(todayISO()).fa)} · مبلغی که امشب هر کارتخوان به حسابش واریز کرد</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="pnl2">${R.map(o=>{const s=o.s,bk=s&&acBank(s);return `<div class="pnc" data-ch="${esc(o.c.id)}"><div class="pnh"><span class="bkti">${ic('card')}</span><span class="tx"><b>${esc(o.c.name)}</b><small>${s?'به '+esc(s.name):'به کدام حساب؟'}${o.d?' · امشب ثبت شد '+fmt(o.d):''}</small></span>${o.e?`<button type="button" class="pnf" data-act="posFill" data-ch="${esc(o.c.id)}" data-v="${o.e}">از سندها ${fmt(o.e)}</button>`:''}</div>
    ${s?'':`<select class="pns" aria-label="حساب مقصد"><option value="">حساب مقصد را انتخاب کنید</option>${L.map(z=>`<option value="${esc(z.id)}">${esc(z.name)}</option>`).join('')}</select>`}
    <label class="pni"><input class="pin2 ltr" inputmode="numeric" autocomplete="off" placeholder="مبلغ این کارتخوان" aria-label="مبلغ ${esc(o.c.name)}"><i>تومان</i></label></div>`}).join('')}</div>
  <div class="pnt"><small>جمع امشب</small><b><span id="posT2" class="cbn" data-k="r" data-v="0">۰</span><i>تومان</i></b><em id="posN2">هنوز مبلغی وارد نشده</em></div>
  <button class="xgo" data-act="posSave">${ic('check')} ثبت</button>`);
  const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(!t.classList.contains('pin2'))return;const v=num(t.value);t.value=v?v.toLocaleString('en-US'):'';posTot()}};
function posTot(){let a=0,n=0;document.querySelectorAll('#sheet .pin2').forEach(i=>{const x=num(i.value);if(x){a+=x;n++}});const T=$('posT2'),N=$('posN2');if(T){T.textContent=fmt(a);if(!RM()&&T.animate)T.animate([{transform:'scale(1.08)'},{transform:'none'}],{duration:240,easing:'cubic-bezier(.3,1.4,.5,1)'})}if(N)N.textContent=n?toFa(n)+' کارتخوان':'هنوز مبلغی وارد نشده'}
ACT.posFill=d=>{const C=document.querySelector(`#sheet .pnc[data-ch="${CSS.escape(String(d.ch))}"]`),I=C&&C.querySelector('.pin2');if(!I)return;I.value=Number(d.v).toLocaleString('en-US');posTot();if(!RM()&&I.animate)I.animate([{background:'color-mix(in srgb,var(--blu) 14%,var(--card))'},{background:'var(--card)'}],{duration:700})};
ACT.posSave=()=>{const now=ns(),td=todayISO(),done=[];let miss=0;
  document.querySelectorAll('#sheet .pnc').forEach(C=>{const v=num((C.querySelector('.pin2')||{}).value||''),c=custs.find(z=>String(z.id)===String(C.dataset.ch));if(!v||!c)return;
    let s=chSrc(c);const sel=C.querySelector('.pns');if(!s&&sel&&sel.value){s=sources.find(z=>String(z.id)===String(sel.value));if(s){c.srcId=s.id;c.updatedAt=now}}if(!s){miss++;return}
    const T={id:nid++,type:'tout',amount:v,srcId:s.id,date:td,at:now,by:who()},Lr={id:nid++,type:'pos',amount:v,note:'کارتخوان «'+c.name+'»',chId:c.id,chTx:T.id,date:td,at:now,by:who()};T.ledId=Lr.id;
    (c.txs=c.txs||[]).push(T);(s.led=s.led||[]).push(Lr);s.updatedAt=now;done.push(c.name+' → '+s.name+' '+fmt(v))});
  if(miss){toast('برای '+toFa(miss)+' کارتخوان حساب مقصد را انتخاب کنید',true);return}
  if(!done.length){toast('مبلغی وارد نشده',true);const i=document.querySelector('#sheet .pin2');if(i)i.focus();return}
  saveCu();saveS();logA('src','کارتخوان امشب',done.join(' | '));closeSheet();render();toast('کارتخوان امشب ثبت شد · '+toFa(done.length)+' کارتخوان')};
