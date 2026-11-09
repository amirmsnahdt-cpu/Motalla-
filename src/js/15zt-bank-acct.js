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
function lkGoTx(t,why){if(t.bl){toast('این سند از «لیست واریز» آمده؛ '+why+' از خود لیست واریز',true);ldKey=t.date;go('lday');return}
  const C=custs.find(z=>String(z.id)===String(t.lk.cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(t.lk.tx)&&!z.del);
  toast('این سند طرف مقابل «'+(C?cuName(C):'')+'» است؛ '+why+' از سند اصلی',true);if(T)invOpen(C.id,T.id)}
/* ----- حساب بانک ↔ بانک واریزی‌ها ----- */
const bkSrcOf=c=>c&&c.srcId!=null&&c.srcId!==''?sources.find(s=>String(s.id)===String(c.srcId))||null:null;
function bkLinkHTML(c){if(!c||c.grp!=='بانک'||!can('src'))return '';const s=bkSrcOf(c);
  if(s)return `<div class="bklk on"><span class="bkdi">${ic('list')}</span><span class="tx"><b>لیست‌های واریز «${esc(s.name)}» اینجا سند می‌خورد</b><small>از ${esc(dates(String(c.srcAt||'').slice(0,10)||todayISO()).fa)} به بعد</small></span><button type="button" class="lnk" data-act="bkLinkM" data-cu="${c.id}">تغییر</button></div>`;
  const L=ownL();if(!L.length)return '';const m=L.find(z=>canon(z.name)===canon(c.name));
  return `<div class="bklk"><span class="bkdi">${ic('list')}</span><span class="tx"><b>واریزی‌های لیست از کدام بانک ارسال می‌شود؟</b><small>از این به بعد هر لیست واریزِ همان بانک، اینجا خودکار سند می‌خورد</small></span><button type="button" class="bklkb" data-act="bkLinkM" data-cu="${c.id}">${m?esc(m.name):'انتخاب'}</button></div>`}
ACT.bkLinkM=(d,e)=>{const c=custs.find(z=>String(z.id)===String(d.cu));if(!c)return;const T=e&&e.target&&e.target.closest('button');
  popMenu(T,[...ownL().map(s=>['bkLinkS',ic(bkSrcOf(c)&&String(c.srcId)===String(s.id)?'check':'bank'),s.name,{cu:c.id,s:s.id}]),bkSrcOf(c)?['bkLinkS',ic('x'),'قطع اتصال',{cu:c.id,s:''}]:null].filter(Boolean))};
ACT.bkLinkS=d=>{const c=custs.find(z=>String(z.id)===String(d.cu));if(!c)return;const now=new Date().toISOString();
  if(d.s===''||d.s==null){delete c.srcId;delete c.srcAt}else{const s=sources.find(z=>String(z.id)===String(d.s));if(!s)return;
    const other=bkCus().find(z=>z!==c&&String(z.srcId)===String(s.id));if(other){toast('«'+s.name+'» به حساب «'+cuName(other)+'» وصل است',true);return}
    if(String(c.srcId)!==String(s.id)){c.srcId=s.id;c.srcAt=now}}
  c.updatedAt=now;bkDepSync(c,1);saveCu();logA('cust','اتصال حساب بانک به لیست‌های واریز',cuName(c)+' ← '+((bkSrcOf(c)||{}).name||'قطع'));render();toast(bkSrcOf(c)?'وصل شد':'اتصال قطع شد')};
/* لیست‌های ارسال‌شده از بانک وصل‌شده → سند «لیست واریز» در حساب بانک (یکی برای هر بچ) */
function bkDepSync(c,noSave){const s=bkSrcOf(c),now=new Date().toISOString();let ch=0;const want=new Map();
  if(s){const from=c.srcAt||'';for(const b of batches)for(const x of b.items||[]){if(x.src!==s.name||x.st==='fail')continue;const at=x.sAt||b.createdAt||'';if(from&&String(at)<from)continue;
      const k=String(b.id),o=want.get(k)||{a:0,n:0,date:b.pay||b.date||String(at).slice(0,10),at};o.a+=+x.amount||0;o.n++;want.set(k,o)}}
  for(const t of c.txs||[]){if(t.del||!t.bl)continue;const w=want.get(String(t.bl));const p=(t.pays||[])[0]||{};
    if(!w||!w.a){t.del=true;t.delAt=now;t.delBy='خودکار';ch=1;continue}
    if(+p.amount!==Math.round(w.a)||p.n!==w.n){p.amount=Math.round(w.a);p.n=w.n;t.edAt=now;ch=1}want.delete(String(t.bl))}
  for(const [k,w] of want){if(!w.a)continue;(c.txs=c.txs||[]).push({id:nid++,type:'inv',dk:'in',no:invNext(),date:w.date,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,
    pays:[{m:'dls',amount:Math.round(w.a),n:w.n,bid:k,src:s.name}],note:'',bl:k,at:w.at||now,by:'خودکار',cn:cnNext(c)});ch=1}
  if(ch){c.lastAt=now;if(!noSave)audBg(()=>saveCu())}return ch}
function bkDepSyncAll(){let ch=0;for(const c of bkCus())if(bkSrcOf(c)||(c.txs||[]).some(t=>t.bl&&!t.del))ch+=bkDepSync(c,1);if(ch)audBg(()=>saveCu());return ch}
/* ردیف‌های «انتقال» قدیمی که طرف مقابل یک سند بودند (xf با inv) در جا به سند طرف مقابل تبدیل می‌شوند (همان شناسه و همان اثر) */
function lnkUpgrade(c){let ch=0;for(const t of c.txs||[]){if(t.del||t.type!=='xf'||!t.inv||t.peer)continue;const C=custs.find(z=>String(z.id)===String(t.inv.cu)),T=C&&(C.txs||[]).find(z=>String(z.id)===String(t.inv.tx));
    const p=T&&(T.pays||[]).find(q=>String(q.xfId)===String(t.id));if(!p)continue;const r=+t.r||0;
    Object.assign(t,{type:'inv',dk:r<0?'in':'out',no:T.no,rate:0,mz:0,items:[],xr:[],tax:false,disc:0,sub:0,total:0,pays:[{m:'lnk',lm:p.m,amount:r,cuId:C.id,cuName:cuName(C),...(p.why?{why:p.why}:{})}],lk:{cu:C.id,tx:T.id},note:'',cn:cnNext(c)});
    delete t.inv;delete t.r;delete t.g;ch=1}
  if(ch)audBg(()=>saveCu());return ch}
