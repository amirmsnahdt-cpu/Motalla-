const ACT={
  back,close:()=>{aSt=null;dpMode='';srcRet='';closeSheet()},go:d=>go(d.n),date:openDate,user:()=>ACT.acct(),resetForm,resetBulk,saveEntry,bulkAdd,
  toastAct:()=>{const f=toastAct;toastHide();f&&f()},
  tab:d=>{if(d&&d.n==='split')spTab='split';const n={custs:'custs',banks:'banks',home:'home',entry:'entry',list:'list',split:'split1',audit:'audit',track:'split1',debt:'debt',settings:'settings'}[d.n];if(n==='entry')editId=null;if(n==='audit'&&cur!=='audit')histTab='ev';if(n==='track'&&cur!=='track'){gQ='';gF='all'}if(n==='list'&&cur!=='list'){listMode='all';openGroups=new Set()}if(n===cur&&n==='list'){window.scrollTo({top:0,behavior:'smooth'});return}go(n);if(d.n==='split'){const C=splitCands().filter(c=>c.ok&&c.ok.length);if(C.length&&!C.some(c=>c.iso===dateVal)){setDate(C[0].iso,true);toast('تقسیم لیست '+dates(C[0].iso).fa)}}},
  cancelEdit:()=>{editId=null;const b=editBack;editBack=null;go(b||'list')},
  pickDate:d=>{closeSheet();setDate(d.iso)},
  lsel:d=>{if(d.iso==='all'){listMode='all';openGroups=new Set();render()}else{listMode='day';setDate(d.iso,true)}window.scrollTo(0,0)},
  splitPick:()=>openSplitPick(),spSel:d=>{closeSheet();ACT.arcDay({iso:d.pay||d.iso})},aQuick:d=>aQuick(d.v),
  showBad:()=>{listMode='day';listFilter='bad';listQ='';go('list')},
  saveUser:()=>{user=$('un').value.trim();ls.set('m_user',user);closeSheet();toast('نام کاربر ذخیره شد');render()},
  dtab:d=>{setDp(curISO(),d.t);document.querySelectorAll('#sheet .seg button').forEach(b=>b.classList.toggle('on',b.dataset.t===d.t));buildWheels()},
  wpick:d=>{$('w'+d.w).scrollTo({top:+d.i*44,behavior:'smooth'})},
  today:()=>{setDp(todayISO(),dp.t);buildWheels()},dok:()=>{const v=tmpISO,m=dpMode;dpMode='';closeSheet();if(m==='pay'){ACT.fPay({iso:v});return}if(m==='epay'){const x=entRow(),e=x&&entries.find(y=>y.id===x.id);if(e){const before=pick(e);e.payDate=v;e.updatedBy=who();e.updatedAt=new Date().toISOString();logA('edit','ویرایش واریزی',e.name+' | تاریخ واریز '+dates(v).fa,{ids:[e.id],before,after:pick(e)});saveE();render();toast('تاریخ واریز: '+payLab(v))}return}m==='new'?startList(v):setDate(v)},
  lmode:d=>{listMode=d.m;openGroups=new Set();render()},
  lfilter:d=>{listFilter=d.f;refreshList()},
  clearQ:()=>{listQ='';const q=$('lq');if(q){q.value='';q.focus()}refreshList(true)},
  sortSheet:openSort,setSort:d=>{listSort=d.s;ls.set('m_sort',listSort);closeSheet();render()},
  tgl:d=>{const g=document.querySelector(`.dgrp[data-g="${d.g}"]`);if(!g)return;const o=!g.classList.contains('open');g.classList.toggle('open',o);g.querySelector('.h').setAttribute('aria-expanded',o);o?openGroups.add(d.g):openGroups.delete(d.g)},
  edit:d=>{const x=entries.find(y=>y.id==d.id);if(!x)return;editBack=['split1','split3','srcview'].includes(cur)?'split1':cur;editId=x.id;if(x.entryDate!==dateVal){dateVal=x.entryDate;ls.set('m_date',dateVal);alloc=null}go('entry')},
  del:d=>delEntry(d.id),
  yes:()=>{const f=confirmCb;confirmCb=null;closeSheet();f&&f()},
  copyDate:d=>{const x=entries.find(y=>y.id==d.id);if(!x)return;const ne={...x,id:nid++,entryDate:dateVal,originalEntryDate:x.originalEntryDate||x.entryDate,createdBy:who(),updatedBy:who(),updatedAt:new Date().toISOString()};delete ne.wd;if(ne.settles)ne.settles=ne.settles.filter(z=>!z.byInv);entries.push(ne);saveE();alloc=null;logA('add','افزودن به تاریخ دیگر',x.name+' → '+dates(dateVal).fa,{ids:[ne.id],after:pick(ne)});toast('به '+dates(dateVal).fa+' اضافه شد');render()},
  clearDay:()=>askConfirm('کل لیست '+dates(dateVal).fa+' به سطل بازیابی برود؟','انتقال به سطل',()=>{const ids=dayEntries().map(e=>e.id),s=sum(dayEntries());trashIds(ids,'پاک‌کردن لیست روز');logA('clear','پاک‌کردن لیست روز',fmt(ids.length)+' واریزی | '+fmt(s)+' تومان | '+dates(dateVal).fa,{ids});const evId=audit[0].id;render();toast(fmt(ids.length)+' واریزی به سطل رفت','','بازگردانی',()=>undoEv(evId))}),
  htab:d=>{histTab=d.t;histOpen=new Set();render()},hfilter:d=>{histFilter=d.f;histOpen=new Set();render()},
  evTog:(d,e)=>{const r=e.target.closest('.hrow');if(!r)return;const o=r.classList.toggle('open'),h=r.querySelector('.hh');if(h)h.setAttribute('aria-expanded',o);const k=String(d.ev);o?histOpen.add(k):histOpen.delete(k)},
  undoEv:d=>undoEv(d.ev),reopen:d=>reopen(d.ev),
  showEnt:d=>{const x=audit.find(a=>a.id==d.ev),e=x&&entries.find(z=>z.id===(x.ids||[])[0]);if(!e){toast('این واریزی دیگر در لیست نیست',true);return}listMode='day';listFilter='all';listQ=e.name;dateVal=e.entryDate;ls.set('m_date',dateVal);go('list')},
  restoreOne:d=>{const b=restoreIds([+d.id]);if(b.length){logA('restore','بازگردانی',b[0].name+' | '+dates(b[0].entryDate).fa,{ids:[b[0].id]});toast('«'+b[0].name+'» به لیست '+dates(b[0].entryDate).fa+' برگشت')}render()},
  restoreAll:()=>{const b=restoreIds(trash.map(t=>t.id));logA('restore','بازگردانی همه',fmt(b.length)+' واریزی',{ids:b.map(z=>z.id)});toast(fmt(b.length)+' واریزی بازگردانده شد');render()},
  purgeOne:d=>askConfirm('برای همیشه حذف شود؟ دیگر قابل بازگردانی نیست.','حذف دائمی',()=>{const x=trash.find(t=>t.id==d.id);trash=trash.filter(t=>t.id!=d.id);saveT();logA('purge','حذف دائمی',x?x.name:'');render()}),
  emptyTrash:()=>askConfirm('سطل بازیابی خالی شود؟ هیچ‌کدام قابل برگشت نیستند.','خالی شود',()=>{const n=trash.length;trash=[];saveT();logA('purge','خالی کردن سطل',fmt(n)+' واریزی');render()}),
  addSrc:()=>{sources.push({id:nid++,name:'منبع جدید',bank:'',limit:0,count:0});saveS();render()},
  delSrc:d=>{const s=sources.find(x=>x.id==d.id);if(!s)return;sheet(`<div class="sh-h"><b>منبع «${esc(s.name)}» حذف شود؟</b></div><div class="muted" style="font-size:13px;margin:-4px 2px 6px">تخصیص‌ها و گزارش‌های قبلی این منبع دست نمی‌خورند.</div><div class="row"><button class="btn sec" data-act="srcBack">انصراف</button><button class="btn red" data-act="delSrcGo" data-id="${s.id}">حذف منبع</button></div>`)},
  lexp:async d=>{txtGen=null;const L=lastList.filter(r=>r.level<2);if(!L.length){toast('ردیف سالمی برای خروجی نیست',true);return}
    const by={};L.forEach(r=>(by[r.entryDate]=by[r.entryDate]||[]).push(r));const ks=Object.keys(by).sort();
    const A={res:ks.map(k=>({src:{name:ks.length>1?dates(k).fa:'لیست '+dates(k).fa,limit:0},items:by[k]})),left:[],excl:[],D:dates(ks.length===1?ks[0]:dateVal)},sc=ks.length>1?'all':'0';
    if(d.a==='cp'){expCtx={A,sc};const ok=await copyText(withCtx(txt));ok?toast('متن کپی شد'):openText();return}openExport(A,sc)},
  expOpen:d=>{openExport(alloc,d.sc);expCtx.track=true},
  expText:()=>openText(),expPdf:()=>{closeSheet();autoTrack();openPrint(()=>withCtx(reportHTML))},
  expXls:()=>{if(typeof XLSX==='undefined')return;closeSheet();autoTrack();save(ctxName()+'.xlsx',withCtx(xlsx),'فایل Excel آماده شد')},
  copyOut:async()=>{const ta=$('tout'),ok=await copyText(ta.value);if(ok){toast('متن کپی شد');setTimeout(autoTrack,900)}else{ta.focus();ta.select();toast('متن انتخاب شد؛ «Copy» را بزنید')}},
  shareOut:async()=>{if(window.AndroidBridge){window.AndroidBridge.share($('tout').value);return}try{await navigator.share({text:$('tout').value})}catch(e){}},
  saveTxt:()=>{autoTrack();save((txtGen?txtName:ctxName())+'.txt','﻿'+(txtGen?txtGen():withCtx(txt)),'فایل متنی آماده شد')},
  pvClose:closePrint,pvPrint:()=>{/* v61.72: آیفون = فایل PDF A5 در منوی اشتراک (چاپ و ذخیره داخلش) */if(isIOS()&&PDFK.html===window.__pv&&pdfShare())return;/* v61.84: اندروید = چاپ همان صفحه‌های PDF */if(window.AndroidBridge&&PDFK.html===window.__pv&&pdfPrintAnd())return;printReport()},pvShareP:async()=>{if(isIOS()&&PDFK.html===window.__pv&&pdfShare())return;if(window.AndroidBridge){/* v61.85: اندروید هرگز به پنجره چاپ نمی‌رود؛ اگر PDF هنوز در حال ساخت است صبر می‌کند */if(PDFK.html===window.__pv&&PDFK.file==null&&PDFK.p)await PDFK.p;if(PDFK.html===window.__pv&&await pdfShareAnd())return;toast('PDF آماده نشد؛ پیش‌نمایش را ببندید و دوباره باز کنید',true);return}const h=window.__pv||'';try{const fl=new File([h],'motalla-report.html',{type:'text/html'});if(navigator.canShare&&navigator.canShare({files:[fl]})){await navigator.share({files:[fl],title:'گزارش مطلا'});return}}catch(e){if(e&&e.name==='AbortError')return}printReport()},
  copySrc:async()=>{txtGen=null;expCtx={A:alloc,sc:String(srcIdx),track:true};const ok=await copyText(withCtx(txt));if(ok){toast('متن «'+srcRows().name+'» کپی شد');setTimeout(autoTrack,900)}else openText()},
  srcView:d=>{srcIdx=d.i;go('srcview')},
  tstyle:d=>{txtStyle=d.s;ls.set('m_txtstyle2',d.s);openText()},
  trackNow:()=>{const b=commitAlloc(alloc,true);if(b){ACT.openBatch({id:b.id});toast(fmt(b.items.length)+' واریزی به پیگیری رفت','','برگرداندن',()=>undoCommit(b.id))}},
  undoCommit:d=>askConfirm('واریزی‌های این لیست به تقسیم برگردند؟','برگردان',()=>undoCommit(+d.id)),
  toSplit:()=>{const k=fPay||todayISO();ACT.arcDay({iso:k});const n=validated().filter(r=>PD(r)===k&&r.level===2&&!r.sentBid).length;if(n)toast(fmt(n)+' واریزی خطادار است؛ بالای صفحه اصلاحشان کنید',true)},
  newList:()=>{closeSheet();startList(todayISO())},
  flowGo:d=>{const s=d.s;if(s==='entry'){editId=null;go('entry')}else if(s==='split')go('split1');else if(s==='track'){const b=openB().find(x=>x.date===dateVal);if(b){ACT.openBatch({id:b.id})}else{trTab='open';go('split1')}}else{if(dayBatches(dateVal).length){ldKey=dateVal;ldX=null;ldOpen=new Set();ldQ='';go('lday')}else{trTab='arch';go('split1')}}},
  archive:()=>go('split1'),
  trTab:d=>{trTab=d.t;render()},
  dTab:d=>{dTab=d.t;render()},dClear:()=>{dQ='';render()},
  credOpen:d=>{credId=+d.id;go('cred')},credNew:()=>startCW(null),credEdit:()=>startCW(credId),credSave:()=>credSave(),
  toDebt:()=>{const e=entries.find(z=>z.id===editId);if(!e)return;const ex=creds.find(c=>c.linkId===e.id);if(ex){credId=ex.id;editId=null;go('cred');return}if(e.sentBid){startCW(null);Object.assign(wz.d,{title:e.title||'',name:e.name,debt:e.amount,iban:(e.iban||'').replace(/^IR/,'')});wz.step=2;render();toast('این واریزی ارسال شده؛ حساب بدون اتصال ساخته می‌شود');return}startCW(null,e.id)},
  cTitle:d=>{dTmp.title=d.t;$('ctl').innerHTML=tChips(d.t,'cTitle')},pTitle:d=>{dTmp.title=d.t;$('ptl').innerHTML=tChips(d.t,'pTitle')},
  pSt:d=>{dTmp.st=d.st;document.querySelectorAll('#sheet .st2 button').forEach(b=>b.classList.toggle('on',b.dataset.st===d.st))},
  payNew:()=>startPW(null),payEdit:d=>startPW(+d.id),paySave:()=>paySave(),
  payDel:()=>askConfirm('این واریز حذف شود؟ مانده دوباره زیاد می‌شود.','حذف',()=>{const c=curC();if(!c)return;const x=c.pays.find(p=>p.id===dTmp.pid);c.pays=c.pays.filter(p=>p.id!==dTmp.pid);c.updatedAt=new Date().toISOString();saveC();syncLink(c);logA('debt','حذف واریز از حساب '+c.name,x?ttlName(x)+' | '+fmt(x.amount):'');if(cur==='pwiz'){wz=null;cur='debt';go('cred')}else render();toast('حذف شد — مانده: '+fmt(cRem(c)))}),
  credDel:()=>askConfirm('حساب بدهی و همه واریزهایش حذف شود؟','حذف',()=>{const c=curC();if(!c)return;c.pays=[];syncLink(c);creds=creds.filter(x=>x.id!==c.id);saveC();logA('debt','حذف حساب بدهی',c.name);go('debt')}),
  credCopy:()=>credCopySheet(),
  wzNext:()=>{const err=wzCheck();if(err){toast(err,true);return}const S=wzSteps();if(wz.ret){wz.step=wz.ret;wz.ret=null}else wz.step=S[Math.min(S.length-1,S.indexOf(wz.step)+1)];render();window.scrollTo(0,0)},
  wzPrev:()=>{if(wz.ret){wz.step=wz.ret;wz.ret=null;render();return}const S=wzSteps(),i=S.indexOf(wz.step);if(i>0&&!(wz.id&&wz.step===4)){wz.step=S[i-1];render();window.scrollTo(0,0)}else{const k=wz.kind,hadId=wz.id;wz=null;go(k==='c'&&!hadId?'debt':'cred')}},
  wzGo:d=>{const s=+d.s;if(s===wz.step)return;if(wz.step===4&&s<4)wz.ret=4;else if(s>wz.step){const err=wzCheck();if(err){toast(err,true);return}}wz.step=s;render();window.scrollTo(0,0)},
  wzPick:d=>{if(d.id==='new'){if(wz.d.linkId)wz.d={title:'',name:'',phone:'',debt:0,iban:'',note:'',linkId:null}}else{const r=entries.find(z=>z.id==d.id),V=validated().find(z=>z.id==d.id);if(r)wz.d={title:r.title||'',name:r.name,phone:'',debt:V?V.amount:r.amount,iban:(r.iban||'').replace(/^IR/,''),note:'',linkId:r.id}}wz.step=2;render();window.scrollTo(0,0)},
  wzTitle:d=>{wz.d.title=d.t;document.querySelectorAll('#view .ttl3 .tch').forEach(b=>b.classList.toggle('on',b.dataset.t===d.t))},
  wzSt:d=>{wz.d.st=d.st;render()},
  wzAmt:d=>{const r=wzRoom(),v=d.p==='2'?Math.round(r/2):r;wz.d.amount=v;const el=document.querySelector('#view input[data-wz=amount]');if(el)el.value=v?v.toLocaleString('en-US'):''},
  wzSave:()=>{if(!wz)return;wz.kind==='c'?wzSaveC():wzSaveP()},
  wzNow:()=>{const n=new Date();wz.d.time=p2(n.getHours())+':'+p2(n.getMinutes());const el=document.querySelector('#view input[data-wz=time]');if(el)el.value=wz.d.time},
  wzImgDel:()=>{wz.img=null;render()},
  wzImgView:()=>{const v=wz.img||wz.imgPrev;if(v)sheet(`<div class="sh-h"><b>عکس فیش</b><button class="x" data-act="close">×</button></div><img src="${v}" class="rcpt" style="max-height:72vh" alt="فیش">`)},
  payOk:d=>{const c=curC();if(!c)return;const x=(c.pays||[]).find(p=>p.id==d.id);if(!x)return;if(+x.amount>cRem(c)){toast('مبلغ از مانده ('+fmt(cRem(c))+') بیشتر است؛ اول مبلغ را ویرایش کنید',true);return}const was=cDone(c);x.st='ok';x.at=new Date().toISOString();if(!x.time){const n=new Date();x.time=p2(n.getHours())+':'+p2(n.getMinutes())}c.updatedAt=x.at;saveC();syncLink(c);logA('debt','تأیید واریز به '+c.name,ttlName(x)+' | '+fmt(x.amount));render();toast(!was&&cDone(c)?'حساب '+c.name+' کامل تسویه شد ✓':'تأیید شد — مانده: '+fmt(cRem(c))+' تومان')},
  payImg:async d=>{const v=await imgGet('pay:'+d.id);if(!v){toast('عکس پیدا نشد',true);return}sheet(`<div class="sh-h"><b>عکس فیش</b><button class="x" data-act="close">×</button></div><img src="${v}" class="rcpt" style="max-height:72vh" alt="فیش">`)},
  credCopyGo:async d=>{const c=curC(),a=num($('ka').value),b=clean($('kb').value),inv=toEn($('ki').value).trim();if(!a){toast('مبلغ را بنویسید',true);return}
    if(d.w){if(!b||!inv){toast('برای ثبت «در انتظار»، نام خریدار و فاکتور لازم است',true);return}c.pays=c.pays||[];c.pays.push({id:nid++,date:todayISO(),by:who(),at:new Date().toISOString(),title:'',name:b,inv,amount:a,st:'wait'});c.updatedAt=new Date().toISOString();saveC();logA('debt','تخصیص به خریدار',b+' → '+c.name+' | '+fmt(a))}
    const t=credCopyText(a,b);closeSheet();render();(await copyText(t))?toast(d.w?'کپی شد و «در انتظار» ثبت شد':'متن حساب کپی شد'):sheet(`<div class="sh-h"><b>متن حساب</b><button class="x" data-act="close">×</button></div><textarea readonly style="min-height:30vh">${esc(t)}</textarea>`)},
  credStmt:async()=>{const c=curC();if(!c)return;const t=credStmt(c);(await copyText(t))?toast('صورت‌حساب کپی شد'):sheet(`<div class="sh-h"><b>صورت‌حساب</b><button class="x" data-act="close">×</button></div><textarea readonly style="min-height:40vh">${esc(t)}</textarea>`)},
  credPdf:()=>credPdf(),
  gFilter:d=>{gF=d.f;$('gres').innerHTML=gHTML()},
  gClear:()=>{gQ='';const q=$('gq');if(q){q.value='';q.focus()}srchSwap('gres','');$('tcont').classList.remove('hide');document.querySelector('#view .sbox .clr').classList.add('hide')},
  openDay:d=>{ldKey=d.iso;ldX=null;ldOpen=new Set();ldQ='';go('lday')},/* v62.3: بایگانی قدیمی → لیست واریز همان روز */
  itOpen:d=>openItem(d.b,d.i),itSave:saveItem,
  itSt:d=>{tmpSt=d.st;itStPaint()},
  itTnClr:()=>{const t=$('itn');if(!t)return;t.value='';if(tmpSt==='ok')tmpSt='pending';itStPaint();t.focus()},
  itFail:()=>{if(tmpSt==='fail'){tmpSt='pending'}else{tmpSt='fail';const t=$('itn');if(t)t.value=''}saveItem()},
  itNow:()=>{const n=new Date(),t=$('itt');if(!t)return;t.value=p2(n.getHours())+':'+p2(n.getMinutes());t.classList.remove('flash');void t.offsetWidth;t.classList.add('flash')},
  itImgDel:()=>{tmpImg=null;$('itimg').innerHTML='';$('itfl').textContent='افزودن عکس رسید'},
  viewImg:d=>viewImg(d.b,d.id),
  closeBatch:()=>{const b=curB();if(!b)return;const p=b.items.filter(x=>x.st==='pending').length;
    const done=()=>{b.closed=new Date().toISOString();saveB();const c=bStat(b);logA('close','ثبت نهایی و بایگانی',dates(b.date).fa+' | موفق '+fmt(c.ok)+' از '+fmt(c.all)+' | '+fmt(c.okSum)+' تومان');ACT.openBatch({id:b.id});toast('لیست در «لیست‌های روزانه» ذخیره شد ✓')};
    p?askConfirm(fmt(p)+' واریزی هنوز «در انتظار» است. با همین وضعیت بایگانی شود؟','بایگانی',done):done()},
  reopenDay:()=>{const bs=dayBatches(dayIso);bs.forEach(b=>delete b.closed);saveB();if(bs[0])ACT.openBatch({id:bs[0].id});toast('برای ویرایش باز شد')},
  dayExp:()=>openDayExport(dayIso),
  dayText:()=>{txtGen=()=>dayTxt(dayIso);txtName=fileBase(dayIso);openText()},
  dayPdf:()=>{closeSheet();openPrint(()=>dayReport(dayIso))},
  dayXls:()=>{if(typeof XLSX==='undefined')return;closeSheet();save(fileBase(dayIso)+'.xlsx',dayXlsx(dayIso),'فایل Excel آماده شد')},
  /* v62.3 (خواسته صاحب اپ): بخش قدیمی «پیگیری/بایگانی» دیگر استفاده نمی‌شود — همه لیست‌ها در «لیست‌های واریز» است؛
     باز کردن یک لیست پیگیری = لیست واریز همان روز (داده‌های قدیمی دست نمی‌خورد) */
  openBatch:d=>{const b=batches.find(x=>String(x.id)===String(d.id));if(!b){go('split1');return}const e=b.items.map(it=>entries.find(z=>z.id===it.id)).find(Boolean);ldKey=e?PD(e):b.date;ldX=null;ldOpen=new Set();ldQ='';go('lday')},
  tkFilter:d=>{tkFilter=d.f;refreshBatch()},tkClear:()=>{tkQ='';refreshBatch()},
  tkSet:d=>{const b=batches.find(x=>x.id===batchId);if(!b)return;const x=b.items[+d.i];x.st=x.st===d.st?'pending':d.st;x.at=new Date().toISOString();saveB();refreshBatch();if(!bStat(b).pending)toast('همه واریزی‌های این لیست بررسی شد ✓')},
  tkAll:d=>{const b=batches.find(x=>x.id===batchId);if(!b)return;b.items.forEach(x=>{if(x.src===d.s&&x.st==='pending')x.st='ok'});saveB();refreshBatch()},
  tkReport:async()=>{const b=batches.find(x=>x.id===batchId);if(!b)return;const t=tkReportText(b);(await copyText(t))?toast('گزارش پیگیری کپی شد'):(expCtx=null,sheet(`<div class="sh-h"><b>گزارش پیگیری</b><button class="x" data-act="close">×</button></div><textarea readonly style="min-height:40vh">${esc(t)}</textarea>`))},
  tkRequeue:()=>{const b=batches.find(x=>x.id===batchId);if(!b)return;const F=b.items.filter(x=>x.st==='fail'&&!x.requeued),t=todayISO();
    askConfirm(fmt(F.length)+' واریزی ناموفق به لیست امروز ('+dates(t).fa+') اضافه شود؟','اضافه شود',()=>{const now=new Date().toISOString(),ids=[];F.forEach(x=>{const id=nid++;ids.push(id);entries.push({id,name:x.name,code:x.code,amount:x.amount,iban:x.iban,card:'',bank:'',entryDate:t,createdBy:who(),updatedBy:who(),updatedAt:now,requeueOf:b.date});x.requeued=true});
      saveE();saveB();logA('requeue','واریز مجدد ناموفق‌ها',fmt(F.length)+' واریزی از '+dates(b.date).fa+' به '+dates(t).fa,{ids});refreshBatch();toast(fmt(F.length)+' واریزی به لیست امروز رفت','', 'مشاهده',()=>{listMode='day';setDate(t,true);go('list')})})},
  tkDel:()=>askConfirm('این لیست پیگیری حذف شود؟ واریزی‌های اصلی دست نمی‌خورند.','حذف',()=>{batches=batches.filter(x=>x.id!==batchId);saveB();go('split1')}),
  srcSet:d=>srcSettings(d.id),
  fTitle:d=>{fTitle=d.t;$('ftl').innerHTML=titleChips()},
  sTitle:d=>{window.__sTitle=d.t;document.querySelectorAll('#stl .tch').forEach(b=>b.classList.toggle('on',b.dataset.t===d.t))},
  setAdd:()=>{if(!num($('fa').value)){toast('اول مبلغ کل را بنویسید',true);$('fa').focus();return}openSettle()},
  setSave:()=>{const name=clean($('sn2').value),amount=num($('sa2').value);if(!name||!amount){toast('نام و مبلغ را بنویسید',true);return}fSet.push({id:nid++,title:window.__sTitle||'',name,phone:toEn($('sp2').value).replace(/[^\d+]/g,''),inv:toEn($('si2').value).trim(),amount,...(window.__sCu?{cuId:window.__sCu}:{}),at:new Date().toISOString()});closeSheet();updSet();toast('واریز مشتری اضافه شد؛ برای ثبت نهایی «ثبت واریزی» را بزنید')},
  setCu:d=>{const I=$('sn2');if(!I)return;if(!d.id){window.__sCu='';I.value='';setSugRe();I.focus();return}const c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;
  window.__sCu=c.id;I.value=cuName(c);const P=$('sp2');if(P&&!P.value&&c.phone)P.value=phShow(c.phone);setSugRe();const n=$('si2');if(n)n.focus()},
  setMem:d=>{const p=SSP[+d.i],I=$('sn2');if(!p||!I)return;window.__sCu='';I.value=p.name;const P=$('sp2');if(P&&!P.value&&p.phone)P.value=phShow(p.phone);$('ssg').innerHTML='';const n=$('si2');if(n)n.focus()},
  setDel:d=>{fSet.splice(+d.i,1);updSet()},
  delEdit:()=>{const id=editId,b=editBack;editId=null;editBack=null;cur=b||'list';delEntry(id)},
  allocNew:()=>allocNew(),allocBack:()=>{allocSheet();recalc()},
  aSrc:d=>{aSt.srcId=+d.id;const s=sources.find(x=>x.id==aSt.srcId)||{};if(s.bank){aSt.bank=s.bank;if(aSt.method!=='manual')aSt.method='bank'}else if(aSt.method==='bank')aSt.method='amount';allocSheet();recalc()},
  aAll:()=>{const q=aSt.q.trim();aPool().filter(x=>!aSt.sel.has(x.id)&&(!q||match(x,q))).forEach(x=>aSt.sel.add(x.id));renderPrev()},
  aNone:()=>{aSt.sel=new Set();renderPrev()},
  aMeth:d=>{aSt.method=d.m;allocSheet();recalc()},aSave:()=>allocSave(),
  partView:d=>{partId=+d.id;partAll=!d.r;partOrd.k='';if(cur==='part'){const v=$('view'),y=v.scrollTop;render();v.scrollTop=y}else go('part')},
  partAllOn:()=>{partAll=true;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y},
  partCopy:async()=>{const p=curPart();if(!p)return;const P=partSel();txtGen=null;expCtx={A:partSelAlloc(),sc:'0',track:true,parts:P.map(z=>z.id)};const ok=await copyText(withCtx(txt));if(ok){toast('متن «'+p.src.name+'»'+(P.length>1?' (همه مراحل)':'')+' کپی شد');setTimeout(()=>{autoTrack();if(cur==='part')render()},900)}else openText()},
  partExp:()=>{const p=curPart();if(!p)return;const P=partSel();openExport(partSelAlloc(),'0');expCtx.track=true;expCtx.parts=P.map(z=>z.id)},
  partsExp:()=>{const P=parts();if(!P.length)return;openExport(partsAlloc(P),P.length>1?'all':'0');expCtx.track=true;expCtx.parts=P.filter(p=>!p.sent).map(p=>p.id)},
  partsSend:async()=>{const P=parts().filter(p=>!p.sent&&pVis(p));if(!P.length)return;txtGen=null;expCtx={A:partsAlloc(P),sc:P.length>1?'all':'0'};const t=withCtx(txt),ok=await copyText(t);const ids=P.map(p=>p.id),b=commitParts(ids,true);
    if(!ok){batchId=b?b.id:null;expCtx={A:partsAlloc(P),sc:P.length>1?'all':'0'};openText();toast('به پیگیری رفت؛ متن را از اینجا کپی کنید');return}
    if(b){ACT.openBatch({id:b.id});toast('متن کپی شد و '+fmt(P.length)+' تخصیص به پیگیری رفت','','برگرداندن',()=>uncommitParts(ids))}},
  partDel:()=>askConfirm('این تخصیص لغو شود؟ واریزی‌هایش به مانده برمی‌گردند.','لغو تخصیص',()=>{const p=curPart();if(p)delPart(p);saveD();if(p)logA('undo','لغو تخصیص',p.src.name);go('lday')}),
  partUnsend:()=>uncommitParts([partId]),
  tkTime:d=>{const b=curB();if(!b)return;const x=b.items[+d.i];if(x.time){openItem(b.id,+d.i);return}const n=new Date();x.time=p2(n.getHours())+':'+p2(n.getMinutes());saveB();refreshBatch();toast('ساعت '+toFa(x.time)+' ثبت شد')},
  saveSrc:d=>{const name=clean($('sn').value),bank=$('sb').value;if(!name){toast('نام منبع را بنویسید',true);return}let s;
    if(d.id==='new'){s={id:nid++,name,bank,limit:0,count:0};sources.push(s)}
    else{s=sources.find(x=>x.id==d.id);if(!s)return;s.name=name;s.bank=bank;
      Object.values(drafts).forEach(P=>(P||[]).forEach(p=>{if(p.src&&p.src.id==s.id){p.src.name=name;p.src.bank=bank;const b=p.bid&&batches.find(x=>x.id===p.bid);if(b&&!b.closed)b.items.forEach(x=>{if(x.pid===p.id)x.src=name})}}));saveD();saveB()}
    saveS();if(aSt&&(d.id==='new'||aSt.srcId==s.id)){aSt.srcId=s.id;if(aSt.method==='bank')aSt.bank=bank||aSt.bank}
    if(!aSt&&!srcRet){closeSheet();render()}else{srcBack();if(!aSt&&cur!=='home')render()}toast('منبع «'+name+'» ذخیره شد')},
  /* ---------- v21 ---------- */
  tkGrp:(d,e)=>{const g=e.target.closest('.tg2');if(!g)return;const o=g.classList.toggle('open');const h=g.querySelector('.tgh2');if(h)h.setAttribute('aria-expanded',o);o?tkOpen.add(d.s):tkOpen.delete(d.s)},
  tkBack:d=>{const b=batches.find(x=>x.id==d.b);if(!b)return;const x=b.items[+d.i];if(!x)return;
    askConfirm('«'+x.name+'» از پیگیری برداشته شود و به تقسیم برگردد؟','برگشت به تقسیم',()=>{const k=b.items.indexOf(x);if(k<0)return;b.items.splice(k,1);const e=entries.find(z=>z.id===x.id);if(e)delete e.sentBid;
      const p=findPart(x.pid);if(p){p.ids=p.ids.filter(id=>id!==x.id);if(!p.ids.length)delPart(p)}
      const empty=!b.items.length;if(empty)batches=batches.filter(z=>z!==b);saveE();saveB();saveD();logA('undo','برگشت به تقسیم',x.name+' | '+fmt(x.amount)+' تومان');
      if(empty)go('split1');else refreshBatch();$('dock').innerHTML=dockHTML();dockInd();toast('«'+x.name+'» به تقسیم برگشت')})},
  tkFixBad:d=>{setDate(d.iso,true);ACT.showBad()},
  xAll:d=>{const P=dayParts();if(!P.length)return;txtGen=null;expCtx={A:partsAlloc(P),sc:P.length>1?'all':'0',track:true,parts:P.filter(p=>!p.sent).map(p=>p.id)};
    if(d.k==='pdf'){autoTrack();openPrint(()=>withCtx(reportHTML));return}
    if(d.k==='txt'){openText();return}
    if(d.k==='xls'){if(typeof XLSX==='undefined')return;autoTrack();save(ctxName()+'.xlsx',withCtx(xlsx),'فایل Excel آماده شد');return}
    expAllGo()},
  expAll:()=>expAllGo(),
  aCnt:d=>{setCnt((aSt.count||0)+(+d.v));paramRefresh();recalc()},
  partEdit:d=>allocEdit(+d.id),
  partDelId:d=>{const p=parts().find(z=>z.id==d.id);if(!p)return;askConfirm('تخصیص «'+p.src.name+'» لغو شود؟ واریزی‌هایش به مانده برمی‌گردند.','لغو تخصیص',()=>{delPart(p);saveD();logA('undo','لغو تخصیص',p.src.name);render();toast('تخصیص «'+p.src.name+'» لغو شد')})},
  srcMgr:()=>srcMgr(),
  srcMgrBack:()=>{srcRet='';if(aSt){allocSheet();recalc()}else closeSheet()},
  srcBack:()=>srcBack(),
  delSrcGo:d=>{const s=sources.find(x=>x.id==d.id);sources=sources.filter(x=>x.id!=d.id);saveS();if(aSt&&aSt.srcId==d.id)aSt.srcId=(sources[0]||{}).id;if(s)logA('undo','حذف منبع',s.name);srcBack();toast('منبع حذف شد')},
  /* ---------- v22 ---------- */
  entMenu:d=>entMenu(d.id),
  cpEnt:d=>{closeSheet();const r=validated().find(x=>x.id==d.id);if(r)cpOut(entTxt(r),'اطلاعات «'+r.name+'» کپی شد')},
  tkCopy:d=>{const b=batches.find(x=>x.id==d.b),x=b&&b.items[+d.i];if(!x)return;cpOut(entTxt({...x,bankShow:x.bank}),'اطلاعات «'+x.name+'» کپی شد')},
  lsOpen:()=>{lsOpen=true;const t=document.querySelector('.ltools');if(t)t.classList.add('sopen');const q=$('lq');if(q)setTimeout(()=>q.focus(),30)},
  lsClose:()=>{lsOpen=false;listQ='';const q=$('lq');if(q){q.value='';q.blur()}const t=document.querySelector('.ltools');if(t)t.classList.remove('sopen');refreshList(true)},
  /* ---------- v28: ورود، حساب و کاربران ---------- */
  authRetry:()=>showAuth(),
  pwToggle:d=>{const i=$(d.t);if(i)i.type=i.type==='password'?'text':'password'},
  authLogin:async()=>{const u=($('au').value||'').trim(),p=$('ap').value||'';if(!u||!p){authErr('نام کاربری و رمز را بنویسید');return}authBusy();
    try{const r=await api('/api/login',{username:u,password:p});loggedIn(r);pwhSet(p)}catch(e){authErr(e.message)}},
  authSetup:async()=>{const n=($('an').value||'').trim(),u=($('au').value||'').trim(),p=$('ap').value||'',p2=$('ap2').value||'';
    if(!n||!u||!p){authErr('همه کادرها را پر کنید');return}if(p!==p2){authErr('تکرار رمز یکسان نیست');return}authBusy();
    try{loggedIn(await api('/api/setup',{name:n,username:u,password:p}))}catch(e){authErr(e.message)}},
  migYes:()=>{closeSheet();startFresh(true)},
  migNo:()=>askConfirm('اطلاعات قبلی این گوشی کنار گذاشته شود و فقط اطلاعات سرور نمایش داده شود؟','بله',()=>startFresh(false)),
  logout:()=>askConfirm('از حساب خارج می‌شوید؟'+(pendN()?' '+toFa(pendN())+' تغییر هنوز به سرور نرسیده و از بین می‌رود.':''),'خروج',async()=>{try{await api('/api/logout',{})}catch(e){}forceLogout()}),
  pwSheet:()=>pwSheet(),
  pwSave:async()=>{const o=$('po').value,a=$('pn1').value,b=$('pn2').value;if(a!==b){toast('تکرار رمز یکسان نیست',true);return}
    try{await api('/api/password',{old:o,password:a});pwhSet(a);closeSheet();toast('رمز عبور عوض شد؛ بقیه دستگاه‌های شما خارج شدند')}catch(e){toast(e.message,true)}},
  backup:async()=>{closeSheet();try{toast('در حال آماده‌سازی پشتیبان…');const j=await api('/api/backup');save('motalla-backup-'+todayISO()+'.txt',JSON.stringify(j,null,1),'فایل پشتیبان آماده شد')}catch(e){toast(e.message,true)}},
  usersLoad:()=>{usersErr='';USERS=null;render();loadUsers()},
  userNew:()=>userNew(),
  userEdit:d=>userEdit(d.id),
  uRole:d=>{const keep=readPerms();uTmp.role=d.r;const pl=$('uperms');if(pl)pl.outerHTML=permList(d.r,d.r==='admin'?[]:(uTmp.staffPerms||(keep.length&&uTmp.prevRole!=='admin'?keep:DEF_STAFF)));uTmp.prevRole=d.r;document.querySelectorAll('#urole button').forEach(b=>b.classList.toggle('on',b.dataset.r===d.r));const h=$('uroleh');if(h)h.textContent=d.r==='admin'?'همه کارها و مدیریت کاربران':'فقط کارهایی که پایین روشن کنید'},
  uGen:()=>{const i=$('upw');if(i){i.value=genPass();i.type='text'}},
  userCreate:async()=>{const n=($('unm').value||'').trim(),u=($('uun').value||'').trim(),p=($('upw').value||'').trim();
    try{const j=await api('/api/users',{name:n,username:u,password:p,role:uTmp.role,perms:readPerms()});USERS=null;loadUsers();credCard(j.user,p)}catch(e){toast(e.message,true)}},
  userSave:async()=>{const b={name:($('unm').value||'').trim(),role:uTmp.role,...(uTmp.role==='admin'?{}:{perms:readPerms()})},p=($('upw').value||'').trim(),ac=$('uact');if(p)b.password=p;if(ac)b.active=ac.checked;
    try{const j=await api('/api/users/'+uTmp.id,b,'PATCH');if(j.user.id===ME.id){ME={...ME,...j.user};rawSet('m_me',ME);user=ME.name;applyPerms()}
      USERS=(USERS||[]).map(x=>x.id===j.user.id?j.user:x);closeSheet();render();toast(p?'ذخیره شد — رمز جدید: '+p:'ذخیره شد')}catch(e){toast(e.message,true)}},
  userDel:()=>{const u=(USERS||[]).find(x=>x.id===uTmp.id);if(!u)return;askConfirm('حساب «'+u.name+'» حذف شود؟ ثبت‌های قبلی او باقی می‌ماند.','حذف حساب',async()=>{try{await api('/api/users/'+u.id,undefined,'DELETE');USERS=USERS.filter(x=>x.id!==u.id);render();toast('حساب حذف شد')}catch(e){toast(e.message,true)}})},
  credCopyU:async d=>{const t='مطلا | ورود به بده بستون\n'+d.n+'\nآدرس: '+appURL()+'\nنام کاربری: '+d.u+'\nرمز عبور: '+d.p;(await copyText(t))?toast('کپی شد؛ برای همکارتان بفرستید'):(txtGen=()=>t,txtName='motalla-login',openText())},
};
for(const k in PERM_OF){const f=ACT[k];if(typeof f!=='function')continue;ACT[k]=function(d,...r){if(canAct(k,d))return f.call(this,d,...r);
  const p=permFor(k,d),L=p==='admin'?'مدیریت':(PERMS.find(x=>x[0]===p)||[,''])[1];toast('دسترسی «'+L+'» برای حساب شما فعال نیست؛ از مدیر بخواهید',true)}}
ACT.homeSt=d=>{homeSt=d.t;ls.set('m_homest',homeSt);const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.dayGrp=(d,e)=>{const g=e.target.closest('.tg2');if(!g)return;const o=g.classList.toggle('open');const h=g.querySelector('.tgh2');if(h)h.setAttribute('aria-expanded',o);o?dayOpen.add(d.s):dayOpen.delete(d.s)};
ACT.settings=()=>go('settings');
ACT.setTheme=d=>{const ch=themePref!==d.t;themePref=d.t;ls.set('m_theme',themePref);applyTheme();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;
  if(ch&&IOS_SA)toast('برای هم‌رنگ شدن نوار بالا، برنامه را یک بار کامل ببندید و باز کنید');};
ACT.applyUpd=()=>applyUpd();
ACT.homeP=d=>{const k=d.iso||'';if(homePick&&homeP===k){homePick=false}else{homeP=k;homePick=true}homeF='all';if(homeP<dateVal)homeOpen.add('p'+homeP);const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.hpTog=d=>{const k='p'+d.iso;if(d.iso<dateVal){homeOpen.has(k)?homeOpen.delete(k):homeOpen.add(k)}homeP=d.iso;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.homeF=d=>{homeF=homeF===d.f?'all':d.f;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y};
ACT.bTog=(d,e)=>{const r=e.target.closest('.brw');if(!r)return;const o=r.classList.toggle('open'),h=r.querySelector('.brh');if(h)h.setAttribute('aria-expanded',o);o?homeOpen.add(String(d.id)):homeOpen.delete(String(d.id))};
ACT.hsearch=()=>go('find');
ACT.arcGo=()=>go('split1');
/* انتقال به منبع دیگر — از هر جا (خانه، جستجو، لیست، منبع). واریزی تخصیص‌نیافته هم با همین کار به منبع داده می‌شود. */
function moveTo(ids,fromP,src,toP){const P=parts(),sent=!!(fromP&&fromP.sent);let to=toP&&toP!=='new'?toP:null;
  if(!to&&toP!=='new')to=P.find(z=>z!==fromP&&!!z.sent===sent&&(!sent||z.bid===fromP.bid)&&String(z.src.id)===String(src.id));
  if(!to){to={id:nid++,src:{id:src.id,name:src.name,bank:src.bank||'',limit:0},method:'manual',param:{},ids:[],sent,at:new Date().toISOString()};if(sent)to.bid=fromP.bid;addPart(to)}
  ids.forEach(id=>{if(fromP)fromP.ids=fromP.ids.filter(z=>z!==id);if(!to.ids.includes(id))to.ids.push(id);if(sent){const b=batches.find(x=>x.id===fromP.bid),it=b&&b.items.find(x=>x.id===id);if(it){it.src=src.name;it.pid=to.id}}});
  if(fromP&&!fromP.ids.length)delPart(fromP);saveD();saveB();alloc=null;logA('split',fromP?'انتقال به منبع دیگر':'تخصیص به منبع',fmt(ids.length)+' واریزی | '+(fromP?fromP.src.name+' ← ':'')+src.name);return to}
let mvIds=[],mvFrom=null;
function moveSheet(ids,title,fromP){mvIds=ids;mvFrom=fromP?fromP.id:null;const p=fromP,L=sources.filter(x=>!p||String(x.id)!==String(p.src.id));
  /* v60.2: یک واریزی که هنوز ارسال نشده → همین‌جا «پرداخت از چند منبع» (بخشی از ملت، بخشی از ملی و…) */
  const one=ids.length===1?validated().find(r=>String(r.id)===String(ids[0])):null,F1=one?famOf(one):[],canPs=one&&can('split')&&!one.full&&one.level<2&&sources.length>1&&!F1.some(r=>r.sentBid);
  sheet(`<div class="sh-h"><div><b>${p?'انتقال به منبع دیگر':'تخصیص به منبع'}</b><small class="shsub">${esc(title)}</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  ${canPs?`<button class="acrow mvps" data-act="paySplit" data-id="${one.id}"><span class="bkb lg mvpsi">${ic('split')}</span><span class="tx"><b>${F1.length>1?'تغییر پرداخت از '+toFa(F1.length)+' منبع':'پرداخت از چند منبع'}</b><small>بخشی از یک بانک، بخشی از بانک دیگر؛ هر بخش جدا ارسال و پیگیری می‌شود</small></span>${ic('back').replace('class="i"','class="i flip"')}</button><div class="mvor"><span>یا همه مبلغ از یک منبع</span></div>`:''}
  ${L.length?`<div class="mvl">${L.map(x=>{const bk=acBank(x),inDay=parts().filter(z=>String(z.src.id)===String(x.id)),n=inDay.reduce((s2,z)=>s2+z.ids.length,0);const ok=inDay.filter(z=>!!z.sent===!!(p&&p.sent));return `<div class="mvs"><button class="acrow" data-act="mvGo" data-s="${x.id}">${bk?bankBadge(bk,'lg'):`<span class="bkb lg" style="--bc:#64748b">${esc(userInit(x.name))}</span>`}<span class="tx"><b>${esc(x.name)}</b><small>${esc(bk?'بانک '+bk:'بانک نامشخص')}${n?'، '+fmt(n)+' واریزی در این لیست':''}${inDay.length>1?'، '+toFa(inDay.length)+' مرحله':''}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>${inDay.length>1||(inDay.length&&ok.length<inDay.length)?`<div class="mvr">${inDay.map((z,k)=>ok.includes(z)?`<button class="tch" data-act="mvGo" data-s="${x.id}" data-p="${z.id}">مرحله ${toFa(k+1)} <i>${toFa(z.ids.length)}</i></button>`:`<span class="tch dis">مرحله ${toFa(k+1)} · ${z.sent?'ارسال شده':'ارسال نشده'}</span>`).join('')}<button class="tch nw" data-act="mvGo" data-s="${x.id}" data-p="new">+ مرحله جدید</button></div>`:''}</div>`}).join('')}</div>`:'<div class="xnone">منبع دیگری نیست.</div>'}${can('src')?`<button class="acrow mvnew" data-act="mvNew"><span class="bkb lg" style="--bc:var(--blu)">+</span><span class="tx"><b>تعریف منبع جدید</b><small>حساب بانکی دیگری که از آن برداشت می‌شود</small></span></button>`:''}`)}
ACT.entMove=d=>{const x=validated().find(r=>String(r.id)===String(d.id));if(!x)return;if(x.full){toast('این واریزی کامل با مشتری تسویه شده است',true);return}ldKey=PD(x);
  const own=parts().find(z=>z.ids.some(i=>String(i)===String(x.id)));if(own)partId=own.id;
  if(x.sentBid&&!own){const q=entBI(x);if(!q||q.b.closed){toast('لیست این واریزی بایگانی شده است',true);return}}
  else if(x.level===2&&!own){toast('اول خطای این واریزی را اصلاح کنید',true);return}
  moveSheet([x.id],fullName(x)+'، '+fmt(x.amount)+' تومان',own)};
ACT.partMoveAll=()=>{const p=curPart();if(!p)return;moveSheet(p.ids.slice(),'همه '+fmt(p.ids.length)+' واریزی «'+p.src.name+'»',p)};
ACT.aNewSrc=()=>{const st=aSt;ACT.acNew();acTmp.after=src=>{aSt=st;aSt.srcId=src.id;allocSheet();recalc()}};
ACT.mvNew=()=>{const ids=mvIds.slice(),fr=mvFrom;ACT.acNew();acTmp.after=src=>{mvIds=ids;mvFrom=fr;ACT.mvGo({s:src.id})}};
ACT.mvGo=d=>{const p=mvFrom!=null?findPart(mvFrom):null,src=sources.find(x=>String(x.id)===String(d.s));if(!src)return;const ids=mvIds.slice();closeSheet();
  if(!p){const x=validated().find(r=>r.id===ids[0]),q=x&&x.sentBid?entBI(x):null;
    if(q){const old=q.it.src;q.it.src=src.name;saveB();logA('split','انتقال به منبع دیگر',fullName(x)+' | '+old+' ← '+src.name);const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast('«'+fullName(x)+'» به «'+src.name+'» منتقل شد');return}}
  const tp=d.p==='new'?'new':d.p?parts().find(z=>String(z.id)===String(d.p)):null;const to=moveTo(ids,p,src,tp);
  if(p&&!p.ids.length)partId=to.id;const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;
  toast(fmt(ids.length)+' واریزی '+(p?'به «'+src.name+'» منتقل شد':'به «'+src.name+'» تخصیص یافت'+(to.sent?'':' · آماده ارسال')),'', 'برگرداندن',()=>{if(p){if(!allParts().includes(p))addPart(p,p.pay||ldKey);moveTo(ids,to,p.src,p);partId=p.id}else{to.ids=to.ids.filter(z=>!ids.includes(z));if(!to.ids.length)delPart(to);saveD()}render()})};
ACT.trkDay=d=>{setDate(d.iso,true);go('split1')};
ACT.entTkQ=d=>{const e=entries.find(y=>String(y.id)===String(d.id));if(!e)return;const q=entBI(e);if(!q||q.b.closed){toast('لیست این واریزی بسته شده است',true);return}q.it.st=q.it.st===d.st?'pending':d.st;q.it.at=new Date().toISOString();saveB();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;if(!bStat(q.b).pending)toast('همه واریزی‌های این لیست بررسی شد؛ می‌توانید بایگانی کنید')};
ACT.trkArch=()=>{const b=batches.find(x=>x.date===dateVal&&!x.closed);if(!b)return;const c=bStat(b);
  const done=async()=>{b.closed=new Date().toISOString();b.arch={ok:c.ok,fail:c.fail,pending:c.pending,all:c.all,okSum:c.okSum||0,by:who()};saveB();logA('close','ثبت نهایی و بایگانی',dates(b.date).fa+' | موفق '+fmt(c.ok)+' از '+fmt(c.all)+' | '+fmt(c.okSum||0)+' تومان');dayIso=b.date;render();toast('بایگانی شد؛ خروجی آماده است');try{openPrint(await dayReport(b.date))}catch(e){}};
  c.pending?askConfirm(fmt(c.pending)+' واریزی هنوز «در انتظار» است. با همین وضعیت بایگانی شود؟','بایگانی',done):done()};
ACT.trkGo=()=>{const ob=openB(),b=ob.find(x=>x.date===dateVal)||(ob.length===1?ob[0]:null);if(b)ACT.openBatch({id:b.id});else go('split1')};
ACT.partOkAll=()=>{const p=curPart();if(!p||!p.sent)return;const b=batches.find(x=>x.id===p.bid);if(!b||b.closed){toast('لیست این منبع بسته شده است',true);return}const L=b.items.filter(x=>x.pid===p.id&&x.st==='pending');if(!L.length)return;const now=new Date().toISOString();L.forEach(x=>{x.st='ok';x.at=now});saveB();const v=$('view'),y=v.scrollTop;render();v.scrollTop=y;toast(fmt(L.length)+' واریز تسویه شد','', 'برگرداندن',()=>{L.forEach(x=>x.st='pending');saveB();render()})};
