/* ============ v61.76 (خواسته صاحب اپ): صورتحساب مشتری — خروجی PDF و Excel با اطلاعات کامل ============
   دو دکمه آیکون‌دار کنار عنوان «گردش حساب» در صفحه مشتری (مثل خروجی‌های لیست).
   ردیف‌ها به ترتیب تاریخ (قدیمی → جدید)، اثر هر ردیف (تومان، طلا، ارز/سکه) و مانده بعد از همان ردیف؛ سندها با همه اقلامشان
   (کالا، وزن، عیار، نرخ، اجرت، سود، مبلغ، دریافت/پرداخت). Excel: برگه «صورتحساب» + برگه «اقلام سندها» + مشخصات مشتری. */
function stmtData(c,F){const T=(c.txs||[]).filter(t=>!t.del).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.at0||a.at||'').localeCompare(String(b.at0||b.at||'')));
  const K=new Set();T.forEach(t=>{const d=txD(t);Object.keys(d.x||{}).forEach(k=>{if(+d.x[k])K.add(k)})});const XK=[...K].sort((a,b)=>balRk(a)-balRk(b));
  let R=0,G=0;const X={};const all=T.map((t,i)=>{const d=txD(t);R+=d.r||0;G=Math.round((G+(d.g||0))*1000)/1000;XK.forEach(k=>{X[k]=Math.round(((X[k]||0)+(+(d.x||{})[k]||0))*100)/100});
    return {i:i+1,t,date:t.date,title:stmtTitle(t),desc:stmtDesc(t),lines:stmtLines(t),r:d.r||0,g:d.g||0,x:{...(d.x||{})},R,G,X:{...X}}});
  /* v61.79 (خواسته صاحب اپ): صورتحساب یک بازه تاریخ و جستجو. مانده‌های هر ردیف از کل حساب حساب می‌شوند (نه از اول بازه)؛
     «مانده از قبل» = مانده پیش از روز اول بازه، و کاشی‌های بالا مانده پایان بازه. */
  F=F||{};const f=F.f||'',to=F.t||'',q=stmNorm(F.q||''),dt=o=>String(o.date||'');
  const pre=f?all.filter(o=>dt(o)<f):[],inR=all.filter(o=>(!f||dt(o)>=f)&&(!to||dt(o)<=to)),rows=q?inR.filter(o=>stmHay(o).includes(q)):inR;
  const snap=o=>o?{R:o.R,G:o.G,X:{...o.X}}:{R:0,G:0,X:{}},lastPre=pre[pre.length-1];
  const bal=f||to?snap(inR[inR.length-1]||lastPre):cuBal(c);
  return {c,rows,all:all.length,inN:inR.length,XK,bal,open:f?snap(lastPre):null,F:{f,t:to,q:F.q||''}}}
/* جستجو: شماره سند، نوع، شرح، اقلام، پیگیری، یادداشت — با رقم فارسی/انگلیسی و ی/ک عربی */
const stmNorm=s=>toEn(String(s||'')).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f\u200e]/g,' ').replace(/,/g,'').replace(/\s+/g,' ').trim().toLowerCase();
function stmHay(o){const t=o.t;if(!o._h)o._h=stmNorm([t.no!=null?'سند '+t.no+' '+t.no:'',o.title,o.desc,t.note,t.kind,...o.lines.map(l=>l.join(' ')),...(t.pays||[]).map(p=>[p.tn,p.cuName,p.entName].join(' ')),dates(o.date).fa].join(' '));return o._h}
function stmtTitle(t){if(t.type==='inv')return invTitle(t);if(t.type==='xf')return t.inv?'پرداخت سند مشتری دیگر':'انتقال مانده';if(t.type==='cv')return 'تبدیل '+(t.dir==='g2r'?'طلایی به ریالی':'ریالی به طلایی');return (TXT[t.type]||{t:t.type}).t}
function stmtDesc(t){if(t.type==='inv'){const W=(t.items||[]).reduce((s,i)=>s+(+i.w||0),0);return [(t.items||[]).map(i=>i.k).join('، '),W?wFmt(W)+' گرم':'',t.rate?'مظنه '+fmt(t.mz||Math.round(t.rate*MZK)):''].filter(Boolean).join(' · ')}
  return [t.kind,t.weight?wFmt(t.weight)+' گرم':'',t.ppg?'هر گرم '+fmt(t.ppg):'',t.note].filter(Boolean).join(' · ')}
/* اقلام یک سند: [نوع، شرح، مقدار، واحد، عیار، نرخ، اجرت، سود، مبلغ تومان (+ به نفع ما / − به نفع مشتری)، توضیح] */
function stmtLines(t){if(t.type!=='inv')return [];const L=[],mz=o=>+o.mz||+t.mz||(t.rate?Math.round(t.rate*MZK):0);
  (t.items||[]).forEach(it=>L.push(['فروش',it.k+(it.n?' '+it.n:''),+it.w||0,'گرم',+it.ay||750,mz(it),it.ab?'':ajLab(it),+it.pp?(+it.pp)+'٪':'',+it.tot||0,[it.sh===1?'عیار شرطی ۷۵۰':'',it.lab?'آزمایشگاه '+it.lab:'',it.ang?'انگ '+it.ang:'',it.pz&&+it.cnt?it.cnt+' عدد':''].filter(Boolean).join(' · ')]));
  (t.xr||[]).forEach(x=>{const g=x.a==='gold',q=g?(x.n!=null?x.n:+x.w||0):(x.n!=null?x.n:+x.q||0),amt=x.t==='sell'?+x.amount||0:x.t==='buy'?-(+x.amount||0):0;
    L.push([XT[x.t]||x.t,xrLab(x).replace(/ · (طلبکاریم|بدهکاریم)$/,''),q,g?'گرم':((XA[x.a]||{}).u||''),g?(+x.ay||750):'',x.t==='sell'||x.t==='buy'?(g?mz(x):(+x.pg||'')):'','','',amt,[x.sh===1?'عیار شرطی ۷۵۰':'',x.lab?'آزمایشگاه '+x.lab:'',x.ang?'انگ '+x.ang:'',!amt&&+x.e?(x.e>0?'دریافت ':'تحویل ')+(g?wFmt(Math.abs(x.e))+' گرم ۱۸':qFmt(Math.abs(x.e))+' '+((XA[x.a]||{}).u||'')):''].filter(Boolean).join(' · ')])});
  if(+t.disc)L.push(['تخفیف','تخفیف سند','','','','','','',-(+t.disc),'']);
  (t.pays||[]).forEach(p=>{const a=pAmt(p);L.push([a<0?'پرداخت':'دریافت',pyLab(p,1).replace(/ · (طلبکاریم|بدهکاریم)$/,''),'','','','','','',-a,p.tn?'پیگیری '+p.tn:''])});
  return L}
const stmtFile=(c,F)=>('صورتحساب '+cuName(c)+' ('+(F&&(F.f||F.t)?stmPer({F}):toFa(dates().fa))+')').replace(/[\\/:*?"<>|]/g,'-');
/* ---------- PDF ----------
   v62.0 (خواسته صاحب اپ: «واضح‌تر و قابل فهم از لحاظ حسابداری»): دفتر معین استاندارد —
   برای هر جنس (تومان، طلا به گرم ۱۸ عیار، و هر سکه/ارز) سه ستون «بدهکار · بستانکار · مانده» و تشخیص «بد / بس» کنار مانده.
   بدهکار = مشتری بدهکار می‌شود (فروش به او، پرداخت ما به او، تحویل طلا) — قرمز؛ بستانکار = به نفع مشتری (دریافت از او، خرید از او) — سبز.
   واحد کنار همه عددها؛ ریز هر سند با برچسب رنگی (فروش/پرداخت/تحویل قرمز، خرید/دریافت سبز)؛ جمع گردش هر ستون و مانده پایانی در پایین جدول.
   بالای برگه: برای هر جنس مانده پایانی با تشخیص، و جمع بدهکار و بستانکار همین بازه. */
const stU=k=>k==='r'?'تومان':k==='g'?'گرم':((XA[k]||{}).u||'');
const stNm=k=>k==='r'?'ریالی · تومان':k==='g'?'طلا · گرم ۱۸ عیار':esc((XA[k]||{t:k}).t)+' · '+esc(stU(k));
const stV=(k,v)=>k==='r'?fmt(Math.abs(v)):k==='g'?toFa((Math.round(Math.abs(+v||0)*1000)/1000).toLocaleString('en-US',{minimumFractionDigits:3,maximumFractionDigits:3})):qFmt(Math.abs(v));
const stTK=v=>!v?'':v<0?'<i class="td">بد</i>':'<i class="tc">بس</i>';
function stmtPdfHTML(c,F){const S=stmtData(c,F),D=dates(),b=S.bal,ks=['r','g',...S.XK],land=S.XK.length>0;
  const mv=(o,k)=>k==='r'?o.r:k==='g'?o.g:+(o.x[k]||0),bl=(o,k)=>k==='r'?o.R:k==='g'?o.G:+((o.X||{})[k]||0);
  const num=(k,v,cl)=>v?`<span class="nv ${cl||''}"><bdi>${stV(k,v)}</bdi>${k==='r'?'':`<u>${stU(k)}</u>`}</span>`:'<span class="z">—</span>';
  const tot={};ks.forEach(k=>{tot[k]={d:0,c:0}});S.rows.forEach(o=>ks.forEach(k=>{const v=mv(o,k);if(v<0)tot[k].d+=-v;else if(v>0)tot[k].c+=v}));
  const fin=k=>k==='r'?b.R:k==='g'?b.G:+((b.X||{})[k]||0);
  const card=k=>{const v=fin(k),T=tot[k];return `<div class="kc ${v<0?'d':v>0?'c':'z'}"><div class="kh">${stNm(k)}</div><div class="kv"><bdi>${v?stV(k,v):'۰'}</bdi><u>${stU(k)}</u><em>${!v?'تسویه':v<0?'بدهکار':'بستانکار'}</em></div><div class="kd"><span>بدهکار <b class="rd">${stV(k,T.d)}</b></span><span>بستانکار <b class="gr">${stV(k,T.c)}</b></span></div></div>`};
  const TAG={'فروش':'d','پرداخت':'d','تحویل':'d','خرید':'c','دریافت':'c','تعویض':'c','مرجوعی':'c','تخفیف':'c'};
  const line=l=>{const tg=String(l[0]||''),cl=TAG[tg]||(/پرداخت|تحویل|فروش/.test(tg)?'d':'c'),q=l[2]!==''&&l[2]!=null?(l[3]==='گرم'?wFmt(l[2]):qFmt(l[2]))+' '+esc(l[3]):'';
    return `<div class="dl"><span class="tg ${cl}">${esc(tg)}</span><span class="dd">${esc(l[1])}${q?' · <b>'+q+'</b>':''}${l[4]?' · عیار '+toFa(l[4]):''}${l[5]?' · نرخ '+fmt(l[5]):''}${l[6]&&l[6]!=='۰'?' · اجرت '+esc(l[6]):''}${l[7]?' · سود '+esc(toFa(l[7])):''}${l[9]?' · '+esc(l[9]):''}</span>${l[8]?`<b class="da ${l[8]>0?'rd':'gr'}"><bdi>${fmt(Math.abs(l[8]))}</bdi><u>تومان</u></b>`:'<b class="da"></b>'}</div>`};
  const cells=o=>ks.map(k=>{const v=mv(o,k),B=bl(o,k);return `<td class="am">${v<0?num(k,v,'rd'):'<span class="z">—</span>'}</td><td class="am">${v>0?num(k,v,'gr'):'<span class="z">—</span>'}</td><td class="am bal">${B?`<span class="nv ${B<0?'rd':'bl'}"><bdi>${stV(k,B)}</bdi>${k==='r'?'':`<u>${stU(k)}</u>`}</span>`:'<span class="z">۰</span>'}${stTK(B)}</td>`}).join('');
  const head=`<tr class="g1"><th rowspan="2">#</th><th rowspan="2">تاریخ</th><th rowspan="2" class="ds">شرح</th>${ks.map(k=>`<th colspan="3" class="grp">${stNm(k)}</th>`).join('')}</tr><tr class="g2">${ks.map(()=>'<th>بدهکار</th><th>بستانکار</th><th>مانده</th>').join('')}</tr>`;
  const body=S.rows.map(o=>`<tbody class="${o.lines.length>5?'':'en'}"><tr class="hs"><td class="n">${fmt(o.i)}</td><td class="dt">${esc(dates(o.date).fa)}</td><td class="ds"><span class="nm">${esc(o.title)}</span>${o.desc?`<span class="s">${esc(o.desc)}</span>`:''}</td>${cells(o)}</tr>${o.lines.length?`<tr class="dr"><td></td><td colspan="${ks.length*3+2}"><div class="dls">${o.lines.map(line).join('')}</div></td></tr>`:''}</tbody>`).join('');
  const open=S.open?`<tbody class="en"><tr class="op"><td></td><td class="dt">${esc(dates(isoAdd(S.F.f,-1)).fa)}</td><td class="ds"><span class="nm">مانده از قبل</span><span class="s">نقل از پیش از ${esc(dates(S.F.f).fa)}</span></td>${ks.map(k=>{const B=bl(S.open,k);return `<td class="am"></td><td class="am"></td><td class="am bal">${B?`<span class="nv ${B<0?'rd':'bl'}"><bdi>${stV(k,B)}</bdi><u>${stU(k)}</u></span>`:'<span class="z">۰</span>'}${stTK(B)}</td>`}).join('')}</tr></tbody>`:'';
  const foot=`<tfoot><tr class="ft1"><td colspan="3">جمع گردش ${S.F.f||S.F.t?'این بازه':''}</td>${ks.map(k=>`<td class="am">${num(k,-tot[k].d,'rd')}</td><td class="am">${num(k,tot[k].c,'gr')}</td><td></td>`).join('')}</tr><tr class="ft2"><td colspan="3">مانده ${S.F.f||S.F.t?'پایان بازه':'نهایی'}</td>${ks.map(k=>{const v=fin(k);return `<td colspan="3" class="am bal">${v?`<span class="nv"><bdi>${stV(k,v)}</bdi><u>${stU(k)}</u></span>`:'<span>۰</span>'}<em>${!v?'تسویه':v<0?'بدهکار':'بستانکار'}</em></td>`}).join('')}</tr></tfoot>`;
  const html=`<section class="pg">${pdfTop('صورتحساب مشتری',D)}<h1>${esc(cuName(c))}</h1><div class="sub">${c.phone?'<span class="pdv">'+esc(toFa(c.phone))+'</span>':''}${c.nid?'<span class="rg">کد ملی '+esc(toFa(c.nid))+'</span>':''}${c.grp?'<span class="rg">گروه '+esc(c.grp)+'</span>':''}<span class="rg">${fmt(S.rows.length)} ردیف</span></div>${stmPer(S)?`<div class="per"><span>${esc(stmPer(S))}</span>${S.F.q?`<span>جستجو: «${esc(S.F.q)}»</span>`:''}</div>`:''}<div class="bar"></div>
  <h2>${S.F.f||S.F.t?'مانده پایان بازه':'مانده حساب'}</h2><div class="kcs">${ks.map(card).join('')}</div>
  <div class="lgd"><span><i class="td">بد</i> بدهکار: مشتری به مطلا بدهکار است</span><span><i class="tc">بس</i> بستانکار: مطلا به مشتری بدهکار است</span><span><b class="rd">قرمز</b> فروش، پرداخت، تحویل</span><span><b class="gr">سبز</b> دریافت، خرید</span></div>
  <h2>دفتر حساب</h2><table class="lg2"><colgroup><col style="width:4%"><col style="width:10%"><col>${ks.map(()=>`<col style="width:${land?7:9}%"><col style="width:${land?7:9}%"><col style="width:${land?8:11}%">`).join('')}</colgroup><thead>${head}</thead>${open}${body||`<tbody><tr><td colspan="${ks.length*3+3}" class="emp">در این بازه${S.F.q?' و با این جستجو':''} ردیفی نیست</td></tr></tbody>`}${S.rows.length?foot:''}</table>
  <div class="sign"><div>امضای مشتری</div><div>مهر و امضای مطلا</div></div>${pdfFoot()}</section>`;
  const css=`.pg{max-width:${land?'277mm':'190mm'}}.per{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 2px}.per span{background:#fbf6e8;border:1px solid #ecd9a6;color:#7a5a17;border-radius:8px;padding:2px 9px;font-size:8pt;font-weight:700}
  .rd{color:#c2414b!important}.gr{color:#15803d!important}.bl{color:#1d4ed8!important}.z{color:#b3b8c3}
  .kcs{display:grid;grid-template-columns:repeat(${Math.min(ks.length,4)},1fr);gap:7px;margin:4px 0 8px}.kc{border:1px solid #e7e9ef;border-radius:11px;padding:7px 10px;break-inside:avoid}.kc.d{border-color:#f3c7cc;background:#fff6f7}.kc.c{border-color:#c9d8fb;background:#f5f8ff}
  .kh{font-size:7.4pt;color:#6b7280;font-weight:700}.kv{display:flex;align-items:baseline;gap:4px;margin:2px 0 3px}.kv bdi{font-size:14pt;font-weight:900;unicode-bidi:isolate;direction:ltr}.kc.d .kv bdi{color:#c2414b}.kc.c .kv bdi{color:#1d4ed8}.kv u{text-decoration:none;font-size:7.6pt;color:#6b7280;font-weight:700}
  .kv em{font-style:normal;font-size:7pt;font-weight:800;padding:1px 7px;border-radius:6px;background:#eef0f4;color:#6b7280;margin-inline-start:auto}.kc.d .kv em{background:#fde8ea;color:#b4232f}.kc.c .kv em{background:#e6efff;color:#1d4ed8}
  .kd{display:flex;justify-content:space-between;gap:6px;font-size:7pt;color:#6b7280;border-top:1px dashed #e2e5eb;padding-top:3px}.kd b{font-weight:800;font-feature-settings:"tnum"}
  .lgd{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0 0 6px;font-size:7pt;color:#6b7280}.lgd b{font-weight:800}
  i.td,i.tc,i.tz{font-style:normal;display:inline-block;min-width:18px;text-align:center;font-size:6.4pt;font-weight:900;padding:0 4px;border-radius:4px;margin-inline-start:4px;vertical-align:1px}i.td{background:#fde8ea;color:#b4232f}i.tc{background:#e6efff;color:#1d4ed8}i.tz{color:#b3b8c3}
  table.lg2{width:100%;table-layout:fixed;border-collapse:collapse;font-feature-settings:"tnum"}
  .lg2 th{background:#13284f;color:#fff;font-size:7pt;font-weight:800;padding:4px 3px;text-align:center;border:1px solid #13284f;white-space:nowrap}.lg2 tr.g1 th.grp{background:#1d3b72;border-bottom:1.5px solid #b8862b}.lg2 tr.g2 th{background:#fbf6e8;color:#7a5a17;border-color:#ecd9a6}.lg2 th.ds{text-align:right}
  .lg2 td{font-size:7.8pt;padding:4px 3px;border-bottom:1px solid #eef0f4;vertical-align:top}.lg2 td.am{text-align:left;white-space:nowrap;border-inline-start:1px solid #f1f2f5;font-size:7.4pt}.lg2 td.bal{white-space:normal;line-height:1.35}.lg2 td.bal i{display:inline-block}.lg2 td.bal{background:#fafbfc;font-weight:800}
  .lg2 td.n{color:#8a91a1;text-align:center}.lg2 td.dt{white-space:nowrap;color:#4a5263}.lg2 td.ds{overflow:hidden}.lg2 td.ds .nm{display:block;font-weight:800}.lg2 td.ds .s{display:block;color:#8a91a1;font-size:6.6pt}
  .nv{display:inline-flex;align-items:baseline;gap:2px;white-space:nowrap}.nv bdi{unicode-bidi:isolate;direction:ltr}.nv u{text-decoration:none;font-size:5.8pt;color:#8a91a1;font-weight:600}
  .lg2 tr.dr td{padding-top:0;border-bottom:1px solid #e3e6ec}.dls{border:1px solid #eef0f4;border-radius:7px;background:#fbfbfd;padding:1px 6px}.dl{display:flex;align-items:baseline;gap:6px;padding:2.5px 0;font-size:7pt}.dl+.dl{border-top:1px dotted #e5e7ec}
  .tg{flex:none;font-size:6.4pt;font-weight:900;padding:0 6px;border-radius:5px;min-width:34px;text-align:center}.tg.d{background:#fde8ea;color:#b4232f}.tg.c{background:#e3f5ea;color:#15803d}
  .dd{flex:1;min-width:0;color:#4a5263}.dd b{color:#16213a;font-weight:800}.da{flex:none;white-space:nowrap;font-weight:900;display:inline-flex;gap:2px;align-items:baseline}.da u{text-decoration:none;font-size:5.8pt;color:#8a91a1;font-weight:600}
  .lg2 tr.op td{background:#f6f7fa;font-weight:700}.lg2 td.emp{text-align:center;color:#8a90a0;padding:14px}
  .lg2 tfoot td{font-weight:900;font-size:8pt;padding:5px 3px}.lg2 tr.ft1 td{border-top:1.5px solid #13284f;background:#fbf6e8}.lg2 tr.ft2 td{background:#13284f;color:#fff;border:0}.lg2 tr.ft2 td.am{text-align:center}.lg2 tr.ft2 em{font-style:normal;font-size:6.8pt;font-weight:800;margin-inline-start:6px;padding:0 6px;border-radius:5px;background:rgba(255,255,255,.18)}.lg2 tr.ft2 .nv u{color:#cdd5e6}
  .lg2 thead{display:table-header-group}.lg2 tfoot{display:table-row-group}.lg2 tbody.en{break-inside:avoid;page-break-inside:avoid}.dl{break-inside:avoid}`;
  return pdfDoc(stmtFile(c,S.F),html).replace(/@page\{size:A5 landscape;[^}]*\}/,land?'@page{size:A4 landscape;margin:9mm 10mm}':'@page{size:A4;margin:10mm 10mm}').replace('</head>','<style>'+css+'</style></head>')}
ACT.stmtPdf=()=>{const c=curCu();if(!c)return;const F=stmF(c);if(!stmtData(c,F).rows.length&&!F.f){toast('ردیفی برای این جستجو نیست',true);return}openPrint(()=>stmtPdfHTML(c,F))};
/* ---------- Excel ---------- */
function stmtXlsx(c,F){const S=stmtData(c,F),wb=XLSX.utils.book_new(),XK=S.XK,ks=['r','g',...XK],nm=k=>k==='r'?'تومان':k==='g'?'طلا (گرم)':((XA[k]||{t:k}).t);wb.Workbook={Views:[{RTL:true}]};
  const b=S.bal,info=[['صورتحساب مشتری — مطلا'],['نام',cuName(c)],['تلفن',toEn(c.phone||'')],['کد ملی',toEn(c.nid||'')],['گروه',c.grp||''],['تاریخ گزارش',dates().fa],stmPer(S)?['بازه',stmPer(S)]:[],
    [S.F.f||S.F.t?'مانده پایان بازه':'مانده نهایی',...ks.map(nm)],['مقدار',...ks.map(k=>k==='r'?b.R:k==='g'?b.G:(+(b.X||{})[k]||0))],['راهنما','عدد منفی = مشتری به ما بدهکار است · عدد مثبت = ما به مشتری بدهکاریم'],['وضعیت',...ks.map(k=>{const v=k==='r'?b.R:k==='g'?b.G:(+(b.X||{})[k]||0);return v<0?'بدهکار (مشتری به ما)':v>0?'طلبکار (ما به مشتری)':'تسویه'})],S.F.q?['جستجو',S.F.q,'ستون‌های مانده = مانده کل حساب بعد از همان ردیف']:[]];
  const H=['ردیف','تاریخ','شرح','جزئیات',...ks.map(k=>'اثر '+nm(k)),'مانده تومان','مانده طلا (گرم)',...XK.map(k=>'مانده '+nm(k))];
  const op=S.open?[['',dates(isoAdd(S.F.f,-1)).fa,'مانده از قبل','پیش از '+dates(S.F.f).fa,...ks.map(()=>''),S.open.R,S.open.G,...XK.map(k=>S.open.X[k]||0)]]:[];
  const a=[...info,H,...op,...S.rows.map(o=>[o.i,dates(o.date).fa,o.title,o.desc,...ks.map(k=>k==='r'?o.r:k==='g'?o.g:(+(o.x[k]||0))),o.R,o.G,...XK.map(k=>o.X[k]||0)])];
  const w=XLSX.utils.aoa_to_sheet(a);w['!cols']=[{wch:6},{wch:14},{wch:24},{wch:40},...ks.map(()=>({wch:16})),{wch:18},{wch:14},...XK.map(()=>({wch:12}))];
  const h0=info.length+1;for(let r=h0+1;r<=a.length;r++)for(let ci=4;ci<H.length;ci++){const ref=XLSX.utils.encode_cell({r:r-1,c:ci}),cl=w[ref];if(cl&&typeof cl.v==='number')cl.z=/(طلا)/.test(H[ci])?'#,##0.000':'#,##0'}
  ['B9','C9','D9','E9','F9'].forEach(r=>{if(w[r]&&typeof w[r].v==='number')w[r].z='#,##0.###'});
  XLSX.utils.book_append_sheet(wb,w,'صورتحساب');
  const L=[['ردیف','تاریخ','سند','نوع','شرح','مقدار','واحد','عیار','نرخ (تومان)','اجرت','سود','مبلغ (تومان) · + بدهی مشتری / − به نفع مشتری','توضیح']];
  S.rows.forEach(o=>o.lines.forEach(l=>L.push([o.i,dates(o.date).fa,o.title,l[0],l[1],l[2],l[3],l[4],l[5],l[6],l[7],l[8],l[9]])));
  const w2=XLSX.utils.aoa_to_sheet(L);w2['!cols']=[{wch:6},{wch:14},{wch:16},{wch:10},{wch:30},{wch:10},{wch:8},{wch:7},{wch:14},{wch:12},{wch:8},{wch:16},{wch:30}];
  for(let r=2;r<=L.length;r++){['I','L'].forEach(col=>{const cl=w2[col+r];if(cl&&typeof cl.v==='number')cl.z='#,##0'});const q=w2['F'+r];if(q&&typeof q.v==='number')q.z='#,##0.###'}
  XLSX.utils.book_append_sheet(wb,w2,'اقلام سندها');
  return XLSX.write(wb,{bookType:'xlsx',type:'array'})}
ACT.stmtXls=()=>{const c=curCu();if(!c)return;if(typeof XLSX==='undefined'){toast('برای Excel اینترنت لازم است',true);return}const F=stmF(c);if(!stmtData(c,F).rows.length&&!F.f){toast('ردیفی برای این جستجو نیست',true);return}save(stmtFile(c,F)+'.xlsx',stmtXlsx(c,F),'فایل Excel صورتحساب آماده شد')};

/* ---------- v61.80 (خواسته صاحب اپ): جستجو و بازه تاریخ بیرون، کنار PDF و Excel در صفحه مشتری ----------
   «گردش حساب» همان لحظه با جستجو و بازه فیلتر می‌شود و PDF / Excel همان فیلتر را می‌گیرند.
   بازه: یک دکمه کنار جستجو → پنجره بازه (خلاصه بازه بالا، بازه‌های آماده، از / تا با تقویم). حالت برای هر مشتری در STM. */
let STM={cu:'',f:'',t:'',q:'',k:'all',d:null};
const jIso=(y,m,d)=>{const[a,b,c]=j2g(y,m,d);return a+'-'+p2(b)+'-'+p2(c)};
const stmF=c=>{if(STM.cu!==String(c.id))STM={cu:String(c.id),f:'',t:'',q:'',k:'all',d:null};return {f:STM.f,t:STM.t,q:STM.q.trim()}};
const stmOn=()=>!!(STM.f||STM.t||STM.q.trim());
function stmQk(){const t=todayISO(),[y,m]=g2j(t),pm=m===1?[y-1,12]:[y,m-1],m3=m>2?[y,m-2]:[y-1,m+10],wd=(new Date(t+'T12:00:00').getDay()+1)%7;
  return [['td','امروز',t,t],['yd','دیروز',isoAdd(t,-1),isoAdd(t,-1)],['wk','این هفته',isoAdd(t,-wd),t],['m','این ماه',jIso(y,m,1),t],['pm','ماه قبل',jIso(pm[0],pm[1],1),jIso(pm[0],pm[1],jDays(pm[0],pm[1]))],['m3','۳ ماه اخیر',jIso(m3[0],m3[1],1),t],['y','امسال',jIso(y,1,1),t],['py','سال قبل',jIso(y-1,1,1),jIso(y-1,12,jDays(y-1,12))],['all','همه تاریخ‌ها','','']]}
function stmPer(S){const F=S.F||S;if(!F.f&&!F.t)return '';return F.f&&F.t?(F.f===F.t?'روز '+dates(F.f).fa:'از '+dates(F.f).fa+' تا '+dates(F.t).fa):F.f?'از '+dates(F.f).fa+' تا امروز':'تا '+dates(F.t).fa}
/* برچسب کوتاه دکمه بازه */
function stmLab(){if(!STM.f&&!STM.t)return 'همه تاریخ‌ها';const q=stmQk().find(o=>o[2]===STM.f&&o[3]===STM.t&&o[0]!=='all');if(q)return q[1];const s=v=>{const D=dates(v);return D.fa.replace(/ ۱۴\d\d$|\s[۰-۹]{4}$/,'')};return STM.f&&STM.t?(STM.f===STM.t?s(STM.f):s(STM.f)+' تا '+s(STM.t)):STM.f?'از '+s(STM.f):'تا '+s(STM.t)}
/* نوار جستجو و بازه زیر عنوان «گردش حساب» */
/* v61.97 (خواسته صاحب اپ): مثل بقیه فیلترها — جستجو با دکمه «فیلتر» داخلش، PDF و Excel کنارش؛ ردیف چیپ‌های بازه برداشته شد.
   بازه فعال فقط یک برچسب زیر جستجو (زدن × = همه تاریخ‌ها). پنجره بازه: بازه‌های آماده به شکل فهرست با تیک + از / تا */
function stmBarHTML(c){stmF(c);const n=(STM.f||STM.t)?1:0;
  return `<div class="stmbar"><div class="fsearch stms2">${ic('search')}<input id="stmQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="جستجو…" value="${esc(STM.q)}">${STM.q?`<button type="button" class="x" data-act="stmQClr" aria-label="پاک کردن جستجو">×</button>`:''}<button type="button" class="cufbtn${n?' on':''}" data-act="stmRange" aria-label="بازه تاریخ">${ic('cal')}<span>${n?esc(stmLab()):'بازه'}</span></button></div><button type="button" class="stme" data-act="stmtPdf" aria-label="صورتحساب PDF">${ic('paste')}<span>PDF</span></button><button type="button" class="stme" data-act="stmtXls" aria-label="صورتحساب Excel">${ic('list')}<span>Excel</span></button></div>
`}
/* فهرست گردش حساب (جدید → قدیم) با همان فیلتر؛ «مانده از قبل» ته فهرست وقتی بازه از روزی شروع می‌شود */
function stmListHTML(c){const F=stmF(c),T=(c.txs||[]).filter(t=>!t.del);if(!T.length)return '';
  const S=stmtData(c,F),ids=new Set(S.rows.map(o=>String(o.t.id))),L=T.filter(t=>ids.has(String(t.id))).sort((x,y)=>String(y.date+y.at).localeCompare(String(x.date+x.at)));
  let h='';if(stmOn())h+=`<div class="stmsum"><span><b>${fmt(L.length)}</b> ردیف از ${fmt(T.length)}${stmPer(S)?' · '+esc(stmPer(S)):''}</span><button type="button" class="lnk" data-act="stmClrAll">نمایش همه</button></div>`;
  if(!L.length)return h+`<div class="stmno">${ic('search')}<b>ردیفی پیدا نشد</b><small>${STM.q.trim()?'جستجو را عوض کنید یا ':''}بازه دیگری انتخاب کنید</small></div>`;
  let last=null;h+=L.map(t=>{let d='';if(t.date!==last){last=t.date;const r=relDay(t.date);d=`<div class="fday">${['امروز','دیروز','فردا'].includes(r)?r+'، ':''}${esc(dates(t.date).fa)}</div>`}return d+`<div class="fcard">${txRow(c,t)}</div>`}).join('');
  if(S.open){const o=S.open,v=(k,x)=>x?`<b class="${x>0?'b':'r'}">${balV(k,x)} <i>${balU(k)}</i><small>${ourLab(x)}</small></b>`:'';h+=`<div class="fday">پیش از ${esc(dates(S.F.f).fa)}</div><div class="fcard stmop"><span class="stmopi">${ic('clock')}</span><span class="tx"><b>مانده از قبل</b><small>مانده حساب تا پیش از شروع بازه</small></span><span class="stmopv">${v('r',o.R)||''}${v('g',o.G)||''}${!o.R&&!o.G?'<b class="z">تسویه</b>':''}</span></div>`}
  return h}
function stmRe(){const c=curCu(),el=$('cuTx');if(!c||!el)return;const m=typeof flipSnap==='function'?flipSnap(el):null;el.innerHTML=stmListHTML(c);if(m)flipPlay(el,m);const b=$('stmBar');if(b){const I=$('stmQ'),f=document.activeElement===I,pos=I?I.selectionStart:0;b.innerHTML=stmBarHTML(c);stmBind();if(f){const J=$('stmQ');if(J){J.focus({preventScroll:true});try{J.setSelectionRange(pos,pos)}catch(e){}}}}}
function stmBind(){const I=$('stmQ');if(!I)return;I.oninput=()=>{clearTimeout(I._t);I._t=setTimeout(()=>{STM.q=I.value;const c=curCu(),el=$('cuTx');if(c&&el)el.innerHTML=stmListHTML(c);const x=I.parentNode.querySelector('.stmx0');if(!!STM.q!==!!x){const b=$('stmBar'),pos=I.selectionStart;b.innerHTML=stmBarHTML(c);stmBind();const J=$('stmQ');J.focus({preventScroll:true});try{J.setSelectionRange(pos,pos)}catch(e){}}},140)};I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();I.blur()}}}
ACT.stmQClr=()=>{STM.q='';stmRe()};
ACT.stmClrAll=()=>{STM.q='';STM.f='';STM.t='';stmRe()};
/* پنجره بازه تاریخ: خلاصه بازه بالا (از … تا … · چند روز · چند ردیف)، بازه‌های آماده (زدن = اعمال و بستن)، بازه دلخواه با تقویم */
function stmRangeHTML(){const c=curCu();if(!c)return '';const D=STM.d||{f:STM.f,t:STM.t},Q=stmQk(),on=Q.find(o=>o[2]===D.f&&o[3]===D.t),S=stmtData(c,{f:D.f,t:D.t}),n=D.f&&D.t?Math.round((new Date(D.t+'T12:00:00')-new Date(D.f+'T12:00:00'))/864e5)+1:0;
  const side=(w,l)=>{const v=D[w];return `<button type="button" class="srd${v?' on':''}" data-act="stmCal" data-w="${w}"><small>${l}</small><b>${v?esc(dates(v).fa):w==='f'?'اول حساب':'امروز'}</b><em>${v?esc(dates(v).wd):'بدون محدودیت'}</em>${v?`<i data-act="stmDClr" data-w="${w}" role="button" aria-label="برداشتن">×</i>`:''}</button>`};
  return `<div class="sh-h"><div><b>بازه تاریخ</b><small class="shsub">گردش حساب و صورتحساب «${esc(cuName(c))}»</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="srw"><div class="srn">${n?'<b>'+fmt(n)+'</b> روز · ':''}<b>${fmt(S.rows.length)}</b> ردیف${S.open&&(S.open.R||S.open.G)?' · با «مانده از قبل»':''}</div>
  <div class="f6h">بازه‌های آماده</div><div class="cufg2">${Q.slice().sort((a,b)=>(a[0]==='all')-(b[0]==='all')?(a[0]==='all'?-1:1):0).map(([k,l,f,t])=>`<button type="button" class="cufr${on&&on[0]===k?' on':''}" data-act="stmQk" data-k="${k}"><span class="cufi">${ic(k==='all'?'list':'cal')}</span><span class="tx"><b>${l}</b>${f?`<small>${f===t?esc(dates(f).fa):esc(dates(f).fa)+' تا '+esc(dates(t).fa)}</small>`:''}</span><em>${fmt(stmtData(c,{f,t}).rows.length)}</em><span class="cufc">${ic('check')}</span></button>`).join('')}</div><div class="f6h">بازه دلخواه</div><div class="srs">${side('f','از')}<span class="sra">${ic('back')}</span>${side('t','تا')}</div>
  <button type="button" class="btn gold srgo" data-act="stmApply">${ic('check')} نمایش این بازه</button></div>`}
ACT.stmRange=()=>{const c=curCu();if(!c)return;stmF(c);STM.d={f:STM.f,t:STM.t};sheet(stmRangeHTML())};
/* v61.98 (خواسته صاحب اپ): انتخاب بازه پنجره را نمی‌بندد و بالا نمی‌برد — تیک همان‌جا می‌خورد و گردش پشت پنجره عوض می‌شود */
ACT.stmQk=d=>{const o=stmQk().find(x=>x[0]===d.k);if(!o)return;STM.f=o[2];STM.t=o[3];STM.d=null;stmRe();const S=$('sheet');if(S&&S.querySelector('.srw')&&!$('ov').classList.contains('hide')){STM.d={f:STM.f,t:STM.t};sheetKeep(stmRangeHTML());const on=S.querySelector('.cufr.on');if(on&&!RM()&&on.animate)on.animate([{transform:'scale(.97)'},{transform:'none'}],{duration:260,easing:'cubic-bezier(.3,1.4,.5,1)'})}};
ACT.stmDClr=d=>{if(!STM.d)return;STM.d[d.w]='';sheetKeep(stmRangeHTML())};
ACT.stmCal=d=>{const w=d.w,D=STM.d||(STM.d={f:STM.f,t:STM.t});openCal(D[w]||(w==='f'&&D.t?D.t:todayISO()),iso=>{D[w]=iso;if(D.f&&D.t&&D.f>D.t){if(w==='f')D.t=iso;else D.f=iso}sheet(stmRangeHTML())},{title:w==='f'?'از تاریخ':'تا تاریخ',sub:'بازه گردش حساب',q:[[0,'امروز'],[-1,'دیروز'],[-7,'یک هفته پیش']]})};
ACT.stmApply=()=>{const D=STM.d;if(D){STM.f=D.f||'';STM.t=D.t||''}STM.d=null;closeSheet();stmRe()};
