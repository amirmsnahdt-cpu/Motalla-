/* ============ v82.1 (خواسته صاحب اپ: «قسمت بانک پیچیده است؛ مثل سند مشتری ساده و روان؛ وقتی سند می‌خورد خودکار در بانک بخورد») ============
   - ثبت خودکار از قبل هست (حواله و نقد سندها، کارتخوان فردا، واریزی‌های ارسال‌شده)؛ حالا در گردش حساب با برچسب «خودکار» دیده می‌شود.
   - صفحه حساب: دو کارت بزرگ «واریز به حساب / برداشت از حساب» برداشته شد؛ تنها راه سند دستی «+» است (سند بانکی با برداشت، واریز، …).
     جایش یک خط راهنمای کوچک (bkHowHTML).
   - صفحه بانک‌ها: دو دکمه کار روزانه زیر جستجو — «تطبیق موجودی‌ها» (همه حساب‌ها در یک پنجره: موجودی اپ بانک را بنویسید،
     اختلاف همان لحظه، «ثبت همه») و «کارتخوان امشب» (posNight). */
function bkHowHTML(s){return can('src')?`<div class="bkhow">${ic('swap')}<span>${s.cash?'دریافت و پرداخت نقد سندها':'حواله‌های سندها، کارتخوان و واریزی‌های ارسال‌شده'} <b>خودکار</b> اینجا می‌نشیند · برای برداشت یا واریز دستی <b>+</b> بالا را بزنید</span></div>`:''}
let BRC=null;
ACT.bkRec=()=>{if(!can('src'))return;BRC={};sheet(bkRecHTML());bkRecBind();const i=document.querySelector('#sheet .brcin');if(i)sheetFocus(i)};
function bkRecHTML(){const L=ownLC();
  return `<div class="sh-h"><div><b>تطبیق موجودی‌ها</b><small class="shsub">موجودی هر حساب را از اپ بانک بنویسید؛ خالی = بدون تغییر</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="brcl">${L.map(s=>{const bk=acBank(s),e=acEst(s),v=BRC[s.id];return `<label class="brcr" data-id="${esc(s.id)}"><span class="brca">${bk?bankBadge(bk):s.cash?ic('cash'):esc(userInit(s.name))}</span><span class="brct"><b>${esc(s.name)}</b><small>${e==null?'مانده قبلی ثبت نشده':'برنامه: '+(e<0?'−':'')+fmt(Math.abs(e))}</small><em class="brcd" id="brcd${esc(s.id)}">${bkRecDiff(s,v)}</em></span><input class="brcin ltr" inputmode="numeric" autocomplete="off" placeholder="موجودی اپ" value="${v?Number(v).toLocaleString('en-US'):''}" data-id="${esc(s.id)}"></label>`}).join('')}</div>
  <button class="xgo" data-act="bkRecSave">${ic('check')} ثبت همه</button>`}
function bkRecDiff(s,v){if(!v)return '';const e=acEst(s);if(e==null)return '<i class="nw">مانده اولیه ثبت می‌شود</i>';const d=v-e;return d?`<i class="${d>0?'up':'dn'}">اختلاف ${d>0?'+':'−'}${fmt(Math.abs(d))}</i>`:'<i class="ok">برابر ✓</i>'}
function bkRecBind(){document.querySelectorAll('#sheet .brcin').forEach(I=>{I.oninput=()=>{const v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';const s=sources.find(z=>String(z.id)===String(I.dataset.id));if(!s)return;if(v)BRC[s.id]=v;else delete BRC[s.id];const d=$('brcd'+s.id);if(d)d.innerHTML=bkRecDiff(s,v)};
  I.onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const A=[...document.querySelectorAll('#sheet .brcin')],k=A.indexOf(I);if(A[k+1])A[k+1].focus();else I.blur()}})}
ACT.bkRecSave=()=>{if(!BRC)return;const now=new Date().toISOString(),by=who(),done=[];
  for(const [id,v] of Object.entries(BRC)){const s=sources.find(z=>String(z.id)===String(id));if(!s||!v)continue;const first=s.bal==null,old=first?null:acEst(s);
    if(!first)(s.balH=s.balH||[]).push({bal:s.bal,balAt:s.balAt,by:s.balBy||''});s.bal=v;s.balAt=now;s.balBy=by;delete s.balEd;s.updatedAt=now;done.push(s.name+' '+fmt(v)+(old!=null&&old!==v?' (برنامه '+fmt(old)+')':''))}
  if(!done.length){toast('موجودی هیچ حسابی نوشته نشده',true);const i=document.querySelector('#sheet .brcin');if(i)i.focus();return}
  saveS();logA('src','تطبیق موجودی حساب‌ها',done.join(' | '));BRC=null;closeSheet();render();toast(toFa(done.length)+' حساب تطبیق داده شد')};
