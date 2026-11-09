/* ============ v83.7 (خواسته صاحب اپ: «این قسمت‌ها باید در بانک سند بخورد نه این‌جوری نشان دهد؛ همه باید سند بخورد؛ واریزی‌ها و لیست‌ها همه باید لیست شود») ============
   ۱) طرف مقابل حواله/کارتخوان/انتقال (m:'cust' و ردیف‌های بانکی bk) دیگر ردیف «انتقال» (xf) نیست: یک «سند» واقعی (inv) در حساب طرف مقابل
      با همان شماره (t.lk = {cu,tx} سند اصلی؛ ردیف پرداخت m:'lnk' با lm = روش اصلی). باز کردنش = صفحه سند؛ ویرایش/حذفش = سند اصلی (lkGoTx).
   ۲) حساب نوع «بانک» به یکی از بانک‌های قبلی (منبع واریزی‌ها) وصل می‌شود (c.srcId، از زمان وصل c.srcAt): هر لیست واریزی که از آن بانک
      ارسال می‌شود خودکار یک سند «لیست واریز» در همین حساب می‌خورد (t.bl = شناسه بچ، pays m:'dls')؛ برگشت/ناموفق/ویرایش منابع = سند هم‌گام می‌شود (bkDepSync). */
function lnkMirror(c,t,p,no,now){const Y=custs.find(z=>String(z.id)===String(p.cuId));if(!Y)return null;
  const x={id:nid++,type:'inv',dk:p.amount>0?'out':'in',no,date:t.date||sv.date,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,
    pays:[{m:'lnk',lm:p.m,amount:-(+p.amount||0),cuId:c.id,cuName:cuName(c),...(p.why?{why:p.why}:{}),...(p.tn?{tn:p.tn}:{})}],
    note:'',lk:{cu:c.id,tx:t.id},at:now,by:who(),cn:cnNext(Y)};
  (Y.txs=Y.txs||[]).push(x);Y.lastAt=now;return x}
const lnkLab=p=>{const out=pAmt(p)<0,bk=p.lm==='pos'?'کارتخوان':p.lm==='hav'?(out?'حواله به بانک':'حواله از بانک'):(out?'حواله به':'حواله از');return bk+' «'+(p.cuName||'')+'»'};
/* سند طرف مقابل → سند اصلی (ویرایش و حذف فقط از همان‌جا، تا دو طرف همیشه یکی باشند) */
function lkGoTx(t,why){if(t.pd){toast('«کارتخوان روز» خودکار از کارتخوان سندهای همان روز ساخته می‌شود؛ '+why+' از خود سند مشتری (روی هر ردیف بزنید)',true);return}
  if(t.bl){toast('این سند از «لیست واریز» آمده؛ '+why+' از خود لیست واریز',true);ldKey=t.date;go('lday');return}
  const C=custs.find(z=>String(z.id)===String(t.lk.cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(t.lk.tx)&&!z.del);
  toast('این سند طرف مقابل «'+(C?cuName(C):'')+'» است؛ '+why+' از سند اصلی',true);if(T)invOpen(C.id,T.id)}
/* ----- حساب بانک ↔ بانک واریزی‌ها ----- */
const bkSrcOf=c=>c&&c.srcId!=null&&c.srcId!==''?sources.find(s=>String(s.id)===String(c.srcId))||null:null;
function bkLinkHTML(c){if(!c||c.grp!=='بانک'||!can('src'))return '';const s=bkSrcOf(c);
  if(s)return `<div class="bklk on"><span class="bkdi">${ic('list')}</span><span class="tx"><b>لیست‌های واریز «${esc(s.name)}» اینجا سند می‌خورد</b><small>همه لیست‌های ارسال‌شده، هر واریزی با رسیدش</small></span><button type="button" class="lnk" data-act="bkLinkM" data-cu="${c.id}">تغییر</button></div>`;
  const L=ownL();if(!L.length)return '';const m=L.find(z=>canon(z.name)===canon(c.name));
  return `<div class="bklk"><span class="bkdi">${ic('list')}</span><span class="tx"><b>واریزی‌های لیست از کدام بانک ارسال می‌شود؟</b><small>هر لیست واریزِ همان بانک (قبلی و بعدی) با رسیدهایش اینجا خودکار سند می‌خورد</small></span><button type="button" class="bklkb" data-act="bkLinkM" data-cu="${c.id}">${m?esc(m.name):'انتخاب'}</button></div>`}
ACT.bkLinkM=(d,e)=>{const c=custs.find(z=>String(z.id)===String(d.cu));if(!c)return;const T=e&&e.target&&e.target.closest('button');
  popMenu(T,[...ownL().map(s=>['bkLinkS',ic(bkSrcOf(c)&&String(c.srcId)===String(s.id)?'check':'bank'),s.name,{cu:c.id,s:s.id}]),bkSrcOf(c)?['bkLinkS',ic('x'),'قطع اتصال',{cu:c.id,s:''}]:null].filter(Boolean))};
ACT.bkLinkS=d=>{const c=custs.find(z=>String(z.id)===String(d.cu));if(!c)return;const now=new Date().toISOString();
  if(d.s===''||d.s==null){delete c.srcId;delete c.srcAt}else{const s=sources.find(z=>String(z.id)===String(d.s));if(!s)return;
    const other=bkCus().find(z=>z!==c&&String(z.srcId)===String(s.id));if(other){toast('«'+s.name+'» به حساب «'+cuName(other)+'» وصل است',true);return}
    if(String(c.srcId)!==String(s.id)){c.srcId=s.id;c.srcAt=now}}
  c.updatedAt=now;bkDepSync(c,1);saveCu();logA('cust','اتصال حساب بانک به لیست‌های واریز',cuName(c)+' ← '+((bkSrcOf(c)||{}).name||'قطع'));render();toast(bkSrcOf(c)?'وصل شد':'اتصال قطع شد')};
/* لیست‌های ارسال‌شده از بانک وصل‌شده → سند «لیست واریز» در حساب بانک (یکی برای هر بچ) */
function bkDepSync(c,noSave){const s=bkSrcOf(c),now=new Date().toISOString();let ch=0;const want=new Map();
  /* v84.1 (خواسته صاحب اپ: «لیست واریزی‌ها با عکس‌هایشان»): هر واریزی لیست یک ردیف سند با رسیدهایش؛ همه لیست‌های ارسال‌شده همان بانک (نه فقط از زمان اتصال) */
  if(s){for(const b of batches)for(const x of b.items||[]){if(x.src!==s.name||x.st==='fail')continue;const at=x.sAt||b.createdAt||'';
      const k=String(b.id),o=want.get(k)||{R:[],date:b.pay||b.date||String(at).slice(0,10),at};const K=itImgs(b,x);
      o.R.push({m:'dls',amount:Math.round(+x.amount||0),nm:x.name||'',eid:x.id,src:s.name,...(x.tn?{tn:x.tn}:{}),...(K.length?{imgs:K,img:K[0]}:{})});want.set(k,o)}}
  for(const t of c.txs||[]){if(t.del||!t.bl)continue;const w=want.get(String(t.bl));
    if(!w||!w.R.length){t.del=true;t.delAt=now;t.delBy='خودکار';ch=1;continue}
    if(JSON.stringify(t.pays)!==JSON.stringify(w.R)){t.pays=w.R;t.edAt=now;ch=1}want.delete(String(t.bl))}
  for(const [k,w] of want){if(!w.R.length)continue;(c.txs=c.txs||[]).push({id:nid++,type:'inv',dk:'in',no:invNext(),date:w.date,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,
    pays:w.R,note:'',bl:k,at:w.at||now,by:'خودکار',cn:cnNext(c)});ch=1}
  if(ch){c.lastAt=now;if(!noSave)audBg(()=>saveCu())}return ch}
function bkDepSyncAll(){let ch=0;for(const c of bkCus()){if(bkSrcOf(c)||(c.txs||[]).some(t=>t.bl&&!t.del))ch+=bkDepSync(c,1);ch+=posDaySync(c)}if(ch)audBg(()=>saveCu());return ch}
/* ردیف‌های «انتقال» قدیمی که طرف مقابل یک سند بودند (xf با inv) در جا به سند طرف مقابل تبدیل می‌شوند (همان شناسه و همان اثر) */
function lnkUpgrade(c){let ch=0;for(const t of c.txs||[]){if(t.del||t.type!=='xf'||!t.inv||t.peer)continue;const C=custs.find(z=>String(z.id)===String(t.inv.cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(t.inv.tx));
    const p=T&&(T.pays||[]).find(q=>String(q.xfId)===String(t.id));if(!p)continue;const r=+t.r||0;
    Object.assign(t,{type:'inv',dk:r<0?'in':'out',no:T.no,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays:[{m:'lnk',lm:p.m,amount:r,cuId:C.id,cuName:cuName(C),...(p.why?{why:p.why}:{})}],lk:{cu:C.id,tx:T.id},note:'',cn:cnNext(c)});
    delete t.inv;delete t.r;delete t.g;ch=1}
  if(ch)audBg(()=>saveCu());return ch}
/* v84.1 (خواسته صاحب اپ: «قسمت قبلی حساب بانکی‌ها را نمی‌خواهم») — انتقال یک‌باره بانک‌های قبلی (v83.9) برداشته شد؛ سندهای mig که احیاناً ساخته شده‌اند می‌مانند (برچسب m:'blg' در pyLab) */
/* ===== v84.0 (خواسته صاحب اپ: «کارتخوان: در طول روز یک سند کارتخوان برای بانک ثبت شود و همه کارتخوان‌های آن روز در همان سند بخورد») =====
   کارتخوانِ سندهای مشتری (pay m:'pos' با bk و cuId = حساب بانک) دیگر هر کدام سند جدا در بانک نمی‌سازد؛ برای هر حساب بانک و هر روز یک سند
   «کارتخوان روز» (t.pd = تاریخ) با یک ردیف برای هر کارتخوان کشیده‌شده (m:'lnk' lm:'pos'، lcu/ltx = سند اصلی). با هر ثبت/ویرایش/حذف سند
   دوباره از روی سندها ساخته می‌شود (posDaySync)؛ شماره و شناسه سند روز ثابت می‌ماند. سندهای جدای قبلی کارتخوان در همین سند جمع می‌شوند. */
function posDaySync(c){const now=new Date().toISOString();let ch=0;const D=new Map();
  for(const C of CU()){if(C===c)continue;for(const T of C.txs||[]){if(T.del||T.type!=='inv')continue;for(const p of T.pays||[]){if(p.m!=='pos'||!p.bk||String(p.cuId)!==String(c.id))continue;
      if(p.xfId!=null){const o=(c.txs||[]).find(z=>String(z.id)===String(p.xfId));if(o&&!o.del){o.del=true;o.delAt=now;o.delBy='خودکار'}delete p.xfId;ch=1}
      const k=T.date||String(T.at||now).slice(0,10);if(!D.has(k))D.set(k,[]);D.get(k).push({m:'lnk',lm:'pos',amount:-(+p.amount||0),cuId:C.id,cuName:cuName(C),lcu:C.id,ltx:T.id,no:T.no,...(p.imgs&&p.imgs.length?{imgs:p.imgs.slice(),img:p.imgs[0]}:{})})}}}
  for(const t of c.txs||[]){if(t.del||!t.pd)continue;const R=D.get(t.pd);if(!R||!R.length){t.del=true;t.delAt=now;t.delBy='خودکار';ch=1;continue}
    if(JSON.stringify(t.pays)!==JSON.stringify(R)){t.pays=R;t.edAt=now;ch=1}D.delete(t.pd)}
  for(const [k,R] of D){(c.txs=c.txs||[]).push({id:nid++,type:'inv',dk:'in',no:invNext(),date:k,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays:R,note:'',pd:k,at:k+'T23:00:00.000Z',by:'خودکار',cn:cnNext(c)});ch=1}
  if(ch){c.lastAt=now}return ch}
function posDaySyncAll(noSave){let ch=0;for(const c of bkCus())ch+=posDaySync(c);if(ch&&!noSave)audBg(()=>saveCu());return ch}
/* ===== v84.2 (خواسته صاحب اپ: «لوگوی هر بانک خودکار در پروفایل حساب ذخیره شود و پس‌زمینه کم‌رنگ لوگوی بانک») =====
   بانک حساب نوع «بانک» از نام، شبا یا کارت تشخیص داده می‌شود و یک بار در c.bank ذخیره می‌شود؛ آواتار = لوگوی بانک، و پشت کارت لوگوی کم‌رنگ */
/* تشخیص بانک از نام با کلمه کامل (مهدی ≠ بانک دی) */
const bkNameBank=n=>{const W=nzName(toEn(n||'')).replace(/[()«»\-_,،.]/g,' ').split(/\s+/).filter(w=>w&&w!=='بانک');return BK_PICK.slice().sort((a,b)=>b.split(' ').length-a.split(' ').length||b.length-a.length).find(b=>{const B=nzName(b).split(/\s+/);for(let i=0;i+B.length<=W.length;i++)if(B.every((x,j)=>W[i+j]===x))return true;return false})||''};
const bkOfCu=c=>c?(c.bank||ibanBank(c.iban||'')||bankOfCard(c.card)||bkNameBank(c.name||'')||''):'';
function bkLogoFix(){let ch=0;for(const c of bkCus()){if(c.bank)continue;const b=ibanBank(c.iban||'')||bankOfCard(c.card)||bkNameBank(c.name||'');if(b){c.bank=b;c.updatedAt=new Date().toISOString();ch=1}}if(ch)audBg(()=>saveCu());return ch}
const bkAvH=c=>{const b=bkOfCu(c);return b?`<span class="c6a cul bxlogo bkav">${bankBadge(b,'lg')}</span>`:''};
const bkWmH=c=>{const b=c&&c.grp==='بانک'&&bkOfCu(c);return b&&BKL[Object.keys(BKL).find(n=>canon(n)===canon(b))]?`<span class="bkwm" aria-hidden="true">${bankBadge(b,'wm')}</span>`:''};
