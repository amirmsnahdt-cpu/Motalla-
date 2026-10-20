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

/* ۲) جابه‌جایی نرم (FLIP): وقتی همان صفحه دوباره ساخته می‌شود (تسویه، تأیید، همگام‌سازی، مرتب‌سازی)،
   هر ردیف یا کارت (data-fk) از جای قبلی‌اش به جای تازه می‌لغزد؛ ردیف تازه آرام ظاهر می‌شود.
   فقط عناصری که قبل یا بعد در دید هستند حرکت می‌کنند (لیست‌های بلند سنگین نشوند). */
function flipSnap(root){if(!root||RM())return null;const m=new Map(),vh=innerHeight;
  root.querySelectorAll('[data-fk]').forEach(el=>{const k=el.dataset.fk;if(m.has(k)){m.set(k,null);return}const r=el.getBoundingClientRect();m.set(k,r.height?{x:r.left,y:r.top,h:r.height,vis:r.bottom>-40&&r.top<vh+40}:null)});
  return m}
function flipPlay(root,m){if(!m||!root||!m.size)return;const vh=innerHeight,N=[],seen=new Set();
  root.querySelectorAll('[data-fk]').forEach(el=>{const k=el.dataset.fk;if(seen.has(k)){el._fd=null;return}seen.add(k);const r=el.getBoundingClientRect(),o=m.get(k);
    const vis=r.bottom>-40&&r.top<vh+40;
    if(o===undefined){el._fd=null;if(vis&&r.height)N.push([el,'new']);return}
    if(!o||!(o.vis||vis)){el._fd=null;return}
    const dx=o.x-r.left,dy=o.y-r.top;el._fd=(Math.abs(dx)>.5||Math.abs(dy)>.5)?{dx,dy}:null;if(el._fd)N.push([el,'mv'])});
  N.forEach(([el,t])=>{if(t==='new'){el.animate([{opacity:0,transform:'translateY(-6px) scale(.985)'},{opacity:1,transform:'none'}],{duration:340,easing:'cubic-bezier(.22,.8,.26,1)'});return}
    /* اگر پدرِ این عنصر هم حرکت می‌کند، فقط اختلاف را حرکت بده (حرکت تو در تو دوبرابر نشود) */
    let dx=el._fd.dx,dy=el._fd.dy;for(let p=el.parentElement;p&&p!==root;p=p.parentElement){if(p._fd){dx-=p._fd.dx;dy-=p._fd.dy;break}}
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5)return;
    const far=Math.min(1,Math.abs(dy)/900),dur=380+far*180;
    el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:dur,easing:'cubic-bezier(.32,.72,0,1)',composite:'add'})});
  setTimeout(()=>root.querySelectorAll('[data-fk]').forEach(el=>{el._fd=null}),0)}

/* ۳) پنجره پایین: صفحه‌کلید تا پایان بالا آمدن پنجره باز نشود (باز شدن هم‌زمان = لگ و پرش پنجره) */
let shOpenT=0;
function sheetFocus(el){if(!el)return;const w=Math.max(0,(RM()?0:480)-(Date.now()-shOpenT));setTimeout(()=>{if(el.isConnected&&!$('ov').classList.contains('hide')){try{el.focus({preventScroll:true})}catch(_){el.focus()}}},w)}

/* ۴) ورق زدن بین تب‌های نوار پایین: صفحه قبلی (با سربرگش) کمی کنار می‌رود و صفحه تازه از همان سمت تب روی آن می‌لغزد.
   نسخه تصویری صفحه قبلی یک کپی کامل از #app است (پس شکل و رنگ‌ها دقیقاً همان می‌ماند)، بعد از DOM واقعی قرار می‌گیرد
   تا getElementById همیشه عنصر واقعی را بدهد، و بعد از حرکت پاک می‌شود. نوار پایین ثابت می‌ماند. */
const TAB_ORD=['home','banks','custs','audit','settings'];
function tabTurnDir(from,to){if(!TAB_ORD.includes(to))return 0;const a=TAB_ORD.indexOf(TAB[from]),b=TAB_ORD.indexOf(to);if(a<0||a===b)return 0;return b>a?-1:1}/* RTL: تب بعدی سمت چپ است */
let turnTok=0;
function pageTurn(dir){const ap=$('app');if(!dir||!ap||RM()||!ap.animate)return null;
  document.querySelectorAll('.pgghost').forEach(g=>g.remove());
  const g=ap.cloneNode(true),V=$('view'),sy=V?V.scrollTop:0;g.classList.add('pgghost');g.classList.remove('fullin');g.setAttribute('aria-hidden','true');g.style.pointerEvents='none';g.style.zIndex='0';g.style.transition='none';
  g.querySelectorAll('input,textarea,select,button').forEach(e=>{e.tabIndex=-1});
  const gb=g.querySelector('#bottom');if(gb)gb.style.visibility='hidden';
  ap.after(g);const gv=g.querySelector('#view');if(gv)gv.scrollTop=sy;ap.style.zIndex='1';ap.classList.add('turning');const tok=++turnTok;
  return ()=>{const w=ap.offsetWidth||innerWidth,E='cubic-bezier(.32,.72,0,1)',D=440;
    const inn=[{transform:`translateX(${dir*w}px)`,boxShadow:'0 0 0 0 transparent'},{transform:'none',boxShadow:'0 0 40px -10px #0b142640'}];
    ['bar','view'].forEach(id=>{const e=$(id);if(e)e.animate(inn,{duration:D,easing:E})});{const ac=$('act');if(ac&&ac.innerHTML)ac.animate([{opacity:0},{opacity:1}],{duration:D*.7,delay:D*.3,easing:'ease-out',fill:'backwards'})}
    const a=g.animate([{transform:'none',opacity:1},{transform:`translateX(${-dir*w*.3}px)`,opacity:.85}],{duration:D,easing:E,fill:'forwards'});
    const done=()=>{g.remove();if(tok!==turnTok)return;ap.style.zIndex='';ap.classList.remove('turning')};a.onfinish=done;setTimeout(done,D+200)}}

/* ۵) نتیجه جستجو (v58.5): مثل عوض شدن روز در خانه — ردیف‌هایی که می‌مانند از جای قبلی‌شان نرم بالا/پایین می‌لغزند
   و ردیف‌های تازه پشت سر هم از پایین بالا می‌آیند. برای همه جستجوها (لیست، پیگیری، حساب‌ها، بدهی، سند، تخصیص…).
   کلید هر ردیف: data-fk، وگرنه data-act+data-id، وگرنه تیک انتخاب (data-sel)؛ فقط ردیف‌های بیرونی (نه دکمه‌های داخل ردیف).
   فقط ردیف‌های داخل دید حرکت می‌کنند؛ حرکت کم (reduced motion) رعایت می‌شود. */
const SRCH_SEL='[data-fk],[data-act][data-id],label.arow,.bempty,.card.empty,.c6add';
let srchFx=0;/* جستجویی که کل صفحه را دوباره می‌سازد (render) این را روشن می‌کند تا همین حرکت به جای FLIP معمولی اجرا شود */
function srchKey(el){if(el.dataset.fk)return el.dataset.fk;if(el.dataset.act&&el.dataset.id!=null)return el.dataset.act+':'+el.dataset.id;
  const s=el.querySelector(':scope>input[data-sel]');if(s)return 'sel:'+s.dataset.sel;return 'c:'+el.className}
function srchItems(root){return [...root.querySelectorAll(SRCH_SEL)].filter(el=>{const p=el.parentElement&&el.parentElement.closest(SRCH_SEL);return !p||!root.contains(p)})}
function srchSnap(root){if(!root||RM()||!root.animate)return null;const m=new Map(),vh=innerHeight;
  srchItems(root).forEach(el=>{const k=srchKey(el);if(m.has(k)){m.set(k,null);return}const r=el.getBoundingClientRect();m.set(k,r.height?{y:r.top,vis:r.bottom>-40&&r.top<vh+40}:null)});
  return m}
function srchPlay(root,m){if(!m||!root)return;const vh=innerHeight,seen=new Set();let n=0;
  srchItems(root).forEach(el=>{const k=srchKey(el);if(seen.has(k))return;seen.add(k);const r=el.getBoundingClientRect();if(!r.height)return;
    const vis=r.bottom>-40&&r.top<vh+40,o=m.get(k);
    if(o===undefined){if(!vis)return;/* تازه: از پایین بالا می‌آید، پشت سر هم */
      el.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'none'}],{duration:440,delay:Math.min(n++,10)*32,easing:'cubic-bezier(.22,.8,.26,1)',fill:'backwards'});return}
    if(!o||!(o.vis||vis))return;const dy=o.y-r.top;if(Math.abs(dy)<.5)return;
    el.animate([{transform:`translateY(${dy}px)`},{transform:'none'}],{duration:420+Math.min(1,Math.abs(dy)/900)*180,easing:'cubic-bezier(.32,.72,0,1)'})})}
/* جای‌گذاری نتیجه تازه در یک ظرف با همین حرکت؛ اگر کاربر از صفحه رفته باشد (ظرف نیست) کاری نمی‌کند */
function srchSwap(id,html){const el=typeof id==='string'?$(id):id;if(!el)return;const m=srchSnap(el);el.innerHTML=html;srchPlay(el,m)}
