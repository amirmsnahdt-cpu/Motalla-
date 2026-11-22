/* ---- v61.88 جای مکان‌نما در فیلدهای قالب‌دار (شبا، کارت، مبلغ) ----
   رفع باگ: هر فیلدی که هنگام تایپ دوباره قالب می‌خورد (فاصله‌های شبا/کارت، ویرگول مبلغ) با نوشتن مقدار تازه
   مکان‌نما را به انتها می‌پراند؛ پس ویرایش یا افزودن رقم از وسط شماره ممکن نبود.
   یک بار برای همه فیلدها: قبل از اجرای oninput خود فیلد، تعداد رقم/حرف پیش از مکان‌نما ثبت می‌شود و بعد از آن
   مکان‌نما دقیقاً پشت همان رقم برمی‌گردد. پاک کردن روی فاصله یا ویرگول، رقم کنارش را پاک می‌کند (نه فقط جداکننده را). */
const CRT={el:null,n:0,end:true};
const crtSig=c=>/[0-9۰-۹٠-٩A-Za-z.\/]/.test(c);
const crtOk=t=>t&&t.tagName==='INPUT'&&/^(text|tel|search|)$/.test(t.type||'')&&!t.readOnly;
document.addEventListener('beforeinput',e=>{const t=e.target;if(!crtOk(t))return;let a,b;try{a=t.selectionStart;b=t.selectionEnd}catch(x){return}if(a==null||a!==b)return;const v=t.value;
  const sep=c=>c===' '||c===',';
  if(e.inputType==='deleteContentBackward'&&a>1&&sep(v[a-1])&&crtSig(v[a-2])){try{t.setSelectionRange(a-2,a)}catch(x){}}
  else if(e.inputType==='deleteContentForward'&&a<v.length-1&&sep(v[a])&&crtSig(v[a+1])){try{t.setSelectionRange(a,a+2)}catch(x){}}},true);
document.addEventListener('input',e=>{const t=e.target;CRT.el=null;if(!crtOk(t))return;let p;try{p=t.selectionStart}catch(x){return}if(p==null)return;const v=t.value;
  CRT.el=t;CRT.v=v;CRT.end=p>=v.length;CRT.n=[...v.slice(0,p)].filter(crtSig).length},true);
document.addEventListener('input',e=>{const t=e.target;if(t!==CRT.el)return;CRT.el=null;if(CRT.end||t.value===CRT.v||document.activeElement!==t)return;
  const v=t.value;let pos=0,c=0;while(pos<v.length&&c<CRT.n){if(crtSig(v[pos]))c++;pos++}try{t.setSelectionRange(pos,pos)}catch(x){}});

/* ---------- v98.9 «۰۰۰» بالای صفحه‌کلید گوشی (خواسته صاحب اپ: «در کیبرد گوشی که عدد وارد می‌شود سه صفر هم داشته باشیم») ----------
   صفحه‌کلید عددی گوشی دکمه «۰۰۰» ندارد و وب نمی‌تواند به آن دکمه اضافه کند؛ پس وقتی یکی از خانه‌های «مبلغ تومانی» فوکوس دارد و کیبورد باز است،
   یک نوار کوچک (۰۰۰ و ۰۰) درست بالای کیبورد می‌نشیند (visualViewport). زدنش همان تایپ کردن صفرهاست (رویداد input → قالب‌بندی و حساب خود همان خانه).
   خانه‌ها: Z3SEL (شناسه‌های مبلغ) یا هر input با data-z3 (پله مبلغ ردیف سند، پله مبلغ سند بانکی). وزن، عیار، شبا، تلفن و پیگیری این نوار را ندارند. */
const Z3SEL='input[data-z3],#pxA,#wdA,#waA,#stA,#pdA,#apxA,#pa,#acB,#acB2,#lgA,#ilA,#saA,#bpA,#bxP,#bxT,#bfP,#bfT,#sa2,#cvR,#mvA,#offA,#ckA,#ckP,#gkP,#svM';
const Z3={el:null,bar:null,base:0};
const z3H=()=>{const vv=window.visualViewport;return Math.round(vv?vv.height:innerHeight)};
function z3Put(z){const el=Z3.el;if(!el||!el.isConnected||el.readOnly)return;const v=el.value;if(!/[1-9۱-۹]/.test(v))return;let a=v.length,b=v.length;try{a=el.selectionStart;b=el.selectionEnd}catch(_){}
  if(a==null||a!==b)a=b=v.length;el.value=v.slice(0,a)+z+v.slice(b);try{el.setSelectionRange(a+z.length,a+z.length)}catch(_){}
  el.dispatchEvent(new Event('input',{bubbles:true}));try{navigator.vibrate&&navigator.vibrate(6)}catch(_){}}
function z3Bar(){if(Z3.bar&&Z3.bar.isConnected)return Z3.bar;const b=document.createElement('div');b.id='z3bar';b.setAttribute('role','group');b.setAttribute('aria-label','صفرهای آماده');
  b.innerHTML='<button type="button" data-z="000" aria-label="سه صفر">۰۰۰</button><button type="button" data-z="00" aria-label="دو صفر">۰۰</button>';document.body.appendChild(b);
  b.addEventListener('pointerdown',e=>{const k=e.target.closest('button[data-z]');if(!k)return;e.preventDefault();e.stopPropagation();z3Put(k.dataset.z)});
  b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()});Z3.bar=b;return b}
function z3Pos(){const el=Z3.el,vv=window.visualViewport,h=z3H();if(!el||h>Z3.base)Z3.base=Math.max(Z3.base,h);const b=Z3.bar;if(!b)return;
  const on=!!el&&el.isConnected&&document.activeElement===el&&!el.readOnly&&(Z3.base-h>120||!!window.__z3);b.classList.toggle('on',on);if(!on)return;
  b.style.transform='translate3d(0,'+Math.max(0,Math.round((vv?vv.offsetTop:0)+h-b.offsetHeight-8))+'px,0)'}
(()=>{Z3.base=z3H();const later=()=>[40,220,480].forEach(d=>setTimeout(z3Pos,d));
  document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.matches&&t.matches(Z3SEL)&&!t.readOnly){Z3.el=t;z3Bar();later()}else{Z3.el=null;z3Pos()}});
  document.addEventListener('focusout',()=>setTimeout(()=>{if(document.activeElement!==Z3.el)Z3.el=null;z3Pos()},90));
  if(window.visualViewport){visualViewport.addEventListener('resize',z3Pos);visualViewport.addEventListener('scroll',z3Pos)}addEventListener('resize',z3Pos);addEventListener('orientationchange',()=>{Z3.base=0;later()})})();
