/* ---------- صفحه فهرست ---------- */
function vDebt(){const op=openCreds(),dn=creds.filter(cDone),rem=op.reduce((s,c)=>s+cRem(c),0),wt=op.reduce((s,c)=>s+cWait(c),0);
  let h=`<div class="ingot"><div class="lb">مانده کل بدهی به ${fmt(op.length)} حساب باز</div><div class="v">${fmt(rem)}<small>تومان</small></div><div class="rule"></div><div class="row3"><div><small>حساب باز</small><b>${fmt(op.length)}</b></div><div><small>در انتظار واریز</small><b>${fmt(wt)}</b></div><div><small>تسویه‌شده</small><b>${fmt(dn.length)}</b></div></div></div>`;
  if(!creds.length)return `<div class="card empty">${ic('debt')}<b>هنوز حساب بدهی ثبت نشده</b>وقتی به کسی بدهکارید و خریدار دیگری مستقیم به حساب او واریز می‌کند، حساب او را اینجا بسازید. مانده تا تسویه کامل، حتی چند روزه، نگه داشته می‌شود.</div>`;
  h+=`<div class="seg"><button data-act="dTab" data-t="open" class="${dTab==='open'?'on':''}">باز ${op.length?'('+fmt(op.length)+')':''}</button><button data-act="dTab" data-t="done" class="${dTab==='done'?'on':''}">تسویه‌شده ${dn.length?'('+fmt(dn.length)+')':''}</button></div>
  <div class="sbar"><div class="sbox">${ic('search')}<input id="dq" type="search" placeholder="جست‌وجو: نام، مبلغ، فاکتور، شبا…" value="${esc(dQ)}" autocomplete="off"><button class="clr${dQ?'':' hide'}" data-act="dClear" aria-label="پاک کردن">×</button></div></div><div id="dlist"></div>`;
  return h}
function dlistHTML(){const q=dQ.trim(),qn=norm(q),qd=toEn(q).replace(/\D/g,'');let L=creds.filter(c=>dTab==='open'?!cDone(c):cDone(c));
  if(q)L=L.filter(c=>norm(c.name).includes(qn)||(qd.length>=3&&(String(c.debt).includes(qd)||(c.iban||'').includes(qd)||String(c.phone||'').includes(qd)))||(c.pays||[]).some(p=>norm(p.name).includes(qn)||(qd.length>=3&&(String(p.inv||'').includes(qd)||String(p.amount).includes(qd)||String(p.tn||'').includes(qd)))));
  if(!L.length)return `<div class="card empty">${ic('search')}<b>${q?'چیزی با «'+esc(q)+'» پیدا نشد':dTab==='open'?'حساب بازی نیست':'هنوز حسابی تسویه نشده'}</b></div>`;
  return L.sort((a,b)=>(b.updatedAt||b.createdAt||'').localeCompare(a.updatedAt||a.createdAt||'')).map(c=>{const paid=cPaid(c),r=cRem(c),p=c.debt?Math.min(100,paid/c.debt*100):0,last=(c.pays||[]).slice(-1)[0];
    return `<button class="dcard${cDone(c)?' done':''}" data-act="credOpen" data-id="${c.id}"><div class="d1"><span class="av">${esc(userInit(c.name))}</span><span class="tx"><b>${q?hl(ttlName(c),q):esc(ttlName(c))}</b><small>${c.iban?esc(ibanBank(c.iban)||'')+' — شبا <bdi dir="ltr">…'+esc(c.iban.slice(-4))+'</bdi>':'بدون شبا'}${c.linkId?'، از لیست '+esc(dates(c.linkDate||dateVal).fa):''}</small></span><span class="rm"><small>${cDone(c)?'تسویه شد':'مانده'}</small><b>${cDone(c)?'✓':fmt(r)}</b></span></div>
    <div class="pbar"><i style="width:${p}%"></i></div><div class="d2"><span>${fmt(paid)} از ${fmt(c.debt)} واریز شده</span><span>${last?relDay(last.date)+'، '+esc(last.name):'هنوز واریزی نیامده'}</span></div></button>`}).join('')}
function bindDebt(){const q=$('dq'),l=$('dlist');if(!l)return;l.innerHTML=dlistHTML();q.oninput=()=>{dQ=q.value;document.querySelector('#view .sbox .clr').classList.toggle('hide',!dQ);clearTimeout(q._t);q._t=setTimeout(()=>{$('dlist').innerHTML=dlistHTML()},120)}}
const aDebt=()=>`<button class="btn gold" data-act="credNew">${ic('plus')} حساب بدهی جدید</button>`;
/* ---------- صفحه یک حساب ---------- */
function vCred(){const c=curC();if(!c)return '<div class="card empty"><b>این حساب پیدا نشد</b></div>';const paid=cPaid(c),r=cRem(c),w=cWait(c),p=c.debt?Math.min(100,paid/c.debt*100):0;
  const le=c.linkId&&entries.find(z=>z.id===c.linkId);
  let h=`<div class="ingot"><div class="lb">${cDone(c)?'این حساب کامل تسویه شد ✓':'مانده بدهی به '+esc(ttlName(c))}</div><div class="v">${fmt(r)}<small>تومان</small></div><div class="pbar gold"><i style="width:${p}%"></i></div><div class="row3"><div><small>کل بدهی</small><b>${fmt(c.debt)}</b></div><div><small>واریز شده</small><b>${fmt(paid)}</b></div>${w?`<div><small>در انتظار</small><b>${fmt(w)}</b></div>`:''}</div></div>
  <div class="card cinfo"><div class="ci"><small>صاحب حساب</small><b>${esc(ttlName(c))}</b></div>${c.iban?`<div class="ci"><small>شماره شبا ${esc(ibanBank(c.iban)?'— '+ibanBank(c.iban):'')}</small>${cpIb(c.iban.slice(2))}</div>`:''}${c.phone?`<div class="ci"><small>تماس</small><b dir="ltr">${esc(c.phone)}</b></div>`:''}${c.note?`<div class="ci"><small>یادداشت</small><span>${esc(c.note)}</span></div>`:''}
  ${c.linkId?`<div class="ci"><small>اتصال به لیست روزانه</small><span>${le?`${esc(dates(le.entryDate).fa)} — ${le.sentBid?'این واریزی ارسال شده؛ واریزهای بعدی فقط در این دفترچه ثبت می‌شود':'هر واریز انجام‌شده از مانده تقسیم همین واریزی کم می‌شود'}`:'واریزی متصل حذف شده'}</span></div>`:''}
  <div class="row" style="margin-top:4px"><button class="sm sec" data-act="credCopy">${ic('copy')} کپی حساب برای خریدار</button><button class="sm sec" data-act="credEdit">${ic('edit')} ویرایش</button></div></div>`;
  const P=[...(c.pays||[])].reverse();
  h+=`<div class="sec-h"><b>واریزهای مشتری به این حساب</b><small class="muted">${fmt(P.length)} مورد</small></div>`;
  if(!P.length)h+=`<div class="card empty">${ic('debt')}<b>هنوز واریزی ثبت نشده</b>وقتی خریداری به حساب ${esc(c.name)} واریز کرد، با دکمه پایین ثبتش کنید.</div>`;
  let last='';P.forEach(x=>{if(x.date!==last){last=x.date;h+=`<div class="tday">${relDay(x.date)}، ${dates(x.date).fa}</div>`}
    h+=`<div class="pay ${x.st==='wait'?'wait':''}"><div class="tx" data-act="payEdit" data-id="${x.id}"><b>${esc(ttlName(x))}${x.img?' <span class="clip">'+ic('cam')+'</span>':''}</b><small>فاکتور ${esc(toEn(x.inv||'—'))}${x.phone?' — <bdi dir="ltr">'+esc(x.phone)+'</bdi>':''}${x.time?' — ساعت '+toFa(x.time):''}</small>${x.tn||x.iban?`<small>${x.tn?'پیگیری <bdi dir="ltr">'+esc(x.tn)+'</bdi>':''}${x.tn&&x.iban?' — ':''}${x.iban?'از <bdi dir="ltr">…'+esc(x.iban.slice(-4))+'</bdi>':''}</small>`:''}</div><div class="v"><b>${fmt(x.amount)}</b>${x.st==='wait'?`<button class="sm okbtn" data-act="payOk" data-id="${x.id}">${ic('check')} تأیید واریز</button>`:'<span class="pill okp">واریز شد</span>'}${x.img?`<button class="sm sec" data-act="payImg" data-id="${x.id}">فیش</button>`:''}</div></div>`});
  h+=`<div class="row"><button class="link" data-act="credStmt">${ic('copy')} کپی صورت‌حساب</button><button class="link" data-act="credPdf">PDF صورت‌حساب</button></div><div class="row"><button class="link" style="color:var(--red)" data-act="credDel">حذف این حساب</button></div>`;
  return h}
const aCred=()=>{const c=curC();if(!c)return '';return cDone(c)?`<button class="btn sec" data-act="credStmt">${ic('copy')} کپی صورت‌حساب</button>`:`<button class="btn gold" data-act="payNew">${ic('plus')} ثبت واریز مشتری</button>`};
/* ---------- فرم حساب بدهی ---------- */
function credSave(){const name=stripName($('cn').value),debt=num($('cd').value),d=dg($('ci').value).slice(0,24),iban=d?'IR'+d:'';
  if(!name||!debt){toast('نام و مبلغ بدهی الزامی است',true);return}if(d&&d.length!==24){toast('شبا باید ۲۴ رقم باشد',true);return}
  const now=new Date().toISOString();let c=dTmp.id&&creds.find(x=>x.id===dTmp.id);
  if(c){if(debt<cPaid(c)){toast('مبلغ بدهی از واریزهای ثبت‌شده کمتر است',true);return}Object.assign(c,{title:dTmp.title,name,debt,iban,phone:toEn($('cp').value).trim(),note:clean($('cno').value),updatedAt:now});logA('debt','ویرایش حساب بدهی',name+' | '+fmt(debt)+' تومان')}
  else{c={id:nid++,title:dTmp.title,name,debt,iban,phone:toEn($('cp').value).trim(),note:clean($('cno').value),pays:[],linkId:dTmp.linkId||null,linkDate:dTmp.linkId?(entries.find(z=>z.id===dTmp.linkId)||{}).entryDate:null,createdAt:now,updatedAt:now,by:who()};creds.unshift(c);logA('debt','حساب بدهی جدید',name+' | '+fmt(debt)+' تومان')}
  saveC();syncLink(c);credId=c.id;closeSheet();if(cur==='cred')render();else go('cred');toast('حساب '+name+' ذخیره شد')}
/* ---------- فرم واریز مشتری ---------- */
function paySave(){const c=curC();if(!c)return;const name=stripName($('pn').value),inv=toEn($('pi').value).trim(),amount=num($('pa').value);
  if(!name||!inv||!amount){toast('نام، شماره فاکتور و مبلغ الزامی است',true);($(!name?'pn':!inv?'pi':'pa')).focus();return}
  const old=dTmp.pid&&(c.pays||[]).find(p=>p.id===dTmp.pid),room=cRem(c)+(old&&old.st!=='wait'?+old.amount:0);
  if(dTmp.st!=='wait'&&amount>room){toast('مبلغ از مانده ('+fmt(room)+') بیشتر است',true);return}
  const o={title:dTmp.title,name,inv,amount,st:dTmp.st,phone:toEn($('pp').value).trim(),time:$('pt').value,iban:toEn($('pb').value).replace(/\s/g,'').toUpperCase(),tn:toEn($('ptn').value).trim(),note:clean($('pno').value)};
  const wasDone=cDone(c);
  if(old)Object.assign(old,o,{at:new Date().toISOString()});else{c.pays=c.pays||[];c.pays.push({id:nid++,date:todayISO(),by:who(),at:new Date().toISOString(),...o})}
  c.updatedAt=new Date().toISOString();saveC();syncLink(c);logA('debt',(old?'ویرایش':'ثبت')+' واریز به '+c.name,ttlName(o)+' | فاکتور '+inv+' | '+fmt(amount)+' تومان'+(o.st==='wait'?' | در انتظار':''));
  closeSheet();render();$('dock').innerHTML=dockHTML();
  if(!wasDone&&cDone(c))toast('حساب '+c.name+' کامل تسویه شد ✓');else toast('ثبت شد — مانده: '+fmt(cRem(c))+' تومان')}
/* ---------- متن‌ها ---------- */
function credCopyText(amount,buyer){const c=curC();let t=Bo('◆ واریز به حساب '+ttlName(c))+'\n';if(buyer)t+='واریزکننده: '+buyer+'\n';t+='مبلغ: '+Bo(N(amount)+' تومان')+'\n';
  if(c.iban)t+='شماره شبا:\n'+Mo(ibanSp(c.iban))+(ibanBank(c.iban)?'\nبانک: '+ibanBank(c.iban):'')+'\n';t+='صاحب حساب: '+ttlName(c)+'\n';return t}
function credStmt(c){const P=c.pays||[];let t=Bo('مطلا | صورت‌حساب تسویه بدهی')+'\nصاحب حساب: '+Bo(ttlName(c))+(c.iban?'\nشبا: '+Mo(ibanSp(c.iban)):'')+'\nکل بدهی: '+N(c.debt)+' تومان\n'+LINE+'\n';
  P.forEach((x,i)=>{t+=toFa(i+1)+'. '+ttlName(x)+' — فاکتور '+toEn(x.inv)+'\n   '+dates(x.date).fa+(x.time?' ساعت '+x.time:'')+' — '+Bo(N(x.amount)+' تومان')+(x.st==='wait'?' (در انتظار)':'')+(x.tn?'\n   پیگیری: '+x.tn:'')+'\n'});
  return t+LINE+'\nواریز شده: '+Bo(N(cPaid(c))+' تومان')+(cWait(c)?'\nدر انتظار: '+N(cWait(c))+' تومان':'')+'\n'+Bo(cDone(c)?'✓ کامل تسویه شد':'مانده: '+N(cRem(c))+' تومان')+'\n'}
function credCopySheet(){const c=curC(),r=cRem(c);sheet(`<div class="sh-h"><b>کپی حساب برای خریدار</b><button class="x" data-act="close">×</button></div>
  <div class="muted" style="font-size:12.5px;margin:-6px 0 12px">متن را برای خریدار بفرستید تا مستقیم به حساب ${esc(c.name)} واریز کند.</div>
  <div class="f2"><div class="f"><label>مبلغ <i>(تومان)</i></label><input id="ka" class="ltr num" inputmode="numeric" value="${r?r.toLocaleString('en-US'):''}"></div><div class="f"><label>نام خریدار <i>(اختیاری)</i></label><input id="kb"></div></div>
  <div class="f"><label>شماره فاکتور فروش <i>(برای ثبت «در انتظار»)</i></label><input id="ki" class="ltr" inputmode="numeric"></div>
  <div class="row"><button class="btn sec" data-act="credCopyGo" data-w="1">کپی و ثبت در انتظار</button><button class="btn gold" data-act="credCopyGo">${ic('copy')} کپی متن</button></div>`);
  $('ka').oninput=()=>{const v=num($('ka').value);$('ka').value=v?v.toLocaleString('en-US'):''}}
async function credPdf(){const c=curC();if(!c)return;const D=dates(),P=c.pays||[];
  const body=`<section class="pg">${pdfTop('صورت‌حساب تسویه بدهی',D)}<h1>${esc(ttlName(c))}</h1><div class="sub">${c.iban?'<span>'+esc(ibanSp(c.iban))+'</span>':''}${c.iban&&ibanBank(c.iban)?' — '+esc(ibanBank(c.iban)):''}</div><div class="bar"></div>
  <div class="kp"><div><small>کل بدهی</small><b>${fmt(c.debt)}<em>تومان</em></b></div><div class="ok"><small>واریز شده</small><b>${fmt(cPaid(c))}<em>تومان</em></b></div><div class="${cDone(c)?'ok':'rd'}"><small>${cDone(c)?'وضعیت':'مانده'}</small><b>${cDone(c)?'تسویه شد':fmt(cRem(c))}</b></div></div>
  <table><thead><tr><th>#</th><th>واریزکننده و فاکتور</th><th>تاریخ و پیگیری</th><th>وضعیت</th><th class="am">مبلغ (تومان)</th></tr></thead><tbody>
  ${P.map((x,i)=>`<tr><td class="n">${fmt(i+1)}</td><td><span class="nm">${esc(ttlName(x))}</span><span class="s">فاکتور ${esc(toEn(x.inv))}${x.phone?' — '+esc(x.phone):''}</span></td><td>${dates(x.date).fa}${x.time?' — '+toFa(x.time):''}${x.tn?`<span class="s">پیگیری <span class="tn">${esc(x.tn)}</span></span>`:''}</td><td><span class="st ${x.st==='wait'?'pending':'ok'}">${x.st==='wait'?'در انتظار':'واریز شد'}</span></td><td class="am">${fmt(x.amount)}</td></tr>`).join('')}
  <tr class="tot"><td></td><td colspan="3">مانده</td><td class="am">${fmt(cRem(c))}</td></tr></tbody></table><div class="sign"><div>تهیه‌کننده</div><div>تأیید طلبکار</div></div>${pdfFoot()}</section>`;
  openPrint(pdfDoc('صورت‌حساب '+c.name,body))}

/* ============ تسویه بدهی: ثبت گام‌به‌گام (پنجره به پنجره) ============ */
let wz=null;
const WZC=['انتخاب','صاحب حساب','مبلغ و شبا','تأیید'],WZP=['خریدار','فاکتور و مبلغ','وضعیت','تأیید'];
const wzSteps=()=>wz.kind==='c'?(wz.id?[2,3,4]:[1,2,3,4]):[1,2,3,4];
function startCW(id,fromEntry){const c=id?creds.find(x=>x.id===id):null,e=fromEntry?entries.find(z=>z.id===fromEntry):null,V=e&&validated().find(z=>z.id===e.id);
  wz={kind:'c',id:c?c.id:null,step:c?4:e?2:1,ret:null,d:c?{title:c.title||'',name:c.name,phone:c.phone||'',debt:c.debt,iban:(c.iban||'').replace(/^IR/,''),note:c.note||'',linkId:c.linkId||null}
    :{title:e?e.title||'':'',name:e?e.name:'',phone:'',debt:e?(V?V.amount:e.amount):0,iban:e?(e.iban||'').replace(/^IR/,''):'',note:'',linkId:e?e.id:null}};
  editId=null;go('cwiz')}
function startPW(pid){const c=curC();if(!c)return;const x=pid?(c.pays||[]).find(p=>p.id===pid):null,n=new Date();
  wz={kind:'p',id:x?x.id:null,step:x?4:1,ret:null,img:undefined,imgPrev:null,d:x?{...x}:{title:'',name:'',phone:'',inv:'',amount:0,st:'ok',time:p2(n.getHours())+':'+p2(n.getMinutes()),iban:'',tn:'',note:''}};dTmp={pid:wz.id};go('pwiz');if(x&&x.img)imgGet(pkey(x.id)).then(v=>{if(wz&&wz.id===x.id){wz.imgPrev=v;if(cur==='pwiz'&&wz.step>=3)render()}})}
const pkey=id=>'pay:'+id;
function wzRoom(){const c=curC();if(!c)return 0;const old=wz.id&&(c.pays||[]).find(p=>p.id===wz.id);return cRem(c)+(old&&old.st!=='wait'?+old.amount:0)}
function wzBar(){const S=wzSteps(),L=wz.kind==='c'?WZC:WZP;return `<div class="flow wzbar">${S.map((k,i)=>`<button class="fs${wz.step===k?' on':''}${wz.step>k?' done':''}" data-act="wzGo" data-s="${k}"${k>wz.step&&!wz.id?' disabled':''}><i>${wz.step>k?ic('check'):toFa(i+1)}</i><span>${L[k-1]}</span></button>`).join('<b></b>')}</div>`}
const wzIn=(k,lab,opt,attrs)=>`<div class="f"><label>${lab}${opt?' <i>(اختیاری)</i>':''}</label><input data-wz="${k}" value="${esc(wz.d[k]||'')}" ${attrs||''}></div>`;
const wzNum=(k,lab)=>`<div class="f"><label>${lab} <i>(تومان)</i></label><input data-wz="${k}" data-n="1" class="ltr big" inputmode="numeric" value="${wz.d[k]?Number(wz.d[k]).toLocaleString('en-US'):''}" placeholder="0"></div>`;
const wzTitles=()=>`<div class="ttl3">${['خانم','آقا',''].map(t=>`<button class="tch${wz.d.title===t?' on':''}" data-act="wzTitle" data-t="${t}">${t||'بدون عنوان'}</button>`).join('')}</div>`;
const rrow=(lab,val,s)=>`<div class="rv"><div><small>${lab}</small><b>${val}</b></div>${s?`<button class="link" data-act="wzGo" data-s="${s}">${ic('edit')} ویرایش</button>`:''}</div>`;
function vWiz(){if(!wz)return '';const d=wz.d,c=curC();let h=wzBar(),q='',body='';
  if(wz.kind==='c'){
    if(wz.step===1){const pool=splitList().filter(r=>r.level<2&&!creds.some(k=>k.linkId===r.id));q='این حساب بدهی برای کیست؟';
      body=`<button class="wopt" data-act="wzPick" data-id="new"><span class="ic gd">${ic('plus')}</span><span class="tx"><b>شخص جدید</b><small>اطلاعات را خودتان وارد می‌کنید</small></span>${fwd()}</button>
      ${pool.length?`<div class="albl">یا از لیست ${dates(dateVal).fa} انتخاب کنید</div><div class="muted" style="font-size:12px;margin:-4px 2px 8px">با انتخاب از لیست، هر واریز خریدار از مانده همان شخص در تقسیم کم می‌شود.</div>`+pool.map(r=>`<button class="wopt${d.linkId===r.id?' on':''}" data-act="wzPick" data-id="${r.id}"><span class="ic">${esc(userInit(r.name))}</span><span class="tx"><b>${esc(fullName(r))}</b><small>${esc(r.bankShow||'—')}${r.code?'، فاکتور '+esc(toEn(r.code)):''}</small></span><span class="v">${fmt(r.amount)}</span></button>`).join(''):''}`}
    if(wz.step===2){q='صاحب حساب (طلبکار) کیست؟';body=`<div class="card"><div class="f"><div class="lblrow"><label>نام و نام خانوادگی</label>${wzTitles()}</div><input data-wz="name" value="${esc(d.name)}" autocomplete="off" enterkeyhint="next"></div>${wzIn('phone','شماره تماس',1,'class="ltr" type="tel" inputmode="tel" enterkeyhint="next"')}</div>`}
    if(wz.step===3){q='چقدر به '+esc(d.name||'این شخص')+' بدهکارید؟';const dd=dg(d.iban),f='IR'+dd;
      body=`<div class="card">${wzNum('debt','مبلغ بدهی')}<div class="f" style="margin:0"><label>شماره شبا <i>(اختیاری؛ برای کپی و ارسال به خریدار)</i></label><div class="ibw"><span>IR</span><input data-wz="iban" data-ib="1" inputmode="numeric" autocomplete="off" value="${esc(ibanGroups(dd))}" placeholder="۲۴ رقم"></div><div class="hint" id="wzh">${dd?(dd.length<24?toFa(dd.length)+' از ۲۴ رقم':ibanOk(f)?'<span style="color:var(--ok)">شبا معتبر است'+(ibanBank(f)?' — بانک '+ibanBank(f):'')+'</span>':'<span style="color:var(--red)">شماره شبا اشتباه است</span>'):''}</div></div></div>`}
    if(wz.step===4){const le=d.linkId&&entries.find(z=>z.id===d.linkId);q=wz.id?'اطلاعات حساب را بررسی و ویرایش کنید':'همه‌چیز درست است؟';
      body=`<div class="card review">${rrow('صاحب حساب',esc(ttlName(d))+(d.phone?` <small dir="ltr">${esc(d.phone)}</small>`:''),2)}${rrow('مبلغ بدهی',fmt(d.debt)+' تومان',3)}${rrow('شماره شبا',d.iban?`<span class="ltrv">${esc(ibanSp('IR'+dg(d.iban)))}</span>`:'— ثبت نشده',3)}${wz.id?'':rrow('اتصال به لیست',le?'از لیست '+esc(dates(le.entryDate).fa):'بدون اتصال',1)}
      <div class="f" style="margin:10px 0 0"><label>یادداشت <i>(اختیاری)</i></label><input data-wz="note" value="${esc(d.note||'')}"></div></div>${wz.id?`<button class="link" style="color:var(--red)" data-act="credDel">حذف این حساب</button>`:''}`}}
  else{const room=wzRoom();
    if(wz.step===1){q='چه کسی به حساب '+esc(c?c.name:'')+' واریز می‌کند؟';body=`<div class="card"><div class="f"><div class="lblrow"><label>نام خریدار (واریزکننده)</label>${wzTitles()}</div><input data-wz="name" value="${esc(d.name)}" autocomplete="off" enterkeyhint="next"></div>${wzIn('phone','شماره تماس',1,'class="ltr" type="tel" inputmode="tel" enterkeyhint="next"')}</div>`}
    if(wz.step===2){q='فاکتور و مبلغ واریز';body=`<div class="card">${wzIn('inv','شماره فاکتور فروش',0,'class="ltr" inputmode="numeric" enterkeyhint="next"')}${wzNum('amount','مبلغ واریز')}<div class="qamt"><span>مانده حساب: <b>${fmt(room)}</b></span><button class="chip" data-act="wzAmt" data-p="1">کل مانده</button><button class="chip" data-act="wzAmt" data-p="2">نصف</button></div></div>`}
    if(wz.step===3){q='وضعیت واریز و رسید';const after=d.st==='wait'?room:room-(+d.amount||0),im=wz.img===null?null:(wz.img||wz.imgPrev);
      body=`<div class="stpick"><button class="sp ok${d.st!=='wait'?' on':''}" data-act="wzSt" data-st="ok"><span class="rd">${ic('check')}</span><b>واریز شد</b><small>پول رسیده؛ از مانده کم می‌شود</small></button><button class="sp wait${d.st==='wait'?' on':''}" data-act="wzSt" data-st="wait"><span class="rd">${ic('clock')}</span><b>در انتظار تأیید</b><small>هنوز نرسیده؛ بعداً با یک لمس تأیید کنید</small></button></div>
      <div class="wzafter"><span>${d.st==='wait'?'مانده فعلاً تغییر نمی‌کند':'مانده بعد از این واریز'}</span><b style="color:${after>0?'var(--red)':'var(--ok)'}">${after>0?fmt(after)+' تومان':'تسویه کامل ✓'}</b></div>
      <div class="card"><div class="albl" style="margin-top:0">عکس فیش واریز <i class="opt">اختیاری</i></div>
      ${im?`<img src="${im}" class="rcpt" alt="فیش" data-act="wzImgView"><div class="row"><label class="btn sec filebtn">${ic('cam')} تعویض عکس<input type="file" accept="image/*" id="wzf"></label><button class="btn sec" data-act="wzImgDel" style="color:var(--red);flex:0 0 auto;padding:0 18px">حذف</button></div>`
        :`<label class="dropimg">${ic('cam')}<b>افزودن عکس فیش</b><small>از دوربین یا گالری</small><input type="file" accept="image/*" id="wzf"></label>`}</div>
      <div class="card"><div class="albl" style="margin-top:0">جزئیات <i class="opt">همه اختیاری</i></div>
      <div class="f"><label>ساعت واریز <i>(اختیاری)</i></label><div class="trow2"><input data-wz="time" type="time" class="ltr tm" value="${esc(d.time||'')}"><button class="btn sec" data-act="wzNow">الان</button></div></div>
      ${wzIn('tn','شماره پیگیری بانک',1,'class="ltr" inputmode="numeric" enterkeyhint="next"')}${wzIn('iban','شبا یا کارت واریزکننده',1,'class="ltr" inputmode="numeric" enterkeyhint="next"')}${wzIn('note','یادداشت',1,'enterkeyhint="done"')}</div>`}
    if(wz.step===4){q=wz.id?'واریز را بررسی و ویرایش کنید':'همه‌چیز درست است؟';const after=d.st==='wait'?room:room-(+d.amount||0);
      body=`<div class="card review">${rrow('واریزکننده',esc(ttlName(d))+(d.phone?` <small dir="ltr">${esc(d.phone)}</small>`:''),1)}${rrow('شماره فاکتور',esc(toEn(d.inv||'—')),2)}${rrow('مبلغ',fmt(d.amount)+' تومان',2)}${rrow('وضعیت',d.st==='wait'?'⏳ در انتظار واریز':'✅ واریز شد',3)}${(wz.img===null?null:(wz.img||wz.imgPrev))?`<div class="rv"><div><small>عکس فیش</small><img src="${wz.img||wz.imgPrev}" class="rthumb" alt="فیش" data-act="wzImgView"></div><button class="link" data-act="wzGo" data-s="3">${ic('edit')} ویرایش</button></div>`:rrow('عکس فیش','— ضمیمه نشده',3)}${d.time||d.tn||d.iban||d.note?rrow('جزئیات',[d.time?'ساعت '+toFa(d.time):'',d.tn?'پیگیری '+esc(d.tn):'',d.iban?'از '+esc(d.iban):'',esc(d.note||'')].filter(Boolean).join('، '),3):''}</div>
      <div class="wzafter"><span>مانده ${esc(c?c.name:'')} بعد از ثبت</span><b style="color:${after>0?'var(--red)':'var(--ok)'}">${after>0?fmt(after)+' تومان':'تسویه کامل ✓'}</b></div>${wz.id?`<button class="link" style="color:var(--red)" data-act="payDel">حذف این واریز</button>`:''}`}}
  return h+`<div class="wzq">${q}</div>`+body}
const aWiz=()=>{if(!wz)return '';const S=wzSteps(),first=wz.step===S[0],last=wz.step===4;
  if(wz.kind==='c'&&wz.step===1)return '';
  return `${first&&!wz.id?'':`<button class="btn sec" data-act="wzPrev" style="flex:0 0 30%">${wz.ret?'انصراف':'قبلی'}</button>`}<button class="btn gold" data-act="${last?'wzSave':'wzNext'}">${last?(wz.id?'ذخیره تغییرات':wz.kind==='c'?'ساختن حساب':'ثبت واریز'):wz.ret?'تأیید':'بعدی'}</button>`};
function bindWiz(){const V=$('view');
  V.oninput=e=>{const t=e.target,k=t.dataset.wz;if(!k)return;
    if(t.dataset.n){const n=num(t.value);t.value=n?n.toLocaleString('en-US'):'';wz.d[k]=n;return}
    if(t.dataset.ib){const d=dg(t.value).slice(0,24);t.value=ibanGroups(d);wz.d.iban=d;const f='IR'+d,h=$('wzh');if(h)h.innerHTML=d?(d.length<24?toFa(d.length)+' از ۲۴ رقم':ibanOk(f)?'<span style="color:var(--ok)">شبا معتبر است'+(ibanBank(f)?' — بانک '+ibanBank(f):'')+'</span>':'<span style="color:var(--red)">شماره شبا اشتباه است</span>'):'';return}
    wz.d[k]=k==='inv'||k==='tn'||k==='phone'?toEn(t.value):t.value};
  const ins=[...V.querySelectorAll('input[data-wz]')];ins.forEach((el,i)=>el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(ins[i+1])ins[i+1].focus();else ACT[wz.step===4?'wzSave':'wzNext']()}}));
  const fi=$('wzf');if(fi)fi.onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{wz.img=await shrink(f);render();toast('عکس فیش اضافه شد')}catch(x){toast('این عکس خوانده نشد',true)}};
  const f=ins[0];if(f&&wz.step<3)setTimeout(()=>f.focus(),80)}
function wzCheck(){const d=wz.d,s=wz.step;
  if(wz.kind==='c'){if(s===2&&!stripName(d.name))return 'نام صاحب حساب را بنویسید';if(s===3){if(!(+d.debt>0))return 'مبلغ بدهی را بنویسید';const dd=dg(d.iban);if(dd&&dd.length!==24)return 'شبا باید ۲۴ رقم باشد'}}
  else{if(s===1&&!stripName(d.name))return 'نام خریدار را بنویسید';if(s===2){if(!String(d.inv||'').trim())return 'شماره فاکتور فروش را بنویسید';if(!(+d.amount>0))return 'مبلغ را بنویسید'}if(s===3&&d.st!=='wait'&&+d.amount>wzRoom())return 'مبلغ از مانده حساب ('+fmt(wzRoom())+') بیشتر است'}return ''}
function wzSaveC(){const d=wz.d,name=stripName(d.name),dd=dg(d.iban),iban=dd?'IR'+dd:'',now=new Date().toISOString();let c=wz.id&&creds.find(x=>x.id===wz.id);
  if(c){if(+d.debt<cPaid(c)){toast('مبلغ بدهی از واریزهای ثبت‌شده کمتر است',true);wz.step=3;render();return}Object.assign(c,{title:d.title,name,debt:+d.debt,iban,phone:d.phone.trim(),note:clean(d.note||''),updatedAt:now});logA('debt','ویرایش حساب بدهی',name+' | '+fmt(d.debt)+' تومان')}
  else{c={id:nid++,title:d.title,name,debt:+d.debt,iban,phone:(d.phone||'').trim(),note:clean(d.note||''),pays:[],linkId:d.linkId||null,linkDate:d.linkId?(entries.find(z=>z.id===d.linkId)||{}).entryDate:null,createdAt:now,updatedAt:now,by:who()};creds.unshift(c);logA('debt','حساب بدهی جدید',name+' | '+fmt(d.debt)+' تومان')}
  saveC();syncLink(c);credId=c.id;wz=null;cur='debt';go('cred');toast('حساب '+name+' ذخیره شد')}
function wzSaveP(){const c=curC();if(!c)return;const d=wz.d,old=wz.id&&(c.pays||[]).find(p=>p.id===wz.id),wasDone=cDone(c);
  if(d.st!=='wait'&&+d.amount>wzRoom()){toast('مبلغ از مانده بیشتر است',true);wz.step=2;render();return}
  const o={title:d.title,name:stripName(d.name),inv:String(d.inv).trim(),amount:+d.amount,st:d.st||'ok',phone:(d.phone||'').trim(),time:d.time||'',iban:toEn(d.iban||'').replace(/\s/g,'').toUpperCase(),tn:(d.tn||'').trim(),note:clean(d.note||'')};
  let rec=old;if(old)Object.assign(old,o,{at:new Date().toISOString()});else{rec={id:nid++,date:todayISO(),by:who(),at:new Date().toISOString(),...o};c.pays=c.pays||[];c.pays.push(rec)}
  if(wz.img===null){imgDel(pkey(rec.id));rec.img=false}else if(typeof wz.img==='string'){imgPut(pkey(rec.id),wz.img).then(ok=>{if(!ok)toast('حافظه پر است؛ عکس فیش ذخیره نشد',true)});rec.img=true}
  c.updatedAt=new Date().toISOString();saveC();syncLink(c);logA('debt',(old?'ویرایش':'ثبت')+' واریز به '+c.name,ttlName(o)+' | فاکتور '+o.inv+' | '+fmt(o.amount)+' تومان'+(o.st==='wait'?' | در انتظار':''));
  wz=null;cur='debt';go('cred');$('dock').innerHTML=dockHTML();
  if(!wasDone&&cDone(c))toast('حساب '+c.name+' کامل تسویه شد ✓');else toast((old?'ذخیره شد':'ثبت شد')+' — مانده: '+fmt(cRem(c))+' تومان')}

/* ============ تاریخچه هوشمند ============ */
const EVT={add:['ثبت','var(--ok)'],edit:['ویرایش','var(--pri)'],del:['حذف','var(--red)'],clear:['پاک‌کردن لیست','var(--red)'],bulk:['ورود گروهی','var(--gold)'],split:['تقسیم','var(--navy2)'],restore:['بازگردانی','var(--ok)'],undo:['لغو','var(--mut)'],purge:['حذف دائمی','var(--red)'],batch:['پیگیری','var(--gold)'],requeue:['واریز مجدد','var(--pri)'],uncommit:['برگرداندن ارسال','var(--mut)'],close:['بایگانی','var(--ok)'],alloc:['تخصیص','var(--gold)'],debt:['تسویه بدهی','var(--navy2)']};
const isoOfTs=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const hm=ts=>{const d=new Date(ts);return toFa(p2(d.getHours())+':'+p2(d.getMinutes()))};
const FN={name:'نام',code:'فاکتور',amount:'مبلغ',iban:'شبا',card:'کارت',entryDate:'تاریخ'};
function diffHTML(b,a){if(!b||!a)return '';const ch=Object.keys(FN).filter(k=>String(b[k]||'')!==String(a[k]||''));if(!ch.length)return '';
  const v=(k,x)=>k==='amount'?fmt(x):k==='entryDate'?dates(x).fa:esc(x||'—');return `<div class="ch">${ch.map(k=>`${FN[k]}: <del>${v(k,b[k])}</del> ← <ins>${v(k,a[k])}</ins>`).join('<br>')}</div>`}
