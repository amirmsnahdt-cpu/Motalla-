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
    L.push([XT[x.t]||x.t,xrLab(x).replace(/ · (طلبکاریم|بدهکاریم)$/,''),q,g?'گرم':((XA[x.a]||{}).u||''),g?(+x.ay||750):'',x.t==='sell'||x.t==='buy'?(g?mz(x):(+x.pg||'')):'','','',amt,[x.sh===1?'عیار شرطی ۷۵۰':'',x.lab?'آزمایشگاه '+x.lab:'',x.ang?'انگ '+x.ang:'',!amt&&+x.e?(x.e>0?'دریافت ':'تحویل ')+(g?wFmt(Math.abs(x.e))+' گرم ۱۸':qFmt(Math.abs(x.e))+' '+((XA[x.a]||{}).u||'')):''].filter(Boolean).join(' · '),!amt&&+x.e?(g?wFmt(Math.abs(x.e))+' گرم ۷۵۰':qFmt(Math.abs(x.e))+' '+((XA[x.a]||{}).u||'')):''])});
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
const stV=(k,v)=>k==='r'?fmt(Math.abs(v)):k==='g'?wFmt(Math.abs(v)):qFmt(Math.abs(v));
const stL=v=>!v?'تسویه':v<0?'طلبکاریم':'بدهکاریم';
/* v92.7 (خواسته صاحب اپ: «لیست نباید این‌قدر پیچیده باشد؛ مانده نهایی‌ها مشخص باشد؛ کادر و بوردرها اصلاً مشخص نیست»):
   صورتحساب ساده — بالا کادر پررنگ «مانده نهایی حساب»، بعد یک جدول تمام‌خط‌کشی که هر سند یک ردیف آن است، و ردیف آخر «مانده نهایی حساب».
   v92.8 (خواسته صاحب اپ: «فروش و خرید و پرداخت و دریافت در لیست کنار هم، زیر هم ستون شود؛ برای PDF هم قسمتی که بشود ادیت کرد چه چیزهایی بیاید، در تنظیمات فاکتور»):
   مبلغ هر سند در ستون خودش می‌نشیند — فروش | خرید | دریافت | پرداخت | مانده — و همه‌چیز برگه از «تنظیمات فاکتور › صورت‌حساب» روشن و خاموش می‌شود.
   تنظیم‌ها (STMD؛ فقط فرق با پیش‌فرض در cfg.stm ذخیره و همگام می‌شود؛ stmClean هر مقدار خراب را به پیش‌فرض برمی‌گرداند):
     paper a خودکار / p عمودی / l افقی · fs اندازه نوشته · lg لوگو · ph تلفن · nid کد ملی · grp گروه · cnt تعداد سند
     fb کادر مانده نهایی بالا · fbs جمله زیر عدد · csl/cby/cin/cout ستون‌های فروش/خرید/دریافت/پرداخت · cdv ستون «این سند» (خالص) · cbl ستون مانده
     gd ستون‌های طلا (a = وقتی حساب طلا دارد / y / n) · gdv «این سند» طلا · cx سکه و ارز · s1 ردیف‌های کالا · s2 ردیف‌های دریافت/پرداخت · da مبلغ هر ردیف · mz مظنه سند
   v92.9 (خواسته صاحب اپ: «PDF خیلی بد شد، همان قبلی بهتر بود ولی باید بهتر شود»): پیش‌فرض دوباره همان جدول ساده (این سند + مانده) است و چهار ستون فروش/خرید/دریافت/پرداخت
   فقط یک گزینه خاموش در تنظیمات؛ ریز هر سند زیر عنوانش مرتب و ستونی می‌آید: «نوع | شرح | مبلغ» زیر هم (dlH)، بدون برچسب رنگی و بدون جمله درهم
     tot ردیف جمع ستون‌ها · fr ردیف مانده نهایی · lgd راهنما · sg جای امضا · note یادداشت پایین برگه */
const STMD={paper:'a',fs:0,lg:1,ph:1,nid:1,grp:1,cnt:1,fb:1,fbs:1,csl:0,cby:0,cin:0,cout:0,cdv:1,cbl:1,gd:'a',gdv:1,cx:1,s1:1,s2:1,da:1,mz:0,tot:1,fr:1,lgd:1,sg:1,note:''},STME={paper:['a','p','l'],gd:['a','y','n']},STMN={fs:[-1,2]};
function stmClean(o){const r={};for(const k in STMD){const d=STMD[k],v=o?o[k]:undefined;if(STME[k])r[k]=STME[k].includes(v)?v:d;else if(STMN[k]){const n=Math.round(+v);r[k]=isFinite(n)&&v!==''&&v!=null?Math.min(STMN[k][1],Math.max(STMN[k][0],n)):d}else if(typeof d==='string')r[k]=typeof v==='string'?clean(v).slice(0,170):d;else r[k]=v==null?d:(v?1:0)}
  if(!r.csl&&!r.cby&&!r.cin&&!r.cout&&!r.cdv)r.cbl=1;return r}
const stmCfg=()=>stmClean({...STMD,...((cfgRec()||{}).stm||{})});
/* خلاصه یک سند: [خط کالاها، خط روش‌های دریافت/پرداخت] و مبلغ تومانی هر دسته {s فروش، b خرید، i دریافت، o پرداخت} */
function stmtSum(t,amt){const L=stmtLines(t),G=[],P={'دریافت':[0,[]],'پرداخت':[0,[]]},C={s:0,b:0,i:0,o:0};
  L.forEach(l=>{const tg=String(l[0]||''),q=l[2]!==''&&l[2]!=null,a=+l[8]||0;if(q||!P[tg]){const nm=String(l[1]||''),pre=/^(فروش|خرید|تحویل|دریافت|تعویض|مرجوعی|مانده)/.test(nm)?'':tg+' ';G.push(pre+nm+(q?' '+(l[3]==='گرم'?wFmt(l[2]):qFmt(l[2]))+' '+l[3]:'')+(tg==='تخفیف'&&a?' '+fmt(Math.abs(a)):''));if(tg==='تخفیف')C.i+=Math.abs(a);else if(a>0)C.s+=a;else if(a<0)C.b+=-a;return}
    let m=String(l[1]||'').replace(/^(دریافت|پرداخت)\s+/,'');const x=m.split(' · ');m=/^(اضافه|کسر)$/.test(x[0])&&x[1]?x[1]:x[0];P[tg][0]+=Math.abs(a);C[tg==='دریافت'?'i':'o']+=Math.abs(a);if(m&&!P[tg][1].includes(m))P[tg][1].push(m)});
  const pl=k=>P[k][0]?k+(amt?' '+fmt(P[k][0])+' تومان'+(P[k][1].length?' ('+P[k][1].join('، ')+')':''):P[k][1].length?': '+P[k][1].join('، '):''):'';
  return {g:G.join(' · '),p:[pl('دریافت'),pl('پرداخت')].filter(x=>x&&x!=='دریافت'&&x!=='پرداخت').join(' · '),C}}
/* دسته‌های تومانی یک ردیف صورتحساب؛ هر اثر تومانی که در چهار دسته نیامده (انتقال، تبدیل، سند قدیمی…) به دریافت یا پرداخت می‌رود تا جمع ستون‌ها همیشه با مانده بخواند */
function stmtCats(o,sm){const C=sm?{...sm.C}:{s:0,b:0,i:0,o:0},e=Math.round((o.r||0)-(-C.s+C.b+C.i-C.o));if(e>0)C.i+=e;else if(e<0)C.o+=-e;return C}
function stmtPdfHTML(c,F,O){const S=stmtData(c,F),D=dates(),b=S.bal,Z=O&&O.S?stmClean({...STMD,...O.S}):stmCfg(),rng=!!(S.F.f||S.F.t),fz=1+Z.fs*.08,z=n=>+(n*fz).toFixed(2);
  const mv=(o,k)=>k==='r'?o.r:k==='g'?o.g:+(o.x[k]||0),bl=(o,k)=>k==='r'?o.R:k==='g'?o.G:+((o.X||{})[k]||0);
  const fin=k=>k==='r'?b.R:k==='g'?b.G:+((b.X||{})[k]||0),kn=k=>k==='r'?'مبلغ':k==='g'?'طلا':esc((XA[k]||{t:k}).t);
  const gOn=Z.gd==='y'||(Z.gd==='a'&&(!!fin('g')||S.rows.some(o=>o.g||o.G)||!!(S.open&&S.open.G)));
  const ks=[...(gOn?['g']:[]),'r',...(Z.cx?S.XK:[])],XS=ks.filter(k=>k!=='r');
  /* ستون‌های هر جنس: [کلید، سرستون، کلاس رنگ] */
  const RC=[...(Z.csl?[['s','فروش','rd']]:[]),...(Z.cby?[['b','خرید','bl']]:[]),...(Z.cin?[['i','دریافت','bl']]:[]),...(Z.cout?[['o','پرداخت','rd']]:[]),...(Z.cdv?[['d','این سند','']]:[]),...(Z.cbl?[['B','مانده','']]:[])];
  const KC=k=>k==='r'?RC:[...(Z.gdv||k!=='g'?[['d','این سند','']]:[]),['B','مانده','']];
  const say=v=>!v?'حساب این بخش صاف است':v<0?'مشتری به مطلا بدهکار است':'مطلا به مشتری بدهکار است';
  const card=k=>{const v=fin(k);return `<div class="fk ${v<0?'d':v>0?'c':'z'}"><div class="fkh"><b>${kn(k)}</b><u>${esc(stU(k))}</u></div><div class="fkv"><bdi>${v?stV(k,v):'۰'}</bdi><em>${stL(v)}</em></div>${Z.fbs?`<div class="fks">${say(v)}</div>`:''}</div>`};
  const dC=(k,v)=>v?`<bdi class="${v<0?'rd':'bl'}">${stV(k,v)}</bdi><small class="${v<0?'rd':'bl'}">${v<0?'طلبکار شدیم':'بدهکار شدیم'}</small>`:'<span class="z">—</span>';
  const bC=(k,B)=>B?`<bdi class="${B<0?'rd':'bl'}">${stV(k,B)}</bdi><small class="${B<0?'rd':'bl'}">${stL(B)}</small>`:'<bdi class="gr">۰</bdi><small class="gr">تسویه</small>';
  const aC=(v,cl)=>v?`<bdi class="${cl}">${fmt(Math.round(v))}</bdi>`:'<span class="z">—</span>';
  /* مانده صفرِ جنسی که هنوز در این حساب گردشی نداشته خط تیره است (نه «تسویه») تا جدول شلوغ نشود */
  const seen={};if(S.open)ks.forEach(k=>{if(bl(S.open,k))seen[k]=1});
  const R=S.rows.map(o=>{const sm=o.t.type==='inv'?stmtSum(o.t,!(Z.cin||Z.cout)):null,C=stmtCats(o,sm);return {o,sm,C}}),T={s:0,b:0,i:0,o:0};R.forEach(x=>{for(const q in T)T[q]+=x.C[q]});
  const cells=x=>ks.map(k=>{const v=mv(x.o,k),B=bl(x.o,k);if(v||B)seen[k]=1;return KC(k).map(([q,,cl])=>q==='d'?`<td class="dv">${dC(k,v)}</td>`:q==='B'?`<td class="bv">${B||seen[k]?bC(k,B):'<span class="z">—</span>'}</td>`:`<td class="cv">${aC(x.C[q],cl)}</td>`).join('')}).join('');
  /* پهنای ستون‌ها از بلندترین عدد هر ستون (میلی‌متر)؛ کاغذ خودکار: عمودی اگر برای شرح دست‌کم ۴۴ میلی‌متر بماند، وگرنه افقی */
  const tw=t=>{let w=0;for(const ch of String(t))w+=/[۰-۹0-9]/.test(ch)?1.72:/[,.٬٫]/.test(ch)?.9:1.3;return w*fz},cw=(L,mn,f)=>Math.max(mn*Math.min(1,fz),Math.ceil((Math.max(0,...L.map(tw))*(f||1)+3.6)*2)/2);
  const CWm={};ks.forEach(k=>KC(k).forEach(([q,h])=>{const L=q==='d'?S.rows.map(o=>stV(k,mv(o,k))):q==='B'?S.rows.map(o=>stV(k,bl(o,k))):R.map(x=>fmt(Math.round(x.C[q])));CWm[k+q]=Math.max(cw(L,k==='r'?(q==='B'?19:15):q==='B'?13:12.5,q==='B'?1.08:1),'sbio'.includes(q)&&Z.tot?cw([fmt(Math.round(T[q]))],0,.95):0)}));
  const NW=7.5*Math.max(1,fz),DW=16.5*fz,fixed=NW+DW+Object.values(CWm).reduce((a,v)=>a+v,0),land=Z.paper==='l'||(Z.paper==='a'&&190-fixed<40),PW=land?277:190,pc=v=>(v/PW*100).toFixed(2);
  const cg=`<colgroup><col style="width:${pc(NW)}%"><col style="width:${pc(DW)}%"><col>${ks.map(k=>KC(k).map(([q])=>`<col style="width:${pc(CWm[k+q])}%">`).join('')).join('')}</colgroup>`,NC=3+ks.reduce((a,k)=>a+KC(k).length,0);
  const head=`<tr class="g1"><th rowspan="2">ردیف</th><th rowspan="2">تاریخ</th><th rowspan="2" class="ds">شرح سند</th>${ks.map(k=>`<th colspan="${KC(k).length}" class="grp">${kn(k)} <u>${esc(stU(k))}</u></th>`).join('')}</tr><tr class="g2">${ks.map(k=>KC(k).map(([q,h,cl])=>`<th class="${cl} ${q==='B'?'hb':''}">${h}</th>`).join('')).join('')}</tr>`;
  /* ریز سند: هر قلم یک خط با سه ستون هم‌راستا — نوع (فروش/خرید/دریافت/پرداخت/تحویل)، شرح و مقدار، مبلغ (یا وزن ۷۵۰ برای طلای بی‌قیمت) */
  const RDT=/^(فروش|پرداخت|تحویل)/,dlH=l=>{const tg=String(l[0]||''),pay=l[2]===''||l[2]==null,rd=RDT.test(tg);let nm=String(l[1]||'').replace(/^(فروش|خرید|دریافت|پرداخت|تحویل)\s+/,'');
    const q=!pay?(l[3]==='گرم'?wFmt(l[2]):qFmt(l[2]))+' '+l[3]:'',a=+l[8]||0,e=String(l[10]||'').split(' '),am=a?`<bdi>${fmt(Math.abs(a))}</bdi>`:e[0]?`<bdi>${esc(toFa(e[0]))}</bdi> <small>${esc(toFa(e.slice(1).join(' ')))}</small>`:'';if(/^(اضافه|کسر) · /.test(nm))nm=nm.replace(/^(اضافه|کسر) · /,'');
    return `<span class="dl"><em class="${rd?'rd':'bl'}">${esc(tg)}</em><i>${esc(toFa(nm))}${q?` <b>${esc(toFa(q))}</b>`:''}</i>${Z.da?`<u>${am}</u>`:''}</span>`};
  const body=R.map(x=>{const o=x.o,inv=o.t.type==='inv',L=inv?stmtLines(o.t).filter(l=>(l[2]===''||l[2]==null)&&String(l[0])!=='تخفیف'?Z.s2:Z.s1):[];
    return `<tbody class="en"><tr class="hs"><td class="n">${fmt(o.i)}</td><td class="dt">${esc(dates(o.date).fa)}</td><td class="ds"><span class="nm">${esc(o.title)}${Z.mz&&o.t.rate?` <small>مظنه ${fmt(o.t.mz||Math.round(o.t.rate*MZK))}</small>`:''}</span>${L.length?`<span class="dls">${L.map(dlH).join('')}</span>`:!inv&&Z.s1&&o.desc?`<span class="s">${esc(toFa(o.desc))}</span>`:''}</td>${cells(x)}</tr></tbody>`}).join('');
  const open=S.open?`<tbody class="en"><tr class="op"><td class="n"></td><td class="dt">${esc(dates(isoAdd(S.F.f,-1)).fa)}</td><td class="ds"><span class="nm">مانده از قبل</span><span class="s">نقل از پیش از ${esc(dates(S.F.f).fa)}</span></td>${ks.map(k=>KC(k).map(([q])=>q==='B'?`<td class="bv">${bC(k,bl(S.open,k))}</td>`:'<td></td>').join('')).join('')}</tr></tbody>`:'';
  const totR=Z.tot&&RC.some(c=>'sbio'.includes(c[0]))?`<tr class="ft1"><td colspan="3">جمع ${rng?'این بازه':'ستون‌ها'}</td>${ks.map(k=>KC(k).map(([q,,cl])=>k==='r'&&'sbio'.includes(q)?`<td class="cv">${aC(T[q],cl)}</td>`:'<td></td>').join('')).join('')}</tr>`:'';
  const finR=Z.fr?`<tr class="ft2"><td colspan="3">مانده ${rng?'پایان بازه':'نهایی حساب'}</td>${ks.map(k=>{const v=fin(k);return `<td colspan="${KC(k).length}" class="fb ${v<0?'rd':v>0?'bl':'gr'}"><span><bdi>${v?stV(k,v):'۰'}</bdi> <u>${esc(stU(k))}</u></span><em>${stL(v)}</em></td>`}).join('')}</tr>`:'';
  const foot=totR||finR?`<tbody class="en">${totR}${finR}</tbody>`:'';
  const html=`<section class="pg">${pdfTop('صورتحساب مشتری',D)}${pdfInf([['مشتری',esc((c.title?c.title+' ':'')+cuName(c)),Z.nid&&c.nid?'کد ملی '+esc(toFa(c.nid)):'',1],Z.ph&&c.phone?['تلفن','<bdi dir="ltr">'+esc(toFa(c.phone))+'</bdi>','']:null,Z.grp&&c.grp?['گروه',esc(c.grp),'']:null,Z.cnt?['تعداد سند',fmt(S.rows.length),'']:null])}${stmPer(S)?`<div class="per"><span>${esc(stmPer(S))}</span>${S.F.q?`<span>جستجو: «${esc(S.F.q)}»</span>`:''}</div>`:''}<div class="bar"></div>
  ${Z.fb?`<div class="fbx"><div class="fbt">مانده ${rng?'پایان بازه':'نهایی حساب'}</div><div class="fks2">${ks.map(card).join('')}</div></div>`:''}
  <h2>گردش حساب <small>هر سند یک ردیف · مانده بعد از همان سند</small></h2><table class="lg2">${cg}<thead>${head}</thead>${open}${body||`<tbody><tr><td colspan="${NC}" class="emp">در این بازه${S.F.q?' و با این جستجو':''} ردیفی نیست</td></tr></tbody>`}${S.rows.length?foot:''}</table>
  ${Z.lgd?`<div class="lgd"><span><b class="rd">طلبکاریم</b> یعنی مشتری به مطلا بدهکار است</span><span><b class="bl">بدهکاریم</b> یعنی مطلا به مشتری بدهکار است</span></div>`:''}${Z.note?`<div class="nt">${esc(Z.note)}</div>`:''}
  ${Z.sg?'<div class="sign"><div>امضای مشتری</div><div>مهر و امضای مطلا</div></div>':''}${pdfFoot()}</section>`;
  const LN='#5f5445',INK='#211d18';
  const css=`.pg{max-width:${land?'277mm':'190mm'}}.per{display:flex;flex-wrap:wrap;gap:2mm;margin:1.6mm 0 0}.per span{border:.2mm solid #b8962e;background:#fbf4e1;color:#6f4f08;border-radius:99px;padding:.2mm 3mm;font-size:7.2pt;font-weight:700}
  .rd{color:#9b1c31!important}.gr{color:#1d6b4a!important}.bl{color:#1f3f8f!important}.z{color:#8f8574!important}${Z.lg?'':'.top .lg{visibility:hidden}'}
  .inf{border:.3mm solid ${INK};border-top:.3mm solid ${INK};border-bottom:.3mm solid ${INK}}.inf>div+div{border-inline-start:.2mm solid ${LN}}
  .fbx{margin-top:2.6mm;border:.45mm solid ${INK};break-inside:avoid;page-break-inside:avoid}.fbt{background:${INK};color:#fff;font-size:8.4pt;font-weight:800;padding:.9mm 3mm 1.1mm}
  .fks2{display:flex}.fk{flex:1;min-width:0;padding:1.6mm 3mm 1.8mm;border-top:1.1mm solid #1d6b4a}.fk+.fk{border-inline-start:.3mm solid ${INK}}.fk.d{border-top-color:#9b1c31}.fk.c{border-top-color:#1f3f8f}
  .fkh{display:flex;align-items:baseline;gap:1.4mm}.fkh b{font-size:8.6pt;font-weight:800}.fkh u{font-size:6.8pt;font-weight:700;color:#544c42}
  .fkv{display:flex;align-items:center;gap:2.4mm;margin:.4mm 0 .5mm}.fkv bdi{font-size:${ks.length>2?'14':'17'}pt;font-weight:800;line-height:1.3;unicode-bidi:isolate;direction:ltr;color:#1d6b4a;white-space:nowrap}.fk.d .fkv bdi{color:#9b1c31}.fk.c .fkv bdi{color:#1f3f8f}
  .fkv em{flex:none;margin-inline-start:auto;font-size:8pt;font-weight:800;color:#fff;background:#1d6b4a;border-radius:99px;padding:.2mm 3.2mm .4mm}.fk.d .fkv em{background:#9b1c31}.fk.c .fkv em{background:#1f3f8f}
  .fks{font-size:7pt;font-weight:700;color:#38322b}
  h2{border-top:.3mm solid ${INK};border-inline:.3mm solid ${INK};margin-top:3mm}
  table.lg2{width:100%;table-layout:fixed;border-collapse:collapse;border:.4mm solid ${INK}}
  .lg2 th,.lg2 td{border:.22mm solid ${LN}}
  .lg2 th{font-size:${z(7)}pt;font-weight:800;color:${INK};background:#f4ecd8;padding:1mm .6mm;text-align:center;line-height:1.35;white-space:normal}.lg2 th u{font-size:${z(6)}pt;font-weight:700;color:#544c42}
  .lg2 tr.g1 th.ds{text-align:right;padding-inline-start:2mm}.lg2 tr.g2 th{font-size:${z(6.8)}pt;border-bottom:.45mm solid ${INK}}.lg2 tr.g1 th.grp{font-size:${z(7.6)}pt}.lg2 tr.g2 th.hb{background:#ecdfbf}
  .lg2 td{font-size:${z(7.6)}pt;padding:1.2mm .7mm;vertical-align:middle}
  .lg2 td.n{color:#38322b;text-align:center;font-size:${z(7)}pt;width:auto}.lg2 td.dt{text-align:center;white-space:nowrap;color:${INK};font-size:${z(6.9)}pt;font-weight:500}
  .lg2 td.ds{padding-inline:1.8mm;word-break:break-word;overflow-wrap:anywhere}.lg2 td.ds .nm{display:block;font-weight:800;font-size:${z(8)}pt}.lg2 td.ds .s{display:block;color:#38322b;font-size:${z(6.5)}pt;line-height:1.5;margin-top:.2mm}.lg2 td.ds .nm small{display:inline;font-size:${z(6.2)}pt;font-weight:500;color:#544c42;margin-inline-start:1.6mm}
  .dls{display:block;margin-top:.7mm;border-top:.2mm solid #b9ad94}.dl{display:flex;align-items:baseline;gap:1.4mm;padding:.45mm 0;border-bottom:.15mm dotted #b9ad94;font-size:${z(6.8)}pt;line-height:1.45}.dl:last-child{border-bottom:0;padding-bottom:0}
  .dl em{flex:0 0 ${z(9.5)}mm;font-weight:800;font-size:${z(6.4)}pt}.dl i{flex:1;min-width:0;color:#211d18;overflow-wrap:anywhere}.dl i b{font-weight:700;white-space:nowrap}.dl u{flex:0 0 ${z(24)}mm;text-align:left;font-weight:700;white-space:nowrap;color:#211d18}.dl u bdi{display:inline!important;direction:ltr;unicode-bidi:isolate;font-size:inherit!important;font-weight:700!important}.dl u small{display:inline!important;font-size:${z(5.6)}pt!important;font-weight:700;color:#544c42;margin:0!important}
  .lg2 td.dv,.lg2 td.bv,.lg2 td.cv{text-align:center;white-space:nowrap;overflow:hidden}.lg2 td bdi{display:block;unicode-bidi:isolate;direction:ltr;font-size:${z(7.5)}pt;font-weight:600}.lg2 td small{display:block;font-size:${z(5.8)}pt;font-weight:700;margin-top:.1mm}
  .lg2 td.bv{background:#fbf7ec}.lg2 td.bv bdi{font-size:${z(8)}pt;font-weight:800}
  .lg2 tr.op td{background:#f4ecd8}.lg2 td.emp{text-align:center;color:#38322b;padding:5mm}
  .lg2 tr.ft1 td{background:#fbf7ec;border-top:.5mm solid ${INK};padding:1.5mm 1.8mm;font-size:${z(7.8)}pt;font-weight:800}.lg2 tr.ft1 td.cv{padding-inline:.7mm}.lg2 tr.ft1 td bdi{font-weight:800;font-size:${z(7.1)}pt}
  .lg2 tr.ft2 td{background:#f4ecd8;border-top:.55mm solid ${INK};padding:1.8mm 2mm;font-size:${z(8.6)}pt;font-weight:800}.lg2 tr.ft2 td.fb{text-align:center;white-space:nowrap;padding-inline:.6mm;overflow:hidden}.lg2 tr.ft2 td.fb span{display:block}.lg2 tr.ft2 td.fb bdi{display:inline;font-size:${z(10.5)}pt;font-weight:800}.lg2 tr.ft2 u{font-size:${z(6.4)}pt;font-weight:700;color:#38322b}.lg2 tr.ft2 em{display:block;font-size:${z(7)}pt;font-weight:800;line-height:1.3}
  .lgd{display:flex;flex-wrap:wrap;gap:.6mm 5mm;margin:1.6mm 0 0;font-size:6.8pt;font-weight:500;color:#38322b}.lgd b{font-weight:800}
  .nt{margin-top:2mm;padding:1.2mm 2.4mm;border:.25mm solid ${LN};font-size:7.2pt;font-weight:500;line-height:1.7;color:${INK};break-inside:avoid}
  .sign div{border-top:.3mm solid ${INK};color:#38322b;font-weight:700}
  .lg2 thead{display:table-header-group}.lg2 tbody.en{break-inside:avoid;page-break-inside:avoid}`;
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
