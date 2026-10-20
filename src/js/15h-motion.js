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
