/* ---- v61.88 مانده مشتری در تسویه و «تخصیص در انتظار تأیید» ----
   خواسته صاحب اپ: وقتی از مانده یک مشتری برای تسویه واریزی دیگری تخصیص داده می‌شود (تسویه از مشتری با st:'wait')،
   تا تأیید نشده از مانده کم نمی‌شود ولی باید معلوم باشد: قاب مبلغ زرد + فهرست تسویه‌های در انتظار زیر کارت مانده.
   با «تأیید» (ACT.stlOk → stlTx) سند «دریافت وجه» خودکار در حساب مشتری ثبت و از مانده کم می‌شود.
   جستجوی پرداخت‌کننده: کنار هر حساب، مانده طلا (گرم) و مبلغ (تومان) با رنگ طلبکاریم (قرمز) / بدهکاریم (آبی). */
function cuPend(c){const id=String(c.id),L=[];for(const e of entries)for(const z of (e.settles||[]))if(z&&z.st==='wait'&&!z.byInv&&z.cuId!==''&&z.cuId!=null&&String(z.cuId)===id)L.push({e,z});return L}
function pendMap(){const M=new Map();for(const e of entries)for(const z of (e.settles||[]))if(z&&z.st==='wait'&&!z.byInv&&z.cuId!==''&&z.cuId!=null){const k=String(z.cuId);M.set(k,(M.get(k)||0)+(+z.amount||0))}return M}
const cuPendSum=c=>cuPend(c).reduce((s,o)=>s+(+o.z.amount||0),0);
function cuPendHTML(b,P,pw){const R2=(+b.R||0)+pw;/* تسویه = «دریافت وجه» از مشتری → مبلغ به سمت بدهکاریم می‌رود */
  return `<div class="cupd"><div class="cupdh"><span class="cupdi">${ic('clock')}</span><span class="tx"><b>تسویه در انتظار تأیید</b><small>بعد از تأیید از مانده کم می‌شود و سند خودکار می‌خورد</small></span><b class="cupda">${fmt(pw)}<i>تومان</i></b></div>
  ${P.map(({e,z})=>`<button class="cupr" data-act="openEnt" data-id="${e.id}"><span class="tx"><b>به «${esc(fullName(e))}»</b><small>${esc(dates(z.date||e.entryDate).fa)}${z.tn?' · پیگیری <bdi dir="ltr">'+esc(toFa(z.tn))+'</bdi>':''}</small></span><b>${fmt(+z.amount||0)}</b>${ic('back').replace('class="i"','class="i flip"')}</button>`).join('')}
  <div class="cupdf"><small>مانده مبلغ بعد از تأیید</small><b class="${q8S(R2)}">${R2?balV('r',R2):'۰'} <i>تومان</i></b><em class="${q8S(R2)}">${ourLab(R2)}</em></div></div>`}
/* مانده کوچک کنار نام در جستجوی پرداخت‌کننده: یک ردیف گرم، یک ردیف تومان (+ در انتظار تأیید، زرد) */
function cuMiniBal(c){const b=cuBal(c),pw=cuPendSum(c),row=(k,v)=>`<span class="stbv ${q8S(v)}"><b>${v?balV(k,v):'۰'}</b><i>${esc(balU(k))}</i><em>${ourLab(v)}</em></span>`;
  return `<span class="stbl${pw?' pw':''}">${row('g',+b.G||0)}${row('r',+b.R||0)}${pw?`<span class="stbv p"><b>${fmt(pw)}</b><i>تومان</i><em>در انتظار</em></span>`:''}</span>`}
