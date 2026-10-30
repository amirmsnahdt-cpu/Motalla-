/* ---------- تاریخچه: ردیف ساده، با زدن جزئیات باز می‌شود، کشیدن برای برگرداندن/نمایش ---------- */
const EVI={add:'plus',bulk:'paste',edit:'edit',del:'trash',clear:'trash',purge:'trash',split:'split',restore:'restore',undo:'undo',batch:'track',requeue:'refresh',uncommit:'undo',close:'check',alloc:'split',debt:'debt'};
let histOpen=new Set();
function evActs(x){const inTrash=(x.ids||[]).filter(id=>trash.some(z=>z.id===id)).length,live=(x.ids||[]).filter(id=>entries.some(z=>z.id===id)).length,R=[],L=[];
  if(!x.undone){
    if(x.type==='add'&&live){R.push(['undoEv','لغو ثبت','undo','#b8862b']);L.push(['showEnt','نمایش','eye','#3b6fd6'])}
    if(x.type==='bulk'&&live)R.push(['undoEv','لغو گروهی'+(live>1?' ('+fmt(live)+')':''),'undo','#b8862b']);
    if(x.type==='edit'&&live)R.push(['undoEv','برگرداندن','undo','#b8862b']);
    if((x.type==='del'||x.type==='clear')&&inTrash)R.push(['undoEv','بازگردانی'+(inTrash>1?' ('+fmt(inTrash)+')':''),'restore','#178049'])}
  if(x.type==='split'&&x.snap)L.push(['reopen','مشاهده','eye','#3b6fd6']);
  return {R,L}}
function evHTML(x){
  if(!x.ts)return `<div class="hrow"><div class="hh"><span class="hi" style="--c:var(--mut)">${ic('clock')}</span><span class="tx"><b>${esc(x.action||'')}</b><small>${esc(x.user||'')}${x.detail?' · '+esc(x.detail):''}</small></span><span class="hm"><small>${esc(x.time||'')}</small></span></div></div>`;
  const[t,c]=EVT[x.type]||['فعالیت','var(--pri)'],op=histOpen.has(String(x.id)),A=evActs(x),acts=[...A.R,...A.L].filter(a=>canAct(a[0]));
  const D=isoOfTs(x.ts),meta=[['زمان',relDay(D)+'، '+dates(D).fa+' · ساعت '+hm(x.ts)],['انجام‌دهنده',x.user||'—'],['نوع',t+(x.undone?' — لغو شد':'')]];
  const inner=`<div class="hrow${op?' open':''}${x.undone?' undone':''}"><button class="hh" data-act="evTog" data-ev="${x.id}" aria-expanded="${op}"><span class="hi" style="--c:${c}">${ic(EVI[x.type]||'clock')}</span><span class="tx"><b>${esc(x.summary||t)}</b><small>${esc(x.user||'')}${x.detail?' · '+esc(x.detail):''}</small></span><span class="hm"><small>${hm(x.ts)}</small>${x.undone?'<span class="pill g">لغو شد</span>':''}</span>${chevI()}</button>
    <div class="hb">${x.detail?`<div class="hd">${esc(x.detail)}</div>`:''}${x.type==='edit'?diffHTML(x.before,x.after):''}<div class="hmeta">${meta.map(([k,v])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>${acts.length?`<div class="hact">${acts.map(a=>`<button class="sm ${a[0]==='undoEv'?'gold':'sec'}" data-act="${a[0]}" data-ev="${x.id}">${ic(a[2])} ${a[1]}</button>`).join('')}</div>`:''}</div></div>`;
  return (A.R.length||A.L.length)?swW(inner,{r:A.R,l:A.L,data:{ev:x.id}}):inner}
const histTip=()=>ls.get('m_hswiped',false)?'':`<div class="hhint swtip">برای جزئیات روی هر مورد بزنید · برای برگرداندن به چپ بکشید</div>`;
function vAudit(){const t=todayISO(),td=audit.filter(a=>a.ts&&isoOfTs(a.ts)===t),k=ty=>td.filter(a=>ty.includes(a.type)).length;
  let h=`<div class="seg"><button data-act="htab" data-t="ev" class="${histTab==='ev'?'on':''}">فعالیت‌ها</button><button data-act="htab" data-t="tr" class="${histTab==='tr'?'on':''}">سطل بازیابی ${trash.length?fmt(trash.length):''}</button></div>`;
  if(histTab==='tr')return h+trashHTML();
  const nA=k(['add','bulk']),nE=k(['edit']),nD=k(['del','clear']),nS=k(['split']);
  h+=`<div class="hsum"><span>امروز</span><span><b>${fmt(nA)}</b> ثبت</span><span><b>${fmt(nE)}</b> ویرایش</span><span><b class="${nD?'r':''}">${fmt(nD)}</b> حذف</span><span><b>${fmt(nS)}</b> تقسیم</span></div>`;
  const F={all:'همه',add:'ثبت',edit:'ویرایش',del:'حذف',split:'تقسیم'},grp={add:['add','bulk'],edit:['edit'],del:['del','clear','purge'],split:['split']};
  h+=`<div class="seg hseg2">${Object.entries(F).map(([a,b])=>`<button class="${histFilter===a?'on':''}" data-act="hfilter" data-f="${a}">${b}</button>`).join('')}</div>`;
  const L=audit.filter(a=>histFilter==='all'||(a.ts&&grp[histFilter].includes(a.type)));
  if(!L.length)return h+`<div class="card empty">${ic('clock')}<b>فعالیتی برای نمایش نیست</b>هر ثبت، ویرایش، حذف و تقسیم اینجا ثبت می‌شود و قابل برگشت است.</div>`;
  h+=histTip();let last='',open=false;
  L.slice(0,150).forEach(x=>{const d=x.ts?isoOfTs(x.ts):'old';if(d!==last){if(open)h+='</div>';last=d;open=true;h+=`<div class="hday">${d==='old'?'نسخه‌های قبلی':relDay(d)+'، '+dates(d).fa}</div><div class="hgrp">`}h+=evHTML(x)});
  return h+(open?'</div>':'')}
function trashHTML(){if(!trash.length)return `<div class="card empty">${ic('trash')}<b>سطل بازیابی خالی است</b>واریزی‌هایی که حذف می‌کنید تا ۶۰ روز اینجا می‌مانند و قابل بازگردانی‌اند.</div>`;
  let h=`<div class="hsum"><span>${fmt(trash.length)} واریزی حذف‌شده</span><span><b>${fmt(sum(trash))}</b> تومان</span></div><div class="row" style="margin:0 0 10px"><button class="sm gold" data-act="restoreAll">${ic('restore')} بازگردانی همه</button>${can('del')?`<button class="sm red" data-act="emptyTrash">خالی کردن سطل</button>`:''}</div>`;
  h+=ls.get('m_hswiped',false)?'':`<div class="hhint swtip">برای جزئیات بزنید · به چپ بکشید: بازگردانی · به راست: حذف دائمی</div>`;
  h+='<div class="hgrp">';
  trash.forEach(x=>{const op=histOpen.has('t'+x.id),ago=x.deletedAt?relDay(isoOfTs(x.deletedAt))+' · '+hm(x.deletedAt):'';
    const meta=[['حذف',ago||'—'],['حذف‌کننده',x.deletedBy||'—'],['دلیل',x.reason||'—'],['لیست',dates(x.entryDate).fa],['بانک',ibanBank(x.iban)||x.bank||'نامشخص'],['فاکتور',x.code?toEn(x.code):'—']];
    const inner=`<div class="hrow${op?' open':''}"><button class="hh" data-act="evTog" data-ev="t${x.id}" aria-expanded="${op}"><span class="hi" style="--c:var(--red)">${ic('trash')}</span><span class="tx"><b>${esc(x.name||'—')}</b><small>${fmt(x.amount)} تومان · ${esc(dates(x.entryDate).fa)}</small></span><span class="hm"><small>${esc(x.deletedAt?hm(x.deletedAt):'')}</small></span>${chevI()}</button>
      <div class="hb"><div class="hmeta">${meta.map(([k,v])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div>${x.iban?`<div class="hd ltrv">${esc(x.iban)}</div>`:''}<div class="hact"><button class="sm gold" data-act="restoreOne" data-id="${x.id}">${ic('restore')} بازگردانی</button>${can('del')?`<button class="sm red" data-act="purgeOne" data-id="${x.id}">حذف دائمی</button>`:''}</div></div></div>`;
    h+=swW(inner,{r:[['restoreOne','بازگردانی','restore','#178049']],l:[['purgeOne','حذف دائمی','trash','#d23c48']],data:{id:x.id}})});
  return h+'</div><div class="muted" style="font-size:12px;text-align:center;margin-top:10px">موارد سطل بعد از ۶۰ روز خودکار پاک می‌شوند.</div>'}
function undoEv(id){const x=audit.find(a=>a.id==id);if(!x||x.undone)return;
  if(x.type==='add'||x.type==='bulk'){const m=trashIds(x.ids||[],x.type==='add'?'لغو ثبت':'لغو ورود گروهی');if(!m.length){toast('این واریزی‌ها دیگر در لیست نیستند',true);return}x.undone=true;logA('undo','لغو '+(x.type==='add'?'ثبت':'ورود گروهی'),x.detail);toast(fmt(m.length)+' واریزی به سطل بازیابی رفت')}
  else if(x.type==='edit'){const e=entries.find(z=>z.id===(x.ids||[])[0]);if(!e){toast('این واریزی دیگر در لیست نیست',true);return}Object.keys(FN).forEach(k=>{if(x.before&&k in x.before)e[k]=x.before[k]});e.updatedBy=who();e.updatedAt=new Date().toISOString();saveE();alloc=null;x.undone=true;logA('undo','برگرداندن ویرایش',x.before?x.before.name:'');toast('به مقدار قبل برگشت')}
  else if(x.type==='del'||x.type==='clear'){const b=restoreIds(x.ids||[]);if(!b.length){toast('در سطل بازیابی پیدا نشد',true);return}x.undone=true;logA('restore','بازگردانی',fmt(b.length)+' واریزی | '+b.map(z=>z.name).slice(0,3).join('، '),{ids:b.map(z=>z.id)});toast(fmt(b.length)+' واریزی بازگردانده شد')}
  saveAud();render()}
function reopen(id){const x=audit.find(a=>a.id==id);if(!x||!x.snap)return;const s=x.snap;dateVal=s.date;ls.set('m_date',s.date);
  alloc={res:s.res,left:s.left||[],excl:(s.excl||[]).map(r=>({...r,issues:r.issues||[]})),D:dates(s.date),fromHist:x.ts};go('split3')}
/* ============ خروجی‌ها ============ */
const rdate=(r,D)=>r&&r.entryDate?dates(r.entryDate):D;
const pdate=(r,D)=>r&&(r.payDate||r.entryDate)?dates(r.payDate||r.entryDate):D;
const groups=sc=>{const R=sc==='all'?alloc.res.filter(r=>r.items.length):[alloc.res[+sc]];return R.map(r=>({name:r.src.name,limit:+r.src.limit||0,rows:r.items}))};
function xlsx(sc){const D=alloc.D,G=groups(sc),wb=XLSX.utils.book_new();wb.Workbook={Views:[{RTL:true}]};const used={};
  const nm=n=>{let b=n.replace(/[\\\/?*\[\]:]/g,'').slice(0,28)||'sheet',k=b,i=1;while(used[k])k=b+(++i);used[k]=1;return k};
  if(sc==='all'){const a=[['منبع','تعداد','جمع مبلغ (تومان)','موجودی تعیین‌شده','تاریخ واریز','تاریخ واریز (میلادی)','تاریخ ثبت']];G.forEach(g=>a.push([g.name,g.rows.length,sum(g.rows),g.limit,pdate(g.rows[0],D).fa,pdate(g.rows[0],D).iso,rdate(g.rows[0],D).fa]));
    a.push(['مجموع',G.reduce((s,g)=>s+g.rows.length,0),G.reduce((s,g)=>s+sum(g.rows),0),'','','','']);const w=XLSX.utils.aoa_to_sheet(a);w['!cols']=[{wch:18},{wch:8},{wch:20},{wch:20},{wch:16},{wch:18}];
    for(let r=2;r<=a.length;r++)['C','D'].forEach(c=>{if(w[c+r]&&typeof w[c+r].v==='number')w[c+r].z='#,##0'});XLSX.utils.book_append_sheet(wb,w,nm('خلاصه'))}
  G.forEach(g=>{const a=[['ردیف','نام و نام خانوادگی','شماره فاکتور','مبلغ (تومان)','بانک مقصد','شماره حساب','شماره کارت','شماره شبا','منبع واریزی','تاریخ واریز','تاریخ واریز (میلادی)','تاریخ ثبت','ثبت‌کننده']];
    g.rows.forEach((r,i)=>a.push([i+1,r.name,r.code,r.amount,r.bankShow,r.acct,r.card,r.iban,g.name,pdate(r,D).fa,pdate(r,D).iso,rdate(r,D).fa,r.createdBy||'']));a.push(['','جمع','',sum(g.rows),'','','','','','','','','']);
    const w=XLSX.utils.aoa_to_sheet(a);w['!cols']=[{wch:6},{wch:22},{wch:12},{wch:16},{wch:14},{wch:18},{wch:20},{wch:30},{wch:16},{wch:16},{wch:14},{wch:14}];
    for(let r=2;r<=a.length;r++)if(w['D'+r])w['D'+r].z='#,##0';XLSX.utils.book_append_sheet(wb,w,nm(g.name))});
  return XLSX.write(wb,{bookType:'xlsx',type:'array'})}
let dp={t:'j',y:1405,m:1,d:1};
const wcfg=()=>dp.t==='j'?{lo:1390,hi:1460,M:JM}:{lo:2010,hi:2080,M:GM};
const wlab=n=>dp.t==='j'?toFa(n):String(n);
function jDays(y,m){if(m<7)return 31;if(m<12)return 30;const[gy,gm,gd]=j2g(y,12,30),b=g2j(gy+'-'+p2(gm)+'-'+p2(gd));return b[0]===y&&b[1]===12&&b[2]===30?30:29}
const dim=()=>dp.t==='j'?jDays(dp.y,dp.m):new Date(dp.y,dp.m,0).getDate();
const dayItems=()=>Array.from({length:dim()},(_,i)=>wlab(i+1));
function setDp(iso,t){dp.t=t;const[y,m,d]=t==='j'?g2j(iso):iso.split('-').map(Number);dp.y=y;dp.m=m;dp.d=d}
function curISO(){const d=Math.min(dp.d,dim());if(dp.t==='j'){const[gy,gm,gd]=j2g(dp.y,dp.m,d);return gy+'-'+p2(gm)+'-'+p2(gd)}return dp.y+'-'+p2(dp.m)+'-'+p2(d)}
function updDp(){tmpISO=curISO();const D=dates(tmpISO);$('dprev').innerHTML=D.fa+' &nbsp;|&nbsp; <span>'+D.en+'</span>'}
function fillWheel(w,items,sel){const el=$('w'+w);el.dataset.n=items.length;el.innerHTML=items.map((t,i)=>`<div class="wi${i===sel?' on':''}" data-act="wpick" data-w="${w}" data-i="${i}">${t}</div>`).join('');el.scrollTop=sel*44}
function buildWheels(){const c=wcfg();dp.y=Math.max(c.lo,Math.min(c.hi,dp.y));dp.d=Math.min(dp.d,dim());
  const yrs=[];for(let y=c.lo;y<=c.hi;y++)yrs.push(wlab(y));
  $('wheels').className='wheels '+(dp.t==='j'?'rtl':'ltr');
  fillWheel('d',dayItems(),dp.d-1);fillWheel('m',c.M,dp.m-1);fillWheel('y',yrs,dp.y-c.lo);updDp()}
function onWheel(w){const el=$('w'+w),n=+el.dataset.n,c=wcfg();let i=Math.max(0,Math.min(n-1,Math.round(el.scrollTop/44)));const v=w==='y'?c.lo+i:i+1;
  if(dp[w]===v)return;dp[w]=v;el.querySelectorAll('.wi').forEach((x,k)=>x.classList.toggle('on',k===i));
  if(w!=='d'){const dn=dim(),de=$('wd');if(+de.dataset.n!==dn){if(dp.d>dn)dp.d=dn;fillWheel('d',dayItems(),dp.d-1)}}updDp()}
/* ============ PDF مدرن و مینیمال ============ */
const PDF_FONT='<style>@font-face{font-family:Vazirmatn;font-weight:400;font-display:swap;src:url(fonts/Vazirmatn-Regular.woff2) format(\'woff2\')}@font-face{font-family:Vazirmatn;font-weight:500;font-display:swap;src:url(fonts/Vazirmatn-Medium.woff2) format(\'woff2\')}@font-face{font-family:Vazirmatn;font-weight:600;font-display:swap;src:url(fonts/Vazirmatn-SemiBold.woff2) format(\'woff2\')}@font-face{font-family:Vazirmatn;font-weight:700;font-display:swap;src:url(fonts/Vazirmatn-Bold.woff2) format(\'woff2\')}@font-face{font-family:Vazirmatn;font-weight:800;font-display:swap;src:url(fonts/Vazirmatn-ExtraBold.woff2) format(\'woff2\')}@font-face{font-family:Vazirmatn;font-weight:900;font-display:swap;src:url(fonts/Vazirmatn-Black.woff2) format(\'woff2\')}</style>';
function pdfCSS(){return `@page{size:A5 landscape;margin:8mm 9mm}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
*{box-sizing:border-box}
body{-webkit-text-size-adjust:100%;text-size-adjust:100%;font-family:'Vazirmatn',Tahoma,sans-serif;direction:rtl;color:#16213a;font-size:9.4pt;line-height:1.6;margin:0;background:#fff;font-feature-settings:"tnum";-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{page-break-after:always;max-width:192mm;margin:0 auto;padding:1mm 0}thead{display:table-header-group}tfoot{display:table-row-group}h1,h2,.top,.sub,.bar{break-after:avoid;page-break-after:avoid}.kp,.sign,.foot{break-inside:avoid;page-break-inside:avoid}.pg:last-child{page-break-after:auto}
.pg{position:relative}.pg:before{content:"";position:absolute;left:50%;top:50%;width:70%;aspect-ratio:477/202;transform:translate(-50%,-50%) rotate(-8deg);background:url(logo-stamp.png) center/contain no-repeat;opacity:.04;pointer-events:none}.pg>*{position:relative}
.top{display:flex;justify-content:space-between;align-items:center;gap:14px;background:linear-gradient(135deg,#0f1f3f,#13284f 60%,#1a3366);color:#fff;border-radius:16px 16px 5px 5px;padding:10px 16px 13px;position:relative;overflow:hidden}.top:after{content:"";position:absolute;inset:auto 0 0 0;height:3px;background:linear-gradient(90deg,#b8862b,#f3d892,#b8862b,#f3d892,#b8862b)}
.brand{display:flex;align-items:center;gap:12px}.lg{flex:none;width:36mm;aspect-ratio:477/202;background:url(logo-stamp.png) center/contain no-repeat;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
.brand b{display:block;font-size:12pt;font-weight:800;line-height:1.25}.brand small{display:block;font-size:7.4pt;color:#ecd9a6;font-weight:500}.brand>span:last-child{border-inline-start:1px solid rgba(236,200,116,.35);padding-inline-start:12px}
.doc{font-size:7.6pt;color:#ecd9a6;text-align:left;line-height:1.6;border:1px solid rgba(236,200,116,.55);border-radius:10px;padding:4px 10px}.doc b{display:block;color:#f3d892;font-size:9.5pt;font-weight:800}
h1{font-size:16pt;font-weight:800;margin:10px 0 0;letter-spacing:-.4px;line-height:1.35}
.sub{color:#6b7385;font-size:9pt;margin-top:2px}.sub{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px}.sub .pdl{font-size:7.5pt!important;font-weight:700;color:#7a5a12;background:#f6ecd2;border-radius:6px;padding:1px 7px}.sub .pdv{font-size:9.5pt!important;font-weight:800;color:#13284f;direction:rtl;unicode-bidi:isolate}.sub .pde{direction:ltr;unicode-bidi:isolate}.sub .pde{font-size:8.5pt!important;color:#8a90a0}.sub .rg{font-size:8pt!important;color:#8a90a0;border-inline-start:1px solid #dfe3ea;padding-inline-start:8px}.sub span{direction:ltr;display:inline-block}
.bar{height:3px;width:46px;background:linear-gradient(90deg,#ecc874,#b8862b);border-radius:3px;margin:10px 0 14px}
.kp{display:flex;border:1px solid #e7e9ef;border-radius:14px;margin-bottom:18px;overflow:hidden}
.kp div{flex:1;padding:10px 14px;border-left:1px solid #e7e9ef}.kp div:last-child{border-left:0}
.kp small{display:block;font-size:7.4pt;color:#9097a5;font-weight:500}.kp b{font-size:13pt;font-weight:800}.kp b em{font-style:normal;font-size:7.6pt;color:#9097a5;font-weight:500;margin-right:3px}
.kp .g b{color:#9a6a12}.kp .ok b{color:#15803d}.kp .rd b{color:#c2414b}
h2{font-size:11.5pt;font-weight:800;margin:20px 0 8px;display:flex;justify-content:space-between;align-items:baseline}h2 small{font-size:8.4pt;color:#6b7385;font-weight:600}
table{width:100%;border-collapse:collapse}
th{font-size:7.4pt;color:#7a5a17;font-weight:700;text-align:right;padding:6px 6px;background:#fbf6e8;border-bottom:1.5px solid #ecd9a6;white-space:nowrap}
td{padding:9px 6px;border-bottom:1px solid #eef0f4;vertical-align:middle}
tr{page-break-inside:avoid}
td.n{color:#a0a6b2;width:24px;font-size:8.2pt;font-weight:600}
.nm{font-weight:700;font-size:9.8pt;display:block}.s{display:block;font-size:7.6pt;color:#9097a5;margin-top:1px}
.ib{direction:ltr;text-align:left;font-size:8.4pt;letter-spacing:.4px;white-space:nowrap;font-weight:500;color:#2a3550}
td.am,th.am{text-align:left;white-space:nowrap}td.am{font-weight:800;font-size:10pt}
tr.tot td{border-bottom:0;border-top:1.5px solid #13284f;font-weight:800;padding-top:11px;font-size:10pt}
.st{display:inline-block;font-size:7.3pt;font-weight:700;padding:1px 9px;border-radius:20px;white-space:nowrap}
.st.ok{background:#e9f6ef;color:#15803d}.st.fail{background:#fcecee;color:#c2414b}.st.pending{background:#fbf4e1;color:#946200}.st.none{background:#eef1f6;color:#5b6577}.sty{display:inline-block;margin-top:3px;font-size:9.5px;font-weight:700;color:#2a4fb8;background:#eaf0ff;border-radius:6px;padding:1px 6px}
.tn{direction:ltr;display:inline-block;font-size:8pt;color:#2a3550;font-weight:600}
.sign{display:flex;gap:46px;margin-top:26px}.sign div{flex:1;border-top:1px solid #d5d9e1;padding-top:7px;font-size:8pt;color:#6b7385;text-align:center}
.foot{margin-top:20px;padding-top:8px;border-top:1px solid #eef0f4;display:flex;justify-content:space-between;font-size:7.2pt;color:#a0a6b2}
.rc{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}.rc figure{margin:0;border:1px solid #eef0f4;border-radius:12px;padding:7px;page-break-inside:avoid}
.rc img{width:100%;height:200px;object-fit:contain;background:#f7f8fa;border-radius:8px;display:block}.rc figcaption{font-size:8pt;margin-top:5px;line-height:1.5}.rc figcaption b{display:block}
tbody.en{page-break-inside:avoid;break-inside:avoid}tr.hs td{border-bottom:0;padding-bottom:4px}
tr.stlr td{padding:0 6px 11px}
.stb{border:1px solid #eceef3;background:#fafbfc;border-radius:10px;padding:5px 11px 4px;position:relative}.stb.many{border-color:#dfe3ea;background:#f6f7fa;box-shadow:0 1px 0 #e7e9ef}
.stbh{display:flex;justify-content:space-between;align-items:baseline;padding:1px 0 4px;border-bottom:1px solid #eceef3;margin-bottom:2px}
.stbh span{font-size:7.4pt;font-weight:700;color:#6b7385}.stbh small{font-size:7.2pt;color:#9097a5;font-weight:600}
.aml{display:block;font-size:6.8pt;font-weight:700;color:#9a7a3a;text-align:left}.ams{display:block;font-size:7.2pt;font-weight:700;color:#2a4fb8;text-align:left;margin-top:1px}.stbh b{font-size:11.5pt;font-weight:900;color:#13284f;white-space:nowrap}.stbh b em{font-style:normal;font-size:7.4pt;color:#9097a5;font-weight:500;margin-right:3px}
.stbr{display:flex;align-items:center;gap:8px;padding:3px 0;font-size:8.2pt}.stbr+.stbr{border-top:1px solid #f0f2f5}
.stbr i{font-style:normal;width:14px;height:14px;border-radius:50%;background:#e7eaf0;color:#2a3550;font-size:6.6pt;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex:none}
.stk{font-weight:800;color:#16213a;white-space:nowrap}.std{flex:1;color:#6b7385;font-size:7.6pt}.stbr b{font-weight:800;white-space:nowrap;color:#16213a}
.stw{display:inline-block;font-size:6.8pt;font-weight:700;color:#946200;background:#fbf4e1;border-radius:6px;padding:0 5px}
.stbr.bk .stk{color:#2a4fb8}.stbr.bk i{background:#2a4fb8;color:#fff}.stbr.bk b{color:#2a4fb8}
.pb{position:fixed;top:10px;left:10px;padding:9px 16px;background:#13284f;color:#fff;border:0;border-radius:10px;font:inherit;font-weight:700;cursor:pointer}@media print{.pb{display:none}}`}
/* v61.64 (خواسته صاحب اپ): همه PDFها با تم تازه — سرتیتر سرمه‌ای با لوگوی «طلای مطلا»، نوار طلایی و نقش کم‌رنگ لوگو پشت برگه (مثل فاکتور) */
function pdfTop(kind,D){return `<div class="top"><div class="brand"><span class="lg" role="img" aria-label="طلای مطلا"></span><span><b>${esc(kind)}</b><small>طلا و جواهر مطلا</small></span></div><div class="doc">تاریخ<b>${D.fa}</b></div></div>`}
const pdfFoot=()=>`<div class="foot"><span style="color:#b8862b;font-weight:800">طلای مطلا</span><span>تهیه‌شده ${dates().fa}، ساعت ${toFa(new Date().toTimeString().slice(0,5))}${user?' — '+esc(user):''}</span></div>`;
const pdfDoc=(title,body)=>`<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>${PDF_FONT}<style>${pdfCSS()}</style></head><body><button class="pb" onclick="window.print()">چاپ / ذخیره PDF</button>${body}</body></html>`;
const pdfSub=(D,reg)=>`<div class="sub"><span class="pdl">تاریخ واریز</span><span class="pdv">${D.fa}</span><span class="pde">${D.en}</span>${reg?`<span class="rg">ثبت: ${esc(reg)}</span>`:''}</div>`;
/* v59.8: نام فایل خروجی (PDF و Excel) = تاریخ واریز، مثل «مطلا ( تاریخ ۲۹/۰۷/۱۴۰۵ )».
   «/» در نام فایل مجاز نیست (اندروید و آیفون آن را حذف یا عوض می‌کنند)، پس «∕» (هم‌شکل) گذاشته می‌شود؛
   تاریخ داخل جداساز چپ‌به‌راست است تا ترتیب روز/ماه/سال همان‌طور که تایپ می‌کنید دیده شود. */
function fileBase(iso,extra){const D=dates(iso);return 'مطلا ( تاریخ \u2066'+toFa(p2(D.jd))+'∕'+toFa(p2(D.jm))+'∕'+toFa(D.jy)+'\u2069 )'+(extra?' '+String(extra).replace(/[\\/:*?"<>|]/g,'-'):'')}
/* v60.1: مبلغ کل خرید روبه‌روی نام (فقط وقتی بخشی از آن غیر از همین واریز بانکی پرداخت شده) */
/* v60.2: ستون مبلغ برای واریزی ترکیبی = کل خرید (تومان)؛ سهم بانکی این منبع زیرش و در فهرست پایین ردیف */
const amCell=x=>x.settled&&(x.settles||[]).length&&+x.total?`<td class="am">${fmt(x.total)}</td>`:`<td class="am">${fmt(x.amount)}</td>`;
/* v59.8: جزئیات تسویه زیر ردیف واریزی: مبلغ کل بالا، بعد هر واریزی انجام‌شده (نوع/پرداخت‌کننده، مشخصات، مبلغ) و در آخر سهم واریز بانکی */
function stlBox(x,cols,src){const S=x.settles||[];if(!S.length)return '';const bank=x.full?0:(+x.amount||0);
  const det=z=>[z.inv?'فاکتور فروش '+toEn(String(z.inv)):'',z.phone?'تلفن <span class="tn">'+esc(toEn(String(z.phone)))+'</span>':'',z.tn?'پیگیری <span class="tn">'+esc(toEn(String(z.tn)))+'</span>':'',/^\d{4}-\d\d-\d\d/.test(z.date||'')?dates(z.date.slice(0,10)).fa:''].filter(Boolean).map(v=>v.startsWith('فاکتور')?esc(v):v).join(' · ');
  return `<tr class="stlr"><td></td><td colspan="${cols-1}"><div class="stb${S.length+(bank?1:0)>=3?' many':''}"><div class="stbh"><span>واریزی‌ها و منابع</span><small>${fmt(S.length+(bank?1:0))} واریزی</small></div>
    ${S.map((z,i)=>`<div class="stbr"><i>${fmt(i+1)}</i><span class="stk">${esc(z.name||'مشتری')}</span><span class="std">${det(z)||'&nbsp;'}${z.st==='wait'?' <span class="stw">در انتظار تأیید</span>':''}</span><b>${fmt(+z.amount||0)}</b></div>`).join('')}
    ${bank?`<div class="stbr bk"><i>${fmt(S.length+1)}</i><span class="stk">واریز بانکی${src?' · '+esc(src):''}</span><span class="std">${[x.bank||x.bankShow?esc(x.bank||x.bankShow):'',x.iban?'<span class="tn">'+esc(ibanPdf(x.iban))+'</span>':'',x.tn?'پیگیری <span class="tn">'+esc(x.tn)+'</span>':''].filter(Boolean).join(' · ')||'همین لیست'}</span><b>${fmt(bank)}</b></div>`:''}</div></td></tr>`}
/* گزارش تخصیص / لیست (جایگزین نسخه قدیمی) */
function reportHTML(sc){const D=DP(),RG=alloc.reg||'',G=groups(sc).filter(g=>g.rows.length),tc=G.reduce((s,g)=>s+g.rows.length,0),ta=G.reduce((s,g)=>s+sum(g.rows),0);let h='';
  if(G.length>1)h+=`<section class="pg">${pdfTop('گزارش واریزی',D)}<h1>گزارش کلی واریزی</h1>${pdfSub(D,RG)}<div class="bar"></div>
    <div class="kp"><div><small>تعداد واریزی</small><b>${fmt(tc)}</b></div><div class="g"><small>مجموع</small><b>${fmt(ta)}<em>تومان</em></b></div><div><small>منبع</small><b>${fmt(G.length)}</b></div></div>
    <table><thead><tr><th>#</th><th>منبع واریزی</th><th>تعداد</th><th class="am">مجموع (تومان)</th></tr></thead><tbody>${G.map((g,i)=>`<tr><td class="n">${fmt(i+1)}</td><td><span class="nm">${esc(g.name)}</span></td><td>${fmt(g.rows.length)}</td><td class="am">${fmt(sum(g.rows))}</td></tr>`).join('')}
    <tr class="tot"><td></td><td>جمع کل</td><td>${fmt(tc)}</td><td class="am">${fmt(ta)}</td></tr></tbody></table>
    <div class="sign"><div>تهیه‌کننده</div><div>تأیید مدیر</div></div>${pdfFoot()}</section>`;
  G.forEach(g=>{const s=sum(g.rows);h+=`<section class="pg">${pdfTop('گزارش واریزی',D)}<h1>${esc(g.name)}</h1>${pdfSub(D,RG)}<div class="bar"></div>
    <div class="kp"><div><small>تعداد واریزی</small><b>${fmt(g.rows.length)}</b></div><div class="g"><small>مجموع</small><b>${fmt(s)}<em>تومان</em></b></div></div>
    <table><thead><tr><th>#</th><th>نام و فاکتور</th><th>بانک</th><th>شماره شبا</th><th class="am">مبلغ (تومان)</th></tr></thead>
    ${g.rows.map((r,i)=>`<tbody class="en"><tr${r.settled&&(r.settles||[]).length?' class="hs"':''}><td class="n">${fmt(i+1)}</td><td><span class="nm">${esc(fullName(r))}</span>${r.code?`<span class="s">فاکتور ${esc(toEn(r.code))}</span>`:''}${r.settled&&!(r.settles||[]).length?`<span class="s">از ${fmt(r.total)}، ${fmt(r.settled)} مستقیم توسط مشتری</span>`:''}</td><td>${esc(r.bankShow||'—')}</td><td class="ib">${esc(ibanPdf(r.iban))}</td>${amCell(r)}</tr>${r.settled?stlBox(r,5,g.name):''}</tbody>`).join('')}
    <tbody><tr class="tot"><td></td><td colspan="3">جمع ${g.rows.some(r=>r.settled)?'واریز بانکی ':''}${esc(g.name)} — ${fmt(g.rows.length)} واریزی</td><td class="am">${fmt(s)}</td></tr></tbody></table>${pdfFoot()}</section>`});
  return pdfDoc(fileBase(alloc.Dp?alloc.Dp.iso:D.iso,G.length===1&&sc!=='all'?G[0].name:''),h)}
/* لیست روزانه با وضعیت، شماره پیگیری و رسیدها */
async function dayReport(iso,G0,FS0,T0,R0){const G=G0||dayGroups(iso),D=dates(iso),it=G.flatMap(g=>g.rows),c=bStat({items:it}),imgs={};
  const RI=[];for(const x of it){const b=batches.find(z=>z.id===x.bid);if(!b)continue;for(const k of itImgs(b,x)){const v=await imgGet(k);if(v)RI.push({x,v})}}
  const TT=T0||'لیست روزانه واریز';let h=`<section class="pg">${pdfTop(TT,D)}<h1>${esc(TT)}</h1>${pdfSub(D,R0||'')}<div class="bar"></div>
  <div class="kp"><div><small>کل واریزی‌ها</small><b>${fmt(c.all)}</b></div><div class="ok"><small>انجام شد</small><b>${fmt(c.ok)}</b></div><div class="rd"><small>انجام نشد</small><b>${fmt(c.fail)}</b></div><div class="g"><small>واریز شده</small><b>${fmt(c.okSum)}<em>تومان</em></b></div></div>`;
  G.forEach(g=>{const s=sum(g.rows),gc=bStat({items:g.rows});h+=`<h2>${esc(g.name)}<small>${fmt(g.rows.length)} واریزی — ${fmt(s)} تومان${gc.fail?' — '+fmt(gc.fail)+' ناموفق':''}</small></h2>
    <table><thead><tr><th>#</th><th>نام و فاکتور</th><th>شبا و بانک</th><th>وضعیت و پیگیری</th><th class="am">مبلغ (تومان)</th></tr></thead>
    ${g.rows.map((x,i)=>`<tbody class="en"><tr${x.settled?' class="hs"':''}><td class="n">${fmt(i+1)}</td><td><span class="nm">${esc(fullName(x))}</span>${x.code?`<span class="s">فاکتور ${esc(toEn(x.code))}</span>`:''}</td><td><span class="ib">${esc(ibanPdf(x.iban))}</span><span class="s">${esc(x.bank||'—')}</span></td><td><span class="st ${x.st}">${ST[x.st][0]}</span><br><span class="sty">${setType(x)}</span>${x.tn?`<span class="s">پیگیری <span class="tn">${esc(x.tn)}</span></span>`:''}${x.time||x.note?`<span class="s">${x.time?'ساعت '+toFa(x.time):''}${x.time&&x.note?' — ':''}${esc(x.note||'')}</span>`:''}</td>${amCell(x)}</tr>${x.settled?stlBox(x,5,g.name):''}</tbody>`).join('')}
    <tbody><tr class="tot"><td></td><td colspan="3">جمع ${g.rows.some(r=>r.settled)?'واریز بانکی ':''}${esc(g.name)}</td><td class="am">${fmt(s)}</td></tr></tbody></table>`});
  const FS=FS0||fullSettled(iso);if(FS.length)h+=`<h2>تسویه کامل از طریق مشتری<small>${fmt(FS.length)} مورد — ${fmt(FS.reduce((s,r)=>s+r.total,0))} تومان</small></h2><table><thead><tr><th>#</th><th>نام و فاکتور</th><th>نوع تسویه</th><th class="am">مبلغ کل (تومان)</th></tr></thead>${FS.map((r,i)=>`<tbody class="en"><tr class="hs"><td class="n">${fmt(i+1)}</td><td><span class="nm">${esc(fullName(r))}</span>${r.code?`<span class="s">فاکتور ${esc(toEn(r.code))}</span>`:''}</td><td><span class="sty">${esc(setType(r))}</span></td><td class="am">${fmt(r.total)}</td></tr>${stlBox(r,4)}</tbody>`).join('')}</table>`;
  h+=`<div class="sign"><div>تهیه‌کننده</div><div>تأیید مدیر</div></div>${pdfFoot()}</section>`;
  const ri=RI;
  if(ri.length)h+=`<section class="pg">${pdfTop('رسیدهای واریز',D)}<h1>رسیدهای واریز</h1>${pdfSub(D)}<div class="bar"></div><div class="rc">${ri.map(({x,v})=>`<figure><img src="${v}" alt=""><figcaption><b>${esc(x.name)}</b>${fmt(x.amount)} تومان${x.tn?'<br>پیگیری <span class="tn">'+esc(x.tn)+'</span>':''}</figcaption></figure>`).join('')}</div>${pdfFoot()}</section>`;
  return pdfDoc(fileBase(iso),h)}
/* چاپ داخل همین صفحه (بدون دانلود) */
/* v61.33: آیفون/آیپد — چاپ داخل صفحه برنامه (پشت پنجره پیش‌نمایش) در Safari گاهی هیچ کاری نمی‌کند یا برگه سفید می‌دهد؛
   برگه در یک صفحه جدا باز می‌شود و همان‌جا پنجره چاپ می‌آید (از آن‌جا «Save to Files» یا اشتراک PDF). دکمه چاپ هم بالای آن صفحه هست. */
function printWin(html){let w=null;try{w=window.open('','_blank')}catch(e){}if(!w)return false;
  const base=location.href.replace(/[^/]*$/,''),bar='<div class="pb0" style="position:sticky;top:0;z-index:9;display:flex;gap:8px;justify-content:center;padding:10px;background:#f4f5f8;border-bottom:1px solid #e3e6ec;font-family:Vazirmatn,Tahoma,sans-serif"><button onclick="window.print()" style="font:inherit;font-weight:800;font-size:15px;padding:10px 22px;border:0;border-radius:12px;background:#2152d9;color:#fff">چاپ / ذخیره PDF</button><button onclick="window.close()" style="font:inherit;font-size:15px;padding:10px 16px;border:0;border-radius:12px;background:#e6ebf5;color:#2152d9">بستن</button></div><style>@media print{.pb0{display:none!important}}</style>';
  /* v61.71 (خواسته صاحب اپ): پنجره چاپ آیفون — برگه روی صفحه گوشی کامل و کوچک‌شده دیده می‌شود (فقط روی صفحه؛ چاپ اندازه واقعی)،
     و چاپ خودکار بعد از بار شدن فونت‌ها و عکس‌ها (نه با تأخیر ثابت) تا PDF ناقص یا با فونت پیش‌فرض نشود */
  const pw=/@page\{size:A5;/.test(html)?'132mm':/@page\{size:A4;/.test(html)?'190mm':'194mm';
  const fit='<style id="pvz"></style><script>(function(){function z(){var g=document.querySelector(".pg"),W=g?g.scrollWidth:794;var k=Math.min(1,(window.innerWidth-16)/(W+8));document.getElementById("pvz").textContent="@media screen{body{margin:0!important;padding:0 8px 24px!important;overflow-x:hidden}.pg,section.pg{width:'+pw+'!important;max-width:none!important;zoom:"+k+";margin:10px auto 0!important}}"}z();window.addEventListener("resize",z);window.__z=z})()<\/script>';
  const h=html.replace(/<head>/i,'<head><base href="'+base+'">').replace(/<body([^>]*)>/i,'<body$1>'+bar)+fit+'<script>window.onload=function(){var go=function(){try{window.__z&&window.__z();window.print()}catch(e){}};var f=document.fonts&&document.fonts.ready;(f?Promise.race([f,new Promise(function(r){setTimeout(r,2500)})]):Promise.resolve()).then(function(){setTimeout(go,250)})}<\/script>';
  try{w.document.open();w.document.write(h);w.document.close();return true}catch(e){try{w.close()}catch(_){}return false}}
function printReport(){const html=window.__pv||withCtx(reportHTML),doc=new DOMParser().parseFromString(html,'text/html');doc.querySelectorAll('.pb').forEach(b=>b.remove());
  if(isIOS()&&printWin('<!doctype html>'+doc.documentElement.outerHTML))return;
  let css=[...doc.querySelectorAll('style')].map(s=>s.textContent).join('\n');const pg=(css.match(/@page\{[^}]*\}/)||[''])[0];css=css.replace(pg,'').replace(/(^|\})\s*body\{/g,'$1 #printArea{');
  $('printArea').innerHTML='<style>'+pg+'@media print{'+css+'}</style>'+doc.body.innerHTML;
  /* نام فایل PDF ذخیره‌شده = عنوان صفحه هنگام چاپ؛ پس عنوان گزارش (مثلاً «مطلا ( تاریخ … )») موقتاً عنوان برنامه می‌شود */
  const t0=window.__docT||(window.__docT=document.title),tt=(doc.title||'').trim();if(tt)document.title=tt;let back=false;const restore=()=>{if(back)return;back=true;document.title=t0;removeEventListener('afterprint',restore)};addEventListener('afterprint',restore);
  setTimeout(()=>{try{window.print()}catch(e){toast('چاپ در این برنامه ممکن نیست؛ از «متن» استفاده کنید',true)}setTimeout(restore,60000)},80)}

/* ============ برگه‌ها ============ */
let tmpISO=null,confirmCb=null,dpMode='';
/* پنجره پایین مثل iOS: بالا آمدن فنری، صفحه پشت عقب می‌رود؛ بستن با یک نسخه تصویری که پایین می‌لغزد
   (خود پنجره همان لحظه بسته و خالی می‌شود تا کدهایی که بلافاصله پنجره بعدی را باز می‌کنند درست کار کنند) */
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function sheet(h){const o=$('ov'),s=$('sheet'),open=!o.classList.contains('hide');s.innerHTML=h;
  if(open){if(!RM()){s.classList.remove('swap');void s.offsetWidth;s.classList.add('swap')}}
  else{shOpenT=Date.now();s.classList.remove('swap','drag','snap');s.style.transform='';s.scrollTop=0;o.classList.remove('hide');document.documentElement.classList.add('shopen')}}
function closeSheet(){const o=$('ov'),s=$('sheet');if(o.classList.contains('hide')){s.innerHTML='';return}
  if(!RM()&&s.innerHTML){try{const g=o.cloneNode(true);g.removeAttribute('id');g.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
    const A=s.querySelectorAll('input,textarea,select'),B=g.querySelectorAll('input,textarea,select');A.forEach((e,i)=>{const x=B[i];if(!x)return;if(e.type==='checkbox'||e.type==='radio')x.checked=e.checked;else x.value=e.value});
    const gs=g.querySelector('.sheet'),m=/translateY\(([-\d.]+)px\)/.exec(s.style.transform||'');gs.style.transform='';gs.classList.remove('drag','snap','swap');if(m)gs.style.setProperty('--dy',m[1]+'px');
    g.classList.add('ghost','out');g.setAttribute('aria-hidden','true');document.body.appendChild(g);gs.scrollTop=s.scrollTop;setTimeout(()=>g.remove(),360)}catch(e){}}
  o.classList.add('hide');s.innerHTML='';s.style.transform='';s.classList.remove('drag','snap','swap');document.documentElement.classList.remove('shopen')}
/* بستن پنجره با کشیدن به پایین (از سربرگ، یا هر جا وقتی محتوا بالای خودش است) */
(()=>{let g=null;
  document.addEventListener('touchstart',e=>{const s=$('sheet');if(e.touches.length!==1||!s||$('ov').classList.contains('hide')||!s.contains(e.target))return;
    const head=e.target.closest('.sh-h')||e.touches[0].clientY-s.getBoundingClientRect().top<34;/* v66.5 (خواسته صاحب اپ: «اسکرول‌ها درست کار نمی‌کند»): هر فهرست داخل پنجره که خودش اسکرول می‌خورد و بالای خودش نیست،
       انگشت را برای خودش نگه می‌دارد (قبلاً فقط چند فهرست نام‌برده مستثنا بودند و بقیه با کشیدن به پایین پنجره را می‌بستند) */
    const sc=!head&&inScr(e.target,s);if(!head&&(s.scrollTop>0||(sc&&sc.scrollTop>0)||e.target.closest('input,textarea,select,.chps,.d6kd,.acpick,.wheels,.swr')))return;
    g={y:e.touches[0].clientY,x:e.touches[0].clientX,t:performance.now(),lk:null,d:0,head:!!head}},{passive:true});
  tmAdd(e=>{if(!g)return;const s=$('sheet'),t=e.touches[0],dy=t.clientY-g.y,dx=t.clientX-g.x;
    if(!g.lk){if(Math.abs(dy)<6&&Math.abs(dx)<6)return;g.lk=dy>0&&dy>Math.abs(dx)*1.1&&(g.head||s.scrollTop<=0)?'v':'x';if(g.lk==='v'){s.classList.add('drag');s.classList.remove('snap')}}
    if(g.lk!=='v')return;e.preventDefault();g.d=Math.max(0,dy);const v=g.d<0?g.d*.3:g.d;s.style.transform=`translateY(${v}px)`;g.v=(g.d)/(performance.now()-g.t)});
  const end=()=>{if(!g)return;const z=g;g=null;const s=$('sheet');if(z.lk!=='v')return;s.classList.remove('drag');
    if(z.d>Math.min(140,s.offsetHeight*.35)||(z.v>.6&&z.d>40)){if(typeof ACT!=='undefined'&&ACT.close)ACT.close();else closeSheet()}
    else{s.classList.add('snap');s.style.transform='';setTimeout(()=>s.classList.remove('snap'),430)}};
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true})})();
function openDate(mode){dpMode=typeof mode==='string'?mode:'';const nw=dpMode==='new',ep=dpMode==='epay',py=dpMode==='pay'||ep;setDp(nw?todayISO():ep?((entRow()||{}).payDate||todayISO()):py?(fPay||payDef()):dateVal,'j');const dw=nw||py?[]:datesWith().slice(0,12);
  sheet(`<div class="sh-h"><b>${py?'تاریخ واریز':nw?'لیست جدید':'تاریخ گزارش'}</b><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="muted" style="font-size:12.5px;margin:-6px 0 10px">${py?'این واریزی برای چه روزی است؟ (لیست همچنان تاریخ امروز را می‌خورد)':nw?'اول تاریخ این لیست را انتخاب کنید؛ همه واریزی‌ها با همین تاریخ ثبت می‌شوند.':'این تاریخ در ثبت، لیست‌ها و تقسیم یکسان است.'}</div>
  <div class="seg"><button class="on" data-act="dtab" data-t="j">شمسی</button><button data-act="dtab" data-t="g">میلادی</button></div>
  <div class="wheels rtl" id="wheels"><div class="wheel" id="wd"></div><div class="wheel" id="wm"></div><div class="wheel" id="wy"></div></div>
  <div class="dprev" id="dprev"></div><div class="row"><button class="btn sec" data-act="today">امروز</button><button class="btn gold" data-act="dok">${nw?'شروع لیست':py?'همین روز':'تأیید'}</button></div>
  ${dw.length?`<div class="sec-h" style="margin-top:16px"><b>تاریخ‌های دارای لیست</b></div><div class="dstrip">${dw.map(x=>`<button class="dpill${x.iso===dateVal?' on':''}${x.bad?' err':''}" data-act="pickDate" data-iso="${x.iso}"><b>${dates(x.iso).fa}</b><small>${fmt(x.n)} واریزی، ${fmt(x.s)}</small></button>`).join('')}</div>`:''}`);
  ['d','m','y'].forEach(w=>$('w'+w).addEventListener('scroll',()=>onWheel(w),{passive:true}));buildWheels();updDp()}
function askConfirm(msg,yes,cb){confirmCb=cb;sheet(`<div class="sh-h"><b>${msg}</b></div><div class="row"><button class="btn sec" data-act="close">انصراف</button><button class="btn red" data-act="yes">${yes}</button></div>`)}
/* ============ رویدادها ============ */
function delEntry(id){const x=entries.find(y=>y.id==id);if(!x)return;trashIds([x.id],'حذف دستی');logA('del','حذف واریزی',x.name+' | '+fmt(x.amount)+' تومان | '+dates(x.entryDate).fa,{ids:[x.id],before:pick(x)});
  const evId=audit[0].id;render();toast('«'+x.name+'» به سطل بازیابی رفت','', 'بازگردانی',()=>undoEv(evId))}
{const _u=updDp;updDp=function(){_u();if(dpMode==='new'&&$('dprev')){const n=entries.filter(e=>e.entryDate===tmpISO).length;$('dprev').insertAdjacentHTML('beforeend',`<div class="dpn">${n?'این تاریخ '+fmt(n)+' واریزی دارد؛ ادامه همان لیست':'لیست خالی؛ از ردیف ۱ شروع می‌شود'}</div>`)}}}
function startList(iso){dateVal=iso;ls.set('m_date',iso);alloc=null;editId=null;go('entry');const n=dayEntries().length;toast(n?'ادامه لیست '+dates(iso).fa+' ('+fmt(n)+' واریزی)':'لیست '+dates(iso).fa+' شروع شد')}
