/* ============ v61.17: منابع واریزی ارسال‌شده — یک‌جا در «واریز بانکی» ============
   همه بخش‌های یک واریزی ارسال‌شده (خودش + بخش‌های splitOf) در کارت «واریز بانکی» دیده می‌شوند (نه دو جا).
   «ویرایش منابع»: مبلغ و بانک هر بخش عوض می‌شود، بخش تازه اضافه یا بخش اضافی حذف می‌شود؛ جمع همیشه برابر مبلغ بانکی.
   بخش تأییدشده (✓) یا دارای رسید/شماره پیگیری قفل است. همه بخش‌ها در همان لیست پیگیری می‌مانند. */
let SS=null;
const ssLock=it=>it.st==='ok'||!!it.tn||!!it.img||!!(it.imgs||[]).length;
/* بخش‌های ارسال‌شده یک واریزی: [{r,e,q}] — فقط اگر همه بخش‌ها ارسال شده و لیستشان باز است */
function ssFam(x){const F=famOf(x);if(!F.length)return null;const L=F.map(r=>({r,e:entries.find(z=>z.id===r.id),q:entBI(r)}));if(L.some(o=>!o.e||!o.q||o.q.b.closed))return null;return L}
const ssCan=x=>{if(!x||!x.sentBid||!can('split')||sources.length<2)return false;const L=ssFam(x);return !!L&&L.some(o=>!ssLock(o.q.it))};
const ssLeft=()=>SS.R-SS.L.reduce((a,l)=>a+(+l.amount||0),0);
function ssChips(l,i){return `<div class="pssc">${DSRC().map(z=>{const bk=acBank(z),on=String(z.id)===String(l.to);return `<button type="button" class="psch${on?' on':''}" data-act="ssSrc" data-i="${i}" data-s="${z.id}">${bk?bankBadge(bk):`<span class="bkb" style="--bc:#64748b">${esc(userInit(z.name))}</span>`}<span>${esc(z.name)}</span></button>`}).join('')}</div>`}
function ssCard(l,i){const so=sources.find(z=>String(z.id)===String(l.to)),bk=so&&acBank(so),stx=l.st==='ok'?'تأیید شده':l.st==='fail'?'ناموفق':l.nw?'بخش تازه':'در انتظار تأیید';
  if(l.lock)return `<div class="psc sslk"><div class="psch0"><span class="psn">${toFa(i+1)}</span><b>${esc(so?so.name:l.src)}</b><em class="sstag k">${ic('check')} ${l.st==='ok'?'تأیید شده':'رسید/پیگیری دارد'} · قفل</em></div><div class="ssrow">${bk?bankBadge(bk):''}<span class="tx"><b>${fmt(l.amount)}<i>تومان</i></b></span></div></div>`;
  return `<div class="psc" data-i="${i}"><div class="psch0"><span class="psn">${toFa(i+1)}</span><b>${i===0?'بخش اصلی':'بخش '+toFa(i+1)}</b><em class="sstag ${l.st==='fail'?'f':l.nw?'n':'w'}">${stx}</em>${i>0?`<button type="button" class="itx" data-act="ssDel" data-i="${i}" aria-label="حذف بخش">×</button>`:''}</div>
  ${ssChips(l,i)}<label class="psa"><input class="ltr" data-sa="${i}" inputmode="numeric" value="${l.amount?Number(l.amount).toLocaleString('en-US'):''}" placeholder="مبلغ این بخش" autocomplete="off"><i>تومان</i><button type="button" class="pshalf" data-act="ssRest" data-i="${i}">بقیه</button></label></div>`}
function ssHTML(){return `<div class="sh-h"><div><b>منابع واریز بانکی</b><small class="shsub">${esc(SS.name)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="psh"><small>مبلغ واریز بانکی</small><b>${fmt(SS.R)}<i>تومان</i></b><div class="psbar"><i id="ssBar"></i></div><span id="ssLeft" class="psleft"></span></div>
  <div class="psl2" id="ssL">${SS.L.map(ssCard).join('')}</div>
  <button type="button" class="psadd" data-act="ssAdd">${ic('plus')} بانک دیگر</button>
  <div class="muted psnote">همه بخش‌ها در همان لیست پیگیری زیر بانک خودشان می‌مانند؛ بخش تازه «در انتظار تأیید» است و مانده بانک‌ها خودکار درست می‌شود.</div>
  <button class="xgo" id="ssGo" data-act="ssSave">${ic('check')} ثبت</button>`}
function ssPaint(skip){const R=SS.R,left=ssLeft(),s=R-left,b=$('ssBar'),l=$('ssLeft'),g=$('ssGo');
  if(b){b.style.width=Math.min(100,R?s/R*100:0)+'%';b.className=left===0?'ok':left<0?'over':''}
  if(l){l.className='psleft '+(left===0?'ok':left<0?'over':'');l.innerHTML=left===0?`${ic('check')} جمع بخش‌ها برابر مبلغ بانکی`:left>0?`مانده <b>${fmt(left)}</b>`:`بیشتر از مبلغ: <b>${fmt(-left)}</b>`}
  const ok=left===0&&SS.L.every(x=>+x.amount>0&&x.to)&&ssDirty();if(g){g.disabled=!ok;g.innerHTML=`${ic('check')} ${SS.L.length>1?'ثبت '+toFa(SS.L.length)+' بخش':'ثبت'}`}
  document.querySelectorAll('#sheet [data-sa]').forEach(el=>{const i=+el.dataset.sa;if(i===skip)return;const v=+SS.L[i].amount||0,t=v?v.toLocaleString('en-US'):'';if(el.value!==t){el.value=t;const c=el.closest('.psc');if(c&&!RM()&&c.animate)c.animate([{boxShadow:'0 0 0 2px var(--blu)'},{boxShadow:'0 0 0 1px var(--line)'}],{duration:500})}})}
const ssDirty=()=>SS.L.length!==SS.L0.length||SS.L.some((l,i)=>l.nw||+l.amount!==+SS.L0[i].amount||String(l.to)!==String(SS.L0[i].to));
/* «بقیه» خودکار به بخش اصلی (بانک اول) برمی‌گردد؛ اگر آن دستی عوض شده یا قفل است، به آخرین بخش باز دست‌نخورده */
function ssAuto(ch){const E=SS.L.map((l,i)=>i).filter(i=>!SS.L[i].lock&&i!==ch&&!SS.L[i].man),k=E.includes(0)?0:E[E.length-1];if(k==null)return;const s=SS.L.reduce((a,l,i)=>i===k?a:a+(+l.amount||0),0);SS.L[k].amount=Math.max(0,SS.R-s)}
function ssRedraw(){$('sheet').innerHTML=ssHTML();ssBind();ssPaint()}
function ssBind(){const sh=$('sheet');sh.oninput=e=>{const t=e.target;if(t.dataset.sa==null)return;const i=+t.dataset.sa;
  const pos=t.selectionStart||0,bf=toEn(t.value.slice(0,pos)).replace(/\D/g,'').length,v=num(t.value);t.value=v?v.toLocaleString('en-US'):'';
  let p=0,d=0;while(p<t.value.length&&d<bf){if(/\d/.test(t.value[p]))d++;p++}try{t.setSelectionRange(p,p)}catch(_){}SS.L[i].amount=v;SS.L[i].man=true;ssAuto(i);ssPaint(i)};ssPaint()}
ACT.sentSplit=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!ssCan(x)){toast('بخش‌های این واریزی تأیید شده یا لیستش بایگانی شده است',true);return}const F=ssFam(x);
  const sid=n=>{const s=sources.find(z=>z.name===n);return s?String(s.id):''};
  const L=F.map(o=>({id:o.r.id,amount:+o.q.it.amount||0,to:sid(o.q.it.src),src:o.q.it.src,st:o.q.it.st||'pending',lock:ssLock(o.q.it)}));
  SS={root:famRoot(x),name:fullName(x),R:L.reduce((a,l)=>a+l.amount,0),L,L0:L.map(l=>({...l}))};
  /* v69.7: از پنل «پرداخت از کجا؟» بانک انتخاب‌شده (d.to) می‌آید؛ اگر همان بانک بخشی دارد، همان بخش ویرایش می‌شود */
  const ex=d.to!=null&&L.find(l=>l.to===String(d.to)&&!l.lock);
  if(d.to!=null&&!ex)SS.L.push({nw:1,amount:0,to:String(d.to),st:'pending'});
  else if(L.length===1){const o=DSRC().find(z=>String(z.id)!==L[0].to);SS.L.push({nw:1,amount:0,to:o?String(o.id):'',st:'pending'})}
  sheet(ssHTML());ssBind();setTimeout(()=>{const I=document.querySelector('#sheet .psc:last-child [data-sa]');if(I&&cur==='ent')I.focus()},360)};
ACT.ssAdd=()=>{const used=new Set(SS.L.map(l=>String(l.to))),o=DSRC().find(z=>!used.has(String(z.id)));SS.L.push({nw:1,amount:0,to:o?String(o.id):'',st:'pending'});ssAuto(-1);ssRedraw();
  const c=document.querySelector('#sheet .psc:last-child');if(c){if(!RM()&&c.animate)c.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.2,.9,.25,1)'});const f=c.querySelector('[data-sa]');if(f)setTimeout(()=>f.focus(),60)}};
ACT.ssDel=d=>{const i=+d.i;if(!i||!SS.L[i]||SS.L[i].lock)return;SS.L.splice(i,1);SS.L.forEach(l=>l.man=false);ssAuto(-1);ssRedraw()};
ACT.ssSrc=d=>{const l=SS&&SS.L[+d.i];if(!l||l.lock)return;l.to=String(d.s);const c=document.querySelector(`#sheet .psc[data-i="${d.i}"]`);if(c)c.querySelectorAll('.psch').forEach(b=>b.classList.toggle('on',b.dataset.s===l.to));ssPaint()};
ACT.ssRest=d=>{const i=+d.i,l=SS.L[i];if(!l||l.lock)return;const s=SS.L.reduce((a,x,k)=>k===i?a:a+(+x.amount||0),0);l.amount=Math.max(0,SS.R-s);l.man=true;ssPaint()};
/* بخش ارسال‌شده بانک to در همان پیگیری (یا یکی تازه) */
function ssPartFor(bid,to,pay){let p=allParts().find(z=>z.sent&&z.bid===bid&&String(z.src.id)===String(to.id));if(!p){p={id:nid++,src:{id:to.id,name:to.name,bank:to.bank||'',limit:0},method:'manual',param:{},ids:[],sent:true,bid,at:new Date().toISOString()};addPart(p,pay)}return p}
ACT.ssSave=()=>{if(!SS)return;if(ssLeft()!==0||SS.L.some(l=>!(+l.amount>0)||!l.to)){toast('جمع بخش‌ها باید برابر مبلغ بانکی و هر بخش بانک و مبلغ داشته باشد',true);return}
  const x=validated().find(r=>r.id===SS.root),F=x&&ssFam(x);if(!F||F.length!==SS.L0.length||F.some((o,i)=>o.r.id!==SS.L0[i].id||ssLock(o.q.it)!==!!SS.L0[i].lock||(+o.q.it.amount||0)!==SS.L0[i].amount)){toast('این واریزی همین الان عوض شد؛ دوباره باز کنید',true);closeSheet();return}
  const now=new Date().toISOString(),root=F[0],b0=root.q.b,pay=PD(root.r),keepIds=new Set(SS.L.filter(l=>l.id).map(l=>l.id)),out=[];
  /* بخش‌های حذف‌شده */
  F.filter(o=>!keepIds.has(o.r.id)).forEach(o=>{o.q.b.items=o.q.b.items.filter(z=>z.id!==o.r.id);allParts().forEach(p=>{if((p.ids||[]).includes(o.r.id)){p.ids=p.ids.filter(z=>z!==o.r.id);if(!p.ids.length)delPart(p)}});out.push(o.r.id)});
  SS.L.forEach(l=>{const to=sources.find(z=>String(z.id)===String(l.to));if(!to)return;
    if(l.id){const o=F.find(z=>z.r.id===l.id),it=o.q.it,e=o.e;if(l.lock)return;const dA=(+l.amount)-(+it.amount||0);
      if(dA){e.amount=(+e.amount||0)+dA;e.updatedAt=now;e.updatedBy=who();it.amount=+l.amount;if(it.total!=null)it.total=(+it.total||0)+dA;it.at=now}
      if(it.src!==to.name){allParts().forEach(p=>{if((p.ids||[]).includes(e.id)&&p.sent){p.ids=p.ids.filter(z=>z!==e.id);if(!p.ids.length)delPart(p)}});const p=ssPartFor(o.q.b.id,to,pay);if(!p.ids.includes(e.id))p.ids.push(e.id);it.src=to.name;it.pid=p.id;it.at=now}
      return}
    const e=root.e,n={id:nid++,splitOf:SS.root,name:e.name,title:e.title||'',code:e.code||'',iban:e.iban||'',card:e.card||'',bank:e.bank||'',holder:e.holder||'',phone:e.phone||'',nid:e.nid||'',entryDate:e.entryDate,payDate:e.payDate||e.entryDate,amount:+l.amount,settles:[],note:'',sentBid:b0.id,createdBy:who(),updatedBy:who(),updatedAt:now};entries.push(n);
    const p=ssPartFor(b0.id,to,pay);p.ids.push(n.id);const it0=root.q.it;
    b0.items.push({sAt:now,pay:it0.pay||pay,id:n.id,name:it0.name,title:it0.title||'',code:it0.code||'',amount:+l.amount,total:+l.amount,settled:0,settles:[],iban:it0.iban,bank:it0.bank||'',src:to.name,pid:p.id,st:'pending'})});
  if(out.length)trashIds(out,'حذف بخش از منابع واریز بانکی');memoClear();saveE();saveB();saveD();
  logA('split','ویرایش منابع واریز بانکی',SS.name+' | '+SS.L.map(l=>{const so=sources.find(z=>String(z.id)===String(l.to));return (so?so.name:'—')+' '+fmt(l.amount)}).join('، '));
  const n=SS.L.length;SS=null;closeSheet();numMorph('#view .stl .brv b',()=>{const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y});
  const nw=document.querySelectorAll('#view .stl .stlrw');if(!RM())nw.forEach((r,i)=>r.animate&&r.animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:340,delay:i*50,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'}));
  toast(n>1?'واریز بین '+toFa(n)+' بانک تقسیم شد':'منبع واریز ثبت شد')};

/* ============ v69.4 (خواسته صاحب اپ): واریزی ارسال‌شده — مبلغ دلخواه از بانک دیگر، و برگرداندن به تخصیص ============
   مشکل: بعد از ارسال، «تغییر بانک» (از لیست) فقط «همه مبلغ از یک منبع» داشت و هر بانکی زده می‌شد کل مبلغ می‌رفت؛
   و برای پس گرفتن یک واریزی ارسال‌شده راهی جز حذف کل واریزی نبود.
   حالا: در همان پنجره، «بخشی از مبلغ از بانک دیگر» (همان پنجره منابع، مبلغ دلخواه) و «برگرداندن به تخصیص» بالای فهرست بانک‌ها؛
   در جزئیات واریزی هم «برگرداندن به تخصیص» زیر کارت واریز بانکی. برگرداندن فقط برای بخش‌هایی که تأیید، شماره پیگیری یا رسید ندارند؛
   واریزی با همان بانک به تخصیص همان تاریخ واریز برمی‌گردد (ارسال‌نشده) و از پیگیری برداشته می‌شود. */
/* v69.6: بخش‌های ارسال‌شده (اگر بخشی هنوز ارسال نشده، همان در تخصیص می‌ماند) */
function unsendFam(x){const F=famOf(x).filter(r=>r.sentBid).map(r=>({r,e:entries.find(z=>z.id===r.id),q:entBI(r)}));if(!F.length||F.some(o=>!o.e||!o.q||o.q.b.closed||ssLock(o.q.it)))return null;return F}
const unsendCan=x=>!!x&&!!x.sentBid&&can('split')&&!!unsendFam(x);
function unsentRowsHTML(one){const a=ssCan(one),b=unsendCan(one);if(!a&&!b)return '';
  return `${a?`<button class="acrow mvps" data-act="mvSentSplit" data-id="${one.id}"><span class="bkb lg mvpsi">${ic('split')}</span><span class="tx"><b>بخشی از مبلغ از بانک دیگر</b><small>مبلغ دلخواه را بزنید؛ بقیه در بانک فعلی می‌ماند</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`:''}${b?`<button class="acrow mvun" data-act="entUnsend" data-id="${one.id}"><span class="bkb lg mvuni">${ic('undo')}</span><span class="tx"><b>برگرداندن به تخصیص</b><small>از پیگیری برداشته می‌شود و دوباره ارسال‌نشده است</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`:''}<div class="mvor"><span>یا همه مبلغ از یک منبع</span></div>`}
ACT.mvSentSplit=d=>{closeSheet();setTimeout(()=>ACT.sentSplit({id:d.id}),80)};
ACT.entUnsend=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;const root=validated().find(r=>r.id===famRoot(x))||x;
  if(!unsendCan(root)){toast('این واریزی تأیید شده، شماره پیگیری یا رسید دارد، یا لیستش بایگانی شده؛ برنمی‌گردد',true);return}
  const F=unsendFam(root),tot=F.reduce((a,o)=>a+(+o.q.it.amount||0),0);
  askConfirm(`«${fullName(root)}» (${fmt(tot)} تومان${F.length>1?'، '+toFa(F.length)+' بخش':''}) از ارسال برگردد به تخصیص؟`,'برگردد',()=>{if(!unsendDo(root))return;
    closeSheet();const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;toast('برگشت به تخصیص — دوباره ارسال‌نشده است')})};
/* برگرداندن از ارسال (بانک هر بخش در تخصیص همان روز می‌ماند) */
function unsendDo(root){const G=unsendFam(root);if(!G){toast('این واریزی همین الان عوض شد؛ دوباره امتحان کنید',true);render();return false}const now=new Date().toISOString(),pay=PD(root),tot=G.reduce((a,o)=>a+(+o.q.it.amount||0),0);
    G.forEach(o=>{const id=o.r.id,b=o.q.b,src=o.q.it.src;b.items=b.items.filter(z=>z.id!==id);if(!b.items.length)batches=batches.filter(z=>z!==b);delete o.e.sentBid;o.e.updatedAt=now;o.e.updatedBy=who();
      let sp=null;allParts().forEach(p=>{if(p.sent&&(p.ids||[]).includes(id)){sp=sp||p;p.ids=p.ids.filter(z=>z!==id);if(!p.ids.length)delPart(p)}});
      const so=sp?sp.src:(z=>z?{id:z.id,name:z.name,bank:z.bank||'',limit:0}:null)(sources.find(z=>z.name===src));if(!so)return;
      let to=allParts().find(p=>!p.sent&&p.pay===pay&&String(p.src.id)===String(so.id));if(!to){to={id:nid++,src:{id:so.id,name:so.name,bank:so.bank||'',limit:0},method:'manual',param:{},ids:[],at:now};addPart(to,pay)}if(!to.ids.includes(id))to.ids.push(id)});
    memoClear();saveE();saveB();saveD();alloc=null;logA('uncommit','برگرداندن واریزی از ارسال',fullName(root)+' | '+fmt(tot)+' تومان | '+G.map(o=>o.q.it.src).join('، '));return true}
/* v69.10 (خواسته صاحب اپ): «حذف تخصیص» — واریزی کامل به اول برمی‌گردد: اگر ارسال شده از پیگیری بیرون می‌آید، بخش‌های بانکی یکی می‌شوند
   و بانکش برداشته می‌شود (در لیست‌ها دوباره «بدون منبع»، در جزئیات «انتخاب بانک»). بخش تأییدشده/رسیددار/پیگیری‌دار قفل است. */
/* v69.13: دلیل دقیق قفل بودن حذف تخصیص (به‌جای پنهان شدن دکمه) */
function unallocWhy(x){if(!can('split'))return 'دسترسی «تقسیم» برای حساب شما فعال نیست';if(x.full)return 'این واریزی کامل با مشتری تسویه شده؛ تخصیص بانکی ندارد';
  const F=famOf(x).map(r=>entBI(r)).filter(Boolean);if(F.some(q=>q.b.closed))return 'لیست پیگیری این واریزی بایگانی شده است';
  const q=F.find(q=>ssLock(q.it));if(q)return 'بخش «'+(q.it.src||'بانک')+'» '+(q.it.st==='ok'?'تأیید شده':q.it.tn?'شماره پیگیری دارد':'رسید دارد')+'؛ اول '+(q.it.st==='ok'?'تأیید را لغو کنید':q.it.tn?'شماره پیگیری را پاک کنید':'رسیدش را بردارید')+'، بعد حذف تخصیص';
  return 'این واریزی تخصیصی ندارد'}
const unallocCan=x=>{if(!x||!can('split')||x.full)return false;const F=famOf(x);if(F.some(r=>r.sentBid))return unsendCan(x);const A=allocMap();return F.length>1||F.some(r=>(A.get(r.id)||{}).src)};
/* v71.1 رفع باگ (خواسته صاحب اپ: «حذف تخصیص عمل نمی‌کند»): بخش ارسال‌شده‌ای که تأیید، پیگیری یا رسید دارد قبلاً فقط پیام می‌داد
   و کاری نمی‌کرد. حالا با هشدار روشن انجام می‌شود: تأیید/پیگیری/رسید آن بخش برداشته و روی خود واریزی در e.unlk نگه داشته می‌شود
   (عکس‌ها پاک نمی‌شوند، فقط از ردیف پیگیری جدا می‌شوند)، بعد همان حذف تخصیص همیشگی. لیست بایگانی‌شده همچنان قفل است. */
const unlkFam=x=>{if(!x||!can('split')||x.full)return null;const F=famOf(x).filter(r=>r.sentBid).map(r=>({r,e:entries.find(z=>z.id===r.id),q:entBI(r)}));
  if(!F.length||F.some(o=>!o.e||!o.q||o.q.b.closed))return null;const L=F.filter(o=>ssLock(o.q.it));return L.length?L:null};
const unlkTxt=L=>L.map(o=>{const it=o.q.it,K=[it.st==='ok'?'تأیید بانک':'',it.tn?'پیگیری '+toFa(it.tn):'',(it.imgs||[]).length||it.img?'رسید':''].filter(Boolean);return '«'+esc(it.src||'بانک')+'»: '+K.join('، ')}).join(' · ');
function unlkDo(L){const now=new Date().toISOString(),B=new Set();L.forEach(o=>{const it=o.q.it,K=(it.imgs&&it.imgs.length?it.imgs:it.img?[it.img]:[]).slice();
  (o.e.unlk=o.e.unlk||[]).push({src:it.src||'',st:it.st||'',tn:it.tn||'',imgs:K,amount:+it.amount||0,bid:o.q.b.id,at:now,by:who()});
  it.st='pending';delete it.tn;delete it.img;delete it.imgs;it.at=now;o.e.updatedAt=now;o.e.updatedBy=who();B.add(o.q.b.id)});saveB();saveE();
  logA('split','برداشتن تأیید/رسید برای حذف تخصیص',L.map(o=>fullName(o.e)+' | '+(o.q.it.src||'')).join('، '))}
ACT.entUnalloc=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;const root=validated().find(r=>r.id===famRoot(x))||x;
  const LK=unallocCan(root)?null:unlkFam(root);
  if(!unallocCan(root)&&!LK){toast(unallocWhy(root),true);return}
  const F=famOf(root),sent=F.some(r=>r.sentBid),tot=F.reduce((a,r)=>a+(+r.amount||0),0);
  askConfirm({html:`تخصیص «${esc(fullName(root))}» برداشته شود؟${sent?' از پیگیری هم بیرون می‌آید و':''} دوباره بدون بانک می‌شود.${LK?`<small class="unlkw">${ic('info')} ${unlkTxt(LK)} — این‌ها از ردیف پیگیری برداشته می‌شوند (روی واریزی نگه داشته می‌شوند)${LK.some(o=>o.q.it.st==='ok')?'؛ اگر بانک واقعاً پرداخت کرده، بعداً دوباره همین بانک را بزنید':''}.</small>`:''}`},'حذف تخصیص',()=>{
    if(LK){const L2=unlkFam(root);if(!L2){toast('این واریزی همین الان عوض شد؛ دوباره امتحان کنید',true);render();return}unlkDo(L2)}
    if(sent&&!unsendDo(root))return;const R=validated().find(r=>r.id===root.id)||root,G=famOf(R);
    if(G.length>1){PS={root:famRoot(R),name:fullName(R),pay:PD(R),R:sum(G),L:[{src:'',amount:sum(G)}]};psApply()}
    else{allParts().forEach(p=>{if(!p.sent&&(p.ids||[]).includes(R.id)){p.ids=p.ids.filter(z=>z!==R.id);if(!p.ids.length)delPart(p)}});memoClear();saveD();alloc=null}
    logA('split','حذف تخصیص',fullName(R)+' | '+fmt(tot)+' تومان');closeSheet();if(cur==='batch'&&typeof curB==='function'&&!curB()){go('split1');toast('تخصیص برداشته شد');return}const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;toast('تخصیص برداشته شد — دوباره بانک را انتخاب کنید')})};

