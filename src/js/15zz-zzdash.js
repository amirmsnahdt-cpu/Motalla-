/* ---------- v103.2 «ترازوی مغازه»: صفحه اول گزارش‌ها ----------
   صاحب اپ: «قسمت گزارش‌گیری خیلی شگفت‌انگیز؛ خیلی روان و جذاب». یک نگاه = وضع مغازه:
   (۱) ترازو: طلبکاریم روی کفه راست، بدهکاریم روی کفه چپ؛ شاهین به سمت سنگین‌تر کج می‌شود (فنر میرا، با تومان/طلا دوباره وزن می‌کند)
   (۲) همین حالا: بانک، صندوق، طلای مغازه + «طلب‌های ما چند روزه است»
   (۳) بازه (امروز/هفته/ماه/ماه قبل/امسال) → فروش بالا و خرید پایین روی یک محور؛ با کشیدن انگشت هر روز خوانده می‌شود؛ تقویم ماه؛ پرفروش‌ها؛ کاربران
   فقط نمایش است: هیچ داده‌ای ذخیره یا عوض نمی‌شود. RDC = حافظه محاسبه تا وقتی داده عوض نشده. */
let RD={m:'r',p:'m',tb:0,sel:-1},RDC=null,RDS=null;
const RDX=new Set(['بانک','هزینه','سرمایه','ذوب','حساب داخلی']);
const RDP=[['td','امروز'],['wk','این هفته'],['m','این ماه'],['pm','ماه قبل'],['y','امسال']];
const RDCASH=new Set(['cash','pos','hav']);
const RDAGE=[[7,'تا ۷ روز'],[30,'۸ تا ۳۰ روز'],[90,'۳۱ تا ۹۰ روز'],[1e9,'بیش از ۹۰ روز']];
const RDJM3=['فرو','ارد','خرد','تیر','مرد','شهر','مهر','آبا','آذر','دی','بهم','اسف'],RDWD=['ش','ی','د','س','چ','پ','ج'];
const rdFa=(v,d)=>toFa(String(+(+v||0).toFixed(d))).replace('.','٫');
/* عدد کوتاه برای تیتر: [عدد، واحد] */
function rdCmp(v,g){v=Math.abs(+v||0);if(g)return v>=1000?[fmt(Math.round(v)),'گرم']:[rdFa(v,v>=100?1:v>=10?2:3),'گرم'];
  return v>=1e9?[rdFa(v/1e9,v>=1e10?1:2),'میلیارد تومان']:v>=1e6?[rdFa(v/1e6,v>=1e8?0:1),'میلیون تومان']:[fmt(Math.round(v)),'تومان']}
const rdOne=(v,g)=>{const[a,b]=rdCmp(v,g);return a+' '+b},rdTick=(v,g)=>g?rdFa(v,v<10?1:0)+' گرم':v>=1e9?rdFa(v/1e9,1)+' میلیارد':v>=1e6?rdFa(v/1e6,v>=1e7?0:1)+' م':fmt(Math.round(v));
const rdDayN=iso=>{const[,m,d]=g2j(iso);return toFa(d)+' '+JM[m-1]},rdSat=iso=>(new Date(iso+'T12:00:00').getDay()+1)%7;
/* ---- یک بار همه سندها را می‌خواند ---- */
function rdData(){const sig=Object.values(DVN).join()+'|'+custs.length+'|'+todayISO();if(RDC&&RDC.sig===sig)return RDC;
  const D=[],B={r:{a:0,an:0,b:0,bn:0},g:{a:0,an:0,b:0,bn:0}},AG={r:[0,0,0,0],g:[0,0,0,0]},OLD={r:[],g:[]},bucket=n=>n<=7?0:n<=30?1:n<=90?2:3;
  for(const c of CU()){const bk=c.grp==='بانک';
    if(!RDX.has(c.grp||'')){const b=cuBal(c),R=Math.round(b.R||0),G=+b.G||0;
      if(R<=-1){B.r.a+=-R;B.r.an++}else if(R>=1){B.r.b+=R;B.r.bn++}
      if(G<=-.0005){B.g.a+=-G;B.g.an++}else if(G>=.0005){B.g.b+=G;B.g.bn++}
      if(R<=-1||G<=-.0005){let M=null;try{M=cuOpenMap(c)}catch(_){}
        if(M){const dt=new Map((c.txs||[]).map(t=>[String(t.id),t.date]));const first={r:'',g:''},sum={r:0,g:0};
          M.forEach((o,id)=>{const d=dt.get(id);if(!d)return;for(const k of ['r','g']){const e=o[k];if(!e||!(e.v<0)||!(e.rem>0))continue;const n=rpDays(d);AG[k][bucket(n)]+=e.rem;sum[k]+=e.rem;if(!first[k]||d<first[k])first[k]=d}});
          if(first.r&&sum.r>=1)OLD.r.push({id:c.id,n:cuName(c),d:rpDays(first.r),v:sum.r});
          if(first.g&&sum.g>=.0005)OLD.g.push({id:c.id,n:cuName(c),d:rpDays(first.g),v:sum.g})}}}
    if(bk)continue;
    for(const t of (c.txs||[])){if(!t||t.del||t.draft||t.type!=='inv'||!t.date||t.lk||t.bd||t.pd||t.bl)continue;
      const rate=+t.rate||(+t.mz?(+t.mz)/MZK:0);let s=0,b=0,gs=0,gb=0,pf=0,ci=0,co=0;const it=[];
      (t.items||[]).forEach(i=>{const a=+i.tot||0,w=(+i.w||0)*(+i.ay||750)/750;s+=a;gs+=w;try{const C=itCalc(i,rate,t.tax);pf+=(+C.aj||0)+(+C.pr||0)}catch(_){}it.push([i.ab?'آبشده':(i.k||'کالا'),a,w])});
      (t.xr||[]).forEach(x=>{const g=x.a==='gold',a=+x.amount||0,w=g?(+x.w||0)*(+x.ay||750)/750:0;
        if(x.t==='sell'){s+=a;gs+=w;it.push([g?(x.pul?'طلای پولی':(x.cat&&x.cat!=='تعویض'&&x.cat!=='مرجوعی'?x.cat:'متفرقه')):((XA[x.a]||{}).t||x.a),a,w])}else if(x.t==='buy'){b+=a;gb+=w}});
      (t.pays||[]).forEach(p=>{if(!RDCASH.has(p.m))return;const a=pAmt(p);if(a>0)ci+=a;else co-=a});
      D.push({d:t.date,s,b,gs,gb,pf,ci,co,by:t.by0||t.by||'',it,c:c.id})}}
  OLD.r.sort((x,y)=>y.d-x.d||y.v-x.v);OLD.g.sort((x,y)=>y.d-x.d||y.v-x.v);
  let bank=0,bn=0,cash=null,gold=0;try{bkCus().forEach(c=>{bank+=bkCuBal(c);bn++})}catch(_){}
  try{const s=cashSrc();if(s)cash=acFin(s)}catch(_){}
  try{stkAll().forEach(r=>{if(r.g==='g'||r.g==='m')gold+=+r.w||0})}catch(_){}
  return RDC={sig,D,B,AG,OLD,now:{bank,bn,cash,gold}}}
/* ---- بازه و ستون‌های نمودار ---- */
function rdRange(p){const t=todayISO(),[y,m,d]=g2j(t),bk=[];let f=t,to=t,pf,pt,cap='';
  const day=iso=>({f:iso,t:iso,l:toFa(g2j(iso)[2]),nm:rdDayN(iso),fu:iso>t});
  if(p==='td'){pf=pt=isoAdd(t,-1);for(let i=6;i>=0;i--){const o=day(isoAdd(t,-i));o.l=RDWD[rdSat(o.f)];o.dim=i>0;bk.push(o)}cap='۷ روز اخیر'}
  else if(p==='wk'){f=isoAdd(t,-rdSat(t));pf=isoAdd(f,-7);pt=isoAdd(t,-7);for(let i=0;i<7;i++){const o=day(isoAdd(f,i));o.l=RDWD[i];bk.push(o)}cap='شنبه تا جمعه'}
  else if(p==='m'||p==='pm'){let Y=y,Mo=m;if(p==='pm'){Mo=m===1?12:m-1;Y=m===1?y-1:y}const n=jDays(Y,Mo),pY=Mo===1?Y-1:Y,pM=Mo===1?12:Mo-1,pn=jDays(pY,pM);
    f=jIso(Y,Mo,1);to=p==='m'?t:jIso(Y,Mo,n);pf=jIso(pY,pM,1);pt=p==='m'?jIso(pY,pM,Math.min(d,pn)):jIso(pY,pM,pn);for(let i=1;i<=n;i++)bk.push(day(jIso(Y,Mo,i)));cap=JM[Mo-1]+' '+toFa(Y);return {p,f,t:to,pf,pt,bk,cap,cal:[Y,Mo,n]}}
  else{f=jIso(y,1,1);pf=jIso(y-1,1,1);pt=jIso(y-1,m,Math.min(d,jDays(y-1,m)));for(let i=1;i<=12;i++){const a=jIso(y,i,1);bk.push({f:a,t:jIso(y,i,jDays(y,i)),l:RDJM3[i-1],nm:JM[i-1]+' '+toFa(y),fu:a>t})}cap='سال '+toFa(y)}
  return {p,f,t:to,pf,pt,bk,cap}}
const rdZ=()=>({s:0,b:0,gs:0,gb:0,pf:0,ci:0,co:0,n:0});
function rdAgg(D,f,t,full){const A=rdZ(),cu=new Set(),G=new Map(),U=new Map();
  for(const r of D){if(r.d<f||r.d>t)continue;A.s+=r.s;A.b+=r.b;A.gs+=r.gs;A.gb+=r.gb;A.pf+=r.pf;A.ci+=r.ci;A.co+=r.co;A.n++;
    if(!full)continue;cu.add(r.c);const u=U.get(r.by)||{k:r.by,n:0,s:0};u.n++;u.s+=r.s;U.set(r.by,u);r.it.forEach(([k,a,w])=>{const o=G.get(k)||{k,a:0,w:0,n:0};o.a+=a;o.w+=w;o.n++;G.set(k,o)})}
  A.cu=cu.size;A.G=[...G.values()];A.U=[...U.values()].filter(u=>u.k);return A}
function rdView(){const D=rdData(),P=rdRange(RD.p),g=RD.m==='g';const byDay=new Map();
  const lo=P.bk[0].f,hi=P.bk[P.bk.length-1].t;for(const r of D.D){if(r.d<lo||r.d>hi)continue;let o=byDay.get(r.d);if(!o){o=rdZ();byDay.set(r.d,o)}o.s+=r.s;o.b+=r.b;o.gs+=r.gs;o.gb+=r.gb;o.n++}
  const bk=P.bk.map(b=>{const o={...b,up:0,dn:0,n:0};if(b.f===b.t){const x=byDay.get(b.f);if(x){o.up=g?x.gs:x.s;o.dn=g?x.gb:x.b;o.n=x.n}}else byDay.forEach((x,d)=>{if(d>=b.f&&d<=b.t){o.up+=g?x.gs:x.s;o.dn+=g?x.gb:x.b;o.n+=x.n}});return o});
  return RDS={D,P,g,bk,A:rdAgg(D.D,P.f,P.t,1),A0:rdAgg(D.D,P.pf,P.pt,0)}}
/* ---- تکه‌های صفحه ---- */
const rdDelta=(c,p)=>{if(!(p>0))return '<span class="dl">&nbsp;</span>';const x=Math.round((c-p)/p*100);if(!x)return '<span class="dl">بدون تغییر</span>';return `<span class="dl">${x>0?'▲':'▼'} ${toFa(Math.min(999,Math.abs(x)))}٪</span>`};
function rdScaleSVG(){const bars=(c)=>[[34,37.5],[26,29],[17,20.5],[8,12]].map(([w,y],i)=>`<rect class="rdw${i+1}" x="${-w/2}" y="${y}" width="${w}" height="7" rx="2.2"/>`).join('');
  const pan=(id,c)=>`<g id="${id}" class="rdpn ${c}" transform="translate(${id==='rdPR'?260:60} 36)"><path class="ch" d="M0 0L-22 46M0 0L22 46"/><g class="rdwt">${bars()}</g><path class="bw" d="M-31 46Q0 64 31 46Z"/><path class="rm" d="M-32 46H32"/><circle class="hk" r="3.2"/></g>`;
  return `<svg class="rdsv" viewBox="0 0 320 152" aria-hidden="true"><defs><linearGradient id="rdBr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e3a6"/><stop offset=".5" stop-color="#d1a23a"/><stop offset="1" stop-color="#8f6a14"/></linearGradient><linearGradient id="rdBh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a7218"/><stop offset=".5" stop-color="#f6dc98"/><stop offset="1" stop-color="#9a7218"/></linearGradient><radialGradient id="rdGl" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#e8c56a" stop-opacity=".26"/><stop offset="1" stop-color="#e8c56a" stop-opacity="0"/></radialGradient></defs>
<rect x="0" y="0" width="320" height="152" fill="url(#rdGl)"/><ellipse cx="160" cy="143" rx="58" ry="5" fill="#000" opacity=".28"/>
<path d="M118 142Q160 128 202 142Z" fill="url(#rdBr)"/><rect x="156.6" y="38" width="6.8" height="98" rx="3.4" fill="url(#rdBh)"/><circle cx="160" cy="24" r="5" fill="url(#rdBr)"/><path d="M160 29v8" stroke="#d1a23a" stroke-width="2.4" stroke-linecap="round"/>
<g id="rdBm" transform="rotate(0 160 36)"><rect x="58" y="33.4" width="204" height="5.2" rx="2.6" fill="url(#rdBr)"/><path d="M160 36V52" stroke="#f6dc98" stroke-width="1.6" stroke-linecap="round"/></g>
${pan('rdPL','b')}${pan('rdPR','a')}<circle cx="160" cy="36" r="7.2" fill="url(#rdBr)"/><circle cx="160" cy="36" r="2.6" fill="#7a5a10"/></svg>`}
function rdHeroX(){const D=rdData(),g=RD.m==='g',B=D.B[RD.m],net=B.a-B.b,[nn,nu]=rdCmp(net,g),z=Math.abs(net)<(g?.0005:1);
  const sd=(k,l,v,n)=>{const[x,u]=rdCmp(v,g);return `<button class="rdsb ${k}" data-act="rdSide" data-s="${k}"><small><i></i>${l}</small><b>${v?x:'۰'}</b><em>${v?u:(g?'گرم':'تومان')} · ${rpN(n)} حساب</em></button>`};
  return `<div class="rdnt${z?' z':''}"><small>${z?(B.a>0?'دو کفه برابر است':'حساب بازی نیست'):net>0?'خالص: بیشتر طلبکاریم':'خالص: بیشتر بدهکاریم'}</small><b>${z?'تسویه':nn}</b>${z?'':`<em>${nu}</em>`}</div><div class="rdsd">${sd('a','طلبکاریم',B.a,B.an)}${sd('b','بدهکاریم',B.b,B.bn)}</div>`}
function rdNowHTML(){const D=rdData(),g=RD.m==='g',N=D.now,AG=D.AG[RD.m],tot=AG.reduce((s,v)=>s+v,0),OL=D.OLD[RD.m].filter(o=>o.d>30&&o.v>=(g?.05:1e6)).slice(0,3);
  const tile=(k,ico,l,v,u,s)=>`<button class="rdti" data-act="rdGo" data-k="${k}"><i>${ic(ico)}</i><small>${l}</small><b>${v}</b><em>${u}</em>${s?`<span>${s}</span>`:''}</button>`;
  const bk=rdCmp(N.bank),cs=N.cash==null?null:rdCmp(N.cash),gd=rdCmp(N.gold,1);
  let h=`<div class="rdnw">${tile('banks','bank','بانک‌ها',bk[0],bk[1]+(N.bank<0?' · منفی':''),'')}${tile('banks','cash','صندوق',cs?cs[0]:'—',cs?cs[1]+(N.cash<0?' · منفی':''):'هنوز باز نشده','')}${tile('stock','ring','طلای مغازه',gd[0],'گرم'+(N.gold<0?' · منفی':''),'')}</div>`;
  if(tot>(g?.0005:1)){h+=`<section class="rdc rdag"><header><b>طلب‌های ما چند روزه است؟</b><small>از تاریخ سندی که هنوز باز مانده</small></header><div class="rdab" role="img" aria-label="سن طلب‌ها">${AG.map((v,i)=>v>0?`<i class="g${i}" style="flex:${Math.max(v/tot,.02).toFixed(4)}"></i>`:'').join('')}</div><div class="rdal">${AG.map((v,i)=>`<div><i class="g${i}"></i><span>${RDAGE[i][1]}</span><b>${v>0?rdOne(v,g):'—'}</b><em>${v>0?toFa(Math.round(v/tot*100))+'٪':''}</em></div>`).join('')}</div>`
      +(OL.length?`<div class="rdol"><small>قدیمی‌ترین طلب‌ها</small>${OL.map(o=>`<button data-act="rdCu" data-id="${o.id}"><i>${esc((o.n||'؟').trim().slice(0,1))}</i><span><b>${esc(o.n)}</b><em>${rpN(o.d)} روز است باز مانده</em></span><u>${rdOne(o.v,g)}</u></button>`).join('')}<button class="more" data-act="rdBad">همه بدحساب‌ها ${ic('chev')}</button></div>`:'')+`</section>`}
  return h}
function rdReadout(){const V=RDS;if(!V)return '';const b=V.bk[RD.sel];if(!b)return `<span class="rdhi">${ic('info')} برای دیدن هر ${V.P.p==='y'?'ماه':'روز'}، روی نمودار بکشید یا بزنید</span>`;
  return `<b>${esc(b.nm)}</b><span><i class="rdd s"></i>${b.up?rdTick(b.up,V.g):'—'}</span><span><i class="rdd b"></i>${b.dn?rdTick(b.dn,V.g):'—'}</span>${b.n?`<button data-act="rdDay">${rpN(b.n)} سند ${ic('chev')}</button>`:'<em>بدون سند</em>'}`}
function rdTable(){const V=RDS,L=V.bk.map((b,i)=>[b,i]).filter(([b])=>b.n||b.up||b.dn);if(!L.length)return `<div class="rdem">${ic('info')}<b>در این بازه سندی ثبت نشده</b></div>`;
  return `<table class="rdtb"><thead><tr><th>${V.P.p==='y'?'ماه':'روز'}</th><th>فروش</th><th>خرید</th><th>سند</th></tr></thead><tbody>${L.map(([b,i])=>`<tr data-i="${i}"${i===RD.sel?' class="on"':''}><td>${esc(b.nm)}</td><td>${b.up?rdOne(b.up,V.g):'—'}</td><td>${b.dn?rdOne(b.dn,V.g):'—'}</td><td>${rpN(b.n)}</td></tr>`).join('')}</tbody></table>`}
function rdCalHTML(){const V=RDS;if(!V||!V.P.cal)return '';const[, ,n]=V.P.cal,off=rdSat(V.P.bk[0].f),mx=Math.max(0,...V.bk.map(b=>b.up));
  let c='';for(let i=0;i<off;i++)c+='<i></i>';V.bk.forEach((b,i)=>{const l=b.up>0&&mx>0?Math.min(5,1+Math.floor(4.999*b.up/mx)):0;c+=`<button class="l${l}${b.fu?' fu':''}${i===RD.sel?' on':''}${b.f===todayISO()?' td':''}" data-act="rdSel" data-i="${i}"${b.fu?' disabled':''} aria-label="${esc(b.nm)}">${b.l}</button>`});
  return `<section class="rdc rdcl"><header><b>تقویم فروش · ${esc(V.P.cap)}</b><small>هر روز پررنگ‌تر = فروش بیشتر</small></header><div class="rdcw">${RDWD.map(w=>`<span>${w}</span>`).join('')}</div><div class="rdcg" id="rdCg">${c}</div><div class="rdcx"><span>کم</span>${[1,2,3,4,5].map(l=>`<i class="l${l}"></i>`).join('')}<span>زیاد</span></div></section>`}
function rdRank(t,sub,cls,L){if(!L.length)return '';const mx=Math.max(...L.map(o=>o.v))||1;return `<section class="rdc rdrk ${cls}"><header><b>${t}</b><small>${sub}</small></header>${L.map((o,i)=>`<div class="rdrr" style="--i:${i}"><span><b>${esc(o.k)}</b><em>${o.s}</em></span><u>${o.x}</u><div><i style="width:${Math.max(2,o.v/mx*100).toFixed(1)}%"></i></div></div>`).join('')}</section>`}
function rdFlowHTML(){const V=rdView(),A=V.A,A0=V.A0,g=V.g,none=!A.n;
  const kp=(d,l,v,p,gg)=>{const[x,u]=rdCmp(v,gg);return `<div><small>${d?`<i class="rdd ${d}"></i>`:''}${l}</small><b>${v?x:'۰'}</b><em>${v?u:(gg?'گرم':'تومان')}</em>${rdDelta(v,p)}</div>`};
  const K=g?kp('s','طلای فروخته',A.gs,A0.gs,1)+kp('b','طلای خریده',A.gb,A0.gb,1)+kp('',A.gb-A.gs>=0?'خالص ورود':'خالص خروج',Math.abs(A.gb-A.gs),0,1):kp('s','فروش',A.s,A0.s)+kp('b','خرید',A.b,A0.b)+kp('','اجرت و سود',A.pf,A0.pf);
  const goods=A.G.filter(o=>g?o.w>0:o.a>0).sort((x,y)=>g?y.w-x.w:y.a-x.a).slice(0,6).map(o=>({k:o.k,v:g?o.w:o.a,x:rdOne(g?o.w:o.a,g),s:g?rpN(o.n)+' قلم':(o.w?wFmt(Math.round(o.w*1000)/1000)+' گرم · ':'')+rpN(o.n)+' قلم'}));
  const staff=A.U.sort((x,y)=>y.n-x.n).slice(0,6).map(o=>({k:o.k,v:o.n,x:rpN(o.n)+' سند',s:o.s?'فروش '+rdOne(o.s):'بدون فروش'}));
  return `<section class="rdc rdfl"><header><b>خرید و فروش</b><small>${esc(V.P.cap)}${RD.p==='td'?' · عددها برای امروز':''} · نسبت به مدت مشابه قبل</small></header><div class="rdkp">${K}</div>
<div class="rdrd" id="rdRd">${rdReadout()}</div><div class="rdch${RD.tb?' tbl':''}" id="rdCh">${RD.tb?rdTable():''}</div>
<div class="rdlg"><span><i class="rdd s"></i>فروش · بالا</span><span><i class="rdd b"></i>خرید · پایین</span><button data-act="rdTb">${ic(RD.tb?'bar':'list')}${RD.tb?'نمودار':'جدول'}</button></div>
<div class="rdmt"><span>دریافت نقد و بانک <b>${A.ci?rdOne(A.ci):'—'}</b></span><span>پرداخت <b>${A.co?rdOne(A.co):'—'}</b></span><span><b>${rpN(A.n)}</b> سند · <b>${rpN(A.cu)}</b> حساب</span></div></section>`
   +(none?'':rdCalHTML()+rdRank('پرفروش‌ها',g?'بر اساس وزن ۷۵۰ فروخته‌شده':'بر اساس مبلغ فروش','s',goods)+rdRank('کار کاربران','تعداد سندی که هر نفر در این بازه ثبت کرده','u',staff))}
/* ---- نمودار: فروش بالا، خرید پایین، یک محور (روز اول سمت راست) ---- */
function rdChart(){const el=$('rdCh'),V=RDS;if(!el||!V||RD.tb)return;const W=Math.max(240,el.clientWidth||320),H=176,T=12,Bm=22,L=6,GL=V.g?46:50,n=V.bk.length,slot=(W-L-GL)/n,bw=Math.max(3,Math.min(22,slot*.62));
  const U=Math.max(0,...V.bk.map(b=>b.up)),Dn=Math.max(0,...V.bk.map(b=>b.dn));
  if(!U&&!Dn){el.innerHTML=`<div class="rdem">${ic('info')}<b>در این بازه خرید و فروشی ثبت نشده</b></div>`;return}
  const ph=H-T-Bm,fu=Math.min(.86,Math.max(.14,U/(U+Dn))),uh=ph*fu-3,dh=ph*(1-fu)-3,sc=Math.min(U?uh/U:1e9,Dn?dh/Dn:1e9),y0=T+ph*fu;
  const X=i=>W-L-(i+.5)*slot,nice=v=>{if(!(v>0))return 0;const p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return (m>=5?5:m>=2?2:1)*p};
  const up=(x,h)=>{const r=Math.min(4,bw/2,h),y=y0-1.2-h;return `M${x} ${y0-1.2}V${y+r}Q${x} ${y} ${x+r} ${y}H${x+bw-r}Q${x+bw} ${y} ${x+bw} ${y+r}V${y0-1.2}Z`},dn=(x,h)=>{const r=Math.min(4,bw/2,h),y=y0+1.2+h;return `M${x} ${y0+1.2}V${y-r}Q${x} ${y} ${x+r} ${y}H${x+bw-r}Q${x+bw} ${y} ${x+bw} ${y-r}V${y0+1.2}Z`};
  let g='',lab='';const every=n>12?5:1;
  V.bk.forEach((b,i)=>{const x=X(i)-bw/2,o=RD.sel>=0?(i===RD.sel?1:.38):(b.dim?.38:1);
    if(b.up>0)g+=`<path class="s" d="${up(x.toFixed(1)*1,Math.max(1.5,b.up*sc))}" opacity="${o}" style="--i:${i}"/>`;if(b.dn>0)g+=`<path class="b" d="${dn(x.toFixed(1)*1,Math.max(1.5,b.dn*sc))}" opacity="${o}" style="--i:${i}"/>`;
    if(every===1||i===0||(i+1)%5===0)lab+=`<text class="xl${i===RD.sel?' on':''}" x="${X(i).toFixed(1)}" y="${H-6}">${b.l}</text>`});
  const gu=nice(U*.9),gd=nice(Dn*.9),gl=(v,s)=>v>0&&v*sc>14?`<path class="gr" d="M${GL} ${(y0-s*v*sc).toFixed(1)}H${W-L}"/><text class="yl" x="${GL-5}" y="${(y0-s*v*sc+3.5).toFixed(1)}">${rdTick(v,V.g)}</text>`:'';
  const sx=RD.sel>=0?`<rect class="sel" x="${(X(RD.sel)-slot/2).toFixed(1)}" y="${T-6}" width="${slot.toFixed(1)}" height="${ph+12}" rx="6"/>`:'';
  el.innerHTML=`<svg class="rdcs${el.dataset.dr?'':' in'}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="نمودار فروش و خرید">${sx}${gl(gu,1)}${gl(gd,-1)}<path class="ax" d="M${GL} ${y0.toFixed(1)}H${W-L}"/><text class="yl" x="${GL-5}" y="${(y0+3.5).toFixed(1)}">۰</text>${g}${lab}</svg>`;el.dataset.dr=1;el._g={W,L,slot,n}}
function rdPick(e){const el=$('rdCh');if(!el||!el._g||!RDS)return -1;const r=el.getBoundingClientRect(),G=el._g,i=Math.floor((G.W-G.L-(e.clientX-r.left)*(G.W/r.width))/G.slot);return i<0||i>=G.n||RDS.bk[i].fu?-1:i}
function rdSelect(i){if(i===RD.sel)return;RD.sel=i;const rd=$('rdRd');if(rd)rd.innerHTML=rdReadout();if(RD.tb){document.querySelectorAll('#rdCh tr').forEach(tr=>tr.classList.toggle('on',+tr.dataset.i===i))}else rdChart();
  document.querySelectorAll('#rdCg button').forEach((b,j)=>b.classList.toggle('on',j===i))}
/* ---- ترازو: فنر میرا ---- */
const RDSP={a:0,v:0,to:0,on:0,t:0};
function rdTarget(){const B=rdData().B[RD.m],s=B.a+B.b;if(!(s>0))return 0;const x=(B.a-B.b)/s;return Math.sign(x)*11*Math.pow(Math.abs(x),.6)}
function rdPose(a){const bm=$('rdBm'),R=$('rdPR'),Lp=$('rdPL');if(!bm||!R||!Lp)return false;const r=a*Math.PI/180,c=100*Math.cos(r),s=100*Math.sin(r);
  bm.setAttribute('transform',`rotate(${a.toFixed(2)} 160 36)`);R.setAttribute('transform',`translate(${(160+c).toFixed(2)} ${(36+s).toFixed(2)})`);Lp.setAttribute('transform',`translate(${(160-c).toFixed(2)} ${(36-s).toFixed(2)})`);return true}
function rdSpring(kick){RDSP.to=rdTarget();if(kick)RDSP.v+=kick;if(RM()){RDSP.a=RDSP.to;RDSP.v=0;rdPose(RDSP.a);return}if(RDSP.on)return;RDSP.on=1;RDSP.t=0;
  const step=ts=>{const dt=Math.min(.034,RDSP.t?(ts-RDSP.t)/1000:.016);RDSP.t=ts;RDSP.v+=(-38*(RDSP.a-RDSP.to)-5.2*RDSP.v)*dt;RDSP.a+=RDSP.v*dt;
    if(!rdPose(RDSP.a)||cur!=='reports'||(Math.abs(RDSP.a-RDSP.to)<.03&&Math.abs(RDSP.v)<.05)){RDSP.on=0;if(cur==='reports')rdPose(RDSP.a=RDSP.to);RDSP.v=0;return}requestAnimationFrame(step)};requestAnimationFrame(step)}
function rdWeights(){const B=rdData().B[RD.m],mx=Math.max(B.a,B.b),rows=v=>!(v>0)||!(mx>0)?0:Math.max(1,Math.round(4*v/mx));[['rdPR',B.a],['rdPL',B.b]].forEach(([id,v])=>{const p=$(id);if(p)p.dataset.n=rows(v)})}
/* ---- صفحه ---- */
function rdHTML(){RD.re=!!document.querySelector('#view .rdw');return `<section class="rdh" id="rdH"><div class="rdht"><span><b>ترازوی مغازه</b><small>حساب مشتری‌ها و همکارها، همین حالا</small></span><div class="rdsg" id="rdSg">${[['r','تومان'],['g','طلا']].map(([k,l])=>`<button class="${RD.m===k?'on':''}" data-act="rdM" data-m="${k}">${l}</button>`).join('')}</div></div>
<button class="rdsc" data-act="rdNudge" aria-label="ترازو">${rdScaleSVG()}</button><div id="rdHx">${rdHeroX()}</div></section>
<div id="rdNw">${rdNowHTML()}</div>
<div class="rdps" id="rdPs">${RDP.map(([k,l])=>`<button class="${RD.p===k?'on':''}" data-act="rdP" data-p="${k}">${l}</button>`).join('')}</div>
<div id="rdFl">${rdFlowHTML()}</div>`}
function rdBind(){if(cur!=='reports')return;rdWeights();const H=$('rdH');if(!H)return;if(!H.dataset.in){H.dataset.in=1;if(!RD.re){RDSP.a=RM()?rdTarget():-rdTarget()*.55;RDSP.v=0}rdPose(RDSP.a)}rdSpring();const c0=$('rdCh');if(c0&&RD.re)c0.dataset.dr=1;rdChart();
  const ch=$('rdFl');if(ch&&!ch.dataset.b){ch.dataset.b=1;let dn=false;
    ch.addEventListener('pointerdown',e=>{if(!e.target.closest('#rdCh')||RD.tb)return;dn=true;const i=rdPick(e);if(i>=0)rdSelect(i)});
    ch.addEventListener('pointermove',e=>{if(RD.tb||!e.target.closest('#rdCh'))return;if(!dn&&e.pointerType!=='mouse')return;const i=rdPick(e);if(i>=0)rdSelect(i)});
    ['pointerup','pointercancel','pointerleave'].forEach(k=>ch.addEventListener(k,()=>{dn=false}));
    ch.addEventListener('click',e=>{const tr=e.target.closest('#rdCh tr[data-i]');if(tr)rdSelect(+tr.dataset.i)})}
  if(!rdBind.rs){rdBind.rs=1;let tm=0;addEventListener('resize',()=>{clearTimeout(tm);tm=setTimeout(()=>{if(cur==='reports')rdChart()},120)})}}
function rdFlowRe(){const f=$('rdFl');if(!f)return;f.innerHTML=rdFlowHTML();rdChart()}
function aReports(){setTimeout(rdBind,0);return ''}
ACT.rdM=d=>{if(RD.m===d.m)return;RD.m=d.m;RD.sel=-1;document.querySelectorAll('#rdSg button').forEach(b=>b.classList.toggle('on',b.dataset.m===RD.m));const x=$('rdHx'),n=$('rdNw');if(x)x.innerHTML=rdHeroX();if(n)n.innerHTML=rdNowHTML();rdWeights();rdSpring(RM()?0:(RDSP.to>=0?-14:14));rdFlowRe()};
ACT.rdP=d=>{if(RD.p===d.p)return;RD.p=d.p;RD.sel=-1;document.querySelectorAll('#rdPs button').forEach(b=>{const on=b.dataset.p===RD.p;b.classList.toggle('on',on);if(on&&b.scrollIntoView)try{b.scrollIntoView({inline:'center',block:'nearest',behavior:RM()?'auto':'smooth'})}catch(_){}});const c=$('rdCh');if(c)delete c.dataset.dr;rdFlowRe()};
ACT.rdTb=()=>{RD.tb=RD.tb?0:1;rdFlowRe()};
ACT.rdSel=d=>rdSelect(+d.i);
ACT.rdNudge=()=>{rdSpring(RM()?0:(Math.random()<.5?-1:1)*(34+Math.random()*16))};
ACT.rdDay=()=>{const b=RDS&&RDS.bk[RD.sel];if(!b)return;rpInit();RPT.f=b.f;RPT.t=b.t>todayISO()?todayISO():b.t;ACT.rpGo({k:'day'})};
ACT.rdSide=d=>{const g=RD.m==='g',C=RPC.bal;C.pr='c';C.side=d.s==='a'?(g?'dg':'dr'):(g?'cg':'cr');C.at='';C.kd=[];C.tol=0;C.grp=[...new Set(CU().filter(c=>!RDX.has(c.grp||'')).map(c=>c.grp||''))];ACT.rpGo({k:'bal'})};
ACT.rdBad=()=>{RPC.bal.pr='bad';RPC.bal.at='';ACT.rpGo({k:'bal'})};
ACT.rdCu=d=>{const c=custs.find(x=>String(x.id)===String(d.id));if(!c)return;ACT.cuOpen({id:c.id});if(cur==='cust')PARENT.cust='reports'};
ACT.rdGo=d=>{if(d.k==='stock'){ACT.rpGo({k:'stkp'});return}ACT.tab({n:d.k})};
