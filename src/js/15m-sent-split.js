/* ============ v61.14: تغییر منبع بخشی از واریزی ارسال‌شده ============
   وقتی واریزی به پیگیری رفته ولی بخشی از مبلغ از بانک دیگری پرداخت شده (یا باید بشود):
   مبلغ بخش جدید از همان ردیف پیگیری کم می‌شود و یک بخش همراه (splitOf) با منبع دیگر، در همان لیست پیگیری
   با وضعیت «در انتظار تأیید» ساخته می‌شود. هر بخش جدا تأیید/ناموفق و در مانده بانک‌ها حساب می‌شود.
   ردیف‌هایی که بانک تأیید کرده (✓) تقسیم نمی‌شوند. */
let SS=null;
const ssItem=x=>{const q=entBI(x);return q&&!q.b.closed?q:null};
const ssCan=x=>{if(!x||!x.sentBid||x.full||!can('split')||sources.length<2)return false;const q=ssItem(x);return !!q&&q.it.st!=='ok'&&(+q.it.amount||0)>1};
function ssBtn(x){return ssCan(x)?`<button class="stladd sssbtn" data-act="sentSplit" data-id="${x.id}">${ic('split')} بخشی از مبلغ از بانک دیگر</button>`:''}
const ssSrc0=()=>sources.find(z=>z.name===SS.src0);
function ssHTML(){const X=SS.X,A=+SS.A||0,left=X-A,ok=A>0&&A<X&&SS.to,s0=ssSrc0(),bk0=s0&&acBank(s0);
  const chips=sources.filter(z=>z.name!==SS.src0).map(z=>{const bk=acBank(z),on=String(z.id)===String(SS.to);return `<button type="button" class="psch${on?' on':''}" data-act="ssSrc" data-s="${z.id}">${bk?bankBadge(bk):`<span class="bkb" style="--bc:#64748b">${esc(userInit(z.name))}</span>`}<span>${esc(z.name)}</span></button>`}).join('');
  return `<div class="sh-h"><div><b>بخشی از مبلغ از بانک دیگر</b><small class="shsub">${esc(SS.name)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="psh"><small>مبلغ ارسال‌شده از ${esc(SS.src0)}</small><b>${fmt(X)}<i>تومان</i></b><div class="psbar"><i id="ssBar" style="width:${Math.min(100,X?A/X*100:0)}%"></i></div><span id="ssLeft" class="psleft ${A>=X?'over':A>0?'ok':''}">${A>=X?'مبلغ بخش جدید باید کمتر از کل باشد':A>0?`${ic('check')} جمع دو بخش برابر کل`:'مبلغ و بانک بخش جدید را بزنید'}</span></div>
  <div class="psl2">
    <div class="psc ss0"><div class="psch0"><span class="psn">۱</span><b>می‌ماند در ${esc(SS.src0)}</b></div><div class="ssrow">${bk0?bankBadge(bk0):`<span class="bkb" style="--bc:#64748b">${esc(userInit(SS.src0))}</span>`}<span class="tx"><b id="ssK" class="${left>0?'':'r'}">${fmt(Math.max(0,left))}</b><small>${esc(SS.stTx)}${SS.tn?' · پیگیری '+esc(toFa(SS.tn)):''}</small></span></div></div>
    <div class="psc"><div class="psch0"><span class="psn">۲</span><b>بخش جدید</b></div><div class="pssc">${chips}</div>
    <label class="psa"><input id="ssA" class="ltr" inputmode="numeric" value="${A?A.toLocaleString('en-US'):''}" placeholder="مبلغ پرداخت از این بانک" autocomplete="off"><i>تومان</i><button type="button" class="pshalf" data-act="ssHalf">نصف</button></label></div></div>
  <div class="muted psnote">بخش جدید در همین لیست پیگیری زیر بانک خودش با وضعیت «در انتظار تأیید» می‌آید و جدا تأیید و در مانده بانک‌ها حساب می‌شود.</div>
  <button class="xgo" id="ssGo" data-act="ssSave"${ok?'':' disabled'}>${ic('check')} ثبت دو بخش</button>`}
function ssPaint(){const X=SS.X,A=+SS.A||0,left=X-A,b=$('ssBar'),l=$('ssLeft'),k=$('ssK'),g=$('ssGo');
  if(b)b.style.width=Math.min(100,X?A/X*100:0)+'%';if(k){k.textContent=fmt(Math.max(0,left));k.className=left>0?'':'r'}
  if(l){l.className='psleft '+(A>=X?'over':A>0?'ok':'');l.innerHTML=A>=X?'مبلغ بخش جدید باید کمتر از کل باشد':A>0?`${ic('check')} جمع دو بخش برابر کل`:'مبلغ و بانک بخش جدید را بزنید'}
  if(g)g.disabled=!(A>0&&A<X&&SS.to)}
function ssBind(){const I=$('ssA');if(!I)return;I.oninput=()=>{const pos=I.selectionStart||0,bf=toEn(I.value.slice(0,pos)).replace(/\D/g,'').length,v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';
  let p=0,d=0;while(p<I.value.length&&d<bf){if(/\d/.test(I.value[p]))d++;p++}try{I.setSelectionRange(p,p)}catch(_){}SS.A=v;ssPaint()}}
ACT.sentSplit=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!ssCan(x)){toast('این واریزی قابل تقسیم نیست (تأییدشده یا بایگانی)',true);return}const q=ssItem(x);
  const o=sources.find(z=>z.name!==q.it.src);SS={id:x.id,bid:q.b.id,name:fullName(x),X:+q.it.amount||0,src0:q.it.src,tn:q.it.tn||'',stTx:q.it.st==='fail'?'ناموفق':'در انتظار تأیید',A:0,to:o?String(o.id):''};
  sheet(ssHTML());ssBind();setTimeout(()=>{const I=$('ssA');if(I&&cur==='ent')I.focus()},360)};
ACT.ssSrc=d=>{if(!SS)return;SS.to=String(d.s);document.querySelectorAll('#sheet .psch').forEach(b=>b.classList.toggle('on',b.dataset.s===SS.to));ssPaint()};
ACT.ssHalf=()=>{if(!SS)return;SS.A=Math.round(SS.X/2);const I=$('ssA');if(I)I.value=SS.A.toLocaleString('en-US');ssPaint()};
ACT.ssSave=()=>{if(!SS)return;const A=+SS.A||0,e=entries.find(z=>z.id===SS.id),b=batches.find(z=>z.id===SS.bid),it=b&&b.items.find(z=>z.id===SS.id),to=sources.find(z=>String(z.id)===String(SS.to));
  if(!e||!b||!it||b.closed||it.st==='ok'){toast('وضعیت این واریزی عوض شده؛ دوباره باز کنید',true);closeSheet();return}
  if(!to){toast('بانک بخش جدید را انتخاب کنید',true);return}if(!(A>0&&A<(+it.amount||0))){toast('مبلغ بخش جدید باید از کل کمتر باشد',true);return}
  const now=new Date().toISOString(),root=entries.find(z=>z.id===famRoot(e))||e,pay=PD(validated().find(r=>r.id===e.id)||e);
  e.amount=(+e.amount||0)-A;e.updatedAt=now;e.updatedBy=who();it.amount=(+it.amount||0)-A;if(it.total!=null)it.total=(+it.total||0)-A;
  const n={id:nid++,splitOf:root.id,name:e.name,title:e.title||'',code:e.code||'',iban:e.iban||'',card:e.card||'',bank:e.bank||'',holder:e.holder||'',phone:e.phone||'',nid:e.nid||'',entryDate:e.entryDate,payDate:e.payDate||e.entryDate,amount:A,settles:[],note:'',sentBid:b.id,createdBy:who(),updatedBy:who(),updatedAt:now};entries.push(n);
  /* تخصیص ارسال‌شده همان لیست و همان پیگیری برای بانک جدید (یا یکی تازه) */
  const fromP=allParts().find(p=>(p.ids||[]).includes(e.id));let toP=null;
  if(fromP){toP=allParts().find(p=>p.sent&&p.bid===b.id&&String(p.src.id)===String(to.id));if(!toP){toP={id:nid++,src:{id:to.id,name:to.name,bank:to.bank||'',limit:0},method:'manual',param:{},ids:[],sent:true,bid:b.id,at:now};addPart(toP,fromP.pay||pay)}toP.ids.push(n.id)}
  b.items.push({sAt:now,pay:it.pay||pay,id:n.id,name:it.name,title:it.title||'',code:it.code||'',amount:A,total:A,settled:0,settles:[],iban:it.iban,bank:it.bank||'',src:to.name,...(toP?{pid:toP.id}:{}),st:'pending'});
  memoClear();saveE();saveB();saveD();logA('split','تغییر منبع بخشی از واریزی ارسال‌شده',SS.name+' | '+SS.src0+' '+fmt(it.amount)+'، '+to.name+' '+fmt(A),{ids:[e.id,n.id]});
  const U={id:e.id,nid:n.id,bid:b.id,A,pid:toP&&toP.id};SS=null;closeSheet();const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;
  toast(fmt(A)+' تومان به '+to.name+' رفت · مانده '+fmt(it.amount),'','برگرداندن',()=>ssUndo(U))};
function ssUndo(U){const b=batches.find(z=>z.id===U.bid),it=b&&b.items.find(z=>z.id===U.id),ni=b&&b.items.find(z=>z.id===U.nid),e=entries.find(z=>z.id===U.id);
  if(!b||!it||!ni||!e||ni.st!=='pending'||ni.tn||ni.img||(ni.imgs||[]).length){toast('بخش جدید تغییر کرده و برنمی‌گردد',true);return}
  b.items=b.items.filter(z=>z.id!==U.nid);it.amount=(+it.amount||0)+U.A;if(it.total!=null)it.total=(+it.total||0)+U.A;e.amount=(+e.amount||0)+U.A;e.updatedAt=new Date().toISOString();e.updatedBy=who();
  const p=U.pid&&findPart(U.pid);if(p){p.ids=p.ids.filter(z=>z!==U.nid);if(!p.ids.length)delPart(p)}
  trashIds([U.nid],'برگرداندن تقسیم بخشی از واریزی');memoClear();saveE();saveB();saveD();logA('split','برگرداندن تقسیم بخشی از واریزی',fmt(U.A)+' تومان');
  const v=$('view'),y=v?v.scrollTop:0;render();if(v)v.scrollTop=y;toast('تقسیم برگشت')}
