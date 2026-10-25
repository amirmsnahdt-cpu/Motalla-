/* ================= v21: کشیدن برای حذف (راست) / ویرایش (چپ) ================= */
/* ================= v22: کشیدن به سبک آیفون (دکمه‌ها از دو طرف) ================= */
function swW(inner,o){let R=o.r,L=o.l;
  if(!R&&!L){R=[];L=[];if(o.edit)R.push([o.edit,o.el||'ویرایش','edit','#3b6fd6']);if(o.copy)R.push([o.copy,'کپی','copy','#b8862b']);if(o.del)L.push([o.del,o.dl||'حذف','trash','#d23c48'])}
  R=R.filter(a=>canAct(a[0],o.data));L=L.filter(a=>canAct(a[0],o.data));
  const da=Object.entries(o.data||{}).map(([k,v])=>` data-${k}="${esc(v)}"`).join('');
  const btn=a=>`<button class="swb" data-act="${a[0]}"${da} style="--c:${a[3]}">${ic(a[2])}<span>${a[1]}</span></button>`;
  const fk=o.data&&o.data.id!=null?` data-fk="r${esc(o.data.id)}"`:'';
  return `<div class="swr"${fk} data-nr="${R.length}" data-nl="${L.length}">${R.length?`<div class="swa r">${R.map(btn).join('')}</div>`:''}${L.length?`<div class="swa l">${L.map(btn).join('')}</div>`:''}<div class="swc">${inner}</div></div>`}
let swT=0;
const swTip=()=>ls.get('m_swiped2',false)?'':`<div class="swtip">ردیف را بکشید: <i>به چپ ← ویرایش و کپی</i><i>به راست → حذف</i></div>`;
const edgeOK=()=>!slideDown()&&(!!PARENT[cur]||(cur==='entry'&&editId))&&$('ov').classList.contains('hide')&&$('pv').classList.contains('hide');
(()=>{let s=null,open=null;const BW=76;
  const setX=(w,x,anim)=>{const c=w.querySelector(':scope>.swc'),r=w.querySelector(':scope>.swa.r'),l=w.querySelector(':scope>.swa.l');
    [c,r,l].forEach(e=>{if(e)e.style.transition=anim?'':'none'});c.style.transform=x?`translateX(${x}px)`:'';if(r)r.style.width=(x<0?-x:0)+'px';if(l)l.style.width=(x>0?x:0)+'px';w.classList.toggle('on',!!x);w._x=x};
  const close=(w,anim=true)=>{if(!w)return;setX(w,0,anim);[...w.querySelectorAll('.swa')].forEach(a=>a.classList.remove('full'));if(open===w)open=null};
  window.swClose=()=>close(open);
  document.addEventListener('pointerdown',e=>{if(e.button>0)return;const w0=e.target.closest&&e.target.closest('.swr');
    if(open&&open!==w0){close(open);if(w0)swT=Date.now()}
    if(!w0||e.target.closest('.swb,input,textarea,select'))return;
    s={w:w0,x:e.clientX,y:e.clientY,b:w0._x||0,d:w0._x||0,lk:null,id:e.pointerId,nr:+w0.dataset.nr,nl:+w0.dataset.nl}});
  document.addEventListener('pointermove',e=>{if(!s||e.pointerId!==s.id)return;const dx=e.clientX-s.x,dy=e.clientY-s.y;
    if(!s.lk){if(Math.abs(dx)<9&&Math.abs(dy)<9)return;s.lk=Math.abs(dx)>Math.abs(dy)*1.2?'h':'v';if(s.lk==='h'){try{s.w.querySelector('.swc').setPointerCapture(e.pointerId)}catch(_){}}}
    if(s.lk!=='h')return;let d=s.b+dx;if((d<0&&!s.nr)||(d>0&&!s.nl))d*=.08;const W=s.w.offsetWidth;d=Math.max(-W,Math.min(W,d));s.d=d;setX(s.w,d,false);
    const side=s.w.querySelector(d<0?':scope>.swa.r':':scope>.swa.l'),full=Math.abs(d)>W*.58;
    if(side&&full!==side.classList.contains('full')){side.classList.toggle('full',full);if(full&&navigator.vibrate)try{navigator.vibrate(10)}catch(_){}}});
  const end=e=>{if(!s||e.pointerId!==s.id)return;const z=s;s=null;if(z.lk!=='h'){if(open===z.w&&Math.abs(e.clientX-z.x)<9){close(z.w);swT=Date.now()}return}swT=Date.now();
    const W=z.w.offsetWidth,d=z.d,n=d<0?z.nr:z.nl,side=z.w.querySelector(d<0?':scope>.swa.r':':scope>.swa.l');
    if(!ls.get('m_swiped2',false)||(cur==='audit'&&!ls.get('m_hswiped',false))){ls.set('m_swiped2',true);if(cur==='audit')ls.set('m_hswiped',true);document.querySelectorAll('.swtip').forEach(t=>t.remove())}
    if(n&&Math.abs(d)>W*.58&&side){const b=side.querySelector('.swb'),act=ACT[b.dataset.act],ds={...b.dataset};
      if(/^(del|cancel|partDelId|delSrc)$/.test(b.dataset.act)){setX(z.w,d<0?-W:W,true);setTimeout(()=>{act&&act(ds);setTimeout(()=>{if(z.w.isConnected)close(z.w)},350)},220)}
      else{close(z.w);setTimeout(()=>act&&act(ds),120)}return}
    if(n&&Math.abs(d)>Math.min(n*BW,W*.5)*.45){setX(z.w,(d<0?-1:1)*Math.min(n*BW,W*.62),true);side&&side.classList.remove('full');open=z.w}else close(z.w)};
  document.addEventListener('pointerup',end);
  document.addEventListener('pointercancel',e=>{if(!s||e.pointerId!==s.id)return;const z=s;s=null;close(z.w)});
  document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.swb');if(t){setTimeout(()=>{if(open)close(open)},60);return}
    if(Date.now()-swT<400&&e.target.closest&&e.target.closest('.swc')){e.stopPropagation();e.preventDefault()}},true);
})();
/* ================= v22: انتخاب‌گرهای کشویی (مثل آیفون) ================= */
const segPos={};let segQ=0;
function segFx(){segQ=0;const seen={};document.querySelectorAll('.seg:not(.st2):not(.st3),.mseg,.chips').forEach(el=>{
  const bs=[...el.children].filter(x=>x.tagName==='BUTTON'),on=bs.find(b=>b.classList.contains('on'));let t=el.querySelector(':scope>.sth');
  const k0=el.classList[0]+'|'+bs.map(b=>(b.dataset.act||'')+(b.dataset.t||b.dataset.f||b.dataset.m||'')).join(','),k=k0+'#'+(seen[k0]=(seen[k0]||0)+1);
  if(!on||!on.offsetWidth){if(t)t.style.opacity=0;return}
  const L=on.offsetLeft,W=on.offsetWidth,T=on.offsetTop,H=on.offsetHeight,nk=[L,W,T,H].join(',');
  if(!t){t=document.createElement('i');t.className='sth';el.prepend(t);el.classList.add('fx');const p=segPos[k]||[L,W];t.style.transition='none';t.style.left=p[0]+'px';t.style.width=p[1]+'px';t.style.top=T+'px';t.style.height=H+'px';void t.offsetWidth;t.style.transition=''}
  if(t.dataset.k===nk)return;t.style.left=L+'px';t.style.width=W+'px';t.style.top=T+'px';t.style.height=H+'px';t.style.opacity=1;t.dataset.k=nk;segPos[k]=[L,W]})}
new MutationObserver(()=>{if(!segQ)segQ=requestAnimationFrame(segFx)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('resize',()=>requestAnimationFrame(segFx));
/* ================= v22: بازگشت با کشیدن از لبه راست (مثل آیفون) ================= */
/* v58.9: کشیدن از لبه روی یک نوار نامرئی باریک لبه راست (#edgez) گوش داده می‌شود، نه روی کل صفحه —
   تا اسکرول بقیه صفحه منتظر جاوااسکریپت نماند. ضربه کوتاه روی نوار به چیزی که زیرش است می‌رسد. */
(()=>{let g=null;const V=()=>$('view'),EP=()=>['view','bar','act'].map(i=>$(i)).filter(Boolean);
  const Z=document.createElement('div');Z.id='edgez';Z.setAttribute('aria-hidden','true');document.body.appendChild(Z);
  window.edgeZ=()=>{Z.classList.toggle('on',edgeOK())};
  Z.addEventListener('touchstart',e=>{if(e.touches.length!==1||!edgeOK())return;const t=e.touches[0];g={x:t.clientX,y:t.clientY,lk:null,dx:0}},{passive:true});
  Z.addEventListener('touchmove',e=>{if(!g){e.preventDefault();return}const t=e.touches[0],dx=g.x-t.clientX,dy=t.clientY-g.y;
    if(!g.lk){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;g.lk=dx>0&&dx>Math.abs(dy)?'h':'v';if(g.lk!=='h'){g.lk='v'}else{V().classList.add('edge');EP().forEach(el=>{el.style.transition='none'})}}
    e.preventDefault();if(g.lk==='v'){const v=V();if(v)v.scrollTop-=(t.clientY-(g.ly||g.y));g.ly=t.clientY;return}
    g.dx=Math.max(0,dx);EP().forEach(el=>{el.style.transform=`translateX(${-g.dx}px)`})},{passive:false});
  const fin=e=>{if(!g)return;const z=g;g=null;const v=V();v.classList.remove('edge');
    if(!z.lk){/* ضربه کوتاه: به عنصر زیر نوار برسان */if(e&&e.cancelable)e.preventDefault();Z.style.pointerEvents='none';const el=document.elementFromPoint(z.x,z.y);Z.style.pointerEvents='';
      if(el){if(el.matches('input,textarea,select'))el.focus();else{const b=el.closest(PRESS_SEL)||el;b.click()}}return}
    if(z.lk!=='h')return;
    const P=EP(),clr=()=>P.forEach(el=>{el.style.transition='';el.style.transform='';el.style.opacity=''});
    if(z.dx>innerWidth*.28){/* صفحه قبلی همان لحظه زیر ساخته می‌شود و این صفحه از جای انگشت کنار می‌رود (بدون سفیدی) */
      if(cur==='entry'&&editId){clr();ACT.cancelEdit()}else if(FULLP.has(cur))pageLeave((cur==='ent'?PARENT.ent:PARENT[cur])||'home',{side:1,dx:z.dx});else{clr();back()}}
    else{P.forEach(el=>{el.style.transition='transform .26s cubic-bezier(.2,.9,.3,1)';el.style.transform=''});setTimeout(()=>P.forEach(el=>{el.style.transition=''}),280)}};
  Z.addEventListener('touchend',fin,{passive:false});Z.addEventListener('touchcancel',()=>fin(),{passive:true});
})();
/* ================= v21: نوار ناوبری با نشانگر متحرک ================= */
function dockInd(){const d=$('dock');if(!d)return;const o=d.querySelector('.tb.on');if(o){d.style.setProperty('--ix',o.offsetLeft+'px');d.style.setProperty('--iw',o.offsetWidth+'px');d.style.setProperty('--io','1')}else d.style.setProperty('--io','0')}
window.addEventListener('resize',dockInd);
$('view').addEventListener('scroll',()=>{const b=$('bar');if(b)b.classList.toggle('sc',$('view').scrollTop>4)},{passive:true});
let navBack=false;
/* ================= v21: پیگیری — هر منبع یک لیست جدا و بازشونده ================= */
let tkOpen=new Set();
const chevI=()=>ic('chev').replace('class="i"','class="i chv"');
function tlistHTML(){const b=curB();if(!b)return '';const q=tkQ.trim(),qd=toEn(q).replace(/\D/g,'');
  let L=b.items.map((x,i)=>({...x,i})).filter(x=>tkFilter==='all'||x.st===tkFilter);
  if(q)L=L.filter(x=>norm(x.name).includes(norm(q))||(qd.length>=3&&(String(x.amount).includes(qd)||x.iban.includes(qd)||String(x.tn||'').includes(qd)))||norm(x.code).includes(norm(q)));
  if(!L.length)return `<div class="card empty">${ic('search')}<b>${q?'چیزی با «'+esc(q)+'» پیدا نشد':'موردی در این بخش نیست'}</b></div>`;
  const by={},ord=[];L.forEach(x=>{if(!by[x.src]){by[x.src]=[];ord.push(x.src)}by[x.src].push(x)});
  const one=ord.length===1;let h=swTip();
  ord.forEach(s=>{const g=by[s],G=b.items.filter(x=>x.src===s),c=bStat({items:G}),op=one||!!q||tkOpen.has(s),pc=c.all?c.ok/c.all*100:0,pf=c.all?c.fail/c.all*100:0;
    const stt=c.pending?`<span class="w">${fmt(c.pending)} در انتظار</span>`:c.fail?`<span class="f">${fmt(c.fail)} ناموفق</span>`:'<span class="k">کامل ✓</span>';
    h+=`<div class="tg2${op?' open':''}${!c.pending&&!c.fail?' done':''}"><button class="tgh2" data-act="tkGrp" data-s="${esc(s)}" aria-expanded="${op}"><span class="av2">${esc(userInit(s))}</span><span class="tx"><b>${esc(s)}</b><small>${fmt(c.all)} واریزی · ${stt}${(tkFilter!=='all'||q)&&g.length!==G.length?'، '+fmt(g.length)+' نمایش':''}</small><span class="pb2"><i class="ok" style="width:${pc}%"></i><i class="no" style="width:${pf}%"></i></span></span><span class="v"><b>${fmt(sum(G))}</b><small>${fmt(c.ok)} از ${fmt(c.all)}</small></span>${chevI()}</button>
    <div class="tgb">${c.pending&&!b.closed?`<div class="tgtools"><span>${fmt(c.pending)} واریزی منتظر تأیید</span><button class="sm sec" data-act="tkAll" data-s="${esc(s)}">${ic('check')} همه موفق</button></div>`:''}${g.map(x=>trowHTML(x,q,qd,b)).join('')}</div></div>`});
  return h}
const tkMeta=x=>[x.code?'فاکتور '+esc(toEn(x.code)):'',esc(x.bank||''),x.iban?'شبا <bdi dir="ltr">…'+esc(String(x.iban).slice(-4))+'</bdi>':''].filter(Boolean).join(' · ');
const XI='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function tkRow(x,q,qd,b){const hit=qd&&qd.length>=3&&String(x.amount).includes(qd),canBack=x.st==='pending'&&!x.tn&&!x.img;
  const inner=`<div class="tk ${x.st}"><div class="k1"><span class="dot"></span><div class="tx"><b>${q?hl(fullName(x),q):esc(fullName(x))}</b><small>${tkMeta(x)}</small></div><div class="am">${hit?'<mark>'+fmt(x.amount)+'</mark>':fmt(x.amount)}<small>تومان</small></div></div>
  <div class="tog" role="group" aria-label="وضعیت واریز"><button class="ok${x.st==='ok'?' on':''}" data-act="tkSet" data-i="${x.i}" data-st="ok">${ic('check')}${x.st==='ok'?'واریز شد':'انجام شد'}</button><button class="no${x.st==='fail'?' on':''}" data-act="tkSet" data-i="${x.i}" data-st="fail">${XI}ناموفق</button></div>
  <div class="k3"><input class="tni ltr" data-tn="${x.i}" inputmode="numeric" enterkeyhint="done" autocomplete="off" placeholder="شماره پیگیری" value="${esc(x.tn||'')}">
  <button class="mb${x.time?' on':''}" data-act="tkTime" data-i="${x.i}" aria-label="ساعت واریز">${ic('clock')}<span>${x.time?toFa(x.time):'ساعت'}</span></button>
  <label class="mb${x.img?' on':''}" aria-label="عکس رسید">${ic('cam')}<span>${x.img?'رسید ✓':'رسید'}</span><input type="file" accept="image/*" data-img="${x.i}"></label>
  ${x.img?`<button class="mb" data-act="viewImg" data-b="${b.id}" data-id="${x.id}" aria-label="دیدن رسید">${ic('eye')}</button>`:''}<button class="mb" data-act="itOpen" data-b="${b.id}" data-i="${x.i}" aria-label="جزئیات بیشتر">⋯</button></div>
  ${x.requeued?'<div class="note rq">برای واریز مجدد به لیست بعدی منتقل شد</div>':x.st==='fail'?'<div class="note">انجام نشد — با «واریز مجدد ناموفق‌ها» دوباره تقسیم می‌شود</div>':''}</div>`;
  return swW(inner,{r:[['itOpen','جزئیات','eye','#3b6fd6'],['tkCopy','کپی','copy','#b8862b']],l:canBack?[['tkBack','به تقسیم','undo','#6b7385']]:[],data:{b:b.id,i:x.i}})}
function badNotice(iso){const n=validated().filter(r=>r.entryDate===iso&&r.level===2&&!r.sentBid&&!r.full).length;
  return n?`<button class="lrow bad" data-act="tkFixBad" data-iso="${iso}"><span class="ic">!</span><span class="tx"><b>${fmt(n)} واریزی خطادار در تقسیم نیامده</b><small>بزنید تا اصلاح شود؛ بعد از اصلاح در تقسیم ظاهر می‌شود</small></span>${fwd()}</button>`:''}
/* ================= v21: خروجی کامل همه تخصیص‌های روز ================= */
const dayParts=()=>parts().filter(p=>!(p.sent&&batches.some(b=>b.id===p.bid&&b.closed)));
function dlFile(f){/* v61.50: اپ اندروید blob را دانلود نمی‌کند؛ از پل بومی در Download/Motalla */if(window.AndroidBridge&&AndroidBridge.saveFile){rcB64(f).then(d=>AndroidBridge.saveFile(f.name,d,f.type||'application/octet-stream')).catch(()=>toast('ذخیره فایل انجام نشد',true));return true}try{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),8000);return true}catch(e){return false}}
async function expAllGo(){closeSheet();const nm=ctxName(),hasX=typeof XLSX!=='undefined',files=[];
  try{if(hasX)files.push(new File([withCtx(xlsx)],nm+'.xlsx',{type:MIME.xlsx}))}catch(e){}
  files.push(new File(['﻿'+withCtx(txt)],nm+'.txt',{type:'text/plain'}));
  const html=withCtx(reportHTML);autoTrack();let done=false;
  if(isTouch()&&navigator.canShare){try{if(navigator.canShare({files})){await navigator.share({files,title:nm});done=true}}catch(e){if(e&&e.name==='AbortError')done=true}}
  if(!done){files.forEach((f,i)=>setTimeout(()=>dlFile(f),i*350));done=true}
  openPrint(html);toast((hasX?'Excel و متن':'متن')+' آماده شد — PDF را از «چاپ / ذخیره PDF» بگیرید')}
/* ================= v21: تقسیم — انتخاب با «تعداد واریزی» ================= */
function bestN(items,cap,N){if(!items.length||!(N>0))return[];N=Math.min(N,items.length);if(!(cap>0))return items.slice(0,N);
  const n=items.length,g=items.reduce((a,x)=>gcd(a,x.amount),0)||1,u=Math.max(g,Math.ceil(cap*n*N/4e7)),A=items.map(x=>Math.ceil(x.amount/u)),C=Math.floor(cap/u),W=C+1;
  if(C<1)return[];const R=new Int16Array((N+1)*W).fill(-1);R[0]=-2;
  for(let i=0;i<n;i++){const a=A[i];if(a>C)continue;for(let k=Math.min(N,i+1);k>=1;k--){const o=k*W,p=(k-1)*W;for(let s=C;s>=a;s--)if(R[o+s]===-1&&R[p+s-a]!==-1)R[o+s]=i}}
  for(let k=N;k>=1;k--){let s=C;while(s>0&&R[k*W+s]===-1)s--;if(s<=0)continue;const out=[];let kk=k;while(kk>0){const i=R[kk*W+s];out.push(items[i]);s-=A[i];kk--}return out}
  return[]}
const cntHTML=()=>`<div class="cnt"><span class="lb"><b>تعداد واریزی</b><small id="pcntl">${aSt.count?fmt(aSt.count)+' واریزی به این منبع برود':'بدون محدودیت تعداد'}</small></span><div class="stepper"><button data-act="aCnt" data-v="1" aria-label="بیشتر">+</button><input id="pcnt" class="ltr" inputmode="numeric" autocomplete="off" value="${aSt.count?toFa(aSt.count):''}" placeholder="—" aria-label="تعداد واریزی"><button data-act="aCnt" data-v="-1" aria-label="کمتر">−</button></div></div>`;
function paramRefresh(){const sw=document.querySelector('#aparam .sw');if(sw)sw.style.display=aSt.count?'none':''}
function setCnt(v){aSt.count=Math.max(0,Math.min(999,+v||0));const i=$('pcnt');if(i&&document.activeElement!==i)i.value=aSt.count?toFa(aSt.count):'';const l=$('pcntl');if(l)l.textContent=aSt.count?fmt(aSt.count)+' واریزی به این منبع برود':'بدون محدودیت تعداد'}
/* ================= v21: ویرایش تخصیص ================= */
function allocEdit(pid){const p=parts().find(z=>z.id==pid);if(!p)return;if(p.sent){partId=p.id;go('part');return}const q=p.param||{};
  aSt={srcId:p.src.id,method:p.method,amount:q.amount||0,min:q.min||0,max:q.max||0,cap:q.cap||0,count:q.count||0,bank:q.bank||p.src.bank||'',sameFirst:true,sel:new Set(p.ids),q:'',editPid:p.id};
  allocSheet();renderPrev()}
/* ================= v21: مدیریت منابع ================= */
let srcRet='';
function srcMgr(){srcRet='mgr';
  sheet(`<div class="sh-h"><div><b>منابع پرداخت</b><small class="shsub">برای ویرایش بزنید · کشیدن به چپ: ویرایش، به راست: حذف</small></div><button class="x" data-act="srcMgrBack" aria-label="بستن">×</button></div>
  ${sources.length?`<div class="sgr smg">${sources.map(s=>{const bk=acBank(s);return swW(`<button class="acrow" data-act="srcSet" data-id="${s.id}">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(s.name))}</span>`}<span class="tx"><b>${esc(s.name)}</b><small>${esc(bk?'بانک '+bk:'بانک نامشخص')}${s.iban?' · شبا <bdi dir="ltr">…'+esc(s.iban.slice(-4))+'</bdi>':s.card?' · کارت <bdi dir="ltr">…'+esc(s.card.slice(-4))+'</bdi>':''}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`,{edit:'srcSet',del:'delSrc',data:{id:s.id}})}).join('')}</div>`:'<div class="spempty" style="padding:18px 8px"><b>هنوز منبعی تعریف نشده</b><span>اولین حساب را با دکمه پایین اضافه کنید.</span></div>'}
  <button class="xgo" data-act="srcSet" data-id="new">${ic('plus')} منبع جدید</button>`)}
function srcBack(){if(srcRet==='mgr'){srcMgr();return}if(aSt){allocSheet();recalc();return}closeSheet();render()}
/* ================= v22: اطلاعات منبع تسویه هر واریزی ================= */
function srcInfo(id){for(const b of batches){const x=b.items.find(z=>z.id===id);if(x)return{src:x.src,tn:x.tn||'',st:x.st,time:x.time||''}}return null}
/* ================= v22: متن کپی یک واریزی ================= */
function entTxt(r){const bk=r.bankShow||r.bank||ibanBank(r.iban)||'';
  const pd=r.payDate||r.entryDate;return 'نام: '+Bo(fullName(r))+'\nشماره فاکتور: '+(toEn(r.code||'')||'—')+(bk?'\nبانک: '+bk:'')+'\nمبلغ: '+Bo(N(r.amount)+' تومان')+(pd?'\nتاریخ واریز: '+dates(pd).fa:'')+(r.iban?'\nشبا: '+Mo(ibanSp(r.iban)):'')+(r.card?'\nکارت: '+Mo(r.card):'')+(r.holder?'\nصاحب حساب: '+r.holder:'')}
async function cpOut(t,ok){(await copyText(t))?toast(ok):(txtGen=()=>t,txtName='motalla-copy',openText())}
/* ================= v22: منوی هر واریزی (⋯) ================= */
function entMenu(id){const r=validated().find(x=>x.id==id);if(!r)return;const si=r.sentBid?srcInfo(r.id):null;
  sheet(`<div class="sh-h"><div><b>${esc(fullName(r))}</b><small class="shsub">${fmt(r.amount)} تومان${r.code?' · فاکتور '+esc(toEn(r.code)):''}${si?' · منبع: '+esc(si.src):''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <button class="opt big" data-act="cpEnt" data-id="${r.id}">${ic('copy')}<span><b>کپی اطلاعات</b><small>نام، فاکتور، مبلغ و شبا</small></span></button>
  <button class="opt big" data-act="edit" data-id="${r.id}">${ic('edit')}<span><b>ویرایش</b><small>تغییر نام، مبلغ، شبا یا نحوه تسویه</small></span></button>
  ${r.entryDate!==dateVal?`<button class="opt big" data-act="copyDate" data-id="${r.id}">${ic('plus')}<span><b>افزودن به ${esc(dates(dateVal).fa)}</b><small>یک نسخه در لیست این تاریخ ثبت می‌شود</small></span></button>`:''}
  <button class="opt big" data-act="del" data-id="${r.id}" style="color:var(--red)">${ic('trash')}<span><b>حذف</b><small>به سطل بازیابی می‌رود و قابل برگشت است</small></span></button>`)}
/* ================= v22: لیست — جست‌وجوی جمع‌وجور ================= */
let lsOpen=false;
function ltoolsHTML(){const all=listMode==='all',D=dates(dateVal);
  return `<div class="ltools${lsOpen||listQ?' sopen':''}"><div class="lt"><b>${all?'همه لیست‌ها':'لیست '+esc(relDay(dateVal)==='امروز'?'امروز':D.fa)}</b><small>${all?'بر اساس تاریخ':esc(D.fa)}</small></div>
  <button class="ib0" data-act="lsOpen" aria-label="جست‌وجو">${ic('search')}</button><button class="ib0${listSort!=='seq'?' on':''}" data-act="sortSheet" aria-label="مرتب‌سازی: ${SORTS[listSort]}">${ic('sort')}</button><button class="ib0" data-act="lexp" data-a="menu" aria-label="خروجی متن، PDF و Excel">${ic('open')}</button>
  <div class="lsrch"><div class="sbox" style="flex:1">${ic('search')}<input id="lq" type="search" enterkeyhint="search" placeholder="نام، فاکتور، شبا، مبلغ، منبع…" value="${esc(listQ)}" autocomplete="off"><button class="clr${listQ?'':' hide'}" data-act="clearQ" aria-label="پاک کردن">×</button></div><button class="link" data-act="lsClose">انصراف</button></div></div>`}
