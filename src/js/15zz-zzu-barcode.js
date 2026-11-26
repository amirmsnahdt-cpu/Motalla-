/* ---- v108.0 بارکد: ثبت قطعه (اتیکت)، چاپ اتیکت، خواندن با بارکدخوان یا دوربین، پنجره «قیمت برای مشتری» ----
   صاحب اپ: «خواندن بارکد و چاپ بارکد و ثبت بارکد … با بارکدخوان انجام بدهم که سرعت ثبت سند بالا برود؛
   قبل از ثبت سند پنجره پیش‌نمایش داشته باشم که قیمت را خیلی سریع به مشتری اعلام کنم».
   - هر قطعه اتیکت‌دار یک رکورد سیستمی در custs است: {sys:'bc', code, k (کالا), w, ay, ajP, ajT, pp, ds, at, by, pr (زمان چاپ اتیکت)}
     (CU() و شماره مشتری‌ها سیستمی‌ها را نمی‌بینند؛ هر قطعه جدا همگام می‌شود، پس دو گوشی هم‌زمان با هم تداخل ندارند).
   - فروخته‌شدن از خود سندها خوانده می‌شود (ردیف کالا با bc = بارکد؛ مرجوعی با همان bc یعنی برگشت) — داده جدایی نگه داشته نمی‌شود.
   - بارکد = Code 128 (عددی زوج‌رقم با زیرمجموعه C، بقیه B). بارکدخوان‌های معمول (USB/بلوتوث، حالت صفحه‌کلید) مثل تایپ خیلی سریع
     با Enter در آخر کار می‌کنند؛ این را از تایپ انسان جدا می‌کنیم (bcWedge). دوربین: BarcodeDetector اگر هست، وگرنه خواننده خودمان (c128Img).
   - هر بارکد خوانده‌شده اول پنجره «قیمت برای مشتری» را باز می‌کند (قیمت لحظه با همان itCalc سند)؛ «افزودن به سند» ردیف‌ها را می‌نشاند. */
IC.bcd='<path d="M4 5v14M7 5v14M10.5 5v14M13 5v14M16.5 5v14M20 5v14"/>';
IC.alert='<path d="M12 4 2.8 19.5h18.4L12 4z"/><path d="M12 10v4.4M12 17v.1"/>';
IC.scan='<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16"/>';
/* ---------- Code 128 ---------- */
const C128='212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112'.split(' ');
const C128IX=Object.fromEntries(C128.map((p,i)=>[p,i]));
function c128Codes(s){s=String(s);const num=/^\d+$/.test(s)&&s.length%2===0&&s.length>=4,c=[];
  if(num){c.push(105);for(let i=0;i<s.length;i+=2)c.push(+s.substr(i,2))}else{c.push(104);for(const ch of s){const v=ch.charCodeAt(0)-32;c.push(v>=0&&v<95?v:31)}}
  let sum=c[0];for(let i=1;i<c.length;i++)sum+=c[i]*i;c.push(sum%103);c.push(106);return c}
/* نوار و فاصله‌ها (پهنا در واحد ماژول، اولی نوار) */
const c128Mod=s=>c128Codes(s).map(x=>C128[x]).join('');
/* SVG بارکد با ۱۰ ماژول حاشیه سفید دو طرف (لازم برای بارکدخوان) */
function c128SVG(s,o){o=o||{};const W=c128Mod(s);let x=10,d='';for(let i=0;i<W.length;i++){const w=+W[i];if(i%2===0)d+=`M${x} 0h${w}v100h-${w}z`;x+=w}const T=x+10;
  return `<svg class="${o.cls||'c128'}" viewBox="0 0 ${T} 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"${o.st?` style="${o.st}"`:''}><rect width="${T}" height="100" fill="#fff"/><path d="${d}" fill="#000"/></svg>`}
/* خواندن: یک خط از تصویر (روشنایی‌ها) → متن، یا null. چک‌سام باید درست باشد */
function c128Sym(W,i,n,tot){if(i+n>W.length)return -1;let s=0;for(let k=0;k<n;k++)s+=W[i+k];if(!s)return -1;const u=s/tot,raw=[],m=[];let used=0;
  for(let k=0;k<n;k++){const r=W[i+k]/u;raw.push(r);const f=Math.max(1,Math.min(4,Math.floor(r)));m.push(f);used+=f}
  /* ماژول‌های باقی‌مانده به عنصرهایی می‌رسد که بیشترین کسر را دارند */
  let left=tot-used;const ord=raw.map((r,k)=>[r-m[k],k]).sort((a,b)=>b[0]-a[0]);for(const [,k] of ord){if(left<=0)break;if(m[k]<4){m[k]++;left--}}if(left!==0)return -1;
  const key=m.join('');return n===7?(key===C128[106]?106:-1):(C128IX[key]!=null&&C128IX[key]<106?C128IX[key]:-1)}
function c128Txt(codes){let set=codes[0]===103?'A':codes[0]===104?'B':'C',out='',sh=0;
  for(let i=1;i<codes.length;i++){const c=codes[i],S=sh?(set==='A'?'B':'A'):set;sh=0;
    if(S==='C'){if(c<100){out+=String(c).padStart(2,'0');continue}if(c===100)set='B';else if(c===101)set='A';continue}
    if(c===98){sh=1;continue}if(c===99){set='C';continue}if(S==='B'&&c===100)continue;if(S==='A'&&c===101)continue;if(c===100){set='B';continue}if(c===101){set='A';continue}if(c>=96)continue;
    out+=S==='A'?String.fromCharCode(c<64?c+32:c-64):String.fromCharCode(c+32)}
  return out}
function c128Runs(W){/* W: پهنای عنصرها از یک نوار تیره شروع می‌شود (اندیس زوج = تیره) */
  for(let i=0;i+6<=W.length;i+=2){const st=c128Sym(W,i,6,11);if(st<103||st>105)continue;
    /* حاشیه سفید قبل از شروع دست‌کم ۴ ماژول */if(i>0){const u=(W[i]+W[i+1]+W[i+2]+W[i+3]+W[i+4]+W[i+5])/11;if(W[i-1]<u*4)continue}
    const codes=[st];let j=i+6,ok=0;
    while(j+6<=W.length&&codes.length<64){if(c128Sym(W,j,7,13)===106){ok=1;break}const c=c128Sym(W,j,6,11);if(c<0)break;codes.push(c);j+=6}
    if(!ok||codes.length<3)continue;const cs=codes.pop();let sum=codes[0];for(let k=1;k<codes.length;k++)sum+=codes[k]*k;if(sum%103!==cs)continue;
    const t=c128Txt(codes);if(t)return t}
  return null}
function c128Line(g){let mn=255,mx=0;for(const v of g){if(v<mn)mn=v;if(v>mx)mx=v}if(mx-mn<45)return null;const t=(mn+mx)/2,W=[];let k=0;
  while(k<g.length&&g[k]>=t)k++;/* اولین نوار تیره */let cur=1,len=0;for(;k<g.length;k++){const d=g[k]<t?1:0;if(d===cur)len++;else{W.push(len);cur=d;len=1}}W.push(len);
  return c128Runs(W)||c128Runs(W.slice().reverse().slice(W.length%2===0?1:0))}
/* تصویر (ImageData) → متن: چند خط افقی و عمودی؛ پرتکرارترین نتیجه */
function c128Img(D){const {width:w,height:h,data:a}=D,L=(x,y)=>{const i=(y*w+x)*4;return a[i]*.3+a[i+1]*.59+a[i+2]*.11},V=new Map,add=s=>{if(s)V.set(s,(V.get(s)||0)+1)};
  const NY=Math.min(36,h),NX=Math.min(24,w);
  for(let r=1;r<NY;r++){const y=Math.round(h*(.12+.76*r/NY)),g=new Array(w);for(let x=0;x<w;x++)g[x]=L(x,y);add(c128Line(g));if(V.size&&[...V.values()].some(v=>v>=3))break}
  if(!V.size)for(let r=1;r<NX;r++){const x=Math.round(w*(.12+.76*r/NX)),g=new Array(h);for(let y=0;y<h;y++)g[y]=L(x,y);add(c128Line(g));if([...V.values()].some(v=>v>=3))break}
  let best=null,bv=0;V.forEach((v,s)=>{if(v>bv){bv=v;best=s}});return best}
/* ---------- داده‌ها ---------- */
const bcNorm=s=>toEn(String(s||'')).replace(/[\s‌]/g,'').replace(/[^0-9A-Za-z\-]/g,'').toUpperCase();
const BCL=()=>custs.filter(c=>c&&c.sys==='bc'&&!c.del);
let BCIX=null;
function bcIx(){const v=(DVN.m_custs||0)+':'+custs.length;if(BCIX&&BCIX.v===v)return BCIX.m;const m=new Map();for(const r of BCL())m.set(r.code,r);BCIX={v,m};return m}
const bcFind=c=>bcIx().get(bcNorm(c))||null;
/* بارکد بعدی: ۸ رقم که با ۱ شروع می‌شود */
function bcNext(){let mx=10000000;for(const r of custs)if(r&&r.sys==='bc'&&/^1\d{7}$/.test(r.code||''))mx=Math.max(mx,+r.code);return String(mx+1)}
/* وضعیت فروش از روی سندها: آخرین رویداد هر بارکد (فروش = بیرون، مرجوعی = برگشت) */
let BCSM=null;
function bcSoldMap(){const v=(DVN.m_custs||0)+':'+custs.length;if(BCSM&&BCSM.v===v)return BCSM.m;const E=[];
  for(const c of CU())for(const t of c.txs||[]){if(t.del||t.type!=='inv')continue;const at=String(t.at0||t.at||t.date||'');
    (t.items||[]).forEach(it=>{if(it&&it.bc)E.push({c:it.bc,o:1,at,cu:c.id,cn:c.name,tx:t.id,no:t.no})});(t.xr||[]).forEach(x=>{if(x&&x.bc&&x.t==='buy')E.push({c:x.bc,o:0,at,cu:c.id,cn:c.name,tx:t.id,no:t.no})})}
  E.sort((a,b)=>a.at.localeCompare(b.at));const m=new Map();for(const e of E){if(e.o)m.set(e.c,e);else m.delete(e.c)}BCSM={v,m};return m}
const bcSold=c=>bcSoldMap().get(c)||null;
const bcItem=r=>({k:r.k,w:+r.w||0,ay:+r.ay||750,ajP:+r.ajP||0,ajT:+r.ajT||0,pp:r.pp==null||r.pp===''?PROFIT_DEF():+r.pp||0,...(+r.ppT>0?{ppT:+r.ppT}:{}),...(clean(r.ds||'')?{ds:clean(r.ds)}:{}),bc:r.code});
/* نرخ قیمت‌گذاری: سند باز (نرخ و مالیات همان سند) وگرنه قیمت لحظه‌ای بازار / آخرین سند */
function bcRate(){if(cur==='sell'&&sv&&+sv.rate>0)return {r:+sv.rate,tax:!!sv.tax,src:'نرخ همین سند'};let live=0;try{live=GL&&+GL.g18?1:0}catch(_){}
  return {r:+rtRef0()||0,tax:!!ls.get('m_tax',false),src:live?'قیمت لحظه‌ای بازار':'نرخ آخرین سند'}}
const bcPrice=(r,R)=>{R=R||bcRate();return R.r?itCalc(bcItem(r),R.r,R.tax):null};
const bcW=w=>toFa(String((+w||0).toFixed(3)).replace(/\.?0+$/,''));
const bcSub=r=>[bcW(r.w)+' گرم','عیار '+toFa(+r.ay||750),+r.ajP?'اجرت '+toFa(+r.ajP)+'٪':'',+r.ajT?'اجرت '+fmt(+r.ajT):'',r.pp!=null&&r.pp!==''?'سود '+toFa(+r.pp)+'٪':''].filter(Boolean).join(' · ');
function bcHapt(){try{if(navigator.vibrate)navigator.vibrate(18)}catch(_){}}
/* ---------- بارکدخوان (حالت صفحه‌کلید) ---------- */
/* بارکدخوان حرف‌ها را با فاصله کمتر از ~۳۰ میلی‌ثانیه می‌فرستد و Enter می‌زند؛ تایپ انسان کندتر است.
   اگر در کادری تایپ شده بود، متن آن کادر به حالت پیش از خواندن برمی‌گردد. چیدمان فارسی صفحه‌کلید: از e.code رقم/حرف اصلی گرفته می‌شود */
const BCW={b:'',t:0,dt:0,el:null,v0:null};
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const now=performance.now(),k=e.key;
  if(k==='Enter'||k==='Tab'){const n=BCW.b.length;if(n>=4&&now-BCW.t<90&&BCW.dt/(n-1)<48){e.preventDefault();e.stopPropagation();const code=BCW.b,el=BCW.el;BCW.b='';
      if(el&&BCW.v0!=null&&'value' in el&&el.value!==BCW.v0){el.value=BCW.v0;try{el.dispatchEvent(new Event('input',{bubbles:true}))}catch(_){}}bcOnScan(code);return}
    BCW.b='';return}
  let ch='';const c=e.code||'';if(/^(Digit|Numpad)\d$/.test(c))ch=c.slice(-1);else if(/^Key[A-Z]$/.test(c))ch=c.slice(3);else if(c==='Minus'||c==='NumpadSubtract')ch='-';else if(k&&k.length===1)ch=bcNorm(k);
  if(!ch){if(k!=='Shift')BCW.b='';return}
  if(now-BCW.t>70||!BCW.b){BCW.b='';BCW.dt=0;const a=document.activeElement;BCW.el=a&&a!==document.body?a:null;BCW.v0=BCW.el&&'value' in BCW.el?BCW.el.value:null}else BCW.dt+=now-BCW.t;
  BCW.b+=ch;BCW.t=now},true);
/* هر بارکد خوانده‌شده (بارکدخوان، دوربین، تایپ شماره) از اینجا می‌گذرد */
function bcOnScan(raw){const code=bcNorm(raw);if(!code||!TOKEN)return;if(document.querySelector('#lockv:not(.hide),.lk:not(.hide)'))return;
  const ovOpen=!$('ov').classList.contains('hide');
  if(ovOpen&&document.querySelector('#sheet .bcf')){const i=$('bcC');if(i&&BCF&&!BCF.id){i.value=code;BCF.code=code;toast('بارکد '+code+' در فرم نشست')}return}
  if(ovOpen&&!document.querySelector('#sheet .bcpv')){toast('بارکد '+code+' خوانده شد؛ برای قیمت، اول این پنجره را ببندید',true);return}
  bcHapt();if(!BQ)BQ={L:[],unk:''};
  if(!bcFind(code)){BQ.unk=code;bcPvShow();return}BQ.unk='';
  if(BQ.L.includes(code)){BQ.fl=code;bcPvShow();toast('این قطعه همین حالا در فهرست است');return}
  BQ.L.push(code);BQ.fl=code;bcPvShow()}
ACT.bcScanQ=d=>{if(sv&&sv.qa){sv.qa.q='';const K=$('qK');if(K)K.value=''}bcOnScan(d.c)};
/* ردیف «قطعه بارکددار» بالای فهرست تشخیص وقتی شماره بارکد تایپ شده (15j) */
function bcDkRow(q0){const c=bcNorm(q0);if(c.length<4)return '';const r=bcFind(c);if(!r)return '';const P=bcPrice(r),S=bcSold(c);
  return `<button type="button" class="bzsr dkrw fix bcdk" data-act="bcScanQ" data-c="${esc(c)}"><span class="av">${ic('bcd')}</span><span class="tx"><b>${esc(r.k)}${dsH(r)}</b><small>${esc(bcSub(r))}${S?' · فروخته شده':''}</small></span>${P?`<em>${fmt(P.tot)}</em>`:''}</button>`}
/* ---------- پنجره «قیمت برای مشتری» ---------- */
let BQ=null;
function bcPvShow(){const open=!$('ov').classList.contains('hide')&&document.querySelector('#sheet .bcpv');if(open){bcPvRe();return}sheet(bcPvHTML());bcPvBind()}
function bcPvRe(){const s=$('sheet');if(!s||!document.querySelector('#sheet .bcpv'))return;const y=(s.querySelector('.bcpl')||{}).scrollTop||0;
  if(typeof numMorph==='function')numMorph('#sheet .bcpk',()=>{s.innerHTML=bcPvHTML()});else s.innerHTML=bcPvHTML();bcPvBind();const l=s.querySelector('.bcpl');if(l)l.scrollTop=y}
function bcInDoc(c){if(cur!=='sell'||!sv)return 0;if((sv.items||[]).some(it=>it.bc===c))return 1;const S=bcSold(c);return S&&sv.edit&&String(S.tx)===String(sv.edit.tx)?1:0}
function bcPvHTML(){const B=BQ||{L:[]},R=bcRate(),inS=cur==='sell'&&!!sv;let tot=0,n=0,gw=0;
  const rows=B.L.map(c=>{const r=bcFind(c);if(!r)return '';const S=bcSold(c),D=bcInDoc(c),C=R.r?itCalc(bcItem(r),R.r,R.tax):null,ok=!S&&!D;if(ok&&C){tot+=C.tot;n++;gw+=+r.w||0}
    const tag=D?`<i class="bct d">در همین سند</i>`:S?`<i class="bct s">فروخته شده · سند ${toFa(S.no)}${S.cn?' · '+esc(S.cn):''}</i>`:'';
    return `<div class="bcpr${ok?'':' off'}${B.fl===c?' fl':''}"><span class="bcpi">${ic('bcd')}</span><span class="tx"><b>${esc(r.k)}${dsH(r)}</b><small>${esc(bcSub(r))}</small><small class="bccd">${esc(c)}${tag}</small></span><span class="bcpv2">${C?`<b>${fmt(C.tot)}</b><small>تومان</small>`:'<small>نرخ نیست</small>'}</span><button type="button" class="bcpx" data-act="bcPvX" data-c="${esc(c)}" aria-label="برداشتن">${ic('x')}</button></div>`}).join('');
  const unk=B.unk?`<div class="bcun"><span>${ic('bcd')}</span><span class="tx"><b>بارکد ${esc(B.unk)} ثبت نشده</b><small>این قطعه هنوز در «اتیکت و بارکد» تعریف نشده</small></span><button type="button" class="btn sm" data-act="bcNew" data-c="${esc(B.unk)}">ثبت این قطعه</button></div>`:'';
  const head=`<div class="sh-h"><div><b>قیمت برای مشتری</b><small class="shsub">${R.r?'هر گرم ۱۸: '+fmt(R.r)+' · '+R.src+(R.tax?' · با مالیات':''):'نرخ طلا معلوم نیست'}</small></div><button class="x" data-act="bcPvClose" aria-label="بستن">×</button></div>`;
  const card=`<div class="bcpk"><small>${n?toFa(n)+' قطعه · '+bcW(gw)+' گرم':'قطعه‌ای در فهرست نیست'}</small><b>${fmt(tot)}</b><span>تومان${R.tax?' · با مالیات':''}</span></div>`;
  const tail=`<div class="bcpm"><button type="button" class="bcpc" data-act="bcCam">${ic('scan')}<span>دوربین</span></button><label class="bcpq">${ic('search')}<input id="bcQ" inputmode="numeric" autocomplete="off" enterkeyhint="go" placeholder="شماره بارکد را بزنید"></label></div>
  <p class="bcph">${ic('bcd')}<span>قطعه بعدی را با بارکدخوان بزنید؛ همین‌جا اضافه می‌شود.</span></p>`;
  const go=n?`<button class="xgo" data-act="bcPvAdd">${ic('check')} ${inS?'افزودن به سند':'سند فروش'}</button>`:'';
  return `<div class="bcpv">${head}${card}${!R.r?`<p class="bcph r">${ic('alert')}<span>نرخ طلا را در سند بزنید یا اینترنت را روشن کنید تا قیمت حساب شود.</span></p>`:''}<div class="bcpl">${rows}${unk}</div>${tail}${go}</div>`}
function bcPvBind(){const q=$('bcQ');if(q){q.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const v=q.value;q.value='';bcOnScan(v)}}}if(BQ&&BQ.fl){const fl=BQ.fl;BQ.fl='';setTimeout(()=>{const e=document.querySelector('#sheet .bcpr.fl');if(e){e.scrollIntoView({block:'nearest'});setTimeout(()=>e.classList.remove('fl'),900)}},30)}}
ACT.bcPvX=d=>{if(!BQ)return;BQ.L=BQ.L.filter(c=>c!==d.c);bcPvRe()};
ACT.bcPvClose=()=>{BQ=null;closeSheet()};
ACT.bcPv1=d=>{BQ={L:[d.c],unk:''};closeSheet();setTimeout(bcPvShow,30)};
/* قطعه‌ها به سند: در صفحه سند همان سند؛ وگرنه سند فروش تازه (پیش‌نویس ثبت‌نشده قبلی سند باز می‌ماند — 15zz-zzt) */
ACT.bcPvAdd=()=>{if(!BQ)return;if(!can('debt')){toast('دسترسی سند برای حساب شما فعال نیست',true);return}
  const L=BQ.L.filter(c=>bcFind(c)&&!bcSold(c)&&!bcInDoc(c));if(!L.length){toast('قطعه قابل فروشی در فهرست نیست',true);return}
  const put=()=>{if(cur!=='sell'||!sv)return;if(!sv.rate){const r=+rtRef0()||0;if(r){sv.rate=r;sv.mz=mzOf(r)}}
    L.forEach(c=>{const r=bcFind(c),it={...bcItem(r),cat:GK.includes(r.k)?r.k:'نو',n:''};sv.items.push(it);try{svUsed[r.k]=(svUsed[r.k]||0)+1}catch(_){}});svAdd=sv.items.length-1;svKeep();
    try{svRe()}catch(_){render()}toast(toFa(L.length)+' قطعه به سند اضافه شد'+(svCu()?'':'؛ مشتری را انتخاب کنید'))};
  BQ=null;closeSheet();
  if(cur==='sell'&&sv){setTimeout(put,40);return}
  const old=ls.get('m_svd',null);if(old&&typeof svtKeepOld==='function')svtKeepOld(old);ACT.svNew({fresh:1});setTimeout(put,180)};
/* ---------- دوربین ---------- */
const bcInApp=()=>typeof AndroidBridge!=='undefined';
let BCC=null;
ACT.bcCam=()=>{if(BCC)return;if(bcInApp()||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){bcPhoto();return}bcCamOpen()};
async function bcCamOpen(){const o=document.createElement('div');o.id='bccm';o.innerHTML=`<video playsinline muted autoplay></video><div class="bccf"><i></i></div><div class="bcct">${ic('bcd')}<span>بارکد را داخل کادر بگیرید</span></div><button type="button" class="bccx" aria-label="بستن">${ic('x')}</button><div class="bccb"><button type="button" class="bccp">${ic('cam')}<span>عکس بگیرید</span></button><button type="button" class="bccn">${ic('edit')}<span>زدن شماره</span></button></div>`;
  document.body.appendChild(o);BCC={o,s:null,tm:0,cv:document.createElement('canvas'),det:null};const v=o.querySelector('video');
  o.querySelector('.bccx').onclick=bcCamClose;o.querySelector('.bccp').onclick=()=>{bcCamClose();bcPhoto()};o.querySelector('.bccn').onclick=()=>{bcCamClose();if(!BQ)BQ={L:[],unk:''};bcPvShow();setTimeout(()=>{const q=$('bcQ');if(q)q.focus()},350)};
  try{BCC.s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false})}catch(e){bcCamClose();bcPhoto();return}
  if(!BCC){return}v.srcObject=BCC.s;try{await v.play()}catch(_){}
  try{if('BarcodeDetector' in window){const F=await BarcodeDetector.getSupportedFormats();const W=['code_128','ean_13','ean_8','code_39','qr_code'].filter(f=>F.includes(f));if(W.length)BCC.det=new BarcodeDetector({formats:W})}}catch(_){}
  const tick=async()=>{if(!BCC)return;let r=null;try{if(v.videoWidth){if(BCC.det){const L=await BCC.det.detect(v);if(L&&L[0])r=L[0].rawValue}
        if(!r){const cv=BCC.cv,w=Math.min(960,v.videoWidth),h=Math.round(w*v.videoHeight/v.videoWidth);cv.width=w;cv.height=h;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(v,0,0,w,h);r=c128Img(g.getImageData(0,Math.round(h*.25),w,Math.round(h*.5)))}}}catch(_){}
    if(!BCC)return;if(r){bcCamClose();bcOnScan(r);return}BCC.tm=setTimeout(tick,140)};
  BCC.tm=setTimeout(tick,300)}
function bcCamClose(){if(!BCC)return;clearTimeout(BCC.tm);try{BCC.s&&BCC.s.getTracks().forEach(t=>t.stop())}catch(_){}BCC.o.remove();BCC=null}
/* بی دوربین زنده (اپ اندروید و مرورگرهای قدیمی): عکس با دوربین خود گوشی و خواندن از روی عکس */
function bcPhoto(){const i=document.createElement('input');i.type='file';i.accept='image/*';i.setAttribute('capture','environment');i.style.display='none';document.body.appendChild(i);
  i.onchange=async()=>{const f=(i.files||[])[0];i.remove();if(!f)return;toast('در حال خواندن بارکد…');let r=null;
    try{const url=URL.createObjectURL(f),im=new Image();await new Promise((ok,no)=>{im.onload=ok;im.onerror=no;im.src=url});
      if('BarcodeDetector' in window){try{const L=await new BarcodeDetector().detect(im);if(L&&L[0])r=L[0].rawValue}catch(_){}}
      if(!r){const cv=document.createElement('canvas'),k=Math.min(1,1400/Math.max(im.naturalWidth,im.naturalHeight));cv.width=Math.round(im.naturalWidth*k);cv.height=Math.round(im.naturalHeight*k);const g=cv.getContext('2d');g.drawImage(im,0,0,cv.width,cv.height);r=c128Img(g.getImageData(0,0,cv.width,cv.height))}
      URL.revokeObjectURL(url)}catch(_){}
    if(r)bcOnScan(r);else{toast('بارکد خوانده نشد؛ نزدیک‌تر و صاف عکس بگیرید یا شماره زیر بارکد را بزنید',true);if(!BQ)BQ={L:[],unk:''};bcPvShow()}};
  i.click()}
/* ---------- ثبت / ویرایش قطعه ---------- */
let BCF=null;
ACT.bcNew=d=>{if(!can('debt')){toast('دسترسی این بخش برای حساب شما فعال نیست',true);return}const last=ls.get('m_bc_last',null)||{};
  BCF={id:null,code:d&&d.c?bcNorm(d.c):'',k:last.k||'',w:'',ay:last.ay||750,ajP:last.ajP==null?'':last.ajP,ajT:'',pp:last.pp==null?PROFIT_DEF():last.pp,ds:''};closeSheet();setTimeout(bcFOpen,30)};
ACT.bcEdit=d=>{const r=bcFind(d.c);if(!r)return;BCF={id:r.id,code:r.code,k:r.k,w:String(r.w||''),ay:r.ay||750,ajP:r.ajP||'',ajT:r.ajT||'',pp:r.pp==null?'':r.pp,ds:r.ds||''};closeSheet();setTimeout(bcFOpen,30)};
function bcFOpen(){sheet(bcFHTML());bcFBind();if(!BCF.k)return;setTimeout(()=>{const w=$('bcW');if(w&&!BCF.id)w.focus()},380)}
function bcFHTML(){const F=BCF,G=goodsList().filter(k=>k!=='آبشده'&&k!=='سکه پارسیان').slice(0,40),R=bcRate();
  const fld=(id,l,v,o)=>`<label class="bcfl${o&&o.w?' wd':''}"><small>${l}</small><input id="${id}" ${o&&o.t?'':'inputmode="decimal" dir="ltr"'} autocomplete="off" value="${esc(v==null?'':String(v))}" placeholder="${o&&o.ph||''}"></label>`;
  return `<div class="bcf"><div class="sh-h"><div><b>${F.id?'ویرایش قطعه':'قطعه تازه با بارکد'}</b><small class="shsub">مشخصات روی اتیکت چاپ می‌شود و با خواندن بارکد در سند می‌نشیند</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bcfk"><small>کالا</small><div class="bcch">${G.map(k=>`<button type="button" class="${k===F.k?'on':''}" data-act="bcFk" data-k="${esc(k)}">${esc(k)}</button>`).join('')}</div>${fld('bcK','یا نام کالا را بنویسید',F.k,{t:1,w:1,ph:'مثلاً النگو'})}</div>
  <div class="bcfg">${fld('bcW','وزن · گرم',F.w,{ph:'۰٫۰۰۰'})}${fld('bcA','عیار',F.ay)}${fld('bcJ','اجرت ٪',F.ajP,{ph:'۰'})}${fld('bcT','اجرت تومانی',F.ajT?Number(F.ajT).toLocaleString('en-US'):'',{ph:'۰'})}${fld('bcP','سود ٪',F.pp,{ph:'۰'})}${fld('bcD','شرح (اختیاری)',F.ds,{t:1,ph:'مثلاً طرح کارتیر'})}</div>
  <label class="bcfl wd bcfc"><small>بارکد · ${F.id?'ثابت':'خالی = خودکار'}</small><span>${ic('bcd')}<input id="bcC" dir="ltr" autocomplete="off" value="${esc(F.code||'')}" placeholder="${F.id?'':bcNext()}" ${F.id?'readonly':''}></span></label>
  <div id="bcFr">${bcFRes()}</div>
  <div class="bcfb"><button type="button" class="btn sec" data-act="bcFSave" data-p="1">${ic('print')} ذخیره و چاپ اتیکت</button>${F.id?'':`<button type="button" class="btn sec" data-act="bcFSave" data-nx="1">${ic('plus')} ذخیره و قطعه بعدی</button>`}</div>
  <button class="xgo" data-act="bcFSave">${ic('check')} ذخیره</button>
  ${R.r?'':`<p class="bcph r">${ic('alert')}<span>نرخ طلا در دسترس نیست؛ قیمت بعداً در سند حساب می‌شود.</span></p>`}</div>`}
function bcFRead(){const F=BCF,g=id=>{const e=$(id);return e?e.value:''},n=v=>{v=toEn(String(v||'')).replace(/,/g,'').replace(/[٫\/]/g,'.');return v===''?'':+v};
  F.k=clean(g('bcK'));F.w=toEn(g('bcW')).replace(/[٫\/]/g,'.');F.ay=n(g('bcA'))||750;F.ajP=n(g('bcJ'));F.ajT=n(g('bcT'));F.pp=n(g('bcP'));F.ds=clean(g('bcD'));if(!F.id)F.code=bcNorm(g('bcC'))}
function bcFRes(){const F=BCF,w=parseFloat(F.w)||0,R=bcRate();if(!w||!F.k||!R.r)return '';const C=itCalc({k:F.k,w,ay:+F.ay||750,ajP:+F.ajP||0,ajT:+F.ajT||0,pp:F.pp===''?0:+F.pp||0},R.r,R.tax);
  return `<div class="bcfr">${ic('tag')}<span class="tx"><b>قیمت امروز برای مشتری</b><small>${R.src} · هر گرم ۱۸ ${fmt(R.r)}</small></span><b class="v">${fmt(C.tot)}<small>تومان</small></b></div>`}
function bcFBind(){['bcK','bcW','bcA','bcJ','bcT','bcP','bcD','bcC'].forEach(id=>{const e=$(id);if(!e)return;e.oninput=()=>{if(id==='bcT'){const d=toEn(e.value).replace(/\D/g,'');e.value=d?Number(d).toLocaleString('en-US'):''}
    if(id==='bcK')document.querySelectorAll('#sheet .bcch button').forEach(b=>b.classList.toggle('on',b.dataset.k===clean(e.value)));bcFRead();const r=$('bcFr');if(r)r.innerHTML=bcFRes()}})}
ACT.bcFk=d=>{const e=$('bcK');if(e){e.value=d.k;e.dispatchEvent(new Event('input'))}const w=$('bcW');if(w&&!w.value)w.focus()};
ACT.bcFSave=d=>{if(!BCF)return;bcFRead();const F=BCF,w=parseFloat(F.w)||0;
  if(!F.k){toast('کالا را انتخاب کنید یا بنویسید',true);$('bcK')&&$('bcK').focus();return}
  if(!(w>0)){toast('وزن را بزنید',true);$('bcW')&&$('bcW').focus();return}if(w>3000){toast('وزن بیش از ۳ کیلو است؛ عدد را بررسی کنید',true);return}
  const ay=+F.ay||750;if(ay<300||ay>1000){toast('عیار درست نیست',true);return}
  let rec;if(F.id){rec=custs.find(c=>String(c.id)===String(F.id)&&c.sys==='bc');if(!rec)return}
  else{const code=F.code||bcNext();if(code.length<4){toast('بارکد دست‌کم ۴ نویسه باشد',true);return}if(bcFind(code)){toast('بارکد '+code+' قبلاً برای قطعه دیگری ثبت شده',true);return}
    rec={id:nid++,sys:'bc',name:'',txs:[],code,createdAt:ns(),at:ns(),by:ME?ME.name:''};custs.push(rec)}
  Object.assign(rec,{k:F.k,w,ay,ajP:+F.ajP||0,ajT:+F.ajT||0,pp:F.pp===''?PROFIT_DEF():+F.pp||0,ds:F.ds,ed:ns()});addGoods(F.k);ls.set('m_bc_last',{k:F.k,ay,ajP:rec.ajP,pp:rec.pp});saveCu();
  if(typeof logA==='function')try{logA('bc',(F.id?'ویرایش قطعه ':'قطعه تازه ')+rec.code+' · '+rec.k+' '+bcW(rec.w)+' گرم')}catch(_){}
  const code=rec.code;BCF=null;
  if(d&&d.p){closeSheet();toast('قطعه '+code+' ذخیره شد');setTimeout(()=>bcPrintOpen([code]),60);return}
  if(d&&d.nx){const last=ls.get('m_bc_last',{});BCF={id:null,code:'',k:last.k||'',w:'',ay:last.ay||750,ajP:last.ajP==null?'':last.ajP,ajT:'',pp:last.pp==null?PROFIT_DEF():last.pp,ds:''};
    const s=$('sheet');if(s){s.innerHTML=bcFHTML();bcFBind();setTimeout(()=>{const e=$('bcW');if(e)e.focus()},60)}toast('قطعه '+code+' ذخیره شد · قطعه بعدی');if(cur==='bcl')bclRe();return}
  closeSheet();toast('قطعه '+code+' ذخیره شد');if(cur==='bcl')bclRe()};
ACT.bcDel=d=>{const r=bcFind(d.c);if(!r)return;if(bcSold(r.code)){toast('این قطعه در سند فروش آمده؛ حذف نمی‌شود',true);return}
  askConfirm('قطعه «'+r.k+'» با بارکد '+r.code+' حذف شود؟','حذف',()=>{r.del=true;r.ed=ns();saveCu();toast('قطعه حذف شد','', 'بازگردانی',()=>{r.del=false;saveCu();if(cur==='bcl')bclRe()});if(cur==='bcl')bclRe()})};
ACT.bcDoc=d=>{const S=bcSold(d.c);if(!S)return;closeSheet();if(typeof invOpen==='function')invOpen(S.cu,S.tx)};
/* ---------- چاپ اتیکت ---------- */
const BCLAB={s40:[40,25,'۴۰ × ۲۵'],s50:[50,30,'۵۰ × ۳۰'],s60:[60,40,'۶۰ × ۴۰'],db:[72,10,'دمبلی ۷۲ × ۱۰ (اتیکت جواهر)']};
const bcLabK=()=>{const k=ls.get('m_bclab','s40');return BCLAB[k]?k:'s40'};
let BCP=null;
function bcPrintOpen(codes){BCP={L:codes.slice()};sheet(bcPrHTML())}
function bcPrHTML(){const L=BCP.L.map(bcFind).filter(Boolean),k=bcLabK();
  return `<div class="bcprs"><div class="sh-h"><div><b>چاپ اتیکت</b><small class="shsub">${toFa(L.length)} اتیکت · اندازه برچسب چاپگر را انتخاب کنید</small></div><button class="x" data-act="close" aria-label="بستن">×</button></div>
  <div class="bcsz">${Object.entries(BCLAB).map(([key,[w,h,t]])=>`<button type="button" class="${key===k?'on':''}" data-act="bcLab" data-k="${key}"><i style="--r:${(h/w).toFixed(3)}"></i><span>${t}</span><small>میلی‌متر</small></button>`).join('')}</div>
  <div class="bclp">${L.slice(0,1).map(r=>bcLabInner(r,k,1)).join('')}</div>
  <p class="bcph">${ic('print')}<span>با چاپگر برچسب (حرارتی) یا هر چاپگری که برچسب هم‌اندازه دارد؛ در پنجره چاپ، اندازه کاغذ را همان اندازه برچسب بگذارید.</span></p>
  <button class="xgo" data-act="bcPrGo">${ic('print')} چاپ ${toFa(L.length)} اتیکت</button></div>`}
ACT.bcLab=d=>{if(!BCLAB[d.k])return;ls.set('m_bclab',d.k);const s=$('sheet');if(s&&BCP)s.innerHTML=bcPrHTML()};
ACT.bcPrGo=()=>{if(!BCP)return;const L=BCP.L.map(bcFind).filter(Boolean),k=bcLabK();if(!L.length)return;BCP=null;closeSheet();
  setTimeout(()=>openPrint(()=>bcLabDoc(L,k)),60);const t=ns();L.forEach(r=>{r.pr=t});saveCu();if(cur==='bcl')setTimeout(bclRe,400)};
ACT.bcPrint1=d=>{closeSheet();setTimeout(()=>bcPrintOpen([d.c]),40)};
const bcShop=()=>{const r=cfgRec(),s=(r&&r.shop)||{};return clean(s.nm||'')||'طلا و جواهر مطلا'};
/* داخل یک اتیکت (پیش‌نمایش در پنجره و برگه چاپ) — اندازه‌ها میلی‌متر */
function bcLabInner(r,k,pv){const [W,H]=BCLAB[k],nm=esc(r.k)+(r.ds?' <i>'+esc(r.ds)+'</i>':''),wt=bcW(r.w)+' گرم',sub=['عیار '+toFa(+r.ay||750),+r.ajP?'اجرت '+toFa(+r.ajP)+'٪':'',+r.ajT?'اجرت '+fmt(+r.ajT):''].filter(Boolean).join(' · ');
  const st=pv?` style="width:${W*3.2}px;height:${H*3.2}px;--u:3.2px;--h:${H}"`:'';
  if(k==='db')return `<div class="blb db"${st}><div class="lw a">${c128SVG(r.code,{cls:'lbc'})}<div class="lcd">${esc(r.code)}</div></div><div class="lw g"></div><div class="lw b"><b>${nm}</b><span>${wt}</span><small>${sub}</small></div></div>`;
  return `<div class="blb n"${st}><div class="lsh">${esc(bcShop())}</div><b class="lnm">${nm}</b><div class="lwt"><span>${wt}</span><small>${sub}</small></div>${c128SVG(r.code,{cls:'lbc'})}<div class="lcd">${esc(r.code)}</div></div>`}
/* برگه چاپ: هر اتیکت یک صفحه به اندازه برچسب (section.sht + @page) */
function bcLabDoc(L,k){const [W,H]=BCLAB[k],u='1mm',db=k==='db';
  return `<!doctype html><html dir="rtl" lang="fa"><head><meta charset="utf-8"><title>اتیکت</title><style>
@font-face{font-family:Vazirmatn;font-weight:400;src:url(fonts/Vazirmatn-Regular.woff2) format('woff2')}
@font-face{font-family:Vazirmatn;font-weight:700;src:url(fonts/Vazirmatn-Bold.woff2) format('woff2')}
@page{size:${W}mm ${H}mm;margin:0mm}
*{box-sizing:border-box;margin:0;padding:0}
html,body{margin:0;padding:0;background:#fff}
body{font-family:Vazirmatn,Tahoma,sans-serif;color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
section.sht{width:${W}mm;height:${H}mm;overflow:hidden;page-break-after:always;break-after:page;background:#fff}
.blb{width:${W}mm;height:${H}mm;overflow:hidden;position:relative}
.blb.n{padding:${(H*.05).toFixed(2)}mm ${(W*.05).toFixed(2)}mm;text-align:center}
.lsh{font-size:${(H*.2).toFixed(1)}pt;line-height:1.1;white-space:nowrap;overflow:hidden}
.lnm{display:block;font-size:${(H*.32).toFixed(1)}pt;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}
.lnm i{font-style:normal;font-weight:400;font-size:.8em}
.lwt{font-size:${(H*.26).toFixed(1)}pt;line-height:1.2;white-space:nowrap;overflow:hidden}.lwt span{font-weight:700}.lwt small{font-size:.8em;margin-inline-start:1.2mm}
.lbc{display:block;width:100%;height:${(H*.3).toFixed(2)}mm;margin-top:.6mm}
.lcd{font-size:${(H*.2).toFixed(1)}pt;line-height:1.05;letter-spacing:.06em;direction:ltr;font-family:monospace,Vazirmatn}
.blb.db{display:table;table-layout:fixed;width:${W}mm}.blb.db .lw{display:table-cell;vertical-align:middle;overflow:hidden}
.blb.db .lw.a{width:27mm;padding:.6mm 1mm;text-align:center}.blb.db .lw.g{width:18mm}.blb.db .lw.b{width:27mm;padding:.4mm 1mm;line-height:1.05;text-align:center}
.blb.db .lbc{height:5.6mm;margin:0}.blb.db .lcd{font-size:4.6pt}
.blb.db b{display:block;font-size:5.6pt;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.blb.db b i{font-style:normal;font-weight:400}.blb.db span{display:block;font-size:5.6pt;font-weight:700}.blb.db small{display:block;font-size:4.4pt;white-space:nowrap;overflow:hidden}
</style></head><body>${L.map(r=>`<section class="sht">${bcLabInner(r,k,0)}</section>`).join('')}</body></html>`}
/* ---------- صفحه «اتیکت و بارکد» ---------- */
TITLES.bcl='اتیکت‌ها';PARENT.bcl='stock';FULLP.add('bcl');SLIDEP.add('bcl');
let BCV={q:'',f:'in',n:120};
const BCVF=[['in','موجود'],['np','چاپ‌نشده'],['out','فروخته'],['all','همه']];
ACT.bcGo=()=>{closeSheet();PARENT.bcl=['stock','home','reports'].includes(cur)?cur:'stock';if(typeof meRet!=='undefined')meRet=null;go('bcl')};
function bclData(){const S=bcSoldMap(),A=BCL().map(r=>({r,s:S.get(r.code)||null})).sort((a,b)=>String(b.r.at||'').localeCompare(String(a.r.at||'')));return A}
function bclListHTML(){const A=bclData(),q=nzName(toEn(clean(BCV.q||''))),qc=bcNorm(BCV.q||''),R=bcRate();
  const F=A.filter(x=>(BCV.f==='all'||(BCV.f==='in'&&!x.s)||(BCV.f==='out'&&x.s)||(BCV.f==='np'&&!x.s&&!x.r.pr))&&(!q||nzName(x.r.k+' '+(x.r.ds||'')).includes(q)||(qc&&x.r.code.includes(qc))));
  if(!F.length)return `<div class="eh bcem">${A.length?'قطعه‌ای با این جستجو نیست':'هنوز قطعه‌ای ثبت نشده؛ «قطعه تازه» را بزنید'}</div>`;
  return `<div class="bcls">${F.slice(0,BCV.n).map(({r,s})=>{const C=!s&&R.r?itCalc(bcItem(r),R.r,R.tax):null;
    return `<button type="button" class="bcrw${s?' sold':''}" data-act="bcRow" data-c="${esc(r.code)}"><span class="bcpi">${ic('bcd')}</span><span class="tx"><b>${esc(r.k)}${dsH(r)}</b><small>${esc(bcSub(r))}</small><small class="bccd">${esc(r.code)}${s?`<i class="bct s">فروخته · سند ${toFa(s.no)}</i>`:r.pr?'':'<i class="bct p">چاپ نشده</i>'}</small></span>${C?`<span class="bcpv2"><b>${fmt(C.tot)}</b><small>قیمت امروز</small></span>`:''}</button>`}).join('')}${F.length>BCV.n?`<button type="button" class="cumore" data-act="bclMore">${ic('chev')}<span>${fmt(F.length-BCV.n)} قطعه دیگر</span></button>`:''}</div>`}
function vBcl(){const A=bclData(),I=A.filter(x=>!x.s),gw=I.reduce((s,x)=>s+(+x.r.w||0),0),np=I.filter(x=>!x.r.pr).length;
  return `<div class="bclp0"><div class="bchero"><span class="bchi">${ic('bcd')}</span><div><small>قطعه‌های اتیکت‌دار موجود</small><b>${toFa(I.length)} قطعه</b><span>${bcW(gw)} گرم${A.length-I.length?' · '+toFa(A.length-I.length)+' فروخته':''}</span></div></div>
  <div class="bkfx2 bcq"><button type="button" class="bkq b" data-act="bcCam"><span class="bkqi">${ic('scan')}</span><span class="bkqt"><strong>خواندن بارکد</strong><em>دوربین یا بارکدخوان</em></span></button><button type="button" class="bkq g" data-act="bcPrNp"${np?'':' disabled'}><span class="bkqi">${ic('print')}</span><span class="bkqt"><strong>چاپ اتیکت‌ها</strong><em>${np?toFa(np)+' اتیکت چاپ‌نشده':'همه چاپ شده'}</em></span></button></div>
  <div class="fsearch stkq">${ic('search')}<input id="bclQ" type="search" value="${esc(BCV.q||'')}" placeholder="جستجوی کالا یا شماره بارکد…" autocomplete="off" enterkeyhint="search"></div>
  <div class="stkf" role="tablist">${BCVF.map(([k,t])=>`<button type="button" role="tab" aria-selected="${BCV.f===k}" class="${BCV.f===k?'on':''}" data-act="bclF" data-f="${k}">${t}</button>`).join('')}</div>
  <div id="bclL">${bclListHTML()}</div>
  <div class="stkn">بارکدخوان را به گوشی وصل کنید (USB یا بلوتوث، حالت صفحه‌کلید)؛ در هر صفحه‌ای که باشید، با زدن بارکد قیمت قطعه برای مشتری باز می‌شود و از آن‌جا به سند اضافه می‌شود.</div></div>`}
const aBcl=()=>'';
function bindBcl(){const q=$('bclQ');if(!q)return;q.oninput=()=>{BCV.q=q.value;BCV.n=120;const L=$('bclL');if(L){L.classList.add('noan');L.innerHTML=bclListHTML()}}}
function bclRe(){if(cur!=='bcl')return;const L=$('bclL');if(L)L.innerHTML=bclListHTML();else render()}
ACT.bclF=d=>{BCV.f=d.f;BCV.n=120;document.querySelectorAll('#view .stkf button').forEach(b=>{const on=b.dataset.f===d.f;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});bclRe()};
ACT.bclMore=()=>{BCV.n+=200;bclRe()};
ACT.bcPrNp=()=>{const L=bclData().filter(x=>!x.s&&!x.r.pr).map(x=>x.r.code);if(!L.length){toast('همه اتیکت‌ها چاپ شده‌اند');return}bcPrintOpen(L)};
ACT.bcRow=(d,e)=>{const r=bcFind(d.c);if(!r)return;const S=bcSold(r.code),b=e&&e.target.closest('[data-act]');
  popMenu(b,[['bcPv1',ic('tag'),'قیمت برای مشتری',{c:r.code}],['bcPrint1',ic('print'),'چاپ اتیکت',{c:r.code}],['bcEdit',ic('edit'),'ویرایش مشخصات',{c:r.code}],...(S?[['bcDoc',ic('open'),'دیدن سند فروش ('+toFa(S.no)+')',{c:r.code}]]:[['bcDel',ic('trash'),'حذف قطعه',{c:r.code}]])])};
/* کاشی صفحه «موجودی کالاها» */
function bcStkTile(){const A=bclData(),I=A.filter(x=>!x.s);return `<button type="button" class="bcst" data-act="bcGo"><span class="bchi">${ic('bcd')}</span><span class="tx"><b>اتیکت و بارکد</b><small>${A.length?toFa(I.length)+' قطعه اتیکت‌دار موجود · '+bcW(I.reduce((s,x)=>s+(+x.r.w||0),0))+' گرم':'ثبت قطعه با بارکد، چاپ اتیکت، خواندن با بارکدخوان'}</small></span>${ic('back').replace('class="i"','class="i flip"')}</button>`}
