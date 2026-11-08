/* ============ v79.8 (خواسته صاحب اپ: «در تاریخچه همه اطلاعاتی که هر کاربر وارد می‌کند، هر نوع عملیاتی») ============
   تور ایمنی تاریخچه: هر کار کاربر (زدن یک دکمه data-act یا عوض کردن یک فیلد) که اطلاعات همگام‌شده را عوض کند
   (واریزی، حساب مشتری و سند، بانک، لیست، تخصیص، سطل بازیابی، حساب بدهی) ولی خودش ردیف تاریخچه ننوشته باشد،
   یک ردیف خودکار می‌گیرد: چه دکمه‌ای، در کدام صفحه/پنجره، و کدام رکوردها (با پیوند به همان رکورد). کارهایی که
   ردیف دقیق خودشان را می‌نویسند (logA) دست نمی‌خورند. تغییرهای رسیده از همکاران و کارهای خودکار پس‌زمینه به کسی نسبت داده نمی‌شوند.
   روش: آخرین متن هر رکورد (AUDL) نگه داشته می‌شود؛ هر ذخیره (ls.set یک مجموعه همگام) با آن مقایسه می‌شود. */
const AUDL={};let AUDC=null;
const audColl=()=>Object.keys(SYNC).filter(c=>c!=='audit');
function audPrime(cs){for(const c of cs||audColl()){const M=new Map();for(const r of SYNC[c].get()||[])if(r&&r.id!=null)M.set(String(r.id),sj(r));AUDL[c]=M}}
function audNote(c){if(c==='audit'||!SYNC[c])return;const M=AUDL[c];if(!M){audPrime([c]);return}const seen=new Set(),ch=[];
  for(const r of SYNC[c].get()||[]){if(!r||r.id==null)continue;const id=String(r.id),j=sj(r);seen.add(id);const o=M.get(id);if(o!==j){ch.push([id,o==null?'n':'e',r]);M.set(id,j)}}
  for(const id of [...M.keys()])if(!seen.has(id)){let o=null;try{o=JSON.parse(M.get(id))}catch(e){}ch.push([id,'d',o]);M.delete(id)}
  if(AUDC&&ch.length){for(const x of ch)AUDC.k.set(c+'|'+x[0],[c,...x]);clearTimeout(AUDC.t);AUDC.t=setTimeout(audEnd,1500)}}
function audStart(label){audEnd();const S=$('ov')&&!$('ov').classList.contains('hide')&&document.querySelector('#sheet .sh-h b');
  AUDC={label:clean(String(label||'')).slice(0,40),where:clean(S?S.textContent:(TITLES[cur]||'')).slice(0,40),k:new Map(),t:0,t0:Date.now()};window.__audx=AUDC;
  /* کاری که تا ۱٫۲ ثانیه چیزی را عوض نکند (مثلاً رفتن به صفحه دیگر) بسته می‌شود؛ هر تغییر پنجره را ۱٫۵ ثانیه باز نگه می‌دارد */
  AUDC.t=setTimeout(audEnd,1200)}
/* ذخیره‌های خودکار پس‌زمینه (مثلاً شماره مشتری) به کاربر نسبت داده نمی‌شوند */
function audBg(f){window.__audbg=(window.__audbg||0)+1;try{return f()}finally{window.__audbg--}}
const audName=(c,r)=>{if(!r)return '';try{if(c==='entries')return (typeof fullName==='function'?fullName(r):r.name||'')+(+r.amount?' '+fmt(+r.amount):'');if(c==='custs')return r.sys?'تنظیمات':cuName(r);if(c==='sources')return r.name||'';if(c==='batches')return 'لیست '+dates(r.pay||r.date).fa;if(c==='drafts')return 'تخصیص';if(c==='trash')return r.name||'سطل بازیابی';if(c==='creds')return r.name||''}catch(e){}return ''};
const AUDCN={entries:'واریزی',custs:'حساب مشتری',sources:'حساب بانکی',batches:'لیست ارسال',drafts:'تخصیص',trash:'سطل بازیابی',creds:'حساب بدهی'};
function audEnd(){const A=AUDC;if(!A)return;AUDC=null;if(window.__audx===A)window.__audx=null;clearTimeout(A.t);if(A.logged||!A.k.size||!ME)return;
  const L=[...A.k.values()],cs=[...new Set(L.map(x=>x[0]))],main=cs[0],kinds=new Set(L.filter(x=>x[0]===main).map(x=>x[2])),sysOnly=main==='custs'&&L.filter(x=>x[0]==='custs').every(x=>x[3]&&x[3].sys);
  const type=main==='entries'?(kinds.has('d')?'del':kinds.has('n')?'add':'edit'):sysOnly?'edit':main==='custs'?'cust':main==='sources'?'src':kinds.has('d')?'del':'edit';
  const what=sysOnly&&cs.length===1?'فهرست کالا و تنظیمات':cs.map(c=>AUDCN[c]||c).join('، '),names=sysOnly?[]:[...new Set(L.map(x=>audName(x[0],x[3])).filter(Boolean))];
  const verb=kinds.has('d')&&kinds.size===1?'حذف':kinds.has('n')&&kinds.size===1?'ثبت':'تغییر';
  const ids=L.filter(x=>x[0]==='entries'&&x[2]!=='d').map(x=>+x[1]||x[1]),cu=L.find(x=>x[0]==='custs'&&x[3]&&!x[3].sys);
  logA(type,(main==='custs'&&!sysOnly?'حساب مشتری · ':'')+(A.label?'«'+A.label+'»':verb+' '+what)+(A.where?' · '+A.where:''),[verb+' '+what+(L.length>1&&!sysOnly?' ('+fmt(L.length)+' مورد)':''),...names.slice(0,6)].join(' | '),{auto:1,...(ids.length?{ids:ids.slice(0,20)}:{}),...(cu?{cu:cu[1]}:{})})}
/* شروع یک «کار کاربر»: زدن دکمه، یا تغییر یک فیلد داخل صفحه/پنجره (یادداشت، مبلغ…) */
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||t.disabled)return;const a=t.dataset.act;if(a==='close'||a==='back')return;
  audStart((t.getAttribute('aria-label')||t.innerText||t.title||a).split('\n')[0])},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#view,#sheet,#act'))return;if(AUDC&&Date.now()-AUDC.t0<4000)return;
  const lb=(t.id&&document.querySelector('label[for="'+t.id+'"]'))||t.closest('.ef,.f,.f6r,label');audStart(lb?lb.textContent.split('\n')[0]:(t.placeholder||'ویرایش فیلد'))},true);
setTimeout(()=>{try{(window.requestIdleCallback||setTimeout)(()=>audPrime())}catch(e){}},1500);
