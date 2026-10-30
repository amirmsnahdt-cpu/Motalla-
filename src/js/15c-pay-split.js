/* ---------- پرداخت یک واریزی از چند منبع ---------- */
/* واریزی به چند «بخش» مرتبط تقسیم می‌شود: خود واریزی (با تسویه‌های مشتری‌اش) + واریزی‌های همراه با splitOf.
   هر بخش یک واریزی کامل است که در منبع خودش تخصیص، ارسال، پیگیری و خروجی می‌شود. */
const famRoot=x=>x.splitOf!=null&&entries.some(e=>e.id===x.splitOf)?x.splitOf:x.id;
const famOf=x=>{const k=famRoot(x);return validated().filter(r=>r.id===k||r.splitOf===k).sort((a,b)=>(a.id===k?-1:b.id===k?1:a.id-b.id))};
function famSrc(r,A){const si=r.sentBid?srcInfo(r.id):null;if(si)return{name:si.src,st:si.st,sent:true};const a=A.get(r.id);return a&&a.src?{name:a.src,st:'none'}:null}
let PS=null;
/* v61.5: پنجره «پرداخت از چند منبع» بازطراحی شد:
   هر بخش یک کارت: انتخاب منبع با دکمه‌های بانک (نه فهرست کشویی) + مبلغ؛ تایپ عدد بدون ساختن دوباره پنجره (مکان نشانگر و پاک کردن درست)،
   بخش آخر خودکار «بقیه» را می‌گیرد مگر دستی عوضش کنید؛ نوار پیشرفت و مانده زنده؛ دکمه ثبت همان لحظه فعال می‌شود. */
const psSum=()=>PS.L.reduce((a,l)=>a+(+l.amount||0),0);
function psSrcChips(l,i){return `<div class="pssc">${sources.map(z=>{const bk=acBank(z),on=String(z.id)===String(l.src);return `<button type="button" class="psch${on?' on':''}" data-act="psSrc" data-i="${i}" data-s="${z.id}">${bk?bankBadge(bk):`<span class="bkb" style="--bc:#64748b">${esc(userInit(z.name))}</span>`}<span>${esc(z.name)}</span></button>`}).join('')}</div>`}
function psCard(l,i){return `<div class="psc" data-i="${i}"><div class="psch0"><span class="psn">${toFa(i+1)}</span><b>بخش ${toFa(i+1)}</b>${PS.L.length>2?`<button type="button" class="itx" data-act="psDel" data-i="${i}" aria-label="حذف بخش">×</button>`:''}</div>
  ${psSrcChips(l,i)}
  <label class="psa"><input class="ltr" data-pa="${i}" inputmode="numeric" value="${l.amount?Number(l.amount).toLocaleString('en-US'):''}" placeholder="مبلغ این بخش" autocomplete="off"><i>تومان</i>${PS.L.length>1?`<button type="button" class="pshalf" data-act="psHalf" data-i="${i}">نصف</button><button type="button" class="pshalf" data-act="psRest" data-i="${i}">بقیه</button>`:''}</label></div>`}
function psHTML(){const R=PS.R;
  return `<div class="sh-h"><div><b>پرداخت از چند منبع</b><small class="shsub">${esc(PS.name)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="psh"><small>مبلغ بانکی</small><b>${fmt(R)}<i>تومان</i></b><div class="psbar"><i id="psBar"></i></div><span id="psLeft"></span></div>
  <div class="psl2" id="psL">${PS.L.map(psCard).join('')}</div>
  <button type="button" class="psadd" data-act="psAdd">${ic('plus')} بخش دیگر</button>
  <div class="muted psnote">هر بخش در لیست ${esc(pdHead(PS.pay))} زیر منبع خودش می‌آید و جدا ارسال و پیگیری می‌شود.</div>
  <button class="xgo" id="psGo" data-act="paySplitSave">${ic('check')} ثبت تقسیم</button>`}
/* فقط خلاصه و ورودی‌های دیگر عوض می‌شوند؛ ورودی در حال تایپ دست نمی‌خورد */
function psPaint(skip){const R=PS.R,s=psSum(),left=R-s,bar=$('psBar'),lf=$('psLeft'),go=$('psGo');
  if(bar){bar.style.width=Math.min(100,R?s/R*100:0)+'%';bar.className=left===0?'ok':left<0?'over':''}
  if(lf){lf.className='psleft '+(left===0?'ok':left<0?'over':'');lf.innerHTML=left===0?`${ic('check')} برابر مبلغ بانکی`:left>0?`مانده <b>${fmt(left)}</b>`:`بیشتر از مبلغ: <b>${fmt(-left)}</b>`}
  const ok=left===0&&PS.L.every(l=>+l.amount>0)&&PS.L.length>1;if(go){go.disabled=!ok;go.innerHTML=`${ic('check')} ثبت ${toFa(PS.L.length)} بخش`}
  document.querySelectorAll('#sheet [data-pa]').forEach(el=>{const i=+el.dataset.pa;if(i===skip)return;const v=+PS.L[i].amount||0,t=v?v.toLocaleString('en-US'):'';if(el.value!==t){el.value=t;const c=el.closest('.psc');if(c&&!RM()&&c.animate)c.animate([{boxShadow:'0 0 0 2px var(--blu)'},{boxShadow:'0 0 0 1px var(--line)'}],{duration:500})}})}
/* بخش آخر (اگر دستی عوض نشده) همیشه بقیه مبلغ است */
function psAuto(changed){const L=PS.L,last=L.length-1;if(changed===last||L[last].man)return;const s=L.slice(0,last).reduce((a,l)=>a+(+l.amount||0),0);L[last].amount=Math.max(0,PS.R-s)}
function psRedraw(){$('sheet').innerHTML=psHTML();psBind();psPaint()}
function psBind(){const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(t.dataset.pa==null)return;const i=+t.dataset.pa;
    /* قالب‌بندی با ویرگول بدون پریدن نشانگر: تعداد رقم‌های قبل از نشانگر حفظ می‌شود */
    const pos=t.selectionStart||0,before=toEn(t.value.slice(0,pos)).replace(/\D/g,'').length,v=num(t.value);t.value=v?v.toLocaleString('en-US'):'';
    let p=0,d=0;while(p<t.value.length&&d<before){if(/\d/.test(t.value[p]))d++;p++}try{t.setSelectionRange(p,p)}catch(_){}
    PS.L[i].amount=v;if(i===PS.L.length-1)PS.L[i].man=true;psAuto(i);psPaint(i)};
  sh.onchange=null;psPaint()}
ACT.paySplit=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;const F=famOf(x);if(F.some(r=>r.sentBid)){toast('یکی از بخش‌ها ارسال شده؛ اول از پیگیری برگردانید',true);return}
  AM=allocMap();const sid=n=>{const s=sources.find(z=>z.name===n);return s?String(s.id):''};
  const L=F.map(r=>{const a=AM.get(r.id);return{src:a&&a.src?sid(a.src):'',amount:r.amount}});if(L.length===1){const o=sources.find(z=>String(z.id)!==L[0].src);L[0].amount=0;L.push({src:o?String(o.id):'',amount:0})}
  PS={root:famRoot(x),name:fullName(x),pay:PD(x),R:sum(F),L};if(PS.L.length>1&&!PS.L.slice(1).some(l=>+l.amount))psAuto(0);sheet(psHTML());psBind()};
ACT.psAdd=()=>{const used=new Set(PS.L.map(l=>String(l.src))),o=sources.find(z=>!used.has(String(z.id)));PS.L.forEach(l=>l.man=true);PS.L.push({src:o?String(o.id):'',amount:0});psAuto(-1);psRedraw();const c=document.querySelector('#sheet .psc:last-child');if(c){if(!RM()&&c.animate)c.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.25,1)'});const f=c.querySelector('[data-pa]');if(f)setTimeout(()=>f.focus(),60)}};
ACT.psDel=d=>{if(PS.L.length<=2)return;PS.L.splice(+d.i,1);PS.L[PS.L.length-1].man=false;psAuto(-1);psRedraw()};
ACT.psSrc=d=>{const l=PS.L[+d.i];if(!l)return;l.src=String(d.s);const c=document.querySelector(`#sheet .psc[data-i="${d.i}"]`);if(c)c.querySelectorAll('.psch').forEach(b=>b.classList.toggle('on',b.dataset.s===String(d.s)))};
ACT.psHalf=d=>{const i=+d.i;PS.L[i].amount=Math.round(PS.R/2);if(i===PS.L.length-1)PS.L[i].man=true;psAuto(i);psPaint()};
ACT.psRest=d=>{const i=+d.i,s=PS.L.reduce((a,l,k)=>k===i?a:a+(+l.amount||0),0);PS.L[i].amount=Math.max(0,PS.R-s);if(i===PS.L.length-1)PS.L[i].man=true;psAuto(i);psPaint()};
ACT.psFill=()=>ACT.psRest({i:PS.L.length-1});
ACT.paySplitUndo=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;askConfirm('همه بخش‌ها دوباره یک واریزی شوند؟ تخصیص بخش‌ها برداشته می‌شود.','یکی کردن',()=>{const F=famOf(x);PS={root:famRoot(x),name:fullName(x),pay:PD(x),R:sum(F),L:[{src:'',amount:sum(F)}]};psApply()})};
ACT.paySplitSave=()=>{if(!PS)return;const s=PS.L.reduce((a,l)=>a+(+l.amount||0),0);if(s!==PS.R||PS.L.some(l=>!(+l.amount>0))){toast('جمع بخش‌ها باید برابر مبلغ بانکی باشد',true);return}psApply()};
function psApply(){const root=entries.find(e=>e.id===PS.root);if(!root){closeSheet();return}const fam=entries.filter(e=>e.id===root.id||e.splitOf===root.id).sort((a,b)=>a.id===root.id?-1:b.id===root.id?1:a.id-b.id);
  if(fam.some(e=>e.sentBid)){toast('یکی از بخش‌ها ارسال شده است',true);return}
  const now=new Date().toISOString(),ids=new Set(fam.map(e=>e.id)),rootSt=(root.settles||[]).reduce((a,z)=>a+(+z.amount||0),0);
  for(const k in drafts)drafts[k]=(drafts[k]||[]).map(p=>{if(p.sent||!(p.ids||[]).some(id=>ids.has(id)))return p;return{...p,ids:p.ids.filter(id=>!ids.has(id))}}).filter(p=>p.sent||p.ids.length);
  const keep=[];PS.L.forEach((l,i)=>{let e=fam[i];
    if(i===0){e.amount=rootSt+(+l.amount);e.updatedAt=now;e.updatedBy=who()}
    else if(e){e.amount=+l.amount;e.updatedAt=now;e.updatedBy=who()}
    else{e={id:nid++,splitOf:root.id,name:root.name,title:root.title||'',code:root.code||'',iban:root.iban||'',card:root.card||'',bank:root.bank||'',holder:root.holder||'',phone:root.phone||'',nid:root.nid||'',entryDate:root.entryDate,payDate:root.payDate||root.entryDate,amount:+l.amount,settles:[],note:'',createdBy:who(),updatedBy:who(),updatedAt:now};entries.push(e)}
    keep.push({e,src:l.src})});
  const drop=fam.slice(PS.L.length).map(e=>e.id);if(drop.length)trashIds(drop,'یکی کردن بخش‌های پرداخت');saveE();saveD();
  const k0=ldKey;ldKey=PS.pay;keep.forEach(({e,src})=>{const so=sources.find(z=>String(z.id)===String(src));if(so)moveTo([e.id],null,so)});ldKey=k0;
  logA('split',PS.L.length>1?'پرداخت از چند منبع':'یکی کردن بخش‌ها',PS.name+' | '+PS.L.map(l=>{const so=sources.find(z=>String(z.id)===String(l.src));return (so?so.name:'بدون منبع')+' '+fmt(l.amount)}).join('، '));
  const n=PS.L.length;PS=null;alloc=null;closeSheet();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast(n>1?'پرداخت بین '+toFa(n)+' منبع تقسیم شد':'بخش‌ها یکی شدند')}
