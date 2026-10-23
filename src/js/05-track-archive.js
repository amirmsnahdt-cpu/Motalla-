/* ---------- عکس رسید (IndexedDB با پشتیبان) ---------- */
let _db=null;
function idb(){return _db||(_db=new Promise((res,rej)=>{try{const r=indexedDB.open('motalla',1);r.onupgradeneeded=()=>r.result.createObjectStore('img');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}}))}
async function imgPut(k,v){try{const db=await idb();await new Promise((res,rej)=>{const t=db.transaction('img','readwrite');t.objectStore('img').put(v,k);t.oncomplete=res;t.onerror=()=>rej(t.error)});return true}catch(e){try{localStorage.setItem('m_img_'+k,v);return true}catch(x){return false}}}
async function imgGet(k){let v=null;try{const db=await idb();v=await new Promise(res=>{const r=db.transaction('img').objectStore('img').get(k);r.onsuccess=()=>res(r.result||null);r.onerror=()=>res(null)})}catch(e){}if(!v){try{v=localStorage.getItem('m_img_'+k)}catch(e){}}return v}
async function imgDel(k){try{const db=await idb();db.transaction('img','readwrite').objectStore('img').delete(k)}catch(e){}try{localStorage.removeItem('m_img_'+k)}catch(e){}}
const ikey=(b,x)=>b.id+':'+x.id;
function shrink(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=rej;fr.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const m=1800,sc=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.src=fr.result};fr.readAsDataURL(file)})}
/* ---------- ارسال: واریزی‌ها از تقسیم خارج و وارد پیگیری می‌شوند ---------- */
function commitAlloc(A,quiet){if(!A||!A.res)return null;let b=A.bid&&batches.find(x=>x.id===A.bid);if(b)return b;
  const items=[],used={};A.res.forEach(R=>{if(R.src.id!=null)used[R.src.id]=sum(R.items);R.items.forEach(r=>items.push({id:r.id,name:r.name,code:r.code||'',amount:r.amount,iban:r.iban,bank:r.bankShow||'',src:R.src.name,st:'pending'}))});
  if(!items.length)return null;
  b={id:nid++,date:A.D.iso,createdAt:new Date().toISOString(),by:who(),items,limSnap:sources.map(s=>({id:s.id,limit:+s.limit||0}))};batches.unshift(b);batches=batches.slice(0,200);A.bid=b.id;
  const S=new Set(items.map(x=>x.id));entries.forEach(e=>{if(S.has(e.id))e.sentBid=b.id});saveE();
  sources.forEach(s=>{if(used[s.id]!=null)s.limit=Math.max(0,(+s.limit||0)-used[s.id])});saveS();saveB();
  logA('batch','ارسال و انتقال به پیگیری',dates(b.date).fa+' | '+fmt(items.length)+' واریزی | '+fmt(sum(items))+' تومان',{bid:b.id});
  if(!quiet)toast(fmt(items.length)+' واریزی به پیگیری رفت','','برگرداندن',()=>undoCommit(b.id));
  if(cur==='split3'){$('act').innerHTML=aSplit3();const v=$('view');if(v)v.innerHTML=vSplit3()}$('dock').innerHTML=dockHTML();return b}
function undoCommit(bid){const b=batches.find(x=>x.id===bid);if(!b)return;
  entries.forEach(e=>{if(e.sentBid===bid)delete e.sentBid});(b.limSnap||[]).forEach(o=>{const s=sources.find(x=>x.id===o.id);if(s)s.limit=o.limit});
  batches=batches.filter(x=>x.id!==bid);if(alloc&&alloc.bid===bid)delete alloc.bid;saveE();saveS();saveB();
  logA('uncommit','برگرداندن ارسال',dates(b.date).fa+' | '+fmt(b.items.length)+' واریزی');toast('ارسال برگشت؛ واریزی‌ها دوباره در تقسیم هستند');
  if(cur==='batch')go('split1');else render()}
const autoTrack=()=>{if(txtGen||!expCtx||!expCtx.track)return;if(expCtx.parts)commitParts(expCtx.parts);else if(expCtx.A===alloc)commitAlloc(alloc)};
/* ---------- گام‌ها: ثبت ← تقسیم ← پیگیری ← بایگانی ---------- */
function flowState(d){d=d||dateVal;const has=entries.some(e=>e.entryDate===d),un=entries.filter(e=>e.entryDate===d&&!e.sentBid).length,bs=batches.filter(b=>b.date===d),op=bs.filter(b=>!b.closed).length,cl=bs.filter(b=>b.closed).length;
  const step=!has?1:un&&!bs.length?(cur==='split1'||cur==='split3'?2:1):op?3:un?2:cl?4:1;return{has,un,bs:bs.length,op,cl,step}}
function flowBar(at){const f=flowState(),S=[['entry','ثبت لیست'],['split','تقسیم'],['track','پیگیری'],['day','بایگانی']];
  const done=[f.has,f.bs>0&&!f.un,f.bs>0&&!f.op,f.cl>0&&!f.op&&!f.un];
  return `<div class="flow">${S.map(([k,t],i)=>`<button class="fs${at===i+1?' on':''}${done[i]?' done':''}" data-act="flowGo" data-s="${k}"><i>${done[i]?ic('check'):toFa(i+1)}</i><span>${t}</span></button>`).join('<b></b>')}</div>`}
function ring(c,size){const p=c.all?c.ok/c.all*100:0,f=c.all?c.fail/c.all*100:0;return `<div class="ring" style="--s:${size||64}px;background:conic-gradient(var(--ok) 0 ${p}%,var(--red) ${p}% ${p+f}%,var(--ringbg) ${p+f}% 100%)"><span><b>${toFa(Math.round(p))}٪</b></span></div>`}
/* ---------- صفحه پیگیری ---------- */
let gQ='',gF='all';
function gResults(){const q=gQ.trim(),qn=norm(q),qd=toEn(q).replace(/\D/g,''),D3=qd.length>=3,R=[];if(!q)return R;
  const setHit=S=>(S||[]).some(z=>norm(z.name).includes(qn)||(D3&&(String(z.inv||'').includes(qd)||String(z.phone||'').includes(qd)||String(z.amount).includes(qd))));
  batches.forEach(b=>b.items.forEach((x,i)=>{const hit=[x.name,x.code,x.src,x.bank].some(v=>norm(v).includes(qn))||(D3&&(String(x.amount).includes(qd)||String(x.total||'').includes(qd)||(x.iban||'').includes(qd)||String(x.tn||'').includes(qd)||String(x.code||'').includes(qd)))||setHit(x.settles);
    if(hit)R.push({k:'b',b,x,i,date:b.date,st:x.st})}));
  validated().filter(r=>r.full).forEach(r=>{const hit=[r.name,r.code].some(v=>norm(v).includes(qn))||(D3&&(String(r.total).includes(qd)||String(r.code||'').includes(qd)))||setHit(r.settles);if(hit)R.push({k:'f',r,date:r.entryDate,st:'ok'})});
  return R.sort((a,b)=>a.date<b.date?1:-1)}
function gHTML(){const all=gResults(),c={all:all.length,ok:0,fail:0,pending:0};all.forEach(z=>c[z.st]++);const L=all.filter(z=>gF==='all'||z.st===gF),q=gQ.trim();
  let h=`<div class="chips">${[['all','همه'],['ok','تسویه شده'],['fail','ناموفق'],['pending','در انتظار']].map(([k,t])=>`<button class="chip${k==='fail'?' r':''}${gF===k?' on':''}" data-act="gFilter" data-f="${k}">${t} ${fmt(c[k])}</button>`).join('')}</div>`;
  if(!L.length)return h+`<div class="card empty">${ic('search')}<b>چیزی با «${esc(q)}» پیدا نشد</b>نام، چند رقم از مبلغ، شماره فاکتور، شماره پیگیری یا شبا را امتحان کنید.</div>`;
  h+=`<div class="sres"><span>${ic('search')} <b>«${esc(q)}»</b> — ${fmt(L.length)} واریزی، ${fmt(L.reduce((s,z)=>s+(z.k==='b'?z.x.amount:z.r.total),0))} تومان</span></div>`;
  L.forEach(z=>{if(z.k==='b'){const x=z.x,S=ST[x.st];h+=`<button class="gres ${x.st}" data-act="itOpen" data-b="${z.b.id}" data-i="${z.i}"><span class="tx"><b>${hl(fullName(x),q)}</b><small>${relDay(z.date)}، ${dates(z.date).fa} — ${hl(x.src,q)}${x.code?' — فاکتور '+hl(toEn(x.code),q):''}</small>${x.tn?`<small>پیگیری <bdi dir="ltr">${hl(x.tn,q)}</bdi>${x.time?'، ساعت '+toFa(x.time):''}</small>`:''}${(x.settles||[]).length?`<small>${esc(x.settles.map(setLine).join('؛ '))}</small>`:''}</span><span class="v"><b>${fmt(x.amount)}</b><span class="pill ${x.st==='ok'?'okp':x.st==='fail'?'rd':'gd'}">${x.st==='ok'?'تسویه شده':S[0]}</span>${z.b.closed?'<small>بایگانی</small>':''}</span></button>`}
    else{const r=z.r;h+=`<button class="gres ok" data-act="edit" data-id="${r.id}"><span class="tx"><b>${hl(fullName(r),q)}</b><small>${relDay(z.date)}، ${dates(z.date).fa} — تسویه با مشتری</small><small>${esc(r.settles.map(setLine).join('؛ '))}</small></span><span class="v"><b>${fmt(r.total)}</b><span class="pill okp">تسویه با مشتری</span></span></button>`}});
  return h}
function bindTrack(){const q=$('gq');if(!q)return;const upd=()=>{const on=!!gQ.trim();srchSwap('gres',on?gHTML():'');$('tcont').classList.toggle('hide',on);document.querySelector('#view .sbox .clr').classList.toggle('hide',!gQ)};
  q.oninput=()=>{gQ=q.value;clearTimeout(q._t);q._t=setTimeout(upd,140)};q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();q.blur()}};upd()}
function vTrack(){return `<div class="sbar"><div class="sbox">${ic('search')}<input id="gq" type="search" enterkeyhint="search" placeholder="جست‌وجو در همه واریزی‌ها: نام، مبلغ، فاکتور، پیگیری…" value="${esc(gQ)}" autocomplete="off"><button class="clr${gQ?'':' hide'}" data-act="gClear" aria-label="پاک کردن">×</button></div></div><div id="gres"></div><div id="tcont">${vTrackTabs()}</div>`}
function vTrackTabs(){const ob=openB(),cb=batches.filter(b=>b.closed);
  let h=`<div class="seg"><button data-act="trTab" data-t="open" class="${trTab==='open'?'on':''}">در حال پیگیری ${ob.length?'('+fmt(ob.length)+')':''}</button><button data-act="trTab" data-t="arch" class="${trTab==='arch'?'on':''}">لیست‌های روزانه</button></div>`;
  if(trTab==='arch'){const days={};cb.forEach(b=>(days[b.date]=days[b.date]||[]).push(b));const ks=Object.keys(days).sort().reverse();
    if(!ks.length)return h+`<div class="card empty">${ic('list')}<b>هنوز لیستی بایگانی نشده</b>بعد از تیک زدن واریزی‌ها، «ثبت نهایی» را بزنید تا لیست با همه جزئیات اینجا ذخیره شود.</div>`;
    ks.forEach(k=>{const it=days[k].flatMap(b=>b.items),c=bStat({items:it}),srcs=[...new Set(it.map(x=>x.src))],D=dates(k);
      h+=`<button class="tcard" data-act="openDay" data-iso="${k}"><span class="cal2"><b>${toFa(D.jd)}</b><small>${JM[D.jm-1]}</small></span><span class="tx"><b>${relDay(k)}، ${D.fa}</b><small>${esc(srcs.join('، '))}</small><span class="tags"><span class="pill" style="background:var(--ok2);color:var(--ok)">${fmt(c.ok)} موفق، ${fmt(c.okSum)}</span>${c.fail?`<span class="pill rd">${fmt(c.fail)} ناموفق</span>`:''}${c.img?`<span class="pill g">${fmt(c.img)} رسید</span>`:''}</span></span>${ic('back').replace('class="i"','class="i flip"')}</button>`});return h}
  if(!ob.length)return h+`<div class="card empty">${ic('track')}<b>لیستی در حال پیگیری نیست</b>بعد از تقسیم، با کپی یا خروجی گرفتن، واریزی‌ها خودشان به اینجا منتقل می‌شوند.<div class="row"><button class="btn gold" data-act="tab" data-n="split">رفتن به تقسیم</button></div></div>`;
  ob.forEach(b=>{const c=bStat(b),srcs=[...new Set(b.items.map(x=>x.src))];
    h+=`<button class="tcard" data-act="openBatch" data-id="${b.id}">${ring(c,58)}<span class="tx"><b>${relDay(b.date)}، ${dates(b.date).fa}</b><small>${esc(srcs.join('، '))}</small><small>${fmt(c.all)} واریزی، ${fmt(c.sum)} تومان</small>
    <span class="tags">${c.pending?`<span class="pill gd">${fmt(c.pending)} در انتظار</span>`:'<span class="pill" style="background:var(--ok2);color:var(--ok)">آماده ثبت نهایی</span>'}${c.fail?`<span class="pill rd">${fmt(c.fail)} ناموفق</span>`:''}</span></span>${ic('back').replace('class="i"','class="i flip"')}</button>`});
  return h}
function vBatch(){const b=curB();if(!b)return '<div class="card empty"><b>این لیست پیدا نشد</b></div>';const c=bStat(b);
  return `${b.closed?'':flowBar(3)}<div class="thead">${ring(c,84)}<div><b>${dates(b.date).fa}</b><small>${fmt(c.ok)} موفق از ${fmt(c.all)}${c.fail?'، '+fmt(c.fail)+' ناموفق':''}</small><small>واریز شده: <b>${fmt(c.okSum)}</b> از ${fmt(c.sum)} تومان</small></div></div>
  ${b.closed?'':badNotice(b.date)}<div class="muted" style="font-size:12.5px;margin:-4px 4px 10px">روی هر منبع بزنید تا واریزی‌هایش باز شود. «انجام شد» یا «ناموفق» را بزنید و شماره پیگیری یا عکس رسید را اضافه کنید.</div>
  <div class="sbar"><div class="sbox">${ic('search')}<input id="tq" type="search" placeholder="مبلغ یا نام از صورت‌حساب بانک…" value="${esc(tkQ)}" autocomplete="off"><button class="clr${tkQ?'':' hide'}" data-act="tkClear" aria-label="پاک کردن">×</button></div></div>
  <div class="chips">${[['all','همه',c.all],['pending','در انتظار',c.pending],['ok','موفق',c.ok],['fail','ناموفق',c.fail]].map(([k,t,n])=>`<button class="chip${k==='fail'?' r':''}${tkFilter===k?' on':''}" data-act="tkFilter" data-f="${k}">${t} ${fmt(n)}</button>`).join('')}</div><div id="tlist"></div>
  ${b.items.some(x=>x.st==='fail'&&!x.requeued)?`<button class="lrow bad" data-act="tkRequeue"><span class="ic">↻</span><span class="tx"><b>واریز مجدد ناموفق‌ها</b><small>به لیست امروز اضافه می‌شوند تا دوباره تقسیم شوند</small></span></button>`:''}
  <div class="row" style="margin-top:4px">${!c.ok&&!c.fail&&!c.tn?`<button class="link" data-act="undoCommit" data-id="${b.id}">برگرداندن ارسال به تقسیم</button>`:''}<button class="link" style="color:var(--red)" data-act="tkDel">حذف این لیست پیگیری</button></div>`}
function trowHTML(x,q,qd,b){if(!b.closed)return tkRow(x,q,qd,b);const hit=qd&&qd.length>=3&&String(x.amount).includes(qd);
  if(!b.closed)return `<div class="tc ${x.st}"><div class="r1"><div class="tx"><b>${q?hl(x.name,q):esc(x.name)}</b><small>${x.code?'فاکتور '+esc(toEn(x.code))+'، ':''}${esc(x.bank)}، شبا <bdi dir="ltr">…${esc(x.iban.slice(-4))}</bdi>${x.requeued?'، <span style="color:var(--pri)">برای واریز مجدد منتقل شد</span>':''}</small></div><div class="am">${hit?'<mark>'+fmt(x.amount)+'</mark>':fmt(x.amount)}</div>
  <button class="tb ok${x.st==='ok'?' on':''}" data-act="tkSet" data-i="${x.i}" data-st="ok" aria-label="انجام شد">${ic('check')}</button><button class="tb no${x.st==='fail'?' on':''}" data-act="tkSet" data-i="${x.i}" data-st="fail" aria-label="انجام نشد">×</button></div>
  <div class="r2"><input class="tni ltr" data-tn="${x.i}" inputmode="numeric" enterkeyhint="done" autocomplete="off" placeholder="شماره پیگیری" value="${esc(x.tn||'')}">
  <button class="mb${x.time?' on':''}" data-act="tkTime" data-i="${x.i}">${ic('clock')}<span>${x.time?toFa(x.time):'ساعت'}</span></button>
  <label class="mb${x.img?' on':''}">${ic('cam')}<span>${x.img?'رسید ✓':'رسید'}</span><input type="file" accept="image/*" data-img="${x.i}"></label>
  ${x.img?`<button class="mb" data-act="viewImg" data-b="${b.id}" data-id="${x.id}" aria-label="دیدن رسید">${ic('eye')}</button>`:''}<button class="mb" data-act="itOpen" data-b="${b.id}" data-i="${x.i}" aria-label="جزئیات بیشتر">⋯</button></div></div>`;
const det=[x.tn?'پیگیری <bdi dir="ltr">'+esc(x.tn)+'</bdi>':'',x.time?'ساعت '+toFa(x.time):'',x.img?'📎 رسید':''].filter(Boolean).join('، ');
  return `<div class="trow ${x.st}"><div class="tx" data-act="itOpen" data-b="${b.id}" data-i="${x.i}"><b>${q?hl(x.name,q):esc(x.name)}</b><small>${det?`<span class="det">${det}</span>`:`${x.code?'فاکتور '+esc(toEn(x.code))+'، ':''}${esc(x.bank)}، شبا <bdi dir="ltr">…${esc(x.iban.slice(-4))}</bdi>`}${x.requeued?'، <span style="color:var(--pri)">برای واریز مجدد منتقل شد</span>':''}</small></div><div class="am">${qd&&qd.length>=3&&String(x.amount).includes(qd)?'<mark>'+fmt(x.amount)+'</mark>':fmt(x.amount)}</div>
  ${b.closed?stMark(x.st):`<button class="tb ok${x.st==='ok'?' on':''}" data-act="tkSet" data-i="${x.i}" data-st="ok" aria-label="انجام شد">${ic('check')}</button><button class="tb no${x.st==='fail'?' on':''}" data-act="tkSet" data-i="${x.i}" data-st="fail" aria-label="انجام نشد">×</button>`}</div>`}
const aBatch=()=>{const b=curB();if(!b)return '';return `<button class="btn sec" data-act="tkReport">${ic('copy')} کپی گزارش</button><button class="btn gold" data-act="closeBatch">ثبت نهایی و بایگانی</button>`};
function bindBatch(){const q=$('tq'),t=$('tlist');if(!t)return;t.innerHTML=tlistHTML();
  t.oninput=e=>{const el=e.target;if(el.dataset.tn!==undefined)el.value=toEn(el.value).replace(/[^\dA-Za-z\-]/g,'')};
  t.onkeydown=e=>{if(e.key==='Enter'&&e.target.dataset.tn!==undefined){e.preventDefault();e.target.blur()}};
  t.onchange=async e=>{const el=e.target,b=curB();if(!b)return;
    if(el.dataset.tn!==undefined){const x=b.items[+el.dataset.tn];x.tn=toEn(el.value).trim();if(x.tn&&x.st==='pending')x.st='ok';if(x.tn&&!x.time){const n=new Date();x.time=p2(n.getHours())+':'+p2(n.getMinutes())}x.at=new Date().toISOString();saveB();refreshBatch();toast(x.tn?'شماره پیگیری «'+x.name+'» ثبت شد':'شماره پیگیری پاک شد')}
    if(el.dataset.img!==undefined){const x=b.items[+el.dataset.img],f=el.files&&el.files[0];if(!f)return;try{const d=await shrink(f),k=newImgKey('rc:'+x.id);if(await imgPut(k,d)){x.imgs=itImgs(b,x).concat([k]);x.img=true;saveB();refreshBatch();toast('رسید «'+x.name+'» ضمیمه شد')}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}catch(z){toast('این عکس خوانده نشد',true)}}};q.oninput=()=>{tkQ=q.value;document.querySelector('#view .clr').classList.toggle('hide',!tkQ);clearTimeout(q._t);q._t=setTimeout(()=>{srchSwap('tlist',tlistHTML())},120)}}
function refreshBatch(){const y=window.scrollY;render();const t=$('tlist');if(t)t.innerHTML=tlistHTML();window.scrollTo(0,y)}
/* ---------- جزئیات هر واریزی: شماره پیگیری، ساعت، عکس ---------- */
/* v60.3: پنل جزئیات واریز بانکی (از رسید) — بازطراحی: بدون دکمه‌های سه‌گانه وضعیت؛ با شماره پیگیری «انجام شد» می‌شود،
   «انجام نشد» یک گزینه آرام پایین پنل است. شماره پیگیری دکمه پاک کردن دارد، ساعت با «الان»، عکس‌ها همین‌جا (چند عکس، دوربین) بدون بستن پنل. */
const itStLab=(st,tn)=>st==='fail'?['f','انجام نشد']:st==='ok'||tn?['k','انجام شد']:['w','در انتظار پیگیری'];
function itStPaint(){const t=$('itn'),p=$('itstp');if(!t||!p)return;const s=itStLab(tmpSt,t.value.trim());p.className='itst '+s[0];p.querySelector('b').textContent=s[1];const c=$('itnx');if(c)c.classList.toggle('hide',!t.value)}
function itGalHTML(){const c=galCtx();if(!c)return '';const K=c.keys;
  return K.map((k,i)=>`<button class="galt" data-act="galView" data-i="${i}" aria-label="دیدن عکس ${toFa(i+1)}"><span class="galim" id="gal${i}"></span><i>${toFa(i+1)}</i></button>`).join('')+(c.ed?`<label class="galt add">${ic('plus')}<span>${K.length?'عکس دیگر':'گالری'}</span><input type="file" accept="image/*"${picMulti()?' multiple':''} data-galadd="1" hidden></label>${picCam()?`<label class="galt add">${ic('cam')}<span>دوربین</span><input type="file" accept="image/*" capture="environment" data-galadd="1" hidden></label>`:''}`:'')}
async function openItem(bid,i){const b=batches.find(z=>z.id==bid);if(!b)return;const x=b.items[+i];if(!x)return;batchId=b.id;itemIdx=+i;tmpSt=x.st==='fail'?'fail':x.st;tmpImg=undefined;GAL={k:'it',eid:x.id};
  const s0=itStLab(x.st,x.tn);
  sheet(`<div class="sh-h"><div><b>${esc(x.name)}</b><small class="shsub">واریز بانکی${x.src?' · '+esc(x.src):''}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="itf">
  <div class="ithero"><b>${fmt(x.amount)}<i>تومان</i></b><span class="ithc">${x.bank?bankBadge(x.bank)+'<span>'+esc(x.bank)+'</span>':''}</span><span class="itst ${s0[0]}" id="itstp"><i></i><b>${s0[1]}</b></span></div>
  <div class="itg"><label class="itr" for="itn"><span>شماره پیگیری</span><span class="itv"><input id="itn" class="ltr" inputmode="numeric" autocomplete="off" enterkeyhint="done" value="${esc(x.tn||'')}" placeholder="مثلاً 140507181234"><button type="button" class="itx${x.tn?'':' hide'}" id="itnx" data-act="itTnClr" aria-label="پاک کردن شماره پیگیری">×</button></span></label>
  <label class="itr" for="itt"><span>ساعت واریز</span><span class="itv"><input id="itt" type="time" class="ltr" value="${esc(x.time||'')}"><button type="button" class="itnow" data-act="itNow">الان</button></span></label></div>
  <div class="ith">رسید <i>${itImgs(b,x).length?toFa(itImgs(b,x).length)+' عکس · برای بزرگ‌نمایی بزنید':'یک یا چند عکس'}</i></div>
  <div class="galg itgal" id="itgal">${itGalHTML()}</div>
  <div class="ith">یادداشت <i>اختیاری</i></div>
  <div class="itg"><input id="itno" class="itno" value="${esc(x.note||'')}" placeholder="مثلاً واریز دو مرحله‌ای"></div>
  <button class="xgo" data-act="itSave">${ic('check')} ذخیره</button>
  <button class="itfail" data-act="itFail">${tmpSt==='fail'?'برگرداندن به «در انتظار»':'این واریز انجام نشد'}</button></div>`);
  galThumbs();
  $('itn').oninput=()=>{$('itn').value=toEn($('itn').value).replace(/[^\dA-Za-z\-]/g,'');if($('itn').value&&tmpSt!=='ok')tmpSt='ok';itStPaint()};
}
async function saveItem(){const b=curB();if(!b)return;const x=b.items[itemIdx];x.tn=toEn($('itn').value).trim();x.time=$('itt').value;x.note=clean($('itno').value);
  x.st=tmpSt==='fail'?'fail':x.tn||tmpSt==='ok'?'ok':'pending';x.at=new Date().toISOString();
  if(tmpImg===null){await imgDel(ikey(b,x));x.img=false}else if(typeof tmpImg==='string'){const ok=await imgPut(ikey(b,x),tmpImg);if(ok)x.img=true;else toast('حافظه پر است؛ عکس ذخیره نشد',true)}
  saveB();GAL=null;closeSheet();if(cur==='day')render();else refreshBatch();toast(x.st==='ok'?'ذخیره شد · انجام شد ✓':x.st==='fail'?'ذخیره شد · انجام نشد':'ذخیره شد')}
function viewImg(bid,id){const b=batches.find(z=>z.id==bid),x=b&&b.items.find(z=>z.id==id);if(!x)return;openGal({k:'it',eid:x.id})}
/* ---------- بایگانی روزانه ---------- */
const fullSettled=iso=>validated().filter(r=>r.entryDate===iso&&r.full);
const dayBatches=iso=>batches.filter(b=>b.date===iso&&b.closed);
function dayGroups(iso){const by={};dayBatches(iso).forEach(b=>b.items.forEach(x=>(by[x.src]=by[x.src]||[]).push({...x,bid:b.id})));return Object.keys(by).map(k=>({name:k,rows:by[k]}))}
function vDay(){const G=dayGroups(dayIso),it=G.flatMap(g=>g.rows),c=bStat({items:it}),D=dates(dayIso);if(!it.length)return '<div class="card empty"><b>لیستی برای این روز بایگانی نشده</b></div>';
  let h=`<div class="ltools"><div class="lt"><b>${relDay(dayIso)}، ${D.fa}</b><small>${fmt(G.length)} منبع · ${fmt(c.all)} واریزی</small></div><button class="ib0" data-act="dayExp" aria-label="خروجی متن، PDF و Excel">${ic('open')}</button><button class="ib0" data-act="newList" aria-label="لیست جدید">${ic('plus')}</button></div>`;
  h+=`<div class="ingot"><div class="lb">واریز شده</div><div class="v">${fmt(c.okSum)}<small>تومان</small></div><div class="row3 r4"><div><small>کل</small><b>${fmt(c.all)}</b></div><div><small>موفق</small><b class="${c.ok?'g':''}">${fmt(c.ok)}</b></div><div><small>ناموفق</small><b class="${c.fail?'r':''}">${fmt(c.fail)}</b></div><div><small>رسید</small><b>${fmt(c.img)}</b></div></div></div>`;
  const one=G.length===1&&!fullSettled(dayIso).length;
  G.forEach(g=>{const gc=bStat({items:g.rows}),op=one||dayOpen.has(g.name),pc=gc.all?gc.ok/gc.all*100:0,pf=gc.all?gc.fail/gc.all*100:0;
    h+=`<div class="tg2${op?' open':''}${!gc.fail&&!gc.pending?' done':''}"><button class="tgh2" data-act="dayGrp" data-s="${esc(g.name)}" aria-expanded="${op}"><span class="av2">${esc(userInit(g.name))}</span><span class="tx"><b>${esc(g.name)}</b><small>${fmt(gc.all)} واریزی · ${gc.fail?`<span class="f">${fmt(gc.fail)} ناموفق</span>`:gc.pending?`<span class="w">${fmt(gc.pending)} در انتظار</span>`:'<span class="k">کامل ✓</span>'}</small><span class="pb2"><i class="ok" style="width:${pc}%"></i><i class="no" style="width:${pf}%"></i></span></span><span class="v"><b>${fmt(sum(g.rows))}</b><small>${fmt(gc.ok)} از ${fmt(gc.all)}</small></span>${chevI()}</button>
    <div class="tgb">${g.rows.map(x=>{const b=batches.find(z=>z.id===x.bid),i=b?b.items.findIndex(z=>z.id===x.id):-1;
      return `<div class="drow ${x.st}"><div class="tx" data-act="itOpen" data-b="${x.bid}" data-i="${i}"><b>${esc(fullName(x))}</b><small>${[x.tn?'پیگیری <bdi dir="ltr">'+esc(x.tn)+'</bdi>':'بدون شماره پیگیری',x.time?'ساعت '+toFa(x.time):''].filter(Boolean).join(' · ')}</small></div><div class="am">${fmt(x.amount)}</div>${x.img?`<button class="dimg" data-act="viewImg" data-b="${x.bid}" data-id="${x.id}" aria-label="دیدن رسید">${ic('cam')}</button>`:''}${stMark(x.st)}</div>`}).join('')}</div></div>`});
  const FS=fullSettled(dayIso);if(FS.length){const op=dayOpen.has('__full');h+=`<div class="tg2${op?' open':''} done"><button class="tgh2" data-act="dayGrp" data-s="__full" aria-expanded="${op}"><span class="av2">م</span><span class="tx"><b>تسویه با مشتری</b><small>${fmt(FS.length)} واریزی · <span class="k">کامل ✓</span></small></span><span class="v"><b>${fmt(FS.reduce((s,r)=>s+r.total,0))}</b></span>${chevI()}</button>
    <div class="tgb">${FS.map(r=>`<div class="drow ok"><div class="tx" data-act="edit" data-id="${r.id}"><b>${esc(fullName(r))}</b><small>${esc(r.settles.map(setLine).join('؛ '))}</small></div><div class="am">${fmt(r.total)}</div>${stMark('ok')}</div>`).join('')}</div></div>`}
  h+=`<div class="row"><button class="link" data-act="reopenDay">بازگشایی برای ویرایش وضعیت‌ها</button></div>`;return h}
const aDay=()=>'';
function dayTxt(iso,G0,FS0,T0){const G=G0||dayGroups(iso),D=dates(iso),it=G.flatMap(g=>g.rows),c=bStat({items:it});
  const sentN=it.filter(x=>x.st&&x.st!=='none').length;let t=Bo('مطلا | '+(T0||'لیست روزانه واریز'))+'\nتاریخ واریز: '+D.fa+'  |  '+D.en+'\nتعداد: '+toFa(c.all)+' واریزی'+(sentN?' (موفق '+toFa(c.ok)+(c.fail?'، ناموفق '+toFa(c.fail):'')+(c.pending?'، در انتظار '+toFa(c.pending):'')+')':'')+'\n'+Bo('مجموع کل: '+N(c.sum)+' تومان')+(sentN?'\n'+Bo('واریز شده: '+N(c.okSum)+' تومان'):'')+'\n'+DLINE+'\n';
  G.forEach(g=>{const gs=k=>g.rows.filter(x=>x.st===k);t+='\n'+Bo('◆ منبع واریزی: '+g.name)+'\nتعداد: '+toFa(g.rows.length)+'  |  جمع: '+N(sum(g.rows))+' تومان\n'+[['ok','✅ تسویه شده'],['fail','❌ ناموفق'],['pending','⏳ در انتظار'],['none','⚪ ارسال نشده']].filter(([k])=>gs(k).length).map(([k,l])=>l+': '+toFa(gs(k).length)+' ('+N(sum(gs(k)))+' تومان)').join('  |  ')+'\n'+LINE+'\n';
    g.rows.forEach((x,i)=>{t+='\n'+Bo(toFa(i+1)+'. '+fullName(x))+'\nشماره فاکتور: '+(toEn(x.code||'')||'—')+'\nمبلغ: '+Bo(N(x.amount)+' تومان')+'\nشماره شبا:\n'+Mo(ibanSp(x.iban))+(x.settled?'\nمبلغ کل: '+N(x.total)+' تومان\nنحوه تسویه:\n'+x.settles.map(z=>'• '+setLine(z)).join('\n')+'\n• باقی‌مانده از طریق بانک: '+N(x.amount)+' تومان':'')+'\nوضعیت: '+ST[x.st][1]+' '+ST[x.st][0]+'\nنوع تسویه: '+setType(x)+(x.tn?'\nشماره پیگیری: '+Mo(x.tn):'')+(x.time?'\nساعت واریز: '+x.time:'')+(x.note?'\nیادداشت: '+x.note:'')+'\n\n'+LINE+'\n'});
    t+=Bo('◆ جمع '+g.name+': '+N(sum(g.rows))+' تومان')+'\n'});
  const F=FS0||fullSettled(iso);if(F.length){t+='\n'+Bo('◆ تسویه کامل از طریق مشتری ('+toFa(F.length)+')')+'\n'+LINE+'\n';F.forEach((r,i)=>{t+='\n'+Bo(toFa(i+1)+'. '+fullName(r))+'\nشماره فاکتور: '+(toEn(r.code||'')||'—')+'\nمبلغ کل: '+N(r.total)+' تومان\nنحوه تسویه:\n'+r.settles.map(z=>'• '+setLine(z)).join('\n')+'\n\n'+LINE+'\n'})}
  return t+'\n'+DLINE+'\n'+Bo('مجموع کل: '+N(c.sum)+' تومان')+'\n'+Bo('واریز شده: '+N(c.okSum)+' تومان')+(c.fail?'\nناموفق: '+toFa(c.fail)+' واریزی':'')+'\n'}
function dayXlsx(iso,G0,FS0){const G=G0||dayGroups(iso),D=dates(iso),wb=XLSX.utils.book_new();wb.Workbook={Views:[{RTL:true}]};const used={};
  const nm=n=>{let b=n.replace(/[\\\/?*\[\]:]/g,'').slice(0,28)||'sheet',k=b,i=1;while(used[k])k=b+(++i);used[k]=1;return k};
  const a=[['منبع','تعداد','جمع (تومان)','موفق','ناموفق','تاریخ شمسی','تاریخ میلادی']];G.forEach(g=>{const c=bStat({items:g.rows});a.push([g.name,c.all,c.sum,c.ok,c.fail,D.fa,D.iso])});
  const s=XLSX.utils.aoa_to_sheet(a);s['!cols']=[{wch:18},{wch:8},{wch:18},{wch:8},{wch:8},{wch:16},{wch:14}];XLSX.utils.book_append_sheet(wb,s,nm('خلاصه'));
  G.forEach(g=>{const r=[['ردیف','نام','شماره فاکتور','مبلغ (تومان)','بانک مقصد','شماره شبا','وضعیت','نوع تسویه','شماره پیگیری','ساعت واریز','یادداشت','منبع','تاریخ']];
    g.rows.forEach((x,i)=>r.push([i+1,x.name,x.code,x.amount,x.bank,x.iban,ST[x.st][0],setType(x),x.tn||'',x.time||'',x.note||'',g.name,D.fa]));r.push(['','جمع','',sum(g.rows),'','','','','','','','','']);
    const w=XLSX.utils.aoa_to_sheet(r);w['!cols']=[{wch:6},{wch:22},{wch:12},{wch:16},{wch:12},{wch:30},{wch:12},{wch:20},{wch:20},{wch:10},{wch:20},{wch:14},{wch:14}];for(let k=2;k<=r.length;k++)if(w['D'+k])w['D'+k].z='#,##0';XLSX.utils.book_append_sheet(wb,w,nm(g.name))});
  if(FS0&&FS0.length){const f=[['ردیف','نام','شماره فاکتور','مبلغ کل (تومان)','نوع تسویه','نحوه تسویه']];FS0.forEach((x,i)=>f.push([i+1,x.name,x.code||'',x.total,setType(x),(x.settles||[]).map(setLine).join('؛ ')]));const w=XLSX.utils.aoa_to_sheet(f);w['!cols']=[{wch:6},{wch:22},{wch:12},{wch:16},{wch:20},{wch:50}];XLSX.utils.book_append_sheet(wb,w,nm('تسویه با مشتری'))}
  return XLSX.write(wb,{bookType:'xlsx',type:'array'})}
function openDayExport(iso){sheet(`<div class="sh-h"><b>خروجی لیست روزانه — ${dates(iso).fa}</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <button class="opt big" data-act="dayText">${ic('copy')}<span><b>متن کامل با شماره پیگیری</b><small>برای تلگرام، واتس‌اپ یا بایگانی</small></span></button>
  <button class="opt big" data-act="dayPdf">${ic('paste')}<span><b>PDF با رسیدها</b><small>جدول کامل + عکس رسیدها، بعد «چاپ» ← ذخیره PDF</small></span></button>
  <button class="opt big" data-act="dayXls"${typeof XLSX==='undefined'?' disabled':''}>${ic('list')}<span><b>Excel</b><small>${typeof XLSX==='undefined'?'برای Excel اینترنت لازم است':'یک برگه برای هر منبع'}</small></span></button>`)}
function tkReportText(b){const c=bStat(b),f=b.items.filter(x=>x.st==='fail'),p=b.items.filter(x=>x.st==='pending');
  let t=Bo('مطلا | گزارش پیگیری واریز')+'\nتاریخ لیست: '+dates(b.date).fa+'\nموفق: '+toFa(c.ok)+' از '+toFa(c.all)+'  —  '+Bo(N(c.okSum)+' تومان')+'\n';
  if(f.length){t+='\n'+Bo('ناموفق ('+toFa(f.length)+'):')+'\n';f.forEach((x,i)=>t+=toFa(i+1)+'. '+x.name+' — '+N(x.amount)+' تومان — '+x.src+'\n'+Mo(ibanSp(x.iban))+'\n')}
  if(p.length){t+='\n'+Bo('در انتظار تأیید ('+toFa(p.length)+'):')+'\n';p.forEach((x,i)=>t+=toFa(i+1)+'. '+x.name+' — '+N(x.amount)+' تومان\n')}
  return t}

/* ============ تخصیص منبع‌به‌منبع ============ */
let drafts=ls.get('m_drafts',{}),partId=null,aSt=null;
const saveD=()=>ls.set('m_drafts',drafts);
/* هر لیست = یک تاریخ واریز (ldKey)، حتی اگر واریزی‌ها در روزهای مختلف ثبت شده باشند.
   تخصیص‌های قدیمی در drafts زیر تاریخ ثبت مانده‌اند؛ عضویت هر تخصیص از تاریخ واریز ردیف‌هایش خوانده می‌شود، پس داده جابه‌جا نمی‌شود. */
const vMap=()=>{const V=validated();if(vMap.V!==V){vMap.V=V;vMap.M=new Map(V.map(r=>[r.id,r]))}return vMap.M};
const partIn=(p,k,M)=>{const pp=partPay(p,M);if(pp)return pp===k;return (p.ids||[]).some(id=>{const r=M.get(id);return r&&PD(r)===k})};
function parts(k){k=k||ldKey;const M=vMap(),out=[];for(const d in drafts)(drafts[d]||[]).forEach(p=>{if(p&&p.src&&partIn(p,k,M))out.push(p)});return out.sort((a,b)=>String(a.at||'').localeCompare(String(b.at||''))||a.id-b.id)}
const allParts=()=>Object.values(drafts).flatMap(a=>(a||[]).filter(p=>p&&p.src));
function addPart(p,k){k=k||ldKey;p.pay=k;drafts[k]=(drafts[k]||[]).concat([p])}
function delPart(p){for(const d in drafts){const a=drafts[d];if(a&&a.includes(p))drafts[d]=a.filter(z=>z!==p)}}
const findPart=id=>allParts().find(p=>p.id===id);
const partRows=p=>{const m=vMap();return p.ids.map(id=>m.get(id)).filter(Boolean)};
const methLabel=p=>methLabel0(p)+((p.param||{}).count?'، '+fmt(p.param.count)+' واریزی':'');
function remainList(){const used=new Set(parts().filter(p=>!(aSt&&aSt.editPid===p.id)).flatMap(p=>p.ids));return splitList().filter(r=>!used.has(r.id))}
const methLabel0=p=>{const q=p.param||{};return p.method==='amount'?'سقف '+fmt(q.amount):p.method==='range'?(q.min?'از '+fmt(q.min):'')+(q.max?' تا '+fmt(q.max):''):p.method==='bank'?'هم‌بانک: '+(q.bank||''):'انتخاب دستی'};
function splitCands(){const V=validated(),m={};V.forEach(r=>{if(r.sentBid||r.full)return;(m[r.entryDate]=m[r.entryDate]||[]).push(r)});
  return Object.keys(m).sort().reverse().map(iso=>{const used=new Set((drafts[iso]||[]).flatMap(p=>p.ids)),Rm=m[iso].filter(r=>!used.has(r.id));return {iso,ok:Rm.filter(r=>r.level<2),bad:Rm.filter(r=>r.level===2).length,dr:(drafts[iso]||[]).filter(p=>!p.sent).length}})}
const calB=iso=>{const D=dates(iso);return `<span class="cal2"><b>${toFa(D.jd)}</b><small>${JM[D.jm-1]}</small></span>`};
function openSplitPick(){closeSheet();go('split1')}
const lbar=()=>`<button class="lbar" data-act="splitPick">${calB(dateVal)}<span class="tx"><small>لیست در حال تقسیم</small><b>${relDay(dateVal)}، ${dates(dateVal).fa}</b></span><span class="chg">تغییر لیست</span></button>`;
const fwd=()=>ic('back').replace('class="i"','class="i flip"');
let spTab='split';
function spSeg(){const ob=openB(),pend=ob.reduce((a,b)=>a+b.items.filter(x=>x.st==='pending').length,0);return `<div class="seg sptabs">${[['split','تقسیم و پیگیری',pend],['lists','لیست‌ها',0]].map(([k,t,n])=>`<button class="${spTab===k?'on':''}" data-act="spTab" data-t="${k}">${t}${n?` <i>${toFa(n)}</i>`:''}</button>`).join('')}</div>`}
let arcQ='',arcD='';
/* داده و کارت فشرده هر لیست (بر اساس تاریخ واریز) — مشترک بین «لیست‌ها» و «تاریخچه» */
function listsData(){const days={},CL=new Set();AM=AM||allocMap();batches.forEach(b=>{if(b.closed)b.items.forEach(i=>CL.add(i.id))});validated().forEach(r=>{const k=PD(r);(days[k]=days[k]||[]).push(r)});
  return Object.keys(days).sort().reverse().map(iso=>{const R=days[iso],ok=R.filter(r=>stOf(r.id)==='ok'||r.full),fl=R.filter(r=>stOf(r.id)==='fail'),closed=R.some(r=>CL.has(r.id)),eds=[...new Set(R.map(r=>r.entryDate))].sort(),una=R.filter(r=>!r.full&&r.level<2&&!AM.get(r.id)),sent=R.filter(r=>r.sentBid),bad=R.filter(r=>r.level===2);const done=R.length>0&&ok.length===R.length;return{iso,R,ok,fl,closed,done,eds,una,sent,bad}})}
const listCard=d=>{const D=dates(d.iso),pc=d.R.length?d.ok.length/d.R.length*100:0,reg=d.eds.length===1&&d.eds[0]===d.iso?'':'ثبت '+d.eds.map(e=>relDay(e)).join('، ')+' · ';return `<button class="arcd${d.done?' ok':''}" data-act="arcDay" data-iso="${d.iso}"><span class="cal2"><b>${toFa(D.jd)}</b><small>${JM[D.jm-1]}</small></span><span class="tx"><b>${esc(pdHead(d.iso))}</b><small>${esc(reg)}${fmt(d.R.length)} واریزی · ${fmt(d.ok.length)} تسویه${d.fl.length?' · '+fmt(d.fl.length)+' ناموفق':''}${d.closed?' · بایگانی شده':''}${!d.done&&d.una.length?' · <em class="lcu">'+fmt(d.una.length)+' تخصیص نیافته</em>':''}${d.bad.length?' · <em class="lcb">'+fmt(d.bad.length)+' خطادار</em>':''}</small><span class="ptbar" style="width:100%;margin-top:6px"><i class="ok" style="width:${pc}%"></i><i class="no" style="width:${d.R.length?d.fl.length/d.R.length*100:0}%"></i></span></span><span class="v">${fmt(sum(d.R))}<small>${d.done?'تسویه کامل ✓':'در جریان'}</small></span></button>`};
function vArch(){const L=listsData(),card=listCard;
  const aq=arcD||qDate(arcQ),LF=aq?L.filter(d=>d.iso===aq||d.eds.includes(aq)):L,open=LF.filter(d=>!d.done),done=LF.filter(d=>d.done);
  const top=`<div class="fsearch">${ic('search')}<input id="arq" type="search" placeholder="جستجوی تاریخ: ۲۱ مهر، 1405/07/21، دیروز…" value="${esc(arcQ)}" autocomplete="off" enterkeyhint="search"><button class="fcal${arcD?' on':''}" data-act="arcCal" aria-label="انتخاب تاریخ">${ic('cal')}</button></div>${aq?`<div class="fdate">${ic('cal')} لیست‌های ${esc(relDay(aq))}، ${esc(dates(aq).fa)}<button data-act="arcClr" aria-label="حذف">×</button></div>`:''}${aq&&!LF.length?'<div class="spempty" style="padding:20px 8px"><b>برای این تاریخ لیستی نیست</b></div>':''}`;
  /* همه لیست‌ها به ترتیب تاریخ واریز، جدیدترین بالا؛ هر لیست همه واریزی‌های آن روز واریز است */
  return top+(LF.length?`<div class="spsec"><div><b>لیست‌ها</b><small>${fmt(LF.length)} لیست · ${fmt(open.length)} در جریان · جدیدترین بالا</small></div></div>${LF.map(card).join('')}`:'')+(!L.length?'<div class="spempty"><div class="spill">'+ic('list')+'</div><b>هنوز لیستی ثبت نشده</b><span>با «ورود حساب» در صفحه اول شروع کنید.</span></div>':'')}
