/* ===== تقویم شمسی (ماهانه) ===== */
let cal={y:1405,m:1,sel:'',cb:null};
function openCal(iso,cb,o){const[y,m]=g2j(iso);cal={y,m,sel:iso,cb,o:o||{}};sheet(calHTML())}
function calHTML(){const{y,m}=cal,n=jDays(y,m),[gy,gm,gd]=j2g(y,m,1),first=(new Date(gy,gm-1,gd).getDay()+1)%7,t=todayISO(),cells=[];
  for(let i=0;i<first;i++)cells.push('<span></span>');
  for(let d=1;d<=n;d++){const[a,b,c]=j2g(y,m,d),iso=a+'-'+p2(b)+'-'+p2(c);cells.push(`<button class="cd${iso===cal.sel?' on':''}${iso===t?' td':''}${cal.o&&cal.o.marks&&cal.o.marks.has(iso)?' mk':''}${(cells.length%7)===6?' fr':''}" data-act="calPick" data-iso="${iso}">${toFa(d)}</button>`)}
  const q=(o,l)=>{const iso=isoAdd(t,o);return `<button class="cq${iso===cal.sel?' on':''}" data-act="calPick" data-iso="${iso}">${l}</button>`};
  const O=cal.o||{};return `<div class="sh-h"><div><b>${O.title||'تاریخ واریز'}</b>${O.sub?`<small class="shsub">${O.sub}</small>`:''}</div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="cqs">${(O.q||[[0,'امروز'],[1,'فردا'],[2,'پس‌فردا']]).map(([o,l])=>q(o,l)).join('')}</div>${O.top||''}
  <div class="calh"><button class="ib0" data-act="calMv" data-d="-1" aria-label="ماه قبل">${ic('back')}</button><b>${JM[m-1]} ${toFa(y)}</b><button class="ib0" data-act="calMv" data-d="1" aria-label="ماه بعد">${ic('back').replace('class="i"','class="i flip"')}</button></div>
  <div class="calw">${['ش','ی','د','س','چ','پ','ج'].map(w=>`<span>${w}</span>`).join('')}</div><div class="calg">${cells.join('')}</div>`}
ACT.calMv=d=>{let m=cal.m+(+d.d),y=cal.y;if(m<1){m=12;y--}if(m>12){m=1;y++}cal.m=m;cal.y=y;$('sheet').innerHTML=calHTML()};
ACT.calPick=d=>{const cb=cal.cb;cal.sel=d.iso;closeSheet();if(cb)cb(d.iso)};

ACT.entTk=d=>{const x=entRow(),q=x&&entBI(x);if(!q||q.b.closed)return;eD=eD||{};const curS=eD.st!=null?eD.st:q.it.st;eD.st=curS===d.st?'pending':d.st;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.entCommit=()=>entCommit();
ACT.entDraftOff=()=>{eD=null;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.entPay=()=>{const x=entRow();openCal((x&&x.payDate)||todayISO(),v=>{tmpISO=v;dpMode='epay';ACT.dok()})};
ACT.entEditOn=()=>{const x=entRow();if(!x)return;const e=entries.find(y=>y.id===x.id);fPay=(e&&(e.payDate||e.entryDate))||todayISO();entEdit=true;render();$('view').scrollTop=0};
ACT.eePay=()=>openCal(fPay||todayISO(),iso=>{fPay=iso;const l=$('eePayL');if(l)l.textContent=payLab(iso)+'، '+dates(iso).fa});
ACT.entEditOff=()=>{entEdit=false;render()};
ACT.entSave=()=>entSave();
ACT.eeT=d=>{eeTitle=d.t;$('ettl').innerHTML=eeTitles()};
function entSetSt(id,st){const e=entries.find(y=>String(y.id)===String(id));if(!e)return;const q=entBI(e);if(!q){toast('این واریزی هنوز ارسال نشده است',true);return}if(q.b.closed){toast('لیست این واریزی بسته شده؛ از پیگیری بازش کنید',true);return}
  const old=q.it.st;q.it.st=st;q.it.at=new Date().toISOString();saveB();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;
  toast(st==='ok'?'«'+fullName(e)+'» تسویه شد ✓':'تأیید «'+fullName(e)+'» برداشته شد','', 'برگرداندن',()=>{q.it.st=old;saveB();const v2=$('view'),y2=v2.scrollTop;render();v2.scrollTop=y2})}
ACT.entOk=d=>entSetSt(d.id,'ok');
ACT.entUnok=d=>entSetSt(d.id,'pending');
ACT.entEditGo=d=>{ACT.openEnt(d);ACT.entEditOn()};
ACT.fPay=d=>{fPay=d.iso;updPay()};
ACT.fPayPick=()=>openCal(fPay||payDef(),iso=>ACT.fPay({iso}));
ACT.openEnt=d=>{entId=d.id;entEdit=false;eD=null;PARENT.ent=['find','part','srcview','batch','list','split1','lday'].includes(cur)?cur:'home';go('ent')};
ACT.entDel=d=>{navBack=true;go(PARENT.ent||'home');delEntry(d.id)};
ACT.fF=d=>{fF=d.f;fN=120;render()};
ACT.arcCal=()=>{const M=new Set();validated().forEach(r=>{M.add(PD(r));M.add(r.entryDate)});openCal(arcD||qDate(arcQ)||todayISO(),iso=>{arcD=iso;arcQ='';render();$('view').scrollTop=0},{title:'لیست‌های کدام روز؟',sub:'روزهای نقطه‌دار لیست دارند',q:[[-1,'دیروز'],[0,'امروز'],[1,'فردا']],marks:M})};
ACT.arcClr=()=>{arcQ='';arcD='';render()};
ACT.cuStl=()=>{cuStlQ='';sheet(cuStlHTML());const q=$('csq');if(q){q.oninput=()=>{cuStlQ=q.value;$('csl').outerHTML=(()=>{const t=document.createElement('div');t.innerHTML=cuStlHTML();return t.querySelector('#csl').outerHTML})()}}};
ACT.cuStlPick=d=>{const c=curCu(),r=validated().find(z=>String(z.id)===String(d.id));if(!c||!r)return;entId=r.id;stl={cuId:c.id,name:cuName(c),phone:c.phone||'',amount:r.amount,q:''};sheet(stlHTML());stlBind()};
function stlChips(){const z=stl,L=CU(),q=(z.q||'').trim(),M=q?L.filter(c=>cuName(c).includes(q)||(c.phone||'').includes(toEn(q))).slice(0,8):L.slice().sort((a,b)=>String(b.lastAt||'').localeCompare(String(a.lastAt||''))).slice(0,6);return `${z.cuId?`<button class="tch on" data-act="stlCu" data-id="">${esc(cuName(custs.find(c=>String(c.id)===String(z.cuId))||{name:z.name}))} ×</button>`:M.map(c=>`<button class="tch" data-act="stlCu" data-id="${c.id}">${esc(cuName(c))}</button>`).join('')+(q?`<button class="tch nw" data-act="stlCu" data-id="new">+ «${esc(q)}» بدون حساب</button>`:'')}`}
function stlHTML(){const z=stl,who0=z.bz?clean(bz.d.name||''):fullName(entRow()||{});
  return `<div class="sh-h"><div><b>${z.i!=null?'ویرایش تسویه':'تسویه از مشتری'}</b><small class="shsub">مشتری مستقیم به «${esc(who0)}» پرداخت کرده · از مانده کم می‌شود</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bzw" style="animation:none">
  <div class="ef"><label for="stQ">پرداخت‌کننده <i>(از حساب‌های مشتری یا نام جدید)</i></label><div class="fsearch sm">${ic('search')}<input id="stQ" value="${esc(z.cuId?'':z.q||'')}" placeholder="جستجوی نام یا شماره مشتری…" autocomplete="off"></div>
  <div class="kchs" id="stCs">${stlChips()}</div></div>
  <div class="ef2"><div class="ef"><label for="stP">شماره تماس <i>(اختیاری)</i></label><input id="stP" class="ltr" inputmode="tel" value="${esc(z.phone||'')}" autocomplete="off"></div><div class="ef"><label for="stI">فاکتور فروش <i>(اختیاری)</i></label><input id="stI" class="ltr" inputmode="numeric" value="${esc(z.inv||'')}" autocomplete="off"></div></div>
  <div class="ef"><label for="stA">مبلغ پرداختی <i>(تومان)</i></label><input id="stA" class="ltr acbig" inputmode="numeric" value="${z.amount?Number(z.amount).toLocaleString('en-US'):''}" autocomplete="off"></div>
  <div class="ef2"><div class="ef"><label for="stT">شماره پیگیری <i>(اختیاری)</i></label><input id="stT" class="ltr" inputmode="numeric" value="${esc(z.tn||'')}" autocomplete="off"></div><div class="ef"><label>رسید <i>(اختیاری)</i></label><label class="stimg${z.imgD||z.img?' on':''}">${z.imgD?`<img src="${z.imgD}" alt="">`:`<i>${ic('cam')}</i>`}<span>${z.imgD?'تغییر رسید':z.img?'رسید دارد · تغییر':'افزودن عکس'}</span><input type="file" accept="image/*" id="stF" hidden></label></div></div>
  <div class="ef"><label for="stN">یادداشت <i>(اختیاری)</i></label><input id="stN" value="${esc(z.note||'')}" autocomplete="off"></div>
  ${z.bz?`<button class="xgo" data-act="bzStlSave">${ic('check')} ${z.i!=null?'ذخیره تسویه':'افزودن تسویه'}</button>`:`<button class="xgo" data-act="stlSave">${ic('check')} ثبت و کسر از مانده</button>`}${z.i!=null&&!z.bz?`<div class="txacts">${z.img?`<button data-act="stlImg">${ic('eye')} دیدن رسید</button>`:''}<button data-act="stlDel" style="color:var(--red);background:var(--red2)">${ic('trash')} حذف این تسویه</button></div>`:''}</div>`}
function stlRead(){const g=id=>{const el=$(id);return el?el.value:undefined};if($('stQ')&&!stl.cuId)stl.q=g('stQ');if($('stP'))stl.phone=toEn(g('stP')).replace(/[^\d+]/g,'');if($('stI'))stl.inv=toEn(g('stI')).trim();if($('stA'))stl.amount=num(g('stA'));if($('stT'))stl.tn=toEn(g('stT')).trim();if($('stN'))stl.note=clean(g('stN'))}
function stlBind(){const Q=$('stQ'),A=$('stA'),F=$('stF');if(Q){Q.oninput=()=>{stl.q=Q.value;if(stl.cuId){stl.cuId='';stl.name=''}clearTimeout(Q._t);Q._t=setTimeout(()=>{const c=$('stCs');if(c)c.innerHTML=stlChips()},120)};const C=$('stCs');if(C)C.onpointerdown=e=>{if(e.target.closest('.tch'))e.preventDefault()}}if(A)A.oninput=()=>{const v=num(A.value);A.value=v?v.toLocaleString('en-US'):''};
  if(F)F.onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{stl.imgD=await shrink(f);stlRead();sheet(stlHTML());stlBind()}catch(z){toast('این عکس خوانده نشد',true)}}}
function stlSync(e){const st=(e.settles||[]).reduce((s,z)=>s+(+z.amount||0),0),rem=Math.max(0,(+e.amount||0)-st);batches.forEach(b=>b.items.forEach(it=>{if(it.id===e.id){it.amount=rem;it.settled=st;it.settles=e.settles;it.total=+e.amount||0}}));saveB()}
ACT.stlNew=()=>{const x=entRow();if(!x)return;stl={amount:x.amount,q:''};sheet(stlHTML());stlBind();setTimeout(()=>{const q=$('stQ');if(q)q.focus()},300)};
ACT.stlOpen=d=>{const x=stlE();if(!x)return;const z=(x.settles||[])[+d.i];if(!z)return;stl={...z,i:+d.i,q:z.cuId?'':z.name};sheet(stlHTML());stlBind()};
ACT.stlCu=d=>{stlRead();if(d.id==='new'){stl.cuId='';stl.name=clean(stl.q||'');stl.newName=true}else if(!d.id){stl.cuId='';stl.name='';stl.q=''}else{const c=custs.find(z=>String(z.id)===String(d.id));if(c){stl.cuId=c.id;stl.name=cuName(c);if(!stl.phone)stl.phone=c.phone||''}}sheet(stlHTML());stlBind()};
ACT.stlImg=async()=>{const k=stl&&stl.img;if(!k)return;const v=await imgGet(k);if(!v){toast('عکس پیدا نشد',true);return}sheet(`<div class="sh-h"><b>رسید ${esc(stl.name||'')}</b><button class="x" data-act="stlBack">×</button></div><img src="${v}" class="rcpt" style="max-height:70vh" alt="رسید">`)};
ACT.stlBack=()=>{sheet(stlHTML());stlBind()};
ACT.stlSave=async()=>{stlRead();const x=entRow(),e=x&&entries.find(z=>z.id===x.id);if(!e)return;const name=clean(stl.name||stl.q||'');if(!name){toast('پرداخت‌کننده را انتخاب یا نامش را بنویسید',true);return}const a=+stl.amount||0;if(!a){toast('مبلغ را وارد کنید',true);return}
  const S=e.settles=(e.settles||[]).slice(),others=S.filter((z,i)=>i!==stl.i).reduce((s,z)=>s+(+z.amount||0),0);if(others+a>(+e.amount||0)){toast('جمع تسویه‌ها از مبلغ کل این واریزی بیشتر می‌شود',true);return}
  const now=new Date().toISOString(),old=stl.i!=null?S[stl.i]:null,z={...(old||{}),st:old?(old.st||'ok'):'wait',id:(old&&old.id)||nid++,name,phone:stl.phone||'',inv:stl.inv||'',amount:a,tn:stl.tn||'',note:stl.note||'',cuId:stl.cuId||'',date:(old&&old.date)||todayISO(),at:now,by:who()};
  if(stl.imgD){const k=newImgKey('stl:'+z.id);if(await imgPut(k,stl.imgD)){z.imgs=stImgs(z).concat([k]);z.img=z.imgs[0]}else toast('حافظه پر است؛ عکس ذخیره نشد',true)}
  if(old&&old.cuId&&old.txId){const oc=custs.find(c=>String(c.id)===String(old.cuId)),ot=oc&&(oc.txs||[]).find(t=>t.id===old.txId);if(ot){ot.del=true;oc.lastAt=now}}
  delete z.txId;if(z.cuId&&z.st!=='wait'){const c=custs.find(q=>String(q.id)===String(z.cuId));if(c){const t={id:nid++,type:'pin',kind:'',weight:0,ppg:0,amount:a,note:'تسویه واریزی «'+fullName(e)+'»'+(z.inv?' · فاکتور '+z.inv:'')+(z.tn?' · پیگیری '+z.tn:''),date:todayISO(),at:now,by:who(),entId:e.id,stlId:z.id,img:z.img||''};(c.txs=c.txs||[]).push(t);c.lastAt=now;z.txId=t.id;saveCu()}}
  if(old)S[stl.i]=z;else S.push(z);e.updatedAt=now;e.updatedBy=who();saveE();stlSync(e);logA('edit','تسویه از مشتری',fullName(e)+' ← '+name+' | '+fmt(a)+' تومان');stl=null;closeSheet();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;const r=entRow();toast(z.st==='wait'?'ثبت شد · از مانده کم شد، در انتظار تأیید':r&&r.full?'تسویه کامل شد ✓':'ثبت شد · مانده بانکی '+fmt(r?r.amount:0)+' تومان')};
ACT.stlDel=()=>{const x=entRow(),e=x&&entries.find(z=>z.id===x.id);if(!e||stl.i==null)return;askConfirm('این تسویه حذف شود؟ مبلغ دوباره به مانده بانکی برمی‌گردد.','حذف',()=>{const S=e.settles=(e.settles||[]).slice(),old=S[stl.i];if(old&&old.cuId&&old.txId){const oc=custs.find(c=>String(c.id)===String(old.cuId)),ot=oc&&(oc.txs||[]).find(t=>t.id===old.txId);if(ot){ot.del=true;oc.lastAt=new Date().toISOString();saveCu()}}S.splice(stl.i,1);e.updatedAt=new Date().toISOString();saveE();stlSync(e);stl=null;closeSheet();render();toast('تسویه حذف شد')})};
ACT.ldRc=()=>{const P=ldPick();if(!P.G.length&&!P.FS.length){toast('واریزی‌ای انتخاب نشده',true);return}const items=P.G.flatMap(g=>g.rows).concat(P.FS.map(r=>({...r,img:false})));openRcpts(rcOf(items),'رسیدهای '+pdHead(ldKey))};
ACT.rcView=async d=>{const r=RC[+d.i];if(!r)return;const v=await imgGet(r.key);if(!v){toast('عکس پیدا نشد',true);return}sheet(`<div class="sh-h"><div><b>${esc(r.name)}</b><small class="shsub">${fmt(r.amount)} تومان${r.tn?' · پیگیری '+esc(r.tn):''}</small></div><button class="x" data-act="rcBack">×</button></div><img src="${v}" class="rcpt" style="max-height:62vh" alt="رسید"><div class="txacts"><label>${ic('edit')} تغییر رسید<input type="file" accept="image/*" data-rce="${d.i}" hidden></label><button data-act="rcSave1" data-i="${d.i}">${ic('down')} ذخیره</button><button data-act="rcShare1" data-i="${d.i}">${ic('open')} اشتراک</button></div>`)};
ACT.rcBack=()=>{if(RC.one){closeSheet();return}openRcpts(RC,RCT)};
ACT.rcSave1=async d=>{const r=RC[+d.i];if(r)rcDown(await rcFiles([r]))};
ACT.rcShare1=async d=>{const r=RC[+d.i];if(r)rcShare(await rcFiles([r]),r.name)};
ACT.rcSaveAll=async()=>rcDown(await rcFiles(RC));
ACT.rcShareAll=async()=>rcShare(await rcFiles(RC),RCT);
ACT.rcEnt=async d=>{const b=batches.find(z=>z.id==d.b),x=b&&b.items.find(z=>String(z.id)===String(d.id));if(!x)return;rcShare(await rcFiles(itImgs(b,x).map(k=>({key:k,name:x.name,amount:x.amount,tn:x.tn||''}))),x.name)};
ACT.ldQClr=()=>{ldQ='';const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.rcOne=async d=>{RC=[{key:d.k,name:d.n,amount:+d.a,tn:d.t}];RC.one=1;RCT='رسید '+d.n;ACT.rcView({i:0})};
function stlTx(e,z){const c=custs.find(q=>String(q.id)===String(z.cuId));if(!c)return;const now=new Date().toISOString(),t={id:nid++,type:'pin',kind:'',weight:0,ppg:0,amount:+z.amount||0,note:'تسویه واریزی «'+fullName(e)+'»'+(z.inv?' · فاکتور '+z.inv:'')+(z.tn?' · پیگیری '+z.tn:''),date:todayISO(),at:now,by:who(),entId:e.id,stlId:z.id,img:z.img||''};(c.txs=c.txs||[]).push(t);c.lastAt=now;z.txId=t.id;saveCu()}
function stlUntx(z){if(!z.cuId||!z.txId)return;const c=custs.find(q=>String(q.id)===String(z.cuId)),t=c&&(c.txs||[]).find(q=>q.id===z.txId);if(t){t.del=true;c.lastAt=new Date().toISOString();saveCu()}delete z.txId}
const stlE=()=>{const x=entRow();return x&&entries.find(z=>z.id===x.id)};
const stlDone=(e,msg)=>{e.updatedAt=new Date().toISOString();e.updatedBy=who();saveE();stlSync(e);const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast(msg)};
ACT.stlOk=d=>{const e=stlE(),z=e&&(e.settles||[])[+d.i];if(!z)return;z.st='ok';z.okAt=new Date().toISOString();if(z.cuId&&!z.txId)stlTx(e,z);logA('edit','تأیید تسویه از مشتری',fullName(e)+' ← '+z.name+' | '+fmt(z.amount));const r=()=>entRow();stlDone(e,'تأیید شد'+(z.cuId?' · در حساب مشتری ثبت شد':''))};
ACT.stlUnok=d=>{const e=stlE(),z=e&&(e.settles||[])[+d.i];if(!z)return;z.st='wait';stlUntx(z);stlDone(e,'به «در انتظار تأیید» برگشت')};
ACT.stlDelI=d=>{const e=stlE();if(!e)return;const z0=(e.settles||[])[+d.i];if(!z0)return;askConfirm((z0.st==='wait'?'این تسویه رد شود؟':'این تسویه حذف شود؟')+' مبلغ '+fmt(z0.amount)+' دوباره به مانده «'+fullName(e)+'» برمی‌گردد.',z0.st==='wait'?'رد':'حذف',()=>{const S=e.settles=(e.settles||[]).slice(),z=S[+d.i];if(!z)return;stlUntx(z);S.splice(+d.i,1);stlDone(e,'مبلغ به مانده برگشت')})};
ACT.stlImgI=d=>ACT.galSt(d);
ACT.entTkF=d=>ACT.entTkQ({id:d.id,st:'fail'});
ACT.rcEntAll=d=>{const x=validated().find(z=>String(z.id)===String(d.id));if(!x)return;openRcpts(rcOfEnt(x),'رسیدهای '+fullName(x))};
ACT.fV=d=>{fV=d.v;fN=120;render()};
ACT.fG=d=>{fG=d.g;fN=120;render()};
ACT.fCal=()=>{const M=new Set(validated().map(fTK));const tg=k=>`<button class="${fG===k?'on':''}" data-act="fCalG" data-g="${k}">${k==='pay'?'تاریخ واریز':'تاریخ ثبت'}</button>`;
  openCal(fT||todayISO(),iso=>{fT=iso;fP='';fD='';fN=120;render();$('view').scrollTop=0},{title:'جستجوی تاریخ',sub:'روزهای نقطه‌دار واریزی دارند',q:[[-1,'دیروز'],[0,'امروز'],[1,'فردا']],marks:M,top:`<div class="seg calg2">${tg('entry')}${tg('pay')}</div>`})};
ACT.fCalG=d=>{fG=d.g;cal.o.marks=new Set(validated().map(fTK));cal.o.top=`<div class="seg calg2">${['entry','pay'].map(k=>`<button class="${fG===k?'on':''}" data-act="fCalG" data-g="${k}">${k==='pay'?'تاریخ واریز':'تاریخ ثبت'}</button>`).join('')}</div>`;$('sheet').innerHTML=calHTML()};
ACT.ldTog=d=>{ldOpen.has(d.k)?ldOpen.delete(d.k):ldOpen.add(d.k);const g=document.querySelector(`.ldg [data-act="ldTog"][data-k="${CSS.escape(d.k)}"]`);if(g)g.closest('.ldg').classList.toggle('open',ldOpen.has(d.k));else render()};
/* خروجی لیست روز: هر واریزی با تیک انتخاب می‌شود؛ پیش‌فرض همه واریزی‌های تخصیص‌داده‌شده */
function ldXHTML(){const d=ldData(ldKey),X=ldX,G=d.G.slice().sort((a,b)=>(a.name==='تخصیص نیافته')-(b.name==='تخصیص نیافته'));
  const all=[...G.flatMap(g=>g.rows),...d.FS],sel=all.filter(r=>X.has(r.id)),amt=r=>r.full?(r.total||r.amount||0):(+r.amount||0),tot=sel.reduce((a,r)=>a+amt(r),0);
  const grp=(k,name,rows,ico)=>{const n=rows.filter(r=>X.has(r.id)).length,st=n===rows.length?' on':n?' part':'';const sm=rows.filter(r=>X.has(r.id)).reduce((a,r)=>a+amt(r),0);
    /* v60: هر منبع یک بخش جدا (کارت گرد) با سرتیتر چسبان مثل فهرست‌های iOS؛ هنگام اسکرول سرتیتر همان منبع بالا می‌ماند و بخش بعدی آن را کنار می‌زند */
    return `<section class="x6s${k==='تخصیص نیافته'?' un':k==='__full'?' fs':''}"><button class="x6g" data-act="ldXG" data-k="${esc(k)}"><span class="x6c${st}">${ic('check')}</span><span class="x6i">${esc(userInit(name))}</span><span class="tx"><b>${esc(name)}</b><small>${fmt(n)} از ${fmt(rows.length)} واریزی</small></span><span class="x6sum">${fmt(sm)}<i>تومان</i></span>${ico||''}</button>${rows.map(r=>`<button class="x6r${X.has(r.id)?' on':''}" data-act="ldXR" data-id="${r.id}"><span class="x6c">${ic('check')}</span><span class="tx"><b>${esc(r.name||fullName(r)||'—')}</b><small>${[r.code?'فاکتور '+esc(toEn(r.code)):'',r.st&&r.st!=='none'?esc(ldSt(r)[0]):''].filter(Boolean).join(' · ')||'&nbsp;'}</small></span><span class="v">${fmt(amt(r))}</span></button>`).join('')}</section>`};
  return `<div class="sh-h"><div><b>خروجی ${esc(pdHead(ldKey))}</b><small class="shsub">${fmt(sel.length)} واریزی انتخاب شده · ${fmt(tot)} تومان</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="x6top"><b>واریزی‌ها</b><button data-act="ldXAll">${sel.length===all.length?'هیچ‌کدام':'همه'}</button></div>
  <div class="x6l">${G.map(g=>grp(g.name,g.name==='تخصیص نیافته'?'تخصیص‌نیافته':g.name,g.rows)).join('')}${d.FS.length?grp('__full','تسویه با مشتری',d.FS):''}</div>
  <div class="x6t"><button data-act="ldText"${sel.length?'':' disabled'}>${ic('copy')}<span><b>متن</b><small>تلگرام و واتس‌اپ</small></span></button><button data-act="ldPdf"${sel.length?'':' disabled'}>${ic('paste')}<span><b>PDF</b><small>جدول به تفکیک منبع</small></span></button><button data-act="ldRc"${sel.length?'':' disabled'}>${ic('cam')}<span><b>رسیدها</b><small>تکی یا گروهی</small></span></button><button data-act="ldXls"${sel.length&&typeof XLSX!=='undefined'?'':' disabled'}>${ic('list')}<span><b>Excel</b><small>${typeof XLSX==='undefined'?'نیاز به اینترنت':'هر منبع یک برگه'}</small></span></button></div>`}
const ldXRe=()=>{const L=document.querySelector('#sheet .x6l'),y=L?L.scrollTop:0;$('sheet').innerHTML=ldXHTML();const L2=document.querySelector('#sheet .x6l');if(L2)L2.scrollTop=y};
ACT.ldExp=()=>{const d=ldData(ldKey);if(!d.rows.length){toast('این لیست واریزی ندارد',true);return}ldX=ldXDef(d);sheet(ldXHTML())};
ACT.ldXR=d=>{const id=+d.id||d.id;[...ldX].some(x=>String(x)===String(id))?[...ldX].forEach(x=>{if(String(x)===String(id))ldX.delete(x)}):ldX.add(id);ldXRe()};
ACT.ldXG=d=>{const D=ldData(ldKey),rows=d.k==='__full'?D.FS:((D.G.find(g=>g.name===d.k)||{}).rows||[]),on=rows.every(r=>ldX.has(r.id));rows.forEach(r=>on?ldX.delete(r.id):ldX.add(r.id));ldXRe()};
ACT.ldXAll=()=>{const D=ldData(ldKey),all=[...D.G.flatMap(g=>g.rows),...D.FS];ldX=all.every(r=>ldX.has(r.id))?new Set():new Set(all.map(r=>r.id));ldXRe()};
ACT.ldText=()=>{const P=ldPick();txtGen=()=>dayTxt(ldKey,P.G,P.FS,P.T);txtName=fileBase(ldKey);openText()};
ACT.ldPdf=async()=>{const P=ldPick();closeSheet();openPrint(await dayReport(ldKey,P.G,P.FS,P.T,P.reg))};
ACT.ldXls=()=>{if(typeof XLSX==='undefined')return;const P=ldPick();closeSheet();save(fileBase(ldKey)+'.xlsx',dayXlsx(ldKey,P.G,P.FS),'فایل Excel آماده شد')};
ACT.fTClr=()=>{fT='';fN=120;render()};
ACT.fP=d=>{fP=fP===d.iso?'':d.iso;if(fP)fG='pay';fN=120;render()};
ACT.fPClr=()=>{fP='';render()};
ACT.payList=d=>ACT.arcDay(d);
ACT.fS=d=>{fS=fS===d.s?'':d.s;fR=0;fN=120;render()};
ACT.fR=d=>{fR=+d.r||0;fN=120;render()};
ACT.spLists=()=>{spTab='lists';go('split1')};
ACT.spTab=d=>{spTab=d.t;AM=null;render();$('view').scrollTop=0};
ACT.arcDay=d=>{ldKey=d.iso;ldX=null;ldOpen=new Set();ldQ='';go('lday')};
ACT.arcDayL=d=>{fD='';fP=d.iso;fG='pay';fF='all';fS='';fQ='';spTab='lists';render();$('view').scrollTop=0};
ACT.fDClr=()=>{fD='';render()};
ACT.fClr=()=>{fQ='';fN=120;render()};
ACT.findMore=()=>{fN+=200;$('fres').innerHTML=findHTML()};
ACT.acct=()=>{if(!ME){showAuth();return}sheet(`<div class="sh-h"><b>حساب کاربری</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="uh2"><div class="av">${esc(userInit(ME.name))}</div><div class="ux"><b>${esc(ME.name)}</b><span>${ROLE[ME.role]||ME.role} · <i class="ltrv">@${esc(ME.username)}</i></span></div></div>
  <div class="sstat"><span class="sdot ${SY.state}"></span><span class="slbl">${esc(syncLabel())}</span>${SY.err&&SY.state!=='ok'?`<small>${esc(SY.err)}</small>`:''}</div>
  <button class="opt big" data-act="settings">${ic('gear')}<span><b>تنظیمات</b><small>ظاهر، دسترسی‌ها، کاربران و پشتیبان</small></span></button>
  <button class="opt big" data-act="pwSheet">${ic('key')}<span><b>تغییر رمز عبور</b><small>رمز ورود خودتان را عوض کنید</small></span></button>
  <button class="opt big" data-act="logout" style="color:var(--red)">${ic('out')}<span><b>خروج از حساب</b><small>اطلاعات این گوشی پاک می‌شود و روی سرور می‌ماند</small></span></button>
  <div class="ver">مطلا · نسخه ${toFa(APP_V)}</div>`)};
ACT.bkLoad=()=>{BK=null;loadBk();render()};
ACT.bkTog=(d,e)=>{const r=e.target.closest('.hrow');if(!r)return;r.classList.toggle('open')?bkOpen.add(d.n):bkOpen.delete(d.n)};
ACT.bkShare=async()=>{const k=bkReady;if(!k)return;try{await navigator.share({files:[k.f],title:k.name});bkReady=null;closeSheet();toast('پشتیبان ذخیره شد ✓');bkSaved()}catch(e){if(e&&e.name==='AbortError')return;toast('ذخیره انجام نشد: '+(e&&e.message||''),true)}};
ACT.bkUpPick=()=>{if(bkBusy)return;const i=document.createElement('input');i.type='file';i.style.display='none';i.onchange=()=>{const f=i.files&&i.files[0];i.remove();if(f)bkUpload(f)};document.body.appendChild(i);i.click()};
ACT.bkUpGo=()=>{const u=bkUp;if(!u)return;askConfirm('مطمئنید؟ اطلاعات برنامه به وضعیت این فایل برمی‌گردد (از وضعیت فعلی پشتیبان گرفته می‌شود).','بله، بازگردانی',async()=>{
  bkSet('bkUpPick','',null,'در حال بازگردانی…');try{const r=await fetch(API_BASE+'/api/backup/upload?id='+u.id+'&restore=1',{method:'POST',headers:{Authorization:'Bearer '+TOKEN},cache:'no-store'});let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw new Error((j&&j.error)||('خطای سرور ('+r.status+')'));
    bkUp=null;closeSheet();await refreshAll();bkBusy=null;await loadBk();toast(j.changed||j.imgs?'بازگردانی انجام شد ✓ '+toFa(j.changed)+' مورد'+(j.imgs?' و '+toFa(j.imgs)+' عکس':''):'اطلاعات برنامه از قبل با این فایل یکی بود ✓')}catch(e){bkIdle();toast('بازگردانی انجام نشد: '+e.message,true)}})};
ACT.bkDl=d=>bkFetch('/api/backups/'+d.n,d.n,d.n);
ACT.bkFull=()=>bkFetch('/api/backup/full','motalla-full-'+todayISO()+'.json.gz');
ACT.bkRestore=d=>askConfirm('همه واریزی‌ها، لیست‌ها و حساب‌ها به وضعیت این نسخه برمی‌گردند و تغییرات بعد از آن کنار می‌روند (قبلش از وضعیت فعلی نسخه گرفته می‌شود). ادامه می‌دهید؟','بله، بازگردانی',async()=>{
  toast('در حال بازگردانی…');try{const j=await api('/api/backups/'+d.n+'?restore=1',{});await syncNow();BK=await api('/api/backups');render();toast('بازگردانی انجام شد ✓ · '+toFa(j.changed)+' مورد تغییر کرد')}catch(e){toast(e.message,true)}});
$('view').addEventListener('scroll',homeCmp,{passive:true});
{let ly=0;$('view').addEventListener('scroll',()=>{const v=$('view'),y=v.scrollTop,a=$('act');if(!a||!(cur==='banks'||cur==='split1'||cur==='custs')){ly=y;return}if(y>ly+6&&y>40)a.classList.add('hid');else if(y<ly-6||y<=10)a.classList.remove('hid');ly=y},{passive:true})}addEventListener('resize',()=>{if(cur==='home')homeLayout()});
try{sysDark.addEventListener('change',()=>paintBars())}catch(e){}
/* ---------- لیست واحد: ارسال، تأیید گروهی، بایگانی ---------- */
/* تخصیص قدیمی که ردیف‌هایی از تاریخ واریز دیگر هم دارد، موقع ارسال جدا می‌شود تا هر بخش در لیست خودش بماند */
function partOwnPay(p){const M=vMap(),other={};p.ids.forEach(id=>{const r=M.get(id);if(r&&PD(r)!==ldKey)(other[PD(r)]=other[PD(r)]||[]).push(id)});
  Object.keys(other).forEach(k=>{const ids=other[k];p.ids=p.ids.filter(id=>!ids.includes(id));addPart({...p,id:nid++,ids,sent:false,bid:undefined,param:{...(p.param||{})}},k)});p.pay=ldKey}
async function hubSendParts(P){P=P.filter(p=>!p.sent&&p.ids.length);if(!P.length)return;P.forEach(partOwnPay);saveD();txtGen=null;
  const A=partsAlloc(P),sc=P.length>1?'all':'0';expCtx={A,sc};const ok=await copyText(withCtx(txt)),ids=P.map(p=>p.id),b=commitParts(ids,true);
  if(!ok){expCtx={A,sc};openText();toast('ارسال شد؛ متن را از اینجا کپی کنید');return}
  toast('متن کپی شد و '+fmt(P.reduce((a,p)=>a+p.ids.length,0))+' واریزی ارسال شد','','برگرداندن',()=>uncommitParts(ids));if(b){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}}
ACT.hubSend=d=>hubSendParts(parts().filter(p=>p.src.name===d.k));
ACT.hubSendAll=()=>hubSendParts(parts());
/* باز و بسته شدن منبع بدون ساختن دوباره صفحه؛ حرکت کوتاه با CSS (با «کاهش حرکت» حذف می‌شود) */
ACT.hubTog=(d,e)=>{const el=e&&e.target.closest('.hubg');const g=hubData(ldKey).G.find(z=>z.name===d.k),o=d.k==='__full'?!hubOpen.get('__full'):!(g&&hubIsOpen(g));hubOpen.set(d.k,o);if(el){el.classList.toggle('open',o);const b=el.querySelector('.ldm');if(b)b.setAttribute('aria-expanded',o)}else{const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}};
ACT.hubOkAll=d=>{const g=hubData(ldKey).G.find(z=>z.name===d.k);if(!g)return;const L=g.rows.filter(z=>z.bi&&z.st==='pending'&&!z.bi.b.closed).map(z=>z.bi.x);if(!L.length)return;const now=new Date().toISOString();L.forEach(x=>{x.st='ok';x.at=now});saveB();logA('track','تأیید گروهی',d.k+' | '+fmt(L.length)+' واریزی');const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast(fmt(L.length)+' واریز تسویه شد','','برگرداندن',()=>{L.forEach(x=>x.st='pending');saveB();render()})};
/* بایگانی یک لیست: پیگیری‌هایی که فقط ردیف همین لیست را دارند بسته می‌شوند؛ پیگیری قدیمی مشترک بین چند لیست، ردیف‌های این لیست را به پیگیری جدید می‌دهد (کلید عکس‌ها همراه ردیف می‌رود) */
function hubClose(k){const M=vMap(),now=new Date().toISOString(),inK=x=>{const r=M.get(x.id);return r?PD(r)===k:(x.pay||'')===k},touched=[];
  batches.filter(b=>!b.closed&&b.items.some(inK)).forEach(b=>{let t=b;
    if(!b.items.every(inK)){const mv=b.items.filter(inK);mv.forEach(x=>{x.imgs=itImgs(b,x)});t={id:nid++,date:k,pay:k,createdAt:now,by:who(),items:mv};b.items=b.items.filter(x=>!inK(x));batches.unshift(t);
      const S=new Set(mv.map(x=>x.id));entries.forEach(e=>{if(S.has(e.id)&&e.sentBid===b.id)e.sentBid=t.id});allParts().forEach(p=>{if(p.bid===b.id&&p.ids.length&&p.ids.every(id=>S.has(id)))p.bid=t.id})}
    const c=bStat(t);t.closed=now;t.arch={ok:c.ok,fail:c.fail,pending:c.pending,all:c.all,okSum:c.okSum||0,by:who()};touched.push(t)});
  saveE();saveB();saveD();return touched}
ACT.hubArch=()=>{const d=hubData(ldKey);if(!d.sent)return;const go2=()=>{const T=hubClose(ldKey);logA('close','بایگانی لیست',pdHead(ldKey)+' | موفق '+fmt(d.ok)+' از '+fmt(d.rows.length));const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast(T.length?'لیست بایگانی شد':'چیزی برای بایگانی نبود')};
  d.pend||d.un.length||d.dr.length?askConfirm([d.pend?fmt(d.pend)+' واریزی هنوز «در انتظار» است':'',d.un.length||d.dr.length?fmt(d.un.length+d.none)+' واریزی هنوز ارسال نشده':''].filter(Boolean).join(' و ')+'. با همین وضعیت بایگانی شود؟','بایگانی',go2):go2()};
ACT.hubReopen=()=>{const M=vMap();let n=0;batches.forEach(b=>{if(b.closed&&b.items.some(x=>{const r=M.get(x.id);return r?PD(r)===ldKey:x.pay===ldKey})){delete b.closed;n++}});saveB();logA('close','بازگشایی لیست',pdHead(ldKey));render();toast(n?'لیست برای ویرایش باز شد':'لیست بسته‌ای نبود')};
