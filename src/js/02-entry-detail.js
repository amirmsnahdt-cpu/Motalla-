/* ---------- صفحه جزئیات واریزی (مثل صفحه تراکنش بلو) ---------- */
let entId=null,entEdit=false,eD=null;
const entRow=()=>entId==null?null:validated().find(y=>String(y.id)===String(entId))||null;
function vEnt(){const x=entRow();if(!x){setTimeout(()=>{if(cur==='ent')go('home',true)},0);return ''}if(entEdit)return vEntEdit(x);
  const st=rowSt(x),t=entSt(x),si=x.sentBid?srcInfo(x.id):null,D=dates(x.entryDate),al0=allocMap().get(x.id);
  const kv=(l,shown,cp,act)=>`<div class="kv${cp?' kc':''}${act?' ka':''}${/ibv/.test(shown)?' col':''}"${cp?` data-cp="${esc(String(cp))}"`:''}${act?` data-act="${act}" data-id="${x.id}"`:''}><small>${l}</small><b>${shown}</b>${cp?`<span class="kcp">${ic('copy')}</span>`:act?ic('edit'):'<span class="kvx"></span>'}</div>`;
  const ibd=x.iban?x.iban.slice(2):'';
  /* v60.3: ردیف‌ها در سه بخش جدا (حساب بانکی، مبلغ، سایر)؛ آیکن کپی برداشته شد: زدن روی هر ردیف کپی می‌کند و اعلان می‌دهد */
  const rows=[x.iban?kv('شماره شبا',`<span class="ltr ibv">IR ${ibanGroups(ibd)}</span>`,ibd):kv('شماره شبا','—'),
    x.card?kv('شماره کارت',`<span class="ltr">${grp4(x.card)}</span>`,x.card):'',
    x.acct?kv('شماره حساب',`<span class="ltr">${esc(x.acct)}</span>`,x.acct):'',
    x.holder?kv('صاحب حساب',esc(x.holder)):'',
    kv('بانک',bankBadge(x.bankShow)+esc(x.bankShow||'نامشخص'))].join(''),
    rows2=[x.settled?kv('کل خرید',`<s class="was">${fmt(x.total)}</s> <i>تومان</i>`,x.total):kv('مبلغ',fmt(x.amount)+' <i>تومان</i>',x.amount),
    x.settled?kv('از مشتری',`<span class="kg">− ${fmt(x.settled)}</span> <i>تومان</i>`):'',
    x.settled?kv('مانده بانکی',`<span class="rmd">${fmt(x.amount)}</span> <i>تومان</i>`,x.amount):'',
    x.code?kv('فاکتور',`<span class="ltr">${esc(toEn(x.code))}</span>`,toEn(x.code)):'',
    x.weight?kv('وزن',esc(toFa(x.weight))+' <i>گرم</i>'):'',
    x.weight&&ppgOf(x.total||x.amount,x.weight)?kv('هر گرم تمام‌شده',fmt(x.ppg||ppgOf(x.total||x.amount,x.weight))+' <i>تومان</i>'):'',
    ].join(''),rows3=[x.phone?kv('شماره تماس',`<span class="ltr">${esc(x.phone)}</span>`,x.phone):'',
    x.nid?kv('کد ملی',`<span class="ltr">${esc(x.nid)}</span>`,x.nid):'',
    kv('تاریخ واریز',x.payDate?esc(payLab(x.payDate))+(['امروز','دیروز','فردا','پس‌فردا'].includes(payLab(x.payDate))?'، '+esc(dates(x.payDate).fa):''):'تعیین نشده',null,can('edit')?'entPay':null),
    kv('لیست',esc(D.fa)),
    si?kv('منبع',esc(si.src)+(si.tn?'، پیگیری '+esc(si.tn):'')):(al0&&al0.src?kv('منبع',esc(al0.src)+' <i>(آماده ارسال)</i>'):''),
    x.createdBy?kv('ثبت‌کننده',esc(x.createdBy)):''].join('');
  return `<div class="ehead"><div class="eav ${st}">${esc(userInit(fullName(x)||'؟'))}</div>${honTag(x.name)}<b class="enm">${esc(fullName(x)||'—')}</b>${x.iban?`<span class="eib kc" data-cp="${ibd}">IR ${ibanGroups(ibd)}</span>`:''}${(()=>{/* v61.4: تسویه‌شده (بانک تأیید شد یا کامل با مشتری) → کادر سبز، مبلغ تا صفر می‌شمارد و مبلغ اصلی خط‌خورده کنارش */
    const done=x.full||st==='ok',tot=x.settled?x.total:x.amount,pd=x.payDate?'واریز '+esc(payLab(x.payDate))+(['امروز','دیروز','فردا','پس‌فردا'].includes(payLab(x.payDate))?'، '+esc(dates(x.payDate).fa):''):'تاریخ واریز تعیین نشده';
    if(done)return `<div class="erem ok"><small>${x.full?'تسویه کامل با مشتری ✓':'تسویه شد ✓'}</small><b><span class="ermv" data-v="${tot}" data-to="0">${fmt(0)}</span><i>تومان</i></b><em class="erok"><s>${fmt(tot)}</s> تومان تسویه شده${x.settled&&!x.full?'، '+fmt(x.settled)+' از مشتری':''}</em></div>`;
    if(x.settled)return `<div class="eamw"><span>کل خرید</span><s>${fmt(x.total)}</s><small>تومان</small></div><div class="erem"><small>مانده برای واریز بانکی</small><b><span class="ermv" data-v="${x.total}" data-to="${x.amount}">${fmt(x.amount)}</span><i>تومان</i></b><em>${fmt(x.settled)} تومان از مشتری${(e=>{const w=(e.settles||[]).filter(z=>z.st==='wait').length;return w?'، '+toFa(w)+' مورد در انتظار تأیید':''})(entries.find(z=>z.id===x.id)||x)}</em></div>`;
    return `<div class="erem"><small>مبلغ واریز بانکی</small><b><span>${fmt(x.amount)}</span><i>تومان</i></b><em>${pd}</em></div>`})()}<span class="est ${st}">${st==='bad'?'خطادار':t?t[0]:'ثبت شده'}</span></div>
  ${st==='bad'&&x.issues&&x.issues.length?`<div class="msg bad">${esc(x.issues.join('، '))}</div>`:''}
  <div class="kvh">حساب بانکی</div><div class="kvs">${rows}</div><div class="kvh">مبلغ</div><div class="kvs">${rows2}</div><div class="kvh">سایر</div><div class="kvs">${rows3}</div>${entItems(x)}${entSettle(x)}${entPieces(x)}${entTrack(x)}
  <div class="esec enote"><b>یادداشت</b><textarea id="enote" rows="2" placeholder="یادداشت برای این واریزی…"${can('edit')?'':' disabled'}>${esc(eD&&eD.note!=null?eD.note:(x.note||''))}</textarea></div>${can('del')?`<button class="edel" data-act="entDel" data-id="${x.id}">${ic('trash')} حذف این واریزی</button>`:''}`}
/* ---- اقلام خرید در جزئیات ---- */
function entItems(x){const I=(x.items||[]).filter(z=>z.amt);if(!I.length||(I.length===1&&I[0].k==='طلا'&&!I[0].t&&!I[0].r))return '';const tot=I.reduce((s,z)=>s+(+z.amt||0),0),gw=I.filter(z=>z.k==='طلا').reduce((s,z)=>s+(parseFloat(z.q)||0),0),ga=I.filter(z=>z.k==='طلا').reduce((s,z)=>s+(+z.amt||0),0),pg=ppgOf(ga,gw);
  const icn={'طلا':'◆','سکه':'●','دلار':'$','یورو':'€'};
  return `<div class="esec eit"><b>اقلام خرید</b><small class="emeta">${fmt(I.length)} قلم · جمع ${fmt(tot)} تومان</small><div class="eitl">${I.map(z=>{const K=BZK[z.k]||{},q=parseFloat(z.q)||0;return `<div class="eitr k${['طلا','سکه','دلار','یورو'].indexOf(z.k)}"><span class="ei">${icn[z.k]||'•'}</span><span class="tx"><b>${esc(z.k)}${z.t?` <em>${esc(z.t)}</em>`:''}${z.k==='سایر'&&z.n?' · '+esc(z.n):''}</b><small>${q?esc(toFa(z.q))+' '+(K.u||'')+(z.k==='طلا'?'':''):''}${q&&z.r?' × ':''}${z.r?(z.k==='سکه'?'نرخ لحظه ':'نرخ ')+fmt(z.r):''}${!q&&!z.r?'—':''}</small></span><b class="am">${fmt(z.amt)} <i>تومان</i></b></div>`}).join('')}</div>
  <div class="eits">${gw?`<span>وزن طلا <b>${esc(toFa(Math.round(gw*1000)/1000))} گرم</b></span>`:''}${pg?`<span>هر گرم تمام‌شده <b>${fmt(pg)}</b></span>`:''}<span class="t">جمع کل <b>${fmt(tot)} تومان</b></span></div></div>`}
/* ---- تسویه از مشتری: واریز مستقیم مشتری دیگر به حساب این شخص ---- */
function entSettle(x){const e=entries.find(z=>z.id===x.id)||x,S=e.settles||[],ed=can('edit'),open=!x.full&&x.amount>0&&!(x.sentBid&&stOf(x.id)==='ok');if(!S.length&&!(ed&&open))return '';
  const W=S.filter(z=>z.st==='wait');
  const row=(z,i)=>{const w=z.st==='wait';return swW(`<div class="stlrw ${w?'w':'k'}"><button class="stlr" data-act="stlOpen" data-i="${i}"><span class="bri">${w?ic('clock'):ic('check')}</span><span class="tx"><b>${esc(z.name||'—')}</b><small>${[z.inv?'فاکتور '+esc(z.inv):'',z.tn?'پیگیری '+esc(z.tn):'',z.cuId?'حساب مشتری':''].filter(Boolean).join(' · ')||'واریز مستقیم'}</small></span><span class="brv"><b>${fmt(z.amount)} <i>تومان</i></b><small>${w?'در انتظار تأیید':'تسویه شد'}</small></span></button>${(n=>n||can('track')?`<button class="stlc${n?' on':''}" data-act="galSt" data-i="${i}" aria-label="رسیدهای تسویه">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:'')(stImgs(z).length)}</div>`,{r:ed&&w?[['stlOk','تأیید','check','#178049']]:ed?[['stlUnok','لغو تأیید','undo','#6b7385']]:[],l:ed?[['stlDelI',w?'رد':'حذف',w?'undo':'trash','#d23c48']]:[],data:{i}})};
  return `<div class="esec stl"><div class="stlh"><div><b>تسویه از مشتری</b><small>${W.length?'از مانده کم شده · کشیدن به چپ: تأیید و ثبت در حساب مشتری · به راست: رد':S.length?'از مانده کم شده؛ باقی از طریق بانک':'اگر مشتری دیگری مستقیم به این شخص پرداخت کرده، اینجا ثبت کنید'}</small></div>${ed&&open?`<button class="stladd" data-act="stlNew">${ic('plus')} ثبت تسویه</button>`:''}</div>
  ${S.length?`<div class="stll2">${S.map(row).join('')}</div>
  <div class="stls"><span>مبلغ کل <b>${fmt(x.total)}</b></span><span class="g">تأییدشده <b>${fmt(S.filter(z=>z.st!=='wait').reduce((a,z)=>a+(+z.amount||0),0))}</b></span>${W.length?`<span class="w">در انتظار <b>${fmt(W.reduce((a,z)=>a+(+z.amount||0),0))}</b></span>`:''}<span class="${x.full?'g':''}">${x.full?'تسویه کامل ✓':'مانده بانکی <b>'+fmt(x.amount)+'</b>'}</span></div>`:''}</div>`}
let stl=null,cuStlQ='';
function cuStlHTML(){const c=curCu(),q=toEn(cuStlQ.trim()),L=validated().filter(r=>!r.full&&r.amount>0&&(!q||fullName(r).includes(cuStlQ.trim())||toEn(r.code||'').includes(q)||String(r.amount).includes(q.replace(/\D/g,'')||'#'))).sort((a,b)=>String(b.entryDate+b.id).localeCompare(String(a.entryDate+a.id))).slice(0,40);
  return `<div class="sh-h"><div><b>تسویه کدام واریزی؟</b><small class="shsub">پرداخت «${esc(cuName(c||{}))}» به حساب فروشنده</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="fsearch sm">${ic('search')}<input id="csq" value="${esc(cuStlQ)}" placeholder="نام فروشنده، فاکتور یا مبلغ…" autocomplete="off"></div>
  <div class="sgr smg" id="csl">${L.length?L.map(r=>`<button class="acrow" data-act="cuStlPick" data-id="${r.id}">${bankBadge(r.bankShow,'lg')||`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(fullName(r)))}</span>`}<span class="tx"><b>${esc(fullName(r))}</b><small>واریز ${esc(payLab(PD(r)))}${r.code?' · فاکتور '+esc(toEn(r.code)):''}${r.settled?'، '+fmt(r.settled)+' تسویه شده':''}</small></span><span class="brv"><b>${fmt(r.amount)} <i>تومان</i></b></span></button>`).join(''):'<div class="spempty" style="padding:18px"><b>واریزی پیدا نشد</b></div>'}</div>`}
/* ---- رسیدهای واریز: ذخیره و اشتراک تکی یا گروهی ---- */
const d2b=d=>{const i=d.indexOf(','),h=d.slice(0,i),m=(h.match(/:(.*?);/)||[])[1]||'image/jpeg',bin=atob(d.slice(i+1)),u=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)u[k]=bin.charCodeAt(k);return new Blob([u],{type:m})};
const rcName=r=>('رسید '+(r.holder||r.name||'')+(r.payer?' از '+r.payer:'')+' '+(r.amount?Number(r.amount):'')+(r.tn?' '+r.tn:'')).trim().replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,'-')+'.jpg';
function rcStamp(d,r){return new Promise(res=>{const im=new Image();im.onload=()=>{const W=im.width,H=im.height,band=Math.max(110,Math.round(W*0.13)),c=document.createElement('canvas');c.width=W;c.height=H+band;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H+band);g.drawImage(im,0,0);g.fillStyle='#1d3b72';g.fillRect(0,H,W,4);
  const fs=Math.round(band*0.27);g.direction='rtl';g.textAlign='right';g.fillStyle='#13284f';g.font=`800 ${fs}px Vazirmatn, Tahoma, sans-serif`;g.fillText((r.holder||r.name||'')+(r.payer?' ← از '+r.payer:''),W-24,H+band*0.42);
  g.font=`600 ${Math.round(fs*0.78)}px Vazirmatn, Tahoma, sans-serif`;g.fillStyle='#55607a';g.fillText([fmt(r.amount)+' تومان',r.tn?'پیگیری '+r.tn:'',r.date?dates(r.date).fa:'',r.src||''].filter(Boolean).join('  ·  '),W-24,H+band*0.8);
  g.textAlign='left';g.direction='ltr';g.fillStyle='#b8862b';g.font=`800 ${Math.round(fs*0.8)}px Vazirmatn, Tahoma, sans-serif`;g.fillText('مطلا',24,H+band*0.62);
  c.toBlob(bl=>res(bl||d2b(d)),'image/jpeg',.92)};im.onerror=()=>res(d2b(d));im.src=d})}
async function rcFiles(L){const out=[];for(const r of L){const d=await imgGet(r.key);if(d){const bl=await rcStamp(d,r);out.push(new File([bl],rcName(r),{type:'image/jpeg'}))}}return out}
async function rcShare(files,title){if(!files.length){toast('رسیدی پیدا نشد',true);return}
  try{if(navigator.canShare&&navigator.canShare({files})){await navigator.share({files,title:title||'رسید واریز'});return}}catch(e){if(e&&e.name==='AbortError')return}
  rcDown(files)}
function rcDown(files){if(!files.length){toast('رسیدی پیدا نشد',true);return}files.forEach((f,i)=>setTimeout(()=>{try{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),8000)}catch(e){}},i*350));toast(files.length>1?fmt(files.length)+' رسید ذخیره شد':'رسید ذخیره شد')}
/* لیست رسیدهای یک مجموعه واریزی (رسید بانکی + رسید تسویه از مشتری) */
function rcOf(items){const L=[];items.forEach(x=>{const e=entries.find(q=>q.id===x.id)||{},hd=e.holder||x.name;const b=x.bid!=null&&batches.find(z=>z.id===x.bid);if(b)itImgs(b,x).forEach(k=>L.push({key:k,name:x.name,holder:hd,amount:x.amount,tn:x.tn||'',src:x.src||'',kind:'bank',bid:x.bid,iid:x.id,date:e.payDate||e.entryDate}));(e.settles||x.settles||[]).forEach(z=>{stImgs(z).forEach(k=>L.push({key:k,name:x.name+' (از '+z.name+')',holder:hd,payer:z.name,amount:z.amount,tn:z.tn||'',kind:'cust',date:z.date}))})});return L}
let RC=[],RCT='';
async function openRcpts(L,title){RC=L;RC.one=0;RCT=title||'رسیدهای واریز';
  sheet(`<div class="sh-h"><div><b>${esc(RCT)}</b><small class="shsub">${L.length?fmt(L.length)+' رسید · هر کدام جدا ذخیره یا ارسال می‌شود':'برای این لیست هنوز رسیدی ضمیمه نشده'}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${L.length?`<div class="rcall"><button class="xgo" data-act="rcShareAll">${ic('open')} اشتراک همه رسیدها</button><button class="rcsv" data-act="rcSaveAll">${ic('down')} ذخیره همه</button></div>
  <div class="sgr smg rcl">${L.map((r,i)=>`<div class="rcr"><button class="rcm" data-act="rcView" data-i="${i}" aria-label="دیدن رسید ${esc(r.name)}"><span class="rct" id="rct${i}"></span><span class="tx"><b>${esc(r.name)}</b><small>${fmt(r.amount)} تومان${r.tn?' · پیگیری '+esc(r.tn):''}${r.kind==='cust'?' · تسویه مشتری':r.src?' · '+esc(r.src):''}</small></span></button><label class="rcb" aria-label="تغییر رسید">${ic('edit')}<input type="file" accept="image/*" data-rce="${i}" hidden></label><button class="rcb" data-act="rcSave1" data-i="${i}" aria-label="ذخیره">${ic('down')}</button><button class="rcb p" data-act="rcShare1" data-i="${i}" aria-label="اشتراک">${ic('open')}</button></div>`).join('')}</div>`:`<div class="spempty" style="padding:22px 8px"><b>رسیدی نیست</b><span>رسید را از جزئیات هر واریزی، بخش «پیگیری و رسید» ضمیمه کنید.</span></div>`}`);
  L.forEach(async(r,i)=>{const d=await imgGet(r.key),el=$('rct'+i);if(el&&d)el.style.backgroundImage=`url(${d})`})}
document.addEventListener('change',async ev=>{const t=ev.target;if(!t||!t.dataset)return;const f=t.files&&t.files[0];if(!f)return;
  if(t.dataset.batt!=null){const[bid,id]=t.dataset.batt.split(':'),b=batches.find(z=>String(z.id)===bid),it=b&&b.items.find(z=>String(z.id)===id);if(!it)return;try{const d=await shrink(f);if(await imgPut(b.id+':'+it.id,d)){it.img=true;it.at=new Date().toISOString();saveB();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast('رسید ضمیمه شد')}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}catch(z){toast('این عکس خوانده نشد',true)}}
  if(t.dataset.rce!=null){const r=RC[+t.dataset.rce];if(!r)return;try{const d=await shrink(f);if(!(await imgPut(r.key,d))){toast('حافظه پر است',true);return}if(r.bid!=null){const b=batches.find(z=>z.id===r.bid),it=b&&b.items.find(z=>z.id===r.iid);if(it){it.img=true;it.at=new Date().toISOString();saveB()}}toast('رسید عوض شد ✓');const one=RC.one;if(one)ACT.rcView({i:t.dataset.rce});else openRcpts(RC,RCT);if(cur==='ent'||cur==='lday'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}}catch(z){toast('این عکس خوانده نشد',true)}}});
function entBI(x){for(const b of batches){const i=b.items.findIndex(z=>z.id===x.id);if(i>=0)return{b,i,it:b.items[i]}}return null}
function entTrack(x){const q=entBI(x);if(!q)return `<div class="esec"><b>پیگیری و رسید</b><div class="muted" style="font-size:12.5px">بعد از تقسیم و ارسال این واریزی، تأیید واریز، شماره پیگیری و عکس رسید از همین‌جا ثبت می‌شود.</div></div>`;
  /* v61.17: همه بخش‌های این واریزی (پرداخت از چند بانک) همین‌جا؛ «ویرایش منابع» مبلغ و بانک هر بخش را عوض می‌کند */
  const ed=!q.b.closed&&can('track'),F=famOf(x).map(r=>({r,q:entBI(r)})).filter(o=>o.q),multi=F.length>1,rc=rcOfEnt(x);
  const rowOf=(r,Q,k)=>{const {b,i,it}=Q,ed1=!b.closed&&can('track'),st=it.st||'pending',cls=st==='ok'?'k':st==='fail'?'f':'w',lab=st==='ok'?'واریز شد':st==='fail'?'ناموفق':'در انتظار تأیید',so=sources.find(z=>z.name===it.src),bk=so?acBank(so):'';
    return swW(`<div class="stlrw ${cls}${multi&&r.id===x.id?' me':''}"><button class="stlr" data-act="itOpen" data-b="${b.id}" data-i="${i}"><span class="bri">${bk?bankBadge(bk):st==='ok'?ic('check'):st==='fail'?'<b>✕</b>':ic('clock')}</span><span class="tx"><b>${esc(it.src||'—')}</b><small>${[multi?'بخش '+toFa(k+1):'واریز بانکی',it.tn?'پیگیری '+esc(it.tn):'',it.time?'ساعت '+esc(toFa(it.time)):''].filter(Boolean).join(' · ')}</small></span><span class="brv"><b>${fmt(it.amount!=null?+it.amount:r.amount)} <i>تومان</i></b><small>${lab}</small></span></button>${(n=>n||can('track')?`<button class="stlc${n?' on':''}" data-act="galIt" data-id="${r.id}" aria-label="رسیدهای واریز">${ic(n?'cam':'plus')}${n>1?`<em>${toFa(n)}</em>`:''}</button>`:'')(itImgs(b,it).length)}</div>`,{r:ed1?(st==='ok'?[['entTkQ','لغو تأیید','undo','#6b7385']]:[['entTkQ','تأیید','check','#178049']]):[],l:ed1&&st!=='fail'?[['entTkF','ناموفق','x','#d23c48']]:[],data:{id:r.id,st:'ok'}})};
  const tot=F.reduce((a,o)=>a+(+o.q.it.amount||0),0);
  return `<div class="esec stl"><div class="stlh"><div><b>واریز بانکی${multi?' از '+toFa(F.length)+' بانک':''}</b><small>${multi?'جمع '+fmt(tot)+' تومان · ':''}${ed?'کشیدن به چپ: تأیید · به راست: ناموفق':'لیست این واریزی بسته شده · رسید را هنوز می‌توانید اضافه کنید'}</small></div>${rc.length?`<button class="stladd sh" data-act="rcEntAll" data-id="${x.id}">${ic('open')} ارسال رسیدها <i>${toFa(rc.length)}</i></button>`:''}</div><div class="stll2">${F.map((o,k)=>rowOf(o.r,o.q,k)).join('')}</div>${ssCan(x)?`<button class="sssbtn" data-act="sentSplit" data-id="${x.id}">${ic('split')}<span>${multi?'ویرایش منابع و مبلغ‌ها':'بخشی از مبلغ از بانک دیگر'}</span></button>`:''}</div>`}
/* همه رسیدهای یک واریزی: بانکی + تسویه‌های مشتری */
function rcOfEnt(x){const e=entries.find(z=>z.id===x.id)||x,q=entBI(x),L=[];if(q)itImgs(q.b,q.it).forEach(k=>L.push({key:k,name:fullName(x),holder:x.holder||fullName(x),amount:q.it.amount,tn:q.it.tn||'',src:q.it.src||'',date:PD(x),kind:'bank',bid:q.b.id,iid:q.it.id}));(e.settles||[]).forEach(z=>{stImgs(z).forEach(k=>L.push({key:k,name:fullName(x)+' (از '+z.name+')',holder:x.holder||fullName(x),payer:z.name,amount:z.amount,tn:z.tn||'',date:z.date,kind:'cust',sid:z.id}))});return L}
const eDirty=()=>{if(!eD)return false;const x=entRow();if(!x)return false;const q=entBI(x);return (eD.note!=null&&eD.note.trim()!==(x.note||''))||(q&&((eD.st!=null&&eD.st!==q.it.st)||(eD.tn!=null&&eD.tn!==(q.it.tn||''))||!!eD.imgD))};
const eUpd=()=>{const a=$('act');if(a)a.innerHTML=aEnt()};
function bindEnt(){/* v60.3: باز شدن صفحه: مانده از «کل خرید» تا مانده واقعی می‌شمارد (یک بار، نه با هر تازه‌سازی) */
  {const m=document.querySelector('.ermv');if(m){if(!render._same){m.textContent=fmt(+m.dataset.v);setTimeout(()=>{if(m.isConnected)tween(m,+m.dataset.to)},260)}else m.dataset.v=m.dataset.to}}
{const V=$('view');if(V&&!V._satt){V._satt=1;V.addEventListener('change',async ev=>{const i=ev.target&&ev.target.dataset&&ev.target.dataset.satt;if(i==null||cur!=='ent')return;const f=ev.target.files&&ev.target.files[0],e=stlE(),z=e&&(e.settles||[])[+i];if(!f||!z)return;try{const d=await shrink(f),k='stl:'+z.id;if(await imgPut(k,d)){z.img=k;stlDone(e,'رسید «'+z.name+'» ضمیمه شد')}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}catch(q){toast('این عکس خوانده نشد',true)}})}}const x=entRow();if(!x)return;if(entEdit){bindEntEdit();return}const n=$('enote');if(n)n.oninput=()=>{eD=eD||{};eD.note=n.value;eUpd()};
  const q=entBI(x);if(!q)return;const t=$('etn');if(t)t.oninput=()=>{eD=eD||{};eD.tn=toEn(t.value).replace(/\D/g,'');eUpd()};
  const f=$('eimg');if(f)f.onchange=async()=>{const fl=f.files&&f.files[0];if(!fl)return;try{const d=await shrink(fl);eD=eD||{};eD.imgD=d;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}catch(z){toast('این عکس خوانده نشد',true)}}}
async function entCommit(){const x=entRow();if(!x||!eD)return;const e=entries.find(y=>y.id===x.id),q=entBI(x),now=new Date().toISOString();
  if(eD.imgD&&q){if(!(await imgPut(ikey(q.b,q.it),eD.imgD))){toast('حافظه پر است؛ عکس ذخیره نشد',true);return}q.it.img=true}
  if(q){if(eD.st!=null){q.it.st=eD.st;q.it.at=now}if(eD.tn!=null)q.it.tn=eD.tn;saveB()}
  if(e&&eD.note!=null&&eD.note.trim()!==(e.note||'')){e.note=eD.note.trim();e.updatedBy=who();e.updatedAt=now;saveE()}
  eD=null;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast('تغییرات ثبت شد')}
const aEnt=()=>{const x=entRow();if(x&&!entEdit&&eDirty())return `<button class="btn sec" data-act="entDraftOff">انصراف</button><button class="btn gold" data-act="entCommit">${ic('check')} ثبت تغییرات</button>`;if(x&&entEdit)return `<button class="btn sec" data-act="entEditOff">انصراف</button><button class="btn gold" data-act="entSave">${ic('check')} ذخیره</button>`;return x?`<button class="btn sec" data-act="cpEnt" data-id="${x.id}">${ic('copy')} کپی همه</button><button class="btn gold" data-act="entEditOn">${ic('edit')} ویرایش</button>`:''};
let eeTitle='';
function vEntEdit(x){const e=entries.find(y=>y.id===x.id)||x;eeTitle=e.title||'';
  const row=(id,l,v,o={})=>`<label class="er${o.ib?' col ib':''}${o.big?' big':''}" for="${id}"><span class="erl">${l}${o.suf?` <i class="eu">(${o.suf})</i>`:''}</span><span class="erv">${id==='eeI'?'<span id="eeIb"></span>':''}${o.pre?`<em>${o.pre}</em>`:''}<input id="${id}"${o.ltr?' class="ltr"':''}${o.im?` inputmode="${o.im}"`:''} value="${esc(v||'')}" placeholder="${o.ph||''}" autocomplete="off" enterkeyhint="next"></span></label>${o.hint?`<small class="eh erh" id="${id}v"></small>`:''}`;
  return `<div class="eform2">
  <div class="ehero"><div class="eav">${esc(userInit(fullName(e)||'؟'))}</div><div>${honTag(e.name)}<b>${esc(fullName(e)||'—')}</b><small>ثبت ${esc(dates(e.entryDate).fa)}${e.createdBy?'، '+esc(e.createdBy):''}</small></div></div>
  <div class="egh">اطلاعات مشتری</div><div class="eg">
    ${row('eeN','نام',e.name,{ph:'نام و نام خانوادگی'})}
    ${row('eeP','شماره تماس',e.phone,{ltr:1,im:'tel',ph:'09xxxxxxxxx',hint:1})}
    ${row('eeM','کد ملی',e.nid,{ltr:1,im:'numeric',ph:'۱۰ رقم',hint:1})}
    ${row('eeC','فاکتور',toEn(e.code||''),{ltr:1,im:'numeric',ph:'شماره فاکتور'})}</div>
  <div class="egh">وزن و مبلغ</div><div class="eg">
    ${row('eeW','وزن',e.weight,{ltr:1,im:'decimal',ph:'—',suf:'گرم',hint:1})}
    ${row('eeA','مبلغ',e.amount?Number(e.amount).toLocaleString('en-US'):'',{ltr:1,im:'numeric',suf:'تومان',big:1})}</div>
  <div class="egh">حساب مقصد</div><div class="eg">
    ${row('eeI','شماره شبا',ibanGroups((e.iban||'').replace(/^IR/,'')),{ltr:1,im:'numeric',pre:'IR',ph:'۲۴ رقم',hint:1,col:1,ib:1})}
    ${row('eeK','کارت',grp4(e.card||''),{ltr:1,im:'numeric',ph:'اختیاری',hint:1})}
    ${row('eeH','صاحب حساب',e.holder||'',{ph:'اگر با مشتری فرق دارد'})}
    <button class="er ebtn" data-act="eePay"><span class="erl">تاریخ واریز</span><span class="erv"><b id="eePayL">${esc(payLab(fPay))}، ${esc(dates(fPay).fa)}</b>${ic('cal')}</span></button></div>
  <button class="emore" data-act="edit" data-id="${e.id}">${ic('debt')} واریز مستقیم مشتری و تنظیمات بیشتر</button></div>`}
const eeTitles=()=>['خانم','آقا',''].map(t=>`<button class="tch${eeTitle===t?' on':''}" data-act="eeT" data-t="${t}">${t||'بدون عنوان'}</button>`).join('');
function eeIbanChk(){const el=$('eeI'),o=$('eeIv');if(!el||!o)return;const v=dg(el.value).slice(0,24);{const bb=$('eeIb'),b5=v.length>=5?BANKS[v.slice(2,5)]||'':'';if(bb)bb.innerHTML=b5?bankBadge(b5,'lg'):''}if(!v){o.textContent='';o.className='eh erh';return}
  if(v.length<24){o.className='eh erh';o.textContent=toFa(v.length)+' از ۲۴ رقم';return}if(!ibanOk('IR'+v)){o.className='eh erh bad';o.textContent='شماره شبا اشتباه است';return}const b=ibanBank('IR'+v);o.className='eh erh ok';o.textContent='شبا معتبر است'+(b?' · بانک '+b:'')}
function bindEntEdit(){const A=$('eeA'),I=$('eeI'),K=$('eeK'),C=$('eeC');if(!A)return;
  A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};C.oninput=()=>{C.value=toEn(C.value).replace(/[^0-9A-Za-z\-\/]/g,'')};
  I.oninput=()=>{const v=dg(I.value).slice(0,24);I.value=ibanGroups(v);eeIbanChk()};
  K.oninput=()=>{const v=dg(K.value).slice(0,16);K.value=grp4(v);const o=$('eeKv');o.className='eh erh'+(v.length===16?(luhn(v)?' ok':' bad'):'');o.textContent=!v?'':v.length<16?toFa(v.length)+' از ۱۶ رقم':luhn(v)?'کارت معتبر است':'رقم کنترلی کارت نمی‌خواند'};
  const P=$('eeP'),M=$('eeM'),W=$('eeW'),hn=(id,t,c)=>{const o=$(id+'v');if(o){o.textContent=t;o.className='eh erh'+(c?' '+c:'')}};
  P.oninput=()=>{const v=toEn(P.value).replace(/\D/g,'').slice(0,11);P.value=v;const m=phoneMsg(v);hn('eeP',m[0],m[1])};P.oninput();
  M.oninput=()=>{const v=toEn(M.value).replace(/\D/g,'').slice(0,10);M.value=v;hn('eeM',v.length===10?(nidOk(v)?'کد ملی معتبر است':'کد ملی معتبر نیست'):'',v.length===10?(nidOk(v)?'ok':'bad'):'')};
  const pgH=()=>{const pg=ppgOf(num($('eeA').value),W.value);hn('eeW',pg?'هر گرم تمام‌شده: '+fmt(pg)+' تومان':'',pg?'ok':'')};
  W.oninput=()=>{W.value=toEn(W.value).replace(/[٫،,\/]/g,'.').replace(/[^0-9.]/g,'').replace(/(\..*)\./g,'$1');pgH()};A.addEventListener('input',pgH);pgH();
  const F=['eeN','eeP','eeM','eeC','eeW','eeA','eeI','eeK','eeH'];F.forEach((id,i)=>{const el=$(id);if(el)el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(i<F.length-1)$(F[i+1]).focus();else{el.blur()}}})});
  eeIbanChk();if(K.value)K.oninput();if(M.value)M.oninput()}
function entSave(){const x=entRow(),i=x?entries.findIndex(y=>y.id===x.id):-1;if(i<0)return;const e0=entries[i];
  const name=stripName($('eeN').value),amount=num($('eeA').value),code=toEn($('eeC').value).trim(),dI=dg($('eeI').value).slice(0,24),card=dg($('eeK').value).slice(0,16),phone=toEn($('eeP').value).replace(/\D/g,''),nidv=toEn($('eeM').value).replace(/\D/g,''),weight=toEn($('eeW').value).trim(),holder=clean($('eeH').value||'');
  if(phone&&!phoneOk(phone)){toast('شماره تماس درست نیست',true);$('eeP').focus();return}if(nidv&&!nidOk(nidv)){toast('کد ملی معتبر نیست',true);$('eeM').focus();return}
  if(!name){toast('نام را وارد کنید',true);$('eeN').focus();return}if(!amount){toast('مبلغ را وارد کنید',true);$('eeA').focus();return}
  if((e0.settles||[]).reduce((a,z)=>a+(+z.amount||0),0)>amount){toast('مبلغ از جمع واریز مستقیم مشتری کمتر است',true);return}
  const iban=dI?'IR'+dI:'',before=pick(e0);entries[i]={...e0,name,amount,code,iban,card,phone,nid:nidv,weight,ppg:ppgOf(amount,weight),holder:holder&&holder!==name?holder:'',title:'',payDate:fPay||e0.payDate||e0.entryDate,bank:iban===e0.iban?e0.bank:'',updatedBy:who(),updatedAt:new Date().toISOString()};
  logA('edit','ویرایش واریزی',name+' | '+fmt(amount)+' تومان',{ids:[e0.id],before,after:pick(entries[i])});saveE();alloc=null;entEdit=false;eD=null;back();
  const bad=iban&&!ibanOk(iban);toast(bad?'ذخیره شد، اما شماره شبا اشتباه است':'تغییرات ذخیره شد ✓',bad)}
