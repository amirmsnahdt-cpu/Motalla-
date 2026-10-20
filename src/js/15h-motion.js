/* ============ v58: حرکت‌ها — حس لمس همه دکمه‌ها، جابه‌جایی نرم ردیف‌ها، باز شدن بی‌لگ پنجره‌ها ============ */
/* ۱) حس لمس یکپارچه: هر چیز قابل لمس (دکمه، ردیف، تب، چیپ) هنگام فشار کمی فرو می‌رود و با فنر برمی‌گردد.
   با Web Animations روی ویژگی جداگانه scale کار می‌کند تا با transformهای خود عناصر (کشیدن ردیف، جای دکمه‌ها) تداخل نکند.
   اندازه فرورفتن به اندازه عنصر بستگی دارد: دکمه کوچک بیشتر، ردیف پهن خیلی کم (مثل iOS). اسکرول یا کشیدن، فشار را لغو می‌کند. */
const PRESS_SEL='button,[data-act],a[href],.opt,.lrow,.tcard,label.chk';
(()=>{if(typeof Element==='undefined'||!Element.prototype.animate)return;
  let cur=null,x0=0,y0=0,t0=0;
  const RMq=matchMedia('(prefers-reduced-motion: reduce)');
  const target=e=>{const el=e.target&&e.target.closest&&e.target.closest(PRESS_SEL);if(!el||el.disabled||el.getAttribute('aria-disabled')==='true')return null;
    return el.matches('input,textarea,select')?null:el};
  const depth=el=>{const r=el.getBoundingClientRect(),w=r.width,h=r.height;if(!w||!h)return 1;
    if(w>=300||h>=110)return .985;if(w>=200)return .975;if(w>=110)return .96;return .9};
  const down=el=>{const s=depth(el);el._pa&&el._pa.cancel();
    el._pa=el.animate([{scale:'1'},{scale:String(s)}],{duration:110,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});el._ps=s};
  const up=el=>{if(!el||!el._pa)return;const s=el._ps||.96,a=el._pa;el._pa=null;
    const wait=Math.max(0,90-(performance.now()-t0));/* ضربه خیلی سریع هم دیده شود */
    setTimeout(()=>{try{a.cancel()}catch(_){}
      if(!el.isConnected)return;el.animate([{scale:String(s)},{scale:'1.012'},{scale:'1'}],{duration:420,easing:'cubic-bezier(.32,.72,0,1)'})},wait)};
  document.addEventListener('pointerdown',e=>{if(RMq.matches||e.button>0)return;const el=target(e);if(!el)return;cur=el;x0=e.clientX;y0=e.clientY;t0=performance.now();down(el)},{passive:true,capture:true});
  const end=()=>{if(cur){up(cur);cur=null}};
  document.addEventListener('pointerup',end,{passive:true,capture:true});
  document.addEventListener('pointercancel',end,{passive:true,capture:true});
  document.addEventListener('pointermove',e=>{if(cur&&(Math.abs(e.clientX-x0)>9||Math.abs(e.clientY-y0)>9))end()},{passive:true,capture:true});
  document.addEventListener('scroll',end,{passive:true,capture:true});
  document.addEventListener('dragstart',end,{capture:true});
})();

/* ۲) جابه‌جایی نرم (FLIP) — v58.6: هر بار که همان صفحه دوباره ساخته می‌شود (جستجو، زدن روی تاریخ/روز، فیلتر، تسویه، همگام‌سازی…)
   ردیف‌ها و کارت‌هایی که می‌مانند از جای قبلی‌شان به جای تازه می‌لغزند و ردیف‌های تازه پشت سر هم از پایین بالا می‌آیند
   (همان حس عوض شدن روز در خانه) — در همه صفحه‌ها، نه فقط ردیف‌های data-fk.
   کلید هر عنصر: data-fk، وگرنه data-act با همه data-*های دیگرش (مثلاً کارت لیست = arcDay|تاریخ)، وگرنه تیک انتخاب (data-sel).
   فقط عناصر داخل دید حرکت می‌کنند؛ حرکت کم (reduced motion) رعایت می‌شود. */
const FLIP_SEL='[data-fk],[data-act]:not(.swb):not(input):not(textarea):not(select),label.arow,.bempty,.card.empty';
function flipKey(el){const d=el.dataset;if(d.fk)return d.fk;
  if(d.act){let k=d.act;for(const n in d)if(n!=='act'&&n!=='fk')k+='|'+n+'='+d[n];return k}
  const s=el.querySelector(':scope>input[data-sel]');if(s)return 'sel:'+s.dataset.sel;return 'c:'+el.className}
function flipEls(root){return root.querySelectorAll(FLIP_SEL)}/* دکمه‌های پنهان کشیدن ردیف (.swb) و فیلدها حساب نمی‌شوند */
function flipSnap(root){if(!root||RM()||!root.animate)return null;const m=new Map(),vh=innerHeight;
  flipEls(root).forEach(el=>{if(el.matches('input,textarea,select,option'))return;const k=flipKey(el);if(m.has(k)){m.set(k,null);return}const r=el.getBoundingClientRect();m.set(k,r.height?{x:r.left,y:r.top,vis:r.bottom>-40&&r.top<vh+40}:null)});
  return m}
function flipPlay(root,m){if(!m||!root)return;const vh=innerHeight,N=[],seen=new Set(),E=[];
  flipEls(root).forEach(el=>{el._fd=null;el._fn=0;if(el.matches('input,textarea,select,option'))return;const k=flipKey(el);if(seen.has(k))return;seen.add(k);const r=el.getBoundingClientRect(),o=m.get(k);
    if(!r.height)return;const vis=r.bottom>-40&&r.top<vh+40;E.push(el);
    if(o===undefined){el._fn=1;if(vis)N.push([el,'new']);return}
    if(!o||!(o.vis||vis))return;
    const dx=o.x-r.left,dy=o.y-r.top;if(Math.abs(dx)>.5||Math.abs(dy)>.5){el._fd={dx,dy};N.push([el,'mv'])}});
  let n=0;
  N.forEach(([el,t])=>{
    /* پدرِ این عنصر هم تازه است → فقط پدر بالا بیاید؛ پدر حرکت می‌کند → فقط اختلاف را حرکت بده (حرکت تو در تو دوبرابر نشود) */
    let dx=t==='mv'?el._fd.dx:0,dy=t==='mv'?el._fd.dy:0;
    for(let p=el.parentElement;p&&p!==root;p=p.parentElement){if(p._fn)return;if(p._fd){dx-=p._fd.dx;dy-=p._fd.dy;break}}
    if(t==='new'){el.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:460,delay:Math.min(n++,10)*34,easing:'cubic-bezier(.22,.8,.26,1)',fill:'backwards',composite:'add'});return}
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5)return;
    const far=Math.min(1,Math.abs(dy)/900),dur=420+far*180;
    el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:dur,easing:'cubic-bezier(.32,.72,0,1)',composite:'add'})});
  setTimeout(()=>E.forEach(el=>{el._fd=null;el._fn=0}),0)}
/* جای‌گذاری نتیجه تازه در یک ظرف (جستجوهایی که فقط بخش نتیجه را عوض می‌کنند) با همین حرکت؛ اگر کاربر از صفحه رفته باشد کاری نمی‌کند */
function srchSwap(id,html){const el=typeof id==='string'?$(id):id;if(!el)return;const m=flipSnap(el);el.innerHTML=html;flipPlay(el,m)}

/* ۳) پنجره پایین: صفحه‌کلید تا پایان بالا آمدن پنجره باز نشود (باز شدن هم‌زمان = لگ و پرش پنجره) */
let shOpenT=0;
function sheetFocus(el){if(!el)return;const w=Math.max(0,(RM()?0:480)-(Date.now()-shOpenT));setTimeout(()=>{if(el.isConnected&&!$('ov').classList.contains('hide')){try{el.focus({preventScroll:true})}catch(_){el.focus()}}},w)}

/* ۴) ورق زدن بین تب‌های نوار پایین: صفحه قبلی (با سربرگش) کمی کنار می‌رود و صفحه تازه از همان سمت تب روی آن می‌لغزد.
   نسخه تصویری صفحه قبلی یک کپی کامل از #app است (پس شکل و رنگ‌ها دقیقاً همان می‌ماند)، بعد از DOM واقعی قرار می‌گیرد
   تا getElementById همیشه عنصر واقعی را بدهد، و بعد از حرکت پاک می‌شود. نوار پایین ثابت می‌ماند. */
const TAB_ORD=['home','banks','custs','audit','settings'];
function tabTurnDir(from,to){if(!TAB_ORD.includes(to))return 0;const a=TAB_ORD.indexOf(TAB[from]),b=TAB_ORD.indexOf(to);if(a<0||a===b)return 0;return b>a?-1:1}/* RTL: تب بعدی سمت چپ است */
let turnTok=0;
/* نسخه تصویری کامل صفحه فعلی (کپی #app) کنار DOM واقعی؛ z=0 زیر صفحه واقعی، z=3 روی آن */
function appGhost(z){const ap=$('app');document.querySelectorAll('.pgghost').forEach(g=>g.remove());
  const g=ap.cloneNode(true),V=$('view'),sy=V?V.scrollTop:0;g.classList.add('pgghost');g.classList.remove('fullin','entout','turning','layered');g.setAttribute('aria-hidden','true');g.style.pointerEvents='none';g.style.zIndex=String(z);g.style.transition='none';
  g.querySelectorAll('input,textarea,select,button').forEach(e=>{e.tabIndex=-1});
  const gb=g.querySelector('#bottom');if(gb)gb.style.visibility='hidden';
  ap.after(g);const gv=g.querySelector('#view');if(gv)gv.scrollTop=sy;return g}
function pageTurn(dir){const ap=$('app');if(!dir||!ap||RM()||!ap.animate)return null;
  const g=appGhost(0);ap.style.zIndex='1';ap.classList.add('turning');const tok=++turnTok;
  return ()=>{const w=ap.offsetWidth||innerWidth,E='cubic-bezier(.32,.72,0,1)',D=440;
    const inn=[{transform:`translateX(${dir*w}px)`,boxShadow:'0 0 0 0 transparent'},{transform:'none',boxShadow:'0 0 40px -10px #0b142640'}];
    ['bar','view'].forEach(id=>{const e=$(id);if(e)e.animate(inn,{duration:D,easing:E})});{const ac=$('act');if(ac&&ac.innerHTML)ac.animate([{opacity:0},{opacity:1}],{duration:D*.7,delay:D*.3,easing:'ease-out',fill:'backwards'})}
    const a=g.animate([{transform:'none',opacity:1},{transform:`translateX(${-dir*w*.3}px)`,opacity:.85}],{duration:D,easing:E,fill:'forwards'});
    const done=()=>{g.remove();if(tok!==turnTok)return;ap.style.zIndex='';ap.classList.remove('turning')};a.onfinish=done;setTimeout(done,D+200)}}

/* ۶) v58.7: باز و بسته شدن صفحه‌های تمام‌صفحه (لیست‌ها، حساب مشتری، جزئیات واریزی…) بدون سفیدی:
   باز شدن: صفحه قبلی (کپی تصویری) زیر صفحه تازه می‌ماند و کمی عقب می‌رود تا صفحه تازه رویش بالا بیاید.
   بسته شدن (دکمه برگشت، کشیدن از لبه، کشیدن به پایین): صفحه مقصد همان لحظه زیر ساخته می‌شود و کپی صفحه فعلی
   از همان جایی که انگشت رها شد پایین/کنار می‌رود — دیگر صفحه سفید یا پرش آخر حرکت نیست. */
let fullTok=0;
function fullEnterGhost(){const ap=$('app');if(!ap||RM()||!ap.animate)return;const g=appGhost(0),tok=++fullTok;ap.style.zIndex='1';ap.classList.add('layered');
  g.animate([{transform:'none',opacity:1},{transform:'scale(.95)',opacity:.55}],{duration:520,easing:'cubic-bezier(.32,.72,0,1)',fill:'forwards'});
  setTimeout(()=>{g.remove();if(tok!==fullTok)return;ap.style.zIndex='';ap.classList.remove('layered')},580)}
function pageLeave(to,o){o=o||{};const ap=$('app');
  const reset=()=>{['view','bar','act'].forEach(id=>{const e=$(id);if(e){e.style.transition='';e.style.transform='';e.style.opacity=''}});const v=$('view');if(v)v.classList.remove('edge','edgeback');if(ap)ap.classList.remove('entout')};
  if(!ap||RM()||!ap.animate){reset();noAnim=true;navBack=true;go(to);return}
  const g=appGhost(3);g.querySelectorAll('#view,#bar,#act').forEach(e=>{e.style.transform='';e.style.opacity=''});
  reset();++fullTok;ap.classList.remove('layered');noAnim=true;navBack=true;go(to);
  const w=ap.offsetWidth||innerWidth,h=ap.offsetHeight||innerHeight,D=o.side?320:400,E='cubic-bezier(.32,.72,0,1)';
  const K=o.side?[{transform:`translateX(${-(o.dx||0)}px)`},{transform:`translateX(${-w}px)`}]:[{transform:`translateY(${o.dy||0}px)`},{transform:`translateY(${h}px)`}];
  const a=g.animate(K,{duration:D,easing:E,fill:'forwards'});
  ap.animate([{transform:'scale(.95)',opacity:.6},{transform:'none',opacity:1}],{duration:D,easing:E});
  const done=()=>g.remove();a.onfinish=done;setTimeout(done,D+250)}
