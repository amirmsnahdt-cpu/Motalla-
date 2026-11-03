/* ===== v72.8 (خواسته صاحب اپ، مثل منوی کناری اپ Claude): کشوی «حساب‌ها» در صفحه حساب مشتریان =====
   - با دکمه ≡ داخل جستجو، یا کشیدن از لبه راست صفحه (فقط گوشی) باز می‌شود؛ صفحه با انگشت کنار می‌رود و کشو از زیرش پیدا می‌شود.
   - بستن: زدن روی صفحه کنار رفته، کشیدن به راست (روی صفحه یا خود کشو)، Esc. سرعت کشیدن هم حساب می‌شود.
   - داخل کشو: همه حساب‌ها، گروه‌ها و «بدون گروه» با تعداد (زدن = فیلتر همان cuF.g)، «اخیر» = حساب‌هایی که تازه کار شده‌اند،
     پایین: کاربر و دکمه «حساب تازه». پیشرفت باز شدن یک عدد است (CD.p از ۰ تا ۱) که همه حرکت‌ها از آن ساخته می‌شوند. */
Object.assign(IC,{hamb:'<path d="M4 7h16M4 12h11M4 17h16"/>'});
const CD={p:0,open:false,W:300,drag:0};
const cdEl=()=>$('cdw');
function cdInit(){if(cdEl())return;const w=document.createElement('aside');w.id='cdw';w.className='cdw';w.setAttribute('aria-label','حساب‌ها');w.setAttribute('aria-hidden','true');document.body.appendChild(w);
  const sc=document.createElement('div');sc.id='cdsc';sc.className='cdsc';const app=$('app');if(app)app.appendChild(sc);
  const z=document.createElement('div');z.id='cdez';z.className='cdez';z.setAttribute('aria-hidden','true');document.body.appendChild(z);cdGest(w,sc,z)}
const cdW=()=>Math.min(Math.round(innerWidth*.84),340);
/* v73.0 روانی مثل Claude: فقط transform و opacity سه عنصر (صفحه، کشو، پرده) و مستقیم روی همان عنصرها —
   نه متغیر روی html (که هر فریم کل صفحه را دوباره حساب می‌کرد)، نه گوشه/سایه متحرک. هنگام کشیدن هر فریم یک بار (rAF)؛
   رها کردن = ادامه با سرعت انگشت (مدت حرکت از فاصله باقی‌مانده و سرعت). */
const cdN=()=>[$('app'),cdEl(),$('cdsc')];
const CDE='cubic-bezier(.22,.95,.3,1)';
function cdPaint(p,dur){const [a,w,s]=cdN();if(!a||!w||!s)return;const W=CD.W,t=dur?`transform ${dur}ms ${CDE}`:'none';
  a.style.transition=t;a.style.transform=`translate3d(${(-p*W).toFixed(1)}px,0,0)`;
  w.style.transition=dur?`transform ${dur}ms ${CDE},opacity ${dur}ms ease-out`:'none';w.style.transform=`translate3d(${((1-p)*W*.28).toFixed(1)}px,0,0)`;w.style.opacity=(.3+.7*p).toFixed(3);
  s.style.transition=dur?`opacity ${dur}ms ease-out`:'none';s.style.opacity=p.toFixed(3)}
let cdRaf=0;
/* p = پیشرفت (۰ بسته، ۱ باز)؛ anim = حرکت تا p (v = سرعت انگشت به پیکسل بر میلی‌ثانیه) */
function cdSet(p,anim,v){p=Math.max(0,Math.min(1,p));const d=Math.abs(p-CD.p);CD.p=p;
  if(!anim){if(!cdRaf)cdRaf=requestAnimationFrame(()=>{cdRaf=0;cdPaint(CD.p,0)});return}
  if(cdRaf){cancelAnimationFrame(cdRaf);cdRaf=0}
  const sp=Math.abs(v||0),dur=RM()?0:Math.round(Math.max(170,Math.min(440,sp>.3?d*CD.W/sp*1.6:120+320*d)));cdPaint(p,dur);return dur}
function cdOpen(v){cdInit();const w=cdEl();if(!w||cur!=='custs')return;CD.W=cdW();const h=document.documentElement;if(!h.classList.contains('cdon')&&!CD.ok)w.innerHTML=cdHTML();CD.ok=0;CD.open=true;
  if(!h.classList.contains('cdon')){cdPaint(0,0);h.classList.add('cdon');w.getBoundingClientRect()}w.setAttribute('aria-hidden','false');clearTimeout(CD.t);cdSet(1,true,v);
  const a=$('cuGb');if(a)a.setAttribute('aria-expanded','true')}
function cdClose(fast,v){const h=document.documentElement;if(!h.classList.contains('cdon'))return;CD.open=false;const dur=fast?0:cdSet(0,true,v);const w=cdEl();if(w)w.setAttribute('aria-hidden','true');const a=$('cuGb');if(a)a.setAttribute('aria-expanded','false');
  clearTimeout(CD.t);const done=()=>{if(CD.open)return;h.classList.remove('cdon');CD.p=0;const [ap]=cdN();if(ap){ap.style.transition='';ap.style.transform=''}cdPre()};if(fast){cdPaint(0,0);done()}else CD.t=setTimeout(done,(dur||0)+30)}
ACT.cuGMenu=()=>{if(document.documentElement.classList.contains('cdon')&&CD.open)cdClose();else cdOpen()};
ACT.cdClose=()=>cdClose();
function cdHTML(){const G=groupsList(),A=CU(),n=g=>A.filter(c=>cuGOk(g,c)).length,on=g=>(cuF.g||'')===g;
  const it=(g,l,i)=>`<button class="cdi${on(g)?' on':''}" data-act="cdG" data-g="${esc(g)}"><span class="cdic">${ic(i)}</span><span class="cdl">${l}</span><em>${fmt(n(g))}</em></button>`;
  const rec=A.slice().sort((a,b)=>String(b.lastAt||b.createdAt||'').localeCompare(String(a.lastAt||a.createdAt||''))).slice(0,12);
  const me=who()||'';
  return `<div class="cdh"><b>حساب‌ها</b><button class="cdsb" data-act="cdFind" aria-label="جستجو">${ic('search')}</button></div>
  <div class="cdsc2"><nav class="cdn">${it('','همه حساب‌ها','users')}${G.map(g=>it(g,esc(g),'users')).join('')}${n('-')&&G.length?it('-','بدون گروه','user'):''}</nav>
  ${rec.length?`<div class="cdsh">اخیر</div><div class="cdr">${rec.map(c=>`<button class="cdi cdrc" data-act="cdCu" data-id="${c.id}"><span class="c6a cul cdav${c.av?' cav':''}" style="--h:${cuHue(c)}">${c.av?`<img data-ik="${esc(c.av)}" alt="">`:''}${esc(userInit(c.name))}</span><span class="cdl">${esc(cuName(c))}</span>${c.grp?`<small>${esc(c.grp)}</small>`:''}</button>`).join('')}</div>`:''}</div>
  <div class="cdf"><span class="cdme" title="${esc(me)}">${esc(userInit(me))}</span>${can('debt')?`<button class="cdnew" data-act="cdNew">${ic('plus')}<span>حساب تازه</span></button>`:''}</div>`}
ACT.cdG=d=>{cuF.g=d.g||'';cuFRe();const w=cdEl();if(w)w.querySelectorAll('.cdi[data-g]').forEach(b=>b.classList.toggle('on',(b.dataset.g||'')===cuF.g));setTimeout(()=>cdClose(),RM()?0:120)};
ACT.cdCu=d=>{cdClose(1);ACT.cuOpen({id:d.id})};
ACT.cdNew=()=>{cdClose(1);cuQ='';ACT.cuNewQ()};
ACT.cdFind=()=>{cdClose();setTimeout(()=>{const q=$('cuq');if(q)q.focus()},RM()?0:300)};
/* لبه کشیدن فقط در صفحه حساب‌ها و وقتی پنجره‌ای باز نیست */
/* v73.0: محتوای کشو بعد از هر ساخت صفحه حساب‌ها در وقت آزاد آماده می‌شود تا باز شدن همان فریم اول راه بیفتد */
const cdPre=()=>{CD.ok=0;const run=()=>{const w=cdEl();if(!w||cur!=='custs'||document.documentElement.classList.contains('cdon'))return;w.innerHTML=cdHTML();CD.ok=1};(window.requestIdleCallback||(f=>setTimeout(f,200)))(run,{timeout:1200})};
window.cdZ=()=>{if(cur==='custs'){cdInit();cdPre()}const z=$('cdez');const ok=cur==='custs'&&$('ov').classList.contains('hide');if(z)z.classList.toggle('on',ok);if(!ok&&document.documentElement.classList.contains('cdon'))cdClose(1)};
function cdGest(w,sc,z){let g=null;
  const st=(e,mode)=>{if(e.touches.length!==1)return;const t=e.touches[0];CD.W=cdW();g={mode,x:t.clientX,y:t.clientY,p0:CD.p,lk:null,vx:0,lx:t.clientX,lt:e.timeStamp||performance.now()}};
  const mv=e=>{if(!g)return;const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;
    if(!g.lk){if(Math.abs(dx)<7&&Math.abs(dy)<7)return;g.lk=Math.abs(dx)>Math.abs(dy)?'h':'v';if(g.lk==='v'){if(g.mode==='edge')g=null;return}
      clearTimeout(CD.t);CD.drag=1;if(g.mode==='edge'){cdInit();const w2=cdEl();if(!CD.open&&!CD.ok){w2.innerHTML=cdHTML();CD.ok=1}CD.W=cdW();cdPaint(0,0);document.documentElement.classList.add('cdon')}
      /* حرکت از جای فعلی شروع شود (اگر وسط انیمیشن گرفته شد) */g.x=t.clientX;g.lx=t.clientX}
    if(g.lk!=='h')return;if(e.cancelable)e.preventDefault();const now=e.timeStamp||performance.now(),dt=Math.max(1,now-g.lt),iv=(t.clientX-g.lx)/dt;g.vx=g.vx*.4+iv*.6;g.lx=t.clientX;g.lt=now;
    /* صفحه به چپ می‌رود (dx منفی) = باز شدن */
    cdSet(g.p0-dx/CD.W,false)};
  const end=e=>{if(!g)return;const z0=g;g=null;CD.drag=0;if(z0.lk!=='h'){if(z0.mode==='edge'&&!z0.lk){/* ضربه کوتاه روی لبه: به عنصر زیرش برسد */if(e&&e.cancelable)e.preventDefault();z.style.pointerEvents='none';const el=document.elementFromPoint(z0.x,z0.y);z.style.pointerEvents='';if(el){const b=el.closest(PRESS_SEL)||el;b.click()}}return}
    const v=z0.vx;/* سرعت: منفی = به چپ = باز */const open=v<-.3?true:v>.3?false:CD.p>.5;if(open)cdOpen(v);else cdClose(0,v)};
  z.addEventListener('touchstart',e=>{if(cur!=='custs')return;st(e,'edge')},{passive:true});
  sc.addEventListener('touchstart',e=>st(e,'scrim'),{passive:true});
  w.addEventListener('touchstart',e=>st(e,'drawer'),{passive:true});
  for(const el of [z,sc,w]){el.addEventListener('touchmove',mv,{passive:false});el.addEventListener('touchend',end,{passive:el!==z});el.addEventListener('touchcancel',end,{passive:true})}
  sc.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cdClose()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&CD.open)cdClose()});
  addEventListener('resize',()=>{if(CD.open){CD.W=cdW();cdPaint(1,0)}})}
