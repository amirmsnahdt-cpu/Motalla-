/* ---------- جستجو (مثل صفحه تراکنش‌های بلو: فیلترها + گروه‌بندی روز) ---------- */
let fV='cards',fQ='',fF='all',fN=120,fS='',fR=0,findY=0,fD='',fP='',fG='pay',fT='';
const fTK=x=>fG==='pay'?PD(x):x.entryDate;
const PD=x=>x.payDate||x.entryDate;
function pdHead(k){const l=payLab(k),D=dates(k);return ['امروز','دیروز','فردا','پس‌فردا'].includes(l)?'واریز '+l+'، '+D.fa:'واریز '+D.wd+'، '+D.fa}
function qDate(q){q=toEn(String(q||'')).trim().replace(/\s+/g,' ');if(!q)return '';const t=todayISO();if(q==='امروز')return t;if(q==='فردا')return isoAdd(t,1);if(q==='دیروز')return isoAdd(t,-1);if(q==='پس‌فردا'||q==='پس فردا')return isoAdd(t,2);
  const cy=g2j(t)[0],mk=(jy,jm,jd)=>{if(jm<1||jm>12||jd<1||jd>31)return '';const g=j2g(jy,jm,jd);return g[0]+'-'+p2(g[1])+'-'+p2(g[2])};let m;
  if(m=q.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/)){const y=+m[1];if(y>1900)return y+'-'+p2(+m[2])+'-'+p2(+m[3]);return mk(y,+m[2],+m[3])}
  if(m=q.match(/^(\d{1,2})[\/\-.](\d{1,2})$/))return mk(cy,+m[1],+m[2]);
  if(m=q.match(/^(\d{1,2}) ?([^\d\s]+)(?: ?(\d{2,4}))?$/)){const i=JM.indexOf(m[2]);if(i<0)return '';let y=m[3]?+m[3]:cy;if(y<100)y+=1400;return mk(y,i+1,+m[1])}
  return ''}
const fScope=V=>{const qd=qDate(fQ);return V.filter(x=>(!fD||x.entryDate===fD)&&(!fP||PD(x)===fP)&&(!fT||fTK(x)===fT)&&(!qd||x.entryDate===qd||PD(x)===qd))};
/* هر چیزی از واریزی و مشتری قابل جستجوست: نام، صاحب حساب، فاکتور، تلفن، کد ملی، شبا، کارت، حساب، مبلغ، منبع، پیگیری، یادداشت و تسویه‌ها */
function findHay(x,al,BI){const bi=x.sentBid?BI.get(x.id):null,S=x.settles||[],D=v=>toEn(String(v==null?'':v)).replace(/\D/g,'');
  const t=[fullName(x),x.holder,x.bankShow,x.bank,x.createdBy,x.updatedBy,x.code,al&&al.src,x.note,x.phone,x.nid,bi&&bi.it.src,bi&&bi.it.tn,bi&&bi.it.note,...S.flatMap(z=>[z.name,z.tn,z.note,z.inv,z.phone])].filter(Boolean).map(v=>toEn(String(v))).join(' ').toLowerCase();
  const d=[x.code,(entries.find(z=>z.id===x.id)||{}).sno,x.iban,x.card,x.acct,x.amount,x.total,x.phone,x.nid,al&&al.tn,bi&&bi.it.tn,...S.flatMap(z=>[z.amount,z.tn,z.inv,z.phone])].map(D).filter(v=>v.length>=2);return{t,d}}
function findRows(){const q=toEn(fQ.trim()).toLowerCase(),qd=q.replace(/\D/g,''),QD=qDate(fQ);AM=AM||allocMap();const BI=new Map();if(q)batches.forEach(b=>b.items.forEach(it=>{if(!BI.has(it.id))BI.set(it.id,{b,it})}));
  return validated().filter(x=>{const al=AM.get(x.id);if(fF!=='all'&&rowSt(x)!==fF)return false;if(fS&&(!al||(al.src!==fS&&al.key!==fS)))return false;if(fS&&fR&&(!al||al.rnd!==fR))return false;if(fD&&x.entryDate!==fD)return false;if(fP&&PD(x)!==fP)return false;if(fT&&fTK(x)!==fT)return false;if(!q)return true;if(QD)return x.entryDate===QD||PD(x)===QD;
    const H=findHay(x,al,BI);return H.t.includes(q)||(qd.length>=2&&/^[\d\s,.\-\/+]+$/.test(q)&&H.d.some(v=>v.includes(qd)))})
   .sort((a,b)=>{const ka=fG==='pay'?PD(a):a.entryDate,kb=fG==='pay'?PD(b):b.entryDate;return ka<kb?1:ka>kb?-1:(b.id-a.id)})
   /* v77.9 (باگ گزارش‌شده): یک واریزی که از چند بانک پرداخت شده یک ردیف است (نه هر بخش جدا) — مگر فیلتر منبع روشن باشد */
   .reduce((o,x)=>{if(fS)return o.push(x),o;const k=famRoot(x);if(o.seen.has(k))return o;o.seen.add(k);const F=famOf(x);if(F.length<2){o.push(x);return o}const r=F[0];o.push({...r,amount:F.reduce((a,z)=>a+(+z.amount||0),0),_fam:F});return o},Object.assign([],{seen:new Set()})).slice()}
function listCardsHTML(){const aq=fT||fP||fD||qDate(fQ),D=listsData(),M={};D.forEach(d=>M[d.iso]=d);const L=pdOrd(D.map(d=>d.iso)).map(k=>M[k]).filter(d=>!aq||d.iso===aq||d.eds.includes(aq));
  if(!L.length)return `<div class="bempty">${ic('list')}<b>${aq?'برای این تاریخ لیستی نیست':'هنوز لیستی ثبت نشده'}</b></div>`;
  return `<div class="lcards">${L.map(listCard).join('')}</div>`}
const cardsMode=()=>cur==='split1'&&spTab==='lists'&&fV==='cards'&&!(fQ.trim()&&!qDate(fQ))&&fF==='all'&&!fS;
function findHTML(){if(cardsMode())return listCardsHTML();const all=findRows(),L=all.slice(0,fN);if(!all.length)return `<div class="bempty">${ic('search')}<b>${fQ.trim()?'چیزی پیدا نشد':'واریزی‌ای نیست'}</b><span>${fQ.trim()?'نام، فاکتور، مبلغ یا بخشی از شبا را امتحان کنید':''}</span></div>`;
  const HIT=!!(fQ.trim()||fS||fF!=='all'||fT||fP||fD),KF=fG==='pay'?PD:(z=>z.entryDate);let h='',last=null;L.forEach(x=>{const k=KF(x);if(k!==last){if(last!==null)h+='</div>';last=k;const r=relDay(last);const dl=all.filter(z=>KF(z)===last);h+=`<div class="fday sticky${fG==='pay'?' pd':''}${HIT?' hit':''}"><span>${fG==='pay'?esc(pdHead(last)):(['امروز','دیروز','فردا'].includes(r)?r+'، ':'')+esc(dates(last).fa)}</span><small>${fmt(dl.length)} واریزی · <b>${fmt(sum(dl))}</b> تومان</small></div><div class="blist fcard${HIT?' hit':''}">`}h+=homeRow(x)});if(last!==null)h+='</div>';
  return `${h}${all.length>fN?`<button class="btn sec" style="width:100%;margin-top:10px" data-act="findMore">نمایش بیشتر (${fmt(all.length-fN)} مورد دیگر)</button>`:''}`}
function findFD(){AM=allocMap();const V0=validated(),V=fScope(V0),cnt=k=>V.filter(x=>rowSt(x)===k).length,SC={},RC={};V.forEach(x=>{const a=AM.get(x.id);if(a&&a.src){SC[a.src]=(SC[a.src]||0)+1;if(a.rn>1){const o=RC[a.src]=RC[a.src]||{};o[a.rnd]=(o[a.rnd]||0)+1}}});const SL=Object.keys(SC).sort((a,b)=>SC[b]-SC[a]);if(fS&&!SC[fS])fS='';
  const chips=[['all','همه',V.length],['bad','خطادار',cnt('bad')],['new','ثبت شده',cnt('new')],['pend','ارسال شده',cnt('pend')],['ok','تسویه شده',cnt('ok')],['fail','ناموفق',cnt('fail')]].filter(c=>c[0]==='all'||c[2]||fF===c[0]);
  return {V0,V,chips,SL,SC,RC}}
function vFind(){const {V0,V,chips,SL,SC,RC}=findFD();
  const vseg=cur==='split1'?`<div class="seg lvseg">${[['cards','لیست‌ها (فشرده)'],['rows','همه واریزی‌ها']].map(([k,t])=>`<button class="${fV===k?'on':''}" data-act="fV" data-v="${k}">${t}</button>`).join('')}</div>`:'';
  return vseg+`<div class="fwrap${cardsMode()?' cm':''}"><div class="fsearch">${ic('search')}<input id="fq" type="search" placeholder="${cur==='split1'&&fV==='cards'?'تاریخ واریز: ۲۱ مهر، فردا، 1405/07/21… یا نام':'نام، فاکتور، تلفن، مبلغ، شبا…'}" value="${esc(fQ)}" autocomplete="off" enterkeyhint="search"><button class="x${fQ?'':' hide'}" data-act="fClr" aria-label="پاک کردن">×</button><button class="fcal${fT?' on':''}" data-act="fCal" aria-label="جستجوی تاریخ">${ic('cal')}</button>${fBtn()}</div>
  ${fT?`<div class="fdate">${ic('cal')} ${fG==='pay'?'تاریخ واریز':'تاریخ ثبت'}: ${esc(relDay(fT))}، ${esc(dates(fT).fa)}<button data-act="fTClr" aria-label="حذف">×</button></div>`:''}${qDate(fQ)?`<div class="fdate">${ic('cal')} لیست‌های ${esc(dates(qDate(fQ)).fa)} (ثبت یا واریز)</div>`:''}${fD?`<div class="fdate">${ic('cal')} فقط لیست ${esc(dates(fD).fa)}<button data-act="fDClr" aria-label="حذف">×</button></div>`:''}${fP?`<div class="fdate">${ic('cal')} فقط ${esc(pdHead(fP))}<button data-act="fPClr" aria-label="حذف">×</button></div>`:''}${fActHTML(chips)}<div id="fres">${findHTML()}</div></div>`}
/* v61.97 (خواسته صاحب اپ): فیلترهای جستجوی واریزی‌ها مثل حساب مشتریان — یک دکمه «فیلتر» داخل جستجو و پنجره مرتب
   (وضعیت، تاریخ واریز، منبع و مرحله، مرتب‌سازی)؛ زیر جستجو فقط برچسب فیلترهای فعال */
const fNAct=()=>(fF!=='all'?1:0)+(fP?1:0)+(fS?1:0);
const fBtn=()=>`<button class="cufbtn${fNAct()?' on':''}" data-act="fOpen" aria-label="فیلتر واریزی‌ها">${ic('filter')}<span>فیلتر</span>${fNAct()?`<em>${toFa(fNAct())}</em>`:''}</button>`;
function fActHTML(chips){if(!fNAct())return '';const c=chips.find(z=>z[0]===fF);
  return `<div class="cufa">${fF!=='all'&&c?`<button class="cufp${fF==='bad'||fF==='fail'?' d':''}" data-act="fF" data-f="all">${c[1]} <i>${fmt(c[2])}</i><span class="cufx">×</span></button>`:''}${fP?`<button class="cufp" data-act="fP" data-iso="${fP}">${ic('cal')}واریز ${esc(payLab(fP))}<span class="cufx">×</span></button>`:''}${fS?`<button class="cufp" data-act="fS" data-s="${esc(fS)}">${ic('split')}${esc(fS)}${fR?' · مرحله '+toFa(fR):''}<span class="cufx">×</span></button>`:''}${fNAct()>1?`<button class="cufclr" data-act="fClrAll">پاک کردن همه</button>`:''}</div>`}
function findSheetHTML(){const {V0,V,chips,SL,SC,RC}=findFD(),t=todayISO(),PC={};V0.forEach(x=>{const k=PD(x);if(k>=t)PC[k]=(PC[k]||0)+1});const PK=Object.keys(PC).sort().slice(0,8);
  const row=(a,data,on,lab,sub,n,cl,ico)=>`<button class="cufr${on?' on':''}${cl?' '+cl:''}" data-act="fX" data-a="${a}" ${data}><span class="cufi">${ico||ic('check')}</span><span class="tx"><b>${lab}</b>${sub?`<small>${sub}</small>`:''}</span>${n!=null?`<em>${fmt(n)}</em>`:''}<span class="cufc">${ic('check')}</span></button>`;
  const SI={all:'list',bad:'x',new:'plus',pend:'clock',ok:'check',fail:'x'};
  const st=chips.map(c=>row('fF',`data-f="${c[0]}"`,fF===c[0],c[1],'',c[2],c[0]==='bad'||c[0]==='fail'?'d':'',ic(SI[c[0]]||'check'))).join('');
  const pd=PK.length?[row('fP',`data-iso="${fP||'-'}"`,!fP,'همه روزها','',null,'',ic('cal')),...PK.map(k=>row('fP',`data-iso="${k}"`,fP===k,esc(payLab(k)),esc(dates(k).wd+' '+dates(k).fa),PC[k],'',ic('cal')))].join(''):'';
  const sr=SL.length?[row('fS',`data-s="${esc(fS||'-')}"`,!fS,'همه منبع‌ها','',null,'',ic('split')),...SL.map(n=>row('fS',`data-s="${esc(n)}"`,fS===n,esc(n),RC[n]?toFa(Object.keys(RC[n]).length)+' مرحله':'',SC[n],'',ic('bank')))].join(''):'';
  const rn=fS&&RC[fS]?`<div class="seg frnd">${[[0,'همه مراحل',SC[fS]],...Object.keys(RC[fS]).sort((a,b)=>a-b).map(k=>[+k,'مرحله '+toFa(k),RC[fS][k]])].map(([k,tt,n])=>`<button class="${fR===k?'on':''}" data-act="fX" data-a="fR" data-r="${k}">${tt} <i>${fmt(n)}</i></button>`).join('')}</div>`:'';
  return `<div class="sh-h"><div><b>فیلتر واریزی‌ها</b><small class="shsub">با جستجو و تاریخ با هم کار می‌کنند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="cufs ffs"><div class="f6h">مرتب‌سازی لیست‌ها</div><div class="seg fsrt">${[['entry','تاریخ ثبت'],['pay','تاریخ واریز']].map(([k,tt])=>`<button class="${fG===k?'on':''}" data-act="fX" data-a="fG" data-g="${k}">${tt}</button>`).join('')}</div>
  <div class="f6h">وضعیت</div><div class="cufg2">${st}</div>
  ${pd?`<div class="f6h">تاریخ واریز</div><div class="cufg2">${pd}</div>`:''}
  ${sr?`<div class="f6h">منبع</div><div class="cufg2">${sr}</div>${rn}`:''}</div>
  <div class="cufbar">${fNAct()?`<button class="btn sec" data-act="fClrAll">پاک کردن</button>`:''}<button class="xgo" data-act="close">${ic('check')} نمایش ${fmt(V.filter(x=>fF==='all'||rowSt(x)===fF).length)} واریزی</button></div>`}
function bindFind(){const q=$('fq');if(!q)return;if(findY){const y=findY;findY=0;requestAnimationFrame(()=>{$('view').scrollTop=y})}q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(q._t);fQ=q.value;fN=120;q.blur();q._noFocus=1;const was=q._qd||'',now=qDate(fQ);if(was!==now){render()}else{const w=document.querySelector('.fwrap');if(w)w.classList.toggle('cm',cardsMode());srchSwap('fres',findHTML())}}};q.oninput=()=>{fQ=q.value;fN=120;document.querySelector('.fsearch .x').classList.toggle('hide',!fQ);clearTimeout(q._t);q._t=setTimeout(()=>{{const w=document.querySelector('.fwrap');if(w)w.classList.toggle('cm',cardsMode())}const was=q._qd||'',now=qDate(fQ);q._qd=now;if(was!==now){const pos=q.selectionStart;render();const n=$('fq');if(n){n._qd=now;n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}return}srchSwap('fres',findHTML())},130)};if(!fQ&&fF==='all'&&!fS&&!fP&&!fD&&!q._noFocus)setTimeout(()=>{if(document.activeElement!==q&&cur==='find'&&!$('view').scrollTop)q.focus()},250)}
/* خانه مثل بلو: بخش آبی بالا ثابت می‌ماند و لیست مثل یک برگه روی آن بالا می‌آید */
function homeLayout(){const V=$('view'),P=V.querySelector('.bpanel');if(!P)return;P.style.minHeight=Math.max(240,V.clientHeight-2)+'px';homeCmp()}
function homeCmp(){if(cur!=='home')return;const V=$('view'),H=V.querySelector('.bhero'),B=$('bar');if(!H||!B)return;B.classList.toggle('cmp',V.scrollTop>H.offsetHeight-70)}
const HERO_C={l:'#2152d9',d:'#14306e'};
function paintBars(){const dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);
  const home=cur==='home'&&!!TOKEN,top=home?(dark?HERO_C.d:HERO_C.l):(dark?'#0a1222':'#f5f6f8');
  const old=[...document.querySelectorAll('meta[name="theme-color"]')];if(!(old.length===1&&old[0].content===top&&!old[0].media)){old.forEach(m=>m.remove());const n=document.createElement('meta');n.name='theme-color';n.content=top;document.head.appendChild(n)}
  try{if(window.AndroidBridge&&AndroidBridge.setStatusBar)AndroidBridge.setStatusBar(top,home||dark)}catch(e){}}
/* ترتیب لیست‌ها در خانه: واریز امروز بالا، بعد روزهای آینده به ترتیب، بعد روزهای گذشته */
const pdOrd=K=>{const t=todayISO();return K.slice().sort((a,b)=>{const ra=a===t?0:a>t?1:2,rb=b===t?0:b>t?1:2;return ra!==rb?ra-rb:ra===2?(a<b?1:-1):(a<b?-1:1)})};
function vHome(){AM=allocMap();const lo=isoAdd(dateVal,-HOME_DAYS),L0=validated().filter(x=>x.entryDate===dateVal||PD(x)>=lo),r=relDay(dateVal),lab=['امروز','دیروز','فردا'].includes(r)?r:'این روز',PKH=pdOrd([...new Set(L0.map(PD))]);if(!homeP||!PKH.includes(homeP))homeP=PKH.includes(dateVal)?dateVal:(PKH[0]||'');const PKP=PKH.filter(k=>k>=dateVal),D=dates(homeP||dateVal),L=homeP?L0.filter(x=>PD(x)===homeP):[];
  const bad=L.filter(x=>x.level===2),ok=L.filter(isOkE),pend=L.filter(x=>x.level<2&&!isOkE(x)),f=flowState(),pa=pendingAll();
  if(homeF==='bad'&&!bad.length||homeF==='ok'&&!ok.length||homeF==='pend'&&!pend.length)homeF='all';
  const chip=(k,n,t,cls)=>n?`<button class="bhc-i ${cls}${homeF===k?' on':''}" data-act="homeF" data-f="${k}"><b>${fmt(n)}</b> ${t}</button>`:'';
  let h=`<div class="bhero">${glHomeHTML()}<div class="bhl">جمع واریز ${homeP?esc(payLab(homeP)):lab}</div><div class="bhv">${fmt(sum(L))}<small>تومان</small></div>
    <span class="bhd">${ic('cal')}<span>${esc(D.wd)}، ${D.fa}</span></span>
    ${PKP.length>1?`<div class="bhp${PKP.length>3?' scr':''}">${PKP.map(k=>[k,payLab(k),L0.filter(x=>PD(x)===k)]).map(([k,t,A])=>`<button class="${homeP===k?'on':''}" data-act="homeP" data-iso="${k}"><span>${esc(t)}</span><b>${fmt(sum(A))}</b><small>${fmt(A.length)} واریزی</small></button>`).join('')}</div>`:''}
    <div class="bhc">${chip('bad',bad.length,'خطادار','r')}${chip('ok',ok.length,'تسویه شده','g')}${chip('pend',pend.length,'در انتظار','w')}</div>
    <div class="bha"><button class="ba pri" data-act="entryMenu"><i>${ic('plus')}</i><span>ورود حساب</span></button><button class="ba" data-act="tab" data-n="split"><i>${ic('split')}</i><span>لیست‌ها</span>${pa?`<em>${toFa(pa)}</em>`:''}</button></div></div>`;
  const fOk=x=>homeF==='bad'?x.level===2:homeF==='ok'?isOkE(x):homeF==='pend'?(x.level<2&&!isOkE(x)):true,rows=L0.filter(x=>fOk(x)&&(!homePick||PD(x)===homeP)).slice().reverse();
  h+=`<div class="bpanel"><div class="grab"><i class="pspin"></i></div><div class="bph"><div><b>${homePick?'لیست واریز '+esc(payLab(homeP)):'لیست‌های واریز'}</b><small>${homePick?fmt(L.length)+' واریزی · '+fmt(sum(L))+' تومان':'به تفکیک روز · امروز بالا'+(L0.length?'، '+fmt(PKH.length)+' روز':'')}${homeF!=='all'?'، فیلتر: '+({bad:'خطادار',ok:'تسویه شده',pend:'در انتظار'})[homeF]:''}</small></div>${homeF!=='all'?'<button class="link" data-act="homeF" data-f="all">همه</button>':homePick?`<button class="link" data-act="homeP" data-iso="${homeP}">همه روزها</button>`:''}</div>`;
  if(!storeOK)h+='<div class="msg warn">ذخیره خودکار در این مرورگر ممکن نیست.</div>';
  if(isAdmin()&&CHG)h+=`<button class="lrow chgw" data-act="chgOpen"><span class="ic">${ic('edit')}</span><span class="tx"><b>${fmt(CHG)} تغییر شبا یا مبلغ بعد از ثبت</b><small>بزنید تا ببینید چه کسی، کی، از چه به چه</small></span></button>`;
  h+=oldDebtCard();/* v78.8: تسویه بدهی قدیمی → انتقال به حساب مشتری (15zi) */
  if(!L0.length)h+=`<div class="bempty">${ic('list')}<b>برای ${D.fa} واریزی‌ای ثبت نشده</b><span>با «ورود حساب» بالای صفحه شروع کنید.</span></div>`;
  else{/* روزهای امروز و آینده: ردیف‌ها زیر سرتیتر هر روز؛ روزهای گذشته: کارت جمع‌وجور همان لیست (مثل صفحه لیست‌ها) */
    h+=(ls.get('m_swiped2',false)?'':`<div class="hhint swtip">روی هر نام بزنید تا جزئیات باز شود · کشیدن به چپ: تأیید، منبع، ویرایش · به راست: حذف</div>`)+PKH.filter(k=>k>=dateVal||homePick&&homeP===k).map(k=>{const all=rows.filter(z=>PD(z)===k);if(!all.length)return '';const sh=all.slice(0,HOME_N);return `<div class="fday sticky pd hpd${homeP===k?' sel':''}" id="hpd-${k}"><button class="hpt" data-act="payList" data-iso="${k}"><span>${esc(pdHead(k))}</span><small>${fmt(all.length)} واریزی · <b>${fmt(sum(all))}</b> تومان</small></button><button class="pdl" data-act="payList" data-iso="${k}">لیست ${ic('back').replace('class="i"','class="i flip"')}</button></div><div class="blist">${sh.map(homeRow).join('')}</div>${all.length>HOME_N?`<button class="hmore" data-act="payList" data-iso="${k}">${fmt(all.length-HOME_N)} واریزی دیگر · دیدن کامل لیست</button>`:''}`}).join('');
    const PS0=homePick?[]:listsData().filter(d=>d.iso<dateVal&&d.iso>=lo&&homeF==='all');
    if(PS0.length)h+=`<div class="hpast"><div class="hpsh"><b>روزهای گذشته</b><small>${fmt(PS0.length)} لیست · برای دیدن بزنید</small></div>${PS0.map(listCard).join('')}</div>`}
  h+=`<button class="ball" data-act="spLists">همه لیست‌ها${ic('back').replace('class="i"','class="i flip"')}</button>`;
  return h+`<div class="ver">مطلا · نسخه ${toFa(APP_V)}</div></div>`}
const HOME_N=30,HOME_DAYS=7;
let fSet=[],fTitle='',fPay=null;
/* تاریخ واریز: برای هر ثبت پرسیده می‌شود (لیست همیشه تاریخ روز ثبت را می‌خورد) */
/* پیش‌فرض تاریخ واریز همیشه «فردا»؛ تغییر تاریخ فقط برای همان ثبت است و ثبت بعدی دوباره فردا می‌شود */
const payDef=()=>isoAdd(todayISO(),1);
function payChips(){const t=todayISO(),opts=[[t,'امروز'],[isoAdd(t,1),'فردا'],[isoAdd(t,2),'پس‌فردا']],cus=fPay&&!opts.some(o=>o[0]===fPay);
  return `<div class="paybox"><div class="lblrow"><label>تاریخ واریز</label><small>${fPay?esc(dates(fPay).wd+' '+dates(fPay).fa):'انتخاب کنید'}</small></div><div class="paych">${opts.map(([iso,l])=>`<button class="pch${fPay===iso?' on':''}" data-act="fPay" data-iso="${iso}"><b>${l}</b><small>${esc(toFa(dates(iso).jd)+' '+JM[dates(iso).jm-1])}</small></button>`).join('')}<button class="pch${cus?' on':''}" data-act="fPayPick">${ic('cal')}<small>${cus?esc(payLab(fPay)):'تاریخ دیگر'}</small></button></div></div>`}
const updPay=()=>{const b=$('paybox');if(b)b.innerHTML=payChips()};
const titleChips=()=>['خانم','آقا',''].map(t=>`<button class="tch${fTitle===t?' on':''}" data-act="fTitle" data-t="${t}">${t||'بدون عنوان'}</button>`).join('');
function setboxHTML(){const T=num(($('fa')||{}).value||0),S=fSet.reduce((s,x)=>s+(+x.amount||0),0);
  return `<div class="sbh"><div><b>نحوه تسویه</b><small>اگر مشتری دیگری مستقیم به این حساب واریز کرده، اینجا ثبت کنید</small></div><button class="sm gold" data-act="setAdd">${ic('plus')} واریز مشتری</button></div>${fSet.map((x,i)=>`<div class="sit"><span class="tx"><b>${esc(setLine(x).split(' — ')[0])}</b><small>${x.inv?'فاکتور فروش '+esc(x.inv)+'، ':''}مستقیم به حساب این شخص</small></span><b class="am">${fmt(x.amount)}</b>${x.cred?'<span class="pill gd" title="از بخش تسویه بدهی">بدهی</span>':`<button class="x" data-act="setDel" data-i="${i}" aria-label="حذف">×</button>`}</div>`).join('')}${fSet.length?`<div class="ssum"><span>مبلغ کل: <b>${fmt(T)}</b></span><span>از مشتری: <b>${fmt(S)}</b></span><span>مانده بانکی: <b style="color:${T-S<0?'var(--red)':T-S?'var(--warn)':'var(--ok)'}">${T-S<0?'بیشتر از مبلغ!':T-S?fmt(T-S):'هیچ ✓'}</b></span></div>`:''}`}
const updSet=()=>{const b=$('setbox');if(b)b.innerHTML=setboxHTML()};
/* v63.5 (خواسته صاحب اپ): «واریز مستقیم مشتری» در فرم ویرایش واریزی هم مثل ثبت، فهرست حساب‌های مشتری (و افراد واریزی/خرید بدون حساب) را زیر نام نشان دهد؛
   انتخاب حساب، نام و تلفن را پر می‌کند و cuId روی تسویه می‌نشیند (همان فیلد فرم تسویه) */
let SSP=[];
function setSugHTML(){const I=$('sn2');if(!I)return '';cuWPRe();const q0=(I.value||'').trim(),q=nzName(toEn(q0)),dOk=pDig(q0),L=CU();
  const row=(act,data,av,m,name,sub,ex)=>`<button class="stsr" data-act="${act}" ${data}><span class="c6a${m?' m':''}">${esc(av)}</span><span class="tx"><b>${esc(name)}</b><small>${sub}</small></span>${ex||''}</button>`;
  const sub=o=>[o.phone?'<bdi dir="ltr">'+esc(toFa(phShow(o.phone)))+'</bdi>':'',o.nid?'کد ملی <bdi dir="ltr">'+esc(toFa(o.nid))+'</bdi>':''].filter(Boolean).join('، ');
  if(window.__sCu){const c=custs.find(x=>String(x.id)===String(window.__sCu));return c?`<div class="stsel"><span class="c6a">${esc(userInit(cuName(c)))}</span><span class="tx"><b>${esc(cuName(c))}</b><small>حساب مشتری</small></span>${cuMiniBal(c)}<button class="itx" data-act="setCu" data-id="" aria-label="برداشتن">×</button></div>`:''}
  if(!q){if(document.activeElement!==I)return '';const M=L.slice().sort((a,b)=>String(b.lastAt||b.createdAt||'').localeCompare(String(a.lastAt||a.createdAt||''))).slice(0,8);SSP=[];
    return M.length?`<div class="stsug"><div class="stsh">آخرین حساب‌ها</div>${M.map(c=>row('setCu',`data-id="${c.id}"`,userInit(cuName(c)),0,cuName(c),[c.grp?esc(c.grp):'',sub(c)].filter(Boolean).join('، ')||'حساب مشتری',cuBalMini(c,cuWP.get(String(c.id))))).join('')}</div>`:''}
  const C=L.filter(c=>cuHit(c,q,dOk)).sort((a,b)=>nzName(b.name).startsWith(q)-nzName(a.name).startsWith(q)).slice(0,6);SSP=memPeople(q,dOk,6);
  if(!C.length&&!SSP.length)return '';
  return `<div class="stsug">${C.map(c=>row('setCu',`data-id="${c.id}"`,userInit(cuName(c)),0,cuName(c),[c.grp?esc(c.grp):'',sub(c)].filter(Boolean).join('، ')||'حساب مشتری',cuBalMini(c,cuWP.get(String(c.id))))).join('')}
    ${SSP.length?`<div class="stsh">از واریزی‌ها و خریدها</div>`+SSP.map((p,i)=>row('setMem',`data-i="${i}"`,userInit(p.name),1,p.name,[sub(p),p.n?fmt(p.n)+' واریزی':''].filter(Boolean).join('، ')||'بدون حساب')).join(''):''}</div>`}
const setSugRe=()=>{const b=$('ssg');if(b)b.innerHTML=setSugHTML()};
function setSugBind(){const I=$('sn2');if(!I)return;I.oninput=()=>{window.__sCu='';setSugRe()};I.onfocus=setSugRe;I.onblur=()=>setTimeout(()=>{if(document.activeElement!==I)setSugRe()},250)}
function openSettle(){const T=num($('fa').value||0),S=fSet.reduce((s,x)=>s+(+x.amount||0),0);
  sheet(`<div class="sh-h"><b>واریز مستقیم مشتری</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="muted" style="font-size:12.5px;margin:-6px 0 12px">مشتری دیگری (مثلاً خریدار) مبلغی را مستقیم به حساب «${esc(clean($('fn').value)||'این شخص')}» واریز کرده است.</div>
  <div class="f"><div class="lblrow"><label>نام مشتری پرداخت‌کننده</label><div class="ttl3" id="stl">${['خانم','آقا',''].map(t=>`<button class="tch${t===''?' on':''}" data-act="sTitle" data-t="${t}">${t||'بدون عنوان'}</button>`).join('')}</div></div><input id="sn2" autocomplete="off" enterkeyhint="next"><div id="ssg"></div></div>
  <div class="f2"><div class="f"><label>شماره تماس <i>(اختیاری)</i></label><input id="sp2" class="ltr" type="tel" inputmode="tel" autocomplete="off"></div><div class="f"><label>شماره فاکتور فروش</label><input id="si2" class="ltr" inputmode="numeric" autocomplete="off"></div></div>
  <div class="f"><label>مبلغ واریزشده <i>(تومان)</i></label><input id="sa2" class="ltr num" inputmode="numeric" value="${T-S>0?(T-S).toLocaleString('en-US'):''}"></div>
  <div class="row"><button class="btn gold" data-act="setSave">افزودن</button></div>`);
  window.__sTitle='';window.__sCu='';setTimeout(()=>{setSugBind();$('sn2')&&$('sn2').focus();$('sa2').oninput=()=>{const n=num($('sa2').value);$('sa2').value=n?n.toLocaleString('en-US'):''}},60)}

function ibanLive(){const el=$('fi'),raw=el.value,caret=el.selectionStart==null?raw.length:el.selectionStart,before=dg(raw.slice(0,caret)).length,v=dg(raw).slice(0,24);
  el.value=ibanGroups(v);if(document.activeElement===el){let pos=0,c=0;while(pos<el.value.length&&c<before){if(/\d/.test(el.value[pos]))c++;pos++}if(pos<el.value.length&&el.value[pos]===' ')pos++;try{el.setSelectionRange(pos,pos)}catch(e){}}
  const o=$('fiv'),inf=$('finfo');inf.innerHTML='';if(!v){o.textContent='';return}const f='IR'+v;
  if(v.length<24){o.style.color='var(--mut)';o.textContent=toFa(v.length)+' از ۲۴ رقم';return}
  if(!ibanOk(f)){o.style.color='var(--red)';o.textContent='شماره شبا اشتباه است';return}
  o.style.color='var(--ok)';o.textContent='شماره شبا معتبر است';const b=ibanBank(f),a=acctOf(f);
  inf.innerHTML=`<span class="pill">${b?'بانک: '+esc(b):'بانک تشخیص داده نشد'}</span>${a?`<span class="pill g">حساب: ${cpPlain(a)}</span>`:''}`}
/* ============ چسباندن گروهی ============ */
const vBulk=()=>{if(!fPay||fPay<todayISO())fPay=payDef();return `<div class="bkw bzw"><div class="bzh"><small>چند واریزی یکجا · لیست امروز ${esc(dates(todayISO()).fa)}</small><b>چسباندن لیست</b></div>
  <div class="ef"><label>تاریخ واریز همه ردیف‌ها</label><button class="bzdate" data-act="bkCal">${ic('cal')}<span><b id="bkPayL">${esc(payLab(fPay))}</b><small id="bkPayS">${esc(dates(fPay).wd+' '+dates(fPay).fa)}</small></span>${ic('chev')}</button></div>
  <div class="ef"><label for="bulk">متن لیست</label><div class="bkta"><textarea id="bulk" placeholder="لیست را از تلگرام یا یادداشت کپی کنید و اینجا بچسبانید؛ نام و فاکتور، مبلغ، بانک و شبا خودکار تشخیص داده می‌شود."></textarea><button class="bkpaste" data-act="bkPaste">${ic('paste')} چسباندن</button></div></div>
  <div id="bkprev" class="bkprev"></div><div id="bm"></div></div>`};
const aBulk=()=>'<button class="btn sec" data-act="resetBulk">پاک کردن</button><button class="btn gold" data-act="bulkAdd">افزودن به لیست</button>';
function bkPrev(){const el=$('bkprev');if(!el)return;const t=($('bulk')||{}).value||'';if(!t.trim()){el.innerHTML='';return}const r=parse(t);
  if(!r.length){el.innerHTML='<div class="bknote">هنوز واریزی‌ای در متن پیدا نشد.</div>';return}
  const badN=r.filter(x=>!x.iban||!ibanOk(x.iban)||!x.amount||!x.name).length;
  el.innerHTML=`<div class="bkh"><span>${fmt(r.length)} واریزی پیدا شد</span><small>جمع ${fmt(sum(r))} تومان${badN?'، '+fmt(badN)+' خطادار':''}</small></div><div class="fcard">${r.slice(0,8).map((x,i)=>{const bk=ibanBank(x.iban)||x.bank||'',bad=!x.iban?'شبا ندارد':!ibanOk(x.iban)?'شبا اشتباه':!x.amount?'مبلغ ندارد':!x.name?'نام ندارد':'';
    return `<div class="bkr${bad?' bad':''}"><span class="n">${toFa(i+1)}</span><span class="tx"><b>${esc(x.name||'بدون نام')}</b><small class="${bad?'bad':''}">${bad?esc(bad):bankBadge(bk)+esc(bk||'بانک نامشخص')}${x.code?' · فاکتور '+esc(x.code):''}${x.phone?' · <bdi dir="ltr">'+esc(toFa(x.phone))+'</bdi>':''}</small></span><span class="v">${fmt(x.amount||0)}<i>تومان</i></span></div>`}).join('')}${r.length>8?`<div class="bkmore">و ${fmt(r.length-8)} واریزی دیگر</div>`:''}</div>`}
function bindBulk(){const b=$('bulk');if(!b)return;b.oninput=()=>{clearTimeout(b._t);b._t=setTimeout(bkPrev,180)};bkPrev()}
function resetBulk(){const b=$('bulk');if(!b||!b.value.trim())return;askConfirm('متن چسبانده‌شده پاک شود؟','پاک شود',()=>{$('bulk').value='';fPay=payDef();$('bm').innerHTML='';bkPrev();toast('پاک شد')})}
function bulkAdd(){const r=parse($('bulk').value),m=$('bm');if(!r.length){m.innerHTML='<div class="msg bad">واریزی‌ای در متن پیدا نشد.</div>';return}
  const now=new Date().toISOString(),ids=[];r.forEach(x=>{const id=nid++;ids.push(id);const ne={...x,card:'',id,entryDate:dateVal,payDate:fPay||payDef(),createdBy:who(),updatedBy:who(),updatedAt:now};entries.push(ne);depLink(ne)});
  saveE();alloc=null;logA('bulk','ورود گروهی',fmt(r.length)+' واریزی | '+fmt(sum(r))+' تومان | '+dates(dateVal).fa,{ids});$('bulk').value='';
  m.innerHTML=`<div class="bkdone"><span class="ck">${ic('check')}</span><b>${fmt(r.length)} واریزی اضافه شد</b><small>جمع ${fmt(sum(r))} تومان · واریز ${esc(payLab(fPay||payDef()))}</small><div class="row2"><button class="s" data-act="tab" data-n="list">${ic('list')} مشاهده لیست</button><button class="p" data-act="toSplit">${ic('split')} تقسیم به منابع</button></div></div>`;$('dock').innerHTML=dockHTML();setTimeout(()=>{const d=m.querySelector('.bkdone');if(d)d.scrollIntoView({behavior:'smooth',block:'center'})},60)}
