/* ===== v72.8 (خواسته صاحب اپ، مثل منوی کناری اپ Claude): کشوی «حساب‌ها» در صفحه حساب مشتریان =====
   - با دکمه ≡ داخل جستجو، یا کشیدن از لبه راست صفحه (فقط گوشی) باز می‌شود؛ صفحه با انگشت کنار می‌رود و کشو از زیرش پیدا می‌شود.
   - بستن: زدن روی صفحه کنار رفته، کشیدن به راست (روی صفحه یا خود کشو)، Esc. سرعت کشیدن هم حساب می‌شود.
   - داخل کشو: همه حساب‌ها، گروه‌ها و «بدون گروه» با تعداد (زدن = فیلتر همان cuF.g)، «اخیر» = حساب‌هایی که تازه کار شده‌اند،
     پایین: کاربر و دکمه «حساب تازه». پیشرفت باز شدن یک عدد است (--cdp از ۰ تا ۱) که همه حرکت‌ها از آن ساخته می‌شوند. */
Object.assign(IC,{hamb:'<path d="M4 7h16M4 12h11M4 17h16"/>'});
const CD={p:0,open:false,W:300};
const cdEl=()=>$('cdw');
function cdInit(){if(cdEl())return;const w=document.createElement('aside');w.id='cdw';w.className='cdw';w.setAttribute('aria-label','حساب‌ها');w.setAttribute('aria-hidden','true');document.body.appendChild(w);
  const sc=document.createElement('div');sc.id='cdsc';sc.className='cdsc';const app=$('app');if(app)app.appendChild(sc);
  const z=document.createElement('div');z.id='cdez';z.className='cdez';z.setAttribute('aria-hidden','true');document.body.appendChild(z);cdGest(w,sc,z)}
const cdW=()=>Math.min(Math.round(innerWidth*.84),340);
/* p = پیشرفت (۰ بسته، ۱ باز)؛ anim = با فنر برود */
function cdSet(p,anim){const h=document.documentElement;CD.p=Math.max(0,Math.min(1,p));h.style.setProperty('--cdp',CD.p.toFixed(4));h.style.setProperty('--cdw',CD.W+'px');h.classList.toggle('cddrag',!anim)}
function cdOpen(){cdInit();const w=cdEl();if(!w||cur!=='custs')return;CD.W=cdW();if(!CD.open){w.innerHTML=cdHTML()}CD.open=true;const h=document.documentElement;
  if(!h.classList.contains('cdon')){cdSet(0,false);h.classList.add('cdon');w.getBoundingClientRect()}w.setAttribute('aria-hidden','false');cdSet(1,true);clearTimeout(CD.t);
  const a=$('cuGb');if(a)a.setAttribute('aria-expanded','true')}
function cdClose(fast){const h=document.documentElement;if(!h.classList.contains('cdon'))return;CD.open=false;cdSet(0,true);const w=cdEl();if(w)w.setAttribute('aria-hidden','true');const a=$('cuGb');if(a)a.setAttribute('aria-expanded','false');
  clearTimeout(CD.t);CD.t=setTimeout(()=>{if(!CD.open){h.classList.remove('cdon','cddrag')}},fast||RM()?0:480)}
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
window.cdZ=()=>{if(cur==='custs')cdInit();const z=$('cdez');const ok=cur==='custs'&&$('ov').classList.contains('hide');if(z)z.classList.toggle('on',ok);if(!ok&&document.documentElement.classList.contains('cdon'))cdClose(1)};
function cdGest(w,sc,z){let g=null;
  const st=(e,mode)=>{if(e.touches.length!==1)return;const t=e.touches[0];CD.W=cdW();g={mode,x:t.clientX,y:t.clientY,p0:CD.p,lk:null,vx:0,lx:t.clientX,lt:performance.now()}};
  const mv=e=>{if(!g)return;const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;
    if(!g.lk){if(Math.abs(dx)<7&&Math.abs(dy)<7)return;g.lk=Math.abs(dx)>Math.abs(dy)?'h':'v';if(g.lk==='v'){if(g.mode==='edge')g=null;return}
      if(g.mode==='edge'){cdInit();const w2=cdEl();if(!CD.open){w2.innerHTML=cdHTML()}document.documentElement.classList.add('cdon')}}
    if(g.lk!=='h')return;if(e.cancelable)e.preventDefault();const now=performance.now();g.vx=(t.clientX-g.lx)/Math.max(1,now-g.lt);g.lx=t.clientX;g.lt=now;
    /* صفحه به چپ می‌رود (dx منفی) = باز شدن */
    cdSet(g.p0-dx/CD.W,false)};
  const end=e=>{if(!g)return;const z0=g;g=null;if(z0.lk!=='h'){if(z0.mode==='edge'&&!z0.lk){/* ضربه کوتاه روی لبه: به عنصر زیرش برسد */if(e&&e.cancelable)e.preventDefault();z.style.pointerEvents='none';const el=document.elementFromPoint(z0.x,z0.y);z.style.pointerEvents='';if(el){const b=el.closest(PRESS_SEL)||el;b.click()}}return}
    const v=z0.vx;/* سرعت: منفی = به چپ = باز */const open=v<-.45?true:v>.45?false:CD.p>.5;if(open)cdOpen();else cdClose()};
  z.addEventListener('touchstart',e=>{if(cur!=='custs')return;st(e,'edge')},{passive:true});
  sc.addEventListener('touchstart',e=>st(e,'scrim'),{passive:true});
  w.addEventListener('touchstart',e=>st(e,'drawer'),{passive:true});
  for(const el of [z,sc,w]){el.addEventListener('touchmove',mv,{passive:false});el.addEventListener('touchend',end,{passive:el!==z});el.addEventListener('touchcancel',end,{passive:true})}
  sc.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();cdClose()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&CD.open)cdClose()});
  addEventListener('resize',()=>{if(CD.open){CD.W=cdW();cdSet(1,true)}})}
