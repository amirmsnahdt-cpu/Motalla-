/* ============ v82.1 (خواسته صاحب اپ: «قسمت بانک پیچیده است؛ مثل سند مشتری ساده و روان؛ وقتی سند می‌خورد خودکار در بانک بخورد») ============
   - ثبت خودکار از قبل هست (حواله و نقد سندها، کارتخوان فردا، واریزی‌های ارسال‌شده)؛ حالا در گردش حساب با برچسب «خودکار» دیده می‌شود.
   - صفحه حساب: دو کارت بزرگ «واریز به حساب / برداشت از حساب» برداشته شد؛ تنها راه سند دستی «+» است (سند بانکی با برداشت، واریز، …).
     جایش یک خط راهنمای کوچک (bkHowHTML).
   - صفحه بانک‌ها: دو دکمه کار روزانه زیر جستجو — «تطبیق موجودی‌ها» (همه حساب‌ها در یک پنجره: موجودی اپ بانک را بنویسید،
     اختلاف همان لحظه، «ثبت همه») و «کارتخوان امشب» (posNight). */
function bkHowHTML(s){return can('src')?`<div class="bkhow">${ic('swap')}<span>${s.cash?'دریافت و پرداخت نقد سندها':'حواله‌های سندها، کارتخوان و واریزی‌های ارسال‌شده'} <b>خودکار</b> اینجا می‌نشیند · برای برداشت یا واریز دستی <b>+</b> بالا را بزنید</span></div>`:''}
let BRC=null;
ACT.bkRec=()=>{if(!can('src'))return;BRC={};sheet(bkRecHTML());bkRecBind();const i=document.querySelector('#sheet .brcin');if(i)sheetFocus(i)};
function bkRecHTML(){const L=ownLC();
  return `<div class="sh-h"><div><b>تطبیق موجودی‌ها</b><small class="shsub">موجودی هر حساب را از اپ بانک بنویسید؛ خالی = بدون تغییر</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="brcl">${L.map(s=>{const bk=acBank(s),e=acEst(s),v=BRC[s.id];return `<label class="brcr" data-id="${esc(s.id)}"><span class="brca">${bk?bankBadge(bk):s.cash?ic('cash'):esc(userInit(s.name))}</span><span class="brct"><b>${esc(s.name)}</b><small>${e==null?'مانده قبلی ثبت نشده':'برنامه: '+(e<0?'−':'')+fmt(Math.abs(e))}</small><em class="brcd" id="brcd${esc(s.id)}">${bkRecDiff(s,v)}</em></span><input class="brcin ltr" inputmode="numeric" autocomplete="off" placeholder="موجودی اپ" value="${v?Number(v).toLocaleString('en-US'):''}" data-id="${esc(s.id)}"></label>`}).join('')}</div>
  <button class="xgo" data-act="bkRecSave">${ic('check')} ثبت همه</button>`}
function bkRecDiff(s,v){if(!v)return '';const e=acEst(s);if(e==null)return '<i class="nw">مانده اولیه ثبت می‌شود</i>';const d=v-e;return d?`<i class="${d>0?'up':'dn'}">اختلاف ${d>0?'+':'−'}${fmt(Math.abs(d))}</i>`:'<i class="ok">برابر ✓</i>'}
function bkRecBind(){document.querySelectorAll('#sheet .brcin').forEach(I=>{I.oninput=()=>{const v=num(I.value);I.value=v?v.toLocaleString('en-US'):'';const s=sources.find(z=>String(z.id)===String(I.dataset.id));if(!s)return;if(v)BRC[s.id]=v;else delete BRC[s.id];const d=$('brcd'+s.id);if(d)d.innerHTML=bkRecDiff(s,v)};
  I.onkeydown=e=>{if(e.key!=='Enter')return;e.preventDefault();const A=[...document.querySelectorAll('#sheet .brcin')],k=A.indexOf(I);if(A[k+1])A[k+1].focus();else I.blur()}})}
ACT.bkRecSave=()=>{if(!BRC)return;const now=new Date().toISOString(),by=who(),done=[];
  for(const [id,v] of Object.entries(BRC)){const s=sources.find(z=>String(z.id)===String(id));if(!s||!v)continue;const first=s.bal==null,old=first?null:acEst(s);
    if(!first)(s.balH=s.balH||[]).push({bal:s.bal,balAt:s.balAt,by:s.balBy||''});s.bal=v;s.balAt=now;s.balBy=by;delete s.balEd;s.updatedAt=now;done.push(s.name+' '+fmt(v)+(old!=null&&old!==v?' (برنامه '+fmt(old)+')':''))}
  if(!done.length){toast('موجودی هیچ حسابی نوشته نشده',true);const i=document.querySelector('#sheet .brcin');if(i)i.focus();return}
  saveS();logA('src','تطبیق موجودی حساب‌ها',done.join(' | '));BRC=null;closeSheet();render();toast(toFa(done.length)+' حساب تطبیق داده شد')};
/* ===== v82.3 (خواسته صاحب اپ: «ردیف‌های خودکار ویرایش و حذف نمی‌شوند؛ حواله دوطرفه از حساب بانک ویرایش/حذف شود؛ جستجو، PDF و Excel مثل حساب مشتری») =====
   - ردیف حواله/نقد/کارتخوان سندها: کشیدن = «ویرایش» (همان سند برای ویرایش باز می‌شود) و «حذف» (همان ردیف پرداخت از سند برداشته می‌شود و سند با همان
     شماره دوباره ثبت می‌شود → از حساب مشتری و حساب بانک هر دو برداشته می‌شود؛ دوطرفه).
   - ردیف واریزی ارسال‌شده: «باز کردن» (صفحه واریزی) و «برگرداندن» (از ارسال برمی‌گردد به تخصیص — همان entUnsend با همان قفل‌ها).
   - نوار جستجو + بازه تاریخ (همان بازه‌های آماده صورتحساب مشتری) + PDF + Excel روی گردش حساب بانک (BKS). */
const bkDocSw=(c,t,o)=>({r:[['bkPayEd','ویرایش','edit','#3b6fd6']],l:[['bkPayDel','حذف','trash','#d23c48']],data:{cu:c.id,tx:t.id,i:o.i!=null?o.i:'',pm:o.pm||'',ch:o.ch||'',a:o.a||''}});
const bkEntSw=x=>({r:[['openEnt','باز کردن','edit','#3b6fd6']],l:[['entUnsend','برگرداندن','undo','#d23c48']],data:{id:x.id}});
const bkTx=d=>{const c=custs.find(z=>String(z.id)===String(d.cu)),t=c&&(c.txs||[]).find(z=>String(z.id)===String(d.tx)&&!z.del);return c&&t?{c,t}:null};
ACT.bkPayEd=d=>{const X=bkTx(d);if(!X){toast('سند پیدا نشد',true);return}if(X.t.bd){bdGoTx(X.t,'ویرایش');return}custId=X.c.id;invV={cu:X.c.id,tx:X.t.id};PARENT.inv='bank';go('inv');setTimeout(()=>{if(cur==='inv')ACT.invEdit()},60)};
ACT.bkPayDel=d=>{const X=bkTx(d);if(!X){toast('سند پیدا نشد',true);return}const {c,t}=X;if(t.bd){bdGoTx(t,'حذف');return}
  const P=t.pays||[],i=d.i!==''&&d.i!=null?+d.i:P.findIndex(p=>p.m===d.pm&&String(p.chId)===String(d.ch)&&Math.abs(+p.amount)===Math.abs(+d.a));const p=P[i];if(!p){toast('این ردیف در سند پیدا نشد',true);return}
  if(p.m==='wd'){toast('این ردیف از تأیید واریزی آمده؛ از خود واریزی برگردانید',true);return}
  askConfirm(`${pyLab(p)} ${fmt(Math.abs(pAmt(p)))} تومان از ${invTitle(t)} «${cuName(c)}» حذف شود؟\nاز حساب مشتری و همین حساب هر دو برداشته می‌شود؛ سند با همان شماره می‌ماند.`,'حذف',()=>{
    const keep=sv;let ok=false;try{sv=invSv(c,t);sv.pays.splice(i,1);svCommit();ok=true}catch(e){toast('حذف نشد: '+e.message,true)}finally{sv=keep}
    if(!ok)return;logA('cust','حذف ردیف پرداخت از حساب بانک',cuName(c)+' | '+invTitle(t)+' | '+pyLab(p)+' '+fmt(Math.abs(pAmt(p)))+' تومان');closeSheet();render();toast('از سند و حساب بانک برداشته شد')})};
/* ----- جستجو، بازه، PDF، Excel ----- */
let BKS={sid:'',q:'',f:'',t:''};
const bkSF=s=>{if(BKS.sid!==String(s.id))BKS={sid:String(s.id),q:'',f:'',t:''};return BKS};
const bkRowTx=r=>{const d=document.createElement('div');d.innerHTML=r.h||'';const b=d.querySelector('.tx b'),sm=d.querySelector('.tx small'),v=d.querySelector('.txv small');return {t:b?b.textContent.replace(/^\s*خودکار\s*/,'').trim():'',s:sm?sm.textContent.trim():'',st:v?v.textContent.trim():'',auto:!!d.querySelector('.autg')}};
function bkFilt(s,R){const F=bkSF(s),q=nzName(toEn(clean(F.q||'')));if(!q&&!F.f&&!F.t)return R;
  return R.filter(r=>{if(r.f==='mark')return !q;const d=r.d||'';if(F.f&&d&&d<F.f)return false;if(F.t&&d&&d>F.t)return false;if(!q)return true;const x=bkRowTx(r);return nzName(toEn(x.t+' '+x.s+' '+x.st+' '+String(Math.abs(r.a||0)))).includes(q)})}
function bkSLab(){const F=BKS;if(!F.f&&!F.t)return 'بازه';const o=stmQk().find(o=>o[2]===F.f&&o[3]===F.t);return o?o[1]:'بازه'}
function bkSBar(s){const F=bkSF(s),n=F.f||F.t;return `<div class="stmbar"><div class="fsearch stms2">${ic('search')}<input id="bkSQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="جستجو در گردش حساب…" value="${esc(F.q)}">${F.q?`<button type="button" class="x" data-act="bkSQClr" aria-label="پاک کردن جستجو">×</button>`:''}<button type="button" class="cufbtn${n?' on':''}" data-act="bkSR" aria-label="بازه تاریخ">${ic('cal')}<span>${esc(bkSLab())}</span></button></div><button type="button" class="stme" data-act="bkPdf" aria-label="صورتحساب PDF">${ic('paste')}<span>PDF</span></button><button type="button" class="stme" data-act="bkXls" aria-label="صورتحساب Excel">${ic('list')}<span>Excel</span></button></div>`}
function bkSRe(bar){const s=curBk();if(!s||cur!=='bank')return;const L=$('acLW');if(L){const m=typeof flipSnap==='function'?flipSnap(L):null;L.innerHTML=acListHTML(s,acRows(s));if(m)flipPlay(L,m)}if(bar){const B=$('bkSB');if(B)B.innerHTML=bkSBar(s)}}
document.addEventListener('input',e=>{const I=e.target;if(!I||I.id!=='bkSQ')return;clearTimeout(I._t);I._t=setTimeout(()=>{BKS.q=I.value;bkSRe(false)},160)});
ACT.bkSQClr=()=>{BKS.q='';bkSRe(true)};
ACT.bkSR=(d,e)=>{const T=e&&e.target&&e.target.closest('.cufbtn');popMenu(T,stmQk().map(o=>['bkSRp',ic(o[2]===BKS.f&&o[3]===BKS.t?'check':'cal'),o[1],{k:o[0]}]))};
ACT.bkSRp=d=>{const o=stmQk().find(x=>x[0]===d.k);if(!o)return;BKS.f=o[2];BKS.t=o[3];bkSRe(true)};
function bkStRows(s){const R=bkFilt(s,acRows(s)).filter(r=>r.f!=='mark'&&!r.res);return R.slice().sort((a,b)=>String(a.d||'').localeCompare(String(b.d||''))||String(a.at||'').localeCompare(String(b.at||''))).map(r=>({...bkRowTx(r),d:r.d,a:+r.a||0,way:!!r.way,old:!!r.old}))}
const bkFile=s=>('گردش حساب '+s.name+' ('+(BKS.f||BKS.t?stmPer({F:BKS}):toFa(dates().fa))+')').replace(/[\\/:*?"<>|]/g,'-');
ACT.bkPdf=()=>{const s=curBk();if(!s)return;const L=bkStRows(s);if(!L.length){toast('ردیفی برای این جستجو نیست',true);return}openPrint(()=>bkPdfHTML(s,L))};
function bkPdfHTML(s,L){const m=acSum(s),bk=acBank(s),inn=L.filter(r=>r.a>0).reduce((t,r)=>t+r.a,0),out=L.filter(r=>r.a<0).reduce((t,r)=>t-r.a,0),per=BKS.f||BKS.t?stmPer({F:BKS}):'';
  const html=`<section class="pg">${pdfTop('گردش حساب بانک',dates())}<h1>${esc(s.name)}</h1><div class="sub">${bk?'<span class="rg">بانک '+esc(bk)+'</span>':''}${s.iban?'<span class="rg">شبا '+esc(toFa(s.iban))+'</span>':''}<span class="rg">${fmt(L.length)} ردیف</span>${per?'<span class="rg">'+esc(per)+'</span>':''}${BKS.q?'<span class="rg">جستجو: '+esc(BKS.q)+'</span>':''}</div>
  <div class="kcs"><div class="kc"><div class="kh">مانده نهایی</div><div class="kv"><bdi>${m.known?(m.fin<0?'−':'')+fmt(Math.abs(m.fin)):'—'}</bdi><u>تومان</u></div></div><div class="kc c"><div class="kh">جمع واریز این فهرست</div><div class="kv"><bdi>${fmt(inn)}</bdi><u>تومان</u></div></div><div class="kc d"><div class="kh">جمع برداشت این فهرست</div><div class="kv"><bdi>${fmt(out)}</bdi><u>تومان</u></div></div></div>
  <table class="bkt"><thead><tr><th>#</th><th>تاریخ</th><th class="ds">شرح</th><th>واریز</th><th>برداشت</th><th>وضعیت</th></tr></thead><tbody>${L.map((r,i)=>`<tr><td class="n">${fmt(i+1)}</td><td class="dt">${esc(dates(r.d).fa)}</td><td class="ds"><b>${esc(r.t)}</b>${r.auto?' <i class="ag">خودکار</i>':''}<span>${esc(r.s)}</span></td><td class="am bl">${r.a>0?fmt(r.a):'—'}</td><td class="am rd">${r.a<0?fmt(-r.a):'—'}</td><td class="st">${esc(r.st)}</td></tr>`).join('')}</tbody>
  <tfoot><tr><td colspan="3">جمع</td><td class="am bl">${fmt(inn)}</td><td class="am rd">${fmt(out)}</td><td></td></tr></tfoot></table>${pdfFoot()}</section>`;
  const css=`.kcs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 10px}.kc{border-radius:12px;padding:8px 11px;background:#f7f8fa}.kc.c{background:#f2f6ff}.kc.d{background:#fff4f5}.kh{font-size:7.4pt;color:#6b7280;font-weight:700}.kv{display:flex;align-items:baseline;gap:4px}.kv bdi{font-size:14pt;font-weight:900;direction:ltr;unicode-bidi:isolate}.kc.c bdi{color:#1d4ed8}.kc.d bdi{color:#c2414b}.kv u{text-decoration:none;font-size:7.4pt;color:#6b7280}
  table.bkt{width:100%;border-collapse:collapse;font-feature-settings:"tnum"}.bkt th{background:#13284f;color:#fff;font-size:7.4pt;padding:5px 4px}.bkt th.ds{text-align:right}.bkt td{font-size:7.8pt;padding:5px 4px;border-top:1px solid #e9ebf0;vertical-align:top}
  .bkt td.n{color:#a0a6b2;text-align:center}.bkt td.dt{white-space:nowrap;color:#4a5263}.bkt td.ds b{font-weight:800}.bkt td.ds span{display:block;color:#8a91a1;font-size:6.8pt}.bkt td.am{text-align:center;white-space:nowrap;font-weight:800}.bkt td.st{font-size:7pt;color:#4a5263;text-align:center}
  .rd{color:#c2414b}.bl{color:#1d4ed8}.ag{font-style:normal;font-size:6pt;font-weight:900;background:#e3f5ea;color:#15803d;border-radius:5px;padding:0 5px}.bkt tfoot td{font-weight:900;background:#f6f2e6;border-top:1.5px solid #13284f}
  .bkt thead{display:table-header-group}.bkt tr{break-inside:avoid}`;
  return pdfDoc(bkFile(s),html).replace(/@page\{size:A5 landscape;[^}]*\}/,'@page{size:A4;margin:10mm 10mm}').replace('</head>','<style>'+css+'</style></head>')}
ACT.bkXls=()=>{const s=curBk();if(!s)return;if(typeof XLSX==='undefined'){toast('برای Excel اینترنت لازم است',true);return}const L=bkStRows(s);if(!L.length){toast('ردیفی برای این جستجو نیست',true);return}
  const m=acSum(s),wb=XLSX.utils.book_new();wb.Workbook={Views:[{RTL:true}]};
  const info=[['گردش حساب بانک — مطلا'],['حساب',s.name],['بانک',acBank(s)||''],['شبا',s.iban||''],['تاریخ گزارش',dates().fa],BKS.f||BKS.t?['بازه',stmPer({F:BKS})]:[],BKS.q?['جستجو',BKS.q]:[],['مانده نهایی',m.known?m.fin:''],[]];
  const H=['ردیف','تاریخ','شرح','جزئیات','واریز (تومان)','برداشت (تومان)','وضعیت','نوع ثبت'];
  const a=[...info,H,...L.map((r,i)=>[i+1,dates(r.d).fa,r.t,r.s,r.a>0?r.a:'',r.a<0?-r.a:'',r.st,r.auto?'خودکار':'دستی'])];
  const w=XLSX.utils.aoa_to_sheet(a);w['!cols']=[{wch:6},{wch:14},{wch:28},{wch:40},{wch:16},{wch:16},{wch:14},{wch:10}];
  for(let r=info.length+2;r<=a.length;r++)['E','F'].forEach(col=>{const cl=w[col+r];if(cl&&typeof cl.v==='number')cl.z='#,##0'});
  XLSX.utils.book_append_sheet(wb,w,'گردش حساب');save(bkFile(s)+'.xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}),'فایل Excel گردش حساب آماده شد')};
