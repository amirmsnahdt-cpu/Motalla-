/* ============ v82.4 «کارتخوان امشب» بر اساس هر کارتخوان (ACT.posNight): مبلغ امروزِ سندها کنارش است و با یک زدن پر می‌شود؛
   ثبت = همان واریز دوطرفه کارتخوان به حساب (tout روی کارتخوان + ردیف pos روی حساب، chTx/ledId) — پس ثبت خودکار نیمه‌شب (posAuto) دوباره حساب نمی‌کند.
   v82.5 (خواسته صاحب اپ: «از بخش بانک راضی نیستم؛ شبیه حساب‌های مشتری»): داشبورد v82.4 (کارت آبی، کارهای امروز، کارت‌های دوستونی) برداشته شد؛
   فهرست حساب‌ها مثل فهرست مشتری‌ها در 15zr است. */
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
