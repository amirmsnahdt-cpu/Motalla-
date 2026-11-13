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
  const pre=f?all.filter(o=>dt(o)<f):[],inR=all.filter(o=>(!f||dt(o)>=f)&&(!to||dt(o)<=to)),QD=typeof qDate==='function'?qDate(F.q||''):'',rows=q?inR.filter(o=>QD?dt(o)===QD:stmHit(o,q)):inR;
  const snap=o=>o?{R:o.R,G:o.G,X:{...o.X}}:{R:0,G:0,X:{}},lastPre=pre[pre.length-1];
  const bal=f||to?snap(inR[inR.length-1]||lastPre):cuBal(c);
  return {c,rows,all:all.length,inN:inR.length,XK,bal,open:f?snap(lastPre):null,F:{f,t:to,q:F.q||''}}}
/* جستجو: شماره سند، نوع، شرح، اقلام، پیگیری، یادداشت — با رقم فارسی/انگلیسی و ی/ک عربی */
const stmNorm=s=>toEn(String(s||'')).replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/[\u200c\u200f\u200e]/g,' ').replace(/,/g,'').replace(/\s+/g,' ').trim().toLowerCase();
/* v68.6 (خواسته صاحب اپ): همان قانون جستجوی لیست واریزی — متن، یا عدد (۲ رقم به بالا، با جداکننده یا بی‌جداکننده) در هر عدد ردیف؛ تاریخ («۱۰ آبان»، 1405/08/10، دیروز) = همان روز */
function stmHit(o,q){const H=stmHay(o);if(H.includes(q))return true;const qd=q.replace(/\D/g,'');if(qd.length<2||!/^[\d\s,.\-\/+]+$/.test(q))return false;if(!o._d)o._d=(H.match(/\d[\d.,\/\-]*/g)||[]).map(v=>v.replace(/\D/g,''));return o._d.some(v=>v.includes(qd))}
function stmHay(o){const t=o.t;if(!o._h)o._h=stmNorm([t.no!=null?'سند '+t.no+' '+t.no:'',o.title,o.desc,t.note,t.kind,o.r?Math.abs(o.r):'',o.g?Math.abs(o.g):'',...Object.values(o.x||{}).map(v=>+v?Math.abs(+v):''),t.amount||'',t.total||'',t.weight||'',t.tn||'',...o.lines.map(l=>l.join(' ')),...(t.pays||[]).map(p=>[p.tn,p.cuName,p.entName].join(' ')),dates(o.date).fa].join(' '));return o._h}
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
   v62.2 (خواسته صاحب اپ): دفتر حساب ساده و خوانا از دید مغازه — برای هر جنس سه ستون «طلبکار می‌شویم · بدهکار می‌شویم · مانده»
   و زیر مانده «طلبکاریم» (قرمز، مشتری به ما بدهکار است) یا «بدهکاریم» (آبی، ما به مشتری بدهکاریم). طلا سمت راست، ریالی سمت چپ.
   کادر کم: بدون خط عمودی و قاب دور ریز سند؛ هیچ عددی از خانه‌اش بیرون نمی‌زند (عرض ستون ثابت، شرح چندخطی).
   ریز سند: برچسب رنگی (فروش/پرداخت/تحویل قرمز، خرید/دریافت سبز). پایین: جمع هر ستون و مانده نهایی. */
const stU=k=>k==='r'?'تومان':k==='g'?'گرم':((XA[k]||{}).u||'');
const stNm=k=>k==='r'?'ریالی · تومان':k==='g'?'طلا · گرم ۱۸ عیار':esc((XA[k]||{t:k}).t)+' · '+esc(stU(k));
const stV=(k,v)=>k==='r'?fmt(Math.abs(v)):k==='g'?wPdf(v):qFmt(Math.abs(v));
const stL=v=>!v?'تسویه':v<0?'طلبکاریم':'بدهکاریم';
function stmtPdfHTML(c,F){const S=stmtData(c,F),D=dates(),b=S.bal,ks=['g','r',...S.XK],land=S.XK.length>0;
  const mv=(o,k)=>k==='r'?o.r:k==='g'?o.g:+(o.x[k]||0),bl=(o,k)=>k==='r'?o.R:k==='g'?o.G:+((o.X||{})[k]||0);
  const num=(k,v,cl)=>v?`<span class="nv ${cl||''}"><bdi>${stV(k,v)}</bdi></span>`:'<span class="z">—</span>';
  const balC=(k,B)=>B?`<span class="nv ${B<0?'rd':'bl'}"><bdi>${stV(k,B)}</bdi></span><small class="${B<0?'rd':'bl'}">${stL(B)}</small>`:'<span class="z">۰</span><small class="z">تسویه</small>';
  const tot={};ks.forEach(k=>{tot[k]={d:0,c:0}});S.rows.forEach(o=>ks.forEach(k=>{const v=mv(o,k);if(v<0)tot[k].d+=-v;else if(v>0)tot[k].c+=v}));
  const fin=k=>k==='r'?b.R:k==='g'?b.G:+((b.X||{})[k]||0);
  const card=k=>{const v=fin(k),T=tot[k];return `<div class="kc ${v<0?'d':v>0?'c':'z'}"><div class="kh">${stNm(k)}</div><div class="kv"><bdi>${v?stV(k,v):'۰'}</bdi><u>${stU(k)}</u><em>${stL(v)}</em></div><div class="kd"><span>طلبکار شدیم <b class="rd">${stV(k,T.d)}</b></span><span>بدهکار شدیم <b class="bl">${stV(k,T.c)}</b></span></div></div>`};
  const TAG={'فروش':'d','پرداخت':'d','تحویل':'d','خرید':'c','دریافت':'c','تعویض':'c','مرجوعی':'c','تخفیف':'c'};
  const line=l=>{const tg=String(l[0]||''),cl=TAG[tg]||(/پرداخت|تحویل|فروش/.test(tg)?'d':'c'),q=l[2]!==''&&l[2]!=null?(l[3]==='گرم'?wFmt(l[2]):qFmt(l[2]))+' '+esc(l[3]):'';
    return `<div class="dl"><span class="tg ${cl}">${esc(tg)}</span><span class="dd">${esc(l[1])}${q?' · <b>'+q+'</b>':''}${l[4]?' · عیار '+toFa(l[4]):''}${l[5]?' · نرخ '+fmt(l[5]):''}${l[6]&&l[6]!=='۰'?' · اجرت '+esc(l[6]):''}${l[7]?' · سود '+esc(toFa(l[7])):''}${l[9]?' · '+esc(l[9]):''}</span>${l[8]?`<b class="da ${cl==='d'?'rd':'gr'}"><bdi>${fmt(Math.abs(l[8]))}</bdi><u>تومان</u></b>`:''}</div>`};
  const cells=o=>ks.map((k,gi)=>{const v=mv(o,k),B=bl(o,k);return `<td class="am${gi?' gs':''}">${v<0?num(k,v,'rd'):'<span class="z">—</span>'}</td><td class="am">${v>0?num(k,v,'bl'):'<span class="z">—</span>'}</td><td class="am bal">${balC(k,B)}</td>`}).join('');
  const W=land?{g:[7,7,8],r:[8,8,9],x:[6,6,7]}:{g:[8.5,8.5,10],r:[10,10,12],x:[7,7,8]};
  const cg=`<colgroup><col style="width:4%"><col style="width:${land?8:9}%"><col>${ks.map(k=>(W[k==='r'?'r':k==='g'?'g':'x']).map(w=>`<col style="width:${w}%">`).join('')).join('')}</colgroup>`;
  const head=`<tr class="g1"><th rowspan="2"></th><th rowspan="2">تاریخ</th><th rowspan="2" class="ds">شرح</th>${ks.map((k,gi)=>`<th colspan="3" class="grp ${k==='g'?'gg':k==='r'?'gr2':'gx'}${gi?' gs':''}">${stNm(k)}</th>`).join('')}</tr><tr class="g2">${ks.map((k,gi)=>`<th class="${gi?'gs':''}">طلبکار<br>می‌شویم</th><th>بدهکار<br>می‌شویم</th><th>مانده</th>`).join('')}</tr>`;
  const body=S.rows.map(o=>`<tbody class="${o.lines.length>5?'':'en'}"><tr class="hs"><td class="n">${fmt(o.i)}</td><td class="dt">${esc(dates(o.date).fa)}</td><td class="ds"><span class="nm">${esc(o.title)}</span>${o.desc?`<span class="s">${esc(o.desc)}</span>`:''}</td>${cells(o)}</tr>${o.lines.length?`<tr class="dr"><td></td><td colspan="${ks.length*3+2}"><div class="dls">${o.lines.map(line).join('')}</div></td></tr>`:''}</tbody>`).join('');
  const open=S.open?`<tbody class="en"><tr class="op"><td></td><td class="dt">${esc(dates(isoAdd(S.F.f,-1)).fa)}</td><td class="ds"><span class="nm">مانده از قبل</span><span class="s">نقل از پیش از ${esc(dates(S.F.f).fa)}</span></td>${ks.map((k,gi)=>`<td class="am${gi?' gs':''}"></td><td class="am"></td><td class="am bal">${balC(k,bl(S.open,k))}</td>`).join('')}</tr></tbody>`:'';
  const foot=`<tfoot><tr class="ft1"><td colspan="3">جمع ${S.F.f||S.F.t?'این بازه':'گردش'}</td>${ks.map((k,gi)=>`<td class="am${gi?' gs':''}">${num(k,-tot[k].d,'rd')}</td><td class="am">${num(k,tot[k].c,'bl')}</td><td></td>`).join('')}</tr><tr class="ft2"><td colspan="3">مانده ${S.F.f||S.F.t?'پایان بازه':'نهایی'}</td>${ks.map((k,gi)=>{const v=fin(k);return `<td colspan="3" class="am fb ${v<0?'rd':v>0?'bl':'gr'}${gi?' gs':''}"><span class="nv"><bdi>${v?stV(k,v):'۰'}</bdi><u>${stU(k)}</u></span><em>${stL(v)}</em></td>`}).join('')}</tr></tfoot>`;
  const html=`<section class="pg">${pdfTop('صورتحساب مشتری',D)}${pdfInf([['مشتری',esc((c.title?c.title+' ':'')+cuName(c)),c.nid?'کد ملی '+esc(toFa(c.nid)):'',1],c.phone?['تلفن','<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>','']:null,c.grp?['گروه',esc(c.grp),'']:null,['تعداد سند',fmt(S.rows.length),'']])}${stmPer(S)?`<div class="per"><span>${esc(stmPer(S))}</span>${S.F.q?`<span>جستجو: «${esc(S.F.q)}»</span>`:''}</div>`:''}<div class="bar"></div>
  <h2>${S.F.f||S.F.t?'مانده پایان بازه':'مانده حساب'}</h2><div class="kcs">${ks.map(card).join('')}</div>
  <div class="lgd"><span><b class="rd">طلبکاریم</b> مشتری به مطلا بدهکار است</span><span><b class="bl">بدهکاریم</b> مطلا به مشتری بدهکار است</span><span><i class="tg d">فروش · پرداخت</i> <i class="tg c">دریافت · خرید</i></span></div>
  <h2>دفتر حساب</h2><table class="lg2">${cg}<thead>${head}</thead>${open}${body||`<tbody><tr><td colspan="${ks.length*3+3}" class="emp">در این بازه${S.F.q?' و با این جستجو':''} ردیفی نیست</td></tr></tbody>`}${S.rows.length?foot:''}</table>
  <div class="sign"><div>امضای مشتری</div><div>مهر و امضای مطلا</div></div>${pdfFoot()}</section>`;
  /* v90.8: یک لایه، هم‌خانواده قالب گزارش‌ها (08 pdfCSS) — خانه‌های مانده با خط طلایی بالا، دفتر حساب با خط‌های نازک، مانده نهایی روی نوار کرم */
  const css=`.pg{max-width:${land?'277mm':'190mm'}}.per{display:flex;flex-wrap:wrap;gap:2mm;margin:1.6mm 0 0}.per span{border:.15mm solid #dcc48a;background:#fbf4e1;color:#8a6410;border-radius:99px;padding:.2mm 3mm;font-size:7.2pt;font-weight:700}
  .rd{color:#9b1c31!important}.gr{color:#1d6b4a!important}.bl{color:#1f3f8f!important}.z{color:#b5ab9b!important}
  .kcs{display:grid;grid-template-columns:repeat(${Math.min(ks.length,4)},1fr);gap:1.6mm;margin:1.6mm 0 0}.kc{min-width:0;border:.15mm solid #dcd1bb;border-top:.45mm solid #bf9135;padding:1.2mm 2.6mm 1.4mm;break-inside:avoid}
  .kh{font-size:6.6pt;font-weight:700;color:#8a6a2a}.kv{display:flex;align-items:baseline;gap:1.2mm;margin:.3mm 0 .7mm}.kv bdi{font-size:14pt;font-weight:800;unicode-bidi:isolate;direction:ltr;line-height:1.3;color:#1d6b4a}.kc.d .kv bdi{color:#9b1c31}.kc.c .kv bdi{color:#1f3f8f}
  .kv u{font-size:6.8pt;color:#8d8376;font-weight:500}.kv em{margin-inline-start:auto;font-size:7.2pt;font-weight:800;color:#1d6b4a}.kc.d .kv em{color:#9b1c31}.kc.c .kv em{color:#1f3f8f}
  .kd{display:flex;justify-content:space-between;gap:2mm;font-size:6.6pt;color:#8d8376;border-top:.15mm dotted #cfc3aa;padding-top:.6mm}.kd b{font-weight:700}
  .lgd{display:flex;flex-wrap:wrap;align-items:center;gap:.6mm 4mm;margin:1.4mm 0 0;font-size:6.6pt;color:#5c544a}.lgd b{font-weight:700}
  table.lg2{width:100%;table-layout:fixed;border-collapse:collapse}
  .lg2 th{font-size:6.6pt;font-weight:700;padding:1mm .8mm;text-align:center;line-height:1.3;white-space:normal;border-bottom:0}
  .lg2 tr.g1 th{font-size:7pt;color:#211d18;border-bottom:.2mm solid #bf9135}.lg2 tr.g1 th.gg{color:#8a6410}.lg2 tr.g1 th.gr2{color:#1f3f8f}.lg2 tr.g1 th.ds{text-align:right}
  .lg2 tr.g2 th{font-size:6.2pt;color:#8d8376;border-bottom:.45mm solid #bf9135}
  .lg2 .gs{border-inline-start:.2mm solid #cfc3aa}
  .lg2 td{font-size:7.6pt;padding:1.3mm .8mm;vertical-align:top;border-bottom:0}.lg2 tbody tr.hs td{border-top:.15mm solid #dcd1bb}
  .lg2 td.am{text-align:center;white-space:nowrap;font-size:7.2pt;font-weight:400;overflow:hidden}.lg2 td.bal{font-weight:700}.lg2 td.bal small{display:block;font-size:5.8pt;font-weight:700;margin-top:.2mm}
  .lg2 td.n{color:#8d8376;text-align:center;font-size:6.8pt;width:auto}.lg2 td.dt{white-space:nowrap;color:#5c544a;font-size:7pt}.lg2 td.ds{word-break:break-word;overflow-wrap:anywhere}.lg2 td.ds .nm{display:block;font-weight:700;font-size:8pt}.lg2 td.ds .s{display:block;color:#8d8376;font-size:6.4pt;line-height:1.45}
  .nv{display:inline-block;white-space:nowrap}.nv bdi{unicode-bidi:isolate;direction:ltr}.nv u{font-size:5.8pt;color:#8d8376;font-weight:500;margin-inline-start:.6mm}
  .lg2 tr.dr td{padding-top:0;padding-bottom:1.4mm}.dls{padding:0 1mm 0 0;border-inline-start:.45mm solid #e6d9b8}.dl{display:flex;align-items:baseline;gap:1.6mm;padding:.35mm 1.6mm;font-size:6.7pt;break-inside:avoid}
  .tg{flex:none;font-size:6pt;font-weight:700;padding:0 1.6mm;border-radius:99px;min-width:9mm;text-align:center;display:inline-block;border:.15mm solid #cfc6b6}.tg.d{color:#9b1c31;border-color:#dba5ae;background:#fbeef0}.tg.c{color:#1d6b4a;border-color:#9cc7b3;background:#eef7f2}
  .dd{flex:1;min-width:0;color:#5c544a;overflow-wrap:anywhere}.dd b{color:#211d18;font-weight:700}.da{flex:none;white-space:nowrap;font-weight:700}.da u{font-size:5.6pt;color:#8d8376;font-weight:500;margin-inline-start:.6mm}
  .lg2 tr.op td{background:#faf6ec;font-weight:500}.lg2 td.emp{text-align:center;color:#8d8376;padding:5mm}
  .lg2 tfoot td{font-weight:700;font-size:7.6pt;padding:1.5mm .8mm}.lg2 tr.ft1 td{border-top:.45mm solid #bf9135}
  .lg2 tr.ft2 td{background:#f4ecd8;border-top:.2mm solid #bf9135;border-bottom:.2mm solid #4a4238}.lg2 tr.ft2 td.fb{text-align:center}.lg2 tr.ft2 .nv bdi{font-size:10pt;font-weight:800}.lg2 tr.ft2 em{font-size:6.6pt;font-weight:800;margin-inline-start:1.6mm}
  .lg2 thead{display:table-header-group}.lg2 tfoot{display:table-row-group}.lg2 tbody.en{break-inside:avoid;page-break-inside:avoid}`;
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
function stmBind(){const I=$('stmQ');if(!I)return;I.oninput=()=>{clearTimeout(I._t);I._t=setTimeout(()=>{STM.q=I.value;const c=curCu(),el=$('cuTx');if(c&&el)el.innerHTML=stmListHTML(c);/* v68.6: دکمه × بدون ساختن دوباره کادر (قبلاً هر حرف کادر از نو ساخته می‌شد و کیبورد عددی آیفون به حروف برمی‌گشت) */const x=I.parentNode.querySelector('.x');if(STM.q&&!x)I.insertAdjacentHTML('afterend','<button type="button" class="x" data-act="stmQClr" aria-label="پاک کردن جستجو">×</button>');else if(!STM.q&&x)x.remove()},140)};I.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();I.blur()}}}
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
