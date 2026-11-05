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
function credPdf(){const c=curC();if(!c)return;openPrint(async()=>{const D=dates(),P=c.pays||[];
  const body=`<section class="pg">${pdfTop('صورت‌حساب تسویه بدهی',D)}<h1>${esc(ttlName(c))}</h1><div class="sub">${c.iban?'<span>'+esc(ibanSp(c.iban))+'</span>':''}${c.iban&&ibanBank(c.iban)?' — '+esc(ibanBank(c.iban)):''}</div><div class="bar"></div>
  <div class="kp"><div><small>کل بدهی</small><b>${fmt(c.debt)}<em>تومان</em></b></div><div class="ok"><small>واریز شده</small><b>${fmt(cPaid(c))}<em>تومان</em></b></div><div class="${cDone(c)?'ok':'rd'}"><small>${cDone(c)?'وضعیت':'مانده'}</small><b>${cDone(c)?'تسویه شد':fmt(cRem(c))}</b></div></div>
  <table><thead><tr><th>#</th><th>واریزکننده و فاکتور</th><th>تاریخ و پیگیری</th><th>وضعیت</th><th class="am">مبلغ (تومان)</th></tr></thead><tbody>
  ${P.map((x,i)=>`<tr><td class="n">${fmt(i+1)}</td><td><span class="nm">${esc(ttlName(x))}</span><span class="s">فاکتور ${esc(toEn(x.inv))}${x.phone?' — '+esc(x.phone):''}</span></td><td>${dates(x.date).fa}${x.time?' — '+toFa(x.time):''}${x.tn?`<span class="s">پیگیری <span class="tn">${esc(x.tn)}</span></span>`:''}</td><td><span class="st ${x.st==='wait'?'pending':'ok'}">${x.st==='wait'?'در انتظار':'واریز شد'}</span></td><td class="am">${fmt(x.amount)}</td></tr>`).join('')}
  <tr class="tot"><td></td><td colspan="3">مانده</td><td class="am">${fmt(cRem(c))}</td></tr></tbody></table><div class="sign"><div>تهیه‌کننده</div><div>تأیید طلبکار</div></div>${pdfFoot()}</section>`;
  return pdfDoc('صورت‌حساب '+c.name,body)})}

/* ============ تسویه بدهی: ثبت گام‌به‌گام (پنجره به پنجره) ============ */
let wz=null;
const wzSteps=()=>wz.kind==='c'?(wz.id?[2,3,4]:[1,2,3,4]):[1,2,3,4];
function startCW(id,fromEntry){const c=id?creds.find(x=>x.id===id):null,e=fromEntry?entries.find(z=>z.id===fromEntry):null,V=e&&validated().find(z=>z.id===e.id);
  wz={kind:'c',id:c?c.id:null,step:c?4:e?2:1,ret:null,d:c?{title:c.title||'',name:c.name,phone:c.phone||'',debt:c.debt,iban:(c.iban||'').replace(/^IR/,''),note:c.note||'',linkId:c.linkId||null}
    :{title:e?e.title||'':'',name:e?e.name:'',phone:'',debt:e?(V?V.amount:e.amount):0,iban:e?(e.iban||'').replace(/^IR/,''):'',note:'',linkId:e?e.id:null}};
  editId=null;go('cwiz')}
function startPW(pid){const c=curC();if(!c)return;const x=pid?(c.pays||[]).find(p=>p.id===pid):null,n=new Date();
  wz={kind:'p',id:x?x.id:null,step:x?4:1,ret:null,img:undefined,imgPrev:null,d:x?{...x}:{title:'',name:'',phone:'',inv:'',amount:0,st:'ok',time:p2(n.getHours())+':'+p2(n.getMinutes()),iban:'',tn:'',note:''}};dTmp={pid:wz.id};go('pwiz');if(x&&x.img)imgGet(pkey(x.id)).then(v=>{if(wz&&wz.id===x.id){wz.imgPrev=v;if(cur==='pwiz'&&wz.step>=3)render()}})}
const pkey=id=>'pay:'+id;

/* ============ تاریخچه هوشمند ============ */
const EVT={add:['ثبت','var(--ok)'],edit:['ویرایش','var(--pri)'],del:['حذف','var(--red)'],clear:['پاک‌کردن لیست','var(--red)'],bulk:['ورود گروهی','var(--gold)'],split:['تقسیم','var(--navy2)'],restore:['بازگردانی','var(--ok)'],undo:['لغو','var(--mut)'],purge:['حذف دائمی','var(--red)'],batch:['پیگیری','var(--gold)'],requeue:['واریز مجدد','var(--pri)'],uncommit:['برگرداندن ارسال','var(--mut)'],close:['بایگانی','var(--ok)'],alloc:['تخصیص','var(--gold)'],debt:['تسویه بدهی','var(--navy2)']};
const isoOfTs=ts=>{const d=new Date(ts);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
const hm=ts=>{const d=new Date(ts);return toFa(p2(d.getHours())+':'+p2(d.getMinutes()))};
const FN={name:'نام',code:'فاکتور',amount:'مبلغ',iban:'شبا',card:'کارت',entryDate:'تاریخ'};
function diffHTML(b,a){if(!b||!a)return '';const ch=Object.keys(FN).filter(k=>String(b[k]||'')!==String(a[k]||''));if(!ch.length)return '';
  const v=(k,x)=>k==='amount'?fmt(x):k==='entryDate'?dates(x).fa:esc(x||'—');return `<div class="ch">${ch.map(k=>`${FN[k]}: <del>${v(k,b[k])}</del> ← <ins>${v(k,a[k])}</ins>`).join('<br>')}</div>`}
