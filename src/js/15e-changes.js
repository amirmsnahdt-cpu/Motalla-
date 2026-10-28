/* ---------- تغییرات شبا و مبلغ (فقط مدیر) ----------
   سرور هر تغییر فیلدهای اصلی واریزی (و شبا/مبلغ ردیف‌های لیست پیگیری) را بعد از ثبت، با «چه کسی، کی، از چه به چه» ثبت می‌کند.
   این فهرست فقط روی سرور است و از گوشی قابل ویرایش یا حذف نیست. CHG = تعداد تغییرهای شبا/مبلغ که مدیر هنوز ندیده */
let CHG=0;
const CHF={name:'نام',code:'شماره فاکتور',iban:'شبا',card:'شماره کارت',holder:'صاحب حساب',bank:'بانک',phone:'تلفن',nid:'کد ملی',title:'عنوان',amount:'مبلغ'};
function chgNote(n){if(!isAdmin()||n==null)return;const was=CHG;CHG=+n||0;if(was!==CHG&&(cur==='home'||cur==='settings')){const v=$('view');if(!v)return;const y=v.scrollTop;render();v.scrollTop=y}}
const chgVal=(f,v)=>v===''?'<i class="chx">خالی</i>':f==='iban'?`<bdi dir="ltr">${esc(ibanSp(v))}</bdi>`:f==='amount'?esc(fmt(+v||0))+' تومان':/^(card|phone|nid)$/.test(f)?`<bdi dir="ltr">${esc(toFa(v))}</bdi>`:esc(v);
const chgDay=ts=>{const d=new Date(Date.parse(ts)+3.5*3600e3).toISOString().slice(0,10);return relDay(d)+'، '+dates(d).fa};
let chgRows=null,chgSeenN=0;
async function chgOpen(){sheet(`<div class="sh-h"><b>تغییرات شبا و مبلغ</b><button class="x" data-act="close">×</button></div><div class="card empty"><b>در حال دریافت…</b></div>`);
  try{const r=await api('/api/changes?limit=200');chgRows=r.rows||[];chgSeenN=+r.seen||0}catch(e){chgRows=null;sheet(`<div class="sh-h"><b>تغییرات شبا و مبلغ</b><button class="x" data-act="close">×</button></div><div class="msg bad">${esc(e.message)}</div>`);return}
  const R=chgRows,maxN=R.reduce((m,x)=>Math.max(m,x.n),0),unseen=R.some(x=>x.alert&&x.n>chgSeenN);
  /* v61.93 (خواسته صاحب اپ): دکمه «دیدم» بالای فهرست و چسبان، تا برای زدنش لازم نباشد تا آخر فهرست رفت */
  const nNew=R.filter(x=>x.alert&&x.n>chgSeenN).length;
  let h=`<div class="sh-h"><div><b>تغییرات شبا و مبلغ</b><small class="shsub">بعد از ثبت واریزی · چه کسی، کی، از چه به چه · غیرقابل حذف</small></div><button class="x" data-act="close">×</button></div>
    ${unseen?`<div class="chtop"><span class="tx"><b>${fmt(nNew)} تغییر تازه</b><small>تازه‌ها با قاب طلایی</small></span><button class="chok" data-act="chgSeen" data-n="${maxN}">${ic('check')} دیدم</button></div>`:''}`;
  if(!R.length)h+='<div class="card empty"><b>هنوز تغییری ثبت نشده</b>تغییرهای بعد از ثبت واریزی اینجا دیده می‌شوند.</div>';
  else h+='<div class="chl">'+R.map(x=>`<div class="chr${x.alert?' al':''}${x.alert&&x.n>chgSeenN?' new':''}"><div class="cht"><b>${esc(x.label||'—')}</b><span class="chf">${CHF[x.field]||esc(x.field)}${x.coll==='batches'?' · لیست پیگیری':''}</span></div>
    <div class="chv"><span class="o">${chgVal(x.field,x.old)}</span><span class="ar">←</span><span class="nw">${chgVal(x.field,x.new)}</span></div>
    <small>${esc(x.user||'—')} · ${chgDay(x.ts)} · ساعت <bdi>${hm(x.ts)}</bdi></small></div>`).join('')+'</div>';
  sheet(h)}
ACT.chgOpen=()=>chgOpen();
ACT.chgSeen=async d=>{try{await api('/api/changes/seen',{n:+d.n||0});closeSheet();chgNote(0);toast('تغییرها دیده شد ✓')}catch(e){toast(e.message,true)}};
