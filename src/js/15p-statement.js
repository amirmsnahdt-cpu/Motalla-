/* ============ v61.76 (خواسته صاحب اپ): صورتحساب مشتری — خروجی PDF و Excel با اطلاعات کامل ============
   دو دکمه آیکون‌دار کنار عنوان «گردش حساب» در صفحه مشتری (مثل خروجی‌های لیست).
   ردیف‌ها به ترتیب تاریخ (قدیمی → جدید)، اثر هر ردیف (تومان، طلا، ارز/سکه) و مانده بعد از همان ردیف؛ سندها با همه اقلامشان
   (کالا، وزن، عیار، نرخ، اجرت، سود، مبلغ، دریافت/پرداخت). Excel: برگه «صورتحساب» + برگه «اقلام سندها» + مشخصات مشتری. */
function stmtData(c){const T=(c.txs||[]).filter(t=>!t.del).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.at0||a.at||'').localeCompare(String(b.at0||b.at||'')));
  const K=new Set();T.forEach(t=>{const d=txD(t);Object.keys(d.x||{}).forEach(k=>{if(+d.x[k])K.add(k)})});const XK=[...K].sort((a,b)=>balRk(a)-balRk(b));
  let R=0,G=0;const X={};const rows=T.map((t,i)=>{const d=txD(t);R+=d.r||0;G=Math.round((G+(d.g||0))*1000)/1000;XK.forEach(k=>{X[k]=Math.round(((X[k]||0)+(+(d.x||{})[k]||0))*100)/100});
    return {i:i+1,t,date:t.date,title:stmtTitle(t),desc:stmtDesc(t),lines:stmtLines(t),r:d.r||0,g:d.g||0,x:{...(d.x||{})},R,G,X:{...X}}});
  return {c,rows,XK,bal:cuBal(c)}}
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
const stmtFile=c=>('صورتحساب '+cuName(c)+' ('+toFa(dates().fa)+')').replace(/[\\/:*?"<>|]/g,'-');
/* ---------- PDF ---------- */
function stmtPdfHTML(c){const S=stmtData(c),D=dates(),b=S.bal,XK=S.XK,ks=['r','g',...XK];
  const V=(k,v)=>!v?'<span class="z">—</span>':`<span class="${v<0?'rd':'bl'}">${balV(k,v)}</span>`,BL=(k,v)=>!v?'<span class="z">تسویه</span>':`<b class="${v<0?'rd':'bl'}">${balV(k,v)}</b><em>${v<0?'بدهکار':'طلبکار'}</em>`;
  const kp=ks.map(k=>{const v=k==='r'?b.R:k==='g'?b.G:(+(b.X||{})[k]||0);return `<div class="${v<0?'rd':v>0?'ok':''}"><small>${String(balKL(k)).replace(/<[^>]*>/g,'')}</small><b>${v?balV(k,v):'۰'}<em>${v<0?' بدهکار':v>0?' طلبکار':' تسویه'}</em></b></div>`}).join('');
  const head=`<tr><th>#</th><th>تاریخ</th><th>شرح</th>${ks.map(k=>`<th class="am">${k==='r'?'تومان':k==='g'?'طلا (گرم)':esc((XA[k]||{t:k}).t)}</th>`).join('')}<th class="am">مانده تومان</th><th class="am">مانده طلا</th></tr>`;
  const body=S.rows.map(o=>`<tbody${o.lines.length>4?'':' class="en"'}><tr class="hs"><td class="n">${fmt(o.i)}</td><td>${esc(dates(o.date).fa)}</td><td><span class="nm">${esc(o.title)}</span>${o.desc?`<span class="s">${esc(o.desc)}</span>`:''}</td>${ks.map(k=>`<td class="am">${V(k,k==='r'?o.r:k==='g'?o.g:+(o.x[k]||0))}</td>`).join('')}<td class="am">${BL('r',o.R)}</td><td class="am">${BL('g',o.G)}</td></tr>
    ${o.lines.length?`<tr class="stlr"><td></td><td colspan="${ks.length+4}"><div class="stb">${o.lines.map(l=>`<div class="stbr"><span class="stk">${esc(l[0])}</span><span class="std">${esc(l[1])}${l[2]!==''?' · '+(l[3]==='گرم'?wFmt(l[2]):qFmt(l[2]))+' '+esc(l[3]):''}${l[4]?' · عیار '+toFa(l[4]):''}${l[5]?' · نرخ '+fmt(l[5]):''}${l[6]&&l[6]!=='۰'?' · اجرت '+esc(l[6]):''}${l[7]?' · سود '+esc(toFa(l[7])):''}${l[9]?' · '+esc(l[9]):''}</span><b>${l[8]?(l[8]<0?'− ':'')+fmt(Math.abs(l[8])):''}</b></div>`).join('')}</div></td></tr>`:''}</tbody>`).join('');
  const html=`<section class="pg">${pdfTop('صورتحساب مشتری',D)}<h1>${esc(cuName(c))}</h1><div class="sub">${c.phone?'<span class="pdv">'+esc(toFa(c.phone))+'</span>':''}${c.nid?'<span class="rg">کد ملی '+esc(toFa(c.nid))+'</span>':''}${c.grp?'<span class="rg">گروه '+esc(c.grp)+'</span>':''}<span class="rg">${fmt(S.rows.length)} ردیف</span></div><div class="bar"></div>
  <div class="kp">${kp}</div>
  <h2>گردش حساب <small>«طلبکار» یعنی ما به مشتری بدهکاریم · «بدهکار» یعنی مشتری به ما بدهکار است</small></h2>
  <table class="stm"><thead>${head}</thead>${body||'<tbody><tr><td colspan="9">ردیفی نیست</td></tr></tbody>'}</table>
  <div class="sign"><div>امضای مشتری</div><div>مهر و امضای مطلا</div></div>${pdfFoot()}</section>`;
  return pdfDoc(stmtFile(c),html).replace('</head>','<style>.stm th,.stm td{font-size:7.6pt;padding:5px 4px}.stm td.am b,.stm td.am span{white-space:nowrap}.stm .rd{color:#c2414b}.stm .bl{color:#1d4ed8}.stm .z{color:#a0a6b2}.stm td.am em{display:block;font-style:normal;font-size:6.4pt;color:#8a90a0}.kp .rd b{color:#c2414b}.kp .ok b{color:#1d4ed8}.kp b em{font-size:7pt}.stm tr.stlr{break-inside:auto;page-break-inside:auto}.stm .stbr{break-inside:avoid}</style></head>')}
ACT.stmtPdf=()=>{const c=curCu();if(!c)return;openPrint(()=>stmtPdfHTML(c))};
/* ---------- Excel ---------- */
function stmtXlsx(c){const S=stmtData(c),wb=XLSX.utils.book_new(),XK=S.XK,ks=['r','g',...XK],nm=k=>k==='r'?'تومان':k==='g'?'طلا (گرم)':((XA[k]||{t:k}).t);wb.Workbook={Views:[{RTL:true}]};
  const b=S.bal,info=[['صورتحساب مشتری — مطلا'],['نام',cuName(c)],['تلفن',toEn(c.phone||'')],['کد ملی',toEn(c.nid||'')],['گروه',c.grp||''],['تاریخ گزارش',dates().fa],[],
    ['مانده نهایی',...ks.map(nm)],['مقدار',...ks.map(k=>k==='r'?b.R:k==='g'?b.G:(+(b.X||{})[k]||0))],['راهنما','عدد منفی = مشتری به ما بدهکار است · عدد مثبت = ما به مشتری بدهکاریم'],['وضعیت',...ks.map(k=>{const v=k==='r'?b.R:k==='g'?b.G:(+(b.X||{})[k]||0);return v<0?'بدهکار (مشتری به ما)':v>0?'طلبکار (ما به مشتری)':'تسویه'})],[]];
  const H=['ردیف','تاریخ','شرح','جزئیات',...ks.map(k=>'اثر '+nm(k)),'مانده تومان','مانده طلا (گرم)',...XK.map(k=>'مانده '+nm(k))];
  const a=[...info,H,...S.rows.map(o=>[o.i,dates(o.date).fa,o.title,o.desc,...ks.map(k=>k==='r'?o.r:k==='g'?o.g:(+(o.x[k]||0))),o.R,o.G,...XK.map(k=>o.X[k]||0)])];
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
ACT.stmtXls=()=>{const c=curCu();if(!c)return;if(typeof XLSX==='undefined'){toast('برای Excel اینترنت لازم است',true);return}save(stmtFile(c)+'.xlsx',stmtXlsx(c),'فایل Excel صورتحساب آماده شد')};
