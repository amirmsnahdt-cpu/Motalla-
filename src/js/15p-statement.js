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
/* ---------- PDF ---------- */
function stmtPdfHTML(c,F){const S=stmtData(c,F),D=dates(),b=S.bal,XK=S.XK,ks=['r','g',...XK];
  const V=(k,v)=>!v?'<span class="z">—</span>':`<span class="${v<0?'rd':'bl'}">${balV(k,v)}</span>`,BL=(k,v)=>!v?'<span class="z">تسویه</span>':`<b class="${v<0?'rd':'bl'}">${balV(k,v)}</b><em>${v<0?'بدهکار':'طلبکار'}</em>`;
  const kp=ks.map(k=>{const v=k==='r'?b.R:k==='g'?b.G:(+(b.X||{})[k]||0);return `<div class="${v<0?'rd':v>0?'ok':''}"><small>${String(balKL(k)).replace(/<[^>]*>/g,'')}</small><b>${v?balV(k,v):'۰'}<em>${v<0?' بدهکار':v>0?' طلبکار':' تسویه'}</em></b></div>`}).join('');
  const head=`<tr><th>#</th><th>تاریخ</th><th>شرح</th>${ks.map(k=>`<th class="am">${k==='r'?'تومان':k==='g'?'طلا (گرم)':esc((XA[k]||{t:k}).t)}</th>`).join('')}<th class="am">مانده تومان</th><th class="am">مانده طلا</th></tr>`;
  const body=S.rows.map(o=>`<tbody${o.lines.length>4?'':' class="en"'}><tr class="hs"><td class="n">${fmt(o.i)}</td><td>${esc(dates(o.date).fa)}</td><td><span class="nm">${esc(o.title)}</span>${o.desc?`<span class="s">${esc(o.desc)}</span>`:''}</td>${ks.map(k=>`<td class="am">${V(k,k==='r'?o.r:k==='g'?o.g:+(o.x[k]||0))}</td>`).join('')}<td class="am">${BL('r',o.R)}</td><td class="am">${BL('g',o.G)}</td></tr>
    ${o.lines.length?`<tr class="stlr"><td></td><td colspan="${ks.length+4}"><div class="stb">${o.lines.map(l=>`<div class="stbr"><span class="stk">${esc(l[0])}</span><span class="std">${esc(l[1])}${l[2]!==''?' · '+(l[3]==='گرم'?wFmt(l[2]):qFmt(l[2]))+' '+esc(l[3]):''}${l[4]?' · عیار '+toFa(l[4]):''}${l[5]?' · نرخ '+fmt(l[5]):''}${l[6]&&l[6]!=='۰'?' · اجرت '+esc(l[6]):''}${l[7]?' · سود '+esc(toFa(l[7])):''}${l[9]?' · '+esc(l[9]):''}</span><b>${l[8]?(l[8]<0?'− ':'')+fmt(Math.abs(l[8])):''}</b></div>`).join('')}</div></td></tr>`:''}</tbody>`).join('');
  const html=`<section class="pg">${pdfTop('صورتحساب مشتری',D)}<h1>${esc(cuName(c))}</h1><div class="sub">${c.phone?'<span class="pdv">'+esc(toFa(c.phone))+'</span>':''}${c.nid?'<span class="rg">کد ملی '+esc(toFa(c.nid))+'</span>':''}${c.grp?'<span class="rg">گروه '+esc(c.grp)+'</span>':''}<span class="rg">${fmt(S.rows.length)} ردیف</span></div>${stmPer(S)?`<div class="per"><span>${esc(stmPer(S))}</span>${S.F.q?`<span>جستجو: «${esc(S.F.q)}»</span>`:''}</div>`:''}<div class="bar"></div>
  <h2>${S.F.f||S.F.t?'مانده پایان بازه':'مانده نهایی'}</h2>
  <div class="kp">${kp}</div>
  <h2>گردش حساب <small>«طلبکار» یعنی ما به مشتری بدهکاریم · «بدهکار» یعنی مشتری به ما بدهکار است${S.F.q?' · ستون مانده، مانده کل حساب بعد از همان ردیف است':''}</small></h2>
  <table class="stm"><thead>${head}</thead>${S.open?`<tbody class="en"><tr class="op"><td></td><td>${esc(dates(isoAdd(S.F.f,-1)).fa)}</td><td><span class="nm">مانده از قبل</span><span class="s">پیش از ${esc(dates(S.F.f).fa)}</span></td>${ks.map(()=>'<td class="am"></td>').join('')}<td class="am">${BL('r',S.open.R)}</td><td class="am">${BL('g',S.open.G)}</td></tr></tbody>`:''}${body||`<tbody><tr><td colspan="${ks.length+5}" class="emp">در این بازه${S.F.q?' و با این جستجو':''} ردیفی نیست</td></tr></tbody>`}</table>
  <div class="sign"><div>امضای مشتری</div><div>مهر و امضای مطلا</div></div>${pdfFoot()}</section>`;
  /* v61.79 (خواسته صاحب اپ): صورتحساب‌ها A4 عمودی */
  return pdfDoc(stmtFile(c,S.F),html).replace(/@page\{size:A5 landscape;[^}]*\}/,'@page{size:A4;margin:10mm 10mm}').replace('</head>','<style>.pg{max-width:190mm}.per{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 2px}.per span{background:#fbf6e8;border:1px solid #ecd9a6;color:#7a5a17;border-radius:8px;padding:2px 9px;font-size:8pt;font-weight:700}.stm tr.op td{background:#f6f7fa;font-weight:700}.stm td.emp{text-align:center;color:#8a90a0;padding:14px}.stm th,.stm td{font-size:8pt;padding:5px 4px}.stm td.am b,.stm td.am span{white-space:nowrap}.stm .rd{color:#c2414b}.stm .bl{color:#1d4ed8}.stm .z{color:#a0a6b2}.stm td.am em{display:block;font-style:normal;font-size:6.4pt;color:#8a90a0}.kp .rd b{color:#c2414b}.kp .ok b{color:#1d4ed8}.kp b em{font-size:7pt}.stm tr.stlr{break-inside:auto;page-break-inside:auto}.stm .stbr{break-inside:avoid}</style></head>')}
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
function stmBarHTML(c){stmF(c);const Q=stmQk(),on=Q.find(o=>o[2]===STM.f&&o[3]===STM.t),cust=(STM.f||STM.t)&&!on,K=['all','td','wk','m','pm','m3','y'];
  const chip=([k,l])=>`<button type="button" class="stc${on&&on[0]===k?' on':''}" data-act="stmQk" data-k="${k}">${k==='all'?'همه':l}</button>`;
  return `<div class="stmbar"><label class="stms">${ic('search')}<input id="stmQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="جستجو در گردش حساب…" value="${esc(STM.q)}">${STM.q?`<button type="button" class="stmx0" data-act="stmQClr" aria-label="پاک کردن جستجو">×</button>`:''}</label><button type="button" class="stme" data-act="stmtPdf" aria-label="صورتحساب PDF">${ic('paste')}<span>PDF</span></button><button type="button" class="stme" data-act="stmtXls" aria-label="صورتحساب Excel">${ic('list')}<span>Excel</span></button></div>
  <div class="stcs" role="group" aria-label="بازه تاریخ">${K.map(k=>Q.find(o=>o[0]===k)).map(chip).join('')}<button type="button" class="stc stcc${cust?' on':''}" data-act="stmRange">${ic('cal')}<span>${cust?esc(stmLab()):'دلخواه…'}</span></button></div>`}
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
  <div class="srw"><div class="srs">${side('f','از')}<span class="sra">${ic('back')}</span>${side('t','تا')}</div>
  <div class="srn">${n?'<b>'+fmt(n)+'</b> روز · ':''}<b>${fmt(S.rows.length)}</b> ردیف${S.open&&(S.open.R||S.open.G)?' · با «مانده از قبل»':''}</div>
  <div class="srl">بازه‌های آماده</div><div class="srq">${Q.map(([k,l])=>`<button type="button" class="srqb${on&&on[0]===k?' on':''}" data-act="stmQk" data-k="${k}">${l}</button>`).join('')}</div>
  <button type="button" class="btn gold srgo" data-act="stmApply">${ic('check')} نمایش این بازه</button></div>`}
ACT.stmRange=()=>{const c=curCu();if(!c)return;stmF(c);STM.d={f:STM.f,t:STM.t};sheet(stmRangeHTML())};
ACT.stmQk=d=>{const o=stmQk().find(x=>x[0]===d.k);if(!o)return;STM.f=o[2];STM.t=o[3];STM.d=null;closeSheet();stmRe()};
ACT.stmDClr=d=>{if(!STM.d)return;STM.d[d.w]='';$('sheet').innerHTML=stmRangeHTML()};
ACT.stmCal=d=>{const w=d.w,D=STM.d||(STM.d={f:STM.f,t:STM.t});openCal(D[w]||(w==='f'&&D.t?D.t:todayISO()),iso=>{D[w]=iso;if(D.f&&D.t&&D.f>D.t){if(w==='f')D.t=iso;else D.f=iso}sheet(stmRangeHTML())},{title:w==='f'?'از تاریخ':'تا تاریخ',sub:'بازه گردش حساب',q:[[0,'امروز'],[-1,'دیروز'],[-7,'یک هفته پیش']]})};
ACT.stmApply=()=>{const D=STM.d;if(D){STM.f=D.f||'';STM.t=D.t||''}STM.d=null;closeSheet();stmRe()};
